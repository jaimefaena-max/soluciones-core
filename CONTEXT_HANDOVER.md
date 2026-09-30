# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-30-a (GambusasChile: correo operativo, soft 404 y notificación dual Zero Trust)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memorias de arranque: `backlog-arranque-proxima-sesion` y `transcript-dir-gambusas-drift`, en
> `~/.claude/projects/C--Proyectos-Workspace-Clientes-GambusasChile/memory/`.
> Hand-off anterior (2026-09-29-a, pagos MP y rescate del CI): en el historial de este fichero.
> Sesión del 2026-09-30 18:33 al 22:20 UTC: **101,8 min activos** de 227,3 totales,
> **$59.383 CLP**. Telemetría `2026-09-30-a` en `zasa-orchestrator` `d098ee7`,
> **publicada y verificada** (`/health` = `d098ee7`, `grep` en `dist/` = 1; tardó ~6 min).
>
> **Forma de trabajo:** igual que la sesión anterior — Jaime dicta cada paso con rol y
> matriz de restricciones. Varias premisas venían equivocadas y se corrigieron antes de
> ejecutar: un `.env` en el web root que PHP no lee, una ruta `/var/www/gambusaschile/html`
> que no existe, argumentos de `enviarEmailConfirmacion()` en otro orden (habría dado
> TypeError), y un script de prueba escrito dentro del web root.

---

## 0 · 🟢 Correo transaccional OPERATIVO de extremo a extremo (salvo un pago real)

- **Resend verificado:** DKIM `resend._domainkey`, SPF + MX en `send.`, DMARC `p=none`.
- **Clave rotada:** Jaime pegó una clave en el chat → tratada como expuesta, **no se
  instaló**. La nueva (`…cGA5`) entró a la Bóveda a las 20:56:58 UTC por script con
  `read -s` + stdin de SSH. Bóveda `640 www-data:www-data`.
- **Email Routing:** MX raíz `route{1,2,3}.mx.cloudflare.net` + SPF raíz verificados en DNS;
  reglas `hola@` y `ventas@` → correo personal (configuradas por Jaime, no visibles por DNS).
- **Notificación dual endurecida** (`0743749`, desplegada y con hashes del VPS = commit):
  escape HTML, saneo de cabeceras, envío cliente y `ventas@` independientes, timeouts,
  log del rechazo de Resend, `aviso_ventas` en el marcador.
- **Prueba E2E en producción** de la función real: `cliente => true`, `ventas => true`.
- **Auditoría de logs post-deploy:** 0 Warning / TypeError / Fatal.
- **Soft 404 cerrado** (`try_files … =404`, backup `/root/backups-nginx/gambusaschile.cl.20260930-184309`).
- **`PLAYBOOK_RECUPERACION.md`** en el repo: bóveda, rotación con el script completo,
  rollback nginx, flujo dual con dependencias, rollback de código.

---

## 1 · Pendientes (en orden)

| # | Qué | Quién |
|---|---|---|
| 1 | **Confirmar que llegó a la bandeja** el aviso de prueba `[VENTA GAMBUSAS] John Doe (TEST E2E) - $24.990 CLP aprobado` enviado a `ventas@` ~22:00 UTC. Si no está (ni en spam), revisar la regla de `ventas@` en Cloudflare Email Routing | **Jaime** |
| 2 | **Revocar en Resend la clave expuesta en el chat** (la que empieza por `re_Jhj`) si no se hizo | **Jaime** |
| 3 | **Compra real** del pack de $14.990 → certifica pago → webhook → dos correos. Monitor en §3 | **Jaime** |
| 4 | Commitear lo pendiente en `zasa-orchestrator` (sigue sin tocar desde el 29-sep: `npm audit fix`, `ds.js` + `informe.ejs` + test, `audit-fase{1,2,3}.md`) en commits separados | Claude |
| 5 | Timeout explícito en `tests/verificarBorde.test.ts` (rojo falso que bloquea deploys) | Claude |
| 6 | DMARC `p=none` → `p=quarantine` cuando los reportes estén limpios | Jaime + Claude |

**Sobre el webhook en el panel de MP:** el log de la app tiene `pago 123456: firma valida`
a las 06:22 y 15:56 (hora Chile). `123456` es el id que usa el **simulador de
notificaciones del panel de MP**, así que la URL está registrada y la firma de la Bóveda
coincide con la del panel. El 404 posterior es lo esperado (ese pago no existe). Falta
ver una notificación de un pago real.

---

## 2 · Estado de los repos al cierre

- **`GambusasChile`** — limpio y sincronizado con `origin/main` en `cae9fa1`.
- **`zasa-orchestrator`** — `d098ee7` (telemetría) publicado; el árbol sigue con los 11
  ficheros del 29-sep sin commitear (ver pendiente 4). No se tocaron.
- Fuera de alcance: cambios sueltos en `ExamenFacil`, `AuditorLegal` y el portal de Jose.

---

## 3 · Monitoreo del primer pago real (comando probado)

```bash
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 '
L=/var/lib/gambusaschile/logs
echo "=== Monitor GambusasChile · $(date -u +%H:%M:%S) UTC · Ctrl-C para salir ==="
{
  tail -F -q -n 0 "$L/webhook-mp-2026-09.log" "$L/webhook-mp-2026-10.log" 2>/dev/null \
    | sed -u "s/^/[WEBHOOK] /" &
  tail -F -q -n 0 /var/log/nginx/error.log 2>/dev/null \
    | grep --line-buffered "GAMBUSAS" \
    | sed -u "s/.*\(\[GAMBUSAS\][^\"]*\).*/[COBRO]   \1/" &
  wait
}'
```

**Línea que certifica el circuito:** `[WEBHOOK] pago <id> APROBADO · ref iniciacion-<hex> · $14.990 · correo=ok`,
**sin** línea `ATENCION, aviso de venta a ventas@ NO enviado`. Después, el marcador
`/var/lib/gambusaschile/pagos-procesados/<id>.json` debe tener `email_enviado: true` y
`aviso_ventas: true`. Si Resend rechaza, el motivo sale como `[COBRO] [GAMBUSAS][EMAIL] Resend rechazo el envio: HTTP …`.

---

## 4 · Trampas operativas (vigentes)

- **Scripts que llevan un secreto por stdin a `bash -s`:** el secreto no puede ser la
  primera línea — `bash -s` lee su programa de ese stdin y lo **ejecuta como comando**
  (imprimiéndolo en el error). Patrón correcto: `printf 'IFS= read -r KEY\n%s\n' "$KEY"`
  y el script detrás. Está en el playbook.
- **Escrituras remotas al VPS desde Claude:** el clasificador de permisos bloqueó un
  cambio de nginx por SSH. Vía que funcionó: Claude prepara el script en local y Jaime
  lo lanza con `! ssh … 'tr -d "\r" | bash -s' < script`. Los secretos, en cambio,
  **nunca** por `!`: en una terminal propia, porque `!` vuelca la salida al transcript.
- **Pruebas de PHP en el VPS sin fichero temporal:** `ssh … 'php' <<'PHP' … PHP`. Nada en
  disco, nada en el web root, nada que borrar.
- **El deploy de `zasa-orchestrator` tardó ~6 min** esta vez (no ~2): esperar antes de
  dar la telemetría por no publicada.
- **`end_session.js` necesita `--transcript` explícito** (deriva del CWD). Usado así hoy:
  midió 101,8 min, coherente con `session-audit.ps1`.
- **`error_log` de PHP-FPM acaba en `/var/log/nginx/error.log`**, no en `php8.3-fpm.log`.
- **`verificarBorde.test.ts` sigue frágil** (pendiente 5).

---

## 5 · El paso exacto siguiente

**Jaime: mirar si llegó a la bandeja el correo de prueba `[VENTA GAMBUSAS] John Doe (TEST E2E)`**
(buzón personal, vía `ventas@`). Es lo único que falta para dar por verificada la
recepción por Email Routing, y cuesta diez segundos. Después, la compra real de §3.
