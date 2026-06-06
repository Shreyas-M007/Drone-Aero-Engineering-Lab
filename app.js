import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — DJI-REFERENCED COMPONENT INVENTORY
   ═══════════════════════════════════════════════════════════════ */
const PARTS = {
  frame: [
    { id:'fr-neo',  name:'DJI Neo 3″ ducted micro',   w:48,  desc:'Polycarbonate whoop guard. Safe indoor flights.', sp:{Size:'3″ Whoop',Mat:'Elastomer'}},
    { id:'fr-avata',name:'DJI Avata 3.5″ ducted',     w:165, desc:'Aerodynamic ducts shield propellers from impact.', sp:{Size:'3.5″ Duct',Mat:'Polyamide'}},
    { id:'fr-fpv5', name:'DJI FPV 5″ carbon',         w:115, desc:'3K carbon twill racing frame with detachable arms.',sp:{Size:'5″ Quad',Mat:'3K Carbon'}},
  ],
  motors: [
    { id:'mt-1306', name:'1306 4000KV micro stator',   w:12, thrust:160, desc:'Tiny quiet motors for sub-250 g builds.',      sp:{KV:'4000',Lift:'160 g ea'}},
    { id:'mt-2806', name:'2806 1300KV heavy-lift',      w:45, thrust:620, desc:'High torque for payload & wind stability.',    sp:{KV:'1300',Lift:'620 g ea'}},
    { id:'mt-2207', name:'2207 1950KV sport racing',    w:34, thrust:440, desc:'32 000 RPM bells for agile freestyle.',        sp:{KV:'1950',Lift:'440 g ea'}},
  ],
  esc: [
    { id:'es-20a',  name:'SpeedyBee 20A micro',  w:6,  desc:'Lightweight DShot300 controller.',             sp:{Amps:'20 A',Proto:'DShot300'}},
    { id:'es-50a',  name:'DJI FPV 50A board',    w:14, desc:'High-current MOS layout running DShot600.',    sp:{Amps:'50 A',Proto:'DShot600'}},
    { id:'es-70a',  name:'Fettec 70A heat-sink',  w:19, desc:'Metal shell dissipates heat at full throttle.',sp:{Amps:'70 A',Proto:'DShot1200'}},
  ],
  propellers: [
    { id:'pr-3b',   name:'Gemfan 3″ tri-blade ducted', w:3, desc:'Short high-pitch blades for duct compression lift.',sp:{Blades:'3-Blade',Span:'3.0″'}},
    { id:'pr-5b',   name:'DJI Avata 5-blade ducted',   w:6, desc:'Max static thrust for altitude hold.',              sp:{Blades:'5-Blade',Span:'3.5″'}},
    { id:'pr-2b',   name:'DJI FPV 5.3″ dual-blade',    w:5, desc:'Low drag for top-end speed.',                       sp:{Blades:'2-Blade',Span:'5.3″'}},
  ],
  flight_controller: [
    { id:'fc-f4',   name:'Betaflight F405',       w:6,  desc:'Reliable MPU6000 gyro. Smooth hover.',  sp:{CPU:'F405',Gyro:'MPU6000'}},
    { id:'fc-f7',   name:'KISS Ultra F722',       w:8,  desc:'8 kHz loop rate, ultra-responsive.',     sp:{CPU:'F722',Gyro:'BMI270'}},
    { id:'fc-o3',   name:'DJI O3 Flight Core',    w:12, desc:'Auto altitude-lock and GPS brakes.',     sp:{CPU:'H7 Dual',Gyro:'ICM42688'}},
  ],
  battery: [
    { id:'bt-3s',   name:'3S 1435 mAh LiPo',  w:85,  desc:'Lightweight agile pack, shorter range.',  sp:{Cap:'1435 mAh',V:'11.1 V (3S)'}},
    { id:'bt-4s',   name:'4S 2420 mAh LiPo',  w:180, desc:'Balanced energy for cinematic ops.',       sp:{Cap:'2420 mAh',V:'14.8 V (4S)'}},
    { id:'bt-6s',   name:'6S 2000 mAh HV',    w:295, desc:'Peak discharge for sprint acceleration.',  sp:{Cap:'2000 mAh',V:'22.2 V (6S)'}},
  ],
  camera: [
    { id:'cm-ana',  name:'Caddx Ratel 2 analog', w:6,  desc:'Low-latency analog feed, 8 ms delay.',   sp:{Sensor:'1200 TVL',Delay:'8 ms'}},
    { id:'cm-4k',   name:'DJI O3 4K gimbal cam', w:28, desc:'48 MP, single-axis stabiliser, 4K/60.',   sp:{Sensor:'4K/60 HDR',Delay:'28 ms'}},
  ],
  transmitter: [
    { id:'tx-elrs', name:'ELRS 2.4 GHz whip',     w:4,  desc:'Linear antenna, 2 km LOS.',            sp:{Band:'2.4 GHz',Range:'2 km'}},
    { id:'tx-o3',   name:'DJI O3 dual-link',       w:18, desc:'Dual encrypted link, 10 km range.',    sp:{Band:'2.4/5.8 G',Range:'10 km'}},
  ]
};

const REQUIRED = ['frame','motors','esc','propellers','flight_controller','battery','camera','transmitter'];

/* helper — terrain height at world (x,z) */
function terrainY(x, z) {
  let h = Math.sin(x * 0.012) * Math.cos(z * 0.012) * 12 + Math.sin(x * 0.03) * 3.5;
  const river = Math.min(Math.abs(x) / 36, 1);
  return h * river - (1 - river) * 9;
}

// Helper to create sprite number
function makeTextSprite(message) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, 32, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({map: texture, depthTest: false});
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.5, 3.5, 1);
  return sprite;
}

// Global helper to build a specific component mesh for a given configuration
function buildComponentMesh(cat, id, frameId, propsArray) {
  const g = new THREE.Group(), M = AssemblyLab.MAT;
  const duct = frameId === 'fr-neo' || frameId === 'fr-avata';
  const s = frameId === 'fr-neo' ? 0.3 : frameId === 'fr-avata' ? 0.35 : 0.45;
  const armAngles = [Math.PI/4,-Math.PI/4,3*Math.PI/4,-3*Math.PI/4];
  const motorPos = [[s,.02,s],[-s,.02,s],[s,.02,-s],[-s,.02,-s]];

  if(cat==='frame'){
    g.add(new THREE.Mesh(new THREE.BoxGeometry(duct?.4:.5,.02,duct?.48:.8), M.carbon));
    if(id==='fr-avata'){
      [[.35,.04,.35],[-.35,.04,.35],[.35,.04,-.35],[-.35,.04,-.35]].forEach(p=>{
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.18,32,1,true), M.orange).translateX(p[0]).translateY(p[1]).translateZ(p[2]));
      });
    }
    armAngles.forEach(a=>{
      const arm=new THREE.Mesh(new THREE.BoxGeometry(.04,.02,duct?.5:.9),M.carbon);
      arm.rotation.y=a; arm.position.set(Math.sin(a)*s*.7,0,Math.cos(a)*s*.7); g.add(arm);
    });
    if(duct){ const pod=new THREE.Mesh(new THREE.SphereGeometry(.1,16,16),M.indigo); pod.scale.set(1,.6,1.3); pod.position.y=.05; g.add(pod); }
    else {
      [[.1,.08,.2],[-.1,.08,.2],[.1,.08,-.2],[-.1,.08,-.2]].forEach(p=>{
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.15,8),M.indigo).translateX(p[0]).translateY(p[1]).translateZ(p[2]));
      });
    }
  }
  else if(cat==='motors'){
    let r=id==='mt-1306'?.045:id==='mt-2806'?.095:.07, h=id==='mt-1306'?.05:id==='mt-2806'?.09:.08;
    motorPos.forEach(p=>{
      const mg=new THREE.Group(); mg.position.set(p[0],p[1],p[2]);
      mg.add(new THREE.Mesh(new THREE.CylinderGeometry(r-.008,r-.008,h*.75,12),M.copper));
      const bell=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),M.silver); bell.position.y=h*.1;
      bell.add(new THREE.Mesh(new THREE.CylinderGeometry(r+.002,r+.002,h*.15,16),id==='mt-2806'?M.indigo:M.silver).translateY(h*.5));
      bell.add(new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,h*1.3,8),M.carbon).translateY(h*.55));
      mg.add(bell); g.add(mg);
    });
  }
  else if(cat==='esc'){
    const w=id==='es-70a'?.26:.18;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w,.015,w),id==='es-70a'?M.silver:M.carbon).translateY(.02).translateZ(-.02));
    for(let i=0;i<(id==='es-20a'?2:4);i++)
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.065,8),M.silver).translateX((i%2?-1:1)*w*.3).translateY(.045).translateZ(-.02+(i>1?.04:-.04)));
  }
  else if(cat==='propellers'){
    const span=id==='pr-3b'?.28:id==='pr-5b'?.34:.5, nb=id==='pr-2b'?2:id==='pr-5b'?5:3;
    if (propsArray) propsArray.length = 0;
    motorPos.forEach(p=>{
      const pg=new THREE.Group(); pg.position.set(p[0],.1,p[2]);
      pg.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.025,10),M.silver));
      for(let i=0;i<nb;i++){
        const bg=new THREE.BoxGeometry(.028,.005,span); bg.translate(0,0,span/2);
        const b=new THREE.Mesh(bg,M.orange); b.rotation.y=i*2*Math.PI/nb; b.rotation.x=.06; pg.add(b);
      }
      g.add(pg);
      if(propsArray) propsArray.push(pg);
    });
  }
  else if(cat==='flight_controller'){
    const w=id==='fc-o3'?.22:.16;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w,.015,w),id==='fc-f7'?M.indigo:M.carbon).translateY(.055).translateZ(-.02));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.01,.06),M.silver).translateY(.065));
  }
  else if(cat==='battery'){
    const bw=id==='bt-3s'?.2:id==='bt-6s'?.35:.28, bh=id==='bt-3s'?.11:id==='bt-6s'?.24:.18, bl=id==='bt-3s'?.42:id==='bt-6s'?.7:.58;
    const yOff=duct?.32:.2;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bl),id==='bt-6s'?M.white:M.carbon).translateY(yOff).translateZ(-.02));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(bw+.01,bh+.01,.08),M.dark).translateY(yOff).translateZ(-.02));
  }
  else if(cat==='camera'){
    [.1,-.1].forEach(x=>g.add(new THREE.Mesh(new THREE.BoxGeometry(.015,.15,.18),M.carbon).translateX(x).translateY(.07).translateZ(.36)));
    const r2=id==='cm-4k'?.095:.065;
    const cam=new THREE.Mesh(new THREE.CylinderGeometry(r2,r2,.14,16),M.white); cam.rotation.x=Math.PI/2; cam.position.set(0,.07,.36);
    cam.add(new THREE.Mesh(new THREE.CylinderGeometry(r2-.01,r2-.01,.01,16),new THREE.MeshBasicMaterial({color:0x111827})).translateY(.071));
    g.add(cam);
  }
  else if(cat==='transmitter'){
    g.add(new THREE.Mesh(new THREE.BoxGeometry(.1,.015,.1),M.carbon).translateY(.035).translateZ(-.32));
    if(id==='tx-o3'){
      [.05,-.05].forEach(x=>{
        const a=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.22,8),M.white);
        a.position.set(x,.07,-.38); a.rotation.z=x>.0?Math.PI/8:-Math.PI/8;
        a.add(new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.04,8),M.copper).translateY(.11));
        g.add(a);
      });
    } else {
      const w=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.2,8),M.white);
      w.position.set(0,.07,-.38); w.rotation.x=-Math.PI/4; g.add(w);
    }
  }

  g.traverse(n=>{ if(n.isMesh){ n.castShadow=true; n.receiveShadow=true; }});
  return g;
}


/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — FM SOUND SYNTHESISER
   ═══════════════════════════════════════════════════════════════ */
class SoundSynth {
  constructor() { this.ctx=null; this.on=true; this.eng=[]; this.filt=null; this.scanOsc=null; }

  boot() {
    if(this.ctx) return;
    try { this.ctx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
  }

  toggle() {
    this.on=!this.on;
    if(!this.on){ this.stopMotors(); this.stopScan(); }
    else if(this.ctx?.state==='suspended') this.ctx.resume();
    return this.on;
  }

  /* one-shot interface click */
  snap() {
    if(!this.on) return; this.boot(); if(!this.ctx) return;
    const t=this.ctx.currentTime, o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(500,t);
    o.frequency.exponentialRampToValueAtTime(1800,t+.12);
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.1,t+.01);
    g.gain.exponentialRampToValueAtTime(.001,t+.2);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t+.2);
  }

  /* FM motor cluster */
  startMotors(n=4) {
    if(!this.on) return; this.boot(); if(!this.ctx||this.eng.length) return;
    const t=this.ctx.currentTime;
    this.filt=this.ctx.createBiquadFilter(); this.filt.type='lowpass'; this.filt.frequency.setValueAtTime(260,t);
    this.filt.connect(this.ctx.destination);
    const bases=[55,56.4,57.8,55.9,56.8,57.2];
    for(let i=0;i<Math.min(n,bases.length);i++){
      const bf=bases[i];
      const car=this.ctx.createOscillator(); car.type='sawtooth'; car.frequency.setValueAtTime(bf,t);
      const mod=this.ctx.createOscillator(); mod.type='sine'; mod.frequency.setValueAtTime(bf*1.5,t);
      const mg=this.ctx.createGain(); mg.gain.setValueAtTime(bf*.8,t);
      const vol=this.ctx.createGain(); vol.gain.setValueAtTime(.12,t);
      mod.connect(mg); mg.connect(car.frequency); car.connect(vol); vol.connect(this.filt);
      mod.start(t); car.start(t);
      this.eng.push({car,mod,mg,vol,bf});
    }
  }

  throttle(thr) {
    if(!this.on||!this.ctx||!this.eng.length) return;
    const t=this.ctx.currentTime, m=1+thr*4.2;
    this.eng.forEach(e=>{
      e.car.frequency.setTargetAtTime(e.bf*m,t,.06);
      e.mod.frequency.setTargetAtTime(e.bf*1.5*m,t,.06);
      e.mg.gain.setTargetAtTime(e.bf*.8*m*(1+thr*1.5),t,.06);
    });
    this.filt.frequency.setTargetAtTime(260+thr*1300,t,.08);
  }

  stopMotors() {
    this.eng.forEach(e=>{ try{e.car.stop();e.mod.stop();}catch(x){} });
    this.eng=[]; this.filt=null;
  }

  /* scanner ping */
  startScan() {
    if(!this.on) return; this.boot(); if(!this.ctx||this.scanOsc) return;
    const t=this.ctx.currentTime;
    this.scanOsc=this.ctx.createOscillator(); this.scanOsc.type='triangle'; this.scanOsc.frequency.setValueAtTime(180,t);
    this.scanGain=this.ctx.createGain(); this.scanGain.gain.setValueAtTime(0,t); this.scanGain.gain.linearRampToValueAtTime(.05,t+.15);
    const lfo=this.ctx.createOscillator(); lfo.frequency.setValueAtTime(4,t);
    const lg=this.ctx.createGain(); lg.gain.setValueAtTime(60,t);
    lfo.connect(lg); lg.connect(this.scanOsc.frequency);
    this.scanOsc.connect(this.scanGain); this.scanGain.connect(this.ctx.destination);
    lfo.start(t); this.scanOsc.start(t); this._scanLfo=lfo;
  }
  stopScan() {
    if(!this.scanOsc) return;
    try{ this.scanGain.gain.linearRampToValueAtTime(0,this.ctx.currentTime+.1);
      setTimeout(()=>{ try{this.scanOsc.stop();this._scanLfo.stop();}catch(x){} this.scanOsc=null; },120);
    }catch(x){ this.scanOsc=null; }
  }

  crash() {
    if(!this.on) return; this.boot(); if(!this.ctx) return;
    const t=this.ctx.currentTime, len=this.ctx.sampleRate*1.4;
    const buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    const src=this.ctx.createBufferSource(); src.buffer=buf;
    const lp=this.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(300,t); lp.frequency.exponentialRampToValueAtTime(30,t+.8);
    const g=this.ctx.createGain(); g.gain.setValueAtTime(.55,t); g.gain.exponentialRampToValueAtTime(.001,t+1.1);
    src.connect(lp); lp.connect(g); g.connect(this.ctx.destination); src.start(t); src.stop(t+1.4);
  }

  alarm() {
    if(!this.on) return; this.boot(); if(!this.ctx) return;
    const t=this.ctx.currentTime;
    [0,.18].forEach(d=>{
      const o=this.ctx.createOscillator(), g=this.ctx.createGain();
      o.type='square'; o.frequency.setValueAtTime(d===0?980:740,t+d);
      g.gain.setValueAtTime(0,t+d); g.gain.linearRampToValueAtTime(.04,t+d+.01);
      g.gain.exponentialRampToValueAtTime(.001,t+d+.14);
      o.connect(g); g.connect(this.ctx.destination); o.start(t+d); o.stop(t+d+.16);
    });
  }
}

const sfx = new SoundSynth();

/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — 3-D ASSEMBLY WORKBENCH
   ═══════════════════════════════════════════════════════════════ */
class AssemblyLab {
  constructor(canvasId, onStats) {
    this.cv = document.getElementById(canvasId);
    this.onStats = onStats;
    this.slots = {}; REQUIRED.forEach(k => this.slots[k] = null);
    this.meshes = {};
    this.props = [];

    /* scene */
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFAF8F5);
    this.scene.fog = new THREE.FogExp2(0xFAF8F5, .09);

    const r = this.cv.getBoundingClientRect();
    this.cam = new THREE.PerspectiveCamera(45, r.width/r.height, .1, 80);
    this.cam.position.set(3.2, 2.5, 3.2);

    this.ren = new THREE.WebGLRenderer({canvas:this.cv, antialias:true});
    this.ren.setSize(r.width, r.height);
    this.ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.ren.shadowMap.enabled = true;
    this.ren.shadowMap.type = THREE.PCFSoftShadowMap;

    this.ctrl = new OrbitControls(this.cam, this.ren.domElement);
    this.ctrl.enableDamping = true;
    this.ctrl.dampingFactor = .05;
    this.ctrl.maxPolarAngle = Math.PI/2-.05;
    this.ctrl.minDistance = 1.5;
    this.ctrl.maxDistance = 10;

    this.scene.add(new THREE.AmbientLight(0xffffff,.7));
    const sun = new THREE.DirectionalLight(0xffffff,1);
    sun.position.set(4,10,4); sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024); sun.shadow.bias=-.0006;
    this.scene.add(sun);
    this.scene.add(new THREE.DirectionalLight(0x6366F1,.4).translateX(-6).translateY(2).translateZ(-6));

    /* floor */
    const fm = new THREE.MeshStandardMaterial({color:0xffffff,roughness:.25,metalness:.1,side:THREE.DoubleSide});
    const fl = new THREE.Mesh(new THREE.RingGeometry(.01,1.8,64), fm);
    fl.rotation.x=-Math.PI/2; fl.position.y=-.42; fl.receiveShadow=true;
    this.scene.add(fl);
    const rim = new THREE.Mesh(new THREE.RingGeometry(1.78,1.8,64), new THREE.MeshBasicMaterial({color:0x6366F1,transparent:true,opacity:.75}));
    rim.rotation.x=-Math.PI/2; rim.position.y=-.41; this.scene.add(rim);
    this.scene.add(new THREE.GridHelper(10,20,0x6366F1,0xE0DDD6));

    this.pivot = new THREE.Group(); this.scene.add(this.pivot);
    this._tick();
    window.addEventListener('resize', ()=>{
      const b=this.cv.parentElement.getBoundingClientRect();
      this.cam.aspect=b.width/b.height; this.cam.updateProjectionMatrix();
      this.ren.setSize(b.width,b.height);
    });
  }

  /* materials palette */
  static MAT = {
    carbon:   new THREE.MeshStandardMaterial({color:0x242426,roughness:.25,metalness:.7}),
    silver:   new THREE.MeshStandardMaterial({color:0xd1d5db,roughness:.18,metalness:.85}),
    copper:   new THREE.MeshStandardMaterial({color:0xca8a04,roughness:.4,metalness:.9}),
    orange:   new THREE.MeshStandardMaterial({color:0xD97706,roughness:.1,metalness:.1,transparent:true,opacity:.65,side:THREE.DoubleSide}),
    indigo:   new THREE.MeshStandardMaterial({color:0x6366F1,roughness:.2,metalness:.9}),
    white:    new THREE.MeshStandardMaterial({color:0xffffff,roughness:.4,metalness:.1}),
    dark:     new THREE.MeshStandardMaterial({color:0x1f2937,roughness:.9}),
  };

  equip(cat, id) {
    const item = PARTS[cat].find(p=>p.id===id); if(!item) return;
    this.slots[cat] = item;
    if(this.meshes[cat]){ this.pivot.remove(this.meshes[cat]); delete this.meshes[cat]; }
    const mesh = this._buildMesh(cat, id);
    if(mesh){
      this.meshes[cat] = mesh; this.pivot.add(mesh);
      mesh.position.y += 1; mesh.scale.setScalar(.02);
      const t0 = performance.now();
      const anim = t => {
        const p = Math.min((t-t0)/450, 1), e = 1-Math.pow(1-p,3);
        mesh.position.y = 1*(1-e); mesh.scale.setScalar(.02+e*.98);
        if(p<1) requestAnimationFrame(anim); else { mesh.position.y=0; mesh.scale.setScalar(1); }
      };
      requestAnimationFrame(anim);
    }
    this._calc();
  }

  _buildMesh(cat, id) {
    return buildComponentMesh(cat, id, this.slots.frame?.id, this.props);
  }

  pct()   { return Math.round(REQUIRED.filter(k=>this.slots[k]).length/REQUIRED.length*100); }
  done()  { return REQUIRED.every(k=>this.slots[k]); }

  _calc() {
    if(!this.onStats) return;
    let w=0, thr=0, cap=0, cells=3, cam='—', rng='—';
    if(this.slots.frame)            w+=this.slots.frame.w;
    if(this.slots.motors)         { w+=this.slots.motors.w*4; thr=this.slots.motors.thrust*4; }
    if(this.slots.esc)              w+=this.slots.esc.w;
    if(this.slots.propellers)       w+=this.slots.propellers.w*4;
    if(this.slots.flight_controller)w+=this.slots.flight_controller.w;
    if(this.slots.battery)        { w+=this.slots.battery.w; cap=parseInt(this.slots.battery.sp.Cap); cells=this.slots.battery.sp.V.includes('6S')?6:this.slots.battery.sp.V.includes('3S')?3:4; }
    if(this.slots.camera)         { w+=this.slots.camera.w; cam=this.slots.camera.sp.Sensor; }
    if(this.slots.transmitter)    { w+=this.slots.transmitter.w; rng=this.slots.transmitter.sp.Range; }
    const twr = w>0?+(thr/w).toFixed(1):0;
    let hover=0;
    if(w>0&&cap>0){ const draw=5.5+w*.011+(twr>4.5?(twr-4.5)*1.6:0); hover=+((cap/1000/draw)*60).toFixed(1); }
    const spd=twr>0?Math.round(twr*28):0;
    this.onStats({w,thr,twr,bat:cap?cap+' mAh':'—',hover:hover?hover+' min':'—',spd:spd?spd+' km/h':'—',cam,rng,cells:cells+'S',pct:this.pct(),ok:this.done()});
  }

  specs() {
    return {
      wg: Object.values(this.slots).reduce((s,v)=>s+(v? v.w*(v.id?.startsWith('mt')||v.id?.startsWith('pr')?4:1) :0),0),
      thrN: ((this.slots.motors?.thrust*4||1200)/1000)*9.81*.62,
      cells: this.slots.battery?.sp.V.includes('6S')?6:this.slots.battery?.sp.V.includes('3S')?3:4,
      frame: this.slots.frame?.id||'fr-fpv5',
      cap: this.slots.battery ? parseInt(this.slots.battery.sp.Cap) : 2000,
      config: Object.fromEntries(Object.entries(this.slots).map(([cat, item]) => [cat, item ? item.id : null]))
    };
  }

  _tick() {
    requestAnimationFrame(()=>this._tick());
    const t=performance.now()*.001;
    this.pivot.position.y = Math.sin(t*1.6)*.035;
    this.pivot.rotation.y = t*.12;
    this.props.forEach((p,i)=>{ p.rotation.y+=.06*(i%2?-1:1); });
    this.ctrl.update();
    this.ren.render(this.scene, this.cam);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — FLIGHT SIMULATOR ENGINE
   ═══════════════════════════════════════════════════════════════ */
class FlightSim {
  constructor(canvasId, videoId, onHud) {
    this.cv = document.getElementById(canvasId);
    this.vid = document.getElementById(videoId);
    this.onHud = onHud;

    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3(); this.quat = new THREE.Quaternion();
    this.thr=0; this.yaw=0; this.pit=0; this.rol=0;
    this.mode='level'; this.camMode='chase';
    this.buildings=[]; this.gates=[]; this.cleared=new Set(); this.arBoxes=[];
    this.bat=100; this.alive=false; this.crashed=false; this.cutoff=false;
    this.alarmCD=0; this.shakeT=0; this.shakeF=0;
    this.propGrps=[]; this.sparkPts=null; this.smokePts=null;
    this.prevT=0; this.env='city'; this.droneSpec=null; this.drone=null;
    this.riverMesh=null;
    
    this.arMode = 'hologram';
    this.arPoints = null;
    this.holoGridTexture = null;

    this._initKeys();
  }

  launch(spec, env) {
    this.droneSpec=spec; this.env=env; this.alive=true;
    this.bat=100; this.cleared.clear();
    this.crashed=false; this.cutoff=false; this.alarmCD=0; this.shakeT=0;
    this.thr=0; this.yaw=0; this.pit=0; this.rol=0;
    this.targetGateIdx = 0;
    this.obstaclesClearedCount = 0;

    document.getElementById('crash-overlay').classList.add('hidden');
    document.getElementById('hud-battery-warn').classList.add('hidden');
    document.body.classList.remove('glitch-active');

    // Update HUD labels for training/cyber mode
    const gateVal = document.getElementById('h-gate');
    if (gateVal && gateVal.previousElementSibling) {
      if (env === 'training') {
        gateVal.previousElementSibling.innerText = 'OBSTACLES';
      } else if (env === 'cyber') {
        gateVal.previousElementSibling.innerText = 'FLIGHT';
      } else {
        gateVal.previousElementSibling.innerText = 'GATE';
      }
    }

    const btnRand = document.getElementById('btn-randomise');
    if (btnRand) {
      if (env === 'cyber') btnRand.classList.remove('hidden');
      else btnRand.classList.add('hidden');
    }

    const btnAr = document.getElementById('btn-ar-mode');
    if (btnAr) {
      if (env === 'ar') btnAr.classList.remove('hidden');
      else btnAr.classList.add('hidden');
      btnAr.innerText = '🌐 Hologram';
    }

    this.arMode = 'hologram';
    this.arPoints = null;
    this.holoGridTexture = null;

    this.pos.set(0, env==='ar'?0.85:(env==='cyber'?40.42:6), env==='ar'?0:(env==='cyber'?0:15));
    this.vel.set(0,0,0);
    this.quat.identity();

    this._buildScene();
    sfx.startMotors(4);
    if(env==='ar') this._startAR(); else this.vid.style.display='none';
    this.prevT=performance.now();
    this._loop();
  }

  _buildScene() {
    // Clean up old AR objects if present to prevent memory leaks
    if (this.arBoxes) {
      for (const item of this.arBoxes) {
        if (item.mesh) {
          if (item.mesh.geometry) item.mesh.geometry.dispose();
          if (item.mesh.material) {
            if (item.mesh.material.map) item.mesh.material.map.dispose();
            item.mesh.material.dispose();
          }
        }
        if (item.wireframe) {
          if (item.wireframe.geometry) item.wireframe.geometry.dispose();
          if (item.wireframe.material) item.wireframe.material.dispose();
        }
      }
      this.arBoxes = [];
    }
    if (this.arPoints) {
      if (this.arPoints.geometry) this.arPoints.geometry.dispose();
      if (this.arPoints.material) this.arPoints.material.dispose();
      this.arPoints = null;
    }
    if (this.holoGridTexture) {
      this.holoGridTexture.dispose();
      this.holoGridTexture = null;
    }

    this.scene = new THREE.Scene();
    const isCity = this.env==='city';
    const isTraining = this.env==='training';
    const isCyber = this.env==='cyber';
    const opaque = isCity || isTraining || isCyber;

    if(isCity){ this.scene.background=new THREE.Color(0xF1F5F9); this.scene.fog=new THREE.FogExp2(0xF1F5F9,.005); }
    else if(isTraining){ this.scene.background=new THREE.Color(0x0F172A); this.scene.fog=new THREE.FogExp2(0x0F172A,.012); }
    else if(isCyber){ this.scene.background=new THREE.Color(0x030712); this.scene.fog=new THREE.FogExp2(0x030712,.015); }
    else this.scene.background=null;

    const r=this.cv.getBoundingClientRect();
    this.cam3 = new THREE.PerspectiveCamera(60,r.width/r.height,.1,800);
    this.ren = new THREE.WebGLRenderer({canvas:this.cv,antialias:true,alpha:!opaque});
    this.ren.setSize(r.width,r.height); this.ren.setPixelRatio(Math.min(devicePixelRatio,2));
    if(opaque){ this.ren.shadowMap.enabled=true; this.ren.shadowMap.type=THREE.PCFSoftShadowMap; }

    this.scene.add(new THREE.AmbientLight(0xffffff,isCity?.65:isTraining?.4:(isCyber?.45:.9)));
    if(isCity){
      const sun=new THREE.DirectionalLight(0xfffaed,1.5); sun.position.set(150,300,100); sun.castShadow=true;
      sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.near=.5; sun.shadow.camera.far=700;
      const d=180; sun.shadow.camera.left=-d; sun.shadow.camera.right=d; sun.shadow.camera.top=d; sun.shadow.camera.bottom=-d;
      sun.shadow.bias=-.0007; this.scene.add(sun);
      this._buildCity();
    } else if(isTraining){
      const sun=new THREE.DirectionalLight(0xffffff,1.2); sun.position.set(50,150,50); sun.castShadow=true;
      sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.near=.5; sun.shadow.camera.far=400;
      const d=100; sun.shadow.camera.left=-d; sun.shadow.camera.right=d; sun.shadow.camera.top=d; sun.shadow.camera.bottom=-d;
      sun.shadow.bias=-.0007; this.scene.add(sun);
      this._buildTraining();
    } else if(isCyber){
      const l1=new THREE.DirectionalLight(0x8b5cf6,1.2); l1.position.set(100,150,50); this.scene.add(l1);
      const l2=new THREE.DirectionalLight(0x06b6d4,1.0); l2.position.set(-100,150,-50); this.scene.add(l2);
      const l3=new THREE.DirectionalLight(0x10b981,1.0); l3.position.set(50,150,100); this.scene.add(l3);
      const l4=new THREE.DirectionalLight(0xeab308,0.8); l4.position.set(-50,150,-100); this.scene.add(l4);
      this._buildCyber();
    } else {
      const pl=new THREE.PointLight(0xffffff,1,30); pl.position.set(0,6,0); this.scene.add(pl);
    }

    this.drone = this._droneMesh(); this.scene.add(this.drone);

    window.addEventListener('resize',()=>{
      const b=this.cv.getBoundingClientRect();
      this.cam3.aspect=b.width/b.height; this.cam3.updateProjectionMatrix();
      this.ren.setSize(b.width,b.height);
    },{once:false});
  }

  /* ── City World ── */
  _buildCity() {
    this.buildings=[]; this.gates=[];

    /* terrain */
    const tGeo=new THREE.PlaneGeometry(600,600,64,64), tv=tGeo.attributes.position;
    for(let i=0;i<tv.count;i++) tv.setZ(i, terrainY(tv.getX(i), tv.getY(i)));
    tGeo.computeVertexNormals();
    const terrain=new THREE.Mesh(tGeo, new THREE.MeshStandardMaterial({color:0x8a9a86,roughness:.92,metalness:.05}));
    terrain.rotation.x=-Math.PI/2; terrain.receiveShadow=true; this.scene.add(terrain);

    /* river */
    const rGeo=new THREE.PlaneGeometry(60,600,1,32);
    this.riverMesh=new THREE.Mesh(rGeo, new THREE.MeshStandardMaterial({color:0x22d3ee,roughness:.1,metalness:.9,transparent:true,opacity:.85}));
    this.riverMesh.rotation.x=-Math.PI/2; this.riverMesh.position.y=-6.8; this.scene.add(this.riverMesh);

    /* towers */
    const tMat=new THREE.MeshStandardMaterial({color:0xe2e8f0,roughness:.1,metalness:.9,flatShading:true});
    [
      [42,28,42],[-42,36,-55],[-75,42,60],[60,48,-75],[30,24,110],[-38,32,130],[-70,52,-110],[75,45,95],
      [-90,40,-40],[90,30,-30],[-30,25,-90],[30,35,-130],[-80,45,10],[80,28,20],[-110,50,80],[110,42,-90],
      [-25,30,-150],[25,38,-190],[-120,35,-130],[120,48,120],[-60,22,-160],[60,32,160],[-140,40,0],[140,28,-60]
    ].forEach((c,i)=>{
      const ty=terrainY(c[0],c[2]);
      const t=new THREE.Mesh(new THREE.BoxGeometry(22,c[1],22),tMat);
      t.position.set(c[0],ty+c[1]/2-2,c[2]); t.castShadow=true; t.receiveShadow=true; this.scene.add(t);
      this.buildings.push({box:new THREE.Box3().setFromObject(t),name:`Tower ${i+1}`});
    });

    /* trees */
    const trunkMat=new THREE.MeshStandardMaterial({color:0x78350f,roughness:.9});
    const leafMat=new THREE.MeshStandardMaterial({color:0x14532d,roughness:.85});
    for(let i=0;i<90;i++){
      const side=Math.random()>.5?1:-1, tx=(35+Math.random()*120)*side, tz=(Math.random()-.5)*320;
      const ty=terrainY(tx,tz);
      const tree=new THREE.Group();
      tree.add(new THREE.Mesh(new THREE.CylinderGeometry(.2,.4,2.8,6),trunkMat).translateY(1.4));
      tree.add(new THREE.Mesh(new THREE.ConeGeometry(1.6,5,6),leafMat).translateY(4.2));
      const sc=.7+Math.random()*.6; tree.scale.setScalar(sc);
      tree.position.set(tx,ty-.2,tz); this.scene.add(tree);
    }

    /* bridge */
    const road=new THREE.Mesh(new THREE.BoxGeometry(12,.8,95),new THREE.MeshStandardMaterial({color:0x334155,roughness:.8}));
    road.position.set(0,4,0); road.receiveShadow=true; this.scene.add(road);
    this.buildings.push({box:new THREE.Box3().setFromObject(road),name:'Bridge Deck'});
    const pilMat=new THREE.MeshStandardMaterial({color:0x475569,metalness:.6});
    [[-5.5,12,0],[5.5,12,0]].forEach((p,i)=>{
      const pillar=new THREE.Mesh(new THREE.BoxGeometry(1.2,24,1.2),pilMat);
      pillar.position.set(p[0],p[1],p[2]); pillar.castShadow=true; pillar.receiveShadow=true; this.scene.add(pillar);
      this.buildings.push({box:new THREE.Box3().setFromObject(pillar),name:`Bridge Pillar ${i+1}`});
    });
    const wireMat=new THREE.LineBasicMaterial({color:0x6366F1});
    [[-5.5],[5.5]].forEach(x=>{
      const pts=[new THREE.Vector3(x,4.4,-47),new THREE.Vector3(x,23.5,0),new THREE.Vector3(x,4.4,47)];
      this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),wireMat));
    });

    /* checkpoint gates */
    const activeCityGateMat = new THREE.MeshStandardMaterial({color:0x8b5cf6,emissive:0x8b5cf6,emissiveIntensity:1.5,roughness:.2});
    const inactiveCityGateMat = new THREE.MeshStandardMaterial({color:0x334155,roughness:.8,metalness:.2});
    const cityGates = [[0,10,-25,0],[42,22,-22,.8],[60,32,30,1.6],[0,8,80,-.5],[-55,25,60,1],[-42,18,-20,0],[0,15,-90,-1.6],[0,18,-160,0]];
    cityGates.forEach((c,i)=>{
      const isTarget = i === 0;
      const ring=new THREE.Mesh(new THREE.TorusGeometry(3.6,.4,8,24), isTarget ? activeCityGateMat : inactiveCityGateMat);
      ring.position.set(c[0],c[1],c[2]); ring.rotation.y=c[3]; this.scene.add(ring);
      this.gates.push({mesh:ring,idx:i,sphere:new THREE.Sphere(ring.position,4)});

      // Floating number sprite above the gate
      const numSprite = makeTextSprite((i + 1).toString());
      numSprite.position.set(c[0], c[1] + 5.5, c[2]);
      this.scene.add(numSprite);
    });

    // Vertical glowing beacon for active gate
    const beaconGeo = new THREE.CylinderGeometry(0.05, 1.5, 400, 16, 1, true);
    beaconGeo.translate(0, 200, 0);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, // neon purple/indigo
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.beacon = new THREE.Mesh(beaconGeo, beaconMat);
    this.beacon.position.copy(this.gates[0].mesh.position);
    this.scene.add(this.beacon);
  }

  /* ── Training World ── */
  _buildTraining() {
    this.trainingObstacles = [];
    this.gates = [];

    /* floor */
    const fMat = new THREE.MeshStandardMaterial({color: 0x0f172a, roughness: 0.8, metalness: 0.3});
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), fMat);
    floor.rotation.x = -Math.PI/2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    /* floor grid lines */
    const grid = new THREE.GridHelper(300, 60, 0x6366F1, 0x1e293b);
    grid.position.y = 0.01;
    this.scene.add(grid);

    /* obstacle materials */
    const poleMat = new THREE.MeshStandardMaterial({color: 0xf59e0b, metalness: 0.5, roughness: 0.2});
    const archMat = new THREE.MeshStandardMaterial({color: 0x475569, metalness: 0.7, roughness: 0.1});

    /* Slalom Poles (Vertical Cylinders for winding turns) */
    const poles = [
      [-4, -10, "Slalom Pole 1"],
      [4, -25, "Slalom Pole 2"],
      [-4, -40, "Slalom Pole 3"],
      [30, 5, "Slalom Pole 4"],
      [42, 20, "Slalom Pole 5"]
    ];
    poles.forEach(p => {
      const poleGeo = new THREE.CylinderGeometry(0.4, 0.4, 12, 16);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(p[0], 6, p[1]);
      pole.castShadow = true;
      pole.receiveShadow = true;
      this.scene.add(pole);
      this.trainingObstacles.push({box: new THREE.Box3().setFromObject(pole), name: p[2]});
    });

    /* Arches / Tunnels (low clearance obstacles) */
    const makeArch = (x, z, rotY, name) => {
      const g = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 0.8), archMat);
      p1.position.set(-3.5, 2.5, 0);
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5, 0.8), archMat);
      p2.position.set(3.5, 2.5, 0);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.8, 0.8), archMat);
      bar.position.set(0, 4.6, 0);
      
      g.add(p1, p2, bar);
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      
      g.traverse(n => { if(n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
      this.scene.add(g);
      
      // Update world matrix recursively so children have correct world coordinates!
      g.updateMatrixWorld(true);
      
      this.trainingObstacles.push({box: new THREE.Box3().setFromObject(p1), name: name + " Left Pillar"});
      this.trainingObstacles.push({box: new THREE.Box3().setFromObject(p2), name: name + " Right Pillar"});
      this.trainingObstacles.push({box: new THREE.Box3().setFromObject(bar), name: name + " Crossbar"});
    };

    makeArch(35, -40, Math.PI / 2, "Tunnel Arch 1");
    makeArch(0, 35, 0, "Tunnel Arch 2");

    /* Checkpoint Gates (Torus rings arranged in a loop) */
    const trainingGates = [
      [0, 3, 10, 0],              // Gate 1 (Start)
      [4, 3, -10, -Math.PI / 6],  // Gate 2 (Weave right of Pole 1)
      [-4, 3, -25, Math.PI / 6],  // Gate 3 (Weave left of Pole 2)
      [4, 3, -40, -Math.PI / 6],  // Gate 4 (Weave right of Pole 3)
      [20, 3, -40, Math.PI / 2],  // Gate 5 (Turn gate towards Arch 1)
      [35, 3, -40, Math.PI / 2],  // Gate 6 (Inside Tunnel Arch 1)
      [42, 3, 5, -Math.PI / 6],   // Gate 7 (Weave right of Pole 4)
      [30, 3, 20, Math.PI / 6],   // Gate 8 (Weave left of Pole 5)
      [15, 3, 35, 0],             // Gate 9 (Turn gate towards Arch 2)
      [0, 3, 35, 0],              // Gate 10 (Inside Tunnel Arch 2)
      [-25, 4, 25, -Math.PI / 4]  // Gate 11 (Loop return)
    ];



    const activeGateMat = new THREE.MeshStandardMaterial({color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.2, roughness: 0.2});
    const inactiveGateMat = new THREE.MeshStandardMaterial({color: 0x334155, roughness: 0.8, metalness: 0.2});

    trainingGates.forEach((c, i) => {
      const isTarget = i === 0;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.4, 8, 24), isTarget ? activeGateMat : inactiveGateMat);
      ring.position.set(c[0], c[1], c[2]);
      ring.rotation.y = c[3];
      this.scene.add(ring);
      this.gates.push({mesh: ring, idx: i, sphere: new THREE.Sphere(ring.position, 4)});

      // Floating number sprite above the gate
      const numSprite = makeTextSprite((i + 1).toString());
      numSprite.position.set(c[0], c[1] + 4.8, c[2]);
      this.scene.add(numSprite);
    });
  }

  /* ── Cyberscape World ── */
  _buildCyber(randomise = false) {
    if (randomise && this.cyberTowers) {
      for (const t of this.cyberTowers) {
        if (t.mesh) {
          this.scene.remove(t.mesh);
          if (t.mesh.geometry) t.mesh.geometry.dispose();
          if (t.mesh.material) {
            const mats = Array.isArray(t.mesh.material) ? t.mesh.material : [t.mesh.material];
            const uniqueMats = [...new Set(mats)];
            for (const m of uniqueMats) {
              if (m.map) m.map.dispose();
              if (m.emissiveMap) m.emissiveMap.dispose();
              m.dispose();
            }
          }
        }
        if (t.wireframe) {
          this.scene.remove(t.wireframe);
          if (t.wireframe.geometry) t.wireframe.geometry.dispose();
          if (t.wireframe.material) t.wireframe.material.dispose();
        }
      }
    }

    // Helper to generate glowing neon window textures custom-fit to a building face's dimensions
    const makeCustomNeonWindowTexture = (faceWidth, faceHeight, neonColorStr, style) => {
      const canvas = document.createElement('canvas');
      const canvasW = Math.max(64, Math.round(faceWidth * 8));
      const canvasH = Math.max(128, Math.round(faceHeight * 8));
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasW, canvasH);
      
      ctx.shadowBlur = 6;
      ctx.shadowColor = neonColorStr;

      if (style === 'grid') {
        const winW = 6;
        const winH = 8;
        const gapX = 12;
        const gapY = 16;
        for (let x = 8; x <= canvasW - winW - 8; x += gapX) {
          if (Math.random() < 0.1) continue;
          for (let y = 8; y <= canvasH - winH - 8; y += gapY) {
            if (Math.random() < 0.2) continue;
            ctx.shadowBlur = 6;
            ctx.fillStyle = neonColorStr;
            ctx.fillRect(x, y, winW, winH);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 1.5, y + 2, winW - 3, winH - 4);
          }
        }
      } 
      else if (style === 'stripes') {
        const barW = 4;
        const gapX = 20;
        for (let x = 10; x <= canvasW - barW - 10; x += gapX) {
          if (Math.random() < 0.2) continue;
          ctx.shadowBlur = 8;
          ctx.fillStyle = neonColorStr;
          ctx.fillRect(x, 0, barW, canvasH);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 1, 0, barW - 2, canvasH);
        }
      } 
      else if (style === 'bands') {
        const bandH = 3;
        const gapY = 24;
        for (let y = 12; y <= canvasH - bandH - 12; y += gapY) {
          if (Math.random() < 0.25) continue;
          ctx.shadowBlur = 8;
          ctx.fillStyle = neonColorStr;
          ctx.fillRect(0, y, canvasW, bandH);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, y + 0.5, canvasW, bandH - 1);
        }
      } 
      else {
        const dotW = 6;
        const gapX = 14;
        const gapY = 14;
        for (let x = 8; x <= canvasW - dotW - 8; x += gapX) {
          for (let y = 8; y <= canvasH - dotW - 8; y += gapY) {
            if (Math.random() < 0.55) continue;
            ctx.shadowBlur = 5;
            ctx.fillStyle = neonColorStr;
            ctx.fillRect(x, y, dotW, dotW);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 1.5, y + 1.5, dotW - 3, dotW - 3);
          }
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    // Helper to generate a glowing landing pad texture for starting tower rooftop
    const makeRooftopLandingPadTexture = (w, d, neonColorStr) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, 256, 256);
      
      ctx.shadowBlur = 12;
      ctx.shadowColor = neonColorStr;
      ctx.strokeStyle = neonColorStr;
      ctx.lineWidth = 6;
      
      ctx.beginPath();
      ctx.arc(128, 128, 80, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.arc(128, 128, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = neonColorStr;
      ctx.font = 'bold 72px Outfit, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', 128, 128);
      
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(128, 128, 80, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 68px Outfit, Arial, sans-serif';
      ctx.fillText('H', 128, 128);
      
      return new THREE.CanvasTexture(canvas);
    };

    this.cyberTowers = [];

    if (!randomise) {
      /* floor canvas texture */
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Asphalt background
      ctx.fillStyle = '#05050b';
      ctx.fillRect(0, 0, 512, 512);

      // Sidewalk blocks (dark slate)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(40, 40, 432, 432);

      // Neon purple glowing curb borders
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 6;
      ctx.strokeRect(40, 40, 432, 432);

      // Solid cyan lane markers on road edges
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(24, 24, 464, 464);

      // Bright neon-yellow dashed road center lines along tile borders
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 16]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(512, 0); ctx.lineTo(512, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(512, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 512); ctx.lineTo(512, 512); ctx.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(15, 15);

      const gMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
        metalness: 0.4
      });

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), gMat);
      floor.rotation.x = -Math.PI / 2;
      this.scene.add(floor);
    }

    // Shared roof material without window markings
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x050508,
      roughness: 0.4,
      metalness: 0.6
    });

    const spawnTower = (x, z, w, h, d, yPos = null) => {
      const hSegs = Math.max(1, Math.round(h / 15));
      // Divide width and depth into 2 segments to get glowing neon window/face center lines!
      const geom = new THREE.BoxGeometry(w, h, d, 2, hSegs, 2);
      
      const neonConfigs = [
        { color: 0x8b5cf6, cssColor: '#a78bfa' }, // purple
        { color: 0x06b6d4, cssColor: '#22d3ee' }, // cyan
        { color: 0x10b981, cssColor: '#34d399' }, // green
        { color: 0xfacc15, cssColor: '#fbbf24' }  // yellow
      ];
      
      const config = neonConfigs[Math.floor(Math.random() * neonConfigs.length)];
      const style = ['grid', 'stripes', 'bands', 'dots'][Math.floor(Math.random() * 4)];
      
      // Generate custom-fit window textures for X sides (depth d) and Z sides (width w)
      const texX = makeCustomNeonWindowTexture(d, h, config.cssColor, style);
      const texZ = makeCustomNeonWindowTexture(w, h, config.cssColor, style);

      // Glossy face material mapping glowing windows for X sides
      const towerMatX = new THREE.MeshStandardMaterial({
        color: 0x0a0a10,
        map: texX,
        emissiveMap: texX,
        emissive: config.color,
        emissiveIntensity: 1.5,
        roughness: 0.15,
        metalness: 0.85
      });

      // Glossy face material mapping glowing windows for Z sides
      const towerMatZ = new THREE.MeshStandardMaterial({
        color: 0x0a0a10,
        map: texZ,
        emissiveMap: texZ,
        emissive: config.color,
        emissiveIntensity: 1.5,
        roughness: 0.15,
        metalness: 0.85
      });

      // Starting tower gets a custom landing pad rooftop
      let currentRoofMat = roofMat;
      if (x === 0 && z === 0) {
        const startPadTex = makeRooftopLandingPadTexture(w, d, config.cssColor);
        currentRoofMat = new THREE.MeshStandardMaterial({
          color: 0x08080c,
          map: startPadTex,
          emissiveMap: startPadTex,
          emissive: config.color,
          emissiveIntensity: 1.5,
          roughness: 0.3,
          metalness: 0.7
        });
      }

      // Apply materials to vertical sides and top/bottom
      const materials = [
        towerMatX, // +X
        towerMatX, // -X
        currentRoofMat,  // +Y (Roof)
        roofMat,  // -Y (Bottom)
        towerMatZ, // +Z
        towerMatZ  // -Z
      ];

      const tMesh = new THREE.Mesh(geom, materials);
      const y = yPos !== null ? yPos : h / 2;
      tMesh.position.set(x, y, z);
      this.scene.add(tMesh);

      const edges = new THREE.EdgesGeometry(geom);
      // Make neon wireframe outline color match window color config!
      const lineMat = new THREE.LineBasicMaterial({color: config.color});
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.copy(tMesh.position);
      this.scene.add(wireframe);

      const box = new THREE.Box3().setFromObject(tMesh);
      this.cyberTowers.push({
        mesh: tMesh,
        wireframe: wireframe,
        box: box,
        name: yPos !== null ? `CyberBridge ${this.cyberTowers.length + 1}` : `CyberTower ${this.cyberTowers.length + 1}`
      });
    };

    // Spawn the central starting tower for rooftop takeoff (height 40m)
    spawnTower(0, 0, 24, 40, 24);

    // Block centers for X and Z spaced every 40 units
    const blockCoords = [-280, -240, -200, -160, -120, -80, -40, 0, 40, 80, 120, 160, 200, 240, 280];

    for (const bx of blockCoords) {
      for (const bz of blockCoords) {
        // Skip the central starting block since we spawned the start tower separately above
        if (bx === 0 && bz === 0) continue;

        // 85% chance to populate this block with skyscrapers
        if (Math.random() > 0.85) continue;

        // Choose block sub-layout:
        // 1: Single massive skyscraper
        // 2: Two tall slender skyscrapers side-by-side (X-axis split + sky bridge)
        // 3: Two tall slender skyscrapers side-by-side (Z-axis split + sky bridge)
        // 4: Three tightly grouped buildings (cramped valley!)
        const layout = Math.random();

        if (layout < 0.3) {
          // Single large skyscraper
          const w = 18 + Math.random() * 8; // 18 to 26 width
          const d = 18 + Math.random() * 8; // 18 to 26 depth
          // 15% chance of super-tall mega-tower
          const isMega = Math.random() < 0.15;
          const h = isMega ? (180 + Math.random() * 100) : (60 + Math.random() * 80);
          spawnTower(bx, bz, w, h, d);
        } else if (layout < 0.6) {
          // Two side-by-side along X
          const h1 = 50 + Math.random() * 70;
          const h2 = 60 + Math.random() * 90;
          const w = 8 + Math.random() * 4;
          const d = 15 + Math.random() * 5;
          spawnTower(bx - 6, bz, w, h1, d);
          spawnTower(bx + 6, bz, w, h2, d);

          // 45% chance of an FPV fly-through sky bridge underpass connecting them!
          if (Math.random() < 0.45) {
            const bridgeH = 15 + Math.random() * 20;
            const bridgeThickness = 6 + Math.random() * 6;
            spawnTower(bx, bz, 12, bridgeThickness, d - 2, bridgeH + bridgeThickness / 2);
          }
        } else if (layout < 0.85) {
          // Two side-by-side along Z
          const h1 = 50 + Math.random() * 70;
          const h2 = 60 + Math.random() * 90;
          const w = 15 + Math.random() * 5;
          const d = 8 + Math.random() * 4;
          spawnTower(bx, bz - 6, w, h1, d);
          spawnTower(bx, bz + 6, w, h2, d);

          // 45% chance of an FPV fly-through sky bridge underpass along Z
          if (Math.random() < 0.45) {
            const bridgeH = 15 + Math.random() * 20;
            const bridgeThickness = 6 + Math.random() * 6;
            spawnTower(bx, bz, w - 2, bridgeThickness, 12, bridgeH + bridgeThickness / 2);
          }
        } else {
          // Three tightly grouped towers
          const h1 = 120 + Math.random() * 80; // center tall tower
          const h2 = 40 + Math.random() * 40;  // front short tower
          const h3 = 45 + Math.random() * 45;  // back short tower
          spawnTower(bx, bz, 14, h1, 14);       // center
          spawnTower(bx - 7, bz - 7, 7, h2, 7); // front-left offset
          spawnTower(bx + 7, bz + 7, 7, h3, 7); // back-right offset
        }
      }
    }
  }

  randomiseCyber() {
    this._buildCyber(true);
  }

  /* ── AR scan ── */
  _startAR() {
    this.vid.style.display = 'block';
    document.getElementById('scanner-overlay').classList.remove('hidden');
    sfx.startScan();

    this.arMode = 'hologram';

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => { this.vid.srcObject = s; })
        .catch(() => {
          // Fallback Grid Chamber background if camera fails
          this.scene.background = new THREE.Color(0x05080c);
          this.scene.fog = new THREE.FogExp2(0x05080c, 0.04);
          
          const fallbackGrid = new THREE.GridHelper(20, 20, 0x10b981, 0x112233);
          fallbackGrid.position.y = 0.01;
          this.scene.add(fallbackGrid);
        });
    }

    const sampleBoxSurface = (w, h, d, x, y, z) => {
      const face = Math.floor(Math.random() * 3);
      let px = 0, py = 0, pz = 0;
      if (face === 0) {
        px = (Math.random() > 0.5 ? w / 2 : -w / 2);
        py = (Math.random() - 0.5) * h;
        pz = (Math.random() - 0.5) * d;
      } else if (face === 1) {
        px = (Math.random() - 0.5) * w;
        py = (Math.random() > 0.5 ? h / 2 : -h / 2);
        pz = (Math.random() - 0.5) * d;
      } else {
        px = (Math.random() - 0.5) * w;
        py = (Math.random() - 0.5) * h;
        pz = (Math.random() > 0.5 ? d / 2 : -d / 2);
      }
      return [px + x, py + y, pz + z];
    };

    // Shared holographic grid texture for scanned furniture/boundaries
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 64, 64);
    this.holoGridTexture = new THREE.CanvasTexture(canvas);
    this.holoGridTexture.wrapS = THREE.RepeatWrapping;
    this.holoGridTexture.wrapT = THREE.RepeatWrapping;
    this.holoGridTexture.repeat.set(4, 4);

    this.arBoxes = [];

    const addHoloObject = (geom, x, y, z, name) => {
      const mat = new THREE.MeshBasicMaterial({
        map: this.holoGridTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const edges = new THREE.EdgesGeometry(geom);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0
      });
      const wireframe = new THREE.LineSegments(edges, edgeMat);
      wireframe.position.copy(mesh.position);
      this.scene.add(wireframe);

      const box = new THREE.Box3().setFromObject(mesh);
      this.arBoxes.push({
        box: box,
        name: name,
        mesh: mesh,
        wireframe: wireframe
      });
    };

    // Construct the scanned room boundary (walls, floor, ceiling)
    // Floor is collidable (Y=0)
    addHoloObject(new THREE.BoxGeometry(10, 0.1, 10), 0, -0.05, 0, 'Floor');
    // Ceiling is collidable (Y=3)
    addHoloObject(new THREE.BoxGeometry(10, 0.1, 10), 0, 3.05, 0, 'Ceiling');
    // Walls
    addHoloObject(new THREE.BoxGeometry(10, 3, 0.1), 0, 1.5, -5.05, 'Back Wall');
    addHoloObject(new THREE.BoxGeometry(10, 3, 0.1), 0, 1.5, 5.05, 'Front Wall');
    addHoloObject(new THREE.BoxGeometry(0.1, 3, 10), -5.05, 1.5, 0, 'Left Wall');
    addHoloObject(new THREE.BoxGeometry(0.1, 3, 10), 5.05, 1.5, 0, 'Right Wall');

    // Add scanned room furniture models
    addHoloObject(new THREE.BoxGeometry(1.2, 0.4, 0.8), 0, 0.2, 0, 'Coffee Table');
    addHoloObject(new THREE.BoxGeometry(2.4, 0.85, 0.9), 0, 0.425, -2.5, 'Sofa');
    addHoloObject(new THREE.BoxGeometry(2.0, 0.6, 0.5), 0, 0.3, 3.2, 'TV Cabinet');
    addHoloObject(new THREE.BoxGeometry(1.4, 0.75, 0.7), -3.2, 0.375, 1.8, 'Desk');
    addHoloObject(new THREE.BoxGeometry(0.8, 1.8, 0.4), 3.5, 0.9, -1.8, 'Bookshelf');
    addHoloObject(new THREE.BoxGeometry(0.9, 0.8, 0.9), -2.8, 0.4, -1.2, 'Armchair');

    /* point cloud surface sampling */
    const N = 1500;
    const vp = new Float32Array(N * 3);
    const vc = new Float32Array(N * 3);

    const sampleTargets = [
      { w: 10, h: 0.1, d: 10, x: 0, y: -0.05, z: 0, count: 300 }, // Floor
      { w: 10, h: 0.1, d: 10, x: 0, y: 3.05, z: 0, count: 150 },  // Ceiling
      { w: 10, h: 3, d: 0.1, x: 0, y: 1.5, z: -5.05, count: 200 }, // Back Wall
      { w: 10, h: 3, d: 0.1, x: 0, y: 1.5, z: 5.05, count: 150 },  // Front Wall
      { w: 0.1, h: 3, d: 10, x: -5.05, y: 1.5, z: 0, count: 200 }, // Left Wall
      { w: 0.1, h: 3, d: 10, x: 5.05, y: 1.5, z: 0, count: 200 },  // Right Wall
      { w: 1.2, h: 0.4, d: 0.8, x: 0, y: 0.2, z: 0, count: 60 },   // Coffee Table
      { w: 2.4, h: 0.85, d: 0.9, x: 0, y: 0.425, z: -2.5, count: 100 }, // Sofa
      { w: 2.0, h: 0.6, d: 0.5, x: 0, y: 0.3, z: 3.2, count: 60 }, // TV Cabinet
      { w: 1.4, h: 0.75, d: 0.7, x: -3.2, y: 0.375, z: 1.8, count: 50 }, // Desk
      { w: 0.8, h: 1.8, d: 0.4, x: 3.5, y: 0.9, z: -1.8, count: 30 } // Bookshelf
    ];

    let pIdx = 0;
    for (const target of sampleTargets) {
      for (let i = 0; i < target.count && pIdx < N; i++) {
        const pt = sampleBoxSurface(target.w, target.h, target.d, target.x, target.y, target.z);
        vp[pIdx * 3] = pt[0];
        vp[pIdx * 3 + 1] = pt[1];
        vp[pIdx * 3 + 2] = pt[2];
        vc[pIdx * 3] = 0.05 + Math.random() * 0.05;
        vc[pIdx * 3 + 1] = 0.7 + Math.random() * 0.15;
        vc[pIdx * 3 + 2] = 0.4 + Math.random() * 0.15;
        pIdx++;
      }
    }

    while (pIdx < N) {
      vp[pIdx * 3] = (Math.random() - 0.5) * 10;
      vp[pIdx * 3 + 1] = Math.random() * 3;
      vp[pIdx * 3 + 2] = (Math.random() - 0.5) * 10;
      vc[pIdx * 3] = 0.06; vc[pIdx * 3 + 1] = 0.72; vc[pIdx * 3 + 2] = 0.5;
      pIdx++;
    }

    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute('position', new THREE.BufferAttribute(vp, 3));
    cGeo.setAttribute('color', new THREE.BufferAttribute(vc, 3));
    cGeo.setDrawRange(0, 0); // Initially draw nothing, animated in tick
    
    const cMat = new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0 });
    this.arPoints = new THREE.Points(cGeo, cMat);
    this.scene.add(this.arPoints);

    // Laser Sweep Plane
    const sweepPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const sweepPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const sweepPlane = new THREE.Mesh(sweepPlaneGeo, sweepPlaneMat);
    sweepPlane.rotation.x = -Math.PI / 2;
    sweepPlane.position.y = 0;
    this.scene.add(sweepPlane);

    const sweepEdges = new THREE.EdgesGeometry(sweepPlaneGeo);
    const sweepLineMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
    const sweepWire = new THREE.LineSegments(sweepEdges, sweepLineMat);
    sweepPlane.add(sweepWire);

    const t0 = performance.now();
    const tick = now => {
      if (!this.alive || this.env !== 'ar') return;
      const p = Math.min((now - t0) / 5000, 1);
      document.getElementById('scanner-fill').style.width = p * 100 + '%';
      document.getElementById('scanner-pct').innerText = Math.round(p * 100) + ' %';
      document.getElementById('scanner-log').innerText = `PTS: ${Math.round(p * N)}/${N} | MESH: ${p > 0.4 ? 'RECONSTRUCTING' : 'ACQUIRING'}`;
      
      const activeCount = Math.round(p * N);
      cGeo.setDrawRange(0, activeCount);
      cMat.opacity = Math.min(p * 1.5, 0.95);
      
      sweepPlane.position.y = (Math.sin(now * 0.006) + 1) * 1.5;
      
      for (const item of this.arBoxes) {
        if (item.mesh && item.mesh.material) {
          item.mesh.material.opacity = p * 0.45;
        }
        if (item.wireframe && item.wireframe.material) {
          item.wireframe.material.opacity = p * 0.85;
        }
      }
      
      const arc = document.getElementById('radar-arc');
      if (arc) arc.style.strokeDashoffset = 339.3 * (1 - p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        document.getElementById('scanner-overlay').classList.add('hidden');
        sfx.stopScan();
        this.scene.remove(sweepPlane);
        sweepPlaneGeo.dispose();
        sweepPlaneMat.dispose();
        sweepEdges.dispose();
        sweepLineMat.dispose();
      }
    };
    requestAnimationFrame(tick);
  }

  /* ── Drone mesh for sim ── */
  _droneMesh() {
    const g=new THREE.Group();
    const config = (this.droneSpec && this.droneSpec.config) || {
      frame: 'fr-avata',
      motors: 'mt-2207',
      esc: 'es-50a',
      propellers: 'pr-5b',
      flight_controller: 'fc-o3',
      battery: 'bt-4s',
      camera: 'cm-4k',
      transmitter: 'tx-o3'
    };
    const frameId = config.frame || 'fr-fpv5';
    this.propGrps=[];

    // Build and add each component mesh from specs/config
    REQUIRED.forEach(cat => {
      const id = config[cat];
      if(id){
        const mesh = buildComponentMesh(cat, id, frameId, cat === 'propellers' ? this.propGrps : null);
        if(mesh) g.add(mesh);
      }
    });

    /* sparks */
    const spN=40, spArr=new Float32Array(spN*3);
    this._spVel=[]; for(let i=0;i<spN;i++) this._spVel.push(new THREE.Vector3((Math.random()-.5)*12,(Math.random()-.2)*12,(Math.random()-.5)*12));
    const spGeo=new THREE.BufferGeometry(); spGeo.setAttribute('position',new THREE.BufferAttribute(spArr,3));
    this.sparkPts=new THREE.Points(spGeo,new THREE.PointsMaterial({color:0xfbbf24,size:.1,transparent:true,opacity:0}));
    g.add(this.sparkPts);

    /* smoke */
    const smN=35, smArr=new Float32Array(smN*3);
    this._smVel=[]; this._smAge=new Float32Array(smN);
    for(let i=0;i<smN;i++){ this._smAge[i]=Math.random()*2; this._smVel.push(new THREE.Vector3((Math.random()-.5)*.8,.5+Math.random()*1.2,(Math.random()-.5)*.8)); }
    const smGeo=new THREE.BufferGeometry(); smGeo.setAttribute('position',new THREE.BufferAttribute(smArr,3));
    this.smokePts=new THREE.Points(smGeo,new THREE.PointsMaterial({color:0x94A3B8,size:.22,transparent:true,opacity:0}));
    g.add(this.smokePts);

    return g;
  }

  /* ── input ── */
  _initKeys() {
    this.keys={};
    window.addEventListener('keydown',e=>{
      this.keys[e.key]=true;
      if(e.key==='c'||e.key==='C'){ const o=['chase','fpv','orbit']; this.camMode=o[(o.indexOf(this.camMode)+1)%3]; document.getElementById('btn-cam').innerText='📷 '+this.camMode.charAt(0).toUpperCase()+this.camMode.slice(1); }
      if(e.key==='f'||e.key==='F'){ this.mode=this.mode==='level'?'acro':'level'; document.getElementById('btn-mode').innerText='⚙️ '+this.mode.charAt(0).toUpperCase()+this.mode.slice(1); }
      if(e.key==='r'||e.key==='R') this.resetPos();
    });
    window.addEventListener('keyup',e=>this.keys[e.key]=false);

    /* joysticks */
    ['joy-l','joy-r'].forEach((zid,zi)=>{
      const zone=document.getElementById(zid); if(!zone) return;
      const handle=zone.querySelector('.joystick-stick');
      let rect=null, tid=null;
      zone.addEventListener('touchstart',e=>{ e.preventDefault(); rect=zone.getBoundingClientRect(); tid=e.changedTouches[0].identifier; },{passive:false});
      window.addEventListener('touchmove',e=>{
        if(rect===null) return;
        for(const t of e.changedTouches) if(t.identifier===tid){
          let dx=t.clientX-rect.left-rect.width/2, dy=t.clientY-rect.top-rect.height/2;
          const max=rect.width/2-20, dist=Math.hypot(dx,dy);
          if(dist>max){ dx=dx/dist*max; dy=dy/dist*max; }
          handle.style.transform=`translate(${dx}px,${dy}px)`;
          const nx=dx/max, ny=-dy/max;
          if(zi===0){ this.yaw=nx; this.thr=Math.max(0,(ny+1)/2); } else { this.rol=nx; this.pit=ny; }
        }
      });
      const end=()=>{ handle.style.transform='translate(0,0)'; rect=null; if(zi===1){this.rol=0;this.pit=0;} else this.yaw=0; };
      window.addEventListener('touchend',e=>{ for(const t of e.changedTouches) if(t.identifier===tid) end(); });
    });
  }

  _readKeys() {
    if(this.keys['w']||this.keys['W']) this.thr=Math.min(this.thr+.04,1);
    else if(this.keys['s']||this.keys['S']) this.thr=Math.max(this.thr-.04,0);
    this.yaw=(this.keys['a']||this.keys['A'])?-.75:(this.keys['d']||this.keys['D'])?.75:0;
    this.pit=(this.keys['ArrowUp'])?.65:(this.keys['ArrowDown'])?-.65:0;
    this.rol=(this.keys['ArrowLeft'])?-.65:(this.keys['ArrowRight'])?.65:0;
  }

  /* ── main loop ── */
  _loop() {
    if(!this.alive) return;
    requestAnimationFrame(()=>this._loop());
    const now=performance.now(), dt=Math.min((now-this.prevT)/1000,.1); this.prevT=now;
    this._readKeys();
    if(!this.crashed) this._physics(dt); else this._tumble(dt);
    if(this.env==='city' || this.env==='training') this._checkGates();
    this._ambient(now);
    this._camera();
    this._hud();
    this.ren.render(this.scene,this.cam3);
  }

  /* ── physics ── */
  _physics(dt) {
    /* battery */
    if(this.env === 'training') {
      this.bat = 100;
      document.getElementById('hud-battery-warn').classList.add('hidden');
    } else if(!this.cutoff){
      const capacityFactor = 1500 / (this.droneSpec.cap || 2000);
      const drainRate = 0.08 * capacityFactor;
      this.bat=Math.max(0,this.bat-(1+this.thr*4.5)*dt*drainRate);
      if(this.bat<20){ document.getElementById('hud-battery-warn').classList.remove('hidden'); this.alarmCD-=dt; if(this.alarmCD<=0){sfx.alarm();this.alarmCD=1.6;} }
      if(this.bat<=0){ this.cutoff=true; this.thr=0; }
    }

    const batScale=this.bat>20?1:this.bat/20;
    const thrForce=this.droneSpec.thrN*this.thr*batScale;

    /* ground height */
    const inStartingRoof = this.env === 'cyber' && Math.abs(this.pos.x) < 12 && Math.abs(this.pos.z) < 12;
    const gndY = inStartingRoof ? 40 : (this.env === 'city' ? terrainY(this.pos.x, this.pos.z) : 0);
    const agl=this.pos.y-gndY;

    /* ground effect */
    let gef=1; if(agl>0&&agl<1.2) gef=1+.22*(1.2-agl);

    /* forces */
    const mass=this.droneSpec.wg/1000;
    const grav=new THREE.Vector3(0,-9.81*mass,0);
    const thrDir=new THREE.Vector3(0,1,0).applyQuaternion(this.quat).multiplyScalar(thrForce*gef);
    const drag=this.vel.clone().multiplyScalar(-.18*1.225*this.vel.length());
    const wind=this.env==='city'?new THREE.Vector3(Math.sin(performance.now()*.001)*4.5*.06,0,Math.cos(performance.now()*.001)*4.5*.04):new THREE.Vector3();
    const acc=new THREE.Vector3().add(grav).add(thrDir).add(drag).add(wind).divideScalar(mass);
    this.vel.add(acc.clone().multiplyScalar(dt));
    this.pos.add(this.vel.clone().multiplyScalar(dt));

    if (this.env === 'cyber') {
      const boundary = 300;
      const size = 600;
      if (this.pos.x > boundary) {
        this.pos.x -= size;
        this.cam3.position.x -= size;
      } else if (this.pos.x < -boundary) {
        this.pos.x += size;
        this.cam3.position.x += size;
      }
      if (this.pos.z > boundary) {
        this.pos.z -= size;
        this.cam3.position.z -= size;
      } else if (this.pos.z < -boundary) {
        this.pos.z += size;
        this.cam3.position.z += size;
      }
    }

    /* rotation */
    const eu=new THREE.Euler().setFromQuaternion(this.quat,'YXZ');
    if(this.mode==='level'){
      const tPit=this.pit*.45, tRol=-this.rol*.45;
      eu.x+=(tPit-eu.x)*8*dt; eu.z+=(tRol-eu.z)*8*dt; eu.y+=-this.yaw*2.8*dt;
    } else {
      eu.x+=this.pit*3.5*dt; eu.z+=-this.rol*3.5*dt; eu.y+=-this.yaw*2.8*dt;
    }
    this.quat.setFromEuler(eu);
    this.drone.position.copy(this.pos); this.drone.quaternion.copy(this.quat);
    sfx.throttle(this.thr);

    /* save telemetry */
    this._tDrag=drag.length().toFixed(1); this._tLift=thrDir.length().toFixed(1); this._tGef=gef.toFixed(2);

    /* collision */
    this._collide(agl, gndY);
  }

  _collide(agl, gndY) {
    const minH=this.env==='ar'?.05:gndY+.42;
    if(this.pos.y<minH){
      if(this.vel.length()>4.2) this._crash(this.vel.length(),'Ground');
      else { this.pos.y=minH; this.vel.set(0,0,0); }
      return;
    }
    const sp=new THREE.Sphere(this.pos,.42);
    const list=this.env==='city'?this.buildings:(this.env==='training'?this.trainingObstacles:(this.env==='cyber'?this.cyberTowers:this.arBoxes));
    for(const b of list) if(b.box.intersectsSphere(sp)){ this._crash(this.vel.length(),b.name); break; }
  }

  _crash(v, what) {
    this.crashed=true; this.shakeT=.45; this.shakeF=Math.min(v*.03,.5);
    sfx.stopMotors(); sfx.crash();
    document.body.classList.add('glitch-active');
    this.cv.classList.add('screen-camera-shake');
    setTimeout(()=>this.cv.classList.remove('screen-camera-shake'),450);
    this.sparkPts.material.opacity=1;
    const a=this.sparkPts.geometry.attributes.position.array; for(let i=0;i<a.length;i++) a[i]=0;
    this.sparkPts.geometry.attributes.position.needsUpdate=true;
    this.smokePts.material.opacity=.95;

    document.getElementById('crash-overlay').classList.remove('hidden');
    document.getElementById('crash-speed').innerText=Math.round(v*3.6)+' km/h';
    document.getElementById('crash-g').innerText=(v/9.81/.1).toFixed(1)+' G';
    const lines=[
      ['Frame Plate',v>10?'FRACTURED':'INTACT',v<=10],
      ['Stator Coils','SHORT CIRCUIT',false],['ESC Board','VOLTAGE COLLAPSE',false],
      ['Antenna Link','DISCONNECTED',false],['Camera Gimbal','BLOCKED',false]
    ].map(r=>`<div class="bb-log-line"><span>${r[0]}</span><span class="${r[2]?'bb-pass':'bb-fail'}">${r[1]}</span></div>`).join('');
    document.getElementById('crash-log').innerHTML=`<div style="font-weight:700;color:#F87171;margin-bottom:6px">IMPACT: ${what.toUpperCase()}</div>${lines}`;
  }

  _tumble(dt) {
    this.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,.5,.2).normalize(),12*dt));
    this.vel.y=Math.max(-15,this.vel.y-9.81*dt); this.vel.x*=.95; this.vel.z*=.95;
    this.pos.add(this.vel.clone().multiplyScalar(dt));
    const inStartingRoof = this.env === 'cyber' && Math.abs(this.pos.x) < 12 && Math.abs(this.pos.z) < 12;
    const fl = inStartingRoof ? 40.42 : (this.env === 'city' ? terrainY(this.pos.x, this.pos.z) + 0.42 : 0.42);
    if(this.pos.y<fl){this.pos.y=fl;this.vel.set(0,0,0);}
    this.drone.position.copy(this.pos); this.drone.quaternion.copy(this.quat);

    /* sparks */
    const sa=this.sparkPts.geometry.attributes.position.array;
    let vis=false;
    for(let i=0;i<40;i++){
      const v=this._spVel[i]; sa[i*3]+=v.x*dt; sa[i*3+1]+=v.y*dt; sa[i*3+2]+=v.z*dt;
      v.y-=9.81*dt; v.multiplyScalar(.96); if(v.length()>.05) vis=true;
    }
    this.sparkPts.geometry.attributes.position.needsUpdate=true;
    if(!vis) this.sparkPts.material.opacity=0;

    /* smoke */
    const sma=this.smokePts.geometry.attributes.position.array;
    for(let i=0;i<35;i++){
      this._smAge[i]+=dt;
      if(this._smAge[i]>2){
        sma[i*3]=(Math.random()-.5)*.1; sma[i*3+1]=(Math.random()-.5)*.1; sma[i*3+2]=(Math.random()-.5)*.1;
        this._smAge[i]=0; this._smVel[i].set((Math.random()-.5)*.8,.4+Math.random()*.8,(Math.random()-.5)*.8);
      } else { const v=this._smVel[i]; sma[i*3]+=v.x*dt; sma[i*3+1]+=v.y*dt; sma[i*3+2]+=v.z*dt; }
    }
    this.smokePts.geometry.attributes.position.needsUpdate=true;
  }

  _checkGates() {
    if (this.env === 'training') {
      const targetGate = this.gates[this.targetGateIdx];
      if (targetGate && targetGate.sphere.containsPoint(this.pos)) {
        sfx.snap();
        this.obstaclesClearedCount++;
        
        // Turn cleared gate green
        targetGate.mesh.material = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 0.9,
          roughness: 0.2
        });

        this.targetGateIdx = (this.targetGateIdx + 1) % this.gates.length;
        
        // Light up the next target gate orange
        const nextGate = this.gates[this.targetGateIdx];
        if (nextGate && this.targetGateIdx !== 0) {
          nextGate.mesh.material = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xf59e0b,
            emissiveIntensity: 1.2,
            roughness: 0.2
          });
        }
        
        this._toast(`Obstacles: ${this.obstaclesClearedCount}`);
        
        if (this.targetGateIdx === 0) {
          setTimeout(() => {
            if (this.env !== 'training') return;
            const activeGateMat = new THREE.MeshStandardMaterial({color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.2, roughness: 0.2});
            const inactiveGateMat = new THREE.MeshStandardMaterial({color: 0x334155, roughness: 0.8, metalness: 0.2});
            this.gates.forEach((g, i) => {
              g.mesh.material = i === 0 ? activeGateMat : inactiveGateMat;
            });
          }, 1000);
        }
      }
    } else {
      const targetGate = this.gates[this.targetGateIdx];
      if (targetGate && targetGate.sphere.containsPoint(this.pos)) {
        sfx.snap();
        this.cleared.add(targetGate.idx);
        
        // Turn cleared gate green
        targetGate.mesh.material = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 0.9,
          roughness: 0.2
        });

        this.targetGateIdx = (this.targetGateIdx + 1) % this.gates.length;
        
        // Light up the next target gate neon purple
        const nextGate = this.gates[this.targetGateIdx];
        if (nextGate && this.targetGateIdx !== 0) {
          nextGate.mesh.material = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            emissive: 0x8b5cf6,
            emissiveIntensity: 1.5,
            roughness: 0.2
          });
          if (this.beacon) {
            this.beacon.position.copy(nextGate.mesh.position);
          }
        }
        
        this._toast(`Gate ${this.cleared.size}/8`);

        if (this.targetGateIdx === 0) {
          setTimeout(() => {
            if (this.env !== 'city') return;
            this.cleared.clear();
            const activeCityGateMat = new THREE.MeshStandardMaterial({
              color: 0x8b5cf6,
              emissive: 0x8b5cf6,
              emissiveIntensity: 1.5,
              roughness: 0.2
            });
            const inactiveCityGateMat = new THREE.MeshStandardMaterial({
              color: 0x334155,
              roughness: 0.8,
              metalness: 0.2
            });
            this.gates.forEach((g, i) => {
              g.mesh.material = i === 0 ? activeCityGateMat : inactiveCityGateMat;
            });
            if (!this.beacon) {
              const beaconGeo = new THREE.CylinderGeometry(0.05, 1.5, 400, 16, 1, true);
              beaconGeo.translate(0, 200, 0);
              const beaconMat = new THREE.MeshBasicMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.25,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false
              });
              this.beacon = new THREE.Mesh(beaconGeo, beaconMat);
              this.scene.add(this.beacon);
            }
            this.beacon.position.copy(this.gates[0].mesh.position);
          }, 1500);
        }
      }
    }
  }

  _ambient(now) {
    if(!this.crashed) this.propGrps.forEach((p,i)=>p.rotation.y+=.15*(1+this.thr*15)*(i%2?-1:1));
    if(this.env==='city'&&this.riverMesh){
      const rv=this.riverMesh.geometry.attributes.position, t=now*.0018;
      for(let i=0;i<rv.count;i++) rv.setZ(i,Math.sin(rv.getX(i)*.15+t)*Math.cos(rv.getY(i)*.15+t)*.4);
      rv.needsUpdate=true;
    }
  }

  _camera() {
    if(this.camMode==='chase'){
      const off=new THREE.Vector3(0,1.3,-4.5).applyQuaternion(this.quat);
      this.cam3.position.lerp(this.pos.clone().add(off),.15);
      this.cam3.lookAt(this.pos.clone().add(new THREE.Vector3(0,.4,0)));
    } else if(this.camMode==='fpv'){
      const off=new THREE.Vector3(0,.06,.35).applyQuaternion(this.quat);
      this.cam3.position.copy(this.pos.clone().add(off));
      this.cam3.lookAt(this.pos.clone().add(new THREE.Vector3(0,0,12).applyQuaternion(this.quat)));
    } else {
      this.cam3.position.lerp(new THREE.Vector3(0,16,-28),.1);
      this.cam3.lookAt(this.pos);
    }
    if(this.shakeT>0){
      this.cam3.position.add(new THREE.Vector3((Math.random()-.5)*this.shakeF,(Math.random()-.5)*this.shakeF,(Math.random()-.5)*this.shakeF));
      this.shakeT-=.016;
    }
  }

  _hud() {
    if(!this.onHud) return;
    const spd=Math.round(this.vel.length()*3.6), alt=Math.max(0,this.pos.y);
    this.onHud({
      thr:Math.round(this.thr*100),bat:Math.round(this.bat),spd:spd+' km/h',alt:alt.toFixed(1)+' m',
      gates:this.env==='cyber'?'FREE':(this.env==='training'?this.obstaclesClearedCount:this.cleared.size+'/8'),mode:this.mode.toUpperCase(),
      drag:(this._tDrag||'0')+' N',lift:(this._tLift||'0')+' N',rho:'1.225',gef:(this._tGef||'1.00')+'×',
      g:(1+this.vel.length()/9.81*.08).toFixed(1)+' G'
    });
  }

  resetPos() {
    this.pos.set(0, this.env==='ar'?0.85:(this.env==='cyber'?40.42:6), this.env==='ar'?0:(this.env==='cyber'?0:15));
    this.vel.set(0,0,0); this.quat.identity();
    this.crashed=false; this.cutoff=false; this.bat=100;
    document.body.classList.remove('glitch-active');
    document.getElementById('crash-overlay').classList.add('hidden');
    document.getElementById('hud-battery-warn').classList.add('hidden');
    this.sparkPts.material.opacity=0; this.smokePts.material.opacity=0;
    sfx.stopMotors(); sfx.startMotors(4);
  }

  toggleArMode() {
    const modes = ['hologram', 'lidar', 'solid', 'camera'];
    this.arMode = modes[(modes.indexOf(this.arMode) + 1) % modes.length];
    
    const btn = document.getElementById('btn-ar-mode');
    if (btn) btn.innerText = '🌐 ' + this.arMode.charAt(0).toUpperCase() + this.arMode.slice(1);
    
    this._updateArVisuals();
  }

  _updateArVisuals() {
    if (this.env !== 'ar') return;
    
    const showPoints = this.arMode === 'hologram' || this.arMode === 'lidar';
    const showWireframes = this.arMode === 'hologram';
    const showSolid = this.arMode === 'hologram' || this.arMode === 'solid';
    
    if (this.arPoints) {
      this.arPoints.visible = showPoints;
    }
    
    for (const item of this.arBoxes) {
      if (item.mesh) {
        item.mesh.visible = showSolid;
        if (item.mesh.material) {
          if (this.arMode === 'solid') {
            item.mesh.material.opacity = 0.85;
            item.mesh.material.map = null;
            item.mesh.material.color.setHex(0x4b5563);
          } else {
            item.mesh.material.opacity = 0.45;
            item.mesh.material.map = this.holoGridTexture;
            item.mesh.material.color.setHex(0x10b981);
          }
          item.mesh.material.needsUpdate = true;
        }
      }
      if (item.wireframe) {
        item.wireframe.visible = showWireframes;
        if (item.wireframe.material) {
          item.wireframe.material.opacity = 0.85;
        }
      }
    }
  }

  stop() {
    this.alive=false; sfx.stopMotors(); document.body.classList.remove('glitch-active');
    if(this.vid.srcObject){ this.vid.srcObject.getTracks().forEach(t=>t.stop()); this.vid.srcObject=null; }
  }

  _toast(msg) {
    const t=document.getElementById('snap-toast'); t.innerText=msg; t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),1500);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — APP CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  let lab = null, sim = null, tab = 'frame';

  const PRESETS = {
    micro: {
      frame: 'fr-neo',
      motors: 'mt-1306',
      esc: 'es-20a',
      propellers: 'pr-3b',
      flight_controller: 'fc-f4',
      battery: 'bt-3s',
      camera: 'cm-ana',
      transmitter: 'tx-elrs'
    },
    avata: {
      frame: 'fr-avata',
      motors: 'mt-2207',
      esc: 'es-50a',
      propellers: 'pr-5b',
      flight_controller: 'fc-o3',
      battery: 'bt-4s',
      camera: 'cm-4k',
      transmitter: 'tx-o3'
    },
    racing: {
      frame: 'fr-fpv5',
      motors: 'mt-2806',
      esc: 'es-70a',
      propellers: 'pr-2b',
      flight_controller: 'fc-f7',
      battery: 'bt-6s',
      camera: 'cm-ana',
      transmitter: 'tx-elrs'
    }
  };

  const applyPreset = type => {
    if(!lab) return;
    sfx.snap();
    const config = PRESETS[type];
    Object.entries(config).forEach(([cat, id]) => {
      lab.equip(cat, id);
    });
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.preset === type));
    renderList();
  };

  document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
    applyPreset(btn.dataset.preset);
  }));

  /* ── navigation ── */
  const show = name => {
    document.querySelectorAll('.lab-view').forEach(v => v.classList.toggle('active', v.id === 'view-'+name));
    document.querySelectorAll('.step-node').forEach(n => {
      n.classList.remove('active');
      if(n.dataset.screen === name) n.classList.add('active');
    });
    if(name==='builder' && !lab){ lab = new AssemblyLab('assembly-canvas', onStats); buildTabs(); }
  };

  /* breadcrumb clicks */
  document.querySelectorAll('.step-node').forEach(n => n.addEventListener('click', () => {
    const s = n.dataset.screen;
    if(s==='sim' || s==='env') return; // only go forward via buttons
    if(sim){ sim.stop(); sim=null; document.getElementById('hud').classList.add('hidden'); }
    show(s);
  }));

  /* home buttons */
  document.getElementById('btn-go-builder').addEventListener('click', () => { sfx.snap(); show('builder'); });
  document.getElementById('btn-quick-fly').addEventListener('click', () => {
    sfx.snap();
    show('sim');
    sim = new FlightSim('sim-canvas','cam-feed', hudUpdate);
    sim.launch({wg:610,thrN:25.1,cells:6,frame:'fr-avata'},'city');
    document.getElementById('hud').classList.remove('hidden');
  });

  /* builder → env */
  document.getElementById('btn-deploy').addEventListener('click', () => { sfx.snap(); show('env'); });
  document.getElementById('btn-back-builder').addEventListener('click', () => { sfx.snap(); show('builder'); });

  /* env launch buttons */
  document.querySelectorAll('[data-launch]').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    const env = btn.dataset.launch;
    sfx.snap();
    show('sim');
    sim = new FlightSim('sim-canvas','cam-feed', hudUpdate);
    sim.launch(lab.specs(), env);
    document.getElementById('hud').classList.remove('hidden');
  }));

  /* env card highlight */
  document.querySelectorAll('.env-deck-card').forEach(card => card.addEventListener('click', () => {
    document.querySelectorAll('.env-deck-card').forEach(c => c.classList.remove('active-selection'));
    card.classList.add('active-selection');
  }));

  /* sim HUD buttons */
  document.getElementById('btn-cam').addEventListener('click', () => { if(sim){const o=['chase','fpv','orbit'];sim.camMode=o[(o.indexOf(sim.camMode)+1)%3];document.getElementById('btn-cam').innerText='📷 '+sim.camMode.charAt(0).toUpperCase()+sim.camMode.slice(1);} });
  document.getElementById('btn-mode').addEventListener('click', () => { if(sim){sim.mode=sim.mode==='level'?'acro':'level';document.getElementById('btn-mode').innerText='⚙️ '+sim.mode.charAt(0).toUpperCase()+sim.mode.slice(1);} });
  document.getElementById('btn-reset').addEventListener('click', () => sim?.resetPos());
  document.getElementById('btn-repair').addEventListener('click', () => sim?.resetPos());
  document.getElementById('btn-randomise').addEventListener('click', () => {
    if (sim && sim.env === 'cyber') {
      sfx.snap();
      sim.randomiseCyber();
    }
  });
  document.getElementById('btn-ar-mode').addEventListener('click', () => {
    if (sim && sim.env === 'ar') {
      sfx.snap();
      sim.toggleArMode();
    }
  });
  document.getElementById('btn-exit').addEventListener('click', () => {
    sfx.snap(); if(sim){sim.stop();sim=null;} document.getElementById('hud').classList.add('hidden'); show('builder');
  });

  /* sound toggle */
  document.getElementById('btn-sound-toggle').addEventListener('click', () => {
    const on = sfx.toggle();
    document.getElementById('btn-sound-toggle').innerText = on ? '🔊 Audio' : '🔇 Muted';
  });

  /* ── catalog UI ── */
  function buildTabs() {
    const container = document.getElementById('catalog-tabs');
    container.innerHTML = '';
    Object.keys(PARTS).forEach(cat => {
      const b = document.createElement('button');
      b.className = 'catalog-tab' + (cat===tab?' active':'');
      b.innerText = cat.replace('_',' ').toUpperCase();
      b.onclick = () => { tab=cat; document.querySelectorAll('.catalog-tab').forEach(t=>t.classList.remove('active')); b.classList.add('active'); renderList(); };
      container.appendChild(b);
    });
    renderList();
  }

  function renderList() {
    const el = document.getElementById('catalog-list'); el.innerHTML = '';
    PARTS[tab].forEach(item => {
      const eq = lab.slots[tab]?.id === item.id;
      const card = document.createElement('div');
      card.className = 'comp-card' + (eq?' equipped':'');
      const specs = Object.entries(item.sp).map(([k,v]) => `<span><strong>${k}:</strong> ${v}</span>`).join('');
      card.innerHTML = `<div class="comp-top-row"><span class="comp-title">${item.name}</span><span class="comp-badge">${item.w} g</span></div><div class="comp-desc">${item.desc}</div><div class="comp-specs-grid">${specs}</div>`;
      card.onclick = () => {
        sfx.snap(); lab.equip(tab, item.id);
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        const t = document.getElementById('snap-toast'); t.innerText = '✓ ' + item.name; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 1500);
        renderList();
      };
      el.appendChild(card);
    });
  }

  /* ── stats callback ── */
  const ARC = 125.6;
  function onStats(s) {
    document.getElementById('arc-weight').style.strokeDashoffset = ARC - Math.min(s.w,800)/800*ARC;
    document.getElementById('val-weight').innerText = s.w+' g';
    document.getElementById('arc-thrust').style.strokeDashoffset = ARC - Math.min(s.thr,2800)/2800*ARC;
    document.getElementById('val-thrust').innerText = s.thr+' g';
    document.getElementById('arc-twr').style.strokeDashoffset = ARC - Math.min(s.twr,5)/5*ARC;
    document.getElementById('val-twr').innerText = s.twr+'×';

    const v = document.getElementById('twr-verdict');
    if(s.ok){ v.innerText=s.twr>=2?`TWR ${s.twr}× — flight capable`:`TWR ${s.twr}× — weak lift`; v.className='verdict-banner '+(s.twr>=2?'success':'warning'); }
    else { v.innerText='Snap remaining parts…'; v.className='verdict-banner'; }

    document.getElementById('progress-fill').style.width = s.pct+'%';
    document.getElementById('progress-pct').innerText = s.pct+' %';

    document.getElementById('sp-bat').innerText = s.bat;
    document.getElementById('sp-hover').innerText = s.hover;
    document.getElementById('sp-speed').innerText = s.spd;
    document.getElementById('sp-cam').innerText = s.cam;
    document.getElementById('sp-range').innerText = s.rng;
    document.getElementById('sp-cells').innerText = s.cells;

    const cl = document.getElementById('checklist'); cl.innerHTML = '';
    REQUIRED.forEach(k => {
      const ok = !!lab.slots[k];
      cl.innerHTML += `<div class="check-item${ok?' done':''}"><span class="check-bullet">✓</span><span>${k.replace('_',' ').toUpperCase()}</span></div>`;
    });

    const btn = document.getElementById('btn-deploy');
    btn.classList.toggle('disabled', !s.ok); btn.disabled = !s.ok;
  }

  /* ── HUD callback ── */
  function hudUpdate(h) {
    document.getElementById('h-thr').innerText = h.thr+' %';
    document.getElementById('h-bat').innerText = h.bat+' %';
    document.getElementById('h-spd').innerText = h.spd;
    document.getElementById('h-alt').innerText = h.alt;
    document.getElementById('h-gate').innerText = h.gates;
    document.getElementById('h-mode').innerText = h.mode;
    document.getElementById('v-drag').innerText = h.drag;
    document.getElementById('v-lift').innerText = h.lift;
    document.getElementById('v-rho').innerText = h.rho;
    document.getElementById('v-gnd').innerText = h.gef;
    document.getElementById('v-g').innerText = h.g;
  }

  /* ── particle canvas bg ── */
  const pCanvas = document.getElementById('hub-particle-canvas');
  if(pCanvas){
    const ctx = pCanvas.getContext('2d');
    let W=pCanvas.width=innerWidth, H=pCanvas.height=innerHeight;
    window.addEventListener('resize',()=>{W=pCanvas.width=innerWidth;H=pCanvas.height=innerHeight;});
    const dots=[]; for(let i=0;i<45;i++) dots.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45});
    (function draw(){
      requestAnimationFrame(draw);
      if(!document.getElementById('view-home').classList.contains('active')) return;
      ctx.clearRect(0,0,W,H); ctx.fillStyle='rgba(99,102,241,.12)'; ctx.strokeStyle='rgba(99,102,241,.04)';
      dots.forEach(d=>{d.x+=d.vx;d.y+=d.vy;if(d.x<0||d.x>W)d.vx*=-1;if(d.y<0||d.y>H)d.vy*=-1;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();});
      for(let i=0;i<dots.length;i++) for(let j=i+1;j<dots.length;j++){
        if(Math.hypot(dots[i].x-dots[j].x,dots[i].y-dots[j].y)<110){ctx.beginPath();ctx.moveTo(dots[i].x,dots[i].y);ctx.lineTo(dots[j].x,dots[j].y);ctx.stroke();}
      }
    })();
  }

  /* ── showcase preview ── */
  const pvCv = document.getElementById('hub-drone-preview');
  if(pvCv){
    const sc=new THREE.Scene(); sc.background=new THREE.Color(0xF6F5F2);
    const d=pvCv.getBoundingClientRect(), cam=new THREE.PerspectiveCamera(40,d.width/d.height,.1,10);
    cam.position.set(1.5,1.2,1.5);
    const ren=new THREE.WebGLRenderer({canvas:pvCv,antialias:true}); ren.setSize(d.width,d.height);
    const oc=new OrbitControls(cam,ren.domElement); oc.enableZoom=false; oc.enablePan=false; oc.autoRotate=true; oc.autoRotateSpeed=4;
    sc.add(new THREE.AmbientLight(0xffffff,.7));
    sc.add(new THREE.PointLight(0x6366F1,1.2,10).translateX(2).translateY(2).translateZ(2));
    const g=new THREE.Group(), mat=new THREE.MeshStandardMaterial({color:0x242426,metalness:.8});
    g.add(new THREE.Mesh(new THREE.BoxGeometry(.1,.02,.7),mat)); g.add(new THREE.Mesh(new THREE.BoxGeometry(.7,.02,.1),mat));
    const rotors=[];
    [[.35,.35],[-.35,.35],[.35,-.35],[-.35,-.35]].forEach(o=>{
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.05,8),new THREE.MeshStandardMaterial({color:0xe5e7eb,metalness:.9})).translateX(o[0]).translateY(.03).translateZ(o[1]));
      const p=new THREE.Mesh(new THREE.BoxGeometry(.015,.002,.28),new THREE.MeshStandardMaterial({color:0xD97706}));
      p.position.set(o[0],.06,o[1]); g.add(p); rotors.push(p);
    });
    sc.add(g);
    (function tick(){requestAnimationFrame(tick);rotors.forEach(r=>r.rotation.y+=.2);oc.update();ren.render(sc,cam);})();
    window.addEventListener('resize',()=>{const b=pvCv.parentElement.getBoundingClientRect();cam.aspect=b.width/b.height;cam.updateProjectionMatrix();ren.setSize(b.width,b.height);});
  }
});