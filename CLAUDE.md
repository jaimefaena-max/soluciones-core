# Workspace de Jaime — C:\Proyectos

Espacio de trabajo centralizado con 11 proyectos (repos GitHub) que se referencian entre sí. Abrir Claude Code siempre en `C:\Proyectos`.

## Proyectos

> Nota de mapeo: la columna **Carpeta** es la ruta local; **Repo GitHub** es el nombre en `github.com/jaimefaena-max/`. No siempre coinciden (p. ej. `Agencia_Solucionesconia\` → repo `solucionesconia`). Mantener ambas columnas sincronizadas para no reintroducir drift.

| Carpeta | Repo GitHub | Qué es | Producción |
|---|---|---|---|
| `Workspace_Agencia\Agencia_Solucionesconia\` | `solucionesconia` | La agencia (landing, assets). Los clientes viven en `Clientes\` (Jose, _Plantilla_Portal_SPA) | solucionesconia.cl |
| `Workspace_Agencia\admin_solucionesconia\` | `admin_solucionesconia` | Frontend B2B (Vite/React) del chat/dashboard de admin.solucionesconia.cl. El backend operativo vive en `zasa-orchestrator` | admin.solucionesconia.cl (frontend) |
| `Workspace_Clientes\Elrincon\` | `elrincondedonselso` | Libro web "El Rincón de Don Selso": 11 capítulos + epílogo en HTML estático puro. El backend de pagos NO está aquí: vive en el repo hermano `Elrincon-backend\` | elrincondedonselso.cl |
| `Workspace_Clientes\ExamenFacil\` | `examenfacil-cl` | Plataforma ExamenFacil | examenfacil.cl |
| `Workspace_Clientes\AuditorLegal\` | `auditorlegal` | Web estática con `api_handler.php` | — |
| `Workspace_Agencia\zasa-orchestrator\` | `zasa-orchestrator` | Orchestrator Fastify+TS (Cockpit ZASA + telemetría `src/data/telemetry.ts`). Deploy: push → DO App Platform | admin.solucionesconia.cl |
| `Workspace_Clientes\GambusasChile\` | `gambusaschile` | E-commerce de carnada de pesca (gambusas **curadas en sal / deshidratadas**, seleccionadas, se despachan congeladas — NO son vivas). PHP nativo, Resend/MercadoPago por cURL puro, Bóveda de Titanio | gambusaschile.cl (live, HTTPS) |
| `Workspace_Clientes\Elrincon-backend\` | `elrincon-backend` | Microservicio de pagos y acceso de El Rincón (Node `http` nativo + SDK Mercado Pago, sin Express). **Sin CI**, pero `/opt/elrincon-backend` **es un checkout de git**: se despliega con `git pull` + `pm2 restart`, nunca por `scp` (ver Infraestructura) | `/api/` de elrincondedonselso.cl |
| `Workspace_Clientes\Elrincon-qa\` | `Elrincon-qa` | Suite E2E del embudo de El Rincón (Playwright, 8 pruebas en ~15 s): muro de pago, precio y navegación. `cd Elrincon-qa && npm test` | — (local / CI) |
| `.` (raíz `C:\Proyectos`) | `agencia-root-orchestrator` | Repo de respaldo/orquestación de la raíz del workspace (`.gitignore` endurecido que excluye repos anidados, secretos y datos de clientes). Creado 2026-09-02 | — (meta / respaldo) |
| `.claude\` | `claude-skills` | Skills, agentes y tooling de Claude Code del workspace (incluye `/inicio-sesion`, `/cierre-sesion` y `workspace-status.ps1`) | — (local / tooling) |

## Infraestructura compartida

El VPS DigitalOcean es **`161.35.85.101`**, hostname `zasa-server-restaurado` (Ubuntu 24.04, nginx 1.24). Desde la consolidación del 2026-09-07 es el **único origen del workspace**: sirve **los 10 hostnames** de los cuatro dominios de producción —los cuatro de solucionesconia.cl (`@`, `www`, `admin`, `vip`), elrincondedonselso.cl (+`www`), examenfacil.cl (+`www`) y gambusaschile.cl (+`www`)—, todos tras el proxy de Cloudflare. No queda ningún segundo servidor.

Verificado el 2026-09-07 con sonda de testigo: 10 peticiones con `User-Agent` único, las 10 registradas en el `access.log` de esta máquina. Es la única comprobación válida con todo tras el proxy (el método está más abajo).

> ⚠️ **La IP cambió (verificado 2026-09-04).** La anterior, `159.223.213.237`, está muerta: no responde en ningún puerto, ni siquiera el 443. Si un `ssh` da `Connection timed out`, la primera comprobación **no** es el firewall ni la llave — es a dónde resuelve el dominio ahora.
>
> 🔴 **Pero desde el 2026-09-05 ya NO sirve `curl -w '%{remote_ip}'` para averiguarlo.** Los CUATRO dominios están hoy tras Cloudflare, así que esa IP es siempre la del proxy. La comprobación que sí vale es preguntar al propio servidor por su interfaz:
> `ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'hostname -I'`
>
> 🔴 **Y desde el 2026-09-07 tampoco sirve medir contra la IP pública.** El `curl -sk -H 'Host: <dominio>' https://161.35.85.101/` que documentaba antes esta sección **ya no responde desde fuera**: `ufw` solo acepta 80/443 desde los 22 rangos de Cloudflare, así que devuelve `000` tras el timeout. **Ese `000` NO significa que el servidor esté caído** — significa que el firewall funciona. La medición equivalente se hace ahora *dentro* del VPS, contra el loopback:
> ```bash
> ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 \
>   "curl -sk -H 'Host: <dominio>' https://127.0.0.1/"
> ```
> Y para atribuir un dominio a un servidor (qué máquina atiende de verdad), la única prueba fiable con todo tras el proxy es la **sonda con testigo**: lanzar `curl -A "marca-unica" https://<dominio>/` y buscar esa marca en `/var/log/nginx/access.log` del origen candidato.

| Dominio | Resuelve a | Origen real | Qué sirve |
|---|---|---|---|
| solucionesconia.cl · `www` | Cloudflare | `161.35.85.101` | estático en `/var/www/solucionesconia.cl` |
| admin.solucionesconia.cl | Cloudflare | `161.35.85.101` | proxy a `127.0.0.1:3001` (zasa-orchestrator, PM2) |
| vip.solucionesconia.cl | Cloudflare | `161.35.85.101` | estático en `/opt/agencia/public/vip` + `/api/vip/` al orquestador |
| elrincondedonselso.cl · `www` | Cloudflare | `161.35.85.101` | estático + `/api/` a `127.0.0.1:3000` (elrincon-backend, PM2) |
| examenfacil.cl · `www` | Cloudflare | `161.35.85.101` | PHP |
| gambusaschile.cl · `www` | Cloudflare | `161.35.85.101` | PHP |

> 🟢 **El droplet de 1 GB `161.35.157.69` está FUERA DE SERVICIO** (consolidado en el 4 GB el 2026-09-07). Comprobado: puertos 22, 80, 443 y 3001 **cerrados**, sin respuesta por ninguna vía, y sin una sola referencia a esa IP en configuración viva del VPS. Versiones anteriores de esta tabla lo daban como origen de solucionesconia.cl; ya no lo es. Si algo apunta ahí, está roto por definición, no «pendiente de migrar».

**Ningún dominio del workspace resuelve ya directo a una IP de origen.** Una versión anterior de esta tabla decía que los dos primeros iban «VPS directo»; era cierto hasta que se metieron tras el proxy, y esa afirmación desfasada convertía la comprobación de la IP en una pista falsa. Para cualquiera de ellos, la IP pública que devuelva `curl` es la de Cloudflare y no dice nada sobre qué servidor atiende.

**Y desde el 2026-09-07 el origen solo acepta 80/443 desde los 22 rangos CIDR de Cloudflare** (`ufw`, 15 IPv4 + 7 IPv6; el 22 sigue abierto). No hay forma de llegar al origen saltándose el proxy, ni siquiera para depurar.

- Acceso: `ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101`
- Server blocks en `/etc/nginx/sites-available/`
- elrincondedonselso.cl: web root `/var/www/elrincondedonselso.cl`; backend Node en :3000 vía PM2, expuesto como `/api/`; webhook de auto-deploy `/gh-webhook` (:9000)
- Portal de Jose: repo en `Workspace_Agencia\privado_agencia\Clientes\Jose`, se despliega por GitHub Actions a `/var/www/elrincondedonselso/public/jose`, servido en `/jose/` mediante symlink desde el web root, protegido con Basic Auth (`/etc/nginx/.htpasswd_jose`)
- Capítulos 4-11 y todos los `.md` de Elrincon devuelven 404 en producción (decisión de auditoría — siguen en el repo)

### Despliegue del backend de pagos (`/opt/elrincon-backend`)

**Se despliega con `git pull`, no con `scp`.** Este documento dijo lo contrario hasta el 2026-09-04; `/opt/elrincon-backend` es un **checkout de git**, con `origin` en `git@github.com:jaimefaena-max/elrincon-backend.git` por SSH y una Deploy Key **de solo lectura**.

Que sea de solo lectura fija el sentido del flujo: el VPS **trae** cambios, nunca los sube. Commit y push se hacen siempre desde local; en el servidor no se edita código ni se commitea, porque ese commit no tendría a dónde ir.

Vía normal — commit y push desde local, y traerlo en el VPS:

```bash
# local
git add -A && git commit -m "…" && git push
# VPS
ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101
cd /opt/elrincon-backend
git pull --ff-only && npm install --production && pm2 restart elrincon-backend --update-env
pm2 logs elrincon-backend --lines 20 --nostream
```

**Por qué `scp` está prohibido aquí, y no es una cuestión de estilo.** En ese directorio conviven el código y **cinco ficheros con datos reales de clientes**: `entregas.json`, `compras.json`, `canjes-directos.json`, `limites.json` y `reenvios-manuales.json`. Un `scp -r` o un `rsync` del directorio los machaca con las copias de desarrollo del portátil, y ahí se pierde el registro de quién ha pagado. No hay base de datos detrás: esos ficheros **son** la base de datos.

Los cinco están en el `.gitignore` del repo y **no versionados**, precisamente para que `git pull` no pueda tocarlos. El `.env` con las credenciales reales de Mercado Pago y Resend tampoco se versiona y vive solo en el VPS. Comprobación antes de cualquier despliegue:

```bash
cd /opt/elrincon-backend && git check-ignore -v entregas.json compras.json canjes-directos.json limites.json reenvios-manuales.json .env
```

Si alguno dejara de aparecer en esa lista, **parar**: significa que se ha colado en el índice de git y el siguiente `pull` puede sobrescribirlo.

Antes de desplegar, respaldar esos seis ficheros (los cinco libros + `.env`) en `/root/backups-elrincon-backend/<fecha>/`. Es lo único irrecuperable: el código sale de git y `node_modules` de `npm install`.

Rollback: `git checkout <sha-anterior> && pm2 restart elrincon-backend`.

> Nota sobre desplegar por `scp` en general: además de este riesgo, ensucia el árbol de trabajo y hace fallar el `pull` siguiente. Vale también para el web root de elrincondedonselso.cl, que se despliega por webhook.

## Protocolo Golden Standard (reglas de la casa)

- Nunca tocar nginx sin backup previo del server block + `nginx -t` antes de `reload`
- Permisos en el VPS: directorios 755, archivos 644
- Nada de secretos en logs ni en el web root; el backend vive fuera del web root (`/opt/elrincon-backend`)

## Protocolo de Inicio de Sesión (OBLIGATORIO)

Ante **cualquier saludo** de Jaime ("hola", "buenas", "buenos días", "qué tal", "arrancamos"…) o cualquier pedido de estado, ejecutar **de inmediato y sin pedir permiso** la skill `/inicio-sesion` (en `.claude/skills/inicio-sesion/`). No esperar a que Jaime lo pida ni preguntar si quiere el resumen.

La skill corre `workspace-status.ps1`, que escanea **autónomamente** los 6 repos (rama, cambios sin commitear, ahead/behind, último commit) y la salud de los **7 endpoints de producción** (~8 s), lee las memorias, y entrega un **Resumen Ejecutivo del Estado Operativo** con cuatro bloques: (1) estado operativo con semáforo, (2) dónde quedamos, (3) bloqueadores activos con su vía de desbloqueo, y (4) plan inmediato priorizado **por cercanía a producción**.

Regla central del diagnóstico: separar siempre **repo / remoto / producción**. Un repo limpio y sincronizado NO significa desplegado — en este workspace la landing y el widget se despliegan a mano. Nombrar el **drift** explícitamente. Cuando una memoria choque con la salida del script, gana el script.

## Protocolo de Cierre de Sesión

Cuando Jaime indique que cerramos la sesión, ejecutar la skill `/cierre-sesion` (en `.claude/skills/cierre-sesion/`): mide el tiempo real trabajado desde el transcript (activo vs total, gaps >15 min descartados), audita tareas por proyecto (finalizadas/en ejecución/pendientes con % de avance anclado a evidencia git), calcula el costo (tiempo activo × $35.000 CLP/h) y publica la entrada en `zasa-orchestrator/src/data/telemetry.ts` → push → auto-deploy → dashboard en admin.solucionesconia.cl. Sin ingreso manual de Jaime.

## Notas para Claude

- `C:\TRAMITE JUZGADO` (en la raíz del disco) es material personal de Jaime: no leerlo, no moverlo, no incluirlo en búsquedas.
- Si un movimiento/renombrado de carpetas falla con "archivo en uso", suele ser una shell PowerShell huérfana de una sesión anterior de Claude Desktop con su CWD dentro de la carpeta: identificarla con `handle64.exe` (Sysinternals), verificar que no es la shell propia (`$PID`) y cerrarla.
