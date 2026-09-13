# CONTEXT HANDOVER — Workspace ZASA · sesión 2026-09-12-c (cierra el ciclo a/b/c)

> Hand-off para retomar sin releer el transcript. Abrir Claude Code en `C:\Proyectos`.
> Memoria de arranque: `arranque-2026-09-13`. Fuente de verdad de la llave GPG: `STATE.md`.
> Telemetría publicada y verificada en `/health`: `2026-09-12-a` (453,8 min), `-b` (28,1), `-c` (324,4 · $189.233).

---

## 1. Qué se cerró en este ciclo (todo verificado en producción)

| Frente | Evidencia |
|---|---|
| **Escritura de cobros** `/api/admin/cobros*`: guard admin antes del esquema ajv, hook anti-coerción (`amount:null` creaba $0), pago atómico, 409 por UNIQUE; 35 tests de rutas | `9b379d7`, `be65727`, `de76ea3` |
| **Cockpit**: BillingManager real (lista/crea/paga), mock retirado, puerta `SoloAdmin` (sin rol admin no se monta ni se descarga el chunk) | `admin_solucionesconia` `0abb5a5`…`7bac675`, dist sha256 27/27 |
| **Portal del cliente**: WidgetCobros con «Pagar» (delegación, anti doble POST, redirección estricta) | `c4adee8`, `62d88a1`; 20 tests DOM |
| **Mercado Pago Checkout Pro**: preferencia real en el intent + webhook firmado HMAC + conciliación; 200 `simulacion_capturada` para ids ficticios, 502 solo fallos reales; validación de forma del token (rechaza la public key) | `c96c365`…`b4d78dd`; 16 tests; staging 25/25 |
| **Activación en producción** (Jaime, `/root/activar-mp.sh`, 13-sep 04:03Z): Access Token real + secreto; `/users/me` 200; webhook firmado 200; preferencia real creada (init_point vivo) | audit_log: `simulacion_capturada`, `intento_pago.creado` |
| **Incidente «No pudimos cargar tu estado de cuenta»**: nginx no proxyaba `/api/vip/` en solucionesconia.cl → 404. Corregido; snippet versionado (`nginx/vip-portal.conf.plantilla`) + `verificar-portal.sh --pre/--post` en `deploy.sh`; robot 45/45 | `Agencia_Solucionesconia` `4effe92`, `zasa-orchestrator` `7b19c1d` |
| FAC-2026-0101 editada: emisión = vencimiento **20-09-2026**, $30.000 CLP, periodo mensual en el concepto (respaldo de la fila en `backups/`) | audit `facturacion.cobro.editado` |
| Limpieza de cierre: 0 procesos node huérfanos (portátil y VPS), 0 túneles, temporales borrados; `/root/activar-mp.sh` se conserva a propósito | — |

Suite del orquestador: 50 ficheros · 938 tests · typecheck/lint 0. Todos los repos limpios y en `origin/main`.

## 2. Paso exacto siguiente (solo Jaime)

Registrar `https://vip.solucionesconia.cl/api/pagos/mp/webhook` (evento **Pagos**, modo productivo) en el panel de
Mercado Pago y pulsar **Simular** → en `audit_log` debe aparecer `pagos.webhook.simulacion_capturada` (200).
Luego un pago desde «Pagar» en el portal de FORTE deja `FAC-2026-0101` en `paid` por el webhook.
⚠ El token cargado es de **producción**: un pago mueve dinero real. Sandbox = `activar-mp.sh` con `TEST-…`.

## 3. Cola

1. **El Rincón (real, no de esta sesión):** `MP_WEBHOOK_SECRET` de `/opt/elrincon-backend/.env` no firma las
   notificaciones genuinas de MP (pagos 175009197025 / 176785034258 rechazadas con 401 el 11 y 12-sep) → copiar la
   clave vigente del panel de la app de El Rincón y `pm2 restart elrincon-backend`. Código y 119 tests correctos.
2. Recurrencia mensual: no existe motor; cada mes → Cockpit → Facturación → «Nuevo cobro». FAC-2026-0101 se verá
   «Vencido» desde el 21-09 hasta pagarse (emisión = vencimiento, tal como se pidió).
3. Certificado de revocación GPG fuera del portátil · shard viejo de Francisco · `uuid` vía `googleapis@140` · ufw 22 duplicado.

## 4. Trampas (no volver a tropezar)

1. `fetch` de Node descarta `Host` → sondas por loopback con `https.request` + `servername` o `curl -H Host`.
2. Probar el portal por **solucionesconia.cl**, no por vip.: los E2E por vip. no vieron el 404 del proxy.
3. **Public Key ≠ Access Token** de MP (UUID de 44 chars → 401 en toda la API); el servicio y el script ya la rechazan.
4. En Windows `app.kill()` no mata el árbol de `tsx`: `taskkill /T` (o quedan orquestadores huérfanos en 3199).
5. `/etc/nginx/snippets/vip-portal.conf` ya no se edita a mano: `deploy.sh` de la landing lo regenera de la plantilla.
6. VPS: node del sistema v18, PM2 usa `/opt/node20`; scripts temporales con `require` por ruta absoluta.

## 5. Secretos

Ninguno pasó por el chat. Los de Mercado Pago entraron por prompt oculto (`read -rs`) en el VPS; el token nunca se
imprime (solo prefijo/longitud) y los mensajes de error de MP se enmascaran. `.env` 600 root:root.
