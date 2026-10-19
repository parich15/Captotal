#!/usr/bin/env -S node --experimental-strip-types
// Ejecutar en el VPS, desde la carpeta de la app, con las mismas NUXT_* que PM2.
// Vista previa: node --experimental-strip-types scripts/reconciliar-pagos.mjs --limite 10
// Aplicar uno: node --experimental-strip-types scripts/reconciliar-pagos.mjs --pedido 123456789012 --aplicar
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const argumentos = process.argv.slice(2)
const opcion = nombre => argumentos[argumentos.indexOf(nombre) + 1]
const aplicar = argumentos.includes('--aplicar')
const numOrder = argumentos.includes('--pedido') ? opcion('--pedido') : undefined
const limite = argumentos.includes('--limite') ? Number(opcion('--limite')) : 10
if ((numOrder && !/^\d{4,12}$/.test(numOrder)) || !Number.isInteger(limite) || limite < 1 || limite > 100 || argumentos.some(arg => arg.startsWith('--') && !['--pedido', '--limite', '--aplicar'].includes(arg))) {
    throw new Error('Uso: --pedido NUMERO o --limite 1..100 [--aplicar]')
}
const pagosDir = resolve(process.env.NUXT_PAGOS_DIR || '.data/pagos')
const directusUrl = process.env.NUXT_DIRECTUS_URL || 'https://admin.captotal.com'
const token = process.env.NUXT_DIRECTUS_TOKEN
const redsys = { secreto: process.env.NUXT_REDSYS_SECRETO, comercio: process.env.NUXT_REDSYS_COMERCIO, terminal: process.env.NUXT_REDSYS_TERMINAL }
if (aplicar && (!token || !redsys.secreto || !redsys.comercio || !redsys.terminal)) throw new Error('Faltan NUXT_DIRECTUS_TOKEN y/o NUXT_REDSYS_SECRETO/COMERCIO/TERMINAL para verificar la evidencia')
globalThis.useRuntimeConfig = () => ({ pagosDir, redsys })
globalThis.directus = async (_event, path, { method = 'GET', query, body } = {}) => {
    const url = new URL(path, directusUrl)
    for (const [clave, valor] of Object.entries(query || {})) url.searchParams.set(clave, String(valor))
    const respuesta = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) })
    if (!respuesta.ok) throw new Error(`Directus HTTP ${respuesta.status}`)
    return respuesta.json()
}
const { leerPedido, reconciliarPedido } = await import('../server/utils/pedidos.ts')
const candidatos = numOrder ? [numOrder] : (await readdir(pagosDir)).filter(nombre => /^\d{4,12}\.json$/.test(nombre)).sort().map(nombre => nombre.slice(0, -5))
let procesados = 0
let fallos = 0
for (const numero of candidatos) {
    const pedido = await leerPedido(numero)
    if (!pedido || pedido.estado !== 'autorizado' || !pedido.evidencia?.autorizado || pedido.sincronizacion === 'completa') continue
    if (procesados++ >= limite) break
    if (!aplicar) {
        console.info(`Pedido ${numero}: autorizado, alta ${pedido.sincronizacion}; se reintentaría`)
        continue
    }
    try {
        const resultado = await reconciliarPedido(numero)
        console.info(`Pedido ${numero}: alta ${resultado?.sincronizacion}`)
        if (resultado?.sincronizacion !== 'completa') fallos++
    } catch {
        console.error(`Pedido ${numero}: no se pudo reconciliar; reintentar después`)
        fallos++
    }
}
if (fallos) process.exitCode = 1
