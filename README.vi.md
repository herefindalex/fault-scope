# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Phòng thực hành tương tác để tìm hiểu tính đúng đắn của ứng dụng phân tán.**

FaultScope bắt đầu từ bằng chứng và cam kết của hệ thống để xác định điều gì còn được bảo đảm sau sự cố. Mỗi tình huống làm rõ tính chất cần giữ trước khi tìm ranh giới cần sửa.

![FaultScope: Tám tình huống đã phát hành trong giao diện tiếng Anh](docs/images/cases-en.png)

*Tám tình huống đã phát hành trong giao diện tiếng Anh.*

## Khám phá tám tình huống

1. [Bạn có nên gửi lại không?](docs/cases/fs-c01.md) — Không nhận được phản hồi, nhưng VM có thể đã được tạo. Hợp đồng quyết định bước tiếp theo có an toàn hay không.
2. [Sau khi B tiếp quản, A còn được ghi kết quả không?](docs/cases/fs-c02.md) — Worker B đã tiếp quản Job J nhưng A vẫn đang chạy. Việc kiểm tra tại Job Store quyết định kết quả của A có hiệu lực hay không.
3. [Đơn hàng đã xác nhận. Event E ở đâu?](docs/cases/fs-c03.md) — Order42 đã là CONFIRMED trong PostgreSQL, nhưng tiến trình lỗi trước khi phát Event E. Bản ghi bền vững nào bảo đảm E vẫn được phát sau đó?
4. [Bộ xử lý thông điệp đã xong. Vì sao nó chạy lại?](docs/cases/fs-c04.md) — Một phần thưởng đã cam kết và một sự thừa nhận bị thiếu có thể khiến một sự kiện hợp lý xảy ra hai lần.
5. [Sự kiện nào thực sự mới hơn?](docs/cases/fs-c05.md) — Việc giao hàng sau có thể mang trạng thái cũ hơn. Tìm cơ quan có thẩm quyền ra lệnh thay đổi một lô hàng.
6. [Đọc thành công. Dữ liệu đã đủ mới chưa?](docs/cases/fs-c06.md) — Phản hồi thành công có thể vẫn quá cũ đối với người gọi này. Đưa bản sửa đổi đã cam kết vào hợp đồng đã đọc.
7. [Việc hủy có thực sự dừng công việc không?](docs/cases/fs-c07.md) — Tín hiệu hủy đã đến nhưng kết quả chuyển giao có thể vẫn bị chặn. Tìm hoạt động phải tham gia.
8. [Hệ thống đã khởi động lại. Nó đã quên điều gì?](docs/cases/fs-c08.md) — Shipment42 vẫn báo SHIPPED sau một vụ va chạm. Người bảo vệ sửa đổi bảo vệ nó đã biến mất.

Mỗi tình huống có chế độ Hướng dẫn, Thử thách và Đào sâu, hình minh họa riêng, bảng Bằng chứng / Cam kết / Tính chất và bảy góc nhìn mã. Tiến độ từng tình huống được lưu trong trình duyệt.

## Chạy FaultScope

Có thể chạy bản phát hành bằng `./faultscope`. Để biên dịch bản xem trước hiện tại từ mã nguồn:

```bash
go run ./tools build
./dist/faultscope
```

Mở [http://localhost:8080/](http://localhost:8080/). Theo mặc định, `:8080` lắng nghe trên mọi giao diện mạng. Dùng `./dist/faultscope --listen 127.0.0.1:9000` hoặc `FAULTSCOPE_LISTEN=127.0.0.1:9000` để chọn địa chỉ khác; tùy chọn dòng lệnh được ưu tiên. Việc biên dịch từ nguồn cần Node 24 và pnpm 12; xem [hướng dẫn bắt đầu](docs/development/getting-started.md).

## Trạng thái và kiến trúc

Đây là **bản xem trước `0.0.x`** với các tình huống 01–08 đã phát hành. Ví dụ về VM, công việc, đơn hàng, thông điệp và phần thưởng là mô hình giảng dạy, không phải SDK hay hạ tầng sản xuất. Cả 20 ngôn ngữ đều có đủ thông điệp giao diện và tám tình huống; 19 bản dịch ngoài tiếng Anh vẫn ở **mức beta, chưa được chuyên gia bản ngữ thẩm định**. Ngôn ngữ giao diện và góc nhìn mã có thể chọn độc lập. Bảy góc nhìn gồm **Go, TypeScript, Python, Java, PHP, C, C++**. Giao diện Next.js/React được xuất thành tệp tĩnh lúc biên dịch rồi nhúng vào một tệp thực thi Go. Khi chạy không cần máy chủ Node, cơ sở dữ liệu, thư mục nội dung hay dịch vụ dịch thuật. Tùy chọn và tiến độ chỉ lưu trong trình duyệt.

## Tài liệu và đóng góp

Tài liệu kỹ thuật hiện bằng tiếng Anh: [mục lục](docs/README.md), [hướng dẫn dịch](docs/localization/translation-guide.md), [hướng dẫn viết tình huống](docs/cases/authoring-guide.md), [đóng góp góc nhìn mã](docs/code-lenses/contributing.md) và [giấy phép MIT](LICENSE).
