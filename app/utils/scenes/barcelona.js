import * as THREE from 'three';
import { Merger, canvasTexture, normalTexture, random, contactShadowTexture } from './truck-kit.js';
import * as props from './barcelona-props.js';
import { eixampleBlock, facadeTexture, railingTexture } from './barcelona-eixample.js';
import { createSkyline } from './barcelona-landmarks.js';
import { createTraffic } from './barcelona-traffic.js';

// Litoral de Barcelona: Ronda, carril bici, paseo con panot, playa, mar y ciudad. El camión está quieto
// en el origen y el mundo se desplaza hacia -z; los tramos se reciclan al salir por el fondo con niebla.
const SEGMENT = 48, SEGMENTS = 9, NEAR = 72;
const SPAN = SEGMENT * SEGMENTS, FAR = NEAR - SPAN;
const LENGTH = 1200, CENTER = -420;
const ROAD_LEFT = -5.4, ROAD_WIDTH = 19.3;
const SEASIDE = -3.5, WALL_X = -12.4 + SEASIDE, SHORE_X = -44 + SEASIDE;

function roadTexture() {
  return canvasTexture(1024, 1024, (ctx, w, h) => {
    const X = x => (x - ROAD_LEFT) / ROAD_WIDTH * w, metres = m => m / 16 * h;
    ctx.fillStyle = '#5d656c'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 16000; i++) {
      const light = Math.random() < .5;
      ctx.fillStyle = light ? `rgba(200,205,210,${Math.random() * .12})` : `rgba(20,24,28,${Math.random() * .16})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.fillStyle = 'rgba(28,32,38,.12)';
    for (const lane of [-3.5, 0, 3.5, 8.6, 12.1]) for (const side of [-.85, .85]) ctx.fillRect(X(lane + side) - 12, 0, 24, h);
    ctx.fillStyle = 'rgba(40,46,52,.35)';
    ctx.fillRect(X(4.2), metres(9), 70, 40); ctx.fillRect(X(9.4), metres(2), 50, 110);
    ctx.fillStyle = '#ecebe4';
    for (const x of [-5.1, 5.05, 6.75, 13.6]) ctx.fillRect(X(x) - 5, 0, 10, h);
    ctx.fillRect(X(-1.75) - 9, 0, 18, h);
    for (const x of [1.75, 10.35]) for (let k = 0; k < 2; k++) ctx.fillRect(X(x) - 5, metres(k * 8 + 1), 10, metres(4));
    // Carril bus rotulado.
    ctx.save(); ctx.translate(X(-3.45), metres(10)); ctx.scale(1, 3.2);
    ctx.font = '700 46px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('BUS', 0, 0); ctx.restore();
  }, { anisotropy: 16 });
}

function panotTexture() {
  return canvasTexture(256, 256, (ctx, w) => {
    const s = w / 2;
    for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) {
      const ox = tx * s, oy = ty * s;
      ctx.fillStyle = '#d3cbbd'; ctx.fillRect(ox, oy, s, s);
      ctx.strokeStyle = '#a99f8e'; ctx.lineWidth = 3;
      ctx.strokeRect(ox + 1.5, oy + 1.5, s - 3, s - 3);
      const cx = ox + s / 2, cy = oy + s / 2, r = s * .15;
      ctx.lineWidth = 4;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.beginPath(); ctx.arc(cx + dx * r, cy + dy * r, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(cx, cy, r * .45, 0, Math.PI * 2); ctx.stroke();
      for (const [px, py] of [[ox, oy], [ox + s, oy], [ox, oy + s], [ox + s, oy + s]]) { ctx.beginPath(); ctx.arc(px, py, s * .3, 0, Math.PI * 2); ctx.stroke(); }
    }
    for (let i = 0; i < 1800; i++) { ctx.fillStyle = `rgba(90,80,70,${Math.random() * .1})`; ctx.fillRect(Math.random() * w, Math.random() * w, 2, 2); }
  }, { anisotropy: 16 });
}

function sandTexture() {
  return canvasTexture(512, 512, (ctx, w) => {
    ctx.fillStyle = '#e4d1aa'; ctx.fillRect(0, 0, w, w);
    for (let i = 0; i < 26000; i++) {
      ctx.fillStyle = Math.random() < .5 ? `rgba(160,130,90,${Math.random() * .22})` : `rgba(255,248,230,${Math.random() * .3})`;
      ctx.fillRect(Math.random() * w, Math.random() * w, 1.5, 1.5);
    }
    ctx.strokeStyle = 'rgba(170,140,100,.12)'; ctx.lineWidth = 3;
    for (let y = 0; y < w; y += 22) { ctx.beginPath(); for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x / w * Math.PI * 4 + y) * 5); ctx.stroke(); }
  }, { anisotropy: 8 });
}

function bikeTexture() {
  return canvasTexture(128, 512, (ctx, w, h) => {
    ctx.fillStyle = '#ab6b55'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { ctx.fillStyle = `rgba(60,30,20,${Math.random() * .14})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    ctx.fillStyle = '#efe9df'; ctx.fillRect(2, 0, 5, h); ctx.fillRect(w - 7, 0, 5, h);
    for (let y = 20; y < h; y += 128) ctx.fillRect(w / 2 - 2, y, 4, 60);
  }, { anisotropy: 16 });
}

function foamTexture() {
  return canvasTexture(256, 256, (ctx, w) => {
    ctx.clearRect(0, 0, w, w);
    for (let band = 0; band < 3; band++) {
      ctx.strokeStyle = `rgba(255,255,255,${.85 - band * .25})`; ctx.lineWidth = 7 - band * 2;
      ctx.beginPath();
      for (let y = 0; y <= w; y += 8) ctx.lineTo(w * (.25 + band * .22) + Math.sin(y / w * Math.PI * 6 + band) * 10, y);
      ctx.stroke();
    }
    for (let i = 0; i < 500; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .5})`; ctx.fillRect(Math.random() * w * .45, Math.random() * w, 3, 3); }
  }, { srgb: true, anisotropy: 4 });
}

// Ruido de valor periódico en [0, 1) para que el mapa de normales del mar sea tileable.
function periodicNoise(rng) {
  const grids = new Map();
  return (u, v, cells) => {
    if (!grids.has(cells)) grids.set(cells, Array.from({ length: cells * cells }, () => rng()));
    const grid = grids.get(cells), x = u * cells, y = v * cells, ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (i, j) => grid[((j % cells + cells) % cells) * cells + ((i % cells + cells) % cells)];
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(at(ix, iy), at(ix + 1, iy), sx), THREE.MathUtils.lerp(at(ix, iy + 1), at(ix + 1, iy + 1), sx), sy);
  };
}

function stripe(material, width, x, y, z = CENTER) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, LENGTH), material);
  mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, y, z); mesh.receiveShadow = true;
  return mesh;
}

export function createBarcelona({ scene, haze, speed }) {
  const root = new THREE.Group(); root.name = 'barcelona'; scene.add(root);
  const scrolling = [];
  const scroll = (texture, metresPerRepeat, axis = 'y') => { scrolling.push({ texture, metresPerRepeat, axis }); return texture; };

  // ---- Suelo continuo con texturas desplazables -------------------------------------------
  const road = scroll(roadTexture(), 16); road.repeat.set(1, LENGTH / 16);
  root.add(stripe(new THREE.MeshStandardMaterial({ map: road, roughness: .86 }), ROAD_WIDTH, ROAD_LEFT + ROAD_WIDTH / 2, 0));
  const panot = scroll(panotTexture(), .8);
  const promenade = panot.clone(); scroll(promenade, .8);
  promenade.repeat.set(8.1 / .8, LENGTH / .8);
  root.add(stripe(new THREE.MeshStandardMaterial({ map: promenade, roughness: .9 }), 8.1, -8.1 + SEASIDE, .142));
  const sidewalk = panot; sidewalk.repeat.set(8.4 / .8, LENGTH / .8);
  root.add(stripe(new THREE.MeshStandardMaterial({ map: sidewalk, roughness: .9 }), 8.4, 18.1, .142));
  const bike = scroll(bikeTexture(), 8); bike.repeat.set(1, LENGTH / 8);
  root.add(stripe(new THREE.MeshStandardMaterial({ map: bike, roughness: .85 }), 2.0, -3.05 + SEASIDE, .143));
  const sand = scroll(sandTexture(), 5); sand.repeat.set(34 / 5, LENGTH / 5);
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(36, LENGTH, 6, 1), new THREE.MeshStandardMaterial({ map: sand, roughness: .95 }));
  beach.rotation.x = -Math.PI / 2; beach.position.set(WALL_X - 18, 0, CENTER); beach.receiveShadow = true;
  {
    const position = beach.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i) + beach.position.x, t = THREE.MathUtils.clamp((WALL_X - x) / 36.7, 0, 1.2);
      position.setZ(i, -1.05 - t * .55 - t * t * .1);
    }
    beach.geometry.computeVertexNormals();
  }
  root.add(beach);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1800, LENGTH * 2), new THREE.MeshStandardMaterial({ color: '#cbc3b3', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(13.9 + 900, -.01, CENTER); ground.receiveShadow = true; root.add(ground);

  // Mar con oleaje por mapa de normales y degradado de turquesa a azul profundo.
  const noise = periodicNoise(random(5));
  const waves = normalTexture(256, (u, v) => noise(u, v, 6) * .55 + noise(u, v, 12) * .3 + noise(u, v, 24) * .18 + noise(u, v, 48) * .1, 9);
  waves.repeat.set(2400 / 26, LENGTH * 3 / 26);
  const seaGeometry = new THREE.PlaneGeometry(2400, LENGTH * 3, 48, 1);
  {
    const position = seaGeometry.attributes.position, colors = [];
    const shallow = new THREE.Color('#72c2bf'), mid = new THREE.Color('#3a98b3'), deep = new THREE.Color('#276f96'), c = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const distance = 1200 - position.getX(i);
      if (distance < 40) c.copy(shallow).lerp(mid, distance / 40); else c.copy(mid).lerp(deep, Math.min(1, (distance - 40) / 260));
      colors.push(c.r, c.g, c.b);
    }
    seaGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }
  const seaMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .1, metalness: 0, normalMap: waves, normalScale: new THREE.Vector2(.4, .4), envMapIntensity: .8 });
  // El mar usa una bruma propia, más lejana que la de la escena, para que llegue azul a la otra orilla.
  seaMaterial.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>', `
      #ifdef USE_FOG
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, smoothstep(120.0, 1500.0, vFogDepth) * .8);
      #endif`);
  };
  const sea = new THREE.Mesh(seaGeometry, seaMaterial);
  sea.rotation.x = -Math.PI / 2; sea.position.set(SHORE_X + 2 - 1200, -1.56, CENTER); sea.receiveShadow = true;
  root.add(sea);
  const foam = scroll(foamTexture(), 6); foam.repeat.set(1, LENGTH / 6); foam.wrapS = THREE.ClampToEdgeWrapping;
  const foamMaterial = new THREE.MeshBasicMaterial({ map: foam, transparent: true, depthWrite: false, opacity: .8 });
  const shoreFoam = stripe(foamMaterial, 7, SHORE_X - .5, -1.5);
  root.add(shoreFoam);

  // Bordillos, muro del paseo, mediana y losas: largos y uniformes, se fusionan en una malla estática.
  const statics = new Merger();
  const long = (size, position, tint, key = 'matte') => statics.box([size[0], size[1], LENGTH], [position[0], position[1], CENTER], tint, key);
  long([10.4, .14, 0], [-7.1 + SEASIDE, .07, 0], '#c8bfae');
  long([.3, .16, 0], [ROAD_LEFT - .05, .08, 0], '#e2dccf');
  long([.55, 1.75, 0], [WALL_X, -.33, 0], '#ddd1b8');
  long([.75, .1, 0], [WALL_X, .58, 0], '#ece4d2');
  long([1.5, .3, 0], [5.92, .15, 0], '#d9d2c4');
  long([1.2, .06, 0], [5.92, .3, 0], '#6b7a4c');
  long([.3, .16, 0], [13.95, .08, 0], '#e2dccf');
  long([8.4, .14, 0], [18.1, .07, 0], '#c8bfae');
  const staticMaterials = { matte: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 }) };
  root.add(statics.build(staticMaterials, { cast: false }));
  const seaRail = railingTexture('#dfe4e6'); seaRail.repeat.set(LENGTH / 1.6, 1); scroll(seaRail, 1.6, 'x');
  const railMaterial = new THREE.MeshStandardMaterial({ map: seaRail, alphaTest: .5, side: THREE.DoubleSide, roughness: .5, metalness: .4 });
  const rail = new THREE.Mesh(new THREE.PlaneGeometry(LENGTH, .85), railMaterial);
  rail.rotation.y = Math.PI / 2; rail.position.set(WALL_X - .1, 1.05, CENTER); rail.castShadow = true; root.add(rail);

  // ---- Tramos reciclables ------------------------------------------------------------------
  const facade = facadeTexture(), balcony = railingTexture();
  const materials = {
    matte: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 }),
    satin: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .45, metalness: .05 }),
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .35, metalness: .7 }),
    foliage: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8, side: THREE.DoubleSide }),
    lamp: new THREE.MeshBasicMaterial({ vertexColors: true }),
    facade: new THREE.MeshStandardMaterial({ vertexColors: true, map: facade, roughness: .85 }),
    railing: new THREE.MeshStandardMaterial({ vertexColors: true, map: balcony, alphaTest: .5, side: THREE.DoubleSide, roughness: .6 }),
  };
  const tints = ['#f1d9b5', '#e8c9a8', '#f3e6cc', '#dcc7b0', '#ecd2bf', '#d9d0bd', '#efdcb8'];
  const segments = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const rng = random(101 + i * 37);
    const near = new Merger(), city = new Merger();
    near.push([SEASIDE, 0, 0]);
    for (let k = 0; k < 4; k++) props.palm(near, -7.6 + rng.range(-.8, .8), 18 - k * 12 + rng.range(-1.6, 1.6), rng, rng.range(.9, 1.12));
    props.lamp(near, -4.5, 12, 1); props.lamp(near, -4.5, -12, 1);
    for (const z of [6, -18]) props.bench(near, -11.3, z + rng.range(-2, 2), -1);
    props.bin(near, -4.9, 2 + rng.range(-3, 3));
    for (let k = 0, n = 2 + Math.floor(rng() * 4); k < n; k++) props.person(near, rng.range(-11, -5.2), rng.range(-22, 22), rng);
    if (rng() < .5) props.person(near, -11.15, 6.4, rng, { sitting: true, yaw: -Math.PI / 2 });
    for (let k = 0, n = 2 + Math.floor(rng() * 5); k < n; k++) {
      near.push([0, -1.1 - .15, 0]); props.parasol(near, rng.range(-36, -17), rng.range(-22, 22), rng); near.pop();
    }
    near.push([0, -1.22, 0]);
    if (i % 2 === 0) props.lifeguardTower(near, -31, rng.range(-10, 10));
    if (i % 3 === 1) props.chiringuito(near, -16.6, rng.range(-8, 8), rng);
    if (i % 3 === 2) props.volleyNet(near, -27, rng.range(-12, 12));
    for (let k = 0, n = Math.floor(rng() * 4); k < n; k++) props.person(near, rng.range(-40, -16), rng.range(-22, 22), rng);
    near.pop();
    near.pop();
    for (let z = -22.5; z < 24; z += 3) props.shrub(near, 5.92 + rng.range(-.15, .15), z + rng.range(-.6, .6), rng, rng.range(.7, .95));
    for (let z = -20; z < 10; z += 8.5) props.planeTree(city, 19.8, z, rng);
    eixampleBlock(city, { x0: 22.6, depth: 34, length: 34, chamfer: 6, tint: rng.pick(tints), rng });
    const group = new THREE.Group(); group.name = `tramo-${i}`;
    group.add(near.build(materials, { cast: ['matte', 'satin', 'metal', 'foliage'] }));
    group.add(city.build(materials, { cast: false }));
    segments.push({ group, base: NEAR - SEGMENT / 2 - i * SEGMENT, casts: new Set(['matte', 'satin', 'metal', 'foliage']) });
    root.add(group);
  }
  // El bloque se construyó centrado en z = 0; se desplaza para dejar la calle transversal.
  for (const { group } of segments) group.children[1].position.z = -7;

  // ---- Fondo, tráfico, barcos y gaviotas ----------------------------------------------------
  root.add(createSkyline({ haze }));
  const shadowTexture = contactShadowTexture();
  const traffic = createTraffic({ shadowTexture });
  root.add(traffic.group);

  const boatMaterials = {
    paint: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .4 }),
    sail: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .7, side: THREE.DoubleSide }),
  };
  const boats = [];
  const boatRng = random(9);
  for (let i = 0; i < 7; i++) {
    const m = new Merger('paint'), size = boatRng.range(.8, 1.4);
    m.push([0, 0, 0], [0, 0, 0], size);
    m.box([2.2, .8, 8], [0, .2, 0], '#f4f2ec', 'paint', undefined, .35);
    m.box([2.24, .2, 8.02], [0, -.05, 0], i % 3 ? '#253342' : '#2f8fb0', 'paint', undefined, .1);
    m.box([1.2, .6, 2.6], [0, .85, -.6], '#e7e4dc', 'paint', undefined, .2);
    m.cylinder(.06, .08, 11, [0, 6, .8], '#d9dcdf', 'paint', undefined, 6);
    const main = new THREE.Shape([new THREE.Vector2(0, 1.2), new THREE.Vector2(0, 11), new THREE.Vector2(-3.4, 1.4)]);
    m.add(new THREE.ShapeGeometry(main), 'sail', '#fbfaf6', [0, 0, .7], [0, Math.PI / 2, 0]);
    const jib = new THREE.Shape([new THREE.Vector2(0, 1.2), new THREE.Vector2(0, 10), new THREE.Vector2(3.4, 1.0)]);
    m.add(new THREE.ShapeGeometry(jib), 'sail', i === 2 ? '#f97316' : '#f2f0ea', [0, 0, .9], [0, Math.PI / 2, 0]);
    m.pop();
    const boat = m.build(boatMaterials, { receive: false });
    boat.position.set(-boatRng.range(80, 420), -1.5, 0);
    boat.rotation.y = boatRng.range(-.5, .5) + (boatRng() < .5 ? Math.PI : 0);
    root.add(boat);
    boats.push({ boat, z: boatRng.range(-1100, 100), phase: boatRng.range(0, 6), drift: boatRng.range(-1.5, 1.5) });
  }

  const gullMaterial = new THREE.MeshStandardMaterial({ color: '#f7f5f0', emissive: '#8d9196', roughness: .7, side: THREE.DoubleSide });
  const gulls = [];
  for (let i = 0; i < 4; i++) {
    const gull = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 6), gullMaterial); body.scale.set(1, .8, 2.6); gull.add(body);
    const wings = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .32), gullMaterial);
      wing.rotation.x = -Math.PI / 2; wing.position.x = s * .55; pivot.add(wing); gull.add(pivot); wings.push({ pivot, s });
    }
    root.add(gull);
    gulls.push({ gull, wings, radius: 5 + i * 2.6, height: 7.5 + i * 1.6, phase: i * 1.7, speed: .22 + i * .04 });
  }

  return {
    update(elapsed, travelled) {
      for (const { texture, metresPerRepeat, axis } of scrolling) {
        texture.offset[axis] = THREE.MathUtils.euclideanModulo(-travelled / metresPerRepeat, 1);
      }
      foam.offset.x = Math.sin(elapsed * .55) * .06;
      foamMaterial.opacity = .55 + Math.sin(elapsed * .55 + 1.2) * .25;
      waves.offset.set(elapsed * .003, THREE.MathUtils.euclideanModulo(-travelled / 26 + elapsed * .008, 1));
      for (const segment of segments) {
        const z = THREE.MathUtils.euclideanModulo(segment.base - travelled - FAR, SPAN) + FAR;
        segment.group.position.z = z;
        // Solo los tramos cercanos al camión proyectan sombra.
        segment.group.children[0].children.forEach(mesh => { mesh.castShadow = segment.casts.has(mesh.name) && z > -60 && z < 40; });
      }
      traffic.update(elapsed, speed);
      for (const item of boats) {
        item.boat.position.z = THREE.MathUtils.euclideanModulo(item.z - travelled + elapsed * item.drift - -1300, 1500) - 1300;
        item.boat.position.y = -1.5 + Math.sin(elapsed * .9 + item.phase) * .08;
        item.boat.rotation.z = Math.sin(elapsed * .7 + item.phase) * .03;
      }
      for (const { gull, wings, radius, height, phase, speed: s } of gulls) {
        const a = elapsed * s + phase;
        gull.position.set(-16 + SEASIDE + Math.cos(a) * radius, height + Math.sin(a * 2.3) * .8, -6 + Math.sin(a) * radius * 1.4);
        gull.rotation.y = -a + Math.PI;
        gull.rotation.z = Math.sin(a) * .3;
        const flap = Math.sin(elapsed * 7 + phase) * .45 + .1;
        for (const { pivot, s: side } of wings) pivot.rotation.z = side * flap;
      }
    },
  };
}
