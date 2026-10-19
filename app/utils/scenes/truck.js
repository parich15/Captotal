import * as THREE from 'three';
import logoUrl from '~/assets/img/captotal-truck-logo.png';
import { createTruck } from './truck-model.js';
import { createBarcelona } from './barcelona.js';

// Paseo marítimo de Barcelona con el camión de CAP Total circulando hacia la cámara.
const SKY = { zenith: '#5aa2d3', upper: '#8fc3e4', horizon: '#eae6dd', haze: '#e6e3dc', sun: '#fff1dc' };
const SPEED = 9;

const skyVertex = /* glsl */`
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_Position.z = gl_Position.w;
  }
`;
const skyFragment = /* glsl */`
  uniform vec3 zenith; uniform vec3 upper; uniform vec3 horizon; uniform vec3 haze; uniform vec3 sunColor;
  uniform vec3 sunDirection; uniform float time; uniform float clouds;
  varying vec3 vDirection;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }
  void main() {
    vec3 d = normalize(vDirection);
    float h = d.y;
    vec3 color = mix(horizon, upper, smoothstep(.0, .22, h));
    color = mix(color, zenith, smoothstep(.18, .75, h));
    color = mix(color, haze, 1.0 - smoothstep(-.04, .06, h));
    float sun = max(dot(d, sunDirection), 0.0);
    color += sunColor * (pow(sun, 900.0) * 3.0 + pow(sun, 18.0) * .22 + pow(sun, 3.0) * .06);
    if (clouds > 0.0 && h > 0.0) {
      vec2 uv = d.xz / (h + .1) * .9 + vec2(time * .006, time * .002);
      float c = fbm(uv * 1.1 + fbm(uv * 2.3) * .6);
      float cover = smoothstep(.5, .78, c) * smoothstep(.02, .2, h) * (1.0 - smoothstep(.55, .9, h));
      vec3 cloud = mix(vec3(.93, .94, .96), vec3(1.0, .99, .97), smoothstep(.55, .85, c));
      color = mix(color, cloud, cover * .85 * clouds);
    }
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function createScene({ invalidate = () => {} } = {}) {
  const scene = new THREE.Scene();
  const hazeColor = new THREE.Color(SKY.haze);
  scene.background = hazeColor.clone();
  scene.fog = new THREE.Fog(hazeColor.clone(), 70, 360);
  const camera = new THREE.PerspectiveCamera(32, 1, .5, 3000);
  const sunDirection = new THREE.Vector3(.72, .58, .38).normalize();

  const skyUniforms = {
    zenith: { value: new THREE.Color(SKY.zenith) }, upper: { value: new THREE.Color(SKY.upper) },
    horizon: { value: new THREE.Color(SKY.horizon) }, haze: { value: hazeColor.clone() },
    sunColor: { value: new THREE.Color(SKY.sun) }, sunDirection: { value: sunDirection.clone() },
    time: { value: 0 }, clouds: { value: 1 },
  };
  const skyMaterial = new THREE.ShaderMaterial({ uniforms: skyUniforms, vertexShader: skyVertex, fragmentShader: skyFragment, side: THREE.BackSide, depthWrite: false, fog: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), skyMaterial);
  sky.frustumCulled = false; sky.renderOrder = -10;
  scene.add(sky);

  scene.add(new THREE.HemisphereLight('#d4e8f5', '#c4b394', .85));
  const sun = new THREE.DirectionalLight('#ffe6c4', 3.6);
  sun.position.copy(sunDirection).multiplyScalar(60);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 10, far: 140 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  const truck = createTruck({ invalidate, logoUrl });
  scene.add(truck.group);
  const city = createBarcelona({ scene, haze: SKY.haze, speed: SPEED });

  // Encuadre: cámara 3/4 frontal con deriva lenta y paralaje según el puntero.
  const target = new THREE.Vector3(-1.8, 3.7, -4.2);
  const pointer = new THREE.Vector2(), parallax = new THREE.Vector2();
  let distance = 26, baseYaw = .62, basePitch = .115;
  function place(elapsed) {
    const yaw = baseYaw + Math.sin(elapsed * .09) * .05 + parallax.x * .07;
    const pitch = basePitch + Math.sin(elapsed * .13 + 1) * .015 - parallax.y * .035;
    camera.position.set(
      target.x + Math.sin(yaw) * Math.cos(pitch) * distance,
      target.y + Math.sin(pitch) * distance,
      target.z + Math.cos(yaw) * Math.cos(pitch) * distance,
    );
    camera.lookAt(target);
  }

  let environment = null;
  return {
    scene, camera,
    setup({ renderer }) {
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1.0;
      const envScene = new THREE.Scene();
      const envSky = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), skyMaterial);
      envScene.add(envSky);
      const envGround = new THREE.Mesh(new THREE.CircleGeometry(48, 24), new THREE.MeshBasicMaterial({ color: '#b7ad9c' }));
      envGround.rotation.x = -Math.PI / 2; envGround.position.y = -2; envScene.add(envGround);
      skyUniforms.clouds.value = 0;
      const generator = new THREE.PMREMGenerator(renderer);
      environment = generator.fromScene(envScene, .02, .1, 100);
      generator.dispose();
      skyUniforms.clouds.value = 1;
      envSky.geometry.dispose(); envGround.geometry.dispose(); envGround.material.dispose();
      scene.environment = environment.texture;
      scene.environmentIntensity = .75;
    },
    resize(width, height) {
      camera.aspect = width / Math.max(height, 1);
      // En columnas estrechas se aleja la cámara para que quepa el frontal y parte del semirremolque.
      const wide = camera.aspect > 1.6, narrow = camera.aspect < .95;
      camera.fov = narrow ? 40 : wide ? 25 : 32;
      distance = wide ? 24 : Math.min(27, 23 * Math.max(1, 1.12 / camera.aspect));
      target.y = wide ? 2.8 : 3.7;
      baseYaw = wide ? .58 : narrow ? .5 : .62;
      camera.updateProjectionMatrix();
      place(0);
    },
    update(elapsed, delta, { paused } = {}) {
      parallax.x = THREE.MathUtils.damp(parallax.x, pointer.x, 3, delta);
      parallax.y = THREE.MathUtils.damp(parallax.y, pointer.y, 3, delta);
      skyUniforms.time.value = elapsed;
      const travelled = elapsed * SPEED;
      truck.update(elapsed, travelled);
      city.update(elapsed, travelled, delta);
      place(elapsed);
      return paused && parallax.distanceTo(pointer) > .002;
    },
    pointer(type, x, y, event) {
      if (type === 'move') pointer.set(THREE.MathUtils.clamp(x, -1, 1), THREE.MathUtils.clamp(y, -1, 1));
      if (type === 'leave' || type === 'cancel' || (type === 'up' && event?.pointerType !== 'mouse')) pointer.set(0, 0);
      return null;
    },
    dispose() {
      truck.dispose();
      environment?.dispose(); environment = null;
    },
  };
}
