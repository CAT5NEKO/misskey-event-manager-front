## Misskeyイベント管理ツールフロント

MisskeyのMiAuth認証を利用したスケジュール調整ツールのフロントエンドです

### インストール

依存パッケージをインストールして起動します。

```bash
npm install
npm run dev
```

### 環境変数

`VITE_API_URL` でバックエンドAPIのURLを指定します（デフォルト: `http://localhost:8080`）。

| ファイル               | 用途                                    |
|------------------------|-----------------------------------------|
| `.env.development`     | 開発時（`npm run dev`）に読み込まれる    |
| `.env.production`      | 本番ビルド時（`npm run build`）に読み込まれる |

本リポジトリはNetlifyでのデプロイを前提としています（`netlify.toml` にビルド設定あり）。Netlifyは `npm run build` で本番ビルドを行うため、本番用のAPI URLは `.env.production` に設定してください。

