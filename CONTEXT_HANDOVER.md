# 🔴 PRIMERO AL DECIR «HOLA»: los problemas de GambusasChile (§1) siguen abiertos y van antes que nada

# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-10-01-a (Portal VIP: sesión del cliente, logout 415, refactor de identidad)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:Proyectos`.
> Memoria de arranque: `arranque-2026-10-04` (+ `trampas-zasa-commits-parciales-y-credenciales`) en
> `~/.claude/projects/C--Proyectos/memory/`.
> Sesión del 2026-10-01 21:27 al 2026-10-03 04:37 UTC: **212,6 min activos** de 1.869,8 totales, **$124.017 CLP**.
> Telemetría `2026-10-01-a` en `zasa-orchestrator` `15ee8a7`.
> Esta sesión **no tocó GambusasChile**: los §1-§4 de abajo son los del hand-off 2026-09-30-b, intactos y vigentes.

---

## 0 · Lo que deja la sesión 2026-10-01-a (Portal VIP de clientes)

**En producción y verificado** (`/health` → `9df2dde`; PM2 online, `unstable_restarts=0`):

| Commit | Qué | Verificación |
|---|---|---|
| `e5f2cc0` `e8dae35` | Logo por cliente (`logoUrl`) + SVG de yami-spa por `/clientes/assets/` | desplegado; **falta verlo con sesión real de yami-spa** |
| `9aee1ff` `20aa3af` | Refactor Zero Trust v2 fase 1 → `src/modulos/portal-vip/` | byte a byte contra HEAD, sin ciclos, 1.822 tests |
| `0fb7acf` | Brecha 1: `POST /api/vip/:t/sesion/renovar` + `portal-sesion.js` | E2E en producción con tenant de prueba (ya purgado) |
| `6f09b93` | Logout 415 (form urlencoded vacío) | curl real: 302 `/acceso` + cookie borrada |
| `9df2dde` | Brecha 6: 401 → `/acceso` en cobros y sesión | scripts nuevos servidos; **falta ver la redirección en vivo** |

**Cola, por cercanía a producción:**
1. **yami-spa**: invitación sin canjear (`password_temporal=1`). Jaime la lee en terminal APARTE:
   `ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 "cat /root/invitacion-yami-spa.txt"` y se la entrega.
   🔴 No usar esa cuenta para pruebas: canjearla fija una contraseña que el cliente no conoce.
2. **Refactor identidad**: siguiente pieza `tokenFirmado.ts` (matriz acordada: tokenFirmado → cookieCliente →
   sesiones → revocacion → guard → index + shims). Tras desplegar `revocacion.ts`, buscar `vip-clave-rotada` en
   `pm2 logs`: si aparece, se cerraron todas las sesiones de clientes.
3. **Brechas pendientes**: 2 (portal antiguo `/clientes/:slug` con SCJWT en sessionStorage), 3-5 (interceptor de la
   SPA `admin_solucionesconia`), 7-8 (`/acceso`: destino fijo `/vip/forte-spa/` y CSP sin verificar).
4. Higiene: `verificarBorde.test.ts` inestable por tiempo; `nuevo-cliente.js` no ve claves con comillas.

**Trampas de esta sesión** (detalle en la memoria `trampas-zasa-commits-parciales-y-credenciales`): el árbol de
`zasa-orchestrator` arrastra cambios ajenos (`ds.js`, vistas, `package-lock.json`) → stage siempre por ruta;
`git mv` deja el contenido viejo en el stage; `gh` no está instalado → verificar despliegue por `/health` (5-6 min).

---

## 1 · 🔴 Problemas encontrados — ARREGLAR PRIMERO (en este orden)

| # | Problema | Arreglo | Quién |
|---|---|---|---|
| 1 | **`/var/www/gambusaschile.cl/api/` quedó `www-data:www-data`** y los PHP en **755**: alguien lo cambió a mano después del deploy de las 06:42 UTC. Según `DEPLOY.md` (incidente 2026-08-07), con el árbol de `www-data` el `tar` de `scp-action` no puede hacer `utime` → **el próximo push a `main` abortará el deploy** | `chown -R deploy:www-data …/api`, dirs 755, ficheros 644. Después, un push de prueba para comprobar que el pipeline queda en verde | Claude (pedir OK) |
| 2 | **`api/test.php`** (`<?php echo 'OK'; ?>`) público: 200 vía Cloudflare. Fuera de git | Borrar | Claude |
| 3 | **`api/logs/`** recreada a las 07:06 con `webhook_debug.log` vacío. nginx la bloquea (404), pero sobra y nada escribe ahí | Borrar | Claude |
| 4 | **Meta no llega al origen.** Desde las 05:36 UTC hay **0** peticiones de Meta en `access.log`; todos los «Verificar y guardar» se bloquean en **Cloudflare** | Cloudflare → Security → Events (filtrar por ruta `/api/webhook_wa.php` o UA `facebookplatform`); regla WAF **Skip** para esa ruta, o desactivar **Bot Fight Mode** (en el plan gratuito no se salta por ruta). Mientras Jaime pulsa «Verificar y guardar», Claude vigila los logs | **Jaime** + Claude |
| 5 | **7 pruebas con `curl` de 07:36 a 08:18 UTC dieron `verify_token no coincide`**: se probó con un token distinto al de la Bóveda | Usar el token que mostró `setup_wa_secrets.sh` (06:44 UTC). Si se perdió: `… setup_wa_secrets.sh --rotar-token` y pegar el nuevo en Meta. URL de callback **exacta**: `https://gambusaschile.cl/api/webhook_wa.php` | **Jaime** |

Comprobación previa de 1–3, solo lectura:
```bash
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'stat -c "%a %U:%G %n" /var/www/gambusaschile.cl/api /var/www/gambusaschile.cl/api/*; ls -la /var/www/gambusaschile.cl/api/logs 2>/dev/null'
```

---

## 2 · Webhook de WhatsApp — estado real (verificado)

- **Código:** `api/webhook_wa.php` versionado (`9147911`), idéntico en el VPS (sha256 `1f4d482d…`).
  - `GET`: `hub.mode=subscribe` + `hash_equals` contra `WA_VERIFY_TOKEN` + challenge `^[0-9]{1,64}$`. La query se parsea a mano y rechaza alias `hub_*` y duplicados. Responde 200 `text/plain` con el challenge exacto.
  - `POST`: `X-Hub-Signature-256` obligatoria, HMAC-SHA256 con `META_APP_SECRET` → 401. Máximo 1 MB (413); otros métodos → 405.
- **Secretos:** cargados en la Bóveda a las 06:44 UTC con `core/automation/deploy/setup_wa_secrets.sh` (`9b75c37`), con respaldo en `/root/backups-gambusaschile/config_secret.php.20261001-064446`. El propio script verificó por loopback el GET con el token nuevo (200) y un POST firmado (200).
- **Log real:** `/var/lib/gambusaschile/logs/webhook-wa-2026-10.log`, fuera del web root y sin secretos. **No** `api/logs/webhook_debug.log`.
- **nginx:** `/api/logs/` y `*.log` → 404, y la query de `webhook_wa.php` se tacha en `access.log`. Respaldo en `/root/backups-nginx/gambusaschile.cl.20261001-062643`.
- **Cloudflare no altera la query.** Se comprobó con una sonda con testigo. El problema es que bloquea a Meta (§1.4).
- El fichero manual antiguo (con el token viejo `gambusas_secure_verify_2026`, ya inválido) está respaldado en `/root/backups-gambusas-webhook/20261001-062657/`.

## 3 · Automatización de marketing (`core/automation/`) — en producción

- **Planificador Node + `logger.js` (enmascaramiento obligatorio) + PM2.** Excepción a la regla PHP registrada en el `CLAUDE.md` del proyecto. Excluido del deploy del web root.
- **VPS:** checkout parcial en `/opt/gambusas-automation` (`9b75c37`), deploy key de solo lectura `gambusas_automation_deploy` y PM2 `gambusas-automation` **online**. Secretos en `/etc/gambusaschile/automation.env` (640 root).
- Cargar más secretos: `ssh -t … 'bash /opt/gambusas-automation/core/automation/deploy/desplegar-vps.sh secretos CLAVE…'`.
- **`meta-sync` deshabilitada:** falta `INSTAGRAM_BUSINESS_ACCOUNT_ID`.
- **WhatsApp (phone_number_id del 56946834559):** el token del usuario del sistema es válido y tiene permisos de WhatsApp, pero **no tiene ninguna WABA asignada**. Jaime: Business Manager → Usuarios del sistema → `gambusas-automation` → Asignar activos → cuenta de WhatsApp (control total). Probablemente haya que regenerar el token (y añadir `business_management`). Después, Claude repite el descubrimiento y escribe los IDs.

## 4 · Pendientes de fondo

- **Node 18 (EOL) en el VPS** → 22 LTS, coordinado con `elrincon-backend` y `zasa-orchestrator`. Después, devolver `engines` a `>=20`.
- **`pm2-logrotate`** no está instalado (afecta a las 3 apps; decidirlo aparte).
- **`zasa-orchestrator` con 19 reinicios en PM2** (previo a esta sesión): revisar.
- Pendientes heredados de 2026-09-30-a: bandeja de `ventas@`, compra real del pack de $14.990, commits sueltos de `zasa-orchestrator` + timeout de `verificarBorde.test.ts`, DMARC `p=quarantine`.

## 5 · Estado de los repos al cierre

- **`GambusasChile`:** limpio y sincronizado con `origin/main` en `9b75c37`. 🔴 No hacer push hasta arreglar §1.1, porque el deploy fallaría.
- **`zasa-orchestrator`:** `aa26f06` (telemetría). Siguen sin commitear los 10 ficheros ajenos del 29-sep; no se tocaron.

## 6 · Trampas operativas nuevas

- `bash -s < script` con `core.autocrlf=true`: los `.sh` llevan `eol=lf` en `.gitattributes`. Mantenerlo.
- PM2 con espera exponencial: al superar el tope de reinicios, `pm2 ls` muestra `waiting restart` en vez de `errored`, y el tope solo rige los primeros `min_uptime × max_restarts`.
- `setup_wa_secrets.sh` exige TTY: lo lanza Jaime con `ssh -t`, nunca Claude (el token se mostraría en el transcript).
- `/etc/gambusaschile/` contiene la Bóveda PHP (www-data) y el `automation.env` (root): **no cambiar los permisos del directorio**.

---

## 7 · El paso exacto siguiente

**Claude, al primer «hola»:** ejecutar la comprobación de §1 y, con el OK de Jaime, devolver
`api/` a `deploy:www-data` (dirs 755, ficheros 644) y borrar `api/test.php` y `api/logs/`.
Después, Jaime abre Cloudflare Security Events para §1.4.
