# FaultScope

**分散式應用程式正確性的互動學習實驗室。**

FaultScope 讓工程師從證據、契約與必須維持的性質出發，推理故障後可以採取什麼行動。第一個案例問的是：遠端 `CreateVM` 請求在期限前沒有完成回應，應該再送一次嗎？

目前是 **`0.0.x` 預覽版**，只有案例 01 已發布於專案內容中。範例是用來教學的合成模型，不是實際雲端服務 SDK。`v0.1.0` 預定的其他案例尚未實作。

```bash
go run ./tools build
./dist/faultscope
```

開啟 [http://localhost:8080/](http://localhost:8080/)。預設 `:8080` 監聽所有網路介面；可用 `--listen` 或 `FAULTSCOPE_LISTEN` 指定地址，旗標優先。

**人類語言（Human Locale）**改變介面與說明；**程式碼視角（Code Lens）**改變程式碼呈現，兩者互不影響。例如可以選擇繁體中文說明搭配 Go 程式碼。20 個人類語言的介面與案例 01 訊息均已補齊；其中 19 個非英語語言仍是**未經人工審校的 beta 翻譯**。程式碼視角有 Go、TypeScript、Python、Java、PHP、C、C++。

正式執行只需一個 Go 執行檔；Next.js/React 用於建置靜態前端，不需要正式環境的 Node 伺服器、資料庫或翻譯服務。

工程文件以英文為準。請參閱[英文 README](README.md)、[文件索引](docs/README.md)、[翻譯貢獻指南](docs/localization/translation-guide.md)與[授權條款](LICENSE)。本繁體中文概覽需人工維護，沒有自動同步機制。
