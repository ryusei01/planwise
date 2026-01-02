# プロジェクト構造

## ディレクトリ構造

```
planwise/
├── app/                          # Expo Router のルーティング（ファイルベース）
│   ├── (auth)/                  # 認証グループ（認証が必要ない画面）
│   │   ├── _layout.tsx         # 認証レイアウト
│   │   ├── login.tsx           # ログイン画面
│   │   └── signup.tsx          # 新規登録画面
│   ├── (tabs)/                  # タブナビゲーショングループ
│   │   ├── _layout.tsx         # タブレイアウト
│   │   ├── index.tsx           # Home（ダッシュボード）
│   │   ├── goals.tsx           # 目標一覧
│   │   ├── review.tsx          # レビュー
│   │   └── settings.tsx        # 設定
│   ├── goal/                    # 目標詳細（動的ルート）
│   │   └── [id].tsx            # 目標詳細画面
│   ├── _layout.tsx             # ルートレイアウト
│   └── index.tsx               # ルートインデックス（認証状態に応じてリダイレクト）
├── src/
│   ├── lib/                     # ライブラリ設定
│   │   └── supabase.ts         # Supabase クライアント初期化
│   ├── repositories/            # データアクセス層（Repository パターン）
│   │   └── auth.repository.ts  # 認証リポジトリ
│   └── types/                   # TypeScript 型定義
│       ├── database.ts         # データベース型定義（アプリケーション層）
│       └── supabase.ts         # Supabase 生成型（Supabase CLI で生成）
├── package.json
├── tsconfig.json
├── app.json
├── babel.config.js
└── README.md
```

## 設計思想

### 1. レイヤー構造

- **app/**: 画面層（Expo Router のルーティング）
- **src/repositories/**: データアクセス層（Supabase アクセスを抽象化）
- **src/lib/**: ライブラリ設定（Supabase クライアントなど）
- **src/types/**: 型定義

### 2. Repository パターン

Supabase への直接アクセスは `src/repositories/` に集約します。

- データアクセスロジックを画面から分離
- テストしやすい構造
- 将来的に API 層を追加しやすい

### 3. 認証フロー

1. `app/index.tsx` で認証状態をチェック
2. 認証済み → `(tabs)` にリダイレクト
3. 未認証 → `(auth)/login` にリダイレクト

### 4. ルーティング

- `(auth)`: 認証が必要ない画面（ログイン、新規登録）
- `(tabs)`: タブナビゲーション（メインアプリ）
- `goal/[id]`: 動的ルート（目標詳細）

## 次のステップ

1. **目標リポジトリの実装** (`src/repositories/goal.repository.ts`)
2. **タスクリポジトリの実装** (`src/repositories/task.repository.ts`)
3. **進捗ロジックの実装** (`src/lib/progress.ts`)
4. **コンポーネントの実装** (`src/components/`)
5. **コンテナの実装** (`src/containers/` - 今後作成)

