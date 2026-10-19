export interface DatosAlumno {
    Nombre: string
    Apellidos: string
    Email: string
    Telefono: string
    NieNif: string
}

export const dniNieValido = (valor: string) => {
    const documento = valor.trim().toUpperCase()
    if (!/^(?:\d{8}|[XYZ]\d{7})[A-Z]$/.test(documento)) return false
    const numero = documento.slice(0, -1).replace(/^[XYZ]/, letra => String('XYZ'.indexOf(letra)))
    return 'TRWAGMYFPDXBNJZSQVHLCKE'[Number(numero) % 23] === documento.at(-1)
}

export const validarDatosAlumno = (entrada: unknown) => {
    const errores: Partial<Record<keyof DatosAlumno, string>> = {}
    const datos = {} as DatosAlumno
    const origen = entrada && typeof entrada === 'object' && !Array.isArray(entrada) ? entrada as Record<string, unknown> : {}
    const limites: Record<keyof DatosAlumno, number> = { Nombre: 100, Apellidos: 150, Email: 254, Telefono: 30, NieNif: 9 }
    for (const campo of Object.keys(limites) as (keyof DatosAlumno)[]) {
        const valor = typeof origen[campo] === 'string' ? origen[campo].trim() : ''
        datos[campo] = valor
        if (!valor || valor.length > limites[campo] || /[\x00-\x1f]/.test(valor)) errores[campo] = 'Completa este campo con un valor válido.'
    }
    datos.Email = datos.Email.toLowerCase()
    datos.NieNif = datos.NieNif.toUpperCase()
    if (!errores.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.Email)) errores.Email = 'Introduce un correo electrónico válido.'
    if (!errores.Telefono && (!/^\+?[\d ()-]+$/.test(datos.Telefono) || !/^\d{9,15}$/.test(datos.Telefono.replace(/\D/g, '')))) errores.Telefono = 'Introduce un teléfono de entre 9 y 15 dígitos.'
    if (!errores.NieNif && !dniNieValido(datos.NieNif)) errores.NieNif = 'Introduce un DNI o NIE válido, incluida su letra.'
    return { datos, errores, valido: Object.keys(errores).length === 0 }
}

// Conversión decimal exacta: rechaza exponentes, negativos y más de dos decimales.
export const precioEnCentimos = (entrada: unknown): number | null => {
    if (typeof entrada !== 'string' && typeof entrada !== 'number') return null
    const precio = String(entrada).trim()
    if (!/^\d+(?:\.\d{1,2})?$/.test(precio)) return null
    const [euros, decimales = ''] = precio.split('.')
    const total = Number(euros) * 100 + Number(decimales.padEnd(2, '0'))
    return Number.isSafeInteger(total) && total > 0 && total <= 999999999 ? total : null
}
