import * as THREE from 'three';

// Mobiliario urbano y vegetación del litoral, escritos sobre un Merger en coordenadas del segmento.

function frondTemplate(length, droop, seed) {
  const positions = [], normals = [];
  const spine = t => [length * t, length * (.3 * t - (.5 + droop) * t * t), 0];
  const samples = 26;
  for (let i = 0; i < samples; i++) {
    const t0 = .06 + i / samples * .92, t1 = t0 + .7 / samples;
    const a = spine(t0), b = spine(t1);
    const leaf = length * .34 * Math.sin(Math.PI * Math.min(1, .15 + t0 * .95)) * (1 - t0 * .35);
    for (const side of [-1, 1]) {
      const sag = leaf * (.42 + .14 * Math.sin(seed * 3 + i * 1.7));
      const tip = [a[0] + leaf * .42, a[1] - sag, side * leaf * .9];
      positions.push(...a, ...b, ...tip);
      for (let k = 0; k < 3; k++) normals.push(.2 * side, .96, .1);
    }
  }
  for (let i = 0; i < 12; i++) {
    const t0 = i / 12, t1 = (i + 1) / 12, a = spine(t0), b = spine(t1), w = .045 * (1 - t0 * .7);
    positions.push(a[0], a[1], -w, b[0], b[1], -w, a[0], a[1], w, b[0], b[1], -w, b[0], b[1], w, a[0], a[1], w);
    for (let k = 0; k < 6; k++) normals.push(0, 1, 0);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return geometry;
}
const fronds = [frondTemplate(3.3, .02, 1), frondTemplate(3.8, .1, 2), frondTemplate(3.4, .2, 3)];

function trunk(height, radius, bend, bendAngle) {
  const points = [];
  for (let i = 0; i <= 44; i++) {
    const y = i / 44 * height;
    const r = radius * (1 - .28 * y / height) + .022 * Math.abs(Math.sin(y * Math.PI / .32));
    points.push(new THREE.Vector2(Math.max(r, .02), y));
  }
  const geometry = new THREE.LatheGeometry(points, 9);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const k = (position.getY(i) / height) ** 2 * bend;
    position.setXYZ(i, position.getX(i) + Math.cos(bendAngle) * k, position.getY(i), position.getZ(i) + Math.sin(bendAngle) * k);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function palm(m, x, z, rng, scale = 1) {
  const height = rng.range(6.4, 9.6) * scale, bend = rng.range(.2, .9), angle = rng.range(0, Math.PI * 2);
  m.add(trunk(height, .3, bend, angle), 'matte', rng.pick(['#9a8263', '#a48c6c', '#8f7a5e']), [x, 0, z]);
  const top = [x + Math.cos(angle) * bend, height, z + Math.sin(angle) * bend];
  m.sphere(.42, [top[0], top[1] - .1, top[2]], '#86704f', 'matte', [1, .8, 1], 9);
  const count = 18;
  for (let i = 0; i < count; i++) {
    const yaw = i / count * Math.PI * 2 + rng.range(-.2, .2);
    const pitch = (i % 3 === 0 ? .42 : i % 3 === 1 ? .08 : -.25) + rng.range(-.08, .08);
    const tint = rng.pick(['#5f8f49', '#557f42', '#6a9a50', '#4d7a3f']);
    m.add(fronds[i % 3].clone(), 'foliage', tint, top, [0, yaw, pitch, 'YZX'], scale * rng.range(.9, 1.1));
  }
  for (let i = 0; i < 6; i++) {
    const yaw = rng.range(0, Math.PI * 2);
    m.sphere(.09, [top[0] + Math.cos(yaw) * .32, top[1] - .45, top[2] + Math.sin(yaw) * .32], '#d8902f', 'matte', [1, 1.6, 1], 6);
  }
}

export function lamp(m, x, z, armDirection = 1, height = 7.2) {
  m.cylinder(.07, .1, height, [x, height / 2, z], '#56626b', 'metal', undefined, 10);
  m.cylinder(.16, .18, .5, [x, .25, z], '#3f4a52', 'metal', undefined, 10);
  m.tube([[x, height - .1, z], [x + armDirection * .35, height + .32, z], [x + armDirection * 1.1, height + .38, z], [x + armDirection * 1.5, height + .25, z]], .045, '#56626b', 'metal', 12, 6);
  m.box([.62, .1, .26], [x + armDirection * 1.55, height + .2, z], '#3c464e', 'satin', [0, 0, armDirection * .12], .04);
  m.box([.5, .02, .18], [x + armDirection * 1.55, height + .15, z], '#fff6dc', 'lamp', [0, 0, armDirection * .12]);
}

export function bench(m, x, z, facing = -1) {
  m.push([x, 0, z], [0, facing < 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
  for (let i = 0; i < 3; i++) m.box([1.9, .045, .11], [0, .46, -.16 + i * .14], '#a8744a', 'satin', undefined, .015);
  for (let i = 0; i < 2; i++) m.box([1.9, .11, .04], [0, .66 + i * .16, -.27], '#a8744a', 'satin', [-.18, 0, 0], .015);
  for (const s of [-1, 1]) {
    m.box([.06, .44, .5], [s * .82, .23, -.06], '#2f3a42', 'metal', undefined, .02);
    m.box([.05, .5, .05], [s * .82, .7, -.3], '#2f3a42', 'metal');
  }
  m.pop();
}

export function bin(m, x, z) {
  m.cylinder(.24, .22, .9, [x, .45, z], '#3f6e5a', 'satin', undefined, 12);
  m.cylinder(.26, .26, .06, [x, .92, z], '#2f3a42', 'metal', undefined, 12);
}

export function parasol(m, x, z, rng) {
  const tint = rng.pick(['#f97316', '#2f8fb0', '#f4f1e8', '#f2c230', '#e0533f', '#3fae9a', '#253342']);
  m.cylinder(.03, .03, 2.3, [x, 1.15, z], '#e8e2d4', 'satin', [rng.range(-.08, .08), 0, rng.range(-.08, .08)], 6);
  m.add(new THREE.ConeGeometry(1.15, .42, 10, 1, true), 'foliage', tint, [x, 2.32, z]);
  m.cylinder(1.15, 1.15, .07, [x, 2.1, z], tint, 'matte', undefined, 10, true);
  for (let i = 0; i < 2; i++) {
    m.box([.62, .015, 1.7], [x + (i ? .55 : -.45) + rng.range(-.2, .2), .01, z + rng.range(-.6, .6)], rng.pick(['#f2c230', '#e0533f', '#2f8fb0', '#ffffff', '#7fc6a4']), 'matte', [0, rng.range(-.4, .4), 0]);
  }
}

export function lifeguardTower(m, x, z) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.box([.1, 2.4, .1], [x + sx * .55, 1.2, z + sz * .55], '#f4f1e8', 'satin', [sz * .06, 0, -sx * .06]);
  m.box([1.5, .1, 1.5], [x, 2.4, z], '#d9d3c4', 'satin');
  m.box([1.3, 1.0, 1.3], [x, 2.95, z], '#f4f1e8', 'satin', undefined, .05);
  m.box([1.25, .35, .02], [x - .66, 3.1, z], '#2a4250', 'satin');
  m.box([1.7, .12, 1.7], [x, 3.52, z], '#d8452f', 'satin', undefined, .04);
  m.cylinder(.025, .025, 2.4, [x + .75, 4.4, z + .75], '#e8e2d4', 'metal', undefined, 6);
  m.box([.03, .45, .7], [x + .75, 5.3, z + 1.1], '#3fa34d', 'foliage');
  for (let i = 0; i < 6; i++) m.box([.5, .04, .12], [x + 1.0, .3 + i * .36, z], '#e8e2d4', 'satin', [0, 0, .5]);
}

export function chiringuito(m, x, z, rng) {
  m.box([3.6, 2.6, 4.4], [x, 1.3, z], '#c99b66', 'matte', undefined, .06);
  for (let i = 0; i < 9; i++) m.box([.03, 2.5, .2], [x - 1.81, 1.28, z - 2 + i * .5], '#a77a4b', 'matte');
  m.box([4.8, .26, 5.6], [x, 2.75, z], '#d8b77f', 'matte', [0, 0, .04], .08);
  m.box([.2, 1.0, 3.6], [x - 1.95, .9, z], '#e9dfc9', 'satin');
  m.box([.5, .05, 3.8], [x - 2.1, 1.42, z], '#8d6440', 'satin');
  for (let i = 0; i < 4; i++) {
    const tx = x - 4.2 - (i % 2) * 2.6, tz = z - 2.4 + Math.floor(i / 2) * 4.8;
    m.cylinder(.32, .32, .04, [tx, .74, tz], '#f4f1e8', 'satin', undefined, 12);
    m.cylinder(.03, .03, .74, [tx, .37, tz], '#3f4a52', 'metal', undefined, 6);
    m.cylinder(.03, .03, 2.3, [tx, 1.15, tz], '#e8e2d4', 'satin', undefined, 6);
    m.add(new THREE.ConeGeometry(1.2, .4, 10, 1, true), 'foliage', '#f4f1e8', [tx, 2.3, tz]);
    for (const s of [-1, 1]) m.box([.4, .45, .4], [tx + s * .6, .22, tz], rng.pick(['#f97316', '#2f8fb0', '#f4f1e8']), 'satin', undefined, .05);
  }
}

export function volleyNet(m, x, z) {
  for (const s of [-1, 1]) m.cylinder(.05, .05, 2.6, [x, 1.3, z + s * 4.2], '#e8e2d4', 'metal', undefined, 6);
  for (let k = 0; k < 5; k++) m.box([.015, .02, 8.4], [x, 1.62 + k * .2, z], '#4a535a', 'satin');
  for (let k = -20; k <= 20; k++) m.box([.015, .8, .02], [x, 2.02, z + k * .2], '#4a535a', 'satin');
  m.box([.03, .07, 8.4], [x, 2.46, z], '#f4f1e8', 'satin');
}

export function person(m, x, z, rng, { sitting = false, yaw = rng.range(0, Math.PI * 2) } = {}) {
  const skin = rng.pick(['#e8b894', '#c98c64', '#8d5a3b', '#f1c9a6', '#b57a52']);
  const top = rng.pick(['#f4f1e8', '#2f8fb0', '#f97316', '#e0533f', '#253342', '#f2c230', '#7fb4c9', '#9b6fb0']);
  const legs = rng.pick(['#253342', '#3f5160', '#d8cfbd', '#6c7a5a', '#2f8fb0']);
  const h = rng.range(.92, 1.06);
  m.push([x, 0, z], [0, yaw, 0], h);
  if (sitting) {
    m.box([.34, .16, .5], [0, .5, .1], legs, 'matte', undefined, .07);
    m.box([.3, .48, .14], [0, .3, .33], legs, 'matte', undefined, .06);
    m.box([.42, .58, .26], [0, .86, -.05], top, 'matte', undefined, .12);
  } else {
    for (const s of [-1, 1]) m.box([.15, .82, .17], [s * .1, .41, 0], legs, 'matte', undefined, .07);
    m.box([.44, .62, .26], [0, 1.12, 0], top, 'matte', undefined, .12);
    for (const s of [-1, 1]) m.box([.1, .56, .12], [s * .27, 1.1, 0], top, 'matte', [0, 0, s * .08], .05);
  }
  m.sphere(.13, [0, sitting ? 1.3 : 1.56, 0], skin, 'matte', [1, 1.1, 1], 10);
  m.sphere(.135, [0, sitting ? 1.36 : 1.62, -.02], rng.pick(['#2b2420', '#5a3b28', '#c9a46a', '#1d1b1a', '#8a8a8a']), 'matte', [1, .75, 1], 10);
  m.pop();
}

export function shrub(m, x, z, rng, size = 1) {
  const tint = rng.pick(['#5d8a46', '#4f7c3e', '#6b9650']);
  m.add(new THREE.IcosahedronGeometry(.62 * size, 1), 'matte', tint, [x, .45 * size, z], [rng.range(0, 3), rng.range(0, 3), 0], [1.2, .78, 1]);
  if (rng() < .7) {
    const flower = rng.pick(['#f08aa8', '#f7f1f3', '#e65f87']);
    for (let i = 0; i < 6; i++) {
      const a = rng.range(0, Math.PI * 2), r = rng.range(.2, .55) * size;
      m.sphere(.08, [x + Math.cos(a) * r, .78 * size + rng.range(-.12, .08), z + Math.sin(a) * r], flower, 'matte', 1, 5);
    }
  }
}

export function planeTree(m, x, z, rng) {
  const height = rng.range(4.2, 5.4);
  m.cylinder(.16, .24, height, [x, height / 2, z], '#a7a58c', 'matte', [rng.range(-.05, .05), 0, rng.range(-.05, .05)], 9);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + rng.range(-.3, .3), r = i ? rng.range(.8, 1.3) : 0;
    m.add(new THREE.IcosahedronGeometry(rng.range(1.1, 1.5), 1), 'foliage', rng.pick(['#6f9a52', '#7aa65a', '#628c49']),
      [x + Math.cos(a) * r, height + rng.range(.6, 1.6), z + Math.sin(a) * r], [rng.range(0, 3), rng.range(0, 3), 0], [1, .82, 1]);
  }
}
