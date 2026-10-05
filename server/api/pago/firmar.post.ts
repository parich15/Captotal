import { randomBytes, randomInt } from 'node:crypto'

// Prepara el pago en Redsys: el precio sale de Directus y la firma se hace aquí, la clave nunca llega al navegador
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const body = await readBody(event)

    const slug = campoTexto(body?.curso)
    const alumno = {
        Nombre: campoTexto(body?.alumno?.Nombre),
        Apellidos: campoTexto(body?.alumno?.Apellidos),
        Email: campoTexto(body?.alumno?.Email),
        Telefono: campoTelefono(body?.alumno?.Telefono),
        NieNif: campoTexto(body?.alumno?.NieNif, 30),
    }
    if (!slug || Object.values(alumno).some(v => v === null)) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos del alumno' })
    }

    const { data } = await directus<{ data: { id: number, Titulo: string, Tipo: string, Precio: string, Aforo: number | null }[] }>(event, '/items/Cursos', {
        query: { filter: JSON.stringify({ Slug: { _eq: slug } }), fields: 'id,Titulo,Tipo,Precio,Aforo', limit: 1 },
    })
    const curso = data[0]
    if (!curso) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
    const precio = String(curso.Precio ?? '').trim()
    const centimos = Math.round(Number(precio) * 100)
    if (!(Number(curso.Aforo) >= 1) || !(centimos > 0)) {
        throw createError({ statusCode: 409, statusMessage: 'Curso no disponible' })
    }

    // Redsys devuelve al usuario al mismo dominio desde el que paga (con o sin www) para conservar sus cookies
    const sitio = new URL(config.public.siteUrl)
    const dominio = sitio.host.replace(/^www\./, '')
    const origenes = [`${sitio.protocol}//${dominio}`, `${sitio.protocol}//www.${dominio}`]
    const origen = typeof body?.origen === 'string' && (origenes.includes(body.origen) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(body.origen))
        ? body.origen
        : sitio.origin

    // 12 dígitos: Redsys exige que el pedido sea único y empiece por 4 números
    const numOrder = Date.now().toString().slice(-8) + randomInt(10000).toString().padStart(4, '0')
    const token = randomBytes(16).toString('hex')

    await guardarPedido({
        numOrder,
        token,
        importe: String(centimos),
        precio,
        curso: { id: curso.id, Titulo: curso.Titulo, Tipo: curso.Tipo },
        alumno: alumno as Pedido['alumno'],
        creado: new Date().toISOString(),
    })
    // Identifica al comprador en la página de confirmación (los datos personales se quedan en el servidor)
    setCookie(event, 'pedido', `${numOrder}.${token}`, { httpOnly: true, secure: true, path: '/', maxAge: 86400 })

    return firmarPeticionRedsys(config.redsys.secreto, {
        DS_MERCHANT_AMOUNT: String(centimos),
        DS_MERCHANT_CURRENCY: '978',
        DS_MERCHANT_MERCHANTCODE: config.redsys.comercio,
        // Notificación online servidor a servidor: siempre al dominio principal
        DS_MERCHANT_MERCHANTURL: `${sitio.origin}/api/pago/notificacion`,
        DS_MERCHANT_ORDER: numOrder,
        DS_MERCHANT_TERMINAL: config.redsys.terminal,
        DS_MERCHANT_TRANSACTIONTYPE: '0',
        DS_MERCHANT_URLKO: `${origen}/Pago/Fallido?status=ko`,
        DS_MERCHANT_URLOK: `${origen}/Pago/Completo?status=ok&order=${numOrder}`,
    })
})
