# 本番環境設定ガイド (PWA + GitHub Pages)

## 概要
このガイドでは、「ながら聞き」をPWAとしてGitHub Pagesにデプロイする手順を説明します。

## 1. 事前準備

### 1.1 APIサーバーの準備
フロントエンドはGitHub Pagesでホストしますが、APIサーバーは別途必要です。

**推奨サービス:**
- Railway
- Vercel (Serverless Functions)
- Heroku
- DigitalOcean App Platform

### 1.2 Google OAuth設定
1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. 「APIとサービス」→「認証情報」でOAuth 2.0クライアントIDを作成
3. 承認済みのリダイレクトURIに追加:
   - `https://your-api-domain.com/auth/callback`
4. 承認済みのJavaScript生成元に追加:
   - `https://your-username.github.io`
   - `https://your-custom-domain.com` (カスタムドメインの場合)

## 2. GitHub設定

### 2.1 リポジトリ設定
1. GitHubでリポジトリを作成
2. Settings → Pages で以下を設定:
   - Source: GitHub Actions
   - Custom domain (オプション): `your-domain.com`

### 2.2 Secrets設定
Settings → Secrets and variables → Actions で以下を追加:

```
API_BASE_URL=https://your-api-domain.com
```

## 3. 必要なアイコンファイル

以下のファイルを `apps/web/public/` に配置してください:

```
public/
├── icon.svg (既存)
├── icon-192.png (192x192px)
├── icon-512.png (512x512px)
├── screenshot-mobile.png (390x844px)
└── screenshot-desktop.png (1280x720px)
```

### アイコン生成方法
1. 既存の `icon.svg` をベースに使用
2. オンラインツール (例: [Favicon Generator](https://favicon.io/)) でPNG版を生成
3. スクリーンショットは実際のアプリ画面をキャプチャ

## 4. 環境変数設定

### 4.1 フロントエンド (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-username.github.io/nagara-giki
NODE_ENV=production
```

### 4.2 APIサーバー
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://your-username.github.io/nagara-giki
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production
CORS_ORIGINS=https://your-username.github.io
```

## 5. デプロイ手順

### 5.1 初回デプロイ
1. コードをGitHubリポジトリにプッシュ
2. GitHub Actionsが自動実行される
3. デプロイ完了後、`https://your-username.github.io/nagara-giki` でアクセス可能

### 5.2 更新デプロイ
1. `main` ブランチにプッシュするだけで自動デプロイ

## 6. PWA機能

### 6.1 インストール
- Chrome/Edge: アドレスバーの「インストール」ボタン
- Safari: 共有ボタン → 「ホーム画面に追加」
- アプリ内: 自動表示されるインストールプロンプト

### 6.2 オフライン機能
- Service Workerによる基本的なキャッシュ
- アプリシェルのオフライン表示
- 音楽ファイルはオンライン必須

## 7. カスタムドメイン設定 (オプション)

### 7.1 DNS設定
```
CNAME: your-domain.com → your-username.github.io
```

### 7.2 GitHub設定
1. Settings → Pages → Custom domain に入力
2. `apps/web/public/CNAME` ファイルを作成:
```
your-domain.com
```

### 7.3 設定ファイル更新
```javascript
// next.config.js
assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
basePath: process.env.NODE_ENV === 'production' ? '' : '',
```

## 8. 監視とメンテナンス

### 8.1 Analytics (オプション)
- Google Analytics
- Vercel Analytics
- Plausible Analytics

### 8.2 エラー監視
- Sentry
- LogRocket
- Bugsnag

### 8.3 パフォーマンス監視
- Lighthouse CI
- Web Vitals
- PageSpeed Insights

## 9. セキュリティ考慮事項

### 9.1 HTTPS必須
- GitHub Pagesは自動的にHTTPS
- APIサーバーもHTTPS必須

### 9.2 CORS設定
- APIサーバーで適切なCORS設定
- 本番ドメインのみ許可

### 9.3 認証情報管理
- 環境変数で管理
- クライアントサイドに秘密情報を含めない

## 10. トラブルシューティング

### 10.1 よくある問題
- **404エラー**: `basePath` 設定を確認
- **CORS エラー**: APIサーバーのCORS設定を確認
- **認証エラー**: Google OAuth設定のリダイレクトURIを確認

### 10.2 デバッグ方法
- ブラウザの開発者ツール
- GitHub Actionsのログ
- APIサーバーのログ

## 11. パフォーマンス最適化

### 11.1 画像最適化
- WebP形式の使用
- 適切なサイズ設定
- 遅延読み込み

### 11.2 コード分割
- Next.jsの自動コード分割
- 動的インポート
- Tree shaking

### 11.3 キャッシュ戦略
- Service Workerキャッシュ
- CDNキャッシュ
- ブラウザキャッシュ 