# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-15-a (sobre la base del 2026-09-13-a)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-09-14`. Fuente de verdad de la llave GPG: `STATE.md`.
> Telemetría publicada y verificada en `/health` (`463920d`): `2026-09-13-a` (233,2 min activos · $136.033).
> Telemetría de `2026-09-15-a` publicada en `3fa6543` (59,2 min activos · $34.533); estado de deploy en §0.a.

---

## 0.a Sesión 2026-09-15-a — operativo Zero Trust del widget de ventas (CERRADO en producción)

Origen: auditoría read-only del baseline (`src/controllers`, `src/services`, `src/core/auth|tenancy`, hook de
`server.ts`). Hallazgo 🔴: `GET /api/sales-agent/config` era la única ruta pública sin `guardarAccesoPublicoEstricto`
(sin token y Origin solo si venía) → fuga de `routerPrompt`/`reglas` y enumeración de slugs por 200/404.

| Frente | Estado | Evidencia |
|---|---|---|
| **Guarda estricta en `/config`** (`zasa-orchestrator`): misma guarda que `/chat`, `/book`, `/tenants`; `resolverTenantConValidacionOrigen` eliminada; `tests/salesAgentConfigGuard.test.ts` (7 casos, el 1.º reproduce la petición vulnerable → 403) | ✅ desplegado | `bc6eb99` · suite 53/53 |
| **`X-Widget-Token` en el fetch de `/config`** del widget (`admin_solucionesconia`, `SalesAgentWidget.tsx:758`); bundle `vendedor-ia-v17.js` regenerado y subido **antes** del backend (`.new` → sha256 → `.bak` → `mv`) | ✅ en producción | `5871903` · sha256 `83e9b96b…` en `/opt/agencia/public/widget/` |
| **Allowlist del Portal VIP** (`https://vip.solucionesconia.cl`): en `salesAgentTenants.ts` (tenant `default`) **y** en el `map $sales_cors_origin` del vhost `admin.` (VPS, no versionado; backup `admin.solucionesconia.cl.2026-09-15_235548.bak-cors-vip`, `nginx -t` OK, reload 23:55Z) | ✅ desplegado | `b964b8d` · `/health` = `b964b8d` a las 23:57Z |

Matriz final en producción (vía Cloudflare): sin token/sin Origin → **403**; slug inexistente sin contexto → **403**
(ya no enumera); token + Origin ajeno → **403** sin ACAO; token + Origin de landing/liset/**vip.** → **200**
(`/config` y `/chat`, ACAO reflejado). **El widget dentro del Portal VIP llevaba dando 403 en `/chat` desde agosto**
(su Origin nunca estuvo en la allowlist); hoy funciona por primera vez.

Trampas aprendidas:
- `Origin` es *forbidden header*: **ningún** parche de cliente puede añadirla ni simularla. Si una ruta pública da
  403 «Origen no permitido», el arreglo es la allowlist (dato) + el map CORS de nginx, no el frontend.
- La SPA vive en `vip.`, no en `admin.`; `API_BASE` es absoluto a `admin.` → toda llamada del portal es cross-origin.
- `public/widget/vendedor-ia-v17.js` está **rastreado**: construir antes de commitear, o el commit lleva el bundle viejo.
- El vhost de `admin.` **solo existe en el VPS**: ningún `deploy.sh` lo regenera, pero tampoco hay copia versionada.

Cola que dejó la auditoría (🟠, no bloqueante — ver matriz completa en el transcript de la sesión):
1. `http://localhost:5173/4173` en `allowedOrigins` de todos los tenants en producción → gatear por `NODE_ENV`.
2. `POST /api/vip/:tenantId/sesion` acepta token maestro + `X-Tenant-Id` (impersonación de cliente por staff) y no
   aplica `pruebaDeBordeValida` al Bearer; la emisión no audita actor ni vía.
3. `RBAC_BOOTSTRAP_ADMIN_PASSWORD` sigue en el `.env` tras el bootstrap (mínimo 8 chars): cambiar contraseña de
   `admin` desde el panel y retirar la variable (acción de Jaime).
4. `analyzeController.ts:33`: URL hardcodeada al host de DO retirado; audios con nombre predecible en `public/audios/`.

## 0.b Actualización 2026-09-15 — experimento «Sofía multicerebro» aislado en rama

`zasa-orchestrator` tenía **14 ficheros sin commitear en `main`** (~2.100 líneas) que no aparecían en ningún hand-off:
el Core Multicerebro de Sofía (Fase 1). Se respaldaron **sin revisar** en la rama local
**`feat/sofia-multibrain-draft`** (commit `7b193a0`, solo local, **sin push**) y `main` volvió a quedar limpio y
sincronizado con `origin/main` (`6047dd5`).

- Qué hay en la rama: `src/sofia/` (agente, clasificador, herramientas, inyector de contexto, pipeline, supervisor,
  tipos), `src/services/sofiaMulticerebroService.ts` (elige motor por tenant: env `SOFIA_MOTOR` + bandera
  `usaMatrizRubros`), `MODELO_OPUS` en `claudeService.ts`, dos `export` nuevos en `salesAgentService.ts`, el
  `salesAgentController` enrutando a legacy o multicerebro, y `tests/sofiaApiIntegration` + `sofiaCoreMulticerebro`.
- Estado: **borrador no documentado, no revisado, no desplegado.** No fusionar a `main` sin pasar la suite
  (`npm test`). Verificado en el código: `motorParaTenant()` devuelve `legacy` salvo que `SOFIA_MOTOR=multicerebro` **y** el
  tenant tenga `usaMatrizRubros`, así que un merge sin esa env var no cambia el comportamiento en producción.
- Por qué existe: dejar `main` limpio para la revisión del Portal VIP sin perder el trabajo. Retomar el experimento
  = `git checkout feat/sofia-multibrain-draft` en `zasa-orchestrator`.

## 1. Qué se cerró en esta sesión (todo verificado en producción)

| Frente | Evidencia |
|---|---|
| **Navegación unificada admin↔vip**: barra en el Cockpit (`admin.`) hacia Clientes / Novedades / Cobros / Sofía de la SPA, y «Centro de Mando ↗» en la lateral de la SPA; etiqueta «Cobros / Facturación» | `zasa-orchestrator` `deb283a`; `admin_solucionesconia` `de76d8f` |
| **Login del panel desbloqueado**: causa doble — el operador tecleó `jaime` (solo existe `admin`) y el hash scrypt de `admin` no coincidía con ninguna contraseña conocida (bootstrap de una sola vez). `bootstrap-admin.ts --reset --aplicar` ejecutado con autorización; Jaime entró (access.log 02:34Z, `autenticar → 200`) | `0e83c94`, audit `rbac.admin.restablecido` |
| **Avatar de Sofía desbordado** en el panel: `globals.css` arrastraba una copia del CSS del widget sin las reglas del avatar fotográfico; portadas (30/42 px, `object-fit: cover`) | `2ca0d80`, dist `index-CKtfQ3Iq.css` |
| **Módulo Portales completo**: `client_portals` (milestones **JSONB**) + `client_portal_documents`; `/api/admin/portals/*` (guard admin, multipart, proxy); `/api/vip/:tenantId/portal` + descarga con guard de sesión; `portal-vip.ejs` dinámico (URL compuesta en plantilla, estado vacío); SPA `/portal/portales` (ficha, hitos, drag&drop, sha256, `<progress>` por CSP). 45 tests nuevos (994/994) | `de237bb`, `5015846`, `af86659`; SPA `6c2251b` (swap 30/30) |
| **Auditoría Zero Trust** con fixture `cliente-test`: 30 pruebas fail-closed (cross-tenant API/HTML, JWT manipulado, traversal, inyección, escalada), suspensión con corte inmediato, purga completa (BD + disco), `audit_log` conservado | `security-alerts.log`, censo `demovip/forte-spa/liset` intacto |
| **`tenant-purge.sh`** (schema dinámico, BEGIN/COMMIT, disco solo tras COMMIT, `--dry-run` con ROLLBACK, `--force`) y **`security-telemetry.sh`** (audit_log + pino + nginx; alertas `chattr +a`; **cron `*/15` ventana 20 min**; logrotate) | `c1b172e`, `85e2c42`, `d2b8f81`; `/opt/zasa-orchestrator/scripts/` root 0700 |

Suite del orquestador: 52 ficheros · **994 tests** · typecheck/lint 0. Repos limpios y en `origin/main`:
`zasa-orchestrator` `463920d`, `admin_solucionesconia` `6c2251b`. Salud final: PM2 ×2 online, nginx/postgres/cron/ufw
activos, 4 dominios 200, perímetro 401/403 en origen y borde.
**Estado al cierre del 2026-09-15-a**: `zasa-orchestrator` `main` = `origin/main` = producción = **`b964b8d`** (53 ficheros
de test en verde); `admin_solucionesconia` `main` = `origin/main` = **`5871903`**, bundle del widget en producción ≡ HEAD.
Rama local sin push `feat/sofia-multibrain-draft` (`7b193a0`, ver 0.b).

## 2. Paso exacto siguiente

**Revisión visual con sesión de admin** (solo Jaime, ~10 min): entrar en `vip.solucionesconia.cl/login` (usuario
`admin`, contraseña = `RBAC_BOOTSTRAP_ADMIN_PASSWORD` del `.env` del VPS), abrir «Portales», elegir un cliente real,
rellenar ficha + hitos, guardar y abrir «Ver como cliente». Es lo único del módulo no visto con ojos humanos; todo lo
demás está medido en Chromium y en producción con el fixture.

## 3. Cola (por cercanía a producción)

1. **Aviso activo** cuando `security-telemetry.sh` devuelva `rc=10` (hoy solo escribe): correo por Resend o entrada
   en la telemetría del Cockpit. El cron ya corre; falta el canal.
2. `tenant-purge.sh`: ejercitar el camino **COMMIT real** contra un fixture desechable (solo se ha probado en seco).
3. `setNotFoundHandler` en Fastify que no repita la URL pedida en el 404 (`Route GET:/api/vip/etc/passwd not found`).
4. Retirar `admin_solucionesconia/.env.test.txt` (apunta al clúster Neon retirado con otra contraseña).
5. El Rincón: `MP_WEBHOOK_SECRET` de `/opt/elrincon-backend/.env` (pendiente desde el 12-sep).
6. Certificado de revocación GPG fuera del portátil · shard viejo de Francisco · ufw 22 duplicado.

## 4. Trampas (no volver a tropezar)

1. **`node -e "…" VAR=x` pasa `VAR=` como argumento, no como entorno** (va ANTES del comando). Costó dos 401 falsos.
2. La `invitacion` de `/api/admin/clientes/:id/invitacion` **no es un Bearer**: es contraseña temporal para
   `POST /api/auth/client-login` (correo + invitación) → cookie `__Host-sc.cli`; `/api/vip` da **403 password_temporal**
   hasta `client-set-password` (solo letras y números, ≥6).
3. `psql -q` suprime `DELETE n`/`COMMIT`: nunca en la ejecución transaccional que se quiere verificar.
4. `set -e` + `grep -c` con recuento 0 aborta el script en silencio (`|| true`).
5. El dev-proxy de Vite no inyecta `x-edge-proof`: en local, mini-proxy que la añada o `/api/admin` queda cerrado.
6. `__Host-` cookies no sobreviven `addCookies` en `http://127.0.0.1` de Playwright: usar `fetch` + `Cookie` manual.
7. Rate limit de login 5/15 min **por IP**: las sondas propias lo agotan; esperar la ventana antes de leer un 401 «por estado».
8. Fastify normaliza `..` antes de enrutar: un test de traversal llega como 404 del router, nunca al handler.
9. `sed`/`perl` con muchos escapes fallan en silencio: verificar SIEMPRE con `grep` que la sustitución aplicó (dos veces
   no aplicó y la E2E lo destapó).

## 5. Secretos

Ninguno pasó por el chat: tokens y contraseñas se cargaron en el shell del VPS y se mostraron solo enmascarados
(prefijo/sufijo/longitud). Los `.env` siguen 600 root. El fixture `cliente-test` fue purgado (0 filas, 0 ficheros).
