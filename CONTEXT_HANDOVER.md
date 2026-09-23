# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-22-b (hardening Zero Trust del VPS)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memorias de arranque: `hardening-vps-2026-09-23` (estado y riesgos) y `vps-firewall-solo-cloudflare`.
> Hand-off anterior (2026-09-22-a, auditoría en 3 fases e incidente 526): en el historial de este fichero (`b21ec02`).
> Sesión del 2026-09-23 00:20 a 06:45 UTC: **343 min activos** de 384,6 totales, **$200.083 CLP**. Telemetría
> **escrita en local, SIN commit ni push** (ver §1).

---

## 0. Qué se cerró — todo verificado con salida real (VPS, sondas externas, CI)

| Frente | Estado | Evidencia |
|---|---|---|
| **MVG A4: borde nginx versionado** | ✅ | Plantillas de `admin.`, `vip.` y `real_ip` en `zasa-orchestrator/deploy/vps-4gb/nginx-templates/`; `verificar-borde.sh` (14 casos envenenados); pre-commit sobre lo staged; `instalar-plantillas.sh` con gates G4/G5, rollback y vhosts **600 root:root**. `b735bd2` … `2ce79b3`. `docs/MVG.md` marca cerrados los huecos de los Pilares 1 y 2 |
| **Escalada deploy→root (ExamenFácil)** | ✅ | El verificador sale del árbol que controla `deploy`: `/usr/local/sbin/ef-nginx-verificar` (root:root), sudoers sin argumentos, plantilla por stdin. `1685a77`; CI real con 0 denegaciones |
| **Sofía no pierde el lead si Calendar falla** | ✅ desplegado | Se guarda como `sales-agent:agenda-pendiente` y se notifica con `estadoCita`. `0e2215d`; E2E en producción con datos ficticios (evento + fila en Postgres + Resend aceptado) |
| **Portal VIP con despliegue automático** | ✅ | `admin_solucionesconia` `f62e3ec`: `deploy-vip.yml` → `desplegar-estaticos.sh --aplicar` (sha256, staging, gate 443, rollback) |
| **Llaves de CI dedicadas con `restrict`** | ✅ | root: VIP `vlfmws/p` + orquestador `YV02wtEM`; deploy: EF `UKjsHf66`. Viejas (`KmLShir7`, `/1zkxlH7`) revocadas por huella y privadas locales borradas |
| **Firewall: origen cerrado otra vez** | ✅ | La regla `Nginx Full` Anywhere (añadida el 09-22 08:03, casi seguro el parche del 526) reabría 80/443 a Internet. Eliminada con *deadman switch*; IP directa → `000`; 10 hostnames en verde por Cloudflare; `certbot renew --dry-run` 6/6 |
| **Backups de vhosts con secretos** | ✅ | 34 ficheros de `sites-available/` (uno con `API_SECRET_TOKEN` y `EDGE_SECRET` vigentes, 644, legible por `deploy`/`www-data`/`postgres` desde el 09-15) → `/root/backups-nginx/sites-available-residuos-20260923-055727/` (700/600) |
| **Rotación de `API_SECRET_TOKEN` y `EDGE_SECRET`** | ✅ | Huellas: API `694b45c1`→`43309db8`, EDGE `0eeda67a`→`3f6c5150`. 4 sitios; viejo → 403 y nuevo → 200; ventana de 7,1 s sin tráfico ajeno afectado. GitHub no consume estos secretos |
| **`rotar-secretos-borde.sh` versionado** | ✅ desplegado | `933f166` (= `/health`). Gate de cobertura: se niega a rotar si los valores vigentes aparecen fuera de los 3 ficheros gestionados. `rotar-edge-secret.sh` retirado; la copia de `/root` se movió a `/root/backups-rotacion/` |

**Auditoría de cierre (06:41 UTC):**
- PM2: los 2 procesos `online`, 0 reinicios inestables.
- ufw: 6 reglas SSH + 22 rangos de CF, 0 reglas Anywhere en 80/443.
- 0 temporales en rutas críticas, 0 ficheros world-writable, 0 secretos legibles por `www-data`/`deploy`.
- `nginx -t` OK; 0 unidades de systemd fallidas.

**Repos al cierre:**
- `zasa-orchestrator` `933f166` (= producción), limpio salvo `telemetry.ts` sin commitear (§1).
- `admin_solucionesconia` `f62e3ec`, limpio, `0/0`.
- `examenfacil-cl` `1685a77`, con `api_handler.php` e `index.html` modificados que no son de esta sesión.

### Residuos que solo puede cerrar Jaime
1. **Sofía:** `SALES_WEBHOOK_URL` está vacío en `/opt/zasa-orchestrator/.env`, así que el equipo **nunca** ha recibido avisos de leads. Fijarlo y `pm2 restart zasa-orchestrator --update-env`.
2. **Limpieza del E2E:** `DELETE FROM prospectos WHERE id = 1 AND email = 'delivered@resend.dev'` y borrar el evento de Calendar «Pedro Prueba Ficticia» (lunes 28-sep 09:00).
3. **Pendientes de la sesión 09-22-a, sin verificar en esta:** rotar el token `cfut_`, vaciar la Papelera, `PUBLIC_BASE_URL` y la revisión visual de Sofía/«Portales».

---

## 1. Paso exacto para arrancar

🔴 **Bloqueado por Jaime (necesita su OK para el push, que despliega):** publicar la telemetría de esta sesión.
`zasa-orchestrator/src/data/telemetry.ts` ya tiene la entrada `2026-09-22-b`, escrita con `end_session.js` y con typecheck en verde:

```powershell
Set-Location C:\Proyectos\Workspace_Agencia\zasa-orchestrator
git add src/data/telemetry.ts; git commit -m "telemetria: sesion 2026-09-22-b"; git push
```

Luego comprobar que `/health` devuelve el commit nuevo y
`grep -c 2026-09-22-b /opt/zasa-orchestrator/app/dist/data/telemetry.js` ≥ 1. Borrar
`src/data/telemetry.ts.bak-20260923064527.` cuando se dé por bueno.
⚠️ La última sesión publicada en el dashboard es la **`2026-09-16-a`**: faltan la 09-16-b y la 09-22-a, que habrá que reconstruir.

---

## 2. Cola (por cercanía a producción)

0. Residuos de Jaime (§0) y reconstrucción de la telemetría 09-16-b y 09-22-a.
1. **`examenfacil.cl/esquema_db.sql` se sirve con 200** (estructura de 6 tablas médicas, sin datos): sacarlo del web root o añadir un deny.
2. **Túnel `cloudflared` con tráfico real** (admin./vip.) y `127.0.0.1` fuera de `set_real_ip_from`: los clientes del túnel comparten un único cupo de rate limit. Decidir entre retirar el túnel o confiar en loopback (y ajustar `verificar-borde.sh`).
3. `elrincon-backend` (pagos) en **Node 18 EOL**; la app se conecta a Postgres como el **superusuario `postgres`**; `listarProspectos` devuelve `[]` si hay error; fallback silencioso a SQLite si `DATABASE_URL` se rompe.
4. Recurrencia de backups expuestos: la **receta manual** en los comentarios de las plantillas `admin.`/`vip.` todavía hace `cp` a `sites-available/*.bak`. Cambiarla a `/root/backups-nginx/`.
5. `sincronizar-secretos-borde.sh` no conoce `snippets/vip-portal.conf`; `/root/rotar-secretos-borde.sh` (09-11) es un script VIEJO que se llama igual que el versionado.
6. MVG Pilares 3 y 4: `tools/verificar-integridad.ps1`; `uptime-monitor.yml` con invariantes de borde; canal de aviso para `security-telemetry.sh rc=10`.
7. Menores:
   - sshd con `X11Forwarding`/`AllowTcpForwarding` en las llaves admin;
   - `www-data` escribe en el portal de Jose;
   - 8 parches de seguridad pendientes;
   - residuos inertes: `authorized_keys.bak-*` en `/root/.ssh`, `snippets/backups/*.bak`, `/tmp/*/ssr`;
   - STATE.md A5 y handovers viejos mencionan `gha_deploy_key` (retirada);
   - el texto «le llegará la invitación» de Sofía.
8. GambusasChile CI roto: huella de host obsoleta (`hxUBSvY5`); necesita llave dedicada y `known_hosts` al día.

---

## 3. Trampas (no volver a tropezar)

1. **Un parche de incidente puede deshacer un invariante en silencio.** El 526 dejó `Nginx Full` Anywhere y nadie lo vio en 24 h. Tras cualquier incidente: `ufw status | grep Anywhere`, y probar la IP directa **desde fuera**.
2. **`grep -r` no entra en los symlinks** de `sites-enabled/`: hay que usar `-R`, o el resultado sale vacío o sin los vhosts.
3. **`stat` sin `-L` sobre `letsencrypt/live/*/privkey.pem` muestra 777** (el symlink). La llave real está en 600.
4. **El render de las plantillas también rellena los marcadores de los comentarios**: el diff efectivo del instalador ignora comentarios, así que hay que contar las líneas con secretos SIN comentarios.
5. **Con `set -euo pipefail`, un `grep -v` o un `grep -c` que no encuentra nada sale con 1** y aborta el script justo en el caso bueno. Usar `{ grep … || true; }`.
6. **Una auditoría lanzada justo después de un push captura el despliegue a medias**: backup ya creado y HEAD todavía viejo. Esperar ~5 min antes de diagnosticar «la CI no desplegó».
7. **`od -c | grep '\\r'` da falsos positivos**: los CR se cuentan por bytes (`node`: `match(/\r/g)`).
8. Un barrido de «ficheros legibles con secretos» tiene que simular el **recorrido real de permisos** (`runuser -u www-data -- find -readable`). Mirar solo el `o+r` del fichero ignora que `/root` y `/opt/zasa-orchestrator` son 700.
9. Sofía se niega a agendar si el nombre dice «PRUEBA… NO CONTACTAR»: en E2E usar datos ficticios verosímiles con `delivered@resend.dev`.

---

## 4. Secretos

- Ningún valor pasó por el chat: todo se reportó por huella sha256 de 8 caracteres y las sondas leían cabeceras de ficheros 600.
- Rotados: `API_SECRET_TOKEN` y `EDGE_SECRET` (§0).
- Valores viejos, inertes, en `/root/backups-rotacion/secretos-borde-20260923-060837/` (700). Además queda un directorio `…-060741` de un intento abortado, con valores que nunca se instalaron: se puede borrar.
- Llaves privadas de CI: ninguna en el portátil. Quedan `elrincon_deploy`, `id_ed25519` e `id_rsa`; esta última no aparece en ningún `authorized_keys` del VPS.
- `.env` del VPS en 600 root; vhosts con secretos en 600; `vip-portal.conf` en 640 root:root.
