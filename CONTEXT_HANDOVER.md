# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-10-06-a (Portal VIP Zero Trust)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-10-07` en `~/.claude/projects/C--Proyectos/memory/`.
> Sesión del 2026-10-06, de 10:30 a 20:04 UTC: **436,8 min activos**, **$254.800 CLP**.
> Telemetría `2026-10-06-a` en `zasa-orchestrator` `66aa65d` (la del 05-oct: `2026-10-05-a` y `2026-10-05-b`).

---

## 0 · Lo que deja la sesión (todo en producción y verificado)

| Qué | Dónde | Verificación |
|---|---|---|
| **Refactor de identidad del Portal VIP CERRADO**: `tokenFirmado`, `cookieCliente`, `sesiones`, `revocacion` y `guard` extraídos de `clienteAuth.ts` a `src/modulos/portal-vip/identidad/` + `index.ts` (API pública explícita de 29 símbolos). `clienteAuth.ts` queda como fachada sin imports | `zasa-orchestrator` `f407467` → `3f6e4c4` | Movimientos puros (sha256 idéntico a HEAD; única diferencia: `export function huella`, interno). Cada pieza: 1.847 tests, `/health`, smoke 401, 0 errores, 0 `vip-clave-rotada` |
| **Hardening de `tokenFirmado`**: HMAC antes de `JSON.parse`; `exp − iat ≤ TTL` | `702a4e1` | 6 tests nuevos (4 fallan contra el código viejo); suite 1.853 ✓ |
| **Brecha 8**: `/acceso` con `acceso.js`/`acceso.css` externos y `location ^~ /acceso/` con CSP estricta (sin `unsafe-inline` ni unpkg; único tercero: beacon de Cloudflare) | `solucionesconia` `3602280` + snippet `vip-portal.conf` | Chromium real: 0 violaciones, login → 401 correcto. Respaldos: `/root/backups-solucionesconia/acceso-20261006-161855`, `/root/backups-nginx/*.2026-10-06-161951` |
| **Brecha 5**: descargas de la SPA por el interceptor (`httpClient.descargar` + `guardarBlob`) | `admin_solucionesconia` `6b81051` | 40 comprobaciones contra el código real |
| **Login de vip.**: el 401 llega como `HttpError` → «Usuario o contraseña incorrectos.» (antes «No se pudo contactar», bug de agosto `d009ff2`) | `836a29b` | Bundle de vip. con la rama nueva |
| **Widget de Sofía aislado de la sesión de la SPA**: `httpClientWidget` sobre `src/api/httpCore.ts` (sin cookies, sin Authorization, sin política de sesión; no importa `src/auth/`) | `67edb57` | Chromium + 401 SIMULADO en `/api/sales-agent/chat`: la web del cliente no navega, su `sessionStorage` intacto, mensaje propio del widget, solo viaja `X-Widget-Token` |
| **Contraseña de `admin` restablecida** (los 401 eran contraseña incorrecta; usuario activo, rol admin) | tabla `usuarios` + `audit_log rbac.admin.restablecido` | Jaime entró a las 18:19 UTC; la contraseña nunca pasó por el chat; fichero temporal destruido |
| **`SALES_WEBHOOK_URL`** (agente «Notificación de leads», en error desde el 23-sep): estaba 3 veces y la vigente era la URL en formato Markdown `[url](url)` | `/opt/zasa-orchestrator/.env` (respaldo `/root/backups-env/.env.2026-10-06-182908`) | Una sola línea, `pm2 restart`, URL válida, host propio → lleva Bearer; resto del `.env` idéntico por sha256 |
| **Meta llega al origen** (GambusasChile): handshake 200 desde IP de Meta (01-oct) y POST firmado aceptado desde `69.63.184.3` (04-oct) | logs nginx + `webhook-wa-2026-10.log` | `gam-cloudflare-skip-webhook-wa` cerrada: no hace falta regla Skip |
| `config.php` de Gambusas (respaldo `predeploy-20261004-040711`): Jaime lo dio por auditado; ya no existe | VPS | Claude solo comprobó la ausencia |
| yami-spa **canjeada** (`password_temporal = 0`, activa); `/root/invitacion-yami-spa.txt` destruido con `shred` | VPS | Lectura con `fichaDe`, sin tocar la cuenta |
| `gh` CLI instalado y autenticado (`jaimefaena-max`, scope `workflow`); `gh auth setup-git`: Git usa `gh` como helper para github.com | portátil | `C:\Program Files\GitHub CLI\gh.exe` |

### 0.b · Añadido el 2026-10-07 (yami-spa + nginx de vip.)

| Qué | Dónde | Verificación |
|---|---|---|
| **Ficha de yami-spa ACTIVA**: 8 hitos (3 completados), 38 % de avance, paso actual «Firma notarial de escritura y comodato (programada: viernes)». Escrita por `validarCambios` → `guardarPortal` dentro del orquestador compilado (no por HTTP: el `PUT /api/admin/portals/:slug` exige credencial de admin) | tabla `client_portals`; origen `privado_agencia/Clientes/yami-spa/state/ficha_portal.put.json`; actor `claude:sync-ficha-2026-10-07` | 201 (no había ficha; respaldo vacío en `/root/backups-portales/yami-spa-2026-10-07T14-09-08-662Z.json`); relectura con `obtenerPortal`: 8/3/38 |
| **Logo oficial PNG** en el catálogo del portal (`logoUrl` → `/clientes/assets/clientes/yami-spa/logo.png`; el `logo.svg` provisional queda sin uso) | `zasa-orchestrator` `e061779` | Actions success + `/health` = `e061779` |
| **Logo optimizado**: 1254 px / 1,7 MB → 400 px / **220 KB** (RGBA; la versión en paleta de 72 KB perdía la transparencia y se descartó) | `c932f5b` | Actions success + `/health` = `c932f5b`; vía Cloudflare 200 `image/png` 225 192 B |
| **`/clientes/assets/` en vip. reparado**: devolvía el `index.html` de la SPA (logo, `portal.css` y `ds-v2/*` como HTML de 548 B). Bloque `location ^~ /clientes/assets/` copiado A MANO del snippet `vip-portal.conf` al vhost (líneas 176–193, upstream `$orq`), sin tocar `/api/` | `/etc/nginx/sites-available/vip.solucionesconia.cl` (respaldo `/root/backups-nginx/vip.solucionesconia.cl.20261007T153851Z`) | `nginx -t` ok + reload (ejecutado por Jaime); loopback y Cloudflare: logo `image/png`, CSS `text/css`; `/` y `/api/` sin cambios; sondas de traversal → 401 |

---

## 1 · Abierto, por cercanía a producción

1. 🔴 **Verificaciones que solo da el uso real** (no forzarlas con datos falsos):
   - Una descarga real con sesión de operador en vip. (Novedades o Portales) → cierra la brecha 5 al 100 %.
   - Un cliente real entrando al portal tras el hardening (200 en `/api/vip/*/verificar|perfil` en `access.log` después de las 15:23 UTC del 06-oct).
   - `ag-webhooks` en verde con la próxima reserva real de Sofía; además limpiar el lead y el evento de Calendar de la prueba E2E del 22-sep.
2. **Brecha 2** (Media): retirar el portal antiguo `/clientes/liset` (SCJWT en `sessionStorage`, 0 usos reales en 14 días) + A2 (`portal-vip.js` cargado en balde por `portal-vip.ejs` e `informe.ejs`). **Confirmar antes con Jaime que Liset ya no lo usa.**
3. **Brecha 7** (Baja): destino de reserva fijo `/vip/forte-spa/` en `acceso.js`.
4. **A1** (Baja): schemas Fastify (1 de 35 rutas los declara; el resto valida a mano).
5. Opcional: `clienteAuth.ts` → `export *` del índice de `identidad/`.
6. Rareza: el render de `vip-portal.conf.plantilla` escribe los dos secretos en un comentario (línea 3) del snippet vivo.
   - 🔴 **Desviación de nginx en vip. (2026-10-07)**: el vhost `sites-available/vip.solucionesconia.cl` lleva un bloque `location ^~ /clientes/assets/` escrito a mano, con **otra copia de `API_SECRET_TOKEN` y `EDGE_SECRET`** (Bearer + `X-Edge-Proof`). (a) **Rotación de secretos**: añadirlo a la lista de sitios que se actualizan, o vip. vuelve a servir los assets del portal con 401. (b) **`deploy.sh`**: si regenera ese vhost, el bloque desaparece y el logo/CSS del portal vuelven a ser HTML. Arreglo de fondo: llevar el bloque a la plantilla del vhost en `solucionesconia` (o que el vhost haga `include` del snippet sin duplicar `/api/`, que hoy chocaría con `location /api/`).
   - **Sin confirmar**: un `grep` del 07-oct no encontró ningún `include` literal de `snippets/vip-portal.conf` en `sites-available/`, `sites-enabled/`, `nginx.conf` ni `conf.d/`. Antes de dar por activos sus bloques (incl. `/acceso/` de la brecha 8 y `/vip/`, que en vip. cae en la SPA), comprobar si se carga por otra vía.
7. Heredado: rotar la credencial de julio de ExamenFácil si no se rotó; Gambusas: cabeceras duplicadas y `limit_req` del webhook WA, `meta-sync` sin `INSTAGRAM_BUSINESS_ACCOUNT_ID`, token de WhatsApp sin WABA (Jaime); `pm2-logrotate`; bandeja `ventas@`, compra real del pack $14.990, DMARC `p=quarantine`.
8. Higiene: `CLAUDE.md` raíz y la skill `cierre-sesion` aún nombran `deploy-1gb.yml` (ya no existe). `ubuntu-latest` migra a Ubuntu 26 el **2026-10-19**: vigilar el primer deploy posterior.

## 2 · Estado de los repos al cierre

- **`zasa-orchestrator`:** limpio; `main` = `origin/main`; producción en `c932f5b` (logo de yami-spa optimizado, verificado por `/health` el 2026-10-07).
- **`admin_solucionesconia`:** limpio; `main` = `origin/main` = vip. en `67edb57`; widget publicado = repo (sha `20e3275b…`).
- **`solucionesconia`:** limpio en `3602280`; el web root de `/acceso` = repo por sha256.
- **`GambusasChile`:** sin cambios, `d366eb1`.
- **`AuditorLegal`** y **portal de Jose:** cambios ajenos sin commitear; no se tocaron.

## 3 · Trampas operativas (nuevas o confirmadas hoy)

- **Widget de Sofía:** importa `src/api/httpCore.ts` y `httpClientWidget.ts`. Cualquier cambio en ellos cambia el widget, y la CI de `admin_solucionesconia` falla hasta commitear `public/widget/vendedor-ia-v17.js` regenerado (`npm run build:widget`), lo que **publica el widget en las webs de clientes**: pedir OK. Cambios solo en `httpClient.ts` (la SPA) ya no deberían tocarlo; comprobar con `git status` tras el build.
- **CSP:** Cloudflare inyecta su beacon en el HTML que ve el navegador, no en el de `curl`. Verificar una CSP con Chromium real (Playwright de `Workspace_Clientes/Elrincon-qa`), no solo por cabeceras.
- **nginx:** un `add_header` en un `location` anula todos los del server block; repetir el juego completo. El vhost de `solucionesconia.cl` lo genera `deploy.sh` y el snippet `vip-portal.conf` sale de su plantilla: no editar solo en el VPS.
- **Secretos:** nada que imprima un comando por SSH es privado. Contraseñas nuevas → fichero `600` en `/root` que Jaime lee en terminal aparte; si algún paso falla, `shred` automático. Al volcar `access.log`, ocultar la query (el handshake de Meta lleva `hub.verify_token`). Al listar claves del `.env`, ojo con valores multilínea (PEM).
- **`.env` del orquestador:** dotenv 17 se queda con la ÚLTIMA aparición de una clave repetida; un valor pegado desde chat puede llegar en formato Markdown.
- **Diagnosticar un deploy:** `gh run view <id> --json jobs` y las anotaciones del job. `runner_name` vacío y 0 pasos = falta de runner de GitHub, no fallo nuestro. `/health` sigue en el commit viejo ~3 min tras el pull.
- **Login de prueba desde el portátil** gasta intentos del rate limit de la IP de Jaime: evitarlo; usar el loopback del VPS o los logs.
- `obtenerAlmacenIdentidad()` es `async`; `buscarUsuario`/`fichaDe` sirven para lecturas de solo lectura sin tocar hashes.

---

## 4 · El paso exacto siguiente

**Brecha 2:** preguntar a Jaime si Liset sigue usando `/clientes/liset`; con su confirmación, retirar el portal antiguo (vista `cliente-portal.ejs`, ruta, bloque nginx con respaldo + `nginx -t`, `portal-vip.js` y su carga en `portal-vip.ejs`/`informe.ejs`). Mientras tanto, si hubo tráfico real, revisar las verificaciones pendientes de §1.1.
