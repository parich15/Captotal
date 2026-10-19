import { createCipheriv, createHmac, timingSafeEqual } from 'node:crypto'

export const REDSYS_SIGNATURE_VERSION = 'HMAC_SHA256_V1'

const claveOperacion = (secreto: string, pedido: string) => {
    const datos = Buffer.alloc(Math.ceil(Buffer.byteLength(pedido) / 8) * 8)
    datos.write(pedido)
    const cipher = createCipheriv('des-ede3-cbc', Buffer.from(secreto, 'base64'), Buffer.alloc(8))
    cipher.setAutoPadding(false)
    return Buffer.concat([cipher.update(datos), cipher.final()])
}

const firmar = (secreto: string, pedido: string, parametros: string) =>
    createHmac('sha256', claveOperacion(secreto, pedido)).update(parametros).digest('base64')

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
    comercio: string
    terminal: string
    moneda: string
    operacion: string
    autorizado: boolean
    codigo: string
    firma: { Ds_SignatureVersion: string, Ds_MerchantParameters: string, Ds_Signature: string }
}

export const leerRespuestaRedsys = (secreto: string, datos: any): RespuestaRedsys | null => {
    if (!datos || datos.Ds_SignatureVersion !== REDSYS_SIGNATURE_VERSION) return null
    const { Ds_MerchantParameters, Ds_Signature } = datos
    if (typeof Ds_MerchantParameters !== 'string' || typeof Ds_Signature !== 'string' || Ds_MerchantParameters.length > 16000) return null
    try {
        const p = JSON.parse(Buffer.from(Ds_MerchantParameters, 'base64').toString('utf8'))
        const campo = (nombre: string) => String(p[`Ds_${nombre}`] ?? p[`DS_${nombre.toUpperCase()}`] ?? '')
        const pedido = campo('Order')
        if (!/^\d{4,12}$/.test(pedido) || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(Ds_Signature)) return null
        const esperada = Buffer.from(firmar(secreto, pedido, Ds_MerchantParameters), 'base64')
        const recibida = Buffer.from(Ds_Signature, 'base64')
        if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null
        const codigo = campo('Response')
        if (!/^\d{4}$/.test(codigo)) return null
        return {
            pedido, importe: campo('Amount'), comercio: campo('MerchantCode'), terminal: campo('Terminal'),
            moneda: campo('Currency'), operacion: campo('TransactionType'), codigo,
            autorizado: Number(codigo) <= 99,
            firma: { Ds_SignatureVersion: REDSYS_SIGNATURE_VERSION, Ds_MerchantParameters, Ds_Signature },
        }
    } catch {
        return null
    }
}

export const coincideRespuesta = (respuesta: RespuestaRedsys, pedido: { numOrder: string, importe: string }, comercio: { comercio: string, terminal: string }) =>
    respuesta.pedido === pedido.numOrder && respuesta.importe === pedido.importe &&
    respuesta.comercio === comercio.comercio && /^\d+$/.test(respuesta.terminal) && Number(respuesta.terminal) === Number(comercio.terminal) &&
    respuesta.moneda === '978' && respuesta.operacion === '0'
