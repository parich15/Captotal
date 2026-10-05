// Página de confirmación (URLOK): da de alta al alumno y devuelve los datos de la compra para mostrarlos
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const body = await readBody(event)

    const numOrder = body?.order
    if (!esNumeroPedido(numOrder)) throw createError({ statusCode: 400, statusMessage: 'Pedido no válido' })
    const pedido = await leerPedido(numOrder)
    if (!pedido) throw createError({ statusCode: 404, statusMessage: 'Pedido no encontrado' })

    // Si el TPV tiene activados los "parámetros en las URLs", Redsys añade su respuesta firmada a la URLOK
    const hayRespuesta = typeof body?.Ds_MerchantParameters === 'string'
    const respuesta = hayRespuesta ? leerRespuestaRedsys(config.redsys.secreto, body) : null
    const pagoVerificado = !!respuesta && respuesta.pedido === numOrder && respuesta.autorizado && respuesta.importe === pedido.importe
    const esComprador = getCookie(event, 'pedido') === `${numOrder}.${pedido.token}`
    if (!esComprador && !pagoVerificado) throw createError({ statusCode: 403, statusMessage: 'Pedido no válido' })

    console.info(`[pagos] Confirmación del pedido ${numOrder}: respuesta de Redsys en la URL: ${hayRespuesta ? (pagoVerificado ? 'válida' : 'NO válida') : 'no'}`)
    try {
        if (pagoVerificado) {
            await darDeAltaAlumno(pedido, 'url')
        } else if (!hayRespuesta && config.pagoVerificacion !== 'estricta') {
            // Modo flexible: sin respuesta firmada (ni notificación previa) se da de alta igualmente, como hasta ahora
            await darDeAltaAlumno(pedido, 'sin-verificar')
        }
    } catch (e) {
        console.error(`[pagos] Error dando de alta al alumno del pedido ${numOrder}`, e)
    }

    return {
        Nombre: pedido.alumno.Nombre,
        Email: pedido.alumno.Email,
        NombreCurso: pedido.curso.Titulo,
        Curso: pedido.curso.id,
        TipoCurso: pedido.curso.Tipo,
        Order: { numOrder, precio: pedido.precio },
        // Solo la primera vez, para no enviar la compra a Analytics en cada recarga
        primeraVista: await marcarUnaVez(numOrder, 'vista'),
    }
})
