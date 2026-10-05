// Formulario "Más información" de la ficha de curso
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const Nombre = campoTexto(body?.Nombre)
    const Email = campoTexto(body?.Email)
    const Telefono = campoTelefono(body?.Telefono)
    const Curso = Number(body?.Curso)
    const Titulo = campoTexto(body?.Titulo) ?? ''
    if (!Nombre || !Email || Telefono === null || !Number.isInteger(Curso)) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    await directus(event, '/items/Interesados', {
        method: 'POST',
        body: [{ Nombre, Email, Telefono, Curso, Centro: 1, Fecha: new Date() }],
    })
    await notificarDirectus(event, `Nuevo interesado | Curso: ${Titulo}`,
        `<p>Nuevo interesado en ${escaparHtml(Titulo)}</p>
                  <br>
                  <p>Nombre: ${escaparHtml(Nombre)}</p>
                  <p>Telefono: ${escaparHtml(Telefono)}</p>
                  <p>Email: ${escaparHtml(Email)}</p>
                  `,
        'Interesados', await ultimoId(event, 'Interesados'))
    return { ok: true }
})
