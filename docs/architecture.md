# アーキテクチャ設計

## 1. 技術スタック

### 1.1 全体構成

- **フロントエンド**: Next.js 16 (App Router) + TypeScript
- **バックエンド**: Next.js Route Handlers（API）
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証**: NextAuth (Auth.js) + JWT/Session
- **UI**: Tailwind CSS
- **デプロイ**: Vercel（FE/API） + ?（Postgres）

### 1.2 推奨理由

- Next.js で画面と API を同一リポジトリにまとめると、MVP が最短で仕上がり、運用も容易

---

## 2. フロントエンド設計

### 2.1 画面構成（App Router）

| パス             | 説明                                                           |
| ---------------- | -------------------------------------------------------------- |
| `/`              | トップ（未認証時：ランディング、認証時：/home へリダイレクト） |
| `/login`         | ログイン画面                                                   |
| `/home`          | ホーム画面                                                     |
| `/search-stroll` | 散歩検索画面                                                   |
| `/storoll/new`   | 散歩詳細画面                                                   |
| `/history`       | 散歩履歴一覧                                                   |
| `/history/[id]`  | 散歩履歴詳細                                                   |
| `/settings`      | 設定（ユーザー設定）                                           |

---

### 2.2 ディレクトリ構成
