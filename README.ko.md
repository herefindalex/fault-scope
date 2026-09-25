# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**분산 애플리케이션의 정확성을 배우는 대화형 실습실.**

FaultScope는 주어진 증거와 시스템 계약을 바탕으로 장애 후에 무엇을 보장할 수 있는지 살펴봅니다. 각 사례에서 지켜야 할 성질을 먼저 밝히고, 실제로 수정해야 할 경계를 찾습니다.

![FaultScope: 영어 화면에 표시된 공개 사례 8개](docs/images/cases-en.png)

*영어 화면에 표시된 공개 사례 8개.*

## 사례 8개 살펴보기

1. [다시 보내야 할까요?](docs/cases/fs-c01.md) — 응답이 없더라도 VM은 이미 만들어졌을 수 있습니다. 다음에 무엇을 할 수 있는지는 계약에 달려 있습니다.
2. [B가 넘겨받은 뒤에도 A의 결과를 저장할 수 있을까요?](docs/cases/fs-c02.md) — Worker B가 Job J를 넘겨받았지만 A는 계속 실행 중입니다. A의 결과를 유효하게 할지는 Job Store의 검사 규칙이 결정합니다.
3. [주문은 확정됐는데 Event E는 어디 있나요?](docs/cases/fs-c03.md) — PostgreSQL에서 Order42가 CONFIRMED가 된 뒤 Event E를 발행하기 전에 프로세스가 중단됐습니다. 나중에 E를 발행할 수 있도록 남은 기록은 무엇일까요?
4. [컨슈머는 처리를 마쳤는데 왜 다시 실행됐을까?](docs/cases/fs-c04.md) — 커밋된 보상과 누락된 승인으로 인해 하나의 논리적 이벤트가 두 번 도착할 수 있습니다.
5. [실제로 더 최신인 이벤트는 무엇일까?](docs/cases/fs-c05.md) — 이후 전달에는 이전 상태가 포함될 수 있습니다. 하나의 배송으로 변경을 주문한 기관을 찾으세요.
6. [읽기는 성공했습니다. 데이터는 충분히 최신인가요?](docs/cases/fs-c06.md) — 이 호출자에게는 성공적인 응답이 아직 너무 오래되었을 수 있습니다. 커밋된 개정을 읽기 계약에 포함합니다.
7. [취소하면 작업이 정말 멈출까?](docs/cases/fs-c07.md) — 취소 신호가 도착했지만 결과 핸드오프가 계속 차단될 수 있습니다. 참여해야 하는 작업을 찾습니다.
8. [다시 시작됐습니다. 무엇을 잊었을까요?](docs/cases/fs-c08.md) — Shipment42은 충돌 후에도 여전히 SHIPPED이라고 말합니다. 이를 보호했던 개정 가드가 사라졌습니다.

각 사례에는 안내, 도전, 심화 모드와 사례별 시각화, 증거·계약·성질을 정리하는 패널, 코드 렌즈 7개가 있습니다. 학습 진도는 사례별로 브라우저에 저장됩니다.

## FaultScope 실행

배포된 바이너리는 `./faultscope`로 실행할 수 있습니다. 현재 미리보기 버전을 소스에서 빌드하려면 다음을 실행하세요.

```bash
go run ./tools build
./dist/faultscope
```

[http://localhost:8080/](http://localhost:8080/)을 여세요. 기본 주소 `:8080`은 모든 네트워크 인터페이스에서 수신합니다. `./dist/faultscope --listen 127.0.0.1:9000` 또는 `FAULTSCOPE_LISTEN=127.0.0.1:9000`으로 주소를 바꿀 수 있으며 명령줄 옵션이 우선합니다. 소스 빌드에는 Node 24와 pnpm 12가 필요합니다. [개발 환경 안내](docs/development/getting-started.md)를 참고하세요.

## 현재 상태와 구조

현재 **`0.0.x` 미리보기 버전**이며 사례 01–08이 공개되어 있습니다. VM, 작업, 주문, 메시지, 보상 예시는 교육용 모델로, 운영용 SDK나 인프라가 아닙니다. 20개 언어의 UI와 사례 8개의 메시지는 모두 준비되어 있지만, 영어를 제외한 19개 언어는 **전문가인 원어민의 검토를 거치지 않은 베타 번역**입니다. 화면 언어와 코드 렌즈는 별도로 선택할 수 있습니다. 코드 렌즈는 **Go, TypeScript, Python, Java, PHP, C, C++**를 지원합니다. Next.js/React 화면은 빌드 시 정적 파일로 출력되며, 실행할 때는 Go 바이너리 하나만 필요합니다. Node 서버, 데이터베이스, 콘텐츠 디렉터리, 번역 서비스는 필요하지 않습니다. 설정과 학습 진도는 브라우저에만 저장됩니다.

## 문서와 기여

기술 문서는 현재 영어로 제공됩니다. [문서 목차](docs/README.md), [번역 기여 안내](docs/localization/translation-guide.md), [사례 작성 안내](docs/cases/authoring-guide.md), [코드 렌즈 기여 안내](docs/code-lenses/contributing.md), [MIT 라이선스](LICENSE)를 참고하세요.
