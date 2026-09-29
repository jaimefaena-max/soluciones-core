# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-26-a (M. Jesús de F1 a producción + rotación completa de secretos)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memorias de arranque: `arranque-2026-09-29` (este estado), `mjesus-copiloto-bi` (el copiloto, al día) e
> `incidente-secretos-borde-en-chat-2026-09-12` (la 3.ª exposición y cómo se rotó).
> Hand-off anterior (2026-09-24-b, matriz de 16 riesgos): en el historial de este fichero (`9dcdf34`).
> Sesión del 2026-09-26 23:00 UTC al 2026-09-29 05:19 UTC, con pausas (cuenta como 2026-09-26 por su inicio):
> **663,6 min activos** de 3258,4 totales, **$387.100 CLP**. Telemetría `2026-09-26-a` en `zasa-orchestrator`
> `a16b9f0` (estado de publicación en §0).
>
> **Forma de trabajo:** Jaime dictó cada paso («Ejecuta… Imprime… Operación local/remota»). Esta vez el modo
> automático NO bloqueó las escrituras en el VPS ni los push que despliegan. Lo único que Claude no hace por norma es
> borrar datos de forma permanente (`shred`/`rm` de respaldos): eso se le da a Jaime como comando.

---

## 0. Qué se cerró — con su evidencia

| Frente | Estado | Evidencia |
|---|---|---|
| **M. Jesús F1** (catálogo de 7 métricas, `derivar`, esquemas) | ✅ en producción | `2b865e8`→`6bf34ff`; la primera pregunta real invocó `rendimiento_agentes` |
| **M. Jesús F2** (enrutador, verificador, analista, adaptadores, telemetría, tope) | ✅ en producción | `472e262`→`73ee95a` |
| **M. Jesús F3** (rutas `/api/admin/mjesus/*`, cuota, métricas por nombre, panel) | ✅ encendido | `f21dea8`, `59e4c03`; SPA `4ecba4d` + `490d57d` (`MOTOR_CONECTADO=true`); `MJESUS_HABILITADO=admin` en `/opt/zasa-orchestrator/.env` (respaldo previo en `/root/backups-env-zasa/`) |
| **Compuerta `test:mjesus`** en `deploy-vip.yml` | ✅ | `6dd5428`; 8 estados de interfaz bajo la CSP real de vip., antes del SSH |
| **Preguntas asíncronas** (202 `{id}` + sondeo `GET /preguntar/:id`) | ✅ | backend `854546a`, SPA `79c247b`; primera pregunta real por esta vía 2026-09-29 04:58:49 UTC (17,3 s) |
| **`clases_rechazo`** (verificador etiqueta por qué rechaza, sin texto) | ✅ | `e359cef`; columna migrada en producción con el código desplegado |
| **Reglas 6 y 7 del prompt** (unidades `_ms`, solo fechas conocidas) | ⏳ desplegadas, sin medir | `1a13e37`; ver §1 |
| **`proxy_read_timeout 100s`** (corte de Cloudflare) en admin. `/` y vip. `/api/` | ✅ | vivo + plantillas `fcb9906`, `13ad962`; `instalar-plantillas.sh --comprobar` en verde |
| **3.ª exposición de secretos en el chat** (API, EDGE, 2 tenants) | ✅ rotados | ver §4; `rotar-secretos-borde.sh` arreglado en `c2faf54` |
| **Riesgo 10** (logs PM2 en 600, `UMask=0077`), **demonio PM2 en Node 22**, **riesgo 11**, credenciales de `cloudflared` | ✅ 27-sep | §2.1 n.º 5, 10 y 11; regla §3 n.º 16 |
| **Telemetría 2026-09-26-a** | ✅ publicada y verificada | `a16b9f0`, desplegada junto a `0ed5dad` (CHANGELOG): `/health` = `0ed5dad` por loopback y desde fuera (05:24:54 UTC); `grep -c 2026-09-26-a dist/data/telemetry.js` = 1 |

**Repos al cierre:** `zasa-orchestrator` (`0ed5dad`), `admin_solucionesconia` (`79c247b`) y la raíz, todos
`= origin/main`. `examenfacil-cl` (2) y `AuditorLegal` (3) tienen cambios sin commitear **que no son de esta
sesión**. El repo de Jose sigue con la cédula y el PDF legal sin rastrear (§2.1 n.º 2).

---

## 1. Paso exacto para arrancar

➡️ **Primero una acción de Jaime:** hacer 3-5 preguntas de datos en el panel de M. Jesús (vip., rol admin), mejor si
piden latencias o periodos. Después, Claude mide si las reglas 6 y 7 (`1a13e37`) quitaron el reintento:

```sql
SELECT creada_en_iso, vueltas, veredicto, clases_rechazo, latencia_ms, round(costo_estimado_usd::numeric,4)
  FROM mjesus_consultas WHERE creada_en_iso > '2026-09-29T05:14:21Z' ORDER BY creada_en_iso;
```

La referencia es la de 04:58:49Z: `aprobada_en_reintento`, 3 vueltas, `["fecha","fecha","unidad","unidad"]`, $0,0637.
Si las nuevas salen `aprobada` con `[]`, la tarea `cockpit-mjesus-reglas-precision-prompt` pasa a 100 %. La tabla
vive en `DATABASE_URL` (base `zasa_portal`), no en la conexión de `mjesus_ro`; ejecutar la consulta con un script por
stdin (§3 n.º 20).

---

## 2. Cola (por cercanía a producción)

0. **Acciones de Jaime:**
   - **Borrar los respaldos con valores viejos de las rotaciones** (Claude no hace borrados permanentes):
     ```bash
     ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'cd /root/backups-rotacion && for d in secretos-borde-20260929-023305 inquilinos-20260929-023812 secretos-borde-20260929-022046; do find "$d" -type f -exec shred -u -z -n 3 {} + && rmdir "$d" && echo "eliminado: $d"; done; ls -la /root/backups-rotacion'
     ```
     🔴 `inquilinos-20260929-023812/admin` lleva el API y el EDGE **vigentes** (se copió después de rotarlos).
   - **Decidir la poda de `/root/backups-nginx/`:** 21 `instalar-plantillas-*` (23-sep → 29-sep) y 3 copias sueltas de
     hoy. Los de `…023800` y `…023813` llevan los valores vigentes; el resto, revocados. Propuesta: conservar solo
     `instalar-plantillas-20260929-023813` como vuelta atrás de nginx.
   - **Cloudflare Zero Trust:** borrar los hostnames `admin.`/`vip.` y el túnel `c72b9785-cc27-485d-adee-6d8a171ae930`.
   - **Cloudflare, n.º 16:** la opción que quita el `ETag` del HTML de El Rincón.
   - **Prueba real del n.º 8** (historial de Sofía al cerrar sesión) y **run de Actions** de la compuerta de CSP.
   - Heredados: Papelera de Windows, `SALES_WEBHOOK_URL`, limpiar el E2E del 22-b.
1. **Medir las reglas 6 y 7** (§1).
2. **Versionar la rotación de tokens de tenant** (`cockpit-rotar-inquilinos-versionar`). Hoy se hizo con un script
   ad hoc del scratchpad de la sesión (puede no existir ya): ensayo con valores desechables → respaldo (incluidos
   los `token_hash` viejos) → `UPDATE clientes SET token_hash=sha256(nuevo)` de las dos filas en UNA transacción con
   comprobación de 2 filas → `mv` de `inquilinos.env` (600) → `instalar-plantillas.sh --aplicar --aceptar-cambios`
   con `SEC=` → esperar 6 s (caché del resolver, 5 s) → testigo `/clientes/<slug>` directo a :3001 (nuevo 200, viejo
   401). Ventana medida: 2,9 s. Llevarlo a `deploy/vps-4gb/` junto a `rotar-secretos-borde.sh`.
3. **El VPS pide reinicio** (`*** System restart required ***`, visto el 27-sep). Planificarlo; después, `/health` de
   los dos backends, `readlink` y umask del demonio de PM2 (§3 n.º 16), nginx y Postgres. Tras reiniciar se pierden
   los trabajos en curso de M. Jesús (almacén en memoria): el panel lo muestra como «La consulta se perdió».
4. **Informe de diagnóstico de Liset ausente** (`cockpit-liset-informe-diagnostico-ausente`): el registro lo declara
   pero no existe en `private/` (ERROR en el log; `/clientes/liset/diagnostico` da 404). Aprovisionarlo o retirarlo.
5. **M. Jesús, pendientes menores:** actualizar ADR-003 con F3 y el flujo asíncrono (202, `trabajos.ts`, cuota solo
   para POST, `clases_rechazo`); verificar la tarifa de `mjesus_analista` (`MJESUS_TARIFA_ANALISTA_USD_1M`, hoy la de
   lista de Sonnet); test inestable `verificarBorde.test.ts` (chip propuesto).
6. Deudas de documentación: comentario de `scripts/audit-vip-infra.js:21` («CSP no desplegada», falso); residuo de
   `cerrar-migracion.sh` (l. 229 y 236).
7. Heredados: MVG 3 y 4; GambusasChile CI; `package.json` 2.4.0 vs tag v2.5.0; telemetría 09-16-b y 09-22-a sin
   reconstruir; ¿hacen falta las llaves de administración en la cuenta `deploy`?

### 2.1 Matriz de riesgos abiertos de seguridad (priorizada 2026-09-25)

**Credenciales expuestas conocidas: ninguna vigente** (al cierre del 2026-09-29). El 29-sep hubo una 3.ª exposición en
el chat (API, EDGE y los dos tokens de tenant) y los cuatro se rotaron esa misma madrugada (§4); quedan sus respaldos
con valores viejos pendientes de `shred` (§2 n.º 0). La matriz se armó el 25-sep a partir del handover y las
memorias, y cada punto se fue comprobando al abordarlo: cada cierre dice qué verificó Claude y qué reportó Jaime.
**Estado:** Alta cerrada; Media cerrada salvo las comprobaciones que aún piden los n.º 5 (panel de Zero Trust), 8 y 9;
Baja: n.º 11 cerrado, el resto sin tocar, más el n.º 16.

**🟠 Alta: exposición de credenciales o de integridad**
1. ⬇️ **H4: reclasificado a Baja el 2026-09-25** (ver n.º 15).
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
3. ✅ **CERRADO 2026-09-25: `sincronizar-secretos-borde.sh` ya coteja `vip-portal.conf`.** Matiz de diagnóstico: el
   script nunca propagaba secretos a nginx (copia nginx → `.env`); la rotación la hace `rotar-secretos-borde.sh`, que
   ya incluía el snippet. El hueco era de **detección**: su `grep -R` solo recorría `sites-enabled` y no sigue los
   `include`, así que un snippet desalineado no hacía saltar el control de «valor único».
   - Corrección: `zasa-orchestrator` `b6df917`. `NGINX_SNIPPETS` (por defecto `/etc/nginx/snippets/vip-portal.conf`)
     entra en el `grep` de `X-Edge-Proof`. El Bearer del snippet (`proxy_set_header Authorization`) se compara con el
     maestro, pero esa forma **solo se busca en los snippets**: en `sites-enabled` hay Bearer de inquilino que
     harían abortar sin motivo. Si el snippet no existe: aviso y sigue.
   - Verificación: prueba local con ficheros de prueba (alineado → ok; edge o Bearer viejo en el snippet → aborta;
     sin snippet → aviso; Bearer de inquilino → no aborta). Ojo: el `grep -P` de Git Bash exige
     `LC_ALL=C.UTF-8`, o falla en silencio. Despliegue: `/health` = `b6df917`, PM2 con 1 reinicio y 0 inestables.
     En el VPS, `--comprobar` → `snippet incluido en el cotejo`, un único `X-Edge-Proof` (`3f6c5150`) y un único
     Bearer maestro (`43309db8`), `.env` alineado, matriz de borde en verde, `rc=0`.
   - ✅ **CERRADO 2026-09-27: copia obsoleta `/root/sincronizar-secretos-borde.sh` eliminada** por Jaime a mano
     (`rm -f`, sin archivar). Era la del 2026-09-05, sin `NGINX_SNIPPETS` (sha256 `d8fb605f`); la vigente es la del
     checkout (`/opt/zasa-orchestrator/app/deploy/vps-4gb/`). Reportado por Jaime, **sin verificación de Claude**
     (`ls /root/sincronizar-secretos-borde.sh` → «No such file» lo confirmaría).
   - ✅ **Referencias a esa ruta en `zasa-orchestrator`:** `cerrar-migracion.sh:235` y la cabecera del propio script
     (líneas 7-8) apuntan desde `92cc09d` (2026-09-27, desplegado: `/health` = `92cc09d`) a
     `/opt/zasa-orchestrator/app/deploy/vps-4gb/`; el fichero existe ahí, `755`, actualizado por el despliegue.
4. ✅ **CERRADO 2026-09-25: `config_secret.example.php` de ExamenFácil.** El riesgo estaba **desfasado**: el 200 era
   anterior al 09-09, cuando la fase 0 de `scripts/nginx-hardening.sh` sincronizó el vhost, y la memoria
   `examenfacil-health-endpoint` no se actualizó. Verificado por Claude (solo lectura):
   - **Contenido:** plantilla. Las 13 constantes secretas están vacías (`''`) en `examenfacil-cl/config_secret.example.php`
     y en sus 4 versiones del historial (`cc8bb55`, `13f5e0f`, `7da81e6`, `852133a`). Solo revela `DB_NAME` / `DB_USER`
     (`examenfacil` / `ef_admin`), sin contraseña y con MySQL en `localhost`.
   - **HTTP** (loopback + `Host: examenfacil.cl`): `/config_secret.example.php`, `/config_secret.php` y `/config.php`
     → **403**. Vhost vivo: líneas 111 (regex `config|config_secret|…\.php`) y 122
     (`location ~* config_secret\.example\.php$`). `nginx-hardening.sh:113` lo tiene entre sus **guardias**: si el
     bloqueo desaparece, el deploy se pone en rojo.
   - **Despliegue:** la compuerta anti-fugas de `deploy.yml` (líneas 86-103) deja pasar solo `*.example.php` (a
     propósito); el `rsync` excluye `config_secret.php*`. En el VPS: 644 `deploy:www-data`. `config_secret.php` no
     está en el web root.
   - Residual (bajo, opcional): excluir `*.example.php` del `rsync` para que la plantilla ni siquiera llegue al
     servidor. Hoy la única capa es nginx, vigilada por la guardia.

**🟡 Media: superficie o fiabilidad de los controles**
5. ✅ **CERRADO 2026-09-25: túnel `cloudflared` retirado del VPS.** La descripción original («el tráfico del túnel
   se registra como una sola IP») no se cumplía: el túnel estaba **conectado pero sin uso**. Tenía 4 conexiones HA y
   `cloudflared_tunnel_total_requests 0` en más de 22 h. Las 12 peticiones desde loopback del `access.log` eran
   `curl` nuestros. `admin.` y `vip.` llegan por el proxy de Cloudflare directo al origen, con la IP real recuperada.
   El riesgo real era un **camino de entrada paralelo y sin vigilar**: ingress `admin.`/`vip.` → `https://localhost:443`
   por fuera de `ufw`. Si se hubiera usado, todos los clientes habrían compartido un solo contador de rate limit
   (`127.0.0.1`), con riesgo de bloquear el login de todos.
   - Retirada, ejecutada por Jaime (el modo automático bloqueó a Claude `systemctl stop/disable` y el `mv`):
     `systemctl stop` + `disable`; configuración y credenciales archivadas.
   - Verificado por Claude (solo lectura): `inactive` / `disabled`; `/etc/cloudflared` y `/root/.cloudflared` ya no
     existen. Archivo: `/root/backups-rotacion/cloudflared/` (los 3 `config.yml*` de `/etc`) y
     `/root/backups-rotacion/.cloudflared/` (700, **oculto**: `cert.pem` 600 y la credencial `<uuid>.json` 400).
     Desde fuera, después de parar el servicio: `admin.` → 401 y `vip./login` → 200, así que ninguno dependía del túnel.
   - No se tocó `set_real_ip_from`: sin túnel, no hace falta confiar en `127.0.0.1` (lo que además permitiría a un
     proceso local falsificar `CF-Connecting-IP`).
   - ✅ **2026-09-27: respaldos y credenciales destruidos en el VPS.** Inventario previo (solo lectura):
     `/root/backups-rotacion/.cloudflared/` tenía **3** ficheros, no 2 como decía este punto: `c72b9785-….json` (400),
     `cert.pem` (600) y además un **`config.yml`** (644, 987 B, igual en tamaño y fecha al de `cloudflared/`).
     `/root/backups-rotacion/cloudflared/` tenía `config.yml` y dos `.bak` (`pre-strict-tls`, `pre-vip`). ID del túnel
     (de `config.yml`, `tunnel:`): **`c72b9785-cc27-485d-adee-6d8a171ae930`**.
     Ejecutado: `shred -u -z` sobre el `.json` y `cert.pem`, y `rm -rf` de las dos carpetas (los `config.yml*`, sin
     secretos en principio, borrados sin sobrescribir). Verificado: `ls -la /root/backups-rotacion/` ya no las
     muestra; quedan solo `rotar-edge-secret.sh` y los dos `secretos-borde-20260923-*`. Límite: los errores de
     `shred` iban a `/dev/null`, así que se confirma el borrado, no la sobrescritura; y `shred` no es garantía total en
     ext4 con diario ni en disco virtual. Con el túnel borrado en el panel, eso deja de importar.
   - ⏳ **Pendiente de Jaime, SIN CONFIRMAR (panel de Cloudflare, Zero Trust → Networks → Tunnels):** borrar los hostnames públicos
     `admin.`/`vip.` y el túnel. Hasta entonces la credencial archivada sigue siendo válida en Cloudflare. Sin verificar.
   - ~~`shred -u` de `cert.pem` y el `.json`~~ hecho el 2026-09-27 (arriba). Opcional: `apt purge cloudflared`
     (el binario sigue instalado: `cloudflared tunnel list` aún se ejecuta y falla por no encontrar `cert.pem`).
6. ✅ **CERRADO 2026-09-25: `elrincon-backend` migrado de Node 18.19.1 (`/usr/bin/node`, sin soporte desde
   2025-04-30) a Node 22.23.2 (`/opt/node22/bin/node`).**
   - Antes, Claude (solo lectura en el VPS): no hay módulos nativos en `node_modules`; los 24 `.js` pasan
     `node --check` con Node 22; `dotenv` y `mercadopago` cargan con Node 22; ninguna API obsoleta. Respaldo de los
     5 JSON + `.env` en `/root/backups-elrincon-backend/20260925-040204-pre-node22/` (sha256 comprobado, 600).
   - Código: `elrincon-backend` `c646811`. `interpreter: '/opt/node22/bin/node'` en `ecosystem.config.js` y
     `engines.node >=22` en `package.json` y en la raíz de `package-lock.json`. `npm test` en local: 119/120 pasan
     y 1 se omite (con Node 24, el local).
   - Despliegue, ejecutado por Jaime: `git pull` + `pm2 delete` + `pm2 start ecosystem.config.js` + `pm2 save`.
     **Trampa:** `pm2 restart` NO cambia el intérprete de un proceso ya registrado, y sin `pm2 save` el `dump.pm2`
     lo devolvería a Node 18 al reiniciar el servidor.
   - Verificado por Claude después: checkout `c646811` limpio; PM2 `online` con `interpreter /opt/node22/bin/node`,
     `node.js 22.23.2`, 0 inestables; `/proc/<pid>/exe` → `/opt/node22/bin/node`; `dump.pm2` con Node 22;
     `/api/health` → 200 por loopback y desde fuera; los 6 ficheros de datos idénticos al respaldo; log de errores
     vacío. `Elrincon-qa`: **45/46**. El fallo (F4) no tiene que ver con la migración: ver el n.º 16.
   - Rollback: `git checkout be5bfba` + `pm2 delete` / `start ecosystem.config.js` / `save`.
7. ✅ **CERRADO 2026-09-25: reenvíos SSH desactivados en todo el servidor.** El hallazgo era más amplio que «las
   llaves de administración»: sshd permitía **cualquier reenvío** a cualquier llave (`allowtcpforwarding yes`,
   `permitopen any`, `permitlisten any`, `allowagentforwarding yes`, `allowstreamlocalforwarding yes`,
   `x11forwarding yes`), sin bloques `Match`. Las 2 llaves de administración (`mqRvR+Cn`, la de Claude, y `5xYVSNkN`,
   la de Jaime) están en `root` **y** en `deploy` sin opciones; las 3 de CI ya tenían `restrict`. Lo grave era
   `deploy`: con su sudo acotado podía abrir túneles a `:3000` (`elrincon-backend`, **sin compuerta**), a `:3001` y a
   Postgres, saltándose nginx.
   - Cambio aplicado por Claude: bloque añadido a `/etc/ssh/sshd_config.d/00-hardening.conf`, que se lee primero y
     gana sobre el `X11Forwarding yes` de la línea 99 de `sshd_config`:
     `DisableForwarding yes` + explícitos `AllowTcpForwarding no`, `AllowAgentForwarding no`,
     `AllowStreamLocalForwarding no`, `X11Forwarding no`. Respaldo previo en
     `/root/backups-ssh/20260925-041553/00-hardening.conf`. `sshd -t` rc=0 → `systemctl reload ssh` (no corta
     sesiones). OpenSSH 9.6p1.
   - Verificado con conexiones nuevas: se entra con llave como `root` y como `deploy`; `sshd -T` → `disableforwarding
     yes` y los cuatro en `no`; **prueba negativa**: `ssh -L …:127.0.0.1:3000` como `deploy` → `administratively
     prohibited`, y `curl` por el túnel → `000`. `permitopen any` sigue apareciendo en `sshd -T`, pero sin efecto.
   - ⏳ Confirmar en el próximo despliegue de cualquier repo que el CI no se ha visto afectado (usa `scp`, `rsync`
     y comandos por SSH, sin reenvío).
   - Si algún día hace falta un túnel para depurar (p. ej. `ssh -L 5432`), abrirlo con un bloque `Match` temporal,
     **no** quitando este bloque.
   - Abierto, opcional: ¿hacen falta las llaves de administración en `deploy`? `root` ya sirve de acceso de
     emergencia.
8. ✅ **CERRADO en código y desplegado 2026-09-25 (⏳ falta la prueba con sesión real): H7 + fuga del historial de Sofía.**
   - **H7 se cierra sin código.** Los tenants del widget (`liset`, `clinicas`, `demovip`, `default`) son bots de
     vendedor; los clientes del Portal VIP viven en `clientes` de Postgres y no tienen tenant de widget. Para un
     cliente de la agencia, la identidad genérica de Sofía es la correcta. Además, vip. solo está en la allowlist de
     `default`: pasar otro `tenantId` daría 403. El backend no se fía del `tenantId` del cliente (token del widget,
     slug desconocido → 404, Origin contra el tenant efectivo).
   - **Hallazgo real al revisarlo:** el historial (`sc.admin.sales-agent.history.default`) y el id del hilo
     (`….session.default`) **sobrevivían al cierre de sesión**, porque `purgarSesionLocal()` solo borraba el perfil y
     las claves heredadas. En la misma pestaña, el siguiente usuario veía la conversación del anterior y el backend
     seguía **su** hilo.
   - Corrección: `admin_solucionesconia` `b98f90e`. `purgarSesionLocal()` recoge y borra las claves con prefijo
     `sc.admin.sales-agent.` (nunca `clear()`). Cubre el cierre de sesión y el 401 (`sesionCaducada`). El bundle
     público del widget también cambia, porque importa `sesion.ts` vía `httpClient.ts`.
   - Verificado: prueba con `sessionStorage` simulado por los dos caminos (borra 4 claves del widget y el perfil y
     conserva las ajenas); `tsc` y build en verde. En producción, el widget servido tiene el mismo sha256 que el del
     commit y el bundle de vip. (`index-CXAkYcfD.js`) contiene el prefijo. ⏳ Falta entrar como cliente, escribir,
     salir y volver a entrar en la misma pestaña.
   - El push lo lanzó Jaime: el modo automático lo bloqueó a Claude («Production Deploy»).
9. ✅ **CERRADO en `main` 2026-09-25 (⏳ falta ver el run de Actions): compuerta de CSP para la SPA de vip.**
   - `admin_solucionesconia` `c1cfe81`. `e2e/servidor-csp.mjs` sirve `dist/` con la CSP real: de `CSP_VIP` o de
     `seguridad-vip.conf` del repo hermano, y **aborta sin CSP** para no dar un verde vacío. `e2e/csp.spec.ts` tiene
     4 pruebas: sonda que provoca una violación, `/login`, portal de cliente (Sofía con `adoptedStyleSheets` > 0 y
     `.saw` en `position: fixed`) y portal de admin (M. Jesús en `/dashboard`, `/sofia` y `/portal`). La sesión se
     simula con el perfil en `sessionStorage` + 200 en `/api/admin/health` + **503** en el resto (un 401 devolvería
     a `/login`); lo externo se aborta.
   - En `deploy-vip.yml`: después del build y **antes de tocar el VPS**. `playwright install --with-deps chromium`
     y la CSP leída de vip. con `curl -sSI` (sin `-f`, porque la cabecera va con `always`); si falla, se sube
     `test-results/` como artefacto.
   - Verificado en local: 4/4; con la CSP leída de vip. (idéntica a `seguridad-vip.conf`), también 4/4; y
     **reintroduciendo la regresión del 22-sep, la prueba falla**. ⏳ Claude no ve Actions: confirmar el run.
   - Costes: +30-60 s por despliegue; la CSP sale de lo que sirve producción, así que un cambio de política y de SPA a
     la vez exige desplegar primero la política.
10. ✅ **CERRADO 2026-09-27: permisos de los logs de PM2.**
    - **Diagnóstico** (solo lectura): los logs de `zasa-orchestrator` seguían en 600, pero los de `elrincon-backend`
      estaban en 644, incluidos los de la rotación del 27-sep. El demonio corría con `Umask: 0022` porque
      `pm2-root.service` no fija ninguno. El 600 anterior era un `chmod` puntual y no una configuración: al volver a
      registrar un proceso (la migración a Node 22 del 25-sep), sus ficheros nuevos nacían en 644. La exposición
      real quedaba contenida por `/root` = `700 root root`.
    - **Antes de fijar el umask** se comprobó que ningún backend escribe en rutas que sirve nginx: los `root`/`alias`
      de `sites-enabled` son `/var/www/*`, `/opt/agencia/public/{vip,widget}` y ficheros sueltos de
      `/opt/agencia/private/clientes/`, que escriben CI, `deploy.sh` o `scp`. Los adjuntos, audios y libros JSON de
      los backends ya se crean con `0o600`/`0o700` explícito. Lo único que cambia son los SQLite del orquestador (a 600).
      Sin verificar: los valores reales de `ARCHIVOS_CLIENTES_DIR`, `*_DB_PATH` y `LIBRO_*_PATH` en los `.env`.
    - **Solución:** `chmod 600 /root/.pm2/logs/*` y el drop-in
      **`/etc/systemd/system/pm2-root.service.d/umask.conf`** (`[Service]` + `UMask=0077`) → `daemon-reload` →
      `systemctl restart pm2-root`. Está fuera de `pm2-root.service`, así que sobrevive a un `pm2 startup`.
    - **Verificado:** `pm2-root` activo; el demonio y los 2 procesos con `Umask: 0077`; ambos `online` con 0 reinicios
      y 0 inestables, en `/opt/node22/bin/node`; `/api/health` (:3000) y `/health` (:3001) → 200; los logs creados al
      arrancar (`elrincon-backend-*-1.log`) nacieron en 600. `elrincon-backend` pasó del id 2 al 1: los `*-0` y `*-2`
      son restos.
    - ✅ Confirmado tras la rotación de las 00:00 del 28-sep: ningún log de `/root/.pm2/logs/` en 644.

**⚪ Baja: higiene**
11. ✅ **CERRADO 2026-09-27: las recetas de nginx ya no dejan respaldos dentro de `/etc/nginx`.**
    - **Estado del VPS** (solo lectura): ningún residuo. `sites-enabled/` = 6 enlaces, uno por vhost, sin ficheros
      sueltos; `sites-available/` = los 6 vhosts + `default` (no enlazado). `admin.` y `vip.` en 600, el resto 644.
      Ojo: `find -name "*.bak"` no sirve de prueba, porque las recetas nombraban `<fichero>.bak.<fecha>`.
    - **Recetas corregidas** (antes: `cp` a `<misma carpeta>/<fichero>.bak.<fecha>`; ahora:
      `install -d -m 700 /root/backups-nginx` + `cp -p` a `/root/backups-nginx/<fichero>.<fecha>`):
      - `Agencia_Solucionesconia/nginx/vip-portal.conf.plantilla` → `def70dc` (sin CI; llega al snippet en el próximo
        `deploy.sh` manual).
      - `zasa-orchestrator/deploy/vps-4gb/nginx-templates/` `admin.solucionesconia.cl.conf`,
        `vip.solucionesconia.cl.conf` y `cloudflare-real-ip.conf` → `3b07d50`, desplegado con `92cc09d`.
      - `privado_agencia/Clientes/forte-spa/config/nginx.forte-spa.conf` → editado en disco, **sin versionar** (fuera de
        git por el `.gitignore` raíz).
    - **Hallazgo extra:** la receta de `vip.` instalaba el vhost con `install -m 644`, aunque el renderizado lleva el
      `EDGE_SECRET` (en el VPS está en 600). Corregido a 600 en `91c03e3`, desplegado con `92cc09d`. Ningún otro script
      instala esos vhosts con modo explícito.
    - Relacionado, sin tocar: `completar-env.sh` y `sincronizar-secretos-borde.sh` dejan copias del `.env` en
      `/opt/zasa-orchestrator/` (`.env.bak-*`, 600). No es nginx, pero se acumulan; no se ha contado cuántas hay.
12. Faltan los pilares 3 y 4 de MVG.
13. **`SALES_WEBHOOK_URL` vacío;** el lead y el evento de Calendar de la prueba E2E del 22-b siguen sin borrar.
14. **Fuera del VPS:** vaciar la Papelera de Windows, que tiene ficheros sensibles.
15. **H4: inventario de credenciales simulado** (deuda funcional, no de seguridad; antes era el n.º 1, Alta).
    `/api/integrations/keys` (`zasa-orchestrator/src/services/integrationsService.ts:60-108`, espejo en
    `admin_solucionesconia/src/services/integrationService.ts`) devuelve un inventario **estático de demostración**:
    `prefijo` = `sk_live_`/`sk_test_`/`sk_ci_` + 4 caracteres y `ultimos4` inventados, marcado `provisional: true`
    (el frontend muestra la franja de «datos simulados»). No hay ninguna clave real: el tipo `ApiKeyPublica` no tiene
    campo donde quepa el secreto. Falta el **almacén real de credenciales**; al construirlo: columnas explícitas
    (nunca `SELECT *`) y la clave completa se muestra una sola vez, al emitirla (cabecera del fichero, líneas 4-16).
    - Barrido de secretos del 25-sep en `admin_solucionesconia` y `zasa-orchestrator` (solo lectura, excluidos
      `node_modules`, `.git`, `dist` y `coverage`): solo `.env.example` versionado; `GOOGLE_PRIVATE_KEY` de
      `.env.example` es una plantilla; `TOKEN_MP` de `tests/pagosMercadoPago.test.ts:46` es sintético (dígitos
      consecutivos, sin el tramo del id de usuario); los hex largos son sha256 públicos de bundles y árboles. Los
      secretos reales salen de `process.env` (`API_SECRET_TOKEN`, `EDGE_SECRET`, `ANTHROPIC_API_KEY`,
      `RESEND_API_KEY`, `GOOGLE_PRIVATE_KEY`).

16. **Cloudflare elimina el `ETag` del HTML de elrincondedonselso.cl** (hallado el 25-sep; rendimiento, no seguridad).
    `Elrincon-qa` F4 (`tests/bastionado.spec.js:107`) falla: `/capitulo-1.html` llega sin `ETag`, así que
    `no-cache, must-revalidate` descarga la página entera en cada visita en lugar de un 304. El origen **sí** lo
    emite (`"6a9b398d-a44f"`, y `W/…` con gzip); lo quita Cloudflare en la respuesta `DYNAMIC`. No es la migración
    a Node 22: es HTML estático de nginx y el vhost no ha cambiado desde el 04-sep. Revisar en el panel de Cloudflare
    las opciones que reescriben el HTML (Email Obfuscation, Rocket Loader, Automatic HTTPS Rewrites) y «Respect
    Strong ETags». Tarea de Jaime.

**Alta: sin riesgos abiertos desde el 2026-09-25.** El n.º 1 (H4) bajó a Baja como n.º 15, y los n.º 2, 3 y 4 están
cerrados. Lo siguiente en prioridad es la categoría **Media** (n.º 5-10).

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

**Del 2026-09-24-b:**

9. **El modo automático bloquea por resultado, no por comando:** escrituras en el VPS (`chown`, `mv`, `systemctl`),
   borrar líneas de `bash_history`, `pm2 reset`, leer `.env` de producción y los push que despliegan vip. Un bloqueo
   vale para el resto de la sesión: no se reintenta de otra forma, se le da el comando a Jaime. Sí pasaron las
   lecturas del VPS (`ls`, `pm2 info`, `sshd -T`, `curl` por loopback), el respaldo de los JSON de El Rincón, el
   cambio de `sshd` y el push al orquestador.
10. **`chmod 755` de GNU conserva el setgid de un directorio;** para quitarlo, `chmod 00755` (5 dígitos).
11. **`pm2 restart` no cambia el intérprete** de un proceso ya registrado: `pm2 delete` + `pm2 start ecosystem` +
    `pm2 save`, o `dump.pm2` lo devuelve al Node viejo tras reiniciar el servidor.
12. **Un log vacío de PM2 no prueba estabilidad:** se rota a las 00:00. El indicador es `unstable restarts`.
13. **Tras un push al orquestador, el despliegue tardó unos 3,5 min:** un `/health` a los 2 min da un falso «no
    desplegó».
14. **`grep -P` en Git Bash exige `LC_ALL=C.UTF-8`;** sin él falla en silencio (rc 2 con `2>/dev/null`).
15. **Las memorias se desfasan:** hoy dos daban por abierto lo que llevaba semanas cerrado (`config_secret.example.php`)
    o describían otro servidor (`vps-access-model`). Antes de afirmar, una sonda.

**Del 2026-09-27:**

16. 🔴 **REGLA: todo reinicio, actualización o migración del demonio PM2 (p. ej. el paso a Node 22) DEBE ejecutarse
    mediante `systemctl`. Está prohibido levantar el demonio directamente desde la shell,** para no perder el UMask.
    `UMask=0077` solo se aplica cuando systemd arranca el demonio. Un `pm2 update`, `pm2 kill` + `pm2 resurrect`, o
    cualquier comando `pm2` lanzado con el demonio parado, lo levanta con el umask de la shell (0022), y los logs y
    ficheros nuevos vuelven a nacer en 644, y además con Node 18 en lugar de Node 22 (`node22.conf`). Comprobación
    tras cualquier cambio: `grep -i umask /proc/$(cat /root/.pm2/pm2.pid)/status` → `0077` y
    `readlink /proc/$(cat /root/.pm2/pm2.pid)/exe` → `/opt/node22/bin/node`.
17. **`grep -r` no sigue los enlaces simbólicos** que encuentra dentro del directorio: sobre `sites-enabled/` no lee
    ningún vhost y devuelve vacío. Usar `grep -R`.
18. **La herramienta Grep de Claude respeta el `.gitignore` raíz,** que excluye `Workspace_Agencia/*`: buscando desde
    `Workspace_Agencia` devuelve vacío aunque haya coincidencias. Para esos repos, `grep` desde Bash o buscar dentro de
    cada repo.

**Del 2026-09-28/29:**

19. 🔴 **Filtro de secretos: `[0-9a-fA-F]{40,}` SIN comillas ni anclas, aplicado DENTRO del VPS.** Con
    `"[0-9a-fA-F]{40,}"` (entre comillas) se colaron los `Bearer <hex>` y las líneas `gsub(/<hex>/…)` que el render deja
    en los COMENTARIOS del vhost: así se expusieron los 4 secretos del 29-sep. Para comparar plantilla y vivo, el
    `diff` se hace en el VPS y solo salen `cmp`, recuentos o líneas ya filtradas.
20. **Escapado por SSH:** `sed` con `\n`, `$var` y comillas dentro de `ssh '…'` fallan en silencio (una directiva
    acabó dentro de un comentario; un `tr -d "\"\x27"` borró los caracteres `\ x 2 7` de los valores y dio una falsa
    alarma de `.env` corrupto). Lo robusto: un script en el scratchpad y `ssh … 'bash -s' < script`.
21. **`nginx -t` no detecta una directiva comentada por accidente.** Comprobar la configuración cargada:
    `nginx -T | grep -E '^\s*proxy_read_timeout'`.
22. **`snippets/vip-portal.conf` NO es huérfano:** `solucionesconia.cl` lo incluye con el comodín `vip-portal*.conf`
    (línea 98), y un comodín sin coincidencias pasa `nginx -t`. Da a la landing `/api/auth/`, `/api/vip/`, `/api/`,
    `/vip/` y `/clientes/assets/`.
23. **`rotar-secretos-borde.sh` hasta `c2faf54` no podía terminar:** `viejos="$(grep … | wc -l)"` con `pipefail` + `set
    -E` disparaba el rollback justo en el caso bueno (0 coincidencias). La rotación de las 02:20 del 29-sep se deshizo
    sola por eso.
24. **Los tokens de tenant viven en TRES sitios:** `inquilinos.env`, vhost admin. (render con `SEC=`) **y
    `clientes.token_hash` = sha256(token)**. Liset y demovip resuelven por la base (`TENANT_TOKENS` está vacío):
    cambiar solo nginx deja el portal en 401. El resolver cachea 5 s.
25. **El panel de M. Jesús llama a `/api/admin/mjesus` por ruta relativa** (`VITE_API_URL` vacío): pasa por el
    `location /api/` de **vip.**, no por admin. Cloudflare corta a los 100 s (524): de ahí el `100s` y el flujo
    asíncrono.
26. **M. Jesús asíncrono:** `POST /preguntar` → 202 `{id}`; `GET /preguntar/:id` sin cuota (la cuota de 20/min es
    solo para los POST); un trabajo activo por operador (409 con el id del activo); trabajos en memoria (TTL 10 min),
    se pierden al reiniciar PM2. El panel acepta aún el 200 síncrono.
27. **El token maestro resuelve a `viewer`:** `/api/admin/mjesus/*` le da 403; solo entra una sesión de admin o un token
    de `RBAC_ADMIN_TOKENS`. Sirve para probar que una ruta existe sin gastar: 403 (existe) frente a 404 (no existe).
28. **`mjesus_consultas` vive en `DATABASE_URL`** (`zasa_portal`). Sus columnas son `creada_en_iso`, `latencia_ms` y
    `costo_estimado_usd` (no `creado_en`, `duracion_ms`, `coste_usd`).
29. **No hay unidad systemd `zasa-orchestrator`:** la app se recarga como `desplegar.sh`,
    `NODE_BIN=/opt/node22/bin/node pm2 startOrReload ecosystem.config.js --update-env` desde `/opt/zasa-orchestrator/app`.
30. **`admin_solucionesconia`: `npm run lint` es un marcador que siempre sale 1** (no hay configuración de ESLint); la
    revisión de tipos va dentro de `npm test`. Un `servidor-csp.mjs` huérfano en 4180/4181 hace fallar la compuerta
    E2E siguiente (rc 127/1): cerrarlo antes de repetir.

---

## 4. Secretos

- 🔴 **2026-09-29 ~01:30 UTC: 3.ª exposición en el chat.** Al comparar la plantilla de admin. con el vhost vivo, un
  filtro de hex entre comillas (§3 n.º 19) dejó salir `API_SECRET_TOKEN`, `EDGE_SECRET`, `TENANT_TOKEN_LISET` y
  `TENANT_TOKEN_DEMOVIP`. **Los cuatro rotados esa misma madrugada**, con viejo → 403/401 y nuevo → 200 verificados:
  - API `43309db8`→`2e2f571f` y EDGE `3f6c5150`→`f74fa9ba` (02:33 UTC) con `rotar-secretos-borde.sh` desde `c2faf54`,
    en sus 4 sitios (`.env`, vhosts admin. y vip., `snippets/vip-portal.conf`, que pasó a 600). Ventana 7,0 s.
  - LISET `137f9ca4`→`ee89f370` y DEMOVIP `2395ee7c`→`185a325b` (02:38 UTC) en `inquilinos.env`, vhost admin. y
    `clientes.token_hash`. Ventana 2,9 s.
  - ⏳ Respaldos con valores viejos en `/root/backups-rotacion/` (3 directorios de hoy) y en
    `/root/backups-nginx/instalar-plantillas-*`: `shred` pendiente de Jaime (§2 n.º 0). Ojo:
    `inquilinos-20260929-023812/admin` e `instalar-plantillas-20260929-0238*` llevan el API y el EDGE **vigentes**.
  - Los 4 `.bak` viejos de `snippets/backups/` salieron de `/etc/nginx` a `/root/backups-nginx/huerfanos-20260929/`
    (700/600).
- `cfut_` comprometido: **rotado el 2026-09-25** (huella nueva `873c9da4`). Credencial de superusuario `postgres`:
  **anulada y `.bak` borrado el 2026-09-25** (`postgres` solo entra por `peer`; verificado por Claude).
- Credenciales del túnel `cloudflared`: **destruidas en el VPS el 2026-09-27** (`shred -u -z` + `rm -rf`). El túnel
  `c72b9785-…` sigue existiendo en Cloudflare hasta que Jaime lo borre en Zero Trust.
- La clave de `mjesus_ro` nunca pasó por el chat (la genera el script en el VPS; stdin y `PGPASSFILE` efímero).
