# 環境変数設定ガイド

このAPIを実行するには、以下の環境変数を設定する必要があります。

## 設定方法

`apps/api/` ディレクトリに `.env` ファイルを作成し、以下の内容を記載してください：

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Frontend URL Configuration
FRONTEND_URL=http://localhost:3000

# API Server Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Development/Production Mode
ENVIRONMENT=development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 必須環境変数

### GOOGLE_CLIENT_ID
Google Cloud ConsoleのOAuth 2.0クライアントIDです。

### GOOGLE_CLIENT_SECRET
Google Cloud ConsoleのOAuth 2.0クライアントシークレットです。

## オプション環境変数

### FRONTEND_URL
フロントエンドアプリケーションのURL（デフォルト: http://localhost:3000）

### API_HOST
APIサーバーのホスト（デフォルト: 0.0.0.0）

### API_PORT
APIサーバーのポート（デフォルト: 8000）

### ENVIRONMENT
実行環境（development または production、デフォルト: development）

### CORS_ORIGINS
CORS許可オリジン（カンマ区切り、デフォルト: http://localhost:3000,http://localhost:3001）

## セキュリティ注意事項

- `.env` ファイルは `.gitignore` で除外されており、Git管理されません
- 本番環境では適切な環境変数管理システムを使用してください
- Google OAuth認証情報は絶対にコードにハードコードしないでください 