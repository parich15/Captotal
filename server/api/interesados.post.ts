import { emailFormulario, telefonoFormulario, textoFormulario } from '../utils/formularios.mjs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const Nombre = textoFormulario(body?.Nombre)
    const Email = emailFormulario(body?.Email)
    const Telefono = telefonoFormulario(body?.Telefono)
    const Curso = body?.Curso
    if (!Nombre || !Email || !Telefono || !Number.isInteger(Curso) || Curso < 1 || typeof body?.consentimiento_comercial !== 'boolean') {
        throw createError({ statusCode: 400, statusMessage: 'Revisa el nombre, email y teléfono.' })
    }
    const { data: curso } = await directus<{ data: { Titulo: string, texto_checkbox_formulario: string | null } }>(event, `/items/Cursos/${Curso}`, {
        query: { fields: 'Titulo,texto_checkbox_formulario' }, token: true,
    })
    if (!curso) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
    const texto = textoFormulario(curso.texto_checkbox_formulario, 2000)
    if (!texto) throw createError({ statusCode: 503, statusMessage: 'El formulario no está disponible. Contacta con nosotros.' })
    const { data: interesado } = await directus<{ data: { id: number } }>(event, '/items/Interesados', {
        method: 'POST', token: true,
        body: {
            Nombre, Email, Telefono, Curso, Centro: 1, Fecha: new Date().toISOString(),
            consentimiento_comercial: body.consentimiento_comercial,
            consentimiento_fecha: new Date().toISOString(),
            consentimiento_texto: texto,
        },
    })
    // El alta ya está confirmada; un fallo del aviso no debe invitar al usuario a duplicarla.
    try {
        await notificarDirectus(event, `Nuevo interesado | Curso: ${curso.Titulo}`,
            `<p>Nuevo interesado en ${escaparHtml(curso.Titulo)}</p><p>Nombre: ${escaparHtml(Nombre)}</p><p>Teléfono: ${escaparHtml(Telefono)}</p><p>Email: ${escaparHtml(Email)}</p>`,
            'Interesados', interesado.id)
    } catch {
        console.error('No se pudo notificar el alta del interesado', interesado.id)
    }
    return { ok: true }
})
