// Formulario de contacto de "Nosotros"
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const Nombre = campoTexto(body?.Nombre)
    const Email = campoTexto(body?.Email)
    const Telefono = campoTexto(body?.Telefono, 30)
    const Tipo = campoTexto(body?.Tipo, 10)
    const Mensaje = String(body?.Mensaje ?? '').trim().slice(0, 5000)
    if (!Nombre || !Email || !Telefono || !Tipo) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    await directus(event, '/items/Mensajes', {
        method: 'POST',
        body: { Nombre, Email, Telefono, Tipo, Mensaje, Creado: new Date() },
    })
    await notificarDirectus(event, 'Nuevo Mensaje',
        `<p>Hay un nuevo mensaje en la colección de mensajes</p>
                  <br>
                  <p>Nombre: ${escaparHtml(Nombre)}</p><br>
                  <p>Telefono y Email: ${escaparHtml(Telefono)} | ${escaparHtml(Email)}</p><br>
                  <div><p>Mensaje:</p><br>${escaparHtml(Mensaje)}</div>`,
        'Mensajes', await ultimoId(event, 'Mensajes'))
    return { ok: true }
})
