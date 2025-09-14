# ながら聞き (2025年版)

Google Drive上の音楽ファイルをながら聞きできるモダンWebアプリケーションです。

## 🚀 2025年最新技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript** (厳密な型安全性)
- **Tailwind CSS** (ユーティリティファースト)
- **Zustand** (軽量状態管理)
- **TanStack Query** (サーバー状態管理)
- **Lucide React** (モダンアイコン)

### バックエンド
- **FastAPI** (高性能Python API)
- **Pydantic v2** (データバリデーション)
- **HTTPX** (非同期HTTPクライアント)
- **Google Drive API v3**

### 開発環境
- **pnpm** (高速パッケージマネージャー)
- **モノレポ構成** (ワークスペース)
- **Docker** (コンテナ化)
- **TypeScript Strict Mode**

## 📁 プロジェクト構造

```
gdrive-audio-player/
├── apps/
│   ├── web/                 # Next.js フロントエンド
│   └── api/                 # FastAPI バックエンド
├── packages/
│   ├── types/               # 共有型定義
│   └── ui/                  # 共有UIコンポーネント
├── package.json             # ワークスペース設定
├── pnpm-workspace.yaml      # pnpm設定
└── docker-compose.yml       # 開発環境
```

## 🛠️ 開発環境セットアップ

### 必要な環境
- Node.js 20+
- Python 3.11+
- pnpm 8+
- Docker (オプション)

### 1. 依存関係インストール

```bash
# pnpmをインストール (未インストールの場合)
npm install -g pnpm

# 全依存関係をインストール
pnpm install
```

### 2. 開発サーバー起動

```bash
# 全サービスを並列起動
pnpm dev

# または個別起動
pnpm --filter web dev    # フロントエンド
pnpm --filter api dev    # バックエンド
```

### 3. Docker使用の場合

```bash
# 開発環境をコンテナで起動
docker-compose up --build

# バックグラウンド実行
docker-compose up -d
```

## 🌐 アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:9527
- **API ドキュメント**: http://localhost:9527/docs

## 🎯 主な機能

- ✅ Google Drive フォルダから音声ファイル自動取得
- ✅ 高性能音声再生（再生/停止/前後移動/シーク）
- ✅ お気に入り機能（永続化）
- ✅ シャッフル・リピート再生
- ✅ 再生履歴記録
- ✅ モバイル最適化UI
- ✅ 開発モード（サンプルデータ）
- ✅ TypeScript完全対応
- ✅ Server Components対応

## 🚀 デプロイ

### 推奨構成 (2025年版)
- **フロントエンド**: Vercel (Next.js最適化)
- **バックエンド**: Railway (FastAPI対応)
- **認証**: Google Drive APIキー

詳細なデプロイ手順は `デプロイ方法.md` を参照してください。

## 📝 使用方法

1. アプリにアクセス (http://localhost:3000)
2. 初期設定でGoogle DriveフォルダIDを入力
3. 開発モード/本番モードを選択
4. 音楽を読み込み
5. プレイリストから楽曲を選択して再生

## 🔧 開発コマンド

```bash
# 型チェック
pnpm type-check

# リント
pnpm lint

# ビルド
pnpm build

# クリーンアップ
pnpm clean
```

## 📦 パッケージ管理

このプロジェクトはpnpmワークスペースを使用しています：

```bash
# 特定のワークスペースに依存関係追加
pnpm --filter web add react-query
pnpm --filter api add fastapi

# 全ワークスペースで実行
pnpm --recursive build
```

## 🎨 UI コンポーネント

共有UIコンポーネントは `packages/ui` に配置されています：

- Button, Card, Input等のベースコンポーネント
- Tailwind CSS + CVA (Class Variance Authority)
- TypeScript完全対応

## 📊 パフォーマンス最適化

- Next.js App Router (Server Components)
- 自動コード分割
- 画像最適化
- FastAPI非同期処理
- TanStack Query キャッシング

## 🔒 型安全性

- TypeScript Strict Mode
- Zod ランタイム型検証
- Pydantic v2 (Python)
- 共有型定義パッケージ

## 📄 ライセンス

MIT License 