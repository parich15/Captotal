import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export const clamp = THREE.MathUtils.clamp
export const lerp = THREE.MathUtils.lerp
export const damp = THREE.MathUtils.damp
// smoothstep que admite bordes invertidos.
export function ss(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function M(position = [0, 0, 0], rotation = [0, 0, 0], scale = 1) {
  const s = typeof scale === 'number' ? [scale, scale, scale] : scale
  return new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...s))
}

const KEEP = ['position', 'normal', 'uv']
function prepare(geometry) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry.clone()
  for (const name of Object.keys(g.attributes)) if (!KEEP.includes(name)) g.deleteAttribute(name)
  if (!g.attributes.normal) g.computeVertexNormals()
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
  g.morphAttributes = {}
  g.clearGroups()
  return g
}

// Acumula piezas rígidas y las fusiona en una malla por material.
export class Parts {
  constructor() { this.buckets = new Map() }
  add(geometry, material, matrix) {
    const g = prepare(geometry)
    geometry.dispose()
    if (matrix) g.applyMatrix4(matrix)
    if (!this.buckets.has(material)) this.buckets.set(material, [])
    this.buckets.get(material).push(g)
    return this
  }
  build(parent, { cast = true, receive = true } = {}) {
    const meshes = []
    for (const [material, list] of this.buckets) {
      const merged = mergeGeometries(list)
      list.forEach(g => g.dispose())
      const mesh = new THREE.Mesh(merged, material)
      mesh.castShadow = cast && !material.transparent
      mesh.receiveShadow = receive
      parent.add(mesh)
      meshes.push(mesh)
    }
    this.buckets.clear()
    return meshes
  }
}

// Normales suaves aunque la malla tenga costuras (polos y meridiano de las esferas).
export function weldNormals(geometry) {
  geometry.computeVertexNormals()
  const position = geometry.attributes.position, normal = geometry.attributes.normal, sums = new Map()
  const key = i => `${position.getX(i).toFixed(4)}|${position.getY(i).toFixed(4)}|${position.getZ(i).toFixed(4)}`
  for (let i = 0; i < position.count; i++) {
    const k = key(i), sum = sums.get(k) || [0, 0, 0]
    sum[0] += normal.getX(i); sum[1] += normal.getY(i); sum[2] += normal.getZ(i)
    sums.set(k, sum)
  }
  const n = new THREE.Vector3()
  for (let i = 0; i < position.count; i++) {
    n.fromArray(sums.get(key(i))).normalize()
    normal.setXYZ(i, n.x, n.y, n.z)
  }
  return geometry
}

// Esfera deformada por una función dirección → punto.
export function deformedSphere(shape, widthSegments = 64, heightSegments = 48) {
  const g = new THREE.SphereGeometry(1, widthSegments, heightSegments, -Math.PI / 2)
  const position = g.attributes.position, dir = new THREE.Vector3(), out = new THREE.Vector3()
  for (let i = 0; i < position.count; i++) {
    dir.fromBufferAttribute(position, i).normalize()
    shape(dir, out)
    position.setXYZ(i, out.x, out.y, out.z)
  }
  return weldNormals(g)
}

export function lathe(points, segments = 40, phiStart = 0, phiLength = Math.PI * 2) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments, phiStart, phiLength)
}

// Tubo con radio variable a lo largo de la curva.
export function taperedTube(curve, tubular, radial, radiusAt, flatten = 1, flattenNormal = 1) {
  const frames = curve.computeFrenetFrames(tubular, false)
  const positions = [], normals = [], uvs = [], indices = []
  const p = new THREE.Vector3(), n = new THREE.Vector3()
  for (let i = 0; i <= tubular; i++) {
    const u = i / tubular
    curve.getPointAt(u, p)
    const r = radiusAt(u)
    for (let j = 0; j <= radial; j++) {
      const v = j / radial * Math.PI * 2
      n.set(0, 0, 0).addScaledVector(frames.normals[i], -Math.cos(v) * flattenNormal).addScaledVector(frames.binormals[i], Math.sin(v) * flatten)
      positions.push(p.x + n.x * r, p.y + n.y * r, p.z + n.z * r)
      n.normalize(); normals.push(n.x, n.y, n.z)
      uvs.push(u, j / radial)
    }
  }
  for (let i = 0; i < tubular; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1
    indices.push(a, b, a + 1, b, b + 1, a + 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setIndex(indices)
  return g
}

// Cinta de sección rectangular a lo largo de una polilínea suave, con el ancho en una dirección fija.
export function ribbon(points, side, width, thickness, segments = 24) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
  const w = new THREE.Vector3(...side).normalize()
  const positions = [], indices = []
  const p = new THREE.Vector3(), t = new THREE.Vector3(), n = new THREE.Vector3()
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
  for (let i = 0; i <= segments; i++) {
    curve.getPointAt(i / segments, p); curve.getTangentAt(i / segments, t)
    n.crossVectors(t, w).normalize()
    for (const [a, b] of corners) positions.push(p.x + w.x * a * width / 2 + n.x * b * thickness / 2, p.y + w.y * a * width / 2 + n.y * b * thickness / 2, p.z + w.z * a * width / 2 + n.z * b * thickness / 2)
  }
  for (let i = 0; i < segments; i++) for (let k = 0; k < 4; k++) {
    const a = i * 4 + k, b = i * 4 + (k + 1) % 4
    indices.push(a, b, a + 4, b, b + 4, a + 4)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setIndex(indices)
  g.computeVertexNormals()
  return g
}

export function canvasTexture(width, height, draw, { repeat, srgb = true } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  draw(canvas.getContext('2d'), width, height)
  const texture = new THREE.CanvasTexture(canvas)
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  if (repeat) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(...repeat) }
  return texture
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}

// Caché de materiales para compartirlos entre personajes y vehículos.
export function materialFactory() {
  const cache = new Map()
  return (color, options = {}) => {
    const key = `${color}|${JSON.stringify(options, (k, v) => v?.isTexture ? v.uuid : v)}`
    if (!cache.has(key)) cache.set(key, new THREE.MeshStandardMaterial({ color, roughness: .7, metalness: 0, ...options }))
    return cache.get(key)
  }
}
