import test, { before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validarDatosAlumno, precioEnCentimos } from '../shared/utils/datosAlumno.ts'
import { firmarPeticionRedsys, leerRespuestaRedsys, coincideRespuesta } from '../server/utils/redsys.ts'
import * as pedidos from '../server/utils/pedidos.ts'

const secreto = Buffer.alloc(24, 1).toString('base64')
let directorio
const config = { public: { siteUrl: 'https://captotal.com' }, redsys: { secreto, comercio: '123456789', terminal: '1' } }
const alumno = { Nombre: ' Ana ', Apellidos: ' García ', Email: 'ANA@example.com', Telefono: '+34 612 345 678', NieNif: '12345678Z' }
const pedido = () => ({ numOrder: '214123456789', token: 'privado', importe: '12345', precio: '123.45', curso: { id: 10, Titulo: 'Curso CAP' }, alumno: validarDatosAlumno(alumno).datos, creado: new Date().toISOString(), estado: 'pendiente', sincronizacion: 'pendiente' })
let registros
let altas
let fallarAlta
let perderRespuesta
let cursoMock

globalThis.useRuntimeConfig = () => ({ ...config, pagosDir: directorio })
Object.assign(globalThis, pedidos)
globalThis.leerRespuestaRedsys = leerRespuestaRedsys
globalThis.coincideRespuesta = coincideRespuesta
globalThis.firmarPeticionRedsys = firmarPeticionRedsys
globalThis.setCookie = () => {}
globalThis.defineEventHandler = handler => handler
globalThis.readBody = async event => event.body
globalThis.getCookie = event => event.cookie
globalThis.createError = datos => Object.assign(new Error(datos.statusMessage), datos)
globalThis.directus = async (_event, _path, opciones) => {
    if (_path === '/items/Cursos') return { data: cursoMock ? [cursoMock] : [] }
    if (opciones.method === 'PATCH') {
        const registro = registros.find(registro => String(registro.id) === _path.split('/').at(-1))
        Object.assign(registro, opciones.body)
        return { data: registro }
    }
    if (opciones.method === 'POST') {
        altas++
        if (fallarAlta) throw new Error('Sin conexión')
        const registro = { id: 42, ...opciones.body[0] }
        registros.push(registro)
        if (perderRespuesta) throw new Error('Respuesta perdida después del alta')
        return { data: [registro] }
    }
    const filtro = JSON.parse(opciones.query.filter)
    return { data: registros.filter(registro => Object.entries(filtro).every(([campo, valor]) => registro[campo] === valor._eq)) }
}
const confirmar = (await import('../server/api/pago/confirmar.post.ts')).default
const firmar = (await import('../server/api/pago/firmar.post.ts')).default
const respuestaFirmada = (cambios = {}) => firmarPeticionRedsys(secreto, {
    DS_MERCHANT_ORDER: cambios.Ds_Order || pedido().numOrder, Ds_Order: pedido().numOrder, Ds_Amount: '12345', Ds_Response: '0000',
    Ds_MerchantCode: '123456789', Ds_Terminal: '001', Ds_Currency: '978', Ds_TransactionType: '0', ...cambios,
})
const respuesta = cambios => leerRespuestaRedsys(secreto, respuestaFirmada(cambios))

before(async () => { directorio = await mkdtemp(join(tmpdir(), 'captotal-pagos-')) })
beforeEach(async () => {
    await rm(directorio, { recursive: true, force: true })
    registros = []; altas = 0; fallarAlta = false; perderRespuesta = false
    cursoMock = { id: 10, Titulo: 'Curso', Precio: '123.45', Activo: true, Aforo: 1 }
    await pedidos.guardarPedido(pedido())
})
after(async () => { await rm(directorio, { recursive: true, force: true }) })

test('valida tipos, contenido y formatos antes de crear un pedido', () => {
    const correcto = validarDatosAlumno(alumno)
    assert.equal(correcto.valido, true)
    assert.equal(correcto.datos.Nombre, 'Ana')
    assert.equal(correcto.datos.Email, 'ana@example.com')
    for (const campo of Object.keys(alumno)) {
        for (const valor of ['', '   ', {}, [], 123, null]) assert.equal(validarDatosAlumno({ ...alumno, [campo]: valor }).valido, false, `${campo}: ${JSON.stringify(valor)}`)
    }
    for (const datos of [{ Email: 'ana@' }, { Telefono: '123' }, { Telefono: 'abcdefghi' }, { NieNif: '12345678A' }, { Nombre: 'a'.repeat(101) }]) assert.equal(validarDatosAlumno({ ...alumno, ...datos }).valido, false)
    assert.equal(validarDatosAlumno({ ...alumno, NieNif: 'X1234567L' }).valido, true)
})

test('conserva céntimos sin aceptar valores monetarios ambiguos', () => {
    for (const [valor, esperado] of [['123.45', 12345], ['100', 10000], [0.29, 29], ['1.2', 120]]) assert.equal(precioEnCentimos(valor), esperado)
    for (const valor of ['-1', '0', '1.234', '1e3', '1,50', {}, Infinity]) assert.equal(precioEnCentimos(valor), null)
})

test('solo acepta firma y correspondencia completa de la operación', () => {
    const valido = respuesta()
    assert.equal(valido.autorizado, true)
    assert.equal(coincideRespuesta(valido, pedido(), config.redsys), true)
    assert.equal(leerRespuestaRedsys(secreto, { ...respuestaFirmada(), Ds_Signature: 'AAAA' }), null)
    assert.equal(leerRespuestaRedsys(secreto, { ...respuestaFirmada(), Ds_SignatureVersion: 'otra' }), null)
    for (const cambios of [{ Ds_Order: '214123456788' }, { Ds_Amount: '12300' }, { Ds_MerchantCode: '999999999' }, { Ds_Terminal: '2' }, { Ds_Currency: '840' }, { Ds_TransactionType: '3' }]) assert.equal(coincideRespuesta(respuesta(cambios), pedido(), config.redsys), false)
})

test('callbacks concurrentes y recargas generan una sola alta con decimales', async () => {
    await Promise.all(Array.from({ length: 5 }, () => pedidos.procesarRespuestaPago(respuesta(), 'notificacion')))
    assert.equal(altas, 1)
    assert.equal(registros[0].Total, 123.45)
    assert.equal(registros[0].Pedido_Verificado, pedido().numOrder)
    const guardado = await pedidos.leerPedido(pedido().numOrder)
    assert.equal(guardado.estado, 'autorizado')
    assert.equal(guardado.sincronizacion, 'completa')
    assert.equal(guardado.evidencia.firma.Ds_Signature, respuestaFirmada().Ds_Signature)
})

test('persiste el cobro antes del fallo de Directus y lo reconcilia', async () => {
    fallarAlta = true
    await pedidos.procesarRespuestaPago(respuesta(), 'notificacion')
    let guardado = await pedidos.leerPedido(pedido().numOrder)
    assert.equal(guardado.estado, 'autorizado')
    assert.equal(guardado.sincronizacion, 'error')
    fallarAlta = false
    guardado = await pedidos.reconciliarPedido(pedido().numOrder)
    assert.equal(guardado.sincronizacion, 'completa')
    assert.equal(registros.length, 1)
})

test('recupera un POST confirmado cuya respuesta se perdió sin repetir alta', async () => {
    perderRespuesta = true
    await pedidos.procesarRespuestaPago(respuesta(), 'notificacion')
    await pedidos.reconciliarPedido(pedido().numOrder)
    assert.equal(altas, 1)
    assert.equal(registros.length, 1)
    assert.equal((await pedidos.leerPedido(pedido().numOrder)).sincronizacion, 'completa')
})

test('denegación posterior no degrada autorización; denegación inicial no crea alumno', async () => {
    await pedidos.procesarRespuestaPago(respuesta({ Ds_Response: '0190' }), 'notificacion')
    assert.equal((await pedidos.leerPedido(pedido().numOrder)).estado, 'denegado')
    assert.equal(altas, 0)
    await pedidos.procesarRespuestaPago(respuesta(), 'notificacion')
    await pedidos.procesarRespuestaPago(respuesta({ Ds_Response: '0190' }), 'notificacion')
    assert.equal((await pedidos.leerPedido(pedido().numOrder)).estado, 'autorizado')
    assert.equal(altas, 1)
})

test('retorno status=ok y cookie identifican al comprador pero no acreditan pago', async () => {
    const evento = { body: { order: pedido().numOrder, status: 'ok' }, cookie: `${pedido().numOrder}.privado` }
    const resultado = await confirmar(evento)
    assert.equal(resultado.estado, 'pendiente')
    assert.equal(resultado.primeraVista, undefined)
    assert.equal(altas, 0)
    await assert.rejects(confirmar({ ...evento, cookie: undefined }), { statusCode: 403 })
    await assert.rejects(confirmar({ ...evento, body: { ...evento.body, ...respuestaFirmada({ Ds_Amount: '99999' }) } }), { statusCode: 400 })
    assert.equal(altas, 0)
})

test('confirmación firmada devuelve autorización solo tras verificación', async () => {
    const resultado = await confirmar({ body: { order: pedido().numOrder, ...respuestaFirmada() }, cookie: `${pedido().numOrder}.privado` })
    assert.equal(resultado.estado, 'autorizado')
    assert.equal(resultado.sincronizacion, 'completa')
    assert.equal(resultado.Order.precio, '123.45')
})

test('pedidos antiguos sin estado/evidencia permanecen pendientes', async () => {
    const antiguo = pedido()
    delete antiguo.estado
    delete antiguo.sincronizacion
    await pedidos.guardarPedido(antiguo)
    const resultado = await confirmar({ body: { order: pedido().numOrder, status: 'ok' }, cookie: `${pedido().numOrder}.privado` })
    assert.equal(resultado.estado, 'pendiente')
    assert.equal(altas, 0)
})


test('firmar rechaza alumno inválido y cursos inexistentes/inactivos/sin plazas antes de guardar', async () => {
    const evento = { body: { curso: 'cap', alumno } }
    await assert.rejects(firmar({ body: { curso: 'cap', alumno: { ...alumno, Email: {} } } }), { statusCode: 400 })
    for (const cambios of [{ Activo: false }, { Aforo: 0 }, { Precio: '-1' }, { Precio: '12.345' }]) {
        cursoMock = { id: 10, Titulo: 'Curso', Precio: '123.45', Activo: true, Aforo: 1, ...cambios }
        await assert.rejects(firmar(evento), { statusCode: 409 })
    }
    cursoMock = null
    await assert.rejects(firmar(evento), { statusCode: 404 })
    assert.equal(altas, 0)
})

test('firmar fija el precio del servidor e inicia únicamente un pedido pendiente', async () => {
    const firma = await firmar({ body: { curso: 'cap', alumno, precio: '0.01', origen: 'https://malicioso.example' } })
    const parametros = JSON.parse(Buffer.from(firma.Ds_MerchantParameters, 'base64').toString('utf8'))
    assert.equal(parametros.DS_MERCHANT_AMOUNT, '12345')
    assert.ok(parametros.DS_MERCHANT_URLOK.startsWith('https://captotal.com/'))
    assert.equal((await pedidos.leerPedido(firma.pedido)).estado, 'pendiente')
    assert.equal(altas, 0)
})


test('reconciliación revalida la evidencia y rechaza estados autorizados sin firma válida', async () => {
    for (const evidencia of [undefined, { autorizado: true }, { ...respuesta(), firma: { ...respuestaFirmada(), Ds_Signature: 'AAAA' } }]) {
        await pedidos.guardarPedido({ ...pedido(), estado: 'autorizado', evidencia })
        const resultado = await pedidos.reconciliarPedido(pedido().numOrder)
        assert.equal(resultado.sincronizacion, 'error')
    }
    assert.equal(altas, 0)
})


test('dos recuperadores de un bloqueo muerto preservan autorización frente a denegación concurrente', async () => {
    await writeFile(join(directorio, `${pedido().numOrder}.lock`), '2147483647:proceso-muerto')
    await Promise.all([
        pedidos.procesarRespuestaPago(respuesta(), 'notificacion'),
        pedidos.procesarRespuestaPago(respuesta({ Ds_Response: '0190' }), 'notificacion'),
    ])
    const resultado = await pedidos.leerPedido(pedido().numOrder)
    assert.equal(resultado.estado, 'autorizado')
    assert.equal(resultado.sincronizacion, 'completa')
    assert.equal(altas, 1)
    for (const extension of ['lock', 'recovery']) await assert.rejects(readFile(join(directorio, `${pedido().numOrder}.${extension}`)), { code: 'ENOENT' })
})

test('retorno firmado tardío vincula un alumno histórico coherente sin repetir alta', async () => {
    const antiguo = pedido()
    delete antiguo.estado
    delete antiguo.sincronizacion
    await pedidos.guardarPedido(antiguo)
    registros.push({ id: 12, Numero_Pedido: antiguo.numOrder, Pedido_Verificado: null, Email: 'ANA@example.com', Curso: '10', Total: '123.45' })
    const resultado = await pedidos.procesarRespuestaPago(respuesta(), 'notificacion')
    assert.equal(resultado.estado, 'autorizado')
    assert.equal(resultado.sincronizacion, 'completa')
    assert.equal(resultado.alumnoId, 12)
    assert.equal(registros[0].Pedido_Verificado, antiguo.numOrder)
    assert.equal(registros.length, 1)
    assert.equal(altas, 0)
})

test('histórico ambiguo o con datos distintos queda conciliable sin crear alumnos nuevos', async () => {
    const antiguo = pedido()
    delete antiguo.estado
    delete antiguo.sincronizacion
    const registro = { id: 12, Numero_Pedido: antiguo.numOrder, Pedido_Verificado: null, Email: 'ana@example.com', Curso: '10', Total: '123.45' }
    for (const datos of [[registro, { ...registro, id: 13 }], [{ ...registro, Email: 'otro@example.com' }], [{ ...registro, Curso: '99' }], [{ ...registro, Total: '123' }]]) {
        await pedidos.guardarPedido(antiguo)
        registros = structuredClone(datos)
        const resultado = await pedidos.procesarRespuestaPago(respuesta(), 'notificacion')
        assert.equal(resultado.estado, 'autorizado')
        assert.equal(resultado.sincronizacion, 'error')
        assert.equal(altas, 0)
        assert.equal(registros[0].Pedido_Verificado, null)
    }
})
