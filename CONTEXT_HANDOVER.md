# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-24-a (copiloto de BI «M. Jesús»: ADR-003, roles de Postgres y panel en vip.)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memorias de arranque: `arranque-2026-09-25` (este estado), `mjesus-copiloto-bi` (arquitectura) y
> `push-main-despliega-leer-handover` (lección de hoy).
> Hand-off anterior (2026-09-23-a, webhook de leads + CSP del widget): en el historial de este fichero (`2dbe3ce`).
> Sesión del 2026-09-24 05:17 UTC al 08:01 UTC: **95,4 min activos** de 164,1 totales (hubo una pausa por límite
> de uso), **$55.650 CLP**. Telemetría **publicada y verificada** (`zasa-orchestrator` `bf487c4`, entrada
> `2026-09-24-a`; `/health` = `bf487c4` y `dist/data/telemetry.js` la contiene).

---

## 0. Qué se cerró — verificado en producción

| Frente | Estado | Evidencia |
|---|---|---|
| **ADR-003 «M. Jesús»** (copiloto de BI) | ✅ aceptado | `zasa-orchestrator/docs/architecture/003-copiloto-bi-mjesus.md`. Alcance: solo Cockpit (rol admin), solo datos internos. Tres reglas innegociables: catálogo cerrado sin Text-to-SQL, rol `mjesus_ro`, verificador determinista de cifras. §10 = cierre de roles. `4bb0f19` `dd6bd3e` `1dea6c6` |
| **Traspaso de `public` a `zasa_app`** | ✅ | La app conectaba **como superusuario `postgres`** y todo `public` era suyo. `deploy/vps-4gb/000_traspaso_propiedad_zasa_app.sql` (`c625ff1`), aplicado por Jaime. VPS: 35/35 objetos de `zasa_app`, `DATABASE_URL` conecta como `zasa_app`, `/health` ok |
| **Vistas `bi_*` + rol `mjesus_ro`** | ✅ | `sql/bi/postgres/001_vistas_bi.sql`, `002_rol_mjesus_ro.sql` (verificación de privilegios efectivos dentro de la transacción), `deploy/vps-4gb/mjesus-inicializar-bi.sh`, `tests/vistasBi.test.ts` (`dd6bd3e`). VPS: `--sondas` **21/21**; escritura denegada incluso quitando el read-only |
| **Panel de M. Jesús en vip.** | ✅ | Solo rol admin; Sofía sigue para el resto de roles, en la landing (bundle idéntico byte a byte) y en `/sofia`. Sin motor: entrada desactivada y aviso visible (`MOTOR_CONECTADO = false`). `admin_solucionesconia` `c11cb02` |
| **Desborde horizontal en móvil** | ✅ | `overflow-x: clip` en `.vip__cuerpo` (no `hidden`: rompería la cabecera sticky), guarda `min(Npx, 100%)` en 16 rejillas, botón a 16 px + safe-area. `2fbbe26`, servido en vip. (`index-RTzTzUDQ.css`) |

**Repos al cierre:** `zasa-orchestrator` y `admin_solucionesconia` limpios y `= origin/main`. Raíz: este fichero y
CLAUDE.md (commit de cierre). `examenfacil-cl`, `AuditorLegal` y `privado_agencia/Clientes/Jose` tienen cambios sin
commitear **que no son de esta sesión**.

---

## 1. Paso exacto para arrancar

✅ **COMPLETADO 2026-09-25 (Fase 1) — rotación del `cfut_` filtrado el 22-sep.** Ejecutado por Jaime a mano en el
VPS; evidencia reportada por Jaime (Claude no pudo verificarlo: el modo automático bloqueó la lectura del `.env` de
producción y la edición de `/root/.bash_history`):
- `CLOUDFLARE_API_TOKEN` de `/opt/solucionesconia/.env`: huella sha256 nueva `873c9da4` (la vieja era `8c488bd6`).
- `grep -c cfut_ /root/.bash_history` = `0`.
- Revocación del token viejo en el panel de Cloudflare: la hizo Jaime (el history purgado era la última copia del
  valor viejo, así que ya no se puede comprobar con el propio token).

✅ **COMPLETADO 2026-09-25 (Fase 2) — credencial del superusuario `postgres`.** Ejecutado por Jaime a mano en el VPS
siguiendo el procedimiento B→C→D (el `.bak` se borra solo después de la prueba negativa). Evidencia reportada por Jaime:
- B: `ALTER ROLE postgres PASSWORD NULL` → `rolpassword is null` = verdadero.
- C1: la `DATABASE_URL` del `.bak` → `FATAL: password authentication failed for user "postgres"`.
- C2: `runuser -u postgres -- psql` (peer, el de los respaldos de las 03:00) → `1`.
- C3: `/health` de `127.0.0.1:3001` = ok, PM2 `online`.
- D: `/opt/zasa-orchestrator/.env.bak_superuser` eliminado.
- No se reportaron las salidas de las comprobaciones previas A1–A4 (conexiones vivas de `postgres`, otros ficheros con
  URL de `postgres`, `PGPASSWORD`/`.pgpass`). C1–C3 en verde cubren el riesgo principal; si apareciera un fallo de
  conexión de algún proceso, empezar por A2.
- Pendiente de reflejar en ADR-003 §10.4 (`zasa-orchestrator`; push a `main` despliega el orquestador).

➡️ **Paso siguiente:** cola §2 — lo de Claude es M. Jesús F1 (`catalogo.ts` + `derivar.ts`).

---

## 2. Cola (por cercanía a producción)

0. **Acciones de Jaime:**
   - ✅ **CERRADO 2026-09-25 (ver §1).** ~~`/opt/zasa-orchestrator/.env.bak_superuser`~~ (600, root, 24-sep 06:19 UTC) guardaba la `DATABASE_URL`
     del **superusuario `postgres` con su contraseña**. `postgres` tiene contraseña y `pg_hba` admite `scram` por
     loopback → credencial casi seguro válida. Orden: confirmar que nada usa `postgres` por TCP (los respaldos van por
     `runuser` + `peer`) → `ALTER ROLE postgres PASSWORD NULL` → borrar el `.bak`. Claude puede verificar después.
   - **Panel de M. Jesús «aparece y desaparece» en su móvil:** falta un dato. Tras desaparecer, ¿la URL es `/login`?
     Descartados CSS, lógica por ancho/UA y choque con Sofía; no se reproduce emulado (375/320 px). La única vía de
     desmontaje es un 401 → `window.location.assign("/login")` (`admin_solucionesconia/src/api/httpClient.ts:90`).
     Si es `/login`, mirar 401 con UA móvil en `access.log` de vip.
   - Pendientes del 23-a sin tocar hoy: Papelera de Windows (ficheros sensibles), confirmar `SALES_WEBHOOK_URL`,
     ver Auditoría con sesión admin, limpiar el E2E del 22-b.
1. **M. Jesús — resto de F1** (ADR-003 §8): `catalogo.ts` con las 7 métricas sobre `bi_*` y `derivar.ts`, con tests,
   **sin LLM todavía**. Todo el SQL cualificado `public.bi_*`.
2. **M. Jesús — F2/F3:** enrutador (Haiku), analista (Sonnet + tool use), verificador de cifras, `/api/admin/mjesus/*`
   con `protegerPlugin` + `requiereRolAdmin`, `MJESUS_HABILITADO=admin`, y conectar el panel (`MOTOR_CONECTADO`).
3. **H7 / H8 / H4** del Portal VIP (ver handover 23-a): tenantId del widget, prueba CSP automatizada, claves `sk_live` estáticas.
4. ✅ **CERRADO 2026-09-25 — reinicios de PM2 de `zasa-orchestrator`.** Diagnóstico de Claude (solo lectura): 62
   reinicios **históricos** (un `pm2 restart` por despliegue), no un bucle: `unstable restarts` = 0, 18 h de actividad
   seguida desde el despliegue de las 08:06 UTC del 24-sep, heap de 73 MiB con un límite de 512 MiB. El log de errores
   vacío **no prueba nada**: se rota a las 00:00 (0 bytes, `Sep 25 00:00`). Jaime ejecutó `pm2 reset` (contador = 0:
   desde ahora, cualquier reinicio fuera de un despliegue es señal real) y puso a 600 `/root/.pm2/logs/*.log`
   (antes 644). ⚠️ **Sin verificar:** si la rotación de medianoche crea los ficheros nuevos otra vez a 644, el
   endurecimiento dura un día. Comprobar mañana con `ls -la /root/.pm2/logs/` y, si ha vuelto a 644, fijarlo en la
   configuración de la rotación (`pm2-logrotate` o `logrotate`: `create 0600`).
5. Heredados: `cloudflared` y `127.0.0.1` fuera de `set_real_ip_from`; `elrincon-backend` en Node 18 EOL y Postgres
   como superusuario (mismo problema que se arregló hoy en `zasa_portal`); `.bak` en `sites-available`;
   `sincronizar-secretos-borde.sh` sin `vip-portal.conf`; MVG 3 y 4; GambusasChile CI; `package.json` 2.4.0 vs tag v2.5.0;
   telemetría 09-16-b y 09-22-a sin reconstruir.

### 2.1 Matriz de riesgos abiertos de seguridad (priorizada 2026-09-25)

Tras cerrar `cfut_`, la credencial de `postgres` y los reinicios de PM2 ya no queda **ninguna credencial expuesta
conocida**. La matriz sale del handover y de las memorias; ningún punto se ha vuelto a comprobar en el VPS el 25-sep.

**🟠 Alta: exposición de credenciales o de integridad**
1. **H4: claves `sk_live` estáticas** en el Portal VIP. Son credenciales de larga vida sin rotación.
2. ✅ **CERRADO 2026-09-25: `www-data` ya no puede escribir en el portal de Jose.** Jaime ejecutó a mano en el VPS el
   procedimiento de Claude: respaldo de permisos en `/root/backups-permisos/`, `chown -R deploy:www-data` sobre
   `/var/www/elrincondedonselso`, directorios a `00755` (con 5 dígitos: `chmod 755` de GNU **conserva el setgid**) y
   ficheros a 644. Claude lo verificó en el VPS (solo lectura): `public/jose` = `deploy:www-data` 755/644, symlink
   `/var/www/elrincondedonselso.cl/jose` intacto, `https://127.0.0.1/jose/` con `Host` → **401** (Basic Auth),
   ninguna línea en `error.log`. La lectura efectiva de `www-data` la confirmó Jaime.
   - Hallazgos al investigarlo: `/var/www/elrincondedonselso` **no es un checkout de git**. El `deploy.yml` del repo de
     Jose **nunca se ha ejecutado**: el clon no tiene `origin`, la rama es `master` y el trigger es `main`, y el
     contenido del VPS (2-3 jul) es anterior al workflow (5 jul). Si se activa, hay que coordinar `VPS_USER=deploy`,
     el `chmod` en la lista blanca de sudoers y el remoto con la rama alineada.
   - ⚠️ El repo local de Jose tiene **sin rastrear** las fotos de la cédula, un informe legal en PDF,
     `01_Inicio_Empresa/` y `02_Contabilidad/`. Meterlos en el `.gitignore` **antes** de configurar `origin`.
   - Un `curl` a `127.0.0.1` **sin** `-H "Host: …"` cae en el vhost por defecto y da un 404 que no significa nada;
     por `http://` sale un 301. La sonda válida es `https://` + `Host`.
3. **`sincronizar-secretos-borde.sh` no conoce `vip-portal.conf`.** En la próxima rotación de secretos de borde, vip.
   se queda con el valor viejo: o se rompe, o sigue aceptando el secreto anterior.
4. **`config_secret.example.php` de ExamenFácil se sirve con 200.** Es la plantilla de la configuración secreta.
   Abierto según la memoria `examenfacil-health-endpoint`; sin comprobar.

**🟡 Media: superficie o fiabilidad de los controles**
5. **`127.0.0.1` y el túnel `cloudflared` fuera de `set_real_ip_from`.** El tráfico del túnel se registra y se
   limita como si viniera de una sola IP.
6. **`elrincon-backend` en Node 18**, sin parches de seguridad. Es el servicio de pagos.
7. **SSH con reenvío de puertos activo en las llaves de administración.** Una llave robada sirve para pivotar hacia
   servicios internos (Postgres, `:3000`, `:3001`).
8. **H7: `tenantId` del widget** en el Portal VIP.
9. **H8: sin prueba automatizada de la CSP.** El incidente del 22 al 24-sep pasó justo por eso.
10. **Los logs de PM2 pueden volver a 644** tras la rotación de las 00:00. Comprobar el 26-sep con
    `ls -la /root/.pm2/logs/` (ver §2, punto 4).

**⚪ Baja: higiene**
11. La receta manual de nginx sigue dejando `.bak` en `sites-available`.
12. Faltan los pilares 3 y 4 de MVG.
13. **`SALES_WEBHOOK_URL` vacío;** el lead y el evento de Calendar de la prueba E2E del 22-b siguen sin borrar.
14. **Fuera del VPS:** vaciar la Papelera de Windows, que tiene ficheros sensibles.

---

## 3. Trampas nuevas (no volver a tropezar)

1. **Un push a `main` de `admin_solucionesconia` DESPLIEGA a vip.** (`deploy-vip.yml`, ~40 s). Ya lo decía el handover
   del 23-a; hoy se empujó `c11cb02` sin saberlo porque la sesión no pasó por `/inicio-sesion`. CLAUDE.md decía
   «se copia a mano»: corregido. **Antes de cualquier push, mirar `.github/workflows/`.**
2. **`/opt/zasa-orchestrator/app/.env` es un SYMLINK** a `/opt/zasa-orchestrator/.env` (`desplegar.sh` §4). Escribir
   con `mv` sobre la ruta del enlace lo convierte en copia y el siguiente deploy la aparta como «huérfana». Resolver con
   `readlink -f` (el script de M. Jesús ya lo hace).
3. **`has_sequence_privilege()` lanza sobre relaciones que no son secuencias**, y el planificador puede evaluarla antes
   que el filtro `relkind = 'S'`: protegerla con `CASE`. Lo cazó PGlite antes de producción.
4. **Postgres embebido para probar SQL:** `@electric-sql/pglite` en el scratchpad + el `tsx` del orquestador, con los
   `ESQUEMA_*.postgres` reales. Roles, `SET ROLE` y `has_*_privilege` funcionan; los defaults de `ALTER ROLE … SET`
   **no** (solo aplican al login): esos los prueban las sondas del VPS.
5. **`REASSIGN OWNED BY postgres` está prohibido** por Postgres: traspaso objeto a objeto (script `000_…`).
6. **Verificar vip. con CSP real sin backend:** servidor Node mínimo en el scratchpad que sirve `dist/` con la cabecera
   de `seguridad-vip.conf` (sin `upgrade-insecure-requests` en localhost) y stub de `/api/admin/health`; sesión admin
   inyectando `sc.admin.session.perfil` en `sessionStorage`. En Windows, `path.resolve` para el prefijo de `dist/`.
7. **La emulación de viewport del panel del navegador deja estilos rancios** de elementos fixed tras redimensionar:
   forzar recálculo antes de concluir nada.
8. **`gh` sigue sin estar** y la integración de GitHub no ve Actions: el despliegue se verifica por el recurso servido
   (hash del bundle en vip., `/health` del orquestador).

---

## 4. Secretos

- Ningún valor pasó por el chat. La clave de `mjesus_ro` la genera el script en el VPS, viaja a psql por stdin con el
  registro apagado y a las sondas por un `PGPASSFILE` efímero.
- `cfut_` comprometido: **rotado el 2026-09-25** (huella nueva `873c9da4`, §1). Credencial de superusuario `postgres`: **anulada y `.bak` borrado el 2026-09-25** (`postgres` solo entra por `peer`, §1).
