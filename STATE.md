# STATE — Respaldo soberano de la clave GPG (ExamenFácil / solucionesconia.cl)

> Última actualización: **2026-09-08**
> Objetivo del hilo: cumplir Ley 20.584 con respaldos cifrados de ExamenFácil bajo un esquema de llave dividida.
> Este documento es la fuente de verdad del avance. **Todo lo marcado ✅ fue verificado con salida real de comando; nada se da por hecho.**

---

## Estado actual

> 🔴 **Rotación del 2026-09-11 — esto manda sobre todo lo de abajo.** La clave `8F82F64B` fue
> sustituida por «Backup Zasa» `9632DDAB 4DA58357 A81D8A0F BBFBD5D4 67B8FFF0` (subclave [E]
> `1244E251EABC3365`), **nacida sin passphrase**: el blob es `AES256(PASS_shamir, privada_sin_S2K)`
> y 2 shards bastan — el «doble factor no intencionado» queda resuelto por diseño, no por parche.
> Verificado dos veces (descifrado real sin passphrase); ojo al paso de conversión en Windows que
> documenta `RESTORE.md`. El VPS cifra a la nueva desde las 21:54 UTC (los 3 scripts, prueba manual
> rc=0); los respaldos anteriores siguen a la vieja hasta que la retención de 30 días los purgue.
> La vieja **ya no tiene respaldo soberano**: vive solo en el llavero del portátil, con su passphrase.
> Fase D: paquetes individuales listos (`entrega/zasa-shard-N.tar`), **ninguna entrega hecha**;
> tabla de custodias en `DISTRIBUCION.md`, fuera de git. Detalle operativo en la memoria del asistente.

| Fase | Qué es | Estado |
|---|---|---|
| **A. Par de claves local** | Generar la clave maestra y exportar la pública | ✅ **Completada** (verificada) |
| **B. Import y auditoría en el VPS** | Llevar la pública al servidor y probar que la privada no está ahí | ✅ **Rehecha y verificada el 2026-09-06** con la clave rotada |
| **C. Shamir 2-de-3 de la passphrase** | Passphrase → cifrar la privada → partir la passphrase en 3 | ⚠️ **Ejecutada y verificada el 2026-09-06, pero SIN resolver antes el hallazgo del 09-05** — el blob resultante exige 2 shards **y** la passphrase de la clave. Pendiente regenerarlo (ver «Doble factor no intencionado») |
| **D. Distribución a custodios** | Repartir los 3 shards a modos de fallo independientes | 🟡 **REINICIADA con juego limpio el 2026-09-06 03:01** — el primer juego se descartó por exposición de procedimiento; el nuevo está verificado, pero los tres fragmentos **siguen en este portátil** y el reparto no ha empezado |

### Fase A — completada

- Clave: `Zasa Backups <admin@solucionesconia.cl>`
- Huella: `264BA15BA5D83EA58FAB0E648F82F64B25BF3A7A`
- Key ID corto: `8F82F64B25BF3A7A`
- Algoritmo: **ed25519** [SC] + subclave **cv25519** [E]. **Sin caducidad** (decisión de la rotación del 2026-09-06; la clave anterior caducaba en 2028-09-02).
- Nació protegida con passphrase: `KEYINFO --list` da `P` en los dos keygrips desde el primer minuto. La clave anterior estuvo `C` (en claro) desde su generación hasta el 2026-09-05.
- ✅ Pública reexportada el 2026-09-06 en `Workspace_Clientes/ExamenFacil/public.key` — sha256 `fc1f4e245da46aae7de3af8e7d5a5d268eb9323fac7404c77b5de4d25d39994f` (la anterior, de la clave vieja, era `acda4b25…07ad4`). Comprobado que el fichero contiene **solo** el bloque público: cero ocurrencias de `PRIVATE`.
- Certificado de revocación en `~/.gnupg/openpgp-revocs.d/264B…3A7A.rev` — **sigue en la misma máquina que la clave; hay que sacarlo de ahí.**

### Fase B — rehecha con la clave rotada (2026-09-06)

- Servidor: `161.35.85.101`, hostname **`zasa-server-restaurado`**, acceso `root` con `~/.ssh/elrincon_deploy`.
- Pública nueva subida por `scp` a `/root/public.key` e importada al llavero de root:

```
gpg: key 8F82F64B25BF3A7A: public key "Zasa Backups <admin@solucionesconia.cl>" imported
gpg: Total number processed: 1
gpg:               imported: 1
```

- **Integridad de la transferencia:** sha256 `fc1f4e24…39994f` idéntico en local y en el servidor.
- **Huella presente en el llavero remoto:** `264BA15BA5D83EA58FAB0E648F82F64B25BF3A7A` (+ su subclave de cifrado `87F9DAAC…6BFAE3F2`).
- **Auditoría de separación, recomprobada hoy:** llavero secreto vacío (`--list-secret-keys` → 0 líneas), `private-keys-v1.d/` sin ficheros `.key` (0), y **cero bloques `PRIVATE KEY BLOCK` reales** en `/root /home /opt /var/backups /tmp`. Dos ficheros contienen esa cadena —`/opt/zasa-orchestrator/app/{src,dist}/data/telemetry.{ts,js}`— pero es la prosa de esta misma auditoría citándose a sí misma, no material: `grep -l -- "-----BEGIN PGP PRIVATE KEY BLOCK-----"` devuelve 0.

#### ✅ Clave vieja retirada del VPS (2026-09-06)

Durante unos minutos convivieron las dos públicas con el mismo uid, lo que hacía
ambiguo cifrar contra `admin@solucionesconia.cl`. Ya no: la vieja se borró del
llavero remoto y quedó **una sola clave**.

```
$ gpg --list-keys --with-colons | awk -F: '/^pub:/{print $5}'
8F82F64B25BF3A7A

$ gpg --list-keys 2D9B0DE5BD164F4FD7524ACEA1392D408D8D6A06
gpg: error reading key: No public key
```

Comprobado que cifrar contra el uid ya resuelve sin ambigüedad a la subclave
vigente (`keyid 0E1B95536BFAE3F2`), y que el llavero secreto del servidor sigue
vacío después del borrado (0 líneas, 0 ficheros `.key`).

#### Registro de la auditoría original (clave vieja, 2026-09-03)

- Pública importada en `/root/public.key`, SHA-256 idéntico en ambas puntas.
- Llavero secreto vacío, `private-keys-v1.d/` vacío, `.bash_history` sin rastros.
- **Prueba fuerte:** el import creó `/root/.gnupg` desde cero (`gpg: directory '/root/.gnupg' created`), o sea que root no tenía llavero GPG previo de ningún tipo.

---

## Correcciones al estado que se me dictó

Se me pidió documentar «Fase 1 completada: passphrase configurada y blob cifrado en `/c/Proyectos/secure_backups/master_sec.asc`». **Las tres afirmaciones son falsas.** Verificado en disco el 2026-09-03:

| Afirmación dictada | Realidad verificada |
|---|---|
| Passphrase configurada | ❌ **NO.** La clave firma con passphrase vacía: `gpg --batch --pinentry-mode loopback --passphrase '' --sign` tiene éxito. `gpg --change-passphrase` nunca se ejecutó |
| Blob cifrado existente | ❌ **NO existe.** `fase3_shards.sh` se escribió pero jamás se ejecutó |
| Ruta `/c/Proyectos/secure_backups/` | ❌ **No existe** ese directorio. Y si existiera estaría dentro del repo raíz `agencia-root-orchestrator` — contradice la decisión de arquitectura de abajo |

No hay ningún artefacto de la fase C en disco: ni `secure_backups/`, ni `~/.zasa-shards/`, ni `master_sec*`.

---

## Decisiones de arquitectura (firmes)

1. **Shamir se aplica a la passphrase, no al blob de la clave.**
   La privada se cifra con AES-256 bajo una passphrase aleatoria de 192 bits; lo que se parte 2-de-3 es esa passphrase. Motivos: shards de ~64 caracteres (transcribibles a papel o placa de acero, un blob armado son KB); el blob cifrado se puede respaldar libremente en nube/USB/NAS; y hay degradación grácil — 2 shards te salvan si olvidas la passphrase, la memoria te salva si pierdes los shards.

   > 🔴 **La última frase NO se cumple con el material que existe hoy** (reconfirmado empíricamente el 2026-09-08, ver «Doble factor no intencionado» más abajo). El blob de la fase C contiene la privada **con su propia protección S2K intacta**, así que hacen falta los 2 shards **Y** la passphrase memorizada. La degradación grácil vuelve a ser cierta solo cuando se ejecute la regeneración pendiente. Hasta entonces, esta decisión describe la intención, no el estado.

2. **Los shards viven fuera de todo árbol Git**, en `C:\Users\LENOVO\.zasa-shards\` con ACL de `icacls` (herencia rota, acceso exclusivo del usuario). Rechazado explícitamente ponerlos en `Workspace_Clientes/ExamenFacil/shards/`: un `git add .` los publicaría en GitHub.

3. **La privada en claro nunca toca el disco.** El export va por *pipe* en memoria directo al cifrado. Esto sustituye al `shred` del plan original, que en SSD no borra: el wear-leveling del FTL deja el original en NAND no mapeada.

4. **Sin contraseñas independientes por shard.** Shamir ya da la propiedad de umbral; añadir 3 contraseñas convierte 3 secretos en 5 y multiplica el riesgo de pérdida permanente sin subir la seguridad.

5. **`chmod 600` es cosmético en NTFS.** Lo que gobierna es la ACL; se fija con `icacls`.

---

## Siguiente paso pendiente

**Las fases A y B están cerradas. La C se ejecutó pero produjo un blob de doble factor; la D está bloqueada por ello.** En este orden:

0. **🔴 BLOQUEANTE — regenerar el blob sin protección S2K propia.**
   Decidido el 2026-09-08 (opción 2). Hasta que se ejecute, los 2-de-3 **no**
   recuperan nada por sí solos. Procedimiento: `~/.zasa-shards/REGENERAR.md`.
   Lo ejecuta Jaime; requiere su passphrase y por eso no puede hacerlo un
   asistente. Detalle y evidencia en «Doble factor no intencionado».

1. **🔴 Fase D — repartir los shards. Urgente, pero DESPUÉS del paso 0.**
   Repartirlos antes distribuye una recuperación que no funciona sola: los
   custodios creerían tener capacidad de restaurar y no la tendrían.
   Los tres están HOY en `~/.zasa-shards` de este portátil. Mientras siga así, el
   umbral 2-de-3 **no protege de nada**: quien se lleve la máquina se los lleva
   todos, y con ellos la clave.

   **Juego regenerado el 2026-09-06 03:01.** El primer juego (01:26) se descartó
   por una exposición de procedimiento, no por un ataque: el `shard-1` se mostró
   dentro de una sesión de asistente y quedó escrito de forma permanente en su
   transcript. Eso convertía ese historial en una custodia no elegida — con él
   más **uno solo** de los otros dos fragmentos se reconstruía la passphrase, y
   el umbral efectivo caía de 2-de-3 a 1-de-2.

   La regeneración lo cierra de raíz: el secreto nuevo tiene huella
   `8542ead8aca45412` frente a `d8981a619fe7158a` del anterior, así que **todo el
   material del juego viejo es hoy un dato muerto**. ⚠️ Queda una acción física:
   el `shard-2` viejo se entregó a una custodia externa y hay que **recuperarlo y
   destruirlo**, o quedará en el mundo un fragmento que parece válido y no lo es.

   Verificación del juego nuevo, sin imprimir ningún valor:

   | Comprobación | Resultado |
   |---|---|
   | Formato de los 3 fragmentos (`idx-hex`, 64 car. de hex) | OK los tres |
   | Un fragmento aislado | «hacen falta al menos 2 shards» en los tres |
   | Los 3 pares reconstruyen el mismo secreto | huella `8542ead8aca45412` |
   | 2 fragmentos descifran el blob nuevo | devuelve `264BA15B…25BF3A7A` |

   Huellas de los ficheros: `shard-1` `0c9931618b06d1b8…`, `shard-2`
   `3d9fac8d7a5f6f13…`, `shard-3` `6b5159e63c21d498…`.

   **Regla que motivó la regeneración:** ningún fragmento vuelve a pasar por un
   canal que deje registro —chat, correo, ticket, captura—. Se leen en la
   terminal local y se transcriben desde ahí.

   El plan de reparto vive en `~/.zasa-shards/DISTRIBUCION.md` y **no se
   versiona**: una vez rellenada su tabla de custodias es el mapa de dónde están
   los fragmentos, y publicarlo en GitHub le ahorraría el trabajo a quien
   quisiera juntarlos. Ejecutar el reparto es trabajo manual de Jaime, en tres
   momentos distintos.

   Se descartó **empaquetar los tres juntos** —zip, tar o adjunto cifrado—. Un
   archivo con los tres es un objeto único que reconstruye la clave entera: en
   cuanto existe, el esquema deja de ser 2-de-3 y pasa a ser 1-de-1. Cifrarlo no
   lo arregla, porque exigiría una contraseña nueva que recordar, que es el
   problema que este esquema resuelve. Salen de uno en uno.

   Comprobado que un fragmento aislado no revela nada: `combine` con uno solo
   responde «hacen falta al menos 2 shards», y cualquier par reconstruye el mismo
   secreto (huella `d8981a619fe7158a` en los tres pares).

2. **Sacar los dos certificados de revocación de esta máquina**
   (`~/.gnupg/openpgp-revocs.d/`: el de la clave nueva y el de la vieja). Quien
   los tenga puede invalidar la clave; guardarlos donde no esté ella.

3. **Conectar el respaldo a un proceso real.** Hay clave y custodia; no hay
   todavía ningún proceso que cifre y saque datos de ExamenFácil. Eso es trabajo
   aparte y aún sin diseñar.

### Histórico de la fase C (cerrada el 2026-09-06)

0. **Passphrase de la clave maestra.** La clave nueva nació con ella, así que este
   paso —que en la clave vieja estuvo abierto del 2026-09-03 al 09-05— ya no aplica.

2. **✅ RESUELTO (2026-09-05) — `shamir.pl`, port a Perl 5.38.2.**
   Sigue sin haber Python: `python`/`python3` resuelven al shim de Microsoft Store (no es un intérprete) y `py` no existe. En vez de instalarlo se portó el algoritmo a `tools/gpg-backup/shamir.pl`: GF(2⁸) con el polinomio AES `0x11b`, **cero módulos CPAN** (solo `strict`/`warnings`), formato de shard `idx-hex` idéntico al de Python. Aleatoriedad exclusivamente de `/dev/urandom`, y si no está **aborta sin generar nada** — nunca cae a `rand()`.
   Verificado con `tools/gpg-backup/shamir_test.pl`: **27/27 en verde**, incluidos los known-answer tests del campo AES, un barrido exhaustivo 255×255 de `gf_div`, 200 round-trips de 2-de-3, la propiedad de umbral en 3-de-5 y la CLI end-to-end sobre un secreto binario con NUL/0xFF/CRLF.

3. **✅ RESUELTO (2026-09-05) — `fase3_shards.sh` ya no depende de Python.**
   Se eliminó el preflight que buscaba `python3`/`python`/`py` y las 5 invocaciones del motor apuntan a `perl shamir.pl` (incluido el `cp` que deja una copia del motor junto a los shards y el procedimiento de rescate que se escribe en `RESTORE.md`). No queda ninguna referencia a `shamir.py` en el script.
   El preflight nuevo, además de exigir `perl` y la presencia de `shamir.pl`, hace un **round-trip 2-de-3 en seco con un valor de juguete** antes de tocar nada: si el motor está roto o `/dev/urandom` no responde, aborta sin haber generado passphrase ni ficheros. Validado con `bash -n` (exit 0) y ejecutando el bloque de preflight aislado, incluidos los dos caminos de fallo (motor ausente → exit 1; motor corrupto → exit 1).

4. **✅ EJECUTADO (2026-09-06) — blob cifrado y 3 shards generados.**
   `bash "C:/Proyectos/tools/gpg-backup/fase3_shards.sh"`, lanzado a mano en una
   ventana de Git Bash (el script es interactivo: necesita un terminal de verdad
   para pedir la passphrase, y desde el endurecimiento del 2026-09-05 aborta con
   un diagnóstico honesto si no lo hay, en vez de mentir diciendo «esa passphrase
   no abre»).

   Artefactos en `~/.zasa-shards/`: `shard-1.txt`, `shard-2.txt`, `shard-3.txt`,
   `master_sec.aes256.asc`, `RESTORE.md` y una copia de `shamir.pl`.

   **Verificación independiente**, hecha después y sin imprimir ningún secreto:

   | Comprobación | Resultado |
   |---|---|
   | Formato de los 3 shards (`idx-hex`, 64 car. de hex) | OK los tres |
   | Las 3 parejas (1+2, 1+3, 2+3) reconstruyen el MISMO secreto | huella `d8981a619fe7158a` en las tres |
   | 2 shards descifran el blob y devuelven la clave | huella `264BA15B…25BF3A7A`, la esperada |

   El umbral 2-de-3 es real: dos fragmentos cualesquiera bastan, uno solo no
   revela nada.

---

## 🔴 Hallazgo que cambia el modelo de riesgo (2026-09-05)

**La passphrase de la clave viva (la que pone Jaime a mano) NO es prescindible tras la fase C. Sigue haciendo falta para restaurar.**

`gpg --export-secret-keys` **no** exporta la privada en claro: la exporta con su propia protección S2K intacta. Verificado en un llavero aislado y desechable:

```
:secret key packet:
	iter+salt S2K, algo: 7, SHA1 protection, hash: 2, salt: …
	skey[2]: [v4 protected]
```

Así que el blob que produce `fase3_shards.sh` es `AES256(PASS_aleatoria, privada_que_sigue_bajo_KEYPASS)`. Para restaurar hacen falta **2 shards Y la passphrase memorizada**, no una cosa o la otra.

Esto contradice la decisión de arquitectura nº 1, que prometía «degradación grácil — 2 shards te salvan si olvidas la passphrase». **Tal como está escrito el script, eso es falso**: si Jaime olvida la passphrase, los tres shards juntos no recuperan la clave.

**Y el paso [6] no lo detecta.** Su prueba de restauración descifra el blob y hace `gpg --import-options show-only --import | grep <huella>`. Comprobado: `show-only` imprime la huella de una clave protegida **sin pedir la passphrase**, así que el test da OK igualmente. Es confianza falsa: verifica que el blob contiene la clave, no que la clave se pueda usar.

Dos salidas, hay que elegir una **antes** de ejecutar la fase C:

1. **Aceptar que la passphrase es un cuarto secreto** y respaldarla con el mismo rigor que los shards (papel, custodia aparte). El esquema pasa a ser «2-de-3 **y** la memoria», no «2-de-3 **o** la memoria».
2. **Cambiar el script** para que la privada se exporte sin protección propia dentro del pipe (quitar la passphrase, exportar, restaurarla) de modo que el único secreto que la protege sea `PASS`, la que sí está partida en 3. Es lo que la decisión nº 1 pretendía, y devuelve la degradación grácil.

Mientras esto no se decida, la fase C **no** debe ejecutarse: produciría un respaldo cuyo modo de fallo real no es el documentado.

---

## 🔴 Doble factor no intencionado — reconfirmado el 2026-09-08

**La advertencia de arriba no se atendió: la fase C se ejecutó igualmente el 2026-09-06 y el juego de shards vigente arrastra el problema.** No es una hipótesis; se probó de extremo a extremo sobre un respaldo real del VPS.

### Evidencia (2026-09-08)

| Paso | Resultado |
|---|---|
| `shard-1 + shard-3` → `shamir.pl combine` | ✅ passphrase reconstruida (32 car.) |
| Un shard aislado | ✅ «hacen falta al menos 2 shards» |
| Descifrado de `master_sec.aes256.asc` con esa passphrase | ✅ `rc=0` |
| Importación en llavero aislado | ✅ huella `264BA15B…25BF3A7A` correcta |
| **Descifrar un `.tar.gz.gpg` real con esa clave** | ❌ **`public key decryption failed: Bad passphrase`** |
| `gpg --list-packets` del blob descifrado | `iter+salt S2K, algo: 7, SHA1 protection` en clave **y** subclave |

Es exactamente el modo de fallo descrito el 09-05: el blob es `AES256(PASS_shamir, privada_bajo_KEYPASS)`. La regeneración del 09-06 cambió el secreto, no la estructura.

Por contraste, con la subclave desbloqueada en `gpg-agent` el mismo respaldo se recupera entero: los 6 ficheros vuelven **idénticos byte a byte** al original vivo. El cifrado, el formato y el contenido son correctos; lo único roto es **por qué vía se llega a la clave**.

### Por qué esto sobrevivió tres días sin verse

`RESTORE.md` termina en «verifica que la huella sea 264BA15B…». Igual que el paso [6] del script, **confunde importar la clave con poder usarla**: la huella se imprime sin desbloquear nada. Toda prueba de recuperación tiene que terminar en un descifrado real, no en una huella.

### Matriz de riesgo del estado ACTUAL

| Escenario | ¿Se recuperan los respaldos hoy? |
|---|---|
| Se pierde el portátil, sobreviven 2 shards + Jaime recuerda la passphrase | ✅ Sí |
| Se pierde el portátil, sobreviven 2 shards, **passphrase olvidada** | ❌ **No.** Pérdida total |
| Portátil intacto, se pierden los 3 shards | ✅ Sí (la clave sigue en el llavero) |
| Un tercero obtiene 2 shards **sin** la passphrase | ✅ No puede descifrar (mitigación no buscada, pero real) |

La segunda fila es la que importa: **hay un secreto crítico sin respaldo, y vive solo en la memoria de una persona.**

### Decisión tomada (2026-09-08): opción 2

Se regenera el blob exportando la privada **sin** protección propia, de modo que el único secreto sea `PASS`, la que sí está partida 2-de-3. Se descartó documentar el doble factor: la segunda mitad no está custodiada en ningún sitio, y escribirla en un runbook como si lo estuviera convierte un fallo en política.

**Pendiente de ejecución por Jaime** — requiere teclear la passphrase actual, que no debe pasar por una sesión de asistente (ver la regla de la fase D). Procedimiento en `~/.zasa-shards/REGENERAR.md`.

🔴 **La fase D queda bloqueada hasta que esto se ejecute.** Repartir hoy los shards sería repartir una recuperación que no funciona sola.

---

## Deuda abierta, fuera de la ruta crítica

- **`161.35.85.101` no está en `CLAUDE.md`.** Un `grep -rn` sobre `C:\Proyectos` da cero resultados; solo existía en `~/.ssh/known_hosts`. Recibe material criptográfico y nadie puede auditar qué corre ahí. Falta que Jaime confirme qué es y de qué se «restauró», y agregarlo a la tabla de infraestructura junto a `159.223.213.237` y `161.35.157.69`.
- **La pública en el VPS quedó con confianza `[ unknown]`.** Cifrar contra ella exigirá `--trust-model always` o fijar ownertrust:
  ```
  ! ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 "echo '264BA15BA5D83EA58FAB0E648F82F64B25BF3A7A:6:' | gpg --import-ownertrust && gpg --list-keys"
  ```
- **El certificado de revocación sigue junto a la clave.** Quien lo tenga puede invalidarte la clave; guardarlo aparte.
- **Nada de esto está conectado todavía a un respaldo real de ExamenFácil.** Hay una clave y (pronto) un esquema de custodia, pero ningún proceso que cifre y saque datos. Eso es trabajo aparte y aún sin diseñar.

---

## Herramientas

En **`C:\Proyectos\tools\gpg-backup\`** — versionadas en `agencia-root-orchestrator`.

> **Corrección 2026-09-03:** primero las puse en `Workspace_Clientes/ExamenFacil/tools/`, creyendo que ese directorio era el árbol de trabajo de `examenfacil-cl`. **No lo es**: es un contenedor que cuelga del repo raíz, y `Workspace_Clientes/` está entero en su `.gitignore` (línea 10) — o sea que ahí quedaban sin versionar y sin respaldar. El repo real `examenfacil-cl` está un nivel más abajo, en `Workspace_Clientes/ExamenFacil/examenfacil-cl/`. Se descartó ponerlas ahí porque ese repo despliega por rsync a producción en cada push y el tooling acabaría en el web root.

| Fichero | Qué hace |
|---|---|
| `shamir.py` | Original en Python, solo biblioteca estándar. **No ejecutable en esta máquina** (no hay intérprete). Se conserva como referencia del algoritmo |
| `shamir.pl` | **Port a Perl 5.38.2 — el que se usa.** Shamir sobre GF(2⁸) sin CPAN. `split K N` / `combine`, formato de shard idéntico al de Python. **Necesario para restaurar** — sin él los shards son bytes sin sentido |
| `shamir_test.pl` | Pruebas sintéticas de `shamir.pl`: KAT del campo, barrido 255×255 de la división, round-trips, umbral y CLI binaria. `cd tools/gpg-backup && perl shamir_test.pl` → 27/27 |
| `fase3_shards.sh` | Fase C completa: passphrase → Shamir → cifrado por pipe → verificación → ACL → huellas. **Invoca `perl shamir.pl`** (desde 2026-09-05; ya no requiere Python) y su preflight hace un round-trip en seco del motor antes de generar nada. **Pide al inicio la passphrase de la clave viva** (GnuPG 2.1+ exige desbloquearla para `--export-secret-keys`) y la valida con una firma de prueba antes de tocar nada. Deja vacío si la clave aún no tiene passphrase |
| `fase2_vps.sh` | Fase B, ya ejecutada. Se conserva como referencia de la auditoría |

Ninguno contiene secretos.

> **Ubicación congelada hasta el cierre de la Fase D (2026-09-09).** En la
> reestructuración de "monorepo lógico" se propuso mover `tools\` a
> `Workspace_Agencia\packages\gpg-backup\`. Se **descartó**: esa ruta cae bajo
> `Workspace_Agencia/*`, ignorado en el `.gitignore` raíz, así que el movimiento
> habría sacado estos cinco ficheros del control de versiones sin generar ni un
> aviso — y `shamir.pl` es **necesario para restaurar**. Además rompería la ruta
> absoluta que documenta la fase C más arriba. Se revisa cuando la Fase D cierre.

---

## Nota sobre la numeración

Los prompts de esta sesión usaron «Fase 1» y «Fase 2» con significados distintos en momentos distintos (`FASE2_VPS_OK` para el VPS, luego `FASE1_SHARDS_OK` para los shards, que es cronológicamente posterior). Este documento usa **A/B/C/D en orden cronológico real** para cortar esa ambigüedad. Si retomas con los nombres viejos, traduce contra la tabla de arriba.
