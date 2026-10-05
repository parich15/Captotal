import { mkdir, open, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

// Pedidos pendientes de pago guardados en disco (compartido entre las instancias de PM2 en cluster).
// Contienen datos personales: se borran a los 7 días.
const CADUCIDAD_MS = 7 * 24 * 60 * 60 * 1000

export interface Pedido {
    numOrder: string
    token: string
    importe: string
    precio: string
    curso: { id: number, Titulo: string, Tipo?: string }
    alumno: { Nombre: string, Apellidos: string, Email: string, Telefono: string | number, NieNif: string }
    creado: string
}

const directorio = () => resolve(useRuntimeConfig().pagosDir)
const fichero = (numOrder: string, extension: string) => {
    if (!/^\d{4,12}$/.test(numOrder)) throw new Error(`Número de pedido no válido: ${numOrder}`)
    return join(directorio(), `${numOrder}.${extension}`)
}

export const esNumeroPedido = (valor: unknown): valor is string => typeof valor === 'string' && /^\d{4,12}$/.test(valor)

export const guardarPedido = async (pedido: Pedido) => {
    await mkdir(directorio(), { recursive: true })
    await writeFile(fichero(pedido.numOrder, 'json'), JSON.stringify(pedido))
    limpiarPedidos().catch(e => console.error('[pagos] Error limpiando pedidos antiguos', e))
}

export const leerPedido = async (numOrder: string): Promise<Pedido | null> => {
    try {
        return JSON.parse(await readFile(fichero(numOrder, 'json'), 'utf8'))
    } catch {
        return null
    }
}

// Marca atómica (creación exclusiva del fichero): devuelve true solo la primera vez para cada pedido,
// aunque lleguen a la vez la notificación de Redsys y la página de confirmación en distintas instancias.
export const marcarUnaVez = async (numOrder: string, marca: 'alta' | 'vista', contenido = '') => {
    try {
        await mkdir(directorio(), { recursive: true })
        const f = await open(fichero(numOrder, marca), 'wx')
        await f.writeFile(contenido)
        await f.close()
        return true
    } catch (e: any) {
        if (e.code === 'EEXIST') return false
        throw e
    }
}

export const quitarMarca = (numOrder: string, marca: 'alta' | 'vista') => unlink(fichero(numOrder, marca)).catch(() => {})

const limpiarPedidos = async () => {
    const dir = directorio()
    const limite = Date.now() - CADUCIDAD_MS
    for (const nombre of await readdir(dir)) {
        const ruta = join(dir, nombre)
        if ((await stat(ruta)).mtimeMs < limite) await unlink(ruta).catch(() => {})
    }
}

// Crea el alumno en Directus una sola vez por pedido. `origen` indica cómo se ha confirmado el pago.
export const darDeAltaAlumno = async (pedido: Pedido, origen: 'notificacion' | 'url' | 'sin-verificar') => {
    if (!await marcarUnaVez(pedido.numOrder, 'alta', `${origen} ${new Date().toISOString()}`)) return false
    try {
        await directus(undefined, '/items/Alumnos', {
            method: 'POST',
            body: [{
                Nombre: pedido.alumno.Nombre,
                Apellidos: pedido.alumno.Apellidos,
                Email: pedido.alumno.Email,
                Telefono: pedido.alumno.Telefono,
                Nie: pedido.alumno.NieNif,
                Numero_Pedido: pedido.numOrder,
                Curso: pedido.curso.id.toString(),
                Total: parseInt(pedido.precio),
            }],
        })
    } catch (e) {
        // Si Directus falla liberamos la marca para que el siguiente aviso (notificación o recarga) lo reintente
        await quitarMarca(pedido.numOrder, 'alta')
        throw e
    }
    if (origen === 'sin-verificar') {
        console.warn(`[pagos] Alumno del pedido ${pedido.numOrder} creado sin confirmación firmada de Redsys`)
    }
    return true
}
