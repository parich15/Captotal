#!/usr/bin/env node
// Solo lectura. node scripts/auditar-urls.mjs [https://captotal.com] [archivo-con-rutas.txt|-] [nginx.conf]
// El archivo opcional admite una ruta por línea procedente de logs o Search Console.
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = new URL(process.argv[2] || 'https://captotal.com').origin;
const directus = 'https://admin.captotal.com';
const urls = new Map();
const warnings = [];
const add = (value, source) => {
    const url = new URL(value, origin);
    if (url.origin !== origin || /\/(?:api|Checkout|Pago)(?:\/|$)/i.test(url.pathname)) return;
    // No conservar parámetros: los registros pueden contener datos de compradores.
    const path = url.pathname;
    if (!urls.has(path)) urls.set(path, new Set());
    urls.get(path).add(source);
};
const request = async (url) => fetch(url, { signal: AbortSignal.timeout(15_000), redirect: 'manual' });
const collectSitemap = async (url, depth = 0) => {
    if (depth > 2 || new URL(url).origin !== origin) return;
    const response = await request(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    const xml = await response.text();
    const locations = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'));
    if (/<sitemapindex\b/.test(xml)) {
        for (const location of locations) await collectSitemap(location, depth + 1);
    } else {
        locations.forEach(location => add(location, 'sitemap'));
    }
};
const collectPages = async (dir, prefix = '') => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) await collectPages(`${dir}/${entry.name}`, `${prefix}/${entry.name}`);
        else if (entry.name.endsWith('.vue') && !`${prefix}/${entry.name}`.includes('[')) {
            add(`${prefix}/${entry.name.replace(/\.vue$/, '').replace(/^index$/, '')}`, 'ruta actual');
        }
    }
};
await collectPages(`${root}/app/pages`);
for (const collection of ['Cursos', 'Posts']) {
    try {
        const url = new URL(`/items/${collection}`, directus);
        url.search = new URLSearchParams({ fields: 'Slug', limit: '-1' });
        const response = await request(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const { data } = await response.json();
        data.filter(item => item.Slug).forEach(item => add(`/${collection === 'Cursos' ? 'Curso' : 'Blog'}/${item.Slug}`, `Directus ${collection}`));
    } catch (error) { warnings.push(`Directus ${collection}: ${error.message}`); }
}
try { await collectSitemap(`${origin}/sitemap.xml`); }
catch (error) { warnings.push(`Sitemap: ${error.message}`); }
try {
    const history = execFileSync('git', ['log', '--all', '--format=', '--name-only', '--', 'pages', 'app/pages'], { cwd: root, encoding: 'utf8' });
    for (const file of history.split('\n')) {
        if (!file.endsWith('.vue') || file.includes('[')) continue;
        add('/' + file.replace(/^(app\/)?pages\//, '').replace(/\.vue$/, '').replace(/(^|\/)index$/, ''), 'historia Git');
    }
} catch (error) { warnings.push(`Historia: ${error.message}`); }
if (urls.has('/Cap-online')) add('/cap-online', 'variante de ruta histórica');
if (process.argv[3] && process.argv[3] !== '-') {
    const extra = await readFile(process.argv[3], 'utf8');
    for (const line of extra.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'))) {
        add(line, 'archivo adicional');
    }
}
if (process.argv[4]) {
    const nginx = await readFile(process.argv[4], 'utf8');
    for (const match of nginx.matchAll(/location\s*=\s*(\/[^\s{]+)\s*\{\s*return\s+301\s+([^;]+);/g)) {
        add(match[1], 'nginx producción');
        add(match[2].trim(), 'destino nginx');
    }
}
const paths = [...urls.keys()].sort();
const rows = new Array(paths.length);
let next = 0;
await Promise.all(Array.from({ length: Math.min(4, paths.length) }, async () => {
    while (next < paths.length) {
        const index = next++;
        const path = paths[index];
        let status = '', destination = '', destinationStatus = '', action;
        try {
            // Consultar GET y conservar el estado real, sin seguir redirecciones.
            const response = await request(`${origin}${path}`);
            status = String(response.status);
            const location = response.headers.get('location');
            if (location) {
                const target = new URL(location, origin);
                destination = target.origin === origin ? target.pathname : `${target.origin}${target.pathname}`;
                if (target.origin === origin) {
                    const targetResponse = await request(target);
                    destinationStatus = String(targetResponse.status);
                    await targetResponse.body?.cancel();
                }
            }
            await response.body?.cancel();
            action = response.status === 404 ? 'Mantener 404 salvo sustituto equivalente documentado'
                : response.status >= 300 && response.status < 400 ? 'Comprobar destino y ausencia de cadenas'
                : response.ok ? 'Conservar; verificar contenido y canonical'
                : 'Revisar respuesta';
            if (status === '301' && destinationStatus === '200') action = 'Conservar 301; destino 200 sin cadena';
            else if (/^3/.test(destinationStatus)) action = 'Corregir cadena o bucle de redirecciones';
            else if (/^[45]/.test(destinationStatus)) action = 'Corregir destino roto';
            if (path.toLowerCase() === '/cap-online') {
                action = response.status === 301 && destination === '/Online'
                    ? '301 equivalente verificado: antigua Paginas/8'
                    : 'Aplicar 301 a /Online: misma Paginas/8 en historia Git';
            }
        } catch (error) { status = 'ERROR'; action = error.message; }
        rows[index] = [`${origin}${path}`, [...urls.get(path)].join('; '), status, destination, destinationStatus, action, new Date().toISOString()];
    }
}));
const csv = value => `"${String(value).replaceAll('"', '""')}"`;
console.log(['url', 'fuente', 'http', 'destino', 'destino_http', 'accion', 'comprobado_utc'].map(csv).join(','));
rows.forEach(row => console.log(row.map(csv).join(',')));
warnings.forEach(warning => console.error(warning));
if (warnings.length) process.exitCode = 1;
