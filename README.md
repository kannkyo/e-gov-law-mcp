# e-gov-law-mcp

[e-Gov法令API v2](https://laws.e-gov.go.jp/apitop/) をラップした [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) サーバーです。日本の法令データ（法令一覧・改正履歴・法令本文・添付ファイルなど）をMCP対応クライアント（Claude Codeなど）から検索・取得できるようにします。

## セットアップ

Node.js が必要です。

```bash
npx github:kannkyo/e-gov-law-mcp
```

MCPクライアントの設定ファイル（例: Claude Codeの `mcp.json` 等）に以下のように登録します。

```json
{
  "mcpServers": {
    "e-gov-law": {
      "command": "npx",
      "args": ["github:kannkyo/e-gov-law-mcp"]
    }
  }
}
```

### ソースからのビルド

```bash
git clone https://github.com/kannkyo/e-gov-law-mcp.git
cd e-gov-law-mcp
npm install
npm run build
npm start
```

## 提供ツール

| ツール名 | 概要 | 対応API |
| --- | --- | --- |
| `search_laws` | 法令名・法令種別・時点(asof)を指定して法令一覧を検索する | `GET /laws` |
| `get_law_revisions` | 指定した法令の改正履歴一覧を取得する | `GET /law_revisions/{law_id_or_num}` |
| `get_law_data` | 法令ID・法令番号・改正IDを指定して法令本文をJSONで取得する | `GET /law_data/{law_id_or_num_or_revision_id}` |
| `get_attachment` | 法令改正IDを指定して添付ファイル（画像・PDF・Zipなど）を取得し、一時ファイルに保存してそのパスを返す | `GET /attachment/{law_revision_id}` |
| `search_keyword` | 法令本文内に指定したキーワードを含む法令を検索する | `GET /keyword` |
| `download_law_file` | 法令本文をファイル形式（xml/json/html/rtf/docx）でダウンロードし、一時ファイルに保存してそのパスを返す | `GET /law_file/{file_type}/{law_id_or_num_or_revision_id}` |

`get_attachment` / `download_law_file` はバイナリデータをOSの一時ディレクトリに保存し、保存先パス・サイズ・Content-Typeを返します。

## 開発

```bash
npm run typecheck  # 型チェック
npm test           # テスト実行（vitest）
npm run build      # 型チェック + esbuildでdist/index.jsにバンドル
```

## ライセンス

[MIT](./LICENSE)
