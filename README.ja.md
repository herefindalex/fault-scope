# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**分散アプリケーションの正しさを学ぶインタラクティブな実験室。**

FaultScope では、手元の証拠とシステムの契約から、障害の後に何を保証できるかを考えます。各ケースで守るべき性質を明確にしてから、修正が必要な境界を探します。

![FaultScope: 英語表示の画面に並ぶ、公開済みの 8 つのケース](docs/images/cases-en.png)

*英語表示の画面に並ぶ、公開済みの 8 つのケース。*

## 8 つのケース

1. [もう一度送るべきか？](docs/cases/fs-c01.md) — 応答が届かなくても、VM はすでに作成されているかもしれません。次に何ができるかは契約次第です。
2. [Bに引き継いだ後も、Aは結果を確定できる？](docs/cases/fs-c02.md) — Worker B が Job J を引き継いでも、A は動き続けています。A の結果を有効にするかどうかは Job Store の検査で決まります。
3. [注文は確定した。Event E はどこへ？](docs/cases/fs-c03.md) — PostgreSQL で Order42 が CONFIRMED になった後、Event E を配信する前にプロセスが停止しました。後で配信するための記録は残っていますか？
4. [コンシューマーは処理を終えた。なぜもう一度実行されたのか？](docs/cases/fs-c04.md) — コミットされた報酬と不足している確認により、1 つの論理イベントが 2 回到着する可能性があります。
5. [本当に新しいイベントはどれ？](docs/cases/fs-c05.md) — 後の配信では古い状態が引き継がれる可能性があります。 1 つの出荷に変更を注文する当局を見つけます。
6. [読み取りは成功。でもデータは十分に新しい？](docs/cases/fs-c06.md) — 成功した応答は、この呼び出し元にとってはまだ古すぎる可能性があります。コミットされたリビジョンを読み取りコントラクトに組み込みます。
7. [キャンセルで処理は本当に止まった？](docs/cases/fs-c07.md) — キャンセル信号は到着しましたが、結果のハンドオフはブロックされたままになる可能性があります。参加する必要がある操作を見つけます。
8. [再起動した。何を忘れた？](docs/cases/fs-c08.md) — Shipment42 はクラッシュ後も SHIPPED と表示されます。それを保護していたリビジョンガードがなくなりました。

各ケースには「ガイド」「チャレンジ」「詳説」、ケース固有の図、証拠／契約／性質を整理する欄、7 種類のコードレンズがあります。進行状況はケースごとにブラウザーへ保存されます。

## FaultScope を起動する

配布版は `./faultscope` で起動できます。現在のプレビュー版をソースからビルドするには、次を実行してください。

```bash
go run ./tools build
./dist/faultscope
```

[http://localhost:8080/](http://localhost:8080/) を開きます。既定の `:8080` はすべてのネットワークインターフェースで待ち受けます。アドレスは `./dist/faultscope --listen 127.0.0.1:9000` または `FAULTSCOPE_LISTEN=127.0.0.1:9000` で指定でき、コマンドライン引数が優先されます。ソースからのビルドには Node 24 と pnpm 12 が必要です。詳しくは[開発環境のセットアップ](docs/development/getting-started.md)をご覧ください。

## 現状と構成

現在は **`0.0.x` プレビュー版**で、ケース 01–08 を公開しています。VM、ジョブ、注文、メッセージ、報酬の例は学習用のモデルであり、本番用 SDK やインフラではありません。20 言語すべてで UI と 8 ケースのメッセージが揃っていますが、英語以外の 19 言語は**技術に詳しい母語話者による確認前のベータ翻訳**です。表示言語とコードレンズは独立して選択でき、コードレンズは **Go、TypeScript、Python、Java、PHP、C、C++** に対応します。Next.js/React の画面はビルド時に静的ファイルとなり、実行時は単一の Go バイナリだけで動きます。Node サーバー、データベース、コンテンツディレクトリ、翻訳サービスは不要です。設定と学習の進行状況はブラウザーにのみ保存されます。

## ドキュメントと参加方法

技術文書は現在英語です。[文書一覧](docs/README.md)、[翻訳ガイド](docs/localization/translation-guide.md)、[ケース執筆ガイド](docs/cases/authoring-guide.md)、[コードレンズへの貢献](docs/code-lenses/contributing.md)、[MIT ライセンス](LICENSE)をご覧ください。
