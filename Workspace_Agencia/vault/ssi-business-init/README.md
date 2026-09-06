# ssi-business-init

Aprovisionamiento de un negocio nuevo: convierte «un cliente firmó» en un
inquilino con identidad propia, portal aislado y credenciales que no se cruzan
con las de nadie más.

**Estado:** en producción; el inquilino de referencia es el portal de Liset.
Extraído de `zasa-orchestrator`.

> **Nota sobre el nombre.** El acrónimo `SSI` no aparece en ningún punto del
> workspace: no pude resolverlo contra el código. Este directorio implementa lo
> que en los repos existe como *alta de inquilino* / *aprovisionamiento
> multi-tenant*. Si `SSI` significa otra cosa, el contenido se renombra sin
> tocar la estructura. Ver [`../ARCHITECTURE_VAULT.md`](../ARCHITECTURE_VAULT.md).

---

## 1. Qué problema resuelve

Hasta la v1 el perímetro era solo perimetral: un único `API_SECRET_TOKEN` abría
`/clientes/<cualquier-slug>`. Cualquier portador del token —incluido un cliente
autenticado— podía leer el portal de otro cambiando el slug de la URL. Acceso
cruzado entre inquilinos, con documentos tributarios de por medio.

Este componente es la respuesta: **un identificador, `tenantId`, que es a la vez
la ruta, la clave de autorización y el directorio en disco.** Sin tablas de
traducción que se desincronicen.

```
                 ┌──────────────── el mismo tenantId en los cuatro sitios ────┐
                 │                                                            │
   /portal/<id>  │  TENANT_TOKENS="<id>:tok"  │  .htpasswd_<id>  │  private/clientes/<id>/
   (ruta)        │  (autorización)            │  (Basic Auth)    │  (documentos)
```

---

## 2. Modelo de identidad

Toda petición a una ruta con inquilino resuelve a **una** identidad:

| Identidad | Cómo se acredita | Alcance |
|---|---|---|
| `staff` | token maestro `API_SECRET_TOKEN` | el Cockpit; cruza inquilinos solo si `STAFF_CROSS_TENANT=true` |
| `tenant:<id>` | token propio del inquilino en `TENANT_TOKENS` | exactamente su propio id |
| ninguna | — | `401` |

Dos fuentes de identidad de inquilino, en orden de precedencia:

1. **Token propio por inquilino** (`TENANT_TOKENS="liset:tok,acme:tok"`). Es la
   fuerte: el Bearer identifica al inquilino por sí mismo, sin depender de que
   el proxy sea honesto.
2. **Identidad afirmada por el proxy** (cabecera `X-Tenant-Id`), aceptada solo si
   `TRUST_PROXY_IDENTITY=true` **y** la petición presenta el token maestro. O
   sea: solo quien ya demostró ser el proxy de confianza puede afirmar «esta
   petición viene del cliente X». Pensada para un nginx que ya separa clientes
   por Basic Auth y solo necesita reenviar el dato.

🔴 **Con ninguna de las dos configurada, todo el tráfico llega como `staff`** y el
orquestador no puede distinguir inquilinos. La autorización del código sigue
siendo correcta; el agujero queda abierto en el borde. El diagnóstico de arranque
lo reporta como advertencia — no la ignores en un despliegue nuevo.

---

## 3. Contrato de la interfaz API

### Rutas de portal

Familia canónica `/portal/:tenantId`; `/clientes/:tenantId` se mantiene como
**alias deprecado** sobre los mismos handlers.

| Método y ruta | Devuelve |
|---|---|
| `GET /portal/:tenantId` | portal del inquilino (HTML) |
| `GET /portal/:tenantId/docs/:docId` | descarga un documento de su whitelist |
| `GET /portal/:tenantId/diagnostico` | informe web (markdown → HTML) |
| `GET /portal/:tenantId/diagnostico-simple` | variante simple del informe |

Por qué alias y no un `301` hacia `/portal`: el nginx del VPS resuelve el Basic
Auth por `location`. Hoy `location /clientes/` tiene el realm «Portal de
Clientes» y `location /` el del Cockpit. Un redirect caería en `location /` y le
pediría a la clienta las credenciales del Cockpit — la dejaría fuera de su propio
portal. El alias desaparece cuando el borde tenga su bloque `location /portal/`.

**Autorización:** ninguna de estas rutas la comprueba por su cuenta. El hook
`onRequest` del servidor resuelve identidad y exige coincidencia exacta de
inquilino (`403` fail-closed) para **ambos prefijos, incluidas URLs no
registradas**. La autorización vive en un solo sitio: no se puede olvidar al
añadir una ruta.

### Contrato de datos del inquilino

Cada inquilino declara una **whitelist cerrada** de documentos e informes. Los
ficheros físicos viven en `private/clientes/<tenantId>/`, un directorio
gitignoreado que nunca entra al repo.

```ts
interface ClienteDoc {
  id: string;              // el que viaja en /docs/:docId
  titulo: string;
  descripcion: string;
  archivo: string;         // nombre dentro de private/clientes/<tenantId>/
  mime: string;
  nombreDescarga: string;
  icono: 'carpeta' | 'deuda' | 'diagnostico';
  verEnRuta?: string;      // si está, no descarga: navega a lectura en línea
  textoBoton?: string;
}

interface ClienteInforme {
  titulo: string;
  subtitulo: string;
  archivo: string;         // markdown dentro de private/clientes/<tenantId>/
  alterno?: { ruta: string; texto: string; estilo: 'banner' | 'link' };
}
```

**La descarga solo resuelve archivos declarados aquí.** El input del usuario
jamás se concatena a una ruta del filesystem — por eso las rutas de informe se
declaran una a una en vez de con un comodín `/:informeId`, que convertiría
cualquier error de tecleo en un 404 genérico y abriría la puerta a enumeración.

### Formato de `TENANT_TOKENS`

```
TENANT_TOKENS="liset:fef6…c2af,acme:9b11…25a3"
```

Reglas que el arranque **exige** (si fallan, el orquestador aborta):

- separador `,` entre entradas y el **primer** `:` separa id de token;
- `tenantId` en kebab-case: `^[a-z0-9][a-z0-9-]*$`;
- token de **32 caracteres como mínimo** (128 bits en hex);
- sin ids repetidos.

Las comparaciones de token son en **tiempo constante**, para que nadie deduzca un
token midiendo cuánto tarda el rechazo. La longitud sí se filtra: es el
compromiso estándar de `timingSafeEqual`, que exige buffers del mismo tamaño.

---

## 4. Alta de un cliente: los seis pasos

El generador imprime los artefactos listos para copiar; **no toca el VPS, no abre
conexiones y no escribe ficheros.** Aplicarlos es siempre una decisión humana,
con respaldo previo, según el Protocolo Golden Standard.

```bash
node scripts/nuevo-cliente.js <tenantId> --actual "<TENANT_TOKENS vigente>"
```

Genera: **(a)** el token de 256 bits, **(b)** la variable `TENANT_TOKENS` ya
concatenada, **(c)** la credencial Basic Auth (`htpasswd -B`, bcrypt) y **(d)** el
bloque nginx del inquilino.

Sin estos pasos el portal responde 404 aunque la infraestructura sea correcta:

1. Declarar el `tenantId` en el registro de portales (nombre, docs, informes).
2. `git commit` + `push` → build automático.
3. Aprovisionar los ficheros en el VPS: `private/clientes/<tenantId>/` — **por
   `scp`, no por git**: no viajan en el repo porque el filesystem de la
   plataforma es efímero.
4. Aplicar (b) en el panel de variables de entorno y esperar el redespliegue.
5. Aplicar (c) y (d) en el VPS → `nginx -t` → `systemctl reload nginx`.
6. Entrar autenticado y verificar portal, informe y una descarga.

### Verificación del aislamiento (obligatoria)

Con la credencial del inquilino **nuevo**, y antes de dar el acceso por bueno:

```
/portal/<otro-inquilino>   debe dar 403
/dashboard                 debe dar 403
/portal/<inquilino-nuevo>  debe dar 200
```

Si el primero devuelve 200, el cliente nuevo puede leer los documentos del
anterior. Ese es exactamente el fallo que este componente existe para cerrar, y
no lo detecta ninguna prueba del camino feliz.

---

## 5. Trampas conocidas

- **`TENANT_TOKENS` se concatena, nunca se reemplaza.** Pisar el valor deja sin
  token a todos los inquilinos anteriores; sus portales pasan a 401 en el
  siguiente redespliegue. Pásale al generador el valor vigente con `--actual`.
- **Un `tenantId` inválido aborta el arranque, no degrada.** Es correcto, pero
  significa que un typo en kebab-case tumba el servicio entero para todos los
  clientes, no solo para el nuevo. Valida antes de pegar.
- **`DATABASE_URL` mal formada cae a SQLite en silencio.** Solo avisa por log. En
  un cliente nuevo eso significa datos en un fichero efímero que nadie echará de
  menos hasta que se pierdan.
- **`SESSION_STORE=memoria` no crea el esquema.** Es la vía `sql` la que ejecuta
  el DDL de arranque (usuarios, `tenant_roles`, `audit_log`, `cliente_sesiones`);
  con `memoria` solo se crea de rebote, desde los barridos periódicos.
- **`EDGE_SECRET` vacío desactiva la prueba de borde.** Fallo abierto acotado y
  deliberado —el código se despliega antes que el valor—, pero en producción deja
  el origen accesible sin pasar por nginx.
- **`RBAC_ADMIN_TOKENS` y `RBAC_BOOTSTRAP_ADMIN_PASSWORD` ambos vacíos cierran la
  gestión.** Es fail-closed a propósito; si nadie puede entrar a `/api/admin`,
  esto es lo primero que hay que mirar.
- **El `.htpasswd` con `-c` crea el fichero desde cero.** Para añadir un usuario a
  un fichero que ya tiene entradas, hay que omitir la `-c` y respaldar antes.

---

## 6. Validación

```bash
node scripts/validar-dependencias.mjs                 # usa ./.env
node scripts/validar-dependencias.mjs --env ../otro/.env
node scripts/validar-dependencias.mjs --json          # para CI
```

Comprueba Node ≥ 20, que `TENANT_TOKENS` parsee con las mismas reglas que el
arranque (kebab-case, token ≥ 32, sin duplicados), que exista alguna fuente de
identidad de inquilino, la longitud de los secretos, la coherencia de la
persistencia y los valores que dejan puertas abiertas. No abre conexiones de red
y no imprime ningún token.
