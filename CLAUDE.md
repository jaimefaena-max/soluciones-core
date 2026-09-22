# Workspace de Jaime — C:\Proyectos

Espacio de trabajo centralizado con **12 repos de git** (11 proyectos + el portal privado de Jose) que se referencian entre sí. Abrir Claude Code siempre en `C:\Proyectos`.

## Proyectos

> Nota de mapeo: la columna **Carpeta** es la ruta local; **Repo GitHub** es el nombre en `github.com/jaimefaena-max/`. No siempre coinciden (p. ej. `Agencia_Solucionesconia\` → repo `solucionesconia`). Mantener ambas columnas sincronizadas para no reintroducir drift.

| Carpeta | Repo GitHub | Qué es | Producción |
|---|---|---|---|
| `Workspace_Agencia\Agencia_Solucionesconia\` | `solucionesconia` | La agencia (landing, assets, `nginx/vip-portal.conf.plantilla` y su `deploy.sh`). **Sin CI**: `deploy.sh` se lanza a mano en el VPS. El material privado de clientes NO está aquí: vive en `Workspace_Agencia\privado_agencia\Clientes\` (Jose, forte-spa, Liset Saavedra, `_Plantilla_Portal_SPA`), fuera de git salvo Jose | solucionesconia.cl |
| `Workspace_Agencia\admin_solucionesconia\` | `admin_solucionesconia` | Frontend B2B (Vite/React): la SPA del Portal VIP/Cockpit y el bundle del widget de Sofía (`public/widget/vendedor-ia-v17.js`, rastreado). El backend operativo vive en `zasa-orchestrator`. El `dist/` de la SPA se copia a mano a `/opt/agencia/public/vip` (**vip.**, no admin.) y el widget a `/opt/agencia/public/widget/` | vip.solucionesconia.cl (SPA) · admin.solucionesconia.cl/widget/ (bundle) |
| `Workspace_Agencia\privado_agencia\Clientes\Jose\` | (privado; **el clon local no tiene `origin` configurado**, rama `master`) | Portal privado del cliente Jose; su `.github/workflows/deploy.yml` lo despliega a `/var/www/elrincondedonselso/public/jose` (ver Infraestructura). Es el 12.º repo del workspace | elrincondedonselso.cl/jose/ (Basic Auth) |
| `Workspace_Clientes\Elrincon\` | `elrincondedonselso` | Libro web "El Rincón de Don Selso": 11 capítulos + epílogo en HTML estático puro. El backend de pagos NO está aquí: vive en el repo hermano `Elrincon-backend\` | elrincondedonselso.cl |
| `Workspace_Clientes\ExamenFacil\` | `examenfacil-cl` | Plataforma ExamenFacil | examenfacil.cl |
| `Workspace_Clientes\AuditorLegal\` | `auditorlegal` | Web estática con `api_handler.php` | — |
| `Workspace_Agencia\zasa-orchestrator\` | `zasa-orchestrator` | Orchestrator Fastify+TS (Cockpit ZASA + telemetría `src/data/telemetry.ts`). Deploy: push a `main` → `deploy-admin-vip.yml` (typecheck + lint + tests + escáner Zero Trust) → VPS por SSH, PM2 en `:3001` (~2 min). DO App Platform se retiró el 2026-09-07 | admin.solucionesconia.cl |
| `Workspace_Clientes\GambusasChile\` | `gambusaschile` | E-commerce de carnada de pesca (gambusas **curadas en sal / deshidratadas**, seleccionadas, se despachan congeladas — NO son vivas). PHP nativo, Resend/MercadoPago por cURL puro, Bóveda de Titanio | gambusaschile.cl (live, HTTPS) |
| `Workspace_Clientes\Elrincon-backend\` | `elrincon-backend` | Microservicio de pagos y acceso de El Rincón (Node `http` nativo + SDK Mercado Pago, sin Express). **Sin CI**, pero `/opt/elrincon-backend` **es un checkout de git**: se despliega con `git pull` + `pm2 restart`, nunca por `scp` (ver Infraestructura) | `/api/` de elrincondedonselso.cl |
| `Workspace_Clientes\Elrincon-qa\` | `Elrincon-qa` | Suite E2E del embudo de El Rincón (Playwright, 8 pruebas en ~15 s): muro de pago, precio y navegación. `cd Elrincon-qa && npm test` | — (local / CI) |
| `.` (raíz `C:\Proyectos`) | `agencia-root-orchestrator` | Repo de respaldo/orquestación de la raíz del workspace (`.gitignore` endurecido que excluye repos anidados, secretos y datos de clientes). Creado 2026-09-02 | — (meta / respaldo) |
| `.claude\` | `claude-skills` | Skills, agentes y tooling de Claude Code del workspace (incluye `/inicio-sesion`, `/cierre-sesion` y `workspace-status.ps1`) | — (local / tooling) |

## Topología del workspace (dónde va cada cosa)

Consolidada el 2026-09-09. **Esto es un polirepo, no un monorepo**: 12 repos de git
independientes que comparten una carpeta local. Ningún despliegue lee de una ruta
local — los pipelines (GitHub Actions por SSH al VPS; DO App Platform se retiró el
2026-09-07) clonan del remoto GitHub de cada repo. Mover carpetas en Windows
no rompe ningún pipeline; fusionar los `.git` sí rompería todos.

| Directorio | Qué admite | Qué NO admite |
|---|---|---|
| `Workspace_Clientes\` | Repos de clientes, uno por carpeta | Nada de la agencia; está entero en el `.gitignore` raíz |
| `Workspace_Agencia\` | Infraestructura, apps internas y la bóveda `vault\` | Ídem: excluido por hijos (`/*`), con `vault\` como única excepción |
| `tools\` | Scripts sin repo propio, versionados en el repo raíz | — |

Tres reglas que se han roto antes y cuestan caras:

1. **`tools\gpg-backup\` se queda en la raíz.** Está versionado en
   `agencia-root-orchestrator`; moverlo bajo `Workspace_Agencia\` lo mete en una
   ruta ignorada y lo saca del control de versiones sin avisar. Es el motor Shamir
   de la llave dividida y `STATE.md` documenta su ruta absoluta. La Fase D cerró el
   2026-09-12; la reubicación puede revisarse, pero sigue sin haber motivo para moverlo.
2. **`vault\backups-locales\` no se versiona.** Es la contra-excepción del
   `.gitignore`: `vault\` sí se respalda, sus volcados de producción no.
3. **Antes de reubicar cualquier carpeta, `git ls-files` primero.** Lo que ya
   rastrea el repo raíz sale del control de versiones en silencio si aterriza bajo
   `Workspace_Agencia\*` o `Workspace_Clientes\`.

## Infraestructura compartida

El VPS DigitalOcean es **`161.35.85.101`**, hostname `zasa-server-restaurado` (Ubuntu 24.04, nginx 1.24) — **origen único del workspace**, tras el proxy de Cloudflare, para los 10 hostnames de los cuatro dominios de producción (solucionesconia.cl `@`/`www`/`admin`/`vip`, elrincondedonselso.cl +`www`, examenfacil.cl +`www`, gambusaschile.cl +`www`). No queda ningún segundo servidor.

**El origen solo acepta 80/443 desde los 22 rangos CIDR de Cloudflare** (`ufw`, 15 IPv4 + 7 IPv6; el 22 sigue abierto). No hay forma de llegar al origen saltándose el proxy, ni siquiera para depurar — la IP pública que devuelva cualquier `curl` a un dominio es la de Cloudflare, nunca la del servidor.

> 🔴 **La única comprobación válida es desde dentro del VPS, contra el loopback:**
> ```bash
> ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 \
>   "curl -sk -H 'Host: <dominio>' https://127.0.0.1/"
> ```
> Para atribuir un dominio a un servidor concreto, usar la **sonda con testigo**: lanzar `curl -A "marca-unica" https://<dominio>/` y buscar esa marca en `/var/log/nginx/access.log` del origen candidato.

| Dominio | Qué sirve |
|---|---|
| solucionesconia.cl · `www` | estático en `/var/www/solucionesconia.cl` |
| admin.solucionesconia.cl | proxy a `127.0.0.1:3001` (zasa-orchestrator, PM2) |
| vip.solucionesconia.cl | estático en `/opt/agencia/public/vip` + `/api/vip/` al orquestador |
| elrincondedonselso.cl · `www` | estático + `/api/` a `127.0.0.1:3000` (elrincon-backend, PM2) |
| examenfacil.cl · `www` | PHP |
| gambusaschile.cl · `www` | PHP |

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

La skill corre `workspace-status.ps1`, que escanea **autónomamente** los 11 repos locales del polirepo (rama, cambios sin commitear, ahead/behind, último commit; el portal de Jose queda fuera porque su clon no tiene `origin`) y la salud de los **7 endpoints de producción** —incluido el Portal VIP en `vip.`— (~10 s), lee las memorias, y entrega un **Resumen Ejecutivo del Estado Operativo** con cuatro bloques: (1) estado operativo con semáforo, (2) dónde quedamos, (3) bloqueadores activos con su vía de desbloqueo, y (4) plan inmediato priorizado **por cercanía a producción**.

Regla central del diagnóstico: separar siempre **repo / remoto / producción**. Un repo limpio y sincronizado NO significa desplegado — en este workspace la landing y el widget se despliegan a mano. Nombrar el **drift** explícitamente. Cuando una memoria choque con la salida del script, gana el script.

**Antes de redactar el resumen, leer `CONTEXT_HANDOVER.md` de la raíz.** Es el hand-off
de la última sesión: qué se cerró, qué quedó a medias y con qué trampas. El bloque
«dónde quedamos» sale de ahí, no de reconstruirlo desde los commits. El resumen debe
terminar nombrando **el paso exacto siguiente** —uno solo, el primero de la cola—, no un
menú de opciones. Si ese paso está bloqueado por una acción que solo puede hacer Jaime
(passphrase, consola de DO, panel de Cloudflare), decirlo en la primera línea del bloque.

Al cerrar, `/cierre-sesion` debe reescribir `CONTEXT_HANDOVER.md` con el estado nuevo.

## Protocolo de Cierre de Sesión

Cuando Jaime indique que cerramos la sesión, ejecutar la skill `/cierre-sesion` (en `.claude/skills/cierre-sesion/`): mide el tiempo real trabajado desde el transcript (activo vs total, gaps >15 min descartados), audita tareas por proyecto (finalizadas/en ejecución/pendientes con % de avance anclado a evidencia git), calcula el costo (tiempo activo × $35.000 CLP/h) y publica la entrada en `zasa-orchestrator/src/data/telemetry.ts` → push → auto-deploy → dashboard en admin.solucionesconia.cl. Sin ingreso manual de Jaime.

## Notas para Claude

- `C:\TRAMITE JUZGADO` (en la raíz del disco) es material personal de Jaime: no leerlo, no moverlo, no incluirlo en búsquedas.
- Si un movimiento/renombrado de carpetas falla con "archivo en uso", suele ser una shell PowerShell huérfana de una sesión anterior de Claude Desktop con su CWD dentro de la carpeta: identificarla con `handle64.exe` (Sysinternals), verificar que no es la shell propia (`$PID`) y cerrarla.
