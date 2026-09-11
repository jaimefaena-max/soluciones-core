# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-10-a

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Fuente de verdad de la llave GPG: `STATE.md`. Este fichero **no** lo reemplaza.

---

## 1. Qué se cerró — ciclo Design System v2 de `admin_solucionesconia`

Sesión corta (80 min activos) y de un solo repo. Todo verificado extremo a extremo:

| Paso | Evidencia |
|---|---|
| Commit huérfano `94fa488` (desconexión de la sesión anterior) recuperado y pusheado | rama `feature/design-system-admin` |
| PR #1 creado y fusionado con merge commit (19 commits conservados) | `da4b883` · https://github.com/jaimefaena-max/admin_solucionesconia/pull/1 |
| Build `npm run build` exit 0, `tsc` limpio, 24 ficheros | `dist/` (ignorado) |
| Despliegue atómico a **`/opt/agencia/public/vip`** | `sha256sum -c` 24/24 pre y post swap · tgz en `/root/backups-vip/vip-20260910-220151-pre-da4b883.tgz` |
| Smoke test: curl borde + loopback + Chromium headless | 0 errores de consola, 0 peticiones fallidas, `.ds-card` computado ≡ `primitives.css` |
| Docs: `PROJECT_MEMORY.md` + `AUDIT_REPORT_v2.md` | `5d273b8`, `180dec6` — en `origin/main` |
| Telemetría `2026-09-10-a` escrita con `end_session.js --desde-json --apply` | `zasa-orchestrator` `9ca2395` |

**Rama feature borrada** (local y remota). Repo, remoto y producción alineados:
`main` = `origin/main` = `180dec6`; producción sirve `da4b883` (los dos posteriores son docs).

### Tres trampas que costaron tiempo hoy — no repetir

1. **`dist/` de `admin_solucionesconia` NO se sirve en `admin.solucionesconia.cl`.** Allí la
   `location /` es proxy al Cockpit del orquestador (EJS). El destino real es
   `vip.solucionesconia.cl` → `/opt/agencia/public/vip`. Está en `PROJECT_MEMORY.md` §0 y
   ahora también en §4; comprobar el vhost antes de desplegar, no la etiqueta de la tarea.
2. **El modo automático bloquea dos cosas y está bien que lo haga:** el merge de PR por API
   («merge sin revisión») y el `scp`/`ssh` que escribe en producción («Production Deploy»).
   La vía es pedir autorización explícita a Jaime en el chat; el merge se hizo por
   `git merge --no-ff` + push (GitHub cierra el PR igual). No trocear comandos para rodearlo.
3. **Un 200 en el portal VIP no prueba nada del router** (`try_files → index.html` devuelve
   200 hasta para rutas inexistentes). Enrutado y componentes se validan con Chromium
   headless (Playwright de `Elrincon-qa`, script en el scratchpad `smoke-vip.cjs`).
   `gh` **no está instalado** en el portátil: PRs por el MCP de GitHub.

---

## 2. Infraestructura — VPS `161.35.85.101` (verificado al cierre por loopback)

| Servicio | Estado |
|---|---|
| nginx | `active`, sin errores en log |
| `zasa-orchestrator` (PM2, :3001) | online, 20 h uptime, 139 MB, sin errores en 24 h |
| `elrincon-backend` (PM2, :3000) | online, 46 h uptime |
| vip · solucionesconia · elrincon · examenfacil · gambusas | 200 · 200 · 200 · 200 · 200 |
| admin.solucionesconia.cl | 401 (Basic Auth, correcto) |
| Host | disco 14 %, RAM 1,2/3,9 GB, load 0,08 |

Sin cambios en nginx, PM2 ni firewall en esta sesión. Lo del hand-off anterior
(loopback estricto en `:3001`, purga de `.env*` de respaldo) sigue vigente.

---

## 3. Siguiente paso — Fase D (Shamir / `gpg-backup`) — SIN CAMBIOS

**Sigue siendo el primer bloqueante del workspace**, y sigue en manos de Jaime:

0. 🔴 **Regenerar el blob sin protección S2K propia** (decidido 2026-09-08, opción 2).
   Hasta entonces los 2-de-3 reconstruyen el blob pero **no lo descifran**.
   Procedimiento en `~/.zasa-shards/REGENERAR.md`. Requiere su passphrase.
1. 🔴 **Fase D — repartir los shards, DESPUÉS del paso 0.** Siguen los tres en este portátil.

⛔ **Los shards nunca por el canal del asistente** (ya costó regenerar el juego el 2026-09-06).

### Pendientes de `admin_solucionesconia` (abiertos hoy, por prioridad)

1. **Revisión visual de las 11 vistas migradas** en https://vip.solucionesconia.cl con
   sesión de admin — única casilla abierta del PR #1. Lo verificado es integridad y arranque,
   no aspecto con datos reales. Si Jaime facilita un token de prueba **por canal seguro**
   (variable de entorno local, nunca el chat), `smoke-vip.cjs` se extiende a los 11 módulos.
2. `chore(cleanup)`: borrar `src/components/AuthGuard.tsx` y `src/pages/DashboardPage.tsx`
   (huérfanos; AuthGuard aún guarda token en `sessionStorage`, patrón pre-§5.1).
3. Code-splitting del bundle principal (1,28 MB / 799 kB gzip, warning preexistente).
4. `Content-Security-Policy` en el vhost `vip` (empezar en `Report-Only`; backup + `nginx -t`).

### Otros pendientes del workspace, por cercanía a producción

1. Verificar si los `MP_ACCESS_TOKEN` purgados el 09-sep siguen vivos en Mercado Pago
   (rotar en el panel **no revoca** el anterior).
2. `config_secret.example.php` de ExamenFácil — **ya cerrado** según la telemetría
   `2026-09-09-b` (`ef-config-secret-example-publico`, commit `2be0cd9`); el hand-off anterior
   lo listaba como abierto. No re-auditar.
3. 3 acciones de panel (DO / Cloudflare) que solo puede hacer Jaime.

---

## 4. Nota de cierre

`/cierre-sesion` **sí se ejecutó**: telemetría `2026-09-10-a` (166,6 min totales / 79,9
activos / $46.608 CLP) publicada en `zasa-orchestrator` `9ca2395`. Comprobar en el arranque
que `https://admin.solucionesconia.cl/health` devuelve `9ca2395` o posterior; si no, el
server-pull no corrió y el dashboard no la refleja. La nota del hand-off anterior sobre
`2026-09-09` quedó superada: esas dos entradas (`-a`, `-b`) ya existen en `telemetry.ts`.
