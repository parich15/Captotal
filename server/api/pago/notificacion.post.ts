// Notificación online de Redsys (servidor a servidor, DS_MERCHANT_MERCHANTURL): alta del alumno aunque el
// comprador cierre la pestaña antes de volver a la web. Siempre responde 200 para que Redsys no reintente.
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const respuesta = leerRespuestaRedsys(config.redsys.secreto, await readBody(event).catch(() => ({})) ?? {})
    if (!respuesta || !esNumeroPedido(respuesta.pedido)) {
        console.warn('[pagos] Notificación de Redsys con firma no válida')
        return 'KO'
    }

    console.info(`[pagos] Notificación de Redsys del pedido ${respuesta.pedido}: código ${respuesta.codigo}`)
    const pedido = await leerPedido(respuesta.pedido)
    if (!pedido) {
        console.warn(`[pagos] Notificación de Redsys de un pedido desconocido: ${respuesta.pedido}`)
        return 'KO'
    }
    if (respuesta.autorizado && respuesta.importe === pedido.importe) {
        try {
            await darDeAltaAlumno(pedido, 'notificacion')
        } catch (e) {
            console.error(`[pagos] Error dando de alta al alumno del pedido ${pedido.numOrder}`, e)
        }
    }
    return 'OK'
})
