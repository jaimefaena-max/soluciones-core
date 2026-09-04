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
| `Workspace_Clientes\Elrincon-backend\` | `elrincon-backend` | Microservicio de pagos y acceso de El Rincón (Node `http` nativo + SDK Mercado Pago, sin Express). **No tiene pipeline**: `scp` a `/opt/elrincon-backend` + `pm2 restart` | `/api/` de elrincondedonselso.cl |
| `Workspace_Clientes\Elrincon-qa\` | `Elrincon-qa` | Suite E2E del embudo de El Rincón (Playwright, 8 pruebas en ~15 s): muro de pago, precio y navegación. `cd Elrincon-qa && npm test` | — (local / CI) |
| `.` (raíz `C:\Proyectos`) | `agencia-root-orchestrator` | Repo de respaldo/orquestación de la raíz del workspace (`.gitignore` endurecido que excluye repos anidados, secretos y datos de clientes). Creado 2026-09-02 | — (meta / respaldo) |
| `.claude\` | `claude-skills` | Skills, agentes y tooling de Claude Code del workspace (incluye `/inicio-sesion`, `/cierre-sesion` y `workspace-status.ps1`) | — (local / tooling) |

## Infraestructura compartida

El VPS DigitalOcean es **`161.35.85.101`**, hostname `zasa-server-restaurado` (Ubuntu 24.04, nginx 1.24). Sirve **elrincondedonselso.cl y gambusaschile.cl**; el resto de dominios NO está aquí.

> ⚠️ **La IP cambió (verificado 2026-09-04).** La anterior, `159.223.213.237`, está muerta: no responde en ningún puerto, ni siquiera el 443. Si un `ssh` da `Connection timed out`, la primera comprobación **no** es el firewall ni la llave — es a dónde resuelve el dominio ahora:
> `curl -s -o /dev/null -w '%{remote_ip}\n' https://elrincondedonselso.cl/`
> Si esa IP no coincide con la de aquí, este documento está desfasado otra vez.

| Dominio | Dónde vive |
|---|---|
| elrincondedonselso.cl | `161.35.85.101` (VPS directo) |
| gambusaschile.cl | `161.35.85.101` (mismo VPS) |
| solucionesconia.cl · admin.solucionesconia.cl | detrás de Cloudflare |
| examenfacil.cl | detrás de Cloudflare |

Para los que están tras Cloudflare, la IP que devuelve `curl` es la del proxy, **no** la del origen.

- Acceso: `ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101`
- Server blocks en `/etc/nginx/sites-available/`
- elrincondedonselso.cl: web root `/var/www/elrincondedonselso.cl`; backend Node en :3000 vía PM2, expuesto como `/api/`; webhook de auto-deploy `/gh-webhook` (:9000)
- Portal de Jose: repo en `Workspace_Agencia\privado_agencia\Clientes\Jose`, se despliega por GitHub Actions a `/var/www/elrincondedonselso/public/jose`, servido en `/jose/` mediante symlink desde el web root, protegido con Basic Auth (`/etc/nginx/.htpasswd_jose`)
- Capítulos 4-11 y todos los `.md` de Elrincon devuelven 404 en producción (decisión de auditoría — siguen en el repo)

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
