import * as THREE from 'three';
import { Merger, canvasTexture, contactShadowTexture, fitUV } from './truck-kit.js';

// Tractora europea de cabina avanzada con semirremolque de caja, rotulada con la marca CAP Total.
// Unidades en metros; el camión mira hacia +z y la rueda delantera se apoya en y = 0.

const C = {
  orange: '#f97316', orangeDeep: '#dd5e0c', navy: '#253342', ivory: '#f4f1e8',
  plastic: '#2a323b', black: '#191f26', chrome: '#e7ecef', alu: '#c9d1d7', steel: '#88939b',
  amber: '#ffb238', red: '#e0372b', light: '#fff8e8', glass: '#30495a', glassTint: '#c9d6de',
};
const FRONT_AXLE = 2.25, REAR_AXLE = -1.65, WHEEL_R = .52;
const TRAILER_AXLES = [-9.95, -11.26, -12.57];
const RAKE = .0788;
const frontZ = y => 3.3 - RAKE * (y - 1.4);

function sideExtrude(shape, width, bevel, curveSegments = 18) {
  const depth = Math.max(width - bevel * 2, .002);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSegments: 3, bevelSize: bevel, bevelThickness: bevel, curveSegments,
  });
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(depth / 2, 0, 0);
  return geometry;
}
function arcBand(inner, outer, from, to, width) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, from, to, false);
  shape.absarc(0, 0, inner, to, from, true);
  shape.closePath();
  return sideExtrude(shape, width, .012, 20);
}
function roundedRect(width, height, radius) {
  const shape = new THREE.Shape(), w = width / 2, h = height / 2;
  shape.moveTo(-w + radius, -h); shape.lineTo(w - radius, -h); shape.quadraticCurveTo(w, -h, w, -h + radius);
  shape.lineTo(w, h - radius); shape.quadraticCurveTo(w, h, w - radius, h); shape.lineTo(-w + radius, h);
  shape.quadraticCurveTo(-w, h, -w, h - radius); shape.lineTo(-w, -h + radius); shape.quadraticCurveTo(-w, -h, -w + radius, -h);
  return shape;
}
// Plano con UV remapeadas a una región de la textura (para reaprovechar el lienzo de la rotulación).
function decal(width, height, region, radius = 0) {
  const geometry = radius ? new THREE.ShapeGeometry(roundedRect(width, height, radius), 6) : new THREE.PlaneGeometry(width, height);
  const position = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    const u = position.getX(i) / width + .5, v = position.getY(i) / height + .5;
    uv.setXY(i, region[0] + u * (region[2] - region[0]), region[1] + v * (region[3] - region[1]));
  }
  return geometry;
}

function tyreGeometry() {
  const R = WHEEL_R, points = [[.29, .125], [.37, .15], [.45, .148], [.497, .128], [R - .006, .108]];
  const grooves = [.058, 0, -.058];
  let h = .105;
  for (const g of grooves) {
    points.push([R, h], [R, g + .01], [R - .014, g + .008], [R - .014, g - .008], [R, g - .01]);
    h = g - .01;
  }
  points.push([R, -.105], [R - .006, -.108], [.497, -.128], [.45, -.148], [.37, -.15], [.29, -.125]);
  const geometry = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 40);
  geometry.rotateZ(-Math.PI / 2);
  return geometry;
}
function rimGeometry() {
  const merger = new Merger();
  const dish = new THREE.LatheGeometry([
    [.002, .118], [.1, .118], [.108, .104], [.17, .094], [.235, .082], [.262, .05], [.275, .02], [.284, .1], [.3, .112], [.31, .1], [.3, -.11],
  ].map(([r, y]) => new THREE.Vector2(r, y)).reverse(), 40);
  dish.rotateZ(-Math.PI / 2);
  merger.add(dish, 'rim', '#ffffff');
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    merger.cylinder(.017, .019, .05, [.13, Math.sin(a) * .135, Math.cos(a) * .135], '#7c868e', 'rim', [0, 0, Math.PI / 2], 6);
  }
  for (let i = 0; i < 5; i++) {
    const a = (i + .5) / 5 * Math.PI * 2;
    merger.add(new THREE.CylinderGeometry(.034, .034, .012, 14), 'rim', '#1a2128',
      [.092, Math.sin(a) * .205, Math.cos(a) * .205], [-a, 0, Math.PI / 2, 'XZY'], [1, 1, 1.7]);
  }
  merger.add(new THREE.SphereGeometry(.072, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), 'rim', '#c3cad0', [.12, 0, 0], [0, 0, -Math.PI / 2]);
  return merger.merged('rim');
}

// Reflejo estilizado del cielo en las lunas: degradado y dos destellos diagonales.
export function glassTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#9cc0d3'); sky.addColorStop(.38, '#4f7487'); sky.addColorStop(.62, '#22394a'); sky.addColorStop(1, '#16252f');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(225,240,248,.22)';
    ctx.beginPath(); ctx.moveTo(w * .52, 0); ctx.lineTo(w * .7, 0); ctx.lineTo(w * .36, h); ctx.lineTo(w * .2, h); ctx.fill();
    ctx.fillStyle = 'rgba(225,240,248,.12)';
    ctx.beginPath(); ctx.moveTo(w * .76, 0); ctx.lineTo(w * .82, 0); ctx.lineTo(w * .5, h); ctx.lineTo(w * .44, h); ctx.fill();
  }, { wrap: false });
}

export function createTruck({ invalidate, logoUrl }) {
  const materials = {
    paint: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .34, metalness: .04, clearcoat: .8, clearcoatRoughness: .16 }),
    satin: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .52, metalness: .05 }),
    plastic: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .74, metalness: .02 }),
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .24, metalness: .92 }),
    glass: new THREE.MeshPhysicalMaterial({ vertexColors: true, map: glassTexture(), roughness: .08, metalness: .1, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.4 }),
    lamp: new THREE.MeshBasicMaterial({ vertexColors: true }),
  };
  const truck = new THREE.Group(); truck.name = 'truck';

  // ---- Texturas de marca -------------------------------------------------------------------
  const LIVERY_W = 2048, LIVERY_H = 392;
  const logoRegion = [.29, .22, .71, .86];
  let logoImage = null, disposed = false;
  const livery = canvasTexture(LIVERY_W, LIVERY_H, () => {}, { wrap: false, anisotropy: 8 });
  function drawLivery() {
    const ctx = livery.image.getContext('2d'), w = LIVERY_W, h = LIVERY_H;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.ivory; ctx.fillRect(0, 0, w, h);
    // Barridos naranjas en ambos extremos y franja marino inferior.
    for (const flip of [false, true]) {
      ctx.save();
      if (flip) { ctx.translate(w, 0); ctx.scale(-1, 1); }
      ctx.fillStyle = C.orange;
      ctx.beginPath(); ctx.moveTo(0, h * .1); ctx.bezierCurveTo(w * .12, h * .2, w * .19, h * .62, w * .23, h); ctx.lineTo(0, h); ctx.fill();
      ctx.fillStyle = C.orangeDeep;
      ctx.beginPath(); ctx.moveTo(0, h * .46); ctx.bezierCurveTo(w * .07, h * .52, w * .11, h * .78, w * .13, h); ctx.lineTo(0, h); ctx.fill();
      ctx.strokeStyle = C.navy; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(0, h * .02); ctx.bezierCurveTo(w * .13, h * .1, w * .21, h * .55, w * .255, h * .98); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = C.navy; ctx.fillRect(w * .24, h * .9, w * .52, h * .045);
    // Marcado de contorno reflectante amarillo (segmentado), obligatorio en remolques.
    ctx.fillStyle = '#f4c21b';
    for (let x = 18; x < w - 40; x += 70) { ctx.fillRect(x, h - 14, 44, 10); ctx.fillRect(x, 4, 44, 10); }
    if (logoImage) {
      const lw = w * .4, lh = lw * logoImage.height / logoImage.width;
      ctx.drawImage(logoImage, w * .3, h * .1, lw, Math.min(lh, h * .74));
    }
    ctx.fillStyle = C.navy; ctx.textAlign = 'center';
    ctx.font = "700 34px 'Nunito', 'Arial', sans-serif";
    ctx.fillText('captotal.com', w / 2, h * .885);
    livery.needsUpdate = true;
  }
  const roofText = canvasTexture(1024, 256, () => {}, { wrap: false, anisotropy: 8 });
  function drawRoofText() {
    const ctx = roofText.image.getContext('2d');
    ctx.clearRect(0, 0, 1024, 256);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = "700 150px 'League Spartan', 'Arial Black', sans-serif";
    ctx.fillStyle = C.ivory; ctx.fillText('CAP', 300, 138);
    ctx.fillStyle = C.navy; ctx.fillText('TOTAL', 680, 138);
    roofText.needsUpdate = true;
  }
  const plate = canvasTexture(520, 110, (ctx, w, h) => {
    ctx.fillStyle = '#f7f7f2'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1f47a8'; ctx.fillRect(0, 0, 62, h);
    ctx.fillStyle = '#ffd43b';
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(31 + Math.cos(a) * 17, 34 + Math.sin(a) * 17, 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffffff'; ctx.font = '700 34px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('E', 31, 94);
    ctx.fillStyle = '#16191d'; ctx.font = '700 78px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('1987 CPT', 292, 60);
    ctx.strokeStyle = '#16191d'; ctx.lineWidth = 5; ctx.strokeRect(2, 2, w - 4, h - 4);
  }, { wrap: false });
  drawLivery(); drawRoofText();
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => { if (disposed) return; logoImage = image; drawLivery(); invalidate(); };
  image.src = logoUrl;
  document.fonts?.load("700 150px 'League Spartan'").then(() => { if (!disposed) { drawRoofText(); drawLivery(); invalidate(); } }).catch(() => {});
  const liveryMaterial = new THREE.MeshPhysicalMaterial({ map: livery, roughness: .36, clearcoat: .6, clearcoatRoughness: .2, polygonOffset: true, polygonOffsetFactor: -2 });
  const roofTextMaterial = new THREE.MeshStandardMaterial({ map: roofText, transparent: true, roughness: .4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const plateMaterial = new THREE.MeshStandardMaterial({ map: plate, roughness: .45 });

  // ---- Cabina (pivota ligeramente sobre su suspensión) --------------------------------------
  const CAB_PIVOT = [0, 1.25, 1.6];
  const cab = new THREE.Group(); cab.position.set(...CAB_PIVOT); truck.add(cab);
  const m = new Merger();
  m.push([-CAB_PIVOT[0], -CAB_PIVOT[1], -CAB_PIVOT[2]]);
  const shell = new THREE.Shape();
  shell.moveTo(1.17, 1.4); shell.lineTo(3.2, 1.4); shell.lineTo(3.07, 3.05);
  shell.quadraticCurveTo(3.045, 3.36, 2.74, 3.36); shell.lineTo(1.42, 3.36);
  shell.quadraticCurveTo(1.17, 3.36, 1.17, 3.11); shell.closePath();
  m.add(sideExtrude(shell, 2.5, .13, 24), 'paint', C.orange);
  // Faldón lateral con paso de rueda real, como piezas finas para que el hueco quede oscuro.
  const archR = .69, sill = .76, archA = Math.asin((sill - .52) / archR);
  const skirt = new THREE.Shape();
  skirt.moveTo(1.1, sill); skirt.lineTo(FRONT_AXLE - Math.cos(archA) * archR, sill);
  skirt.absarc(FRONT_AXLE, .52, archR, Math.PI - archA, archA, true);
  skirt.lineTo(3.18, sill); skirt.lineTo(3.18, 1.46); skirt.lineTo(1.1, 1.46); skirt.closePath();
  for (const s of [-1, 1]) {
    m.push([s * 1.18, 0, 0]); m.add(sideExtrude(skirt, .14, .035, 28), 'paint', C.orange); m.pop();
    const trim = new THREE.TorusGeometry(.66, .05, 8, 30, Math.PI - archA * 2);
    m.add(trim, 'plastic', C.black, [s * 1.235, .52, FRONT_AXLE], [0, Math.PI / 2, archA, 'YXZ']);
  }
  m.box([2.2, .5, 2.05], [0, 1.18, 2.15], C.black, 'plastic');
  // Frontal: rejilla, parabrisas, parasol y deflectores de esquina.
  const rake = [-RAKE, 0, 0];
  m.box([1.78, .74, .06], [0, 1.66, frontZ(1.66) + .015], C.black, 'plastic', rake, .05);
  for (let i = 0; i < 5; i++) m.box([1.66, .045, .04], [0, 1.4 + i * .13, frontZ(1.4 + i * .13) + .05], i === 2 ? C.chrome : '#3a4550', i === 2 ? 'metal' : 'plastic', rake, .015);
  m.box([.42, .1, .03], [0, 2.02, frontZ(2.02) + .055], C.chrome, 'metal', rake, .03);
  m.box([2.3, 1.0, .03], [0, 2.6, frontZ(2.6) + .004], C.black, 'plastic', rake, .1);
  m.box([2.18, .9, .035], [0, 2.6, frontZ(2.6) + .02], C.glassTint, 'glass', rake, .08);
  m.box([2.42, .05, .34], [0, 3.17, frontZ(3.1) + .1], C.navy, 'satin', [.22, 0, 0], .02);
  for (const s of [-1, 1]) {
    m.box([.86, .026, .022], [s * .47, 2.19, frontZ(2.19) + .045], C.black, 'plastic', [-RAKE, 0, s * .06], .01);
    m.box([.05, .8, .22], [s * 1.255, 2.6, frontZ(2.6) - .06], C.glass, 'glass', [0, s * .28, 0], .02);
    // Retrovisores principal y gran angular sobre brazo.
    m.tube([[s * 1.17, 3.02, frontZ(3.02) - .1], [s * 1.38, 3.1, frontZ(3.0) + .04], [s * 1.54, 3.0, frontZ(3.0) + .02], [s * 1.56, 2.86, frontZ(2.9)]], .022, C.plastic, 'plastic', 16, 6);
    m.box([.03, .9, .03], [s * 1.56, 2.42, frontZ(2.4) - .02], C.plastic, 'plastic', undefined, .01);
    m.box([.11, .52, .27], [s * 1.6, 2.62, frontZ(2.6) - .03], C.plastic, 'plastic', [0, s * .1, 0], .045);
    m.box([.09, .46, .02], [s * 1.6, 2.62, frontZ(2.6) - .165], C.chrome, 'metal', [0, s * .1, 0], .01);
    m.box([.1, .24, .24], [s * 1.58, 2.2, frontZ(2.2) - .03], C.plastic, 'plastic', [0, s * .1, 0], .04);
    // Ventanilla lateral con ventana de visión baja (peeper).
    const pane = new THREE.Shape();
    pane.moveTo(1.5, 2.24); pane.lineTo(2.5, 2.24); pane.lineTo(2.66, 1.95); pane.lineTo(frontZ(1.95) - .2, 1.95);
    pane.lineTo(frontZ(3.0) - .24, 3.0); pane.quadraticCurveTo(frontZ(3.1) - .27, 3.12, 2.72, 3.12);
    pane.lineTo(1.64, 3.12); pane.quadraticCurveTo(1.5, 3.12, 1.5, 2.98); pane.closePath();
    m.push([s * 1.252, 0, 0]); m.add(fitUV(sideExtrude(pane, .02, 0)), 'glass', C.glassTint); m.pop();
    m.box([.012, 1.78, .025], [s * 1.252, 2.35, 1.44], C.black, 'plastic');
    m.box([.012, .5, .025], [s * 1.252, 1.7, frontZ(1.7) - .2], C.black, 'plastic');
    m.box([.035, .05, .24], [s * 1.262, 2.06, 1.66], C.chrome, 'metal', undefined, .02);
    m.tube([[s * 1.27, 1.55, 1.3], [s * 1.3, 1.6, 1.3], [s * 1.3, 2.85, 1.3], [s * 1.27, 2.9, 1.3]], .018, C.chrome, 'metal', 12, 6);
    m.box([.02, .06, .14], [s * 1.232, 1.12, 2.98], C.amber, 'lamp');
    // Escalones de acceso tras el paso de rueda.
    m.box([.03, .12, .4], [s * 1.25, 1.05, 1.33], C.black, 'plastic', undefined, .02);
    m.box([.05, .03, .4], [s * 1.255, .99, 1.33], C.alu, 'metal');
    m.box([.34, .05, .42], [s * 1.08, .5, 1.33], C.alu, 'metal', undefined, .015);
    m.box([.04, .3, .04], [s * 1.2, .66, 1.16], C.black, 'plastic');
    m.box([.04, .3, .04], [s * 1.2, .66, 1.5], C.black, 'plastic');
    // Extensores laterales hacia el semirremolque.
    m.box([.05, 1.95, .44], [s * 1.25, 2.38, 1.0], C.orange, 'paint', [0, s * .1, 0], .02);
    m.box([.03, .07, .07], [s * 1.06, 3.37, 2.88], C.amber, 'lamp');
  }
  // Paragolpes con grupos ópticos integrados.
  m.box([2.5, .62, .38], [0, .8, 3.2], C.plastic, 'satin', undefined, .14);
  m.box([2.3, .1, .3], [0, .46, 3.18], C.black, 'plastic', undefined, .04);
  for (const s of [-1, 1]) {
    m.box([.66, .26, .06], [s * .76, .88, 3.375], '#141a20', 'glass', undefined, .06);
    m.box([.52, .035, .02], [s * .74, .97, 3.405], C.light, 'lamp', undefined, .01);
    for (const x of [.58, .8]) m.cylinder(.068, .068, .03, [s * x, .85, 3.4], '#f3f6f8', 'metal', [Math.PI / 2, 0, 0], 18);
    for (const x of [.58, .8]) m.cylinder(.04, .04, .032, [s * x, .85, 3.405], C.light, 'lamp', [Math.PI / 2, 0, 0], 14);
    m.box([.12, .17, .03], [s * 1.08, .88, 3.39], C.amber, 'lamp', undefined, .02);
    m.cylinder(.05, .05, .03, [s * .95, .6, 3.37], '#dfe5e8', 'metal', [Math.PI / 2, 0, 0], 14);
  }
  // Deflector de techo con su rotulación.
  const deflector = new THREE.Shape();
  deflector.moveTo(2.66, 3.4); deflector.lineTo(1.66, 3.96); deflector.lineTo(1.2, 3.96); deflector.lineTo(1.2, 3.4); deflector.closePath();
  m.add(sideExtrude(deflector, 2.42, .07, 4), 'paint', C.orange);
  m.pop();
  const cabMesh = m.build(materials, { cast: true });
  cab.add(cabMesh);
  const slope = Math.atan2(3.96 - 3.4, 2.66 - 1.66);
  const roofSign = new THREE.Mesh(new THREE.PlaneGeometry(2.0, .5), roofTextMaterial);
  roofSign.rotation.x = -(Math.PI / 2 - slope);
  roofSign.position.set(0, (3.4 + 3.96) / 2 + .07 * Math.cos(slope) + .004 - CAB_PIVOT[1], (2.66 + 1.66) / 2 + .07 * Math.sin(slope) - CAB_PIVOT[2]);
  roofSign.renderOrder = 2;
  cab.add(roofSign);
  const plateMesh = new THREE.Mesh(new THREE.PlaneGeometry(.52, .11), plateMaterial);
  plateMesh.position.set(0, .64 - CAB_PIVOT[1], 3.395 - CAB_PIVOT[2]);
  cab.add(plateMesh);
  const doorBadges = new Merger();
  for (const s of [-1, 1]) {
    doorBadges.add(decal(.86, .34, logoRegion, .06), 'livery', '#ffffff', [s * 1.262 - CAB_PIVOT[0], 1.72 - CAB_PIVOT[1], 2.04 - CAB_PIVOT[2]], [0, s * Math.PI / 2, 0]);
  }
  cab.add(doorBadges.build({ livery: liveryMaterial }));

  // ---- Bastidor y tren de rodaje de la tractora ---------------------------------------------
  const chassis = new Merger();
  for (const s of [-1, 1]) {
    chassis.box([.12, .3, 6.5], [s * .44, .86, -.1], C.black, 'plastic');
    chassis.add(arcBand(.6, .665, .2, Math.PI - .05, .72), 'plastic', C.black, [s * .95, WHEEL_R, REAR_AXLE]);
    chassis.box([.66, .58, .025], [s * .95, .48, REAR_AXLE - .78], C.black, 'plastic', [.08, 0, 0], .01);
  }
  chassis.cylinder(.31, .31, 1.5, [1.0, .73, -.12], C.alu, 'metal', [Math.PI / 2, 0, 0], 28);
  for (const z of [-.6, .36]) chassis.cylinder(.318, .318, .05, [1.0, .73, z], C.black, 'plastic', [Math.PI / 2, 0, 0], 28);
  chassis.cylinder(.06, .06, .05, [1.0, 1.05, .3], C.chrome, 'metal', undefined, 12);
  chassis.box([.5, .52, .9], [-.98, .72, -.15], C.black, 'plastic', undefined, .04);
  chassis.cylinder(.13, .13, 1.0, [-.92, .5, .55], '#7f8a92', 'metal', [Math.PI / 2, 0, 0], 16);
  chassis.box([1.0, .08, 1.0], [0, 1.08, -1.32], C.black, 'plastic', undefined, .02);
  chassis.box([.95, .05, .45], [0, 1.42, .72], C.alu, 'metal');
  // Espirales de aire y eléctricas entre cabina y semirremolque.
  for (const [offset, tint] of [[-.16, C.red], [.0, '#2f6fb5'], [.16, '#e6b422']]) {
    const points = [];
    for (let i = 0; i <= 90; i++) {
      const t = i / 90, a = t * Math.PI * 20;
      points.push([offset + Math.cos(a) * .045, THREE.MathUtils.lerp(2.3, 1.55, t) + Math.sin(a) * .045 - Math.sin(t * Math.PI) * .18, THREE.MathUtils.lerp(1.0, -.1, t)]);
    }
    chassis.tube(points, .011, tint, 'satin', 200, 4);
  }
  truck.add(chassis.build(materials, { cast: true }));

  // ---- Semirremolque -------------------------------------------------------------------------
  const KINGPIN = [0, 1.15, -1.32];
  const trailer = new THREE.Group(); trailer.position.set(...KINGPIN); truck.add(trailer);
  const t = new Merger();
  t.push([-KINGPIN[0], -KINGPIN[1], -KINGPIN[2]]);
  const boxFront = -.16, boxLength = 13.6, boxMid = boxFront - boxLength / 2;
  t.box([2.55, 2.76, boxLength], [0, 2.65, boxMid], C.ivory, 'paint', undefined, .08);
  t.box([2.6, .2, boxLength + .02], [0, 1.27, boxMid], C.alu, 'metal', undefined, .03);
  t.box([2.6, .08, boxLength + .02], [0, 4.02, boxMid], C.alu, 'metal', undefined, .02);
  for (const s of [-1, 1]) for (const z of [boxFront - .02, boxFront - boxLength + .02]) t.box([.07, 2.8, .07], [s * 1.285, 2.65, z], C.alu, 'metal', undefined, .02);
  for (const s of [-1, 1]) {
    t.box([.12, .34, 12.6], [s * .5, .98, boxMid - .3], C.black, 'plastic');
    t.box([.13, .62, .13], [s * .95, .74, -2.7], C.black, 'plastic');
    t.box([.1, .32, .1], [s * .95, .34, -2.7], '#4b5660', 'plastic');
    t.box([.26, .04, .26], [s * .95, .17, -2.7], C.black, 'plastic');
    for (const y of [.62, .95]) t.box([.045, .1, 6.4], [s * 1.2, y, -6.2], '#9ba6ae', 'metal', undefined, .02);
    for (const z of [-3.2, -6.2, -9.2]) t.box([.42, .5, .07], [s * 1.0, .82, z], C.black, 'plastic');
    for (const z of TRAILER_AXLES) t.add(arcBand(.58, .63, .25, Math.PI - .25, .5), 'plastic', C.black, [s * 1.03, WHEEL_R, z]);
    t.box([.5, .5, .025], [s * 1.03, .45, -13.22], C.black, 'plastic', [.06, 0, 0], .01);
    for (let z = -.9; z > -13.4; z -= 2.1) t.box([.025, .055, .11], [s * 1.31, 1.2, z], C.amber, 'lamp', undefined, .01);
    // Grupo óptico trasero.
    t.box([.62, .18, .06], [s * .92, .82, -13.79], '#141a20', 'plastic', undefined, .03);
    t.box([.24, .12, .02], [s * 1.04, .82, -13.82], C.red, 'lamp');
    t.box([.14, .12, .02], [s * .8, .82, -13.82], C.amber, 'lamp');
  }
  t.box([1.3, .1, .05], [-.02, 1.68, -13.78], C.black, 'plastic');
  t.box([.04, 2.6, .03], [0, 2.65, -13.775], '#d7d4ca', 'satin');
  t.box([2.4, .13, .13], [0, .56, -13.62], '#9ba6ae', 'metal', undefined, .03);
  t.pop();
  trailer.add(t.build(materials, { cast: true }));
  const liveryGeometry = new Merger();
  for (const s of [-1, 1]) {
    liveryGeometry.add(new THREE.PlaneGeometry(13.36, 2.55), 'livery', '#ffffff', [s * 1.283, 2.66 - KINGPIN[1], boxMid - KINGPIN[2]], [0, s * Math.PI / 2, 0]);
  }
  trailer.add(liveryGeometry.build({ livery: liveryMaterial }, { cast: false }));

  // ---- Ruedas (instanciadas) ----------------------------------------------------------------
  const wheels = [];
  for (const s of [-1, 1]) {
    wheels.push({ p: [s * 1.04, WHEEL_R, FRONT_AXLE], s, w: 1, rim: C.chrome });
    wheels.push({ p: [s * 1.1, WHEEL_R, REAR_AXLE], s, w: 1, rim: '#e9ecef' });
    wheels.push({ p: [s * .78, WHEEL_R, REAR_AXLE], s, w: 1, rim: null });
    for (const z of TRAILER_AXLES) wheels.push({ p: [s * 1.03, WHEEL_R, z], s, w: 1.25, rim: C.alu });
  }
  const tyreMaterial = new THREE.MeshStandardMaterial({ color: '#25292e', roughness: .9 });
  const tyres = new THREE.InstancedMesh(tyreGeometry(), tyreMaterial, wheels.length);
  const rimWheels = wheels.filter(wheel => wheel.rim);
  const rimMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .22, metalness: .85 });
  const rims = new THREE.InstancedMesh(rimGeometry(), rimMaterial, rimWheels.length);
  rimWheels.forEach((wheel, i) => rims.setColorAt(i, new THREE.Color(wheel.rim)));
  for (const mesh of [tyres, rims]) { mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; truck.add(mesh); }
  const flip = new THREE.Matrix4().makeRotationY(Math.PI), spin = new THREE.Matrix4(), place = new THREE.Matrix4(), scaled = new THREE.Matrix4(), widen = new THREE.Matrix4();
  function placeWheels(angle) {
    spin.makeRotationX(angle);
    let rimIndex = 0;
    wheels.forEach((wheel, i) => {
      place.makeTranslation(...wheel.p).multiply(spin);
      if (wheel.s < 0) place.multiply(flip);
      tyres.setMatrixAt(i, scaled.copy(place).multiply(widen.makeScale(wheel.w, 1, 1)));
      if (wheel.rim) rims.setMatrixAt(rimIndex++, place);
    });
    tyres.instanceMatrix.needsUpdate = true; rims.instanceMatrix.needsUpdate = true;
  }
  placeWheels(0);

  // Sombras de contacto suaves bajo tractora y semirremolque.
  const shadowTexture = contactShadowTexture();
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .85 });
  for (const [length, z] of [[7.4, .7], [15.5, -7.1]]) {
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, length), shadowMaterial);
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, .015, z); shadow.renderOrder = 1; truck.add(shadow);
  }

  return {
    group: truck,
    update(elapsed, distance) {
      placeWheels(distance / WHEEL_R);
      cab.rotation.x = Math.sin(elapsed * 2.1) * .004 + Math.sin(elapsed * 5.3) * .0015;
      cab.rotation.z = Math.sin(elapsed * 1.3) * .004;
      cab.position.y = CAB_PIVOT[1] + Math.sin(elapsed * 4.4) * .006;
      trailer.rotation.z = Math.sin(elapsed * 1.1 + .6) * .0025;
      trailer.rotation.y = Math.sin(elapsed * .37) * .0015;
    },
    dispose() { disposed = true; image.onload = null; },
  };
}
