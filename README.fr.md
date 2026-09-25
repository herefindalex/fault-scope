# FaultScope

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) ·
[Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) ·
[Nederlands](README.nl.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [Українська](README.uk.md) · [Русский](README.ru.md) ·
[العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [Bahasa Indonesia](README.id.md)

**Un laboratoire interactif pour comprendre la correction des applications distribuées.**

FaultScope part des preuves disponibles et des contrats du système pour déterminer ce qui reste garanti après une panne. Chaque cas précise d’abord la propriété à préserver, puis la frontière où agir.

![FaultScope: Les huit cas publiés dans l’interface en anglais](docs/images/cases-en.png)

*Les huit cas publiés dans l’interface en anglais.*

## Explorer les huit cas

1. [Faut-il le renvoyer ?](docs/cases/fs-c01.md) — La réponse n’arrive pas, mais la VM existe peut-être déjà. Le contrat détermine la suite possible.
2. [A peut-il encore enregistrer son résultat ?](docs/cases/fs-c02.md) — Worker B a repris Job J, mais Worker A tourne encore. Le contrôle effectué par le Job Store détermine si le résultat de A peut compter.
3. [La commande est confirmée. Où est Event E ?](docs/cases/fs-c03.md) — Order42 est CONFIRMED dans PostgreSQL, mais le processus plante avant de publier Event E. Quel enregistrement durable permettra encore de le publier ?
4. [Le consommateur a terminé. Pourquoi a-t-il recommencé ?](docs/cases/fs-c04.md) — La récompense a été validée, mais l’accusé de réception manque : le même événement peut être livré à nouveau.
5. [Quel événement est vraiment le plus récent ?](docs/cases/fs-c05.md) — Un événement livré plus tard peut représenter un état plus ancien. La révision définie par la source ordonne les changements d’un même envoi.
6. [La lecture a réussi. Les données sont-elles assez récentes ?](docs/cases/fs-c06.md) — Une réponse valide peut être trop ancienne pour cet appelant. La lecture doit exiger au minimum la révision validée par l’écriture.
7. [L’annulation a-t-elle vraiment arrêté le travail ?](docs/cases/fs-c07.md) — Le signal d'annulation est arrivé, mais un transfert de résultats peut rester bloqué. Trouvez l'opération qui doit participer.
8. [Il a redémarré. Qu’a-t-il oublié ?](docs/cases/fs-c08.md) — Shipment42 est encore SHIPPED après le crash, mais le garde-fou fondé sur la révision a disparu.

Chaque cas propose les modes Guidé, Défi et Analyse approfondie, une visualisation dédiée, un panneau Preuves / Contrat / Propriété et sept vues du code. La progression est conservée par cas dans le navigateur.

## Lancer FaultScope

Vous pouvez lancer la version distribuée avec `./faultscope`. Pour compiler la version préliminaire actuelle depuis les sources :

```bash
go run ./tools build
./dist/faultscope
```

Ouvrez [http://localhost:8080/](http://localhost:8080/). Par défaut, `:8080` écoute sur toutes les interfaces. Utilisez `./dist/faultscope --listen 127.0.0.1:9000` ou `FAULTSCOPE_LISTEN=127.0.0.1:9000` pour choisir une autre adresse ; l’option de la ligne de commande est prioritaire. La compilation demande Node 24 et pnpm 12 ; consultez le [guide de démarrage](docs/development/getting-started.md).

## État et architecture

Il s’agit d’une **version préliminaire `0.0.x`** avec les cas 01–08 publiés. Les exemples de VM, tâches, commandes, messages et récompenses sont des modèles pédagogiques, pas des SDK ni une infrastructure de production. Les 20 langues disposent de tous les messages de l’interface et des huit cas ; les 19 traductions hors anglais restent en **bêta, sans validation par des spécialistes de langue maternelle**. La langue de l’interface et la vue du code se choisissent séparément. Sept vues sont disponibles : **Go, TypeScript, Python, Java, PHP, C et C++**. Le frontal Next.js/React est exporté en fichiers statiques et intégré à un seul exécutable Go. À l’exécution, aucun serveur Node, base de données, répertoire de contenu ou service de traduction n’est nécessaire. Préférences et progression restent dans le navigateur.

## Documentation et contributions

La documentation technique est actuellement en anglais : [index](docs/README.md), [guide de traduction](docs/localization/translation-guide.md), [guide de rédaction des cas](docs/cases/authoring-guide.md), [contribution aux vues du code](docs/code-lenses/contributing.md) et [licence MIT](LICENSE).
