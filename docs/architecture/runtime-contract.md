# Runtime contract

The executable listens on `:8080` by default, which means **all network
interfaces**, not localhost only. Address precedence is `--listen`,
`FAULTSCOPE_LISTEN`, then `:8080`. Use a loopback address explicitly when
local-only binding matters.

| Route | Methods | Result |
| --- | --- | --- |
| `/healthz` | GET, HEAD | `200`; plain `ok` body for GET |
| `/api/version` | GET, HEAD | `200`; JSON version, commit, and bundled counts/hash when available |
| Static exported routes and assets | GET, HEAD | `200` when embedded file exists |
| Unknown path | GET, HEAD | Actual `404`; no SPA fallback |
| Unsupported mutation method | Other methods | `405` with `Allow: GET, HEAD` |

HTML uses `Cache-Control: no-cache`. Hashed `/_next/static/` assets use
`public, max-age=31536000, immutable`. Health and version responses use
`no-store`. Responses set `X-Content-Type-Options: nosniff`. The server has
bounded read/write/idle timeouts and a 10-second graceful shutdown on SIGINT
or SIGTERM.

The site and Cases are read-only public content. The runtime has no account,
server-side learner persistence, upload, arbitrary shell execution, or
outbound content fetch. Browser storage holds learner progress and preferences.
See [security scope](../project/security.md).

The all-interface default supports containers and reverse proxies; it does
not supply TLS. See [deployment](../operations/deployment.md) for bind examples.
