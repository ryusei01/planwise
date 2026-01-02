# Planwise

目標を月単位で運用しつつ、年単位目標にも対応できる TODO アプリ

## 技術スタック

- Expo (React Native) + TypeScript
- Expo Router（ファイルベースルーティング）
- Supabase (Postgres + RLS)
- Supabase Auth（Email/Password）

## セットアップ

1. 依存関係のインストール

```bash
npm install
```

2. 環境変数の設定

`.env` ファイルを作成し、以下を設定してください：

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. アプリの起動

```bash
npm start
```

## プロジェクト構造

```
planwise/
├── app/                    # Expo Router のルーティング
│   ├── (auth)/            # 認証関連画面
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/            # タブナビゲーション
│   │   ├── index.tsx      # Home
│   │   ├── goals.tsx      # 目標一覧
│   │   ├── review.tsx     # レビュー
│   │   └── settings.tsx   # 設定
│   ├── goal/              # 目標詳細
│   │   └── [id].tsx
│   ├── _layout.tsx        # ルートレイアウト
│   └── index.tsx          # ルートインデックス（認証状態に応じてリダイレクト）
├── src/
│   ├── lib/               # ライブラリ設定
│   │   └── supabase.ts    # Supabase クライアント
│   ├── repositories/      # データアクセス層
│   │   └── auth.repository.ts
│   └── types/             # 型定義
│       ├── database.ts
│       └── supabase.ts
├── package.json
├── tsconfig.json
└── app.json
```

## 実装状況

### 完了

- [x] Expo プロジェクトの初期設定
- [x] Supabase クライアントの設定
- [x] 認証機能（ログイン/新規登録/サインアウト）
- [x] Expo Router のルーティング構造
- [x] タブナビゲーション
- [x] 目標一覧/作成機能（RPC create_goal_with_initial_plan 使用）
- [x] 目標詳細画面（タスク一覧、完了トグル、進捗表示）
- [x] ダッシュボード（目標カード、今日やること、計画見直し）
- [x] レビュー画面（今週完了数、詰まり理由）
- [x] 有料機能ロック UI（サブスクリプション状態表示）
- [x] 進捗ロジック（理想進捗率・実進捗率・乖離率計算）
- [x] Repository 層の実装（Goal, Task, Subscription, Progress, Auth）

### 今後実装

- [ ] 通知履歴画面
- [ ] AI 機能（モック → 実装）
- [ ] 課金導線の実装
- [ ] タスクの編集・削除機能

## コーディング規約

- すべて TypeScript
- 関数・コンポーネントは小さく
- supabase アクセスは repository 層に分離
- 画面は containers/components に分ける（今後実装）
- 主要なソースには必ずコメント、ID を入れる
- TODO コメントは必ず "TODO(#ID): ..." 形式で ID を入れる

