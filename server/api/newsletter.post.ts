import { captchaValido, crearLimitador, emailFormulario, ipFormulario, textoFormulario } from '../utils/formularios.mjs'

const permitirIntento = crearLimitador()
// PM2 ejecuta un único proceso fork. Serializar por email evita altas simultáneas en ese proceso.
const altas = new Map<string, Promise<{ ok: boolean, created: boolean }>>()

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const ip = ipFormulario(event.node.req.socket.remoteAddress, getHeader(event, 'x-real-ip'), config.trustedProxyIps)
    if (!permitirIntento(ip)) {
        setHeader(event, 'Retry-After', '600')
        throw createError({ statusCode: 429, statusMessage: 'Demasiados intentos. Inténtalo en unos minutos.' })
    }
    const body = await readBody(event)
    const email = emailFormulario(body?.Email)
    const token = textoFormulario(body?.recaptchaToken, 4096)
    if (!email || !token || (body?.website !== undefined && body.website !== '')) {
        throw createError({ statusCode: 400, statusMessage: 'Revisa el email y completa la verificación.' })
    }
    if (!config.recaptchaSecret || !String(config.recaptchaHostnames || '').trim()) {
        throw createError({ statusCode: 503, statusMessage: 'La suscripción no está disponible. Inténtalo más tarde.' })
    }
    let verificacion
    try {
        verificacion = await $fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: new URLSearchParams({ secret: String(config.recaptchaSecret), response: token }),
            timeout: 8000,
            retry: 0,
        })
    } catch {
        throw createError({ statusCode: 503, statusMessage: 'No se pudo verificar el formulario. Vuelve a intentarlo.' })
    }
    if (!captchaValido(verificacion, config.recaptchaHostnames, Number(config.recaptchaMinScore ?? 0.5))) {
        throw createError({ statusCode: 400, statusMessage: 'No se pudo verificar el formulario. Vuelve a intentarlo.' })
    }

    const existente = altas.get(email)
    if (existente) {
        await existente
        return { ok: true, created: false }
    }
    if (altas.size >= 100) throw createError({ statusCode: 503, statusMessage: 'Servicio ocupado. Inténtalo en unos minutos.' })
    const alta = (async () => {
        const { data } = await directus<{ data: { id: number, Email: string }[] }>(event, '/items/Newsletter', {
            query: { filter: JSON.stringify({ Email: { _icontains: email } }), fields: 'id,Email', limit: -1 }, token: true,
        })
        if (data.some(item => emailFormulario(item.Email) === email)) return { ok: true, created: false }
        await directus(event, '/items/Newsletter', { method: 'POST', body: { Email: email }, token: true })
        return { ok: true, created: true }
    })()
    altas.set(email, alta)
    try {
        return await alta
    } finally {
        altas.delete(email)
    }
})
