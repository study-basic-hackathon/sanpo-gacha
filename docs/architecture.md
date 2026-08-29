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

| パス                    | 説明                                                             | 対応画面             |
| ----------------------- | ---------------------------------------------------------------- | -------------------- |
| `/`                     | トップ（未認証時：ランディング、認証時：`/home` へリダイレクト） | 画面遷移開始         |
| `/login`                | ログイン画面                                                     | 02 ログイン          |
| `/onboarding`           | 初回利用者向けの説明画面                                         | 03 初回説明          |
| `/location-permission`  | 位置情報の利用許可と出発地点の設定画面                           | 04 位置情報許可      |
| `/home`                 | 散歩検索や各機能への入口となるホーム画面                         | 05 ホーム            |
| `/search-stroll`        | 現在地・気分・散歩時間・カテゴリから散歩先を検索する画面         | 06 検索              |
| `/stroll/new`           | 検索結果、目的地、所要時間、安全情報などを確認する画面           | 07 出発前確認        |
| `/stroll`               | 地図、現在位置、所要時間などを表示する散歩中画面                 | 08 散歩中            |
| `/stroll/photo`         | 散歩中に写真を撮影する画面                                       | 09 写真撮影          |
| `/stroll/photo/confirm` | 撮影した写真の保存または撮り直しを選択する画面                   | 10 写真確認          |
| `/stroll/result`        | 到着後に場所、時間、距離、歩数などを表示する画面                 | 11 到着と結果発表    |
| `/history`              | 過去の散歩記録を一覧表示する画面                                 | 12 散歩履歴          |
| `/history/[id]`         | 写真、ルート、日時、メモなどを表示する散歩記録詳細画面           | 13 散歩記録詳細      |
| `/favorites`            | お気に入りに保存した場所を閲覧・管理する画面                     | 14 お気に入り        |
| `/statistics`           | 散歩回数、距離、歩数、達成カレンダーなどを表示する画面           | 15 統計              |
| `/settings`             | ユーザー情報や各種設定を変更する画面                             | 16 アカウント設定    |
| `/share/[id]`           | 散歩結果を共有するための散歩カードを表示する画面                 | 17 共有              |
| `/register`             | 新規ユーザーがアカウントを作成する画面                           | 18追加画面：新規登録 |

---

### 2.2 ディレクトリ構成

現在の実装では、画面・API・ユースケースを `src/` 配下に分離している。`app/` は Next.js App Router のルーティング、`backend/` はサーバー側の業務ロジック、`frontend/` はクライアントから API を利用するための処理を担当する。

```text
.
├── docs/                         # 設計書、OpenAPI 定義などのドキュメント
├── prisma/
│   ├── schema.prisma              # Prisma スキーマ
│   ├── migrations/                # データベースのマイグレーション履歴
│   └── seeds/                     # 開発・検証用のシード SQL
├── public/                        # ブラウザから配信する静的アセット
├── scripts/                       # データ投入などの運用スクリプト
├── src/
│   ├── app/                       # App Router の画面・Route Handler
│   │   ├── (auth)/                # 未認証で利用する画面（URL には含まれない）
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (private)/             # 認証後の画面（URL には含まれない）
│   │   │   ├── history/[id]/
│   │   │   ├── stroll/photo/confirm/
│   │   │   └── ...
│   │   ├── api/                   # HTTP API の Route Handler
│   │   │   ├── auth/
│   │   │   └── history/[historyId]/
│   │   ├── lib/                   # App Router から利用する認証補助処理
│   │   ├── globals.css             # アプリケーション共通スタイル
│   │   ├── layout.tsx              # ルートレイアウト
│   │   └── page.tsx                # トップページ（`/`）
│   ├── backend/                   # サーバー側のアプリケーション層
│   │   ├── lib/                    # 認証、Prisma、外部サービス、型定義
│   │   ├── usecases/               # 認証・散歩履歴などの業務ユースケース
│   │   └── utils/                  # Result 型などの共通ユーティリティ
│   ├── components/                # 画面間で再利用する React コンポーネント
│   ├── contracts/                 # OpenAPI から生成する API 契約型
│   ├── frontend/                  # クライアント側の API 呼び出し、hooks、整形処理
│   └── middleware.ts               # 認証状態に応じたアクセス制御
├── docker-compose.yml              # 開発環境のコンテナ構成
├── prisma.config.ts                # Prisma CLI の設定
└── package.json                    # 依存パッケージと実行スクリプト
```

- `app/(auth)` と `app/(private)` は Route Group であり、グループ名は URL に含まれない。たとえば `app/(auth)/login/page.tsx` は `/login` に対応する。
- `middleware.ts` は未認証ユーザーを `/login` へリダイレクトし、`/login`、`/register`、`/api` などを対象外としている。
- `backend/lib/db/generatedPrisma/` は Prisma Client の生成物であり、直接編集しない。
- `app/`: URL ごとの画面を配置する
- `components/`: 複数画面で再利用する UI 部品を配置する
- `lib/`: API 通信、認証、データ処理などの共通処理を配置する
- `types/`: TypeScript で使用する共通の型定義を配置する
- `styles/`: 共通スタイルを配置する
