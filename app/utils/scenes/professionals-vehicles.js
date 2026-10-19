import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { Parts, M, lathe, canvasTexture } from './professionals-kit.js'

const BRAND = { orange: '#f97316', navy: '#253342', ivory: '#f4f1e8' }
const rbox = (w, h, d, r = .05, s = 3) => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2.01, h / 2.01, d / 2.01))

export function vehicleKit(mat) {
  const paint = color => mat(color, { roughness: .34, metalness: .05 })
  const m = {
    orange: paint(BRAND.orange), navy: paint(BRAND.navy), ivory: paint(BRAND.ivory), blue: paint('#4f8fb0'), white: paint('#f7f6f1'),
    glass: mat('#1d3440', { roughness: .1, metalness: .3 }),
    rubber: mat('#1c2227', { roughness: .85 }), hub: mat('#b9c3c8', { roughness: .3, metalness: .75 }),
    chrome: mat('#dde3e6', { roughness: .18, metalness: .9 }), trim: mat('#2b343b', { roughness: .6 }),
    head: mat('#fff7dd', { emissive: '#ffe7b0', emissiveIntensity: .9, roughness: .3 }),
    tail: mat('#d13b2f', { emissive: '#b3261c', emissiveIntensity: .5, roughness: .35 }),
    amber: mat('#ffb347', { emissive: '#ff9d1f', emissiveIntensity: .7, roughness: .3 }),
    tank: mat('#d9e0e3', { roughness: .22, metalness: .85 }),
  }
  const tyre = lathe([[.1, -.06], [.155, -.06], [.172, -.045], [.178, -.02], [.178, .02], [.172, .045], [.155, .06], [.1, .06]], 28)
  tyre.rotateZ(Math.PI / 2)
  const hub = new THREE.CylinderGeometry(.095, .095, .125, 20); hub.rotateZ(Math.PI / 2)
  const cap = new THREE.CylinderGeometry(.035, .035, .135, 12); cap.rotateZ(Math.PI / 2)
  function wheels(parts, axles, half = .3, y = .18) {
    for (const z of axles) for (const side of [-1, 1]) {
      parts.add(tyre.clone(), m.rubber, M([side * half, y, z]))
      parts.add(hub.clone(), m.hub, M([side * (half + .004), y, z]))
      parts.add(cap.clone(), m.trim, M([side * (half + .008), y, z]))
    }
  }
  function lights(parts, front, rear, width = .5, y = .3) {
    for (const side of [-1, 1]) {
      parts.add(rbox(.11, .055, .03, .015), m.head, M([side * width / 2, y, front]))
      parts.add(rbox(.07, .09, .03, .015), m.tail, M([side * width / 2, y + .04, rear]))
      parts.add(rbox(.04, .03, .03, .01), m.amber, M([side * (width / 2 + .06), y, front - .005]))
    }
  }
  // Ventanillas laterales en banda con montantes.
  function windowBand(parts, length, y, h, zFrom, color) {
    for (const side of [-1, 1]) {
      parts.add(rbox(.02, h, length, .01), m.glass, M([side * .335, y, zFrom - length / 2]))
      const n = Math.max(2, Math.round(length / .3))
      for (let i = 0; i <= n; i++) parts.add(rbox(.024, h + .01, .035, .008), color, M([side * .338, y, zFrom - i * length / n]))
    }
  }
  return { m, wheels, lights, windowBand, dispose() { tyre.dispose(); hub.dispose(); cap.dispose() } }
}

function sideText(text, bg, fg, accent) {
  return canvasTexture(512, 160, (ctx, w, h) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = accent; ctx.fillRect(0, h - 26, w, 26)
    ctx.textBaseline = 'middle'; ctx.font = '900 92px "League Spartan", "Nunito", sans-serif'
    const capW = ctx.measureText('CAP').width
    ctx.fillStyle = accent; ctx.fillText('CAP', 36, h / 2 - 8)
    ctx.fillStyle = fg; ctx.fillText(text, 48 + capW, h / 2 - 8)
  })
}

export function buildBus(kit, color = 'orange') {
  const { m } = kit, body = m[color]
  const v = new THREE.Group(); v.name = 'city-bus'
  const p = new Parts(), L = 1.75
  p.add(rbox(.66, .64, L, .1, 4), body, M([0, .53, 0]))
  p.add(rbox(.68, .13, L - .04, .04), m.navy, M([0, .27, 0]))
  p.add(rbox(.5, .08, .55, .04), m.white, M([0, .88, -.15]))
  kit.windowBand(p, L - .5, .63, .26, L / 2 - .32, body)
  p.add(rbox(.6, .4, .03, .03), m.glass, M([0, .6, L / 2 + .002], [-.05, 0, 0]))
  p.add(rbox(.42, .07, .02, .015), m.amber, M([0, .81, L / 2 + .01]))
  p.add(rbox(.5, .3, .02, .02), m.glass, M([0, .66, -L / 2 - .002]))
  for (const z of [L / 2 - .38, -.12]) p.add(rbox(.02, .44, .24, .015), m.glass, M([-.338, .5, z]))
  p.add(rbox(.6, .08, .05, .02), m.trim, M([0, .24, L / 2 + .015]))
  p.add(rbox(.69, .035, L - .2, .015), m.white, M([0, .4, 0]))
  kit.lights(p, L / 2 + .012, -L / 2 - .012, .48, .33)
  for (const side of [-1, 1]) p.add(rbox(.04, .1, .06, .02), m.trim, M([side * .37, .72, L / 2 - .05]))
  kit.wheels(p, [L / 2 - .35, -L / 2 + .38], .3)
  p.build(v)
  return v
}

export function buildArticulated(kit) {
  const { m } = kit
  const make = (length, front) => {
    const g = new THREE.Group(), p = new Parts()
    p.add(rbox(.66, .64, length, .1, 4), m.blue, M([0, .53, 0]))
    p.add(rbox(.68, .13, length - .04, .04), m.navy, M([0, .27, 0]))
    p.add(rbox(.69, .035, length - .12, .015), m.white, M([0, .4, 0]))
    kit.windowBand(p, length - .2, .63, .26, length / 2 - .1, m.blue)
    p.add(rbox(.42, .07, .4, .03), m.white, M([0, .88, 0]))
    if (front) {
      p.add(rbox(.6, .4, .03, .03), m.glass, M([0, .6, length / 2 + .002], [-.05, 0, 0]))
      p.add(rbox(.42, .07, .02, .015), m.amber, M([0, .81, length / 2 + .01]))
      p.add(rbox(.6, .08, .05, .02), m.trim, M([0, .24, length / 2 + .015]))
      for (const side of [-1, 1]) {
        p.add(rbox(.11, .055, .03, .015), m.head, M([side * .24, .33, length / 2 + .012]))
        p.add(rbox(.04, .1, .06, .02), m.trim, M([side * .37, .72, length / 2 - .05]))
      }
      kit.wheels(p, [length / 2 - .3, -length / 2 + .25], .3)
    } else {
      for (const side of [-1, 1]) p.add(rbox(.07, .09, .03, .015), m.tail, M([side * .24, .37, -length / 2 - .012]))
      p.add(rbox(.5, .3, .02, .02), m.glass, M([0, .66, -length / 2 - .002]))
      kit.wheels(p, [-length / 2 + .3], .3)
    }
    p.build(g)
    return g
  }
  const front = make(1.05, true), rear = make(.9, false)
  const bellows = new THREE.Group(), bp = new Parts()
  for (let i = 0; i < 6; i++) bp.add(rbox(.6, .56, .03, .015), i % 2 ? m.trim : m.rubber, M([0, .55, -.075 + i * .03]))
  bp.build(bellows)
  return { front, rear, bellows }
}
export function buildBoxTruck(kit, texture) {
  const { m } = kit
  const livery = new THREE.MeshStandardMaterial({ map: texture, roughness: .5 })
  const v = new THREE.Group(); v.name = 'box-truck'
  const p = new Parts()
  p.add(rbox(.6, .14, 1.7, .03), m.trim, M([0, .26, -.05]))
  p.add(rbox(.66, .56, .52, .1, 4), m.orange, M([0, .6, .62]))
  p.add(rbox(.66, .1, .4, .05), m.orange, M([0, .92, .58]))
  p.add(rbox(.56, .25, .03, .03), m.glass, M([0, .7, .882], [-.06, 0, 0]))
  for (const side of [-1, 1]) p.add(rbox(.02, .2, .26, .02), m.glass, M([side * .332, .7, .64]))
  p.add(rbox(.34, .1, .02, .02), m.trim, M([0, .44, .885]))
  p.add(rbox(.64, .07, .04, .02), m.chrome, M([0, .3, .87]))
  p.add(rbox(.72, .7, 1.1, .05, 3), m.ivory, M([0, .72, -.3]))
  p.add(rbox(.73, .05, 1.08, .02), m.orange, M([0, .4, -.3]))
  for (const side of [-1, 1]) {
    p.add(new THREE.PlaneGeometry(1.0, .31), livery, M([side * .3615, .76, -.3], [0, side * Math.PI / 2, 0]))
    p.add(rbox(.04, .1, .05, .02), m.trim, M([side * .36, .72, .86]))
  }
  kit.lights(p, .885, -.86, .48, .34)
  kit.wheels(p, [.6, -.62], .29)
  p.build(v)
  return v
}

export function buildTanker(kit) {
  const { m } = kit
  const v = new THREE.Group(); v.name = 'tanker-truck'
  const p = new Parts()
  p.add(rbox(.6, .14, 1.7, .03), m.trim, M([0, .26, -.05]))
  p.add(rbox(.66, .56, .5, .1, 4), m.navy, M([0, .6, .64]))
  p.add(rbox(.66, .1, .38, .05), m.navy, M([0, .92, .6]))
  p.add(rbox(.56, .25, .03, .03), m.glass, M([0, .7, .892], [-.06, 0, 0]))
  for (const side of [-1, 1]) p.add(rbox(.02, .2, .25, .02), m.glass, M([side * .332, .7, .66]))
  p.add(rbox(.2, .12, .02, .015), m.orange, M([0, .43, .896]))
  p.add(rbox(.64, .07, .04, .02), m.chrome, M([0, .3, .88]))
  const tank = new THREE.CapsuleGeometry(.31, .7, 10, 28); tank.rotateX(Math.PI / 2)
  p.add(tank, m.tank, M([0, .66, -.3], [0, 0, 0], [1, .95, 1]))
  for (const z of [-.62, -.3, .02]) p.add(new THREE.TorusGeometry(.316, .014, 8, 32), m.trim, M([0, .66, z], [0, 0, 0], [1, .95, 1]))
  p.add(rbox(.66, .045, .9, .02), m.orange, M([0, .66, -.3]))
  p.add(rbox(.16, .03, .9, .01), m.trim, M([0, .97, -.3]))
  for (const z of [-.5, -.1]) p.add(new THREE.CylinderGeometry(.06, .06, .05, 16), m.chrome, M([0, .96, z]))
  p.add(rbox(.2, .12, .02, .015), m.orange, M([0, .5, -.97]))
  kit.lights(p, .895, -.9, .48, .34)
  kit.wheels(p, [.62, -.45, -.75], .29)
  p.build(v)
  return v
}

export function truckLivery() {
  return sideText('TOTAL', BRAND.ivory, BRAND.navy, BRAND.orange)
}
