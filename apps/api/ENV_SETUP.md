# 環境変数設定ガイド

このAPIを実行するには、以下の環境変数を設定する必要があります。

## 設定方法

`apps/api/` ディレクトリに `.env` ファイルを作成し、以下の内容を記載してください：

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Frontend URL Configuration
FRONTEND_URL=https://shigekikozawa.github.io/nagara-giki

# API Server Configuration
API_HOST=0.0.0.0
API_PORT=9527
PORT=9527

# Development/Production Mode
ENVIRONMENT=development

# CORS Origins (comma-separated)
CORS_ORIGINS=https://shigekikozawa.github.io

# Python Configuration
PYTHONUNBUFFERED=1
```

## 本番環境（Railway）での設定

### 必須環境変数

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Frontend URL Configuration
FRONTEND_URL=https://shigekikozawa.github.io/nagara-giki

# API Server Configuration
API_HOST=0.0.0.0
API_PORT=9527
PORT=9527

# Production Mode
ENVIRONMENT=production

# CORS Origins
CORS_ORIGINS=https://shigekikozawa.github.io

# Python Configuration
PYTHONUNBUFFERED=1
```

## 必須環境変数の説明

### GOOGLE_CLIENT_ID
Google Cloud ConsoleのOAuth 2.0クライアントIDです。

### GOOGLE_CLIENT_SECRET
Google Cloud ConsoleのOAuth 2.0クライアントシークレットです。

### PORT
APIサーバーが使用するポート番号（9527）。Railwayが自動設定しますが、明示的に指定。

## オプション環境変数

### FRONTEND_URL
フロントエンドアプリケーションのURL（デフォルト: https://shigekikozawa.github.io/nagara-giki）

### API_HOST
APIサーバーのホスト（デフォルト: 0.0.0.0）

### API_PORT
APIサーバーのポート（デフォルト: 9527）

### ENVIRONMENT
実行環境（development または production、デフォルト: development）

### CORS_ORIGINS
CORS許可オリジン（カンマ区切り、デフォルト: https://shigekikozawa.github.io）

### PYTHONUNBUFFERED
Pythonの出力バッファリングを無効化（本番環境推奨）

## Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIs & Services」→「Credentials」
3. 「OAuth 2.0 Client IDs」を作成
4. 承認済みリダイレクトURIに追加：
   - 開発環境: `http://localhost:9527/auth/callback`
   - 本番環境: `https://nagara-giki.app/auth/callback`
5. 承認済みJavaScript生成元に追加：
   - 開発環境: `http://localhost:3000`
   - 本番環境: `https://shigekikozawa.github.io`
   - APIドメイン: `https://nagara-giki.app`

## デプロイプラットフォーム別設定

### Railway
1. プロジェクト設定の「Variables」タブ
2. 上記の本番環境変数をすべて設定
3. Root Directory: `apps/api`

### 開発環境
1. `apps/api/.env` ファイルを作成
2. 上記の開発環境変数を設定
3. `python main.py` で起動

## セキュリティ注意事項

- `.env` ファイルは `.gitignore` で除外されており、Git管理されません
- 本番環境では適切な環境変数管理システムを使用してください
- Google OAuth認証情報は絶対にコードにハードコードしないでください
- ポート9527は他のアプリと競合しないよう選択されています

## ポート使い分け

- **このAPIサーバー:** 9527
- **次のアプリ1:** 9528
- **次のアプリ2:** 9529
- **フロントエンド開発:** 3000 