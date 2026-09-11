# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-11-a

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Fuente de verdad de la llave GPG: `STATE.md` (nota de cabecera del 2026-09-11) y la
> memoria `gpg-clave-nueva-9632DDAB-estado`. Este fichero **no** los reemplaza.

---

## 1. Qué se cerró — rotación GPG completa y auditoría 100 %

Sesión de 64 min activos sobre infraestructura, sin código de producto. Todo
verificado extremo a extremo, no «escrito»:

| Paso | Evidencia |
|---|---|
| Clave «Backup Zasa» `9632DDAB…67B8FFF0` **sin S2K**: blob AES-256 + shards 2-de-3 verificados dos veces (3 parejas, shard aislado rechazado, descifrado real **sin passphrase**); `~/zgn` destruido | `~/.zasa-shards/` · sha256 `9d9d2448…` / `098a477c…` / `150bb39f…` / `ae36ba9b…` |
| Juego **duplicado** de la clave nueva (carpeta mal llamada `clave-vieja-…`, generación 17:12) destruido con `shred` | 13 ficheros, oficiales intactos por `sha256sum -c` |
| VPS cifra a la clave nueva desde **21:54 UTC**: pública en `/root/.gnupg`, `RECIPIENT` en los 3 scripts, prueba manual rc=0, keyid `1244E251EABC3365` en `--list-packets` | `/usr/local/bin/{elrincon-json-backup,zasa-secure-backup,backup-dbs}.sh` · copias en `/root/backups-scripts/20260911-rotacion-gpg/` |
| Fase D **preparada**: un `.tar` por fragmento en `~/.zasa-shards/entrega/`, `DISTRIBUCION.md` y `RESTORE.md` reescritos para la clave nueva | tabla de custodias `_por rellenar_`, **0 entregas** |
| Auditoría 100 %: repos sin secretos (historial incluido), CI `84fa811` en verde y = HEAD en el VPS, VPS sin Docker con internos en loopback y ufw solo Cloudflare, admin. y vip. con TLS/HSTS y 401/403 en toda la API sin sesión | memoria `auditoria-cierre-2026-09-11` |
| Repo raíz: `f97981f` (STATE.md + `.gitignore` con `zasa-shard-*.tar`) · telemetría `2026-09-11-a` → `452f7a0`, **publicada y verificada** en `/health` | `origin/main` en ambos |

## 2. Qué quedó a medias

- **Fase D — reparto de los shards (45 %).** Solo Jaime puede hacerlo: elegir la
  custodia 1, copiar `entrega/zasa-shard-1.tar` al soporte físico, verificar el
  `sha256sum` **en destino**, borrar el `.tar` y `shard-1.txt` locales, pasar la
  fila a 🟢 en `DISTRIBUCION.md`. Luego 2 y 3, en momentos distintos. Nunca los
  tres en un paquete; nunca marcar «entregado» sin verificar en destino.

## 3. Trampas descubiertas (no volver a tropezar)

1. **Restaurar en Windows (GnuPG 2.4.9):** recién importada, la subclave da
   `Bad secret key` (0/6). Hace falta `gpg --export-secret-keys <FPR> >/dev/null`
   (o una firma) antes de descifrar (3/3). Está en `RESTORE.md` como paso obligatorio.
2. **La clave vieja `8F82F64B` ya no tiene respaldo soberano**: sus shards se
   sobrescribieron el 11-sep; vive solo en `~/.gnupg` del portátil con su passphrase.
   Es la única que abre los respaldos anteriores al 11-sep 21:54 UTC, hasta que la
   retención de 30 días los purgue (~11-oct). No borrar ese llavero.
3. `gh` **no está instalado**; la API REST con el token de `git credential fill` sirve.
4. Los «1.700 errores» diarios de `nginx error.log` son sondas de bots a rutas
   inexistentes; los 40 `err` del journal son escáneres SSH. No son incidentes.

## 4. Hallazgos menores abiertos (tarea `cockpit-hardening-perimetro-pendiente`)

`/api/sales-agent/tenants` público lista IDs de clientes · sin CSP ni
Permissions-Policy en admin./vip. · nginx sin `set_real_ip_from` de Cloudflare ·
locations `/api/vip/` y `/widget/` en admin. responden 404 · VPS con 59 paquetes
apt y **reinicio pendiente**.

Higiene aparte: `Workspace_Agencia\privado_agencia\Clientes\Jose` tiene documentos
de identidad **sin rastrear** dentro de un directorio git. No se tocaron.

## 5. Paso exacto siguiente

**Reparto del fragmento 1 (fase D)** — acción física de Jaime, ver §2. Mientras
tanto, lo automatizable de mayor valor es cerrar `/api/sales-agent/tenants` (una
guarda o retirar la ruta) y programar la ventana de reinicio del VPS.
