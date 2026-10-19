import * as THREE from 'three';
import { Merger, fitUV } from './truck-kit.js';
import { glassTexture } from './truck-model.js';

// Tráfico de la Ronda: taxis negros y amarillos, turismos, furgoneta, moto y autobús urbano rojo.

function sideExtrude(points, width, bevel) {
  const shape = new THREE.Shape(points.map(([z, y]) => new THREE.Vector2(z, y)));
  const depth = Math.max(width - bevel * 2, .01);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, bevelSize: bevel, bevelThickness: bevel, curveSegments: 8 });
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(depth / 2, 0, 0);
  return geometry;
}

function wheels(m, positions, radius, width) {
  for (const [x, z] of positions) {
    m.cylinder(radius, radius, width, [x, radius, z], '#1d2227', 'plastic', [0, 0, Math.PI / 2], 16);
    m.cylinder(radius * .55, radius * .55, width + .02, [x, radius, z], '#b9c1c7', 'metal', [0, 0, Math.PI / 2], 12);
  }
}

function car(m, { body, roof = body, taxi = false, length = 4.3, width = 1.8, height = 1.45, van = false }) {
  const l = length / 2;
  const profile = van
    ? [[-l, .32], [l - .1, .32], [l + .05, .62], [l - .05, .95], [l - .55, 1.18], [-l, 1.2]]
    : [[-l, .32], [l - .08, .32], [l + .04, .56], [l - .06, .8], [l - 1.0, .98], [-l + .3, 1.0], [-l, .86]];
  const bevel = .11;
  m.add(sideExtrude(profile, width, bevel), 'paint', body);
  const cabin = van
    ? [[l - .55, 1.12], [l - 1.05, 1.95], [-l + .05, 1.98], [-l + .05, 1.12]]
    : [[l - 1.05, .95], [l - 1.85, height - .02], [-l + 1.2, height], [-l + .35, .97]];
  m.add(fitUV(sideExtrude(cabin, width - .22, .06)), 'glass', '#c9d6de');
  if (van) m.box([width - .1, .9, length * .62], [0, 1.55, -l * .38], body, 'paint', undefined, .1);
  else m.box([width - .3, .06, 1.25], [0, height + .02, -.25], roof, 'paint', undefined, .03);
  if (!van) m.box([width - .2, .5, .08], [0, (height + .97) / 2, -.12], roof, 'paint', [-.08, 0, 0], .03);
  if (taxi) {
    for (const s of [-1, 1]) m.box([.02, .48, 1.85], [s * (width / 2 + .005), .66, -.05], '#f6c400', 'paint', undefined, .01);
    m.box([.42, .14, .2], [0, height + .12, .1], '#f4f1e8', 'paint', undefined, .03);
    m.box([.12, .1, .21], [.12, height + .13, .1], '#37d36b', 'lamp', undefined, .02);
  }
  for (const s of [-1, 1]) {
    m.box([.42, .1, .04], [s * (width / 2 - .32), .74, l + .02], '#fff4dc', 'lamp', undefined, .02);
    m.box([.36, .1, .04], [s * (width / 2 - .3), .78, -l - .02], '#c7302b', 'lamp', undefined, .02);
    m.box([.1, .08, .2], [s * (width / 2 + .06), 1.02, l - 1.0], body, 'paint', undefined, .03);
  }
  m.box([width - .1, .14, .06], [0, .42, l + .03], '#2a3138', 'plastic', undefined, .04);
  wheels(m, [[-width / 2 + .12, l - .85], [width / 2 - .12, l - .85], [-width / 2 + .12, -l + .8], [width / 2 - .12, -l + .8]], .32, .22);
}

function bus(m) {
  const red = '#d1262e', l = 6;
  m.box([2.55, 2.75, 12], [0, 1.78, 0], red, 'paint', undefined, .28);
  m.box([2.58, 1.05, 11.2], [0, 2.28, -.1], '#9fb0bb', 'glass', undefined, .1);
  m.box([2.3, 1.25, .1], [0, 2.18, l - .02], '#c9d6de', 'glass', undefined, .1);
  m.box([2.3, .26, 9.4], [0, 3.2, -.6], '#ece9e1', 'paint', undefined, .1);
  m.box([2.0, .32, .12], [0, 2.95, l + .01], '#17202a', 'plastic', undefined, .04);
  m.box([1.2, .16, .05], [-.3, 2.95, l + .06], '#ffae42', 'lamp');
  for (const s of [-1, 1]) {
    m.box([.42, .12, .05], [s * .9, .82, l + .02], '#fff4dc', 'lamp', undefined, .02);
    m.box([.03, 1.9, 1.15], [1.29, 1.42, s * 2.2 + 1.2], '#9fb0bb', 'glass');
  }
  wheels(m, [[-1.08, 3.9], [1.08, 3.9], [-1.08, -2.6], [1.08, -2.6]], .5, .32);
}

function scooter(m) {
  m.box([.34, .5, 1.5], [0, .55, 0], '#f4f1e8', 'paint', undefined, .15);
  m.box([.5, .12, .5], [0, .9, -.3], '#22282e', 'plastic', undefined, .05);
  m.box([.42, .55, .3], [0, 1.25, -.25], '#3d5a7a', 'paint', undefined, .12);
  m.sphere(.17, [0, 1.68, -.15], '#e5e8ea', 'paint', [1, 1.05, 1.15], 12);
  m.box([.6, .04, .04], [0, 1.15, .5], '#22282e', 'plastic');
  wheels(m, [[0, .62], [0, -.58]], .25, .12);
}

export function createTraffic({ shadowTexture }) {
  const materials = {
    paint: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .32, metalness: .1, clearcoat: .7, clearcoatRoughness: .2 }),
    glass: new THREE.MeshStandardMaterial({ vertexColors: true, map: glassTexture(), roughness: .1, metalness: .2 }),
    plastic: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }),
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .3, metalness: .8 }),
    lamp: new THREE.MeshBasicMaterial({ vertexColors: true }),
  };
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .75 });
  const build = (fn, options, footprint) => {
    const m = new Merger();
    fn(m, options);
    const group = m.build(materials, { cast: true });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(footprint[0], footprint[1]), shadowMaterial);
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .02; group.add(shadow);
    return group;
  };
  const kinds = {
    taxi: () => build(car, { body: '#1b1e22', taxi: true }, [2.5, 5.2]),
    white: () => build(car, { body: '#eef0f0' }, [2.5, 5.2]),
    blue: () => build(car, { body: '#3a6d9a', length: 4.1 }, [2.5, 5]),
    grey: () => build(car, { body: '#8e989f', length: 4.5 }, [2.5, 5.4]),
    red: () => build(car, { body: '#b8322e', length: 3.9 }, [2.4, 4.8]),
    van: () => build(car, { body: '#f4f4f1', length: 5.2, width: 2.0, van: true }, [2.7, 6.2]),
    bus: () => build(bus, {}, [3.3, 13]),
    scooter: () => build(scooter, {}, [1, 2.2]),
  };
  const group = new THREE.Group(); group.name = 'traffic';
  // Carriles: x, sentido (+1 = mismo que el camión), velocidad propia y vehículos con su z inicial.
  const lanes = [
    { x: -3.5, direction: 1, speed: 6.2, range: [-330, 60], vehicles: [['bus', -20], ['taxi', -95], ['scooter', -160], ['taxi', -230], ['white', -290]] },
    { x: 3.5, direction: 1, speed: 9, range: [-330, 60], vehicles: [['van', -60], ['red', -200]] },
  ];
  const actors = [];
  for (const lane of lanes) {
    for (const [kind, z] of lane.vehicles) {
      const vehicle = kinds[kind]();
      vehicle.position.set(lane.x, 0, z);
      if (lane.direction < 0) vehicle.rotation.y = Math.PI;
      group.add(vehicle);
      actors.push({ vehicle, lane, z });
    }
  }
  return {
    group,
    update(elapsed, truckSpeed) {
      for (const actor of actors) {
        const { lane } = actor, span = lane.range[1] - lane.range[0];
        const relative = lane.direction * lane.speed - truckSpeed, wobble = Math.sin(elapsed * .15 + actor.z) * 4;
        actor.vehicle.position.z = THREE.MathUtils.euclideanModulo(actor.z + relative * elapsed + wobble - lane.range[0], span) + lane.range[0];
        actor.vehicle.position.y = Math.abs(Math.sin(elapsed * 9 + actor.z)) * .01;
      }
    },
  };
}
