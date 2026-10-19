import * as THREE from 'three';
import { canvasTexture } from './truck-kit.js';

// Manzanas del Eixample: planta octogonal con chaflanes, fachadas texturizadas y balcones en relieve.
export const BAY = 3.3;
export const FLOORS = 5, GROUND = 4.6, STOREY = 3.3, PARAPET = 1.1;
export const HEIGHT = GROUND + FLOORS * STOREY + PARAPET;
const PX = 64;

export function facadeTexture() {
  const width = 256, height = Math.round(HEIGHT * PX);
  return canvasTexture(width, height, (ctx, w, h) => {
    const y = metres => h - metres * PX;
    const px = metres => metres / BAY * w;
    ctx.fillStyle = '#f6f1e8'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(${120 + Math.random() * 60},${100 + Math.random() * 40},80,${Math.random() * .05})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }
    // Planta baja: almohadillado, escaparate y rótulo.
    ctx.fillStyle = '#e5ddcf'; ctx.fillRect(0, y(GROUND), w, GROUND * PX);
    ctx.fillStyle = 'rgba(90,80,70,.18)';
    for (let m = .5; m < GROUND; m += .5) ctx.fillRect(0, y(m), w, 2);
    ctx.fillStyle = '#2b3a44'; ctx.fillRect(px(.45), y(3.2), px(2.4), 3.2 * PX);
    const glass = ctx.createLinearGradient(0, y(3.2), w, y(0));
    glass.addColorStop(0, 'rgba(160,200,215,.55)'); glass.addColorStop(.5, 'rgba(60,80,95,.1)'); glass.addColorStop(1, 'rgba(160,200,215,.3)');
    ctx.fillStyle = glass; ctx.fillRect(px(.45), y(3.2), px(2.4), 3.2 * PX);
    ctx.fillStyle = '#d8cfbf'; ctx.fillRect(px(.45), y(3.2), px(2.4), 6); ctx.fillRect(px(1.62), y(3.2), 5, 3.2 * PX);
    ctx.fillStyle = '#cfc4b2'; ctx.fillRect(0, y(GROUND), w, 10);
    // Plantas: balconera con persiana de librillo verde, recercado y línea de forjado.
    for (let f = 0; f < FLOORS; f++) {
      const base = GROUND + f * STOREY;
      ctx.fillStyle = 'rgba(120,100,80,.16)'; ctx.fillRect(0, y(base + .05), w, 5);
      const left = px(1.0), right = px(2.3), top = y(base + 2.55), bottom = y(base + .12);
      ctx.fillStyle = '#e9e1d2'; ctx.fillRect(left - 10, top - 14, right - left + 20, bottom - top + 14);
      ctx.fillStyle = '#203039'; ctx.fillRect(left, top, right - left, bottom - top);
      const blind = f % 2 ? .55 : .35;
      ctx.fillStyle = '#4f7a5c'; ctx.fillRect(left, top, right - left, (bottom - top) * blind);
      ctx.fillStyle = 'rgba(25,45,32,.45)';
      for (let k = top + 4; k < top + (bottom - top) * blind; k += 6) ctx.fillRect(left, k, right - left, 2);
      ctx.fillStyle = '#d4c9b5'; ctx.fillRect(left - 14, top - 24, right - left + 28, 10);
      ctx.fillStyle = '#7d9cab'; ctx.globalAlpha = .35; ctx.fillRect(left + 6, top + (bottom - top) * blind + 4, (right - left) / 2 - 8, (bottom - top) * (1 - blind) - 8); ctx.globalAlpha = 1;
    }
    // Cornisa y antepecho de azotea.
    const roof = GROUND + FLOORS * STOREY;
    ctx.fillStyle = '#d3c7b2'; ctx.fillRect(0, y(roof + .3), w, .3 * PX);
    ctx.fillStyle = 'rgba(80,70,60,.25)'; ctx.fillRect(0, y(roof + .02), w, 6);
    ctx.fillStyle = '#ece5d8'; ctx.fillRect(0, y(HEIGHT), w, (PARAPET - .3) * PX);
    ctx.fillStyle = 'rgba(110,95,80,.35)';
    for (let k = 0; k < 4; k++) ctx.fillRect(px(.25 + k * .82), y(HEIGHT - .25), 12, (PARAPET - .6) * PX);
  }, { anisotropy: 8 });
}

export function railingTexture(color = '#26313a') {
  return canvasTexture(256, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, 12); ctx.fillRect(0, h - 10, w, 10);
    for (let x = 6; x < w; x += 18) ctx.fillRect(x, 0, 4, h);
    ctx.lineWidth = 4; ctx.strokeStyle = color;
    for (let x = 0; x < w; x += 64) { ctx.beginPath(); ctx.arc(x + 32, h / 2, 18, 0, Math.PI * 2); ctx.stroke(); }
  }, { anisotropy: 8 });
}

// Muro vertical con UV en metros/BAY para repetir la textura por crujías.
function wall(ax, az, bx, bz, height, uStart = 0) {
  const length = Math.hypot(bx - ax, bz - az);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([ax, 0, az, bx, 0, bz, bx, height, bz, ax, height, az], 3));
  const nx = (bz - az) / length, nz = -(bx - ax) / length;
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute([nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz], 3));
  const u1 = uStart + length / BAY;
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([uStart, 0, u1, 0, u1, height / HEIGHT, uStart, height / HEIGHT], 2));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  return { geometry, length, normal: [nx, nz] };
}

// Bloque octogonal: x0 = fachada a la calle, profundidad hacia +x, centrado en z.
export function eixampleBlock(m, { x0, depth = 30, length = 34, chamfer = 6, tint, rng, details = true }) {
  const z0 = -length / 2, z1 = length / 2, x1 = x0 + depth;
  // Recorrido antihorario visto desde arriba para que las normales miren hacia fuera.
  const outline = [[x0, z1 - chamfer], [x0, z0 + chamfer], [x0 + chamfer, z0], [x1 - chamfer, z0], [x1, z0 + chamfer], [x1, z1 - chamfer], [x1 - chamfer, z1], [x0 + chamfer, z1]];
  const visible = new Set([0, 6, 7]);
  const awnings = ['#2f6f58', '#b8462f', '#253342', '#f97316', '#3d6f99', '#7b4a3a'];
  for (let i = 0; i < outline.length; i++) {
    const [ax, az] = outline[i], [bx, bz] = outline[(i + 1) % outline.length];
    const { geometry, length: span, normal } = wall(ax, az, bx, bz, HEIGHT);
    m.add(geometry, 'facade', tint);
    if (!details || !visible.has(i)) continue;
    const bays = Math.floor(span / BAY);
    const angle = Math.atan2(normal[0], normal[1]);
    for (let b = 0; b < bays; b++) {
      const t = (b + .5) * BAY / span;
      const cx = ax + (bx - ax) * t + normal[0] * .02, cz = az + (bz - az) * t + normal[1] * .02;
      m.push([cx, 0, cz], [0, angle, 0]);
      // Balcones de losa con barandilla de forja.
      for (let f = 0; f < FLOORS; f++) {
        const base = GROUND + f * STOREY, wide = f === 0 ? 2.6 : 1.7;
        m.box([wide, .14, .62], [0, base + .02, .31], '#e2d8c6', 'satin');
        m.add(new THREE.PlaneGeometry(wide - .06, .95), 'railing', '#ffffff', [0, base + .56, .6]);
        for (const s of [-1, 1]) m.add(new THREE.PlaneGeometry(.58, .95), 'railing', '#ffffff', [s * (wide / 2 - .03), base + .56, .31], [0, Math.PI / 2, 0]);
      }
      if (rng() < .55) {
        const color = rng.pick(awnings);
        m.box([2.5, .05, 1.25], [0, 3.55, .62], color, 'satin', [.42, 0, 0]);
        m.box([2.5, .22, .03], [0, 3.32, 1.2], color, 'satin');
      }
      m.pop();
    }
  }
  return outline;
}
