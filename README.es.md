# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Laboratorio interactivo para aprender a razonar sobre la corrección de aplicaciones distribuidas.**

FaultScope parte de la evidencia y de los contratos del sistema para preguntar qué puede garantizarse después de un fallo. Cada caso aclara primero la propiedad que debe mantenerse y luego busca el límite donde hace falta intervenir.

## Explora los ocho casos

1. [¿Deberías enviarlo de nuevo?](docs/cases/fs-c01.md) — La respuesta no llegó, pero quizá la VM ya exista. El contrato determina qué puedes hacer ahora.
2. [¿Puede A confirmar su resultado después de que B asumió el trabajo?](docs/cases/fs-c02.md) — Worker B se hizo cargo de Job J, pero Worker A sigue ejecutándose. La comprobación en Job Store decide si el resultado de A cuenta.
3. [El pedido quedó confirmado. ¿Dónde está Event E?](docs/cases/fs-c03.md) — Order42 ya figura como CONFIRMED en PostgreSQL, pero el proceso falla antes de publicar Event E. ¿Qué registro persistente permitirá publicarlo después?
4. [El consumidor terminó. ¿Por qué se ejecutó otra vez?](docs/cases/fs-c04.md) — Una recompensa comprometida y un reconocimiento faltante pueden hacer que un evento lógico llegue dos veces.
5. [¿Qué evento es realmente más reciente?](docs/cases/fs-c05.md) — Una entrega posterior puede contener un estado anterior. La revisión fijada por la fuente ordena los cambios de un mismo envío.
6. [La lectura se completó. ¿Los datos son suficientemente recientes?](docs/cases/fs-c06.md) — Una respuesta satisfactoria puede ser demasiado antigua para esta solicitud. La lectura debe exigir, como mínimo, la revisión confirmada por la escritura.
7. [¿La cancelación detuvo realmente el trabajo?](docs/cases/fs-c07.md) — Llegó la señal de cancelación, pero la transferencia de resultados puede permanecer bloqueada. Encuentra la operación que debe participar.
8. [Se reinició. ¿Qué olvidó?](docs/cases/fs-c08.md) — Shipment42 sigue en estado SHIPPED tras el fallo, pero desapareció la revisión que impedía aplicar eventos antiguos.

Cada caso ofrece los modos Guiado, Desafío y Análisis profundo, una visualización propia, un panel de Evidencia / Contrato / Propiedad y siete perspectivas de código. El progreso de cada caso se guarda en el navegador.

## Ejecutar FaultScope

Puedes ejecutar la versión distribuida con `./faultscope`. Para compilar la versión preliminar actual desde el código fuente:

```bash
go run ./tools build
./dist/faultscope
```

Abre [http://localhost:8080/](http://localhost:8080/). Por defecto, `:8080` escucha en todas las interfaces. Usa `./dist/faultscope --listen 127.0.0.1:9000` o `FAULTSCOPE_LISTEN=127.0.0.1:9000` para elegir otra dirección; prevalece la opción de línea de comandos. La compilación requiere Node 24 y pnpm 12; consulta la [guía de inicio](docs/development/getting-started.md).

## Estado y arquitectura

Esta es una **versión preliminar `0.0.x`** con los casos 01–08 publicados. Los ejemplos de VM, trabajos, pedidos, mensajes y recompensas son modelos didácticos, no SDK ni infraestructura de producción. Los 20 idiomas tienen todos los mensajes de la interfaz y de los ocho casos; las 19 traducciones no inglesas siguen en **beta, sin revisión de especialistas nativos**. El idioma de la interfaz y la perspectiva de código se eligen por separado. Hay siete perspectivas: **Go, TypeScript, Python, Java, PHP, C y C++**. La interfaz Next.js/React se exporta como archivos estáticos durante la compilación y se incluye en un único ejecutable Go. En ejecución no se necesitan servidor Node, base de datos, directorio de contenido ni servicio de traducción. Las preferencias y el progreso solo se guardan en el navegador.

## Documentación y colaboración

La documentación técnica está actualmente en inglés: [índice](docs/README.md), [guía de traducción](docs/localization/translation-guide.md), [guía para crear casos](docs/cases/authoring-guide.md), [contribución a las perspectivas de código](docs/code-lenses/contributing.md) y [licencia MIT](LICENSE).
