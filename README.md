# 🛸 Drone Aero-Engineering Lab

A premium, photorealistic DJI-referenced drone engineering simulator built with pure HTML, CSS, and JavaScript + Three.js.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android%20%7C%20iOS-green)

## ✨ Features

### 🔧 Assembly Workbench
- Select real-world DJI-referenced components: carbon frames, brushless motors, ESCs, propellers, flight controllers, batteries, cameras, and transmitters
- 3D snap-assembly with elastic bounce animations
- Live SVG gauge telemetry (weight, thrust, TWR ratio) updates dynamically
- Practical flight statistics: estimated hover time, max speed, camera quality

### 📱 AR Room Scanner
- Simulated LIDAR spatial reconstruction using device camera
- Active point cloud mesh (1,300 green vertices)
- Progressive wireframe furniture detection (sofa, cabinet, desk)
- Collision boundary compilation for virtual flight

### 🌆 AAA City Sandbox
- Procedural terrain with sine-wave rolling hills
- Animated vertex-wave river with reflective water
- Glass-facade reflective skyscrapers
- Instanced pine forests
- Neon suspension bridge with cable wires
- 8-checkpoint race course with glowing torus rings

### 🎮 Flight Physics Engine
- 6-DOF rigid body aerodynamics
- Real drag vectors, ISA air density, ground effect lift
- PID auto-leveling stabilization (Level mode) and raw rate controls (Acro mode)
- Wind gust turbulence simulation
- Battery voltage drain with emergency cutoff
- 3 camera views: Chase, FPV nose-cam, Orbit spectator

### 💥 Crash & Damage System
- Explosive spark particle bursts
- Trailing smoke particle emitters
- Screen static glitch overlays
- Camera impact shake animations
- Black Box Flight Recorder diagnostic terminal

### 🔊 FM Sound Synthesis
- Carrier-modulator FM oscillator pairs for realistic motor whines
- Dynamic pitch/filter scaling with throttle
- Dual-tone battery alarm chimes
- White noise crash impact sounds

## 🚀 Quick Start

```bash
# Serve locally with Python
python -m http.server 8000

# Or with Node.js
npx serve .
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

## 🎮 Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Throttle Up/Down | W / S | Left Joystick Y |
| Yaw Left/Right | A / D | Left Joystick X |
| Pitch Forward/Back | ↑ / ↓ | Right Joystick Y |
| Roll Left/Right | ← / → | Right Joystick X |
| Toggle Camera | C | HUD Button |
| Toggle Flight Mode | F | HUD Button |
| Reset Position | R | HUD Button |

## 📱 Mobile Deployment

See [mobile_deployment_guide.md](mobile_deployment_guide.md) for full instructions on packaging with Capacitor for Android (Play Store) and iOS (App Store).

## 🛠️ Tech Stack

- **HTML5 / CSS3 / JavaScript (ES Modules)**
- **Three.js** — 3D WebGL rendering
- **Web Audio API** — FM synthesis sound engine
- **Capacitor** — Native mobile packaging

## 📄 License

MIT License — free to use, modify, and distribute.
