import type { H3Event } from 'h3'

// Peticiones a Directus desde el servidor. Con `token: true` se usa el token privado (nunca llega al navegador).
export const directus = <T = any>(event: H3Event | undefined, path: string, opciones: { method?: 'GET' | 'POST' | 'PATCH', query?: Record<string, any>, body?: any, token?: boolean } = {}) => {
    const config = useRuntimeConfig(event)
    const { token = !!opciones.method && opciones.method !== 'GET', ...resto } = opciones
    if (token && !config.directusToken) {
        throw createError({ statusCode: 503, statusMessage: 'Servicio no configurado' })
    }
    return $fetch<T>(path, {
        baseURL: config.directusUrl,
        ...resto,
        timeout: 10000,
        retry: 0,
        headers: token && config.directusToken ? { Authorization: `Bearer ${config.directusToken}` } : undefined,
    })
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escaparHtml = (valor: unknown) => String(valor ?? '').replace(/[&<>"']/g, c => ESCAPES[c])

// Campo de texto obligatorio de un formulario: recorta y limita la longitud
export const campoTexto = (valor: unknown, max = 200) => {
    if (typeof valor !== 'string') return null
    const texto = valor.trim()
    return texto && texto.length <= max ? texto : null
}

// Aviso en la bandeja de Directus (mismo destinatario que antes)
export const notificarDirectus = (event: H3Event, subject: string, message: string, collection: string, item: number | string) =>
    directus(event, '/notifications', {
        method: 'POST',
        body: { status: 'inbox', recipient: 'e64ad966-00f8-4a65-8461-f2debdde73e4', subject, message, collection, item },
    })
