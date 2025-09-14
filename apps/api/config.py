import os
from typing import List

class Config:
    """アプリケーション設定管理クラス"""
    
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', 'your_google_client_id_here')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', 'your_google_client_secret_here')
    
    # Frontend URL Configuration
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    
    # API Server Configuration
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('API_PORT', '9527'))
    
    # Development/Production Mode
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    IS_DEVELOPMENT = ENVIRONMENT == 'development'
    IS_PRODUCTION = ENVIRONMENT == 'production'
    
    # CORS Origins
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(',')
    
    # Google Drive API Configuration
    GOOGLE_DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
    
    @classmethod
    def get_auth_urls(cls) -> dict:
        """認証関連のURL設定を取得"""
        return {
            'success_url': f"{cls.FRONTEND_URL}/auth/success",
            'error_url': f"{cls.FRONTEND_URL}/auth/error"
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """設定の妥当性をチェック"""
        required_vars = [
            ('GOOGLE_CLIENT_ID', cls.GOOGLE_CLIENT_ID),
            ('GOOGLE_CLIENT_SECRET', cls.GOOGLE_CLIENT_SECRET),
        ]
        
        for var_name, var_value in required_vars:
            if var_value == f'your_{var_name.lower()}_here':
                print(f"Warning: {var_name} is not properly configured")
                return False
        
        return True

# 設定インスタンス
config = Config() 