#!/usr/bin/env bash
# Fase 2 — transferencia + import + auditoria de separacion de llaves
# Uso:  bash fase2_vps.sh
set -uo pipefail

HOST="161.35.85.101"
USER="root"
LOCAL="/c/Proyectos/Workspace_Clientes/ExamenFacil/public.key"
REMOTE="/root/public.key"
SHA_LOCAL="acda4b25ef2e54ffc6629dcbeb25da2b1f0196fa01a85f8173b8f542b7907ad4"

SSH_OPTS="-o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=12"

echo "### FASE2_VPS_OK ###"
echo
echo "[0] Preflight local"
ls -l "$LOCAL" || { echo "FALLO: no existe $LOCAL"; exit 1; }
echo "sha256 local esperado: $SHA_LOCAL"
sha256sum "$LOCAL"
echo

# --- Descubrir que llave autentica (el usuario ejecuta esto sobre su propio host) ---
KEY=""
for k in elrincon_deploy id_ed25519 id_rsa gha_deploy_key; do
  if ssh -i "$HOME/.ssh/$k" $SSH_OPTS "$USER@$HOST" true 2>/dev/null; then
    KEY="$HOME/.ssh/$k"
    echo "[1] Autentica con: ~/.ssh/$k"
    break
  fi
done
if [ -z "$KEY" ]; then
  echo "[1] FALLO: ninguna llave de ~/.ssh autentica como $USER@$HOST."
  echo "    Revisa que la IP sea la correcta y que la llave este en authorized_keys."
  exit 1
fi
echo

echo "[2] Transferencia SCP"
scp -i "$KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes "$LOCAL" "$USER@$HOST:$REMOTE" || exit 1
echo "scp OK -> $USER@$HOST:$REMOTE"
echo

echo "[3+4] Import y auditoria estricta en el VPS"
ssh -i "$KEY" $SSH_OPTS "$USER@$HOST" REMOTE="$REMOTE" SHA_LOCAL="$SHA_LOCAL" 'bash -s' <<'REMOTE_AUDIT'
set -u
echo "--- host ---"
hostname; id -un; echo

echo "--- [4a] integridad en transito ---"
sha256sum "$REMOTE"
if sha256sum "$REMOTE" | grep -q "$SHA_LOCAL"; then
  echo "SHA256 MATCH: el fichero llego intacto"
else
  echo "SHA256 MISMATCH: ABORTAR, el fichero difiere del original"
  exit 1
fi
echo

echo "--- [3] gpg --import ---"
gpg --import "$REMOTE" 2>&1
echo

echo "--- llavero publico ---"
gpg --list-keys --keyid-format=long 2>/dev/null
echo

echo "--- [4b] gpg --list-secret-keys (debe salir VACIO) ---"
gpg --list-secret-keys 2>/dev/null
SEC=$(gpg --list-secret-keys --with-colons 2>/dev/null | grep -c '^sec:' || true)
echo "claves secretas en el llavero: ${SEC:-0}"
[ "${SEC:-0}" = "0" ] && echo "VEREDICTO 4b: OK — sin material privado en el llavero de root" \
                      || echo "VEREDICTO 4b: FALLO — hay clave privada en el llavero"
echo

echo "--- [4c] private-keys-v1.d/ ---"
ls -la /root/.gnupg/private-keys-v1.d/ 2>&1
N=$(ls -1 /root/.gnupg/private-keys-v1.d/*.key 2>/dev/null | wc -l)
echo "ficheros .key: $N"
[ "$N" = "0" ] && echo "VEREDICTO 4c: OK — almacen de claves privadas vacio" \
               || echo "VEREDICTO 4c: FALLO — hay $N clave(s) privada(s) en disco"
echo

echo "--- [4d] barrido de bloques privados en disco ---"
FOUND=$(grep -rl 'PRIVATE KEY BLOCK' /root /home /opt /var/backups /tmp 2>/dev/null)
if [ -z "$FOUND" ]; then
  echo "VEREDICTO 4d: OK — ningun bloque PGP PRIVATE KEY encontrado"
else
  echo "VEREDICTO 4d: FALLO — bloques privados en:"; echo "$FOUND"
fi
echo

echo "--- [4e] evidencia historica (limitacion conocida) ---"
echo "Lo anterior prueba el ESTADO ACTUAL, no que la privada 'nunca toco' el servidor."
echo "Rastros de transferencias previas:"
grep -riE 'secret-key|private.*key|\.asc|\.gpg' /root/.bash_history 2>/dev/null | tail -20 || echo "  (sin coincidencias en .bash_history)"
echo
echo "### FIN AUDITORIA ###"
REMOTE_AUDIT

echo
echo "### FASE2_VPS_OK ###"
