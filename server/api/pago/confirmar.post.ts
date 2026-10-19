export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const body = await readBody(event)
    const numOrder = body?.order
    if (!esNumeroPedido(numOrder)) throw createError({ statusCode: 400, statusMessage: 'Pedido no válido' })
    let pedido = await leerPedido(numOrder)
    if (!pedido) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado' })
    // Una firma válida permite procesar la respuesta, pero solo el comprador puede consultar sus datos.
    if (getCookie(event, 'pedido') !== `${numOrder}.${pedido.token}`) throw createError({ statusCode: 403, statusMessage: 'Pedido no válido' })
    if (body?.Ds_MerchantParameters !== undefined || body?.Ds_Signature !== undefined) {
        const respuesta = leerRespuestaRedsys(config.redsys.secreto, body)
        if (!respuesta || respuesta.pedido !== numOrder || !coincideRespuesta(respuesta, pedido, config.redsys)) {
            throw createError({ statusCode: 400, statusMessage: 'Respuesta de pago no válida' })
        }
        pedido = await procesarRespuestaPago(respuesta, 'url') ?? pedido
    } else if (pedido.estado === 'autorizado' && pedido.sincronizacion !== 'completa') {
        pedido = await reconciliarPedido(numOrder) ?? pedido
    }
    return {
        estado: pedido.estado ?? 'pendiente', sincronizacion: pedido.sincronizacion ?? 'pendiente',
        Nombre: pedido.alumno.Nombre, Email: pedido.alumno.Email,
        NombreCurso: pedido.curso.Titulo, Curso: pedido.curso.id, TipoCurso: pedido.curso.Tipo,
        Order: { numOrder, precio: pedido.precio },
    }
})
