import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { DotMatrix, ICONS, createLcdPainter } from './tachograph-lcd.js'
import { paintTicket, formatDate, formatTime, formatDuration } from './tachograph-ticket.js'

// Medidas en unidades de escena (1 u ≈ 25 mm): frontal DIN de 188 × 58 mm.
const F = 1.5
const BEZEL = { w: 7.7, h: 2.5, depth: .36, bevel: .035 }
const DISPLAY = { x: -1.83, y: .5, w: 3.44, h: .84 }
const SLOT_Y = -.6
const SLOT = { w: 2.16, h: .18 }
const SLOTS = [-1.84, .98]
const KEY = { w: .36, h: .32, depth: .22, hole: .1 }
const KEY_Z = F - .03
const KEYS = [
  { id: 'key1', x: -3.32, y: SLOT_Y },
  { id: 'key2', x: -.46, y: SLOT_Y },
  { id: 'back', x: .2, y: .5 },
  { id: 'up', x: .74, y: .5 },
  { id: 'down', x: 1.28, y: .5 },
  { id: 'ok', x: 1.82, y: .5 },
]
const PRINTER = { x: 2.93, y: 0, w: 1.44, h: 2.16 }
const PAPER = { width: 1.1, length: 2.5, segments: 48, y: .7, z: F + .05 }
const CARD = { w: 2, l: 3.17, t: .03 }
const CARD_IN = F + .2 - CARD.l / 2
const CARD_MOUTH = F + .05 + CARD.l / 2
const CARD_OUT = F + .32 + CARD.l / 2
const FLOOR = -1.85

// Minutos simulados por segundo real: rápido al principio y a cámara lenta al acercarse el aviso.
const timeLapse = (activity, drive) => activity === 'rest' ? 9 : drive < 240 ? 30 : 3.75
const DRIVE_WARN = 255, DRIVE_LIMIT = 270, BREAK_NEEDED = 45
const ACTIVITIES = {
  work: { label: 'Otros trabajos', lcd: 'OTROS TRABAJOS', status: 'otros trabajos' },
  avail: { label: 'Disponibilidad', lcd: 'DISPONIBILIDAD', status: 'disponibilidad' },
  rest: { label: 'Descanso', lcd: 'DESCANSO', status: 'descanso' },
  drive: { label: 'Conducción', lcd: 'CONDUCCIÓN', status: 'conducción' },
}
const CYCLE = ['work', 'avail', 'rest', 'drive']
const SCREENS = ['Actividad', 'Tiempos', 'Velocidad', 'Hora', 'Imprimir']
const PART_HINTS = {
  key1: 'Tecla 1 · cambia la actividad; mantenla pulsada para extraer la tarjeta',
  key2: 'Tecla 2 · tarjeta del segundo conductor',
  back: 'Tecla atrás · vuelve a la pantalla principal',
  up: 'Tecla ▲ · pantalla anterior',
  down: 'Tecla ▼ · pantalla siguiente',
  ok: 'Tecla OK · confirma e imprime',
  slot1: 'Ranura 1 · tarjeta del conductor',
  slot2: 'Ranura 2 · tarjeta del segundo conductor',
  display: 'Pantalla · haz clic o usa ▲▼ para cambiar de vista',
  printer: 'Impresora · informe diario de 24 h',
  paper: 'Tique impreso · haz clic para cortarlo',
}
const L1 = 1, L2 = 11, RIGHT = 121

const ease = x => x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
const easeOut = x => 1 - (1 - x) ** 3
const clamp = THREE.MathUtils.clamp
const damp = THREE.MathUtils.damp
const pad = value => String(Math.floor(value)).padStart(2, '0')
const shortDuration = minutes => `${Math.floor(minutes / 60)}h${pad(minutes % 60)}`

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let r = Math.imul(seed ^ seed >>> 15, 1 | seed)
    r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r
    return ((r ^ r >>> 14) >>> 0) / 4294967296
  }
}
function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  draw(canvas.getContext('2d'), width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
function roundRect(path, cx, cy, w, h, r) {
  const x = cx - w / 2, y = cy - h / 2
  r = Math.min(r, w / 2, h / 2)
  path.moveTo(x + r, y); path.lineTo(x + w - r, y); path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  path.lineTo(x + w, y + h - r); path.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  path.lineTo(x + r, y + h); path.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  path.lineTo(x, y + r); path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return path
}
function drawIcon(ctx, name, x, y, scale) {
  ICONS[name]?.forEach((row, r) => { for (let c = 0; c < 7; c++) if (row[c] === '#') ctx.fillRect(x + c * scale, y + r * scale, scale * .92, scale * .92) })
}

export default function createScene({ invalidate = () => {}, emit = () => {} } = {}) {
  const random = mulberry32(24)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 120)

  scene.background = canvasTexture(8, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#bfdce8'); g.addColorStop(.55, '#d9eaee'); g.addColorStop(1, '#eef4f1')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  })

  scene.add(new THREE.HemisphereLight('#f2f8ff', '#8d938c', .55))
  const key = new THREE.DirectionalLight('#fff3e2', 2.5)
  key.position.set(-3.5, 8.5, 9.5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 })
  key.shadow.radius = 5
  key.shadow.bias = -.0002
  key.shadow.normalBias = .02
  scene.add(key)
  const rim = new THREE.DirectionalLight('#dcecff', 1.1)
  rim.position.set(7, 4, -6)
  scene.add(rim)

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ color: '#1f3140', opacity: .17 }))
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR; floor.receiveShadow = true
  scene.add(floor)
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.5), new THREE.MeshBasicMaterial({
    map: canvasTexture(256, 256, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
      g.addColorStop(0, 'rgba(31, 49, 64, .5)'); g.addColorStop(.55, 'rgba(31, 49, 64, .16)'); g.addColorStop(1, 'rgba(31, 49, 64, 0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    }),
    transparent: true, depthWrite: false,
  }))
  blob.rotation.x = -Math.PI / 2; blob.position.set(0, FLOOR + .002, -.4)
  scene.add(blob)

  const product = new THREE.Group()
  scene.add(product)
  const add = (mesh, parent = product, { cast = true, receive = true, part } = {}) => {
    mesh.castShadow = cast; mesh.receiveShadow = receive
    if (part) mesh.userData.part = part
    parent.add(mesh)
    return mesh
  }
  const noRaycast = mesh => { mesh.raycast = () => {}; return mesh }

  // Materiales: plástico grafito satinado, chapa galvanizada y metal pulido.
  const spangle = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#ececec'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 900; i++) {
      const x = random() * w, y = random() * h, r = 8 + random() * 22, n = 5 + Math.floor(random() * 3)
      const shade = Math.floor(228 + random() * 22)
      ctx.fillStyle = `rgb(${shade},${shade},${Math.min(255, shade + 3)})`
      ctx.beginPath()
      for (let k = 0; k < n; k++) {
        const a = k / n * Math.PI * 2 + random() * .5, rr = r * (.6 + random() * .5)
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
      }
      ctx.fill()
    }
  })
  // Grano fino del plástico inyectado.
  const grain = canvasTexture(256, 256, (ctx, w, h) => {
    const image = ctx.createImageData(w, h)
    for (let i = 0; i < image.data.length; i += 4) { const v = 120 + random() * 70; image.data.set([v, v, v, 255], i) }
    ctx.putImageData(image, 0, 0)
  })
  grain.colorSpace = THREE.NoColorSpace
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping
  grain.repeat.set(2.5, 2.5)
  const mats = {
    bezel: new THREE.MeshPhysicalMaterial({ color: '#27313b', roughness: .62, roughnessMap: grain, bumpMap: grain, bumpScale: .35, clearcoat: .25, clearcoatRoughness: .5 }),
    inner: new THREE.MeshStandardMaterial({ color: '#06080a', roughness: .95 }),
    housing: new THREE.MeshStandardMaterial({ color: '#c3cace', map: spangle, metalness: .78, roughness: .38 }),
    steel: new THREE.MeshStandardMaterial({ color: '#d2d8dc', metalness: 1, roughness: .26 }),
    darkPlastic: new THREE.MeshStandardMaterial({ color: '#1a2027', roughness: .7 }),
    rubber: new THREE.MeshPhysicalMaterial({ color: '#1d252d', roughness: .62, clearcoat: .1, emissive: '#f97316', emissiveIntensity: 0 }),
    orangeKey: new THREE.MeshPhysicalMaterial({ color: '#f97316', roughness: .45, clearcoat: .3, emissive: '#ffb27a', emissiveIntensity: 0 }),
    flap: new THREE.MeshStandardMaterial({ color: '#141a20', roughness: .5, metalness: .2 }),
    drawer: new THREE.MeshPhysicalMaterial({ color: '#2f3b47', roughness: .5, clearcoat: .2, emissive: '#f97316', emissiveIntensity: 0 }),
  }

  // Carcasa DIN de chapa con rejillas, etiqueta de tipo y clips de fijación.
  const housingDepth = 4.1
  add(new THREE.Mesh(new RoundedBoxGeometry(7.36, 2.2, housingDepth, 3, .07), mats.housing)).position.set(0, 0, F - .38 - housingDepth / 2)
  const vents = canvasTexture(1024, 512, (ctx, w, h) => {
    for (let row = 0; row < 3; row++) for (let i = 0; i < 15; i++) {
      const x = 46 + i * 64, y = 48 + row * 150
      ctx.fillStyle = '#11161b'; ctx.beginPath(); ctx.roundRect(x, y, 26, 116, 13); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x + 4, y + 116, 18, 3)
    }
  })
  const ventMesh = add(new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.25), new THREE.MeshStandardMaterial({ map: vents, transparent: true, metalness: .5, roughness: .5, depthWrite: false })), product, { cast: false })
  ventMesh.rotation.x = -Math.PI / 2; ventMesh.position.set(1.05, 1.103, -1.55)
  const sticker = canvasTexture(640, 384, (ctx, w, h) => {
    ctx.fillStyle = '#f3f2ec'; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#2a2f36'; ctx.lineWidth = 6; ctx.strokeRect(12, 12, w - 24, h - 24)
    ctx.fillStyle = '#2a2f36'
    ctx.font = '800 40px Nunito, Arial, sans-serif'; ctx.fillText('TACÓGRAFO DIGITAL', 36, 70)
    ctx.font = '600 28px Nunito, Arial, sans-serif'
    ;['Modelo TD-2 · Smart G2', 'Nº serie 0000 0000 0000', '12/24 V ⎓  ·  -20…+70 °C', 'Unidad de muestra para formación'].forEach((line, i) => ctx.fillText(line, 36, 124 + i * 42))
    for (let x = 36; x < w - 40; x += 6) { const bar = random() > .45 ? 4 : 2; ctx.fillRect(x, 300, bar, 52) }
  })
  const stickerMesh = add(new THREE.Mesh(new THREE.PlaneGeometry(2.05, 1.23), new THREE.MeshStandardMaterial({ map: sticker, roughness: .7 })), product, { cast: false })
  stickerMesh.rotation.x = -Math.PI / 2; stickerMesh.position.set(-2.38, 1.104, -1.7)
  for (const side of [-1, 1]) for (const z of [.35, -1.9]) {
    const clip = add(new THREE.Mesh(new RoundedBoxGeometry(.04, .6, .78, 2, .015), mats.steel))
    clip.position.set(side * 3.7, 0, z); clip.rotation.y = side * .06
  }
  const rivets = new THREE.InstancedMesh(new THREE.CylinderGeometry(.055, .055, .03, 16), mats.steel, 8)
  const dummy = new THREE.Object3D()
  let rivetIndex = 0
  for (const side of [-1, 1]) for (const z of [-.6, -2.6]) for (const y of [.62, -.62]) {
    dummy.position.set(side * 3.685, y, z); dummy.rotation.set(0, 0, Math.PI / 2); dummy.updateMatrix()
    rivets.setMatrixAt(rivetIndex++, dummy.matrix)
  }
  add(rivets)
  add(new THREE.Mesh(new RoundedBoxGeometry(3.6, 1.15, .36, 2, .05), mats.darkPlastic)).position.set(-.4, -.35, F - .38 - housingDepth - .16)

  // Frontal moldeado: un único sólido con huecos reales para pantalla, teclas, ranuras e impresora.
  const bezelShape = roundRect(new THREE.Shape(), 0, 0, BEZEL.w, BEZEL.h, .22)
  const hole = (x, y, w, h, r) => bezelShape.holes.push(roundRect(new THREE.Path(), x, y, w, h, r))
  hole(DISPLAY.x, DISPLAY.y, DISPLAY.w, DISPLAY.h, .08)
  SLOTS.forEach(x => hole(x, SLOT_Y, SLOT.w, SLOT.h, .07))
  KEYS.forEach(k => hole(k.x, k.y, KEY.w + KEY.hole, KEY.h + KEY.hole, .1))
  hole(PRINTER.x, PRINTER.y, PRINTER.w, PRINTER.h, .1)
  const bezel = add(new THREE.Mesh(new THREE.ExtrudeGeometry(bezelShape, {
    depth: BEZEL.depth, bevelEnabled: true, bevelThickness: BEZEL.bevel, bevelSize: BEZEL.bevel, bevelSegments: 3, curveSegments: 10,
  }), mats.bezel))
  bezel.position.z = F - BEZEL.depth - BEZEL.bevel
  add(new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.35, .02), mats.inner), product, { cast: false }).position.z = F - .3

  const panelPrint = canvasTexture(2048, 666, (ctx, w, h) => {
    const s = w / BEZEL.w, px = x => (x + BEZEL.w / 2) * s, py = y => (BEZEL.h / 2 - y) * s
    ctx.fillStyle = 'rgba(205, 216, 225, .82)'
    ctx.font = `800 ${.11 * s}px Nunito, Arial, sans-serif`
    SLOTS.forEach((x, i) => {
      drawIcon(ctx, 'card', px(x - SLOT.w / 2 + .04), py(SLOT_Y - .2), .032 * s)
      ctx.fillText(String(i + 1), px(x - SLOT.w / 2 + .34), py(SLOT_Y - .405))
    })
    ctx.font = `700 ${.08 * s}px Nunito, Arial, sans-serif`
    ctx.letterSpacing = `${.012 * s}px`
    ctx.textAlign = 'right'; ctx.fillText('TACÓGRAFO DIGITAL', px(2.06), py(-1.07))
    ctx.fillRect(px(-3.55), py(1.08), (DISPLAY.w + .02) * s, 3)
  })
  const panel = add(new THREE.Mesh(new THREE.PlaneGeometry(BEZEL.w, BEZEL.h), new THREE.MeshStandardMaterial({ map: panelPrint, transparent: true, depthWrite: false, roughness: .6 })), product, { cast: false, receive: false })
  noRaycast(panel).position.z = F + .002

  // Pantalla LCD retroiluminada de matriz de puntos con cristal protector.
  const matrix = new DotMatrix()
  const lcdCanvas = document.createElement('canvas')
  lcdCanvas.width = 1280; lcdCanvas.height = Math.round(1280 * (DISPLAY.h - .03) / (DISPLAY.w - .03))
  const paintLcd = createLcdPainter(lcdCanvas, matrix)
  const lcdTexture = new THREE.CanvasTexture(lcdCanvas)
  lcdTexture.colorSpace = THREE.SRGBColorSpace; lcdTexture.anisotropy = 8
  const lcdMaterial = new THREE.MeshBasicMaterial({ map: lcdTexture, toneMapped: false })
  add(new THREE.Mesh(new THREE.PlaneGeometry(DISPLAY.w - .03, DISPLAY.h - .03), lcdMaterial), product, { cast: false, part: 'display' }).position.set(DISPLAY.x, DISPLAY.y, F - .13)
  const glass = add(new THREE.Mesh(new THREE.PlaneGeometry(DISPLAY.w - .03, DISPLAY.h - .03), new THREE.MeshPhysicalMaterial({
    color: '#000000', roughness: .05, metalness: 0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, envMapIntensity: 1.4,
    emissive: '#ffffff', emissiveIntensity: .07,
    emissiveMap: canvasTexture(256, 64, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#000'); g.addColorStop(.32, '#000'); g.addColorStop(.38, '#fff'); g.addColorStop(.5, '#555'); g.addColorStop(.56, '#000'); g.addColorStop(1, '#000')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    }),
  })), product, { cast: false, receive: false })
  noRaycast(glass).position.set(DISPLAY.x, DISPLAY.y, F - .04)

  // Teclas de goma con serigrafía; cada una con su material para el resaltado.
  const keyAtlas = canvasTexture(128 * KEYS.length, 128, ctx => {
    ctx.fillStyle = '#e9eef2'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    KEYS.forEach((k, i) => {
      ctx.save(); ctx.translate(i * 128 + 64, 64)
      if (k.id === 'key1' || k.id === 'key2') {
        ctx.font = '900 70px Arial, sans-serif'; ctx.fillText(k.id === 'key1' ? '1' : '2', 0, -12)
        ctx.beginPath(); ctx.moveTo(-14, 38); ctx.lineTo(0, 24); ctx.lineTo(14, 38); ctx.fill(); ctx.fillRect(-14, 43, 28, 5)
      } else if (k.id === 'ok') {
        ctx.font = '900 54px Arial, sans-serif'; ctx.fillText('OK', 0, 3)
      } else {
        const angle = { back: Math.PI / 2, up: Math.PI, down: 0 }[k.id]
        ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(-30, -18); ctx.lineTo(30, -18); ctx.lineTo(0, 24); ctx.closePath(); ctx.fill()
      }
      ctx.restore()
    })
  })
  const labelMaterial = new THREE.MeshStandardMaterial({ map: keyAtlas, transparent: true, depthWrite: false, roughness: .6 })
  const keyGeometry = new RoundedBoxGeometry(KEY.w, KEY.h, KEY.depth, 4, .075)
  const keys = {}
  KEYS.forEach((k, i) => {
    const material = (k.id === 'ok' ? mats.orangeKey : mats.rubber).clone()
    const mesh = add(new THREE.Mesh(keyGeometry, material), product, { part: k.id })
    mesh.position.set(k.x, k.y, KEY_Z)
    const labelGeometry = new THREE.PlaneGeometry(.3, .3)
    const uv = labelGeometry.attributes.uv
    for (let j = 0; j < uv.count; j++) uv.setX(j, (i + uv.getX(j)) / KEYS.length)
    const label = new THREE.Mesh(labelGeometry, labelMaterial)
    label.position.z = KEY.depth / 2 + .002; label.userData.part = k.id
    mesh.add(label)
    keys[k.id] = { mesh, material, pressed: false, depth: 0, downAt: 0, held: false, tapUntil: 0 }
  })

  // Ranuras con trampilla basculante y marco de guía iluminable.
  const slots = SLOTS.map((x, i) => {
    const glowShape = roundRect(new THREE.Shape(), 0, 0, SLOT.w + .14, SLOT.h + .14, .12)
    glowShape.holes.push(roundRect(new THREE.Path(), 0, 0, SLOT.w + .02, SLOT.h + .02, .08))
    const glowMaterial = new THREE.MeshBasicMaterial({ color: '#f97316', transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    const glow = add(new THREE.Mesh(new THREE.ShapeGeometry(glowShape, 8), glowMaterial), product, { cast: false, receive: false, part: `slot${i + 1}` })
    glow.position.set(x, SLOT_Y, F + .004)
    const hit = add(new THREE.Mesh(new THREE.PlaneGeometry(SLOT.w, SLOT.h + .12), new THREE.MeshBasicMaterial({ visible: false })), product, { cast: false, receive: false, part: `slot${i + 1}` })
    hit.position.set(x, SLOT_Y, F + .003)
    const pivot = new THREE.Group()
    pivot.position.set(x, SLOT_Y + .055, F - .12)
    product.add(pivot)
    add(new THREE.Mesh(new RoundedBoxGeometry(SLOT.w - .1, .11, .014, 1, .005), mats.flap), pivot, { part: `slot${i + 1}` }).position.y = -.055
    return { glowMaterial, pivot, angle: 0 }
  })

  // Impresora térmica: cajón, salida de papel con cuchilla dentada y nervios de agarre.
  const drawer = add(new THREE.Mesh(new RoundedBoxGeometry(PRINTER.w - .12, PRINTER.h - .12, .34, 3, .06), mats.drawer), product, { part: 'printer' })
  drawer.position.set(PRINTER.x, PRINTER.y, F + .03 - .17)
  add(new THREE.Mesh(new THREE.PlaneGeometry(1.18, .06), mats.inner), product, { cast: false, part: 'printer' }).position.set(PRINTER.x, PAPER.y, F + .032)
  const teeth = new THREE.Shape()
  teeth.moveTo(-.6, .05)
  for (let i = 0; i <= 30; i++) teeth.lineTo(-.6 + i * .04, i % 2 ? 0 : .025)
  teeth.lineTo(.6, .05); teeth.closePath()
  add(new THREE.Mesh(new THREE.ExtrudeGeometry(teeth, { depth: .02, bevelEnabled: false }), mats.steel), product, { part: 'printer' }).position.set(PRINTER.x, PAPER.y + .035, F + .03)
  for (let i = 0; i < 5; i++) add(new THREE.Mesh(new RoundedBoxGeometry(.86, .03, .03, 1, .012), mats.darkPlastic), product, { part: 'printer' }).position.set(PRINTER.x, -.52 - i * .085, F + .045)
  const drawerPrint = canvasTexture(256, 160, (ctx, w) => {
    ctx.fillStyle = 'rgba(205, 216, 225, .85)'
    drawIcon(ctx, 'print', 30, 30, 13)
    ctx.beginPath(); ctx.moveTo(176, 92); ctx.lineTo(206, 50); ctx.lineTo(236, 92); ctx.fill(); ctx.fillRect(198, 92, 16, 34)
  })
  const drawerLabel = add(new THREE.Mesh(new THREE.PlaneGeometry(.62, .39), new THREE.MeshStandardMaterial({ map: drawerPrint, transparent: true, depthWrite: false, roughness: .6 })), product, { cast: false, receive: false })
  noRaycast(drawerLabel).position.set(PRINTER.x, .18, F + .032)

  // Tique de papel térmico: tira deformable que sale de la impresora.
  const ticketCanvas = document.createElement('canvas')
  ticketCanvas.width = 512; ticketCanvas.height = Math.round(512 * PAPER.length / PAPER.width)
  const ticketTexture = new THREE.CanvasTexture(ticketCanvas)
  ticketTexture.colorSpace = THREE.SRGBColorSpace; ticketTexture.anisotropy = 8
  const paperGeometry = new THREE.BufferGeometry()
  const paperPositions = new Float32Array((PAPER.segments + 1) * 6), paperUvs = new Float32Array((PAPER.segments + 1) * 4)
  const paperIndex = []
  for (let i = 0; i < PAPER.segments; i++) { const a = i * 2; paperIndex.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
  paperGeometry.setIndex(paperIndex)
  paperGeometry.setAttribute('position', new THREE.BufferAttribute(paperPositions, 3).setUsage(THREE.DynamicDrawUsage))
  paperGeometry.setAttribute('uv', new THREE.BufferAttribute(paperUvs, 2).setUsage(THREE.DynamicDrawUsage))
  const paperMaterial = new THREE.MeshStandardMaterial({ map: ticketTexture, roughness: .85, side: THREE.DoubleSide, emissive: '#fff1de', emissiveIntensity: 0 })
  const paper = add(new THREE.Mesh(paperGeometry, paperMaterial), product, { part: 'paper' })
  paper.visible = false
  paper.raycast = (...args) => { if (paper.visible) THREE.Mesh.prototype.raycast.apply(paper, args) }
  function shapePaper(length) {
    const ds = length / PAPER.segments
    let y = 0, z = 0
    for (let i = 0; i <= PAPER.segments; i++) {
      const s = i * ds, v = 1 - (length - s) / PAPER.length
      for (const side of [0, 1]) {
        const k = i * 2 + side
        paperPositions.set([(side - .5) * PAPER.width, y, z], k * 3)
        paperUvs.set([side, v], k * 2)
      }
      const phi = .1 + (.04 + .26 * length / PAPER.length) * s ** 1.6
      y += Math.cos(phi) * ds; z += Math.sin(phi) * ds
    }
    paperGeometry.attributes.position.needsUpdate = true
    paperGeometry.attributes.uv.needsUpdate = true
    paperGeometry.computeVertexNormals()
    paperGeometry.computeBoundingSphere()
  }

  // Tarjeta de conductor ficticia («MUESTRA»), con chip de contactos metálico.
  const cardArt = canvasTexture(1024, 646, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#fffafa'); g.addColorStop(1, '#f4dfe6')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    ctx.lineWidth = 1.5
    for (let k = 0; k < 34; k++) {
      ctx.strokeStyle = `rgba(206, 104, 142, ${.07 + (k % 3) * .03})`
      ctx.beginPath()
      for (let x = 0; x <= w; x += 8) {
        const y = h * .12 + k * 15 + Math.sin(x * .012 + k * .5) * 18 + Math.sin(x * .031 - k) * 6
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      }
      ctx.stroke()
    }
    for (let k = 0; k < 26; k++) {
      ctx.strokeStyle = 'rgba(206, 104, 142, .12)'
      ctx.beginPath(); ctx.ellipse(w * .86, h * .74, 120, 46, k * Math.PI / 26, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.fillStyle = '#1d4aa0'; ctx.fillRect(40, 36, 132, 96)
    ctx.fillStyle = '#f6cf2a'
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(106 + Math.cos(i * Math.PI / 6) * 34, 84 + Math.sin(i * Math.PI / 6) * 34, 4.5, 0, Math.PI * 2); ctx.fill() }
    ctx.fillStyle = '#ffffff'; ctx.font = '800 46px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('E', 106, 100)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#25304a'; ctx.font = '800 44px Nunito, Arial, sans-serif'; ctx.fillText('TARJETA DEL CONDUCTOR', 196, 84)
    ctx.font = '600 25px Nunito, Arial, sans-serif'; ctx.fillStyle = '#5b6478'; ctx.fillText('ESPAÑA · MODELO DE MUESTRA', 198, 122)
    ctx.fillStyle = 'rgba(150, 118, 52, .22)'; ctx.beginPath(); ctx.roundRect(104, 262, 120, 124, 16); ctx.fill()
    ctx.fillStyle = '#dde4ea'; ctx.beginPath(); ctx.roundRect(780, 168, 196, 244, 12); ctx.fill()
    ctx.save(); ctx.clip()
    ctx.fillStyle = '#9eabb6'
    ctx.beginPath(); ctx.arc(878, 262, 50, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(878, 410, 92, 80, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    const fields = [['1.', 'MUESTRA'], ['2.', 'CONDUCTOR/A CAP'], ['3.', '01.01.1990'], ['4a.', '19.10.2026   4b. 18.10.2031'], ['5b.', 'E 0000000000000 1 0']]
    fields.forEach(([n, value], i) => {
      ctx.fillStyle = '#7d8597'; ctx.font = '700 24px Nunito, Arial, sans-serif'; ctx.fillText(n, 286, 214 + i * 52)
      ctx.fillStyle = '#273049'; ctx.font = `800 ${i < 2 ? 30 : 25}px Nunito, Arial, sans-serif`; ctx.fillText(value, 336, 214 + i * 52)
    })
    ctx.strokeStyle = '#2d3a5a'; ctx.lineWidth = 3; ctx.beginPath()
    for (let x = 0; x <= 150; x += 5) ctx.lineTo(800 + x, 470 + Math.sin(x * .09) * 14 - x * .08)
    ctx.stroke()
    ctx.save(); ctx.translate(w * .5, h * .66); ctx.rotate(-.2)
    ctx.font = '900 128px Nunito, Arial, sans-serif'; ctx.fillStyle = 'rgba(249, 115, 22, .13)'; ctx.textAlign = 'center'; ctx.fillText('MUESTRA', 0, 0)
    ctx.restore()
  })
  const cardShape = roundRect(new THREE.Shape(), 0, 0, CARD.w, CARD.l, .13)
  const cardGeometry = new THREE.ExtrudeGeometry(cardShape, { depth: CARD.t - .008, bevelEnabled: true, bevelThickness: .004, bevelSize: .004, bevelSegments: 2, curveSegments: 8 })
  {
    const position = cardGeometry.attributes.position, uv = cardGeometry.attributes.uv
    for (let i = 0; i < position.count; i++) uv.setXY(i, .5 - position.getY(i) / CARD.l, .5 + position.getX(i) / CARD.w)
    cardGeometry.rotateX(-Math.PI / 2)
    cardGeometry.translate(0, -(CARD.t - .008) / 2, 0)
  }
  const cardFace = new THREE.MeshPhysicalMaterial({ map: cardArt, roughness: .34, clearcoat: .7, clearcoatRoughness: .18, emissive: '#f97316', emissiveIntensity: 0 })
  const card = new THREE.Group()
  product.add(card)
  add(new THREE.Mesh(cardGeometry, [cardFace, new THREE.MeshStandardMaterial({ color: '#f1ede6', roughness: .45 })]), card, { part: 'card' })
  const chipArt = canvasTexture(128, 160, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#f6dc8f'); g.addColorStop(.5, '#d8ad4f'); g.addColorStop(1, '#f1cf7a')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(92, 64, 22, .75)'; ctx.lineWidth = 4
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h)
    for (const y of [42, 80, 118]) { ctx.moveTo(0, y); ctx.lineTo(38, y); ctx.moveTo(w - 38, y); ctx.lineTo(w, y) }
    ctx.stroke(); ctx.beginPath(); ctx.roundRect(38, 30, 52, 100, 14); ctx.stroke()
  })
  add(new THREE.Mesh(new RoundedBoxGeometry(.36, .012, .44, 2, .004), new THREE.MeshStandardMaterial({ color: '#ffffff', map: chipArt, metalness: 1, roughness: .3 })), card, { part: 'card' }).position.set(0, .011, -1.08)

  // ---------------------------------------------------------------- estado

  let t = 0, disposed = false, envTarget = null, aspect = 1, pausedNow = false
  const sim = {
    card: 'out', cardZ: CARD_OUT, tween: null,
    activity: 'work', speed: 0, odometer: 128430, distance: 0,
    drive: 0, breakTime: 0, breakDone: false, warned: false, limitHit: false, stopping: false,
    simMs: 0, screen: 0, segments: [], segmentStart: null,
    paperLength: 0, printing: false, tearing: null, activityAt: 0,
  }
  let seq = null, flashState = null, status = '', lastSignature = -1, lastEmit = ''
  let hover = null, lastInteraction = -10
  const glow = {}
  const drag = { mode: null, part: null, x0: 0, y0: 0, yaw0: 0, pitch0: 0, moved: false, grab: 0, lastX: 0, lastTime: 0 }
  const view = { yaw: 0, pitch: 0, yawVelocity: 0 }
  const framing = { shots: null, shift: 0, center: new THREE.Vector3(), distance: 0, ready: false }
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2(), inverse = new THREE.Matrix4(), localRay = new THREE.Ray()

  const now = () => new Date(Date.now() + sim.simMs)
  const minuteOfDay = date => date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
  const cardReady = () => sim.card === 'in' && !seq
  const announce = text => { status = text }

  function closeSegment() {
    if (!sim.segmentStart) return
    const end = now()
    const from = minuteOfDay(sim.segmentStart), to = end.getDate() === sim.segmentStart.getDate() ? minuteOfDay(end) : 1440
    if (to > from) sim.segments.push({ activity: sim.activity, from, to })
    sim.segmentStart = end
  }
  function setActivity(next, automatic = false) {
    closeSegment()
    sim.activity = next
    sim.activityAt = t
    sim.stopping = false
    if (next === 'drive' && sim.breakDone) { sim.breakTime = 0; sim.breakDone = false }
    flash((m, elapsed) => {
      m.text(`{${next}} ${ACTIVITIES[next].lcd}`, 1, L1)
      m.text(`1 ${formatTime(now())}`, 1, L2)
      if (next === 'drive') m.right('85km/h', RIGHT, L2)
    }, 1.2)
    if (automatic) return
    announce(next === 'drive'
      ? 'Actividad: conducción. Demostración acelerada: el tiempo de conducción avanza muy deprisa y se ralentiza al acercarse a las 4 h 30 min.'
      : `Actividad: ${ACTIVITIES[next].status}.`)
  }
  function flash(draw, duration = 1.6, onEnd) { flashState = { draw, start: t, until: t + duration, onEnd } }
  function insertCardFirst() {
    flash(m => { m.text('{card} INSERTE TARJETA', 1, L1); m.text('  EN LA RANURA 1', 1, L2) }, 1.8)
    announce('Inserta primero la tarjeta del conductor en la ranura 1.')
  }
  function runSequence(steps, onDone) { seq = { steps, index: 0, start: t, onDone } }
  function advanceSequence() {
    while (seq && t - seq.start >= seq.steps[seq.index].duration) {
      seq.start += seq.steps[seq.index].duration
      seq.index++
      if (seq.index >= seq.steps.length) { const done = seq.onDone; seq = null; done?.() }
    }
  }

  function tweenCard(to, duration, curve, done) { sim.tween = { from: sim.cardZ, to, start: t, duration, curve, done } }
  function insertCard() {
    if (sim.card !== 'out' && sim.card !== 'drag') return
    sim.card = 'inserting'
    announce('Insertando la tarjeta del conductor en la ranura 1.')
    tweenCard(CARD_IN, .55 + (sim.cardZ - CARD_IN) * .12, ease, () => {
      sim.card = 'reading'
      const local = now(), yesterday = new Date(local.getTime() - 864e5)
      const utc = `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`
      runSequence([
        { duration: 1.2, draw: () => { m.center('BIENVENIDO/A', L1); m.center(`${formatTime(local)}  ${utc}UTC`, L2) } },
        { duration: 1.7, draw: p => { m.text('{card}1 LEYENDO TARJETA', 1, L1); m.bar(1, L2 + 1, 120, 8, p) } },
        { duration: 1.5, draw: () => { m.text('ÚLTIMA EXTRACCIÓN', 1, L1); m.text(formatDate(yesterday).replace(/\.20(\d\d)$/, '.$1'), 1, L2); m.right('19:42', RIGHT, L2) } },
        { duration: 1.3, draw: p => { m.text('¿ENTRADA MANUAL?', 1, L1); m.text('NO', 1, L2); if (p > .45) m.right('{ok}', RIGHT, L2) } },
      ], () => {
        sim.card = 'in'
        Object.assign(sim, { activity: 'work', drive: 0, breakTime: 0, breakDone: false, warned: false, limitHit: false, stopping: false, distance: 0, screen: 0 })
        const start = now()
        sim.segments = [{ activity: 'rest', from: 0, to: minuteOfDay(start) }]
        sim.segmentStart = start
        announce('Tarjeta leída. Actividad: otros trabajos. Pulsa la tecla 1 para cambiarla.')
      })
    })
  }
  function ejectCard() {
    if (!cardReady()) return
    closeSegment()
    sim.card = 'ejecting'; sim.stopping = true
    announce('Extrayendo la tarjeta: se guardan los datos de la jornada.')
    runSequence([
      { duration: 1.4, draw: p => { m.text('{flag} PAÍS FINAL', 1, L1); m.text(':E  ESPAÑA', 1, L2); if (p > .5) m.right('{ok}', RIGHT, L2) } },
      { duration: 1.5, draw: p => { m.text('{card}1 GUARDANDO DATOS', 1, L1); m.bar(1, L2 + 1, 120, 8, p) } },
    ], () => {
      flash(() => { m.center('HASTA PRONTO', L1); m.center(formatTime(now()), L2) }, 2)
      tweenCard(CARD_OUT, 1.1, easeOut, () => {
        sim.card = 'out'; sim.activity = 'work'; sim.stopping = false
        announce('Tarjeta extraída.')
      })
    })
  }
  function startPrint() {
    if (!cardReady()) return insertCardFirst()
    if (sim.printing) return
    sim.screen = 4
    sim.tearing = null; paper.visible = false; sim.paperLength = 0
    closeSegment()
    const printed = now(), totals = { drive: 0, work: 0, avail: 0, rest: 0 }
    const segments = [...sim.segments]
    for (const segment of segments) totals[segment.activity] += segment.to - segment.from
    paintTicket(ticketCanvas, {
      printed, printedUtc: new Date(printed.getTime() + printed.getTimezoneOffset() * 6e4), segments,
      totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, Math.round(v)])),
      distance: sim.distance, odometer: sim.odometer + sim.distance,
    })
    ticketTexture.needsUpdate = true
    sim.printing = true
    announce('Imprimiendo el informe diario de 24 horas.')
    runSequence([{ duration: 3.4, draw: p => { m.text('{print} IMPRIMIENDO 24h', 1, L1); m.bar(1, L2 + 1, 120, 8, p) } }], () => {
      sim.printing = false
      flash(() => { m.text('{print} IMPRESIÓN OK', 1, L1); m.text('  CORTE EL TIQUE', 1, L2) }, 2.2)
      announce('Tique impreso. Haz clic en el papel para cortarlo.')
    })
  }
  function tearPaper() {
    if (sim.printing || !paper.visible || sim.tearing) return
    sim.tearing = { start: t }
    announce('Tique cortado.')
  }
  function changeScreen(step) {
    if (!cardReady()) return insertCardFirst()
    sim.screen = step === 0 ? 0 : (sim.screen + step + SCREENS.length) % SCREENS.length
    const remaining = Math.max(0, DRIVE_LIMIT - sim.drive), pending = Math.max(0, BREAK_NEEDED - sim.breakTime)
    const detail = [
      `Actividad ${ACTIVITIES[sim.activity].status}, conducción continua ${shortDuration(Math.floor(sim.drive))}.`,
      `Quedan ${shortDuration(Math.floor(remaining))} de conducción y ${shortDuration(Math.floor(pending))} de pausa pendiente.`,
      `Velocidad ${Math.round(sim.speed)} km/h.`,
      `Hora local ${formatTime(now())}.`,
      'Pulsa OK para imprimir el informe de 24 horas.',
    ][sim.screen]
    announce(`Pantalla ${SCREENS[sim.screen]}. ${detail}`)
  }
  function keyAction(id) {
    lastInteraction = t
    if (id === 'ok' && seq && sim.card === 'reading') { seq.start = t - seq.steps[seq.index].duration; return }
    if (seq) return
    if (id === 'key2') {
      flash(m => { m.text('{card}2 RANURA 2', 1, L1); m.text('  SIN TARJETA', 1, L2) }, 1.6)
      return announce('La ranura 2 es para la tarjeta del segundo conductor; ahora está vacía.')
    }
    if (sim.card !== 'in') return insertCardFirst()
    if (id === 'key1') return setActivity(CYCLE[(CYCLE.indexOf(sim.activity) + 1) % CYCLE.length])
    if (id === 'back') return changeScreen(0)
    if (id === 'up') return changeScreen(-1)
    if (id === 'down') return changeScreen(1)
    if (id === 'ok') {
      if (flashState) { flashState.until = t; return }
      if (sim.screen === 4) return startPrint()
      changeScreen(1)
    }
  }
  function tapKey(id) { const k = keys[id]; k.tapUntil = t + .18 }
  function partClick(part) {
    lastInteraction = t
    if (part === 'card') {
      if (sim.card === 'out') return insertCard()
      if (sim.card === 'in') announce('Para extraer la tarjeta, mantén pulsada la tecla 1.')
      if (sim.card === 'in') flash(m => { m.text('{eject} MANTENGA', 1, L1); m.text('  PULSADA LA TECLA 1', 1, L2) }, 1.8)
      return
    }
    if (part === 'slot1' && sim.card === 'out') return insertCard()
    if (part === 'slot2') return keyAction('key2')
    if (part === 'display') return changeScreen(1)
    if (part === 'printer') { if (sim.paperLength > 0 && !sim.printing) return tearPaper(); tapKey('ok'); return startPrint() }
    if (part === 'paper') return tearPaper()
  }

  // ---------------------------------------------------------------- LCD

  const m = matrix
  const blink = (rate = 2.4) => Math.floor(t * rate) % 2 === 0
  function compose() {
    m.clear()
    const local = now()
    if (seq) {
      const step = seq.steps[seq.index]
      return step.draw(clamp((t - seq.start) / step.duration, 0, 1))
    }
    const hold = keys.key1
    if (hold.pressed && sim.card === 'in' && t - hold.downAt > .35) {
      m.text('{eject} EXTRAER TARJETA 1', 1, L1)
      return m.bar(1, L2 + 1, 120, 8, (t - hold.downAt - .35) / .9)
    }
    if (flashState) return flashState.draw(m, t - flashState.start)
    if (sim.card !== 'in') {
      m.text(`{clock} ${formatTime(local)}:${pad(local.getSeconds())}`, 1, L1)
      m.right(`${Math.round(sim.speed)}km/h`, RIGHT, L1)
      if (blink() || pausedNow) m.text('{card}', 1, L2)
      m.text('INSERTE TARJETA', 14, L2)
      return
    }
    const act = sim.activity
    if (sim.screen === 0) {
      m.text(`{${act}}`, 1, L1)
      m.text(formatTime(local), 14, L1)
      if ((sim.warned && act === 'drive' && blink()) || sim.limitHit && act === 'drive') m.text('{warn}', 52, L1)
      m.right(`${Math.round(sim.speed)}km/h`, RIGHT, L1)
      m.text(`{drive}${formatDuration(Math.floor(sim.drive))}`, 1, L2)
      m.text(`{pause}${formatDuration(Math.floor(sim.breakTime))}`, 52, L2)
      m.right('1{card}', RIGHT, L2)
    } else if (sim.screen === 1) {
      m.text('{drive} RESTANTE', 1, L1); m.right(formatDuration(Math.floor(Math.max(0, DRIVE_LIMIT - sim.drive))), RIGHT, L1)
      m.text('{pause} PAUSA', 1, L2); m.right(formatDuration(Math.floor(Math.max(0, BREAK_NEEDED - sim.breakTime))), RIGHT, L2)
    } else if (sim.screen === 2) {
      m.text('VELOCIDAD', 1, L1); m.right(`${Math.round(sim.speed)}km/h`, RIGHT, L1)
      m.text('ODÓMETRO', 1, L2); m.right(`${Math.round(sim.odometer + sim.distance).toLocaleString('es-ES')}km`, RIGHT, L2)
    } else if (sim.screen === 3) {
      m.text('UTC', 1, L1); m.right(`${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}`, RIGHT, L1)
      const offset = -local.getTimezoneOffset() / 60
      m.text('LOCAL', 1, L2); m.right(`${formatTime(local)} ${offset >= 0 ? '+' : '-'}${Math.abs(offset)}h`, RIGHT, L2)
    } else {
      m.text('{print} IMPRIMIR 24h', 1, L1)
      m.text(`{card}1 ${formatDate(local)}`, 1, L2)
      if (blink(1.6)) m.right('OK', RIGHT, L2)
    }
  }
  function refreshLcd() {
    compose()
    let hash = 0
    const dots = matrix.dots
    for (let i = 0; i < dots.length; i++) hash = (hash * 31 + dots[i] * (i + 1)) | 0
    if (hash === lastSignature) return
    lastSignature = hash
    paintLcd()
    lcdTexture.needsUpdate = true
  }

  // ---------------------------------------------------------------- demostración pedagógica

  function simulate(delta) {
    if (sim.card !== 'in' || seq || pausedNow) return false
    const driving = sim.activity === 'drive' && !sim.stopping && !sim.limitHit
    const resting = sim.activity === 'rest' && !sim.breakDone
    if (!driving && !resting) return false
    if (t - sim.activityAt < 1) return true
    const minutes = delta * timeLapse(sim.activity, sim.drive)
    sim.simMs += minutes * 6e4
    if (driving) {
      sim.drive = Math.min(DRIVE_LIMIT, sim.drive + minutes)
      sim.distance += sim.speed * minutes / 60
      if (sim.drive >= DRIVE_WARN && !sim.warned) {
        sim.warned = true
        flash(() => {
          m.text('{warn}', 1, L1); if (blink(3)) m.text('¡PAUSA EN 15 MIN!', 15, L1)
          m.text(`{drive}${formatDuration(Math.floor(sim.drive))}`, 1, L2); m.right('OK', RIGHT, L2)
        }, 3)
        announce('Aviso del tacógrafo: quedan 15 minutos para la pausa obligatoria.')
      }
      if (sim.drive >= DRIVE_LIMIT) {
        sim.limitHit = true; sim.stopping = true
        flash(() => {
          m.text('{warn}', 1, L1); if (blink(3)) m.text('¡HAGA UNA PAUSA!', 15, L1)
          m.text('{drive}04h30', 1, L2); m.right(`{pause}${formatDuration(BREAK_NEEDED)}`, RIGHT, L2)
        }, 3.4, () => {
          setActivity('rest', true)
          flash(() => { m.text('{rest} DESCANSO', 1, L1); m.text('VEHÍCULO PARADO', 1, L2) }, 1.8)
        })
        announce('Límite de 4 h 30 min de conducción alcanzado: el vehículo se detiene y comienza la pausa obligatoria de 45 minutos.')
      }
    } else {
      sim.breakTime = Math.min(BREAK_NEEDED, sim.breakTime + minutes)
      if (sim.breakTime >= BREAK_NEEDED) {
        Object.assign(sim, { breakDone: true, drive: 0, warned: false, limitHit: false })
        flash(() => { m.text('{ok} PAUSA COMPLETA', 1, L1); m.text('{drive} DISPONIBLE 4h30', 1, L2) }, 2.6)
        announce('Pausa de 45 minutos completada: puedes volver a conducir hasta 4 h 30 min.')
      }
    }
    return true
  }

  // ---------------------------------------------------------------- interacción

  function pick(x, y) {
    ndc.set(x, y)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.intersectObject(product, true)[0]
    return hit ? (hit.object.userData.part || 'body') : null
  }
  function cardPlaneZ(x, y) {
    ndc.set(x, y)
    raycaster.setFromCamera(ndc, camera)
    product.updateMatrixWorld()
    inverse.copy(product.matrixWorld).invert()
    localRay.copy(raycaster.ray).applyMatrix4(inverse)
    if (Math.abs(localRay.direction.y) < 1e-4) return null
    const k = (SLOT_Y - localRay.origin.y) / localRay.direction.y
    return k > 0 ? localRay.origin.z + localRay.direction.z * k : null
  }
  const isKey = part => !!keys[part]
  function cursorFor(part) {
    if (drag.mode === 'rotate' && drag.moved) return 'grabbing'
    if (drag.mode === 'card') return 'grabbing'
    if (part === 'card') return sim.card === 'out' ? 'grab' : 'pointer'
    if (part && part !== 'body') return 'pointer'
    return part === 'body' ? 'grab' : ''
  }
  function pointer(type, x, y, event) {
    lastInteraction = t
    if (type === 'down') {
      if (event?.button > 0) return {}
      const part = pick(x, y)
      Object.assign(drag, { mode: 'rotate', part, x0: x, y0: y, yaw0: view.yaw, pitch0: view.pitch, moved: false, lastX: x, lastTime: performance.now() })
      view.yawVelocity = 0
      if (part === 'card' && sim.card === 'out') {
        const z = cardPlaneZ(x, y)
        drag.mode = 'card'; drag.grab = z == null ? 0 : z - sim.cardZ
        sim.card = 'drag'
      } else if (isKey(part)) {
        drag.mode = 'key'
        const k = keys[part]; k.pressed = true; k.downAt = t; k.held = false
      }
      hover = part
      return { cursor: cursorFor(part) }
    }
    if (type === 'move') {
      if (!drag.mode) { hover = pick(x, y); return { cursor: cursorFor(hover) } }
      const dx = x - drag.x0, dy = y - drag.y0
      if (Math.hypot(dx * aspect, dy) > .025) drag.moved = true
      if (drag.mode === 'rotate' && drag.moved) {
        const nowMs = performance.now(), previous = view.yaw
        view.yaw = clamp(drag.yaw0 + dx * 1.7, -.85, .85)
        if (event?.pointerType !== 'touch') view.pitch = clamp(drag.pitch0 - dy * .8, -.2, .3)
        const dt = Math.max(1, nowMs - drag.lastTime) / 1000
        view.yawVelocity = (view.yaw - previous) / dt
        drag.lastTime = nowMs
      } else if (drag.mode === 'card') {
        const z = cardPlaneZ(x, y)
        if (z != null) sim.cardZ = clamp(z - drag.grab, CARD_MOUTH, CARD_OUT + .9)
      } else if (drag.mode === 'key' && drag.moved && pick(x, y) !== drag.part) {
        keys[drag.part].pressed = false
        drag.mode = 'rotate'; drag.moved = false
      }
      return { cursor: cursorFor(drag.part) }
    }
    if (type === 'up' || type === 'cancel') {
      const commit = type === 'up'
      if (drag.mode === 'key') {
        const k = keys[drag.part]
        k.pressed = false
        if (commit && !k.held) keyAction(drag.part)
      } else if (drag.mode === 'card') {
        sim.card = 'out'
        if (commit && (!drag.moved || sim.cardZ < CARD_OUT - .25)) insertCard()
        else tweenCard(CARD_OUT, .5, easeOut)
      } else if (drag.mode === 'rotate' && commit && !drag.moved && drag.part && drag.part !== 'body') {
        partClick(drag.part)
      }
      if (performance.now() - drag.lastTime > 90) view.yawVelocity = 0
      drag.mode = null
      hover = commit && event?.pointerType !== 'touch' ? pick(x, y) : null
      return { cursor: cursorFor(hover) }
    }
    if (type === 'leave' && !drag.mode) hover = null
    return {}
  }
  function action(name) {
    lastInteraction = t
    if (name === 'card') {
      if (sim.card === 'out') { insertCard(); return }
      if (cardReady()) { tapKey('key1'); ejectCard(); return }
      return
    }
    if (name === 'activity') { tapKey('key1'); return keyAction('key1') }
    if (name === 'screen') { tapKey('down'); return keyAction('down') }
    if (name === 'print') {
      if (!cardReady()) { tapKey('ok'); return insertCardFirst() }
      tapKey('ok'); return startPrint()
    }
  }

  // ---------------------------------------------------------------- publicación de estado

  function hintText() {
    if (hover && hover !== 'body') {
      if (hover === 'card') return ['out', 'drag'].includes(sim.card) ? 'Tarjeta de conductor · arrástrala hasta la ranura 1 o haz clic en ella' : 'Tarjeta insertada · mantén pulsada la tecla 1 para extraerla'
      if (hover === 'paper' && sim.printing) return 'Imprimiendo el informe de 24 h…'
      return PART_HINTS[hover]
    }
    if (sim.card === 'out' || sim.card === 'drag') return 'Arrastra la tarjeta hasta la ranura 1 o haz clic en ella'
    if (sim.card === 'inserting' || sim.card === 'reading') return 'Leyendo la tarjeta del conductor…'
    if (sim.card === 'ejecting') return 'Guardando la jornada y expulsando la tarjeta…'
    if (sim.printing) return 'Imprimiendo el informe de 24 h…'
    if (sim.paperLength > 0 && !sim.tearing) return 'Haz clic en el tique para cortarlo'
    const act = sim.activity
    if (act === 'drive') {
      if (pausedNow) return 'Reanuda la animación para ver la demostración acelerada'
      if (sim.limitHit) return 'Lo verás en el CAP: tras 4h30 al volante, pausa de 45 min'
      if (sim.warned) return `Aviso: quedan ${Math.max(0, Math.ceil(DRIVE_LIMIT - sim.drive))} min para la pausa obligatoria`
      return `Conducción continua ${shortDuration(Math.floor(sim.drive))} de 4h30`
    }
    if (act === 'rest') return sim.breakDone ? 'Pausa completada: puedes conducir otras 4h30' : `Pausa ${shortDuration(Math.floor(sim.breakTime))} de los 0h45 obligatorios`
    return 'Pulsa la tecla 1 para cambiar de actividad y prueba «Conducción»'
  }
  function publish() {
    const ready = sim.card === 'in'
    const demo = ready && !pausedNow && !seq && ((sim.activity === 'drive' && !sim.stopping && !sim.limitHit) || (sim.activity === 'rest' && !sim.breakDone))
      ? `×${timeLapse(sim.activity, sim.drive) * 60}` : null
    let progress = null
    if (ready && sim.activity === 'drive') progress = sim.drive / DRIVE_LIMIT
    if (ready && sim.activity === 'rest' && !sim.breakDone) progress = sim.breakTime / BREAK_NEEDED
    const next = {
      cardInserted: sim.card !== 'out' && sim.card !== 'drag',
      cardReady: cardReady(),
      cardBusy: ['inserting', 'reading', 'ejecting'].includes(sim.card),
      activity: sim.activity,
      activityLabel: ACTIVITIES[sim.activity].label,
      screenLabel: SCREENS[sim.screen],
      hint: hintText(),
      status,
      demo,
      progress: progress == null ? null : Math.round(progress * 100) / 100,
      alert: ready && sim.activity === 'drive' && (sim.warned || sim.limitHit),
      printing: sim.printing,
    }
    const key = JSON.stringify(next)
    if (key !== lastEmit) { lastEmit = key; emit(next) }
  }

  // ---------------------------------------------------------------- cámara

  const BASE_AZIMUTH = .38, BASE_ELEVATION = .34
  const corners = (x0, x1, y0, y1, z0, z1) => [x0, x1].flatMap(x => [y0, y1].flatMap(y => [z0, z1].map(z => new THREE.Vector3(x, y, z))))
  const devicePoints = corners(-3.95, 3.95, -1.35, 1.35, -2.9, 1.62)
  const cardPoints = corners(SLOTS[0] - 1.05, SLOTS[0] + 1.05, SLOT_Y - .12, SLOT_Y + .12, CARD_OUT - CARD.l / 2, CARD_OUT + CARD.l / 2 + .05)
  const paperPoints = paperExtent()
  const shots = {
    in: devicePoints,
    out: [...devicePoints, ...cardPoints],
    print: [...devicePoints, ...paperPoints],
    printOut: [...devicePoints, ...cardPoints, ...paperPoints],
  }
  function paperExtent() {
    shapePaper(PAPER.length)
    paperGeometry.computeBoundingBox()
    const { min, max } = paperGeometry.boundingBox
    return corners(PRINTER.x + min.x, PRINTER.x + max.x, PAPER.y + min.y, PAPER.y + max.y, PAPER.z + min.z, PAPER.z + max.z)
  }
  const direction = (azimuth, elevation) => new THREE.Vector3(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation))
  function fit(points, xHalf, yHalf) {
    const center = new THREE.Box3().setFromPoints(points).getCenter(new THREE.Vector3())
    const dir = direction(BASE_AZIMUTH, BASE_ELEVATION), probe = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3()
    const place = distance => { camera.position.copy(center).addScaledVector(dir, distance); camera.lookAt(center); camera.updateMatrixWorld() }
    let distance = 20
    // Se reencuadra el centro según los límites proyectados para aprovechar todo el panel.
    for (let pass = 0; pass < 3; pass++) {
      let low = 4, high = 90
      for (let i = 0; i < 24; i++) {
        distance = (low + high) / 2
        place(distance)
        const inside = points.every(p => { probe.copy(p).project(camera); return Math.abs(probe.x) <= xHalf && Math.abs(probe.y) <= yHalf && probe.z < 1 })
        if (inside) high = distance; else low = distance
      }
      distance = high
      place(distance)
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      for (const p of points) { probe.copy(p).project(camera); minX = Math.min(minX, probe.x); maxX = Math.max(maxX, probe.x); minY = Math.min(minY, probe.y); maxY = Math.max(maxY, probe.y) }
      const half = distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1)
      center.addScaledVector(right, (minX + maxX) / 2 * half * camera.aspect).addScaledVector(up, (minY + maxY) / 2 * half)
    }
    return { center, distance }
  }
  function resize(width, height) {
    aspect = width / Math.max(1, height)
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    const yMin = -1 + 2 * Math.min(.34, 66 / height), yMax = 1 - 2 * Math.min(.18, 46 / height)
    const xHalf = (1 - 2 * Math.min(.06, 18 / width)) * .97, yHalf = (yMax - yMin) / 2 * .97
    framing.shift = (yMax + yMin) / 2
    framing.shots = Object.fromEntries(Object.entries(shots).map(([name, points]) => [name, fit(points, xHalf, yHalf)]))
    camera.projectionMatrix.elements[9] -= framing.shift
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
    if (!framing.ready) { const first = framing.shots[currentShot()]; framing.center.copy(first.center); framing.distance = first.distance; framing.ready = true }
    placeCamera(0)
  }
  function currentShot() {
    const inside = ['in', 'reading', 'inserting'].includes(sim.card) || (sim.card === 'ejecting' && !sim.tween)
    if (sim.paperLength > .3) return inside ? 'print' : 'printOut'
    return inside ? 'in' : 'out'
  }
  // La cámara se acerca con la tarjeta dentro y se aleja para mostrar el tique.
  function placeCamera(delta) {
    if (!framing.shots) return false
    const goal = framing.shots[currentShot()]
    const k = delta ? 1 - Math.exp(-2.2 * delta) : 1
    framing.center.lerp(goal.center, k)
    framing.distance += (goal.distance - framing.distance) * k
    camera.position.copy(framing.center).addScaledVector(direction(BASE_AZIMUTH, BASE_ELEVATION + view.pitch), framing.distance)
    camera.lookAt(framing.center)
    return framing.center.distanceTo(goal.center) + Math.abs(goal.distance - framing.distance) > .01
  }

  // ---------------------------------------------------------------- bucle

  function update(elapsed, delta, { paused = false } = {}) {
    pausedNow = paused
    t += delta
    let busy = false
    const settle = (value, goal, lambda, epsilon = .002) => {
      const next = damp(value, goal, lambda, delta)
      if (Math.abs(next - goal) > epsilon) busy = true
      return Math.abs(next - goal) <= epsilon ? goal : next
    }

    // Giro del aparato con inercia y regreso suave a la pose de reposo.
    if (drag.mode === 'rotate' && drag.moved) busy = true
    else {
      if (Math.abs(view.yawVelocity) > .01) {
        view.yaw = clamp(view.yaw + view.yawVelocity * delta, -.85, .85)
        view.yawVelocity *= Math.exp(-5 * delta)
        busy = true
      } else view.yawVelocity = 0
      if (t - lastInteraction > 2.4) {
        view.yaw = settle(view.yaw, 0, 2.2)
        view.pitch = settle(view.pitch, 0, 2.2)
      } else if (view.yaw || view.pitch) busy = true
    }
    product.rotation.y = view.yaw + (paused ? 0 : Math.sin(elapsed * .35) * .07)
    product.position.y = paused ? 0 : Math.sin(elapsed * .8) * .03

    // Tarjeta: interpolaciones, flotación en reposo y trampilla.
    if (sim.tween) {
      const k = clamp((t - sim.tween.start) / sim.tween.duration, 0, 1)
      sim.cardZ = THREE.MathUtils.lerp(sim.tween.from, sim.tween.to, sim.tween.curve(k))
      busy = true
      if (k >= 1) { const done = sim.tween.done; sim.tween = null; done?.() }
    }
    const resting = sim.card === 'out' && !sim.tween
    const lift = resting ? (hover === 'card' ? .06 : 0) + (paused ? 0 : Math.sin(elapsed * 1.6) * .045 + .02) : 0
    card.position.set(SLOTS[0], SLOT_Y + settle(card.position.y - SLOT_Y, lift, 8), sim.cardZ)
    card.rotation.x = settle(card.rotation.x, resting ? -.035 : 0, 6)
    slots.forEach((slot, i) => {
      const lead = sim.cardZ - CARD.l / 2
      const open = i === 0 ? clamp((F - .02 - lead) / .25, 0, 1) * 1.32 : 0
      slot.angle = settle(slot.angle, open, 14)
      slot.pivot.rotation.x = slot.angle
    })

    // Teclas: hundimiento, pulsación sostenida y resaltado.
    for (const [id, k] of Object.entries(keys)) {
      const down = k.pressed || t < k.tapUntil
      k.depth = settle(k.depth, down ? 1 : 0, 28)
      k.mesh.position.z = KEY_Z - k.depth * .05
      if (down) busy = true
      if (id === 'key1' && k.pressed && !k.held && sim.card === 'in' && !seq && t - k.downAt > 1.25) { k.held = true; ejectCard() }
    }
    for (const part of [...KEYS.map(k => k.id), 'card', 'slot1', 'slot2', 'display', 'printer', 'paper']) {
      const wanted = hover === part || (part === 'slot1' && drag.mode === 'card') ? 1 : 0
      glow[part] = settle(glow[part] || 0, wanted, 12, .005)
    }
    for (const id of Object.keys(keys)) keys[id].material.emissiveIntensity = glow[id] * (id === 'ok' ? .45 : .32)
    cardFace.emissiveIntensity = glow.card * .16
    const invite = sim.card === 'out' && !paused ? .2 + .2 * Math.sin(elapsed * 3.2) : 0
    slots[0].glowMaterial.opacity = Math.max(glow.slot1 * .95, invite, sim.card === 'drag' ? .9 : 0)
    slots[1].glowMaterial.opacity = glow.slot2 * .9
    lcdMaterial.color.setScalar(.93 + glow.display * .09)
    mats.drawer.emissiveIntensity = glow.printer * .1
    paperMaterial.emissiveIntensity = glow.paper * .22

    // Velocidad simulada y contadores acelerados.
    const targetSpeed = sim.card === 'in' && sim.activity === 'drive' && !sim.stopping && !sim.limitHit ? 85 : 0
    sim.speed = paused ? targetSpeed : settle(sim.speed, targetSpeed, 1.4, .3)
    if (simulate(delta)) busy = true

    // Papel: avance de impresión a pasos y corte.
    if (seq) { advanceSequence(); busy = true }
    if (sim.printing && seq) {
      const p = clamp((t - seq.start) / seq.steps[seq.index].duration, 0, 1)
      sim.paperLength = PAPER.length * (easeOut(p) * .92 + .08 * p) * (.985 + .015 * Math.sin(t * 40))
    }
    if (sim.tearing) {
      const k = clamp((t - sim.tearing.start) / .75, 0, 1)
      paper.position.set(PRINTER.x, PAPER.y + easeOut(k) * .9, PAPER.z + k * .9)
      paper.rotation.x = -k * .7
      paperMaterial.transparent = true; paperMaterial.opacity = 1 - k
      busy = true
      if (k >= 1) {
        sim.tearing = null; sim.paperLength = 0
        paperMaterial.opacity = 1; paperMaterial.transparent = false
      }
    } else {
      paper.position.set(PRINTER.x, PAPER.y, PAPER.z); paper.rotation.x = 0
    }
    paper.visible = sim.paperLength > .01
    if (paper.visible && (sim.printing || !paper.userData.shaped)) { shapePaper(sim.paperLength); paper.userData.shaped = !sim.printing }
    if (!paper.visible) paper.userData.shaped = false

    if (flashState && t >= flashState.until) { const done = flashState.onEnd; flashState = null; done?.() }
    if (flashState) busy = true

    if (placeCamera(delta)) busy = true
    refreshLcd()
    publish()
    return busy
  }

  publish()
  refreshLcd()

  return {
    scene,
    camera,
    resize,
    update,
    pointer,
    action,
    maxPixelRatio: 2,
    touchAction: 'pan-y',
    setup({ renderer }) {
      const generator = new THREE.PMREMGenerator(renderer)
      const room = new RoomEnvironment()
      envTarget = generator.fromScene(room, .04)
      scene.environment = envTarget.texture
      scene.environmentIntensity = .7
      room.dispose(); generator.dispose()
      if (disposed) envTarget.dispose()
    },
    dispose() {
      disposed = true
      envTarget?.dispose(); envTarget = null
    },
  }
}
