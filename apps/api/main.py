import os
import math
import logging
import requests
import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import BaseModel
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from dotenv import load_dotenv
from config import config

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Google Drive Audio Player API",
    version="2.0.0",
    description="Google Drive音声プレイヤー用API（OAuth認証対応）"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIRECT_URI = f"http://localhost:9527/auth/callback" if config.IS_DEVELOPMENT else f"https://gdrive-audio-playerapi-production.up.railway.app/auth/callback"

user_credentials = {}

@app.get("/")
async def root():
    return {"message": "Google Drive Audio Player API", "status": "running", "version": "2.0.0"}

class AudioFile(BaseModel):
    id: str
    name: str
    size: str
    download_url: str
    mime_type: str

class HealthResponse(BaseModel):
    status: str
    version: str

class AuthResponse(BaseModel):
    auth_url: str

class FolderValidationResponse(BaseModel):
    is_valid: bool
    audio_count: int
    folder_name: str
    error: Optional[str] = None

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/auth/login")
async def login(request: Request):
    if not config.GOOGLE_CLIENT_ID or not config.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="OAuth credentials not configured")
    
    flow = Flow.from_client_config({
        "web": {
            "client_id": config.GOOGLE_CLIENT_ID,
            "client_secret": config.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [REDIRECT_URI]
        }
    }, scopes=config.GOOGLE_DRIVE_SCOPES)
    flow.redirect_uri = REDIRECT_URI
    
    authorization_url, state = flow.authorization_url(access_type='offline')
    
    # Accept ヘッダーをチェックして、ブラウザからの直接アクセスかAPIコールかを判定
    accept_header = request.headers.get("accept", "")
    if "application/json" in accept_header:
        # APIコールの場合はJSONを返す
        return {"auth_url": authorization_url}
    else:
        # ブラウザからの直接アクセスの場合はリダイレクト
        return RedirectResponse(url=authorization_url)

@app.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get('code')
    if not code:
        auth_urls = config.get_auth_urls()
        return RedirectResponse(url=f"{auth_urls['error_url']}?error=no_code")
    
    try:
        flow = Flow.from_client_config({
            "web": {
                "client_id": config.GOOGLE_CLIENT_ID,
                "client_secret": config.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [REDIRECT_URI]
            }
        }, scopes=config.GOOGLE_DRIVE_SCOPES)
        flow.redirect_uri = REDIRECT_URI
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # より安全なトークン生成
        import secrets
        token_key = secrets.token_urlsafe(32)
        user_credentials[token_key] = credentials
        
        auth_urls = config.get_auth_urls()
        # トークンをセッションストレージに保存するためのスクリプトを含むページにリダイレクト
        return RedirectResponse(url=f"{auth_urls['success_url']}?token={token_key}")
    except Exception as e:
        logger.error(f"OAuth error: {str(e)}")
        auth_urls = config.get_auth_urls()
        return RedirectResponse(url=f"{auth_urls['error_url']}?error={str(e)}")

@app.get("/api/validate-folder/{folder_id}")
async def validate_folder(folder_id: str, token: str = Query(...)):
    # 開発モード: サンプルデータを返す
    if folder_id == "DEMO_FOLDER":
        return {
            "is_valid": True,
            "audio_count": 3,
            "folder_name": "デモ音声フォルダ",
            "error": None
        }
    
    if token not in user_credentials:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    credentials = user_credentials[token]
    
    try:
        # トークンが期限切れの場合は401エラーを返す（フロントエンドで再認証）
        if credentials.expired:
            logger.warning(f"Token expired for token: {token[:20]}...")
            raise HTTPException(status_code=401, detail="Token expired")
        
        service = build('drive', 'v3', credentials=credentials)
        
        try:
            folder_info = service.files().get(fileId=folder_id, fields="name").execute()
            folder_name = folder_info.get('name', 'Unknown')
        except:
            return {"is_valid": False, "audio_count": 0, "folder_name": "", "error": "フォルダが見つかりません"}
        
        audio_mime_types = ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/wav", "audio/flac", "audio/ogg"]
        mime_conditions = " or ".join([f"mimeType='{mime}'" for mime in audio_mime_types])
        query = f"'{folder_id}' in parents and ({mime_conditions}) and trashed=false"
        
        results = service.files().list(q=query, fields="files(name)", pageSize=1000).execute()
        files = results.get('files', [])
        
        audio_extensions = {'.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg'}
        audio_count = sum(1 for f in files if any(f["name"].lower().endswith(ext) for ext in audio_extensions))
        
        return {
            "is_valid": audio_count > 0,
            "audio_count": audio_count,
            "folder_name": folder_name,
            "error": None if audio_count > 0 else "音声ファイルが見つかりません"
        }
    except HTTPException:
        # HTTPExceptionは再発生させる（401エラーなど）
        raise
    except Exception as e:
        logger.error(f"Error in validate_folder: {str(e)}")
        return {"is_valid": False, "audio_count": 0, "folder_name": "", "error": str(e)}

@app.get("/api/audio-files/{folder_id}")
async def get_audio_files(folder_id: str, token: str = Query(...)):
    # 開発モード: サンプルデータを返す
    if folder_id == "DEMO_FOLDER":
        return [
            {
                "id": "demo1",
                "name": "サンプル楽曲1.mp3",
                "size": "3.2 MB",
                "download_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                "mime_type": "audio/mpeg"
            },
            {
                "id": "demo2", 
                "name": "サンプル楽曲2.mp3",
                "size": "4.1 MB",
                "download_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                "mime_type": "audio/mpeg"
            },
            {
                "id": "demo3",
                "name": "サンプル楽曲3.mp3", 
                "size": "2.8 MB",
                "download_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                "mime_type": "audio/mpeg"
            }
        ]
    
    if token not in user_credentials:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    credentials = user_credentials[token]
    
    try:
        # トークンが期限切れの場合は401エラーを返す（フロントエンドで再認証）
        if credentials.expired:
            logger.warning(f"Token expired for token: {token[:20]}...")
            raise HTTPException(status_code=401, detail="Token expired")
        
        service = build('drive', 'v3', credentials=credentials)
        
        audio_mime_types = ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/wav", "audio/flac", "audio/ogg"]
        mime_conditions = " or ".join([f"mimeType='{mime}'" for mime in audio_mime_types])
        query = f"'{folder_id}' in parents and ({mime_conditions}) and trashed=false"
        
        results = service.files().list(
            q=query,
            fields="files(id,name,size,mimeType)",
            orderBy="name",
            pageSize=1000
        ).execute()
        
        files = results.get('files', [])
        audio_extensions = {'.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg'}
        audio_files = []
        
        for file in files:
            if any(file["name"].lower().endswith(ext) for ext in audio_extensions):
                size_bytes = int(file.get("size", 0))
                if size_bytes == 0:
                    size_str = "0B"
                else:
                    size_names = ["B", "KB", "MB", "GB"]
                    i = int(math.floor(math.log(size_bytes, 1024)))
                    p = math.pow(1024, i)
                    s = round(size_bytes / p, 2)
                    size_str = f"{s} {size_names[i]}"
                
                audio_files.append({
                    "id": file["id"],
                    "name": file["name"],
                    "size": size_str,
                    "download_url": f"http://localhost:9527/api/stream/{file['id']}?token={token}",
                    "mime_type": file["mimeType"]
                })
        
        return audio_files
    except HTTPException:
        # HTTPExceptionは再発生させる（401エラーなど）
        raise
    except Exception as e:
        logger.error(f"Error in get_audio_files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stream/{file_id}")
async def stream_audio(file_id: str, token: str = Query(...), range: str = Header(None)):
    if token not in user_credentials:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    credentials = user_credentials[token]
    
    try:
        # トークンが期限切れの場合は401エラーを返す（フロントエンドで再認証）
        if credentials.expired:
            logger.warning(f"Token expired for token: {token[:20]}...")
            raise HTTPException(status_code=401, detail="Token expired")
        
        service = build('drive', 'v3', credentials=credentials)
        
        # ファイルのメタデータを取得
        file_metadata = service.files().get(fileId=file_id, fields="name,mimeType,size").execute()
        file_size = int(file_metadata.get('size', 0))
        
        # Range ヘッダーの処理
        start = 0
        end = file_size - 1
        
        if range:
            # Range: bytes=start-end の形式を解析
            range_match = re.match(r'bytes=(\d+)-(\d*)', range)
            if range_match:
                start = int(range_match.group(1))
                if range_match.group(2):
                    end = int(range_match.group(2))
        
        # Google Drive APIから部分ダウンロード
        request = service.files().get_media(fileId=file_id)
        request.headers["Range"] = f"bytes={start}-{end}"
        
        # ストリーミングレスポンスの生成
        def generate():
            try:
                response = requests.get(
                    f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media",
                    headers={
                        'Authorization': f'Bearer {credentials.token}',
                        'Range': f'bytes={start}-{end}'
                    },
                    stream=True
                )
                
                if response.status_code in [200, 206]:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            yield chunk
                else:
                    raise Exception(f"Failed to download: {response.status_code}")
                    
            except Exception as e:
                logger.error(f"Stream generation error: {e}")
                raise
        
        # レスポンスヘッダーの設定
        content_length = end - start + 1
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(content_length),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Expose-Headers": "Content-Range, Content-Length",
            "Cache-Control": "no-cache"
        }
        
        status_code = 206 if range else 200
        
        return StreamingResponse(
            generate(),
            status_code=status_code,
            media_type=file_metadata.get('mimeType', 'audio/mpeg'),
            headers=headers
        )
        
    except HTTPException:
        # HTTPExceptionは再発生させる（401エラーなど）
        raise
    except Exception as e:
        logger.error(f"Error in stream_audio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    if not config.validate():
        logger.error("Configuration validation failed. Please check your environment variables.")
        exit(1)
    port = int(os.getenv("PORT", config.API_PORT))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=config.IS_DEVELOPMENT)
