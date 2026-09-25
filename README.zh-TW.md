# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**分散式應用程式正確性的互動學習實驗室。**

FaultScope 讓你從已知的證據與系統契約出發，判斷故障發生後還能保證什麼。每個案例都先釐清必須維持的性質，再找出真正需要修補的邊界。

![FaultScope: 英文介面中的八個已發布案例](docs/images/cases-en.png)

*英文介面中的八個已發布案例。*

## 探索八個案例

1. [要再送一次嗎？](docs/cases/fs-c01.md) — 回應沒到，但 VM 可能已經建立。下一步能做什麼，取決於契約。
2. [A 已被接手，還能提交結果嗎？](docs/cases/fs-c02.md) — Worker B 接手 Job J 時，Worker A 仍在執行。A 的結果還能生效嗎？關鍵在 Job Store 如何檢查。
3. [訂單已確認，事件怎麼沒送出？](docs/cases/fs-c03.md) — PostgreSQL 已將 Order42 記為 CONFIRMED，程式卻在發布 Event E 前崩潰。哪筆持久紀錄能確保 E 之後仍會發布？
4. [消費端明明處理完了，為什麼又執行一次？](docs/cases/fs-c04.md) — 獎勵已入帳，但訊息代理程式沒有收到持久化 ACK；同一事件可能再送一次。
5. [到底哪個事件比較新？](docs/cases/fs-c05.md) — 晚到的事件，可能帶著更舊的狀態。先找出誰有權決定同一筆貨件的先後順序。
6. [讀取成功了，但資料夠新嗎？](docs/cases/fs-c06.md) — 讀取有回應，資料卻可能比這次操作需要的還舊。把寫入後拿到的版本，帶進讀取契約。
7. [取消後，工作真的停了嗎？](docs/cases/fs-c07.md) — 取消訊號已送達，結果交接卻可能一直卡住。找出哪個操作必須接得住取消。
8. [重啟後，它忘了什麼？](docs/cases/fs-c08.md) — 當機後，Shipment42 仍是 SHIPPED；原本保護它的版本判斷卻不見了。

每個案例都有「引導」、「挑戰」和「深入探討」模式，搭配專屬圖解、證據／契約／性質推理欄，以及七種程式碼視角。每個案例的進度儲存在你的瀏覽器。

## 執行 FaultScope

可以直接執行發行版的 `./faultscope`；若要從原始碼建置目前的預覽版，請執行：

```bash
go run ./tools build
./dist/faultscope
```

開啟 [http://localhost:8080/](http://localhost:8080/)。預設的 `:8080` 會監聽所有網路介面。若要指定地址，可使用 `./dist/faultscope --listen 127.0.0.1:9000`，或設定 `FAULTSCOPE_LISTEN=127.0.0.1:9000`；命令列旗標優先。從原始碼建置需要 Node 24 與 pnpm 12，詳見[開發環境設定](docs/development/getting-started.md)。

## 目前狀態與架構

目前是 **`0.0.x` 預覽版**，已發布案例 01–08。這些 VM、工作、訂單、訊息與獎勵情境都是教學用的合成模型，並非正式環境的 SDK 或基礎設施。20 種人類語言都有完整的介面與八個案例訊息；其中 19 種非英語翻譯仍是**未經專業母語審校的 beta 版本**。人類語言決定介面與說明文字，程式碼視角則可獨立選用 **Go、TypeScript、Python、Java、PHP、C、C++**。Next.js/React 前端在建置時輸出靜態檔案，正式執行只需單一 Go 執行檔，不需要 Node 伺服器、資料庫、內容目錄或翻譯服務。偏好與學習進度只存在瀏覽器中。

## 文件與參與

工程文件目前以英文撰寫。請參閱[文件索引](docs/README.md)、[翻譯貢獻指南](docs/localization/translation-guide.md)、[案例撰寫指南](docs/cases/authoring-guide.md)、[程式碼視角貢獻指南](docs/code-lenses/contributing.md)與[MIT 授權條款](LICENSE)。
