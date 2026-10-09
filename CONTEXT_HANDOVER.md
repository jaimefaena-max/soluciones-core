# CONTEXT HANDOVER — Workspace ZASA · tras la sesión 2026-10-08-a (rotar-secretos-borde.sh + AUTHZ_VIP)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-10-09` en `~/.claude/projects/C--Proyectos/memory/`.
> **Última sesión: 2026-10-08-a**, 20:00–22:39 UTC, **86,2 min activos**, **$50.283 CLP**, telemetría `zasa-orchestrator` `d52903e` (publicada: `/health` = `d52903e`). Lo nuevo está en §0.d; §0–§0.c es el estado acumulado de sesiones anteriores.
>
> Sesiones anteriores:
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

### 0.c · 2026-10-08 — Brecha 2 CERRADA (portal antiguo de Liset retirado de extremo a extremo)

Evidencia previa: 14 días de `access.log` (25-sep → 08-oct) con **0 accesos reales** a `/clientes/liset`: 72 × 401 del monitor de uptime (`curl`), 4 × 401 de un Chrome Android el 25-sep sin pasar el Basic Auth, 2 × 200 desde el propio VPS (pruebas del 06-oct).

| Qué | Dónde | Verificación |
|---|---|---|
| **Portada `/clientes/:slug` y `/portal/:slug` retiradas**: `cliente-portal.ejs`, `portal-vip.js` (SCJWT en `sessionStorage`) y `portalClienteController` borrados. Docs, informes y `/clientes/assets/` intactos | `zasa-orchestrator` `ae67d08` | 1.848 tests ✓ (−5 = los `it.each` de `vistasSinEstiloEnLinea` por la vista borrada); Actions success; `/health` = `ae67d08` |
| **nginx de admin.: 6 bloques de Liset fuera** (`location /clientes/liset` + 5 `location =` de docs/informes) en plantilla, sonda de `instalar-plantillas.sh` y `uptime-monitor.yml` | `e6f22e9` | `verificarBorde.test.ts` adaptado a `demovip` (15 ✓) |
| **Deriva de vip. CERRADA**: el bloque `^~ /clientes/assets/` del 07-oct ya está en `nginx-templates/vip.solucionesconia.cl.conf`. Excepción acotada `AUTHZ_VIP` en `verificar-borde.sh` (spec exacta; test nuevo: no se extiende a otro location) | `31ca36b` | 16 ✓; `--comprobar`: vip. «idéntica a la viva» |
| **Plantillas aplicadas en el VPS** con `instalar-plantillas.sh --aplicar --aceptar-cambios` (diff efectivo: exactamente las 54 líneas de Liset, comprobado por tramo con secretos enmascarados) | respaldo `/root/backups-nginx/instalar-plantillas-20261008-171410` | `nginx -t` ok, reload, 5/5 sondas; `/clientes/liset` → 401 realm «ZASA Cockpit»; PDF → 401; `/clientes/assets/` 200 en admin. y vip.; logo yami-spa `image/png` |
| **Comentarios y docs** sin el portal antiguo (`csp.ts`, `ds.js`, `acceso.css`, `MEMORIA_TECNICA.md`, `ONBOARDING_B2B.md` marcado OBSOLETO para clientes nuevos) | `fb81202` | `tsc` + 70 tests de DS/CSP ✓ |
| **Artefactos privados archivados y borrados**: `/opt/agencia/private/clientes/liset/` (2 PDF, `.md`, 2 HTML) + `/etc/nginx/.htpasswd_liset` | `/root/backups-brecha2/liset_legacy_archive.tgz` (358.773 B, 600, sha256 `1b73db58fdf3ea86…`) | `gzip -t` + `tar --diff` idéntico antes de borrar; `nginx -t` ok tras borrar. 🔴 Contiene datos tributarios de la clienta: `shred` cuando Jaime decida no conservarlo |
| **`TENANT_TOKEN_LISET` retirado**: el instalador ya no lo lee ni lo exige; línea borrada de `/etc/nginx/secretos/inquilinos.env` (queda solo `TENANT_TOKEN_DEMOVIP`) | `2621c00` + respaldo `/root/backups-brecha2/inquilinos.env.bak` (600) | `--comprobar` con `2621c00`: render sin marcadores pendientes, los 4 ficheros «idénticos a la viva» |
| **Inquilino `liset` SUSPENDIDO** en Postgres (la tabla usa `estado`, no `activo`) vía `cambiarEstadoCliente()` del orquestador compilado: UPDATE + revocación de sesiones + `audit_log` en una transacción | tabla `clientes`; actor `claude:brecha2-2026-10-08` | `demovip`, `forte-spa`, `yami-spa` siguen `activo`; `resolverClientePortal("liset")` → sin acceso; `audit_log`: `tenant=liset estado=suspendido` 19:06:46 UTC |

### 0.d · 2026-10-08-a — `rotar-secretos-borde.sh` admite `AUTHZ_VIP`

| Qué | Dónde | Verificación |
|---|---|---|
| **Precondición del paso 0**: lee la lista de `AUTHZ_VIP` de `verificar-borde.sh` (una sola fuente de verdad) y, con `authz()` (awk; el secreto va por entorno, no por argv), aborta solo si `API_SECRET_TOKEN` aparece en vip. FUERA de esos bloques, comentarios incluidos | `zasa-orchestrator` `e995a96` | `bash -n`; prueba local sobre la plantilla con valores falsos: `0 1` limpio, `1 1` con fuga en comentario. CI `37850485534` success |
| **Gate del paso 3**: `exp_vip` cuenta API y EDGE → vip. ±6 (antes ±4, que habría abortado) | `e995a96` | `--comprobar` en el VPS (lo ejecutó Jaime; log revisado por Claude): `Bearer maestro x1, todo dentro de AUTHZ_VIP`; env 2 líneas, snippet 6; admin. ±20, vip. ±6; `== COMPROBADO` |
| **Rotación real probable a las 22:16 UTC — NO verificada por Claude**: `.env` y `vip-portal.conf` con mtime 22:16 y backup `secretos-borde-20261008-221640` conservado (`--comprobar` borra el suyo) | VPS | `/health` 200 a las 22:18. Permisos ya estrictos: `.env` y snippet 600 root, `/root/backups-rotacion/*` 700. Huellas vigentes SIN comprobar (el modo automático bloqueó la lectura del `.env`) |

---

## 1 · Abierto, por cercanía a producción

1. 🔴 **Verificaciones que solo da el uso real** (no forzarlas con datos falsos):
   - Una descarga real con sesión de operador en vip. (Novedades o Portales) → cierra la brecha 5 al 100 %.
   - Un cliente real entrando al portal tras el hardening (200 en `/api/vip/*/verificar|perfil` en `access.log` después de las 15:23 UTC del 06-oct).
   - `ag-webhooks` en verde con la próxima reserva real de Sofía; además limpiar el lead y el evento de Calendar de la prueba E2E del 22-sep.
2. ✅ **CERRADO en 2026-10-08-a (`e995a96`, §0.d).** Texto original: `rotar-secretos-borde.sh` abortará en la próxima rotación (nuevo, 2026-10-08): su precondición (línea 101) exige que el vhost de vip. NO lleve el Bearer maestro, y desde el 07-oct lo lleva en `^~ /clientes/assets/` —hoy versionado y aprobado como `AUTHZ_VIP`—. Además la compuerta del paso 3 (línea 134) calcula el diff esperado de vip. contando solo `EDGE_SECRET`. Arreglo: alinear ambas líneas con la excepción `AUTHZ_VIP` (contar `API_SECRET_TOKEN` en vip. solo dentro de ese location) y un test. Hacerlo ANTES de cualquier rotación.
   - ✅ **Brecha 2 CERRADA el 2026-10-08** (ver §0.c). Nota: el «A2» que listaba el handover anterior no existía: `portal-vip.ejs` e `informe.ejs` solo nombraban `portal-vip.js` en comentarios.
3. **Brecha 7** (Baja): destino de reserva fijo `/vip/forte-spa/` en `acceso.js`.
4. **A1** (Baja): schemas Fastify (1 de 35 rutas los declara; el resto valida a mano).
5. Opcional: `clienteAuth.ts` → `export *` del índice de `identidad/`.
6. Rareza: el render de `vip-portal.conf.plantilla` escribe los dos secretos en un comentario (línea 3) del snippet vivo.
   - ✅ **Desviación de nginx en vip. CERRADA (2026-10-08, `31ca36b`)**: el bloque `location ^~ /clientes/assets/` vive en la plantilla versionada y `instalar-plantillas.sh` lo renderiza con los secretos vigentes; reinstalar ya no lo borra. Queda la consecuencia sobre `rotar-secretos-borde.sh` (punto 2).
   - **Sin confirmar**: un `grep` del 07-oct no encontró ningún `include` literal de `snippets/vip-portal.conf` en `sites-available/`, `sites-enabled/`, `nginx.conf` ni `conf.d/`. Antes de dar por activos sus bloques (incl. `/acceso/` de la brecha 8 y `/vip/`, que en vip. cae en la SPA), comprobar si se carga por otra vía.
7. Heredado: rotar la credencial de julio de ExamenFácil si no se rotó; Gambusas: cabeceras duplicadas y `limit_req` del webhook WA, `meta-sync` sin `INSTAGRAM_BUSINESS_ACCOUNT_ID`, token de WhatsApp sin WABA (Jaime); `pm2-logrotate`; bandeja `ventas@`, compra real del pack $14.990, DMARC `p=quarantine`.
8. Higiene: `CLAUDE.md` raíz y la skill `cierre-sesion` aún nombran `deploy-1gb.yml` (ya no existe). `ubuntu-latest` migra a Ubuntu 26 el **2026-10-19**: vigilar el primer deploy posterior.

## 2 · Estado de los repos al cierre

- **`zasa-orchestrator`:** limpio; `main` = `origin/main`; producción en `d52903e` (verificado por `/health` el 2026-10-08 a las 22:45 UTC). `e995a96` = refactor AUTHZ_VIP; `d52903e` = telemetría 2026-10-08-a. Cadena de la Brecha 2: `ae67d08` → `e6f22e9` → `31ca36b` → `fb81202` → `2621c00`, todos con Actions success.
- **nginx del VPS:** = plantillas de `2621c00` (`--comprobar`: admin., vip., realip y seg «idénticas a la viva»). Respaldos de la Brecha 2 en `/root/backups-nginx/instalar-plantillas-20261008-*` y `/root/backups-brecha2/`.
- **Postgres:** inquilinos `demovip`, `forte-spa`, `yami-spa` activos; `liset` suspendido.
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

✅ **CONFIRMADO el 2026-10-09: la rotación del 08-oct (22:16 UTC) SÍ se aplicó.** Huellas vigentes `API=cb66cef9 EDGE=bea78222` (antes `2e2f571f`/`f74fa9ba`), calculadas por Claude en el VPS con la misma derivación que `h8()` del script. Queda: `shred` de `/root/backups-rotacion/secretos-borde-20261008-221640` y de los dos `20260923-*` (de Jaime: el modo automático bloquea el borrado). Trampa: `tr -d "\"\x27\n"` NO quita la comilla simple; `tr` no entiende `\x27` y borra `2`, `7` y `x` del valor → huellas falsas. Usar `tr -d "\042\047"` y `printf %s`.

Comando original (histórico):

```
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'for k in API_SECRET_TOKEN EDGE_SECRET; do printf "%s=" $k; grep -E "^$k=" /opt/zasa-orchestrator/.env | tail -1 | cut -d= -f2- | tr -d "\"\x27\n" | sha256sum | cut -c1-8; done'
```

- **Distintas** → rotación aplicada: cerrar `cockpit-secretos-borde-rotacion-2026-10-08` (si la salida de `--aplicar` acabó en `== OK`, su paso 5 ya probó viejo 403 / nuevo 200) y hacer `shred` de `/root/backups-rotacion/secretos-borde-20261008-221640` y de los dos `secretos-borde-20260923-*` (tarea `cockpit-backups-rotacion-limpieza`).
- **Iguales** → no hubo rotación: los dos `20260923-*` se borran igual (valores superados el 29-sep), y averiguar qué modificó `.env` y snippet a las 22:16.
- El snippet `vip-portal.conf` se queda en **600**, no 644: lleva los dos secretos en claro y nginx lo lee como root.

(Cerrado en 2026-10-08-a: `rotar-secretos-borde.sh` + `AUTHZ_VIP`, §0.d.)

Después, por orden: verificaciones de uso real (§1.1); Brecha 7; borrar `src/assets/ds-v2/acceso.css` (sin consumidores desde el 08-oct) con su caso en `tests/dsRuntimeHojas.test.ts`; comentarios residuales que nombran el portal antiguo (`portal-vip.ejs:18/550`, `informe.ejs:131`, `dsRuntimeHojas.test.ts:11`). De Jaime: decidir cuándo destruir `/root/backups-brecha2/liset_legacy_archive.tgz`.
