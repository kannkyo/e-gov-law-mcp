---
name: legal-e-gov-law
description: e-Gov 法令API v2 をラップするMCPツール（search_laws, get_law_revisions, get_law_data, get_attachment, search_keyword, download_law_file）を使って、日本の法令の検索・本文取得・改正履歴確認・引用を行う。「〇〇法を調べたい」「法令の条文を引用したい」「法令の改正履歴を知りたい」といった依頼で使う。
allowed-tools: mcp__plugin_e-gov-law-mcp_e-gov-law-mcp__*
---

# e-Gov 法令調査ガイド

e-gov-law MCPサーバーが提供する6つのツールを使って、日本の法令を調査する手順をまとめる。

## 前提

このSKILLは e-gov-law-mcp プラグインの MCP サーバーがインストール済みであることを前提とする。以下のツールが利用可能:

- `search_laws` — 法令名・種別・時点で法令一覧を検索
- `get_law_revisions` — 指定法令の改正履歴を取得
- `get_law_data` — 法令本文をJSONで取得
- `get_attachment` — 添付ファイルを取得（一時ファイルに保存しパスを返す）
- `search_keyword` — 法令本文の全文キーワード検索
- `download_law_file` — 法令本文をファイル形式（xml/json/html/rtf/docx）でダウンロード（一時ファイルに保存しパスを返す）

## 典型的なワークフロー

### 1. 法令名から本文を調べたい

1. `search_laws` に `law_title` を指定して呼び出し、対象法令の `law_id`（または法令番号）を特定する。複数候補が返る場合は、法令名の完全一致や法令種別で絞り込む。
2. 特定した `law_id_or_num_or_revision_id` を使って `get_law_data` を呼び出し、本文を取得する。特定の条文だけが必要な場合は `elm` パラメータで絞り込む。
3. 取得した本文から該当箇所を引用する。

### 2. キーワードで法令を横断検索したい

1. `search_keyword` に `keyword` を指定して呼び出し、該当する法令の一覧を取得する。
2. 一覧から関連性の高い法令を選び、それぞれについて `get_law_data` で本文を取得し、内容を確認する。
3. 結果が多すぎる場合は `law_type` で法令種別を絞り込むか、`limit`/`offset` でページングする。

### 3. 改正履歴を追いたい

1. `get_law_revisions` に `law_id_or_num` を指定して呼び出し、改正履歴一覧を取得する。
2. 特定の期間の改正だけを見たい場合は `amendment_date_from`/`amendment_date_to` で絞り込む。
3. 特定の改正時点の本文が必要な場合は、その改正の revision_id を `get_law_data` の `law_id_or_num_or_revision_id` に渡して本文を取得する。

### 4. 添付ファイルや本文ファイルが必要なとき

- 法令本文中に画像やPDFなどの添付ファイルへの参照がある場合は `get_attachment` を使う。返り値のパスをReadツール等で参照する。
- 法令本文をXML/HTML/DOCXなどのファイル形式でそのまま保存したい場合は `download_law_file` を使う。

## 引用時の作法

法令を引用する際は、必ず以下を明記する:

- 法令名（略称ではなく正式名称）
- 条・項・号などの具体的な位置
- 参照した時点（`asof` や改正IDに対応する施行日）。時点を指定していない場合は「取得時点で最新の内容」であることを明記する。
