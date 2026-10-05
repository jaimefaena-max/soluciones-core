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

**Cómo fue:** el primer run tras el push **no llegó al VPS**: `auth.log` no tiene ningún login de runner entre el push (~19:19 UTC) y la recarga del secret. Causa probable: el secret sin cargar (el guard nuevo aborta antes de SSH). **No se vio el log del run** (no hay `gh`); queda como inferencia. Tras cargar Jaime la línea y relanzar, conectó.

**Sin verificar:** el estado final en GitHub del run de `deploy-vps-4gb` (su último paso, chequeos del perímetro por el borde público, no deja rastro en el VPS). Jaime lo ve en la pestaña Actions.

---

## 1 · Abierto (heredado de 2026-10-04-a, sin cambios en esta sesión)

1. **🔴 Jaime:** revisar el `config.php` de GambusasChile editado a mano el 03-oct 21:30 UTC que el deploy pisó. Respaldo en `/root/backups-gambusaschile/predeploy-20261004-040711/` (root 600). Comparar en terminal aparte:
   ```
   ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 "cat /root/backups-gambusaschile/predeploy-20261004-040711/config.php" | git -C C:/Proyectos/Workspace_Clientes/GambusasChile diff --no-index - config.php
   ```
   Si era funcional, va al repo (o a la Bóveda si es secreto). Si no, `shred` del respaldo.
2. Confirmar que Meta llega al origen (UA `facebookexternalua`/`facebookplatform` en `access.log` + webhook verificado en el panel). Hay un `ACEPTADO mensajes=1` del 04-oct 03:41 UTC que no fue de pruebas.
3. Rotar la credencial de julio de ExamenFácil si no se rotó (`shred` sobre ext4 + discard no garantiza borrado físico).
4. GambusasChile: cabeceras duplicadas nginx/webhook; opcional `limit_req` en `/api/webhook_wa.php`. `meta-sync` deshabilitada (falta `INSTAGRAM_BUSINESS_ACCOUNT_ID`); el token de WhatsApp sin WABA asignada (Jaime, Business Manager).
5. Portal VIP: yami-spa sin canjear (🔴 no usarla para pruebas); refactor identidad → `tokenFirmado.ts`; brechas 2, 3-5, 7-8; `verificarBorde.test.ts` inestable.
6. Fondo: `pm2-logrotate`; bandeja de `ventas@`, compra real del pack $14.990, DMARC `p=quarantine`; acme-challenge ajenos en examenfacil.cl (observar).

## 2 · Nuevo de esta sesión

- **Instalar `gh`** (`winget install GitHub.cli` + `gh auth login`). Sin él, Claude no puede lanzar `workflow_dispatch` ni leer el log de un run fallido; esta sesión diagnosticó por `auth.log` del VPS. Tarea `cockpit-gh-cli-local` (pendiente).
- `CLAUDE.md` raíz y la skill `cierre-sesion` aún mencionan `deploy-1gb.yml`; ya no existe. Higiene de docs, sin urgencia.

## 3 · Estado de los repos al cierre

- **`zasa-orchestrator`:** limpio, `main` = `origin/main` en `344e69c` (telemetría); producción en `344e69c` si el deploy de la telemetría terminó (ver memoria de arranque).
- **`GambusasChile`:** sin cambios, `d366eb1`.
- **`AuditorLegal`:** cambios sin commitear ajenos a esta sesión (`api_handler.php`, `js/main.js`, `.gitignore` nuevo). No se tocaron.
- **Portal de Jose:** ficheros sin rastrear (documentos de cliente). No se tocaron.

## 4 · Trampas operativas

- **Diagnosticar un deploy sin `gh`:** `grep "sshd.*Accepted" /var/log/auth.log` en la ventana del push. Cero logins de runner (IPs Azure 20.x/132.x/172.x, usuario `root` para zasa, `deploy` para otros repos) = el job murió antes de SSH. Un `Connection closed … [preauth]` sin usuario desde IP Azure = rechazo de host key. Ojo: hay escáneres desde IPs Azure (p. ej. `13.90.206.6`, puerto fijo, usuarios inventados): no son runners.
- **Reflog del checkout** (`git -C /opt/zasa-orchestrator/app reflog -1 --date=iso`) da la hora exacta del pull del deploy.
- `/health` sigue en el commit viejo ~3 min tras el pull (`npm ci` + build); un `commit=` vacío durante segundos = reinicio de PM2, no caída.
- Re-desplegar el mismo commit (`deploy-vps-4gb` manual) no cambia `/health`: la señal es el login del runner + `pm_uptime` de PM2.
- `pgrep -f "<patrón>"` dentro de un `bash -c` se encuentra a sí mismo: falso «sigue corriendo».
- El sudoers de `deploy` solo admite comandos exactos; `www-data` nunca dueño de un web root servido por `scp-action`.

---

## 5 · El paso exacto siguiente

**🔴 Requiere a Jaime:** revisar el diff del `config.php` de GambusasChile (comando en §1.1). Después, Claude confirma que Meta llega al origen (§1.2).
