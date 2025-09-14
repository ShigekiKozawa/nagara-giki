# 環境変数設定ガイド

## 概要
このアプリケーションでは、開発・本番環境での設定を環境変数で管理します。

## 必要な環境変数ファイル

### 1. フロントエンド (.env.local)
`apps/web/.env.local` ファイルを作成してください：

```env
# API Server Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:9527

# Frontend Configuration  
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Development/Production Mode
NODE_ENV=development
```

### 2. APIサーバー (.env)
`apps/api/.env` ファイルを作成してください：

```env
# Google OAuth Configuration (必須)
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Frontend URL Configuration
FRONTEND_URL=http://localhost:3000

# API Server Configuration
API_HOST=0.0.0.0
API_PORT=9527

# Development/Production Mode
ENVIRONMENT=development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Google OAuth設定手順

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth 2.0 クライアントID」を選択
5. アプリケーションの種類：「ウェブアプリケーション」
6. 承認済みのリダイレクトURIに追加：
   - `http://localhost:9527/auth/callback` (開発環境)
   - 本番環境のURL (本番環境の場合)
7. クライアントIDとクライアントシークレットをコピー
8. `.env` ファイルに設定

## 本番環境での設定例

### フロントエンド (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### APIサーバー (.env)
```env
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
FRONTEND_URL=https://your-frontend-domain.com
API_HOST=0.0.0.0
API_PORT=9527
ENVIRONMENT=production
CORS_ORIGINS=https://your-frontend-domain.com
```

## 設定の確認

### フロントエンド
```bash
cd apps/web
npm run dev
```

### APIサーバー
```bash
cd apps/api
source venv/bin/activate
python main.py
```

起動時に設定の妥当性がチェックされ、問題があれば警告が表示されます。

## セキュリティ注意事項

- `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません
- 本番環境では、環境変数を直接サーバーに設定することを推奨します
- Google OAuth の認証情報は絶対に公開しないでください 