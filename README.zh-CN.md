# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**用于学习分布式应用正确性的交互式实验室。**

FaultScope 帮助你根据已有证据和系统契约，判断故障发生后究竟还能保证什么。每个案例先厘清需要维持的性质，再寻找真正需要修复的边界。

![FaultScope: 英文界面中的八个已发布案例](docs/images/cases-en.png)

*英文界面中的八个已发布案例。*

## 探索八个案例

1. [要再发送一次吗？](docs/cases/fs-c01.md) — 响应没到，但 VM 可能已经创建。下一步能做什么，取决于契约。
2. [A 已被接手，还能提交结果吗？](docs/cases/fs-c02.md) — Worker B 接手 Job J 时，Worker A 仍在执行。A 的结果还能生效吗？关键在 Job Store 如何检查。
3. [订单已确认，事件怎么没送出？](docs/cases/fs-c03.md) — PostgreSQL 已将 Order42 记为 CONFIRMED，程序却在发布 Event E 前崩溃。哪笔持久纪录能确保 E 之后仍会发布？
4. [消费端明明处理完了，为什么又执行一次？](docs/cases/fs-c04.md) — 奖励已入帐，但消息代理程序没有收到持久化 ACK；同一事件可能再送一次。
5. [到底哪个事件比较新？](docs/cases/fs-c05.md) — 晚到的事件，可能带着更旧的状态。先找出谁有权决定同一笔货件的先后顺序。
6. [读取成功了，但数据够新吗？](docs/cases/fs-c06.md) — 读取有回应，数据却可能比这次操作需要的还旧。把写入后拿到的版本，带进读取契约。
7. [取消后，工作真的停了吗？](docs/cases/fs-c07.md) — 取消讯号已送达，结果交接却可能一直卡住。找出哪个操作必须接得住取消。
8. [重启后，它忘了什么？](docs/cases/fs-c08.md) — 崩溃后 Shipment42 仍然显示 SHIPPED。保护它的修订保护已经消失了。

每个案例都有“引导”“挑战”和“深入探讨”模式，配有专属图示、证据／契约／性质推理栏，以及七种代码视角。各案例的进度保存在浏览器中。

## 运行 FaultScope

可以直接运行发行版的 `./faultscope`；要从源码构建当前预览版，请运行：

```bash
go run ./tools build
./dist/faultscope
```

打开 [http://localhost:8080/](http://localhost:8080/)。默认的 `:8080` 监听所有网络接口。可用 `./dist/faultscope --listen 127.0.0.1:9000` 或 `FAULTSCOPE_LISTEN=127.0.0.1:9000` 指定地址；命令行参数优先。从源码构建需要 Node 24 和 pnpm 12，参见[开发环境设置](docs/development/getting-started.md)。

## 当前状态与架构

目前是 **`0.0.x` 预览版**，已发布案例 01–08。VM、任务、订单、消息和奖励场景是用于教学的合成模型，并非生产环境的 SDK 或基础设施。20 种人类语言均有完整的界面及八个案例的消息；其中 19 种非英语翻译仍是**未经专业母语审校的 beta 版本**。人类语言决定界面和说明，代码视角可独立选择 **Go、TypeScript、Python、Java、PHP、C、C++**。Next.js/React 前端在构建时导出静态文件；运行时只需一个 Go 可执行文件，无需 Node 服务器、数据库、内容目录或翻译服务。偏好设置和学习进度只保存在浏览器中。

## 文档与参与

工程文档目前使用英语。参见[文档索引](docs/README.md)、[翻译贡献指南](docs/localization/translation-guide.md)、[案例编写指南](docs/cases/authoring-guide.md)、[代码视角贡献指南](docs/code-lenses/contributing.md)和 [MIT 许可证](LICENSE)。
