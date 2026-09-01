# Workspace de Jaime — C:\Proyectos

Espacio de trabajo centralizado con 6 proyectos que se referencian entre sí. Abrir Claude Code siempre en `C:\Proyectos`.

## Proyectos

| Carpeta | Qué es | Producción |
|---|---|---|
| `Workspace_Agencia\Agencia_Solucionesconia\` | La agencia (landing, assets). Los clientes viven en `Clientes\` (Jose, _Plantilla_Portal_SPA) | solucionesconia.cl |
| `Workspace_Clientes\Elrincon\` | Libro web "El Rincón de Don Selso": 11 capítulos + epílogo en HTML estático puro. El backend de pagos NO está aquí: vive en el repo hermano `Elrincon-backend\` | elrincondedonselso.cl |
| `Workspace_Clientes\ExamenFacil\` | Plataforma ExamenFacil | examenfacil.cl |
| `Workspace_Clientes\AuditorLegal\` | Web estática con `api_handler.php` | — |
| `Workspace_Agencia\zasa-orchestrator\` | Orchestrator Fastify+TS (Cockpit ZASA + telemetría `src/data/telemetry.ts`). Deploy: push → DO App Platform | admin.solucionesconia.cl |
| `Workspace_Clientes\GambusasChile\` | E-commerce de carnada de pesca (gambusas **curadas en sal / deshidratadas**, seleccionadas, se despachan congeladas — NO son vivas). PHP nativo, Resend/MercadoPago por cURL puro, Bóveda de Titanio. Repo: `github.com/jaimefaena-max/gambusaschile` | gambusaschile.cl (live, HTTPS) |
| `Workspace_Clientes\Elrincon-backend\` | Microservicio de pagos y acceso de El Rincón (Node `http` nativo + SDK Mercado Pago, sin Express). **No tiene pipeline**: `scp` a `/opt/elrincon-backend` + `pm2 restart` | `/api/` de elrincondedonselso.cl |
| `Workspace_Clientes\Elrincon-qa\` | Suite E2E del embudo de El Rincón (Playwright, 8 pruebas en ~15 s): muro de pago, precio y navegación. `cd Elrincon-qa && npm test` | — (local / CI) |

## Infraestructura compartida

Los tres dominios se sirven desde **un mismo VPS DigitalOcean**: `159.223.213.237` (Ubuntu 24.04, nginx 1.24).

- Acceso: `ssh -i ~/.ssh/elrincon_deploy root@159.223.213.237`
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
