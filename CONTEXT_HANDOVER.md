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
4. PM2 marca **61 reinicios** acumulados de `zasa-orchestrator` (estable 51 min tras el cambio de rol). Mirar si son históricos o hay bucle.
5. Heredados: `cloudflared` y `127.0.0.1` fuera de `set_real_ip_from`; `elrincon-backend` en Node 18 EOL y Postgres
   como superusuario (mismo problema que se arregló hoy en `zasa_portal`); `.bak` en `sites-available`;
   `sincronizar-secretos-borde.sh` sin `vip-portal.conf`; MVG 3 y 4; GambusasChile CI; `package.json` 2.4.0 vs tag v2.5.0;
   telemetría 09-16-b y 09-22-a sin reconstruir.

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
