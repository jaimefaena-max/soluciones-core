# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-23-a (webhook de leads, CSP del widget, auditoría de datos del Portal VIP)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memorias de arranque: `arranque-2026-09-24` (este estado) y `csp-vip-bloquea-style-inline-shadow` (trampa nueva).
> Hand-off anterior (2026-09-22-b, hardening Zero Trust del VPS): en el historial de este fichero (`5ef9a95`).
> Sesión del 2026-09-23 22:06 UTC al 2026-09-24 04:46 UTC: **278,3 min activos** de 399,1 totales, **$162.342 CLP**.
> Telemetría **publicada** (`zasa-orchestrator` `2c529b1`, entrada `2026-09-23-a`).

---

## 0. Qué se cerró — todo verificado en producción (VPS, sondas, navegador con CSP real)

| Frente | Estado | Evidencia |
|---|---|---|
| **Webhook de leads de Sofía** | ✅ | `POST /api/webhook/leads` (hook global + guard `API_SECRET_TOKEN`), tabla `leads_sofia`, correos Resend, emisor con Bearer solo a hosts propios, `location` nginx sin Basic Auth. `zasa-orchestrator` `0e58e64` + `20526d8`, tag **`v2.5.0-webhook-leads`**. E2E en prod: 200 / 401 / 401 / 405; fila de prueba borrada |
| **`.sql` público en ExamenFácil** | ✅ | `esquema_db.sql` daba 200 → 403 (vhost + `--exclude` en deploy). `examenfacil-cl` `f4c489d` |
| **Widget de Sofía sin estilos en vip.** | ✅ | **Causa raíz: CSP `style-src 'self'` bloqueaba el `<style>` del shadow root** (desde `e96a2ee`, 22-sep). Arreglo `adoptedStyleSheets` `c89a8fa`; Jaime confirmó a la vista. Antes se tocó el host (fixed, `document.body`, pointer-events: `d5bfad7` `de6182d` `6e38e6c` `c35e280`) — inocuo, no era la causa |
| **Auditoría de datos del Portal VIP** | ✅ H1 H2 H3 H5 H6 | `admin_solucionesconia/docs/auditoria-datos-admin.md`. H1 2FA falso `ed27eb2` · H2 aviso demo `cb97761` · H3 Auditoría → `GET /api/admin/auditoria` `5699203` · H5 código muerto (−1.025 líneas) `d1ec264` · H6 Plantillas `2dd0683`. Además Webhooks reales `f5dd61c` `f03f6da` y AuditLogger sin eventos inventados `df1f90c` |

**Repos al cierre:** `admin_solucionesconia`, `zasa-orchestrator` y raíz limpios y `= origin/main`.
`examenfacil-cl` conserva `api_handler.php` e `index.html` modificados **que no son de esta sesión** (ya estaban el 22-b).
`AuditorLegal` tiene 3 cambios sin commitear, tampoco de esta sesión.

---

## 1. Paso exacto para arrancar

🔴 **Bloqueado por Jaime (panel de Cloudflare):** rotar el token **`cfut_`** filtrado el 22-sep. **Sigue vivo en
producción**: misma huella sha256 (`8c488bd6`) que `CLOUDFLARE_API_TOKEN` en `/opt/solucionesconia/.env`, que usa
`deploy.sh` de la landing. Pasos: crear token nuevo con los mismos permisos → escribirlo Jaime en ese `.env` (nunca
por el chat) → revocar el viejo → borrar las 2 líneas con `cfut_` de `/root/.bash_history`. Después Claude verifica
por huella que ya no es `8c488bd6`.

---

## 2. Cola (por cercanía a producción)

0. **Acciones de Jaime:**
   - Vaciar de la Papelera de Windows los ficheros sensibles: `full_backup_.sql` (volcado clínico en claro),
     `.env.test`, `config_secret.php`, `do-env-vars`, `.env.forte-invitacion`, `agencia-solucionesconia-77b2fe2662ad.json`.
   - Confirmar `SALES_WEBHOOK_URL=https://admin.solucionesconia.cl/api/webhook/leads` en `/opt/zasa-orchestrator/.env`
     (dijo haber configurado nginx/PM2; la variable **no se verificó**). Claude puede comprobarlo sin imprimir valores.
   - Abrir **Auditoría** en vip. con sesión de admin: debe mostrar `sesion.iniciada` y `gestion.auditoria.ver` reales.
   - Limpiar el E2E del 22-b: prospecto `delivered@resend.dev` en `prospectos` y el evento «Pedro Prueba Ficticia» (28-sep 09:00).
1. **H7** — el widget del Portal VIP se monta sin `tenantId`. Decidir primero qué identidad corresponde en el portal
   del equipo (quizá la genérica es la correcta y se cierra sin código).
2. **H8** — prueba automatizada: build de producción + CSP real + fallo ante `securitypolicyviolation`.
3. **H4** — `/api/integrations/keys` sirve claves `sk_live_…` estáticas (rotuladas `provisional`); falta almacén real.
4. **H2 de fondo** — conectar Uptime/Analíticas/Retención/Errores a fuentes reales y retirar `AvisoDatosDemo`.
5. Heredado del 22-b, sin tocar hoy: túnel `cloudflared` y `127.0.0.1` fuera de `set_real_ip_from`; `elrincon-backend`
   en Node 18 EOL y Postgres como superusuario; receta manual de plantillas que aún crea `.bak` en `sites-available`;
   `sincronizar-secretos-borde.sh` sin `vip-portal.conf`; MVG pilares 3 y 4; GambusasChile CI con huella obsoleta.
6. `zasa-orchestrator/package.json` dice `2.4.0` y el tag es `v2.5.0` (la release anterior tampoco lo alineó).
7. Telemetría de las sesiones **09-16-b y 09-22-a** sigue sin reconstruir (el dashboard salta de 09-16-a a 09-22-b).

---

## 3. Trampas nuevas (no volver a tropezar)

1. **El dev server de Vite no aplica la CSP de vip.** Todo cambio visual del Portal VIP se verifica con build de
   producción + `<meta>` CSP idéntica + `vite preview` (preview `widget-preview` sirve `dist/`; config temporal con
   `mergeConfig` e `input` al arnés; regenerar `dist/` real al acabar). Con contraprueba.
2. **Compuerta del widget en `deploy-vip.yml`:** tocar `salesAgentWidget.css` obliga a regenerar y commitear
   `public/widget/vendedor-ia-v17.js` (`npm run build:widget`, token de `.env.production`); si no, el deploy se bloquea
   en silencio y producción se queda en el build anterior.
3. **El CSS servido está minificado:** `top/right/bottom/left` salen como `inset:…`. Buscar la forma minificada.
4. **ripgrep no ve `Workspace_Agencia/*` ni `Workspace_Clientes/*`** desde la raíz: el `.gitignore` raíz los excluye.
   Usar `grep -r` con `--exclude-dir`.
5. **El clasificador bloquea `curl` a `/health` desde local** (motivo «TLS/Auth Weaken»). Verificar por SSH en loopback.
6. **`gh` no está instalado** y el repo es privado: el estado de Actions se infiere en el VPS (fechas de `index.html`,
   nombre del chunk = hash de contenido idéntico al build local).
7. **Sondas lanzadas en el mismo SSH que un `nginx reload`** ven workers viejos (dan el estado anterior). Esperar 1–2 s.
8. **Un GET a `/api/admin/auditoria` escribe `gestion.auditoria.ver`**: nada de sondeo periódico sobre ese endpoint.

---

## 4. Secretos

- Ningún valor pasó por el chat. `API_SECRET_TOKEN` se leyó solo dentro del VPS y entró en `curl` por stdin; la
  conexión a Postgres se hizo con `dotenv` + `pg` del propio orquestador, sin la cadena en argumentos.
- `cfut_` comprometido y **vivo** (ver §1).
