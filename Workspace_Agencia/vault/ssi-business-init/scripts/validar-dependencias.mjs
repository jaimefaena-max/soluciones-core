#!/usr/bin/env node
/**
 * validar-dependencias.mjs — Compuerta previa al alta de un inquilino.
 *
 * POR QUÉ EXISTE
 * Aquí los fallos son de dos clases y ninguna es ruidosa en el momento correcto:
 *
 *   a) Los que TUMBAN EL ARRANQUE PARA TODOS. Un tenantId con un typo o un token
 *      corto en TENANT_TOKENS hacen abortar el orquestador — y eso deja fuera no
 *      solo al cliente nuevo, sino a todos los que ya estaban dentro. Este script
 *      aplica las MISMAS reglas de parseo que el arranque, antes de desplegar.
 *
 *   b) Los que dejan una puerta abierta sin decir nada. Sin ninguna fuente de
 *      identidad de inquilino, todo el tráfico llega como `staff` y el
 *      aislamiento entre clientes simplemente no existe, aunque cada ruta
 *      individual parezca correcta.
 *
 * QUÉ NO HACE
 * No abre conexiones, no toca el VPS, no escribe nada y no imprime ningún token
 * (solo longitudes y huellas cortas). Ejecutable en CI sin exponer credenciales.
 *
 * USO
 *   node scripts/validar-dependencias.mjs                  # valida ./.env
 *   node scripts/validar-dependencias.mjs --env ../x/.env
 *   node scripts/validar-dependencias.mjs --json
 *
 * SALIDA
 *   0 → sin errores (puede haber avisos)
 *   1 → al menos un error: NO desplegar
 *   2 → no se pudo leer el fichero de entorno
 *
 * Sin dependencias externas: solo módulos nativos de Node.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const AQUI = dirname(fileURLToPath(import.meta.url));
const NODE_MINIMO = 20;

/* Reglas copiadas del arranque. Si divergen, este script deja de servir. */
const RE_TENANT_ID = /^[a-z0-9][a-z0-9-]*$/;
const LARGO_MINIMO_TOKEN_INQUILINO = 32; // 128 bits en hex
const LARGO_MINIMO_TOKEN_STAFF = 16;
const LARGO_MINIMO_FIRMA_CLIENTE = 32;

/* ── Presentación ────────────────────────────────────────────────────────── */

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
    bold: (s) => (color ? `\x1b[1m${s}\x1b[0m` : s),
    dim: (s) => (color ? `\x1b[2m${s}\x1b[0m` : s),
    rojo: (s) => (color ? `\x1b[31m${s}\x1b[0m` : s),
    verde: (s) => (color ? `\x1b[32m${s}\x1b[0m` : s),
    amar: (s) => (color ? `\x1b[33m${s}\x1b[0m` : s),
};

const hallazgos = [];
const error = (clave, mensaje, arreglo) =>
    hallazgos.push({ nivel: 'error', clave, mensaje, arreglo });
const aviso = (clave, mensaje, arreglo) =>
    hallazgos.push({ nivel: 'aviso', clave, mensaje, arreglo });
const ok = (clave, mensaje) => hallazgos.push({ nivel: 'ok', clave, mensaje });

const huella = (v) => createHash('sha256').update(v).digest('hex').slice(0, 8);

/* ── Argumentos ──────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
    console.log(`
${c.bold('validar-dependencias.mjs')} — ssi-business-init

  --env <ruta>   Fichero de entorno a validar (defecto: <componente>/.env)
  --json         Salida JSON (para CI)
  --help         Esta ayuda
`);
    process.exit(0);
}
const salidaJson = argv.includes('--json');
const idxEnv = argv.indexOf('--env');
const rutaEnv =
    idxEnv >= 0 && argv[idxEnv + 1]
        ? resolve(argv[idxEnv + 1])
        : resolve(join(AQUI, '..', '.env'));

/* ── Lectura del .env ────────────────────────────────────────────────────── */

/**
 * Parser mínimo, sin dotenv: este script debe poder correr en un checkout sin
 * `npm install`, que es justo cuando uno quiere saber qué le falta.
 */
function leerEnv(ruta) {
    const texto = readFileSync(ruta, 'utf8');
    const env = Object.create(null);
    for (const linea of texto.split(/\r?\n/)) {
        const l = linea.trim();
        if (!l || l.startsWith('#')) continue;
        const m = l.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!m) continue;
        let v = m[2].trim();
        if (
            (v.startsWith('"') && v.endsWith('"') && v.length > 1) ||
            (v.startsWith("'") && v.endsWith("'") && v.length > 1)
        ) {
            v = v.slice(1, -1);
        } else {
            v = v.replace(/\s+#.*$/, '').trim();
        }
        env[m[1]] = v;
    }
    return env;
}

if (!existsSync(rutaEnv)) {
    console.error(
        c.rojo(`No existe el fichero de entorno: ${rutaEnv}\n`) +
            `Copia la plantilla:  cp .env.example .env`,
    );
    process.exit(2);
}
const env = leerEnv(rutaEnv);
const val = (k) => (typeof env[k] === 'string' ? env[k].trim() : '');
const hay = (k) => val(k).length > 0;

/* ── 1. Entorno de ejecución ─────────────────────────────────────────────── */

const mayor = Number(process.versions.node.split('.')[0]);
if (Number.isFinite(mayor) && mayor >= NODE_MINIMO) {
    ok('node', `Node ${process.versions.node} (mínimo ${NODE_MINIMO})`);
} else {
    error('node', `Node ${process.versions.node} es anterior al mínimo ${NODE_MINIMO}`, `Instala Node ${NODE_MINIMO}+.`);
}

/* ── 2. Valores que siguen siendo la plantilla ───────────────────────────── */

const MARCAS_PLANTILLA = ['cambia-me', 'cambia_me', 'CAMBIA_ME', 'cliente-ejemplo', 'falsa', 'falso'];
for (const [clave, valor] of Object.entries(env)) {
    if (!valor) continue;
    const marca = MARCAS_PLANTILLA.find((m) => valor.includes(m));
    if (marca) {
        error(clave, `conserva el valor de plantilla (contiene «${marca}»)`, 'Sustitúyelo por el valor real.');
    }
}

/* ── 3. Token maestro ────────────────────────────────────────────────────── */

const staff = val('API_SECRET_TOKEN');
if (!staff) {
    error(
        'API_SECRET_TOKEN',
        'ausente — el servidor ABORTA el arranque (fail-closed)',
        'Genera uno: openssl rand -hex 32',
    );
} else if (staff.length < LARGO_MINIMO_TOKEN_STAFF) {
    error(
        'API_SECRET_TOKEN',
        `${staff.length} caracteres, el mínimo es ${LARGO_MINIMO_TOKEN_STAFF}`,
        'El arranque lo rechaza. Usa 64 hex.',
    );
} else {
    ok('API_SECRET_TOKEN', `presente (${staff.length} car., huella ${huella(staff)})`);
    if (staff.length < 32) {
        aviso('API_SECRET_TOKEN', 'por debajo de 32 caracteres', 'Cumple el mínimo, pero es el token que abre el Cockpit entero.');
    }
}

/* ── 4. TENANT_TOKENS: mismas reglas que el arranque ─────────────────────── */

/**
 * Reproduce `parsearTokensPorInquilino`. Cualquier excepción que lance el
 * arranque tiene que salir AQUÍ primero — abortar en producción por un typo deja
 * fuera también a los inquilinos que ya funcionaban.
 */
function parsearTenantTokens(raw) {
    const entradas = [];
    const problemas = [];
    if (!raw || !raw.trim()) return { entradas, problemas };

    for (const par of raw.split(',')) {
        const limpio = par.trim();
        if (!limpio) continue;
        const corte = limpio.indexOf(':');
        if (corte <= 0) {
            problemas.push(`entrada sin formato "id:token" → "${limpio.slice(0, 24)}…"`);
            continue;
        }
        const tenantId = limpio.slice(0, corte).trim();
        const token = limpio.slice(corte + 1).trim();
        if (!RE_TENANT_ID.test(tenantId)) {
            problemas.push(`tenantId inválido "${tenantId}" (kebab-case: ^[a-z0-9][a-z0-9-]*$)`);
            continue;
        }
        if (token.length < LARGO_MINIMO_TOKEN_INQUILINO) {
            problemas.push(`token de "${tenantId}" mide ${token.length}, mínimo ${LARGO_MINIMO_TOKEN_INQUILINO}`);
            continue;
        }
        entradas.push({ tenantId, token });
    }
    return { entradas, problemas };
}

const { entradas, problemas } = parsearTenantTokens(val('TENANT_TOKENS'));

for (const p of problemas) {
    error('TENANT_TOKENS', p, 'El arranque lanza y el orquestador NO levanta: caen TODOS los inquilinos, no solo este.');
}

const repetidos = entradas
    .map((e) => e.tenantId)
    .filter((id, i, a) => a.indexOf(id) !== i);
if (repetidos.length) {
    error('TENANT_TOKENS', `tenantId repetido: ${[...new Set(repetidos)].join(', ')}`, 'La última entrada gana en silencio. Deja una sola por inquilino.');
}

const tokensRepetidos = entradas
    .map((e) => e.token)
    .filter((t, i, a) => a.indexOf(t) !== i);
if (tokensRepetidos.length) {
    error('TENANT_TOKENS', 'dos inquilinos comparten el mismo token', 'Un token compartido es acceso cruzado: cada inquilino necesita el suyo.');
}

if (entradas.length && !problemas.length) {
    ok('TENANT_TOKENS', `${entradas.length} inquilino(s): ${entradas.map((e) => `${e.tenantId}(${huella(e.token)})`).join(', ')}`);
}

/* ── 5. ¿Existe alguna fuente de identidad de inquilino? ─────────────────── */

const confiaProxy = val('TRUST_PROXY_IDENTITY') === 'true';
if (!entradas.length && !confiaProxy) {
    error(
        'identidad-de-inquilino',
        'no hay NINGUNA fuente configurada: todo el tráfico llegará como `staff`',
        'Sin esto el aislamiento entre clientes no existe, aunque cada ruta parezca correcta. Define TENANT_TOKENS o activa TRUST_PROXY_IDENTITY con un proxy que inyecte X-Tenant-Id.',
    );
} else if (confiaProxy && !entradas.length) {
    aviso(
        'TRUST_PROXY_IDENTITY',
        'única fuente de identidad: la afirma el proxy',
        'Es la fuente débil. Solo vale si nginx GARANTIZA inyectar X-Tenant-Id en todos los locations de portal.',
    );
} else {
    ok('identidad-de-inquilino', confiaProxy ? 'tokens por inquilino + identidad del proxy' : 'tokens por inquilino');
}

if (val('STAFF_CROSS_TENANT') === 'true') {
    aviso(
        'STAFF_CROSS_TENANT',
        '"true": el token maestro entra a los portales de los clientes',
        'Cómodo para soporte, pero un token filtrado lee los documentos de todos. "false" = aislamiento estricto.',
    );
} else ok('STAFF_CROSS_TENANT', 'false — aislamiento estricto');

/* ── 6. Puertas que quedan abiertas por omisión ──────────────────────────── */

if (!hay('EDGE_SECRET')) {
    aviso(
        'EDGE_SECRET',
        'vacío — la prueba de borde queda DESACTIVADA',
        'Fallo abierto acotado y deliberado, pero en producción deja el origen accesible sin pasar por nginx. openssl rand -hex 32',
    );
} else if (val('EDGE_SECRET').length < 32) {
    aviso('EDGE_SECRET', `solo ${val('EDGE_SECRET').length} caracteres`, 'Usa 64 hex.');
} else ok('EDGE_SECRET', `presente (huella ${huella(val('EDGE_SECRET'))})`);

const firma = val('CLIENTE_AUTH_SIGNING_SECRET');
if (!firma) {
    aviso(
        'CLIENTE_AUTH_SIGNING_SECRET',
        'vacío — la sesión de cliente queda DESHABILITADA (401/503, nunca abierta)',
        'Correcto si el portal aún no usa login por cliente. Obligatorio si sí.',
    );
} else if (firma.length < LARGO_MINIMO_FIRMA_CLIENTE) {
    error('CLIENTE_AUTH_SIGNING_SECRET', `${firma.length} caracteres, el mínimo es ${LARGO_MINIMO_FIRMA_CLIENTE}`, 'Firma los tokens de acceso al portal.');
} else ok('CLIENTE_AUTH_SIGNING_SECRET', `presente (${firma.length} car.)`);

if (!hay('RBAC_ADMIN_TOKENS') && !hay('RBAC_BOOTSTRAP_ADMIN_PASSWORD')) {
    aviso(
        'RBAC',
        'sin tokens admin ni contraseña de bootstrap: la gestión queda CERRADA',
        'Es fail-closed a propósito. Si nadie puede entrar a /api/admin, mira aquí primero.',
    );
} else ok('RBAC', 'hay al menos una vía de acceso a gestión');

const rol = val('RBAC_STAFF_ROL') || 'manager';
if (!['admin', 'manager', 'viewer'].includes(rol)) {
    error('RBAC_STAFF_ROL', `"${rol}" no es un rol válido`, 'admin | manager | viewer');
} else if (rol === 'admin') {
    aviso('RBAC_STAFF_ROL', '"admin": el token del Cockpit escala a gestión', 'El defecto es "manager" justamente para que no lo haga.');
} else ok('RBAC_STAFF_ROL', rol);

/* ── 7. Persistencia ─────────────────────────────────────────────────────── */

const dburl = val('DATABASE_URL');
if (!dburl) {
    aviso(
        'DATABASE_URL',
        'vacía — se usará SQLite',
        'Correcto en desarrollo y CI. En producción significa datos en un fichero que puede ser efímero.',
    );
} else if (!/^postgres(ql)?:\/\//.test(dburl)) {
    error(
        'DATABASE_URL',
        'no empieza por postgres:// ni postgresql:// — el código DEGRADA A SQLITE avisando solo por log',
        'Es un fallo silencioso: el servicio levanta "bien" y los datos del cliente acaban donde nadie los busca.',
    );
} else {
    ok('DATABASE_URL', 'apunta a Postgres');
    if (!hay('DATABASE_CA_CERT')) {
        aviso(
            'DATABASE_CA_CERT',
            'sin CA con Postgres configurado',
            'La verificación TLS es estricta y sin escotilla: contra un certificado autofirmado la conexión falla y los barridos periódicos no corren.',
        );
    } else ok('DATABASE_CA_CERT', 'presente');
}

const store = val('SESSION_STORE') || 'memoria';
if (store === 'memoria') {
    aviso(
        'SESSION_STORE',
        '"memoria": no ejecuta el DDL de arranque',
        'El esquema (usuarios, tenant_roles, audit_log, cliente_sesiones) solo se crearía de rebote desde los barridos. En un despliegue nuevo usa "sql".',
    );
} else if (store === 'sql') {
    ok('SESSION_STORE', 'sql — crea el esquema en el arranque');
} else {
    error('SESSION_STORE', `"${store}" no es un valor válido`, 'memoria | sql');
}

const retencion = Number(val('AGENTES_RETENCION_DIAS') || '90');
if (!Number.isFinite(retencion) || retencion <= 0) {
    error('AGENTES_RETENCION_DIAS', 'no es un número de días válido', 'Deja 90 salvo razón escrita.');
} else ok('AGENTES_RETENCION_DIAS', `${retencion} días`);

/* ── Informe ─────────────────────────────────────────────────────────────── */

const errores = hallazgos.filter((h) => h.nivel === 'error');
const avisos = hallazgos.filter((h) => h.nivel === 'aviso');

if (salidaJson) {
    console.log(
        JSON.stringify(
            { componente: 'ssi-business-init', env: rutaEnv, errores: errores.length, avisos: avisos.length, hallazgos },
            null,
            2,
        ),
    );
} else {
    console.log(`\n${c.bold('ssi-business-init')} — validación de dependencias`);
    console.log(c.dim(`entorno: ${rutaEnv}\n`));
    for (const h of hallazgos) {
        const etiqueta =
            h.nivel === 'error' ? c.rojo('ERROR') : h.nivel === 'aviso' ? c.amar('AVISO') : c.verde(' ok  ');
        console.log(`  ${etiqueta}  ${c.bold(h.clave)}: ${h.mensaje}`);
        if (h.arreglo) console.log(`         ${c.dim('↳ ' + h.arreglo)}`);
    }
    console.log(
        `\n${errores.length ? c.rojo(`${errores.length} error(es)`) : c.verde('sin errores')}` +
            `, ${avisos.length} aviso(s).\n`,
    );
    if (errores.length) console.log(c.rojo('NO desplegar hasta resolver los errores.\n'));
}

process.exit(errores.length ? 1 : 0);
