# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Laboratorium interaktif untuk memahami kebenaran aplikasi terdistribusi.**

FaultScope berangkat dari bukti dan kontrak sistem untuk menentukan apa yang masih dapat dijamin setelah terjadi kegagalan. Setiap kasus terlebih dahulu menjelaskan sifat yang harus dipertahankan, lalu mencari batas yang perlu diperbaiki.

## Jelajahi delapan kasus

1. [Haruskah Anda mengirimnya lagi?](docs/cases/fs-c01.md) — Respons tidak tiba, tetapi VM mungkin sudah dibuat. Kontrak menentukan langkah yang aman berikutnya.
2. [Setelah B mengambil alih, bolehkah A menyimpan hasilnya?](docs/cases/fs-c02.md) — Worker B mengambil alih Job J, tetapi A masih berjalan. Pemeriksaan di Job Store menentukan apakah hasil A boleh berlaku.
3. [Pesanan sudah dikonfirmasi. Di mana Event E?](docs/cases/fs-c03.md) — Order42 berstatus CONFIRMED di PostgreSQL, tetapi proses berhenti sebelum Event E diterbitkan. Catatan tahan lama apa yang memastikan E diterbitkan nanti?
4. [Konsumen pesan sudah selesai. Mengapa dijalankan lagi?](docs/cases/fs-c04.md) — Hadiah sudah dicatat, tetapi ACK tidak tersimpan. Pengiriman ulang dapat memproses peristiwa logis yang sama dua kali.
5. [Peristiwa mana yang sebenarnya lebih baru?](docs/cases/fs-c05.md) — Peristiwa yang datang belakangan bisa membawa keadaan yang lebih lama. Revisi dari sumber menentukan urutan perubahan untuk satu pengiriman.
6. [Pembacaan berhasil. Apakah datanya cukup mutakhir?](docs/cases/fs-c06.md) — Respons baca bisa berhasil tetapi masih terlalu lama untuk pemanggil ini. Jadikan revisi yang telah dikomit sebagai batas minimum pembacaan.
7. [Apakah Pembatalan Benar-Benar Menghentikan Pekerjaan?](docs/cases/fs-c07.md) — Sinyal batal sudah tiba, namun handoff hasil masih terblokir. Temukan operasi yang harus berpartisipasi.
8. [Sistem dimulai ulang. Apa yang terlupakan?](docs/cases/fs-c08.md) — Shipment42 masih mengatakan SHIPPED setelah terjadi kecelakaan. Penjaga revisi yang melindunginya telah hilang.

Setiap kasus memiliki mode Terpandu, Tantangan, dan Pembahasan Mendalam, visualisasi tersendiri, panel Bukti / Kontrak / Sifat, serta tujuh lensa kode. Kemajuan setiap kasus disimpan di peramban.

## Jalankan FaultScope

Jalankan rilis yang tersedia dengan `./faultscope`. Untuk membangun pratinjau saat ini dari kode sumber:

```bash
go run ./tools build
./dist/faultscope
```

Buka [http://localhost:8080/](http://localhost:8080/). Secara baku, `:8080` mendengarkan di semua antarmuka jaringan. Gunakan `./dist/faultscope --listen 127.0.0.1:9000` atau `FAULTSCOPE_LISTEN=127.0.0.1:9000` untuk memilih alamat lain; opsi baris perintah didahulukan. Pembangunan dari sumber memerlukan Node 24 dan pnpm 12. Lihat [panduan pengembangan](docs/development/getting-started.md).

## Status dan arsitektur

Ini adalah **pratinjau `0.0.x`** dengan kasus 01–08 yang telah diterbitkan. Contoh VM, pekerjaan, pesanan, pesan, dan hadiah merupakan model pembelajaran, bukan SDK atau infrastruktur produksi. Seluruh 20 bahasa memiliki pesan antarmuka dan delapan kasus yang lengkap; 19 terjemahan selain bahasa Inggris masih **beta dan belum ditinjau oleh pakar penutur asli**. Bahasa antarmuka dan lensa kode dapat dipilih secara terpisah. Tujuh lensanya adalah **Go, TypeScript, Python, Java, PHP, C, C++**. Antarmuka Next.js/React diekspor sebagai berkas statis saat dibangun dan disematkan ke satu berkas eksekusi Go. Saat berjalan, tidak diperlukan server Node, basis data, direktori konten, atau layanan terjemahan. Preferensi dan kemajuan hanya tersimpan di peramban.

## Dokumentasi dan kontribusi

Dokumentasi teknis saat ini berbahasa Inggris: [indeks](docs/README.md), [panduan penerjemahan](docs/localization/translation-guide.md), [panduan penulisan kasus](docs/cases/authoring-guide.md), [panduan kontribusi lensa kode](docs/code-lenses/contributing.md), dan [lisensi MIT](LICENSE).
