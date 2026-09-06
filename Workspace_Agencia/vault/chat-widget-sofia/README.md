# chat-widget-sofia

Asistente comercial embebible, multi-inquilino. Un `<script>` en el sitio del
cliente levanta un chat que conversa, cualifica y —si el cliente lo activa—
agenda una reunión real y registra el lead.

**Estado:** en producción desde 2026-08. Extraído de `zasa-orchestrator`
(backend) y `admin_solucionesconia` (bundle del widget).

> **Este directorio es el CONTRATO, no el código.** El código sigue viviendo en
> sus dos repos de origen; aquí está lo que hay que saber para montarlo en un
> cliente nuevo sin releer 3.000 líneas de TypeScript. Ver
> [`../ARCHITECTURE_VAULT.md`](../ARCHITECTURE_VAULT.md), sección «Modelo de extracción».

---

## 1. Forma del componente

```
Navegador del visitante              Origen (nginx)         Orquestador Fastify
┌───────────────────────┐            ┌─────────────┐       ┌───────────────────┐
│ vendedor-ia-v17.js    │ x-widget-  │ proxy_pass  │       │ /api/sales-agent/ │
│ (bundle IIFE, 1 fich.)│─── token ─▶│ + X-Edge-   │──────▶│  chat   book      │
│ token inlineado en    │  + Origin  │   Proof     │       │  config tenants   │
│ tiempo de BUILD       │            └─────────────┘       └─────────┬─────────┘
└───────────────────────┘                                            │
                                                    ┌────────────────┴──────────┐
                                                    │ registro de inquilinos    │
                                                    │ prompt · reglas · pasarela│
                                                    │ allowedOrigins            │
                                                    └───────────────────────────┘
```

Piezas y su repo de origen:

| Pieza | Origen | Qué aporta |
|---|---|---|
| `vendedor-ia-v17.js` | `admin_solucionesconia/src/vendedor-ia.tsx` + `vite.widget.config.ts` | Bundle IIFE único, sin code-splitting. El token va **inlineado en el build**. |
| Rutas + rate limit | `zasa-orchestrator/src/routes/salesAgentRoutes.ts` | Los 4 endpoints y sus límites por IP. |
| Guarda y aislamiento | `.../controllers/salesAgentController.ts` | Token, tenant fail-closed, Origin estricto. |
| Registro de inquilinos | `.../data/salesAgentTenants.ts` | Lo único que se toca al montar un cliente nuevo. |

---

## 2. Contrato de la interfaz API

Prefijo `/api/sales-agent`. Envoltorio de éxito uniforme: `{ success: true, data: … }`.
Error: `{ error: string }` con el código HTTP correspondiente.

Los cuatro endpoints están **fuera** del Zero Trust del orquestador (no llevan
Bearer) porque el widget corre en el navegador de un desconocido. Lo que los
protege es otra cosa: token estático, Origin y rate limit.

### `POST /chat` — conversación

Guarda: token · tenant fail-closed · Origin estricto. **10 req/min/IP.**

```jsonc
// Request
{
  "message":    "string",              // obligatorio
  "history":    [{ "role": "user"|"assistant", "content": "string" }],  // opcional
  "tenantId":   "slug-del-cliente",    // opcional → cae al tenant por defecto
  "session_id": "uuid-v4"              // snake_case a propósito: es el contrato HTTP
}
```

```jsonc
// 200
{ "success": true, "data": {
    "reply":        "string",
    "model":        "fast" | "advanced",
    "intent":       "faq" | "sales" | "booking" | "soporte",
    "historyCount": 0,
    "tenantId":     "slug-que-resolvio",
    "cualificado":  true,               // opcional — guardarraíl BANT (solo advanced)
    "herramientas": ["..."]             // opcional — auditoría
}}
```

`session_id` es un id de **correlación, no de autenticación**: no otorga
permisos ni identifica a una persona. Su valor está en la métrica — sin él la
bitácora cuenta *mensajes*, y `leads ÷ ejecuciones` deja de ser una tasa de
conversión para ser un número sin significado. Hoy es tolerante (un UUID
inválido se ignora en vez de responder 400) por la ventana de despliegue entre
backend y bundle; ese es el punto exacto a endurecer cuando el bundle nuevo esté
verificado en producción.

### `POST /book` — agenda una reunión real

Guarda: la misma que `/chat`. **5 req/min/IP.**

```jsonc
// Request
{ "clienteEmail": "string", "clienteNombre": "string", "fechaInicioISO": "ISO-8601" }
// 200
{ "success": true, "data": { "eventId": "string" } }
```

🔴 **Este endpoint tiene efectos irreversibles hacia fuera:** crea un evento en
Google Calendar, escribe un lead en el CRM y dispara el webhook del equipo.
Antes de la Fase 3 no validaba nada, y cualquiera podía llenar la agenda del
cliente. Si al montar un cliente nuevo dudas de alguna guarda, esta es la que no
se toca.

### `GET /config?tenantId=<slug>` — bootstrap del widget

**Público, sin token.** 60 req/min/IP. Es lo que permite que un mismo bundle
muestre la identidad correcta en cada portal.

```jsonc
{ "success": true, "data": {
    "tenantId":        "slug",
    "nombreAsistente": "Sofía",
    "reglas":          { /* servicio, ctaAgendar, correoContacto, quickPrompts,
                            objetivo, pasarela — solo datos PÚBLICOS */ },
    "routerPrompt":    "string | null"
}}
```

Devuelve `reglas` **tal cual está en el registro**: cualquier cosa que pongas
ahí viaja al navegador de cualquiera. La configuración interna (por ejemplo
`usaMatrizRubros`) vive fuera de `reglas` justamente por eso, y el
`systemPrompt` completo se omite para no inflar el payload.

### `GET /tenants` — diagnóstico

Lista los `tenantId` registrados, sin datos sensibles. 30 req/min/IP.

### Códigos de error

| Código | Cuándo | Qué significa en la práctica |
|---|---|---|
| `403 Widget no autorizado.` | falta o no coincide `x-widget-token` | las copias del token se desincronizaron |
| `403 Origen no permitido.` | el `Origin` no está en `allowedOrigins` del tenant | falta el dominio del cliente en su registro |
| `404 Tenant no encontrado.` | se declaró un `tenantId` desconocido | **fail-closed a propósito**: nunca degrada al prompt genérico |
| `429` | rate limit | la respuesta trae `retryAfterSeconds` |

---

## 3. Aislamiento entre clientes

Es la propiedad que hace este componente reutilizable, y la primera que se rompe
si se monta con prisa. Tres barreras, todas del lado del servidor:

1. **`allowedOrigins` por inquilino.** El widget del cliente A no puede invocar
   el contexto del cliente B: el `Origin` del navegador se valida contra el
   registro del tenant *resuelto*, no contra una lista global.
2. **Fail-closed ante slug desconocido.** Un `tenantId` que no existe da 404. No
   se degrada al contexto genérico: hacerlo dejaría al asistente hablando del
   negocio equivocado dentro del portal de un cliente.
3. **La pasarela de cobro se construye solo desde el tenant resuelto.** El prompt
   del modelo recibe los datos de cobro de ESE cliente y de ningún otro.

Además, la resolución del registro usa `hasOwnProperty`: un id como `__proto__` o
`constructor` jamás devuelve un objeto heredado.

---

## 4. Montar un cliente nuevo

1. **Declarar el inquilino** en `salesAgentTenants.ts`: `tenantId`,
   `allowedOrigins` (todos los dominios desde los que se sirve su portal,
   incluido el `www.`), `systemPrompt` y `reglas` (servicio, CTA, correo,
   `quickPrompts`, `objetivo`, y `pasarela` si cobra).
2. **No activar `usaMatrizRubros`** salvo que el cliente venda lo mismo que la
   agencia. Es opt-in por diseño: esa matriz describe el negocio de
   Solucionesconia, e inyectarla en el portal de un tercero es contexto cruzado.
3. **Fijar las variables** de `.env.example` en el entorno del orquestador.
4. **Recompilar el bundle** con el `VITE_SALES_AGENT_WIDGET_TOKEN` correcto.
5. **Validar:** `node scripts/validar-dependencias.mjs`.
6. **Probar el aislamiento, no solo el camino feliz:** un `Origin` ajeno debe dar
   403 y un `tenantId` inventado debe dar 404. Si alguno responde 200, el cliente
   no está aislado.

---

## 5. Trampas conocidas

- **El token vive en tres sitios.** Backend, bundle y —si lo inyecta— nginx.
  Rotarlo en el orden equivocado corta el servicio; olvidar la recompilación deja
  el bundle con el valor viejo. Ha causado tres «403 inexplicables».
- **`TRUST_PROXY=true` vacía el rate limit.** Acepta cualquier
  `X-Forwarded-For`, la IP pasa a ser falsificable y el límite de 10/min de
  `/chat` —que protege un LLM de pago— deja de contar nada.
- **`GOOGLE_CALENDAR_ID=primary` falla en silencio.** Una cuenta de servicio no
  es una persona y no tiene calendario propio: la API responde 200 y la reunión
  no existe para nadie. Aguas abajo el asistente lo comunica como «la agenda está
  completa».
- **Sin `DEEPSEEK_API_KEY` no hay error, hay degradación.** El enrutador cae a un
  clasificador heurístico local y la calidad baja sin que nada lo avise.
- **Las transcripciones son datos personales.** `MENSAJES_RETENCION_DIAS` existe
  por la Ley 19.628. Si los barridos dejan de correr, esa tabla se convierte en
  un archivo indefinido de conversaciones literales.
- **La plantilla de `.env` del orquestador miente sobre el token.** Dice que si
  `SALES_AGENT_WIDGET_TOKEN` está vacía «la guarda se salta entera». El código
  verificado hace lo contrario: responde 403 y lo registra como incidente de
  configuración. La plantilla de este Vault dice lo correcto.

---

## 6. Validación

```bash
node scripts/validar-dependencias.mjs                 # usa ./.env
node scripts/validar-dependencias.mjs --env ../otro/.env
node scripts/validar-dependencias.mjs --json          # para CI
```

Comprueba Node ≥ 20, presencia y forma de cada variable, que las dos copias del
token coincidan, que ninguna conserve el valor de plantilla, y las incoherencias
que rompen producción en silencio (`TRUST_PROXY`, `primary`, CORS con `*`).
No abre conexiones de red y no imprime ningún valor secreto.
