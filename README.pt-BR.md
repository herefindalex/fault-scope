# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Laboratório interativo para aprender sobre a correção de aplicações distribuídas.**

O FaultScope parte das evidências e dos contratos do sistema para investigar o que ainda pode ser garantido após uma falha. Em cada caso, primeiro identificamos a propriedade a preservar e depois a fronteira que precisa de correção.

## Explore os oito casos

1. [Você deve enviar novamente?](docs/cases/fs-c01.md) — A resposta não chegou, mas a VM talvez já exista. O contrato determina o que você pode fazer agora.
2. [A ainda pode gravar o resultado depois que B assumiu?](docs/cases/fs-c02.md) — Worker B assumiu Job J, mas A continua em execução. A verificação feita pelo Job Store decide se o resultado de A pode valer.
3. [O pedido foi confirmado. Onde está Event E?](docs/cases/fs-c03.md) — Order42 está CONFIRMED no PostgreSQL, mas o processo falha antes de publicar Event E. Que registro durável permitirá publicá-lo depois?
4. [O consumidor terminou. Por que executou de novo?](docs/cases/fs-c04.md) — Uma recompensa comprometida e uma falta de reconhecimento podem fazer com que um evento lógico chegue duas vezes.
5. [Qual evento é realmente mais recente?](docs/cases/fs-c05.md) — Uma entrega posterior pode levar a um estado mais antigo. Encontre a autoridade que solicita alterações em uma remessa.
6. [A leitura deu certo. Os dados estão atualizados o suficiente?](docs/cases/fs-c06.md) — Uma resposta bem-sucedida ainda pode ser muito antiga para esse chamador. Leve a revisão confirmada para o contrato de leitura.
7. [O cancelamento realmente interrompeu o trabalho?](docs/cases/fs-c07.md) — O sinal de cancelamento chegou, mas uma transferência de resultado pode permanecer bloqueada. Encontre a operação que deve participar.
8. [O sistema reiniciou. O que ele esqueceu?](docs/cases/fs-c08.md) — Shipment42 ainda diz SHIPPED após uma falha. A proteção de revisão que o protegia desapareceu.

Cada caso oferece os modos Guiado, Desafio e Aprofundamento, uma visualização própria, um painel Evidência / Contrato / Propriedade e sete perspectivas de código. O progresso de cada caso fica salvo no navegador.

## Execute o FaultScope

Execute a versão distribuída com `./faultscope`. Para compilar a versão de prévia atual a partir do código-fonte:

```bash
go run ./tools build
./dist/faultscope
```

Abra [http://localhost:8080/](http://localhost:8080/). Por padrão, `:8080` escuta em todas as interfaces. Use `./dist/faultscope --listen 127.0.0.1:9000` ou `FAULTSCOPE_LISTEN=127.0.0.1:9000` para escolher outro endereço; a opção da linha de comando tem prioridade. A compilação exige Node 24 e pnpm 12; consulte o [guia de desenvolvimento](docs/development/getting-started.md).

## Estado atual e arquitetura

Esta é uma **prévia `0.0.x`** com os casos 01–08 publicados. Os exemplos de VMs, tarefas, pedidos, mensagens e recompensas são modelos didáticos, não SDKs nem infraestrutura de produção. Os 20 idiomas têm mensagens completas para a interface e os oito casos; as 19 traduções que não são em inglês ainda são **beta, sem revisão por especialistas nativos**. O idioma da interface e a perspectiva de código são independentes. Há sete perspectivas: **Go, TypeScript, Python, Java, PHP, C e C++**. A interface Next.js/React é exportada como arquivos estáticos e incorporada em um único executável Go. Na execução, não são necessários servidor Node, banco de dados, diretório de conteúdo ou serviço de tradução. Preferências e progresso ficam apenas no navegador.

## Documentação e contribuição

A documentação técnica está em inglês: [índice](docs/README.md), [guia de tradução](docs/localization/translation-guide.md), [guia para escrever casos](docs/cases/authoring-guide.md), [contribuição para perspectivas de código](docs/code-lenses/contributing.md) e [licença MIT](LICENSE).
