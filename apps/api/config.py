import os
from typing import List

class Config:
    # Google OAuth設定
    GOOGLE_CLIENT_ID: str = os.getenv('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET: str = os.getenv('GOOGLE_CLIENT_SECRET', '')
    GOOGLE_DRIVE_SCOPES: List[str] = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
    ]
    
    # 環境設定
    ENVIRONMENT: str = os.getenv('ENVIRONMENT', 'production')
    IS_DEVELOPMENT: bool = ENVIRONMENT == 'development'
    
    # サーバー設定
    API_PORT: int = int(os.getenv('PORT', '9527'))
    
    # CORS設定
    CORS_ORIGINS: List[str] = os.getenv('CORS_ORIGINS', 'https://shigekikozawa.github.io,https://nagara-giki.app,https://gdrive-audio-playerapi-production.up.railway.app').split(',')
    
    # フロントエンド設定
    FRONTEND_URL: str = os.getenv('FRONTEND_URL', 'https://shigekikozawa.github.io/nagara-giki')
    
    def validate(self) -> bool:
        """設定の妥当性をチェック"""
        if not self.GOOGLE_CLIENT_ID or not self.GOOGLE_CLIENT_SECRET:
            return False
        return True
    
    def get_auth_urls(self) -> dict:
        """認証関連のURLを取得"""
        return {
            'success_url': f"{self.FRONTEND_URL}/auth/success",
            'error_url': f"{self.FRONTEND_URL}/auth/error"
        }

config = Config() 