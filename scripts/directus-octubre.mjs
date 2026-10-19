import { randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'

// Ejecutar en el VPS con un token administrador temporal. Nunca imprime credenciales.
const base = process.env.DIRECTUS_URL || 'https://admin.captotal.com'
const token = process.env.DIRECTUS_ADMIN_TOKEN
if (!token) throw new Error('Falta DIRECTUS_ADMIN_TOKEN')
const fase = process.argv[2] || '--prepare'
const backup = resolve(process.env.DIRECTUS_MIGRATION_BACKUP || '.data/migraciones/octubre-permisos.json')
const texto = 'Quiero recibir información sobre cursos, fechas y ofertas de Captotal por email, SMS y WhatsApp. Puedo darme de baja en cualquier momento'

async function api(path, method = 'GET', body) {
    const res = await fetch(new URL(path, base), {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    if (!res.ok) throw new Error(`Directus ${method} ${path.split('?')[0]}: ${res.status}`)
    return res.status === 204 ? undefined : (await res.json()).data
}

const colecciones = ['Alumnos', 'Interesados', 'Newsletter', 'Mensajes', 'directus_notifications']
const permisosPublicos = p => !p.role && colecciones.includes(p.collection)

async function respaldar() {
    try { return JSON.parse(await readFile(backup, 'utf8')) } catch (e) { if (e.code !== 'ENOENT') throw e }
    const datos = {
        creado: new Date().toISOString(),
        permisos: (await api('/permissions?limit=-1')).filter(permisosPublicos),
        campos: await Promise.all(['Cursos', 'Interesados', 'Alumnos'].map(c => api(`/fields/${c}`))),
    }
    await mkdir(dirname(backup), { recursive: true, mode: 0o700 })
    await writeFile(backup, JSON.stringify(datos, null, 2), { mode: 0o600, flag: 'wx' })
    return datos
}

async function campo(coleccion, field, type, meta, schema = {}) {
    const fields = await api(`/fields/${coleccion}`)
    if (!fields.some(f => f.field === field)) {
        await api(`/fields/${coleccion}`, 'POST', { field, type, meta, schema })
        console.log(`Campo creado: ${coleccion}.${field}`)
    }
}

if (fase === '--prepare') {
    await respaldar()
    await campo('Cursos', 'texto_checkbox_formulario', 'text', { interface: 'input-multiline', note: 'Etiqueta del consentimiento comercial voluntario.' })
    await campo('Interesados', 'consentimiento_comercial', 'boolean', { interface: 'boolean' }, { default_value: false })
    await campo('Interesados', 'consentimiento_fecha', 'timestamp', { interface: 'datetime' })
    await campo('Interesados', 'consentimiento_texto', 'text', { interface: 'input-multiline' })
    await campo('Alumnos', 'Pedido_Verificado', 'string', { interface: 'input', readonly: true, note: 'Idempotencia de altas verificadas por la web; no completar manualmente.' }, { is_unique: true, is_nullable: true })
    const total = (await api('/fields/Alumnos')).find(f => f.field === 'Total')
    if (total.type !== 'decimal') await api('/fields/Alumnos/Total', 'PATCH', { type: 'decimal', schema: { numeric_precision: 12, numeric_scale: 2 } })
    const cursos = await api('/items/Cursos?fields=id,texto_checkbox_formulario&limit=-1')
    for (const c of cursos) if (!c.texto_checkbox_formulario?.trim()) await api(`/items/Cursos/${c.id}`, 'PATCH', { texto_checkbox_formulario: texto })

    const roles = await api('/roles?limit=-1')
    const role = roles.find(r => r.name === 'Web Captotal') || await api('/roles', 'POST', { name: 'Web Captotal', icon: 'language', admin_access: false, app_access: false })
    const permisos = await api('/permissions?limit=-1')
    const contratos = {
        Cursos: { read: ['id', 'Titulo', 'Tipo', 'Precio', 'Aforo', 'Activo', 'status', 'texto_checkbox_formulario'] },
        Alumnos: { create: ['Nombre', 'Apellidos', 'Email', 'Telefono', 'Nie', 'Numero_Pedido', 'Pedido_Verificado', 'Curso', 'Total'], read: ['id', 'Pedido_Verificado', 'Numero_Pedido', 'Email', 'Curso', 'Total'], update: ['Pedido_Verificado'] },
        Interesados: { create: ['Nombre', 'Email', 'Telefono', 'Curso', 'Centro', 'Fecha', 'consentimiento_comercial', 'consentimiento_fecha', 'consentimiento_texto'], read: ['id'] },
        Newsletter: { create: ['Email'], read: ['id', 'Email'] },
        Mensajes: { create: ['Nombre', 'Email', 'Telefono', 'Tipo', 'Mensaje', 'Creado'], read: ['id'] },
        directus_notifications: { create: ['status', 'recipient', 'subject', 'message', 'collection', 'item'], read: ['id'] },
    }
    for (const [collection, acciones] of Object.entries(contratos)) for (const [action, fields] of Object.entries(acciones)) {
        const existente = permisos.find(p => p.role === role.id && p.collection === collection && p.action === action)
        const body = { role: role.id, collection, action, fields, permissions: {}, validation: {} }
        await api(existente ? `/permissions/${existente.id}` : '/permissions', existente ? 'PATCH' : 'POST', body)
    }
    const email = 'web-captotal@localhost.invalid'
    const usuarios = await api(`/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id,role&limit=1`)
    const user = usuarios[0]
    if (user && user.role !== role.id) throw new Error('El usuario de servicio existente tiene otro rol')
    const privado = randomBytes(32).toString('hex')
    await api(user ? `/users/${user.id}` : '/users', user ? 'PATCH' : 'POST', { email, role: role.id, status: 'active', token: privado })
    const envPath = resolve('.env')
    let env = await readFile(envPath, 'utf8').catch(e => { if (e.code === 'ENOENT') return ''; throw e })
    env = env.replace(/^\s*NUXT_DIRECTUS_TOKEN\s*=.*\r?\n?/gm, '')
    await writeFile(envPath, `${env.trimEnd()}\nNUXT_DIRECTUS_TOKEN=${privado}\n`, { mode: 0o600 })
    console.log('Preparación completada; token privado guardado solo en .env. Permisos públicos aún sin cambios.')
} else if (fase === '--close') {
    await respaldar()
    for (const p of (await api('/permissions?limit=-1')).filter(permisosPublicos)) {
        await api(`/permissions/${p.id}`, 'DELETE')
        console.log(`Retirado acceso público: ${p.collection} ${p.action}`)
    }
} else if (fase === '--restore-permissions') {
    const datos = JSON.parse(await readFile(backup, 'utf8'))
    const actuales = await api('/permissions?limit=-1')
    for (const { id, ...p } of datos.permisos) {
        if (!actuales.some(a => a.role === p.role && a.collection === p.collection && a.action === p.action)) await api('/permissions', 'POST', p)
    }
    console.log('Permisos previos restaurados; campos nuevos y pedidos conservados.')
} else throw new Error('Usar --prepare, --close o --restore-permissions')
