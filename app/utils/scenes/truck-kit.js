import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Utilidades compartidas por el camión y el escenario: fusión por material con colores por vértice,
// texturas de canvas y aleatoriedad reproducible.

const color = new THREE.Color();
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const vector = new THREE.Vector3();
const scaleVector = new THREE.Vector3();

export function compose(position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  euler.set(rotation[0], rotation[1], rotation[2], rotation[3] || 'XYZ');
  return new THREE.Matrix4().compose(
    vector.set(position[0], position[1], position[2]),
    quaternion.setFromEuler(euler),
    typeof scale === 'number' ? scaleVector.setScalar(scale) : scaleVector.set(scale[0], scale[1], scale[2]),
  );
}

export function prepare(geometry) {
  for (const name of Object.keys(geometry.attributes)) {
    if (!['position', 'normal', 'uv'].includes(name)) geometry.deleteAttribute(name);
  }
  const count = geometry.attributes.position.count;
  if (!geometry.attributes.uv) geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  if (!geometry.index) {
    const index = new Uint32Array(count);
    for (let i = 0; i < count; i++) index[i] = i;
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
  }
  geometry.morphAttributes = {};
  geometry.clearGroups();
  return geometry;
}

export class Merger {
  constructor(defaultKey = 'matte') {
    this.defaultKey = defaultKey;
    this.buckets = new Map();
    this.stack = [new THREE.Matrix4()];
  }
  get matrix() { return this.stack[this.stack.length - 1]; }
  push(position, rotation, scale) {
    this.stack.push(this.matrix.clone().multiply(compose(position, rotation, scale)));
    return this;
  }
  pop() { this.stack.pop(); return this; }
  add(geometry, key, tint, position, rotation, scale) {
    const geo = prepare(geometry);
    geo.applyMatrix4(this.matrix.clone().multiply(compose(position, rotation, scale)));
    color.set(tint);
    const count = geo.attributes.position.count, colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    if (!this.buckets.has(key)) this.buckets.set(key, []);
    this.buckets.get(key).push(geo);
    return geo;
  }
  box(size, position, tint, key = this.defaultKey, rotation, radius = 0) {
    const geometry = radius > 0
      ? new RoundedBoxGeometry(size[0], size[1], size[2], radius >= .1 ? 2 : 1, Math.min(radius, size[0] / 2.05, size[1] / 2.05, size[2] / 2.05))
      : new THREE.BoxGeometry(size[0], size[1], size[2]);
    return this.add(geometry, key, tint, position, rotation);
  }
  cylinder(radiusTop, radiusBottom, height, position, tint, key = this.defaultKey, rotation, segments = 16, open = false) {
    return this.add(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, open), key, tint, position, rotation);
  }
  sphere(radius, position, tint, key = this.defaultKey, scale = 1, segments = 14) {
    return this.add(new THREE.SphereGeometry(radius, segments, Math.max(6, segments * .6 | 0)), key, tint, position, undefined, scale);
  }
  tube(points, radius, tint, key = this.defaultKey, segments = 24, radial = 8) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return this.add(new THREE.TubeGeometry(curve, segments, radius, radial, false), key, tint);
  }
  has(key) { return this.buckets.has(key); }
  merged(key) {
    const list = this.buckets.get(key) || [];
    this.buckets.delete(key);
    const merged = mergeGeometries(list);
    list.forEach(geometry => geometry.dispose());
    merged.computeBoundingSphere();
    return merged;
  }
  build(materials, { cast = [], receive = true, name } = {}) {
    const group = new THREE.Group();
    if (name) group.name = name;
    for (const [key, list] of this.buckets) {
      const merged = mergeGeometries(list);
      list.forEach(geometry => geometry.dispose());
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, materials[key]);
      mesh.name = key;
      mesh.castShadow = cast === true || (Array.isArray(cast) && cast.includes(key));
      mesh.receiveShadow = receive;
      group.add(mesh);
    }
    this.buckets.clear();
    return group;
  }
}

// Reescala las UV existentes a [0, 1] (útil en extrusiones, cuyas UV van en unidades de forma).
export function fitUV(geometry) {
  const uv = geometry.attributes.uv;
  let minU = Infinity, minV = Infinity, maxU = -Infinity, maxV = -Infinity;
  for (let i = 0; i < uv.count; i++) {
    minU = Math.min(minU, uv.getX(i)); maxU = Math.max(maxU, uv.getX(i));
    minV = Math.min(minV, uv.getY(i)); maxV = Math.max(maxV, uv.getY(i));
  }
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - minU) / (maxU - minU || 1), (uv.getY(i) - minV) / (maxV - minV || 1));
  return geometry;
}

export function canvasTexture(width, height, draw, { repeat, srgb = true, wrap = true, anisotropy = 4 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  if (wrap) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  if (repeat) texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = anisotropy;
  return texture;
}

export function random(seed = 1) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (min, max) => min + next() * (max - min);
  next.pick = list => list[Math.floor(next() * list.length)];
  return next;
}

// Mapa de normales tileable a partir de una función de altura periódica en [0, 1).
export function normalTexture(size, height, strength = 2) {
  const data = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) data[y * size + x] = height(x / size, y / size);
  return canvasTexture(size, size, (ctx) => {
    const image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const at = (dx, dy) => data[((y + dy + size) % size) * size + ((x + dx + size) % size)];
      const nx = (at(-1, 0) - at(1, 0)) * strength, ny = (at(0, 1) - at(0, -1)) * strength;
      const length = Math.hypot(nx, ny, 1), i = (y * size + x) * 4;
      image.data[i] = (nx / length * .5 + .5) * 255;
      image.data[i + 1] = (ny / length * .5 + .5) * 255;
      image.data[i + 2] = (1 / length * .5 + .5) * 255;
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, { srgb: false });
}

// Sombra de contacto difuminada para asentar vehículos y objetos en el suelo.
export function contactShadowTexture() {
  return canvasTexture(128, 128, (ctx, w, h) => {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, 'rgba(24,32,40,.55)');
    gradient.addColorStop(.55, 'rgba(24,32,40,.28)');
    gradient.addColorStop(1, 'rgba(24,32,40,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  }, { wrap: false });
}
