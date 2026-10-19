import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { Parts, M, ss, lerp, damp, clamp, lathe, deformedSphere, taperedTube, ribbon, canvasTexture, roundRect, weldNormals } from './professionals-kit.js'

const BRAND = { orange: '#f97316', navy: '#253342', ivory: '#f4f1e8', sky: '#c9e3ed' }
const HEAD = { rx: .29, ry: .315, rz: .295 }
const HEAD_Y = .27 // centro de la cabeza sobre el pivote del cuello
const EYE = { x: .108, y: -.014, r: .064, depth: .72 }

// Cabeza: cráneo amplio, mandíbula suave y mofletes discretos.
function headShape(d, out) {
  const low = ss(.15, -1, d.y)
  let x = d.x * (1 - .2 * low * low)
  let z = d.z * (1 - .05 * low)
  x *= 1 + .1 * Math.exp(-((d.y + .32) ** 2) / .05) * Math.max(0, d.z)
  if (d.z < 0) z *= 1 + .1 * ss(-.4, .5, d.y)
  z += .05 * ss(-.5, -.95, d.y) * Math.max(0, d.z)
  return out.set(x * HEAD.rx, d.y * HEAD.ry, z * HEAD.rz)
}

// Superficie frontal de la cabeza, para colocar rasgos y calcomanías.
const surfaceMesh = new THREE.Mesh(deformedSphere(headShape, 96, 72), new THREE.MeshBasicMaterial())
surfaceMesh.updateMatrixWorld(true)
const surfaceRay = new THREE.Raycaster()
const surfaceCache = new Map()
function faceZ(x, y) {
  const key = `${x.toFixed(4)}|${y.toFixed(4)}`
  if (surfaceCache.has(key)) return surfaceCache.get(key)
  surfaceRay.set(new THREE.Vector3(x, y, 2), new THREE.Vector3(0, 0, -1))
  const hit = surfaceRay.intersectObject(surfaceMesh)[0]
  const z = hit ? hit.point.z : 0
  surfaceCache.set(key, z)
  return z
}
// Proyecta una geometría plana (en el plano xy de la cara) sobre la superficie.
function projectOnFace(geometry, offset, ox = 0, oy = 0, scaleZ = 1) {
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i++) p.setZ(i, (faceZ(p.getX(i) + ox, p.getY(i) + oy) + offset) * scaleZ)
  geometry.computeVertexNormals()
  return geometry
}

// Altura de la línea del pelo según el ángulo alrededor de la cabeza (0 frente, 1 nuca).
function hairlineY(d, keys) {
  const a = Math.abs(Math.atan2(d.x, d.z)) / Math.PI
  const stops = keys.length === 6 ? [0, .22, .38, .5, .72, 1] : [0, .22, .5, .72, 1]
  for (let i = 0; i < stops.length - 1; i++) if (a <= stops[i + 1]) return lerp(keys[i], keys[i + 1], ss(stops[i], stops[i + 1], a))
  return keys.at(-1)
}
// Máscara del pelo con anchura de transición constante aunque la línea sea muy inclinada.
function hairMask(d, keys, shift = () => 0, inner = .03, outer = .08) {
  const az = Math.atan2(d.x, d.z), rho = Math.max(.15, Math.hypot(d.x, d.z))
  const at = a => hairlineY(new THREE.Vector3(Math.sin(a), d.y, Math.cos(a)), keys) - shift(a)
  const line = at(az), slope = (at(az + .01) - at(az - .01)) / .02
  const f = (d.y - line) / Math.sqrt(1 + (slope / rho) ** 2)
  return { line, m: ss(-inner, outer, f) }
}
// El pelo se pega a la cabeza junto a la línea de nacimiento y gana volumen hacia la coronilla.
// Crestas de mechones que irradian desde un punto (raya o moño).
function ridges(d, axis, count) {
  const a = new THREE.Vector3(...axis).normalize()
  const b1 = new THREE.Vector3(1, 0, 0).addScaledVector(a, -a.x).normalize(), b2 = new THREE.Vector3().crossVectors(a, b1)
  const psi = Math.atan2(d.dot(b1), d.dot(b2))
  return Math.pow(.5 + .5 * Math.cos(count * psi), 1.6) * ss(.98, .8, d.dot(a))
}
const settle = (d, line, th) => th * (.72 + .28 * ss(line, line + .32, d.y))
function curls(d) {
  const a = Math.sin(d.x * 41 + 1.3) * Math.sin(d.y * 37 + .4) * Math.sin(d.z * 43 + 2.1)
  const b = Math.sin(d.x * 23 - .7) * Math.sin(d.y * 29 + 1.9) * Math.sin(d.z * 19 - 1.1)
  return clamp(.5 + .6 * a + .3 * b, 0, 1)
}
const HAIR = {
  ponytail(d) {
    const sweep = ss(-.3, .4, d.x) * ss(.3, .8, d.z)
    const fringe = a => { const x = Math.sin(a), z = Math.cos(a); return .26 * ss(-.3, .4, x) * ss(.3, .8, z) * ss(.75, -.1, x) }
    const { line, m } = hairMask(d, [.47, .42, .26, -.08, -.4, -.6], fringe)
    const part = 1 - .5 * Math.exp(-(((d.x + .24) / .05) ** 2)) * ss(.2, .6, d.z) * ss(.5, .9, d.y)
    const lockRidge = .013 * ridges(d, [-.24, .9, .3], 24) * ss(line, line + .2, d.y)
    return { m, th: settle(d, line, .036 + .034 * ss(-.2, .9, d.y)) * part + .028 * sweep * ss(line, line + .2, d.y) + lockRidge }
  },
  bun(d) {
    const { line, m } = hairMask(d, [.44, .4, .22, -.04, -.34, -.56])
    const part = 1 - .55 * Math.exp(-((d.x / .045) ** 2)) * ss(.1, .5, d.z) * ss(.45, .85, d.y)
    const lockRidge = .012 * ridges(d, [0, .82, -.45], 26) * ss(line, line + .18, d.y)
    return { m, th: settle(d, line, .032 + .026 * ss(-.1, 1, d.y)) * part + lockRidge }
  },
  curly(d) {
    const { m } = hairMask(d, [.46, .38, .22, -.05, -.32])
    const top = ss(.0, .8, d.y)
    return { m, th: .012 + .05 * top + .045 * top * curls(d) }
  },
  cap(d) {
    return { m: hairMask(d, [.5, .38, -.02, -.24, -.4]).m, th: .02 }
  },
  beard(d) {
    const line = lerp(-.12, -.44, ss(.2, .9, d.z))
    let m = ss(line + .05, line - .09, d.y) * ss(-.55, -.2, d.z)
    const mouth = Math.exp(-((d.x / .26) ** 2 + ((d.y + .49) / .075) ** 2))
    const moustache = ss(.32, .2, Math.abs(d.x)) * ss(-.29, -.34, d.y) * ss(-.45, -.41, d.y) * ss(.6, .8, d.z)
    m = Math.max(m * (1 - mouth * 1.15), moustache)
    return { m: clamp(m, 0, 1), th: .02 }
  },
}
// Mechón que sigue la superficie de la cabeza: direcciones de control → tubo aplanado.
function lock(dirs, lift, radius, tip = .25) {
  const o = new THREE.Vector3()
  const pts = dirs.map(([x, y, z, extra = 0]) => headShape(new THREE.Vector3(x, y, z).normalize(), o).clone().multiplyScalar(1 + lift + extra))
  return taperedTube(new THREE.CatmullRomCurve3(pts), 28, 12, u => radius * (1 - (1 - tip) * u ** 1.4) * Math.min(1, .35 + u * 4), 1, .42)
}
function hairShell(style, segments = [120, 90]) {
  const g = new THREE.SphereGeometry(1, segments[0], segments[1], -Math.PI / 2)
  const p = g.attributes.position, d = new THREE.Vector3(), out = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    d.fromBufferAttribute(p, i).normalize()
    const { m, th } = style(d)
    headShape(d, out).multiplyScalar(lerp(.95, 1 + th, m))
    p.setXYZ(i, out.x, out.y, out.z)
  }
  return weldNormals(g)
}

// Texturas compartidas.
let shared
function sharedTextures() {
  if (shared) return shared
  const strands = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * w, l = 30 + Math.random() * 120, y = Math.random() * h
      ctx.strokeStyle = `rgba(${Math.random() > .5 ? '255,255,255' : '0,0,0'},${.08 + Math.random() * .16})`
      ctx.lineWidth = .6 + Math.random() * 1.6
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - .5) * 6, y + l); ctx.stroke()
    }
  }, { srgb: false, repeat: [6, 2] })
  const curlsMap = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#7a7a7a'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 3 + Math.random() * 5
      const g = ctx.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r)
      g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.7, 'rgba(120,120,120,.2)'); g.addColorStop(1, 'rgba(0,0,0,.45)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
  }, { srgb: false, repeat: [10, 5] })
  const patch = canvasTexture(256, 128, (ctx, w, h) => {
    ctx.fillStyle = BRAND.ivory; roundRect(ctx, 4, 4, w - 8, h - 8, 26); ctx.fill()
    ctx.lineWidth = 6; ctx.strokeStyle = BRAND.orange; roundRect(ctx, 10, 10, w - 20, h - 20, 20); ctx.stroke()
    ctx.textBaseline = 'middle'; ctx.font = '900 50px "League Spartan", "Nunito", sans-serif'
    const cap = ctx.measureText('CAP').width, total = ctx.measureText('TOTAL').width
    const k = Math.min(1, (w - 52) / (cap + total + 8))
    ctx.save(); ctx.translate(w / 2, h / 2 + 3); ctx.scale(k, k); ctx.translate(-(cap + total + 8) / 2, 0)
    ctx.fillStyle = BRAND.orange; ctx.fillText('CAP', 0, 0)
    ctx.fillStyle = BRAND.navy; ctx.fillText('TOTAL', cap + 8, 0)
    ctx.restore()
  })
  const card = canvasTexture(160, 224, (ctx, w, h) => {
    ctx.fillStyle = '#fbfbf8'; roundRect(ctx, 0, 0, w, h, 14); ctx.fill()
    ctx.fillStyle = '#3d6fb5'; ctx.fillRect(0, 0, w, 52)
    ctx.fillStyle = '#f3c84a'
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(30 + Math.cos(a) * 14, 26 + Math.sin(a) * 14, 2.4, 0, Math.PI * 2); ctx.fill() }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.fillText('CONDUCTOR', 56, 31)
    ctx.fillStyle = '#c9d6e6'; roundRect(ctx, 14, 70, 56, 70, 6); ctx.fill()
    ctx.fillStyle = '#8fa4bd'; ctx.beginPath(); ctx.arc(42, 96, 15, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(22, 116, 40, 24)
    ctx.fillStyle = '#c8a24f'; roundRect(ctx, 92, 80, 46, 36, 6); ctx.fill()
    ctx.fillStyle = '#9aa7b4'; for (let i = 0; i < 4; i++) ctx.fillRect(14, 156 + i * 14, i % 2 ? 90 : 126, 6)
    ctx.fillStyle = BRAND.orange; ctx.fillRect(0, h - 14, w, 14)
  })
  const tablet = canvasTexture(192, 256, (ctx, w, h) => {
    ctx.fillStyle = '#e8f1ef'; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 9
    for (const [a, b, c, d] of [[0, 70, w, 40], [40, 0, 70, h], [0, 180, w, 210], [130, 0, 150, h]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke() }
    ctx.fillStyle = '#b9dbe6'; ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w, 120); ctx.quadraticCurveTo(160, 60, 120, 0); ctx.fill()
    ctx.strokeStyle = BRAND.orange; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(30, 230); ctx.lineTo(60, 175); ctx.lineTo(55, 120); ctx.lineTo(120, 95); ctx.lineTo(150, 50); ctx.stroke()
    ctx.fillStyle = BRAND.orange; ctx.beginPath(); ctx.arc(150, 44, 13, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(150, 44, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = BRAND.navy; roundRect(ctx, 12, 12, 96, 34, 10); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = 'bold 17px sans-serif'; ctx.fillText('4h 30m', 22, 35)
  })
  const cupSleeve = canvasTexture(256, 64, (ctx, w, h) => {
    ctx.fillStyle = BRAND.orange; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#fff'; ctx.font = '900 30px "League Spartan", sans-serif'; ctx.textBaseline = 'middle'
    ctx.fillText('CAP', 30, h / 2 + 2); ctx.fillText('CAP', 158, h / 2 + 2)
  })
  const mouth = canvasTexture(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#4a1d22'; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c4646b'; ctx.beginPath(); ctx.ellipse(w / 2, h * .95, w * .36, h * .42, 0, 0, Math.PI * 2); ctx.fill()
  })
  shared = { strands, curlsMap, patch, card, tablet, cupSleeve, mouth }
  return shared
}
export function disposeSharedTextures() {
  if (!shared) return
  Object.values(shared).forEach(t => t.dispose()); shared = null
}

function eyeTexture(iris) {
  return canvasTexture(64, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f8f5f0'; ctx.fillRect(0, 0, w, h)
    const ir = h * .2, pr = h * .085
    const g = ctx.createLinearGradient(0, 0, 0, ir)
    const c = new THREE.Color(iris)
    g.addColorStop(0, `#${c.clone().multiplyScalar(.55).getHexString()}`)
    g.addColorStop(.55, iris)
    g.addColorStop(.86, `#${c.clone().lerp(new THREE.Color('#ffffff'), .18).getHexString()}`)
    g.addColorStop(1, `#${c.clone().multiplyScalar(.35).getHexString()}`)
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, ir)
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = `rgba(255,255,255,${.05 + Math.random() * .12})`
      ctx.fillRect(Math.random() * w, pr, 1 + Math.random() * 1.5, ir - pr - 3)
    }
    ctx.fillStyle = '#120d0c'; ctx.fillRect(0, 0, w, pr)
    const s = ctx.createLinearGradient(0, ir, 0, h * .5)
    s.addColorStop(0, 'rgba(0,0,0,.12)'); s.addColorStop(.3, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(210,150,140,.25)')
    ctx.fillStyle = s; ctx.fillRect(0, ir, w, h * .5 - ir)
  })
}
function lidTexture(skin, lash, heavy) {
  return canvasTexture(16, 128, (ctx, w, h) => {
    ctx.fillStyle = skin; ctx.fillRect(0, 0, w, h)
    const band = h * (heavy ? .15 : .1)
    const g = ctx.createLinearGradient(0, h - band * 1.5, 0, h)
    g.addColorStop(0, skin); g.addColorStop(.35, lash); g.addColorStop(1, lash)
    ctx.fillStyle = g; ctx.fillRect(0, h - band * 1.5, w, band * 1.5)
  })
}
function cheekTexture(freckles) {
  return canvasTexture(128, 96, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w * .45)
    g.addColorStop(0, 'rgba(236,120,110,.42)'); g.addColorStop(1, 'rgba(236,120,110,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    if (freckles) {
      ctx.fillStyle = 'rgba(150,80,50,.55)'
      for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(30 + Math.random() * 68, 26 + Math.random() * 44, 1.6 + Math.random() * 1.6, 0, Math.PI * 2); ctx.fill() }
    }
  })
}

// Cuerpos: perfil del torso (radio, altura) que se escala en x/z para una sección ovalada.
const BODY = {
  man: { sx: 1.2, sz: .74, shoulderX: .335, legX: .115, torso: [[0, .96], [.2, .965], [.232, 1], [.236, 1.1], [.24, 1.2], [.255, 1.32], [.27, 1.43], [.274, 1.5], [.265, 1.56], [.235, 1.61], [.17, 1.65], [.1, 1.675], [0, 1.68]], hips: [[0, .83], [.15, .835], [.22, .875], [.24, .94], [.244, 1], [.246, 1.05], [0, 1.052]] },
  woman: { sx: 1.1, sz: .78, shoulderX: .31, legX: .12, torso: [[0, .96], [.215, .965], [.244, 1], [.233, 1.08], [.214, 1.18], [.234, 1.3], [.262, 1.4], [.258, 1.47], [.25, 1.53], [.226, 1.59], [.16, 1.635], [.09, 1.66], [0, 1.665]], hips: [[0, .83], [.16, .835], [.235, .875], [.258, .94], [.252, 1], [.247, 1.05], [0, 1.052]] },
}
function radiusAt(profile, y) {
  for (let i = 0; i < profile.length - 1; i++) {
    const [r0, y0] = profile[i], [r1, y1] = profile[i + 1]
    if (y >= y0 && y <= y1) return lerp(r0, r1, (y - y0) / (y1 - y0 || 1))
  }
  return y < profile[0][1] ? profile[0][0] : profile.at(-1)[0]
}
// Perfil recortado entre dos alturas y desplazado hacia fuera.
function shellProfile(profile, y0, y1, grow = 1, add = 0) {
  const pts = [[radiusAt(profile, y0), y0], ...profile.filter(([, y]) => y > y0 && y < y1), [radiusAt(profile, y1), y1]]
  return pts.map(([r, y]) => [r * grow + add, y])
}
// Torno con abertura frontal variable con la altura (chaquetas y chalecos abiertos).
function latheGap(points, segments, gapAt) {
  const positions = [], uvs = [], indices = []
  points.forEach(([r, y], j) => {
    const g = gapAt(y)
    for (let i = 0; i <= segments; i++) {
      const phi = g + (Math.PI * 2 - 2 * g) * i / segments
      positions.push(r * Math.sin(phi), y, r * Math.cos(phi))
      uvs.push(i / segments, j / (points.length - 1))
    }
  })
  for (let j = 0; j < points.length - 1; j++) for (let i = 0; i < segments; i++) {
    const a = j * (segments + 1) + i, b = a + segments + 1
    indices.push(a, a + 1, b, a + 1, b + 1, b)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setIndex(indices); g.computeVertexNormals()
  return g
}

export function createPerson(spec, mat) {
  const T = sharedTextures()
  const body = BODY[spec.woman ? 'woman' : 'man']
  const { sx, sz } = body
  const bodyScale = new THREE.Matrix4().makeScale(sx, 1, sz)
  const frontZ = (x, y, profile = body.torso, grow = 1, add = 0) => {
    const r = radiusAt(profile, y) * grow + add
    return sz * r * Math.sqrt(Math.max(0, 1 - (x / (sx * r)) ** 2))
  }
  const fabric = (color, extra = {}) => mat(color, { roughness: .82, ...extra })
  const skin = new THREE.MeshPhysicalMaterial({ color: spec.skin, roughness: .5, sheen: .35, sheenRoughness: .5, sheenColor: '#ffd8c4' })
  const hairMat = new THREE.MeshStandardMaterial({ color: spec.hair, roughness: spec.style === 'curly' ? .7 : .5, bumpMap: spec.style === 'curly' ? T.curlsMap : T.strands, bumpScale: spec.style === 'curly' ? 2.2 : 1.1 })
  const shirt = fabric(spec.shirt)
  const trousers = fabric(spec.trousers)
  const reflective = mat('#e9eef0', { roughness: .32, metalness: .55, emissive: '#5b6366', emissiveIntensity: .35 })
  const dark = mat('#1f262d', { roughness: .55 })
  const silver = mat('#c9d1d6', { roughness: .3, metalness: .8 })
  const white = mat('#fbfaf6', { roughness: .45 })
  const sparkle = new THREE.MeshBasicMaterial({ color: '#ffffff' })
  const owned = [skin, hairMat, sparkle]

  const root = new THREE.Group(); root.name = spec.name
  const hips = new THREE.Group(); hips.position.y = 1; root.add(hips)
  const torso = new THREE.Group(); hips.add(torso)
  const toTorso = new THREE.Matrix4().makeTranslation(0, -1, 0)

  // Piernas, cadera y calzado (estáticos).
  const legs = new Parts()
  const legProfile = [[0, .06], [.068, .07], [.074, .14], [.081, .3], [.088, .41], [.081, .52], [.084, .6], [.099, .75], [.111, .85], [.118, .95], [0, .99]]
  for (const side of [-1, 1]) {
    legs.add(lathe(legProfile, 28), trousers, M([side * body.legX, 0, 0], [0, 0, 0], [1, 1, .96]))
    legs.add(lathe([[.077, .1], [.079, .135], [0, .14]], 28), trousers, M([side * body.legX, 0, .004]))
    const turn = [0, side * -.12, 0]
    const x = side * (body.legX + .012)
    if (spec.shoes === 'boots') {
      legs.add(new RoundedBoxGeometry(.165, .17, .3, 4, .055), mat('#6e4c2f', { roughness: .62 }), M([x, .1, .04], turn))
      legs.add(new RoundedBoxGeometry(.172, .045, .31, 3, .018), dark, M([x, .022, .042], turn))
      for (let i = 0; i < 3; i++) legs.add(new RoundedBoxGeometry(.07, .012, .014, 2, .005), mat(BRAND.orange, { roughness: .6 }), M([x, .13 + i * .03, .12 - i * .028], [-.6, turn[1], 0]))
    } else if (spec.shoes === 'sneakers') {
      legs.add(new RoundedBoxGeometry(.155, .11, .29, 4, .05), white, M([x, .07, .045], turn))
      legs.add(new RoundedBoxGeometry(.162, .04, .3, 3, .018), mat('#e9e4da', { roughness: .8 }), M([x, .02, .046], turn))
      legs.add(new RoundedBoxGeometry(.165, .028, .13, 2, .012), mat(BRAND.orange, { roughness: .5 }), M([x, .065, .0], [0, turn[1], .0]))
    } else {
      legs.add(new RoundedBoxGeometry(.15, .1, .28, 4, .046), mat('#1b2026', { roughness: .32, metalness: .1 }), M([x, .062, .045], turn))
      legs.add(new RoundedBoxGeometry(.154, .028, .285, 3, .012), mat('#4a3529', { roughness: .7 }), M([x, .016, .046], turn))
    }
  }
  legs.add(lathe(body.hips, 40), trousers, bodyScale)
  legs.add(lathe(shellProfile(body.hips, .995, 1.045, 1, .008), 40), mat('#2a2421', { roughness: .45 }), bodyScale)
  legs.add(new RoundedBoxGeometry(.075, .055, .02, 2, .008), silver, M([0, 1.02, frontZ(0, 1.02, body.hips, 1, .008) + .006]))
  legs.build(root)

  // Torso con prendas.
  const chest = new Parts()
  chest.add(lathe(body.torso, 48), shirt, new THREE.Matrix4().multiplyMatrices(toTorso, bodyScale))
  chest.add(new THREE.CylinderGeometry(.066, .074, .22, 24), skin, M([0, .71, 0]))
  const onTorso = m => new THREE.Matrix4().multiplyMatrices(toTorso, m)
  const patchAt = (x, y, w, h, map, grow = 1, add = .004) => {
    const g = new THREE.PlaneGeometry(w, h, 8, 4)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setZ(i, frontZ(p.getX(i) + x, p.getY(i) + y, body.torso, grow, add))
    g.computeVertexNormals()
    chest.add(g, mat('#ffffff', { map, roughness: .7 }), M([x, y - 1, 0]))
  }
  if (spec.outfit === 'jacket') {
    const jacket = fabric(BRAND.navy)
    const gap = y => lerp(.07, .5, ss(1.14, 1.6, y))
    chest.add(latheGap(shellProfile(body.torso, .9, 1.664, 1.05, .012), 64, gap), jacket, onTorso(bodyScale))
    chest.add(lathe(shellProfile(body.hips, .9, .985, 1.05, .014), 40), jacket, onTorso(bodyScale))
    // Solapas: cinta que sigue el borde de la abertura.
    for (const side of [-1, 1]) {
      const pts = []
      for (let i = 0; i <= 10; i++) {
        const y = lerp(1.2, 1.63, i / 10), r = radiusAt(body.torso, y) * 1.05 + .022, phi = side * (gap(y) + .1)
        pts.push([r * Math.sin(phi) * sx, y - 1, r * Math.cos(phi) * sz])
      }
      chest.add(ribbon(pts, [side * .9, 0, -.4], .075, .012, 14), jacket)
      for (const y of [1.08, 1.18]) chest.add(new THREE.SphereGeometry(.016, 12, 8), mat('#d8b75e', { roughness: .3, metalness: .7 }), M([side * .055, y - 1, frontZ(side * .055, y, body.torso, 1.05, .018)], [0, 0, 0], [1, 1, .5]))
    }
    // Corbata naranja.
    const tie = new THREE.Shape()
    tie.moveTo(-.022, 0); tie.lineTo(.022, 0); tie.lineTo(.034, -.27); tie.lineTo(0, -.31); tie.lineTo(-.034, -.27); tie.closePath()
    const tieGeometry = new THREE.ExtrudeGeometry(tie, { depth: .01, bevelEnabled: true, bevelSize: .004, bevelThickness: .004, bevelSegments: 2 })
    const tp = tieGeometry.attributes.position
    for (let i = 0; i < tp.count; i++) tp.setZ(i, tp.getZ(i) + frontZ(0, tp.getY(i) + 1.6) + .004)
    tieGeometry.computeVertexNormals()
    chest.add(tieGeometry, fabric(BRAND.orange, { roughness: .5 }), M([0, .6, 0]))
    chest.add(new THREE.SphereGeometry(.03, 16, 10), fabric(BRAND.orange, { roughness: .5 }), M([0, .615, frontZ(0, 1.6) + .012], [0, 0, 0], [1, .8, .7]))
    patchAt(-.155, 1.42, .1, .05, T.patch, 1.05, .02)
  }
  if (spec.outfit === 'vest') {
    const vestMat = mat(spec.vest, { roughness: .62, emissive: spec.vest, emissiveIntensity: .16 })
    const gap = y => lerp(.13, .3, ss(1.3, 1.52, y))
    chest.add(latheGap(shellProfile(body.torso, .955, 1.52, 1.045, .012), 64, gap), vestMat, onTorso(bodyScale))
    for (const y of [1.1, 1.24]) chest.add(latheGap(shellProfile(body.torso, y, y + .045, 1.045, .02), 64, gap), reflective, onTorso(bodyScale))
    for (const side of [-1, 1]) {
      const x = side * .155, f = frontZ(x, 1.5, body.torso, 1.045, .018), b = -f
      const strap = [[x, .5, f], [x * 1.04, .6, f * .82], [x * 1.08, .672, 0], [x * 1.04, .6, b * .82], [x, .5, b]]
      chest.add(ribbon(strap, [1, 0, 0], .1, .014, 20), vestMat)
      chest.add(ribbon(strap.map(([a, y, z]) => [a, y + .004, z * 1.02]), [1, 0, 0], .045, .016, 20), reflective)
      // Ribete de la abertura.
      const edge = []
      for (let i = 0; i <= 8; i++) {
        const y = lerp(.96, 1.52, i / 8), r = radiusAt(body.torso, y) * 1.045 + .014, phi = side * gap(y)
        edge.push([r * Math.sin(phi) * sx, y - 1, r * Math.cos(phi) * sz])
      }
      chest.add(ribbon(edge, [side, 0, 0], .016, .012, 16), mat('#3a3f44', { roughness: .7 }))
    }
  }
  if (spec.outfit === 'polo' || spec.outfit === 'vest') {
    // Cuello de polo y tapeta con botones.
    const collar = latheGap([[.083, .64], [.104, .672], [.13, .69]].map(([r, y]) => [r, y + 1]), 40, () => .32)
    chest.add(collar, shirt, M([0, -1 + .005, 0]))
    for (const side of [-1, 1]) {
      const flap = new THREE.Shape(); flap.moveTo(0, 0); flap.lineTo(side * .08, -.005); flap.lineTo(side * .03, -.08); flap.closePath()
      const g = new THREE.ExtrudeGeometry(flap, { depth: .008, bevelEnabled: true, bevelSize: .006, bevelThickness: .004, bevelSegments: 2 })
      chest.add(g, shirt, M([side * .022, .688, frontZ(side * .04, 1.64) + .03], [-.75, 0, 0]))
    }
    if (spec.outfit === 'polo') {
      chest.add(new RoundedBoxGeometry(.05, .15, .012, 2, .005), shirt, M([0, .565, frontZ(0, 1.565) + .004], [-.25, 0, 0]))
      for (const y of [.6, .54]) chest.add(new THREE.SphereGeometry(.011, 10, 8), white, M([0, y, frontZ(0, y + 1) + .012], [0, 0, 0], [1, 1, .5]))
      patchAt(-.16, 1.43, .12, .06, T.patch)
    }
  }
  if (spec.outfit === 'jacket') {
    const collar = latheGap([[.08, .62], [.1, .66], [.118, .69]].map(([r, y]) => [r, y + 1]), 40, () => .42)
    chest.add(collar, shirt, M([0, -1 + .005, 0]))
  }
  if (spec.lanyard) {
    const cardY = 1.3, cardZ = frontZ(.06, cardY, body.torso, spec.outfit === 'jacket' ? 1.05 : 1, .03)
    for (const side of [-1, 1]) {
      const pts = [[side * .085, .68, -.03], [side * .1, .66, .07], [side * .085, .55, frontZ(side * .085, 1.55) + .02], [.06 + side * .015, cardY - .93, cardZ + .004]]
      chest.add(ribbon(pts, [1, 0, 0], .02, .006, 18), fabric(BRAND.orange))
    }
    chest.add(new RoundedBoxGeometry(.1, .14, .008, 2, .008), white, M([.06, cardY - 1.07, cardZ + .006], [-.08, 0, 0]))
    chest.add(new THREE.PlaneGeometry(.096, .134), mat('#ffffff', { map: T.card, roughness: .4 }), M([.06, cardY - 1.07, cardZ + .0105], [-.08, 0, 0]))
  }
  chest.build(torso)

  // Brazos: hombro → codo → mano, con manga corta o larga.
  const longSleeve = spec.outfit === 'jacket' || spec.sleeves === 'long'
  const sleeveMat = spec.outfit === 'jacket' ? fabric(BRAND.navy) : shirt
  function arm(side) {
    const shoulder = new THREE.Group(); shoulder.position.set(side * body.shoulderX, .575, 0); torso.add(shoulder)
    const elbow = new THREE.Group(); elbow.position.y = -.33; shoulder.add(elbow)
    const hand = new THREE.Group(); hand.position.y = -.29; elbow.add(hand)
    const upper = new Parts(), lower = new Parts(), palm = new Parts()
    upper.add(lathe([[0, -.35], [.045, -.343], [.058, -.32], [.062, -.24], [.067, -.1], [.071, -.02], [.06, .04], [.032, .068], [0, .075]], 24), skin)
    if (longSleeve) {
      upper.add(lathe([[.074, -.35], [.077, -.2], [.081, -.04], [.077, .03], [.06, .07], [.03, .088], [0, .092]], 24), sleeveMat)
      lower.add(lathe([[.064, -.245], [.066, -.15], [.071, 0], [.06, .045], [0, .05]], 24), sleeveMat)
      lower.add(lathe([[.061, -.262], [.063, -.245], [0, -.24]], 24), spec.outfit === 'jacket' ? mat('#dbe9f1', { roughness: .7 }) : sleeveMat)
    } else {
      upper.add(lathe([[.083, -.175], [.086, -.165], [.084, -.08], [.082, -.01], [.074, .04], [.05, .078], [0, .088]], 24), sleeveMat)
      if (spec.outfit === 'polo') upper.add(lathe([[.0875, -.175], [.0885, -.155], [0, -.15]], 24), mat(BRAND.orange, { roughness: .7 }))
    }
    lower.add(lathe([[0, -.3], [.034, -.295], [.044, -.27], [.052, -.16], [.056, -.05], [.052, .01], [.03, .04], [0, .045]], 24), skin)
    const palmG = new THREE.SphereGeometry(1, 24, 16)
    palm.add(palmG, skin, M([0, -.064, .006], [0, 0, 0], [.039, .08, .056]))
    palm.add(new THREE.CapsuleGeometry(.019, .05, 4, 10), skin, M([-side * .013, -.044, .05], [.55, 0, side * .25]))
    if (spec.watch && side === 1) lower.add(lathe([[.058, -.25], [.06, -.225], [0, -.22]], 24), mat('#20262c', { roughness: .4 }))
    upper.build(shoulder); lower.build(elbow); palm.build(hand)
    return { shoulder, elbow, hand, side }
  }
  const arms = { l: arm(1), r: arm(-1) }

  // Cabeza.
  const headPivot = new THREE.Group(); headPivot.position.y = .76; torso.add(headPivot)
  const head = new THREE.Group(); head.position.y = HEAD_Y; headPivot.add(head)
  const face = new Parts()
  face.add(deformedSphere(headShape, 112, 84), skin)
  face.add(new THREE.SphereGeometry(1, 20, 14), skin, M([0, -.085, faceZ(0, -.085) - .006], [0, 0, 0], [.038, .03, .036]))
  for (const side of [-1, 1]) {
    face.add(new THREE.SphereGeometry(1, 20, 14), skin, M([side * .278, -.035, -.01], [0, side * .35, 0], [.032, .066, .05]))
    face.add(new THREE.SphereGeometry(1, 16, 10), mat(new THREE.Color(spec.skin).multiplyScalar(.82).getStyle(), { roughness: .6 }), M([side * .298, -.035, 0], [0, side * .35, 0], [.012, .04, .028]))
    // Párpado inferior.
    const lower = new THREE.SphereGeometry(EYE.r * 1.03, 24, 8, 0, Math.PI * 2, Math.PI * .8, Math.PI * .2)
    face.add(lower, skin, M([side * EYE.x, EYE.y, faceZ(side * EYE.x, EYE.y) - EYE.r * EYE.depth], [-.5, 0, 0]))
  }
  const ez = faceZ(EYE.x, EYE.y) - EYE.r * EYE.depth
  for (const side of [-1, 1]) {
    const cx = side * EYE.x
    for (const [dx, dy, r] of [[-.024, .026, .0145], [.02, -.018, .006]]) {
      const x = cx + dx, y = EYE.y + dy, z = ez + Math.sqrt(EYE.r ** 2 - dx * dx - dy * dy) + .003
      face.add(new THREE.CircleGeometry(r, 14), sparkle, M([x, y, z]))
    }
  }
  if (HAIR[spec.style]) face.add(hairShell(HAIR[spec.style]), hairMat)
  if (spec.beard) face.add(hairShell(HAIR.beard), hairMat)
  if (spec.style === 'ponytail') {
    face.add(new THREE.TorusGeometry(.055, .022, 10, 24), fabric(BRAND.orange, { roughness: .5 }), M([0, .12, -.33], [-.9, 0, 0]))
    // Flequillo ladeado desde la raya hacia la sien izquierda.
    const bangs = [
      [[-.24, .9, .3], [-.05, .72, .68], [.22, .5, .82], [.48, .3, .8, .01], [.66, .1, .72, .015]],
      [[-.22, .92, .25], [-.1, .66, .72], [.12, .44, .88], [.36, .26, .86, .01], [.56, .1, .8, .012]],
      [[-.25, .88, .35], [-.16, .6, .76], [.02, .42, .9], [.2, .3, .92, .008], [.38, .2, .9, .01]],
      [[-.26, .93, .2], [.02, .8, .55], [.34, .62, .7], [.6, .4, .66, .012], [.76, .16, .6, .02]],
    ]
    bangs.forEach((dirs, i) => face.add(lock(dirs, .068, .05 - i * .004, .3), hairMat))
  }
  if (spec.style === 'bun') {

    face.add(new THREE.SphereGeometry(1, 40, 28), hairMat, M([0, .37, -.13], [-.35, 0, 0], [.125, .108, .12]))
    face.add(new THREE.TorusGeometry(.09, .026, 12, 32), hairMat, M([0, .33, -.11], [-1.2, 0, 0]))
    face.add(new THREE.TorusGeometry(.098, .012, 8, 32), fabric(BRAND.orange, { roughness: .5 }), M([0, .315, -.1], [-1.2, 0, 0]))
  }
  if (spec.style === 'cap') {
    const capMat = fabric(BRAND.navy)
    const crown = new THREE.SphereGeometry(1, 64, 28, 0, Math.PI * 2, 0, Math.PI * .5 + .06)
    crown.rotateX(-.5)
    const p = crown.attributes.position, d = new THREE.Vector3(), o = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) { d.fromBufferAttribute(p, i).normalize(); headShape(d, o).multiplyScalar(1.055); p.setXYZ(i, o.x, o.y, o.z) }
    weldNormals(crown)
    face.add(crown, capMat)
    const brim = new THREE.Shape()
    brim.moveTo(-.2, 0); brim.quadraticCurveTo(-.2, .2, 0, .23); brim.quadraticCurveTo(.2, .2, .2, 0); brim.quadraticCurveTo(0, .06, -.2, 0)
    const brimG = new THREE.ExtrudeGeometry(brim, { depth: .016, bevelEnabled: true, bevelSize: .008, bevelThickness: .007, bevelSegments: 3, curveSegments: 20 })
    brimG.rotateX(Math.PI / 2)
    const bp = brimG.attributes.position
    for (let i = 0; i < bp.count; i++) bp.setY(i, bp.getY(i) - 1.3 * bp.getX(i) ** 2)
    brimG.computeVertexNormals()
    face.add(brimG, fabric(BRAND.orange, { roughness: .6 }), M([0, .158, .205], [.2, 0, 0]))
    face.add(new THREE.SphereGeometry(.022, 12, 8), capMat, M([0, .296, -.15]))
    const capPatch = new THREE.PlaneGeometry(.13, .065, 8, 4)
    const cp = capPatch.attributes.position
    for (let i = 0; i < cp.count; i++) cp.setZ(i, faceZ(cp.getX(i) / 1.055, (cp.getY(i) + .228) / 1.055) * 1.055 + .006)
    capPatch.computeVertexNormals()
    face.add(capPatch, mat('#ffffff', { map: T.patch, roughness: .7 }), M([0, .228, 0]))
  }
  face.build(head)

  if (spec.style === 'ponytail') {
    const tail = new THREE.Group(); tail.position.set(0, .12, -.33); head.add(tail)
    const curve = new THREE.CatmullRomCurve3([[0, 0, .02], [0, -.06, -.07], [.01, -.2, -.12], [.03, -.36, -.08], [.045, -.47, -.02]].map(p => new THREE.Vector3(...p)))
    const parts = new Parts()
    parts.add(taperedTube(curve, 36, 16, u => .06 * Math.sin(Math.PI * (.15 + u * .85)) ** .7 + .012 * (1 - u)), hairMat)
    parts.build(tail)
    head.userData.tail = tail
  }

  // Ojos que giran, párpados que parpadean, cejas y boca expresivas.
  const eyeMat = new THREE.MeshPhysicalMaterial({ map: eyeTexture(spec.iris), roughness: .18, clearcoat: 1, clearcoatRoughness: .05 })
  owned.push(eyeMat)
  const eyes = [-1, 1].map(side => {
    const g = new THREE.SphereGeometry(EYE.r, 32, 24); g.rotateX(Math.PI / 2)
    const eye = new THREE.Mesh(g, eyeMat); eye.position.set(side * EYE.x, EYE.y, ez); head.add(eye)
    return eye
  })
  const lidMat = new THREE.MeshStandardMaterial({ map: lidTexture(spec.skin, spec.lash || '#2b1d18', spec.woman), roughness: .5 })
  owned.push(lidMat)
  const lids = new THREE.Group(); lids.position.set(0, EYE.y, ez); head.add(lids)
  const lidParts = new Parts()
  for (const side of [-1, 1]) lidParts.add(new THREE.SphereGeometry(EYE.r * 1.045, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), lidMat, M([side * EYE.x, 0, 0]))
  lidParts.build(lids, { cast: false })

  const brows = new THREE.Group(); head.add(brows)
  const browParts = new Parts()
  for (const side of [-1, 1]) {
    const pts = []
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, x = side * lerp(.05, .175, t), y = .092 + (spec.woman ? .03 : .018) * Math.sin(Math.PI * (t * .85 + .1)) - .012 * t
      pts.push(new THREE.Vector3(x, y, faceZ(x, y) + .008))
    }
    const thick = spec.woman ? .0105 : .016
    browParts.add(taperedTube(new THREE.CatmullRomCurve3(pts), 16, 8, u => thick * (1 - .55 * u) + .002), hairMat)
  }
  browParts.build(brows, { cast: false })

  // Boca: línea de sonrisa en U siempre visible y boca abierta que crece al interactuar.
  const MOUTH_Y = -.162, mw = .112, lift = .017
  const lip = x => lift * (2 * x / mw) ** 2 - .005
  const mouthPivot = new THREE.Group(); mouthPivot.position.set(0, MOUTH_Y, 0); head.add(mouthPivot)
  const linePts = []
  for (let i = 0; i <= 14; i++) {
    const x = lerp(-mw / 2, mw / 2, i / 14), y = lip(x)
    linePts.push(new THREE.Vector3(x, y, faceZ(x, y + MOUTH_Y) + .004))
  }
  const lineMat = new THREE.MeshStandardMaterial({ color: '#6a2d2b', roughness: .5 })
  owned.push(lineMat)
  mouthPivot.add(new THREE.Mesh(taperedTube(new THREE.CatmullRomCurve3(linePts), 28, 8, u => .0058 * (1 - .6 * Math.abs(u - .5) * 2) + .0012), lineMat))
  const openMouth = new THREE.Group(); mouthPivot.add(openMouth)
  const depth = .058, shape = new THREE.Shape()
  for (let i = 0; i <= 16; i++) { const x = lerp(-mw / 2, mw / 2, i / 16); i ? shape.lineTo(x, lip(x)) : shape.moveTo(x, lip(x)) }
  for (let i = 16; i >= 0; i--) { const x = lerp(-mw / 2, mw / 2, i / 16), k = 1 - (2 * x / mw) ** 2; shape.lineTo(x, lip(x) - depth * Math.pow(Math.max(0, k), .7)) }
  const mouthG = new THREE.ShapeGeometry(shape, 1)
  const mp = mouthG.attributes.position, muv = mouthG.attributes.uv
  for (let i = 0; i < mp.count; i++) muv.setXY(i, (mp.getX(i) + mw / 2) / mw, (mp.getY(i) + depth) / (depth + lift))
  projectOnFace(mouthG, .0035, 0, MOUTH_Y)
  const mouthMat = new THREE.MeshStandardMaterial({ map: T.mouth, roughness: .5, polygonOffset: true, polygonOffsetFactor: -2 })
  owned.push(mouthMat)
  openMouth.add(new THREE.Mesh(mouthG, mouthMat))
  const teethShape = new THREE.Shape()
  for (let i = 0; i <= 12; i++) { const x = lerp(-mw * .36, mw * .36, i / 12); i ? teethShape.lineTo(x, lip(x) - .002) : teethShape.moveTo(x, lip(x) - .002) }
  for (let i = 12; i >= 0; i--) { const x = lerp(-mw * .36, mw * .36, i / 12); teethShape.lineTo(x, lip(x) - .017 + .004 * (2 * x / mw) ** 2) }
  const teethG = projectOnFace(new THREE.ShapeGeometry(teethShape, 1), .0045, 0, MOUTH_Y)
  const teeth = new THREE.Mesh(teethG, new THREE.MeshStandardMaterial({ color: '#fbf8f2', roughness: .35, polygonOffset: true, polygonOffsetFactor: -3 }))
  owned.push(teeth.material)
  openMouth.add(teeth)

  const cheekMat = new THREE.MeshStandardMaterial({ map: cheekTexture(spec.freckles), transparent: true, depthWrite: false, roughness: .6, polygonOffset: true, polygonOffsetFactor: -1 })
  owned.push(cheekMat)
  const cheekParts = new Parts()
  for (const side of [-1, 1]) cheekParts.add(projectOnFace(new THREE.PlaneGeometry(.12, .08, 8, 6), .003, side * .165, -.098), cheekMat, M([side * .165, -.098, 0]))
  cheekParts.build(head, { cast: false })

  // Accesorios en la mano.
  const props = new Parts()
  let propHand = arms.l.hand
  if (spec.prop === 'coffee') {
    const cup = lathe([[0, 0], [.036, 0], [.046, .13], [0, .13]], 24)
    props.add(cup, white, M([0, 0, 0]))
    props.add(new THREE.CylinderGeometry(.0465, .042, .055, 24, 1, true), mat('#ffffff', { map: T.cupSleeve, roughness: .6, side: THREE.DoubleSide }), M([0, .06, 0]))
    props.add(lathe([[0, .125], [.05, .125], [.05, .14], [.032, .155], [0, .158]], 24), mat(BRAND.navy, { roughness: .4 }))
    propHand.userData.prop = { offset: [.0, -.075, .04], upright: true }
  }
  if (spec.prop === 'tablet') {
    props.add(new RoundedBoxGeometry(.24, .32, .022, 3, .02), mat(BRAND.navy, { roughness: .35 }), M([0, 0, 0]))
    props.add(new THREE.PlaneGeometry(.21, .28), new THREE.MeshBasicMaterial({ map: T.tablet, toneMapped: false }), M([0, 0, .0115]))
    propHand.userData.prop = { offset: [.045, -.09, .03], upright: true, rotation: [0, -.7, 0], tilt: -.15 }
  }
  if (spec.prop === 'helmet') {
    const shell = new THREE.SphereGeometry(.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    const hat = mat(BRAND.orange, { roughness: .3 })
    props.add(shell, hat, M([0, 0, 0], [0, 0, 0], [1, .85, 1.12]))
    props.add(lathe([[.15, -.004], [.172, 0], [.17, .012], [.148, .01]], 32), hat, M([0, 0, 0], [0, 0, 0], [1, 1, 1.12]))
    props.add(new THREE.SphereGeometry(.17, 24, 8, -Math.PI * .3, Math.PI * .6, Math.PI * .47, Math.PI * .06), hat, M([0, .01, .015], [0, 0, 0], [1, 1, 1.25]))
    props.add(new RoundedBoxGeometry(.035, .1, .26, 2, .015), hat, M([0, .1, 0]))
    props.add(new THREE.PlaneGeometry(.11, .055), mat('#ffffff', { map: T.patch, roughness: .6 }), M([0, .068, .158], [-.42, 0, 0]))
    propHand.userData.prop = { offset: [.07, -.12, .02], upright: true, rotation: [0, -.5, -1.35], tilt: 0 }
  }
  if (spec.prop === 'keys') {
    propHand = arms.r.hand
    props.add(new THREE.TorusGeometry(.022, .004, 8, 20), silver)
    props.add(new RoundedBoxGeometry(.016, .07, .006, 2, .003), silver, M([.008, -.05, 0], [0, 0, .25]))
    props.add(new RoundedBoxGeometry(.04, .055, .01, 2, .006), mat(BRAND.orange, { roughness: .5 }), M([-.028, -.045, 0], [0, 0, -.3]))
    propHand.userData.prop = { offset: [0, -.105, .03], upright: true }
  }
  let prop = null
  if (props.buckets.size) {
    prop = new THREE.Group(); props.build(prop)
    const cfg = propHand.userData.prop
    prop.position.set(...cfg.offset)
    if (cfg.hang) prop.position.y += cfg.hang
    propHand.add(prop)
    prop.userData.cfg = cfg
  }

  // Volumen invisible para detectar el puntero.
  const proxy = new THREE.Mesh(new THREE.CylinderGeometry(.42, .36, 2.5, 12), new THREE.MeshBasicMaterial({ visible: false }))
  proxy.position.y = 1.25; root.add(proxy)
  proxy.userData.person = spec.name

  return { spec, root, hips, torso, headPivot, head, eyes, lids, brows, mouthPivot, openMouth, teeth, arms, prop, proxy, owned, body }
}

// Poses en reposo y gestos: [hombro x, y, z], [codo x, y, z], [mano x, y, z].
const REST = {
  l: { s: [.04, 0, .1], e: [-.18, 0, 0], h: [0, 0, 0] },
  r: { s: [.04, 0, -.1], e: [-.18, 0, 0], h: [0, 0, 0] },
}
const HOLD = {
  coffee: { arm: 'l', s: [-.22, 0, .1], e: [-1.42, -.15, 0], h: [0, -.25, 0] },
  tablet: { arm: 'l', s: [-.12, 0, .14], e: [-1.32, .25, 0], h: [0, .1, 0] },
  helmet: { arm: 'l', s: [.03, 0, .2], e: [-.12, 0, 0], h: [0, .3, 0] },
  keys: { arm: 'r', s: [-.05, 0, -.12], e: [-.55, 0, 0], h: [0, .2, 0] },
}
const GESTURES = {
  wave: t => ({ r: { s: [-.25, 0, -2.55 + .08 * Math.sin(t * 9)], e: [-.15, 0, -.55 + .38 * Math.sin(t * 11)], h: [0, -1.3, .2 * Math.sin(t * 11 + 1)] } }),
  thumbs: () => ({ r: { s: [-.95, .1, -.22], e: [-1.2, 0, .2], h: [0, .5, 0] } }),
  cheer: t => ({ l: { s: [-.2, 0, 2.45 + .12 * Math.sin(t * 7)], e: [-.25, 0, .35], h: [0, 0, 0] }, r: { s: [-.2, 0, -.5], e: [-.6, 0, 0], h: [0, 0, 0] } }),
  keys: t => ({ r: { s: [-.75, 0, -.25], e: [-1.35 + .12 * Math.sin(t * 16), 0, .15], h: [.3 * Math.sin(t * 18), .4, .25 * Math.sin(t * 15)] } }),
}

const _v = new THREE.Vector3(), _q = new THREE.Quaternion()
function applyArm(arm, pose) {
  arm.shoulder.rotation.set(...pose.s)
  arm.elbow.rotation.set(...pose.e)
  arm.hand.rotation.set(...pose.h)
}
function mixPose(a, b, w) {
  return { s: a.s.map((v, i) => lerp(v, b.s[i], w)), e: a.e.map((v, i) => lerp(v, b.e[i], w)), h: a.h.map((v, i) => lerp(v, b.h[i], w)) }
}

// Estado animado de cada personaje.
export function animatePerson(p, state, t, dt) {
  const { spec } = p
  const phase = spec.phase || 0
  // Respiración y cambio de peso.
  const breath = Math.sin(t * 1.55 + phase)
  p.torso.scale.set(1 + .006 * breath, 1 + .01 * breath, 1 + .012 * breath)
  const sway = Math.sin(t * .42 + phase * 2)
  p.hips.rotation.z = .018 * sway
  p.hips.position.x = .012 * sway
  p.torso.rotation.z = -.012 * sway

  // Gesto activo.
  state.gestureTime = Math.max(0, state.gestureTime - dt)
  const gestureOn = state.gestureTime > 0
  state.gestureWeight = damp(state.gestureWeight, gestureOn ? 1 : 0, gestureOn ? 7 : 4.5, dt)
  state.gestureClock += dt
  const hop = gestureOn && (spec.gesture === 'cheer' || spec.gesture === 'thumbs') ? Math.max(0, Math.sin(state.gestureClock * 7)) * .05 * state.gestureWeight : 0
  p.root.position.y = (p.spec.baseY || 0) + hop

  const hold = HOLD[spec.prop]
  const gesture = GESTURES[spec.gesture]?.(state.gestureClock) || {}
  for (const key of ['l', 'r']) {
    let pose = REST[key]
    const idle = { s: [pose.s[0] + .03 * Math.sin(t * .8 + phase + (key === 'l' ? 0 : 1.7)), pose.s[1], pose.s[2] + (key === 'l' ? 1 : -1) * .015 * breath], e: pose.e, h: pose.h }
    pose = idle
    if (hold?.arm === key) pose = { s: hold.s.map((v, i) => v + idle.s[i] - REST[key].s[i]), e: hold.e, h: hold.h }
    if (gesture[key]) pose = mixPose(pose, gesture[key], state.gestureWeight)
    applyArm(p.arms[key], pose)
  }
  // El accesorio se mantiene vertical respecto al cuerpo.
  if (p.prop) {
    const cfg = p.prop.userData.cfg
    p.prop.parent.updateWorldMatrix(true, false)
    p.torso.getWorldQuaternion(_q)
    p.prop.parent.getWorldQuaternion(p.prop.quaternion).invert().multiply(_q)
    if (cfg.rotation) p.prop.quaternion.multiply(cfg.quaternion ||= new THREE.Quaternion().setFromEuler(new THREE.Euler(cfg.tilt || 0, cfg.rotation[1], cfg.rotation[2])))
  }

  // Mirada: cabeza, torso y ojos hacia el objetivo, con límites.
  p.root.worldToLocal(_v.copy(state.lookTarget))
  _v.y -= 2.03
  let yaw = Math.atan2(_v.x, _v.z), pitch = Math.atan2(_v.y, Math.hypot(_v.x, _v.z))
  const hoverTurn = state.hover ? 1 : 0
  state.yaw = damp(state.yaw, clamp(yaw, -1.1, 1.1), state.hover ? 6 : 3.2, dt)
  state.pitch = damp(state.pitch, clamp(pitch, -.5, .45), 3.2, dt)
  const headYaw = clamp(state.yaw * .72, -.72, .72), headPitch = clamp(state.pitch * .7, -.32, .34)
  p.headPivot.rotation.set(-headPitch, headYaw, .04 * Math.sin(t * .7 + phase) + state.tilt)
  p.torso.rotation.y = damp(p.torso.rotation.y, state.yaw * .22 + hoverTurn * .1 * Math.sign(state.yaw || 1), 4, dt)
  const eyeYaw = clamp(yaw - p.torso.rotation.y - headYaw, -.42, .42), eyePitch = clamp(pitch - headPitch, -.3, .3)
  state.eyeYaw = damp(state.eyeYaw, eyeYaw, 14, dt)
  state.eyePitch = damp(state.eyePitch, eyePitch, 14, dt)
  for (const eye of p.eyes) eye.rotation.set(-state.eyePitch, state.eyeYaw, 0)

  // Parpadeo aleatorio.
  state.blinkIn -= dt
  if (state.blinkIn <= 0) { state.blink = .16; state.blinkIn = 1.8 + Math.random() * 3.6 + (Math.random() < .2 ? -1.5 : 0) }
  state.blink = Math.max(0, state.blink - dt)
  const closed = state.blink > 0 ? Math.sin((1 - state.blink / .16) * Math.PI) : 0
  const happy = Math.max(state.hoverWeight, state.gestureWeight)
  const open = -.62 - state.eyePitch * .6 + happy * .12
  p.lids.rotation.x = lerp(open, 1.62, closed)

  // Expresión: sonrisa más abierta y cejas arriba al interactuar.
  state.hoverWeight = damp(state.hoverWeight, state.hover ? 1 : 0, 6, dt)
  const smile = lerp(spec.smile ?? 0, 1, happy)
  p.mouthPivot.scale.set(lerp(.94, 1.1, happy), 1, 1)
  p.openMouth.scale.set(1, Math.max(.001, smile), 1)
  p.openMouth.visible = smile > .02
  p.teeth.scale.set(1, ss(.35, .8, smile), 1)
  p.brows.position.y = .012 * happy + .004 * Math.sin(t * .9 + phase) * (1 - happy)

  // Coleta con inercia.
  const tail = p.head.userData.tail
  if (tail) {
    state.tailSwing = damp(state.tailSwing, -state.yaw * .35, 2.2, dt)
    tail.rotation.set(.08 * Math.sin(t * 1.3 + phase) - p.headPivot.rotation.x * .5, 0, state.tailSwing + .06 * sway)
  }
  return Math.abs(state.yaw - clamp(yaw, -1.1, 1.1)) > .002 || state.gestureWeight > .002 || Math.abs(state.hoverWeight - (state.hover ? 1 : 0)) > .002 || state.blink > 0
}

export function personState() {
  return { lookTarget: new THREE.Vector3(0, 2, 10), yaw: 0, pitch: 0, eyeYaw: 0, eyePitch: 0, blink: 0, blinkIn: 1 + Math.random() * 3, hover: false, hoverWeight: 0, gestureTime: 0, gestureWeight: 0, gestureClock: 0, tailSwing: 0, tilt: 0 }
}
