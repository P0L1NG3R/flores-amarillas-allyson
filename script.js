(() => {
  "use strict";

  const MOBILE = matchMedia("(max-width: 650px)").matches;
  const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LOW_MEMORY = MOBILE && ((navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4));
  const PHOTOS = Array.from({length: 9}, (_, i) => "assets/foto" + (i + 1) + ".jpg");
  const SCENE_PHOTOS = MOBILE ? PHOTOS.filter((_, i) => i % 2 === 0) : PHOTOS;
  const PHRASES = [
    "Gracias por ser mi sol de siempre",
    "Allyson, eres mi lugar favorito",
    "Mi mundo florece contigo",
    "Te elegiría una y mil veces",
    "Siempre tú, siempre nosotros",
    "Tu sonrisa ilumina mi universo",
    "Mis flores amarillas llevan tu nombre",
    "Qué suerte coincidir contigo",
    "Eres mi casualidad favorita",
    "Lo bonito de mis días también tiene tu nombre",
    "Mi corazón siempre vuelve a ti",
    "Contigo todo se siente más bonito",
    "Eres la parte más linda de mis recuerdos",
    "Si hay flores, pienso en ti",
    "Tu luz hace especial mis días",
    "Donde estés tú, ahí quiero estar",
    "Eres mi detalle favorito",
    "Todo florece un poco más contigo",
    "Siempre encuentro paz en ti",
    "Tú haces que todo tenga más sentido",
    "Mi universo se ve mejor contigo",
    "Tu nombre también florece en mí",
    "Eres mi flor favorita",
    "Siempre vas a ser mi lugar bonito",
    "Cada momento contigo vale oro",
    "Contigo hasta lo simple se vuelve recuerdo",
    "Tu risa es una de mis luces favoritas",
    "En cada universo volvería a encontrarte"
  ];
  const SHAPE_LABELS = [
    "Una flor para ti 🌻",
    "Un corazón hecho de luz 💛",
    "ALLYSON entre estrellas ✨",
    "Un ramo entero para ti 🌻",
    "Siempre tú, siempre nosotros 💛"
  ];
  const HERO_TITLES = [
    "Todo empieza con una flor que lleva un poquito de ti",
    "Hay cosas que solo se pueden decir con el corazón",
    "Tu nombre, escrito entre estrellas y luz dorada",
    "Flores para guardar lo bonito de nuestros recuerdos",
    "Mi lugar favorito sigue siendo contigo"
  ];

  const $ = q => document.querySelector(q);
  const canvas = $("#galaxy");
  const start = $("#start");
  const startBtn = $("#startBtn");
  const musicBtn = $("#music");
  const letterBtn = $("#letterBtn");
  const letter = $("#letter");
  const closeBtn = $("#close");
  const shapeLabel = $("#shapeLabel");
  const heroTitle = $("#heroTitle");
  const finale = $("#finale");
  const finaleOpen = $("#finaleOpen");
  const finaleExplore = $("#finaleExplore");
  const secretName = $("#secretName");
  const secretSurprise = $("#secretSurprise");
  const secretClose = $("#secretClose");
  const dots = [...document.querySelectorAll(".progress-dots i")];

  let experienceStarted = false;
  let morphStart = performance.now();
  let burst = 0;
  let finaleShown = false;
  let storyPaused = false;
  let secretPulse = 0;
  let entryEnergy = 0;
  let transitionEnergy = 0;
  let finaleEnergy = 0;
  let cinematicStart = -Infinity;
  let pointerNX = 0;
  let pointerNY = 0;

  function openLetter() {
    letter.classList.add("show");
    letter.setAttribute("aria-hidden", "false");
  }

  function closeLetter() {
    letter.classList.remove("show");
    letter.setAttribute("aria-hidden", "true");
  }
  letterBtn.addEventListener("click", openLetter);
  closeBtn.addEventListener("click", closeLetter);
  letter.addEventListener("click", e => { if (e.target === letter) closeLetter(); });
  addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeLetter();
      if (finale?.classList.contains("show")) {
        finale.classList.remove("show");
        finale.setAttribute("aria-hidden", "true");
        storyPaused = false;
        morphStart = performance.now();
      }
      if (secretSurprise?.classList.contains("show")) closeSecret();
    }
  });

  finaleOpen?.addEventListener("click", () => {
    finale.classList.remove("show");
    finale.setAttribute("aria-hidden", "true");
    storyPaused = false;
    morphStart = performance.now();
    openLetter();
  });

  finaleExplore?.addEventListener("click", () => {
    finale.classList.remove("show");
    finale.setAttribute("aria-hidden", "true");
    storyPaused = false;
    morphStart = performance.now();
  });

  function closeSecret(){
    secretSurprise?.classList.remove("show");
    secretSurprise?.setAttribute("aria-hidden", "true");
    if (!finale?.classList.contains("show") && !letter?.classList.contains("show")) {
      storyPaused = false;
      morphStart = performance.now();
    }
  }

  secretName?.addEventListener("click", () => {
    secretPulse = 1;
    burst = Math.max(burst, 1.25);
    storyPaused = true;
    secretSurprise?.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => secretSurprise?.classList.add("show"));
  });
  secretClose?.addEventListener("click", closeSecret);
  secretSurprise?.addEventListener("click", e => { if (e.target === secretSurprise) closeSecret(); });

  /* Música original, generada en el navegador. Funciona sin archivos externos. */
  let audioCtx = null, master = null, musicOn = false, musicTimer = null, musicStep = 0;

  function makeTone(freq, when, duration, gain, type = "sine") {
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(type === "triangle" ? 1100 : 1700, when);
    amp.gain.setValueAtTime(0.0001, when);
    amp.gain.exponentialRampToValueAtTime(gain, when + 0.035);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(master);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  function scheduleBar() {
    if (!musicOn || !audioCtx) return;
    const now = audioCtx.currentTime + 0.05;
    const roots = [261.63, 220.00, 174.61, 196.00];
    const chordSets = [
      [1, 1.25, 1.5],
      [1, 1.2, 1.5],
      [1, 1.25, 1.5],
      [1, 1.26, 1.5]
    ];
    const root = roots[musicStep % roots.length];
    const ratios = chordSets[musicStep % chordSets.length];

    ratios.forEach((r, i) => {
      makeTone(root * r, now, 3.8, i === 0 ? 0.18 : 0.075, i === 0 ? "sine" : "triangle");
      makeTone(root * r * 2, now + 0.05, 3.45, 0.024, "sine");
    });

    const melody = [
      [659.25, 783.99, 880.00, 783.99],
      [659.25, 587.33, 523.25, 587.33],
      [523.25, 659.25, 698.46, 659.25],
      [587.33, 659.25, 783.99, 659.25]
    ][musicStep % 4];

    melody.forEach((f, i) => {
      makeTone(f, now + i * 0.82, 0.72, 0.11, "sine");
      makeTone(f * 2, now + i * 0.82, 0.45, 0.025, "triangle");
    });

    musicStep++;
    musicTimer = setTimeout(scheduleBar, 3250);
  }

  async function startMusic() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) {
      audioCtx = new AC();
      master = audioCtx.createGain();
      master.gain.value = 0.24;
      master.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") await audioCtx.resume();
    if (musicOn) return;
    musicOn = true;
    musicBtn.classList.add("playing");
    musicBtn.textContent = "♪";
    scheduleBar();
  }

  function stopMusic() {
    musicOn = false;
    musicBtn.classList.remove("playing");
    musicBtn.textContent = "♫";
    if (musicTimer) clearTimeout(musicTimer);
    musicTimer = null;
    if (master && audioCtx) {
      master.gain.cancelScheduledValues(audioCtx.currentTime);
      master.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.06);
    }
  }

  musicBtn.addEventListener("click", async () => {
    if (musicOn) stopMusic();
    else {
      if (master && audioCtx) master.gain.setValueAtTime(0.24, audioCtx.currentTime);
      await startMusic();
    }
  });

  async function enterExperience() {
    if (experienceStarted) return;
    experienceStarted = true;
    morphStart = performance.now();
    cinematicStart = performance.now();
    entryEnergy = 1;
    burst = 1.35;
    document.body.classList.add("experience-active");
    if (startBtn) {
      startBtn.disabled = true;
      const txt = startBtn.querySelector("span");
      if (txt) txt.textContent = "Disfruta tu sorpresa 💛";
    }
    if (start) start.classList.add("hide");
    try { await startMusic(); } catch (_) {}
    setTimeout(() => { if (start && start.parentNode) start.remove(); }, 1050);
  }
  addEventListener("allyson:enter", enterExperience);
  if (startBtn) {
    startBtn.addEventListener("click", enterExperience);
  }

  if (typeof THREE === "undefined") {
    if (startBtn) {
      startBtn.disabled = false;
      const txt = startBtn.querySelector("span");
      if (txt) txt.textContent = "Recarga la página";
    }
    console.error("Three.js no pudo cargarse.");
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !MOBILE,
      alpha: true,
      powerPreference: "high-performance"
    });
  } catch (e) {
    console.error(e);
    return;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? (LOW_MEMORY ? 1 : 1.12) : 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050400, 0.047);
  const camera = new THREE.PerspectiveCamera(MOBILE ? 60 : 52, innerWidth / innerHeight, 0.1, 120);
  let cameraZTarget = MOBILE ? 12.4 : 10.3;
  camera.position.set(0, 0.05, cameraZTarget);

  const universe = new THREE.Group();
  scene.add(universe);

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);
  addEventListener("pointermove", e => {
    pointerNX = THREE.MathUtils.clamp((e.clientX / Math.max(1, innerWidth)) * 2 - 1, -1, 1);
    pointerNY = THREE.MathUtils.clamp((e.clientY / Math.max(1, innerHeight)) * 2 - 1, -1, 1);
  }, {passive:true});

  function pointsObject(points, size, color, opacity) {
    const a = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      a[i * 3] = p[0];
      a[i * 3 + 1] = p[1];
      a[i * 3 + 2] = p[2] || 0;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({
      map: glowTexture(),
      color, size, transparent: true, opacity, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true,
      alphaTest: 0.018
    }));
  }

  function starField(count, minR, maxR, size, opacity) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const r = minR + Math.random() * (maxR - minR);
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * Math.PI;
      pts.push([
        Math.cos(u) * Math.cos(v) * r,
        Math.sin(v) * r * 0.72,
        Math.sin(u) * Math.cos(v) * r
      ]);
    }
    const obj = pointsObject(pts, size, 0xffe477, opacity);
    scene.add(obj);
    return obj;
  }

  const farStars = starField(MOBILE ? (LOW_MEMORY ? 650 : 900) : 3200, 10, 40, MOBILE ? 0.040 : 0.036, MOBILE ? 0.50 : 0.56);
  const nearStars = starField(MOBILE ? (LOW_MEMORY ? 180 : 270) : 980, 4.8, 18, MOBILE ? 0.058 : 0.050, MOBILE ? 0.68 : 0.74);

  function glowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,250,190,1)");
    g.addColorStop(0.11, "rgba(255,221,68,.9)");
    g.addColorStop(0.36, "rgba(255,170,0,.27)");
    g.addColorStop(1, "rgba(255,150,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color: 0xffc400, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  glow.position.z = -1.4;
  glow.scale.set(MOBILE ? 6.2 : 6.8, MOBILE ? 6.2 : 6.8, 1);
  glow.material.opacity = MOBILE ? 0.095 : 0.11;
  universe.add(glow);

  /* Centro floral: reemplaza por completo el holograma circular. */
  const ambientLight = new THREE.AmbientLight(0xffefc5, MOBILE ? 0.34 : 0.40);
  scene.add(ambientLight);

  const bloomLight = new THREE.PointLight(0xffcc35, MOBILE ? 1.0 : 1.35, 15, 2);
  bloomLight.position.set(0, 0.4, 3.0);
  scene.add(bloomLight);

  const centralBloom = new THREE.Group();
  centralBloom.position.set(0, 0.18, 0.16);
  universe.add(centralBloom);

  const bloomGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(),
    color: 0xffc928,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  bloomGlow.position.z = -0.28;
  bloomGlow.scale.set(MOBILE ? 3.0 : 3.45, MOBILE ? 3.0 : 3.45, 1);
  centralBloom.add(bloomGlow);

  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, -0.10);
  petalShape.bezierCurveTo(-0.18, -0.01, -0.34, 0.34, -0.25, 0.66);
  petalShape.bezierCurveTo(-0.18, 0.92, -0.06, 1.08, 0, 1.12);
  petalShape.bezierCurveTo(0.07, 1.07, 0.20, 0.91, 0.27, 0.65);
  petalShape.bezierCurveTo(0.35, 0.34, 0.18, -0.02, 0, -0.10);

  const petalGeo = MOBILE
    ? new THREE.ShapeGeometry(petalShape, 7)
    : new THREE.ExtrudeGeometry(petalShape, {
        depth: 0.045,
        steps: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.014,
        bevelThickness: 0.014
      });
  petalGeo.center();

  const bloomPetals = [];

  function addPetalRing(count, radius, scaleX, scaleY, zBase, colorA, colorB, offset = 0, tilt = 0.25) {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + offset;
      const material = new THREE.MeshPhongMaterial({
        color: i % 2 ? colorA : colorB,
        emissive: 0x9a5a00,
        emissiveIntensity: 0.12,
        shininess: 105,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.98
      });
      const petal = new THREE.Mesh(petalGeo, material);
      const variation = 0.94 + ((i * 17) % 13) / 100;
      const curl = Math.sin(angle * 3 + i * 0.7);
      petal.scale.set(scaleX * variation, scaleY * (0.95 + ((i * 11) % 9) / 100), MOBILE ? 1 : 0.94);
      petal.position.set(
        Math.cos(angle) * (radius + curl * 0.018),
        Math.sin(angle) * (radius + curl * 0.018),
        zBase + Math.cos(angle * 2) * 0.052 + curl * 0.018
      );
      petal.rotation.z = angle - Math.PI / 2 + curl * 0.025;
      petal.rotation.x = tilt + Math.sin(angle) * 0.12 + curl * 0.035;
      petal.rotation.y = Math.cos(angle) * 0.10 - curl * 0.025;
      centralBloom.add(petal);
      bloomPetals.push({
        petal, angle, radius,
        baseX: scaleX, baseY: scaleY, baseZ: MOBILE ? 1 : 0.92,
        baseTilt: tilt, phase: i * 0.53 + offset
      });
    }
  }

  addPetalRing(MOBILE ? 12 : 18, MOBILE ? 0.60 : 0.68, MOBILE ? 0.60 : 0.66, MOBILE ? 0.82 : 0.92, -0.09, 0xffc01a, 0xffe36a, 0, 0.38);
  addPetalRing(MOBILE ? 10 : 14, MOBILE ? 0.44 : 0.50, MOBILE ? 0.50 : 0.56, MOBILE ? 0.66 : 0.75, 0.055, 0xffb20d, 0xffd83b, Math.PI / (MOBILE ? 10 : 14), 0.27);
  addPetalRing(MOBILE ? 8 : 10, MOBILE ? 0.31 : 0.34, MOBILE ? 0.39 : 0.43, MOBILE ? 0.49 : 0.55, 0.13, 0xffd13b, 0xffed80, Math.PI / 10, 0.18);

  const bloomCenter = new THREE.Mesh(
    new THREE.SphereGeometry(MOBILE ? 0.34 : 0.39, MOBILE ? 14 : 18, MOBILE ? 10 : 14),
    new THREE.MeshPhongMaterial({
      color: 0x5b3306,
      emissive: 0x241202,
      emissiveIntensity: 0.34,
      shininess: 58,
      transparent: true,
      opacity: 1
    })
  );
  bloomCenter.scale.z = 0.58;
  bloomCenter.position.z = 0.21;
  centralBloom.add(bloomCenter);

  const seedCount = MOBILE ? 34 : 52;
  const seedGeo = new THREE.SphereGeometry(MOBILE ? 0.018 : 0.021, 5, 4);
  const seedMaterial = new THREE.MeshBasicMaterial({color:0xd89b20,transparent:true,opacity:1});
  for (let i = 0; i < seedCount; i++) {
    const a = i * 2.399963229728653;
    const r = Math.sqrt(i / seedCount) * (MOBILE ? 0.27 : 0.31);
    const seed = new THREE.Mesh(seedGeo, seedMaterial);
    seed.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.405 - r * 0.11);
    centralBloom.add(seed);
  }

  /* Holograma floral dorado: aparece en entradas, morphs y momentos especiales. */
  const hologramGroup = new THREE.Group();
  hologramGroup.position.set(0, 0.18, 0.18);
  universe.add(hologramGroup);

  const holoUniforms = {
    uTime: {value: 0},
    uAlpha: {value: 0}
  };
  const holoPetalMaterial = new THREE.ShaderMaterial({
    uniforms: holoUniforms,
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormalV;
      varying vec3 vView;
      varying float vPulse;
      void main(){
        vec3 p = position;
        float wave = sin(position.y * 10.0 + uTime * 3.1) * 0.012;
        p.z += wave;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNormalV = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        vPulse = 0.5 + 0.5 * sin(position.y * 13.0 - uTime * 4.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uAlpha;
      varying vec3 vNormalV;
      varying vec3 vView;
      varying float vPulse;
      void main(){
        float fresnel = pow(1.0 - abs(dot(normalize(vNormalV), normalize(vView))), 1.55);
        float breath = 0.92 + 0.08 * sin(uTime * 1.7 + vPulse * 2.0);
        float softRim = pow(fresnel, 1.18);
        vec3 amber = vec3(1.0, 0.61, 0.08);
        vec3 cream = vec3(1.0, 0.96, 0.64);
        vec3 col = mix(amber, cream, clamp(softRim + vPulse * 0.16, 0.0, 1.0));
        float alpha = (0.055 + softRim * 0.48 + vPulse * 0.055) * breath * uAlpha;
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });

  const holoPetalCount = MOBILE ? 12 : 18;
  for (let i = 0; i < holoPetalCount; i++) {
    const a = i / holoPetalCount * Math.PI * 2;
    const p = new THREE.Mesh(petalGeo, holoPetalMaterial);
    p.scale.set(MOBILE ? 0.52 : 0.58, MOBILE ? 0.72 : 0.82, 0.9);
    p.position.set(Math.cos(a) * (MOBILE ? 0.61 : 0.69), Math.sin(a) * (MOBILE ? 0.61 : 0.69), 0.02);
    p.rotation.z = a - Math.PI / 2;
    p.rotation.x = 0.24 + Math.sin(a) * 0.08;
    hologramGroup.add(p);
  }

  const holoCenterMaterial = new THREE.MeshBasicMaterial({
    color:0xffc73d, wireframe:false, transparent:true, opacity:0,
    blending:THREE.AdditiveBlending, depthWrite:false
  });
  const holoCenter = new THREE.Mesh(
    new THREE.SphereGeometry(MOBILE ? 0.36 : 0.42, MOBILE ? 10 : 16, MOBILE ? 8 : 12),
    holoCenterMaterial
  );
  holoCenter.scale.z = 0.55;
  holoCenter.position.z = 0.19;
  hologramGroup.add(holoCenter);

  const holoRingMaterial = new THREE.MeshBasicMaterial({
    color:0xffdf68, wireframe:false, transparent:true, opacity:0,
    blending:THREE.AdditiveBlending, depthWrite:false
  });
  const holoRingA = new THREE.Mesh(new THREE.TorusGeometry(MOBILE ? 1.02 : 1.14, 0.009, 4, MOBILE ? 48 : 88), holoRingMaterial);
  const holoRingB = new THREE.Mesh(new THREE.TorusGeometry(MOBILE ? 1.30 : 1.48, 0.007, 4, MOBILE ? 48 : 88), holoRingMaterial.clone());
  holoRingA.rotation.x = Math.PI / 2.5;
  holoRingB.rotation.x = -Math.PI / 2.8;
  hologramGroup.add(holoRingA, holoRingB);
  hologramGroup.visible = false;

  /* Corrientes de luz: profundidad 3D sin anillos ni efecto planeta. */
  const flowGroup = new THREE.Group();
  universe.add(flowGroup);
  const flowTrails = [];
  const trailTexture = glowTexture();
  const trailCount = MOBILE ? (LOW_MEMORY ? 2 : 3) : 4;
  const trailPoints = MOBILE ? (LOW_MEMORY ? 70 : 105) : 180;

  for (let k = 0; k < trailCount; k++) {
    const arr = new Float32Array(trailPoints * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.PointsMaterial({
      map: trailTexture,
      color: k % 2 ? 0xffc82d : 0xffe66d,
      size: MOBILE ? 0.075 : 0.064,
      transparent: true,
      opacity: MOBILE ? 0.34 : 0.43,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      alphaTest: 0.02
    });
    const pts = new THREE.Points(geo, mat);
    flowGroup.add(pts);
    flowTrails.push({pts, geo, k});
  }

  function updateFlowTrails(t) {
    if (REDUCED_MOTION) return;
    flowTrails.forEach(({geo,k}) => {
      const a = geo.attributes.position.array;
      for (let i = 0; i < trailPoints; i++) {
        const u = i / Math.max(1, trailPoints - 1);
        const y = -3.15 + u * 6.35;
        const envelope = 0.30 + Math.sin(u * Math.PI) * (MOBILE ? 0.78 : 1.05);
        const phase = u * (5.2 + k * 0.24) + k * 1.73;
        const drift = t * (0.22 + k * 0.018);
        const x = Math.sin(phase + drift) * envelope + Math.sin(u * 10.0 - t * 0.13 + k) * 0.12;
        const z = Math.sin(u * 3.7 - t * 0.17 + k * 0.82) * (0.24 + envelope * 0.30);
        a[i*3] = x;
        a[i*3+1] = y + Math.sin(u * 8.0 + t * 0.36 + k) * 0.07;
        a[i*3+2] = z - 0.34;
      }
      geo.attributes.position.needsUpdate = true;
    });
  }

  const PARTICLES = MOBILE ? (LOW_MEMORY ? 850 : 1250) : 3600;

  function normalizeCount(arr, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const p = arr[Math.floor(Math.random() * arr.length)] || [0,0,0];
      out.push([
        p[0] + (Math.random() - 0.5) * 0.025,
        p[1] + (Math.random() - 0.5) * 0.025,
        p[2] + (Math.random() - 0.5) * 0.025
      ]);
    }
    return out;
  }

  function heartShape() {
    const a = [];
    for (let i = 0; i < PARTICLES; i++) {
      const t = Math.random() * Math.PI * 2;
      const edge = Math.random() < 0.70;
      const f = edge ? (0.88 + Math.random() * 0.12) : Math.sqrt(Math.random()) * 0.84;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      a.push([
        x * 0.066 * f,
        y * 0.066 * f + 0.18,
        (Math.random() - 0.5) * (edge ? 0.18 : 0.34)
      ]);
    }
    return a;
  }

  function flowerShape() {
    const a = [];
    for (let i = 0; i < PARTICLES; i++) {
      const center = Math.random() < 0.24;
      if (center) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.64;
        a.push([Math.cos(t) * r, Math.sin(t) * r + 0.18, (Math.random() - 0.5) * 0.18]);
      } else {
        const petal = Math.floor(Math.random() * 12);
        const base = petal / 12 * Math.PI * 2;
        const along = Math.pow(Math.random(), 0.62);
        const spread = (Math.random() - 0.5) * 0.34 * (0.35 + along);
        const r = 0.58 + along * 1.72;
        const t = base + spread;
        a.push([
          Math.cos(t) * r,
          Math.sin(t) * r + 0.18,
          (Math.random() - 0.5) * 0.22 + Math.sin(along * Math.PI) * 0.08
        ]);
      }
    }
    return a;
  }

  function textShape(text) {
    const c = document.createElement("canvas");
    c.width = 1000; c.height = 270;
    const x = c.getContext("2d");
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = "700 176px Georgia, 'Times New Roman', serif";
    x.fillText(text, 500, 135);
    const d = x.getImageData(0,0,c.width,c.height).data;
    const pts = [];
    for (let yy = 0; yy < c.height; yy += 5) {
      for (let xx = 0; xx < c.width; xx += 5) {
        if (d[(yy * c.width + xx) * 4 + 3] > 90 && Math.random() > 0.22) {
          pts.push([(xx - 500) * 0.0063, (135 - yy) * 0.0063 + 0.16, (Math.random() - 0.5) * 0.27]);
        }
      }
    }
    return normalizeCount(pts, PARTICLES);
  }

  function bouquetShape() {
    const pts = [];
    const heads = [[-1.25,.9],[-.65,1.35],[0,1.05],[.72,1.42],[1.3,.86],[-.2,1.75]];
    for (let i = 0; i < PARTICLES; i++) {
      if (Math.random() < 0.72) {
        const h = heads[Math.floor(Math.random() * heads.length)];
        const t = Math.random() * Math.PI * 2;
        const pet = 0.23 + 0.23 * Math.pow(Math.abs(Math.cos(7*t)), 0.6);
        const r = Math.random() * pet + 0.18;
        pts.push([h[0] + Math.cos(t)*r, h[1] + Math.sin(t)*r, (Math.random()-.5)*.38]);
      } else {
        const h = heads[Math.floor(Math.random() * heads.length)];
        const u = Math.random();
        pts.push([h[0]*(1-u)*.96, -1.7 + u*(h[1]+1.7) + (Math.random()-.5)*.06, (Math.random()-.5)*.24]);
      }
    }
    return pts;
  }

  const targets = [flowerShape(), heartShape(), textShape("ALLYSON"), bouquetShape(), heartShape()];
  const morphGeo = new THREE.BufferGeometry();
  const morphPos = new Float32Array(PARTICLES * 3);
  targets[0].forEach((p,i) => {
    morphPos[i*3] = p[0];
    morphPos[i*3+1] = p[1];
    morphPos[i*3+2] = p[2];
  });
  morphGeo.setAttribute("position", new THREE.BufferAttribute(morphPos, 3));

  const morphColors = new Float32Array(PARTICLES * 3);
  const morphColor = new THREE.Color();
  for (let i = 0; i < PARTICLES; i++) {
    const palette = i % 5;
    morphColor.setHex(palette === 0 ? 0xfff0a1 : palette === 1 ? 0xffd83d : palette === 2 ? 0xffbf21 : palette === 3 ? 0xffe76f : 0xffcf32);
    morphColors[i*3] = morphColor.r;
    morphColors[i*3+1] = morphColor.g;
    morphColors[i*3+2] = morphColor.b;
  }
  morphGeo.setAttribute("color", new THREE.BufferAttribute(morphColors, 3));

  function particleTexture(){
    const c=document.createElement("canvas"); c.width=c.height=64;
    const x=c.getContext("2d");
    const g=x.createRadialGradient(32,32,1,32,32,31);
    g.addColorStop(0,"rgba(255,255,235,1)");
    g.addColorStop(.18,"rgba(255,239,155,.98)");
    g.addColorStop(.48,"rgba(255,204,48,.72)");
    g.addColorStop(1,"rgba(255,176,0,0)");
    x.fillStyle=g;x.fillRect(0,0,64,64);
    return new THREE.CanvasTexture(c);
  }

  const morph = new THREE.Points(morphGeo, new THREE.PointsMaterial({
    map: particleTexture(),
    vertexColors: true,
    size: MOBILE ? 0.075 : 0.058,
    transparent: true,
    opacity: 0.92,
    alphaTest: 0.025,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
  universe.add(morph);

  /* Flores decorativas 3D: girasoles y flores amarillas intercalados. */
  const flowerGroup = new THREE.Group();
  universe.add(flowerGroup);
  const floatingFlowers = [];

  const decoPetalGeo = MOBILE
    ? new THREE.ShapeGeometry(petalShape, 5)
    : new THREE.ExtrudeGeometry(petalShape, {
        depth: 0.026,
        steps: 1,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelSize: 0.008,
        bevelThickness: 0.008
      });
  decoPetalGeo.center();

  /* Túnel de pétalos GPU: entrada y transiciones sin disparar draw calls. */
  const PETAL_STORM_COUNT = MOBILE ? (LOW_MEMORY ? 42 : 72) : 150;
  const petalStormMaterial = new THREE.MeshPhongMaterial({
    color:0xffd43a,
    emissive:0x8d4d00,
    emissiveIntensity:.30,
    shininess:90,
    transparent:true,
    opacity:0,
    side:THREE.DoubleSide,
    depthWrite:false,
    blending:THREE.AdditiveBlending
  });
  const petalStorm = new THREE.InstancedMesh(decoPetalGeo, petalStormMaterial, PETAL_STORM_COUNT);
  petalStorm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  petalStorm.frustumCulled = false;
  petalStorm.visible = false;
  scene.add(petalStorm);

  const stormDummy = new THREE.Object3D();
  const stormData = Array.from({length: PETAL_STORM_COUNT}, (_, i) => ({
    seed: (i * 0.61803398875) % 1,
    phase: i * 1.731,
    radius: 0.7 + ((i * 37) % 100) / 100 * (MOBILE ? 2.3 : 3.8),
    speed: 0.55 + ((i * 19) % 70) / 100,
    scale: 0.055 + ((i * 11) % 60) / 1000
  }));

  const decoCenterGeo = new THREE.SphereGeometry(0.28, MOBILE ? 10 : 14, MOBILE ? 7 : 10);
  const decoStemGeo = new THREE.CylinderGeometry(0.022, 0.032, 1.0, MOBILE ? 6 : 8);

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(-0.20, 0.12, -0.22, 0.42, 0, 0.58);
  leafShape.bezierCurveTo(0.22, 0.42, 0.20, 0.12, 0, 0);
  const decoLeafGeo = new THREE.ShapeGeometry(leafShape, 5);
  decoLeafGeo.center();

  const sunflowerPetalMat = new THREE.MeshPhongMaterial({
    color:0xffcf2f,emissive:0x8f4f00,emissiveIntensity:.10,shininess:95,
    side:THREE.DoubleSide,transparent:true,opacity:.98
  });
  const yellowPetalMat = new THREE.MeshPhongMaterial({
    color:0xffe46b,emissive:0xa46a00,emissiveIntensity:.08,shininess:105,
    side:THREE.DoubleSide,transparent:true,opacity:.97
  });
  const sunflowerCenterMat = new THREE.MeshPhongMaterial({
    color:0x4c2605,emissive:0x1a0b00,emissiveIntensity:.28,shininess:42
  });
  const yellowCenterMat = new THREE.MeshPhongMaterial({
    color:0xb86f0a,emissive:0x5d3100,emissiveIntensity:.20,shininess:64
  });
  const stemMat = new THREE.MeshPhongMaterial({color:0x5f7421,emissive:0x182006,emissiveIntensity:.12,shininess:42});
  const leafMat = new THREE.MeshPhongMaterial({color:0x6ea52b,emissive:0x1b3007,emissiveIntensity:.12,shininess:48,side:THREE.DoubleSide});
  const bowMat = new THREE.MeshPhongMaterial({color:0xd98a72,emissive:0x42170f,emissiveIntensity:.10,shininess:80});
  const bowCreamMat = new THREE.MeshPhongMaterial({color:0xffd9bd,emissive:0x573022,emissiveIntensity:.08,shininess:72});
  const wrapMat = new THREE.MeshPhongMaterial({color:0xf0c84b,emissive:0x6b4500,emissiveIntensity:.14,shininess:90});

  const FLOATING_FLOWER_MODELS = [
    {src:"assets/floating-flower-1.webp",type:"bouquet",visualScale:MOBILE?.53:.66},
    {src:"assets/floating-flower-2.webp",type:"single",visualScale:MOBILE?.58:.72},
    {src:"assets/floating-flower-3.webp",type:"cluster",visualScale:MOBILE?.55:.69}
  ];

  const floatingModelLoader=new THREE.TextureLoader();
  const floatingModelTextures=FLOATING_FLOWER_MODELS.map(model=>{
    const tex=floatingModelLoader.load(model.src);
    tex.colorSpace=THREE.SRGBColorSpace;
    tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    tex.magFilter=THREE.LinearFilter;
    tex.minFilter=THREE.LinearMipmapLinearFilter;
    return tex;
  });
  const floatingModelPlaneGeo=new THREE.PlaneGeometry(1,1);

  function makeFloatingBloom(modelIndex,index){
    const model=FLOATING_FLOWER_MODELS[modelIndex%FLOATING_FLOWER_MODELS.length];
    const texture=floatingModelTextures[modelIndex%floatingModelTextures.length];
    const g=new THREE.Group();

    // La imagen enviada por el usuario es ahora el modelo visual principal.
    const flowerMaterial=new THREE.MeshBasicMaterial({
      map:texture,
      transparent:true,
      alphaTest:.018,
      depthWrite:false,
      depthTest:true,
      side:THREE.DoubleSide,
      toneMapped:false,
      opacity:.985
    });
    const card=new THREE.Mesh(floatingModelPlaneGeo,flowerMaterial);
    const size=model.type==="single" ? 1.48 : model.type==="bouquet" ? 1.66 : 1.60;
    card.scale.set(size,size,1);
    card.position.z=.055;
    g.add(card);

    // Una segunda lámina muy tenue aporta profundidad sin sustituir la imagen original.
    const depthCard=new THREE.Mesh(
      floatingModelPlaneGeo,
      flowerMaterial.clone()
    );
    depthCard.material.opacity=.13;
    depthCard.scale.set(size*.965,size*.965,1);
    depthCard.position.z=-.035;
    depthCard.rotation.y=(index%2?1:-1)*.20;
    g.add(depthCard);

    const halo=new THREE.Sprite(new THREE.SpriteMaterial({
      map:glowTexture(),
      color:model.type==="single"?0xffd85d:0xffcc3e,
      transparent:true,
      opacity:MOBILE?.065:.095,
      depthWrite:false,
      blending:THREE.AdditiveBlending
    }));
    halo.position.z=-.16;
    const haloSize=model.type==="single"?1.82:2.05;
    halo.scale.set(haloSize,haloSize,1);
    g.add(halo);

    g.userData.modelType=model.type;
    g.userData.modelIndex=modelIndex%FLOATING_FLOWER_MODELS.length;
    g.userData.visualScale=model.visualScale;
    return g;
  }

  /* Usa directamente los tres modelos visuales enviados por el usuario. */
  const floatingCount=MOBILE?(LOW_MEMORY?10:12):20;
  for(let i=0;i<floatingCount;i++){
    const modelIndex=i%FLOATING_FLOWER_MODELS.length;
    const g=makeFloatingBloom(modelIndex,i);
    const type=g.userData.modelType;
    const a=((i+.45)/floatingCount)*Math.PI*2+.22;
    const r=(MOBILE?3.20:3.38)+(i%4)*(MOBILE?.38:.53);
    const y=-1.68+(i%7)*(MOBILE?.52:.56);
    const front=i%5===0?(MOBILE?.46:.78):0;
    const baseScale=g.userData.visualScale+(i%3)*.016;

    g.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.60+front);
    g.scale.setScalar(baseScale);
    flowerGroup.add(g);

    floatingFlowers.push({
      g,y,baseX:g.position.x,baseZ:g.position.z,baseScale,
      modelType:type,modelIndex,
      phase:i*.83,speed:.11+(i%4)*.018,
      tilt:(i%2?1:-1)*(.035+(i%3)*.012)
    });
  }

  /* Polen luminoso sutil alrededor de fotos y flores. */
  const pollenCount=MOBILE?(LOW_MEMORY?70:105):210;
  const pollenPos=new Float32Array(pollenCount*3);
  for(let i=0;i<pollenCount;i++){
    const a=Math.random()*Math.PI*2;
    const r=2.3+Math.random()*(MOBILE?3.2:4.5);
    pollenPos[i*3]=Math.cos(a)*r;
    pollenPos[i*3+1]=-2.1+Math.random()*4.8;
    pollenPos[i*3+2]=Math.sin(a)*r*.62+(Math.random()-.5)*1.2;
  }
  const pollenGeo=new THREE.BufferGeometry();
  pollenGeo.setAttribute("position",new THREE.BufferAttribute(pollenPos,3));
  const pollen=new THREE.Points(pollenGeo,new THREE.PointsMaterial({
    map:particleTexture(),color:0xffdc62,size:MOBILE?.045:.038,
    transparent:true,opacity:MOBILE?.34:.42,depthWrite:false,
    blending:THREE.AdditiveBlending,alphaTest:.02
  }));
  universe.add(pollen);


  function textTexture(text) {
    const c = document.createElement("canvas");
    const measure = c.getContext("2d");
    const fs = MOBILE ? 31 : 35;
    measure.font = "700 " + fs + "px Arial, sans-serif";
    const padX = MOBILE ? 28 : 34;
    const h = MOBILE ? 76 : 82;
    c.width = Math.min(1600, Math.ceil(measure.measureText(text).width + padX * 2));
    c.height = h;

    const x = c.getContext("2d");
    const r = 24;
    const grd = x.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "rgba(25,20,5,.82)");
    grd.addColorStop(1, "rgba(5,4,1,.62)");
    x.fillStyle = grd;
    x.strokeStyle = "rgba(255,219,93,.60)";
    x.lineWidth = 2;

    x.beginPath();
    x.moveTo(r, 1);
    x.lineTo(c.width-r, 1);
    x.quadraticCurveTo(c.width-1,1,c.width-1,r);
    x.lineTo(c.width-1,h-r);
    x.quadraticCurveTo(c.width-1,h-1,c.width-r,h-1);
    x.lineTo(r,h-1);
    x.quadraticCurveTo(1,h-1,1,h-r);
    x.lineTo(1,r);
    x.quadraticCurveTo(1,1,r,1);
    x.closePath();
    x.fill();
    x.stroke();

    x.shadowColor = "rgba(255,195,0,.92)";
    x.shadowBlur = 14;
    x.fillStyle = "#fff1ad";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = "700 " + fs + "px Arial, sans-serif";
    x.fillText(text, c.width/2, h/2 + 1);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return {tex,ratio:c.width/c.height};
  }

  const phraseGroup = new THREE.Group();
  universe.add(phraseGroup);
  const phraseData = [];

  // Las frases forman una constelación legible alrededor del centro.
  const visiblePhrases = MOBILE ? PHRASES.slice(0,24) : PHRASES;

  visiblePhrases.forEach((txt,i) => {
    const {tex,ratio} = textTexture(txt);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map:tex,transparent:true,depthWrite:false,opacity:MOBILE?.70:.76
    }));
    const total=visiblePhrases.length;
    const a=i/total*Math.PI*2+i*.19;
    const r=(MOBILE?4.70:4.95)+(i%4)*(MOBILE?.48:.68);
    const yBands=MOBILE?[-1.55,-.78,.05,.82,1.58]:[-1.65,-.92,-.20,.52,1.24,1.92];
    const y=yBands[i%yBands.length];
    const h=MOBILE?.175:.225;
    s.scale.set(h*ratio,h,1);
    s.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.66);
    phraseGroup.add(s);
    phraseData.push({s,y,phase:i*.91,baseX:s.position.x,baseZ:s.position.z});
  });

  const photoGroup = new THREE.Group();
  universe.add(photoGroup);
  const photoData = [];
  const loader = new THREE.TextureLoader();
  SCENE_PHOTOS.forEach((src,i) => loader.load(src, tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    const ratio = tex.image.width / tex.image.height;
    const base = MOBILE ? .78 : 1.0;
    let w,h;
    if (ratio >= 1) { w=Math.min(1.4,base*1.22); h=w/ratio; }
    else { h=Math.min(1.4,base*1.28); w=h*ratio; }
    w=Math.max(w,.64); h=Math.max(h,.78);

    const backing = new THREE.Mesh(new THREE.PlaneGeometry(w+.14,h+.14),new THREE.MeshPhysicalMaterial({
      color:0x4a3608,metalness:.52,roughness:.24,clearcoat:1,clearcoatRoughness:.18,
      transparent:true,opacity:.62,side:THREE.DoubleSide
    }));
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(w+.075,h+.075),new THREE.MeshBasicMaterial({
      color:0xffd83d,transparent:true,opacity:.34,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
    }));
    const card = new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({
      map:tex,side:THREE.DoubleSide,toneMapped:false
    }));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w*.985,h*.985),new THREE.MeshBasicMaterial({
      color:0xfff4cc,transparent:true,opacity:.045,side:THREE.DoubleSide,
      blending:THREE.AdditiveBlending,depthWrite:false
    }));
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(w+.11,h+.11)),
      new THREE.LineBasicMaterial({color:0xffe477,transparent:true,opacity:.62,blending:THREE.AdditiveBlending})
    );
    const photoHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map:glowTexture(),color:0xffc72e,transparent:true,opacity:MOBILE?.055:.085,
      blending:THREE.AdditiveBlending,depthWrite:false
    }));
    photoHalo.scale.set(w*1.85,h*1.85,1);
    photoHalo.position.z=-.08;
    backing.position.z=-.038;
    frame.position.z=-.020;
    glass.position.z=.012;
    edge.position.z=.022;
    card.add(photoHalo, backing, frame, glass, edge);

    const a=i/SCENE_PHOTOS.length*Math.PI*2+.25, r=(MOBILE?3.25:3.25)+(i%2)*(MOBILE?.82:1.35), y=-1.15+(i%5)*.68;
    card.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.74);
    card.rotation.y=-a+Math.PI/2;
    photoGroup.add(card);
    photoData.push({
      card,y,phase:i*.8,baseX:card.position.x,baseZ:card.position.z,
      baseRY:card.rotation.y,glass,photoHalo,edge
    });
  }));

  let shapeIndex=0,nextShape=1;
  const HOLD=6500, MORPH=4200;

  function showFinale(){
    if (finaleShown || !finale) return;
    finaleShown = true;
    storyPaused = true;
    finale.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => finale.classList.add("show"));
  }

  function setShapeUI(i){
    shapeLabel.style.opacity="0";
    shapeLabel.style.transform="translateY(5px)";

    setTimeout(()=>{
      shapeLabel.textContent=SHAPE_LABELS[i];
      heroTitle.textContent=HERO_TITLES[i];
      shapeLabel.style.opacity="1";
      shapeLabel.style.transform="translateY(0)";
    },180);

    dots.forEach((d,j)=>d.classList.toggle("on",j===i));
  }

  let targetRY=0,targetRX=-.035,ry=0,rx=-.035,drag=false,lastX=0,lastY=0,pinch=0;
  canvas.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId)});
  canvas.addEventListener("pointermove",e=>{if(!drag)return;targetRY+=(e.clientX-lastX)*.0055;targetRX+=(e.clientY-lastY)*.0028;targetRX=THREE.MathUtils.clamp(targetRX,-.34,.3);lastX=e.clientX;lastY=e.clientY});
  canvas.addEventListener("pointerup",()=>drag=false);
  canvas.addEventListener("pointercancel",()=>drag=false);
  canvas.addEventListener("wheel",e=>{e.preventDefault();cameraZTarget=THREE.MathUtils.clamp(cameraZTarget+e.deltaY*.006,MOBILE?9.5:7.3,MOBILE?15.5:14.2)},{passive:false});
  canvas.addEventListener("touchmove",e=>{
    if(e.touches.length===2){
      const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);
      if(pinch) cameraZTarget=THREE.MathUtils.clamp(cameraZTarget-(d-pinch)*.014,MOBILE?9.5:7.3,MOBILE?15.5:14.2);
      pinch=d;
    }
  },{passive:true});
  canvas.addEventListener("touchend",()=>pinch=0,{passive:true});

  const clock=new THREE.Clock();
  const smooth=t=>t*t*t*(t*(t*6-15)+10);

  function animate(now){
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();

    if(!drag && !REDUCED_MOTION) targetRY += experienceStarted ? (MOBILE ? .00075 : .00115) : .00045;
    ry+=(targetRY-ry)*.06;
    rx+=(targetRX-rx)*.06;
    universe.rotation.y=ry;
    universe.rotation.x=rx;

    const introRaw = experienceStarted
      ? THREE.MathUtils.clamp((now - cinematicStart) / 2800, 0, 1)
      : 1;
    const introBoost = experienceStarted ? 1 - smooth(introRaw) : 0;
    entryEnergy = experienceStarted ? Math.max(0, 1 - smooth(THREE.MathUtils.clamp((now-cinematicStart)/4800,0,1))) : 0;
    const cinematicZ = cameraZTarget + introBoost * (MOBILE ? 3.0 : 4.1);
    camera.position.z+=(cinematicZ-camera.position.z)*.075;
    camera.position.x=Math.sin(t*.22)*(MOBILE?.03:.13)+pointerNX*(MOBILE?.055:.16);
    camera.position.y=.05+Math.cos(t*.27)*(MOBILE?.018:.05)-pointerNY*(MOBILE?.035:.10);
    camera.lookAt(pointerNX*(MOBILE?.025:.07),-.15-pointerNY*(MOBILE?.018:.045),0);

    if(experienceStarted && !storyPaused){
      const elapsed=now-morphStart;
      const local=now-morphStart;

      if(shapeIndex===4 && !finaleShown && local>5200){
        showFinale();
      }

      if(!storyPaused && elapsed>HOLD+MORPH){
        shapeIndex=nextShape;
        nextShape=(nextShape+1)%targets.length;
        morphStart=now;
        setShapeUI(shapeIndex);
      }
      if(!storyPaused && local>HOLD){
        const raw=Math.min(1,(local-HOLD)/MORPH);
        const from=targets[shapeIndex],to=targets[nextShape],pos=morph.geometry.attributes.position.array;
        for(let i=0;i<PARTICLES;i++){
          const j=i*3;
          const delay=((i*37)%101)/101*0.14;
          const localRaw=THREE.MathUtils.clamp((raw-delay)/(1-delay),0,1);
          const q=smooth(localRaw);
          const arc=Math.sin(q*Math.PI);
          const mx=from[i][0]+(to[i][0]-from[i][0])*q;
          const my=from[i][1]+(to[i][1]-from[i][1])*q;
          const mz=from[i][2]+(to[i][2]-from[i][2])*q;
          const phase=i*0.61803398875;
          const sideways=Math.sin(phase)*arc*(MOBILE?0.10:0.15);
          pos[j]=mx+sideways;
          pos[j+1]=my+arc*(0.12+((i%9)/9)*(MOBILE?0.12:0.18));
          pos[j+2]=mz+Math.cos(phase*1.7)*arc*(MOBILE?0.10:0.16);
        }
        morph.geometry.attributes.position.needsUpdate=true;
      }
    }

    const phaseLocal=now-morphStart;
    const transitionRaw=phaseLocal>HOLD ? Math.min(1,(phaseLocal-HOLD)/MORPH) : 0;
    const transitionQ=transitionRaw>0 ? smooth(transitionRaw) : 0;
    transitionEnergy=transitionRaw>0 ? Math.sin(transitionRaw*Math.PI) : 0;
    finaleEnergy=shapeIndex===4 ? smooth(THREE.MathUtils.clamp((phaseLocal-1150)/2300,0,1)) : 0;
    const flowerVisibility=
      shapeIndex===0 ? 1-transitionQ :
      nextShape===0 ? transitionQ : 0;

    // La flor abre y respira; durante el morph sus petalos parecen soltarse hacia las particulas.
    const bloomBreath=REDUCED_MOTION?1:1+Math.sin(t*1.25)*0.018;
    centralBloom.visible=flowerVisibility>0.012;
    centralBloom.scale.setScalar(bloomBreath*(0.58+flowerVisibility*0.42));
    centralBloom.position.y=0.18+(REDUCED_MOTION?0:Math.sin(t*.86)*0.025);
    bloomGlow.material.opacity=(0.05+flowerVisibility*0.13)+(REDUCED_MOTION?0:Math.sin(t*1.1)*0.012);
    bloomLight.intensity=(MOBILE?0.72:0.94)+flowerVisibility*(MOBILE?0.38:0.52);
    bloomCenter.material.emissiveIntensity=0.20+flowerVisibility*0.24;
    bloomCenter.material.opacity=0.08+flowerVisibility*0.92;
    seedMaterial.opacity=0.05+flowerVisibility*0.95;

    bloomPetals.forEach((o,i)=>{
      const open=0.91+flowerVisibility*0.09;
      const drift=(1-flowerVisibility)*0.22;
      const wobble=REDUCED_MOTION?0:Math.sin(t*.7+o.phase)*0.018;
      const radius=o.radius*open+drift;
      o.petal.position.x=Math.cos(o.angle)*radius;
      o.petal.position.y=Math.sin(o.angle)*radius+wobble;
      o.petal.position.z=(i%2?0.04:-0.02)+(1-flowerVisibility)*0.05;
      o.petal.scale.set(o.baseX*(.94+flowerVisibility*.06),o.baseY*(.90+flowerVisibility*.10),o.baseZ);
      o.petal.material.opacity=0.10+flowerVisibility*0.88;
      o.petal.rotation.x=o.baseTilt+Math.sin(o.angle)*0.08+(REDUCED_MOTION?0:Math.sin(t*.55+o.phase)*0.025);
      o.petal.rotation.y=Math.cos(o.angle)*0.07+(REDUCED_MOTION?0:Math.sin(t*.43+o.phase)*0.022);
    });

    const holoAlpha = REDUCED_MOTION
      ? 0
      : THREE.MathUtils.clamp(entryEnergy*.42 + transitionEnergy*.56 + secretPulse*.32 + finaleEnergy*.20,0,.82);
    hologramGroup.visible = holoAlpha > .012;
    hologramGroup.position.y = centralBloom.position.y;
    hologramGroup.rotation.z = t*.055;
    hologramGroup.rotation.y = Math.sin(t*.32)*.07;
    const holoScale = 1 + transitionEnergy*.10 + entryEnergy*.07 + secretPulse*.08;
    hologramGroup.scale.setScalar(holoScale);
    holoPetalMaterial.uniforms.uTime.value = t;
    holoPetalMaterial.uniforms.uAlpha.value = holoAlpha;
    holoCenterMaterial.opacity = holoAlpha*.16;
    holoRingA.material.opacity = holoAlpha*.22;
    holoRingB.material.opacity = holoAlpha*.12;
    holoRingA.rotation.z = t*.18;
    holoRingB.rotation.z = -t*.13;
    holoRingA.scale.setScalar(1+transitionEnergy*.18);
    holoRingB.scale.setScalar(1+entryEnergy*.24+finaleEnergy*.10);
    bloomLight.intensity += (transitionEnergy*.38 + entryEnergy*.22 + finaleEnergy*.12);

    const stormEnergy = REDUCED_MOTION
      ? 0
      : THREE.MathUtils.clamp(entryEnergy*.98 + transitionEnergy*.82 + finaleEnergy*.34 + secretPulse*.24,0,1);
    petalStorm.visible = stormEnergy > .012;
    petalStormMaterial.opacity = stormEnergy*.72;
    if(petalStorm.visible){
      stormData.forEach((o,i)=>{
        const travel=(o.seed+t*(.085+o.speed*.045))%1;
        const z=5.4-travel*13.2;
        const vortex=o.phase+t*(.48+o.speed*.22)+travel*4.2;
        const radial=o.radius*(.56+travel*.82);
        stormDummy.position.set(
          Math.cos(vortex)*radial + pointerNX*.18,
          Math.sin(vortex*1.17)*radial*.54 - pointerNY*.12,
          z
        );
        stormDummy.rotation.set(
          vortex*.7+t*.4,
          vortex*1.15-t*.32,
          vortex+t*.62
        );
        const near=Math.sin(Math.PI*travel);
        const sc=o.scale*(.70+near*.92)*stormEnergy;
        stormDummy.scale.set(sc,sc*(.80+o.seed*.45),sc);
        stormDummy.updateMatrix();
        petalStorm.setMatrixAt(i,stormDummy.matrix);
      });
      petalStorm.instanceMatrix.needsUpdate=true;
    }

    if(burst>0){burst*=.92;morph.scale.setScalar(1+burst*.24);glow.material.opacity=.14+burst*.16}
    else{morph.scale.setScalar(1+(REDUCED_MOTION?0:Math.sin(t*1.55)*.012));glow.material.opacity=.105+(REDUCED_MOTION?0:Math.sin(t*.9)*.018)}

    // Sin efecto planeta: solo una inclinacion casi imperceptible.
    morph.rotation.y=REDUCED_MOTION?0:Math.sin(t*.20)*.035;
    morph.rotation.x=REDUCED_MOTION?0:Math.sin(t*.17)*.012;
    farStars.rotation.y=REDUCED_MOTION?0:t*.0024;
    nearStars.rotation.y=REDUCED_MOTION?0:-t*.0042;
    farStars.material.opacity=(MOBILE?.48:.52)+(REDUCED_MOTION?0:Math.sin(t*.22)*.055);
    nearStars.material.opacity=(MOBILE?.65:.70)+(REDUCED_MOTION?0:Math.sin(t*.47+1.2)*.075);
    glow.scale.setScalar((MOBILE?6.2:6.8)+(REDUCED_MOTION?0:Math.sin(t*.8)*.14));
    updateFlowTrails(t);
    flowGroup.rotation.y=REDUCED_MOTION?0:Math.sin(t*.12)*.045;

    if(secretPulse>0) secretPulse*=.91;
    floatingFlowers.forEach(o=>{
      const lift=REDUCED_MOTION?0:Math.sin(t*o.speed+o.phase)*.085;
      const sway=REDUCED_MOTION?0:Math.sin(t*.10+o.phase)*.055;
      const depth=REDUCED_MOTION?0:Math.cos(t*.085+o.phase)*.045;
      o.g.position.y=o.y+lift;
      o.g.position.x=o.baseX+sway;
      o.g.position.z=o.baseZ+depth;

      // Compensa gran parte del giro del universo para que la flor siga legible,
      // pero conserva una inclinacion sutil que deja ver su volumen 3D.
      o.g.rotation.y=-ry+(REDUCED_MOTION?0:Math.sin(t*.13+o.phase)*.08);
      o.g.rotation.x=-rx+(REDUCED_MOTION?0:Math.cos(t*.11+o.phase)*.045);
      o.g.rotation.z=o.tilt+(REDUCED_MOTION?0:Math.sin(t*.17+o.phase)*.045);

      const pulse=(1+(REDUCED_MOTION?0:Math.sin(t*.31+o.phase)*.025))*(secretPulse>0?1+secretPulse*.20:1);
      o.g.scale.setScalar(o.baseScale*pulse);
    });
    pollen.rotation.y=REDUCED_MOTION?0:t*.012;
    pollen.position.y=REDUCED_MOTION?0:Math.sin(t*.27)*.04;
    phraseData.forEach(o=>{
      o.s.position.y=o.y+Math.sin(t*.42+o.phase)*.045;
      o.s.position.x=o.baseX+Math.sin(t*.18+o.phase)*.028;
      o.s.position.z=o.baseZ+Math.cos(t*.16+o.phase)*.025;
      o.s.material.opacity=.82+(Math.sin(t*.58+o.phase)+1)*.065;
    });
    photoData.forEach(o=>{
      o.card.position.y=o.y+Math.sin(t*.58+o.phase)*.09-pointerNY*(MOBILE?.015:.035);
      o.card.position.x=o.baseX+pointerNX*(MOBILE?.025:.065)+Math.sin(t*.18+o.phase)*.022;
      o.card.position.z=o.baseZ+Math.cos(t*.16+o.phase)*.025;
      o.card.rotation.y=o.baseRY+pointerNX*(MOBILE?.018:.045)+Math.sin(t*.22+o.phase)*.018;
      o.card.rotation.x=-pointerNY*(MOBILE?.012:.032)+Math.cos(t*.19+o.phase)*.010;
      o.card.rotation.z=Math.sin(t*.35+o.phase)*.025;
      o.glass.material.opacity=.035+(Math.sin(t*.82+o.phase)+1)*.018+transitionEnergy*.025;
      o.photoHalo.material.opacity=(MOBILE?.045:.07)+(Math.sin(t*.43+o.phase)+1)*.018+finaleEnergy*.025;
      o.edge.material.opacity=.48+(Math.sin(t*.61+o.phase)+1)*.10;
    });

    renderer.render(scene,camera);
  }
  requestAnimationFrame(animate);
})();