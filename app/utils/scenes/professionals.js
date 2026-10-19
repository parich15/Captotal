import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { Parts, M, lathe, canvasTexture, materialFactory, damp, clamp } from './professionals-kit.js'
import { createPerson, animatePerson, personState, disposeSharedTextures } from './professionals-people.js'
import { vehicleKit, buildBus, buildArticulated, buildBoxTruck, buildTanker, truckLivery } from './professionals-vehicles.js'

const BRAND = { orange: '#f97316', navy: '#253342', ivory: '#f4f1e8', sky: '#c9e3ed' }
const CAST = [
  { name: 'Laura', role: 'Conductora de autobús', woman: true, skin: '#e3ad88', hair: '#4b2f22', iris: '#6b4228', style: 'ponytail', outfit: 'jacket', shirt: '#d7e8f2', trousers: BRAND.navy, shoes: 'leather', prop: 'coffee', gesture: 'wave', lanyard: true, x: -1.92, z: .08, rot: .3, phase: 0, smile: .28 },
  { name: 'Samuel', role: 'Conductor de tráiler', woman: false, skin: '#8d5b3d', hair: '#1c1715', iris: '#3b2417', style: 'curly', beard: true, outfit: 'vest', vest: '#ff7a1c', shirt: BRAND.navy, trousers: '#46525c', shoes: 'boots', prop: 'tablet', gesture: 'thumbs', watch: true, x: -.64, z: -.22, rot: .1, phase: 1.7, smile: .5 },
  { name: 'Marta', role: 'Conductora de cisterna ADR', woman: true, skin: '#f3cdb0', hair: '#a5482a', iris: '#4f7d52', lash: '#5a2c1c', style: 'bun', freckles: true, outfit: 'vest', vest: '#dcef45', shirt: BRAND.ivory, trousers: BRAND.navy, shoes: 'boots', prop: 'helmet', gesture: 'cheer', sleeves: 'long', x: .64, z: .1, rot: -.08, phase: 3.1, smile: .18 },
  { name: 'Javier', role: 'Conductor de reparto', woman: false, skin: '#c78d64', hair: '#3a281e', iris: '#4b301e', style: 'cap', outfit: 'polo', shirt: '#8fc3d8', trousers: '#2e3b47', shoes: 'sneakers', prop: 'keys', gesture: 'keys', lanyard: false, x: 1.92, z: -.06, rot: -.28, phase: 4.4, smile: 0 },
]

export default function createScene({ emit = () => {} } = {}) {
  const scene = new THREE.Scene()
  const background = canvasTexture(4, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#eef6f8'); g.addColorStop(.55, '#d6eaf0'); g.addColorStop(1, '#c4dfe8')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  })
  scene.background = background
  scene.fog = new THREE.Fog('#cfe5ec', 22, 42)
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 90)
  const mat = materialFactory()
  const kit = vehicleKit(mat)
  const owned = []

  // Luz de estudio cálida: clave con sombra suave, relleno frío y contraluz.
  scene.add(new THREE.HemisphereLight('#f6fbff', '#b9b2a4', 1.15))
  const key = new THREE.DirectionalLight('#fff0dc', 2.7)
  key.position.set(-5.5, 11, 7.5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, { left: -6.5, right: 6.5, top: 6.5, bottom: -6.5, near: 2, far: 30 })
  key.shadow.normalBias = .02; key.shadow.bias = -.0004; key.shadow.radius = 5; key.shadow.blurSamples = 12
  scene.add(key)
  const fill = new THREE.DirectionalLight('#d6ecff', .75); fill.position.set(7, 4, 3); scene.add(fill)
  const rim = new THREE.DirectionalLight('#ffffff', 1.4); rim.position.set(2, 6, -9); scene.add(rim)

  // Suelo, glorieta y plataforma.
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64), mat('#d3e6ea', { roughness: .95 }))
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground)
  const asphaltMap = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#56636b'; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 2600; i++) { ctx.fillStyle = `rgba(${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},.05)`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2) }
  }, { repeat: [5, 5] })
  owned.push(asphaltMap)
  const ring = (ax, az, bx, bz, segments = 128) => {
    const shape = new THREE.Shape(); shape.absellipse(0, 0, ax, az, 0, Math.PI * 2, false, 0)
    const hole = new THREE.Path(); hole.absellipse(0, 0, bx, bz, 0, Math.PI * 2, true, 0); shape.holes.push(hole)
    return new THREE.ShapeGeometry(shape, segments)
  }
  const env = new Parts()
  const flat = (g, y) => M([0, y, 0], [-Math.PI / 2, 0, 0])
  env.add(ring(4.7, 3.48, 2.92, 1.84), mat('#ffffff', { map: asphaltMap, roughness: .92 }), flat(null, .012))
  for (const [a, b, w] of [[4.62, 3.4, .04], [3.0, 1.92, .04]]) env.add(ring(a, b, a - w, b - w), mat(BRAND.ivory, { roughness: .6 }), flat(null, .016))
  // Bordillos.
  const kerb = (ax, az, w) => {
    const shape = new THREE.Shape(); shape.absellipse(0, 0, ax + w, az + w, 0, Math.PI * 2, false, 0)
    const hole = new THREE.Path(); hole.absellipse(0, 0, ax, az, 0, Math.PI * 2, true, 0); shape.holes.push(hole)
    return new THREE.ExtrudeGeometry(shape, { depth: .05, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2, curveSegments: 128 })
  }
  env.add(kerb(4.7, 3.48, .14), mat('#e9e4d8', { roughness: .8 }), M([0, 0, 0], [-Math.PI / 2, 0, 0]))
  env.add(kerb(2.78, 1.7, .14), mat('#e9e4d8', { roughness: .8 }), M([0, 0, 0], [-Math.PI / 2, 0, 0]))
  // Isla de césped interior.
  const island = new THREE.Shape(); island.absellipse(0, 0, 2.8, 1.72, 0, Math.PI * 2, false, 0)
  env.add(new THREE.ExtrudeGeometry(island, { depth: .05, bevelEnabled: false, curveSegments: 96 }), mat('#a9cf9d', { roughness: .95 }), M([0, .01, 0], [-Math.PI / 2, 0, 0]))
  // Línea discontinua central.
  for (let n = 0; n < 44; n++) {
    const a = n / 44 * Math.PI * 2, x = 3.81 * Math.cos(a), z = 2.66 * Math.sin(a)
    env.add(new THREE.BoxGeometry(.045, .006, .2), mat(BRAND.ivory, { roughness: .6 }), M([x, .02, z], [0, Math.atan2(-3.81 * Math.sin(a), 2.66 * Math.cos(a)), 0]))
  }
  // Paso de cebra trasero.
  for (let i = 0; i < 6; i++) env.add(new THREE.BoxGeometry(.11, .006, .62), mat(BRAND.ivory, { roughness: .6 }), M([-.55 + i * .22, .02, -2.66]))
  // Plataforma escalonada con remate naranja.
  const plinth = lathe([[0, .06], [1, .06], [1.02, .07], [1.03, .15], [1.02, .2], [1, .21], [.985, .215], [0, .215]], 96)
  env.add(plinth, mat(BRAND.ivory, { roughness: .45 }), M([0, 0, 0], [0, 0, 0], [2.6, 1, 1.5]))
  env.add(lathe([[1.034, .1], [1.04, .11], [1.04, .15], [1.034, .16]], 96), mat(BRAND.orange, { roughness: .45 }), M([0, 0, 0], [0, 0, 0], [2.6, 1, 1.5]))
  env.add(lathe([[0, .0], [1.08, .0], [1.1, .02], [1.09, .065], [0, .065]], 96), mat('#dfe7e6', { roughness: .7 }), M([0, 0, 0], [0, 0, 0], [2.6, 1, 1.5]))
  // Árboles redondeados y farolas fuera de la glorieta.
  const leaf = [mat('#7fb27a', { roughness: .8 }), mat('#93c08a', { roughness: .8 }), mat('#6ea56e', { roughness: .8 })]
  const trunk = mat('#9a7a5c', { roughness: .85 })
  const trees = [[-5.6, -2.2, 1.1], [-4.6, -3.9, .9], [-2.4, -4.6, 1], [.6, -4.9, 1.15], [3.2, -4.5, .95], [5.4, -2.6, 1.05], [6.1, .4, .85], [-6.2, .6, .9], [-1.1, -5.6, .8]]
  trees.forEach(([x, z, s], i) => {
    env.add(new THREE.CylinderGeometry(.07, .1, .9, 10), trunk, M([x, .45 * s, z], [0, 0, 0], s))
    env.add(new THREE.IcosahedronGeometry(.55, 3), leaf[i % 3], M([x, 1.15 * s, z], [0, i, 0], [s, s * 1.08, s]))
    env.add(new THREE.IcosahedronGeometry(.38, 3), leaf[(i + 1) % 3], M([x + .3 * s, .95 * s, z + .2 * s], [0, 0, 0], s))
  })
  for (const [x, z] of [[-5.2, 1.6], [5.0, 1.9], [-3.6, -4.3], [4.2, -3.6]]) {
    env.add(new THREE.CylinderGeometry(.03, .04, 1.5, 10), mat(BRAND.navy, { roughness: .5, metalness: .4 }), M([x, .75, z]))
    env.add(new RoundedBoxGeometry(.24, .07, .1, 2, .03), mat(BRAND.navy, { roughness: .5, metalness: .4 }), M([x + .09, 1.5, z]))
    env.add(new RoundedBoxGeometry(.16, .02, .07, 2, .01), mat('#fff6dc', { emissive: '#ffe8b8', emissiveIntensity: .6 }), M([x + .11, 1.462, z]))
  }
  env.build(scene)
  scene.traverse(o => { if (o.isMesh && o !== ground) { o.castShadow = true; o.receiveShadow = true } })

  // Personajes.
  const people = CAST.map(spec => {
    const person = createPerson(spec, mat)
    person.root.position.set(spec.x, .215, spec.z)
    person.root.rotation.y = spec.rot
    spec.baseY = .215
    scene.add(person.root)
    owned.push(...person.owned)
    // Halo naranja bajo los pies al pasar el puntero.
    const halo = new THREE.Mesh(new THREE.RingGeometry(.42, .5, 48), new THREE.MeshBasicMaterial({ color: BRAND.orange, transparent: true, opacity: 0, depthWrite: false }))
    halo.rotation.x = -Math.PI / 2; halo.position.set(spec.x, .218, spec.z + .04); halo.visible = false
    scene.add(halo)
    return { ...person, halo, state: personState(), idle: { until: 0, target: null } }
  })
  const proxies = people.map(p => p.proxy)

  // Vehículos que circulan por la glorieta.
  const livery = truckLivery(); owned.push(livery)
  const articulated = buildArticulated(kit)
  scene.add(articulated.front, articulated.rear, articulated.bellows)
  const bus = buildBus(kit), boxTruck = buildBoxTruck(kit, livery), tanker = buildTanker(kit)
  scene.add(bus, boxTruck, tanker)
  for (const object of [articulated.front, articulated.rear, articulated.bellows, bus, boxTruck, tanker]) object.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
  const RX = 3.81, RZ = 2.66
  const place = (object, angle, lift = 0) => {
    object.position.set(RX * Math.cos(angle), lift, RZ * Math.sin(angle))
    object.rotation.y = Math.atan2(-RX * Math.sin(angle), RZ * Math.cos(angle))
  }
  // Longitud de arco aproximada → ángulo, para que los vehículos avancen a velocidad constante.
  const arcTable = []
  {
    let s = 0, prev = new THREE.Vector2(RX, 0)
    for (let i = 0; i <= 720; i++) {
      const a = i / 720 * Math.PI * 2, p = new THREE.Vector2(RX * Math.cos(a), RZ * Math.sin(a))
      s += p.distanceTo(prev); prev = p; arcTable.push(s)
    }
  }
  const perimeter = arcTable.at(-1)
  const angleAt = s => {
    s = THREE.MathUtils.euclideanModulo(s, perimeter)
    let lo = 0, hi = arcTable.length - 1
    while (lo < hi) { const mid = (lo + hi) >> 1; if (arcTable[mid] < s) lo = mid + 1; else hi = mid }
    return lo / 720 * Math.PI * 2
  }
  function moveVehicles(t) {
    const s0 = t * .62
    place(bus, angleAt(s0 + perimeter * .25))
    place(boxTruck, angleAt(s0 + perimeter * .5))
    place(tanker, angleAt(s0 + perimeter * .75))
    const sa = s0
    place(articulated.front, angleAt(sa + .52))
    place(articulated.rear, angleAt(sa - .5))
    place(articulated.bellows, angleAt(sa - .015))
  }
  moveVehicles(0)

  // Cámara con ligero paralaje según el puntero.
  const look = new THREE.Vector3(0, 1.22, .3)
  const direction = new THREE.Vector3(.14, .34, .92).normalize()
  let distance = 12, aspect = 1
  const parallax = new THREE.Vector2(), parallaxTarget = new THREE.Vector2()
  const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize()
  function placeCamera() {
    camera.position.copy(look).addScaledVector(direction, distance).addScaledVector(right, -parallax.x * .9)
    camera.position.y += parallax.y * .5
    camera.lookAt(look)
  }
  function resize(width, height) {
    aspect = Math.max(.1, width / Math.max(1, height))
    camera.aspect = aspect
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    // Encaja el grupo y la parte delantera de la glorieta tanto en columna estrecha como en panel ancho.
    distance = Math.max(2.45 / tan, 3.15 / (tan * aspect))
    camera.updateProjectionMatrix()
    placeCamera()
  }

  // Interacción.
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const pointerTarget = new THREE.Vector3()
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -3.4)
  let pointerActive = false, pointerIdle = 0, hovered = null, pressed = null
  function setHover(person) {
    if (hovered === person) return
    if (hovered) hovered.state.hover = false
    hovered = person
    if (person) person.state.hover = true
    emit({ hover: person ? `${person.spec.name} · ${person.spec.role}` : '' })
  }
  function trigger(person) {
    person.state.gestureTime = person.spec.gesture === 'thumbs' ? 1.6 : 2.2
    person.state.gestureClock = 0
    emit({ status: `${person.spec.name} te saluda.` })
  }
  function pointer(type, x, y) {
    if (type === 'leave' || type === 'cancel') {
      pointerActive = false; setHover(null); pressed = null
      return { cursor: '' }
    }
    ndc.set(x, y)
    parallaxTarget.set(clamp(x, -1, 1), clamp(y, -1, 1))
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.intersectObjects(proxies, false)[0]
    const person = hit ? people.find(p => p.proxy === hit.object) : null
    if (raycaster.ray.intersectPlane(plane, pointerTarget)) { pointerActive = true; pointerIdle = 0 }
    setHover(person)
    if (type === 'down') pressed = person
    if (type === 'up') { if (person && person === pressed) trigger(person); pressed = null }
    return { cursor: person ? 'pointer' : '' }
  }

  // Comportamiento espontáneo: miradas entre ellos, a los vehículos y algún saludo.
  const cameraTarget = new THREE.Vector3()
  let nextGesture = 6
  function chooseIdle(person, t) {
    const r = Math.random(), i = people.indexOf(person), idle = person.idle
    const pick = list => list[Math.floor(Math.random() * list.length)]
    idle.until = t + 2 + Math.random() * 3.5
    if (r < .55) idle.target = null
    else if (r < .85) idle.target = pick(people.filter((_, j) => Math.abs(i - j) === 1)).head
    else idle.target = pick([bus, boxTruck, tanker, articulated.front])
  }

  function update(elapsed, delta, { paused } = {}) {
    const dt = Math.min(delta, .1)
    moveVehicles(elapsed)
    parallax.x = damp(parallax.x, pointerActive ? parallaxTarget.x : 0, 2.5, dt)
    parallax.y = damp(parallax.y, pointerActive ? parallaxTarget.y : 0, 2.5, dt)
    placeCamera()
    camera.getWorldPosition(cameraTarget)
    pointerIdle += dt
    if (pointerIdle > 6) pointerActive = false
    if (!paused) {
      nextGesture -= dt
      if (nextGesture <= 0) {
        nextGesture = 9 + Math.random() * 7
        const candidates = people.filter(p => p !== hovered && p.state.gestureTime <= 0)
        if (candidates.length) trigger(candidates[Math.floor(Math.random() * candidates.length)])
      }
    }
    let busy = Math.abs(parallax.x - (pointerActive ? parallaxTarget.x : 0)) > .002
    for (const person of people) {
      const { state, idle } = person
      if (pointerActive) state.lookTarget.copy(pointerTarget)
      else {
        if (!paused && elapsed > idle.until) chooseIdle(person, elapsed)
        if (idle.target) idle.target.getWorldPosition(state.lookTarget)
        else state.lookTarget.copy(cameraTarget)
      }
      if (paused) state.blinkIn = Math.max(state.blinkIn, 1)
      busy = animatePerson(person, state, elapsed, dt) || busy
      person.halo.material.opacity = state.hoverWeight * .8
      person.halo.visible = state.hoverWeight > .01
    }
    return busy
  }

  let environment = null
  return {
    scene, camera, resize, update, pointer,
    maxPixelRatio: 1.75,
    setup({ renderer }) {
      const pmrem = new THREE.PMREMGenerator(renderer)
      const room = new RoomEnvironment()
      environment = pmrem.fromScene(room, .04)
      scene.environment = environment.texture
      scene.environmentIntensity = .45
      room.dispose(); pmrem.dispose()
    },
    dispose() {
      environment?.dispose()
      owned.forEach(item => item.dispose?.())
      kit.dispose()
      disposeSharedTextures()
    },
  }
}
