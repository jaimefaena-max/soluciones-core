#!/usr/bin/env python3
"""
Shamir's Secret Sharing sobre GF(2^8) — ZASA / solucionesconia.cl

  split K N   : lee el secreto por stdin, escribe N shards "idx-hex" por stdout
  combine     : lee >= K lineas de shards por stdin, escribe el secreto por stdout

Cada shard tiene el mismo largo que el secreto (propiedad de Shamir: un shard
aislado no revela NADA del secreto, ni siquiera parcialmente).

Sin dependencias externas: solo la biblioteca estandar.
"""
import sys
import secrets

# --- Tablas GF(2^8), polinomio AES 0x11b, generador 0x03 -------------------
_EXP = [0] * 512
_LOG = [0] * 256


def _init_tables():
    x = 1
    for i in range(255):
        _EXP[i] = x
        _LOG[x] = i
        # multiplicar por 3 = x*2 XOR x
        h = x & 0x80
        x = (x << 1) & 0xFF
        if h:
            x ^= 0x1B
        x ^= _EXP[i]
    for i in range(255, 512):
        _EXP[i] = _EXP[i - 255]


_init_tables()


def gf_mul(a, b):
    if a == 0 or b == 0:
        return 0
    return _EXP[_LOG[a] + _LOG[b]]


def gf_div(a, b):
    if b == 0:
        raise ZeroDivisionError("division por cero en GF(256)")
    if a == 0:
        return 0
    return _EXP[(_LOG[a] - _LOG[b]) % 255]


# --- Split / combine -------------------------------------------------------
def split(secret: bytes, k: int, n: int):
    if not 2 <= k <= n <= 255:
        raise ValueError("se requiere 2 <= K <= N <= 255")
    shares = [bytearray() for _ in range(n)]
    for byte in secret:
        # poly(x) = byte + a1*x + ... + a(k-1)*x^(k-1)
        coefs = [byte] + [secrets.randbelow(256) for _ in range(k - 1)]
        for idx in range(1, n + 1):
            acc = 0
            # Horner de grado alto a bajo
            for c in reversed(coefs):
                acc = gf_mul(acc, idx) ^ c
            shares[idx - 1].append(acc)
    return [(i + 1, bytes(s)) for i, s in enumerate(shares)]


def combine(shares):
    if len(shares) < 2:
        raise ValueError("hacen falta al menos 2 shards")
    xs = [x for x, _ in shares]
    if len(set(xs)) != len(xs):
        raise ValueError("shards con indice repetido")
    length = len(shares[0][1])
    if any(len(y) != length for _, y in shares):
        raise ValueError("shards de largo distinto: hay uno corrupto")

    out = bytearray(length)
    for pos in range(length):
        acc = 0
        for j, (xj, yj) in enumerate(shares):
            num, den = 1, 1
            for m, (xm, _) in enumerate(shares):
                if m == j:
                    continue
                num = gf_mul(num, xm)
                den = gf_mul(den, xm ^ xj)
            acc ^= gf_mul(yj[pos], gf_div(num, den))
        out[pos] = acc
    return bytes(out)


# --- CLI -------------------------------------------------------------------
def main():
    if len(sys.argv) >= 2 and sys.argv[1] == "split":
        k, n = int(sys.argv[2]), int(sys.argv[3])
        secret = sys.stdin.buffer.read()
        if not secret:
            sys.exit("ERROR: secreto vacio en stdin")
        for idx, share in split(secret, k, n):
            print("{}-{}".format(idx, share.hex()))

    elif len(sys.argv) >= 2 and sys.argv[1] == "combine":
        shares = []
        for line in sys.stdin.read().split():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            idx, _, hexpart = line.partition("-")
            shares.append((int(idx), bytes.fromhex(hexpart)))
        sys.stdout.buffer.write(combine(shares))

    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
