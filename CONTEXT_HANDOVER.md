# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-09

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Fuente de verdad de la llave GPG: `STATE.md`. Este fichero **no** lo reemplaza.

---

## 1. Infraestructura — VPS `161.35.85.101` (`zasa-server-restaurado`)

**Loopback estricto, simétrico en los dos servicios.** Estado verificado al cierre:

| Servicio | Binding | PM2 | Expuesto por |
|---|---|---|---|
| `elrincon-backend` | `127.0.0.1:3000` | online | nginx → `/api/` de elrincondedonselso.cl |
| `zasa-orchestrator` | `127.0.0.1:3001` | online | nginx → admin.solucionesconia.cl (401 Basic Auth) |

`zasa-orchestrator` escuchaba en `0.0.0.0:3001` hasta hoy. Corregido en el **código**
(`src/server.ts`: `host = process.env.HOST || '127.0.0.1'`), commit `f0f5b5e`, desplegado
por server-pull y verificado con `ss -tulpn`. `HOST` queda como override explícito.

> ⚠️ Al verificar un deploy de `zasa-orchestrator`, esperar a que PM2 reinicie: el
> `git pull` termina antes que el `pm2 reload`. Un `ss` lanzado en medio muestra el
> binding **viejo** y parece un fallo. Comprobar `pm2 describe … | grep uptime`.

**Purga de secretos en disco (irreversible, `shred -u`):** 7 ficheros `.env*` de
respaldo eliminados — 1 en `/opt/elrincon-backend/backups/` y 6 en
`/root/backups-elrincon-backend/`. Contenían `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`
y `RESEND_API_KEY` en claro, anteriores a la rotación.

**Respaldos reubicados:** `/opt/elrincon-backend/backups/` → `/root/backups-elrincon-backend/`
(dir `700`, ficheros `600`), como manda `CLAUDE.md`. El directorio de despliegue ya no
contiene respaldos. Los cinco libros de datos y el `.env` vivo quedaron intactos y siguen
correctamente ignorados por git.

🔴 **Punto ciego que queda abierto.** El destino ya existía con contenido y el `mv` corrió
sin `-n`: no se capturó el listado previo, así que si algún fichero pisó un homónimo, no
hay forma de saberlo. Sin impacto conocido; anotado para no dar por auditado ese árbol.

---

## 2. Repositorios — topología formalizada

**Es un POLIREPO**, no un monorepo: 12 repos de git independientes bajo una carpeta común.
Ningún despliegue lee de rutas locales — DO App Platform y el server-pull clonan del remoto
GitHub de cada repo. La topología completa y sus tres reglas están ahora en `CLAUDE.md`
(sección «Topología del workspace»).

Cambios de layout ejecutados hoy:

- `full_backup_.sql` + `sites_files_backup.tar.gz` (608 MB) → `Workspace_Agencia\vault\backups-locales\`,
  con contra-excepción en el `.gitignore` raíz. Sin ella, la excepción `!vault/` los habría
  re-incluido y un `git add -A` habría intentado commitear un dump con datos reales de clientes.
- `Workspace_Agencia\zasa_shared\` eliminado (placeholder con solo un README, sin referencias).
- `tools\gpg-backup\` **NO se movió**, decisión deliberada. Está versionado en el repo raíz;
  moverlo bajo `Workspace_Agencia\` lo sacaría del control de versiones en silencio, y
  `shamir.pl` es necesario para restaurar. Congelado hasta que cierre la Fase D.

Estado de git al cierre — **todo limpio y sincronizado**:

| Repo | HEAD | Estado |
|---|---|---|
| `agencia-root-orchestrator` (raíz) | `53bdb5a` | pusheado a `origin/main` |
| `zasa-orchestrator` | `f0f5b5e` | pusheado, desplegado y verificado |
| Los otros 10 | sin cambios | limpios |

---

## 3. Siguiente paso — Fase D (Shamir / `gpg-backup`)

**No es el primer paso.** El orden real está en `STATE.md` → «Siguiente paso pendiente»:

0. 🔴 **BLOQUEANTE — regenerar el blob sin protección S2K propia.** Decidido el 2026-09-08
   (opción 2). Hasta ejecutarlo, los 2-de-3 **no recuperan nada por sí solos**: reconstruyen
   el blob pero no lo descifran. Procedimiento en `~/.zasa-shards/REGENERAR.md`.
   **Lo ejecuta Jaime** — requiere su passphrase, un asistente no puede.
1. 🔴 **Fase D — repartir los shards, DESPUÉS del paso 0.** Los tres siguen en
   `~/.zasa-shards` de este portátil; mientras sigan juntos el umbral no protege de nada.
   Repartirlos antes del paso 0 daría a los custodios una capacidad de restaurar que no tienen.

⛔ **Los shards nunca por el canal del asistente.** Mostrar uno en el chat lo convierte en
custodia permanente y obliga a regenerar el juego entero (ya pasó el 2026-09-06).

### Otros pendientes, por cercanía a producción

1. **Verificar si los `MP_ACCESS_TOKEN` purgados siguen vivos en Mercado Pago.** Rotar en el
   panel **no revoca** el token anterior. Los respaldos se destruyeron, pero si esos tokens
   nunca se revocaron, siguen siendo credenciales válidas fuera de nuestro control.
2. **`config_secret.example.php` de ExamenFácil** sigue sirviéndose con 200 — falta el deny
   en nginx. Es lo último abierto de esa auditoría.
3. **3 acciones de panel** (DO / Cloudflare) que solo puede hacer Jaime.

---

## 4. Nota de cierre

La skill `/cierre-sesion` **no se ejecutó** en esta sesión: no se midió el tiempo activo ni se
publicó la entrada de telemetría en `zasa-orchestrator/src/data/telemetry.ts`. La última
entrada del dashboard sigue siendo `2026-09-07-a`. Si esta sesión debe facturarse, hay que
correr la skill o reconstruirla desde el transcript (el método está en la memoria
`telemetria-rincon-04sep-sin-registrar`).
