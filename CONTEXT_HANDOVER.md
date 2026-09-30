# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-29-a (GambusasChile: compliance, pagos MP y rescate del CI)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memorias de arranque: `backlog-arranque-proxima-sesion`, `gambusas-cobro-caido-boveda` y
> `transcript-dir-gambusas-drift`, en
> `~/.claude/projects/C--Proyectos-Workspace-Clientes-GambusasChile/memory/`.
> Hand-off anterior (2026-09-26-a, M. Jesús a producción): en el historial de este fichero (`e4d9c19`).
> Sesión del 2026-09-30 00:54 al 08:28 UTC: **355,9 min activos** de 453,9 totales,
> **$207.608 CLP**. Telemetría `2026-09-29-a` en `zasa-orchestrator` `4de880f`,
> publicada y verificada (`/health` = `4de880f`).
>
> ⚠️ **La telemetría se publicó a las 08:28 y la sesión siguió hasta ~09:20.** Ese
> último tramo —inyección de la Bóveda, validación de los 3 packs, despliegue del
> webhook fail-secure y certificación del almacén— **no se republicó a propósito**:
> `telemetryService.ts:213` hace `SESIONES.reduce((s,x) => s + x.minutosActivos, 0)`,
> así que una segunda entrada para la MISMA sesión sumaría el tiempo dos veces y
> reportaría ~$430k por una sesión de 7,5 h. El registro de tiempo de `-a` es
> correcto; el estado real de las tareas es el de **este** documento, que es lo que
> lee el arranque. Dos taskId quedaron con estado desactualizado en el dashboard
> (`gam-boveda-mp-secretos` al 40 % y `gam-pagos-webhook-mp` al 70 %): ambos están
> hoy al 100 %, y el dedupe por taskId los corregirá en el próximo cierre que los
> toque.
>
> **Forma de trabajo:** Jaime dictó cada paso, casi siempre con rol explícito
> («Actúa como Arquitecto de Software Senior…») y matriz de restricciones. Varias
> instrucciones traían premisas equivocadas —rutas inexistentes, `$config[]` en vez
> de `define()`, `process.env` en un proyecto PHP, un SDK que el workspace prohíbe—
> y en cada caso se verificó contra el código antes de ejecutar. Eso evitó al menos
> tres regresiones.

---

## 0 · 🟢 gambusaschile.cl VENDE · falta un campo en el panel de MP

**El cobro quedó operativo el 2026-09-30 a las 09:04 UTC.** Jaime inyectó
`MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` y los tres packs pasaron de `HTTP 500` a
**`HTTP 201`** con `init_point` real de `www.mercadopago.cl` y `"sandbox":false`:

```
iniciacion  500 → 201   ref iniciacion-ad44c07dfa4134e1   1,37 s
dominio     500 → 201   ref dominio-72798b703ff9ffaf      0,85 s
leyenda     500 → 201   ref leyenda-0b24376f793e2dd0      0,81 s
```

Y el **webhook fail-secure** (`c2b6f5e`) quedó desplegado a las 09:08:52 UTC,
verificado en vivo: sin firma → **401**, firma inventada → **403**, **replay de
1 h → 403 `firma_caducada`**, `DELETE` → **405**, y el GET de validación del
panel → **200**, que es lo que permite registrar la URL.

### 🟡 Lo único que falta, y es de Jaime

**Registrar la URL del webhook en el panel de Mercado Pago:**

| Campo | Valor |
|---|---|
| URL | `https://gambusaschile.cl/api/webhook_mp.php` |
| Modo | **Producción** — no Pruebas: en Pruebas MP firma con otra secreta y el listener daría `403` a todo |
| Eventos | solo **Pagos** (`payment`) |
| Firma secreta | la que ya está en la Bóveda — **no regenerarla** al guardar |

Sin ese paso el sitio **cobra pero no se entera**: un pago aprobado no dispara el
correo de confirmación y `pagos-procesados/` sigue vacío. La venta sí queda
registrada en el panel de Mercado Pago.

> **Lección que costó el incidente de esta sesión.** La Bóveda se **truncó a 0
> bytes** a las 06:58:07 UTC (mismo inodo → truncada en el sitio), causa **no
> atribuida**, y perdió el token. El único respaldo era anterior a la inyección.
> **La privada de un secreto inyectado no tiene copia**: si la Bóveda se rompe,
> hay que volver al panel del proveedor. Los respaldos de
> `/root/backups-gambusaschile-vault/` solo cubren lo que ya había.
>
> **Trampa medida y resuelta:** PowerShell 5.1 antepone un **BOM UTF-8** al
> canalizar hacia un ejecutable nativo, y **no se puede evitar desde el cliente**
> (probado con `$OutputEncoding`, `[Console]::OutputEncoding` y escritura de bytes
> crudos vía `System.Diagnostics.Process`: aparece en los tres). El inyector
> `/root/inyectar-boveda-mp.sh` lo descarta en el receptor, que es lo único que
> funciona. Sigue desplegado y con sus siete rutas de rechazo probadas.

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

**Webhook fail-secure (desplegado y verificado en producción).** Commit `c2b6f5e`,
en el VPS desde las 09:08:52 UTC. HMAC-SHA256 con `hash_equals`, ventana de
frescura de 300 s contra repetición, rechazo del `ts` del futuro, y orden
**validar → responder → trabajar**: una notificación legítima conserva su 200
inmediato y una forjada recibe 401/403 **sin llegar a consumir una llamada a la
API ni a tocar el almacén**.

Se desplegó **antes** de dar las instrucciones de registro a propósito: la versión
anterior sí validaba el HMAC —con el secreto ya puesto— pero **no la frescura del
`ts`**, así que una firma válida lo era para siempre y una notificación capturada
se podía reproducir. Registrar la URL con esa versión habría dejado la brecha
abierta en la primera notificación real.

**Almacén de pagos certificado.** `/var/lib/gambusaschile/{logs,pagos-procesados,pendientes}`
a `750 www-data:www-data`, fuera del web root, escribibles por php-fpm, y el
**reclamo atómico de idempotencia probado**: un segundo reclamo sobre el mismo
pago se rechaza, así que un pago no puede disparar dos correos. Los tres
directorios a cero, de modo que el primer fichero que aparezca será la primera
venta real.

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
| 🟡 **El webhook nunca se ejercita** | Registrar `https://gambusaschile.cl/api/webhook_mp.php` en el panel de MP → Webhooks (§0) | **Jaime** |
| 🟡 El correo de confirmación fallaría | Verificar el dominio en Resend (SPF/DKIM, panel de Cloudflare) | **Jaime** |
| 🟡 Flujo pago→webhook→correo sin ejercitar con dinero | Compra real del pack de $14.990 tras registrar la URL | **Jaime** |
| ~~Cobro caído~~ | ✅ resuelto 09:04 UTC | — |
| ~~`c2b6f5e` sin pushear~~ | ✅ desplegado 09:08:52 UTC | — |

---

## 3 · Sin commitear al cierre

**`zasa-orchestrator`** — 11 ficheros, **cuatro asuntos distintos** que merecen
commits separados: el `npm audit fix` del lock; el arreglo de `ds.js` +
`informe.ejs` + `tests/dsRuntimeHojas.test.ts`; y los tres `audit-fase{1,2,3}.md`.

**`GambusasChile`** — árbol limpio y **sincronizado** con `origin/main` en `699e517`.

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

**Registrar `https://gambusaschile.cl/api/webhook_mp.php` en el panel de Mercado
Pago** (modo Producción, solo evento Pagos, sin regenerar la firma). Está
bloqueado en Jaime: es una pantalla del panel de MP.

El sitio ya cobra. Ese campo es lo que convierte el cobro en automático de
principio a fin.

---

## 7 · Monitoreo del primer pago real (comando probado)

Cubre las **dos** fuentes del flujo y sobrevive a la rotación mensual del log:

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

Dos razones de forma que importan: **`tail -F`** (mayúscula) sigue por nombre y
**reintenta ficheros que aún no existen**, así que engancha solo el
`webhook-mp-2026-10.log` cuando el log rote; y se vigilan **dos** fuentes porque
el **cobro** sale por stderr de FastCGI a `nginx/error.log` mientras el
**webhook** escribe en el log de la app — vigilar una sola deja ciega la mitad
del flujo.

**La línea que certifica el circuito completo:**

```
[WEBHOOK] pago <id> APROBADO · ref iniciacion-<hex> · $14.990 · correo=ok
```

| Lo que se ve | Qué significa |
|---|---|
| `correo=fallo` + `ATENCION, correo NO enviado` | El pago **está cobrado y registrado**. Falla Resend (SPF/DKIM). Reenviar a mano |
| `estado "pending"` / `"rejected"` → sin acción | MP no aprobó. Correcto: solo `approved` dispara el correo |
| `ENCOLADO pendiente` | No se pudo verificar contra la API. El pago **no se pierde**: queda en `pendientes/` |
| `no existe en la cuenta (404)` | Notificación forjada o ajena. Descartada |
| **Silencio en `[WEBHOOK]` tras pagar** | MP no está llamando → **la URL no está registrada** |
