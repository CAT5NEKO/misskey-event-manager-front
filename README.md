## Misskeyイベント管理ツールフロント

MisskeyのMiAuth認証を利用したスケジュール調整ツールのフロントエンドです。

### インストール

依存パッケージをインストールして起動します。
npm install
npm run dev

本番用ビルドは以下で行います。
npm run build

### 設定

環境変数VITE_API_URLにバックエンドAPIのURLを指定します。
デフォルトはhttp://localhost:8080です。
.env.developmentファイルで開発時の値を変更できます。
