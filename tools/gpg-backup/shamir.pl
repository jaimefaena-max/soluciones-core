#!/usr/bin/env perl
# Shamir's Secret Sharing sobre GF(2^8) — ZASA / solucionesconia.cl
#
# Port 1:1 de shamir.py a Perl 5.38 (sin modulos CPAN). Formato de shard
# IDENTICO al de Python, para interoperar con shards ya emitidos:
#   split K N : lee el secreto por stdin, escribe N lineas "idx-hex" por stdout
#   combine   : lee >= K lineas "idx-hex" por stdin, escribe el secreto por stdout
#
# Cada shard mide lo mismo que el secreto (propiedad de Shamir: un shard
# aislado no revela NADA). Aleatoriedad: SOLO /dev/urandom; si no esta, aborta
# sin generar nada (falla cerrado — jamas cae a rand() inseguro).
use strict;
use warnings;

# --- Tablas GF(2^8): polinomio AES 0x11b, generador 0x03 -------------------
my (@EXP, @LOG);
{
    my $x = 1;
    for my $i (0 .. 254) {
        $EXP[$i] = $x;
        $LOG[$x] = $i;
        my $h = $x & 0x80;               # multiplicar por 3 = (x*2) XOR x
        $x = ($x << 1) & 0xFF;
        $x ^= 0x1B if $h;
        $x ^= $EXP[$i];
    }
    $EXP[$_] = $EXP[$_ - 255] for 255 .. 511;   # tabla duplicada: sin mod en mul
}

sub gf_mul {
    my ($a, $b) = @_;
    return 0 if $a == 0 || $b == 0;
    return $EXP[ $LOG[$a] + $LOG[$b] ];
}

sub gf_div {
    my ($a, $b) = @_;
    die "division por cero en GF(256)\n" if $b == 0;
    return 0 if $a == 0;
    return $EXP[ ($LOG[$a] - $LOG[$b]) % 255 ];   # % de Perl sigue signo del divisor: no negativo
}

# --- Aleatoriedad segura (lazy; falla cerrado) -----------------------------
my $URND;
sub rand_byte {
    unless (defined $URND) {
        open($URND, '<:raw', '/dev/urandom')
            or die "ERROR: /dev/urandom indisponible; sin aleatoriedad segura no se generan shards\n";
    }
    my $b;
    read($URND, $b, 1) == 1 or die "ERROR: lectura de /dev/urandom fallida\n";
    return ord($b);
}

# --- Split / combine -------------------------------------------------------
sub split_secret {
    my ($secret, $k, $n) = @_;
    die "se requiere 2 <= K <= N <= 255\n" unless 2 <= $k && $k <= $n && $n <= 255;
    my @shares = ('') x $n;
    for my $byte (unpack('C*', $secret)) {
        my @coefs = ($byte, map { rand_byte() } 1 .. ($k - 1));   # poly: a0=byte, a1..a(k-1) random
        for my $idx (1 .. $n) {
            my $acc = 0;
            $acc = gf_mul($acc, $idx) ^ $_ for reverse @coefs;    # Horner de grado alto a bajo
            $shares[$idx - 1] .= chr($acc);
        }
    }
    return @shares;   # posicion i (0-based) => bytes del shard con x = i+1
}

sub combine {
    my @shares = @_;   # lista de [x, ybytes]
    die "hacen falta al menos 2 shards\n" if @shares < 2;
    my %seen;
    $seen{$_->[0]}++ and die "shards con indice repetido\n" for @shares;
    my $len = length($shares[0][1]);
    length($_->[1]) == $len or die "shards de largo distinto: hay uno corrupto\n" for @shares;

    my $out = '';
    for my $pos (0 .. $len - 1) {
        my $acc = 0;
        for my $j (0 .. $#shares) {
            my ($xj, $yj) = @{ $shares[$j] };
            my ($num, $den) = (1, 1);
            for my $m (0 .. $#shares) {
                next if $m == $j;
                my $xm = $shares[$m][0];
                $num = gf_mul($num, $xm);
                $den = gf_mul($den, $xm ^ $xj);
            }
            $acc ^= gf_mul(ord(substr($yj, $pos, 1)), gf_div($num, $den));
        }
        $out .= chr($acc);
    }
    return $out;
}

# --- CLI -------------------------------------------------------------------
sub main {
    binmode(STDIN);
    binmode(STDOUT);
    my $cmd = shift(@ARGV) // '';

    if ($cmd eq 'split') {
        my ($k, $n) = (int($ARGV[0] // 0), int($ARGV[1] // 0));
        local $/;
        my $secret = <STDIN> // '';
        die "ERROR: secreto vacio en stdin\n" if length($secret) == 0;
        my @sh = split_secret($secret, $k, $n);
        print +($_ + 1) . '-' . unpack('H*', $sh[$_]) . "\n" for 0 .. $#sh;
    }
    elsif ($cmd eq 'combine') {
        local $/;
        my $data = <STDIN> // '';
        my @shares;
        my $ln = 0;
        for my $line (split /\r?\n/, $data) {
            $ln++;
            $line =~ s/#.*$//;             # comentario de custodio hasta fin de linea
            for my $tok (grep { length } split /\s+/, $line) {
                # Formato estricto "idx-hex". Un shard mal transcrito se para en
                # seco: adivinar aqui devolveria una passphrase silenciosamente
                # equivocada, que es el peor fallo posible en este flujo.
                my ($idx, $hex) = $tok =~ /^([0-9]{1,3})-([0-9a-fA-F]+)$/
                    or die "ERROR: linea $ln, no es un shard valido: '$tok'\n";
                die "ERROR: linea $ln, indice fuera de rango 1..255: $idx\n"
                    if $idx < 1 || $idx > 255;
                die "ERROR: linea $ln, hex de largo impar (shard truncado)\n"
                    if length($hex) % 2;
                push @shares, [ $idx + 0, pack('H*', $hex) ];
            }
        }
        die "ERROR: no se leyo ningun shard por stdin\n" unless @shares;
        print combine(@shares);
    }
    else {
        die "uso: shamir.pl split K N  |  shamir.pl combine\n";
    }
}

main() unless caller();   # 'require' (tests) no dispara la CLI
1;
