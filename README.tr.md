# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Dağıtık uygulama doğruluğunu öğrenmek için etkileşimli laboratuvar.**

FaultScope, bir hatadan sonra nelerin hâlâ garanti edilebildiğini anlamak için kanıtlardan ve sistem sözleşmelerinden yola çıkar. Her vaka önce korunması gereken özelliği belirler, ardından müdahale edilmesi gereken sınırı arar.

## Sekiz vakayı keşfedin

1. [Yeniden göndermeli misiniz?](docs/cases/fs-c01.md) — Yanıt gelmedi ama VM çoktan oluşturulmuş olabilir. Sonraki güvenli adımı sözleşme belirler.
2. [B devraldıktan sonra A hâlâ sonuç yazabilir mi?](docs/cases/fs-c02.md) — Worker B, Job J görevini devraldı; ancak A çalışmaya devam ediyor. A’nın sonucunun geçerli olup olmadığını Job Store içindeki denetim belirler.
3. [Sipariş onaylandı. Event E nerede?](docs/cases/fs-c03.md) — Order42, PostgreSQL üzerinde CONFIRMED durumunda; ancak süreç Event E yayımlanmadan önce çöktü. E’nin sonra yayımlanmasını hangi kalıcı kayıt sağlayacak?
4. [Tüketici işini bitirdi. Neden yeniden çalıştı?](docs/cases/fs-c04.md) — Taahhüt edilen bir ödül ve eksik bir onay, bir mantıksal olayın iki kez gerçekleşmesine neden olabilir.
5. [Hangi olay gerçekten daha yeni?](docs/cases/fs-c05.md) — Daha sonraki bir teslimat eski durumu taşıyabilir. Bir gönderide değişiklik yapılmasını emreden yetkiliyi bulun.
6. [Okuma başarılı. Veriler yeterince güncel mi?](docs/cases/fs-c06.md) — Başarılı bir yanıt bu arayan için hâlâ çok eski olabilir. Taahhüt edilen revizyonu okuma sözleşmesine taşıyın.
7. [İptal işlemi işi gerçekten durdurdu mu?](docs/cases/fs-c07.md) — İptal sinyali geldi ancak sonuç aktarımı engellenmiş durumda kalabilir. Katılması gereken işlemi bulun.
8. [Yeniden başladı. Neyi unuttu?](docs/cases/fs-c08.md) — Shipment42 bir kazadan sonra hala SHIPPED diyor. Onu koruyan revizyon koruması gitti.

Her vakada Rehberli, Meydan Okuma ve Derinlemesine İnceleme modları, vakaya özgü bir görselleştirme, Kanıt / Sözleşme / Özellik paneli ve yedi kod görünümü bulunur. İlerleme her vaka için tarayıcıda saklanır.

## FaultScope’u çalıştırın

Yayımlanan sürümü `./faultscope` ile çalıştırabilirsiniz. Güncel önizlemeyi kaynak koddan derlemek için:

```bash
go run ./tools build
./dist/faultscope
```

[http://localhost:8080/](http://localhost:8080/) adresini açın. Varsayılan `:8080` tüm ağ arayüzlerini dinler. Başka bir adres için `./dist/faultscope --listen 127.0.0.1:9000` veya `FAULTSCOPE_LISTEN=127.0.0.1:9000` kullanın; komut satırı seçeneği önceliklidir. Kaynaktan derleme için Node 24 ve pnpm 12 gerekir. [Geliştirme rehberine](docs/development/getting-started.md) bakın.

## Durum ve mimari

Bu, 01–08 vakalarını içeren bir **`0.0.x` önizlemesidir**. VM, iş, sipariş, mesaj ve ödül örnekleri öğretim amaçlı modellerdir; üretim SDK’ları veya altyapısı değildir. 20 dilin tümünde arayüz ve sekiz vaka mesajları eksiksizdir; İngilizce dışındaki 19 çeviri **ana dili konuşan teknik uzmanlarca incelenmemiş beta sürümleridir**. Arayüz dili ile kod görünümü ayrı ayrı seçilir. Yedi görünüm: **Go, TypeScript, Python, Java, PHP, C ve C++**. Next.js/React arayüzü derleme sırasında statik dosyalara dönüştürülüp tek bir Go çalıştırılabilir dosyasına gömülür. Çalışma sırasında Node sunucusu, veritabanı, içerik dizini veya çeviri hizmeti gerekmez. Tercihler ve ilerleme yalnızca tarayıcıda tutulur.

## Belgeler ve katkı

Teknik belgeler şu anda İngilizcedir: [dizin](docs/README.md), [çeviri rehberi](docs/localization/translation-guide.md), [vaka yazma rehberi](docs/cases/authoring-guide.md), [kod görünümlerine katkı](docs/code-lenses/contributing.md) ve [MIT lisansı](LICENSE).
