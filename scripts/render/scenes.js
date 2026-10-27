// Scènes 3D procédurales rendues hors-ligne (Chromium headless) pour produire
// les visuels du site : aucune photo de banque d'images, aucun modèle externe.
import * as THREE from 'three';

const BG = new THREE.Color('#0E0F11');
const TAU = Math.PI * 2;

/* ---------- Utilitaires géométriques ---------- */

function circlePath(path, r, segments, clockwise = false, cx = 0, cy = 0) {
  for (let i = 0; i <= segments; i++) {
    const a = (clockwise ? -1 : 1) * (i / segments) * TAU;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  return path;
}

function annularSector(r1, r2, a0, a1, seg = 64) {
  const s = new THREE.Shape();
  for (let i = 0; i <= seg; i++) {
    const a = a0 + ((a1 - a0) * i) / seg;
    const x = Math.cos(a) * r2;
    const y = Math.sin(a) * r2;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  for (let i = seg; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / seg;
    s.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
  }
  s.closePath();
  return s;
}

function lathe(points, segments = 128) {
  const g = new THREE.LatheGeometry(
    points.map(([r, h]) => new THREE.Vector2(r, h)),
    segments,
  );
  g.rotateX(Math.PI / 2); // axe Y -> axe Z (le disque est dans le plan XY)
  return g;
}

function hexBolt(r, h, mat) {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 6), mat);
  head.rotation.x = Math.PI / 2;
  const washer = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.25, r * 1.25, h * 0.18, 48), mat);
  washer.rotation.x = Math.PI / 2;
  washer.position.z = -h * 0.55;
  g.add(head, washer);
  return g;
}

/* ---------- Textures générées ---------- */

function concentricTexture(size = 2048, rings = 900, base = 128, spread = 70, seed = 7) {
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base},${base},${base})`;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < rings; i++) {
    const r = (i / rings) * (size / 2) * 1.02;
    const v = Math.max(0, Math.min(255, base + (rand() - 0.5) * spread));
    ctx.strokeStyle = `rgba(${v},${v},${v},${0.35 + rand() * 0.5})`;
    ctx.lineWidth = 0.6 + rand() * 1.6;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, TAU);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

function radialBackdrop(inner = '#24272c', outer = '#0E0F11') {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(512, 470, 30, 512, 512, 560);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- Environnement studio (softboxes) ---------- */

function studioEnvironment(renderer, { warm = 0xffe2b8, keyIntensity = 7 } = {}) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x030304);
  // Dôme dégradé : horizon gris moyen, zénith clair, sol sombre (lecture des métaux)
  const dome = new THREE.SphereGeometry(30, 64, 32);
  const col = [];
  const p = dome.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 30;
    const v = y > 0 ? 0.1 + Math.pow(y, 1.5) * 0.55 : 0.1 * (1 + y) + 0.012;
    col.push(v, v, v * 1.02);
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  env.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const panel = (w, h, pos, intensity, color = 0xffffff) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(12, 4, [-4, 8, 5], keyIntensity); // softbox principale, haut-gauche
  panel(2.2, 12, [9, 1.5, -3], 6, warm); // bande de contre-jour chaude
  panel(16, 1.6, [0, -1.5, 10], 1.6); // remplissage bas
  panel(2, 10, [-10, 1, 1], 3.2); // bande latérale gauche
  panel(8, 5, [2, 10, -7], 2); // plafond arrière
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  return tex;
}

/* ---------- Matériaux ---------- */

function materials() {
  const rough = concentricTexture();
  rough.repeat.set(1 / 3.3, 1 / 3.3);
  rough.offset.set(0.5, 0.5);
  return {
    rotor: new THREE.MeshPhysicalMaterial({
      color: 0x9a9da3,
      metalness: 1,
      roughness: 0.42,
      roughnessMap: rough,
      bumpMap: rough,
      bumpScale: 0.6,
    }),
    rotorEdge: new THREE.MeshPhysicalMaterial({ color: 0x5c5f64, metalness: 1, roughness: 0.55 }),
    hat: new THREE.MeshPhysicalMaterial({ color: 0x2c2f34, metalness: 0.75, roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
    caliper: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#F9C300'),
      metalness: 0.05,
      roughness: 0.36,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    }),
    chrome: new THREE.MeshPhysicalMaterial({ color: 0xe8e8ea, metalness: 1, roughness: 0.12 }),
    steel: new THREE.MeshPhysicalMaterial({ color: 0xb4b7bc, metalness: 1, roughness: 0.28 }),
    darkSteel: new THREE.MeshPhysicalMaterial({ color: 0x4a4d52, metalness: 1, roughness: 0.38 }),
    casting: new THREE.MeshPhysicalMaterial({ color: 0x24262a, metalness: 0.55, roughness: 0.72 }),
    shield: new THREE.MeshPhysicalMaterial({ color: 0x17181b, metalness: 0.6, roughness: 0.55 }),
    rubber: new THREE.MeshPhysicalMaterial({ color: 0x151517, metalness: 0, roughness: 0.82 }),
    rim: new THREE.MeshPhysicalMaterial({
      color: 0xaeb2b9,
      metalness: 0.9,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
    rimLip: new THREE.MeshPhysicalMaterial({ color: 0xc9ccd1, metalness: 1, roughness: 0.18 }),
  };
}

/* ---------- Ensemble de freinage ---------- */

function brakeAssembly(M, { withShield = true, caliperAngle = 0.55 } = {}) {
  const g = new THREE.Group();
  const rotor = new THREE.Group();
  const R = 1.6;
  const r = 0.98;

  // Piste de friction percée (deux flasques ventilés)
  const shape = new THREE.Shape();
  circlePath(shape, R, 360);
  shape.holes.push(circlePath(new THREE.Path(), r, 240, true));
  const holesPerRow = 18;
  const rows = [1.16, 1.31, 1.46];
  for (let i = 0; i < holesPerRow; i++) {
    rows.forEach((rr, k) => {
      const a = (i / holesPerRow) * TAU + k * (TAU / holesPerRow / 3);
      shape.holes.push(circlePath(new THREE.Path(), 0.042, 20, true, Math.cos(a) * rr, Math.sin(a) * rr));
    });
  }
  const ringGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.085,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 12,
  });
  const front = new THREE.Mesh(ringGeo, M.rotor);
  front.position.z = 0.16;
  const back = new THREE.Mesh(ringGeo, M.rotor);
  back.position.z = -0.005;
  rotor.add(front, back);

  // Cœur sombre entre les flasques (les perçages se lisent en creux)
  const coreShape = new THREE.Shape();
  circlePath(coreShape, R - 0.02, 240);
  coreShape.holes.push(circlePath(new THREE.Path(), r + 0.02, 160, true));
  const core = new THREE.Mesh(new THREE.ShapeGeometry(coreShape, 1), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  core.position.z = 0.12;
  rotor.add(core);

  // Ailettes de ventilation
  const vaneGeo = new THREE.BoxGeometry(0.6, 0.035, 0.085);
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * TAU + 0.03;
    const v = new THREE.Mesh(vaneGeo, M.rotorEdge);
    v.position.set(Math.cos(a) * 1.29, Math.sin(a) * 1.29, 0.118);
    v.rotation.z = a + 0.18;
    rotor.add(v);
  }

  // Rainures (slots) usinées sur la face avant
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x0b0b0c });
  for (let i = 0; i < 6; i++) {
    const a0 = (i / 6) * TAU + 0.12;
    const slot = new THREE.Mesh(new THREE.ShapeGeometry(annularSector(1.035, 1.055, a0, a0 + 0.55, 32)), slotMat);
    slot.position.z = 0.255;
    rotor.add(slot);
  }

  // Bol (cloche) + moyeu
  const hat = new THREE.Mesh(
    lathe(
      [
        [1.0, 0.14],
        [0.96, 0.16],
        [0.93, 0.25],
        [0.9, 0.5],
        [0.86, 0.56],
        [0.8, 0.58],
        [0.34, 0.58],
        [0.33, 0.56],
      ],
      160,
    ),
    M.hat,
  );
  rotor.add(hat);
  const hub = new THREE.Mesh(
    lathe(
      [
        [0.33, 0.56],
        [0.31, 0.62],
        [0.27, 0.76],
        [0.22, 0.8],
        [0.0, 0.8],
      ],
      96,
    ),
    M.darkSteel,
  );
  rotor.add(hub);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.3;
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.48, 32), M.chrome);
    stud.rotation.x = Math.PI / 2;
    stud.position.set(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0.8);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 12, 0, TAU, 0, Math.PI / 2), M.chrome);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 1.04);
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 40), M.darkSteel);
    boss.rotation.x = Math.PI / 2;
    boss.position.set(Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0.59);
    rotor.add(stud, tip, boss);
  }
  g.add(rotor);
  g.userData.rotor = rotor;

  // Étrier (corps avant, pont, corps arrière)
  const caliper = new THREE.Group();
  const span = 0.72;
  const a0 = caliperAngle - span / 2;
  const a1 = caliperAngle + span / 2;
  const ext = (sh, depth, bevel = 0.06) =>
    new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 48 });
  const body = new THREE.Mesh(ext(annularSector(1.1, 1.82, a0, a1), 0.22), M.caliper);
  body.position.z = 0.33;
  const bridge = new THREE.Mesh(ext(annularSector(1.66, 1.84, a0 + 0.04, a1 - 0.04), 0.86, 0.05), M.caliper);
  bridge.position.z = -0.33;
  const rear = new THREE.Mesh(ext(annularSector(1.12, 1.82, a0, a1), 0.18), M.caliper);
  rear.position.z = -0.33;
  caliper.add(body, bridge, rear);
  // Fenêtre centrale sombre sur le corps avant
  const win = new THREE.Mesh(
    new THREE.ShapeGeometry(annularSector(1.38, 1.6, caliperAngle - 0.13, caliperAngle + 0.13, 24)),
    new THREE.MeshPhysicalMaterial({ color: 0x0c0c0d, roughness: 0.6 }),
  );
  win.position.z = 0.616;
  caliper.add(win);
  // Vis de fixation + purgeur
  for (const a of [a0 + 0.1, a1 - 0.1]) {
    const bolt = hexBolt(0.07, 0.08, M.steel);
    bolt.position.set(Math.cos(a) * 1.46, Math.sin(a) * 1.46, 0.66);
    caliper.add(bolt);
  }
  const bleed = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 16), M.steel);
  bleed.position.set(Math.cos(caliperAngle + 0.18) * 1.87, Math.sin(caliperAngle + 0.18) * 1.87, 0.45);
  bleed.rotation.z = caliperAngle + 0.18 - Math.PI / 2;
  caliper.add(bleed);
  // Plaquettes visibles dans la fenêtre
  const pad = new THREE.Mesh(ext(annularSector(1.12, 1.56, a0 + 0.08, a1 - 0.08), 0.05, 0.01), M.darkSteel);
  pad.position.z = 0.27;
  caliper.add(pad);
  g.add(caliper);

  // Support (chape) et flasque pare-poussière
  const bracket = new THREE.Mesh(ext(annularSector(0.95, 1.25, a0 - 0.12, a1 + 0.12), 0.12, 0.03), M.casting);
  bracket.position.z = -0.48;
  g.add(bracket);
  if (withShield) {
    const shield = new THREE.Mesh(
      lathe(
        [
          [0.5, -0.62],
          [1.6, -0.6],
          [1.72, -0.5],
          [1.74, -0.38],
        ],
        180,
      ),
      M.shield,
    );
    g.add(shield);
  }
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

/* ---------- Roue complète ---------- */

function wheel(M) {
  const g = new THREE.Group();
  // Pneu (225/45 R17, unité : décimètre)
  const tireMat = M.rubber.clone();
  const treadProfile = [];
  const grooves = [-0.62, -0.22, 0.22, 0.62];
  treadProfile.push([3.17, -0.85]);
  for (const h of grooves) treadProfile.push([3.175, h - 0.07], [3.1, h - 0.055], [3.1, h + 0.055], [3.175, h + 0.07]);
  treadProfile.push([3.17, 0.85]);
  const tire = new THREE.Mesh(
    lathe(
      [
        [2.17, -1.02],
        [2.35, -1.12],
        [2.6, -1.16],
        [2.86, -1.15],
        [3.04, -1.1],
        [3.14, -1.0],
        ...treadProfile,
        [3.14, 1.0],
        [3.04, 1.1],
        [2.86, 1.15],
        [2.6, 1.16],
        [2.35, 1.12],
        [2.17, 1.02],
      ].map(([r, h]) => [r, -h]),
      320,
    ),
    tireMat,
  );
  g.add(tire);

  // Jante : fût, rebord usiné, branches
  const barrel = new THREE.Mesh(
    lathe(
      [
        [2.2, 1.02],
        [2.24, 0.98],
        [2.16, 0.9],
        [2.02, 0.7],
        [2.0, -0.85],
        [2.12, -0.95],
        [2.2, -1.02],
      ],
      220,
    ),
    M.rim,
  );
  barrel.material = M.rim.clone();
  barrel.material.side = THREE.DoubleSide;
  g.add(barrel);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.04, 16, 260), M.rimLip);
  lip.position.z = 1.02;
  g.add(lip);

  const spokeShape = new THREE.Shape();
  spokeShape.moveTo(0.52, -0.17);
  spokeShape.quadraticCurveTo(1.3, -0.08, 2.06, -0.13);
  spokeShape.lineTo(2.06, 0.13);
  spokeShape.quadraticCurveTo(1.3, 0.08, 0.52, 0.17);
  spokeShape.closePath();
  const spokeGeo = new THREE.ExtrudeGeometry(spokeShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.045,
    bevelSegments: 6,
    curveSegments: 24,
  });
  for (let i = 0; i < 10; i++) {
    const a = (Math.floor(i / 2) / 5) * TAU + (i % 2 ? 0.11 : -0.11);
    const tilt = new THREE.Group();
    const s = new THREE.Mesh(spokeGeo, M.rim);
    s.rotation.y = 0.2; // concavité : l'extrémité recule vers le fût
    tilt.add(s);
    tilt.rotation.z = a;
    tilt.position.z = 0.82;
    g.add(tilt);
  }
  const centre = new THREE.Mesh(
    lathe(
      [
        [0.62, 0.78],
        [0.6, 0.96],
        [0.5, 1.02],
        [0.0, 1.02],
      ],
      120,
    ),
    M.rim,
  );
  g.add(centre);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + TAU / 10;
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 6), M.chrome);
    nut.rotation.x = Math.PI / 2;
    nut.position.set(Math.cos(a) * 0.38, Math.sin(a) * 0.38, 1.07);
    g.add(nut);
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 64), M.rimLip);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 1.05;
  g.add(cap);

  // Freins visibles derrière les branches
  const brake = brakeAssembly(M, { withShield: true, caliperAngle: 0.35 });
  brake.scale.setScalar(1.04);
  brake.position.z = -0.35;
  g.add(brake);
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
}

/* ---------- Mise en scène ---------- */

let renderer;
let canvas;

function setup(width, height, transparent) {
  if (!canvas) {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.setSize(width, height, false);
  renderer.setClearColor(BG, transparent ? 0 : 1);
}

function keyLights(scene, { keyPos = [-4, 6, 6], intensity = 900 } = {}) {
  const key = new THREE.SpotLight(0xffffff, intensity, 0, Math.PI / 6, 0.6, 2);
  key.position.set(...keyPos);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.radius = 6;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffd9a8, 2.6);
  rim.position.set(6, 2, -5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xc8d2ff, 0.25);
  fill.position.set(-6, -2, 4);
  scene.add(fill);
}

function buildScene(name, { transparent }) {
  const M = materials();
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 1.0;
  if (!transparent) {
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: radialBackdrop(), toneMapped: false }));
    backdrop.position.z = -8;
    scene.add(backdrop);
  }
  let subject;
  let camera;
  if (name === 'brake' || name === 'hero') {
    subject = brakeAssembly(M, { caliperAngle: name === 'hero' ? 2.25 : 0.55 });
    subject.rotation.set(-0.12, -0.62, 0.05);
    camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
    keyLights(scene);
  } else if (name === 'wheel') {
    subject = wheel(M);
    subject.rotation.set(0.04, -0.36, 0);
    camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
    keyLights(scene, { keyPos: [-6, 7, 8], intensity: 1800 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.55 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.18;
    floor.receiveShadow = true;
    scene.add(floor);
  }
  scene.add(subject);
  return { scene, camera, subject };
}

const cache = {};

window.renderFrame = function renderFrame({ name, width, height, t = 0, transparent = false, mime = 'image/png', quality = 0.92 }) {
  setup(width, height, transparent);
  const key = `${name}:${transparent}`;
  if (!cache[key]) cache[key] = buildScene(name, { transparent });
  const { scene, camera, subject } = cache[key];
  camera.aspect = width / height;

  if (name === 'hero') {
    // Boucle parfaite : rotation d'un pas de perçage, travelling sinusoïdal
    const rotor = subject.userData.rotor;
    rotor.rotation.z = -t * (TAU / 18);
    const s = Math.sin(t * TAU);
    const c = Math.cos(t * TAU);
    camera.position.set(-1.9 + s * 0.3, 0.45 + c * 0.1, 8.6 + c * 0.25);
    camera.lookAt(-1.45 + s * 0.06, 0.0, 0);
    scene.environmentRotation.set(0, s * 0.35, 0);
  } else if (name === 'brake') {
    camera.position.set(0.15, 0.35, 8.6);
    camera.lookAt(0.1, 0.05, 0);
  } else if (name === 'wheel') {
    camera.position.set(0.4, 0.9, 17.5);
    camera.lookAt(0.2, -0.15, 0);
  }
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  return canvas.toDataURL(mime, quality);
};

window.__ready = true;
