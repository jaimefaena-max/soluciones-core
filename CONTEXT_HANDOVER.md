# CONTEXT HANDOVER — Workspace ZASA · tras la sesión 2026-10-16-a (SOL-53 fases 5 y 6 + SOL-57 F0 y F1) · antes 2026-10-15-c (publicador de Meta y embudo fases 0-4) · 2026-10-15-b (razón social en examenfacil.cl) · 2026-10-15-a (dominio verificado en Meta)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: **`arranque-tras-2026-10-16-a`** (y el rol pedido por Jaime: `rol-coo-formato-micro-fases`; reglas: `regla-oro-publicaciones-sin-razon-social`, `no-proponer-cerrar-sesion`, `mysql-triggers-exigen-root-1419`) en `~/.claude/projects/C--Proyectos/memory/`.
> 🟣 **Desde el 2026-10-13 el backlog vive en Linear** (workspace SOLUCIONES, equipo SOL, proyectos `P-SOL-1..7`, issues `SOL-5..57`): memoria `linear-workspace-soluciones`. Este handover sigue siendo el relato; **Linear manda en el estado de cada tarea**.
> **Última sesión: 2026-10-16-a** (conversación `a330faa1…`), 00:28–06:03 UTC del 17-oct (empezó el 16-oct en hora de Chile), **153,6 min activos**, **$89.600 CLP**, telemetría `zasa-orchestrator` `2834563` (`/health` = `2834563`; `2026-10-16-a` presente en `dist/data/telemetry.js`). Lo nuevo está en §0.r y al principio de §4.
>
> 🔴 **PRIMER PASO: activar F1 de SOL-57** — `PUBLICACIONES_HABILITADO=admin` en el `.env` del VPS + `pm2 restart --update-env`, y un GET autenticado con la sesión de Jaime. Es lo único de F1 sin verificar.
>
> Sesión 2026-10-15-b (anterior) (misma conversación `340b94ab…`, medida desde el fin de la -a), 05:18–05:36 UTC del 15-oct, **17,4 min activos**, **$10.150 CLP**, telemetría `zasa-orchestrator` `3edf81d` (`/health` = `3edf81d`; `2026-10-15-b` en `dist/data/telemetry.js`). Meta **rechazó la verificación de negocio**: el nombre legal no aparecía en el sitio, que además decía «Examen Fácil SpA» (no existe). Corregido en `examenfacil-cl` `1d13eb3`: **MINIMARKET NOGALES SPA**, RUT 78.079.206-K, Jose del Carmen Godoy 191, Nogales, hola@examenfacil.cl, en el pie de `index.html` y `paso1_oncologico.html`, en Términos y Privacidad (operador y responsable del tratamiento; fecha 15-oct-2026) y en el JSON-LD (`legalName`, `taxID`, `address`). Respaldo `/root/backups-examenfacil/2026-10-15_053144-razon-social`. Producción EF = `1d13eb3`, verificado por loopback (0 restos de «Examen Fácil SpA»). Una SpA puede operar varias marcas y dominios: no hace falta una empresa por sitio, basta su nombre legal en cada uno.
>
> Sesión 2026-10-15-a (anterior) (conversación `340b94ab…`), 05:10–05:19 UTC del 15-oct, **8,6 min activos**, **$5.017 CLP**, telemetría `zasa-orchestrator` `423d562` (`/health` = `423d562`; `2026-10-15-a` en `dist/data/telemetry.js`). **SOL-47 avanza:** Jaime creó el portfolio comercial «examenfacil.cl» y el dominio quedó **Verificado** en Meta con la metaetiqueta en el `<head>` de `index.html` (`examenfacil-cl` `88d02c7` + `fdfaa04`; el primero llevaba el token mal transcrito, `a` por `s`). Respaldos en `/root/backups-examenfacil/2026-10-15_*-fb-verif*`. Producción EF = `fdfaa04`. **No quitar esa metaetiqueta**: Meta puede re-verificar.
>
> Sesión 2026-10-14-a (anterior) (conversación `11b3fe75…`), 20:21 UTC del 14-oct – 04:35 UTC del 15-oct, **189 min activos**, **$110.250 CLP**, telemetría `zasa-orchestrator` `ee3e555` (run `38682317179` success; `/health` = `ee3e555`; `2026-10-14-a` presente en `dist/data/telemetry.js`). Lo nuevo está en §0.p, §3 y al principio de §4. **Primera tarea: SOL-47 (portfolio comercial de Meta), de Jaime.**
>
> Sesión 2026-10-13-e (anterior) (conversación `b0e0c037…`), 01:47–02:51 UTC del 14-oct (empezó el 13-oct en hora de Chile), **63,1 min activos**, **$36.808 CLP**, telemetría `zasa-orchestrator` `1c6bc9a` (`/health` = `1c6bc9a`; `2026-10-13-e` presente en `dist/data/telemetry.js`). Lo nuevo está en §0.o y al principio de §4.
>
> Sesión 2026-10-13-c (anterior) (conversación `273502bd…`), 19:54–22:55 UTC del 13-oct, **162,5 min activos**, **$94.792 CLP**, telemetría `zasa-orchestrator` `e2cba69`. Lo nuevo está en §0.n, §3 y §4. El id `-c` deja `-b` libre para medir la sesión `d0e8c4f0…` (SOL-25).
>
> Sesión 2026-10-13-b (anterior) (conversación `d0e8c4f0…`), tarde del 13-oct. Solo tooling y doctrina, en `claude-skills` y en el repo raíz (sin CI): **nada desplegado a producción**. **Sin telemetría:** no se ejecutó `/cierre-sesion` completo (ni tiempo medido, ni coste, ni push a `zasa-orchestrator`). Lo nuevo está en §0.m, §1.10 y §4.
>
> Sesión 2026-10-13-a (anterior) (conversación `70a1382e…`), 14:49–15:55 UTC del 13-oct, **65,2 min activos**, **$38.033 CLP**, telemetría `zasa-orchestrator` `36c81dc`, publicada con `27526f1` (`/health`). Lo nuevo está en §0.l y §4.
>
> Sesión 2026-10-12-a (anterior) (conversación `f55dc836…`), 04:24–06:09 UTC del 12-oct, **104,9 min activos**, **$61.192 CLP**, telemetría `zasa-orchestrator` `282624b`. Empezó cerrando la 2026-10-11-a. Lo nuevo está en §0.k; §1.9 corrige un error del cierre anterior.
>
> Sesión 2026-10-11-a (anterior; conversación `3f5814c5…`): 02:11–04:19 UTC del 12-oct (23:11–01:19 hora local del 11-oct), **109,1 min activos**, **$63.642 CLP**, telemetría `422ba47`. Quedó en solo lectura por la guarda de `/nacho` (§3). Lo nuevo está en §0.j.
>
> Sesión 2026-10-10-c (anterior; misma conversación que la -b, medida solo desde su cierre): 17:28 UTC (10-oct) – 20:07 UTC (11-oct), **203,1 min activos**, **$118.475 CLP**, telemetría `174002b`. Lo nuevo está en §0.i: la landing.
>
> Sesión 2026-10-10-b (anterior): 16:31–17:29 UTC, **57,2 min activos**, **$33.367 CLP**, telemetría `035fa3e`. Lo nuevo está en §0.h.
>
> Sesión 2026-10-10-a (anterior): 06:57–07:29 UTC, **31,8 min activos**, **$18.550 CLP**, telemetría `21be967`. Lo nuevo está en §0.g.
>
> Sesión 2026-10-09-b (anterior): 23:55 UTC (09-oct) – 02:33 UTC (10-oct), **136,6 min activos**, **$79.683 CLP**, telemetría `e9a3111`. Lo nuevo está en §0.f.
>
> Sesión 2026-10-09-a (anterior):
> **Última sesión: 2026-10-09-a**, 05:29–08:41 UTC, **117,5 min activos**, **$68.542 CLP**, telemetría `zasa-orchestrator` `23e68d3`. Lo nuevo está en §0.e y §1.3.
>
> Sesión 2026-10-08-a, 20:00–22:39 UTC, **86,2 min activos**, **$50.283 CLP**, telemetría `zasa-orchestrator` `d52903e` (publicada: `/health` = `d52903e`). Lo nuevo está en §0.d; §0–§0.c es el estado acumulado de sesiones anteriores.
>
> Sesiones anteriores:
> Sesión del 2026-10-06, de 10:30 a 20:04 UTC: **436,8 min activos**, **$254.800 CLP**.
> Telemetría `2026-10-06-a` en `zasa-orchestrator` `66aa65d` (la del 05-oct: `2026-10-05-a` y `2026-10-05-b`).

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

> ⚠️ Corrección del 2026-10-10: en producción quedaban `portal-vip.js` (200) y `cliente-portal.ejs` en el `dist/` del VPS. Cierre definitivo en `c61ffe2` (§0.f).

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
| **Rotación real del 08-oct a las 22:16 UTC — CONFIRMADA el 09-oct** | VPS | Huellas `API=cb66cef9 EDGE=bea78222` (antes `2e2f571f`/`f74fa9ba`), calculadas por Claude como `h8()`. `/health` 200. Permisos: `.env` y snippet 600 root. Backups de rotación destruidos (`shred -u`); en `/root/backups-rotacion/` solo queda `rotar-edge-secret.sh` |
| **Yami Spa, ficha local** (carpeta privada, fuera de git) | `privado_agencia/Clientes/yami-spa/` | `portal.config.json` → `logo` = ruta de producción; `yami_state.json` → `branding.logo`, `detalle` y `referencia` = `documentos/logo.png`; `assets/logo.png` borrado (sha256 idéntico al de `documentos/`) y `assets/` eliminado; README alineado. Chromium real sobre servidor loopback: logo visible, 0 errores de consola, 0 peticiones fallidas; logo de producción 200 `image/png` 225.192 B |
| **Telemetría**: la entrada `2026-10-08-a` (`d52903e`) deja `cockpit-secretos-borde-rotacion-2026-10-08` al 60 % y `cockpit-backups-rotacion-limpieza` al 0 %; ambas están ya cerradas. Pasarlas a `finalizada` con esos mismos ids en el próximo cierre | `src/data/telemetry.ts` | — |

### 0.e · 2026-10-09 — Brecha 7 CERRADA (fallback a `forte-spa` erradicado del login)

| Qué | Dónde | Verificación |
|---|---|---|
| **Parche**: `acceso.js` ya no tiene destino de reserva. Sin `tenantId` válido (`RE_TENANT`) falla cerrado: `ocupado(false)` + «No pudimos abrir tu portal…», sin redirigir | `solucionesconia` `fd37d38` | `node --check`; 0 `forte-spa` en el fichero. El backend siempre devuelve `tenantId` en el 200 (`clientLoginRoutes.ts:146`) |
| **Publicación atómica** de `acceso/acceso.js` (NO por `deploy.sh`, ver §1.3): `git pull --ff-only` del clon `/opt/solucionesconia` (`7e5f4b5` → `fd37d38`) → `.new` → sha256 → `mv` | web root `/var/www/solucionesconia.cl/acceso/` | sha256 `.new` = blob del commit = local (`8ae2c452…`); loopback 200 con ese sha y 0 `forte-spa` |
| **Purga selectiva en Cloudflare** de `acceso.js` (apex + `www`; token y Zone ID leídos del `.env` del clon dentro del VPS, sin imprimirse) | API `purge_cache` `{"files":[…]}` | HTTP 200 `success:true`; desde fuera `MISS` → `REVALIDATED`, sha `8ae2c452…` en ambos hosts |
| **Cache-busting**: `acceso/index.html` pide `acceso.js?v=fd37d38` y `acceso.css?v=fd37d38` (el JS tenía `max-age` 30 días: los navegadores podían seguir con el viejo aunque se purgase el edge) | `solucionesconia` `0827a4c`, publicado igual (pull `fd37d38` → `0827a4c`, `.new`, sha256 `077a5501…`, `mv`) | Desde fuera: `/acceso/` 200 `DYNAMIC` con sha `077a5501…`; `acceso.js?v=` y `acceso.css?v=` 200 `MISS`; JS servido con 0 `forte-spa` |
| **Respaldos** del código anterior, fuera del web root | `/root/backups-solucionesconia/20261009/` (700): `acceso.js.bak` (sha `d53470bf…`), `index.html.bak` | `acceso.js.bak` en el web root → 404. Rollback: copiar los `.bak` a su sitio |
| **Sin probar en navegador**: login real de un cliente (no yami-spa) hasta `/vip/<tenant>/` y la rama de error interceptando la respuesta sin `tenantId` | — | Pendiente; no bloquea el cierre |

### 0.f · 2026-10-10 — `deploy.sh` no destructivo, landing republicada y Brecha 2 cerrada de verdad

| Qué | Dónde | Verificación |
|---|---|---|
| **Meta → webhook WA de Gambusas vía Cloudflare: CERRADO.** Dos POST reales de Meta (`2a03:2880:…`, `facebookexternalua`) el 09-oct a las 08:21:31 y 08:22:05 UTC, después del cierre de ufw (07:12) | `/var/log/nginx/access.log` + `/var/lib/gambusaschile/logs/webhook-wa-2026-10.log` | nginx 200 y log propio `ACEPTADO … mensajes=1` (firma válida). Con el origen solo-CF, prueba la cadena completa |
| **`deploy.sh` de la landing, refactorizado: ya es seguro.** Solo publica ficheros: no instala paquetes, no toca ufw, no reescribe el vhost, no renderiza `vip-portal.conf`, no lanza Certbot ni recarga nginx. `git fetch` + `merge --ff-only` y aborta si HEAD ≠ `origin/main`; lista BLANCA (`index.html acceso assets dist src`); staging en `/tmp` con la inyección de LinkedIn; guarda contra borrados (`exit 3` salvo `--permitir-borrado`); `--simular`; `tar` del web root; `rsync -aic --delete --delay-updates`; verificación en loopback (sha del index + 4 rutas en 200); purga de Cloudflare solo de lo cambiado (antes `purge_everything` de toda la zona). Cuerpo dentro de `main()` para que el pull no lo corrompa en ejecución | `solucionesconia` `9b2faf3` + `594f6e2` (el `trap EXIT` usaba una variable local de `main()`; `STAGE` global) | `--simular` en el VPS: `EXIT=0`, sin temporales, plan = 8 borrados y 0 modificaciones |
| **Landing republicada con el script nuevo**: fuera del web root `docs/`, `nginx/`, `diseño_premium.md` y `assets/.gitkeep`, que se servían con **200** (la plantilla de `vip-portal.conf` exponía el mapa de rutas; sin secretos) | web root `/var/www/solucionesconia.cl` = `594f6e2`; respaldo `/root/backups-solucionesconia/20261010-005844/webroot.tgz` | Loopback OK; desde fuera (apex y `www`): `/`, `/acceso/`, CSS, JS, logo 200; las 5 rutas internas 404. Purga de 10 URL. Rollback: `rm -rf /var/www/solucionesconia.cl && tar -C /var/www -xzf <respaldo>` |
| **`acceso.css` retirado del DS** (sin consumidores desde el 08-oct) y su caso en `dsRuntimeHojas.test.ts` | `zasa-orchestrator` `18f4b68` | Suite 1.849 ✓; Actions success |
| 🔴→✅ **La Brecha 2 NO estaba cerrada en producción** (corrige §0.c): `copy-assets.mjs` hacía `cpSync` sobre `dist/` sin borrar nunca, y el VPS construye siempre sobre el mismo `dist/`. Seguían ahí `dist/assets/portal-vip.js` (**200 público** en admin. y vip.), `dist/views/cliente-portal.ejs` y `acceso.css`. Arreglo: `sincronizar()` reconstruye `dist/views` y `dist/assets` en un hermano `.nuevo` y lo intercambia con dos `rename` (sin hueco de servicio mientras PM2 sirve), limpiando restos `.nuevo`/`.viejo` | `zasa-orchestrator` `c61ffe2` + `tests/copyAssets.test.ts` (4 casos) | Suite 1.853 ✓, typecheck ✓; Actions `38013835572` success; `/health` = `c61ffe2`; en el VPS `diff -rq src/ dist/` idéntico y los 3 restos fuera; desde fuera `portal-vip.js` y `acceso.css` **404** en admin. y vip., `utilities.css`/`tokens.css` 200; log de errores de PM2 vacío |

Matices: los `.js` compilados obsoletos siguen en `dist/` (`tsc` no borra), pero no se sirven por HTTP. Un rollback de `desplegar.sh` recompila el commit anterior con el `copy-assets` viejo: solo dejaría sobrantes, como antes.

### 0.g · 2026-10-10-a — 503 descartados y entorno dev local del widget

| Qué | Dónde | Verificación |
|---|---|---|
| **No hay 503 pendientes en zasa-orchestrator.** 0 respuestas 503 en los 15 `access.log` (~14 días). Solo 11 × 5xx: 3 × 502 en `/health` (03, 04 y 05-oct, `connection refused` durante reinicios de deploy) y 8 × 500 de Gambusas del 30-sep. Los 65 reinicios de PM2: todos `exit 0` por SIGINT (deploys), 0 crashes | VPS: nginx + `/root/.pm2/` | `/health` 200 con `895d820` = HEAD en ese momento |
| Log de errores del orquestador: 3 × 422 de Resend (03:30 UTC), anteriores al arreglo de `RESEND_FROM`; ninguno después. 1 timeout aislado de Claude en `salesAgentService` (04:45 UTC) | `/root/.pm2/logs/zasa-orchestrator-error.log` | Sin causa raíz que corregir; no se cambió código |
| **Entorno local del widget alineado**: mismo token de desarrollo en `zasa-orchestrator/.env` y `admin_solucionesconia/.env.local` (valor anterior en `.env.local.bak`); `NODE_ENV=development` añadido al `.env` local (faltaba: sin él, localhost → 403 a propósito); Vite con `--port 5173` | ficheros locales ignorados por git; nada versionado | Por el proxy de Vite: chat 200 con respuesta de Sofía; sin token 403; origen ajeno 403. Detalle: memoria `dev-local-widget-sofia` |
| Pendiente nuevo: `vite.config.ts` fija `port: 3000`, fuera de los orígenes de desarrollo del backend (5173/4173) | tarea `sc-dev-origen-vite-puerto-3000` | — |

### 0.h · 2026-10-10-b — `81e5cbb` empujado, CI de vip. a Node 24 + `ubuntu-24.04`, skills de diseño

| Qué | Dónde | Verificación |
|---|---|---|
| **`81e5cbb` publicado** (nanoid 3.3.16→3.3.20, source-map-js 1.2.1→1.2.2; solo `package-lock.json`, devDependencies). Push lanzado por Jaime con `!` (el clasificador del modo automático bloquea los push que despliegan) | `admin_solucionesconia` | `npm test` exit 0 antes; run `38068568647` success; `desplegar-estaticos.sh`: «producción ya sirve exactamente este build» (build idéntico) |
| **Acciones de `deploy-vip.yml` a runtime node24**: checkout v7, setup-node v7, cache v6, upload-artifact v7 (runtime leído del `action.yml` de cada tag) | `cd6bc48` | Run `38069194792` success, 0 anotaciones de Node 20. `upload-artifact` solo corre si falla una compuerta: sin ejercitar |
| **Runner fijado a `ubuntu-24.04`** (antes de la migración de `ubuntu-latest` a Ubuntu 26 del 19-oct) | `01102ef` (commit de Jaime; su `Co-Authored-By` va sin `<…>`) | Run `38070008737` success, `Image: ubuntu-24.04 20261004.327.1`, 0 anotaciones |
| **Skills globales de diseño**: `design-taste-frontend` (Leonxlnx/taste-skill), `emil-design-eng` (emilkowalski/skill), `impeccable` (pbakaus/impeccable), con `skills@1.7.2 --copy -g -a claude-code` (lo lanzó Jaime con `!`) | `~/.claude/skills/` | `SKILL.md` idénticos a lo revisado salvo CRLF; ningún hook en `settings.json`. `impeccable` descarga su motor de las releases de GitHub (verificado contra `.sha256` del mismo origen) solo si se usa `live`/hooks |

### 0.i · 2026-10-10-c — Landing: CTAs a Sofía, propuesta B2B orientada a resultados y 4 pilares de servicios

Todo publicado con `deploy.sh` (simulación primero) y verificado desde fuera en apex y `www`: `curl` vía Cloudflare + Chromium (Playwright de `Elrincon-qa`) contra la web real, 0 errores JS. Web root = `5b1218b`.

| Qué | Dónde | Verificación |
|---|---|---|
| 🔴→✅ **`deploy.sh` nunca purgaba Cloudflare**: el filtro buscaba `<f`, pero rsync en local marca `>f`; el plan salía vacío y la purga se omitía sin avisar (desde `9b2faf3`) | `solucionesconia` `1f0bd74` (líneas 133 y 205: `[<>]f`) | Purgas reales: «purgadas 4/8 URL» en cada despliegue posterior |
| **Cache busting de CSS/JS**: nginx los sirve con `max-age` 30 días; `index.html` lleva `?v=$CSS_VERSION`/`$JS_VERSION` y `deploy.sh` los sustituye por 10 caracteres del sha256 del contenido (aborta si queda un marcador) | `4a77309` | `style.css?v=…` y `main.js?v=…` cambian solo cuando cambia el fichero |
| **Hero**: cascada de `data-reveal` por sección, h1 sin reveal (LCP), `noscript`; espaciado con clamp y `100svh`; Inter con `opsz`; **el hover de los botones nunca funcionó** (inline gana a la hoja) → reglas globales con `!important`, `:active` y `:focus-visible` | `8bc9453`, `0d62ec9`, `131fff9`, `5e763a6`, `71f60d8` | Micro-prueba visible en 1280×720, 1366×768, 375×667 |
| **Widget de Sofía con `open()`**: `window.SolucionesconiaVendedorIA.open()` emite `sofia:open`, que escucha el componente | `admin_solucionesconia` `4645cfe` (run `38086033168`; rollback `/opt/agencia/respaldos-estaticos/20261010-210302`) | Widget en producción sha `2f4e7b3008aa` |
| **CTAs del hero y del cierre abren a Sofía** (Cal.com de respaldo si el widget no cargó; `mailto` sin JS). Textos «Habla con Sofía ahora» / «Diagnóstico inmediato con IA» y meta/og/twitter alineados | `c7dd2dc`, `7646b60`, `3fef5e2` | E2E 2/2 CTAs en ambos dominios |
| **Tarjetas orientadas a resultados** + enlace `data-open-sofia` por tarjeta; `main.js` atiende `[data-open-scheduler], [data-open-sofia]`; regla `.sc-card-link` | `868613e` | E2E 3/3 |
| **Servicios ampliados a 4 pilares** en rejilla 2×2 (`#agentes` conserva su id: lo usa el botón secundario del hero): Diagnóstico Estratégico · Agentes de Ventas y Cobranza 24/7 (Sofía) · Automatización Back‑office · Web y 3D | `5b1218b`; respaldo previo `/root/backups-solucionesconia/20261011-200508/webroot.tgz` | E2E 4/4 en 1280 y 375 px; sin scroll horizontal |
| **Informe de propuesta de valor** (dolor 3, autoridad 0, solución 3, CTA 2; sin cifras inventadas) | `solucionesconia/docs/informe-propuesta-valor-2026-10-10.md` **sin commit** (docs/ no se publica) | — |

Cifras: **no se publicó «<30 s» ni «+40 % cualificación»** por falta de datos. La latencia real está en `ejecuciones_agentes.latencia_ms` (PostgreSQL del VPS); la consulta de solo lectura la bloqueó el modo automático («Production Reads»): la lanza Jaime.

### 0.j · 2026-10-11-a — CI de zasa blindado, `/inicio-sesion` mide `/health`, Gran Consejo y piloto `nacho`

| Qué | Dónde | Verificación |
|---|---|---|
| **CI de `zasa-orchestrator` listo para el 19-oct**: los 4 jobs de los 3 workflows con `runs-on: ubuntu-24.04` (`7a4551d`); `actions/checkout` y `setup-node` de v4 a **v7**, runtime node24 (`663da53`). `node-version` de la app sigue en `'22'` | `.github/workflows/{deploy-admin-vip,deploy-vps-4gb,uptime-monitor}.yml`; CHANGELOG en `422ba47` | Runs `38197273779` y `38198536210` success, `Image: ubuntu-24.04`, 0 avisos de Node 20 en el segundo; `/health` = `663da53`. Sin ejercitar con v7: `uptime-monitor.yml` (programado) y `deploy-vps-4gb.yml` (manual) |
| **`/inicio-sesion` ya no da un falso verde del Cockpit**: medía `/`, cuyo 401 es el Basic Auth de nginx (con PM2 caído seguía en verde). Ahora `/health` (200 + `status: ok`) y compara su commit con el HEAD local: `commitCoincide`, `serviciosConDrift` (drift ≠ caída) | `claude-skills` `91f5178` (empujado) | 5 casos: real, drift forzado, 200 no JSON, host inalcanzable, hook `-SinRed` |
| **Auditoría del Gran Consejo** (2 skills + 12 agentes) e informe de migración a skills: ningún agente declara `tools:` (los 12 heredan Bash/SSH/push); `support.md` y `ramon.md` apuntan a la IP muerta `159.223.213.237`; `marco.md` vive en DO App Platform y edita `telemetry.ts` a mano | Solo en el chat de `3f5814c5…` (no persistido) | — |
| **Piloto `nacho` + guardia P0**: `skills/nacho/SKILL.md` (cumplimiento 19.628 / 21.719 / 20.584, solo lectura) y `skills/_consejo/guardia.ps1` (hook `PreToolUse` que solo restringe y falla cerrado; ASCII puro) | `claude-skills` `81a24a8` (**sin push**; no despliega nada) | 62/62 pruebas offline (cazaron `git -c core.pager` y el hook que no bloqueaba si la guarda no arrancaba; corregidos). En vivo: `git status` pasa; `git commit --dry-run` y `ssh -V` denegados |
| **Excepción `!Workspace_Agencia/doctrina/`** en el `.gitignore` raíz (los 4 ficheros de doctrina no estaban en ningún repo) | repo raíz, **sin commit** | `git add --dry-run` = exactamente los 4 ficheros; sin secretos. Falta la decisión de Jaime sobre `CEO_PERFIL_JAIME.md` (§1.10) |

### 0.k · 2026-10-12-a — Permisos de riesgo purgados, CI de EF y Gambusas, agentes sin IP muerta, Jose retirado

| Qué | Dónde | Verificación |
|---|---|---|
| **`settings.local.json` purgado** (allow 443 → 376): 51 reglas a la IP muerta `159.223.213.237` (incl. `scp … config.php` con `StrictHostKeyChecking=no`), 5 con tokens en claro (`liset` ×3, `Authorization` contra la app retirada de DO ×2), `git push` ×2, `ssh *`, `ssh -i *`, `KEY="…/.ssh/elrincon_deploy" *` (aprobaba cualquier comando), `Read(~/.ssh/**)`, `node -e ' *`, `python -c ' *`, `git checkout/restore/rm *`. **Desde ahora `git push` y `ssh` piden permiso** | `.claude/settings.local.json` (no versionado); respaldos `settings.local.json.bak-20261012` (**con tokens**: borrar) y `-paso2` en el scratchpad de `f55dc836` | JSON válido; 0 IP muerta, 0 hex ≥32, 0 reglas `git push`/`ssh`; diff enmascarado en `permisos-enmascarado.diff` |
| **CI de ExamenFácil** a `ubuntu-24.04` + `checkout@v7` (`ssh-action` es Docker: sin cambios) | `examenfacil-cl` `2548ef7` | Run `38206843915` success 23 s, `Image: ubuntu-24.04`, 0 anotaciones, simulacro rsync 0 huérfanos, `Deploy OK` (incluye `ef-nginx-verificar`), `curl -sI` 200 |
| **CI de GambusasChile**, igual (`scp-action`/`ssh-action` Docker) | `gambusaschile` `ea3e118` | Run `38207618444` success 30 s, `ubuntu-24.04`, 0 anotaciones, `Deploy OK`, 200 con cabeceras de seguridad intactas |
| **Agentes Diego y Ramón**: IP `161.35.85.101`, hostname `zasa-server-restaurado`; el deploy de Diego pasa a push a `main` + `deploy.yml` (su rsync manual sin excluir `storage/` habría borrado la Bóveda Médica) | `claude-skills` `1db2184` (empujado) | Sin restos de IP, URL `jaime/examenfacil.git` ni rsync manual |
| **Portal de Jose: repo local retirado.** No tenía remoto (no existe en GitHub; su `deploy.yml` nunca corrió y escuchaba `main` con la rama en `master`) y guardaba fuera de su `.gitignore` un `.pfx`, la cédula y PDF tributarios. Respaldo cifrado a `9632DDAB` (subclave `1244E251EABC3365`), 99 entradas, 6,0 MB; **Jaime borró la carpeta a mano** | `Workspace_Agencia/vault/jose_backup_encrypted.tar.gz.gpg` (ignorado por `*.gpg`); `CLAUDE.md` `ba1ebed`; `session-audit.ps1` `80fdbfa` | `gpg --list-packets`: destinatario correcto; carpeta ausente; `session-audit.ps1` corre sin error. **Restauración sin probar** (privada dividida en shards). `/jose/` sigue en producción |

### 0.l · 2026-10-13-a — Bóveda Médica de ExamenFácil: PHP no podía escribir

| Qué | Dónde | Verificación |
|---|---|---|
| 🔴→✅ **`storage/` (Bóveda Médica) sin escritura para PHP.** El `rsync` la excluía (desde el 19-sep, para no borrarla), pero quedaba fuera de los dos bucles de permisos de runtime: el `chown -R deploy:www-data` la dejaba `deploy:www-data` 755 y el `copy()` de `api_handler.php:867` fallaba en silencio (solo un WARN en `logs/ef_errors.log`). Antes del arreglo: vacía y sin cambios desde el 19-sep | `examenfacil-cl` `882ebd2` (`storage` en ambos bucles de `deploy.yml`) + `/etc/sudoers.d/deploy-examenfacil-boveda` (Jaime, root, antes del push; Claude comprobó los 3 comandos con `sudo -l -U deploy`) | Run `38424321257` success con todos los pasos (incl. `ef-nginx-verificar`); `storage/` y `storage/examenes` `www-data:www-data` 750; `sudo -u www-data test -w` OK; `logs/uploads/informes` intactas en 2750; `examenfacil.cl` 200 |
| **`support.md` línea 69**: el arreglo (código `deploy:www-data`, runtime `www-data` 750/640, nunca `chown -R /var/www/`) estaba sin commitear y **no lo hizo Claude**. Auditado contra `deploy.yml`: coincide | `.claude/agents/support.md`, sin commit | Le falta `storage` en el bucle tras `882ebd2` |
| **Sudoers, restos**: `deploy-examenfacil-boveda` quedó en 644 (debe ser 0440; `visudo -c` lo marca) y el `chown` de `storage` está también en la línea 10 de `/etc/sudoers.d/deploy` (editado a mano a las 15:37 UTC pese a «NO editar a mano») | VPS | Pendiente, de Jaime (`ef-sudoers-boveda-modo-0440`) |
| 🔴→✅ **CI de `zasa-orchestrator` roto por bombas de fecha** (sin cambio de código): `cobrosRoutes`/`pagosMercadoPago` creaban cobros con vencimiento fijo `2026-10-12` y emisión «ahora» → 400 desde el 13-oct; el extracto esperaba «pendiente» y ya sale «vencida». Tumbó el run de la telemetría (`38426139940`) | `zasa-orchestrator` `27526f1` (emisión fija `2026-09-30` en fixtures; vencimiento relativo a hoy en el test del extracto; sin cambios en `src/`) | 1.865 tests ✓, `tsc` ✓; run `38427413486` success; `/health` = `27526f1`; `dist/data/telemetry.js` con `2026-10-13-a` |
| **Bloqueos del modo automático**: la lectura de MySQL de producción (aunque `READ ONLY`), crear una skill para lanzar esas lecturas, y una de dos ediciones de `deploy.yml` (pasó al reintentar con autorización explícita). En el Code tab **el `!` no ejecuta comandos**: van a Git Bash | memoria `modo-automatico-bloqueos-vps` | — |

### 0.m · 2026-10-13-b — Gran Consejo V4.0: doctrina, menor privilegio y guardia en agentes

Todo en repos **sin CI**: no despliega nada. Doctrina completa en `Workspace_Agencia/doctrina/CONSEJO_V4.md`.

| Qué | Dónde | Verificación |
|---|---|---|
| **Auditoría del Consejo** (12 agentes, 2 skills, guardia) y **especificación V4.0**: 3 agentes Élite (Vera/Pentester, Lucía/MLOps, Sebastián/Cloud Architect), matriz de `tools:`, perfiles P0–P3, plan en 7 fases | `CONSEJO_V4.md` (repo raíz `acfa146` → `44b3c1e`) | — |
| **`support.md`**: `storage/` en el bucle de runtime (igual que `examenfacil-cl` `882ebd2`) + la corrección de la línea 69 que estaba sin commit | `claude-skills` `4f71cbf` | Cotejado contra los dos bucles de `deploy.yml` |
| **Fase 0, delegación nativa de Roberto.** Un subagente SÍ puede lanzar subagentes, hasta 3 niveles (`8a225f6` suponía lo contrario). El Paso 0 lo aplicó Jaime: el modo automático bloqueó a Claude («Self-Modification», también con autorización en el chat) | `claude-skills` `b8c399b` | Idéntico a la propuesta (diff) |
| **Fase 3, `tools:` en los 7 agentes sin Bash**: Felipe, Rodrigo, Doc, Camila, Nacho, Laura y Roberto (`Read, Grep, Glob, Agent`; sin `TodoWrite`) | `claude-skills` `c1734e3` | Prueba de humo: Roberto → `Agent` → Felipe lee el README de la agencia (`# Soluciones con IA`), sin errores |
| **Fase 1, guardia en el frontmatter de agentes: VALIDADA.** El hook corre, se queda dentro del subagente y no restringe la sesión principal. **Hallazgo:** P0 denegaba `SubagentHandback` (10 entregas fallidas) → corregido | `claude-skills` `e179145`; agente de prueba creado por Jaime y ya borrado | Ronda 2: `Read` bloqueado + informe entregado al primer intento; regresión P0 60/60 offline |
| ⏸️ **Fase 2 (P1–P3) en pausa formal**: un clasificador de seguridad detuvo la construcción de los perfiles y Claude no puede volver a producir ese contenido. Arrastra a las Fases 4 y 5. Se descartó un «P3 de administración total» (la guardia solo restringe) | `CONSEJO_V4.md` §7 (`ec4d639`) | `guardia.ps1` sigue solo con P0 |
| **Skill `/git-sync`**: push de commits ya hechos solo en `claude-skills` y en el repo raíz; se niega en repos con `.github/workflows/`, sin `--force`, no commitea | `claude-skills` `cddda7f` | Usada 3 veces con éxito (`e179145..cddda7f`, `7993de5..ec4d639`, `ec4d639..44b3c1e`) |
| **Fase 6 (parcial)**: `REGLAS_DE_ORO.md` (10 reglas: Zero-Trust, prohibido escalar, secretos, evidencia) y `PROTOCOLO_INTERACCION.md` (matriz, reglas de `SubagentHandback`) a V4.0. Se retira la figura de «Victoria», que nunca existió como agente, y el nombre completo de Jaime de la cabecera | repo raíz `44b3c1e` | `CONSEJO_PROFESIONAL.md` (V3.0) sigue como histórico |
| **Doctrina versionada**: excepción `!Workspace_Agencia/doctrina/` y **contra-excepción para `CEO_PERFIL_JAIME.md`** (queda fuera de git) | repo raíz `acfa146` | `git check-ignore` ✓; `ls-files` sin el perfil |
| **Inventario de modelos de IA en producción**: `deepseek-chat` (agente de Sofía), `claude-haiku-4-5` (clasificador de Sofía), `claude-sonnet-5` (M. Jesús), `gemini-2.5-flash` (ExamenFácil). 🔴 `claude_handler.php` de EF apunta al App Platform retirado | `CONSEJO_V4.md` §4.3 | Solo código; `.env` de producción sin mirar |

### 0.n · 2026-10-13-c — Backlog en Linear y primera tanda cerrada

| Qué | Dónde | Verificación |
|---|---|---|
| **Linear poblado** desde este handover: 7 proyectos (`P-SOL-1` EF · `-2` Cockpit/VIP · `-3` Landing · `-4` Consejo/tooling · `-5` Infra/seguridad · `-6` Gambusas · `-7` AuditorLegal), issues `SOL-5..38` + `SOL-39`, etiquetas `bloqueado-jaime`/`claude-local`/`toca-producción`/`seguridad`; onboarding `SOL-1..4` cancelado | linear.app/solucionesconia | Lecturas por MCP tras cada escritura |
| 🔴→✅ **`claude_handler.php` dado de baja (SOL-7).** URL fija a App Platform muerto y `?test` **público sin auth** (no estaba en la lista de bloqueo del vhost): mandaba el Bearer del orquestador y datos del paciente a ese host (riesgo de toma de subdominio). Evidencia previa: 0 peticiones en 14 días de `access.log` (control: 2.144 `/health.php`, 69 `/api_handler.php`) y sin cron de `brain_sync.php` | `examenfacil-cl` `aa75935` (borra `claude_handler.php` y `admin/brain_sync.php`; `claude_handler` en la regex de bloqueo de `examenfacil.cl.nginx`) | Vhost aplicado ANTES del push con `EF_VHOST_MODO=aplicar ef-nginx-verificar` (respaldo `/root/nginx-backups/examenfacil.cl.pre-sync.2026-10-13-213555`, `nginx -t`, reload); run `38472048337` success con «vhost coincide»; `?test` → **403** desde fuera; ficheros fuera del web root; Bóveda intacta |
| ✅ **Sudoers (SOL-6):** `deploy-examenfacil-boveda` ya estaba en 0440; quitada la línea 10 duplicada de `/etc/sudoers.d/deploy` (respaldo + `visudo -cf` + `mv` atómico) | `~/diag/sol6-sudoers-quitar-linea10.sh`; respaldo `/root/backups-sudoers/20261013T211052Z` | `visudo -c` 8/8; `sudo -l -U deploy` conserva los 3 comandos de `storage` |
| 🟡 **SOL-5 cerrado por decisión de Jaime** con evidencia parcial (18 registros de `exam_counters`). **`sin_ruta`/`total_post_19sep` siguen SIN medir** → SOL-39. El script ya vive en `~/diag/ef-boveda-conteo.php` (estaba solo en un scratchpad; sha256 idéntico) | Linear SOL-5, SOL-39 | — |
| ✅ **Claims de la landing (SOL-18):** se mantienen tal cual por decisión comercial. Producción = `6b9bacd` (posterior al `5b1218b` de §0.i) | `index.html` l. 319-320, 390, 402-404, 409 | `curl` vía CF |
| ✅ **`cockpit-consejo-datos-obsoletos` CERRADO (SOL-24):** `marco.md` (descripción + 11 referencias) y `ana.md` sin App Platform; `inicio-sesion` 11 repos / 7 endpoints; `cierre-sesion` con memoria en `C--Proyectos`; `creative.md` sin «2.400 análisis» | `claude-skills` `45eb0d8`, `90f0ccf` (push con límites de `/git-sync`) | Script sin red devuelve 11 repos; hook parsea |
| ✅ **Respaldo con tokens borrado (SOL-31)** por Jaime; el resto del scratchpad de `f55dc836` sin secretos (SHA y digests Docker) | — | `ls` |
| Memoria de agosto huérfana (`C--Proyectos-Workspace-Agencia/memory/`): migrada limpia `cliente-nuevo-solo-una-fila`; las otras dos descartadas (una lleva datos personales de un tercero; borrarla es de Jaime) | memoria | — |
| ⏸️ **Autonomía de despliegue para los 5 agentes técnicos** (decisión de Jaime): bloqueada como «Permission Grant». Redactados en el chat el texto de §5.4 de `CONSEJO_V4.md` y un `autoMode.allow` para `.claude/settings.json`; **los aplica Jaime**. Contradice SOL-23 | — | Sin aplicar |

### 0.o · 2026-10-13-e — Cola de Linear y embudo de la landing

| Qué | Dónde | Verificación |
|---|---|---|
| ✅ **SOL-9:** `snippets/vip-portal.conf` SÍ se carga, vía `include /etc/nginx/snippets/vip-portal*.conf;` en el vhost de **solucionesconia.cl** (no de vip.). El grep del 07-oct buscaba el nombre literal y el glob lo ocultaba | `nginx -T` l. 1627; `CLAUDE.md` raíz `0698c17` (decía que lo instalaba `instalar-plantillas.sh`: falso) | Lectura filtrada, sin volcar el snippet |
| 🔴→✅ **SOL-10:** la línea 3 del snippet vivo era un comentario con **API_SECRET_TOKEN y EDGE_SECRET en claro**. Reescrita sin valores. Ningún script gestiona el snippet: `deploy.sh` dejó de renderizarlo en `594f6e2`, `instalar-plantillas.sh` no lo incluye y solo `rotar-secretos-borde.sh` lo toca (con un `sed` que compara recuentos, así que no se rompe) | VPS (respaldo `/root/backups-nginx/sol10-20261014T015127Z/`, **con los secretos viejos: borrarlo, Jaime**); plantilla `solucionesconia` `54cd7c4` | 6 → 5 líneas con secreto, todas `proxy_set_header`; diff efectivo 0; `nginx -t` ok (sin reload); plantilla = vivo en config efectiva (65 líneas) |
| ✅ **SOL-21:** informe de propuesta de valor commiteado | `solucionesconia` `d167ba6` | Revisado: sin datos de clientes ni cifras inventadas |
| ✅ **SOL-33:** PM2 ya rota con `/etc/logrotate.d/pm2-root` (desde el 16-sep: daily, rotate 14, maxsize 20M, copytruncate) | VPS | 14 generaciones, 468 KB en total; **no** instalar `pm2-logrotate` |
| ✅ **SOL-19, embudo anónimo de la landing EN PRODUCCIÓN.** `visita` → `cta_clic/{hero,tarjeta,cierre}` → `chat_abierto/{cta,burbuja}` → `chat_mensaje` (1 por apertura) → `reserva`. Totales diarios por día de Chile, sin IP, cookies ni filas por visitante. `POST /api/sales-agent/evento` (pública exacta en `RUTAS_PUBLICAS`, Origin exacto de la landing, lista cerrada, 512 B, 30/min/IP; sin tocar nginx) y `GET /api/analytics/landing` (staff) | `zasa-orchestrator` `ec614fb`; landing `fa663c5` + `0e5b7ef` (`mode: "cors"`: en no-cors el CORP de helmet dejaba un error de red por evento) + `90c6748` (escucha el widget y `?v=20261014-embudo`); widget `admin_solucionesconia` `923f625` (emite `sofia:abierto|mensaje|reserva` en `window`, sin datos personales). Memoria `embudo-landing-anonimo` | 26 tests nuevos y suite 1.890 ✓. Desde fuera: 400/403/401 correctos. Bundle publicado = local (`e29ffcfc0ae0`). Chromium contra la web real: 204 por evento, 0 errores, sin llamadas a `/chat` ni `/book`. Lectura en loopback: llegan a Postgres. **Descontar el día 2026-10-13 (Chile): son todo pruebas** (4 visita, 2 cta_clic/hero, 1 chat_abierto/burbuja) |
| 🟡 **SOL-35, Gambusas.** (1) Cabeceras duplicadas en la API (`webhook_wa`: CSP, Referrer-Policy con 2 valores y nosniff; `webhook_mp`: nosniff): la única fuente pasa a ser nginx. (2) `location ~ ^/api/webhook_(wa\|mp)\.php$` con `limit_req zone=webhook_limit burst=60 nodelay` + 429 | `gambusaschile` `e88c1d0` (deploy `38502271905`); vhost VPS (respaldo `/root/backups-nginx/gambusaschile.cl.sol35-20261014T024449Z`) | 0 duplicados vía CF; WA sin token 403, MP sin firma 401, tienda 200; ráfaga en loopback de 400 → **176 × 429**. Falta el «Probar» de Meta (Jaime). La zona la comparte `/api/webhook` de El Rincón (`burst=50`). El vhost de Gambusas **no está versionado** |
| Revisión de uso real (SOL-11/12/13) en `access.log` desde el 06-oct | Linear | 0 logins de cliente, 0 descargas de operador. 5 × `POST /api/webhook/leads` 200 (10 y 12-oct) = **pruebas de Jaime**: la entrega del webhook funciona, pero no hay ninguna reserva real |

### 0.p · 2026-10-14-a — ExamenFácil: auditoría, seguridad, precios y Meta

Todo en `examenfacil-cl`, desplegado por `deploy.yml` (runs en verde) y verificado por loopback y desde fuera. Producción = `0d2753a`. Linear: SOL-47..51.

| Qué | Dónde | Verificación |
|---|---|---|
| **Skill `/ingenieria-flujo`** (4 pasos obligatorios). Jaime añadió después auditoría preventiva (GET 405 + rate limit) y pen-test básico: **sin commitear** | `claude-skills` `235f001` (pusheado); `.claude/skills/ingenieria-flujo/SKILL.md` modificado | SOL-51 |
| **Auditoría integral de solo lectura** (estructura, dependencias, credenciales, monetización): 6 hallazgos | Informe en el chat | SOL-49 |
| 🔴→✅ **Token de Meta Ads literal** en `admin/finanzas.php` (en git desde `f4c88f9`, 14-may) → constante `META_ACCESS_TOKEN`; sin la constante el bloque de ROI se omite | `4504ecb` | 0 literales en el árbol; **el token viejo sigue en el historial y se vio en parte en el chat: revocarlo (SOL-47)** |
| `api/voz/interpretar.php`: control de acceso de `get_informe.php` + rate limit (antes leía `informes/<payment_id>.json` sin auth) | `9e1c583` (sesión paralela; `limitador_tasa.php` nuevo, falla abierto) | 405 a GET; camino autenticado sin E2E |
| Rate limit 10/15 min en `crear_preferencia.php` | `a5ef0fa` | Desplegado |
| Guardia CLI en `auditoria_12h`, `vigilancia_qa`, `ab_engine`, `sync_dev_costs` | `560e382` | 403 |
| `my-video/`, `scratch/`, `stitch_output/`, `playwright.config.ts`, `package.json` fuera del web root, en **dos tandas** por `--max-delete=40` | `36ca2b2` (37 borrados) + `52c8d3f` (32) | 404 |
| **Precios**: mostrados = cobrados (`97aeb54`), luego matriz nueva: informe $2.990, Personal $4.990/mes, Familiar $9.990/mes «hasta 5 integrantes» + texto «+$2.990/mes por integrante adicional» (**no se cobra**: no hay gestión de integrantes). 3 meses de prueba | `97aeb54`, `fbea62a` | Producción sirve los precios nuevos; sin suscripción real de prueba (SOL-50) |
| **`crear_suscripcion.php` blindado**: un GET sin parámetros creaba un `preapproval_plan` real en MP. Ahora solo POST (405), rate limit, `nivel` ∈ {2,3} y email válido (400), errores de MP solo al log | `0d2753a` | Loopback: 405/400/400; sha del VPS = commit |
| **Meta en el VPS**: `META_ACCESS_TOKEN` y `META_PAGE_ID` (`2401780186813670`) en `/etc/examenfacil/config_secret.php`, ahora **`root:www-data 640`** y carpeta `root:www-data 750` (antes `www-data` dueño). Script **`/root/bin/ef-meta-token`** (root 700): pide el token con `read -s` (o `-f fichero`), respaldo, sustitución atómica por stdin, `php -l`, permisos, y solo imprime el HTTP de `/me` | VPS; respaldos en `/root/backups-examenfacil/` (020701, 022910-meta, 040723-pageid; el de 03:20 se borró con `shred`) | El token cargado (de usuario) **ya es inválido** (190/467). `META_PAGE_ID` no lo lee ningún código todavía |
| **Conector MCP de Meta Ads** validado en lectura: cuenta `857378264622577` activa, CLP, mínimo diario 993; **sin portfolio comercial**, sin campañas, sin píxel, sin Instagram; página «Examen Facil» (leadgen ToS sin aceptar). Crea en **modo borrador** (no publica hasta `ads_activate_entity`). No hace publicación orgánica | MCP | — |
| **Plan de conexión estable** (investigado): Usuario del sistema con token sin caducidad + app Business en Live + publicador propio en el VPS + skill con aprobación humana | SOL-47 (Fase 1, Jaime) y SOL-48 (Fases 2-3, Claude) | — |
| Diagnóstico de salud final: servicios activos, `nginx -t` ok, disco 14 %, cert de origen hasta 25-nov-2026, `health.php` autenticado OK. Único 500: UptimeRobot a las 01:07:34 UTC, **dentro de la ventana de un deploy** (el deploy de EF no es atómico) | VPS | — |


### 0.r · 2026-10-16-a — SOL-53 cerrado (fases 5 y 6) y SOL-57 arrancado (F0 y F1)

Todo en `examenfacil-cl` (push a main = deploy) salvo lo indicado. Producción EF = `a45b890` + `8e59501`; orquestador = `2834563`.

| Qué | Dónde | Verificación |
|---|---|---|
| **SOL-53 fase 5: insights de Meta a 24/72 h.** Tabla `agg_social_insights` (PK uid/red/ventana/métrica), `cli/social_insights.php` (instalar \| medir \| ver), versión de Graph por constructor en `meta_graph.php`. Tolerancia de 12 h, corte tras 5 fallos de red, correo si una ventana vence sin medir, solo el error 100 (salvo 100/33) se guarda como definitivo | `35cb60c`; cron `/etc/cron.d/ef-social-insights` a :17 con flock + logrotate | Tests 40/40. **Sonda real con v24.0** (la lanzó Jaime): permisos `read_insights` + `instagram_manage_insights` OK; IG foto 9/9, IG Reel 9 (sin `profile_visits`/`follows`, que Meta no da para Reels), FB Reel 5/5. Retiradas confirmadas: `impressions`, `plays`, `post_impressions_unique`. 🔴 El post #1 de FB **ya no existe** (lo borró Jaime): su ventana se pierde y manda un correo, es esperable |
| **SOL-53 fase 6: metadata de MP sin datos de salud** (condición de Nacho, vencía el 01-12-2026). Nombre, email, WhatsApp, semáforo, hallazgos, condición y archivo pasan a `pagos_checkout` bajo `external_reference` aleatoria `EF-<32 hex>`; a MP solo van `ef_ref`, `ef_src` y `ef_cmp`, y el ítem tiene descripción neutra. Webhook, `estado_pago` e `informe_completo` leen de ahí y caen a la metadata vieja en preferencias anteriores. El webhook borra la fila tras guardar los datos clínicos | `1adbf36` (librería sola, para que el rsync no deje un `require_once` roto) + `43b49c6`; cron `/etc/cron.d/ef-checkout` a :47 | Tests 46/46. Caducidad **24 h** y purga **48 h** (Nacho: alineado con la vida del examen subido). **Probado en real** el 16-oct a las 22:24: MP aceptó `expiration_date_to`, mostró el pago de $2.990, `pagos_checkout` con 1 fila y `pago_iniciado instagram 1`. Falta el pago aprobado |
| **SOL-57 F0: la cola gana rastro auditable.** Huella de aprobación (lo que cambia tras aprobarse vuelve a borrador); `cli/social_cola.php` con `SELECT … FOR UPDATE` y el rastro en la MISMA transacción (si falla el rastro, no hay aprobación), también los intentos denegados; `social_revisiones` solo-append, `social_comentarios` a 90 días, `social_salud`; `cli/social_panel.php` (contrato JSON por stdin/stdout, lista blanca, solo `humano:*` aprueba); `ver`, `pedir-cambio`, `purgar`, reenvío por `agregar` | `f16976f` + `825ca0b` + `a45b890` | Tests 83/83 y 51/51. **Smoke contra la base real 31/31** con fila desechable programada en 2027 y borrada. Destapó un fallo real (`a45b890`): un comentario rechazado por datos personales no dejaba rastro |
| **SOL-57 F1: módulo Publicaciones en el orquestador, solo lectura.** `execFile` sin shell del CLI de EF, hijo a www-data con entorno mínimo, watchdog con SIGKILL, 2 procesos a la vez; `GET /api/admin/social/semana\|indicadores` con rol admin, 405, cuota por operador, 502 sin filtrar nada de EF y 503 si está ocupada | `zasa-orchestrator` `b8646ef` + `687c629` | Tests 67/67 (incluido el ejecutor real con node haciendo de PHP). **Desplegado con el módulo APAGADO**: sin `PUBLICACIONES_HABILITADO` no existe ninguna ruta |
| **El CI de EF ya mira el PHP**: `php -l` de los 87 ficheros y 6 suites antes de desplegar. Antes un error de sintaxis llegaba a producción y solo se veía en un 500 | `825ca0b`, run `39006089876` | «Sintaxis OK en 87 ficheros» + las 6 suites en verde en el propio run |
| **Hallazgos de Nacho fuera de alcance, cerrados** en una sesión aparte: logs de pago sin el mensaje crudo de las excepciones (un «Duplicate entry» dejaba el email en claro), prompt de Gemini sin el nombre del paciente, enlace de términos en `pago.html` | `8e59501` | Deploy en verde; 0 líneas de la fase 6 tocadas |
| **Arquitectura de SOL-57 decidida con el Gran Consejo** (Roberto, Felipe, Marco, Valentina, Nacho): **opción B** (el orquestador ejecuta la CLI de EF). Descartadas la A (usuario MySQL en la base clínica: obligaría a duplicar huella y filtro en TypeScript) y la C (endpoint HMAC en loopback: aflojaría las guardas de solo-CLI y añadiría un secreto). Nacho la aprobó con 10 condiciones, todas aplicadas en F0 | Linear SOL-57 | — |

**QA de Ana en las 4 fases, con 3 hallazgos serios aplicados:** (1) en la fase 5, el error 100/33 («sin permiso u objeto») se guardaba como definitivo y habría quemado la primera ventana; (2) en F0, `desaprobarPorCambio` podía pisar lo que otro cron acababa de publicar; (3) en F1, `SOCIAL_CLI_UID=0` solo dejaba un aviso y el plugin se registraba igual, así que la CLI de EF habría corrido **como root** sobre ficheros que www-data puede escribir.
### 0.q · 2026-10-15-c — Meta estable, publicador en producción y embudo anónimo (fases 0-4)

Todo en `examenfacil-cl` (push a main = deploy, runs en verde) salvo lo indicado. Producción EF = `6c459e0`.

| Qué | Dónde | Verificación |
|---|---|---|
| **SOL-47 casi cerrado**: verificación de negocio aprobada (15-oct); cuenta publicitaria `857378264622577` e IG `17841418692590130` en el portfolio `416040459257296`; app «ExamenFacil» `1703697990765821` en **Live**; Usuario del sistema **`ef-publicador` `61595660661121` (Employee)** con Página (Contenido+Estadísticas), Ads (Ver rendimiento), App (Desarrollar). El permiso directo de IG falla siempre (`oidclink` de Meta): no hace falta, IG se publica vía la Página | Meta Business Suite; `/etc/examenfacil/config_secret.php` (respaldo `/root/backups-examenfacil/20261016-031654-meta-1295800`) | debug_token: SYSTEM_USER, expires_at 0, data_access_expires_at 0, 8 scopes; `content_publishing_limit` 100/24 h. ⚠️ «ExamenFacil-Bot» (Admin) existe de antes: no usar ni revocar sin saber si algo lo usa |
| **SOL-48 cerrado (fases A–E)**: `cli/social.php` (cola, reclamo atómico, estado por red, topes 08–22 h / 3 por día / 3 h, alertas), `cli/meta_graph.php`, `cli/social_filtro.php`; vhost `/cli/` 404 y `/social/` solo jpg/png/mp4; `--exclude='/social/'`; cron `/etc/cron.d/ef-social` (www-data: publicar */10, salud 12:30 UTC) + logrotate | `b70fc3f`, `146f64f`; cron/logrotate a mano en el VPS | 1.ª vuelta del cron OK; post #1 (FB + IG) y Reel #2 (FB `/reel/1754028152343438/`, IG `reel/Deir_P4iSeU`) publicados con aprobación de Jaime |
| **Filtro legal (criterio de Nacho) + REGLA DE ORO B16**: nunca razón social, domicilio ni RUT en redes (siguen solo en el sitio) | `7ee0001`, versión `2026-10-16.3` | 53/53 pruebas; post #1 corregido en FB por API; en IG lo editó Jaime a mano (la API no edita captions; a las 04:41 UTC aún salía el texto viejo) |
| **Plantillas Remotion gratis** `PostEF` (4:5) y `ReelEF` (9:16, 16,5 s) + `my-video/render-reel.sh` (yuv420p, AAC silencioso) | `fef694c`, `4356815` | Usadas en los 2 posts reales |
| **GA4/GTM retirado** (opción A de Jaime) y **privacidad.html** con el texto de Nacho | `81e49fc`, `5df6601` | 0 restos de GTM por loopback y CF |
| 🔴→✅ **Fase 0**: `webhook_mp.php` llamaba a `enviarEmailConfirmacion()` antes de su require (desde `49d88f4`, 25-may) → fatal en cada pago aprobado, cliente sin enlace mágico. Latente (0 pagos aprobados desde el 29-abr). Emails y datos de salud fuera de los logs de pago | `89a5855` | sha = commit; falta un pago real |
| **SOL-53 fases 2–4**: `agg_embudo_diario` + `evento_embudo.php` (POST, Origin exacto, 512 B, 120/10 min HMAC(IP)+pimienta diaria, sin access_log) + `cli/embudo.php`; contadores de servidor `pago_iniciado`/`pago_aprobado` blindados (tras responder / tras el correo, try/catch Throwable); `embudo.js?v=20261016` en index y pago | `7291f2a`, `6a1df6a`, `6c459e0`, `0e812af` | Loopback 19/19; Chromium real: visita instagram + campaña del Reel en la tabla (borrada). QA de Ana en cada fase |
| **Linear**: SOL-52 (condiciones de Nacho para autonomía, aceptadas), SOL-53..56 (crecimiento: medición, panel, estratega, investigación), SOL-57 (módulo «Publicaciones» del Cockpit). SOL-54 movido al Cockpit | Linear | — |

---

## 1 · Abierto, por cercanía a producción

1. 🔴 **Verificaciones que solo da el uso real** (no forzarlas con datos falsos):
   - Una descarga real con sesión de operador en vip. (Novedades o Portales) → cierra la brecha 5 al 100 %.
   - Un cliente real entrando al portal tras el hardening (200 en `/api/vip/*/verificar|perfil` en `access.log` después de las 15:23 UTC del 06-oct).
   - `ag-webhooks` en verde con la próxima reserva real de Sofía; además limpiar el lead y el evento de Calendar de la prueba E2E del 22-sep.
2. ✅ **CERRADO en 2026-10-08-a (`e995a96`, §0.d).** Texto original: `rotar-secretos-borde.sh` abortará en la próxima rotación (nuevo, 2026-10-08): su precondición (línea 101) exige que el vhost de vip. NO lleve el Bearer maestro, y desde el 07-oct lo lleva en `^~ /clientes/assets/` —hoy versionado y aprobado como `AUTHZ_VIP`—. Además la compuerta del paso 3 (línea 134) calcula el diff esperado de vip. contando solo `EDGE_SECRET`. Arreglo: alinear ambas líneas con la excepción `AUTHZ_VIP` (contar `API_SECRET_TOKEN` en vip. solo dentro de ese location) y un test. Hacerlo ANTES de cualquier rotación.
   - ✅ **Brecha 2 CERRADA el 2026-10-08** (ver §0.c). Nota: el «A2» que listaba el handover anterior no existía: `portal-vip.ejs` e `informe.ejs` solo nombraban `portal-vip.js` en comentarios.
3. ✅ **Brecha 7 CERRADA el 2026-10-09** (`fd37d38` + `0827a4c`, §0.e). Quedan dos pendientes descubiertos al desplegarla:
   - ✅ **Firewall CERRADO el 2026-10-09 a las 07:12 UTC.** Jaime activó la nube naranja en `gambusaschile.cl` y `www` (DNS 1.1.1.1/8.8.8.8/autoritativo → `104.21.56.227`, `172.67.137.169`). `nslookup` de los 10 hostnames: 0 directos al VPS. Borradas las 4 reglas `Anywhere` con deadman de 10 min (`/root/backups-ufw/20261009-071147/`, `restaurar.sh`; desarmado tras verificar). Quedan solo los 22 rangos de CF (15 v4 + 7 v6) en 80/443. Verificado desde fuera: 10/10 hostnames 200/301 vía CF; `http(s)://161.35.85.101/` → `000`; SSH con conexión nueva OK; `certbot renew --dry-run` 6/6 (Gambusas incluido). Rollback: `bash /root/backups-ufw/20261009-071147/restaurar.sh`.
     - ✅ **CERRADO el 2026-10-10 (§0.f): Meta llega vía CF** (POST 200 del 09-oct a las 08:21/08:22 UTC). Texto original: 🟡 **Sin probar: la llegada real de Meta vía CF.** No hay tráfico de Meta a `/api/webhook_wa.php` desde el 04-oct. Testigo propio vía CF: GET con token falso 403 y POST sin firma 401 (los rechaza el PHP, no CF; `real_ip` da la IP real). Falta que Jaime pulse «Probar» en el panel de Meta o mande un WhatsApp; si CF lo bloquea (Bot Fight/WAF), excepción para esa ruta.
     - Texto original: 🔴 **Firewall abierto por Gambusas (bloqueado por Jaime).** `ufw` tenía `80/tcp` y `443/tcp` `ALLOW Anywhere` (v4+v6) desde el **2026-10-04 03:24 UTC**, además de los 22 rangos de CF: el origen es alcanzable saltándose Cloudflare y `real_ip` puede falsearse. NO es un descuido: `gambusaschile.cl` y `www` resuelven DIRECTO a `161.35.85.101` (nube gris). El 09-oct Claude borró esas 4 reglas, la tienda dio timeout y se restauraron (rollback autorizado por Jaime; 200 de nuevo; respaldo de las reglas en `/root/backups-ufw/20261009-*`). Orden para cerrarlo: (1) Jaime activa la nube naranja en `gambusaschile.cl` y `www` (SSL Full strict); (2) comprobar que responde con IP de Cloudflare y que el webhook de WhatsApp de Meta sigue llegando; (3) `nslookup` de los 10 hostnames; (4) `ufw delete allow 80/tcp` y `443/tcp` con deadman switch, verificando desde fuera.
   - ✅ **CERRADO el 2026-10-10 (`9b2faf3` + `594f6e2`, §0.f): `deploy.sh` ya es no destructivo y seguro**, y se usó para republicar la landing. El vhost de `solucionesconia.cl` ya no lo gestiona ningún script: cambios de CSP/cabeceras a mano con respaldo + `nginx -t` (la plantilla vieja: `git show 0827a4c:deploy.sh`). Texto original: 🟡 **Refactorizar `deploy.sh` de `solucionesconia` antes de volver a usarlo.** Hoy es destructivo: (a) su sección 6 hace `ufw allow 'Nginx Full'` (la desviación del 22-sep); (b) no hace `git pull`, y con el clon atrasado su `rsync --delete` borraría lo que falte en el clon (el 09-oct habría borrado `/acceso`); (c) regenera `vip-portal.conf` desde la plantilla de este repo (13 `location`, solo 2 secretos, `640`), que pisaría el snippet vivo (16 `location` con `AUTHZ_VIP` y `/clientes/assets/`, `600`) de `instalar-plantillas.sh`. Arreglo: quitar la sección 6, añadir `git pull --ff-only` con abortado si falla, y dejar una sola fuente de la plantilla del snippet (o que `deploy.sh` no lo toque). Hasta entonces, publicar ficheros sueltos como en §0.e.
4. **A1** (Baja): schemas Fastify (1 de 35 rutas los declara; el resto valida a mano).
5. Opcional: `clienteAuth.ts` → `export *` del índice de `identidad/`.
6. Rareza: el render de `vip-portal.conf.plantilla` escribe los dos secretos en un comentario (línea 3) del snippet vivo.
   - ✅ **Desviación de nginx en vip. CERRADA (2026-10-08, `31ca36b`)**: el bloque `location ^~ /clientes/assets/` vive en la plantilla versionada y `instalar-plantillas.sh` lo renderiza con los secretos vigentes; reinstalar ya no lo borra. Queda la consecuencia sobre `rotar-secretos-borde.sh` (punto 2).
   - **Sin confirmar**: un `grep` del 07-oct no encontró ningún `include` literal de `snippets/vip-portal.conf` en `sites-available/`, `sites-enabled/`, `nginx.conf` ni `conf.d/`. Antes de dar por activos sus bloques (incl. `/acceso/` de la brecha 8 y `/vip/`, que en vip. cae en la SPA), comprobar si se carga por otra vía.
7. Heredado: rotar la credencial de julio de ExamenFácil si no se rotó; Gambusas: cabeceras duplicadas y `limit_req` del webhook WA, `meta-sync` sin `INSTAGRAM_BUSINESS_ACCOUNT_ID`, token de WhatsApp sin WABA (Jaime); `pm2-logrotate`; bandeja `ventas@`, compra real del pack $14.990, DMARC `p=quarantine`.
8. **Landing (§0.i)**: (a) de Jaime, confirmar los claims publicados «0 tareas repetitivas a mano», «experiencias 3D» (sin caso que mostrar) y «Lista en semanas»; (b) p95 real de latencia de Sofía para «<30 s» (`sc-landing-metrica-latencia-sofia`); (c) la landing no mide conversiones: ni clics de CTA ni aperturas del chat (`sc-landing-medicion-conversiones`); (d) commit del informe de `docs/`; (e) llenar el pilar de autoridad (un caso y una cifra reales, con permiso del cliente).
9. ✅ **CERRADO de verdad el 2026-10-12 (§0.j + §0.k): los 4 pipelines que despliegan están en `ubuntu-24.04` + `checkout@v7`** antes del **2026-10-19**: `zasa-orchestrator` (`663da53`), `admin_solucionesconia` (`01102ef`), `examenfacil-cl` (`2548ef7`) y `GambusasChile` (`ea3e118`), todos con run success y 200. 🔴 **Corrección:** el cierre de 2026-10-11-a decía «los dos repos con CI de despliegue» y daba el frente por cerrado mirando solo zasa; quedaban EF, Gambusas y Jose. Lección en la memoria `frente-transversal-barrer-todos-los-repos`. El de Jose no cuenta: nunca tuvo remoto (§0.k). (Lo de `deploy-1gb.yml` se cerró el 10-oct en `912b98f`.)
10. **Gran Consejo (§0.j, §0.m)**, por riesgo:
    - 🔴 **Riesgo abierto**: Valentina, Marco, Ramón, Ana y Diego siguen **sin `tools:`** y heredan todo (Bash, SSH, push, MCP de GitHub). Depende de la Fase 2 (P1–P3, en pausa) y de la Fase 5. Mientras tanto vale la mitigación de `CONSEJO_V4.md` §5.4 (reglas `ask` para `ssh`/`scp`/`git push`, con OK de Jaime).
    - ⏸️ Fase 2: reanudarla es decisión de Jaime (diseñar él los perfiles u otra vía), nunca rodeando el bloqueo.
    - Fase 6: marcarla como parcial en `CONSEJO_V4.md` y decidir si `CONSEJO_PROFESIONAL.md` (V3.0) se archiva o se borra.
    - De Jaime: su nombre completo sigue en el historial publicado del repo raíz (`acfa146`, cabecera V1.0 del Protocolo). Quitarlo exige reescribir el historial: decisión suya.
    - ✅ **CERRADO el 2026-10-13-b:** `CEO_PERFIL_JAIME.md` fuera de git y doctrina versionada (`sc-doctrina-versionada`); `support.md` con `storage` y línea 69; push de `81a24a8`.
    - ✅ **CERRADO el 2026-10-12 (§0.k):** `settings.local.json` purgado. Tarea `cockpit-settings-local-reglas-riesgo`.
    - 🟡 **Datos obsoletos de agentes y skills** (`cockpit-consejo-datos-obsoletos`, 40 %). Hecho: IP y deploy de `support.md`/`ramon.md` (§0.k). Falta: `support.md` línea 69 `chown -R www-data:www-data /var/www/` (contradice al pipeline, que deja el código `deploy:www-data`: si Diego lo ejecuta, el siguiente deploy de EF choca), su tabla de sitios (`/var/www/elrincon`, `/var/www/solucionesconia`) y su `description` («deploy via rsync/SSH»); `marco.md`/`ana.md` con DO App Platform; `inicio-sesion` dice «6 repos»; `cierre-sesion` apunta la memoria a `C--Proyectos-Workspace-Agencia` (la real es `C--Proyectos`); `creative.md` propone una cifra de prueba social sin fuente.
    - De Jaime (Jose, §0.k): probar la restauración del `.gpg` con 2 de 3 shards y sacar una copia fuera del portátil; borrar `settings.local.json.bak-20261012` del scratchpad de `f55dc836` (lleva tokens retirados). Queda una regla fija en `settings.local.json` con la ruta vieja `…\Agencia_Solucionesconia\Clientes\Jose`: inofensiva.
    - De Jaime: ¿`doctrina/CEO_PERFIL_JAIME.md` entra en el repo raíz o va como contra-excepción? Lleva datos personales sensibles (de Jaime y de un tercero). Luego, commit de `.gitignore` + `doctrina/` en `agencia-root-orchestrator` (sin CI). Tarea `sc-doctrina-versionada`.
    - Fase 2 del piloto: decidir entre `context: fork` (verificar que existe en esta instalación) o skills con guarda solo en sesión dedicada; verificar `disable-model-invocation` y `model:`; push de `81a24a8`. Tarea `cockpit-consejo-skills-piloto` (65 %).

## 2 · Estado de los repos al cierre

- **Al cierre de 2026-10-16-a:** `examenfacil-cl` `main` = `origin/main` = producción en `8e59501` (último de código; `a45b890` fue el anterior). `zasa-orchestrator` = `2834563` (telemetría; código en producción `687c629`), con DOS respaldos sueltos sin rastrear: `src/data/telemetry.ts.bak-20261016111224.` y `...bak-20261017060427.`, que hacen fallar 2 tests de la suite local. `Elrincon-backend` y `AuditorLegal` siguen con cambios ajenos sin commitear (no tocados). El repo raíz tiene `CLAUDE.md` modificado por Jaime (reglas de ahorro de tokens) + este handover.

- **`zasa-orchestrator`:** limpio; `main` = `origin/main`; producción en `d52903e` (verificado por `/health` el 2026-10-08 a las 22:45 UTC). `e995a96` = refactor AUTHZ_VIP; `d52903e` = telemetría 2026-10-08-a. Cadena de la Brecha 2: `ae67d08` → `e6f22e9` → `31ca36b` → `fb81202` → `2621c00`, todos con Actions success.
- **nginx del VPS:** = plantillas de `2621c00` (`--comprobar`: admin., vip., realip y seg «idénticas a la viva»). Respaldos de la Brecha 2 en `/root/backups-nginx/instalar-plantillas-20261008-*` y `/root/backups-brecha2/`.
- **Postgres:** inquilinos `demovip`, `forte-spa`, `yami-spa` activos; `liset` suspendido.
- **`admin_solucionesconia`:** limpio; `main` = `origin/main` = vip. en `67edb57`; widget publicado = repo (sha `20e3275b…`).
- **`solucionesconia`:** limpio; `main` = `origin/main` = clon del VPS = web root en `594f6e2` (publicado entero con `deploy.sh` el 2026-10-10). El clon tiene un `.env.save` sin rastrear (no tocado).
- **`zasa-orchestrator` (2026-10-10):** producción en `c61ffe2` (`/health`); `18f4b68` retiró `acceso.css`.
- **Al cierre de 2026-10-10-a:** `zasa-orchestrator` limpio, `main` = `origin/main` = producción en `21be967` (`/health`). 🔴 `admin_solucionesconia` **ahead 1**: `81e5cbb` (npm audit fix de `nanoid`/`source-map-js`, solo `package-lock.json`, 07:15 UTC) commiteado SIN push y no hecho por Claude; vip. sigue en `e0154f3`. Un push a `main` despliega vip. Quedaron corriendo en el portátil el orquestador (`:3001`) y Vite (`:5173`).
- **Al cierre de 2026-10-10-b:** `admin_solucionesconia` limpio, `main` = `origin/main` = `01102ef`; vip. sirve el mismo build (los tres runs dijeron «nada que desplegar»). `zasa-orchestrator` limpio salvo `src/data/telemetry.ts.bak-20261010172841.` sin rastrear; producción en `035fa3e`.
- **Al cierre de 2026-10-10-c:** `solucionesconia` `main` = `origin/main` = clon del VPS = web root en `5b1218b` (solo `docs/informe-propuesta-valor-2026-10-10.md` sin rastrear). `admin_solucionesconia` en `4645cfe` (vip. y widget). `zasa-orchestrator` en `174002b` (telemetría 2026-10-10-c).
- **Al cierre de 2026-10-11-a (hecho el 2026-10-12):** `zasa-orchestrator` `main` = `origin/main` = `422ba47` (telemetría + CHANGELOG; código en producción `663da53`). `claude-skills` **ahead 1** (`81a24a8`, piloto `nacho`; sin CI). Repo raíz: `.gitignore` modificado + `doctrina/` sin rastrear, sin commit a la espera de Jaime (§1.10). `solucionesconia`: solo el informe de `docs/` sin rastrear.
- **Al cierre de 2026-10-12-a:** `zasa-orchestrator` `main` = `origin/main` = `282624b` (telemetría). `examenfacil-cl` = `2548ef7` y `GambusasChile` = `ea3e118`, ambos publicados. `claude-skills` = `origin` en `80fdbfa`. Repo raíz = `origin` en `ba1ebed` + este handover; siguen sin commit `.gitignore` y `doctrina/` (§1.10). La carpeta del portal de Jose ya no existe en disco.
- **Al cierre de 2026-10-13-a:** `examenfacil-cl` `main` = `origin/main` = producción en `882ebd2`. `zasa-orchestrator` = `36c81dc` (telemetría). `claude-skills`: `agents/support.md` sin commit (no es de Claude). Repo raíz: `.gitignore` + `doctrina/` siguen sin commit (§1.10) + este handover.
- **Al cierre de 2026-10-13-b:** `claude-skills` `main` = `origin/main` = `cddda7f` (limpio). Repo raíz `main` = `origin/main` = `44b3c1e` + este handover. Los repos de producción no se tocaron.
- **Al cierre de 2026-10-13-c:** `examenfacil-cl` `main` = `origin/main` = producción en `aa75935`. `zasa-orchestrator` = `e2cba69` (telemetría). `claude-skills` = `origin` en `90f0ccf` (limpio). `solucionesconia` = `6b9bacd` en producción, con `docs/informe-propuesta-valor-2026-10-10.md` sin rastrear (SOL-21). Repo raíz: solo este handover.
- **Al cierre de 2026-10-14-a:** `examenfacil-cl` `main` = `origin/main` = producción en `0d2753a`. `zasa-orchestrator` = `ee3e555` (telemetría, en producción). `claude-skills` = `origin` en `235f001` + `skills/ingenieria-flujo/SKILL.md` **modificado por Jaime sin commit**. `Elrincon-backend` y `AuditorLegal` con cambios ajenos sin commit (no tocados).
- **`GambusasChile`:** `ea3e118` (CI, 12-oct).
- **`AuditorLegal`:** cambios ajenos sin commitear; no se tocaron.

## 3 · Trampas operativas (nuevas o confirmadas hoy)

- **Widget de Sofía:** importa `src/api/httpCore.ts` y `httpClientWidget.ts`. Cualquier cambio en ellos cambia el widget, y la CI de `admin_solucionesconia` falla hasta commitear `public/widget/vendedor-ia-v17.js` regenerado (`npm run build:widget`), lo que **publica el widget en las webs de clientes**: pedir OK. Cambios solo en `httpClient.ts` (la SPA) ya no deberían tocarlo; comprobar con `git status` tras el build.
- **CSP:** Cloudflare inyecta su beacon en el HTML que ve el navegador, no en el de `curl`. Verificar una CSP con Chromium real (Playwright de `Workspace_Clientes/Elrincon-qa`), no solo por cabeceras.
- **nginx:** un `add_header` en un `location` anula todos los del server block; repetir el juego completo. El vhost de `solucionesconia.cl` ya NO lo genera `deploy.sh` (desde `594f6e2`, a mano con respaldo + `nginx -t`) y el snippet `vip-portal.conf` sale de su plantilla: no editar solo en el VPS.
- **Secretos:** nada que imprima un comando por SSH es privado. Contraseñas nuevas → fichero `600` en `/root` que Jaime lee en terminal aparte; si algún paso falla, `shred` automático. Al volcar `access.log`, ocultar la query (el handshake de Meta lleva `hub.verify_token`). Al listar claves del `.env`, ojo con valores multilínea (PEM).
- **`.env` del orquestador:** dotenv 17 se queda con la ÚLTIMA aparición de una clave repetida; un valor pegado desde chat puede llegar en formato Markdown.
- **Diagnosticar un deploy:** `gh run view <id> --json jobs` y las anotaciones del job. `runner_name` vacío y 0 pasos = falta de runner de GitHub, no fallo nuestro. `/health` sigue en el commit viejo ~3 min tras el pull.
- **Login de prueba desde el portátil** gasta intentos del rate limit de la IP de Jaime: evitarlo; usar el loopback del VPS o los logs.
- **Antes de tocar `ufw`:** `nslookup` de los 10 hostnames. Cualquiera que resuelva a `161.35.85.101` se cae al cerrar 80/443 a Cloudflare (le pasó a Gambusas el 09-oct mientras estaba en nube gris; desde las 07:12 UTC los 10 van por CF).
- **Landing:** los estilos de reposo van inline en `index.html` y le ganan a la hoja; cualquier `:hover`/`:active` nuevo necesita `!important` en `src/input.css`. Un `data-reveal` en un `<a>` le hereda el `transition-delay` al hover: envolverlo en un `<div>`. En móvil el chat de Sofía abierto tapa la página (las pruebas E2E recargan entre clics).
- `obtenerAlmacenIdentidad()` es `async`; `buscarUsuario`/`fichaDe` sirven para lecturas de solo lectura sin tocar hashes.
- 🔴 **Una skill con hook en su frontmatter deja la sesión entera restringida.** Tras invocar `/nacho`, su `PreToolUse` siguió activo hasta el final: sin commits, sin memoria, sin `/cierre-sesion` (la guarda deniega Skill). No se apaga desde dentro; la salida es una sesión nueva. Invocar skills del Consejo solo en sesión dedicada o tras dejar commits y handover. Memoria `hooks-skill-persisten-toda-la-sesion`.
- 🟢 **La guardia en un AGENTE no secuestra la sesión** (al contrario que en una skill): el hook vive y muere con el subagente (Fase 1, 2026-10-13-b). Todo perfil debe permitir `SubagentHandback`, o el agente trabaja pero no entrega nada. La guardia filtra también el texto del informe: si un informe cita la carpeta personal protegida, se deniega.
- 🔴 **Modo automático y definiciones de agentes (2026-10-13-b):** **quitar** capacidad pasa (`tools:` restrictivo, `c1734e3`); **dar** capacidad (crear agentes con `hooks:`, delegación nativa) se bloquea como «Self-Modification», también con autorización en el chat. La vía es que Jaime lo aplique en persona. Memoria `modo-automatico-bloqueos-vps`.
- **Un subagente SÍ puede delegar** (hasta 3 niveles, `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). La auditoría del 11-oct y el primer protocolo de Roberto decían lo contrario.
- 🔴 **Vhost de EF antes del push (2026-10-13-c):** `deploy.yml` corre `ef-nginx-verificar` en modo verificar y pone el job en ROJO si el vhost vivo ≠ `examenfacil.cl.nginx`; nunca lo aplica. Un cambio de vhost va así: `ssh … 'EF_VHOST_MODO=aplicar /usr/local/sbin/ef-nginx-verificar' < examenfacil.cl.nginx` (respaldo + `nginx -t` + reload) y DESPUÉS el push. Entre medias, cualquier otro push a EF sale en rojo.
- **Modo automático (2026-10-13-c):** bloquea de forma intermitente las escrituras en Linear («External System Writes») y, siempre, dar permisos a agentes o al clasificador («Permission Grant», incluso para leer el fichero en esa tarea; «Self-Modification» al editar `settings`). Escrituras en el VPS: «Remote Shell Writes», que pasó al segundo intento con orden explícita de Jaime. Claude no hace borrados permanentes de ficheros: los lanza Jaime.
- 🔴 **Verificar un endpoint de pago con GET puede crear objetos reales** (2026-10-14): un `curl` a `crear_suscripcion.php` creó un `preapproval_plan` en Mercado Pago. Ya da 405, pero ante cualquier endpoint que hable con MP: leer el código antes de llamarlo.
- **Tokens de usuario de Meta no sirven para producción**: caducan en horas o se invalidan (190/463, 190/467). Solo Usuario del sistema (SOL-47). Ningún token por el chat: `ef-meta-token` en una pestaña del panel Terminal (`run_in_terminal`) deja a Jaime teclearlo sin eco.
- **`sed -i` en Git Bash cambió todos los finales de línea** de `api_handler.php` (diff de 931 líneas): para ediciones por línea usar `perl -i -pe 'BEGIN{binmode STDIN; binmode STDOUT}'` o la herramienta Edit, y mirar `git diff --numstat`.
- **Nunca imprimir con `grep`/`od` una línea que contenga un secreto** (2026-10-14 se vieron ~130 caracteres del token de Meta): contar coincidencias o comparar dentro de un proceso.
- **`--max-delete=40` de EF cuenta ficheros Y carpetas**: retiradas grandes, en tandas.
- **Cerrar una sesión desde otra:** `end_session.js` mide por defecto el transcript más reciente (el de la sesión que cierra). Pasarle `--transcript <ruta>.jsonl` de la sesión que se audita, y `-SessionId` a `session-audit.ps1`.

---

## 4 · El paso exacto siguiente

### Tras 2026-10-16-a (vigente)

🟢 **Primero (Claude, no bloqueado): activar F1 de SOL-57.** En el VPS, añadir
`PUBLICACIONES_HABILITADO=admin` a `/opt/zasa-orchestrator/.env` y
`pm2 restart zasa-orchestrator --update-env`. Las `SOCIAL_CLI_*` pueden
omitirse: los valores por defecto ya son los del VPS (`/usr/bin/php`,
`/var/www/examenfacil.cl/cli/social_panel.php`, uid/gid 33).
**Lo único de F1 sin verificar** es un GET autenticado, que necesita la sesión
de admin de Jaime:
`https://admin.solucionesconia.cl/api/admin/social/indicadores?desde=2026-10-12`
debe dar 200 con los recuentos, y `audit_log` no debe tener filas
`social.cola.error`.

**Después:** F2 (vista de solo lectura en la SPA `admin_solucionesconia`:
`config/modulos.ts` + `SoloAdmin` + patrón de Novedades, calendario con CSS grid
sin librería nueva). Luego F3→F6 de SOL-57, SOL-54, SOL-55 y SOL-56.

Antes de F2, dos hallazgos de Ana que quedaron abiertos en F1: proyectar los
campos que salen al navegador y filtrar `ultimo_error` (en EF ya se guarda
redactado por `MetaGraph::redactar`), y la ventana fija de la cuota.

**De Jaime:**
1. Un pago real de $2.990 con `?utm_source=instagram&utm_content=<uid>`: cierra
   la fase 6 (webhook leyendo `pagos_checkout`, correo con el enlace mágico,
   fila borrada y `pago_aprobado` con campaña).
2. Borrar los dos respaldos sueltos de telemetría en `zasa-orchestrator`
   (`src/data/telemetry.ts.bak-20261016111224.` y `...bak-20261017060427.`):
   **hacen fallar 2 tests de la suite local**, no el CI.
3. Preferencias viejas de Mercado Pago, que no caducan y llevan datos de salud:
   script de un solo uso (PUT con `expires=true` y cada clave de metadata
   vaciada), probado antes con una sola preferencia; y pedido ARCO a MP por los
   pagos ya hechos. Retirar la vuelta a metadata antes del 01-12-2026.
4. Bio de Instagram: sigue enlazando a `www.saludfacil.cl`.
5. Revocar el token viejo de Meta del historial de git.

**Trampas nuevas de esta sesión:**
- 🔴 **`ef_admin` no puede crear triggers** en el MySQL del VPS: `@@log_bin=1` y
  `@@log_bin_trust_function_creators=0` dan **error 1419**. Los crea root con
  `mysql < fichero.sql` y `DELIMITER //` (un `mysql -e` parte el `BEGIN…END`).
  El respaldo nocturno ya usa `--triggers`, así que los incluye. Memoria
  `mysql-triggers-exigen-root-1419`.
- El vhost de EF se aplica **desde el blob ya commiteado**
  (`git show HEAD:examenfacil.cl.nginx | ssh … EF_VHOST_MODO=aplicar …`) y
  ANTES del push, o el job sale en rojo al comparar.
- `uid`/`gid` en `child_process` **no existen en Windows** (ENOTSUP): pasarlos
  solo donde `process.getuid` está definido, o los tests locales no corren.
- Un cambio que mueve lógica entre ficheros PHP se valida con `php -l` del VPS
  por stdin (`ssh … 'php -l' < fichero`): no hay PHP en el portátil.
- El smoke contra la base real se hace con una fila programada **en 2027**, para
  que el cron no pueda publicarla ni aunque quede aprobada.

### Tras 2026-10-15-c (anterior)

🟢 **Primero (Claude, no bloqueado): SOL-53 Fase 5 — recolector de insights de Meta a 24/72 h**, pedido expreso de Jaime al cerrar. Diseño del Consejo en el comentario de Roberto en SOL-53 y en la memoria `arranque-tras-2026-10-15-c` (tabla `agg_social_insights`, `cli/social_insights.php medir`, cron `17 * * * *` www-data con flock, Graph v21→v24/25, métricas vigentes, una por llamada). Validar primero con una llamada real sobre los posts #1 y #2. `/ingenieria-flujo` + revisión de Ana antes de desplegar.

**Después:** Fase 6 (metadata de MP saneada + `ef_cmp`, pago por campaña; Nacho: antes del 01-12-2026) → SOL-57 (hash de caption/pantalla/hora al aprobar + módulo Publicaciones en el Cockpit) → SOL-54 → SOL-55 (3 skills: `/ef-estratega-diario`, `/ef-retro-semanal`, `/ef-investigacion-mercado`, sin hooks) → SOL-56.

**De Jaime:**
1. Borrar el `mp_debug.log` viejo (datos de salud de agosto), desde la pestaña de Terminal:
   `ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'F=/var/www/examenfacil.cl/logs/mp_debug.log; test ! -L "$F" && shred -u "$F" && echo borrado'`
2. Un pago real de $2.990: confirma el correo con enlace (fase 0) y los contadores `pago_iniciado`/`pago_aprobado`.
3. Revocar el token viejo de Meta del historial de git (`f4c88f9:admin/finanzas.php`; la comprobación automática la bloqueó el modo automático).
4. Bio de Instagram: hoy enlaza a `www.saludfacil.cl`; cambiarla a `https://examenfacil.cl/?utm_source=instagram&utm_content=<código>`.
5. Revisar que el post #1 de IG ya no muestre la razón social.
6. Borrar `zasa-orchestrator/src/data/telemetry.ts.bak-20261016111224.`.

**Trampas nuevas:** ver memoria `arranque-tras-2026-10-15-c` (loopback del embudo en 429 10 min; no borrar la pimienta de producción en pruebas como root; IG no edita captions por API; vhost de EF antes del push; saltar topes del publicador solo con `php -d auto_prepend_file=` temporal y con OK de Jaime).

### Tras 2026-10-15-a (anterior)

🔴 **Primero (de Jaime): en Meta, «Vuelve a la verificación del negocio»** (la razón social ya está en el sitio, `1d13eb3`). Si vuelve a rechazar, subir un documento acreditativo (p. ej. e-RUT del SII). **Después, seguir SOL-47 en el portfolio «examenfacil.cl»** (creado; dominio verificado el 15-oct). Pasos restantes: añadir cuenta publicitaria `857378264622577`, Página «Examen Facil» e Instagram profesional (vincularlo antes a la Página) → app **Business** del portfolio en **Live** → Usuario del sistema rol Empleado con esos activos → token caducidad **Nunca** con `pages_show_list, pages_read_engagement, pages_manage_posts, instagram_basic, instagram_content_publish, ads_read` → cargarlo con `ef-meta-token` (pestaña de Terminal) → **revocar el token viejo** del historial de git. Claude guía paso a paso y valida (debug_token: SYSTEM_USER, expires_at 0).

**Después (Claude): SOL-48**, publicador de Meta en el VPS y skill de publicación diaria con aprobación humana.

**De Jaime, rápidos:**
1. Borrar en el panel de Mercado Pago el `preapproval_plan` vacío ($9.990, email `guest_…`) creado el 15-oct ~01:10 UTC (SOL-50).
2. Decidir el copy de `pago.html` («pago único, sin suscripción») frente a las membresías (SOL-50).
3. Commitear y empujar su cambio en `skills/ingenieria-flujo/SKILL.md` (`/git-sync`).
4. Cerrar la pestaña de Terminal «Cargar token Meta» si sigue abierta (Ctrl-C).

**Sigue vigente de antes:** SOL-41 (WhatsApp de clientes) y la limpieza del respaldo con secretos `sol10-…`. SOL-40 ya está cerrado en Linear (`9383c4f`).

### Tras 2026-10-13-e (anterior)

**Primero (Claude): SOL-40**, en el run del primer deploy de `zasa-orchestrator` posterior al **14-oct 14:31 UTC** (el de la telemetría `1c6bc9a`, a las ~02:50 UTC, todavía no cuenta). Buscar el paso «Retención de respaldos (modo: informe)»: debe listar solo carpetas `AAAAMMDD-HHMMSS` de más de 7 días que no estén entre las 10 últimas. Si es así, OK de Jaime → commit con `RETENCION_MODO` por defecto en `aplicar` (surte efecto **un deploy después**) → cerrar SOL-40.

**De Jaime:**
1. ✅ **SOL-35 CERRADO (03:14 UTC del 14-oct).** El WhatsApp real de Jaime NO generó ningún POST: el número vive en la app **WhatsApp Business** del móvil y Meta solo notifica los números de la Cloud API. Se cerró con un POST sintético firmado (`META_APP_SECRET` cargado vía `config.php` dentro del VPS) por el camino público: 200 + `ACEPTADO mensajes=0`; firma falsa → 401. 🔴 **Nuevo SOL-41 (High, de Jaime):** los WhatsApp de clientes nunca llegan al webhook. Decidir entre coexistencia app + Cloud API, migrar el número o dejarlo así. Relacionado con SOL-37.
2. Borrar `/root/backups-nginx/sol10-20261014T015127Z/`, que guarda los secretos del comentario viejo.
3. Borrar en zasa `src/data/telemetry.ts.bak-20261014011414.` y `.bak-20261014025137.`. El primero hace fallar `endSessionDesdeJson` en local; en CI no aparece.
4. Limpiar los leads y eventos de Calendar de prueba (22-sep, 10 y 12-oct).

**Después (Claude), de Linear:** versionar el vhost de Gambusas (issue nuevo, a semejanza de `ef-nginx-verificar`); vista del embudo en el Cockpit; SOL-15/16/17/27. **Lectura de negocio:** 0 reservas reales en 8 días. El embudo ya mide dónde se cae la demanda, así que conviene mirarlo antes de tocar copy.

**Trampas nuevas:**
- `grep -r` no sigue los symlinks de `sites-enabled/`: usar `-R` o `nginx -T`.
- `deploy.sh --simular` no hace pull: para ver el plan real, `git merge --ff-only origin/main` en el clon y luego simular.
- Editar nginx por SSH con `bash -s <<'EOF'` y reemplazo de línea literal: `sed`/`perl` con comillas anidadas fallaron en silencio.

### Anterior (2026-10-13-c/d)

✅ **SOL-23 CERRADO (23:16 UTC del 13-oct): autonomía de los 5 agentes técnicos APLICADA.** `autoMode.allow` en `.claude/settings.json` (`claude-skills` `91105c5`) + `CONSEJO_V4.md` §5.4 (raíz `37b036b`). Desde la próxima sesión, SSH a 161.35.85.101 y push a `main` no se bloquean en modo automático (vale para toda la sesión). ### Telemetría 2026-10-13-d (tramo 22:55Z–01:12Z del mismo transcript)
Medida con un transcript recortado (`~/.claude/projects/_tramos-cierre/`) para no duplicar la -c: **137,3 min activos, $80.092 CLP**, `zasa-orchestrator` `ae6d8cb` (`/health` = `ae6d8cb`). En ese deploy (run `38494633830`) ya corrió el paso nuevo: «Retención de respaldos (modo: informe)» → «nada fuera de la ventana». Quedó sin rastrear `src/data/telemetry.ts.bak-20261014011414.` (respaldo del script; borrarlo es de Jaime).

### Añadido el 14-oct (00:00–01:05 UTC), misma sesión 2026-10-13-c

- ✅ **SOL-8 CERRADO:** `EF_ORCHESTRATOR_TOKEN` no existe en el VPS y su valor histórico en git es inerte; `ANTHROPIC_API_KEY` vacía en EF. La del orquestador se **rotó** (`37b40014` → `0733994e`, tecleada por Jaime con `read -s`; scp + `ssh -t`, porque `bash -s` con `<` no da tty). La vieja da **401**.
- ⏸️ **SOL-40 (respaldos del orquestador):** `backups/` en 700/600 (no había exposición real). Pasó de 170 a 31 entradas: 132 + 7 copias del `.env` destruidas con `shred` (scripts `~/diag/sol40-*.sh`, simulados y lanzados por Jaime). Retención automática en `desplegar.sh` (`8344aa7`) en modo **informe**: **pausado hasta el primer deploy posterior al 14-oct 14:31 UTC**; luego, con el OK de Jaime, `RETENCION_MODO=aplicar`. 🔴 Un cambio en `desplegar.sh` surte efecto un deploy después.
- 🔴 **Incidente (00:44–00:46 UTC), causado por Claude:** un `shred` sobre `app/.env` extraído de `pre-git-*.tar.gz` (era un **symlink** al `.env` vivo) dejó el `.env` del orquestador en 0 bytes. Restaurado en ~1 min desde `backups/20261014-003958/env-respaldo` (idéntico, `env:check` 0, `/health` ok; el proceso no llegó a caer). Memoria `incidente-shred-symlink-env`.
- SOL-33 probablemente resuelto: los logs de PM2 ya rota `/etc/logrotate.d/pm2-root` (confirmar y cerrar).
- **Paso siguiente: retomar SOL-40** en ese deploy. Después, de la cola de Linear: SOL-9/10 y SOL-21.

✅ **SOL-25 CERRADO (23:29 UTC):** telemetría de 2026-10-13-b publicada en `a4c30c8` (161,5 min activos, $94.208 CLP; `/health` = `a4c30c8`). Siguiente: **SOL-8** (retirar/rotar la credencial del orquestador que usaba `claude_handler.php`, con Jaime), luego SOL-9/10, SOL-21.

✅ **SOL-39 CERRADO (23:06 UTC del 13-oct): `total_post_19sep = 0`, Bóveda sin daño** (0 intentos en `logs/ef_errors.log`; solo escriben la Bóveda los análisis con email y `payment_id` no `ANON_`). El paso siguiente es el primero de «Después», abajo. Texto original: 🔴 **Bloqueado por Jaime (Claude no puede: Production Reads). SOL-39** — SOL-5 se cerró sin este dato. Medir si se perdieron exámenes pagados entre el 19-sep y el 13-oct; el script ya está en `~/diag/`. Desde **Git Bash**:

```bash
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'cd /var/www/examenfacil.cl && php' < ~/diag/ef-boveda-conteo.php
```

`sin_ruta > 0` = clientes que pagaron sin fichero en la Bóveda: reabrir SOL-5. `sin_ruta = 0` = cerrar SOL-39.

Después, por orden: de Jaime, aplicar (o descartar) la autonomía de los 5 agentes técnicos (§0.n; reescribir SOL-23) y retirar/rotar la credencial del orquestador que usaba `claude_handler.php` (SOL-8). Claude: medir la telemetría de 2026-10-13-b (SOL-25, id `-b`), SOL-9/SOL-10 (snippet `vip-portal.conf`) y SOL-21. **El resto de la cola, en Linear.**

Histórico (2026-10-13-b), ya resuelto en 2026-10-13-c salvo el conteo: 🔴 **Bloqueado por Jaime (Claude no puede: Production Reads).** Medir si se perdieron exámenes pagados entre el 19-sep y el 13-oct. Desde **Git Bash**, sin comillas:

```bash
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'cd /var/www/examenfacil.cl && php' < ~/diag/ef-boveda-conteo.php
```

Solo lectura (`READ ONLY` + `ROLLBACK`), solo recuentos. `sin_ruta > 0` = exámenes perdidos: el fichero no está, pero las métricas sí están en `analisis_metricas` (decidir si avisar a esos clientes). `total_post_19sep = 0` = fallo latente, sin daño. Tarea `ef-boveda-examenes-perdidos-19sep`.

Después (Claude, local, sin CI): el resto de `cockpit-consejo-datos-obsoletos`: `marco.md`/`ana.md` con DO App Platform, `inicio-sesion` dice «6 repos», ruta de memoria de `cierre-sesion` (línea 191), cifra sin fuente de `creative.md`. Y medir la telemetría de 2026-10-13-b con `/cierre-sesion` (no se hizo). De Jaime: `chmod 0440` del sudoers nuevo y quitar la línea 10 duplicada de `deploy` (§0.l); decidir cómo reanudar la Fase 2 del Consejo (§1.10).

(Cerrado el 2026-10-13-b: `storage` en `support.md`, `4f71cbf`.)

Histórico (2026-10-12-a): **Corregir `support.md` línea 69** (`chown -R www-data:www-data /var/www/` → el modelo real: código `deploy:www-data`, runtime `www-data` en 640/750) y seguir con el resto de `cockpit-consejo-datos-obsoletos` (§1.10). Local, en `claude-skills`, que no despliega nada.

Después, de Jaime: `CEO_PERFIL_JAIME.md` dentro o fuera (§1.10), los 3 claims de la landing (§1.8) y la prueba de restauración del respaldo de Jose (§0.k).

(Cerrado el 2026-10-12: `settings.local.json` purgado, los 4 pipelines en `ubuntu-24.04`, agentes sin IP muerta y Jose retirado, §0.k. Antes, el 2026-10-12: CI de `zasa-orchestrator`, §0.j.)

Landing (§1.8), sin urgencia de fecha: el primero de la cola es de Jaime, confirmar los tres claims publicados. Después, medir conversiones antes de cualquier A/B de copy.

Después: verificaciones de uso real (§1.1): una descarga con sesión de operador en vip., un cliente real tras el hardening y una reserva real de Sofía. Se observan en `access.log`, no se fuerzan con datos falsos. Después: A1 (schemas Fastify) y, de Jaime, decidir cuándo destruir `/root/backups-brecha2/liset_legacy_archive.tgz`.

(Cerrado el 2026-10-10: comentarios del portal antiguo `94d656d`; `CLAUDE.md` `fa2c1ac`; skill `cierre-sesion` sin `deploy-1gb.yml` `912b98f`.)

Histórico (CERRADO el 2026-10-10, §0.f): 🔴 **Bloqueado por Jaime:** prueba real de Meta → `https://gambusaschile.cl/api/webhook_wa.php` (botón «Probar» del webhook en el panel de Meta, o un WhatsApp a la tienda), avisando la hora. Claude la busca en `/var/log/nginx/access.log` (query oculta). POST 200 del origen = cerrado; nada en el log = revisar Security Events de la zona en Cloudflare (Bot Fight Mode no se salta con reglas en el plan Free); 401 = firma/secreto de la app.

---

Histórico de la sesión 2026-10-08-a:

✅ **CONFIRMADO el 2026-10-09: la rotación del 08-oct (22:16 UTC) SÍ se aplicó.** Huellas vigentes `API=cb66cef9 EDGE=bea78222` (antes `2e2f571f`/`f74fa9ba`), calculadas por Claude en el VPS con la misma derivación que `h8()` del script. Backups de rotación LIMPIOS el 2026-10-09: `20261008-221640` con `shred -u` + `rmdir` (Claude, autorizado por Jaime); los dos `20260923-*` ya no existían (borrados el 08-oct ~22:35). En `/root/backups-rotacion/` solo queda `rotar-edge-secret.sh`. Trampa: `tr -d "\"\x27\n"` NO quita la comilla simple; `tr` no entiende `\x27` y borra `2`, `7` y `x` del valor → huellas falsas. Usar `tr -d "\042\047"` y `printf %s`.

Comando original (histórico):

```
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'for k in API_SECRET_TOKEN EDGE_SECRET; do printf "%s=" $k; grep -E "^$k=" /opt/zasa-orchestrator/.env | tail -1 | cut -d= -f2- | tr -d "\"\x27\n" | sha256sum | cut -c1-8; done'
```

- **Distintas** → rotación aplicada: cerrar `cockpit-secretos-borde-rotacion-2026-10-08` (si la salida de `--aplicar` acabó en `== OK`, su paso 5 ya probó viejo 403 / nuevo 200) y hacer `shred` de `/root/backups-rotacion/secretos-borde-20261008-221640` y de los dos `secretos-borde-20260923-*` (tarea `cockpit-backups-rotacion-limpieza`).
- **Iguales** → no hubo rotación: los dos `20260923-*` se borran igual (valores superados el 29-sep), y averiguar qué modificó `.env` y snippet a las 22:16.
- El snippet `vip-portal.conf` se queda en **600**, no 644: lleva los dos secretos en claro y nginx lo lee como root.

(Cerrado en 2026-10-08-a: `rotar-secretos-borde.sh` + `AUTHZ_VIP`, §0.d.)

Después, por orden: de Jaime, probar la llegada real de Meta al webhook de WhatsApp de Gambusas, ahora vía CF (§1.3); verificaciones de uso real (§1.1); refactor de `deploy.sh` (§1.3); borrar `src/assets/ds-v2/acceso.css` (sin consumidores desde el 08-oct) con su caso en `tests/dsRuntimeHojas.test.ts`; comentarios residuales que nombran el portal antiguo (`portal-vip.ejs:18/550`, `informe.ejs:131`, `dsRuntimeHojas.test.ts:11`). De Jaime: decidir cuándo destruir `/root/backups-brecha2/liset_legacy_archive.tgz`.
