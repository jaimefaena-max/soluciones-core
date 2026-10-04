# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-10-04-a (GambusasChile: auditoría AppSec del webhook de WhatsApp)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-10-05` en `~/.claude/projects/C--Proyectos/memory/`.
> Sesión del 2026-10-04, de 03:56 a 04:37 UTC: **40,4 min activos**, **$23.567 CLP**.
> Telemetría `2026-10-04-a` en `zasa-orchestrator` `433d937`.

---

## 0 · Lo que deja la sesión 2026-10-04-a

**En producción y verificado** (GambusasChile `d366eb1`; los sha256 del VPS coinciden con el commit):

| Qué | Verificación |
|---|---|
| `api/webhook_wa.php`: verify_token comparado por HMAC de ambos lados + `hash_equals` (no filtra la longitud); secretos de menos de 32 caracteres = ausentes; `display_errors` apagado antes de cargar nada + red de fatales (500 genérico); `Content-Length` solo dígitos (400); `error_log` saneado; CSP `default-src 'none'`, `X-Robots-Tag` y `Referrer-Policy` | Loopback: 403 (sin parámetros / token erróneo / alias `hub_*`), 401 (sin firma / firma falsa), 405 (PUT); **handshake con el token real → 200 con eco exacto**; **POST firmado con el secreto real → 200 `OK`** |
| `config.php`: Bóveda con `is_readable` y alerta si fallan los permisos; fallbacks dentro del árbol **solo con `GAMBUSAS_ENV=dev`** (fail-closed en el VPS); sin `?>` | `php -l` limpio en el servidor (config, index y los 3 `api/*.php`) |
| `deploy.yml`: los `.php` quedan en **640 `deploy:www-data`** en cada deploy (sin sudo: tras el `chown`, deploy es el dueño; sudoers solo admite los comandos exactos) | Todos los PHP en 640; ningún fichero fuera de `deploy:www-data` |
| ExamenFácil: `/etc/examenfacil/config_secret.php.bak-20260707` (644, legible por cualquier usuario del VPS) → 600 → **`shred -n 3 -z -u`** | `stat` → No such file; Bóveda viva intacta (640 www-data) y la portada da 200 |

Revisión posterior al deploy: nginx y php8.3-fpm activos, `nginx -t` y `php-fpm8.3 -t` OK, 0 errores y 0 5xx de gambusaschile.cl, sin restos en `/tmp` ni en el web root.

**🔴 Abierto de esta sesión:** el `config.php` de producción se había **editado a mano el 03-oct a las 21:30 UTC** (no coincidía con git) y el deploy lo pisó. Se respaldó antes en
`/root/backups-gambusaschile/predeploy-20261004-040711/` (root 600). **Nadie ha revisado qué contenía ese cambio**: el modo automático bloqueó su lectura. Jaime lo compara en una terminal aparte:
```
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 "cat /root/backups-gambusaschile/predeploy-20261004-040711/config.php" | git -C C:/Proyectos/Workspace_Clientes/GambusasChile diff --no-index - config.php
```
Si era algo funcional, va al repo (o a la Bóveda si es un secreto), nunca de vuelta como parche en el servidor.

**Nota:** `shred` en ext4 con `discard` sobre un disco virtual de DO no garantiza sobrescribir los bloques físicos. Si la credencial de julio de ExamenFácil (67 bytes, probablemente una sola constante) no se rotó después, rotarla.

---

## 1 · GambusasChile — estado de los problemas del 2026-09-30-b

| # | Problema | Estado |
|---|---|---|
| 1 | `api/` en `www-data:www-data` rompería el deploy | ✅ **Cerrado** (`e5abe64`, y el pipeline pasó en verde con `d366eb1`) |
| 2 | `api/test.php` público | ✅ **Cerrado**: ya no existe |
| 3 | `api/logs/` sobrante | ✅ **Cerrado**: ya no existe |
| 4 | Meta no llegaba al origen (Cloudflare) | 🟡 **Probablemente resuelto, sin confirmar**: el log de la app registra un `ACEPTADO … mensajes=1` con firma válida el 2026-10-04 a las 03:41 UTC, que no vino de las pruebas de Claude. Confirmar en `access.log` (UA `facebookexternalua`/`facebookplatform`) y en el panel de Meta que el webhook figura como verificado |
| 5 | `curl` con un token distinto al de la Bóveda | ✅ El handshake con el token real da 200 (verificado por loopback como www-data, sin mostrar el token) |

## 2 · Webhook de WhatsApp — referencia

- **Log real:** `/var/lib/gambusaschile/logs/webhook-wa-2026-10.log` (fuera del web root, sin secretos).
- **Reenvío de eventos:** Meta no firma ninguna marca de tiempo. Hoy solo se registra un resumen; cuando se procesen mensajes, **deduplicar por `messages[].id` / `statuses[].id`**.
- **Pendiente de higiene:** nginx añade su propia CSP y su `Referrer-Policy` sobre las del webhook (cabeceras duplicadas; dos CSP = la intersección, más restrictivo). Opcional: `limit_req` en `location = /api/webhook_wa.php` para que no se pueda llenar el log a base de 403 (backup del server block + `nginx -t`).
- Respaldos: Bóveda `/root/backups-gambusaschile/config_secret.php.20261001-064446`; nginx `/root/backups-nginx/gambusaschile.cl.20261001-062643`.

## 3 · Automatización de marketing (`core/automation/`) — sin cambios

- PM2 `gambusas-automation` online en `/opt/gambusas-automation`; secretos en `/etc/gambusaschile/automation.env` (640 root).
- **`meta-sync` deshabilitada:** falta `INSTAGRAM_BUSINESS_ACCOUNT_ID`.
- **WhatsApp:** el token del usuario del sistema no tiene ninguna WABA asignada. Jaime: Business Manager → Usuarios del sistema → `gambusas-automation` → Asignar activos → cuenta de WhatsApp (control total); probablemente haya que regenerar el token.

## 4 · Portal VIP (heredado de 2026-10-01-a, sin cambios)

1. **yami-spa**: invitación sin canjear. Jaime la lee en terminal APARTE (`cat /root/invitacion-yami-spa.txt`). 🔴 No usar esa cuenta para pruebas.
2. **Refactor identidad**: siguiente pieza `tokenFirmado.ts` (tokenFirmado → cookieCliente → sesiones → revocacion → guard → index + shims). Tras desplegar `revocacion.ts`, buscar `vip-clave-rotada` en `pm2 logs`.
3. **Brechas** 2, 3-5 y 7-8 (ver memoria `arranque-2026-10-04`).
4. Higiene: `verificarBorde.test.ts` inestable; `nuevo-cliente.js` no ve claves con comillas.

## 5 · Pendientes de fondo

- Node 18 (EOL) → 22 LTS coordinado; `pm2-logrotate`; reinicios de `zasa-orchestrator` en PM2.
- Bandeja de `ventas@`, compra real del pack de $14.990, DMARC `p=quarantine`.
- `examenfacil.cl`: 8 peticiones `acme-challenge` con 404 el 04-oct a las 04:15 UTC que no son de nuestro certbot (último run 02:32, nada que renovar; certs hasta el 25-nov). Observar.

## 6 · Estado de los repos al cierre

- **`GambusasChile`:** limpio, `main` = `origin/main` = producción en `d366eb1`.
- **`zasa-orchestrator`:** `433d937` (telemetría). Siguen sin commitear los cambios ajenos (`ds.js`, vistas, `package-lock.json`, `audit-fase*.md`, `tests/dsRuntimeHojas.test.ts`); no se tocaron.

## 7 · Trampas operativas

- **El tree de un web root servido por `scp-action` NO puede ser de `www-data`** (el tar no puede hacer utime y el deploy aborta). Dueño `deploy`, grupo `www-data`.
- `sudoers` del usuario `deploy` (`/etc/sudoers.d/deploy-gambusas`) solo admite los comandos **exactos** del pipeline: cualquier comando nuevo con sudo fallaría. Lo que deploy pueda hacer como dueño, sin sudo.
- `gh` no está instalado: verificar despliegues comparando el sha256 en el VPS con `git show HEAD:<fichero> | sha256sum`.
- No hay PHP en local: `php -l` se hace por stdin contra el VPS (`ssh … 'php -l' < fichero`).
- Para probar con secretos reales sin exponerlos: `runuser -u www-data -- php -r '…'` en el VPS, imprimiendo solo códigos HTTP o sí/no.
- `setup_wa_secrets.sh` exige TTY: lo lanza Jaime con `ssh -t`.

---

## 8 · El paso exacto siguiente

**🔴 Requiere a Jaime:** revisar el diff del `config.php` editado a mano (comando en §0). Si no tenía nada que conservar, borrar ese respaldo con `shred`. Después, Claude confirma §1.4 (Meta llega al origen) en `access.log`.
