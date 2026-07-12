## Misskeyイベント管理ツールフロント

MisskeyのMiAuth認証を利用したスケジュール調整ツールのフロントエンドです

### インストール

依存パッケージをインストールして起動します。

```bash
npm install
npm run dev
```

### 設定

環境変数VITE_API_URLにバックエンドAPIのURLを指定します。  
デフォルトはhttp://localhost:8080です。  
.env.developmentファイルで開発時の値を変更できます。  

尚、本リポジトリはNetlifyでデプロイするように設計して作ってあるので、ローカルで適用する場合は適宜調整してください。

