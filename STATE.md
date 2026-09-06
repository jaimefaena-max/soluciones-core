# STATE — Respaldo soberano de la clave GPG (ExamenFácil / solucionesconia.cl)

> Última actualización: **2026-09-06**
> Objetivo del hilo: cumplir Ley 20.584 con respaldos cifrados de ExamenFácil bajo un esquema de llave dividida.
> Este documento es la fuente de verdad del avance. **Todo lo marcado ✅ fue verificado con salida real de comando; nada se da por hecho.**

---

## Estado actual

| Fase | Qué es | Estado |
|---|---|---|
| **A. Par de claves local** | Generar la clave maestra y exportar la pública | ✅ **Completada** (verificada) |
| **B. Import y auditoría en el VPS** | Llevar la pública al servidor y probar que la privada no está ahí | 🔴 **INVALIDADA por la rotación del 2026-09-06** — el VPS sigue con la pública de la clave VIEJA. Hay que rehacerla |
| **C. Shamir 2-de-3 de la passphrase** | Passphrase → cifrar la privada → partir la passphrase en 3 | ✅ **Completada y verificada el 2026-09-06** |
| **D. Distribución a custodios** | Repartir los 3 shards a modos de fallo independientes | ⬜ **No iniciada** (depende de C) |

### Fase A — completada

- Clave: `Zasa Backups <admin@solucionesconia.cl>`
- Huella: `264BA15BA5D83EA58FAB0E648F82F64B25BF3A7A`
- Key ID corto: `8F82F64B25BF3A7A`
- Algoritmo: **ed25519** [SC] + subclave **cv25519** [E]. **Sin caducidad** (decisión de la rotación del 2026-09-06; la clave anterior caducaba en 2028-09-02).
- Nació protegida con passphrase: `KEYINFO --list` da `P` en los dos keygrips desde el primer minuto. La clave anterior estuvo `C` (en claro) desde su generación hasta el 2026-09-05.
- 🔴 `Workspace_Clientes/ExamenFacil/public.key` **NO se ha regenerado**: sigue conteniendo la pública de la clave VIEJA `A1392D408D8D6A06` (sha256 `acda4b25…07ad4`, verificado el 2026-09-06 con `gpg --show-keys`). Hay que reexportarla.
- Certificado de revocación en `~/.gnupg/openpgp-revocs.d/264B…3A7A.rev` — **sigue en la misma máquina que la clave; hay que sacarlo de ahí.**

### Fase B — 🔴 INVALIDADA por la rotación del 2026-09-06

**Lo que sigue describe la clave VIEJA.** Verificado el 2026-09-06 contra el servidor:

```
$ ssh -i ~/.ssh/elrincon_deploy root@161.35.85.101 'gpg --list-keys --keyid-format LONG'
pub   ed25519/A1392D408D8D6A06 2026-09-03 [SC] [expires: 2028-09-02]
      2D9B0DE5BD164F4FD7524ACEA1392D408D8D6A06
uid                 [ unknown] Zasa Backups <admin@solucionesconia.cl>
```

El VPS conserva la pública de una clave cuya privada **ya no existe en ninguna
parte**: se borró del llavero local y su respaldo cifrado se eliminó el
2026-09-06. Cualquier cosa que se cifrara hoy contra ella sería irrecuperable.
Nada lo está —el proceso de cifrado real nunca llegó a construirse—, pero la
fase B hay que **rehacerla con la clave nueva** antes de cifrar el primer dato.

Lo que SÍ sigue siendo válido de la auditoría original: el llavero **secreto**
del VPS está vacío (`gpg --list-secret-keys` devuelve 0 líneas, recomprobado el
2026-09-06). La separación pública/privada nunca se rompió.

Registro de la auditoría original (clave vieja):

- Servidor: `161.35.85.101`, hostname **`zasa-server-restaurado`**, acceso `root` con `~/.ssh/elrincon_deploy`.
- Pública importada en `/root/public.key` → llavero de root. SHA-256 idéntico en ambas puntas.
- Auditoría de separación: llavero secreto vacío (0), `private-keys-v1.d/` vacío (0 ficheros `.key`), cero bloques `PRIVATE KEY BLOCK` en `/root /home /opt /var/backups /tmp`, `.bash_history` sin rastros.
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

2. **Los shards viven fuera de todo árbol Git**, en `C:\Users\LENOVO\.zasa-shards\` con ACL de `icacls` (herencia rota, acceso exclusivo del usuario). Rechazado explícitamente ponerlos en `Workspace_Clientes/ExamenFacil/shards/`: un `git add .` los publicaría en GitHub.

3. **La privada en claro nunca toca el disco.** El export va por *pipe* en memoria directo al cifrado. Esto sustituye al `shred` del plan original, que en SSD no borra: el wear-leveling del FTL deja el original en NAND no mapeada.

4. **Sin contraseñas independientes por shard.** Shamir ya da la propiedad de umbral; añadir 3 contraseñas convierte 3 secretos en 5 y multiplica el riesgo de pérdida permanente sin subir la seguridad.

5. **`chmod 600` es cosmético en NTFS.** Lo que gobierna es la ACL; se fija con `icacls`.

---

## Siguiente paso pendiente

**La fase C está cerrada. Lo que queda es la fase D y rehacer la B.** En este orden:

1. **🔴 Fase D — repartir los shards. Es lo único urgente.**
   Los tres están HOY en `~/.zasa-shards` de este portátil. Mientras siga así, el
   umbral 2-de-3 **no protege de nada**: quien se lleve la máquina se los lleva
   todos, y con ellos la clave. Hay que llevarlos a tres custodias con modos de
   fallo independientes y borrar de aquí las dos que salgan.

2. **🔴 Rehacer la fase B con la clave nueva.** El VPS `161.35.85.101` sigue con
   la pública de `A1392D408D8D6A06`, rotada y sin privada en ninguna parte.
   Antes hay que reexportar `Workspace_Clientes/ExamenFacil/public.key`, que
   también apunta a la clave vieja.

3. **Sacar los dos certificados de revocación de esta máquina**
   (`~/.gnupg/openpgp-revocs.d/`: el de la clave nueva y el de la vieja). Quien
   los tenga puede invalidar la clave; guardarlos donde no esté ella.

4. **Conectar el respaldo a un proceso real.** Hay clave y custodia; no hay
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

---

## Nota sobre la numeración

Los prompts de esta sesión usaron «Fase 1» y «Fase 2» con significados distintos en momentos distintos (`FASE2_VPS_OK` para el VPS, luego `FASE1_SHARDS_OK` para los shards, que es cronológicamente posterior). Este documento usa **A/B/C/D en orden cronológico real** para cortar esa ambigüedad. Si retomas con los nombres viejos, traduce contra la tabla de arriba.
