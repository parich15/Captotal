import { emailFormulario, telefonoFormulario } from '../utils/formularios.mjs'

// Formulario de contacto de "Nosotros"
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const Nombre = campoTexto(body?.Nombre)
    const Email = emailFormulario(body?.Email)
    const Telefono = telefonoFormulario(body?.Telefono)
    const Tipo = campoTexto(body?.Tipo, 10)
    const Mensaje = String(body?.Mensaje ?? '').trim().slice(0, 5000)
    if (!Nombre || !Email || !Telefono || !Tipo) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const { data: mensaje } = await directus<{ data: { id: number } }>(event, '/items/Mensajes', {
        method: 'POST',
        body: { Nombre, Email, Telefono, Tipo, Mensaje, Creado: new Date() },
    })
    try {
        await notificarDirectus(event, 'Nuevo Mensaje',
            `<p>Hay un nuevo mensaje en la colección de mensajes</p>
                      <br>
                      <p>Nombre: ${escaparHtml(Nombre)}</p><br>
                      <p>Telefono y Email: ${escaparHtml(Telefono)} | ${escaparHtml(Email)}</p><br>
                      <div><p>Mensaje:</p><br>${escaparHtml(Mensaje)}</div>`,
            'Mensajes', mensaje.id)
    } catch {
        console.error('No se pudo notificar el mensaje', mensaje.id)
    }
    return { ok: true }
})
