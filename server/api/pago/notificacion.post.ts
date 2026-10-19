// Un fallo de persistencia devuelve 503 para que Redsys pueda reintentar la notificación.
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const respuesta = leerRespuestaRedsys(config.redsys.secreto, await readBody(event).catch(() => null))
    if (!respuesta) {
        setResponseStatus(event, 400)
        return 'KO'
    }
    try {
        const pedido = await procesarRespuestaPago(respuesta, 'notificacion')
        if (!pedido) {
            setResponseStatus(event, 400)
            return 'KO'
        }
        console.info(`[pagos] Pedido ${pedido.numOrder}: ${pedido.estado}; código ${respuesta.codigo}; alta ${pedido.sincronizacion}`)
        return 'OK'
    } catch {
        console.error(`[pagos] Error guardando notificación del pedido ${respuesta.pedido}`)
        setResponseStatus(event, 503)
        return 'KO'
    }
})
