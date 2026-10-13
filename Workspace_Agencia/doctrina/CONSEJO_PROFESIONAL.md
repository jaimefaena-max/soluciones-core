# 🏛️ El Gran Consejo — Directorio Operativo Silicon Valley
### Versión 3.0 | Documento Interno Confidencial | Actualizado Julio 2026

---

## 🗺️ Mapa de Jerarquía y Orquestación

```
CEO: Jaime (ZASA) — Único tomador de decisiones.
│
├── 👑 Roberto "El Reloj" Silva (roberto.md) — Chief of Staff & Meta-Orquestador
│   │  Rol: Recibe las órdenes de Jaime, divide el trabajo y delega a los agentes correctos.
│   │  Tú solo hablas con él para proyectos completos. Él entrega el reporte ejecutivo.
│   │
│   ├── 📋 ESTRATEGIA Y PRODUCTO
│   │   ├── Felipe   (felipe.md)   · Product Manager & Backlog (Decide qué hacer primero)
│   │   └── Rodrigo  (researcher.md)· Data Analyst (Valida con datos y métricas)
│   │
│   ├── ⚕️ CONTENIDO Y CONVERSIÓN
│   │   ├── Doc      (doc.md)      · Especialista Médico (Contenido clínico y Ley 20.584)
│   │   └── Camila   (creative.md) · Growth Lead (Copywriting persuasivo y diseño UI)
│   │
│   ├── ⚙️ INGENIERÍA Y DESARROLLO
│   │   ├── Valentina(coder.md)    · Staff Engineer (Código PHP/JS, Arquitectura)
│   │   └── Marco    (marco.md)    · Full-Stack Tech Lead (Node.js, ZASA Orchestrator)
│   │
│   ├── 🤝 LEGAL Y SOPORTE
│   │   ├── Nacho    (nacho.md)    · Compliance (Privacidad, Datos, Ley 20.584)
│   │   └── Laura    (laura.md)    · Customer Success (Reembolsos, Usuarios enojados)
│   │
│   └── 🛡️ CALIDAD Y DEPLOY (La última línea de defensa)
│       ├── Ramón    (ramon.md)    · Tech Lead Global (Auditoría de Seguridad y Performance)
│       ├── Ana      (ana.md)      · QA Engineer (Pruebas de flujos críticos antes de subir)
│       └── Diego    (support.md)  · DevOps/SRE (Gestión del VPS, Nginx y Deploys)
```

> **Ubicación de Agentes:** Todos los archivos `.md` viven en `C:\Proyectos\.claude\agents\`. 
> Esto les da visión de rayos X sobre *todos* tus proyectos (ExamenFácil, Gambusas, Orchestrator, etc).

---

## 🤖 El Ejército de Agentes (Cómo invocarlos)

### 👑 El Jefe de Operaciones (Meta-Agente)
- **Roberto (roberto.md)** — **Chief of Staff**. Úsalo para TODO proyecto que requiera varios pasos o varias personas. 
  *Ejemplo de uso:* "Roberto, quiero mejorar la página principal de ExamenFacil para que convierta más. Coordina al equipo, ejecuta y dame el reporte".

### 📋 Equipo de Estrategia
- **Felipe (felipe.md)** — **Product Manager**. Úsalo para priorizar, filtrar ideas y definir MVPs. Evita que programes cosas que no acercan a la primera venta.
- **Rodrigo (researcher.md)** — **Data Analyst**. Úsalo para analizar Analytics, logs, costos de IA y tomar decisiones basadas en números.

### ⚕️ Equipo de Contenido
- **Doc (doc.md)** — **Especialista Médico**. Úsalo para crear el system prompt de la IA, metáforas fáciles de entender, rangos MINSAL y verificar que no se hagan "diagnósticos" ilegales.
- **Camila (creative.md)** — **Growth & Copy**. Úsala para escribir los textos de venta, emails transaccionales, embudos y CTAs persuasivos.

### ⚙️ Equipo de Ingeniería
- **Valentina (coder.md)** — **Staff Engineer**. Úsala para programar todo lo que sea PHP, Vanilla JS, HTML y MySQL. Ella es la que tira código puro.
- **Marco (marco.md)** — **Orchestrator Lead**. Úsalo EXCLUSIVAMENTE para tocar el `zasa-orchestrator` (TypeScript, Node.js, Fastify, DigitalOcean App Platform).

### 🤝 Equipo Legal y Soporte
- **Nacho (nacho.md)** — **Oficial de Compliance**. Úsalo para auditar el manejo de datos, cookies, T&C y evitar multas (Ley 19.628).
- **Laura (laura.md)** — **Customer Success**. Úsala para lidiar con clientes enojados, buscar pagos caídos en MP y redactar correos empáticos.

### 🛡️ Equipo de Calidad (La Bóveda)
- **Ramón (ramon.md)** — **Tech Lead Global**. Úsalo como auditor externo. Revisa que el código de Valentina sea seguro y rápido.
- **Ana (ana.md)** — **QA Engineer**. Úsala ANTES de subir cualquier cambio a producción. Ella prueba el pago con MercadoPago, la generación de PDFs y que el servidor no se caiga.
- **Diego (support.md)** — **DevOps**. Úsalo para configurar el VPS, Nginx, certificados SSL y hacer backups `.bak`.

---

## 📜 Las Reglas de Oro del Workspace (Inquebrantables)

| Regla | Descripción |
|-------|-------------|
| **La Cadena de Mando** | Jaime manda. Roberto orquesta. Los agentes ejecutan. |
| **Escudo Médico-Legal** | Nunca "diagnóstico". Siempre "interpretación sugerida + derivación al médico". |
| **Bóveda de Titanio** | `config_secret.php` NUNCA en el web root. Siempre aislado en `/etc/`. |
| **QA Obligatorio** | Ningún código toca producción si Ana no verificó los 8 flujos críticos. |
| **Golden Standard VPS** | Backup `.bak` antes de tocar. `nginx -t` antes de recargar el servidor. |
| **Costo Cero Primero** | PHP nativo, sin frameworks pesados, foco en eficiencia extrema. |
| **Foco de Monetización** | Todo lo que construimos debe acercar al usuario al pago. Si no, Felipe lo rechaza. |

---

*Documento preparado para uso exclusivo del CEO (Jaime) — Versión 3.0 — Julio 2026*
*ZASA Workspace — Operando a nivel Silicon Valley.*
