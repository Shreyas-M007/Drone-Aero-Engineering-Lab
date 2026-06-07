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
    { id:'fr-phantom', name:'DJI Phantom 6″ unibody',  w:220, desc:'Classic white aerodynamic unibody shell. Highly stable.', sp:{Size:'6″ Quad',Mat:'ABS Unibody'}},
    { id:'fr-mavic', name:'DJI Mavic 3 folding shell', w:175, desc:'Foldable carbon-composite frame with low aerodynamic drag.', sp:{Size:'5″ Fold',Mat:'Carbon Composite'}},
    { id:'fr-inspire', name:'DJI Inspire 3 carbon T-frame', w:340, desc:'Professional dual-boom CineCore frame with retractable landing gear.', sp:{Size:'7″ Cine',Mat:'Carbon Weave'}},
  ],
  motors: [
    { id:'mt-1404', name:'1404 2900KV micro bell',     w:9,  thrust:420,  desc:'Lightweight high-efficiency motors for micro quads.', sp:{KV:'2900',Lift:'420 g ea'}},
    { id:'mt-1306', name:'1306 4000KV micro stator',   w:12, thrust:550,  desc:'Tiny quiet motors for sub-250 g builds.',      sp:{KV:'4000',Lift:'550 g ea'}},
    { id:'mt-2207', name:'2207 1950KV sport racing',    w:34, thrust:1850, desc:'32 000 RPM bells for agile freestyle.',        sp:{KV:'1950',Lift:'1850 g ea'}},
    { id:'mt-2806', name:'2806 1300KV heavy-lift',      w:45, thrust:2500, desc:'High torque for payload & wind stability.',    sp:{KV:'1300',Lift:'2500 g ea'}},
    { id:'mt-2312', name:'2312 960KV classic bell',     w:55, thrust:1200, desc:'Reliable brushless motor for stable video platforms.', sp:{KV:'960',Lift:'1200 g ea'}},
    { id:'mt-2008', name:'DJI Mavic 2008 1400KV stator', w:22, thrust:980, desc:'Highly optimized flat stator design for long endurance.', sp:{KV:'1400',Lift:'980 g ea'}},
    { id:'mt-3512', name:'DJI Inspire 3512 800KV power', w:110, thrust:3600, desc:'Heavy-lift motor for cinema payloads.', sp:{KV:'800',Lift:'3600 g ea'}},
  ],
  esc: [
    { id:'es-15a',  name:'DJI Neo 15A ESC',      w:4,  desc:'Ultra-efficient micro ESC.',             sp:{Amps:'15 A',Proto:'DShot300'}},
    { id:'es-20a',  name:'SpeedyBee 20A micro',  w:6,  desc:'Lightweight DShot300 controller.',             sp:{Amps:'20 A',Proto:'DShot300'}},
    { id:'es-30a',  name:'DJI Phantom 30A ESC',  w:10, desc:'Classic reliable ESC.', sp:{Amps:'30 A',Proto:'PWM'}},
    { id:'es-50a',  name:'DJI FPV 50A board',    w:14, desc:'High-current MOS layout running DShot600.',    sp:{Amps:'50 A',Proto:'DShot600'}},
    { id:'es-70a',  name:'Fettec 70A heat-sink',  w:19, desc:'Metal shell dissipates heat at full throttle.',sp:{Amps:'70 A',Proto:'DShot1200'}},
    { id:'es-40a',  name:'DJI Mavic 40A smart ESC', w:12, desc:'Sine-wave drive ESC for smooth velocity control.', sp:{Amps:'40 A',Proto:'Smart Link'}},
    { id:'es-80a',  name:'DJI Inspire 80A dual ESC', w:32, desc:'Dual-redundancy heavy power controller.', sp:{Amps:'80 A',Proto:'Dual Bus'}},
  ],
  propellers: [
    { id:'pr-3b',   name:'Gemfan 3″ tri-blade ducted', w:3, desc:'Short high-pitch blades for duct compression lift.',sp:{Blades:'3-Blade',Span:'3.0″'}},
    { id:'pr-3-5b', name:'DJI Avata 3.5″ 5-blade',   w:6, desc:'Custom-pitched quiet props.', sp:{Blades:'5-Blade',Span:'3.5″'}},
    { id:'pr-5b',   name:'DJI Avata 5-blade ducted',   w:6, desc:'Max static thrust for altitude hold.',              sp:{Blades:'5-Blade',Span:'3.5″'}},
    { id:'pr-2b',   name:'DJI FPV 5.3″ dual-blade',    w:5, desc:'Low drag for top-end speed.',                       sp:{Blades:'2-Blade',Span:'5.3″'}},
    { id:'pr-9b',   name:'DJI Phantom 9.4″ props', w:12, desc:'Classic high-efficiency propellers.', sp:{Blades:'2-Blade',Span:'9.4″'}},
    { id:'pr-9-4',  name:'DJI Mavic 9.4″ folding props', w:8, desc:'Quiet-designed folding prop blades.', sp:{Blades:'2-Blade',Span:'9.4″'}},
    { id:'pr-15b',  name:'DJI Inspire 15″ carbon prop', w:24, desc:'Stiff carbon weave props for massive thrust.', sp:{Blades:'2-Blade',Span:'15.0″'}},
  ],
  flight_controller: [
    { id:'fc-neo',  name:'DJI Neo Flight Core',   w:5,  desc:'Ultra-miniature sensor suite.', sp:{CPU:'M4',Gyro:'ICM42688'}},
    { id:'fc-f4',   name:'Betaflight F405',       w:6,  desc:'Reliable MPU6000 gyro. Smooth hover.',  sp:{CPU:'F405',Gyro:'MPU6000'}},
    { id:'fc-f7',   name:'KISS Ultra F722',       w:8,  desc:'8 kHz loop rate, ultra-responsive.',     sp:{CPU:'F722',Gyro:'BMI270'}},
    { id:'fc-o3',   name:'DJI O3 Flight Core',    w:12, desc:'Auto altitude-lock and GPS brakes.',     sp:{CPU:'H7 Dual',Gyro:'ICM42688'}},
    { id:'fc-naza', name:'DJI Naza-M V2',         w:25, desc:'Classic flight controller with stable GPS damping.', sp:{CPU:'STM32F4',Gyro:'MPU6050'}},
    { id:'fc-mavic',name:'DJI Mavic AP Core V3',  w:15, desc:'Obstacle avoidance and vision computing module.', sp:{CPU:'H7 Dual',Gyro:'Dual ICM42688'}},
    { id:'fc-inspire', name:'DJI Inspire CineCore 3.0', w:48, desc:'Integrated image processing and flight control system.', sp:{CPU:'CineCore 3',Gyro:'Redundant'}},
  ],
  battery: [
    { id:'bt-1s',   name:'1S 1435 mAh Li-ion',    w:45,  desc:'High energy density cell for micro drones.', sp:{Cap:'1435 mAh',V:'3.8 V (1S)'}},
    { id:'bt-3s',   name:'3S 1435 mAh LiPo',      w:85,  desc:'Lightweight agile pack, shorter range.',  sp:{Cap:'1435 mAh',V:'11.1 V (3S)'}},
    { id:'bt-4s',   name:'4S 2420 mAh LiPo',      w:180, desc:'Balanced energy for cinematic ops.',       sp:{Cap:'2420 mAh',V:'14.8 V (4S)'}},
    { id:'bt-6s',   name:'6S 2000 mAh HV',        w:295, desc:'Peak discharge for sprint acceleration.',  sp:{Cap:'2000 mAh',V:'22.2 V (6S)'}},
    { id:'bt-phantom', name:'DJI Phantom 4S 4480 mAh', w:365, desc:'Aerodynamic slide-in smart battery.', sp:{Cap:'4480 mAh',V:'15.2 V (4S)'}},
    { id:'bt-mavic', name:'DJI Mavic 4S 5000 mAh', w:335, desc:'Compact high-density smart battery.', sp:{Cap:'5000 mAh',V:'15.4 V (4S)'}},
    { id:'bt-inspire', name:'DJI Inspire 6S 4280 mAh dual', w:710, desc:'Dual self-heating cinema battery system.', sp:{Cap:'8560 mAh',V:'22.8 V (6S)'}},
  ],
  camera: [
    { id:'cm-neo',  name:'DJI Neo 4K recessed',   w:10,  desc:'1-axis single-sensor stabilizer.', sp:{Sensor:'4K/30 HDR',Delay:'30 ms'}},
    { id:'cm-ana',  name:'Caddx Ratel 2 analog',  w:6,   desc:'Low-latency analog feed, 8 ms delay.',   sp:{Sensor:'1200 TVL',Delay:'8 ms'}},
    { id:'cm-4k',   name:'DJI O3 4K gimbal cam',  w:28,  desc:'48 MP, single-axis stabiliser, 4K/60.',   sp:{Sensor:'4K/60 HDR',Delay:'28 ms'}},
    { id:'cm-phantom', name:'DJI Phantom 3-axis cam', w:55, desc:'4K 12 MP camera with integrated brushless gimbal.', sp:{Sensor:'4K/30',Delay:'35 ms'}},
    { id:'cm-mavic', name:'DJI Mavic Hasselblad triple-cam', w:65, desc:'Hasselblad 4/3 CMOS plus dual telephoto lenses.', sp:{Sensor:'5.1K Cine',Delay:'32 ms'}},
    { id:'cm-inspire', name:'DJI Zenmuse X9-8K Cinema', w:320, desc:'Full-frame 8K cinema gimbal with interchangeable lens.', sp:{Sensor:'8K ProRes',Delay:'20 ms'}},
  ],
  transmitter: [
    { id:'tx-neo',  name:'DJI Neo controller link', w:2,  desc:'Integrated Wi-Fi / O3 link.', sp:{Band:'2.4/5.8 G',Range:'0.1-6 km'}},
    { id:'tx-elrs', name:'ELRS 2.4 GHz whip',     w:4,   desc:'Linear antenna, 2 km LOS.',            sp:{Band:'2.4 GHz',Range:'2 km'}},
    { id:'tx-o3',   name:'DJI O3 dual-link',       w:18,  desc:'Dual encrypted link, 10 km range.',    sp:{Band:'2.4/5.8 G',Range:'10 km'}},
    { id:'tx-phantom', name:'DJI Phantom 5.8 GHz whip', w:6, desc:'Classic video receiver link.', sp:{Band:'5.8 GHz',Range:'3 km'}},
    { id:'tx-mavic', name:'DJI O3+ transmission system', w:14, desc:'High-definition low-latency video link.', sp:{Band:'O3+ Dual',Range:'15 km'}},
    { id:'tx-inspire', name:'DJI O3 Pro Cinema link', w:30,  desc:'Independent pilot/gimbal operator dual-link.', sp:{Band:'O3 Pro',Range:'20 km'}},
  ]
};

const REQUIRED = ['frame','motors','esc','propellers','flight_controller','battery','camera','transmitter'];

// Reusable temporary variables to prevent GC allocations in loops
const _tempV1 = new THREE.Vector3();
const _tempV2 = new THREE.Vector3();
const _tempV3 = new THREE.Vector3();
const _tempV4 = new THREE.Vector3();
const _tempV5 = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
const _tempEuler = new THREE.Euler();
const _tempSphere = new THREE.Sphere();

/* helper — terrain height at world (x,z) */
function terrainY(x, z) {
  let h = Math.sin(Math.abs(x) * 0.012) * Math.cos(z * 0.012) * 12 + Math.sin(Math.abs(x) * 0.03) * 3.5;
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
function buildComponentMesh(cat, id, frameId, propsArray, batteryId) {
  const g = new THREE.Group(), M = AssemblyLab.MAT;
  const duct = frameId === 'fr-neo' || frameId === 'fr-avata';
  const s = frameId === 'fr-neo' ? 0.3 : frameId === 'fr-avata' ? 0.35 : (frameId === 'fr-mavic' ? 0.42 : (frameId === 'fr-phantom' ? 0.48 : (frameId === 'fr-inspire' ? 0.65 : 0.45)));
  const motorY = frameId === 'fr-inspire' ? 0.06 : (frameId === 'fr-phantom' ? 0.03 : (frameId === 'fr-mavic' ? 0.03 : 0.02));
  
  const getMotorPos = (fid, s, mY) => {
    if (fid === 'fr-mavic') {
      const fL = s * 0.95 * Math.sqrt(2);
      const bL = s * 0.85 * Math.sqrt(2);
      const sin = Math.sin(Math.PI/4), cos = Math.cos(Math.PI/4);
      return [
        [fL*sin, mY, fL*cos],
        [-fL*sin, mY, fL*cos],
        [bL*sin, mY, -bL*cos],
        [-bL*sin, mY, -bL*cos]
      ];
    }
    const r = s * Math.sqrt(2);
    const sin = Math.sin(Math.PI/4), cos = Math.cos(Math.PI/4);
    return [
      [r*sin, mY, r*cos],
      [-r*sin, mY, r*cos],
      [r*sin, mY, -r*cos],
      [-r*sin, mY, -r*cos]
    ];
  };
  const motorPos = getMotorPos(frameId, s, motorY);
  
  const armConfigs = motorPos.map(p => {
    const dist = Math.hypot(p[0], p[2]);
    const angle = Math.atan2(p[0], p[2]);
    return {
      x: p[0] * 0.5,
      z: p[2] * 0.5,
      length: dist * 1.05,
      angle: angle
    };
  });

  const getBatteryHeight = bid => {
    if (bid === 'bt-1s') return 0.04;
    if (bid === 'bt-3s') return 0.08;
    if (bid === 'bt-6s') return 0.15;
    if (bid === 'bt-phantom') return 0.20;
    if (bid === 'bt-mavic') return 0.16;
    if (bid === 'bt-inspire') return 0.22;
    return 0.12;
  };
  const bh = batteryId ? getBatteryHeight(batteryId) : 0;

  // Local helper materials for high-fidelity detailing
  const yellowMat = new THREE.MeshStandardMaterial({color: 0xeab308, roughness: 0.4});
  const goldMat = new THREE.MeshStandardMaterial({color: 0xd97706, roughness: 0.2, metalness: 0.8});

  if(cat==='frame'){
    if(id==='fr-phantom'){
      // White unibody shell
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), M.white);
      body.scale.set(1.2, 0.6, 1.6);
      body.position.y = 0.06;
      g.add(body);
      
      // White arms
      armConfigs.forEach(cfg => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, cfg.length), M.white);
        arm.rotation.y = cfg.angle;
        arm.position.set(cfg.x, 0.03, cfg.z);
        g.add(arm);
        
        // Motor mounts
        const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12), M.white);
        mount.position.set(cfg.x * 2, 0.03, cfg.z * 2);
        g.add(mount);
      });
      
      // Classic Phantom curved landing gear arches (two white arches)
      [-1, 1].forEach(side => {
        const legGroup = new THREE.Group();
        legGroup.position.set(side * 0.12, -0.06, 0);
        
        [-1, 1].forEach(zSide => {
          const strut = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.15, 0.012), M.white);
          strut.position.set(0, -0.05, zSide * 0.12);
          strut.rotation.z = -side * Math.PI / 10;
          strut.rotation.x = zSide * Math.PI / 12;
          legGroup.add(strut);
        });
        
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8), M.white);
        foot.rotation.x = Math.PI/2;
        foot.position.set(-side * 0.02, -0.12, 0);
        legGroup.add(foot);
        
        g.add(legGroup);
      });
    }
    else if(id==='fr-mavic'){
      // Sleek dark grey fuselage body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.46), M.dark);
      body.position.y = 0.04;
      body.position.z = -0.02;
      g.add(body);
      
      // Orange highlights/lines
      const accent = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.006, 0.22), M.orange);
      accent.position.set(0, 0.065, 0.04);
      g.add(accent);
      
      // Thin folding arms
      armConfigs.forEach((cfg, idx) => {
        const isFront = idx < 2;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.022, cfg.length), M.carbon);
        arm.rotation.y = cfg.angle;
        arm.position.set(cfg.x, 0.03, cfg.z);
        g.add(arm);
        
        // Motor pods
        const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 10), M.dark);
        pod.position.set(cfg.x * 2, 0.03, cfg.z * 2);
        g.add(pod);
        
        // Small landing pegs under the front motor pods
        if (isFront) {
          const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.05, 6), M.dark);
          const podP = motorPos[idx];
          peg.position.set(podP[0], -0.01, podP[2]);
          g.add(peg);
        }
      });
    }
    else if(id==='fr-inspire'){
      // Aerodynamic white fuselage cockpit
      const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), M.white);
      cockpit.scale.set(1.1, 0.7, 1.8);
      cockpit.position.set(0, 0.08, 0);
      g.add(cockpit);
      
      // Dual parallel side carbon booms (horizontal tubes)
      [-0.15, 0.15].forEach(x => {
        const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 12), M.carbon);
        boom.rotation.x = Math.PI / 2;
        boom.position.set(x, 0.06, -0.05);
        g.add(boom);
        
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.012), M.carbon);
        strut.position.set(x/2, 0.06, 0.2);
        g.add(strut);
        
        const strutBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.012), M.carbon);
        strutBack.position.set(x/2, 0.06, -0.2);
        g.add(strutBack);
      });
      
      // Heavy carbon arm tubes to motor mounts
      armConfigs.forEach(cfg => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, cfg.length, 10), M.carbon);
        arm.rotation.z = Math.PI / 2;
        arm.rotation.y = cfg.angle;
        arm.position.set(cfg.x, 0.06, cfg.z);
        g.add(arm);
        
        // Large motor mounts
        const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), M.dark);
        mount.position.set(cfg.x * 2, 0.06, cfg.z * 2);
        g.add(mount);
      });
      
      // Retractable carbon landing gear struts (raised for flight, down on bench)
      [-0.18, 0.18].forEach(x => {
        const legGroup = new THREE.Group();
        legGroup.position.set(x, 0.04, 0);
        
        // Vertical landing gear strut
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 10), M.carbon);
        strut.position.set(0, -0.11, 0);
        legGroup.add(strut);
        
        // Foot pad horizontal tube
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.48, 10), M.carbon);
        foot.rotation.x = Math.PI / 2;
        foot.position.set(0, -0.22, 0);
        legGroup.add(foot);
        
        // White foot caps
        [-0.24, 0.24].forEach(z => {
          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.02, 10), M.white);
          cap.rotation.x = Math.PI / 2;
          cap.position.set(0, -0.22, z);
          legGroup.add(cap);
        });
        
        g.add(legGroup);
      });
    }
    else {
      // DEFAULT Frame (Avata, FPV 5", Neo, etc. fallbacks)
      // Bottom carbon chassis plate
      g.add(new THREE.Mesh(new THREE.BoxGeometry(duct?.3:.38, .008, duct?.4:.65), M.carbon));
      
      // Vertical landing gear legs with rubber feet
      const legW = duct ? 0.3 : 0.38;
      const legL = duct ? 0.4 : 0.65;
      const legX = legW / 2 - 0.02;
      const legZ = legL / 2 - 0.04;
      const legH = Math.max(0.18, bh + 0.006);
      [[legX, legZ], [-legX, legZ], [legX, -legZ], [-legX, -legZ]].forEach(p => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, legH, 8), M.carbon);
        leg.position.set(p[0], -legH / 2, p[1]);
        g.add(leg);
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8), M.dark);
        foot.position.set(p[0], -legH + 0.006, p[1]);
        g.add(foot);
      });
      
      // Top carbon deck plate (elevated)
      const topPlate = new THREE.Mesh(new THREE.BoxGeometry(duct?.2:.26, .006, duct?.32:.48), M.carbon);
      topPlate.position.y = 0.22;
      topPlate.position.z = -0.05;
      g.add(topPlate);

      // Standoff columns
      const standoffHeight = 0.22;
      const standoffPositions = duct ? 
        [[0.09, 0.11, 0.14], [-0.09, 0.11, 0.14], [0.09, 0.11, -0.18], [-0.09, 0.11, -0.18]] :
        [[0.11, 0.11, 0.2], [-0.11, 0.11, 0.2], [0.11, 0.11, -0.2], [-0.11, 0.11, -0.2], [0.09, 0.11, 0], [-0.09, 0.11, 0]];
        
      standoffPositions.forEach(p => {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, standoffHeight, 8), M.indigo);
        column.position.set(p[0], p[1], p[2]);
        g.add(column);
        
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.006, 6), M.silver);
        bolt.position.set(p[0], 0.223, p[2]);
        g.add(bolt);
      });

      // Camera Cage side carbon plates
      const cageZ = duct ? 0.24 : 0.32;
      [-0.08, 0.08].forEach(x => {
        const cagePlate = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.22, 0.15), M.carbon);
        cagePlate.position.set(x, 0.11, cageZ);
        g.add(cagePlate);
      });

      if(id==='fr-avata'){
        [[.35,.04,.35],[-.35,.04,.35],[.35,.04,-.35],[-.35,.04,-.35]].forEach(p=>{
          g.add(new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.18,32,1,true), M.orange).translateX(p[0]).translateY(p[1]).translateZ(p[2]));
        });
      }
      
      // Frame arms
      armConfigs.forEach(cfg => {
        const arm=new THREE.Mesh(new THREE.BoxGeometry(.04,.016,cfg.length),M.carbon);
        arm.rotation.y=cfg.angle; arm.position.set(cfg.x,0,cfg.z); g.add(arm);
      });
      
      if(duct){ 
        const pod=new THREE.Mesh(new THREE.SphereGeometry(.1,16,16),M.indigo); 
        pod.scale.set(1,.6,1.3); pod.position.y=.05; g.add(pod); 
      }
      else {
        [[.1,.08,.2],[-.1,.08,.2],[.1,.08,-.2],[-.1,.08,-.2]].forEach(p=>{
          g.add(new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.15,8),M.indigo).translateX(p[0]).translateY(p[1]).translateZ(p[2]));
        });
      }
    }
  }
  else if(cat==='motors'){
    let r = id==='mt-1404'||id==='mt-1306' ? 0.045 : (id==='mt-2008' ? 0.075 : (id==='mt-2312' ? 0.085 : (id==='mt-2806' ? 0.095 : (id==='mt-3512' ? 0.115 : 0.07))));
    let h = id==='mt-1404' ? 0.045 : (id==='mt-1306' ? 0.05 : (id==='mt-2008' ? 0.055 : (id==='mt-2312'||id==='mt-2207' ? 0.08 : (id==='mt-2806' ? 0.09 : (id==='mt-3512' ? 0.12 : 0.08)))));
    motorPos.forEach(p=>{
      const mg=new THREE.Group(); mg.position.set(p[0],p[1],p[2]);
      
      // Motor base (black)
      mg.add(new THREE.Mesh(new THREE.CylinderGeometry(r-.004,r,h*.2,12),M.dark));
      
      // Stator block with visible copper coils inside
      const stator = new THREE.Mesh(new THREE.CylinderGeometry(r-.01,r-.01,h*.6,12),M.dark);
      stator.position.y = h*.3;
      // 6 Copper coil windings inside
      for(let i=0; i<6; i++) {
        const angle = i * Math.PI / 3;
        const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, h*.5, 6), M.copper);
        coil.position.set(Math.sin(angle)*(r*0.5), 0, Math.cos(angle)*(r*0.5));
        stator.add(coil);
      }
      mg.add(stator);
      
      // Outer rotor bell (silver/blue anodized aluminum)
      const bellHeight = h*.7;
      const bell=new THREE.Mesh(new THREE.CylinderGeometry(r,r,bellHeight,16),M.silver); 
      bell.position.y=h*.55;
      
      // Bell top color accent ring
      const accentMat = id==='mt-2806'?M.indigo:(id==='mt-3512'?goldMat:(id==='mt-2008'?M.silver:goldMat));
      const accent = new THREE.Mesh(new THREE.CylinderGeometry(r+.002,r+.002,bellHeight*.15,16), accentMat);
      accent.position.y = bellHeight*.45;
      bell.add(accent);
      
      // Motor shaft (carbon steel)
      bell.add(new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,h*1.3,8),M.dark).translateY(bellHeight*.1));
      mg.add(bell); 
      g.add(mg);

      // Silicon Motor Wires running along carbon arm
      const wireLen = Math.hypot(p[0], p[2]) - 0.05;
      const wireAngle = Math.atan2(p[0], p[2]);
      const wiresGroup = new THREE.Group();
      wiresGroup.position.set(p[0]/2, p[1] - 0.008, p[2]/2);
      wiresGroup.rotation.y = wireAngle;
      
      [-0.008, 0, 0.008].forEach((offset, idx) => {
        const wireMat = idx === 0 ? M.copper : idx === 1 ? M.white : M.dark;
        const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, wireLen, 6), wireMat);
        wire.rotation.x = Math.PI / 2;
        wire.position.x = offset;
        wiresGroup.add(wire);
      });
      g.add(wiresGroup);
    });
  }
  else if(cat==='esc'){
    const w=id==='es-70a'||id==='es-80a'?.26:id==='es-15a'?.12:id==='es-30a'?.16:id==='es-40a'?.20:.18;
    // Main double-sided PCB board
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w,.012,w),M.dark).translateY(.015).translateZ(-.02));
    
    // Metal heatsink shell on top
    const heatsinkMat = id==='es-80a'?M.silver:(id==='es-40a'?M.orange:(id==='es-70a'?M.silver:M.indigo));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w*0.88,.008,w*0.88),heatsinkMat).translateY(.024).translateZ(-.02));
    
    // Cylindrical capacitors
    const numCaps = id==='es-15a'||id==='es-20a'?2:4;
    for(let i=0;i<numCaps;i++) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.055,8),M.dark);
      cap.position.set((i%2?-1:1)*w*.36, .04, -.02+(i>1?.035:-.035));
      cap.rotation.x = Math.PI / 2;
      // Silver strip on capacitor
      cap.add(new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.055, 0.018), M.silver).translateX(0.012));
      g.add(cap);
    }
  }
  else if(cat==='propellers'){
    let h = id==='mt-1404' ? 0.045 : (id==='mt-1306' ? 0.05 : (id==='mt-2008' ? 0.055 : (id==='mt-2312'||id==='mt-2207' ? 0.08 : (id==='mt-2806' ? 0.09 : (id==='mt-3512' ? 0.12 : 0.08)))));
    const span=id==='pr-3b'?.28:(id==='pr-3-5b'||id==='pr-5b'?.34:(id==='pr-9b'||id==='pr-9-4'?.52:(id==='pr-15b'?.72:.5)));
    const nb=id==='pr-2b'||id==='pr-9b'||id==='pr-9-4'||id==='pr-15b'?2:(id==='pr-3-5b'||id==='pr-5b'?5:3);
    const propMat = id==='pr-15b'?M.carbon:(id==='pr-9b'?M.white:M.orange);

    if (propsArray) propsArray.length = 0;
    motorPos.forEach(p=>{
      const pg=new THREE.Group(); pg.position.set(p[0],p[1]+h*0.9,p[2]);
      
      // Central propeller hub assembly
      pg.add(new THREE.Mesh(new THREE.CylinderGeometry(.032,.032,.022,10),M.dark));
      pg.add(new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.01,10),M.silver).translateY(0.011)); // locknut
      
      if (id === 'pr-9-4') {
        // Folding propeller hub (central metal bar)
        pg.add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.024), M.dark));
        
        // Two blades hinging off pins
        [-1, 1].forEach(side => {
          const bladeGroup = new THREE.Group();
          bladeGroup.position.set(0, 0.008, side * 0.025);
          bladeGroup.rotation.y = (side === 1 ? 0 : Math.PI) + 0.08;
          
          bladeGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.015, 6), M.silver));
          
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.002, span * 0.45), propMat);
          blade.position.set(0, 0.002, span * 0.225);
          blade.rotation.x = 0.08; // pitch angle
          bladeGroup.add(blade);
          
          pg.add(bladeGroup);
        });
      } else {
        for(let i=0;i<nb;i++){
          const bladeGroup = new THREE.Group();
          bladeGroup.rotation.y = i * 2 * Math.PI / nb;
          
          // Single continuous blade
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.003, span * 0.95), propMat);
          blade.position.set(0, 0.003, span * 0.475);
          blade.rotation.x = 0.08; // pitch angle
          bladeGroup.add(blade);
          
          pg.add(bladeGroup);
        }
      }
      g.add(pg);
      if(propsArray) propsArray.push(pg);
    });
  }
  else if(cat==='flight_controller'){
    const w=id==='fc-o3'?.22:id==='fc-inspire'?.28:id==='fc-mavic'?.22:.16;
    // Stacked FC Board (mounted higher on stack pins)
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w,.012,w),id==='fc-f7'?M.indigo:(id==='fc-inspire'?M.silver:(id==='fc-mavic'?M.orange:M.dark))).translateY(.12).translateZ(-.02));
    
    // USB-C port metal bracket
    g.add(new THREE.Mesh(new THREE.BoxGeometry(.03,.015,.04),M.silver).position.set(w/2 - 0.01, .127, 0));
    
    // Tiny colored status LEDs
    g.add(new THREE.Mesh(new THREE.BoxGeometry(.008,.004,.008),new THREE.MeshBasicMaterial({color:0x22c55e})).position.set(-w/4, .127, w/4));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(.008,.004,.008),new THREE.MeshBasicMaterial({color:0xef4444})).position.set(-w/4 + 0.015, .127, w/4));

    if (id === 'fc-inspire') {
      // White/silver image processor box on top of FC stack
      g.add(new THREE.Mesh(new THREE.BoxGeometry(w*0.9, .026, w*0.9), M.white).translateY(.139).translateZ(-.02));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(w*0.6, .002, w*0.4), goldMat).translateY(.153).translateZ(-.02));
    } else if (id === 'fc-mavic') {
      // Second stacked plate
      g.add(new THREE.Mesh(new THREE.BoxGeometry(w*0.8, .01, w*0.8), M.dark).translateY(.131).translateZ(-.02));
    }

    // Wiring Harness ribbon connecting FC to ESC below
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(w*0.4, 0.10, 0.01), M.white);
    ribbon.position.set(0, 0.0675, -w/3);
    g.add(ribbon);

    // GPS Mast & Module puck: Only render on Inspire Cine frame
    if (frameId === 'fr-inspire') {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 8), M.carbon);
      mast.position.set(0, 0.20, -0.15);
      g.add(mast);
      const puck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.06), M.dark);
      puck.position.set(0, 0.28, -0.15);
      puck.add(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.002, 0.045), M.white).translateY(0.008));
      g.add(puck);
    }
  }
  else if(cat==='battery'){
    const bw = id==='bt-3s'?.14 : id==='bt-6s'?.22 : id==='bt-phantom'?.26 : id==='bt-mavic'?.22 : id==='bt-inspire'?.30 : .18;
    const bh = id==='bt-3s'?.08 : id==='bt-6s'?.15 : id==='bt-phantom'?.20 : id==='bt-mavic'?.16 : id==='bt-inspire'?.22 : .12;
    const bl = id==='bt-3s'?.26 : id==='bt-6s'?.42 : id==='bt-phantom'?.50 : id==='bt-mavic'?.45 : id==='bt-inspire'?.55 : .34;
    const yOff = -bh/2 - 0.004;
    
    // Individual layered cells (shows multi-cell LiPo structure)
    const numCells = id==='bt-6s'||id==='bt-inspire'?6:id==='bt-3s'?3:4;
    const cellH = bh / numCells;
    const battGroup = new THREE.Group();
    battGroup.position.set(0, yOff, -0.02);
    
    if (id === 'bt-inspire') {
      // Render two side-by-side packs for Inspire dual battery setup
      const bW = bw * 0.45;
      [-1, 1].forEach(side => {
        const subBatt = new THREE.Mesh(new THREE.BoxGeometry(bW, bh, bl), M.dark);
        subBatt.position.set(side * bw * 0.25, 0, 0);
        battGroup.add(subBatt);
        
        // Add individual cell details inside each pack
        for(let i=0; i<6; i++) {
          const cy = -bh/2 + cellH/2 + i*cellH;
          const cell = new THREE.Mesh(new THREE.BoxGeometry(bW-0.006, cellH-0.002, bl-0.006), M.silver);
          cell.position.set(side * bw * 0.25, cy, 0);
          battGroup.add(cell);
        }
        
        // Render battery capacity LEDs on the back of each pack
        for(let i=0; i<4; i++) {
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), new THREE.MeshBasicMaterial({color: 0x22c55e}));
          led.position.set(side * bw * 0.25 - 0.02 + i*0.013, 0, bl/2 + 0.002);
          battGroup.add(led);
        }
      });
    } else {
      for(let i=0; i<numCells; i++) {
        const cy = -bh/2 + cellH/2 + i*cellH;
        // Cell wrapper (silver metal look inside wrapper)
        const cell = new THREE.Mesh(new THREE.BoxGeometry(bw-0.006, cellH-0.002, bl-0.006), M.silver);
        cell.position.y = cy;
        battGroup.add(cell);
      }
      
      // Outer plastic shrinkwrap shell (black/yellow/white)
      const wrapperMat = id==='bt-6s'||id==='bt-mavic'?M.white:id==='bt-3s'?goldMat:M.dark;
      const wrapper = new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bl), wrapperMat);
      wrapper.position.y = 0;
      battGroup.add(wrapper);
      
      if (id === 'bt-mavic') {
        // Render battery capacity indicator LEDs on Mavic pack
        for(let i=0; i<4; i++) {
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), new THREE.MeshBasicMaterial({color: 0x22c55e}));
          led.position.set(-0.04 + i*0.026, 0, bl/2 + 0.002);
          battGroup.add(led);
        }
      }
    }
    
    g.add(battGroup);
    
    // Velcro Battery Strap wrapping around frame
    const strap = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.008, bh + 0.008, 0.04), M.dark);
    strap.position.set(0, yOff, -0.02);
    g.add(strap);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.02, 0.025), M.silver);
    buckle.position.set(bw/2 + 0.004, yOff, -0.02);
    g.add(buckle);

    // Thick Power Cables (Red & Black) with Yellow XT60 plug
    const cableRadius = 0.004;
    const cableLen = 0.1;
    const cableRed = new THREE.Mesh(new THREE.CylinderGeometry(cableRadius, cableRadius, cableLen, 8), M.orange);
    cableRed.position.set(0.01, yOff, -bl/2 - cableLen/3);
    cableRed.rotation.x = Math.PI/3;
    g.add(cableRed);
    const cableBlack = new THREE.Mesh(new THREE.CylinderGeometry(cableRadius, cableRadius, cableLen, 8), M.dark);
    cableBlack.position.set(-0.01, yOff, -bl/2 - cableLen/3);
    cableBlack.rotation.x = Math.PI/3;
    g.add(cableBlack);
    const xt60 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 0.026), yellowMat);
    xt60.position.set(0, yOff - 0.025, -bl/2 - cableLen * 0.7);
    xt60.rotation.x = Math.PI/6;
    g.add(xt60);
    
    // White JST-XH Balance charging lead (highly realistic detail!)
    const balCable = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.05, 6), M.white);
    balCable.position.set(-bw/3, yOff, bl/2 + 0.02);
    balCable.rotation.z = Math.PI/4;
    g.add(balCable);
    const jstPlug = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.005, 0.012), M.white);
    jstPlug.position.set(-bw/3 - 0.02, yOff + 0.02, bl/2 + 0.03);
    g.add(jstPlug);
  }
  else if(cat==='camera'){
    const getFpvCamPos = (fid) => {
      if (fid === 'fr-neo') return { y: 0.06, z: 0.20 };
      if (fid === 'fr-avata') return { y: 0.11, z: 0.24 };
      if (fid === 'fr-phantom') return { y: 0.08, z: 0.20 };
      if (fid === 'fr-mavic') return { y: 0.06, z: 0.24 };
      if (fid === 'fr-inspire') return { y: 0.08, z: 0.22 };
      return { y: 0.11, z: 0.32 }; // default/FPV 5"
    };

    const getGimbalCamPos = (fid) => {
      if (fid === 'fr-phantom') return { y: -0.02, z: 0.15 };
      if (fid === 'fr-mavic') return { y: -0.02, z: 0.22 };
      if (fid === 'fr-inspire') return { y: -0.04, z: 0.18 };
      return { y: -0.04, z: 0.18 }; // default hanging below
    };

    if (id === 'cm-neo') {
      const fpvPos = getFpvCamPos(frameId);
      const camY = fpvPos.y;
      const camZ = fpvPos.z;
      // Micro Whoop recessed camera
      const cameraHousing = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.06), M.dark);
      cameraHousing.position.set(0, camY, camZ);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12), M.silver);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0, 0.025);
      cameraHousing.add(lens);
      g.add(cameraHousing);
    }
    else if (id === 'cm-phantom') {
      const gimbPos = getGimbalCamPos(frameId);
      const camY = gimbPos.y;
      const camZ = gimbPos.z;
      // 3-axis gimbal mount arm
      const mount = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), M.white);
      mount.position.set(0, camY, camZ);
      g.add(mount);
      
      // Yaw/Roll gimbal motors (small cylinders)
      const yawMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), M.silver);
      yawMotor.position.set(0, camY - 0.04, camZ);
      g.add(yawMotor);
      
      // Sphere camera body
      const camBall = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), M.white);
      camBall.position.set(0, camY - 0.07, camZ + 0.02);
      
      // Silver lens
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), M.silver);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0, 0.03);
      camBall.add(lens);
      g.add(camBall);
    }
    else if (id === 'cm-mavic') {
      const gimbPos = getGimbalCamPos(frameId);
      const camY = gimbPos.y;
      const camZ = gimbPos.z;
      // Gimbal arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), M.dark);
      arm.position.set(0, camY, camZ);
      g.add(arm);
      
      // Squared camera body
      const cameraBox = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.06), M.dark);
      cameraBox.position.set(0, camY - 0.03, camZ + 0.03);
      
      // 3 lenses on front face
      const mainLens = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 10), M.silver);
      mainLens.rotation.x = Math.PI / 2;
      mainLens.position.set(0, -0.015, 0.03);
      cameraBox.add(mainLens);
      
      const tele1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 10), M.silver);
      tele1.rotation.x = Math.PI / 2;
      tele1.position.set(-0.016, 0.016, 0.03);
      cameraBox.add(tele1);
      
      const tele2 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.01, 10), M.silver);
      tele2.rotation.x = Math.PI / 2;
      tele2.position.set(0.016, 0.016, 0.03);
      cameraBox.add(tele2);
      
      g.add(cameraBox);
    }
    else if (id === 'cm-inspire') {
      const gimbPos = getGimbalCamPos(frameId);
      const camY = gimbPos.y;
      const camZ = gimbPos.z;
      // Large white gimbal arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), M.white);
      arm.position.set(0, camY, camZ);
      g.add(arm);
      
      // Circular gimbal ring/pitch housing
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), M.dark);
      ring.rotation.z = Math.PI/2;
      ring.position.set(-0.02, camY - 0.06, camZ + 0.02);
      g.add(ring);
      
      // Large camera body (drum shape)
      const camBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16), M.dark);
      camBody.rotation.x = Math.PI/2;
      camBody.position.set(0, camY - 0.06, camZ + 0.04);
      
      // Large silver prime lens
      const primeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 16), M.silver);
      primeLens.rotation.x = Math.PI/2;
      primeLens.position.set(0, 0, 0.04);
      camBody.add(primeLens);
      
      g.add(camBody);
    }
    else {
      const fpvPos = getFpvCamPos(frameId);
      const camY = fpvPos.y;
      const camZ = fpvPos.z;
      // Metal FPV Camera mount plates (narrowed slightly from 0.08 to 0.075 to avoid overlapping cage plates)
      [-0.075, 0.075].forEach(x => {
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.1, 0.12), M.silver);
        bracket.position.set(x, camY, camZ - 0.02);
        bracket.rotation.x = -Math.PI / 8;
        g.add(bracket);
      });

      // Camera module housing (black shell)
      const cameraHousing = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.09), M.dark);
      cameraHousing.position.set(0, camY, camZ);
      cameraHousing.rotation.x = -Math.PI / 8;

      // Photorealistic Lens cylinder with glass element
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.05, 16), M.silver);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0, 0.05);
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 16), new THREE.MeshBasicMaterial({color: 0x111827}));
      glass.position.y = 0.024;
      lens.add(glass);
      cameraHousing.add(lens);
      g.add(cameraHousing);

      // GoPro Action Camera on Top-Front if premium camera is selected
      if (id === 'cm-4k') {
        const topY = frameId === 'fr-neo' ? 0.08 : 0.22;
        const mount = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.08), M.orange);
        mount.position.set(0, topY + 0.02, 0.08);
        mount.rotation.x = -Math.PI/12;
        g.add(mount);
        const gopro = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.06), M.dark);
        gopro.position.set(0, topY + 0.06, 0.09);
        gopro.rotation.x = -Math.PI/12;
        const gpLens = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.015, 16), M.silver);
        gpLens.rotation.x = Math.PI/2;
        gpLens.position.set(0.025, 0.01, 0.03);
        gopro.add(gpLens);
        const gpScreen = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.025, 0.002), M.indigo);
        gpScreen.position.set(-0.025, -0.01, 0.031);
        gopro.add(gpScreen);
        g.add(gopro);
      }
    }
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
    } else if (id === 'tx-mavic') {
      [-0.04, 0.04].forEach(x => {
        const a = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 6), M.dark);
        a.position.set(x, 0.08, -0.34);
        a.rotation.z = x > 0 ? -Math.PI/6 : Math.PI/6;
        a.rotation.x = -Math.PI/6;
        g.add(a);
      });
    } else if (id === 'tx-inspire') {
      [-0.06, 0.06].forEach(x => {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 8), goldMat);
        base.position.set(x, 0.045, -0.32);
        g.add(base);
        
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.16, 0.015), M.white);
        panel.position.set(x, 0.12, -0.32);
        panel.rotation.y = x > 0 ? -Math.PI/12 : Math.PI/12;
        g.add(panel);
      });
    } else {
      const w=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.2,8),M.white);
      w.position.set(0,.07,-.38); w.rotation.x=-Math.PI/4; g.add(w);
    }

    // Video Transmitter (VTX) metallic silver box with heating fin ridges
    const vtxBox = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.045, 0.15), M.silver);
    vtxBox.position.set(0, 0.06, -0.2);
    // Cool metal fin ridges
    for(let i=-2; i<=2; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.008, 0.015), M.dark);
      fin.position.set(0, 0.024, i*0.03);
      vtxBox.add(fin);
    }
    g.add(vtxBox);

    // VTX black ribbon cable running along carbon bottom plate
    const vtxRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.002, 0.32), M.dark);
    vtxRibbon.position.set(0, 0.01, 0.06);
    g.add(vtxRibbon);

    // LED Orientation Strip at the rear
    const ledMount = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.018, 0.018), M.dark);
    ledMount.position.set(0, 0.035, -0.35);
    g.add(ledMount);
    const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.004), new THREE.MeshBasicMaterial({color: id === 'tx-o3' ? 0x06b6d4 : 0x8b5cf6}));
    ledStrip.position.set(0, 0.035, -0.36);
    g.add(ledStrip);
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
    this.ren.setPixelRatio(Math.min(devicePixelRatio, 1.5));
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

    /* rotating workbench turntable */
    this.workbenchGroup = new THREE.Group();
    this.scene.add(this.workbenchGroup);

    /* workbench tabletop board */
    const fm = new THREE.MeshStandardMaterial({color:0xffffff,roughness:.25,metalness:.1,side:THREE.DoubleSide});
    const fl = new THREE.Mesh(new THREE.RingGeometry(.01,1.8,64), fm);
    fl.rotation.x=-Math.PI/2; fl.position.y=0; fl.receiveShadow=true;
    this.workbenchGroup.add(fl);
    
    const rim = new THREE.Mesh(new THREE.RingGeometry(1.78,1.8,64), new THREE.MeshBasicMaterial({color:0x6366F1,transparent:true,opacity:.75}));
    rim.rotation.x=-Math.PI/2; rim.position.y=0.01;
    this.workbenchGroup.add(rim);
    
    // Grid helper acts as the floor, positioned 0.42m below the tabletop bench
    const grid = new THREE.GridHelper(10,20,0x6366F1,0xE0DDD6);
    grid.position.y = -0.42;
    this.scene.add(grid);

    // Initialize drone pivot resting on the tabletop board
    this.pivot = new THREE.Group();
    const frameId = this.slots.frame?.id;
    const landingHeight = frameId === 'fr-phantom' ? 0.13 : (frameId === 'fr-inspire' ? 0.235 : (frameId === 'fr-mavic' ? 0.06 : 0.18));
    const getBatteryHeight = id => {
      if (id === 'bt-1s') return 0.04;
      if (id === 'bt-3s') return 0.08;
      if (id === 'bt-6s') return 0.15;
      if (id === 'bt-phantom') return 0.20;
      if (id === 'bt-mavic') return 0.16;
      if (id === 'bt-inspire') return 0.22;
      return 0.12;
    };
    const bh = this.slots.battery ? getBatteryHeight(this.slots.battery.id) : 0;
    this.pivot.position.y = frameId === 'fr-phantom' || frameId === 'fr-inspire' || frameId === 'fr-mavic' ? landingHeight : Math.max(landingHeight, bh + 0.006);
    this.workbenchGroup.add(this.pivot);
    
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
    if (cat === 'frame') {
      Object.keys(this.slots).forEach(k => {
        if (k !== 'frame' && this.slots[k]) {
          this.equip(k, this.slots[k].id);
        }
      });
    }

    // Dynamic height adjustment: Rest bottom of drone frame/battery flat on tabletop (Y = 0)
    const frameId = this.slots.frame?.id;
    const landingHeight = frameId === 'fr-phantom' ? 0.13 : (frameId === 'fr-inspire' ? 0.235 : (frameId === 'fr-mavic' ? 0.06 : 0.18));
    const getBatteryHeight = id => {
      if (id === 'bt-1s') return 0.04;
      if (id === 'bt-3s') return 0.08;
      if (id === 'bt-6s') return 0.15;
      if (id === 'bt-phantom') return 0.20;
      if (id === 'bt-mavic') return 0.16;
      if (id === 'bt-inspire') return 0.22;
      return 0.12;
    };
    const bh = this.slots.battery ? getBatteryHeight(this.slots.battery.id) : 0;
    this.pivot.position.y = frameId === 'fr-phantom' || frameId === 'fr-inspire' || frameId === 'fr-mavic' ? landingHeight : Math.max(landingHeight, bh + 0.006);

    this._calc();
  }

  _buildMesh(cat, id) {
    return buildComponentMesh(cat, id, this.slots.frame?.id, this.props, this.slots.battery?.id);
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
    if(this.slots.battery)        { w+=this.slots.battery.w; cap=parseInt(this.slots.battery.sp.Cap); cells=this.slots.battery.sp.V.includes('6S')?6:(this.slots.battery.sp.V.includes('3S')?3:(this.slots.battery.sp.V.includes('1S')?1:4)); }
    if(this.slots.camera)         { w+=this.slots.camera.w; cam=this.slots.camera.sp.Sensor; }
    if(this.slots.transmitter)    { w+=this.slots.transmitter.w; rng=this.slots.transmitter.sp.Range; }
    const twr = w>0?+(thr/w).toFixed(1):0;
    let hover=0;
    if(w>0&&cap>0){ const draw=5.5+w*.011+(twr>4.5?(twr-4.5)*1.6:0); hover=+((cap/1000/draw)*60).toFixed(1); }
    const spd=twr>0?Math.round(twr*28):0;

    let propOverlapError = false;
    let errMsg = '';
    if (this.slots.frame && this.slots.propellers) {
      const frameId = this.slots.frame.id;
      let maxSpan = 15.0;
      if (frameId === 'fr-neo') maxSpan = 3.0;
      else if (frameId === 'fr-avata') maxSpan = 3.5;
      else if (frameId === 'fr-mavic') maxSpan = 5.3;
      else if (frameId === 'fr-fpv5') maxSpan = 5.3;
      else if (frameId === 'fr-phantom') maxSpan = 9.4;
      else if (frameId === 'fr-inspire') maxSpan = 15.0;
      
      const propSpan = parseFloat(this.slots.propellers.sp.Span);
      if (propSpan > maxSpan) {
        propOverlapError = true;
        errMsg = "Propellers too large! Does not fit this frame.";
      }
    }

    this.onStats({w,thr,twr,bat:cap?cap+' mAh':'—',hover:hover?hover+' min':'—',spd:spd?spd+' km/h':'—',cam,rng,cells:cells+'S',pct:this.pct(),ok:this.done() && !propOverlapError, error:errMsg});
  }

  specs() {
    return {
      wg: Object.values(this.slots).reduce((s,v)=>s+(v? v.w*(v.id?.startsWith('mt')||v.id?.startsWith('pr')?4:1) :0),0),
      thrN: ((this.slots.motors?.thrust*4||1200)/1000)*9.81*1.5,
      cells: this.slots.battery?.sp?.V ? (this.slots.battery.sp.V.includes('6S')?6:(this.slots.battery.sp.V.includes('3S')?3:(this.slots.battery.sp.V.includes('1S')?1:4))) : 4,
      frame: this.slots.frame?.id||'fr-fpv5',
      cap: this.slots.battery ? parseInt(this.slots.battery.sp.Cap) : 2000,
      config: Object.fromEntries(Object.entries(this.slots).map(([cat, item]) => [cat, item ? item.id : null]))
    };
  }

  _tick() {
    requestAnimationFrame(()=>this._tick());
    const t=performance.now()*.001;
    // Rotate the parent workbench group (turntable + drone pivot) together for turntable display effect
    if (this.workbenchGroup) {
      this.workbenchGroup.rotation.y = t * 0.12;
    }
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

    // Cached materials for gate checkpoints to prevent allocations/memory leaks
    this.matClearedGate = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.9,
      shininess: 30
    });
    this.matActiveTrainingGate = new THREE.MeshPhongMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2,
      shininess: 30
    });
    this.matInactiveGate = new THREE.MeshPhongMaterial({
      color: 0x334155,
      shininess: 30
    });
    this.matActiveCityGate = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 1.5,
      shininess: 30
    });

    this._initKeys();
  }

  launch(spec, env) {
    this.droneSpec=spec; this.env=env; this.alive=true;
    this.bat=100; this.cleared.clear();
    this.crashed=false; this.cutoff=false; this.alarmCD=0; this.shakeT=0;
    this.thr=0; this.yaw=0; this.pit=0; this.rol=0;
    this.targetGateIdx = 0;
    this.obstaclesClearedCount = 0;

    const frameId = spec?.config?.frame || 'fr-fpv5';
    const batteryId = spec?.config?.battery;
    const getBatteryHeight = bid => {
      if (bid === 'bt-1s') return 0.04;
      if (bid === 'bt-3s') return 0.08;
      if (bid === 'bt-6s') return 0.15;
      if (bid === 'bt-phantom') return 0.20;
      if (bid === 'bt-mavic') return 0.16;
      if (bid === 'bt-inspire') return 0.22;
      return 0.12;
    };
    const bh = batteryId ? getBatteryHeight(batteryId) : 0;
    const baseLandingHeight = frameId === 'fr-phantom' ? 0.13 : (frameId === 'fr-inspire' ? 0.235 : (frameId === 'fr-mavic' ? 0.06 : 0.18));
    this.landingHeight = frameId === 'fr-phantom' || frameId === 'fr-inspire' || frameId === 'fr-mavic' ? baseLandingHeight : Math.max(baseLandingHeight, bh + 0.006);

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
      } else if (env === 'ar') {
        gateVal.previousElementSibling.innerText = 'ROOM';
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

    this.timeActive = 0;
    this._gamepadActive = false;
    this._gamepadFpvThrottle = false;
    const spawnX = env === 'city' ? 15 : 0;
    const spawnY = env==='ar' ? this.landingHeight : (env==='cyber' ? 40.0 + this.landingHeight : (env==='city' ? 4.4 + this.landingHeight : this.landingHeight));
    const spawnZ = env==='ar' ? 1.2 : (env==='cyber' ? 0 : (env==='city' ? 0 : 10));
    this.pos.set(spawnX, spawnY, spawnZ);
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
    this.ren.setSize(r.width,r.height); this.ren.setPixelRatio(Math.min(devicePixelRatio,1.5));
    if(opaque){ this.ren.shadowMap.enabled=true; this.ren.shadowMap.type=THREE.PCFShadowMap; }

    this.scene.add(new THREE.AmbientLight(0xffffff,isCity?.65:isTraining?.4:(isCyber?.45:.9)));
    if(isCity){
      const sun=new THREE.DirectionalLight(0xfffaed,1.5); sun.position.set(150,300,100); sun.castShadow=true;
      sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.near=.5; sun.shadow.camera.far=500;
      const d=120; sun.shadow.camera.left=-d; sun.shadow.camera.right=d; sun.shadow.camera.top=d; sun.shadow.camera.bottom=-d;
      sun.shadow.bias=-.0005; this.scene.add(sun);
      this._buildCity();
    } else if(isTraining){
      const sun=new THREE.DirectionalLight(0xffffff,1.2); sun.position.set(50,150,50); sun.castShadow=true;
      sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.near=.5; sun.shadow.camera.far=300;
      const d=60; sun.shadow.camera.left=-d; sun.shadow.camera.right=d; sun.shadow.camera.top=d; sun.shadow.camera.bottom=-d;
      sun.shadow.bias=-.0005; this.scene.add(sun);
      this._buildTraining();
    } else if(isCyber){
      const l1=new THREE.DirectionalLight(0x8b5cf6,1.5); l1.position.set(100,150,50); this.scene.add(l1);
      const l2=new THREE.DirectionalLight(0x06b6d4,1.2); l2.position.set(-100,150,-50); this.scene.add(l2);
      this._buildCyber();
    } else {
      const pl=new THREE.PointLight(0xffffff,1,30); pl.position.set(0,6,0); this.scene.add(pl);
    }

    this.drone = this._droneMesh(); this.scene.add(this.drone);

    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    this._resizeHandler = () => {
      const b = this.cv.getBoundingClientRect();
      this.cam3.aspect = b.width / b.height;
      this.cam3.updateProjectionMatrix();
      this.ren.setSize(b.width, b.height);
    };
    window.addEventListener('resize', this._resizeHandler);
  }

  /* ── City World ── */
  _buildCity() {
    this.buildings=[]; this.gates=[];

    /* terrain */
    const tGeo=new THREE.PlaneGeometry(600,600,128,128), tv=tGeo.attributes.position;
    for(let i=0;i<tv.count;i++) tv.setZ(i, terrainY(tv.getX(i), tv.getY(i)));
    tGeo.computeVertexNormals();
    const terrain=new THREE.Mesh(tGeo, new THREE.MeshLambertMaterial({color:0x8a9a86}));
    terrain.rotation.x=-Math.PI/2; terrain.receiveShadow=true; this.scene.add(terrain);

    /* river */
    const rGeo=new THREE.PlaneGeometry(60,600,1,32);
    this.riverMesh=new THREE.Mesh(rGeo, new THREE.MeshPhongMaterial({color:0x22d3ee,shininess:80,transparent:true,opacity:.85}));
    this.riverMesh.rotation.x=-Math.PI/2; this.riverMesh.position.y=-6.8; this.scene.add(this.riverMesh);

    /* towers */
    const tMat=new THREE.MeshPhongMaterial({color:0xe2e8f0,shininess:70,flatShading:true});
    [
      [42,28,42],[-42,36,-55],[-75,42,60],[60,48,-75],[30,24,110],[-38,32,130],[-70,52,-110],[75,45,95],
      [-90,40,-40],[90,30,-30],[-30,25,-90],[30,35,-130],[-80,45,10],[80,28,20],[-110,50,80],[110,42,-90],
      [-25,30,-150],[25,38,-190],[-120,35,-130],[120,48,120],[-60,22,-160],[60,32,160],[-140,40,0],[140,28,-60]
    ].forEach((c,i)=>{
      const ty=terrainY(c[0],c[2]);
      const t=new THREE.Mesh(new THREE.BoxGeometry(22,c[1],22),tMat);
      t.position.set(c[0],ty+c[1]/2-2,c[2]); t.castShadow=true; t.receiveShadow=true; this.scene.add(t);
      t.updateMatrixWorld(true);
      this.buildings.push({box:new THREE.Box3().setFromObject(t),name:`Tower ${i+1}`});
    });

    /* trees */
    const trunkMat=new THREE.MeshLambertMaterial({color:0x78350f});
    const leafMat=new THREE.MeshLambertMaterial({color:0x14532d});
    const trunkGeo=new THREE.CylinderGeometry(.2,.4,2.8,6);
    trunkGeo.translate(0, 1.4, 0);
    const leafGeo=new THREE.ConeGeometry(1.6,5,6);
    leafGeo.translate(0, 4.2, 0);
    for(let i=0;i<90;i++){
      const side=Math.random()>.5?1:-1, tx=(35+Math.random()*120)*side, tz=(Math.random()-.5)*320;
      const ty=terrainY(tx,tz);
      const tree=new THREE.Group();
      tree.add(new THREE.Mesh(trunkGeo,trunkMat));
      tree.add(new THREE.Mesh(leafGeo,leafMat));
      const sc=.7+Math.random()*.6; tree.scale.setScalar(sc);
      tree.position.set(tx,ty-.2,tz); this.scene.add(tree);
    }

    /* bridge */
    const road=new THREE.Mesh(new THREE.BoxGeometry(95,.8,12),new THREE.MeshLambertMaterial({color:0x334155}));
    road.position.set(0,4,0); road.receiveShadow=true; this.scene.add(road);
    road.updateMatrixWorld(true);
    this.buildings.push({box:new THREE.Box3().setFromObject(road),name:'Bridge Deck'});
    const pilMat=new THREE.MeshPhongMaterial({color:0x475569,shininess:30});
    const pillarGeo=new THREE.BoxGeometry(1.2,24,1.2);
    [[-30,12,-5.5],[30,12,5.5]].forEach((p,i)=>{
      const pillar=new THREE.Mesh(pillarGeo,pilMat);
      pillar.position.set(p[0],p[1],p[2]); pillar.castShadow=true; pillar.receiveShadow=true; this.scene.add(pillar);
      pillar.updateMatrixWorld(true);
      this.buildings.push({box:new THREE.Box3().setFromObject(pillar),name:`Bridge Pillar ${i+1}`});
    });
    const wireMat=new THREE.LineBasicMaterial({color:0x6366F1});
    [[-5.5, -30],[5.5, 30]].forEach(([z, xStrut])=>{
      const pts=[new THREE.Vector3(-47,4.4,z),new THREE.Vector3(xStrut,23.5,z),new THREE.Vector3(47,4.4,z)];
      this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),wireMat));
    });

    /* checkpoint gates */
    const cityGates = [[0,10,-25,0],[42,22,-22,.8],[60,32,30,1.6],[0,8,80,-.5],[-55,25,60,1],[-42,18,-20,0],[0,15,-90,-1.6],[0,18,-160,0]];
    const gateGeo = new THREE.TorusGeometry(3.6,.4,8,24);
    cityGates.forEach((c,i)=>{
      const isTarget = i === 0;
      const ring=new THREE.Mesh(gateGeo, isTarget ? this.matActiveCityGate : this.matInactiveGate);
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
    const fMat = new THREE.MeshLambertMaterial({color: 0x0f172a});
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), fMat);
    floor.rotation.x = -Math.PI/2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    /* floor grid lines */
    const grid = new THREE.GridHelper(300, 60, 0x6366F1, 0x1e293b);
    grid.position.y = 0.01;
    this.scene.add(grid);

    /* obstacle materials */
    const poleMat = new THREE.MeshPhongMaterial({color: 0xf59e0b, shininess: 40});
    const archMat = new THREE.MeshPhongMaterial({color: 0x475569, shininess: 40});

    /* Slalom Poles (Vertical Cylinders for winding turns) */
    const poles = [
      [-4, -10, "Slalom Pole 1"],
      [4, -25, "Slalom Pole 2"],
      [-4, -40, "Slalom Pole 3"],
      [30, 5, "Slalom Pole 4"],
      [42, 20, "Slalom Pole 5"]
    ];
    const poleGeo = new THREE.CylinderGeometry(0.4, 0.4, 12, 16);
    poles.forEach(p => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(p[0], 6, p[1]);
      pole.castShadow = true;
      pole.receiveShadow = true;
      this.scene.add(pole);
      pole.updateMatrixWorld(true);
      this.trainingObstacles.push({box: new THREE.Box3().setFromObject(pole), name: p[2]});
    });

    /* Arches / Tunnels (low clearance obstacles) */
    const archPillarGeo = new THREE.BoxGeometry(0.8, 5, 0.8);
    const archBarGeo = new THREE.BoxGeometry(7.8, 0.8, 0.8);
    const makeArch = (x, z, rotY, name) => {
      const g = new THREE.Group();
      const p1 = new THREE.Mesh(archPillarGeo, archMat);
      p1.position.set(-3.5, 2.5, 0);
      const p2 = new THREE.Mesh(archPillarGeo, archMat);
      p2.position.set(3.5, 2.5, 0);
      const bar = new THREE.Mesh(archBarGeo, archMat);
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

    const gateGeo = new THREE.TorusGeometry(3.6, 0.4, 8, 24);

    trainingGates.forEach((c, i) => {
      const isTarget = i === 0;
      const ring = new THREE.Mesh(gateGeo, isTarget ? this.matActiveTrainingGate : this.matInactiveGate);
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
        }
        if (t.wireframe) {
          this.scene.remove(t.wireframe);
          if (t.wireframe.geometry) t.wireframe.geometry.dispose();
        }
      }
    }

    // Helper to generate glowing neon window textures of standard size
    const makeCustomNeonWindowTexture = (neonColorStr, style) => {
      const canvas = document.createElement('canvas');
      const canvasW = 128;
      const canvasH = 256;
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
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
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

      const gMat = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 10
      });

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), gMat);
      floor.rotation.x = -Math.PI / 2;
      this.scene.add(floor);
    }

    // Shared roof material without window markings
    const roofMat = new THREE.MeshPhongMaterial({
      color: 0x050508,
      shininess: 30
    });

    // Initialize shared materials if not already created
    if (!this.cyberSharedMats) {
      this.cyberSharedMats = {};
      this.cyberSharedLineMats = {};
      this.cyberSharedStartPadMats = {};
      this.cyberSharedTextures = [];

      const neonConfigs = [
        { color: 0x8b5cf6, cssColor: '#a78bfa' }, // purple
        { color: 0x06b6d4, cssColor: '#22d3ee' }, // cyan
        { color: 0x10b981, cssColor: '#34d399' }, // green
        { color: 0xfacc15, cssColor: '#fbbf24' }  // yellow
      ];
      const styles = ['grid', 'stripes', 'bands', 'dots'];

      neonConfigs.forEach(config => {
        this.cyberSharedLineMats[config.color] = new THREE.LineBasicMaterial({color: config.color});
        
        // Pre-generate custom landing pad rooftop material/texture for this color
        const startPadTex = makeRooftopLandingPadTexture(24, 24, config.cssColor);
        this.cyberSharedTextures.push(startPadTex);
        this.cyberSharedStartPadMats[config.color] = new THREE.MeshPhongMaterial({
          color: 0x08080c,
          map: startPadTex,
          emissiveMap: startPadTex,
          emissive: config.color,
          emissiveIntensity: 1.5,
          shininess: 40
        });

        styles.forEach(style => {
          const tex = makeCustomNeonWindowTexture(config.cssColor, style);
          this.cyberSharedTextures.push(tex);
          
          this.cyberSharedMats[`${config.color}_${style}`] = new THREE.MeshPhongMaterial({
            color: 0x0a0a10,
            map: tex,
            emissiveMap: tex,
            emissive: config.color,
            emissiveIntensity: 1.5,
            shininess: 60
          });
        });
      });
    }

    this.cyberTowers = [];

    const spawnTower = (x, z, w, h, d, yPos = null) => {
      const hSegs = Math.max(1, Math.round(h / 15));
      const geom = new THREE.BoxGeometry(w, h, d, 2, hSegs, 2);
      
      const neonConfigs = [
        { color: 0x8b5cf6, cssColor: '#a78bfa' }, // purple
        { color: 0x06b6d4, cssColor: '#22d3ee' }, // cyan
        { color: 0x10b981, cssColor: '#34d399' }, // green
        { color: 0xfacc15, cssColor: '#fbbf24' }  // yellow
      ];
      
      const config = neonConfigs[Math.floor(Math.random() * neonConfigs.length)];
      const style = ['grid', 'stripes', 'bands', 'dots'][Math.floor(Math.random() * 4)];
      
      const towerMat = this.cyberSharedMats[`${config.color}_${style}`];

      // Starting tower gets a custom landing pad rooftop
      let currentRoofMat = roofMat;
      if (x === 0 && z === 0) {
        currentRoofMat = this.cyberSharedStartPadMats[config.color];
      }

      // Apply materials to vertical sides and top/bottom
      const materials = [
        towerMat, // +X
        towerMat, // -X
        currentRoofMat,  // +Y (Roof)
        roofMat,  // -Y (Bottom)
        towerMat, // +Z
        towerMat  // -Z
      ];

      const tMesh = new THREE.Mesh(geom, materials);
      const y = yPos !== null ? yPos : h / 2;
      tMesh.position.set(x, y, z);
      this.scene.add(tMesh);

      const edges = new THREE.EdgesGeometry(geom);
      const lineMat = this.cyberSharedLineMats[config.color];
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.copy(tMesh.position);
      this.scene.add(wireframe);

      tMesh.updateMatrixWorld(true);
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

    // Block centers for X and Z spaced every 60 units (9x9 grid coordinates)
    const blockCoords = [-240, -180, -120, -60, 0, 60, 120, 180, 240];

    for (const bx of blockCoords) {
      for (const bz of blockCoords) {
        // Skip the central starting block since we spawned the start tower separately above
        if (bx === 0 && bz === 0) continue;

        // 85% chance to populate this block with skyscrapers
        if (Math.random() > 0.85) continue;

        // Choose block sub-layout
        const layout = Math.random();

        if (layout < 0.3) {
          // Single large skyscraper
          const w = 18 + Math.random() * 8; // 18 to 26 width
          const d = 18 + Math.random() * 8; // 18 to 26 depth
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

    const triggerARFallback = () => {
      this.scene.background = new THREE.Color(0x05080c);
      this.scene.fog = new THREE.FogExp2(0x05080c, 0.04);
      
      const fallbackGrid = new THREE.GridHelper(20, 20, 0x10b981, 0x112233);
      fallbackGrid.position.y = 0.01;
      this.scene.add(fallbackGrid);
    };

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => { this.vid.srcObject = s; })
        .catch(() => { triggerARFallback(); });
    } else {
      triggerARFallback();
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

      mesh.updateMatrixWorld(true);
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
        const mesh = buildComponentMesh(cat, id, frameId, cat === 'propellers' ? this.propGrps : null, config.battery);
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
      this._gamepadActive = false;
      if(e.key==='c'||e.key==='C'){ const o=['chase','fpv','orbit']; this.camMode=o[(o.indexOf(this.camMode)+1)%3]; document.getElementById('btn-cam').innerText='📷 '+this.camMode.charAt(0).toUpperCase()+this.camMode.slice(1); }
      if(e.key==='f'||e.key==='F'){ this.mode=this.mode==='level'?'acro':'level'; document.getElementById('btn-mode').innerText='⚙️ '+this.mode.charAt(0).toUpperCase()+this.mode.slice(1); }
      if(e.key==='r'||e.key==='R') this.resetPos();
    });
    window.addEventListener('keyup',e=>this.keys[e.key]=false);

    window.addEventListener('gamepadconnected', () => {
      const btn = document.getElementById('btn-gamepad');
      if (btn) {
        btn.innerText = '🎮 GP: Connected';
        btn.classList.add('val-cyan');
      }
      this._updateControlsHint(true);
    });
    window.addEventListener('gamepaddisconnected', () => {
      const btn = document.getElementById('btn-gamepad');
      if (btn) {
        btn.innerText = '🎮 Keyboard';
        btn.classList.remove('val-cyan');
      }
      this._updateControlsHint(false);
    });

    /* joysticks */
    ['joy-l','joy-r'].forEach((zid,zi)=>{
      const zone=document.getElementById(zid); if(!zone) return;
      const handle=zone.querySelector('.joystick-stick');
      let rect=null, tid=null;
      zone.addEventListener('touchstart',e=>{ e.preventDefault(); rect=zone.getBoundingClientRect(); tid=e.changedTouches[0].identifier; this._gamepadActive = false; },{passive:false});
      window.addEventListener('touchmove',e=>{
        if(rect===null) return;
        this._gamepadActive = false;
        for(const t of e.changedTouches) if(t.identifier===tid){
          let dx=t.clientX-rect.left-rect.width/2, dy=t.clientY-rect.top-rect.height/2;
          const max=rect.width/2-20, dist=Math.hypot(dx,dy);
          if(dist>max){ dx=dx/dist*max; dy=dy/dist*max; }
          handle.style.transform=`translate(${dx}px,${dy}px)`;
          const nx=dx/max, ny=-dy/max;
          if(zi===0){ this.yaw=nx; this.thr=ny > 0 ? ny : 0; } else { this.rol=nx; this.pit=ny; }
        }
      });
      const end=()=>{ handle.style.transform='translate(0,0)'; rect=null; if(zi===1){this.rol=0;this.pit=0;} else {this.yaw=0; this.thr=0;} };
      window.addEventListener('touchend',e=>{ for(const t of e.changedTouches) if(t.identifier===tid) end(); });
    });
  }

  _updateControlsHint(isGamepad) {
    const hintDiv = document.querySelector('.keyboard-controls-hint');
    if (!hintDiv) return;
    if (isGamepad) {
      if (this._hintMode === 'gamepad') return;
      this._hintMode = 'gamepad';
      hintDiv.innerHTML = `
        <div class="hint-cell"><span class="hint-title">Throttle / Yaw</span><span>Left Stick</span></div>
        <div class="hint-cell"><span class="hint-title">Pitch / Roll</span><span>Right Stick</span></div>
        <div class="hint-cell"><span class="hint-title">Gamepad Buttons</span><span><kbd>A</kbd> Reset · <kbd>B</kbd> Cam · <kbd>X</kbd> Mode</span></div>
      `;
    } else {
      if (this._hintMode === 'keyboard') return;
      this._hintMode = 'keyboard';
      hintDiv.innerHTML = `
        <div class="hint-cell"><span class="hint-title">Throttle / Yaw</span><span><kbd>W</kbd><kbd>S</kbd> <kbd>A</kbd><kbd>D</kbd></span></div>
        <div class="hint-cell"><span class="hint-title">Pitch / Roll</span><span><kbd>▲</kbd><kbd>▼</kbd> <kbd>◀</kbd><kbd>▶</kbd></span></div>
        <div class="hint-cell"><span class="hint-title">Misc</span><span><kbd>C</kbd> cam · <kbd>F</kbd> mode · <kbd>R</kbd> reset</span></div>
      `;
    }
  }

  _readGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        gp = gamepads[i];
        break;
      }
    }
    const btn = document.getElementById('btn-gamepad');
    if (gp) {
      this._gamepadConnected = true;
      // Check for active gamepad interaction to prevent phantom/idle inputs
      const buttonPressed = gp.buttons.some(b => b.pressed);
      const stickMoved = gp.axes.some(a => Math.abs(a) > 0.15);
      if (buttonPressed || stickMoved) {
        this._gamepadActive = true;
      }

      if (!this._gamepadActive) {
        if (btn) {
          btn.innerText = '🎮 Keyboard';
          btn.classList.remove('val-cyan');
        }
        this._updateControlsHint(false);
        return false;
      }

      if (btn) {
        btn.innerText = this._gamepadFpvThrottle ? '🎮 GP: FPV Pro' : '🎮 GP: Spring';
        btn.classList.add('val-cyan');
      }
      this._updateControlsHint(true);

      const deadzone = 0.05;
      const applyDeadzone = (val) => {
        if (Math.abs(val) < deadzone) return 0;
        return (val - Math.sign(val) * deadzone) / (1 - deadzone);
      };

      const yawVal = applyDeadzone(gp.axes[0] || 0);
      const thrVal = gp.axes[1] || 0;
      const rolVal = applyDeadzone(gp.axes[2] || 0);
      const pitVal = applyDeadzone(gp.axes[3] || 0);

      this.yaw = yawVal * 0.75;
      
      // Throttle mapping based on the active mode (manually toggled via HUD button)
      if (this._gamepadFpvThrottle) {
        // Full range FPV mode: -1 (up) is 1.0, 1 (down) is 0.0
        this.thr = Math.max(0, Math.min(1, (1 - thrVal) / 2));
      } else {
        // Spring-centered casual mode: -1 (up) is 1.0, 0 (center) is 0.0, >0 (down) is 0.0
        this.thr = thrVal < 0 ? -thrVal : 0;
      }

      this.rol = rolVal * 0.65;
      this.pit = -pitVal * 0.65;

      if (gp.buttons[0]?.pressed && !this._lastGpBtn0) {
        this.resetPos();
      }
      this._lastGpBtn0 = gp.buttons[0]?.pressed;

      if (gp.buttons[1]?.pressed && !this._lastGpBtn1) {
        const o = ['chase', 'fpv', 'orbit'];
        this.camMode = o[(o.indexOf(this.camMode) + 1) % 3];
        const camBtn = document.getElementById('btn-cam');
        if (camBtn) camBtn.innerText = '📷 ' + this.camMode.charAt(0).toUpperCase() + this.camMode.slice(1);
      }
      this._lastGpBtn1 = gp.buttons[1]?.pressed;

      if (gp.buttons[2]?.pressed && !this._lastGpBtn2) {
        this.mode = this.mode === 'level' ? 'acro' : 'level';
        const modeBtn = document.getElementById('btn-mode');
        if (modeBtn) modeBtn.innerText = '⚙️ ' + this.mode.charAt(0).toUpperCase() + this.mode.slice(1);
      }
      this._lastGpBtn2 = gp.buttons[2]?.pressed;

      return true;
    } else {
      this._gamepadConnected = false;
      this._gamepadActive = false;
      if (btn) {
        btn.innerText = '🎮 Keyboard';
        btn.classList.remove('val-cyan');
      }
      this._updateControlsHint(false);
      return false;
    }
  }

  _readKeys(dt) {
    if (this._readGamepad()) return;
    // Keyboard Throttle: Press W to increase, S to decrease, otherwise decay back to 0
    if(this.keys['w']||this.keys['W']) this.thr=Math.min(this.thr + 1.2 * dt, 1);
    else if(this.keys['s']||this.keys['S']) this.thr=Math.max(this.thr - 1.2 * dt, 0);
    else this.thr=Math.max(this.thr - 0.8 * dt, 0);
    
    const targetYaw = (this.keys['a']||this.keys['A'])?-.75:(this.keys['d']||this.keys['D'])?.75:0;
    const targetPit = (this.keys['ArrowUp'])?.65:(this.keys['ArrowDown'])?-.65:0;
    const targetRol = (this.keys['ArrowLeft'])?-.65:(this.keys['ArrowRight'])?.65:0;

    // Smoothly interpolate keyboard inputs to prevent snap rotation torque instabilities
    const factor = 1 - Math.exp(-12 * dt);
    this.yaw += (targetYaw - this.yaw) * factor;
    this.pit += (targetPit - this.pit) * factor;
    this.rol += (targetRol - this.rol) * factor;
  }

  /* ── main loop ── */
  _loop() {
    if(!this.alive) return;
    requestAnimationFrame(()=>this._loop());
    const now=performance.now(), dt=Math.min((now-this.prevT)/1000,.1); this.prevT=now;
    this.timeActive = (this.timeActive || 0) + dt;
    this._readKeys(dt);
    if(!this.crashed) this._physics(dt); else this._tumble(dt);
    if(this.env==='city' || this.env==='training') this._checkGates();
    this._ambient(now);
    this._camera(dt);
    
    // Throttle HUD telemetry updates to ~15 Hz to reduce DOM reflow latency
    if (now - (this.lastHudUpdateT || 0) > 66) {
      this._hud();
      this.lastHudUpdateT = now;
    }
    
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

    /* Auto-hover assist in LEVEL mode */
    if (this.mode === 'level') {
      const mass_kg = this.droneSpec.wg / 1000;
      const thrN = this.droneSpec.thrN;
      const hoverThr = (thrN > 0) ? Math.min((mass_kg * 9.81) / (thrN * gef * batScale), 0.95) : 0;
      const noThrottleKey = !(this.keys['w'] || this.keys['W'] || this.keys['s'] || this.keys['S']);
      const noGamepadThrottle = !this._gamepadActive;

      if (noThrottleKey && noGamepadThrottle) {
        // Smoothly interpolate throttle to hover point
        const hoverFactor = 1 - Math.exp(-3.5 * dt);
        this.thr += (hoverThr - this.thr) * hoverFactor;
        // Damp vertical velocity to zero for altitude hold
        const vDamp = 1 - Math.exp(-4.0 * dt);
        this.vel.y *= (1 - vDamp);
      }

      // Active position-hold brake: damp horizontal velocity when no directional keys
      const noPitchRoll = !(this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight']);
      const noYaw = !(this.keys['a'] || this.keys['A'] || this.keys['d'] || this.keys['D']);
      if (noPitchRoll && noYaw && !this._gamepadActive) {
        const brakeFactor = 1 - Math.exp(-1.8 * dt);
        this.vel.x *= (1 - brakeFactor);
        this.vel.z *= (1 - brakeFactor);
      }
    }

    /* forces */
    const mass=this.droneSpec.wg/1000;
    const grav = _tempV1.set(0, -9.81 * mass, 0);
    const thrDir = _tempV2.set(0, 1, 0).applyQuaternion(this.quat).multiplyScalar(thrForce * gef);
    const frameId = this.droneSpec.frame || 'fr-fpv5';
    const cd = frameId === 'fr-neo' ? 0.038 : (frameId === 'fr-avata' ? 0.026 : (frameId === 'fr-inspire' ? 0.016 : (frameId === 'fr-mavic' ? 0.011 : 0.013)));
    const drag = _tempV3.copy(this.vel).multiplyScalar(-cd * 1.225 * this.vel.length());
    
    let wind = _tempV4.set(0, 0, 0);
    if (this.env === 'city') {
      const t = performance.now() * 0.001;
      wind = _tempV4.set(Math.sin(t) * 4.5 * 0.06, 0, Math.cos(t) * 4.5 * 0.04);
    }
    
    const acc = _tempV5.copy(grav).add(thrDir).add(drag).add(wind).divideScalar(mass);
    this.vel.addScaledVector(acc, dt);
    this.pos.addScaledVector(this.vel, dt);

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
    const eu = _tempEuler.setFromQuaternion(this.quat, 'YXZ');
    if(this.mode==='level'){
      const tPit = this.pit * 0.45;
      const tRol = -this.rol * 0.45;
      const factor = 1 - Math.exp(-8 * dt);
      eu.x += (tPit - eu.x) * factor;
      eu.z += (tRol - eu.z) * factor;
      eu.y += -this.yaw * 4.5 * dt;
    } else {
      eu.x += this.pit * 6.0 * dt;
      eu.z += -this.rol * 6.0 * dt;
      eu.y += -this.yaw * 4.5 * dt;
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
    const minH = gndY + this.landingHeight;
    if(this.pos.y<minH){
      if(this.vel.length()>4.2) {
        if (!this.timeActive || this.timeActive > 0.5) {
          this._crash(this.vel.length(),'Ground');
        } else {
          this.pos.y=minH; this.vel.set(0,0,0);
        }
      }
      else { this.pos.y=minH; this.vel.set(0,0,0); }
      return;
    }
    const sp = _tempSphere.set(this.pos, 0.42);
    const list=this.env==='city'?this.buildings:(this.env==='training'?this.trainingObstacles:(this.env==='cyber'?this.cyberTowers:this.arBoxes));
    
    const droneX = this.pos.x;
    const droneY = this.pos.y;
    const droneZ = this.pos.z;

    for(const b of list) {
      // Broad-phase collision filter: skip obstacles that are too far away in any axis.
      // We check X, Y, Z coordinate difference against the box half-dimensions + drone radius + padding.
      const halfW = (b.box.max.x - b.box.min.x) * 0.5;
      const halfH = (b.box.max.y - b.box.min.y) * 0.5;
      const halfD = (b.box.max.z - b.box.min.z) * 0.5;
      
      const centerX = b.box.min.x + halfW;
      const centerY = b.box.min.y + halfH;
      const centerZ = b.box.min.z + halfD;
      
      // If the drone is further than (half-size + 2.0m padding) from the center, it's impossible to collide.
      if (Math.abs(droneX - centerX) > halfW + 2.0 || 
          Math.abs(droneY - centerY) > halfH + 2.0 || 
          Math.abs(droneZ - centerZ) > halfD + 2.0) {
        continue;
      }

      const isStartingPlatform = 
        b.name === 'Bridge Deck' || 
        b.name === 'CyberTower 1' || 
        b.name === 'Floor' || 
        b.name === 'Coffee Table';
      
      if (isStartingPlatform) {
        _tempSphere.set(this.pos, this.landingHeight);
      } else {
        _tempSphere.set(this.pos, 0.42);
      }

      if(b.box.intersectsSphere(_tempSphere)){ 
        // Safe landing / gentle contact on runways/starting platforms/floor/coffee table
        if (isStartingPlatform && this.vel.length() <= 4.2) {
          const surfH = b.name === 'Bridge Deck' ? 4.4 : (b.name === 'CyberTower 1' ? 40.0 : (b.name === 'Coffee Table' ? 0.4 : 0.0));
          this.pos.y = surfH + this.landingHeight;
          this.vel.set(0,0,0);
          continue;
        }
        
        if (!this.timeActive || this.timeActive > 0.5) {
          this._crash(this.vel.length(),b.name); break; 
        } else {
          const surfH = b.name === 'Bridge Deck' ? 4.4 : (b.name === 'CyberTower 1' ? 40.0 : (b.name === 'Coffee Table' ? 0.4 : 0.0));
          this.pos.y = surfH + this.landingHeight;
          this.vel.set(0,0,0);
        }
      }
    }
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
    const tumbleAxis = _tempV1.set(1, 0.5, 0.2).normalize();
    const tumbleRot = _tempQuat.setFromAxisAngle(tumbleAxis, 12 * dt);
    this.quat.multiply(tumbleRot);
    this.vel.y = Math.max(-15, this.vel.y - 9.81 * dt);
    this.vel.x *= 0.95;
    this.vel.z *= 0.95;
    this.pos.addScaledVector(this.vel, dt);
    const inStartingRoof = this.env === 'cyber' && Math.abs(this.pos.x) < 12 && Math.abs(this.pos.z) < 12;
    const fl = inStartingRoof ? (40.0 + this.landingHeight) : (this.env === 'city' ? terrainY(this.pos.x, this.pos.z) + this.landingHeight : this.landingHeight);
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
        targetGate.mesh.material = this.matClearedGate;

        this.targetGateIdx = (this.targetGateIdx + 1) % this.gates.length;
        
        // Light up the next target gate orange
        const nextGate = this.gates[this.targetGateIdx];
        if (nextGate && this.targetGateIdx !== 0) {
          nextGate.mesh.material = this.matActiveTrainingGate;
        }
        
        this._toast(`Obstacles: ${this.obstaclesClearedCount}`);
        
        if (this.targetGateIdx === 0) {
          setTimeout(() => {
            if (this.env !== 'training') return;
            this.gates.forEach((g, i) => {
              g.mesh.material = i === 0 ? this.matActiveTrainingGate : this.matInactiveGate;
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
        targetGate.mesh.material = this.matClearedGate;

        this.targetGateIdx = (this.targetGateIdx + 1) % this.gates.length;
        
        // Light up the next target gate neon purple
        const nextGate = this.gates[this.targetGateIdx];
        if (nextGate && this.targetGateIdx !== 0) {
          nextGate.mesh.material = this.matActiveCityGate;
          if (this.beacon) {
            this.beacon.position.copy(nextGate.mesh.position);
          }
        }
        
        this._toast(`Gate ${this.cleared.size}/8`);

        if (this.targetGateIdx === 0) {
          setTimeout(() => {
            if (this.env !== 'city') return;
            this.cleared.clear();
            this.gates.forEach((g, i) => {
              g.mesh.material = i === 0 ? this.matActiveCityGate : this.matInactiveGate;
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
    
    // Distance Culling (LOD) Optimization for Cyberscape City — throttled to 10 Hz
    if (this.env === 'cyber' && this.cyberTowers) {
      if (now - (this._lastCullT || 0) > 100) {
        this._lastCullT = now;
        const droneX = this.pos.x;
        const droneZ = this.pos.z;
        for (const t of this.cyberTowers) {
          const dx = t.mesh.position.x - droneX;
          const dz = t.mesh.position.z - droneZ;
          const distSq = dx * dx + dz * dz;
          // 180m threshold -> 180 * 180 = 32400
          const isNear = distSq < 32400;
          t.mesh.visible = isNear;
          t.wireframe.visible = isNear;
        }
      }
    }
  }

  _camera(dt) {
    if(this.camMode==='chase'){
      // Decouple camera position offset from the drone's pitch and roll.
      // We extract only the yaw (heading) angle to keep the camera horizontally aligned.
      const eu = _tempEuler.setFromQuaternion(this.quat, 'YXZ');
      const yawAngle = eu.y;
      
      // Rotate the camera offset only by the yaw angle around the Y-axis
      const upVec = _tempV4.set(0, 1, 0);
      const off = _tempV1.set(0, 1.3, -4.5).applyAxisAngle(upVec, yawAngle);
      const targetCamPos = _tempV2.copy(this.pos).add(off);
      
      // Frame-rate independent lerping
      const factor = 1 - Math.exp(-9 * dt);
      this.cam3.position.lerp(targetCamPos, factor);
      
      const lookTarget = _tempV3.copy(this.pos).add(_tempV4.set(0, .4, 0));
      this.cam3.lookAt(lookTarget);
    } else if(this.camMode==='fpv'){
      const frameId = this.droneSpec ? this.droneSpec.frame : 'fr-fpv5';
      const getFpvCamPos = (fid) => {
        if (fid === 'fr-neo') return { y: 0.06, z: 0.18 };
        if (fid === 'fr-avata') return { y: 0.11, z: 0.24 };
        if (fid === 'fr-phantom') return { y: 0.08, z: 0.20 };
        if (fid === 'fr-mavic') return { y: 0.06, z: 0.24 };
        if (fid === 'fr-inspire') return { y: 0.08, z: 0.22 };
        return { y: 0.11, z: 0.32 };
      };
      const fpvPos = getFpvCamPos(frameId);
      const off = _tempV1.set(0, fpvPos.y + 0.03, fpvPos.z + 0.09).applyQuaternion(this.quat);
      this.cam3.position.copy(this.pos).add(off);
      
      const lookOffset = _tempV2.set(0, 5.07, 10.88).applyQuaternion(this.quat);
      const lookTarget = _tempV3.copy(this.pos).add(lookOffset);
      this.cam3.lookAt(lookTarget);
    } else {
      const orbitTargetPos = _tempV1.set(0, 16, -28);
      const factor = 1 - Math.exp(-6 * dt);
      this.cam3.position.lerp(orbitTargetPos, factor);
      this.cam3.lookAt(this.pos);
    }
    if(this.shakeT>0){
      const shakeVec = _tempV1.set(
        (Math.random() - 0.5) * this.shakeF,
        (Math.random() - 0.5) * this.shakeF,
        (Math.random() - 0.5) * this.shakeF
      );
      this.cam3.position.add(shakeVec);
      this.shakeT-=.016;
    }
  }

  _hud() {
    if(!this.onHud) return;
    const spd=Math.round(this.vel.length()*3.6), alt=Math.max(0,this.pos.y);
    this.onHud({
      thr:Math.round(this.thr*100),bat:Math.round(this.bat),spd:spd+' km/h',alt:alt.toFixed(1)+' m',
      gates:this.env==='cyber'?'FREE':(this.env==='training'?this.obstaclesClearedCount:(this.env==='ar'?'N/A':this.cleared.size+'/8')),mode:this.mode.toUpperCase(),
      drag:(this._tDrag||'0')+' N',lift:(this._tLift||'0')+' N',rho:'1.225',gef:(this._tGef||'1.00')+'×',
      g:(1+this.vel.length()/9.81*.08).toFixed(1)+' G'
    });
  }

  resetPos() {
    this.timeActive = 0;
    this._gamepadActive = false;
    this._gamepadFpvThrottle = false;
    const spawnX = this.env === 'city' ? 15 : 0;
    const spawnY = this.env==='ar' ? this.landingHeight : (this.env==='cyber' ? 40.0 + this.landingHeight : (this.env==='city' ? 4.4 + this.landingHeight : this.landingHeight));
    const spawnZ = this.env==='ar' ? 1.2 : (this.env==='cyber' ? 0 : (this.env==='city' ? 0 : 10));
    this.pos.set(spawnX, spawnY, spawnZ);
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
    this.alive = false;
    sfx.stopMotors();
    document.body.classList.remove('glitch-active');
    if (this.vid.srcObject) {
      this.vid.srcObject.getTracks().forEach(t => t.stop());
      this.vid.srcObject = null;
    }
    
    // Remove resize handler
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    
    // Dispose of Three.js objects to prevent WebGL memory leaks
    if (this.scene) {
      const geometries = new Set();
      const materials = new Set();
      const textures = new Set();

      this.scene.traverse((obj) => {
        if (obj.geometry) geometries.add(obj.geometry);
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => {
              if (m) materials.add(m);
            });
          } else {
            materials.add(obj.material);
          }
        }
      });

      materials.forEach(m => {
        if (m.map) textures.add(m.map);
        if (m.emissiveMap) textures.add(m.emissiveMap);
        m.dispose();
      });

      geometries.forEach(g => g.dispose());
      textures.forEach(t => t.dispose());
      
      this.scene = null;
    }

    if (this.ren) {
      this.ren.dispose();
      this.ren = null;
    }

    // Clean up cached gate materials
    if (this.matClearedGate) { this.matClearedGate.dispose(); this.matClearedGate = null; }
    if (this.matActiveTrainingGate) { this.matActiveTrainingGate.dispose(); this.matActiveTrainingGate = null; }
    if (this.matInactiveGate) { this.matInactiveGate.dispose(); this.matInactiveGate = null; }
    if (this.matActiveCityGate) { this.matActiveCityGate.dispose(); this.matActiveCityGate = null; }

    // Clean up Cyber shared materials and textures
    if (this.cyberSharedTextures) {
      this.cyberSharedTextures.forEach(t => t.dispose());
      this.cyberSharedTextures = null;
    }
    if (this.cyberSharedMats) {
      Object.values(this.cyberSharedMats).forEach(m => m.dispose());
      this.cyberSharedMats = null;
    }
    if (this.cyberSharedLineMats) {
      Object.values(this.cyberSharedLineMats).forEach(m => m.dispose());
      this.cyberSharedLineMats = null;
    }
    if (this.cyberSharedStartPadMats) {
      Object.values(this.cyberSharedStartPadMats).forEach(m => m.dispose());
      this.cyberSharedStartPadMats = null;
    }
    if (this.holoGridTexture) {
      this.holoGridTexture.dispose();
      this.holoGridTexture = null;
    }
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
    neo: {
      frame: 'fr-neo',
      motors: 'mt-1404',
      esc: 'es-15a',
      propellers: 'pr-3b',
      flight_controller: 'fc-neo',
      battery: 'bt-1s',
      camera: 'cm-neo',
      transmitter: 'tx-neo'
    },
    avata: {
      frame: 'fr-avata',
      motors: 'mt-2207',
      esc: 'es-50a',
      propellers: 'pr-3-5b',
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
      transmitter: 'tx-o3'
    },
    phantom: {
      frame: 'fr-phantom',
      motors: 'mt-2312',
      esc: 'es-30a',
      propellers: 'pr-9b',
      flight_controller: 'fc-naza',
      battery: 'bt-phantom',
      camera: 'cm-phantom',
      transmitter: 'tx-phantom'
    },
    mavic: {
      frame: 'fr-mavic',
      motors: 'mt-2008',
      esc: 'es-40a',
      propellers: 'pr-9-4',
      flight_controller: 'fc-mavic',
      battery: 'bt-mavic',
      camera: 'cm-mavic',
      transmitter: 'tx-mavic'
    },
    inspire: {
      frame: 'fr-inspire',
      motors: 'mt-3512',
      esc: 'es-80a',
      propellers: 'pr-15b',
      flight_controller: 'fc-inspire',
      battery: 'bt-inspire',
      camera: 'cm-inspire',
      transmitter: 'tx-inspire'
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
    if(name==='builder' && !lab){
      lab = new AssemblyLab('assembly-canvas', onStats);
      buildTabs();
      applyPreset('avata');
    }
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
    if (sim) { sim.stop(); sim = null; }
    sim = new FlightSim('sim-canvas','cam-feed', hudUpdate);
    sim.launch({wg:610,thrN:85.5,cells:6,frame:'fr-avata'},'city');
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
    if (sim) { sim.stop(); sim = null; }
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
  document.getElementById('btn-gamepad').addEventListener('click', () => {
    sfx.snap();
    if (sim && sim._gamepadConnected) {
      sim._gamepadFpvThrottle = !sim._gamepadFpvThrottle;
      const btn = document.getElementById('btn-gamepad');
      if (btn) {
        btn.innerText = sim._gamepadFpvThrottle ? '🎮 GP: FPV Pro' : '🎮 GP: Spring';
      }
      sim._updateControlsHint(true);
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
    const NAMES = {
      frame: 'FRAME',
      motors: 'MOTOR',
      esc: 'ESC',
      propellers: 'PROP',
      flight_controller: 'FC',
      battery: 'BATT',
      camera: 'CAM',
      transmitter: 'TX'
    };
    Object.keys(PARTS).forEach(cat => {
      const b = document.createElement('button');
      b.className = 'catalog-tab' + (cat===tab?' active':'');
      b.innerText = NAMES[cat] || cat.replace('_',' ').toUpperCase();
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
    if (s.error) {
      v.innerText = s.error;
      v.className = 'verdict-banner error';
    } else if(s.ok){
      v.innerText=s.twr>=2?`TWR ${s.twr}× — flight capable`:`TWR ${s.twr}× — weak lift`;
      v.className='verdict-banner '+(s.twr>=2?'success':'warning');
    } else {
      v.innerText='Snap remaining parts…';
      v.className='verdict-banner';
    }

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
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(.03,.02,.99),mat);
    arm1.rotation.y = Math.PI/4;
    g.add(arm1);
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(.03,.02,.99),mat);
    arm2.rotation.y = -Math.PI/4;
    g.add(arm2);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.08,16,16),mat);
    body.position.y = 0.01;
    g.add(body);
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