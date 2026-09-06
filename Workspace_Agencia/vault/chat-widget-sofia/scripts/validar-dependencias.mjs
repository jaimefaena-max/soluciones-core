#!/usr/bin/env node
/**
 * validar-dependencias.mjs — Compuerta previa al despliegue de chat-widget-sofia.
 *
 * POR QUÉ EXISTE
 * Este componente casi nunca falla ruidosamente. Falla en silencio: un token
 * desincronizado deja el widget mudo con un 403 que nadie mira, `primary` como
 * calendario devuelve 200 sin crear la reunión, y sin la clave del enrutador la
 * calidad baja sin que salte ninguna alarma. Todos esos casos se detectan leyendo
 * la configuración ANTES de desplegar, que es lo que hace este script.
 *
 * QUÉ NO HACE
 * No abre conexiones de red, no llama a ninguna API, no escribe nada y no imprime
 * el valor de ningún secreto (solo su longitud y una huella corta). Se puede
 * ejecutar en CI sin exponer credenciales en los logs.
 *
 * USO
 *   node scripts/validar-dependencias.mjs                  # valida ./.env
 *   node scripts/validar-dependencias.mjs --env ../x/.env  # otra ruta
 *   node scripts/validar-dependencias.mjs --json           # salida para CI
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

/**
 * Huella corta de un secreto: permite comparar dos copias a ojo y en los logs
 * sin revelar el valor. 8 hex de un SHA-256 no reconstruyen nada.
 */
const huella = (v) => createHash('sha256').update(v).digest('hex').slice(0, 8);

/* ── Argumentos ──────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
    console.log(`
${c.bold('validar-dependencias.mjs')} — chat-widget-sofia

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
 * Parser mínimo de .env. Deliberadamente NO usa dotenv: este script debe poder
 * correr en un checkout sin `npm install` hecho, que es exactamente el momento
 * en que uno quiere saber si le falta configuración.
 *
 * Soporta `CLAVE=valor`, comillas simples y dobles, comentarios de línea entera
 * y `export CLAVE=valor`. No expande variables: un `$OTRA` se queda literal, que
 * es como lo leen tanto Node como DigitalOcean.
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
            v = v.replace(/\s+#.*$/, '').trim(); // comentario al final de línea
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
    error(
        'node',
        `Node ${process.versions.node} es anterior al mínimo ${NODE_MINIMO}`,
        `Instala Node ${NODE_MINIMO} o superior.`,
    );
}

/* ── 2. Valores que siguen siendo la plantilla ───────────────────────────── */

/**
 * Detecta valores copiados tal cual de `.env.example`. Es el fallo más tonto y
 * el más frecuente: un `.env` "completo" que en realidad no se completó.
 */
const MARCAS_PLANTILLA = [
    'cambia-me',
    'cambia_me',
    'CAMBIA_ME',
    'falsa',
    'falso',
    'cliente-ejemplo',
    'ejemplo.',
    'tu_secreto',
];
for (const [clave, valor] of Object.entries(env)) {
    if (!valor) continue;
    const marca = MARCAS_PLANTILLA.find((m) => valor.includes(m));
    if (marca) {
        error(
            clave,
            `conserva el valor de plantilla (contiene «${marca}»)`,
            'Sustitúyelo por el valor real del cliente.',
        );
    }
}

/* ── 3. El secreto compartido: las dos copias deben coincidir ────────────── */

const tokBack = val('SALES_AGENT_WIDGET_TOKEN');
const tokBundle = val('VITE_SALES_AGENT_WIDGET_TOKEN');

if (!tokBack) {
    error(
        'SALES_AGENT_WIDGET_TOKEN',
        'ausente o vacía — el orquestador responderá 403 a TODO /chat y /book',
        'La guarda es fail-closed, no opt-in. Genera uno: openssl rand -hex 32',
    );
}
if (!tokBundle) {
    error(
        'VITE_SALES_AGENT_WIDGET_TOKEN',
        'ausente o vacía — vite.widget.config.ts abortará el build del bundle',
        'Debe ser exactamente el mismo valor que SALES_AGENT_WIDGET_TOKEN.',
    );
}
if (tokBack && tokBundle) {
    if (tokBack === tokBundle) {
        ok(
            'token-widget',
            `backend y bundle coinciden (huella ${huella(tokBack)}, ${tokBack.length} car.)`,
        );
    } else {
        error(
            'token-widget',
            `NO coinciden: backend ${huella(tokBack)} vs bundle ${huella(tokBundle)}`,
            'Es la causa nº 1 de «403 inexplicables». Iguálalos y RECOMPILA el bundle.',
        );
    }
    if (tokBack.length < 32) {
        aviso(
            'SALES_AGENT_WIDGET_TOKEN',
            `solo ${tokBack.length} caracteres`,
            'Usa al menos 32 (openssl rand -hex 32). Es el único secreto que viaja en el bundle.',
        );
    }
}

/* ── 4. Motores de lenguaje ──────────────────────────────────────────────── */

if (!hay('DEEPSEEK_API_KEY')) {
    aviso(
        'DEEPSEEK_API_KEY',
        'ausente — el enrutador DEGRADA a un clasificador heurístico local',
        'No revienta, pero la calidad del enrutado cae sin que nada avise.',
    );
} else ok('DEEPSEEK_API_KEY', `presente (${val('DEEPSEEK_API_KEY').length} car.)`);

if (!hay('ANTHROPIC_API_KEY')) {
    error(
        'ANTHROPIC_API_KEY',
        'ausente — sin motor de generación no hay respuesta comercial',
        'Fíjala en el entorno del orquestador.',
    );
} else ok('ANTHROPIC_API_KEY', `presente (${val('ANTHROPIC_API_KEY').length} car.)`);

/* ── 5. Aislamiento y red ────────────────────────────────────────────────── */

const trustProxy = val('TRUST_PROXY');
if (trustProxy === 'true') {
    error(
        'TRUST_PROXY',
        '"true" acepta cualquier X-Forwarded-For: la IP pasa a ser falsificable',
        'Con la IP falsificable el rate-limit de 10/min de /chat no cuenta nada, y /chat gasta LLM de pago. Usa "1", un CIDR, o "false".',
    );
} else if (!trustProxy) {
    aviso('TRUST_PROXY', 'sin declarar — se usará el defecto (1 salto)', 'Decláralo explícitamente si hay más de un proxy delante.');
} else ok('TRUST_PROXY', `"${trustProxy}"`);

const cors = val('CORS_ALLOWED_ORIGINS');
if (cors.includes('*')) {
    error(
        'CORS_ALLOWED_ORIGINS',
        'contiene un comodín "*"',
        'El aislamiento entre clientes depende de orígenes explícitos. Lista los dominios uno a uno.',
    );
} else if (!cors) {
    aviso(
        'CORS_ALLOWED_ORIGINS',
        'vacía — se usará la lista por defecto del código',
        'El portal del cliente nuevo probablemente NO esté en ella.',
    );
} else {
    const sinEsquema = cors.split(',').map((s) => s.trim()).filter((o) => o && !/^https?:\/\//.test(o));
    if (sinEsquema.length) {
        error('CORS_ALLOWED_ORIGINS', `origen sin esquema: ${sinEsquema.join(', ')}`, 'Un Origin del navegador siempre trae https://. Sin esquema nunca casará.');
    } else {
        ok('CORS_ALLOWED_ORIGINS', `${cors.split(',').length} origen(es) explícito(s)`);
    }
}

if (val('CORS_ALLOW_NULL_ORIGIN') === 'true') {
    aviso(
        'CORS_ALLOW_NULL_ORIGIN',
        '"true" admite Origin "null" (páginas abiertas como file://)',
        'Útil en desarrollo. En producción debe ser false.',
    );
}

/* ── 6. Efectos de lado del cierre (bloque todo-o-nada) ──────────────────── */

/**
 * /book crea eventos reales, leads y webhooks. Si el cliente lo usa, el bloque
 * entero tiene que estar completo: media configuración aquí significa una
 * reunión que el prospecto cree agendada y que no existe en ningún calendario.
 */
const CLAVES_AGENDA = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CALENDAR_ID'];
const agendaPresentes = CLAVES_AGENDA.filter(hay);

if (agendaPresentes.length === 0) {
    aviso(
        'agenda',
        'sin configurar — POST /book no podrá agendar',
        'Correcto si este cliente no agenda reuniones desde el widget.',
    );
} else if (agendaPresentes.length < CLAVES_AGENDA.length) {
    const faltan = CLAVES_AGENDA.filter((k) => !hay(k));
    error('agenda', `configuración a medias, faltan: ${faltan.join(', ')}`, 'O el bloque completo, o ninguno.');
} else {
    if (val('GOOGLE_CALENDAR_ID') === 'primary') {
        error(
            'GOOGLE_CALENDAR_ID',
            '"primary" — fallo SILENCIOSO: la API responde 200 y la reunión no existe para nadie',
            'Comparte un calendario real con la cuenta de servicio y usa su "ID de calendario".',
        );
    } else ok('GOOGLE_CALENDAR_ID', 'apunta a un calendario compartido');

    const pem = val('GOOGLE_PRIVATE_KEY');
    if (!pem.includes('BEGIN PRIVATE KEY')) {
        error('GOOGLE_PRIVATE_KEY', 'no parece un PEM', 'Debe ir entre comillas dobles y conservar los saltos de línea.');
    } else ok('GOOGLE_PRIVATE_KEY', 'PEM presente y entrecomillado');

    if (!hay('RESEND_API_KEY')) {
        error(
            'RESEND_API_KEY',
            'agenda activa pero sin correo de confirmación',
            'El evento de Google no lleva attendees: este correo es la ÚNICA constancia que recibe el prospecto.',
        );
    } else ok('RESEND_API_KEY', 'presente');
}

/* ── 7. Retención de datos personales (Ley 19.628) ───────────────────────── */

const retencion = Number(val('MENSAJES_RETENCION_DIAS') || '90');
if (!Number.isFinite(retencion) || retencion <= 0) {
    error('MENSAJES_RETENCION_DIAS', 'no es un número de días válido', 'Deja 90 salvo que exista una razón escrita.');
} else if (retencion > 180) {
    aviso(
        'MENSAJES_RETENCION_DIAS',
        `${retencion} días de transcripciones literales`,
        'Son datos personales. Por encima de 180 días conviene una justificación escrita.',
    );
} else ok('MENSAJES_RETENCION_DIAS', `${retencion} días`);

/* ── Informe ─────────────────────────────────────────────────────────────── */

const errores = hallazgos.filter((h) => h.nivel === 'error');
const avisos = hallazgos.filter((h) => h.nivel === 'aviso');

if (salidaJson) {
    console.log(
        JSON.stringify(
            { componente: 'chat-widget-sofia', env: rutaEnv, errores: errores.length, avisos: avisos.length, hallazgos },
            null,
            2,
        ),
    );
} else {
    console.log(`\n${c.bold('chat-widget-sofia')} — validación de dependencias`);
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
