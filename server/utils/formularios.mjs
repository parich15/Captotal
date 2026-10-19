import { isIP } from 'node:net'

export const textoFormulario = (valor, max = 200) => {
    if (typeof valor !== 'string') return null
    const texto = valor.trim()
    return texto && texto.length <= max && !/[\u0000-\u001f\u007f]/.test(texto) ? texto : null
}

export const emailFormulario = (valor) => {
    const email = textoFormulario(valor, 254)?.toLowerCase()
    if (!email || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)) return null
    const [local, dominio] = email.split('@')
    if (dominio.split('.').some(etiqueta => etiqueta.length > 63)) return null
    return local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') ? email : null
}

export const telefonoFormulario = (valor) => {
    const telefono = textoFormulario(valor, 30)
    if (!telefono || !/^\+?[\d\s().-]+$/.test(telefono)) return null
    const digitos = telefono.replace(/\D/g, '')
    return digitos.length >= 9 && digitos.length <= 15 ? telefono : null
}

// Solo se aceptan cabeceras cuando la conexión procede de un proxy configurado explícitamente.
export const ipFormulario = (direccion, realIp, proxies = '') => {
    const autorizados = String(proxies).split(',').map(ip => ip.trim()).filter(Boolean)
    return autorizados.includes(direccion) && typeof realIp === 'string' && isIP(realIp.trim())
        ? realIp.trim() : direccion || 'desconocida'
}

export const crearLimitador = ({ max = 5, ventana = 600_000, capacidad = 10_000 } = {}) => {
    const intentos = new Map()
    return (clave, ahora = Date.now()) => {
        for (const [ip, valor] of intentos) if (valor.hasta <= ahora) intentos.delete(ip)
        const registro = intentos.get(clave)
        if (!registro) {
            if (intentos.size >= capacidad) return false
            intentos.set(clave, { cantidad: 1, hasta: ahora + ventana })
            return true
        }
        registro.cantidad++
        return registro.cantidad <= max
    }
}

export const captchaValido = (respuesta, dominios, minimo = 0.5) => {
    if (respuesta?.success !== true || typeof respuesta.hostname !== 'string') return false
    if (respuesta.action !== 'newsletter' || typeof respuesta.score !== 'number' || !Number.isFinite(respuesta.score)) return false
    if (typeof minimo !== 'number' || !Number.isFinite(minimo) || minimo < 0 || minimo > 1) return false
    if (respuesta.score < minimo || respuesta.score > 1) return false
    const permitidos = String(dominios).split(',').map(host => host.trim().toLowerCase()).filter(Boolean)
    // siteverify comprueba caducidad y uso único; challenge_ts es la carga del desafío.
    return permitidos.includes(respuesta.hostname.toLowerCase())
}
