import { createCipheriv, createHmac, timingSafeEqual } from 'node:crypto'

export const REDSYS_SIGNATURE_VERSION = 'HMAC_SHA256_V1'

// Clave de la operación: 3DES-CBC (IV a ceros, relleno con ceros) del nº de pedido con la clave secreta del comercio
const claveOperacion = (secreto: string, pedido: string) => {
    const datos = Buffer.alloc(Math.ceil(Buffer.byteLength(pedido) / 8) * 8)
    datos.write(pedido)
    const cipher = createCipheriv('des-ede3-cbc', Buffer.from(secreto, 'base64'), Buffer.alloc(8))
    cipher.setAutoPadding(false)
    return Buffer.concat([cipher.update(datos), cipher.final()])
}

const firmar = (secreto: string, pedido: string, merchantParameters: string) =>
    createHmac('sha256', claveOperacion(secreto, pedido)).update(merchantParameters).digest('base64')

// Redsys responde con base64 "url safe": normalizamos antes de comparar
const base64Url = (s: string) => s.replace(/\+/g, '-').replace(/\//g, '_')

export const firmarPeticionRedsys = (secreto: string, parametros: Record<string, string>) => {
    const Ds_MerchantParameters = Buffer.from(JSON.stringify(parametros)).toString('base64')
    return {
        Ds_SignatureVersion: REDSYS_SIGNATURE_VERSION,
        Ds_MerchantParameters,
        Ds_Signature: firmar(secreto, parametros.DS_MERCHANT_ORDER, Ds_MerchantParameters),
    }
}

export interface RespuestaRedsys {
    pedido: string
    importe: string
    autorizado: boolean
    codigo: string
}

// Valida la respuesta de Redsys (notificación online o parámetros en la URLOK). Devuelve null si la firma no es válida.
export const leerRespuestaRedsys = (secreto: string, datos: { Ds_MerchantParameters?: unknown, Ds_Signature?: unknown }): RespuestaRedsys | null => {
    const { Ds_MerchantParameters, Ds_Signature } = datos
    if (typeof Ds_MerchantParameters !== 'string' || typeof Ds_Signature !== 'string') return null
    try {
        const p = JSON.parse(Buffer.from(Ds_MerchantParameters, 'base64').toString('utf8'))
        const pedido = String(p.Ds_Order ?? p.DS_ORDER ?? '')
        if (!pedido) return null
        const esperada = Buffer.from(base64Url(firmar(secreto, pedido, Ds_MerchantParameters)))
        const recibida = Buffer.from(base64Url(Ds_Signature))
        if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null
        const codigo = String(p.Ds_Response ?? p.DS_RESPONSE ?? '')
        return {
            pedido,
            importe: String(p.Ds_Amount ?? p.DS_AMOUNT ?? ''),
            // Ds_Response entre 0000 y 0099 = operación autorizada
            autorizado: /^\d+$/.test(codigo) && Number(codigo) <= 99,
            codigo,
        }
    } catch {
        return null
    }
}
