(() => {
  const PHOTOS = Array.from({ length: 9 }, (_, i) => "assets/foto" + (i + 1) + ".jpg");
  const PHRASES = [
    "Allyson, eres mi lugar favorito",
    "Mi mundo florece contigo",
    "Te elegiría una y mil veces",
    "Siempre tú, siempre nosotros",
    "Eres mi casualidad favorita",
    "Contigo, hasta lo simple se vuelve recuerdo",
    "Tu sonrisa ilumina mi universo",
    "Cada momento contigo vale oro",
    "Mis flores amarillas siempre llevarán tu nombre",
    "Gracias por coincidir conmigo",
    "Aquí siempre hay un lugar para ti",
    "Lo bonito de mis días también tiene tu nombre",
    "Que nunca nos falten motivos para sonreír",
    "Tú haces especial hasta lo cotidiano"
  ];

  const $ = (s) => document.querySelector(s);
  const canvas = $("#galaxy");
  const start = $("#start");
  const startBtn = $("#startBtn");
  const letter = $("#letter");
  const letterBtn = $("#letterBtn");
  const closeBtn = $("#close");
  const musicBtn = $("#music");

  startBtn.addEventListener("click", () => start.classList.add("hide"));
  letterBtn.addEventListener("click", () => {
    letter.classList.add("show");
    letter.setAttribute("aria-hidden", "false");
  });
  closeBtn.addEventListener("click", closeLetter);
  letter.addEventListener("click", (e) => { if (e.target === letter) closeLetter(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLetter(); });
  function closeLetter() {
    letter.classList.remove("show");
    letter.setAttribute("aria-hidden", "true");
  }
  musicBtn.addEventListener("click", () => {
    musicBtn.animate([{ transform: "scale(1)" }, { transform: "scale(1.16)" }, { transform: "scale(1)" }], { duration: 420 });
    alert("Si quieres, después añadimos la canción especial de ustedes como cancion.mp3 💛");
  });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040300, 0.052);

  const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.1, 10.5);

  const world = new THREE.Group();
  scene.add(world);

  const gold = new THREE.Color(0xffd84d);
  const softGold = new THREE.Color(0xffe88b);

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  function radialGlowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(128, 128, 2, 128, 128, 128);
    g.addColorStop(0, "rgba(255,246,170,1)");
    g.addColorStop(.1, "rgba(255,220,70,.95)");
    g.addColorStop(.34, "rgba(255,174,0,.32)");
    g.addColorStop(1, "rgba(255,160,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  const glowTex = radialGlowTexture();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc400, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(7.5, 7.5, 1);
  glow.position.set(0, -0.15, -1.2);
  glow.material.opacity = .28;
  world.add(glow);

  function makeStars(count, minR, maxR, size, opacity, color = gold) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = minR + Math.random() * (maxR - minR);
      const a = Math.random() * Math.PI * 2;
      const b = (Math.random() - .5) * Math.PI;
      pos[i * 3] = Math.cos(a) * Math.cos(b) * r;
      pos[i * 3 + 1] = Math.sin(b) * r * .72;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(b) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
  }

  const farStars = makeStars(innerWidth < 700 ? 1700 : 3000, 10, 35, .035, .62, softGold);
  const nearStars = makeStars(innerWidth < 700 ? 550 : 950, 5, 15, .048, .76, gold);

  function particleCloud(points, size = .035, color = gold, opacity = .92) {
    const arr = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      arr[i * 3] = p[0];
      arr[i * 3 + 1] = p[1];
      arr[i * 3 + 2] = p[2] || 0;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    return new THREE.Points(geo, mat);
  }

  function heartPoints(n = 2600) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = Math.random() * Math.PI * 2;
      const fill = Math.sqrt(Math.random());
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push([x * .052 * fill, y * .052 * fill + .5, (Math.random() - .5) * .42]);
    }
    return pts;
  }

  const heart = particleCloud(heartPoints(innerWidth < 700 ? 1700 : 3000), .034, 0xffdc42, .95);
  heart.position.set(0, .25, .25);
  heart.scale.set(1.24, 1.24, 1.24);
  world.add(heart);

  function makeGroundSpiral() {
    const pts = [];
    const n = innerWidth < 700 ? 1800 : 3300;
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const a = u * Math.PI * 22 + Math.random() * .25;
      const r = .08 + u * 4.7;
      const y = -2.28 + (Math.random() - .5) * .06;
      pts.push([Math.cos(a) * r, y, Math.sin(a) * r * .72]);
    }
    const g = particleCloud(pts, .028, 0xffcc27, .72);
    world.add(g);
    return g;
  }
  const spiral = makeGroundSpiral();

  function addRing(radius, y, tilt, opacity) {
    const geo = new THREE.TorusGeometry(radius, .012, 8, 180);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = tilt;
    m.position.y = y;
    world.add(m);
    return m;
  }
  const ring1 = addRing(3.2, -1.85, 1.2, .3);
  const ring2 = addRing(4.15, -1.95, 1.35, .18);

  function flowerTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    x.translate(128, 128);
    x.shadowColor = "rgba(255,201,0,.85)";
    x.shadowBlur = 12;
    for (let i = 0; i < 18; i++) {
      x.save();
      x.rotate(i * Math.PI * 2 / 18);
      const g = x.createLinearGradient(0, -16, 0, -98);
      g.addColorStop(0, "#ffb900");
      g.addColorStop(.55, "#ffd733");
      g.addColorStop(1, "#fff19a");
      x.fillStyle = g;
      x.beginPath();
      x.ellipse(0, -62, 17, 48, 0, 0, Math.PI * 2);
      x.fill();
      x.restore();
    }
    x.shadowBlur = 0;
    const cg = x.createRadialGradient(-12, -12, 4, 0, 0, 45);
    cg.addColorStop(0, "#936400");
    cg.addColorStop(.45, "#5f3800");
    cg.addColorStop(1, "#2e1800");
    x.fillStyle = cg;
    x.beginPath();
    x.arc(0, 0, 43, 0, Math.PI * 2);
    x.fill();
    for (let i = 0; i < 95; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 34;
      x.fillStyle = i % 3 ? "#c98a00" : "#f3c029";
      x.beginPath();
      x.arc(Math.cos(a) * r, Math.sin(a) * r, 1.7, 0, Math.PI * 2);
      x.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const flowerTex = flowerTexture();
  const flowerGroup = new THREE.Group();
  world.add(flowerGroup);
  const flowerData = [];
  const flowerCount = innerWidth < 700 ? 18 : 30;
  for (let i = 0; i < flowerCount; i++) {
    const mat = new THREE.SpriteMaterial({ map: flowerTex, transparent: true, depthWrite: false });
    const s = new THREE.Sprite(mat);
    const radius = 2.7 + Math.random() * 4.6;
    const angle = Math.random() * Math.PI * 2;
    const y = -1.4 + Math.random() * 4.5;
    const z = (Math.random() - .5) * 5.8;
    const scale = .34 + Math.random() * .42;
    s.position.set(Math.cos(angle) * radius, y, z);
    s.scale.set(scale, scale, scale);
    flowerGroup.add(s);
    flowerData.push({ s, baseY: y, phase: Math.random() * Math.PI * 2, spin: .2 + Math.random() * .5 });
  }

  function textTexture(text) {
    const c = document.createElement("canvas");
    const x = c.getContext("2d");
    const fontSize = 43;
    x.font = "600 " + fontSize + "px "Comic Sans MS", cursive";
    const padX = 30;
    c.width = Math.min(1500, Math.ceil(x.measureText(text).width + padX * 2));
    c.height = 88;
    const ctx = c.getContext("2d");
    ctx.font = "600 " + fontSize + "px "Comic Sans MS", cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255,197,0,.85)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#ffe98c";
    ctx.fillText(text, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { tex, ratio: c.width / c.height };
  }

  const textGroup = new THREE.Group();
  world.add(textGroup);
  const textData = [];
  PHRASES.forEach((text, i) => {
    const { tex, ratio } = textTexture(text);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .9 }));
    const ring = i % 3;
    const radius = 3.4 + ring * 1.05 + Math.random() * .75;
    const angle = (i / PHRASES.length) * Math.PI * 2 + ring * .45;
    const y = -1.3 + (i % 7) * .68 + (Math.random() - .5) * .25;
    const z = Math.sin(angle * 1.7) * 2.4 + (Math.random() - .5) * .7;
    const h = .23;
    s.scale.set(h * ratio, h, 1);
    s.position.set(Math.cos(angle) * radius, y, z);
    textGroup.add(s);
    textData.push({ s, phase: i * .63, baseY: y });
  });

  const photoGroup = new THREE.Group();
  world.add(photoGroup);
  const loader = new THREE.TextureLoader();
  const photoData = [];
  PHOTOS.forEach((src, i) => {
    loader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      const img = tex.image;
      const ratio = img.width / img.height;
      const baseH = 1.12;
      const w = Math.min(1.5, baseH * ratio);
      const h = Math.min(1.5, baseH / Math.max(.72, ratio));
      const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, opacity: .96, toneMapped: false });
      const card = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      const border = new THREE.Mesh(
        new THREE.PlaneGeometry(w + .08, h + .08),
        new THREE.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity: .5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
      );
      border.position.z = -.015;
      card.add(border);
      const a = (i / PHOTOS.length) * Math.PI * 2 + .25;
      const r = 3.1 + (i % 2) * 1.45;
      const y = -1.15 + (i % 5) * .78;
      card.position.set(Math.cos(a) * r, y, Math.sin(a) * r * .8);
      card.rotation.y = -a + Math.PI / 2;
      photoGroup.add(card);
      photoData.push({ card, baseY: y, phase: i * .8 });
    });
  });

  const stemPts = [];
  for (let s = 0; s < 6; s++) {
    const offset = (s - 2.5) * .18;
    for (let i = 0; i < 180; i++) {
      const u = i / 180;
      stemPts.push([
        offset + Math.sin(u * 4 + s) * .08,
        -2.05 + u * 1.8,
        (s - 2.5) * .05 + Math.cos(u * 5 + s) * .05
      ]);
    }
  }
  const stems = particleCloud(stemPts, .025, 0xffc515, .72);
  world.add(stems);

  for (let i = 0; i < 5; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flowerTex, transparent: true, depthWrite: false }));
    const x = (i - 2) * .36;
    s.position.set(x, -.1 + (i % 2) * .22, .2 + Math.abs(i - 2) * .08);
    s.scale.set(.54, .54, .54);
    world.add(s);
  }

  const targetRot = { x: -.04, y: 0 };
  let rotX = -.04, rotY = 0;
  let dragging = false;
  let lastX = 0, lastY = 0;
  let cameraZTarget = 10.5;
  let pinchDistance = 0;

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    targetRot.y += dx * .0045;
    targetRot.x += dy * .0025;
    targetRot.x = THREE.MathUtils.clamp(targetRot.x, -.36, .32);
    lastX = e.clientX;
    lastY = e.clientY;
  });
  canvas.addEventListener("pointerup", () => dragging = false);
  canvas.addEventListener("pointercancel", () => dragging = false);
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    cameraZTarget = THREE.MathUtils.clamp(cameraZTarget + e.deltaY * .006, 7.2, 14.2);
  }, { passive: false });
  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      if (pinchDistance) {
        cameraZTarget = THREE.MathUtils.clamp(cameraZTarget - (d - pinchDistance) * .016, 7.2, 14.2);
      }
      pinchDistance = d;
    }
  }, { passive: true });
  canvas.addEventListener("touchend", () => pinchDistance = 0, { passive: true });

  let mx = 0, my = 0;
  addEventListener("mousemove", (e) => {
    mx = (e.clientX / innerWidth - .5) * 2;
    my = (e.clientY / innerHeight - .5) * 2;
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!dragging) targetRot.y += .0019;
    rotY += (targetRot.y - rotY) * .055;
    rotX += (targetRot.x - rotX) * .055;
    world.rotation.y = rotY;
    world.rotation.x = rotX;

    camera.position.z += (cameraZTarget - camera.position.z) * .075;
    camera.position.x += (mx * .24 - camera.position.x) * .025;
    camera.position.y += (-my * .14 + .1 - camera.position.y) * .025;
    camera.lookAt(0, -.15, 0);

    farStars.rotation.y = t * .006;
    farStars.rotation.z = t * .002;
    nearStars.rotation.y = -t * .012;
    spiral.rotation.y = t * .08;
    ring1.rotation.z = t * .17;
    ring2.rotation.z = -t * .1;
    heart.rotation.y = Math.sin(t * .6) * .18;
    heart.scale.setScalar(1.24 + Math.sin(t * 2.2) * .025);
    glow.material.opacity = .24 + Math.sin(t * 1.7) * .055;
    glow.scale.setScalar(7.3 + Math.sin(t * 1.2) * .25);

    flowerData.forEach(({ s, baseY, phase, spin }) => {
      s.position.y = baseY + Math.sin(t * spin + phase) * .13;
      s.material.rotation = Math.sin(t * .35 + phase) * .09;
    });
    textData.forEach(({ s, baseY, phase }) => {
      s.position.y = baseY + Math.sin(t * .5 + phase) * .055;
      s.material.opacity = .7 + (Math.sin(t * .8 + phase) + 1) * .12;
    });
    photoData.forEach(({ card, baseY, phase }) => {
      card.position.y = baseY + Math.sin(t * .55 + phase) * .09;
    });

    renderer.render(scene, camera);
  }
  animate();
})();