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
    "Eres mi casualidad favorita",
    "Tu sonrisa ilumina mi universo",
    "Cada momento contigo vale oro",
    "Mis flores amarillas llevan tu nombre",
    "Contigo hasta lo simple se vuelve recuerdo",
    "Qué suerte coincidir contigo",
    "Lo bonito de mis días también tiene tu nombre"
  ];
  const SHAPE_LABELS = [
    "Una flor para ti 🌻",
    "Mi corazón es más bonito contigo 💛",
    "ALLYSON ✨",
    "Un ramo entero para ti 🌻",
    "Siempre tú 💛"
  ];

  const STORY_BEATS = [
    {
      step: "01 · PARA TI",
      title: "Todo empieza con una flor",
      text: "Porque hay detalles que merecen quedarse un poquito más."
    },
    {
      step: "02 · LO QUE SIENTO",
      title: "Después aparece un corazón",
      text: "No por casualidad: muchas de las cosas bonitas de mis días llevan algo de ti."
    },
    {
      step: "03 · TU NOMBRE",
      title: "Y el universo aprende a decir Allyson",
      text: "Entre miles de puntos de luz, hay un nombre que quería dejar en el centro."
    },
    {
      step: "04 · PARA RECORDAR",
      title: "Un ramo entero todavía se queda corto",
      text: "Así que guardé también algunos recuerdos que no quisiera perder."
    },
    {
      step: "05 · SIEMPRE TÚ",
      title: "Al final, todo vuelve al mismo lugar",
      text: "A la suerte de haberte encontrado y a todo lo que todavía nos queda por vivir."
    }
  ];

  const MEMORY_MOMENTS = [
    {photo: "assets/foto2.jpg", text: "Hay momentos pequeños que terminan significándolo todo."},
    {photo: "assets/foto5.jpg", text: "De todos los recuerdos, me gusta cómo se sienten cuando estás tú."},
    {photo: "assets/foto8.jpg", text: "Y lo mejor es que todavía nos quedan muchas historias por guardar."}
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
  const storyMoment = $("#storyMoment");
  const storyStep = $("#storyStep");
  const storyTitle = $("#storyTitle");
  const storyText = $("#storyText");
  const memorySpotlight = $("#memorySpotlight");
  const memoryImage = $("#memoryImage");
  const memoryCaption = $("#memoryCaption");
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
  let memoryTimer = null;
  let secretPulse = 0;

  function openLetter() {
    letter.classList.add("show");
    letter.setAttribute("aria-hidden", "false");
    memorySpotlight?.classList.remove("show");
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
    burst = 1;
    setTimeout(() => storyMoment?.classList.add("active"), 700);
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
      color, size, transparent: true, opacity, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true
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

  const farStars = starField(MOBILE ? (LOW_MEMORY ? 420 : 620) : 2100, 10, 38, 0.038, 0.52);
  const nearStars = starField(MOBILE ? (LOW_MEMORY ? 110 : 180) : 620, 5, 17, 0.052, 0.70);

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

  const petalGeo = new THREE.SphereGeometry(0.5, MOBILE ? 8 : 10, MOBILE ? 5 : 7);
  const bloomPetals = [];

  function addPetalRing(count, radius, scaleX, scaleY, scaleZ, zBase, colorA, colorB, offset = 0) {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + offset;
      const material = new THREE.MeshPhongMaterial({
        color: i % 2 ? colorA : colorB,
        emissive: 0x9b6100,
        emissiveIntensity: 0.13,
        shininess: 82,
        transparent: true,
        opacity: 0.96
      });
      const petal = new THREE.Mesh(petalGeo, material);
      petal.scale.set(scaleX, scaleY, scaleZ);
      petal.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, zBase + Math.sin(angle * 2) * 0.025);
      petal.rotation.z = angle - Math.PI / 2;
      petal.rotation.x = 0.10 + Math.sin(angle) * 0.08;
      centralBloom.add(petal);
      bloomPetals.push({
        petal,
        angle,
        radius,
        baseX: scaleX,
        baseY: scaleY,
        baseZ: scaleZ,
        phase: i * 0.53 + offset
      });
    }
  }

  addPetalRing(MOBILE ? 9 : 12, MOBILE ? 0.62 : 0.69, MOBILE ? 0.19 : 0.20, MOBILE ? 0.62 : 0.72, 0.075, -0.04, 0xffc51f, 0xffdf55, 0);
  addPetalRing(MOBILE ? 7 : 10, MOBILE ? 0.46 : 0.51, MOBILE ? 0.18 : 0.19, MOBILE ? 0.50 : 0.58, 0.082, 0.08, 0xffb611, 0xffd23a, Math.PI / (MOBILE ? 7 : 10));

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

  const PARTICLES = MOBILE ? (LOW_MEMORY ? 720 : 1050) : 3200;

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

  function sunflowerTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    x.translate(128,128);
    x.shadowColor = "rgba(255,190,0,.48)";
    x.shadowBlur = 13;

    // Petalos traseros: mas largos y suaves.
    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? 18 : 14;
      for (let i = 0; i < count; i++) {
        x.save();
        x.rotate(i * Math.PI * 2 / count + (ring ? .12 : 0));
        const g = x.createLinearGradient(0,-18,0,-105);
        g.addColorStop(0, ring ? "#e99a00" : "#f7ae00");
        g.addColorStop(.54, ring ? "#ffc51f" : "#ffd63a");
        g.addColorStop(1, ring ? "#ffe979" : "#fff1a4");
        x.fillStyle = g;
        x.beginPath();
        x.ellipse(0, ring ? -56 : -68, ring ? 14 : 12, ring ? 39 : 47, 0, 0, Math.PI*2);
        x.fill();
        x.restore();
      }
    }

    x.shadowBlur = 0;
    const cg=x.createRadialGradient(-10,-12,2,0,0,47);
    cg.addColorStop(0,"#8f5b08");cg.addColorStop(.55,"#5d3405");cg.addColorStop(1,"#2b1804");
    x.fillStyle=cg;x.beginPath();x.arc(0,0,44,0,Math.PI*2);x.fill();

    for (let i=0;i<150;i++) {
      const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*36;
      const s=1+Math.random()*1.5;
      x.fillStyle=i%4===0?"#ffd74a":i%2?"#c6840b":"#8f5707";
      x.beginPath();x.arc(Math.cos(a)*r,Math.sin(a)*r,s,0,Math.PI*2);x.fill();
    }

    x.strokeStyle="rgba(255,245,175,.34)";x.lineWidth=1.4;
    x.beginPath();x.arc(-7,-8,30,-2.8,-1.1);x.stroke();

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function yellowFlowerTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    x.translate(128,128);
    x.shadowColor = "rgba(255,210,55,.42)";
    x.shadowBlur = 10;

    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? 11 : 9;
      for (let i = 0; i < count; i++) {
        x.save();
        x.rotate(i / count * Math.PI * 2 + (ring ? .20 : 0));
        const g = x.createLinearGradient(0,-10,0,-92);
        g.addColorStop(0, ring ? "#ffc31e" : "#ffd332");
        g.addColorStop(.62, ring ? "#ffdd58" : "#ffe777");
        g.addColorStop(1, "#fff4b7");
        x.fillStyle = g;
        x.beginPath();
        x.ellipse(0, ring ? -49 : -60, ring ? 17 : 15, ring ? 35 : 43, 0, 0, Math.PI*2);
        x.fill();
        x.restore();
      }
    }

    x.shadowBlur = 0;
    const g = x.createRadialGradient(-5,-6,2,0,0,33);
    g.addColorStop(0,"#d38d16");
    g.addColorStop(.7,"#9a5c0a");
    g.addColorStop(1,"#603405");
    x.fillStyle=g;
    x.beginPath();x.arc(0,0,32,0,Math.PI*2);x.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const sunflowerTex = sunflowerTexture();
  const yellowFlowerTex = yellowFlowerTexture();
  const flowerGroup = new THREE.Group();
  universe.add(flowerGroup);
  const floatingFlowers = [];

  // Una flor decorativa entre cada foto: foto -> flor -> foto -> girasol.
  const floatingCount = SCENE_PHOTOS.length;
  for (let i = 0; i < floatingCount; i++) {
    const isSunflower = i % 2 === 1;
    const material = new THREE.SpriteMaterial({
      map: isSunflower ? sunflowerTex : yellowFlowerTex,
      transparent: true,
      depthWrite: false,
      opacity: MOBILE ? 0.78 : 0.88
    });
    const s = new THREE.Sprite(material);
    const a = ((i + 0.5) / floatingCount) * Math.PI * 2 + 0.25;
    const r = (MOBILE ? 3.55 : 3.6) + (i % 2) * (MOBILE ? 0.72 : 1.05);
    const y = -1.10 + (i % 5) * (MOBILE ? 0.64 : 0.70);
    const sc = isSunflower
      ? (MOBILE ? 0.37 : 0.48)
      : (MOBILE ? 0.30 : 0.38);

    s.position.set(Math.cos(a)*r, y, Math.sin(a)*r*.72);
    s.scale.set(sc,sc,1);
    flowerGroup.add(s);
    floatingFlowers.push({
      s,y,baseScale:sc,baseX:s.position.x,baseZ:s.position.z,
      phase:i*.91,speed:.13+Math.random()*.12,isSunflower
    });
  }


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

  PHRASES.forEach((txt,i) => {
    if (MOBILE && i % 3 !== 0) return;
    const {tex,ratio} = textTexture(txt);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map:tex,transparent:true,depthWrite:false,opacity:.91
    }));
    const visibleIndex = MOBILE ? Math.floor(i/3) : i;
    const total = MOBILE ? Math.ceil(PHRASES.length/3) : PHRASES.length;
    const a = visibleIndex/total*Math.PI*2 + visibleIndex*.21;
    const r = (MOBILE ? 4.35 : 4.55) + (visibleIndex%3)*(MOBILE ? .82 : 1.08);
    const yBands = MOBILE ? [-1.25,-.35,.55,1.45,2.25] : [-1.35,-.62,.12,.86,1.6,2.28];
    const y = yBands[visibleIndex % yBands.length];
    const h = MOBILE ? .235 : .285;
    s.scale.set(h*ratio,h,1);
    s.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.68);
    phraseGroup.add(s);
    phraseData.push({s,y,phase:visibleIndex*.83,baseX:s.position.x,baseZ:s.position.z});
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

    const frame = new THREE.Mesh(new THREE.PlaneGeometry(w+.07,h+.07),new THREE.MeshBasicMaterial({
      color:0xffd83d,transparent:true,opacity:.52,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
    }));
    const card = new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({
      map:tex,side:THREE.DoubleSide,toneMapped:false
    }));
    card.add(frame);
    frame.position.z=-.014;
    const a=i/SCENE_PHOTOS.length*Math.PI*2+.25, r=(MOBILE?3.25:3.25)+(i%2)*(MOBILE?.82:1.35), y=-1.15+(i%5)*.68;
    card.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.74);
    card.rotation.y=-a+Math.PI/2;
    photoGroup.add(card);
    photoData.push({card,y,phase:i*.8});
  }));

  let shapeIndex=0,nextShape=1;
  const HOLD=3300, MORPH=2100;

  function showMemory(memoryIndex){
    if (!memorySpotlight || !MEMORY_MOMENTS[memoryIndex]) return;
    const memory = MEMORY_MOMENTS[memoryIndex];
    if (memoryTimer) clearTimeout(memoryTimer);
    memorySpotlight.classList.remove("show");
    setTimeout(() => {
      memoryImage.src = memory.photo;
      memoryCaption.textContent = memory.text;
      memorySpotlight.setAttribute("aria-hidden", "false");
      memorySpotlight.classList.add("show");
    }, 220);
    memoryTimer = setTimeout(() => {
      memorySpotlight.classList.remove("show");
      memorySpotlight.setAttribute("aria-hidden", "true");
    }, 3300);
  }

  function showFinale(){
    if (finaleShown || !finale) return;
    finaleShown = true;
    storyPaused = true;
    memorySpotlight?.classList.remove("show");
    finale.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => finale.classList.add("show"));
  }

  function setShapeUI(i){
    const beat = STORY_BEATS[i];
    shapeLabel.style.opacity="0";
    shapeLabel.style.transform="translateY(5px)";
    if (storyMoment) storyMoment.classList.remove("active");

    setTimeout(()=>{
      shapeLabel.textContent=SHAPE_LABELS[i];
      shapeLabel.style.opacity="1";
      shapeLabel.style.transform="translateY(0)";

      if (beat) {
        storyStep.textContent = beat.step;
        storyTitle.textContent = beat.title;
        storyText.textContent = beat.text;
        heroTitle.textContent = i === 2 ? "Tu nombre, escrito entre estrellas" :
          i === 4 ? "Mi lugar favorito sigue siendo contigo" :
          "Un universo hecho de nuestros recuerdos";
        storyMoment?.classList.add("active");
      }
    },180);

    if (i === 1) setTimeout(() => showMemory(0), 1050);
    if (i === 2) setTimeout(() => showMemory(1), 1150);
    if (i === 3) setTimeout(() => showMemory(2), 1050);

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
  const smooth=t=>t*t*(3-2*t);

  function animate(now){
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();

    if(!drag && !REDUCED_MOTION) targetRY += experienceStarted ? (MOBILE ? .0017 : .0031) : .0008;
    ry+=(targetRY-ry)*.06;
    rx+=(targetRX-rx)*.06;
    universe.rotation.y=ry;
    universe.rotation.x=rx;

    camera.position.z+=(cameraZTarget-camera.position.z)*.075;
    camera.position.x=Math.sin(t*.22)*(MOBILE?.03:.13);
    camera.position.y=.05+Math.cos(t*.27)*(MOBILE?.018:.05);
    camera.lookAt(0,-.15,0);

    if(experienceStarted && !storyPaused){
      const elapsed=now-morphStart;
      const local=now-morphStart;

      if(shapeIndex===4 && !finaleShown && local>2450){
        showFinale();
      }

      if(!storyPaused && elapsed>HOLD+MORPH){
        shapeIndex=nextShape;
        nextShape=(nextShape+1)%targets.length;
        morphStart=now;
        setShapeUI(shapeIndex);
      }
      if(!storyPaused && local>HOLD){
        const q=smooth(Math.min(1,(local-HOLD)/MORPH));
        const breathe=Math.sin(q*Math.PI);
        const from=targets[shapeIndex],to=targets[nextShape],pos=morph.geometry.attributes.position.array;
        for(let i=0;i<PARTICLES;i++){
          const j=i*3;
          const mx=from[i][0]+(to[i][0]-from[i][0])*q;
          const my=from[i][1]+(to[i][1]-from[i][1])*q;
          const mz=from[i][2]+(to[i][2]-from[i][2])*q;
          const len=Math.hypot(mx,my)||1;
          const spread=breathe*(0.10+(i%7)*0.006);
          pos[j]=mx+(mx/len)*spread;
          pos[j+1]=my+(my/len)*spread;
          pos[j+2]=mz+breathe*Math.sin(i*1.73)*0.045;
        }
        morph.geometry.attributes.position.needsUpdate=true;
      }
    }

    const phaseLocal=now-morphStart;
    const transitionQ=phaseLocal>HOLD ? smooth(Math.min(1,(phaseLocal-HOLD)/MORPH)) : 0;
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
      o.petal.scale.set(o.baseX*(.96+flowerVisibility*.04),o.baseY*(.93+flowerVisibility*.07),o.baseZ);
      o.petal.material.opacity=0.12+flowerVisibility*0.84;
      o.petal.rotation.x=0.10+Math.sin(o.angle)*0.08+(REDUCED_MOTION?0:Math.sin(t*.55+o.phase)*0.018);
    });

    if(burst>0){burst*=.92;morph.scale.setScalar(1+burst*.24);glow.material.opacity=.14+burst*.16}
    else{morph.scale.setScalar(1+(REDUCED_MOTION?0:Math.sin(t*1.55)*.012));glow.material.opacity=.105+(REDUCED_MOTION?0:Math.sin(t*.9)*.018)}

    // Sin efecto planeta: solo una inclinacion casi imperceptible.
    morph.rotation.y=REDUCED_MOTION?0:Math.sin(t*.20)*.035;
    morph.rotation.x=REDUCED_MOTION?0:Math.sin(t*.17)*.012;
    farStars.rotation.y=REDUCED_MOTION?0:t*.003;
    nearStars.rotation.y=REDUCED_MOTION?0:-t*.005;
    glow.scale.setScalar((MOBILE?6.2:6.8)+(REDUCED_MOTION?0:Math.sin(t*.8)*.14));

    if(secretPulse>0) secretPulse*=.91;
    floatingFlowers.forEach(o=>{
      const lift=REDUCED_MOTION?0:Math.sin(t*o.speed+o.phase)*.075;
      const sway=REDUCED_MOTION?0:Math.sin(t*.11+o.phase)*.035;
      o.s.position.y=o.y+lift;
      o.s.position.x=o.baseX+sway;
      o.s.position.z=o.baseZ+(REDUCED_MOTION?0:Math.cos(t*.10+o.phase)*.025);
      o.s.material.rotation=REDUCED_MOTION?0:Math.sin(t*.16+o.phase)*.032;
      const pulse=secretPulse>0?1+secretPulse*.28:1;
      o.s.scale.setScalar(o.baseScale*pulse);
      o.s.material.opacity=Math.min(1,(MOBILE?.78:.88)+(secretPulse>0?secretPulse*.14:0));
    });
    phraseData.forEach(o=>{
      o.s.position.y=o.y+Math.sin(t*.42+o.phase)*.045;
      o.s.position.x=o.baseX+Math.sin(t*.18+o.phase)*.028;
      o.s.position.z=o.baseZ+Math.cos(t*.16+o.phase)*.025;
      o.s.material.opacity=.82+(Math.sin(t*.58+o.phase)+1)*.065;
    });
    photoData.forEach(o=>{
      o.card.position.y=o.y+Math.sin(t*.58+o.phase)*.09;
      o.card.rotation.z=Math.sin(t*.35+o.phase)*.025;
    });

    renderer.render(scene,camera);
  }
  requestAnimationFrame(animate);
})();