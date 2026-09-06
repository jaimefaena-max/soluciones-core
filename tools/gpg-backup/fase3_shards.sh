#!/usr/bin/env bash
# Fase 3 — respaldo soberano de la clave GPG maestra con umbral 2-de-3
#
#   passphrase aleatoria  --> Shamir 2-de-3 --> 3 shards en disco (ACL cerrada)
#   clave privada         --> AES-256 con esa passphrase --> blob cifrado
#
# La clave privada en claro NUNCA toca el disco: va por un pipe en memoria.
# La passphrase NUNCA aparece en pantalla, ni en argv, ni en un fichero.
set -uo pipefail

KEYID="8F82F64B25BF3A7A"
FPR="264BA15BA5D83EA58FAB0E648F82F64B25BF3A7A"
DIR="/c/Users/LENOVO/.zasa-shards"
DIR_WIN='C:\Users\LENOVO\.zasa-shards'
BLOB="$DIR/master_sec.aes256.asc"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "### FASE1_SHARDS_OK ###"
echo
echo "[0] Preflight"

# Shamir corre sobre Perl (shamir.pl). En esta maquina no hay interprete de
# Python: python/python3 son el shim de Microsoft Store y py no existe.
command -v perl >/dev/null 2>&1 || { echo "FALLO: no hay perl en PATH."; exit 1; }
[ -r "$HERE/shamir.pl" ] || { echo "FALLO: falta $HERE/shamir.pl"; exit 1; }
echo "perl     : $(perl -e 'print $^V') ($(command -v perl))"

# Prueba en seco del motor Shamir ANTES de generar nada: si el round-trip no
# devuelve exactamente lo que entro, no hay respaldo que valga. Usa un valor
# de juguete, nunca la passphrase real (que en este punto aun no existe).
SMOKE="zasa-preflight-$$"
SMOKE_SH="$(printf '%s' "$SMOKE" | perl "$HERE/shamir.pl" split 2 3)" || {
  echo "FALLO: shamir.pl no pudo dividir (revisa /dev/urandom)"; exit 1; }
SMOKE_RE="$(printf '%s\n' "$SMOKE_SH" | sed -n '1p;3p' | perl "$HERE/shamir.pl" combine)" || {
  echo "FALLO: shamir.pl no pudo reconstruir"; exit 1; }
[ "$SMOKE_RE" = "$SMOKE" ] || { echo "FALLO: round-trip de shamir.pl incorrecto. Aborto."; exit 1; }
unset SMOKE SMOKE_SH SMOKE_RE
echo "shamir   : shamir.pl OK (round-trip 2-de-3 verificado en seco)"
echo "gpg      : $(gpg --version | head -1)"

gpg --list-secret-keys "$KEYID" >/dev/null 2>&1 || { echo "FALLO: no existe la clave secreta $KEYID"; exit 1; }
echo "clave    : $KEYID presente en el llavero local"

# --- Passphrase de la clave viva (para poder exportarla) -------------------
# GnuPG 2.1+ exige desbloquear la clave para --export-secret-keys. La clave
# tiene passphrase desde el 2026-09-05; el caso "vacio" se conserva solo por si
# el script se reutiliza contra una clave que aun no la tenga.
#
# 🔴 ESTE SCRIPT ES INTERACTIVO Y NECESITA UN TERMINAL DE VERDAD.
# Antes leia siempre de /dev/tty. Ejecutado sin terminal (una sesion de agente,
# un cron, un pipe) eso fallaba con "No such device or address", y como el
# script corre con `set -u` la variable quedaba sin definir y el mensaje que
# salia era "esa passphrase no abre $KEYID" — un diagnostico FALSO que manda a
# revisar la passphrase cuando el problema es que no hay teclado. Ahora se
# detecta el terminal antes de preguntar y se aborta diciendo la verdad.
KEYPASS=""          # inicializada: con `set -u` un read fallido reventaba abajo

if [ -r /dev/tty ] && { : > /dev/tty; } 2>/dev/null; then
  ORIGEN_TTY="/dev/tty"
elif [ -t 0 ]; then
  # Sin /dev/tty utilizable pero con stdin conectado a un terminal (algunos
  # emuladores en Windows). Sirve igual: `read -s` sigue sin hacer eco.
  ORIGEN_TTY=""
else
  echo
  echo "FALLO: no hay terminal para pedir la passphrase (stdin no es un tty y"
  echo "       /dev/tty no esta disponible). No se ha tocado NADA."
  echo
  echo "       Este script debe ejecutarse a mano, en una ventana de Git Bash:"
  echo "         bash \"$HERE/fase3_shards.sh\""
  echo
  echo "       No aceptes la tentacion de pasar la passphrase por argumento o"
  echo "       por variable de entorno: quedaria en el historial y en la lista"
  echo "       de procesos, que es justo lo que este respaldo intenta evitar."
  exit 1
fi

echo
printf 'Passphrase de %s (no se muestra): ' "$KEYID"
if [ -n "$ORIGEN_TTY" ]; then
  read -r -s KEYPASS < "$ORIGEN_TTY"
else
  read -r -s KEYPASS
fi
echo

if printf 'probe' | gpg --batch --yes --pinentry-mode loopback --passphrase-fd 3 \
     --local-user "$KEYID" --sign -o /dev/null 3< <(printf '%s' "$KEYPASS") 2>/dev/null; then
  if [ -z "$KEYPASS" ]; then
    echo "unlock   : OK — AVISO: la clave NO tiene passphrase (desprotegida en ~/.gnupg)"
  else
    echo "unlock   : OK — la passphrase abre la clave"
  fi
else
  echo "FALLO: esa passphrase no abre $KEYID. No se ha tocado nada."
  exit 1
fi

if [ -e "$DIR" ] && [ -n "$(ls -A "$DIR" 2>/dev/null)" ]; then
  echo "FALLO: $DIR ya existe y NO esta vacio."
  echo "       Aborto para no pisar shards previos. Revisalo a mano."
  exit 1
fi
mkdir -p "$DIR" || exit 1
echo "destino  : $DIR_WIN (creado)"

# --- ACL restrictiva ANTES de escribir nada -------------------------------
echo
echo "[1] Cerrando ACL del directorio (antes de escribir el primer secreto)"
icacls "$DIR_WIN" /inheritance:r /grant:r "$(whoami):(OI)(CI)F" >/dev/null 2>&1 \
  && echo "icacls   : herencia rota, acceso exclusivo de $(whoami)" \
  || echo "AVISO    : icacls fallo; revisa permisos a mano antes de continuar"

# --- Generacion de la passphrase ------------------------------------------
echo
echo "[2] Generando passphrase maestra (192 bits desde /dev/urandom)"
PASS="$(head -c 24 /dev/urandom | base64 | tr -d '\n=' | tr '+/' '-_')"
[ ${#PASS} -lt 30 ] && { echo "FALLO: passphrase demasiado corta"; exit 1; }
echo "largo    : ${#PASS} caracteres | entropia: 192 bits | alfabeto base64url"
echo "(la passphrase NO se imprime: vive solo en los shards)"

# --- Shamir 2-de-3 ---------------------------------------------------------
echo
echo "[3] Shamir 2-de-3 sobre la passphrase"
cp "$HERE/shamir.pl" "$DIR/shamir.pl" || exit 1
printf '%s' "$PASS" | perl "$DIR/shamir.pl" split 2 3 > "$DIR/.shards.tmp" || exit 1

i=0
while read -r line; do
  i=$((i+1))
  {
    echo "# ZASA Shamir 2-de-3 — shard $i de 3"
    echo "# clave: Zasa Backups <admin@solucionesconia.cl>  fpr $FPR"
    echo "# Se necesitan DOS shards cualesquiera + master_sec.aes256.asc para restaurar."
    echo "# Un shard aislado no revela NADA. Ver RESTORE.md."
    echo "$line"
  } > "$DIR/shard-$i.txt"
done < "$DIR/.shards.tmp"
rm -f "$DIR/.shards.tmp"
echo "escritos : shard-1.txt shard-2.txt shard-3.txt"

# --- Verificacion de las 3 combinaciones ----------------------------------
echo
echo "[4] Verificando que las 3 parejas reconstruyen la misma passphrase"
ALLOK=1
for pair in "1 2" "1 3" "2 3"; do
  set -- $pair
  GOT="$(cat "$DIR/shard-$1.txt" "$DIR/shard-$2.txt" | grep -v '^#' | perl "$DIR/shamir.pl" combine)"
  if [ "$GOT" = "$PASS" ]; then
    echo "  shards $1+$2 -> OK"
  else
    echo "  shards $1+$2 -> FALLO"; ALLOK=0
  fi
done
[ "$ALLOK" = "1" ] || { echo "ABORTO: la reconstruccion fallo, no cifro nada."; exit 1; }

# --- Export + cifrado por pipe (sin texto plano en disco) -----------------
echo
echo "[5] Exportando y cifrando la privada (pipe en memoria, AES-256)"
gpg --batch --yes --pinentry-mode loopback --passphrase-fd 4 \
     --export-secret-keys "$KEYID" 4< <(printf '%s' "$KEYPASS") \
  | gpg --batch --yes --symmetric \
        --cipher-algo AES256 --digest-algo SHA512 \
        --s2k-mode 3 --s2k-digest-algo SHA512 --s2k-count 65011712 \
        --pinentry-mode loopback --passphrase-fd 3 \
        --armor -o "$BLOB" 3< <(printf '%s' "$PASS")
[ -s "$BLOB" ] || { echo "FALLO: el blob cifrado quedo vacio"; exit 1; }
echo "blob     : $(basename "$BLOB") ($(stat -c%s "$BLOB") bytes, ASCII-armored)"
echo "kdf      : S2K iterado+salado, SHA-512, 65.011.712 iteraciones"

# --- Prueba de restauracion extremo a extremo -----------------------------
echo
echo "[6] Prueba real de restauracion (shards 2+3, sin usar la passphrase en memoria)"
REC="$(cat "$DIR/shard-2.txt" "$DIR/shard-3.txt" | grep -v '^#' | perl "$DIR/shamir.pl" combine)"
if gpg --batch --yes --decrypt --pinentry-mode loopback --passphrase-fd 3 "$BLOB" 3< <(printf '%s' "$REC") 2>/dev/null \
     | gpg --batch --with-colons --import-options show-only --import 2>/dev/null | grep -q "$FPR"; then
  echo "  RESTAURACION OK: 2 shards descifran el blob y devuelven $FPR"
else
  echo "  RESTAURACION FALLIDA — no confies en este respaldo"; exit 1
fi
unset PASS REC KEYPASS

# --- Permisos por fichero + huellas ---------------------------------------
echo
echo "[7] Permisos y huellas"
for f in "$DIR"/shard-*.txt "$BLOB" "$DIR/shamir.pl"; do
  chmod 600 "$f" 2>/dev/null
  icacls "$(cygpath -w "$f")" /inheritance:r /grant:r "$(whoami):F" >/dev/null 2>&1
done
echo "chmod    : 600 (nota: en NTFS manda la ACL de icacls, no el modo POSIX)"
echo
echo "SHA-256 de cada fragmento:"
sha256sum "$DIR"/shard-1.txt "$DIR"/shard-2.txt "$DIR"/shard-3.txt "$BLOB" | sed 's|/c/Users/LENOVO/.zasa-shards/|  |'

cat > "$DIR/RESTORE.md" <<'RESTOREDOC'
# Restaurar la clave GPG maestra de Zasa Backups

Necesitas **dos** de los tres shards, mas `master_sec.aes256.asc`.
Un shard solo no sirve de nada y no revela nada.

    cd C:\Users\LENOVO\.zasa-shards
    PASS=$(cat shard-1.txt shard-3.txt | grep -v '^#' | perl shamir.pl combine)
    gpg --pinentry-mode loopback --passphrase-fd 3 --decrypt master_sec.aes256.asc 3< <(printf '%s' "$PASS") \
      | gpg --import
    unset PASS

Verifica que la huella sea:

    264BA15BA5D83EA58FAB0E648F82F64B25BF3A7A

## Pendiente critico

Los tres shards estan HOY en la misma maquina. Mientras siga asi, el umbral
2-de-3 no te protege de nada: quien tome el portatil se los lleva todos.
Repartelos a tres custodias con modos de fallo independientes y borra de aqui
las dos que salgan.

El blob `master_sec.aes256.asc` esta cifrado con AES-256: puedes respaldarlo
libremente (nube, USB, NAS) sin exponer la clave.
RESTOREDOC
echo
echo "guia     : RESTORE.md escrito en el directorio"
echo
echo "### FASE1_SHARDS_OK ###"
