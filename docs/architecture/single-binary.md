# Why one Go binary

**Build-time complexity does not become runtime complexity.** Faultscope uses
Node 24, pnpm, Next.js, and several language toolchains to prepare and test
content, but the production artifact is one Go executable with an embedded
static site.

This makes a build's backend metadata and learner-facing content travel
together. Deployment and rollback replace one artifact, without matching a
separate frontend package to a server version. A self-hosted instance does not
need a content directory, database, or Node server. Startup checks the
embedded manifest and content hash rather than assuming the files match.

The trade-off is a larger executable and a rebuild for every published text,
translation, or frontend change. Build prerequisites are broader than runtime
prerequisites. Browser preferences and progress stay local to each browser;
this architecture does not provide cross-device sync. A single binary also
does not remove the need for ordinary hosting choices such as TLS, process
supervision, and monitoring.

See the [build sequence](../build/build.md),
[provenance invariant](build-provenance.md), and
[deployment examples](../operations/deployment.md).
