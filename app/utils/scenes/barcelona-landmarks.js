import * as THREE from 'three';
import { Merger, random } from './truck-kit.js';

// Perfil lejano de Barcelona al otro lado de la bahía. Sin niebla de escena: la bruma se hornea
// en los colores por vértice según distancia y altura para que las siluetas se lean contra el cielo.

const deg = THREE.MathUtils.degToRad;
const at = (yaw, distance) => [-Math.sin(deg(yaw)) * distance, -Math.cos(deg(yaw)) * distance];
const facing = yaw => deg(yaw);

function sagradaFamilia(m, rng) {
  const stone = '#c9b28c', light = '#ddd0b6', mosaic = ['#d0703f', '#e3b542', '#c94a3f', '#5f9f7a', '#f2efe6'];
  m.box([42, 44, 92], [0, 22, 0], stone);
  m.box([28, 62, 30], [0, 31, -34], light);
  m.box([30, 30, 18], [0, 15, 50], '#bba37c');
  const spire = (x, z, h, r) => {
    m.cylinder(r * .3, r, h, [x, h / 2, z], stone, 'far', undefined, 10);
    m.cylinder(r * .34, r * .34, h * .18, [x, h * .86, z], light, 'far', undefined, 8);
    m.sphere(r * .55, [x, h + r * .3, z], rng.pick(mosaic), 'far', [1, 1.4, 1], 8);
  };
  for (const [i, x] of [-17, -6, 6, 17].entries()) spire(x, 48, i === 0 || i === 3 ? 98 : 107, 5);
  for (const [i, x] of [-17, -6, 6, 17].entries()) spire(x, -48, i === 0 || i === 3 ? 102 : 112, 5);
  for (const [x, z] of [[-11, -6], [11, -6], [-11, 14], [11, 14]]) spire(x, z, 135, 6.5);
  spire(0, -30, 138, 7.5);
  m.add(new THREE.IcosahedronGeometry(5, 0), 'far', '#f4f1e8', [0, 150, -30]);
  m.cylinder(2.2, 10, 172, [0, 86, 4], light, 'far', undefined, 12);
  m.box([2.6, 18, 2.6], [0, 181, 4], '#f4f1e8');
  m.box([14, 2.6, 2.6], [0, 184, 4], '#f4f1e8');
  m.box([2.6, 2.6, 14], [0, 184, 4], '#f4f1e8');
  // Grúa torre de las obras.
  m.box([3, 205, 3], [36, 102, 22], '#f2e9d6');
  m.box([3.4, 3, 78], [36, 204, 4], '#f2e9d6');
  m.box([3.4, 6, 10], [36, 200, 46], '#c9473a');
  m.box([2.8, 10, 3], [36, 212, 22], '#f2e9d6');
}

function glories(m, rng) {
  const profile = [];
  for (let i = 0; i <= 28; i++) {
    const y = i / 28 * 146, r = y < 95 ? 19 - y * .025 : Math.sqrt(Math.max(0, 1 - ((y - 95) / 51) ** 2)) * 16.6;
    profile.push(new THREE.Vector2(Math.max(r, .1), y));
  }
  const geometry = m.add(new THREE.LatheGeometry(profile, 30), 'far', '#ffffff');
  const colors = geometry.attributes.color, palette = ['#4f7fa6', '#8e4f5e', '#3f8f9a', '#b34a48', '#7aa3bd', '#d3c6b6'].map(c => new THREE.Color(c));
  for (let i = 0; i < colors.count; i++) { const c = rng.pick(palette); colors.setXYZ(i, c.r, c.g, c.b); }
}

function twinTowers(m) {
  // Hotel Arts: núcleo oscuro y exoesqueleto blanco con cruces de San Andrés.
  m.push([-30, 0, 0]);
  m.box([28, 128, 28], [0, 64, 0], '#5a7383');
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.box([2.4, 132, 2.4], [sx * 15, 66, sz * 15], '#f2f0ea');
  for (let k = 0; k < 8; k++) {
    for (const side of [-1, 1]) {
      m.box([.9, 22, .9], [side * 15.5, 8 + k * 16, 0], '#f2f0ea', 'far', [deg(48), 0, 0]);
      m.box([.9, 22, .9], [0, 8 + k * 16, side * 15.5], '#f2f0ea', 'far', [0, 0, deg(48)]);
    }
    m.box([32, 1.2, 32], [0, 1 + k * 16, 0], '#e6e4dc');
  }
  m.pop();
  // Torre Mapfre: vidrio con bandas horizontales.
  m.push([34, 0, -26]);
  m.box([30, 126, 30], [0, 63, 0], '#86a7ba');
  for (let k = 0; k < 30; k++) m.box([30.6, .9, 30.6], [0, 4 + k * 4.1, 0], '#d9e2e6');
  m.box([20, 6, 20], [0, 129, 0], '#c9d3d8');
  m.pop();
  // Peix d'Or de Gehry junto al puerto olímpico.
  m.push([-88, 0, 40], [0, deg(70), 0]);
  m.sphere(1, [0, 18, 0], '#d9a64a', 'far', [30, 12, 10], 16);
  m.add(new THREE.ConeGeometry(9, 22, 10), 'far', '#cf9b40', [-34, 24, 0], [0, 0, deg(115)], [1, 1, .45]);
  m.sphere(1, [22, 22, 0], '#e2b85e', 'far', [10, 8, 7], 10);
  for (const x of [-12, 0, 12]) m.box([2, 18, 2], [x, 9, 0], '#a7b1b6');
  m.pop();
}

function wHotel(m) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.quadraticCurveTo(40, 22, 80, 0); shape.quadraticCurveTo(40, 8, 0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 100, bevelEnabled: false, curveSegments: 16 });
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i);
    position.setY(i, y * (1 - .42 * (x / 80) ** 1.6));
  }
  geometry.computeVertexNormals();
  m.add(geometry, 'far', '#9dbfd3', [-40, 0, 0]);
  m.box([70, 14, 34], [0, 7, -12], '#d8d6cf');
}

function montjuic(m, rng) {
  m.sphere(1, [0, -40, 0], '#5f7f52', 'far', [760, 160, 420], 28);
  m.sphere(1, [-520, -30, 160], '#6a8758', 'far', [520, 120, 300], 20);
  m.sphere(1, [480, -30, -60], '#647f54', 'far', [420, 100, 260], 20);
  // Torre de comunicaciones de Calatrava: aguja inclinada con anillo.
  m.push([120, 112, 40]);
  m.tube([[0, 0, 0], [8, 50, 0], [22, 100, 0], [40, 136, 0]], 2.4, '#f2efe8', 'far', 12, 6);
  m.add(new THREE.TorusGeometry(9, 1.4, 6, 24), 'far', '#f2efe8', [4, 22, 0], [deg(90), deg(20), deg(-10)]);
  m.pop();
  // Castillo en la cima.
  m.box([60, 16, 60], [-160, 120, 30], '#b8a787');
  m.box([20, 10, 20], [-160, 132, 30], '#b8a787');
  for (let i = 0; i < 4; i++) {
    const [x, z] = [rng.range(-200, 200), rng.range(-60, 60)];
    m.sphere(1, [x, 95 + rng.range(-15, 15), z], '#557548', 'far', [rng.range(40, 80), rng.range(14, 24), 30], 8);
  }
}

function portCranes(m) {
  for (let i = 0; i < 5; i++) {
    m.push([i * 46, 0, 0]);
    for (const s of [-1, 1]) {
      m.box([2.4, 44, 2.4], [s * 9, 22, -9], '#c9473a');
      m.box([2.4, 44, 2.4], [s * 9, 22, 9], '#c9473a');
    }
    m.box([22, 6, 22], [0, 46, 0], '#f2efe8');
    m.box([3, 3, 88], [0, 52, 20], '#c9473a', 'far', [deg(i % 2 ? -12 : 0), 0, 0]);
    m.box([5, 26, 3], [0, 66, -6], '#f2efe8', 'far', [deg(-14), 0, 0]);
    m.pop();
  }
}

function cruiseShip(m, length) {
  m.box([30, 16, length], [0, 8, 0], '#f4f2ec');
  m.box([30.4, 3, length], [0, 1.5, 0], '#273543');
  for (let k = 0; k < 5; k++) m.box([26 - k * 1.2, 3.4, length * (.78 - k * .07)], [0, 17.5 + k * 3.4, -length * .04], k % 2 ? '#e8e6df' : '#b7cad6');
  m.box([8, 14, 14], [0, 39, -length * .18], '#253342');
  m.box([8.2, 3, 14.2], [0, 44, -length * .18], '#c9473a');
}

function cityBand(m, rng, from, to, distance, depth, heights, tints) {
  for (let yaw = from; yaw < to; yaw += rng.range(.5, 1.0)) {
    const d = distance + rng.range(0, depth);
    const [x, z] = at(yaw, d);
    const h = rng.range(heights[0], heights[1]) * (rng() < .08 ? 2.2 : 1);
    m.box([rng.range(24, 50), h, rng.range(24, 50)], [x, h / 2, z], rng.pick(tints), 'far', [0, deg(yaw) + rng.range(-.2, .2), 0]);
  }
}

function ridge(m, rng) {
  for (let yaw = -10; yaw < 60; yaw += 2.2) {
    const [x, z] = at(yaw, 2850 + rng.range(-60, 80));
    m.sphere(1, [x, -40, z], '#738a7c', 'far', [rng.range(260, 420), rng.range(170, 250), 200], 12);
  }
  const [x, z] = at(14, 2780);
  m.cylinder(2.5, 5, 120, [x, 240, z], '#e9ece8', 'far', undefined, 8);
  m.cylinder(15, 15, 6, [x, 268, z], '#e9ece8', 'far', undefined, 16);
  m.cylinder(.8, 1.6, 60, [x, 328, z], '#e9ece8', 'far', undefined, 6);
}

export function createSkyline({ haze }) {
  const rng = random(31);
  const m = new Merger('far');
  const place = (yaw, distance, build, scale = 1, turn = 0) => {
    const [x, z] = at(yaw, distance);
    m.push([x, 0, z], [0, facing(yaw) + turn, 0], scale); build(m, rng); m.pop();
  };
  ridge(m, rng);
  cityBand(m, rng, 8, 44, 1700, 600, [18, 50], ['#d9cdb8', '#cfc2ab', '#e3dccd', '#bfb7a6', '#d6c3a6']);
  cityBand(m, rng, 12, 36, 1050, 380, [12, 32], ['#e2d6c0', '#d4c6ad', '#ece5d6', '#c7bca8']);
  place(19, 1150, twinTowers, .95, deg(-20));
  place(25.5, 1450, glories, 1.15);
  place(31.5, 1750, sagradaFamilia, 1.25, deg(25));
  place(41, 1500, wHotel, 1.15, deg(-35));
  place(46, 1850, portCranes, .9, deg(-60));
  place(44, 1650, (mm) => cruiseShip(mm, 260), .9, deg(-75));
  place(48.5, 1900, (mm) => cruiseShip(mm, 220), .9, deg(-70));
  place(51, 2600, montjuic, 1);
  const geometry = m.merged('far');
  // Bruma horneada: más fuerte con la distancia y cerca del suelo.
  const position = geometry.attributes.position, colors = geometry.attributes.color;
  const hazeColor = new THREE.Color(haze), c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const distance = Math.hypot(position.getX(i), position.getZ(i)), y = position.getY(i);
    const k = THREE.MathUtils.clamp(.16 + (distance - 800) / 5200, .16, .55) + (1 - THREE.MathUtils.smoothstep(y, 0, 70)) * .14;
    c.fromBufferAttribute(colors, i).lerp(hazeColor, Math.min(k, .9));
    colors.setXYZ(i, c.r, c.g, c.b);
  }
  const material = new THREE.MeshLambertMaterial({ vertexColors: true, fog: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'skyline';
  mesh.frustumCulled = false;
  return mesh;
}
