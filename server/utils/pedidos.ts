import { mkdir, open, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { coincideRespuesta, leerRespuestaRedsys, type RespuestaRedsys } from './redsys.ts'
import type { DatosAlumno } from '../../shared/utils/datosAlumno'

export interface Pedido {
    numOrder: string
    token: string
    importe: string
    precio: string
    curso: { id: number, Titulo: string, Tipo?: string }
    alumno: DatosAlumno
    creado: string
    estado?: 'pendiente' | 'autorizado' | 'denegado'
    evidencia?: RespuestaRedsys & { recibido: string, origen: 'notificacion' | 'url' }
    sincronizacion?: 'pendiente' | 'completa' | 'error'
    alumnoId?: number | string
    legado?: boolean
}

const directorio = () => resolve(useRuntimeConfig().pagosDir)
export const esNumeroPedido = (valor: unknown): valor is string => typeof valor === 'string' && /^\d{4,12}$/.test(valor)
const fichero = (numOrder: string, extension = 'json') => {
    if (!esNumeroPedido(numOrder)) throw new Error('Número de pedido no válido')
    return join(directorio(), `${numOrder}.${extension}`)
}

// Rename evita que otras instancias lean un JSON parcialmente escrito.
export const guardarPedido = async (pedido: Pedido) => {
    await mkdir(directorio(), { recursive: true, mode: 0o700 })
    const temporal = fichero(pedido.numOrder, `${randomBytes(6).toString('hex')}.tmp`)
    try {
        await writeFile(temporal, JSON.stringify(pedido), { mode: 0o600, flag: 'wx' })
        await rename(temporal, fichero(pedido.numOrder))
    } finally {
        await unlink(temporal).catch(() => {})
    }
}

export const leerPedido = async (numOrder: string): Promise<Pedido | null> => {
    try {
        return JSON.parse(await readFile(fichero(numOrder), 'utf8'))
    } catch (error: any) {
        if (error.code === 'ENOENT') return null
        throw error
    }
}

// La guardia serializa recuperaciones tras un crash. Si la propia guardia queda
// abandonada, se requiere retirarla operativamente tras comprobar su proceso.
export const conBloqueoPedido = async <T>(numOrder: string, tarea: () => Promise<T>): Promise<T> => {
    await mkdir(directorio(), { recursive: true, mode: 0o700 })
    const ruta = fichero(numOrder, 'lock')
    const guardia = fichero(numOrder, 'recovery')
    const dueno = `${process.pid}:${randomBytes(12).toString('hex')}`
    const liberar = async (archivo: string) => {
        try {
            if (await readFile(archivo, 'utf8') === dueno) await unlink(archivo)
        } catch (error: any) { if (error.code !== 'ENOENT') throw error }
    }
    const recuperar = async () => {
        let exclusiva
        try { exclusiva = await open(guardia, 'wx', 0o600) } catch (error: any) {
            if (error.code === 'EEXIST') return
            throw error
        }
        try {
            await exclusiva.writeFile(dueno)
            await exclusiva.close()
            // Releer dentro de la guardia: otro recuperador pudo haber terminado.
            const pid = Number((await readFile(ruta, 'utf8')).split(':')[0])
            if (Number.isInteger(pid) && pid > 0) {
                try { process.kill(pid, 0) } catch (error: any) {
                    if (error.code === 'ESRCH') await unlink(ruta)
                }
            } else if (Date.now() - (await stat(ruta)).mtimeMs > 60000) {
                await unlink(ruta)
            }
        } catch (error: any) { if (error.code !== 'ENOENT') throw error } finally {
            await exclusiva.close().catch(() => {})
            await liberar(guardia)
        }
    }
    const limite = Date.now() + 10000
    while (true) {
        try {
            const archivo = await open(ruta, 'wx', 0o600)
            try { await archivo.writeFile(dueno) } finally { await archivo.close() }
            break
        } catch (error: any) {
            if (error.code !== 'EEXIST') throw error
            await recuperar()
            if (Date.now() >= limite) throw new Error('Pedido ocupado; revisar bloqueo o reintentar')
            await new Promise(resolve => setTimeout(resolve, 50))
        }
    }
    try { return await tarea() } finally { await liberar(ruta) }
}

// Ejecutar dentro del bloqueo. La consulta recupera un alta si Directus recibió el POST
// pero se perdió la respuesta; Pedido_Verificado tiene restricción única en Directus y permanece vacío en el histórico.
const sincronizarAlumno = async (pedido: Pedido) => {
    if (pedido.estado !== 'autorizado' || pedido.sincronizacion === 'completa') return
    const config = useRuntimeConfig()
    const evidencia = leerRespuestaRedsys(config.redsys.secreto, pedido.evidencia?.firma)
    if (!evidencia?.autorizado || !coincideRespuesta(evidencia, pedido, config.redsys)) {
        pedido.sincronizacion = 'error'
        await guardarPedido(pedido)
        console.error(`[pagos] Evidencia no verificable; revisar pedido ${pedido.numOrder}`)
        return
    }
    try {
        const buscar = () => directus<{ data: { id: number | string }[] }>(undefined, '/items/Alumnos', {
            token: true, query: { filter: JSON.stringify({ Pedido_Verificado: { _eq: pedido.numOrder } }), fields: 'id', limit: 1 },
        })
        const existente = await buscar()
        let id = existente.data[0]?.id
        if (!id && pedido.legado) {
            const antiguos = await directus<{ data: { id: number | string, Email: string, Curso: number | string, Total: string | number, Pedido_Verificado?: string | null }[] }>(undefined, '/items/Alumnos', {
                token: true, query: { filter: JSON.stringify({ Numero_Pedido: { _eq: pedido.numOrder } }), fields: 'id,Email,Curso,Total,Pedido_Verificado', limit: 2 },
            })
            if (antiguos.data.length > 1) throw new Error('Alta histórica ambigua')
            const antiguo = antiguos.data[0]
            if (antiguo) {
                if (antiguo.Email.trim().toLowerCase() !== pedido.alumno.Email.trim().toLowerCase() ||
                    String(antiguo.Curso) !== String(pedido.curso.id) || Number(antiguo.Total) !== Number(pedido.precio) ||
                    (antiguo.Pedido_Verificado && antiguo.Pedido_Verificado !== pedido.numOrder)) throw new Error('Alta histórica no coincide')
                await directus(undefined, `/items/Alumnos/${antiguo.id}`, { method: 'PATCH', body: { Pedido_Verificado: pedido.numOrder } })
                id = antiguo.id
            }
        }
        if (!id) {
            try {
                const alta = await directus<{ data: { id: number | string }[] }>(undefined, '/items/Alumnos', {
                    method: 'POST', body: [{
                        Nombre: pedido.alumno.Nombre, Apellidos: pedido.alumno.Apellidos,
                        Email: pedido.alumno.Email, Telefono: pedido.alumno.Telefono,
                        Nie: pedido.alumno.NieNif, Numero_Pedido: pedido.numOrder, Pedido_Verificado: pedido.numOrder,
                        Curso: String(pedido.curso.id), Total: Number(pedido.precio),
                    }],
                })
                id = alta.data[0]?.id
                if (!id) throw new Error('Directus no devolvió el identificador del alumno')
            } catch (error) {
                id = (await buscar()).data[0]?.id
                if (!id) throw error
            }
        }
        pedido.alumnoId = id
        pedido.sincronizacion = 'completa'
    } catch {
        pedido.sincronizacion = 'error'
        console.error(`[pagos] Alta pendiente de reintento: pedido ${pedido.numOrder}`)
    }
    await guardarPedido(pedido)
}

export const procesarRespuestaPago = async (respuesta: RespuestaRedsys, origen: 'notificacion' | 'url') =>
    conBloqueoPedido(respuesta.pedido, async () => {
        const pedido = await leerPedido(respuesta.pedido)
        if (!pedido || !coincideRespuesta(respuesta, pedido, useRuntimeConfig().redsys)) return null
        // Una denegación repetida nunca revoca una autorización ya verificada.
        if (pedido.estado !== 'autorizado') {
            if (!pedido.estado) pedido.legado = true
            pedido.estado = respuesta.autorizado ? 'autorizado' : 'denegado'
            pedido.evidencia = { ...respuesta, recibido: new Date().toISOString(), origen }
            pedido.sincronizacion = 'pendiente'
            await guardarPedido(pedido)
        }
        await sincronizarAlumno(pedido)
        return pedido
    })

export const reconciliarPedido = (numOrder: string) => conBloqueoPedido(numOrder, async () => {
    const pedido = await leerPedido(numOrder)
    if (!pedido) return null
    await sincronizarAlumno(pedido)
    return pedido
})

// Solo pendientes nuevos nunca verificados. Se conservan los legados y las altas por reconciliar.
let ultimaLimpieza = 0
export const limpiarPedidosPendientes = async () => {
    if (Date.now() - ultimaLimpieza < 3600000) return
    ultimaLimpieza = Date.now()
    await mkdir(directorio(), { recursive: true, mode: 0o700 })
    for (const nombre of await readdir(directorio())) {
        if (!/^\d{4,12}\.json$/.test(nombre)) continue
        if (Date.now() - (await stat(join(directorio(), nombre))).mtimeMs < 7 * 86400000) continue
        const numOrder = nombre.slice(0, -5)
        await conBloqueoPedido(numOrder, async () => {
            const pedido = await leerPedido(numOrder)
            if (pedido?.estado === 'pendiente' && !pedido.legado && !pedido.evidencia && Date.now() - Date.parse(pedido.creado) > 7 * 86400000) await unlink(fichero(numOrder))
        })
    }
}
