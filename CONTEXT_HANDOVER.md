# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-13-a

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-09-14`. Fuente de verdad de la llave GPG: `STATE.md`.
> Telemetría publicada y verificada en `/health` (`463920d`): `2026-09-13-a` (233,2 min activos · $136.033).

---

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
