# How to run FaultScope

A bundled release is one executable with public, read-only content. It needs
no runtime Node, pnpm, database, content directory, or translation service.
There is no repository Dockerfile at present.

## Native binary

```bash
./faultscope
```

For a local source build, run `./dist/faultscope` instead. The default listen
address is `:8080`, on **all interfaces**. Check `http://localhost:8080/`
and `http://localhost:8080/healthz` from the host.

## Custom bind

```bash
./faultscope --listen :9000
FAULTSCOPE_LISTEN=127.0.0.1:9000 ./faultscope
```

`--listen` overrides `FAULTSCOPE_LISTEN`; both override `:8080`. Use an
explicit loopback address when a local reverse proxy is the only intended
client.

## Reverse proxy

An optional nginx, Caddy, or Traefik proxy can terminate TLS and forward
requests to FaultScope. Preserve paths and trailing slashes so static deep
links still resolve. The Go server itself does not provide TLS. Set
`FAULTSCOPE_SITE_URL` to the public origin **when building** to emit correct
canonical, alternate, and sitemap URLs; setting it only on the running
binary does not change embedded metadata.

```text
Internet → optional TLS reverse proxy → faultscope:8080
```

The same binary can run under ordinary process supervision or in a container
image you create. No container build file is currently supplied. See the
[runtime contract](../architecture/runtime-contract.md),
[build guide](../build/build.md), and [troubleshooting](troubleshooting.md).
