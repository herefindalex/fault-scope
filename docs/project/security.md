# Security scope

The current Go runtime serves immutable, public teaching content with two
read-only API routes: `/healthz` and `/api/version`. It has no accounts,
private server data, uploads, mutation API, runtime content editing, or
arbitrary shell command endpoint. Learner progress and preferences are held
in browser storage. There is no runtime fetch of canonical Cases from an
external service.

The server applies bounded HTTP timeouts, actual unknown-route `404`s,
method `405`s, MIME handling, and `X-Content-Type-Options: nosniff`.
The default `:8080` listens on all interfaces; operators decide whether to
bind loopback, place a TLS proxy in front, and supervise the process. These
properties reduce surface but do not establish a security guarantee or a
completed security audit. A CSP is not claimed.

Build-time dependencies and the seven language fixtures are contributor and
release surfaces. Review changes to them before publishing an artifact.
For private vulnerability reporting, follow [SECURITY.md](../../SECURITY.md).
See [deployment](../operations/deployment.md) and
[runtime contract](../architecture/runtime-contract.md).
