# 🏛️ El Gran Consejo — Doctrina V4.0 (Consejo Élite)
### Especificación de arquitectura | Borrador para aprobación del CEO | 2026-10-13

> **Estado:** ESPECIFICACIÓN. Nada de lo que describe este documento está implantado, salvo lo marcado
> con ✅. Sustituye a `CONSEJO_PROFESIONAL.md` (V3.0) cuando Jaime la apruebe y las fases de la §7 cierren.
>
> **Fuentes:** auditoría del Consejo del 2026-10-13 (12 agentes, 2 skills, `_consejo/guardia.ps1`);
> documentación oficial de subagentes de Claude Code (`code.claude.com/docs/en/sub-agents`, consultada
> el 2026-10-13, Claude Code 2.1.296); código de `zasa-orchestrator` y `examenfacil-cl`.

---

## 0. Qué cambia respecto a la V3.0

| # | Cambio | Por qué |
|---|---|---|
| 1 | **Tres agentes Élite nuevos:** Cloud Architect, Pentester, MLOps | Hay tres huecos sin dueño: resiliencia (un solo VPS), seguridad ofensiva (pagos y datos de salud) y calidad/coste de los LLM en producción |
| 2 | **Menor privilegio:** cada agente declara `tools:` | En la V3.0 **ningún** agente declara `tools:` y los 12 heredan todo: Bash, PowerShell, SSH, `git push`, MCP de GitHub (incluidos `delete_repository` y `merge_pull_request`) |
| 3 | **Delegación nativa de Roberto** | ✅ Implantado en `claude-skills` `b8c399b`. Roberto delega con la herramienta `Agent` en lugar de ejecutarlo todo él |
| 4 | **Guardia Zero-Trust en agentes** | `tools:` decide *qué* herramienta, pero no *con qué argumentos*. La guardia de hooks decide lo segundo |
| 5 | **Ramón cede OWASP a la Pentester** | Una sola dueña de la seguridad ofensiva; Ramón se queda con rendimiento, UX, accesibilidad y SEO |

---

## 1. Hechos técnicos en los que se apoya el diseño

Verificados en la documentación oficial salvo donde se indica.

| Hecho | Consecuencia para el Consejo |
|---|---|
| Un subagente **puede lanzar subagentes**, hasta **3 niveles** por debajo de la conversación principal (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). En el límite, Claude Code le retira `Agent` | Roberto delega de verdad aunque lo invoquen como subagente (§3) |
| `tools:` **omitido = hereda todas** las herramientas. Con lista explícita, lo no listado queda fuera (también `PowerShell` y los MCP) | Basta una lista explícita para quitar Bash, PowerShell y MCP a quien no los necesita |
| `disallowedTools:` existe, pero `Bash(git push *)` **quita Bash entero**, no solo ese comando | Para limitar *argumentos* hace falta la guardia (§5), no `disallowedTools` |
| `hooks:` es un campo válido del frontmatter de un agente. Los hooks **solo corren mientras el subagente está activo y se limpian al terminar** | A diferencia de las skills (cuya guardia se queda toda la sesión), la guardia en agentes no secuestra la sesión principal |
| Los hooks de agentes de proyecto solo corren si se aceptó el **diálogo de confianza** de la carpeta que contiene el agente | Por inferencia está aceptada (el hook `SessionStart` de `.claude/settings.json` corre), **no verificado** |
| `name:` no admite `:`, no puede empezar por `-` ni pasar de 256 caracteres | `cloud-architect`, `pentester` y `mlops` son válidos |
| Los cambios en `.claude/agents/` se recogen **en caliente**, sin reiniciar | Una corrección de agente rige desde la siguiente delegación |

🟡 **Pendiente de prueba empírica:** la guardia en el frontmatter de un agente (§5). El 2026-10-13 el modo automático bloqueó como «Self-Modification» crear el agente de prueba, así que la compatibilidad está **documentada, no ejecutada** en esta instalación.

---

## 2. Arquitectura V4.0

```
CEO: Jaime ─ autoridad suprema (Regla de Oro #1)
└── 👑 Roberto · Chief of Staff · delega con Agent (✅ b8c399b)
    ├── 📋 Estrategia ........ Felipe (PM) · Rodrigo (Data)
    ├── ⚕️ Contenido ......... Doc (Médico) · Camila (Growth)
    ├── ⚙️ Ingeniería ........ Valentina (PHP/JS) · Marco (Orchestrator) · 🆕 Lucía (MLOps)
    ├── 🤝 Legal/Soporte ..... Nacho (Compliance) · Laura (Customer Success)
    ├── 🛡️ Calidad ........... Ana (QA) · Ramón (rendimiento/UX/SEO)
    ├── 🔐 Seguridad ......... 🆕 Vera (Pentester) ← absorbe OWASP de Ramón
    └── ☁️ Infraestructura ... 🆕 Sebastián (Cloud Architect: diseña) → Diego (DevOps: ejecuta)
```

**Regla de frontera:** los agentes Élite **diagnostican y diseñan**; los existentes **ejecutan**. Ningún
agente Élite toca producción. Así se respeta la Regla de Oro #2 («Solo habla quien sabe») y no se
multiplican las manos que llegan al VPS: **Diego sigue siendo el único con SSH**.

**Profundidad de anidación:**

| Nivel | Quién | ¿Tiene `Agent`? |
|---|---|---|
| 0 | Conversación principal | Sí |
| 1 | Roberto (si lo invoca la principal) | Sí, la conserva en su `tools:` |
| 2 | Especialistas que lanza Roberto | **No:** su `tools:` explícito no incluye `Agent`. Ejecutan su fase y devuelven el entregable |
| 3 | — | Reserva. Ningún agente del Consejo la usa por diseño |

---

## 3. Delegación nativa de Roberto ✅

Implantada en `claude-skills` `b8c399b` (Paso 0 del Protocolo de Orquestación), idéntica a la propuesta
revisada el 2026-10-13. Corrige la premisa falsa de `8a225f6`, que suponía que un subagente no puede delegar.

- **Modo Delegación (obligatorio si tiene `Agent`):** cada fase la ejecuta el especialista real con su
  `subagent_type`. Roberto dirige, revisa cada entregable contra su compuerta y consolida.
- **Modo Director-Ejecutor (respaldo extremo, solo sin `Agent`):** Roberto lee el `.md` del especialista y
  ejecuta su fase; nunca atribuye a un agente trabajo que no hizo, y lo reporta como degradación.
- **Presupuesto de anidación:** los especialistas ejecutan su fase sin lanzar subagentes.

**Pendiente:** `roberto.md` aún no declara `tools:`. En la V4.0 debe incluir `Agent` explícitamente (§6);
si se le quitara, caería al modo de respaldo en todas las misiones.

**Mapa `subagent_type` V4.0** (añadir a la tabla del Paso 0 cuando existan los agentes nuevos):

| Agente | `subagent_type` | Archivo |
|---|---|---|
| Sebastián (Cloud Architect) | `cloud-architect` | `cloud-architect.md` |
| Vera (Pentester) | `pentester` | `pentester.md` |
| Lucía (MLOps) | `mlops` | `mlops.md` |

---

## 4. Los tres agentes Élite

### 4.1 ☁️ Sebastián — Cloud Architect (`cloud-architect.md`)

```yaml
---
name: cloud-architect
description: >-
  Sebastián — Cloud Architect y SRE de diseño: alta disponibilidad, recuperación ante desastres,
  capacidad y topología. Dueño del RTO/RPO. Diseña y documenta; NO ejecuta en el VPS (eso es Diego).
model: opus
tools: Read, Grep, Glob, Write, WebSearch, WebFetch
hooks: # perfil P0+docs (§5): Write solo bajo docs/ y ADRs
---
```

| Campo | Especificación |
|---|---|
| **Rol** | SRE de diseño: alta disponibilidad, recuperación ante desastres, capacidad, topología |
| **Modelo** | `opus`: decisiones de arquitectura de bajo volumen y alto impacto |
| **Perfil** | P0 + `Write` restringido a `docs/` y ADRs |
| **Sin acceso a** | `Bash`, `PowerShell`, SSH, consola de DO, `Agent`. La evidencia del servidor la recoge Diego |
| **Contexto real** | Un único VPS DigitalOcean (`161.35.85.101`, punto único de fallo) tras Cloudflare; `ufw` solo-Cloudflare; 3 respaldos cifrados (MySQL, PostgreSQL, El Rincón) a 30 días; App Platform retirado el 2026-09-07 |

**Protocolo de intervención**
1. **Disparadores:** cambios de topología o capacidad; un servicio nuevo con datos; post-mortem de cualquier caída; revisión trimestral de recuperación ante desastres.
2. **Pasos:** lee `CLAUDE.md` (Infraestructura) y las memorias de VPS y respaldos → pide a Diego la evidencia que falte (solo lectura) → redacta ADR o runbook con RTO/RPO **medidos**, no estimados.
3. **Entregable:** ADR + runbook + lista de cambios para Diego, cada uno con su vuelta atrás.
4. **Primer encargo:** simulacro de restauración completa (droplet nuevo ← respaldos cifrados) para medir el RTO real.
5. **Prohibido:** multinube por moda. AWS solo como destino de recuperación si el ADR demuestra el coste (Regla de Oro «Costo Cero»).

### 4.2 🔐 Vera — Pentester (`pentester.md`)

```yaml
---
name: pentester
description: >-
  Vera — Pentester y auditora Zero Trust de activos PROPIOS: autenticación, sesiones, saneamiento de
  entradas (PHP y Fastify), cabeceras, secretos. Reporta hallazgos reproducibles; NO corrige código.
model: opus
tools: Read, Grep, Glob, Bash, WebFetch
hooks: # perfil P1 + lista blanca de hosts (§5)
---
```

| Campo | Especificación |
|---|---|
| **Rol** | Seguridad ofensiva y defensiva sobre activos **propios**: Zero Trust, saneamiento de entradas, autenticación y sesiones, cabeceras, secretos |
| **Modelo** | `opus`: encadenar vulnerabilidades exige razonamiento profundo |
| **Perfil** | P1 + lista blanca de hosts: los 10 hostnames de producción y `localhost` |
| **Sin acceso a** | `Edit`/`Write` (no corrige, reporta), SSH, `Agent`, cualquier host de terceros (Mercado Pago, Resend, Google, Anthropic, DeepSeek) |
| **Frontera** | Ramón cede OWASP. Nacho conserva la privacidad legal; Vera responde por la explotabilidad técnica. Complementa `/cso` y `/security-review`, no los sustituye |

**Protocolo de intervención**
1. **Disparadores:** endpoint nuevo; cambios de autenticación o sesión (Portal VIP, `tokenFirmado`); webhooks de pago; CSP o cabeceras; auditoría mensual.
2. **Reglas de alcance:** alcance declarado por escrito antes de cada ronda (hosts, rutas, técnicas). Sin DoS, sin fuzzing de carga, sin fuerza bruta. Las pruebas van por Cloudflare, como un atacante real (el origen solo acepta Cloudflare). Solo credenciales de prueba.
3. **Pasos:** lee el código (rutas, middlewares, `api_handler*.php`) → modelo de amenazas → pruebas no destructivas con `curl` → severidad CVSS → descarte de falsos positivos (lección de los 401 de El Rincón).
4. **Entregable:** hallazgos con reproducción mínima, severidad y responsable de corregirlos (Valentina, Marco o Diego).
5. **Compuerta:** un hallazgo Crítico o Alto bloquea el deploy hasta que se corrige y Vera lo vuelve a probar.

### 4.3 🧠 Lucía — MLOps (`mlops.md`)

```yaml
---
name: mlops
description: >-
  Lucía — MLOps: calidad, coste y latencia de los LLM en producción (Sofía, M. Jesús, ExamenFácil).
  Evals, regresiones de prompts, telemetría de consumo y voz. Ningún prompt cambia sin un caso de eval.
model: sonnet
tools: Read, Grep, Glob, Edit, Write, Bash
hooks: # perfil P2; deniega `eval_engine.php --live` sin OK de Jaime (cuesta dinero)
---
```

| Campo | Especificación |
|---|---|
| **Rol** | Calidad, coste y latencia de los LLM en producción: evals, regresiones de prompts, pipeline de telemetría de consumo, voz |
| **Modelo** | `sonnet` para los bucles de evaluación; `opus` solo para rediseñar un prompt |
| **Perfil** | P2. La guardia deniega `--live` del harness sin OK de Jaime |
| **Sin acceso a** | SSH, `git push`, `.env`, claves de proveedores, `Agent` |
| **Frontera** | Doc es dueño del contenido clínico del prompt; Lucía, de que no haya regresiones, de su coste y de su latencia. Rodrigo analiza el negocio; Lucía, el comportamiento del modelo |

**Modelos en producción (según el código del repo, 2026-10-13; los `.env` de producción pueden cambiarlos):**

| Producto | Pieza | Modelo |
|---|---|---|
| Sofía | Agente conversacional | `deepseek-chat` (`SOFIA_MODELO_AGENTE`) |
| Sofía | Clasificador | `claude-haiku-4-5` (`SOFIA_MODELO_CLASIFICADOR`) |
| Vendedor IA anterior | Enrutador y motor avanzado | `deepseek-chat`; `claude-sonnet-5` solo con `AGENT_ANTHROPIC_MOTOR=true` |
| M. Jesús | Analista | `claude-sonnet-5` |
| ExamenFácil | Análisis, oncológico y voz | `gemini-2.5-flash` (`gemini_service.php`) |

**Primeros hallazgos para su cola:** `claude_handler.php` de ExamenFácil reenvía al App Platform retirado
(roto; lo usa `admin/brain_sync.php`); `admin/ping_gemini.php` y AuditorLegal usan `gemini-3-flash-preview`,
revocado por Google; `deepseek_handler.php` no tiene llamadores; `MODELO_OPUS` está declarado y sin uso.

**Protocolo de intervención**
1. **Disparadores:** cualquier cambio de prompt, modelo o proveedor; una subida de coste o de latencia en la telemetría; una queja de calidad de Sofía o M. Jesús.
2. **Regla de hierro:** primero el caso de evaluación que falla; después el cambio de prompt.
3. **Pasos:** reproduce el caso → amplía el harness (`tests/ai-resilience/eval_engine.php` ya existe para ExamenFácil; para Sofía y M. Jesús no existe: es su primer entregable) → prueba variantes offline → compara calidad, coste y latencia.
4. **Fine-tuning:** solo si las evaluaciones demuestran que prompt + ejemplos no bastan. Con datos de pacientes **exige un veredicto Aprobado de Nacho** (datos sensibles de salud, Ley 19.628 / 21.719).
5. **Entregable:** diff del prompt + resultado de la evaluación antes y después + impacto estimado en CLP/mes. Si el prompt es clínico, firma de Doc.

---

## 5. Perfil Zero-Trust: la guardia en los agentes

### 5.1 Dos capas

1. **`tools:`** decide qué herramientas existen para el agente. Sin `Bash` ni `PowerShell` no hay ejecución de comandos posible, haga lo que haga el modelo.
2. **Guardia (`hooks:` → `PreToolUse` → `_consejo/guardia.ps1 -Perfil Px`)** decide con qué argumentos. Solo restringe, nunca concede permisos, y falla cerrado ante un perfil desconocido, un JSON ilegible o cualquier excepción.

### 5.2 Perfiles

| Perfil | `tools:` base | La guardia permite | La guardia deniega | Estado |
|---|---|---|---|---|
| **P0 Lectura** | `Read, Grep, Glob` (+ `WebSearch, WebFetch` si investiga) | — | Escrituras, Bash, PowerShell, MCP de escritura | ✅ existe en `guardia.ps1` (62/62 pruebas offline) |
| **P1 Verificación** | P0 + `Bash` | Tests, `curl`, `php -l`, `git status/diff/log` | `ssh`, `scp`, `rsync`, `git commit/push`, `rm`, redirecciones a fichero | 🆕 por construir |
| **P2 Construcción local** | P1 + `Edit, Write` | Edición del repo, `npm test`, `git add/commit` | `ssh`, `scp`, `rsync`, `git push`, `.env`, secretos | 🆕 por construir |
| **P3 Operación** | P2 + SSH | `ssh` a `161.35.85.101`, siempre con prompt de permisos (nunca en la lista de permitidos) | `git push` que despliega sin OK de Jaime; `chown -R /var/www/` | 🆕 por construir |

### 5.3 Integración en el frontmatter

```yaml
hooks:
  PreToolUse:
    - matcher: "*"
      hooks:
        - type: command
          shell: bash
          command: 'powershell -NoProfile -ExecutionPolicy Bypass -File "C:/Proyectos/.claude/skills/_consejo/guardia.ps1" -Perfil P1 || exit 2'
          timeout: 15
```

Es el mismo contrato que ya usa la skill `nacho` (`81a24a8`). En un agente, el hook vive solo mientras el
agente está activo, así que no reproduce la trampa de las skills (memoria `hooks-skill-persisten-toda-la-sesion`).

### 5.4 Mitigación provisional

Hasta que P1–P3 existan y la guardia en agentes esté probada, un agente con `Bash` en `tools:` tiene Bash
completo. Para ese periodo: reglas `ask` globales en `.claude/settings.json` para `Bash(ssh *)`,
`Bash(scp *)` y `Bash(git push *)`. Afectan también a la sesión principal y requieren el OK de Jaime.

---

## 6. Matriz de privilegios de los 12 agentes existentes

| Agente | Perfil | `tools:` propuesto | Pierde | Ajuste en su `.md` |
|---|---|---|---|---|
| Roberto | P0 + delegación | `Read, Grep, Glob, Agent, TodoWrite` | Bash, PowerShell, Edit, Write, MCP | Conserva `Agent` (§3). Ejecutar lo hacen los especialistas |
| Felipe | P0 | `Read, Grep, Glob` | Todo lo demás | Entrega el backlog como texto |
| Rodrigo | P0 + web | `Read, Grep, Glob, WebSearch, WebFetch` | Bash | Analiza los logs que le entrega Diego |
| Doc | P0 + edición | `Read, Grep, Glob, Edit, WebSearch, WebFetch` | Bash, Write | Edita prompts existentes; la evaluación la corre Lucía |
| Camila | Edición sin Bash | `Read, Grep, Glob, Edit, Write, WebFetch` | Bash | Retirar la cifra de prueba social sin fuente |
| Valentina | P2 | `Read, Grep, Glob, Edit, Write, Bash` | `git push`, SSH, MCP, `Agent` | — |
| Marco | P2 | `Read, Grep, Glob, Edit, Write, Bash` | `git push` (en zasa despliega), SSH, `Agent` | Retirar DO App Platform |
| Nacho | P0 + web | `Read, Grep, Glob, WebSearch, WebFetch` | Todo lo que escribe | Alinear con la skill `/nacho` o retirar el agente |
| Laura | P0 | `Read, Grep, Glob` | Todo lo demás | Entrega correos redactados; **nunca los envía** |
| Ramón | P2 | `Read, Grep, Glob, Edit, Write, Bash, WebFetch` | SSH, OWASP (pasa a Vera), `Agent` | Retirar seguridad de su `description` |
| Ana | P2 | `Read, Grep, Glob, Edit, Write, Bash` | `git push`, SSH, `Agent` | Retirar DO App Platform (`ana.md:45`) |
| Diego | **P3** | `Read, Grep, Glob, Edit, Bash` | Write, MCP, `Agent` | Único con SSH; siempre con prompt y respaldo previo |

**Resultado con los 15 agentes:**

| | V3.0 (hoy) | V4.0 |
|---|---|---|
| Acceso total (herencia sin `tools:`) | 12 | 0 |
| Con SSH | 12 | 1 (Diego) |
| Con Bash local | 12 | 6 (Valentina, Marco, Ramón, Ana, Vera, Lucía) + Diego |
| Sin Bash | 0 | 8 |
| Con `Agent` | 12 | 1 (Roberto) |
| Con `git push` o MCP de GitHub | 12 | 0: quedan en el hilo principal, con OK de Jaime |

---

## 7. Plan de implantación (repo `claude-skills`, sin CI)

| Fase | Qué | Riesgo | Estado |
|---|---|---|---|
| **0** | Delegación nativa de Roberto | Nulo | ✅ `b8c399b` |
| **1** | Probar `hooks:` en el frontmatter de un agente con un agente de prueba P0 | Nulo | 🔴 Bloqueada por el modo automático («Self-Modification»): requiere que Jaime cree el agente de prueba o una regla de permisos |
| **2** | Añadir P1, P2 y P3 a `guardia.ps1`, con pruebas offline como las 62 de P0 | Bajo | Pendiente |
| **3** | `tools:` en los agentes sin Bash: Felipe, Rodrigo, Doc, Camila, Nacho, Laura y Roberto. No depende de los hooks | Bajo | Pendiente |
| **4** | Crear `pentester.md` → `mlops.md` → `cloud-architect.md` y añadirlos al mapa `subagent_type` de Roberto | Bajo | Pendiente |
| **5** | `tools:` + guardia en los agentes con Bash, una vez validada la Fase 1 | Medio | Pendiente |
| **6** | Sustituir `CONSEJO_PROFESIONAL.md` (V3.0) por esta doctrina y actualizar `REGLAS_DE_ORO.md` y `PROTOCOLO_INTERACCION.md` (siguen en V1.0, solo ExamenFácil) | Nulo | Pendiente |

⚠️ **Sobre el modo automático:** editar la definición de un agente para **darle** capacidad (hooks,
delegación) se bloquea como «Self-Modification» y la autorización en el chat no lo desbloquea (2026-10-13).
**Quitar** capacidad (las Fases 3 y 5) no está probado. Contar con que Jaime aplique en persona los cambios
que el clasificador frene, como ya hizo con `b8c399b`.

**Orden de retorno de los agentes nuevos:** Vera primero (pagos y datos de salud en juego), luego Lucía
(coste de IA variable y sin red de evaluación en Sofía), y por último Sebastián (su primer encargo, el
simulacro de restauración, puede hacerlo Diego con un runbook mientras tanto).

---

*Doctrina V4.0 — borrador del 2026-10-13 para aprobación del CEO (Jaime).*
