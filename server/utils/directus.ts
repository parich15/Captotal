import type { H3Event } from 'h3'

// Peticiones a Directus desde el servidor. Con `token: true` se usa el token privado (nunca llega al navegador).
export const directus = <T = any>(event: H3Event | undefined, path: string, opciones: { method?: 'GET' | 'POST', query?: Record<string, any>, body?: any, token?: boolean } = {}) => {
    const config = useRuntimeConfig(event)
    const { token, ...resto } = opciones
    return $fetch<T>(path, {
        baseURL: config.directusUrl,
        ...resto,
        headers: token && config.directusToken ? { Authorization: `Bearer ${config.directusToken}` } : undefined,
    })
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escaparHtml = (valor: unknown) => String(valor ?? '').replace(/[&<>"']/g, c => ESCAPES[c])

// Campo de texto obligatorio de un formulario: recorta y limita la longitud
export const campoTexto = (valor: unknown, max = 200) => {
    const texto = String(valor ?? '').trim()
    return texto && texto.length <= max ? texto : null
}

// Aviso en la bandeja de Directus (mismo destinatario que antes)
export const notificarDirectus = (event: H3Event, subject: string, message: string, collection: string, item: number | string) =>
    directus(event, '/notifications', {
        method: 'POST',
        body: { status: 'inbox', recipient: 'e64ad966-00f8-4a65-8461-f2debdde73e4', subject, message, collection, item },
    })

// Id del último registro de una colección (el rol público puede crear pero no leer, por eso hace falta el token)
export const ultimoId = async (event: H3Event, coleccion: string) => {
    const res = await directus<{ data: { id: number }[] }>(event, `/items/${coleccion}`, {
        query: { fields: 'id', sort: '-id', limit: 1 },
        token: true,
    })
    return res.data[0]?.id
}

// El teléfono llega como número desde <input type="number">: se conserva el tipo para Directus
export const campoTelefono = (valor: unknown) =>
    typeof valor === 'number' && Number.isFinite(valor) ? valor : campoTexto(valor, 30)
