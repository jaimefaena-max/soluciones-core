# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-10-05-a (zasa-orchestrator: pinning Zero Trust de host key en CI)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-10-06` en `~/.claude/projects/C--Proyectos/memory/`.
> Sesión del 2026-10-05, de 18:42 a 22:41 UTC: **120,6 min activos**, **$70.350 CLP**.
> Telemetría `2026-10-05-a` en `zasa-orchestrator` `344e69c`.

---

## 0 · Lo que deja la sesión 2026-10-05-a

**En producción y verificado** (`zasa-orchestrator` `e9de26b`; local = `origin/main` = `/health`):

| Qué | Verificación |
|---|---|
| `deploy-admin-vip.yml` y `deploy-vps-4gb.yml`: la huella del VPS sale **solo** del secret `VPS4GB_KNOWN_HOSTS`. Fuera el `ssh-keyscan` dinámico (se sumaba al pin y, con `StrictHostKeyChecking=yes`, cualquier clave del fichero vale → MITM aceptado) y el fallback `accept-new`. Sin secret, o sin entrada para `161.35.85.101` (`ssh-keygen -F`), el job aborta **antes** de conectar | Push → `deploy-admin-vip` publicó `e9de26b` (pull en el VPS 21:28:58 UTC, `/health` 21:32:16 UTC). `deploy-vps-4gb` lanzado a mano por Jaime: SSH 22:09:00, `desplegar.sh` 22:09:07→22:12:36, PM2 reiniciado ~22:12:25, verificación 22:12:39, `/health` = `e9de26b` |
| Borrados `deploy-1gb.yml` y `audit-env.yml`: apuntaban con root y `accept-new` a `161.35.157.69`, el droplet destruido el 2026-09-07 (IP reasignable por DO) | Ya no existen en `main` |
| Secret `VPS4GB_KNOWN_HOSTS` = `161.35.85.101 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMdKCRyCKgsL4sTsRsALc7WaJ8TB/D8WNewf7termwq0` (clave pública) | Huella `SHA256:UZ6s2MPNaLLeV96PNne1RqW+bLbtjKyncbs6IJL4zSw` coincide por 3 vías: keyscan, `/etc/ssh/ssh_host_ed25519_key.pub` leído por sesión autenticada y el `known_hosts` local |

**Cómo fue (corregido el 2026-10-06 con `gh`):** el primer run tras el push (37362478851) **no llegó al VPS, pero NO por el secret**. Las pruebas pasaron (19:56→20:01 UTC, tras 27 min en cola) y el job de despliegue quedó 15 min sin runner y se canceló: anotación `The job was not acquired by Runner of type hosted even after multiple attempts`. Escasez de runners hospedados de GitHub esa tarde (el «Monitor de disponibilidad» de las 20:46 falló igual: `sonda` cancelada sin runner). El cierre del 05-oct atribuyó el fallo al secret por inferencia: **era falso**. El re-run manual de las 21:24 (37367284778) salió en verde.

**Verificado después con `gh`:** el run de `deploy-vps-4gb` (37380564688, 22:08 UTC) terminó **success**, perímetro incluido.

**Aviso de GitHub:** `ubuntu-latest` migra a Ubuntu 26 desde el **2026-10-19**. Vigilar el primer deploy posterior.

---

## 1 · Abierto (heredado de 2026-10-04-a, sin cambios en esta sesión)

1. ✅ **Cerrado 2026-10-06:** el respaldo `/root/backups-gambusaschile/predeploy-20261004-040711/` (config.php editado a mano el 03-oct) ya no existe; Jaime lo dio por auditado. Claude comprobó solo su ausencia, no cómo se borró ni el contenido.
2. ✅ **Cerrado 2026-10-06 — Meta llega al origen.** En los logs rotados de nginx: handshake `GET` desde `2a03:2880:2aff:74::` (Meta, AS32934) el 01-oct 05:36:47 UTC → **200**, y `POST` firmado desde `69.63.184.3` (Meta, 69.63.176.0/20) el 04-oct 03:41:46 UTC → **200**. `webhook-wa-2026-10.log` lo confirma (`ACEPTADO` a la misma hora). Las 5 peticiones del 04-oct 02:36 UTC desde `201.223.157.197` (403/301/401) eran pruebas con UA imitado, no Meta. Sin tráfico de Meta desde el 04-oct: normal sin eventos (el token no tiene WABA asignada). Sin verificar: el estado «verificado» en el panel de Meta (solo Jaime). 🔴 La query del handshake lleva `hub.verify_token`: ocultarla (`sed`) al volcar `access.log`.
3. Rotar la credencial de julio de ExamenFácil si no se rotó (`shred` sobre ext4 + discard no garantiza borrado físico).
4. GambusasChile: cabeceras duplicadas nginx/webhook; opcional `limit_req` en `/api/webhook_wa.php`. `meta-sync` deshabilitada (falta `INSTAGRAM_BUSINESS_ACCOUNT_ID`); el token de WhatsApp sin WABA asignada (Jaime, Business Manager).
5. Portal VIP: yami-spa sin canjear (🔴 no usarla para pruebas); refactor identidad → `tokenFirmado.ts`; brechas 2, 3-5, 7-8; `verificarBorde.test.ts` inestable.
6. Fondo: `pm2-logrotate`; bandeja de `ventas@`, compra real del pack $14.990, DMARC `p=quarantine`; acme-challenge ajenos en examenfacil.cl (observar).

## 2 · Nuevo de esta sesión

- ✅ **`gh` instalado y autenticado el 2026-10-06** (2.102.0, `jaimefaena-max`, scopes `gist read:org repo workflow`, token en el keyring). `gh auth setup-git` hecho: **Git usa ahora `gh` como credential helper para github.com** (antes, el PAT de Credential Manager). Probado: `gh run list` y `git ls-remote` contra el repo privado. Ruta: `C:\Program Files\GitHub CLI\gh.exe` (shells abiertos antes de instalar no lo ven en el PATH). Tarea `cockpit-gh-cli-local` finalizada en la telemetría `2026-10-05-b` (`f5d63f6`).
- ✅ Telemetría corregida en `2026-10-05-b` (`f5d63f6`, 70,1 min activos tras el corte del 05-oct, $40.892 CLP): reutiliza los ids y supersede la causa falsa de `2026-10-05-a`. Desplegada: run 37450346544 success, `/health` = `f5d63f6`.
- `CLAUDE.md` raíz y la skill `cierre-sesion` aún mencionan `deploy-1gb.yml`; ya no existe. Higiene de docs, sin urgencia.

## 3 · Estado de los repos al cierre

- **`zasa-orchestrator`:** limpio, `main` = `origin/main` = producción en `702a4e1` (hardening de tokenFirmado, verificada en `/health`).
- **`GambusasChile`:** sin cambios, `d366eb1`.
- **`AuditorLegal`:** cambios sin commitear ajenos a esta sesión (`api_handler.php`, `js/main.js`, `.gitignore` nuevo). No se tocaron.
- **Portal de Jose:** ficheros sin rastrear (documentos de cliente). No se tocaron.

## 4 · Trampas operativas

- **Diagnosticar un deploy:** primero `gh run view <id> --json jobs` y las anotaciones del job (`gh api repos/<o>/<r>/check-runs/<job_id>/annotations`); un job con `runner_name` vacío y 0 pasos = GitHub no asignó runner, no es un fallo nuestro. **Sin `gh`:** `grep "sshd.*Accepted" /var/log/auth.log` en la ventana del push. Cero logins de runner (IPs Azure 20.x/132.x/172.x, usuario `root` para zasa, `deploy` para otros repos) = el job murió antes de SSH. Un `Connection closed … [preauth]` sin usuario desde IP Azure = rechazo de host key. Ojo: hay escáneres desde IPs Azure (p. ej. `13.90.206.6`, puerto fijo, usuarios inventados): no son runners.
- **Reflog del checkout** (`git -C /opt/zasa-orchestrator/app reflog -1 --date=iso`) da la hora exacta del pull del deploy.
- `/health` sigue en el commit viejo ~3 min tras el pull (`npm ci` + build); un `commit=` vacío durante segundos = reinicio de PM2, no caída.
- Re-desplegar el mismo commit (`deploy-vps-4gb` manual) no cambia `/health`: la señal es el login del runner + `pm_uptime` de PM2.
- `pgrep -f "<patrón>"` dentro de un `bash -c` se encuentra a sí mismo: falso «sigue corriendo».
- El sudoers de `deploy` solo admite comandos exactos; `www-data` nunca dueño de un web root servido por `scp-action`.

---

## 5 · El paso exacto siguiente

✅ `tokenFirmado.ts` extraído (2026-10-06, `zasa-orchestrator` `f407467`, movimiento puro: 3 bloques idénticos por sha256 a HEAD; 1.847 tests ✓; run 37458486842 success; `/health` = `f407467`; smoke en loopback: sin token 401, token forjado 403). Solo se reexportan las 2 funciones que ya eran públicas.

✅ `cookieCliente.ts` extraído (2026-10-06, `5eb48f6`, sha256 idéntico a HEAD, 1.847 tests, run 37462661434 success, `/health` = `5eb48f6`; smoke: sin token y cookie forjada → 401). Se reexportan sus 4 símbolos (todos eran públicos).

✅ `sesiones.ts` extraído (2026-10-06, `1a14dcf`; a `sesiones.ts` y NO a `almacenSesiones.ts`, que es la capa SQL y obligaría a reescribir las llamadas; única diferencia con HEAD: `export function huella`, que la revocación aún necesita y clienteAuth no reexporta; 1.847 tests; run 37465750882 success; `/health` 200 = `1a14dcf`; smoke 401/401/200, 0 logs de error).

✅ `revocacion.ts` extraído (2026-10-06, `389e8bf`, sha256 idéntico a HEAD sin ningún cambio; 1.847 tests; run 37471285974 success; `/health` 200 = `389e8bf`; tras el arranque de las 13:37:17 UTC: 0 `vip-clave-rotada`, 0 errores, smoke 401/401). Sin revocación espuria.

✅ `guard.ts` (`7cbcd67`, sha256 idéntico) e `index.ts` (`3f6e4c4`, API pública explícita de 29 símbolos = la de la fachada, sin `huella`/`formato`/`almacenSesiones`) desplegados juntos (run 37482887821 success; `/health` 200 = `3f6e4c4`; smoke del guard antes/después idéntico: 401 en /verificar y /perfil sin token, cookie basura, cookie con firma forjada y tenant inválido, también por vip.; 83 líneas de log nivel 30, 0 errores). `clienteAuth.ts` es ya una fachada de reexportación (0 imports). **Refactor de identidad fase 2 cerrado.**

Siguiente (opcional, sin urgencia): `clienteAuth.ts` → `export * from` el índice para definir la API en un solo sitio, y migrar consumidores al índice poco a poco. ✅ Las 2 mejoras de la auditoría de `tokenFirmado` están en producción (`702a4e1`, 2026-10-06: HMAC antes de `JSON.parse` y `exp − iat ≤ TTL`; 6 tests nuevos, 4 de ellos fallan contra el código viejo; run 37486049658 success; smoke 401 en todo lo no autenticado, 0 errores). 🔴 **Sin verificar en producción el camino POSITIVO** (un cliente real con sesión sigue entrando): no hubo tráfico real a /api/vip/*/verificar|perfil tras el deploy. Comprobarlo con el próximo login real (Jaime, nunca yami-spa) o mirando 200 en access.log. Efecto asumido: bajar `CLIENTE_TOKEN_TTL_MS` invalida tokens vivos emitidos con el TTL anterior. Brechas del Portal VIP auditadas el 2026-10-06 (sin Crítica ni Alta; backend fail-closed y aislamiento por inquilino verificados). ✅ **Brecha 8 CERRADA** (`solucionesconia` `3602280`): /acceso con script y estilos externos (`acceso.js`, `acceso.css`) y `location ^~ /acceso/` en `vip-portal.conf.plantilla` con CSP sin `unsafe-inline` ni unpkg (único tercero: beacon de Cloudflare, que CF inyecta en el HTML del navegador) + juego completo de cabeceras; desplegado (web root sha256 = repo; respaldos en /root/backups-solucionesconia/acceso-20261006-161855 y /root/backups-nginx/*.2026-10-06-161951) y verificado con Chromium real: 0 violaciones, login → 401 correcto. 3 y 4 ya estaban cerradas en el código. Pendientes: **2** (portal antiguo /clientes/liset con SCJWT en sessionStorage, 0 usos reales en 14 días: retirarlo, confirmar antes con Jaime) + A2 (portal-vip.js cargado en balde por portal-vip.ejs/informe.ejs); ✅ **5 CERRADA** (`admin_solucionesconia` `6b81051` + `f5807ba`, desplegada en vip. por el run 37505424870: `httpClient.ejecutar()` único punto de `fetch`, `descargar()` + `guardarBlob()` en `src/api/descargas.ts`; las 2 descargas de servicios pasan por el interceptor: 401 → /login; 18+22 comprobaciones contra el código real). 🔴 Sin verificar una descarga REAL con sesión de operador en vip. (Novedades o Portales). ✅ Login de vip.: el 401 llega ya como `HttpError` (`836a29b`, run 37507572563 success): una contraseña incorrecta muestra «Usuario o contraseña incorrectos.» y no «No se pudo contactar con el servidor» (bug de agosto, `d009ff2`; los 2 intentos de Jaime a las 17:48 UTC eran 401 reales del backend tras scrypt). ✅ 2026-10-06 18:14 UTC: contraseña del usuario `admin` del orquestador RESTABLECIDA (los 401 de Jaime eran contraseña incorrecta: usuario existe, activo, rol admin). Hash `scrypt$32768$8$1`, UPDATE + audit_log `rbac.admin.restablecido` en una transacción, verificada con `autenticarUsuario`. La contraseña nueva (24 car.) NUNCA pasó por el chat: está solo en `/root/admin-password-20261006-181405.txt` (root 600). ✅ Jaime la leyó y la usó (login admin OK a las 18:19 UTC) y el fichero ya está destruido (comprobado: no queda ningún /root/admin-password-*.txt). Un primer intento falló antes de escribir (await) y su fichero se destruyó con shred. ✅ 2026-10-06 18:29 UTC: `SALES_WEBHOOK_URL` del agente «Notificación de leads» (`ag-webhooks`, en error desde el 23-sep) CORREGIDA en `/opt/zasa-orchestrator/.env`: estaba 3 veces (línea 52 vacía y 80/81 con la URL pegada en formato Markdown `[url](url)`, inválida para `new URL`; dotenv 17 se queda con la última). Ahora una sola línea con la URL del receptor propio; respaldo `/root/backups-env/.env.2026-10-06-182908` (600); resto del .env idéntico por sha256; `pm2 restart --update-env`, /health OK, 0 errores. Verificado: URL válida, host propio → lleva Bearer. 🔴 Falta ver `ag-webhooks` en verde con la PRÓXIMA reserva real de Sofía (no se forzó un lead de prueba). ✅ CERRADO 2026-10-06 (`admin_solucionesconia` `67edb57`, run 37517900885): el widget de Sofía usa `httpClientWidget` (sin cookies ni Authorization, `alCaducarSesion: null`) sobre `src/api/httpCore.ts`, que no importa `src/auth/`; la SPA sigue con `httpClient` igual que antes. Verificado en producción con Chromium y un 401 SIMULADO en /api/sales-agent/chat: la web del cliente no navega, su sessionStorage queda intacto, el widget muestra su propio mensaje y no viaja ninguna cookie ni Authorization (solo X-Widget-Token). El bundle del widget ya no contiene `sc.admin.session` ni `location.assign`. Trampa: cualquier cambio en `httpClient.ts` cambia el widget de Sofía (lo importa) y la compuerta de CI exige commitear `public/widget/vendedor-ia-v17.js` regenerado (`npm run build:widget`); eso publica el widget en admin./widget/ (verificado: sha repo = VPS = público, Sofía abre en la landing sin errores). **7** (destino de reserva fijo forte-spa en acceso.js); A1 (schemas Fastify, 1 de 35 rutas). Rareza: el render de vip-portal.conf escribe los secretos en un comentario (línea 3 de la plantilla).
