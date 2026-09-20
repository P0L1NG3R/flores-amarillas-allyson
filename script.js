(() => {
  "use strict";

  const MOBILE = matchMedia("(max-width: 650px)").matches;
  const PHOTO_COUNT = 9;
  const PHOTOS = Array.from({length: PHOTO_COUNT}, (_,i) => "assets/foto" + (i+1) + ".jpg");
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
    "Aquí siempre tienes un lugar",
    "Qué suerte coincidir contigo",
    "Mi cariño por ti no pasa de moda",
    "Que nunca nos falten motivos para sonreír",
    "Lo bonito de mis días también tiene tu nombre"
  ];
  const SHAPES = [
    {name:"Una flor para ti 🌻", key:"flower"},
    {name:"Mi corazón es más bonito contigo 💛", key:"heart"},
    {name:"ALLYSON ✨", key:"allyson"},
    {name:"Un ramo entero para ti 🌻", key:"bouquet"},
    {name:"Siempre tú 💛", key:"heart2"}
  ];

  const $ = (q) => document.querySelector(q);
  const canvas = $("#galaxy"), start = $("#start"), startBtn = $("#startBtn");
  const musicBtn = $("#music"), letterBtn = $("#letterBtn"), letter = $("#letter"), closeBtn = $("#close");
  const shapeLabel = $("#shapeLabel"), dots = [...document.querySelectorAll(".progress-dots i")];

  let experienceStarted = false;
  let audioOn = false;
  let audioCtx = null, masterGain = null, musicTimer = null;

  function closeLetter(){ letter.classList.remove("show"); letter.setAttribute("aria-hidden","true"); }
  function openLetter(){ letter.classList.add("show"); letter.setAttribute("aria-hidden","false"); }
  letterBtn.addEventListener("click", openLetter);
  closeBtn.addEventListener("click", closeLetter);
  letter.addEventListener("click", e => { if(e.target === letter) closeLetter(); });
  addEventListener("keydown", e => { if(e.key === "Escape") closeLetter(); });

  async function enterExperience(){
    if(experienceStarted) return;
    experienceStarted = true;
    startBtn.disabled = true;
    startBtn.querySelector("span").textContent = "Preparando tu sorpresa…";
    startBtn.animate([{transform:"scale(1)"},{transform:"scale(.97)"},{transform:"scale(1.02)"}],{duration:430});
    try { await startMusic(); } catch(e) {}
    start.classList.add("hide");
    burst = 1;
    setTimeout(() => start.remove(), 1100);
  }
  startBtn.addEventListener("click", enterExperience);
  startBtn.addEventListener("touchend", e => { e.preventDefault(); enterExperience(); }, {passive:false});

  async function startMusic(){
    if(!audioCtx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = .055;
      masterGain.connect(audioCtx.destination);
    }
    if(audioCtx.state === "suspended") await audioCtx.resume();
    audioOn = true;
    musicBtn.classList.add("playing");
    musicBtn.textContent = "♪";
    scheduleMusic();
  }

  function stopMusic(){
    audioOn = false;
    musicBtn.classList.remove("playing");
    musicBtn.textContent = "♫";
    if(musicTimer){ clearTimeout(musicTimer); musicTimer = null; }
    if(masterGain && audioCtx){
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setTargetAtTime(.0001,audioCtx.currentTime,.08);
    }
  }

  function scheduleMusic(){
    if(!audioOn || !audioCtx) return;
    masterGain.gain.setTargetAtTime(.055,audioCtx.currentTime,.15);
    const now = audioCtx.currentTime + .05;
    const chords = [
      [261.63,329.63,392.00],[220.00,261.63,329.63],[174.61,220.00,261.63],[196.00,246.94,293.66]
    ];
    const chord = chords[Math.floor(now/4)%chords.length];
    chord.forEach((freq,i)=>{
      const o=audioCtx.createOscillator(), g=audioCtx.createGain(), f=audioCtx.createBiquadFilter();
      o.type=i===0?"sine":"triangle"; o.frequency.value=freq*(i===2?2:1);
      f.type="lowpass"; f.frequency.value=900;
      g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(i===0?.12:.035,now+.7); g.gain.exponentialRampToValueAtTime(.0001,now+4.1);
      o.connect(f); f.connect(g); g.connect(masterGain); o.start(now); o.stop(now+4.2);
    });
    [0,1.5,3].forEach((off,idx)=>{
      const o=audioCtx.createOscillator(),g=audioCtx.createGain();
      const scale=[523.25,659.25,783.99,880];
      o.type="sine"; o.frequency.value=scale[(Math.floor(now/4)+idx)%scale.length];
      g.gain.setValueAtTime(.0001,now+off); g.gain.exponentialRampToValueAtTime(.045,now+off+.03); g.gain.exponentialRampToValueAtTime(.0001,now+off+1.1);
      o.connect(g); g.connect(masterGain); o.start(now+off); o.stop(now+off+1.2);
    });
    musicTimer=setTimeout(scheduleMusic,3900);
  }

  musicBtn.addEventListener("click", async ()=>{
    if(audioOn) stopMusic(); else await startMusic();
  });

  if(typeof THREE === "undefined"){
    startBtn.querySelector("span").textContent="No se pudo cargar el universo";
    return;
  }

  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, MOBILE?1.55:2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.48;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050400,.045);
  const camera = new THREE.PerspectiveCamera(MOBILE?58:52,innerWidth/innerHeight,.1,120);
  let cameraZTarget=MOBILE?11.9:10.1;
  camera.position.set(0,.05,cameraZTarget);

  const universe = new THREE.Group();
  scene.add(universe);

  function resize(){
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize",resize);

  function glowTexture(){
    const c=document.createElement("canvas"); c.width=c.height=256; const x=c.getContext("2d");
    const g=x.createRadialGradient(128,128,0,128,128,128);
    g.addColorStop(0,"rgba(255,249,190,1)"); g.addColorStop(.1,"rgba(255,221,71,.92)"); g.addColorStop(.34,"rgba(255,170,0,.28)"); g.addColorStop(1,"rgba(255,150,0,0)");
    x.fillStyle=g;x.fillRect(0,0,256,256); return new THREE.CanvasTexture(c);
  }
  const glowTex=glowTexture();
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffc400,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  glow.position.z=-1.5; glow.scale.set(8.2,8.2,1); glow.material.opacity=.2; universe.add(glow);

  function pointsObject(arr,size=.033,color=0xffdc48,opacity=.9){
    const data=new Float32Array(arr.length*3); arr.forEach((p,i)=>{data[i*3]=p[0];data[i*3+1]=p[1];data[i*3+2]=p[2]||0});
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(data,3));
    return new THREE.Points(geo,new THREE.PointsMaterial({color,size,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
  }

  function stars(count,minR,maxR,size,opacity){
    const a=[];for(let i=0;i<count;i++){const r=minR+Math.random()*(maxR-minR),u=Math.random()*Math.PI*2,v=(Math.random()-.5)*Math.PI;a.push([Math.cos(u)*Math.cos(v)*r,Math.sin(v)*r*.72,Math.sin(u)*Math.cos(v)*r]);}
    const p=pointsObject(a,size,0xffe477,opacity);scene.add(p);return p;
  }
  const farStars=stars(MOBILE?1500:2900,10,38,.036,.55), nearStars=stars(MOBILE?500:950,5,17,.048,.72);

  function flowerTexture(){
    const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.translate(128,128);
    x.shadowColor="rgba(255,201,0,.85)";x.shadowBlur=12;
    for(let i=0;i<18;i++){x.save();x.rotate(i*Math.PI*2/18);const g=x.createLinearGradient(0,-15,0,-98);g.addColorStop(0,"#ffac00");g.addColorStop(.55,"#ffd529");g.addColorStop(1,"#fff1a1");x.fillStyle=g;x.beginPath();x.ellipse(0,-61,16.5,47,0,0,Math.PI*2);x.fill();x.restore();}
    x.shadowBlur=0;const cg=x.createRadialGradient(-9,-9,3,0,0,43);cg.addColorStop(0,"#9d7108");cg.addColorStop(.5,"#633c00");cg.addColorStop(1,"#2b1600");x.fillStyle=cg;x.beginPath();x.arc(0,0,42,0,Math.PI*2);x.fill();
    for(let i=0;i<100;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*34;x.fillStyle=i%3?"#c98a00":"#f7c933";x.beginPath();x.arc(Math.cos(a)*r,Math.sin(a)*r,1.6,0,Math.PI*2);x.fill();}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  const flowerTex=flowerTexture();

  function normalizeCount(arr,n){
    if(!arr.length) return Array.from({length:n},()=>[0,0,0]);
    const out=[];for(let i=0;i<n;i++){const p=arr[Math.floor(Math.random()*arr.length)];out.push([p[0]+(Math.random()-.5)*.025,p[1]+(Math.random()-.5)*.025,p[2]+(Math.random()-.5)*.025]);}return out;
  }
  const PARTICLES=MOBILE?2600:5000;

  function heartShape(){
    const a=[];for(let i=0;i<PARTICLES;i++){const t=Math.random()*Math.PI*2,f=Math.sqrt(Math.random());const x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);a.push([x*.064*f,y*.064*f+.28,(Math.random()-.5)*.52]);}return a;
  }
  function flowerShape(){
    const a=[];for(let i=0;i<PARTICLES;i++){const t=Math.random()*Math.PI*2,rng=Math.random();let r;if(rng<.32)r=Math.sqrt(Math.random())*.62;else{const petal=.72+.44*Math.pow(Math.abs(Math.cos(8*t)),.65);r=(.58+Math.random()*.52)*petal;}a.push([Math.cos(t)*r*2.05,Math.sin(t)*r*2.05+.28,(Math.random()-.5)*.36]);}return a;
  }
  function textShape(text){
    const c=document.createElement("canvas");c.width=1000;c.height=270;const x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.fillStyle="#fff";x.textAlign="center";x.textBaseline="middle";x.font="900 170px Arial Black,Arial";x.fillText(text,500,135);
    const d=x.getImageData(0,0,c.width,c.height).data,pts=[];for(let yy=0;yy<c.height;yy+=4)for(let xx=0;xx<c.width;xx+=4){if(d[(yy*c.width+xx)*4+3]>80&&Math.random()>.28)pts.push([(xx-500)*.0064,(135-yy)*.0064+.18,(Math.random()-.5)*.3]);}
    return normalizeCount(pts,PARTICLES);
  }
  function bouquetShape(){
    const pts=[];const heads=[[-1.25,.9],[-.65,1.35],[0,1.05],[.72,1.42],[1.3,.86],[-.2,1.75]];
    for(let i=0;i<PARTICLES;i++){const choose=Math.random();if(choose<.72){const h=heads[Math.floor(Math.random()*heads.length)],t=Math.random()*Math.PI*2;const pet=.23+.23*Math.pow(Math.abs(Math.cos(7*t)),.6),r=Math.random()*pet+.18;pts.push([h[0]+Math.cos(t)*r,h[1]+Math.sin(t)*r,(Math.random()-.5)*.4]);}else{const h=heads[Math.floor(Math.random()*heads.length)],u=Math.random();pts.push([h[0]*(1-u)*.96,-1.7+u*(h[1]+1.7)+(Math.random()-.5)*.06,(Math.random()-.5)*.28]);}}return pts;
  }

  const targets=[flowerShape(),heartShape(),textShape("ALLYSON"),bouquetShape(),heartShape()];
  const morphGeo=new THREE.BufferGeometry(),morphPos=new Float32Array(PARTICLES*3);
  targets[0].forEach((p,i)=>{morphPos[i*3]=p[0];morphPos[i*3+1]=p[1];morphPos[i*3+2]=p[2]});
  morphGeo.setAttribute("position",new THREE.BufferAttribute(morphPos,3));
  const morphMat=new THREE.PointsMaterial({color:0xffdc43,size:MOBILE?.039:.033,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
  const morph=new THREE.Points(morphGeo,morphMat);morph.position.y=.05;universe.add(morph);

  let shapeIndex=0,nextShape=1,morphStart=performance.now(),morphDuration=2700,holdDuration=4300;
  function setShapeUI(i){shapeLabel.style.opacity="0";shapeLabel.style.transform="translateY(6px)";setTimeout(()=>{shapeLabel.textContent=SHAPES[i].name;shapeLabel.style.opacity="1";shapeLabel.style.transform="translateY(0)"},250);dots.forEach((d,j)=>d.classList.toggle("on",j===i));}

  function spiralPoints(){
    const a=[],n=MOBILE?1500:3000;for(let i=0;i<n;i++){const u=i/n,t=u*Math.PI*21,r=.06+u*5;a.push([Math.cos(t)*r,-2.42+(Math.random()-.5)*.07,Math.sin(t)*r*.68]);}return a;
  }
  const spiral=pointsObject(spiralPoints(),.027,0xffc820,.72);universe.add(spiral);

  const trailGroup=new THREE.Group();universe.add(trailGroup);
  for(let k=0;k<4;k++){const curve=[];for(let i=0;i<440;i++){const u=i/439,t=u*Math.PI*2*(1.15+k*.16)+k*.8,r=2.2+k*.65;curve.push([Math.cos(t)*r,-1.95+u*3.5+Math.sin(t*2)*.16,Math.sin(t)*r*.45]);}const p=pointsObject(curve,.024,0xffdf55,.42-k*.055);trailGroup.add(p);}

  const flowerGroup=new THREE.Group();universe.add(flowerGroup);const floatFlowers=[];
  for(let i=0;i<(MOBILE?15:25);i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flowerTex,transparent:true,depthWrite:false}));const a=Math.random()*Math.PI*2,r=3.1+Math.random()*4.6,y=-1.6+Math.random()*4.9,sc=.32+Math.random()*.45;s.position.set(Math.cos(a)*r,y,(Math.random()-.5)*6.1);s.scale.set(sc,sc,1);flowerGroup.add(s);floatFlowers.push({s,y,phase:Math.random()*7,speed:.23+Math.random()*.38});}

  function textTexture(text){
    const c=document.createElement("canvas"),ctx=c.getContext("2d"),fs=42;ctx.font="600 "+fs+"px Comic Sans MS, cursive";c.width=Math.min(1500,Math.ceil(ctx.measureText(text).width+60));c.height=86;const x=c.getContext("2d");x.font="600 "+fs+"px Comic Sans MS, cursive";x.textAlign="center";x.textBaseline="middle";x.shadowColor="rgba(255,199,0,.9)";x.shadowBlur=14;x.fillStyle="#ffeb93";x.fillText(text,c.width/2,c.height/2);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return{tex,ratio:c.width/c.height};
  }
  const phraseGroup=new THREE.Group();universe.add(phraseGroup);const phraseData=[];
  PHRASES.forEach((txt,i)=>{const {tex,ratio}=textTexture(txt),s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:.72}));const a=i/PHRASES.length*Math.PI*2+i*.17,r=3.7+(i%3)*1.1,y=-1.45+(i%7)*.67;const h=MOBILE?.19:.22;s.scale.set(h*ratio,h,1);s.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.63);phraseGroup.add(s);phraseData.push({s,y,phase:i*.71});});

  const photoGroup=new THREE.Group();universe.add(photoGroup);const photoData=[],loader=new THREE.TextureLoader();
  PHOTOS.forEach((src,i)=>loader.load(src,tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);const ratio=tex.image.width/tex.image.height,base=MOBILE?.83:1.02;let w,h;if(ratio>=1){w=Math.min(1.38,base*1.22);h=w/ratio}else{h=Math.min(1.42,base*1.28);w=h*ratio}w=Math.max(w,.68);h=Math.max(h,.83);
    const border=new THREE.Mesh(new THREE.PlaneGeometry(w+.065,h+.065),new THREE.MeshBasicMaterial({color:0xffd83d,transparent:true,opacity:.48,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    const card=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,toneMapped:false}));
    card.add(border);border.position.z=-.015;const a=i/PHOTOS.length*Math.PI*2+.3,r=(MOBILE?3.2:3.3)+(i%2)*1.42,y=-1.25+(i%5)*.72;card.position.set(Math.cos(a)*r,y,Math.sin(a)*r*.76);card.rotation.y=-a+Math.PI/2;photoGroup.add(card);photoData.push({card,y,phase:i*.8});
  }));

  let targetRY=0,targetRX=-.035,ry=0,rx=-.035,drag=false,lastX=0,lastY=0,pinch=0,mx=0,my=0,burst=0;
  canvas.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId)});
  canvas.addEventListener("pointermove",e=>{if(!drag)return;targetRY+=(e.clientX-lastX)*.0045;targetRX+=(e.clientY-lastY)*.0024;targetRX=THREE.MathUtils.clamp(targetRX,-.34,.3);lastX=e.clientX;lastY=e.clientY});
  canvas.addEventListener("pointerup",()=>drag=false);canvas.addEventListener("pointercancel",()=>drag=false);
  canvas.addEventListener("wheel",e=>{e.preventDefault();cameraZTarget=THREE.MathUtils.clamp(cameraZTarget+e.deltaY*.006,MOBILE?9:7.2,MOBILE?15.5:14.2)},{passive:false});
  canvas.addEventListener("touchmove",e=>{if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY,d=Math.hypot(dx,dy);if(pinch)cameraZTarget=THREE.MathUtils.clamp(cameraZTarget-(d-pinch)*.014,MOBILE?9:7.2,MOBILE?15.5:14.2);pinch=d}},{passive:true});
  canvas.addEventListener("touchend",()=>pinch=0,{passive:true});
  addEventListener("mousemove",e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2});

  const clock=new THREE.Clock();
  function smoothstep(t){return t*t*(3-2*t)}
  function animate(now){
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();

    if(experienceStarted && !drag) targetRY+=.0017;
    ry+=(targetRY-ry)*.055;rx+=(targetRX-rx)*.055;universe.rotation.y=ry;universe.rotation.x=rx;
    camera.position.z+=(cameraZTarget-camera.position.z)*.07;camera.position.x+=(mx*(MOBILE?.06:.22)-camera.position.x)*.025;camera.position.y+=(-my*(MOBILE?.035:.11)+.05-camera.position.y)*.025;camera.lookAt(0,-.18,0);

    const elapsed=now-morphStart;
    if(experienceStarted && elapsed>holdDuration+morphDuration){shapeIndex=nextShape;nextShape=(nextShape+1)%targets.length;morphStart=now;setShapeUI(nextShape);}
    const local=now-morphStart;
    if(experienceStarted && local>holdDuration){
      const q=smoothstep(Math.min(1,(local-holdDuration)/morphDuration)),from=targets[shapeIndex],to=targets[nextShape],pos=morph.geometry.attributes.position.array;
      for(let i=0;i<PARTICLES;i++){const j=i*3;pos[j]=from[i][0]+(to[i][0]-from[i][0])*q;pos[j+1]=from[i][1]+(to[i][1]-from[i][1])*q;pos[j+2]=from[i][2]+(to[i][2]-from[i][2])*q;}
      morph.geometry.attributes.position.needsUpdate=true;
    }

    if(burst>0){burst*=.93;morph.scale.setScalar(1+burst*.38);glow.material.opacity=.22+burst*.28}else{morph.scale.setScalar(1+Math.sin(t*2.1)*.018);glow.material.opacity=.19+Math.sin(t*1.3)*.035;}
    morph.rotation.y=Math.sin(t*.42)*.13;farStars.rotation.y=t*.005;farStars.rotation.z=t*.0015;nearStars.rotation.y=-t*.01;spiral.rotation.y=t*.075;trailGroup.rotation.y=-t*.045;glow.scale.setScalar(8.1+Math.sin(t*.9)*.25);

    floatFlowers.forEach(o=>{o.s.position.y=o.y+Math.sin(t*o.speed+o.phase)*.12;o.s.material.rotation=Math.sin(t*.28+o.phase)*.08});
    phraseData.forEach(o=>{o.s.position.y=o.y+Math.sin(t*.46+o.phase)*.05;o.s.material.opacity=.58+(Math.sin(t*.65+o.phase)+1)*.12});
    photoData.forEach(o=>o.card.position.y=o.y+Math.sin(t*.52+o.phase)*.075);

    renderer.render(scene,camera);
  }
  requestAnimationFrame(animate);
})();