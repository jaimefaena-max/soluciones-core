# ARCHITECTURE_VAULT

Catálogo de componentes reutilizables de la agencia. Lo que aquí está no es
código nuevo: es lo que ya funciona en producción, extraído en forma de contrato
para que montar el cliente número 3 no cueste lo que costó el número 1.

**Creado:** 2026-09-05 · **Ubicación:** `Workspace_Agencia/vault/`

---

## 1. Por qué existe

El workspace tiene once repos y dos productos que ya se han montado más de una
vez: el asistente comercial embebido y el alta de un inquilino con portal
aislado. Las dos veces el conocimiento necesario estaba repartido entre un
controller de 400 líneas, una plantilla de `.env` de 200, un script de
aprovisionamiento y la memoria de quien lo hizo la vez anterior.

El coste real no es escribir el código otra vez —está escrito—, sino **volver a
descubrir las trampas**: que el token del widget vive en tres sitios, que
`GOOGLE_CALENDAR_ID=primary` falla en silencio, que pisar `TENANT_TOKENS` deja
sin acceso a los clientes anteriores. Ese es el contenido de este Vault.

## 2. Modelo de extracción: contrato, no copia

Cada componente del Vault contiene **tres artefactos y ningún fuente**:

| Artefacto | Qué garantiza |
|---|---|
| `.env.example` | Toda variable que el componente lee, con la razón de cada una y qué pasa si falta |
| `README.md` | El contrato de la interfaz API, el modelo de aislamiento y las trampas conocidas |
| `scripts/validar-dependencias.mjs` | Que la configuración se comprueba antes de desplegar, no después |

**El código sigue viviendo en su repo de origen.** Copiarlo aquí crearía un
segundo original que se desincroniza en la primera corrección de seguridad, y
tendríamos dos versiones del mismo `guardarAccesoPublicoEstricto` divergiendo en
silencio. El Vault apunta al origen y describe el contrato; el día que un
componente tenga que independizarse de verdad, se convierte en un paquete
versionado, no en una carpeta copiada.

**Consecuencia operativa:** si cambia el contrato en el repo de origen, hay que
actualizar el `README.md` de aquí. La sección §7 fija cómo se detecta el drift.

## 3. Inventario

| Componente | Qué hace | Origen | Estado |
|---|---|---|---|
| [`chat-widget-sofia`](chat-widget-sofia/) | Asistente comercial embebible multi-inquilino: conversa, cualifica, agenda y registra el lead | `zasa-orchestrator` + `admin_solucionesconia` | 🟢 en producción desde 2026-08 |
| [`ssi-business-init`](ssi-business-init/) | Alta de un negocio: identidad, autorización, portal aislado y credenciales | `zasa-orchestrator` | 🟢 en producción (referencia: portal de Liset) |

> ⚠️ **Sobre el nombre `ssi-business-init`.** El acrónimo `SSI` no aparece en
> ningún fichero del workspace; no pude resolverlo contra el código. El
> componente implementa lo que en los repos se llama *alta de inquilino* /
> *aprovisionamiento multi-tenant*, que es la lectura coherente con el propósito
> declarado del Vault. Si `SSI` designa otra cosa, se renombra el directorio: el
> contenido y la estructura no cambian.

---

## 4. Matriz de reutilización

Lo que se toca al montar un cliente nuevo, y lo que no. **La columna que importa
es la tercera**: todo lo que aparezca ahí es trabajo por cliente, y todo lo que
esté en la segunda es trabajo que ya está hecho para siempre.

### 4.1 `chat-widget-sofia`

| Dimensión | Común a todos los clientes | Específico del cliente |
|---|---|---|
| **Código** | Controller, rutas, rate limit, guardas, bundle del widget | — (nada) |
| **Identidad del asistente** | El motor y el enrutador | `nombreAsistente`, `systemPrompt`, `routerPrompt` |
| **Negocio** | La forma de `ReglasComerciales` | `servicio`, `ctaAgendar`, `correoContacto`, `quickPrompts`, `objetivo` |
| **Cobro** | La forma de `PasarelaCobroConfig` | `proveedor`, `activo`, `publicKey`, `montoCLP`, `urlCheckout` |
| **Aislamiento** | El mecanismo (Origin + fail-closed) | `allowedOrigins` — los dominios del portal del cliente |
| **Secretos** | `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY` (de la agencia) | El token del widget si se emite uno por cliente |
| **Infra** | El orquestador | Recompilar y subir el bundle al portal del cliente |

**Esfuerzo por cliente:** una entrada en el registro de inquilinos, las variables
de entorno y un rebuild del bundle. Sin tocar una línea de lógica.

**Lo que NUNCA se activa por defecto:** `usaMatrizRubros`. Esa matriz describe lo
que vende Solucionesconia; inyectarla en el portal de un tercero pone al
asistente a hablar del negocio equivocado. Es opt-in por diseño.

### 4.2 `ssi-business-init`

| Dimensión | Común a todos los clientes | Específico del cliente |
|---|---|---|
| **Código** | Rutas de portal, hook de autorización, parseo de identidad, generador de artefactos | — (nada) |
| **Identidad** | El modelo `staff` / `tenant:<id>` / ninguna | Una entrada `<id>:<token>` en `TENANT_TOKENS` |
| **Ruta** | `/portal/:tenantId` (+ alias `/clientes/`) | El `tenantId` en kebab-case |
| **Contenido** | La forma de `ClienteDoc` / `ClienteInforme` | La whitelist de documentos e informes |
| **Ficheros** | `private/clientes/` como convención | `private/clientes/<id>/`, subido por `scp` |
| **Borde** | El patrón de `location` + Basic Auth | `.htpasswd_<id>` y su bloque nginx |
| **Secretos** | `API_SECRET_TOKEN`, `EDGE_SECRET`, firma de sesión | El token del inquilino y su clave Basic Auth |

**Esfuerzo por cliente:** ejecutar el generador y aplicar sus cuatro artefactos
en dos sitios (panel de variables y VPS), más los seis pasos del checklist.

### 4.3 Orden de montaje de un cliente nuevo

Los dos componentes se combinan en este orden, y no es intercambiable:

```
1. ssi-business-init   → el cliente existe: tenantId, token, portal, aislamiento
                          └── verificar 403 cruzado ANTES de seguir
2. chat-widget-sofia   → el asistente habla en ese portal con su identidad
                          └── allowedOrigins depende del dominio del paso 1
```

Montar el widget antes que el inquilino deja `allowedOrigins` apuntando a un
portal que aún no existe, y el 403 resultante parece un problema del token.

### 4.4 Qué se comparte entre los dos componentes

| Recurso | Nota |
|---|---|
| `tenantId` | **El mismo identificador en los dos.** Es el pegamento del Vault: ruta, autorización, registro del widget, htpasswd y directorio en disco. |
| `API_SECRET_TOKEN` | Del alta; el widget no lo usa (sus endpoints están fuera del Zero Trust). |
| `EDGE_SECRET` | Cabecera de borde común a todo lo que pasa por nginx. |
| `TRUST_PROXY` | Afecta al rate limit del widget y a la IP registrada en la auditoría del portal. |

---

## 5. Estándares que cumple todo componente del Vault

Un componente entra aquí cuando cumple las seis:

1. **Fail-closed.** Ante configuración ausente, cierra en vez de abrir. Toda
   excepción a esto se documenta como excepción, con su motivo y su fecha de
   caducidad (ejemplo: `EDGE_SECRET` vacío desactiva la prueba de borde para
   permitir desplegar el código antes que el valor).
2. **Aislamiento demostrable.** Existe una comprobación concreta que un humano
   puede ejecutar y que falla si el aislamiento se rompió: el `403` cruzado del
   alta, el `Origin` ajeno del widget.
3. **Sin secretos en el repo.** Los `.env.example` traen valores falsos
   evidentes, y el validador falla si alguno sobrevive al despliegue.
4. **Las trampas están escritas.** Cada fallo silencioso que ya nos costó una
   sesión va en la sección «Trampas conocidas», con su síntoma, no solo su causa.
5. **Validación sin red.** El script de validación no abre conexiones, no imprime
   secretos y corre en un checkout sin `npm install`. Devuelve 0/1/2 para CI.
6. **Retención declarada.** Si el componente guarda datos personales, dice cuánto
   y bajo qué norma (Ley 19.628).

---

## 6. Trampas transversales

Las que afectan a más de un componente, o a cualquiera que se añada después:

- **Un secreto que vive en más de un sitio se desincroniza.** El token del widget
  (backend, bundle, nginx) es el caso vivo. Regla: el orden de rotación es
  siempre *aceptar el nuevo → publicar el nuevo → retirar el viejo*. Al revés
  hay corte de servicio.
- **La degradación silenciosa es peor que el error.** `DATABASE_URL` mal formada
  cae a SQLite, `DEEPSEEK_API_KEY` ausente cae a un clasificador heurístico y
  `GOOGLE_CALENDAR_ID=primary` responde 200 sin crear nada. Los tres «funcionan».
  Los validadores del Vault existen sobre todo para estos.
- **Las plantillas de `.env` envejecen peor que el código.** La del orquestador
  afirma que `SALES_AGENT_WIDGET_TOKEN` vacía «salta la guarda entera»; el código
  verificado responde 403 y lo registra como incidente. Si una plantilla y el
  código discrepan, **gana el código** y la plantilla se corrige.
- **Repo limpio no significa desplegado.** Vale para todo el workspace, y aquí en
  particular para el bundle del widget, que se sube a mano.
- **Verificar el camino feliz no verifica el aislamiento.** Un montaje puede
  responder 200 a todo lo que se le pida y aun así dejar que un cliente lea los
  documentos de otro. Las pruebas cruzadas de §4 no son opcionales.

---

## 7. Mantenimiento: detectar el drift

El riesgo de un catálogo de contratos es que el contrato mienta. Comprobación
mínima antes de usar un componente para un cliente nuevo:

```bash
# 1. Los endpoints del README siguen existiendo en el origen
grep -n "sales-agent/" ../zasa-orchestrator/src/routes/salesAgentRoutes.ts

# 2. Las reglas de parseo del validador siguen siendo las del arranque.
#    La -a no es opcional: tenantAuth.ts tiene un byte que grep lee como binario
#    y sin ella responde "Binary file matches" en vez de las líneas.
grep -an "a-z0-9\|LARGO_MINIMO_TOKEN" ../zasa-orchestrator/src/services/tenantAuth.ts

# 3. Ninguna variable nueva del origen falta en la plantilla del Vault
diff <(grep -oE '^[A-Z_]+=' ../zasa-orchestrator/.env.example | sort -u) \
     <(cat */.env.example | grep -oE '^[A-Z_]+=' | sort -u)
```

El tercero da falsos positivos (el Vault reparte las variables entre dos
componentes y omite las que no pertenecen a ninguno); léelo como una lista de
candidatos a revisar, no como un fallo.

---

## 8. Candidatos a extracción

Identificados en la auditoría del workspace, ordenados por cuántas veces ya se
han reescrito:

| Candidato | Origen | Por qué |
|---|---|---|
| `pagos-mercadopago` | `Elrincon-backend`, `GambusasChile` | Ya implementado **dos veces y de dos formas distintas** (SDK vs cURL puro). El de mayor retorno. |
| `deploy-vps-seguro` | `cicd-deploy-pattern`, `Elrincon-backend` | La trampa del tar/utime, el pinning de host key y por qué `scp` está prohibido donde el directorio contiene datos de clientes. |
| `qa-e2e-embudo` | `Elrincon-qa` | 8 pruebas Playwright en ~15 s sobre muro de pago y navegación. El patrón se transfiere a cualquier embudo. |
| `portal-cliente-estatico` | `privado_agencia/Clientes` | Portal + Basic Auth + despliegue. Complementa a `ssi-business-init` por el lado del contenido. |
| `respaldo-llave-dividida` | `tools/gpg-backup` | Shamir 2-de-3 sobre GF(2⁸) en Perl, sin dependencias. Ya verificado 27/27. |

Ninguno se extrae hasta que se necesite por segunda vez en un cliente real: un
Vault lleno de componentes que nadie usa envejece igual de mal que una plantilla
desactualizada.
