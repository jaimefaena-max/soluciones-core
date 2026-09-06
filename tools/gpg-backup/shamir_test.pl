#!/usr/bin/env perl
# Pruebas sinteticas de shamir.pl — integridad matematica del GF(2^8),
# division/reconstruccion de shards y propiedad de umbral. Sin CPAN.
use strict;
use warnings;
require './shamir.pl';   # define gf_mul, gf_div, split_secret, combine (no corre la CLI)

my ($ok, $fail) = (0, 0);
sub is {
    my ($got, $exp, $name) = @_;
    if (defined $got && defined $exp && $got eq $exp) { $ok++;  printf "  ok   %s\n", $name; }
    else { $fail++; printf "  FAIL %s (got=%s exp=%s)\n", $name, $got // 'undef', $exp // 'undef'; }
}
sub dies {
    my ($code, $name) = @_;
    my $died = !eval { $code->(); 1 };
    if ($died) { $ok++; printf "  ok   %s (murio como debe)\n", $name; }
    else { $fail++; printf "  FAIL %s (no murio)\n", $name; }
}

print "== 1. Known-answer del campo GF(2^8) (polinomio AES 0x11b) ==\n";
is(gf_mul(0x57, 0x83), 0xc1, 'gf_mul(0x57,0x83)=0xc1  [KAT AES]');
is(gf_mul(0x53, 0xca), 0x01, 'gf_mul(0x53,0xca)=0x01  [inversos AES]');
is(gf_mul(0x00, 0xAB), 0x00, 'gf_mul por 0 = 0');
is(gf_mul(0xAB, 0x01), 0xAB, 'gf_mul por 1 = identidad');
# a/b*b == a para todo par no nulo (barrido exhaustivo 255x255)
my $inv_ok = 1;
for my $a (1..255) { for my $b (1..255) {
    $inv_ok = 0 if gf_mul(gf_div($a, $b), $b) != $a;
}}
is($inv_ok, 1, 'gf_div es inversa exacta de gf_mul (barrido 255x255)');
dies(sub { gf_div(5, 0) }, 'gf_div por cero');

print "== 2. Round-trip split(2,3): reconstruccion desde CUALQUIER par ==\n";
srand();
for my $trial (1..200) {
    my $secret = join '', map { chr(int(rand(256))) } 1 .. (8 + int(rand(40)));
    my @sh = split_secret($secret, 2, 3);   # x = 1,2,3
    is(length($sh[0]), length($secret), "trial $trial: shard mide como el secreto") if $trial <= 1;
    my @pairs = ([1,2],[1,3],[2,3]);
    for my $p (@pairs) {
        my @sub = map { [ $_, $sh[$_-1] ] } @$p;
        my $rec = combine(@sub);
        if ($rec ne $secret) { $fail++; printf "  FAIL trial %d par (%d,%d)\n", $trial, @$p; last; }
    }
    # los 3 juntos tambien
    my @all = map { [ $_, $sh[$_-1] ] } 1,2,3;
    $fail += ($secret ne combine(@all)) ? 1 : 0;
}
$ok++ unless $fail;   # 200 trials x 3 pares + triple, contados en bloque
print $fail ? "  (ver FAILs arriba)\n" : "  ok   200 trials x {3 pares + triple} reconstruyen exacto\n";

print "== 3. split(3,5): umbral real — 3 reconstruyen, 2 NO ==\n";
{
    my $secret = join '', map { chr(int(rand(256))) } 1..24;   # ~192 bits
    my @sh = split_secret($secret, 3, 5);
    is(scalar(@sh), 5, 'genera 5 shards');
    # varios 3-subconjuntos deben reconstruir
    my $three_ok = 1;
    for my $set ([1,2,3],[1,3,5],[2,4,5],[3,4,5]) {
        my @sub = map { [ $_, $sh[$_-1] ] } @$set;
        $three_ok = 0 if combine(@sub) ne $secret;
    }
    is($three_ok, 1, 'todo 3-subconjunto reconstruye el secreto');
    # 2 shards NO deben bastar (k=3): resultado != secreto
    my @two = ([1, $sh[0]], [2, $sh[1]]);
    is((combine(@two) ne $secret) ? 1 : 0, 1, '2 shards NO revelan el secreto (umbral respetado)');
}

print "== 4. Deteccion de corrupcion / mal uso ==\n";
{
    my @sh = split_secret("secreto-de-prueba", 2, 3);
    dies(sub { combine([1, $sh[0]]) }, 'un solo shard es rechazado');
    dies(sub { combine([1, $sh[0]], [2, substr($sh[1],0,-1)]) }, 'shards de largo distinto rechazados');
    dies(sub { combine([1, $sh[0]], [1, $sh[0]]) }, 'indice repetido rechazado');
    my @rec = ([1,$sh[0]],[3,$sh[2]]);
    is(combine(@rec), combine(@rec), 'combine es determinista');
}

print "== 5. CLI end-to-end (proceso real: split | combine) ==\n";
{
    # Secreto binario hostil: NUL, 0xFF, CR y LF dentro del propio secreto.
    my $secret = pack('C*', 0,255,13,10,26,0,0,1,127,128,200,7,0,255,10,13,64,65,0,254,9,32,0,171);
    my $tmp = ($ENV{TMPDIR} || '/tmp') . "/shamir_cli_$$";
    my $run = sub {   # ejecuta shamir.pl con stdin dado, devuelve (stdout, exit)
        my ($args, $stdin) = @_;
        open(my $w, '>:raw', "$tmp.in") or die; print $w $stdin; close $w;
        my $out = `$^X shamir.pl $args < "$tmp.in" 2>"$tmp.err"`;
        return ($out, $? >> 8);
    };

    my ($shards, $rc) = $run->('split 3 5', $secret);
    is($rc, 0, 'split 3 5 sale con codigo 0');
    my @lines = split /\n/, $shards;
    is(scalar(@lines), 5, 'la CLI emite 5 lineas');
    is((scalar(grep { /^[1-5]-[0-9a-f]{48}$/ } @lines) == 5) ? 1 : 0, 1,
       'formato "idx-hex" con 24 bytes por shard (identico al de Python)');

    # 3 shards en desorden, con comentarios de custodio y lineas en blanco
    my $mix = "# custodio B (caja fuerte)\n$lines[3]\n\n$lines[1]\n# custodio C\n$lines[4]\n";
    my ($rec, $rc2) = $run->('combine', $mix);
    is($rc2, 0, 'combine acepta comentarios, blancos y desorden');
    is(unpack('H*', $rec), unpack('H*', $secret), 'CLI reconstruye el binario byte a byte');

    # 2 shards con k=3: sale un valor, pero NO es el secreto
    my ($bad) = $run->('combine', "$lines[0]\n$lines[1]\n");
    is((unpack('H*', $bad) ne unpack('H*', $secret)) ? 1 : 0, 1,
       'CLI con 2 de 3 no revela el secreto');

    # Fallo cerrado ante transcripcion rota (aqui el port de Python solo avisaba)
    for my $bad_in (['2-zz99',        'hex invalido'],
                    ['2-abc',         'hex de largo impar'],
                    ['0-aabb',        'indice 0 fuera de rango'],
                    ['256-aabb',      'indice 256 fuera de rango'],
                    ['aabbccdd',      'linea sin indice'],
                    ['',              'stdin vacio']) {
        my (undef, $code) = $run->('combine', $bad_in->[0] ? "$lines[0]\n$bad_in->[0]\n" : '');
        is(($code != 0) ? 1 : 0, 1, "CLI rechaza: $bad_in->[1]");
    }
    unlink "$tmp.in", "$tmp.err";
}

print "\n";
printf "RESULTADO: %d ok, %d FAIL\n", $ok, $fail;
exit($fail ? 1 : 0);
