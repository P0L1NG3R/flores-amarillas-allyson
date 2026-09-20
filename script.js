(() => {
  "use strict";

  const MOBILE = matchMedia("(max-width: 650px)").matches;
  const PHOTOS = Array.from({length: 9}, (_, i) => "assets/foto" + (i + 1) + ".jpg");
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

  const $ = q => document.querySelector(q);
  const canvas = $("#galaxy");
  const start = $("#start");
  const startBtn = $("#startBtn");
  const musicBtn = $("#music");
  const letterBtn = $("#letterBtn");
  const letter = $("#letter");
  const closeBtn = $("#close");
  const shapeLabel = $("#shapeLabel");
  const dots = [...document.querySelectorAll(".progress-dots i")];

  let experienceStarted = false;
  let morphStart = performance.now();
  let burst = 0;

  function closeLetter() {
    letter.classList.remove("show");
    letter.setAttribute("aria-hidden", "true");
  }
  letterBtn.addEventListener("click", () => {
    letter.classList.add("show");
    letter.setAttribute("aria-hidden", "false");
  });
  closeBtn.addEventListener("click", closeLetter);
  letter.addEventListener("click", e => { if (e.target === letter) closeLetter(); });
  addEventListener("keydown", e => { if (e.key === "Escape") closeLetter(); });

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

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.35 : 1.8));
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

  const farStars = starField(MOBILE ? 1050 : 2400, 10, 38, 0.038, 0.55);
  const nearStars = starField(MOBILE ? 350 : 720, 5, 17, 0.052, 0.74);

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
  glow.scale.set(8.2, 8.2, 1);
  glow.material.opacity = 0.22;
  universe.add(glow);

  /* Holograma central mejorado */
  const ambientLight = new THREE.AmbientLight(0xffefbc, 0.42);
  scene.add(ambientLight);
  const holoLight = new THREE.PointLight(0xffd33d, 2.15, 28, 2);
  holoLight.position.set(0, 0.5, 4);
  scene.add(holoLight);

  const holoCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(MOBILE ? 0.48 : 0.56, 2),
    new THREE.MeshPhongMaterial({
      color: 0xffd84a,
      emissive: 0xf6b200,
      emissiveIntensity: 1.25,
      transparent: true,
      opacity: 0.26,
      shininess: 110
    })
  );
  holoCore.position.set(0, 0.22, 0.08);
  universe.add(holoCore);

  const holoShell = new THREE.Mesh(
    new THREE.SphereGeometry(MOBILE ? 0.76 : 0.88, 26, 26),
    new THREE.MeshPhongMaterial({
      color: 0xffefb0,
      emissive: 0xffd84a,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.065,
      side: THREE.DoubleSide
    })
  );
  holoShell.position.copy(holoCore.position);
  universe.add(holoShell);

  const holoRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.016, 10, 120),
    new THREE.MeshBasicMaterial({color:0xffdb4e,transparent:true,opacity:.48,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  holoRing1.rotation.x = 1.18;
  holoRing1.position.y = 0.16;
  universe.add(holoRing1);

  const holoRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.38, 0.012, 10, 120),
    new THREE.MeshBasicMaterial({color:0xffc423,transparent:true,opacity:.30,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  holoRing2.rotation.x = 0.56;
  holoRing2.rotation.y = 0.92;
  holoRing2.position.y = 0.18;
  universe.add(holoRing2);

  const holoRing3 = new THREE.Mesh(
    new THREE.TorusGeometry(1.68, 0.009, 10, 120),
    new THREE.MeshBasicMaterial({color:0xffef9a,transparent:true,opacity:.19,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  holoRing3.rotation.x = 1.5;
  holoRing3.rotation.z = 0.42;
  holoRing3.position.y = 0.18;
  universe.add(holoRing3);

  const holoBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, MOBILE ? 0.92 : 1.08, 3.4, 48, 1, true),
    new THREE.MeshBasicMaterial({
      color:0xffd84d,
      transparent:true,
      opacity:.035,
      side:THREE.DoubleSide,
      blending:THREE.AdditiveBlending,
      depthWrite:false
    })
  );
  holoBeam.position.y = -0.55;
  universe.add(holoBeam);

  const pedestal1 = new THREE.Mesh(
    new THREE.TorusGeometry(MOBILE ? 0.9 : 1.05, 0.022, 10, 120),
    new THREE.MeshBasicMaterial({color:0xffd84d,transparent:true,opacity:.46,blending:THREE.AdditiveBlending})
  );
  pedestal1.rotation.x = Math.PI / 2;
  pedestal1.position.y = -2.25;
  universe.add(pedestal1);

  const pedestal2 = new THREE.Mesh(
    new THREE.TorusGeometry(MOBILE ? 1.22 : 1.42, 0.011, 10, 120),
    new THREE.MeshBasicMaterial({color:0xffb900,transparent:true,opacity:.23,blending:THREE.AdditiveBlending})
  );
  pedestal2.rotation.x = Math.PI / 2;
  pedestal2.position.y = -2.25;
  universe.add(pedestal2);

  const PARTICLES = MOBILE ? 1800 : 3600;

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
      const f = Math.sqrt(Math.random());
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      a.push([x * 0.064 * f, y * 0.064 * f + 0.25, (Math.random() - 0.5) * 0.48]);
    }
    return a;
  }

  function flowerShape() {
    const a = [];
    for (let i = 0; i < PARTICLES; i++) {
      const t = Math.random() * Math.PI * 2;
      const center = Math.random() < 0.28;
      const r = center ? Math.sqrt(Math.random()) * 0.63 :
        (0.62 + Math.random() * 0.58) * (0.75 + 0.42 * Math.pow(Math.abs(Math.cos(8 * t)), 0.62));
      a.push([Math.cos(t) * r * 2.0, Math.sin(t) * r * 2.0 + 0.25, (Math.random() - 0.5) * 0.34]);
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
    x.font = "900 170px Arial Black, Arial";
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
  const morph = new THREE.Points(morphGeo, new THREE.PointsMaterial({
    color: 0xffdc43, size: MOBILE ? 0.046 : 0.038, transparent: true,
    opacity: 0.97, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  universe.add(morph);

  function flowerTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    x.translate(128,128);
    x.shadowColor = "rgba(255,201,0,.8)";
    x.shadowBlur = 10;
    for (let i = 0; i < 18; i++) {
      x.save();
      x.rotate(i * Math.PI * 2 / 18);
      const g = x.createLinearGradient(0,-15,0,-98);
      g.addColorStop(0,"#ffac00");
      g.addColorStop(.55,"#ffd529");
      g.addColorStop(1,"#fff1a1");
      x.fillStyle = g;
      x.beginPath();
      x.ellipse(0,-61,16.5,47,0,0,Math.PI*2);
      x.fill();
      x.restore();
    }
    x.shadowBlur = 0;
    x.fillStyle = "#5f3800";
    x.beginPath(); x.arc(0,0,42,0,Math.PI*2); x.fill();
    for (let i=0;i<90;i++) {
      const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*34;
      x.fillStyle=i%3?"#c98a00":"#f7c933";
      x.beginPath();x.arc(Math.cos(a)*r,Math.sin(a)*r,1.6,0,Math.PI*2);x.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const flowerTex = flowerTexture();
  const flowerGroup = new THREE.Group();
  universe.add(flowerGroup);
  const floatingFlowers = [];
  for (let i = 0; i < (MOBILE ? 12 : 22); i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map:flowerTex,transparent:true,depthWrite:false}));
    const a = Math.random()*Math.PI*2, r = 3.2 + Math.random()*4.7, y = -1.6 + Math.random()*4.9, sc = 0.34 + Math.random()*0.45;
    s.position.set(Math.cos(a)*r, y, (Math.random()-.5)*6.2);
    s.scale.set(sc,sc,1);
    flowerGroup.add(s);
    floatingFlowers.push({s,y,phase:Math.random()*7,speed:.23+Math.random()*.35});
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
    if (MOBILE && i % 2 === 1) return;
    const {tex,ratio} = textTexture(txt);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map:tex,transparent:true,depthWrite:false,opacity:.91
    }));
    const visibleIndex = MOBILE ? Math.floor(i/2) : i;
    const total = MOBILE ? Math.ceil(PHRASES.length/2) : PHRASES.length;
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
  PHOTOS.forEach((src,i) => loader.load(src, tex => {
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
    const a=i/PHOTOS.length*Math.PI*2+.25, r=(MOBILE?3.0:3.25)+(i%2)*1.35, y=-1.25+(i%5)*.72;
    card.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.74);
    card.rotation.y=-a+Math.PI/2;
    photoGroup.add(card);
    photoData.push({card,y,phase:i*.8});
  }));

  const spiralPts=[];
  const spiralN=MOBILE?1000:2200;
  for(let i=0;i<spiralN;i++){
    const u=i/spiralN,t=u*Math.PI*21,r=.06+u*5;
    spiralPts.push([Math.cos(t)*r,-2.42+(Math.random()-.5)*.07,Math.sin(t)*r*.68]);
  }
  const spiral=pointsObject(spiralPts,.029,0xffc820,.7);
  universe.add(spiral);

  let shapeIndex=0,nextShape=1;
  const HOLD=3300, MORPH=2100;

  function setShapeUI(i){
    shapeLabel.style.opacity="0";
    shapeLabel.style.transform="translateY(5px)";
    setTimeout(()=>{
      shapeLabel.textContent=SHAPE_LABELS[i];
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
  const smooth=t=>t*t*(3-2*t);

  function animate(now){
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();

    if(!drag) targetRY += experienceStarted ? .0031 : .0008;
    ry+=(targetRY-ry)*.06;
    rx+=(targetRX-rx)*.06;
    universe.rotation.y=ry;
    universe.rotation.x=rx;

    camera.position.z+=(cameraZTarget-camera.position.z)*.075;
    camera.position.x=Math.sin(t*.22)*(MOBILE?.03:.13);
    camera.position.y=.05+Math.cos(t*.27)*(MOBILE?.018:.05);
    camera.lookAt(0,-.15,0);

    if(experienceStarted){
      const elapsed=now-morphStart;
      if(elapsed>HOLD+MORPH){
        shapeIndex=nextShape;
        nextShape=(nextShape+1)%targets.length;
        morphStart=now;
        setShapeUI(shapeIndex);
      }
      const local=now-morphStart;
      if(local>HOLD){
        const q=smooth(Math.min(1,(local-HOLD)/MORPH));
        const from=targets[shapeIndex],to=targets[nextShape],pos=morph.geometry.attributes.position.array;
        for(let i=0;i<PARTICLES;i++){
          const j=i*3;
          pos[j]=from[i][0]+(to[i][0]-from[i][0])*q;
          pos[j+1]=from[i][1]+(to[i][1]-from[i][1])*q;
          pos[j+2]=from[i][2]+(to[i][2]-from[i][2])*q;
        }
        morph.geometry.attributes.position.needsUpdate=true;
      }
    }

    if(burst>0){burst*=.92;morph.scale.setScalar(1+burst*.32);glow.material.opacity=.23+burst*.24}
    else{morph.scale.setScalar(1+Math.sin(t*2.0)*.02);glow.material.opacity=.19+Math.sin(t*1.3)*.035}

    morph.rotation.y=Math.sin(t*.45)*.15;
    farStars.rotation.y=t*.006;
    nearStars.rotation.y=-t*.013;
    spiral.rotation.y=t*.11;
    glow.scale.setScalar(8.1+Math.sin(t*.9)*.28);

    holoCore.rotation.x += .008;
    holoCore.rotation.y += .011;
    holoShell.rotation.x -= .0025;
    holoShell.rotation.y += .0035;
    holoRing1.rotation.z += .012;
    holoRing2.rotation.z -= .009;
    holoRing3.rotation.y += .006;
    holoRing3.rotation.z += .004;
    pedestal1.rotation.z += .0045;
    pedestal2.rotation.z -= .0032;
    holoCore.material.emissiveIntensity = 1.05 + (Math.sin(t*2.3)+1)*.18;
    holoShell.material.opacity = .055 + (Math.sin(t*1.7)+1)*.012;
    holoBeam.material.opacity = .026 + (Math.sin(t*1.15)+1)*.012;

    floatingFlowers.forEach(o=>{
      o.s.position.y=o.y+Math.sin(t*o.speed+o.phase)*.14;
      o.s.material.rotation=Math.sin(t*.3+o.phase)*.09;
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