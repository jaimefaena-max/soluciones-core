# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-24-b (remediación de la matriz de 16 riesgos: VPS + Portal VIP)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memorias de arranque: `arranque-2026-09-26` (este estado), `hardening-vps-2026-09-23` (riesgos del VPS, al día) y
> `vps-access-model` (reescrita hoy con el servidor real).
> Hand-off anterior (2026-09-24-a, copiloto de BI «M. Jesús»): en el historial de este fichero (`8a02116`).
> Sesión del 2026-09-25 01:29 UTC al 05:14 UTC (22:29–02:14 hora de Chile; cuenta como 2026-09-24 por su inicio):
> **224,4 min activos**, **$130.900 CLP**. Telemetría `2026-09-24-b` en `zasa-orchestrator` `06a494d` (ver §0 para
> su estado de publicación).
>
> **Forma de trabajo de esta sesión:** Jaime dictó cada paso y el modo automático bloqueó a Claude casi todas las
> escrituras en el VPS y los push que despliegan vip. Lo bloqueado lo ejecutó Jaime a mano; lo que Claude pudo, lo
> verificó en solo lectura. Cada cierre de §2.1 dice qué vio Claude y qué reportó Jaime.

---

## 0. Qué se cerró — con su evidencia

| Frente | Estado | Evidencia |
|---|---|---|
| **Riesgos Alta (n.º 1-4)** | ✅ ninguno abierto | `cfut_` rotado (Jaime); `www-data` sin escritura en el portal de Jose; `sincronizar-secretos-borde.sh` coteja el snippet de vip. (`b6df917`); `config_secret.example.php` ya daba 403 desde el 09-09; H4 era un inventario simulado → Baja |
| **Credencial del superusuario `postgres`** | ✅ | `PASSWORD NULL` + `.bak` borrado (Jaime). **Claude lo verificó en el cierre:** `rolpassword is null` = `t`, el `.bak` no existe |
| **Túnel `cloudflared`** (n.º 5) | ✅ en el VPS · ✅ credenciales destruidas (2026-09-27) · ⏳ en el panel | 0 peticiones en 22 h; parado y deshabilitado. `cert.pem`, `c72b9785-….json` y los 4 `config.yml*` eliminados del VPS. Falta confirmar el borrado del túnel `c72b9785-cc27-485d-adee-6d8a171ae930` en Zero Trust |
| **`elrincon-backend` a Node 22** (n.º 6) | ✅ | `c646811`; PM2 `interpreter /opt/node22/bin/node`, `/api/health` 200, datos idénticos al respaldo. El demonio de PM2 pasó a Node 22 el 2026-09-27 (fila siguiente) |
| **Demonio de PM2 a Node 22** | ✅ 100 % · 2026-09-27 | Drop-in `/etc/systemd/system/pm2-root.service.d/node22.conf` que sobrescribe `ExecStart`/`ExecReload`/`ExecStop` para usar `/opt/node22/bin/node`; `/proc/<pid>/exe` → Node 22, umask 0077, ambos `/health` en 200 |
| **Reenvíos SSH** (n.º 7) | ✅ | `DisableForwarding yes` en `00-hardening.conf` (aplicado por Claude); túnel `-L` rechazado |
| **Historial de Sofía entre usuarios** (n.º 8) | ✅ desplegado · ⏳ prueba real | `b98f90e`: `purgarSesionLocal()` borra `sc.admin.sales-agent.*`. Widget servido = bundle del commit (sha256) y vip. lo contiene |
| **Compuerta de CSP en CI** (n.º 9) | ✅ en `main` · ⏳ run de Actions | `c1cfe81`: Playwright sobre `dist/` con la CSP real de vip., 4/4 en local, detecta la regresión del 22-sep |
| **Permisos de los logs de PM2** (n.º 10) | ✅ 2026-09-27 | Drop-in `/etc/systemd/system/pm2-root.service.d/umask.conf` con `UMask=0077`; demonio y los 2 procesos con umask 0077, logs nuevos en 600, ambos `/health` en 200 |
| **Telemetría 2026-09-24-b** | ⏳ ver nota | `06a494d` empujado; comprobar `/health` = `06a494d` y `grep -c 2026-09-24-b` en `dist/data/telemetry.js` |

**Repos al cierre:** `admin_solucionesconia` (`c1cfe81`), `zasa-orchestrator` (`06a494d`), `elrincon-backend`
(`c646811`) y la raíz, todos `= origin/main`. `examenfacil-cl` (2) y `AuditorLegal` (3) tienen cambios sin
commitear **que no son de esta sesión** y no se han inspeccionado.

---

## 1. Paso exacto para arrancar

➡️ **Comprobar el cierre del riesgo n.º 10 tras la rotación de las 00:00 del 28-sep.** Solo lectura, un minuto:
`ls -la /root/.pm2/logs/`. Todos los ficheros deben seguir en 600. Si todo está bien, el siguiente punto de la cola es
**M. Jesús — resto de F1** (§2, n.º 4); el riesgo n.º 11 se cerró el 2026-09-27.

---

## 2. Cola (por cercanía a producción)

0. **Acciones de Jaime** (el modo automático las bloquea a Claude, o son de panel):
   - **Cloudflare Zero Trust:** borrar los hostnames `admin.`/`vip.` y el túnel `c72b9785-cc27-485d-adee-6d8a171ae930`,
     y comprobar que no queda ningún CNAME a `…cfargotunnel.com`. (Las credenciales del VPS ya se destruyeron el
     2026-09-27: el panel es lo único que falta.)
   - ~~**Retirar `/root/sincronizar-secretos-borde.sh`**~~ ✅ eliminada por Jaime el 2026-09-27 (§2.1 n.º 3).
   - **Cloudflare, n.º 16:** la opción que quita el `ETag` del HTML de El Rincón.
   - **Prueba real del n.º 8:** entrar en vip. como cliente, escribir a Sofía, cerrar sesión y volver a entrar en la
     misma pestaña → el chat debe salir vacío.
   - **Actions de `admin_solucionesconia`:** confirmar que el run de `c1cfe81` pasó la compuerta de CSP (Claude no ve
     Actions). Si falló, el artefacto `csp-test-results` tiene las trazas.
   - Heredados: panel de M. Jesús que «desaparece» en el móvil (¿queda en `/login`?), Papelera de Windows,
     `SALES_WEBHOOK_URL`, limpiar el E2E del 22-b.
1. ~~**Riesgo n.º 10**~~ ✅ cerrado el 2026-09-27; queda la comprobación tras la rotación (§1).
2. ~~**Demonio de PM2 a Node 22**~~ ✅ **CERRADO 2026-09-27 (100 %)** (`cockpit-pm2-elrincon-node22`).
   - **Causa:** `ExecStart` lanzaba el PM2 global (7.0.3, `engines` `>=18.0.0`) por su shebang `#!/usr/bin/env node`, y
     el `PATH` de la unidad no incluye `/opt/node22/bin`, así que resolvía a `/usr/bin/node` 18.
   - **Solución:** drop-in `/etc/systemd/system/pm2-root.service.d/node22.conf`. Sobrescribe `ExecStart`,
     `ExecReload` y `ExecStop` (con la línea vacía previa que anula el valor original) para lanzar
     `/opt/node22/bin/node /usr/local/lib/node_modules/pm2/bin/pm2 …`. Sin reinstalar PM2, y sobrevive a `pm2 startup`.
     Aplicado con `daemon-reload` → `systemd-analyze verify` (rc 0) → `systemctl restart pm2-root`.
   - **Verificado:** `pm2-root` activo, con `node22.conf` y `umask.conf` cargados; `/proc/<pid>/exe` →
     `/opt/node22/bin/node`; `Umask: 0077`; los 2 procesos `online` con 0 reinicios y 0 inestables; `/api/health`
     (:3000) y `/health` (:3001) → 200.
   - **Queda:** el `pm2` lanzado a mano desde la shell sigue siendo cliente Node 18. No importa para consultar, pero
     un `pm2 update` relanzaría el demonio con Node 18 y umask 0022. Solo `systemctl` (§3, regla 16).
   - Vuelta atrás: `rm …/pm2-root.service.d/node22.conf && systemctl daemon-reload && systemctl restart pm2-root`.
3. ~~**Riesgo n.º 11**~~ ✅ **CERRADO 2026-09-27:** las 5 recetas de nginx guardan el respaldo en `/root/backups-nginx/`
   (700), fuera de `/etc/nginx` (detalle en §2.1 n.º 11).
4. **M. Jesús — resto de F1** (ADR-003 §8): `catalogo.ts` (7 métricas sobre `bi_*`) + `derivar.ts`, con tests, sin LLM.
5. **M. Jesús — F2/F3** (enrutador, analista, verificador, `/api/admin/mjesus/*`, conectar el panel).
6. Deudas de documentación en repos: ADR-003 §10.4 (credencial de `postgres` ya cerrada); comentario de
   `scripts/audit-vip-infra.js:21` («CSP no desplegada», falso). Un push a `main` del orquestador despliega.
   ~~Cabecera de `sincronizar-secretos-borde.sh` (líneas 7-8) y `cerrar-migracion.sh:235`~~ ✅ `92cc09d`, desplegado.
   Residuo en `cerrar-migracion.sh` (un solo uso, sin tocar): llama a `/root/rotar-edge-secret.sh` (l. 229), que en el
   VPS está en `/root/backups-rotacion/`, y a `/root/verificar.sh` (l. 236), sin comprobar.
7. Heredados: MVG 3 y 4; GambusasChile CI; `package.json` 2.4.0 vs tag v2.5.0; telemetría 09-16-b y 09-22-a sin
   reconstruir; ¿hacen falta las llaves de administración en la cuenta `deploy`?

### 2.1 Matriz de riesgos abiertos de seguridad (priorizada 2026-09-25)

Ya no queda **ninguna credencial expuesta conocida**. La matriz se armó el 25-sep a partir del handover y las memorias,
y cada punto se fue comprobando al abordarlo: cada cierre dice qué verificó Claude y qué reportó Jaime. **Estado al
cierre de la sesión:** Alta cerrada; Media cerrada salvo las comprobaciones que aún piden los n.º 5, 8 y 9 (el n.º 10
se cerró el 2026-09-27); Baja sin tocar, más el n.º 16, nuevo.

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
    - ⏳ Falta confirmar tras la rotación de las 00:00 del 28-sep que todo sigue en 600 (§1).

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

---

## 4. Secretos

- Ningún valor pasó por el chat. La clave de `mjesus_ro` la genera el script en el VPS, viaja a psql por stdin con el
  registro apagado y a las sondas por un `PGPASSFILE` efímero.
- `cfut_` comprometido: **rotado el 2026-09-25** (huella nueva `873c9da4`). Credencial de superusuario `postgres`:
  **anulada y `.bak` borrado el 2026-09-25** (`postgres` solo entra por `peer`; verificado por Claude).
- Credenciales del túnel `cloudflared` (`cert.pem`, que permite gestionar túneles de la zona, y el `<uuid>.json`):
  **destruidas en el VPS el 2026-09-27** (`shred -u -z` + `rm -rf` de las dos carpetas de archivo). El túnel
  `c72b9785-…` sigue existiendo en Cloudflare hasta que Jaime lo borre en Zero Trust, pero ya no queda en el servidor
  ninguna credencial que permita usarlo.
- En esta sesión no pasó ningún valor por el chat: solo huellas sha256 de 8 caracteres.
