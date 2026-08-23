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

| パス | 説明 | 対応画面 |
| --- | --- | --- |
| `/` | トップ（未認証時：ランディング、認証時：`/home` へリダイレクト） | 画面遷移開始 |
| `/login` | ログイン画面 | 02 ログイン |
| `/onboarding` | 初回利用者向けの説明画面 | 03 初回説明 |
| `/location-permission` | 位置情報の利用許可と出発地点の設定画面 | 04 位置情報許可 |
| `/home` | 散歩検索や各機能への入口となるホーム画面 | 05 ホーム |
| `/search-stroll` | 現在地・気分・散歩時間・カテゴリから散歩先を検索する画面 | 06 検索 |
| `/storoll/new` | 検索結果、目的地、所要時間、安全情報などを確認する画面 | 07 出発前確認 |
| `/stroll` | 地図、現在位置、所要時間などを表示する散歩中画面 | 08 散歩中 |
| `/stroll/photo` | 散歩中に写真を撮影する画面 | 09 写真撮影 |
| `/stroll/photo/confirm` | 撮影した写真の保存または撮り直しを選択する画面 | 10 写真確認 |
| `/stroll/result` | 到着後に場所、時間、距離、歩数などを表示する画面 | 11 到着と結果発表 |
| `/history` | 過去の散歩記録を一覧表示する画面 | 12 散歩履歴 |
| `/history/[id]` | 写真、ルート、日時、メモなどを表示する散歩記録詳細画面 | 13 散歩記録詳細 |
| `/favorites` | お気に入りに保存した場所を閲覧・管理する画面 | 14 お気に入り |
| `/statistics` | 散歩回数、距離、歩数、達成カレンダーなどを表示する画面 | 15 統計 |
| `/settings` | ユーザー情報や各種設定を変更する画面 | 16 アカウント設定 |
| `/share/[id]` | 散歩結果を共有するための散歩カードを表示する画面 | 17 共有 |
| `/register` | 新規ユーザーがアカウントを作成する画面 | 18追加画面：新規登録 |

---

### 2.2 ディレクトリ構成

```text
src/
├── app/
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── location-permission/
│   │   └── page.tsx
│   ├── home/
│   │   └── page.tsx
│   ├── search-stroll/
│   │   └── page.tsx
│   ├── storoll/
│   │   └── new/
│   │       └── page.tsx
│   ├── stroll/
│   │   ├── page.tsx
│   │   ├── photo/
│   │   │   ├── page.tsx
│   │   │   └── confirm/
│   │   │       └── page.tsx
│   │   └── result/
│   │       └── page.tsx
│   ├── history/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── favorites/
│   │   └── page.tsx
│   ├── statistics/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── share/
│       └── [id]/
│           └── page.tsx
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── stroll/
│   └── ui/
├── lib/
├── types/
└── styles/
```

- `app/`: URL ごとの画面を配置する
- `components/`: 複数画面で再利用する UI 部品を配置する
- `lib/`: API 通信、認証、データ処理などの共通処理を配置する
- `types/`: TypeScript で使用する共通の型定義を配置する
- `styles/`: 共通スタイルを配置する
