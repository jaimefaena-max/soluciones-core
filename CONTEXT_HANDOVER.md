# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-12-a

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-09-13`. Fuente de verdad de la llave GPG: `STATE.md`.
> Telemetría `2026-09-12-a` publicada (453,8 min activos · $264.717 CLP), verificada en `/health`.

---

## 1. Qué se cerró (todo verificado en producción, no «escrito»)

| Frente | Evidencia |
|---|---|
| **Fase D GPG cerrada**: 3 shards de `9632DDAB…` a Francisco, María y Ramón en 3 soportes, sha256 en destino, locales destruidos | `~/.zasa-shards/DISTRIBUCION.md` 3/3 🟢 |
| **Perímetro**: `/api/sales-agent/tenants` cerrado · CSP + Permissions-Policy en vip y admin · IP real de Cloudflare (`conf.d/cloudflare-real-ip.conf`) → los límites por IP vuelven a contar · `API_SECRET_TOKEN` y `EDGE_SECRET` rotados tras imprimirlos por error en el chat | robot `audit:vip --strict` **40/40** en CI (monitor 15 min + post-deploy) |
| **Auth**: rate limit unificado (5/min, 429 JSON) · JWT estricto + fail-fast · revocación stateful de sesiones (rotar clave = cerrar todas) | `tests/authRateLimit`, `clienteAuthZeroTrust`, `sesionRevocacion` |
| **Refactor `src/core`** (DIP, puertos fail-closed, shims) · **Facturación Fase 2** (tabla `billing_statements`) | `0712d88`, `760f20b` |
| **Portal VIP operativo para FORTE**: ojo en contraseñas, reglas «letras y números (mín. 6)», canje sin contraseña actual, `RBAC_ADMIN_TOKENS` | confirmado por Jaime: «quedó perfecto» |
| **Módulo Novedades**: Cockpit `/portal/novedades` → portal del cliente con adjuntos (lista blanca por firma binaria, fuera del web root, proxy autenticado), acuse de lectura | orquestador `1e5c526`+`fbd498a`, SPA `f9c2288`; **E2E 22/22 como FORTE** en producción y purga de la novedad de prueba; 868 tests |
| **Correo al fijar/cambiar contraseña** (Resend): bienvenida / aviso de seguridad, maquetación por tablas, **BCC de supervisión** a Jaime | `2857a88`; 12 tests; `CORREO_SUPERVISION_BCC` para redirigir/apagar |

Repos: `zasa-orchestrator` HEAD `7661a6f` (telemetría) · `admin_solucionesconia` `f9c2288` desplegado a `/opt/agencia/public/vip` (sha256 26/26) · raíz este commit. Todo en `origin/main`.

## 2. Paso exacto siguiente

**Jaime cambia la contraseña de FORTE una vez** (portal → «Contraseña de acceso») y confirma
que llegan **dos correos**: el aviso al cliente y la copia oculta a su Gmail. Es la única
verificación que Claude no puede hacer. Si no llega en 2 min: spam, y luego
`pm2 logs zasa-orchestrator | grep correoService` (registra el motivo, nunca el destinatario).

## 3. Cola (menor, nada bloquea)

1. `apt` + reinicio del VPS (59 paquetes desde el 11-sep) — tarea `cockpit-hardening-perimetro-pendiente` al 90 %.
2. Decidir el seed de $30.000 CLP de FORTE en producción (`scripts/seed-facturacion.ts`, idempotente).
3. Certificado de revocación GPG fuera del portátil.
4. `shard-2` de la clave VIEJA (entregado 09-06) y carpeta `zasa-shard-1\` vieja del pendrive de Francisco: recuperar y destruir.

## 4. Trampas descubiertas (no volver a tropezar)

1. **`fetch` de Node descarta la cabecera `Host`** (undici): una sonda por loopback cae en el vhost por defecto (admin, Basic Auth → 401) y parece un fallo de auth. Usar `https.request` con `Host` + `servername`, o `curl -H 'Host:'`. Costó 8 falsos fallos en el E2E.
2. Node del sistema en el VPS es **v18**; PM2 corre con `/opt/node20`. Scripts de prueba: `NODE_PATH=…/app/node_modules /opt/node20/bin/node` y `require` por ruta absoluta.
3. `sed -i "/location \/api\/ {/a …"` sin escapar barras rompió el vhost de vip; `nginx -t` lo paró antes del reload. Editar nginx con python, siempre con backup.
4. La clave de Resend es **solo envío**: `GET /api-keys` → 401 `restricted_api_key` es normal.
5. Sesión de cliente para pruebas en producción: emitirla con `dist/core/auth/clienteAuth.js` en el VPS y **revocarla en un `finally`**; el token no se imprime. Receta en la memoria `modulo-novedades-clientes`.
6. `tsconfig.check.json` incluye `tests/`: vitest no tipa, `npm run typecheck` sí — correr ambos antes de commitear.

## 5. Secretos y credenciales

Ninguno en el repo ni en el chat de esta parte de la sesión. Los dos que se imprimieron el
12-sep de madrugada están ROTADOS (memoria `incidente-secretos-borde-en-chat-2026-09-12`).
Regla vigente: filtrar `hex≥40` y `proxy_set_header (Authorization|X-Edge-Proof)` al volcar nginx.
