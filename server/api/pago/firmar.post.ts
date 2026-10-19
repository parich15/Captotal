import { randomBytes } from 'node:crypto'
import { precioEnCentimos, validarDatosAlumno } from '../../../shared/utils/datosAlumno.ts'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const body = await readBody(event)
    const slug = typeof body?.curso === 'string' ? body.curso.trim() : ''
    const alumno = validarDatosAlumno(body?.alumno)
    if (!slug || slug.length > 200 || !alumno.valido) {
        throw createError({ statusCode: 400, statusMessage: 'Revisa los datos del alumno', data: { campos: alumno.errores } })
    }
    if (!config.redsys.secreto || !config.redsys.comercio || !config.redsys.terminal) {
        throw createError({ statusCode: 503, statusMessage: 'La pasarela de pago no está disponible' })
    }
    const { data } = await directus<{ data: { id: number, Titulo: string, Tipo: string, Precio: string, Aforo: number | null, Activo: boolean }[] }>(event, '/items/Cursos', {
        query: { filter: JSON.stringify({ Slug: { _eq: slug } }), fields: 'id,Titulo,Tipo,Precio,Aforo,Activo', limit: 1 },
    })
    const curso = data[0]
    if (!curso) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
    const centimos = precioEnCentimos(curso.Precio)
    if (curso.Activo !== true || !(Number(curso.Aforo) >= 1) || centimos === null) {
        throw createError({ statusCode: 409, statusMessage: 'Curso no disponible' })
    }
    const sitio = new URL(config.public.siteUrl)
    const dominio = sitio.host.replace(/^www\./, '')
    const origenes = [`${sitio.protocol}//${dominio}`, `${sitio.protocol}//www.${dominio}`]
    const origen = typeof body?.origen === 'string' && (origenes.includes(body.origen) || (import.meta.dev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(body.origen))) ? body.origen : sitio.origin
    const numOrder = String(Date.now() - Date.UTC(2020, 0, 1)).padStart(12, '0')
    const token = randomBytes(16).toString('hex')
    const firma = firmarPeticionRedsys(config.redsys.secreto, {
        DS_MERCHANT_AMOUNT: String(centimos), DS_MERCHANT_CURRENCY: '978',
        DS_MERCHANT_MERCHANTCODE: config.redsys.comercio,
        DS_MERCHANT_MERCHANTURL: `${sitio.origin}/api/pago/notificacion`,
        DS_MERCHANT_ORDER: numOrder, DS_MERCHANT_TERMINAL: config.redsys.terminal,
        DS_MERCHANT_TRANSACTIONTYPE: '0',
        DS_MERCHANT_URLKO: `${origen}/Pago/Fallido?order=${numOrder}`,
        DS_MERCHANT_URLOK: `${origen}/Pago/Completo?order=${numOrder}`,
    })
    // El token solo identifica al comprador; no es evidencia de autorización bancaria.
    await conBloqueoPedido(numOrder, async () => {
        if (await leerPedido(numOrder)) throw createError({ statusCode: 503, statusMessage: 'Reintenta iniciar el pago' })
        await guardarPedido({ numOrder, token, importe: String(centimos), precio: (centimos / 100).toFixed(2),
        curso: { id: curso.id, Titulo: curso.Titulo, Tipo: curso.Tipo }, alumno: alumno.datos,
        creado: new Date().toISOString(), estado: 'pendiente', sincronizacion: 'pendiente' })
    })
    setCookie(event, 'pedido', `${numOrder}.${token}`, { httpOnly: true, secure: sitio.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 7 * 86400 })
    limpiarPedidosPendientes().catch(() => console.error('[pagos] No se pudieron limpiar pedidos pendientes antiguos'))
    return { ...firma, pedido: numOrder, precio: (centimos / 100).toFixed(2) }
})
