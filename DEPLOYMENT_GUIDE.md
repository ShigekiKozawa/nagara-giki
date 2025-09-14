# デプロイメントガイド

このプロジェクトを無料でデプロイする方法を説明します。

## フロントエンド（GitHub Pages）

### 1. GitHub Secretsの設定

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」で以下を設定：

```
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-username.github.io/nagara-giki
```

### 2. GitHub Pagesの有効化

1. リポジトリの「Settings」→「Pages」
2. Source: 「GitHub Actions」を選択
3. mainブランチにプッシュすると自動デプロイされます

## APIサーバー（無料プラットフォーム）

### Railway での設定

1. [Railway](https://railway.app/) にサインアップ
2. 「New Project」→「Deploy from GitHub repo」
3. 環境変数を設定：
   - `GOOGLE_CLIENT_ID`: Google OAuth クライアントID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth クライアントシークレット
   - `FRONTEND_URL`: https://your-username.github.io/nagara-giki
   - `API_HOST`: 0.0.0.0
   - `API_PORT`: 8000
   - `ENVIRONMENT`: production
   - `CORS_ORIGINS`: https://your-username.github.io

### Render での設定

1. [Render](https://render.com/) にサインアップ
2. 「New」→「Web Service」
3. GitHubリポジトリを接続
4. 設定：
   - Build Command: `cd apps/api && pip install -r requirements.txt`
   - Start Command: `cd apps/api && python main.py`
5. 環境変数を設定（上記と同じ）

### Vercel での設定

1. [Vercel](https://vercel.com/) にサインアップ
2. 「New Project」でリポジトリを接続
3. Root Directory: `apps/api`
4. Framework Preset: 「Other」
5. Build Command: `pip install -r requirements.txt`
6. Output Directory: `.`
7. Install Command: `pip install -r requirements.txt`
8. 環境変数を設定（上記と同じ）

### Heroku での設定

1. [Heroku](https://heroku.com/) にサインアップ
2. 新しいアプリを作成
3. 「Settings」→「Config Vars」で環境変数を設定
4. `apps/api/` ディレクトリに `Procfile` を作成：
   ```
   web: python main.py
   ```

## 必要な環境変数

### APIサーバー用
```env
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
FRONTEND_URL=https://your-username.github.io/nagara-giki
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production
CORS_ORIGINS=https://your-username.github.io
```

### フロントエンド用（GitHub Actions Secrets）
```
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-username.github.io/nagara-giki
```

## Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIs & Services」→「Credentials」
3. 「OAuth 2.0 Client IDs」を作成
4. 承認済みリダイレクトURIに追加：
   - `https://your-api-domain.com/auth/callback`
5. 承認済みJavaScript生成元に追加：
   - `https://your-username.github.io`

## デプロイ手順

1. 環境変数をすべて設定
2. Google OAuth認証情報を取得・設定
3. mainブランチにプッシュ
4. GitHub Actionsが自動実行されフロントエンドがデプロイ
5. APIサーバーも選択したプラットフォームで自動デプロイ

## 注意事項

- 無料プランには制限があります（実行時間、リクエスト数など）
- 本番環境では適切なドメインとHTTPS設定を行ってください
- Google OAuth設定でリダイレクトURIを正しく設定してください 