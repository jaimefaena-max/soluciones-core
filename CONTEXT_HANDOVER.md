# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-22-a (auditoría Zero Trust en 3 fases + incidente 526)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-09-23`. Fuente de verdad de la llave GPG y de la tabla de mitigación: `STATE.md`.
> Hand-offs anteriores (2026-09-13-a, 09-15-a, 09-16-a/b): en el historial de este fichero (`git log -- CONTEXT_HANDOVER.md`, commit `e8f495a` y anteriores).
> **Esta sesión NO ha pasado por `/cierre-sesion`**: su telemetría (tiempo activo × $35.000 CLP/h) está pendiente de publicar.

---

## 0. Qué se cerró en esta sesión — auditoría y saneamiento de infraestructura: COMPLETADOS

Auditoría no destructiva de `Workspace_Agencia` (seguridad Zero Trust, Design System v2, deuda técnica) y su
corrección en tres fases, más un incidente de producción causado y resuelto el mismo día. **Todo lo de esta tabla
está verificado con salida real de comando** (loopback del VPS, `/health`, tests, `Get-Acl`, sondas externas).

| Frente | Estado | Evidencia |
|---|---|---|
| **Fase 1 · saneamiento local** | ✅ | Volcado MySQL clínico cifrado a 2 destinatarios (`1244E251EABC3365` nueva + `0E1B95536BFAE3F2` vieja) con **round-trip real** (sha256 idéntico); 8 ficheros con credenciales/obsoletos a la Papelera; ACL por SID (solo `LENOVO` + `SYSTEM`) en `.env` ×2, `.env.production`, `gha_deploy_key` |
| **Fase 2 · 3 PRs atómicos** | ✅ fusionados por Jaime en orden | `solucionesconia#1` (`11a14c6`) → `zasa-orchestrator#6` (`b6a05da`) → `admin_solucionesconia#2` (`e96a2ee`). 07:23Z → 07:24Z → 07:26Z |
| **Fase 3 · sincronización y cierre** | ✅ | Repos en `main` = `origin/main`; ramas `fix/*` borradas local y remoto; `STATE.md` (tabla de mitigación C1, C2, A1–A11 + fases GPG A–D cerradas) y `CLAUDE.md` (12 repos, ruta de clientes, deploy real, SPA en `vip.`) en `agencia-root-orchestrator` `e8f495a`; `workspace-status.ps1` con `vip.` y 11 repos en `claude-skills` `7b819c2` |
| **Widget de Sofía en producción** | ✅ | `/opt/agencia/public/widget/vendedor-ia-v17.js` = blob de `main` **`9d0aa300…`** (backup `.bak-20260922_073639`); mismo hash desde el origen y desde Cloudflare (`cf-cache-status: BYPASS`, sin purga) |
| **Orquestador** | ✅ desplegado solo | `/health` = **`65d7709`**; prueba de borde **fail-closed** en todo el perímetro, `/api/vip` incluido (Bearer sin borde → 403; cookie → 401 del guard; `admin.`/`vip.` inyectan). `localhost` fuera de producción. 1127/1127 tests |
| **Incidente 526 de `solucionesconia.cl`** (ver §3) | ✅ resuelto | Fix en `solucionesconia` `main` **`7e5f4b5`** + `deploy.sh` relanzado por Jaime: clon del VPS en `7e5f4b5`, vhost con **2 bloques 443**, snippet nuevo vivo (`X-Edge-Proof` en `/api/vip/`, `location ^~ /api/ → 404`, HSTS sin duplicar, CSP pass-through de `csp.ts`), `verificar-portal.sh --post` **✔ en directo** |
| **Producción al cierre (desde fuera)** | ✅ | `solucionesconia.cl` 200 · `www` 200 · `/acceso/` 200 · `/vip/` 302 · `vip.` 200 · `admin.` 401 · examenfacil 200 · elrincon 200 · gambusas 200 |

**Estado de repos al cierre**: `Agencia_Solucionesconia` **`7e5f4b5`** · `zasa-orchestrator` **`65d7709`** (= producción) · `admin_solucionesconia` **`6982bb3`** · raíz `e8f495a` · `.claude` `7b819c2`. Los cinco limpios, en `main`, `0/0` con su remoto, sin ramas de trabajo. `chore/static-audit-cleanup` (zasa, 1 commit del 02-sep superado por el refactor `core/`) archivada como tag local `archivo/static-audit-cleanup-2026-09-02`.

### Residuos que solo puede cerrar Jaime (no cuentan como deuda de infraestructura, pero siguen abiertos)

1. **Rotar el token `cfut_`** (Cloudflare → API Tokens): se imprimió en una salida de asistente durante la auditoría (C1). No verificable desde aquí.
2. **Vaciar la Papelera**: los 8 elementos de la Fase 1 siguen ahí, incluido el `.sql` clínico en claro (verificado al cierre: 8).
3. **`PUBLIC_BASE_URL=https://admin.solucionesconia.cl`** en `/opt/zasa-orchestrator/app/.env` + `pm2 restart zasa-orchestrator --update-env` (A7): verificado al cierre que **no está**; `audioUrl` de `/api/analyze` va a `null` con aviso hasta entonces.
4. Revisión visual del FAB/panel de Sofía en el Portal VIP con sesión de admin (A8) y de «Portales» (pendiente desde el 09-13).

---

## 1. Primera Tarea Prioritaria para mañana — protocolo **Mitigation & Verification Gate (MVG)**

Esta sesión demostró las dos caras del mismo problema: **los gates que existían salvaron** (la compuerta CI del
orquestador, la prueba de borde, el `--pre` del snippet) y **los que faltaban costaron un 526** (el `--post` corría
antes de Certbot, sin backup del vhost ni rollback). Mañana se formaliza lo que hoy es un conjunto de scripts
dispersos en un protocolo único, estricto y documentado, con cuatro pilares. Cada pilar tiene un **inventario de lo
que ya existe** (no reinventar) y **los huecos concretos** a cubrir.

### Pilar 1 — Pruebas de borde «fail-closed» automáticas (`verificar-portal --pre` / `--post`)

*Existe:* `Agencia_Solucionesconia/nginx/verificar-portal.sh` (`--plantilla` = `npm test`; `--pre` antes de recargar;
`--post` con guardia de bloque 443, CSP idéntica al orquestador, sin `unsafe-*`, sin cabeceras duplicadas,
`/api/admin` → 404); `zasa-orchestrator/deploy/vps-4gb/verificar.sh` (alineación `EDGE_SECRET` ↔ nginx por huella,
variables críticas); `tests/csp.test.ts`, `tests/clienteAuth.test.ts` (emisión sin borde → 403).
*Huecos:* (a) **A4**: los vhosts `admin.` y `vip.` y `conf.d/cloudflare-real-ip.conf` viven solo en el VPS → versionarlos
como plantillas renderizadas (mismo patrón que `vip-portal.conf.plantilla`) con su propio `verificar-borde.sh`
(`X-Edge-Proof` en TODO `location` que proxye, Basic Auth en `/`, `map $sales_cors_origin`, `real_ip` de Cloudflare);
(b) sondas fail-closed **en los tres hosts** tras cada deploy del orquestador (Bearer sin borde → 403, con borde → 401
del guard) dentro de `verificar.sh`; (c) invariante de «una sola CSP, la de `csp.ts`» también para `vip.` y `admin.`.

### Pilar 2 — GitOps con PRs atómicos y rollback nativo (`trap ERR` en `deploy.sh`)

*Existe:* un PR por hallazgo con orden de despliegue documentado en el cuerpo; compuerta CI del orquestador
(`deploy-admin-vip.yml`: typecheck + lint + tests + escáner Zero Trust antes de desplegar); `deploy.sh` de la landing
con backup del vhost + `trap ERR` (`set -E`) que restaura y recarga; swap del widget `.new` → sha256 → `.bak` → `mv`.
*Huecos:* (a) `deploy/vps-4gb/desplegar.sh` (orquestador) sin rollback automático: si `pm2 startOrReload` o `/health`
fallan, volver al SHA anterior + `pm2 restart`; (b) el swap del widget y la copia del `dist/` de la SPA a
`/opt/agencia/public/vip` son **manuales**: formalizarlos en `desplegar-estaticos.sh` con sha256, `.bak` y rollback;
(c) **regla escrita**: ningún deploy recarga nginx antes de que exista el 443 (lección del 526); (d) la landing no tiene
CI: decidir si `deploy.sh` pasa a lanzarse por Actions (server-pull) con el `--post` como compuerta.

### Pilar 3 — Validación de integridad criptográfica y SIDs

*Existe:* sha256 en cada artefacto que toca producción (widget, snippet renderizado, `dist/` de la SPA — testigo local
≡ servido); GPG con **round-trip real** como única prueba válida de recuperación (`STATE.md`); ACL por SID
(`icacls /inheritance:r /grant:r *S-1-5-21-…:(F) *S-1-5-18:(F)`) en los secretos locales; pre-commit que bloquea hex ≥ 40.
*Huecos:* (a) `tools/verificar-integridad.ps1` en el repo raíz: audita con `Get-Acl` que los ficheros de secretos
locales tienen SOLO los dos SIDs, que no hay `.env*`/JSON de cuenta de servicio fuera de la lista blanca, y compara
sha256 de los artefactos rastreados con lo servido en producción (widget, `dist/style.css`); (b) `sites_files_backup.tar.gz`
(607 MB) sigue en claro en `vault/backups-locales/` → cifrar a las dos claves como el `.sql` o borrar; (c) integrar el
chequeo de ACL en `/inicio-sesion` para que un secreto con herencia rota aparezca en el resumen.

### Pilar 4 — Health checks sintéticos continuos (`workspace-status.ps1`)

*Existe:* `workspace-status.ps1` (arranque de sesión: 11 repos, 7 endpoints con `vip.`); `uptime-monitor.yml`
(cada 15 min en `zasa-orchestrator`); `security-telemetry.sh` (cron `*/15`, alertas `chattr +a`, hoy solo escribe).
*Huecos:* (a) `uptime-monitor.yml` debe medir los 7 endpoints **y** las invariantes de borde (`/vip/` con una sola CSP
sin `unsafe-*`; `/api/vip` con Bearer sin borde → 403) — un 526 como el de hoy tiene que sonar en ≤ 15 min, no al
arrancar la siguiente sesión; (b) canal de aviso activo para `security-telemetry.sh rc=10` (correo por Resend o entrada
en el Cockpit) — pendiente desde el 09-13; (c) el resumen de arranque debe nombrar el **drift repo ≠ producción**
(`/health` vs `main` del orquestador; sha256 del widget servido vs blob de `main`; SHA del clon `/opt/solucionesconia`).

### Paso exacto para arrancar (uno solo)

Crear **`docs/MVG.md` en el repo raíz** (`agencia-root-orchestrator`) con el protocolo: los 4 pilares, el inventario
existe/hueco de arriba convertido en tabla, las **reglas de gate** (qué comprobación bloquea qué paso: `--plantilla`
bloquea el commit, `--pre` bloquea la recarga, CI bloquea el deploy, `--post` dispara el rollback, `/health` +
sha256 cierran el deploy), el orden de despliegue entre repos y la definición de «verificado» (salida real de
comando, nunca una huella sin descifrado ni un 200 sin router). Después, implementar los huecos por cercanía a
producción: **A4 (Pilar 1a)** primero — es el único que hoy deja el perímetro sin fuente de verdad versionada.

---

## 2. Cola (por cercanía a producción)

0. Residuos de Jaime (§0): `cfut_`, Papelera, `PUBLIC_BASE_URL`, revisión visual.
1. MVG (§1) → A4 vhosts versionados → rollback en `desplegar.sh` → `uptime-monitor.yml` con invariantes → canal `rc=10`.
2. `examenfacil-cl/claude_handler.php:19` y `admin/brain_sync.php`: siguen llamando al host de DO destruido (otro repo).
3. Multicerebro en Dark Launch: decidir `SOFIA_MOTOR=multicerebro` y para qué tenant (ver hand-off del 09-16 en el historial).
4. `tenant-purge.sh` con COMMIT real contra fixture; `setNotFoundHandler` sin eco de URL; `.env.local.txt` de la SPA.
5. Deuda documental menor: `admin_solucionesconia/do-app.yaml` y workflows `audit-env.yml`/`deploy-1gb.yml` (host muerto),
   scripts `test-*.ts` del orquestador, `src/config.js`/`src/styles.css` de la landing, 12 shims del refactor `core/`
   (~105 imports), `CONTEXT_HANDOVER.md.zasa-20260816` rastreado en la raíz.
6. GPG: certificados de revocación fuera del portátil; `shard-2` del juego viejo; conectar un respaldo real de ExamenFácil.

---

## 3. Incidente 526 de `solucionesconia.cl` (2026-09-22, causado por el `deploy.sh` de la Fase 3) — cerrado

**Qué pasó.** `deploy.sh` §4 reescribe el vhost **solo con el server `:80`**; el `:443` lo reinstala Certbot en §5. La §4b
recargaba nginx y lanzaba `verificar-portal.sh --post` **en medio**: sin bloque 443 propio, las sondas HTTPS en loopback
con `Host: solucionesconia.cl` caían en el primer server 443 del host (`admin.`, Basic Auth) → `/` 401, `/api/admin`
proxied, CSP ajena → `--post` fallaba → `set -e` abortaba **antes** de Certbot → dominio sin 443 → certificado ajeno para
Cloudflare → **526** en landing, `/acceso` y `/vip/`. Los tres «fallos» de las sondas eran **uno solo de orden**.

**Qué se corrigió (`7e5f4b5`).** `deploy.sh`: backup del vhost antes de pisarlo + `trap ERR` (`set -E`) que restaura y
recarga; §4b sin recarga (solo render + `--pre` + `nginx -t`); nueva §5b tras Certbot con recarga + `--post`;
acentos graves escapados en el heredoc (`no-cache: command not found`). Snippet: `location ^~ /api/ { return 404; }`
y `proxy_hide_header Strict-Transport-Security` en `/vip/` (helmet ya la emite: llegaban dos). `--post`: guardia de
bloque 443 con `nginx -T` que falla nombrando la causa, y detección de cabeceras duplicadas.

**Qué NO pude hacer.** La restauración (Certbot, o reconstruir el 443 desde los respaldos) la bloqueó el clasificador
del modo automático por «cambio de certificados», incluso la lectura de respaldos con nombres TLS. La hizo Jaime
relanzando el `deploy.sh` corregido. Regla para mañana: **cualquier paso de un deploy que toque TLS es de Jaime**.

---

## 4. Trampas (no volver a tropezar)

1. **Sondas HTTPS en loopback con `Host:` solo miden el vhost del dominio si ese dominio tiene bloque 443**; si no,
   miden el server 443 por defecto (el primero en orden alfabético: `admin.`). Comprobar el 443 antes de sondear.
2. **Heredoc sin comillas = bash ejecuta los acentos graves de los comentarios.** En `deploy.sh` van `\``.
3. **Los PRs fusionados no son producción**: el orquestador despliega solo; la landing/nginx exige `deploy.sh` en el
   VPS (sin CI); SPA y widget se copian a mano. El clon `/opt/solucionesconia` estaba en `393f213`, dos commits
   por detrás, sin que nadie lo viera.
4. **El bundle del widget en el árbol de Windows lleva CR** que git normaliza: desplegar el blob (`git show main:…`),
   no el fichero de trabajo, o el sha256 de producción no coincidirá con el de `main`.
5. `gpg --list-packets` sale 2 sin clave; el **round-trip real** (descifrar → sha256) es la única prueba válida, y
   exige pinentry en la pantalla de Jaime — nunca la passphrase por el chat.
6. Al enmascarar volcados de ficheros de secretos, la máscara tiene que cubrir **todos** los prefijos (`cfut_` se escapó).
7. `grep` sobre `git log -p` del orquestador necesita `-a`: `herramientas.ts` hace que trate el diff como binario.
8. El `merged` de la API de listado de PRs siempre es `false`; la verdad es `merged_at`.
9. `git branch -d` funciona con merges normales; con squash hace falta `-D` tras comprobar `merged_at`.
10. `perl -0pi` en Windows: los ficheros con CRLF necesitan `\r?\n` en los patrones, y **siempre** `grep -c` después
    (dos sustituciones no aplicaron en silencio).
11. Importar un módulo que construye clientes de LLM al cargarse rompe cualquier test unitario: los helpers puros van
    en su propio fichero (`core/http/urlPublica.ts`).

---

## 5. Secretos

Ninguna passphrase ni token nuevo pasó por el chat. **Excepción registrada**: el token Cloudflare `cfut_…` de
`.env.test.txt` se imprimió al inspeccionarlo (C1) → rotación pendiente de Jaime. La pública de la clave GPG nueva se
importó al llavero del portátil (material público, huella verificada). Los `.env` del VPS siguen 600 root; los locales,
con ACL por SID. Nada se subió al VPS salvo el bundle del widget (sha256 verificado en ambos extremos).
