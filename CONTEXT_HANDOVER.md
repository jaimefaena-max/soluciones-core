# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-29-a (GambusasChile: compliance, pagos MP y rescate del CI)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memorias de arranque: `backlog-arranque-proxima-sesion`, `gambusas-cobro-caido-boveda` y
> `transcript-dir-gambusas-drift`, en
> `~/.claude/projects/C--Proyectos-Workspace-Clientes-GambusasChile/memory/`.
> Hand-off anterior (2026-09-26-a, M. Jesús a producción): en el historial de este fichero (`e4d9c19`).
> Sesión del 2026-09-30 00:54 al 08:28 UTC: **355,9 min activos** de 453,9 totales,
> **$207.608 CLP**. Telemetría `2026-09-29-a` en `zasa-orchestrator` `4de880f`.
>
> **Forma de trabajo:** Jaime dictó cada paso, casi siempre con rol explícito
> («Actúa como Arquitecto de Software Senior…») y matriz de restricciones. Varias
> instrucciones traían premisas equivocadas —rutas inexistentes, `$config[]` en vez
> de `define()`, `process.env` en un proyecto PHP, un SDK que el workspace prohíbe—
> y en cada caso se verificó contra el código antes de ejecutar. Eso evitó al menos
> tres regresiones.

---

## 0 · 🔴 LO PRIMERO: el cobro de GambusasChile está CAÍDO

`POST https://gambusaschile.cl/api/crear_preferencia.php` → **HTTP 500
`pasarela_no_configurada`**. No se puede cobrar.

La Bóveda `/etc/gambusaschile/config_secret.php` se **truncó a 0 bytes** el
2026-09-30 a las **06:58:07 UTC** (mismo inodo → truncada en el sitio, no
reemplazada). **Causa no atribuida**: no hay una escritura identificada que la
explique. Se restauró desde respaldo, pero el único disponible es **anterior a la
inyección** y solo trae `RESEND_API_KEY`.

**`MP_ACCESS_TOKEN` se perdió del servidor.** No es irrecuperable: está en el panel
de Mercado Pago. `MP_WEBHOOK_SECRET` nunca llegó a ponerse.

**Ya está todo preparado para arreglarlo en un minuto.** Hay un inyector desplegado
en `/root/inyectar-boveda-mp.sh` (700 root:root) que lee los dos secretos por
stdin, respalda, valida la sintaxis PHP en un temporal antes de instalar,
comprueba que `RESEND_API_KEY` sobrevive, aplica `640 www-data:www-data` y se
autodestruye. Sus **siete rutas de rechazo están probadas**.

Jaime lo ejecuta desde PowerShell con `Read-Host -AsSecureString` + `ZeroFreeBSTR`.
🔴 **Nunca pedir los secretos por el chat**: el transcript es un registro
persistente que además lee `session-audit.ps1`.

> **Trampa medida y resuelta:** PowerShell 5.1 antepone un **BOM UTF-8** al
> canalizar hacia un ejecutable nativo, y **no se puede evitar desde el cliente**
> (probado con `$OutputEncoding`, `[Console]::OutputEncoding` y escritura de bytes
> crudos vía `System.Diagnostics.Process`: aparece en los tres). El inyector lo
> descarta en el receptor, que es lo único que funciona.

---

## 1 · Dónde quedamos

### GambusasChile — el embudo quedó completo salvo el último eslabón

**Compliance del copy (finalizado y en producción).** Fuera los tres testimonios
inventados con su CSS y su HTML, la escasez falsa del mensaje de WhatsApp que
alimenta los 6 CTA, el badge «Stock de la semana limitado» y la promesa «Despacho
prioritario», que no estaba respaldada por la operación. Verificado por `curl` con
cache-buster.

**Catálogo de precios con fuente única (finalizado).** `gambusas_catalogo_packs()`
en `config.php` alimenta la tarjeta, el JSON-LD y el cobro. `index.php` quedó con
**cero precios literales**. En la unión el catálogo va a la izquierda del `+` a
propósito: un precio añadido al lado presentacional queda ignorado en vez de pisar
el autoritativo.

**Endpoint de preferencia (finalizado y verificado en producción).** cURL puro sin
SDK. Los tres packs devuelven `init_point` real de `www.mercadopago.cl`. La pieza
clave es la **compuerta anti-manipulación de precio**: el precio no se acepta del
cliente, se resuelve en servidor por `pack_id`. Probado: `precio_unitario: 1` sobre
el pack de $29.990 → **400 sin llegar a contactar a MP**.

**Front-end enganchado (finalizado).** Los tres botones abren Checkout Pro.
Vanilla, cero dependencias. El `href` de WhatsApp se queda como **respaldo real**:
sin JS o si la pasarela falla, el botón sigue cerrando la venta.

**Webhook (código listo, NO desplegado).** Commit `c2b6f5e` **sin pushear**.
Validación fail-secure: HMAC-SHA256 con `hash_equals`, ventana de frescura de 300 s
contra repetición, rechazo del `ts` del futuro, y orden **validar → responder →
trabajar** para que una notificación legítima conserve su 200 inmediato y una
forjada reciba 401/403. Verificado sobre un SAPI HTTP real: firma válida 200,
manipulada 403, `request-id` distinto 403, replay de 1 h 403, `ts` futuro 403, sin
secreto 503. **No pushear hasta que la Bóveda tenga `MP_WEBHOOK_SECRET`**, o
rechazaría toda notificación.

### El rescate del CI — lo que más tiempo costó y más enseñó

**El pipeline de GambusasChile llevaba roto desde el 12-ago y nadie lo sabía**,
porque producción seguía sirviendo con HTTP 200 el código de siete semanas antes.
Estaba roto en **cuatro puntos** encadenados:

| # | Fallo | Síntoma |
|---|---|---|
| 1 | El secret `VPS_HOST` apuntaba a `159.223.213.237`, la IP del servidor anterior | `dial tcp: i/o timeout` ← **el bloqueante** |
| 2 | El `fingerprint` del YAML era la host key de `zasa-server-ams3`, pre-restore | habría abortado antes de autenticar |
| 3 | La llave `gha-deploy@zasa` se eliminó de `authorized_keys` el 23-sep | habría dado `Failed publickey` |
| 4 | El repo no tenía llave propia: compartía la de examenfacil | riesgo, no fallo |

Los cuatro están reparados y **verificados con un push normal**: `Deploy OK`,
`Accepted publickey for deploy` desde IP de Azure, y el `mtime` del árbol
moviéndose en 19 s. Se creó una llave ED25519 **dedicada a este repo**
(`github_actions_gambusaschile_deploy`), probada contra `sshd` y con los `sudo` del
paso 5 del workflow.

### ZASA Cockpit — tres auditorías y una compuerta desplegada

**Fase 1, estática.** Cero credenciales hardcodeadas en 337 ficheros, verificado
ejecutando el escáner propio del repo *y además* una pasada independiente sin su
allowlist, porque exime `docs/` y `tests/`. typecheck limpio, 1814 tests, lint 0
errores. Siete brechas priorizadas.

**Fase 2, historial de git.** 522 commits y 3091 objetos, **incluidos los 113 no
alcanzables** desde ninguna ref — que es lo que un `git log --all` no ve. Sin
herramientas instaladas, recorrido con plumbing a nivel de **objeto**. **Historial
limpio**: las 54 coincidencias son placeholders o fixtures verificados uno a uno.
El candidato serio, `.do/app.yaml` con 13 entradas `type: SECRET`, resultó
declararlas **sin valor**. No procede purga con BFG ni `git-filter-repo`.

**Fase 3, saneamiento.** `npm audit fix` sin `--force`: 10 → 7 vulnerabilidades, el
único *high* eliminado, y cerrado `ip-address` (3 avisos de SSRF y bypass de
allowlist). `informe.ejs` integrado al Design System v2 — pero **no** como decía la
Fase 1: `include head` le habría dado la identidad del Cockpit, y pertenece a la
familia de clientes. Se le enganchó el runtime `ds.js` y **ninguna hoja**. Para
poder hacerlo hubo que arreglar un defecto previo: `auditarHojas()` comparaba
contra una lista fija, así que **las dos vistas que ya usaban el runtime emitían un
error falso en cada carga**.

**Compuerta de entorno MP (desplegada).** Las tres variables de pago no estaban en
ninguna de las dos listas de `asegurar-env.mjs`. Se añaden con validadores reales y
obligación condicional: token sin firma bloquea el deploy, y al revés también. El
validador rechaza explícitamente el **UUID de cinco grupos**, que es la public key
— reproduce el incidente del 12-sep. Commit `ffb3882`, `/health` lo confirma.

---

## 2 · Bloqueadores activos y su vía de desbloqueo

| Bloqueador | Vía | Quién |
|---|---|---|
| 🔴 **Cobro caído**: Bóveda sin `MP_ACCESS_TOKEN` | Ejecutar `/root/inyectar-boveda-mp.sh` desde PowerShell con los valores del panel de MP | **Jaime** |
| 🟡 Webhook nunca se ejercita | Registrar `https://gambusaschile.cl/api/webhook_mp.php` en el panel de MP → Webhooks | **Jaime** |
| 🟡 Correo de confirmación fallaría | Verificar el dominio en Resend (SPF/DKIM, panel de Cloudflare) | **Jaime** |
| 🟡 `c2b6f5e` sin pushear | Depende del primero: sin `MP_WEBHOOK_SECRET`, el fail-secure rechaza todo | Claude |

---

## 3 · Sin commitear al cierre

**`zasa-orchestrator`** — 11 ficheros, **cuatro asuntos distintos** que merecen
commits separados: el `npm audit fix` del lock; el arreglo de `ds.js` +
`informe.ejs` + `tests/dsRuntimeHojas.test.ts`; y los tres `audit-fase{1,2,3}.md`.

**`GambusasChile`** — árbol limpio, pero `c2b6f5e` local sin pushear.

Fuera de alcance esta sesión: cambios sueltos en `ExamenFacil`, `AuditorLegal` y
material del portal de Jose.

---

## 4 · Dos lecciones que costaron caras

**(a) Un push verde y un HTTP 200 no significan desplegado.** El sitio respondía
perfectamente sirviendo código de siete semanas antes. Para saberlo hay que mirar
el `mtime` del árbol y quién autenticó en `auth.log`, no el código de estado:

```bash
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 \
  "stat -c '%y %n' /var/www/gambusaschile.cl/index.php; \
   journalctl -u ssh --since '10 min ago' | grep -i 'Accepted publickey for deploy'"
```

**(b) La ausencia de rastro en el servidor no prueba que el CI no corriera.**
Durante el diagnóstico se concluyó «Actions no ejecuta» porque `auth.log` no
registraba ni un intento. Era **falso**: había 23 runs y los 5 de ese día habían
fallado. El runner marcaba una IP muerta, así que sus paquetes nunca llegaban.
**La pestaña Actions es la fuente de verdad del CI**; el `auth.log` del VPS solo
dice qué llegó hasta ahí. Si el PAT fine-grained da 403 en la API de Actions, el
credencial OAuth que GCM guarda para `github.com` **sin path** sí suele tener
acceso.

---

## 5 · Trampas operativas nuevas

- **`end_session.js` deriva el transcript del CWD**, no del que usó
  `session-audit.ps1`. Ejecutado desde `zasa-orchestrator` cogió un `.jsonl` ajeno
  y midió 672 min / $392.233 en vez de 356 min / $207.608. **Pasarle siempre
  `--transcript <ruta al .jsonl>`.** Se detectó y corrigió antes de publicar.
- **El `CLAUDE.md` de GambusasChile apunta a un directorio de transcript que ya no
  existe.** El real lleva `Workspace-Clientes`:
  `C--Proyectos-Workspace-Clientes-GambusasChile`. Pendiente de corregir en el fichero.
- **GambusasChile no tiene contenedores ni proceso propio** y es correcto: es PHP
  nativo servido por nginx + php-fpm. No aparece en `pm2 list`; los dos procesos de
  ahí son de otros proyectos.
- **`error_log` de PHP-FPM acaba en `/var/log/nginx/error.log`** vía el stderr de
  FastCGI, no en `/var/log/php8.3-fpm.log`. Ahí hay que buscar la traza de pagos.
- **Soft 404 en gambusaschile.cl**: `try_files $uri $uri/ /index.php` hace que
  **cualquier** ruta inexistente devuelva la portada con HTTP 200 y bytes idénticos.
  Con `sitemap.xml` publicado, es duplicado infinito para crawlers. Arreglo:
  `=404`, con backup + `nginx -t` (Golden Standard).
- **`verificarBorde.test.ts` es frágil**: `spawnSync` sin timeout propio hereda el
  default de 5 s de vitest y falla por contención con 87 ficheros en paralelo. Como
  el deploy depende de `npm test`, es un **rojo falso que bloquea un deploy bueno**.

---

## 6 · El paso exacto siguiente

**Restaurar el cobro de GambusasChile**, ejecutando `/root/inyectar-boveda-mp.sh`
con los valores reales del panel de Mercado Pago. Está bloqueado en Jaime: requiere
los secretos, y esos no pueden pasar por el chat.

Todo lo demás del embudo ya está desplegado y verificado.
