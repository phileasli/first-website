// ============================================
// CYBERPUNK SCENE RENDERER
// ============================================

class CyberpunkScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    
    // Colors matching the site theme (initialize first!)
    this.colors = {
      skyDark: '#0a0e1f',
      skyMid: '#1a1a3e',
      skyLight: '#2a2a5e',
      neonCyan: '#39f6ff',
      neonPink: '#ff2ee0',
      neonYellow: '#ffd500',
      neonOrange: '#ff8800',
      neonPurple: '#8a5cff',
      neonGreen: '#7cff69',
      roadDark: '#0a0a15',
      roadGray: '#2a2a3a',
      buildingDark: '#050710',
      rainColor: 'rgba(200, 220, 255, 0.4)'
    };
    
    // Scene properties
    this.time = 0;
    this.buildings = this.generateBuildings();
    this.raindrops = this.generateRain();
    this.vehicles = this.generateVehicles();
    this.trains = this.generateTrains();
    this.neonLights = this.generateNeonLights();
    this.monkeyRainUntil = 0;
    this.monkeys = [];
    
    window.addEventListener('resize', () => this.resizeCanvas());
    this.animate();
  }
  
  resizeCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    
    // Re-create context with optimization flags
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }
  
  generateBuildings() {
    const buildings = [];
    const count = Math.ceil(this.canvas.width / 180);
    
    for (let i = 0; i < count; i++) {
      buildings.push({
        x: i * 200 + Math.random() * 60,
        y: this.canvas.height * 0.35 + Math.random() * 40,
        width: 120 + Math.random() * 100,
        height: this.canvas.height * 0.65,
        neonColor: [this.colors.neonCyan, this.colors.neonPink, this.colors.neonPurple, this.colors.neonYellow][Math.floor(Math.random() * 4)],
        windowPattern: Math.random() > 0.5,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.02 + Math.random() * 0.03
      });
    }
    
    return buildings;
  }
  
  generateRain() {
    const drops = [];
    const count = Math.floor(this.canvas.width * this.canvas.height / 8000);
    
    for (let i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        length: 8 + Math.random() * 12,
        speed: 4 + Math.random() * 6,
        opacity: 0.2 + Math.random() * 0.3,
        angle: 0.4 + Math.random() * 0.1
      });
    }
    
    return drops;
  }
  
  generateMonkeyRain() {
    const count = Math.min(70, Math.max(28, Math.floor(this.canvas.width / 18)));
    const monkeys = [];

    for (let i = 0; i < count; i++) {
      monkeys.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height,
        speed: 2.8 + Math.random() * 4.8,
        size: 18 + Math.random() * 18,
        drift: Math.random() * 1.4 - 0.7,
        spin: Math.random() * Math.PI * 2
      });
    }

    return monkeys;
  }

  startMonkeyRain() {
    this.monkeyRainUntil = performance.now() + 15000;
    this.monkeys = this.generateMonkeyRain();
  }

  drawMonkeyRain() {
    if (performance.now() > this.monkeyRainUntil) {
      this.monkeys = [];
      return;
    }

    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    this.monkeys.forEach(monkey => {
      monkey.y += monkey.speed;
      monkey.x += monkey.drift + Math.sin((this.time + monkey.spin) * 0.04) * 0.45;
      monkey.spin += 0.045;

      if (monkey.y > this.canvas.height + 40) {
        monkey.y = -40;
        monkey.x = Math.random() * this.canvas.width;
      }

      if (monkey.x < -30) monkey.x = this.canvas.width + 30;
      if (monkey.x > this.canvas.width + 30) monkey.x = -30;

      this.ctx.save();
      this.ctx.translate(monkey.x, monkey.y);
      this.ctx.rotate(Math.sin(monkey.spin) * 0.32);
      this.ctx.font = `${monkey.size}px serif`;
      this.ctx.fillText("🐒", 0, 0);
      this.ctx.restore();
    });

    this.ctx.restore();
  }

  generateVehicles() {
    return [
      { x: 200, y: this.canvas.height * 0.7, speed: 34.4, direction: 1, color: this.colors.neonCyan },
      { x: 600, y: this.canvas.height * 0.75, speed: 31.75, direction: 1, color: this.colors.neonPink },
      { x: -100, y: this.canvas.height * 0.72, speed: 33.1, direction: 1, color: this.colors.neonGreen }
    ];
  }
  
  generateTrains() {
    return [
      { x: -1600, y: this.canvas.height * 0.82, speed: 234, direction: 1, color: this.colors.neonCyan, cars: 14 },
      { x: this.canvas.width + 240, y: this.canvas.height * 0.88, speed: 216, direction: -1, color: this.colors.neonPink, cars: 15 }
    ];
  }
  
  generateNeonLights() {
    const lights = [];
    const count = Math.ceil(this.canvas.width / 300);
    
    for (let i = 0; i < count; i++) {
      lights.push({
        x: i * 320 + Math.random() * 100,
        y: this.canvas.height * 0.2 + Math.random() * 100,
        radius: 40 + Math.random() * 60,
        color: [this.colors.neonCyan, this.colors.neonPink, this.colors.neonYellow][Math.floor(Math.random() * 3)],
        intensity: 0.3 + Math.random() * 0.4,
        flickerPhase: Math.random() * Math.PI * 2
      });
    }
    
    return lights;
  }
  
  drawSky() {
    // Create a gradient sky with fog effect
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.5);
    gradient.addColorStop(0, '#0a0e20');
    gradient.addColorStop(0.3, '#1a1635');
    gradient.addColorStop(0.6, '#2a2050');
    gradient.addColorStop(1, '#1a1a35');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);
    
    // Add subtle clouds/fog
    this.ctx.fillStyle = 'rgba(20, 20, 50, 0.2)';
    for (let i = 0; i < 3; i++) {
      const cloudY = this.canvas.height * (0.1 + i * 0.15);
      this.ctx.beginPath();
      this.ctx.ellipse(
        (this.time * 0.3 + i * this.canvas.width / 3) % (this.canvas.width + 400) - 200,
        cloudY,
        400,
        80,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }
  
  drawRoad() {
    // Road base
    this.ctx.fillStyle = this.colors.roadDark;
    this.ctx.fillRect(0, this.canvas.height * 0.65, this.canvas.width, this.canvas.height * 0.35);
    
    // Lane markings
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([20, 20]);
    
    for (let y = this.canvas.height * 0.65; y < this.canvas.height; y += this.canvas.height * 0.15) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.setLineDash([]);
    
    // Moving lane markers for parallax effect
    this.ctx.strokeStyle = 'rgba(57, 246, 255, 0.25)';
    this.ctx.lineWidth = 3;
    
    for (let i = 0; i < 5; i++) {
      const markerX = (this.time * 2 + i * (this.canvas.width / 5)) % this.canvas.width;
      this.ctx.beginPath();
      this.ctx.moveTo(markerX, this.canvas.height * 0.68);
      this.ctx.lineTo(markerX + 30, this.canvas.height * 0.68);
      this.ctx.stroke();
    }
    
    // Side neon strips
    this.ctx.fillStyle = `rgba(57, 246, 255, ${0.15 + Math.sin(this.time * 0.02) * 0.08})`;
    this.ctx.fillRect(0, this.canvas.height * 0.65, 8, this.canvas.height * 0.35);
    
    this.ctx.fillStyle = `rgba(255, 46, 224, ${0.15 + Math.cos(this.time * 0.02) * 0.08})`;
    this.ctx.fillRect(this.canvas.width - 8, this.canvas.height * 0.65, 8, this.canvas.height * 0.35);
  }
  
  drawBuildings() {
    this.buildings.forEach(building => {
      // Building silhouette
      this.ctx.fillStyle = this.colors.buildingDark;
      this.ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Building outline with neon glow
      this.ctx.strokeStyle = building.neonColor;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.3;
      this.ctx.strokeRect(building.x, building.y, building.width, building.height);
      this.ctx.globalAlpha = 1;
      
      // Windows with flicker
      if (building.windowPattern) {
        const windowSize = 12;
        const gapSize = 8;
        const windowColor = building.neonColor;
        
        building.flickerPhase += building.flickerSpeed;
        const flicker = Math.sin(building.flickerPhase + this.time * 0.02) * 0.3 + 0.4;
        
        this.ctx.fillStyle = windowColor;
        this.ctx.globalAlpha = flicker;
        
        for (let wx = building.x + 10; wx < building.x + building.width - 10; wx += windowSize + gapSize) {
          for (let wy = building.y + 20; wy < building.y + building.height - 20; wy += windowSize + gapSize) {
            if (Math.random() > 0.3) {
              this.ctx.fillRect(wx, wy, windowSize, windowSize);
            }
          }
        }
        
        this.ctx.globalAlpha = 1;
      }
    });
  }
  
  drawNeonLights() {
    this.neonLights.forEach(light => {
      const flickerIntensity = Math.sin(this.time * 0.03 + light.flickerPhase) * 0.2 + light.intensity;
      
      // Outer glow
      const gradientOuter = this.ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius * 2);
      gradientOuter.addColorStop(0, light.color + '00');
      gradientOuter.addColorStop(0.5, this.hexToRgba(light.color, flickerIntensity * 0.3));
      gradientOuter.addColorStop(1, this.hexToRgba(light.color, 0));
      
      this.ctx.fillStyle = gradientOuter;
      this.ctx.beginPath();
      this.ctx.arc(light.x, light.y, light.radius * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Inner bright core
      const gradientInner = this.ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
      gradientInner.addColorStop(0, this.hexToRgba(light.color, flickerIntensity));
      gradientInner.addColorStop(1, this.hexToRgba(light.color, 0));
      
      this.ctx.fillStyle = gradientInner;
      this.ctx.beginPath();
      this.ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
  
  drawRain() {
    this.ctx.strokeStyle = this.colors.rainColor;
    this.ctx.lineWidth = 1.5;
    this.ctx.globalAlpha = 0.6;
    
    this.raindrops.forEach(drop => {
      // Update position
      drop.y += drop.speed;
      drop.x += drop.speed * drop.angle * 0.3;
      
      // Wrap around
      if (drop.y > this.canvas.height) {
        drop.y = -20;
        drop.x = Math.random() * this.canvas.width;
      }
      
      if (drop.x > this.canvas.width) {
        drop.x = 0;
      }
      
      // Draw rain streak
      this.ctx.beginPath();
      this.ctx.moveTo(drop.x, drop.y);
      this.ctx.lineTo(drop.x - drop.length * drop.angle, drop.y + drop.length);
      this.ctx.stroke();
    });
    
    this.ctx.globalAlpha = 1;
  }
  
  drawVehicles() {
    this.vehicles.forEach(vehicle => {
      // Update position
      vehicle.x += vehicle.speed * vehicle.direction;
      
      // Wrap around screen
      if (vehicle.direction > 0 && vehicle.x > this.canvas.width) {
        vehicle.x = -50;
      } else if (vehicle.direction < 0 && vehicle.x < -50) {
        vehicle.x = this.canvas.width;
      }
      
      // Draw simple pixel-art vehicle
      const vehicleWidth = 40;
      const vehicleHeight = 20;
      
      // Vehicle body
      this.ctx.fillStyle = 'rgba(20, 20, 35, 0.8)';
      this.ctx.fillRect(vehicle.x, vehicle.y, vehicleWidth, vehicleHeight);
      
      // Neon edge
      this.ctx.strokeStyle = vehicle.color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.7 + Math.sin(this.time * 0.05) * 0.2;
      this.ctx.strokeRect(vehicle.x, vehicle.y, vehicleWidth, vehicleHeight);
      this.ctx.globalAlpha = 1;
      
      // Headlights
      this.ctx.fillStyle = vehicle.color;
      this.ctx.globalAlpha = 0.6 + Math.sin(this.time * 0.08) * 0.3;
      this.ctx.fillRect(vehicle.x + 2, vehicle.y + 3, 4, 4);
      this.ctx.fillRect(vehicle.x + 2, vehicle.y + 13, 4, 4);
      this.ctx.globalAlpha = 1;
    });
  }
  
  isTrainWarningActive() {
    return this.trains.some(train => {
      const carWidth = 60;
      const spacing = 8;
      const trainWidth = train.cars * carWidth + (train.cars - 1) * spacing;
      const warningDistance = 3600;

      if (train.direction > 0) {
        const front = train.x + trainWidth;
        return front > -warningDistance && train.x < this.canvas.width;
      }

      const front = train.x;
      const tail = train.x + trainWidth;
      return front < this.canvas.width + warningDistance && tail > 0;
    });
  }

  drawTrainWarningLights() {
    if (!this.isTrainWarningActive()) return;

    const baseY = this.canvas.height * 0.84;
    const postY = this.canvas.height * 0.76;
    const signalX = Math.min(this.canvas.width - 64, Math.max(64, this.canvas.width * 0.5));
    const lightPositions = [
      { x: signalX - 16, y: postY },
      { x: signalX + 16, y: postY }
    ];
    const flashOn = Math.floor(this.time / 8) % 2 === 0;

    lightPositions.forEach((light, index) => {
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(light.x, baseY);
      this.ctx.lineTo(light.x, light.y + 14);
      this.ctx.stroke();

      this.ctx.fillStyle = "rgba(8, 8, 16, 0.9)";
      this.ctx.fillRect(light.x - 12, light.y - 12, 24, 24);

      const isLit = flashOn ? index === 0 : index === 1;
      const alpha = isLit ? 1 : 0.24;
      const glow = this.ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, isLit ? 34 : 14);
      glow.addColorStop(0, `rgba(255, 34, 34, ${isLit ? 0.72 : 0.16})`);
      glow.addColorStop(1, "rgba(255, 34, 34, 0)");
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(light.x, light.y, isLit ? 34 : 14, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = `rgba(255, 34, 34, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(light.x, light.y, 6, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(light.x - 12, light.y - 12, 24, 24);
    });
  }

  drawTrains() {
    this.trains.forEach(train => {
      // Update position
      train.x += train.speed * train.direction;
      
      // Draw train with multiple cars
      const carWidth = 60;
      const carHeight = 28;
      const spacing = 8;
      const trainWidth = train.cars * carWidth + (train.cars - 1) * spacing;
      
      // Wrap around after the full train has left the canvas
      if (train.direction > 0 && train.x > this.canvas.width + 18000) {
        train.x = -trainWidth - 18000;
      } else if (train.direction < 0 && train.x < -trainWidth - 18000) {
        train.x = this.canvas.width + 18000;
      }
      
      for (let i = 0; i < train.cars; i++) {
        const carX = train.x + i * (carWidth + spacing);
        
        // Train car body
        this.ctx.fillStyle = 'rgba(15, 15, 30, 0.9)';
        this.ctx.fillRect(carX, train.y, carWidth, carHeight);
        
        // Train car neon outline
        this.ctx.strokeStyle = train.color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.8 + Math.sin(this.time * 0.04 + i) * 0.15;
        this.ctx.strokeRect(carX, train.y, carWidth, carHeight);
        this.ctx.globalAlpha = 1;
        
        // Windows on train cars
        this.ctx.fillStyle = train.color;
        this.ctx.globalAlpha = 0.7 + Math.sin(this.time * 0.06 + i) * 0.2;
        this.ctx.fillRect(carX + 8, train.y + 6, 12, 8);
        this.ctx.fillRect(carX + 28, train.y + 6, 12, 8);
        this.ctx.globalAlpha = 1;
        
        // Neon glow around train
        const glowGradient = this.ctx.createRadialGradient(carX + carWidth / 2, train.y + carHeight / 2, 0, carX + carWidth / 2, train.y + carHeight / 2, 50);
        glowGradient.addColorStop(0, this.hexToRgba(train.color, 0.15));
        glowGradient.addColorStop(1, this.hexToRgba(train.color, 0));
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(carX + carWidth / 2, train.y + carHeight / 2, 50, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Train connector lines
      this.ctx.strokeStyle = train.color;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.5;
      for (let i = 0; i < train.cars - 1; i++) {
        const carX = train.x + i * (carWidth + spacing);
        this.ctx.beginPath();
        this.ctx.moveTo(carX + carWidth, train.y + carHeight / 2);
        this.ctx.lineTo(carX + carWidth + spacing, train.y + carHeight / 2);
        this.ctx.stroke();
      }
      this.ctx.globalAlpha = 1;
    });
  }
  
  drawForeground() {
    // Power poles and silhouettes in foreground
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.lineWidth = 3;
    
    for (let i = 0; i < 4; i++) {
      const poleX = (this.canvas.width / 4) * (i + 0.5);
      
      // Vertical pole
      this.ctx.beginPath();
      this.ctx.moveTo(poleX, this.canvas.height * 0.2);
      this.ctx.lineTo(poleX, this.canvas.height);
      this.ctx.stroke();
      
      // Crossbars
      for (let j = 0; j < 5; j++) {
        const barY = this.canvas.height * (0.2 + j * 0.15);
        this.ctx.beginPath();
        this.ctx.moveTo(poleX - 20, barY);
        this.ctx.lineTo(poleX + 20, barY);
        this.ctx.stroke();
      }
    }
    
    // Fence-like structures
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    for (let i = 0; i < 8; i++) {
      const fenceX = (this.canvas.width / 8) * i;
      this.ctx.fillRect(fenceX, this.canvas.height * 0.6, 8, this.canvas.height * 0.4);
    }
  }
  
  drawGrainNoise() {
    // Only apply grain every 3 frames for better performance
    if (this.time % 3 !== 0) return;
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 20;
      data[i] += grain;     // R
      data[i + 1] += grain; // G
      data[i + 2] += grain; // B
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }
  
  drawScanlines() {
    // CRT scanline effect
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    this.ctx.lineWidth = 1;
    
    for (let y = 0; y < this.canvas.height; y += 2) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  animate = () => {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw scene layers
    this.drawSky();
    this.drawNeonLights();
    this.drawBuildings();
    this.drawRoad();
    this.drawRain();
    this.drawVehicles();
    this.drawTrainWarningLights();
    this.drawTrains();
    this.drawForeground();
    
    // Apply post-processing effects
    this.drawGrainNoise();
    this.drawScanlines();
    this.drawMonkeyRain();
    
    // Update time
    this.time += 1;
    
    // Continue animation
    requestAnimationFrame(this.animate);
  }
}

// Initialize cyberpunk scene
const canvas = document.getElementById('cyberpunk-bg');
let cyberpunkScene = null;
if (canvas) {
  try {
    cyberpunkScene = new CyberpunkScene(canvas);
  } catch (error) {
    cyberpunkScene = null;
    console.warn("Cyberpunk background failed to start", error);
  }
}

function startMonkeyRainOverlay() {
  const existingOverlay = document.querySelector(".monkey-rain-overlay");
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement("div");
  overlay.className = "monkey-rain-overlay monkey-rain-overlay--enter";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  const hud = document.createElement("div");
  hud.className = "monkey-rain-hud";
  hud.innerHTML = "<strong>MONKEY STORM</strong><span>15</span>";
  overlay.appendChild(hud);

  const combo = document.createElement("div");
  combo.className = "monkey-combo";
  combo.textContent = "x0";
  overlay.appendChild(combo);

  const message = document.createElement("div");
  message.className = "monkey-storm-message";
  message.textContent = "MONKEY STORM";
  overlay.appendChild(message);

  const vignette = document.createElement("div");
  vignette.className = "monkey-impact-vignette";
  overlay.appendChild(vignette);

  const monkeys = ["🐒", "🙈", "🙉", "🙊"];
  let hits = 0;
  let comboResetTimer = null;
  const endsAt = Date.now() + 15000;

  const updateTimer = () => {
    const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    const timer = hud.querySelector("span");
    if (timer) timer.textContent = String(secondsLeft);
  };

  const showSplash = (x, y) => {
    const splash = document.createElement("span");
    splash.className = "blood-splash";
    splash.style.left = x + "px";
    splash.style.top = y + "px";
    overlay.appendChild(splash);
    splash.addEventListener("animationend", () => splash.remove(), { once: true });
  };

  const pulseHit = () => {
    overlay.classList.remove("monkey-rain-overlay--hit");
    void overlay.offsetWidth;
    overlay.classList.add("monkey-rain-overlay--hit");
  };

  const updateCombo = (x, y) => {
    hits += 1;
    combo.textContent = "x" + hits;
    combo.style.left = Math.min(window.innerWidth - 80, Math.max(20, x + 18)) + "px";
    combo.style.top = Math.min(window.innerHeight - 60, Math.max(20, y - 28)) + "px";
    combo.classList.remove("is-active");
    void combo.offsetWidth;
    combo.classList.add("is-active");

    window.clearTimeout(comboResetTimer);
    comboResetTimer = window.setTimeout(() => {
      hits = 0;
      combo.classList.remove("is-active");
    }, 1800);
  };

  const makeBloodDrop = (monkey, x, y) => {
    const rect = monkey.getBoundingClientRect();
    const drop = document.createElement("span");
    drop.className = "blood-drop";
    drop.textContent = "🩸";
    drop.style.left = (rect.left + rect.width / 2) + "px";
    drop.style.top = (rect.top + rect.height / 2) + "px";
    drop.style.setProperty("--blood-fall", (1.1 + Math.random() * 0.9) + "s");
    drop.style.setProperty("--blood-drift", (Math.random() * 90 - 45) + "px");
    overlay.appendChild(drop);

    drop.addEventListener("animationend", () => {
      const finalX = rect.left + rect.width / 2;
      showSplash(finalX, window.innerHeight - 22);
      drop.remove();
    }, { once: true });

    monkey.remove();
    showSplash(x, y);
    updateCombo(x, y);
    pulseHit();
  };

  const turnMonkeyToBlood = (monkey, x, y) => {
    if (!monkey || monkey.classList.contains("is-hit")) return;
    monkey.classList.add("is-hit");
    makeBloodDrop(monkey, x, y);
  };

  overlay.addEventListener("click", (event) => {
    const activeMonkeys = Array.from(overlay.querySelectorAll("span.monkey-drop:not(.is-hit)"));
    let nearestMonkey = null;
    let nearestDistance = Infinity;

    activeMonkeys.forEach((monkey) => {
      const rect = monkey.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestMonkey = monkey;
      }
    });

    if (nearestDistance <= 72) {
      turnMonkeyToBlood(nearestMonkey, event.clientX, event.clientY);
    }
  });

  const count = Math.min(110, Math.max(44, Math.floor(window.innerWidth / 14)));
  for (let i = 0; i < count; i++) {
    const monkey = document.createElement("span");
    monkey.className = "monkey-drop";
    monkey.textContent = monkeys[Math.floor(Math.random() * monkeys.length)];
    monkey.style.left = Math.random() * 100 + "vw";
    monkey.style.setProperty("--monkey-size", (24 + Math.random() * 26) + "px");
    monkey.style.setProperty("--monkey-delay", (Math.random() * -4.5) + "s");
    monkey.style.setProperty("--monkey-duration", (8 + Math.random() * 7) + "s");
    monkey.style.setProperty("--monkey-drift", (Math.random() * 210 - 105) + "px");
    monkey.addEventListener("click", (event) => {
      event.stopPropagation();
      turnMonkeyToBlood(monkey, event.clientX, event.clientY);
    });
    overlay.appendChild(monkey);
  }

  updateTimer();
  const timerInterval = window.setInterval(updateTimer, 250);

  window.setTimeout(() => {
    window.clearInterval(timerInterval);
    overlay.classList.add("monkey-rain-overlay--exit");
    window.setTimeout(() => overlay.remove(), 520);
  }, 15000);
}

(() => {
  const monkeyCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft"];
  const recentKeys = [];
  const normalizeArrowKey = (event) => {
    const value = event.code || event.key;
    if (value === "ArrowUp" || event.key === "Up") return "ArrowUp";
    if (value === "ArrowDown" || event.key === "Down") return "ArrowDown";
    if (value === "ArrowRight" || event.key === "Right") return "ArrowRight";
    if (value === "ArrowLeft" || event.key === "Left") return "ArrowLeft";
    return "";
  };

  window.addEventListener("keydown", (event) => {
    const key = normalizeArrowKey(event);
    if (!key) return;

    event.preventDefault();
    recentKeys.push(key);

    if (recentKeys.length > monkeyCode.length) {
      recentKeys.shift();
    }

    if (recentKeys.length === monkeyCode.length && recentKeys.join("|") === monkeyCode.join("|")) {
      if (cyberpunkScene) cyberpunkScene.startMonkeyRain();
      startMonkeyRainOverlay();
      recentKeys.length = 0;
    }
  }, { capture: true });
})();

// ============================================
// ORIGINAL SCRIPT CONTENT
// ============================================

// Smooth interaction enhancements and accessible modal handling.
document.querySelectorAll('.button').forEach((button) => {
  button.addEventListener('mouseenter', () => (button.style.transform = 'translateY(-3px)'));
  button.addEventListener('mouseleave', () => (button.style.transform = 'translateY(0)'));
});

const skillCards = Array.from(document.querySelectorAll('.skill-card'));
const modalOverlay = document.querySelector('.skill-modal-overlay');
const modalTitle = document.querySelector('.skill-modal-title');
const modalText = document.querySelector('.skill-modal-text');
const modalImage = document.querySelector('.skill-modal-image');
const modalClose = document.querySelector('.skill-modal-close');
if (modalOverlay && modalOverlay.parentElement !== document.body) {
  document.body.appendChild(modalOverlay);
}
let lastFocusedEl = null;

function openModal(card) {
  if (!card || !modalOverlay) return;
  lastFocusedEl = document.activeElement;
  const title = card.dataset.title || '';
  const detail = card.dataset.detail || '';
  const imageText = card.dataset.image || '';
  if (modalTitle) modalTitle.textContent = title;
  if (modalText) modalText.textContent = detail;
  if (modalImage) modalImage.textContent = imageText;
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  modalClose && modalClose.focus();
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
}

skillCards.forEach((card) => {
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', () => openModal(card));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card);
    }
  });
});

modalClose && modalClose.addEventListener('click', closeModal);
modalOverlay && modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) closeModal();
});


// Custom glitch cursor for mouse and trackpad users.
(() => {
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

  const cursor = document.createElement("div");
  cursor.className = "glitch-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = "<span class=\"glitch-cursor-core\"></span>";
  document.body.appendChild(cursor);
  document.body.classList.add("custom-cursor-enabled");

  const trail = Array.from({ length: 14 }, () => {
    const piece = document.createElement("span");
    piece.className = "glitch-cursor-trail";
    piece.setAttribute("aria-hidden", "true");
    document.body.appendChild(piece);
    return piece;
  });

  let targetX = -100;
  let targetY = -100;
  let currentX = -100;
  let currentY = -100;
  let trailIndex = 0;
  let lastTrailAt = 0;
  let cursorFrame = null;

  const moveCursor = () => {
    currentX += (targetX - currentX) * 0.72;
    currentY += (targetY - currentY) * 0.72;

    if (Math.abs(targetX - currentX) < 0.08) currentX = targetX;
    if (Math.abs(targetY - currentY) < 0.08) currentY = targetY;

    cursor.style.transform = "translate3d(" + currentX + "px, " + currentY + "px, 0)";
    cursorFrame = requestAnimationFrame(moveCursor);
  };

  const dropTrail = () => {
    const now = performance.now();
    if (now - lastTrailAt < 12) return;
    lastTrailAt = now;

    const piece = trail[trailIndex];
    trailIndex = (trailIndex + 1) % trail.length;
    piece.classList.remove("is-active");
    piece.style.left = currentX + "px";
    piece.style.top = currentY + "px";
    piece.style.setProperty("--trail-x", (Math.random() * 28 - 14) + "px");
    piece.style.setProperty("--trail-y", (Math.random() * 22 - 11) + "px");
    piece.style.setProperty("--trail-rotate", (Math.random() * 42 - 21) + "deg");
    piece.style.setProperty("--trail-color", Math.random() > 0.5 ? "#39f6ff" : "#ff2ee0");
    void piece.offsetWidth;
    piece.classList.add("is-active");
  };

  const clickBurst = (event) => {
    cursor.classList.add("is-clicking");

    const shockwave = document.createElement("span");
    shockwave.className = "cursor-shockwave";
    shockwave.setAttribute("aria-hidden", "true");
    shockwave.style.left = event.clientX + "px";
    shockwave.style.top = event.clientY + "px";
    document.body.appendChild(shockwave);
    shockwave.addEventListener("animationend", () => shockwave.remove(), { once: true });

    const tear = document.createElement("span");
    tear.className = "cursor-screen-tear";
    tear.setAttribute("aria-hidden", "true");
    tear.style.left = event.clientX + "px";
    tear.style.top = event.clientY + "px";
    tear.style.setProperty("--tear-width", (110 + Math.random() * 120) + "px");
    document.body.appendChild(tear);
    tear.addEventListener("animationend", () => tear.remove(), { once: true });

    for (let i = 0; i < 8; i++) {
      const shard = document.createElement("span");
      shard.className = "glitch-click-shard";
      shard.setAttribute("aria-hidden", "true");
      shard.style.left = event.clientX + "px";
      shard.style.top = event.clientY + "px";
      shard.style.setProperty("--burst-x", (Math.random() * 96 - 48) + "px");
      shard.style.setProperty("--burst-y", (Math.random() * 76 - 38) + "px");
      shard.style.setProperty("--burst-color", i % 2 ? "#ff2ee0" : "#39f6ff");
      document.body.appendChild(shard);
      shard.addEventListener("animationend", () => shard.remove(), { once: true });
    }

    for (let i = 0; i < 18; i++) {
      const fire = document.createElement("span");
      fire.className = "cursor-fire-particle";
      fire.setAttribute("aria-hidden", "true");
      fire.style.left = event.clientX + (Math.random() * 18 - 9) + "px";
      fire.style.top = event.clientY + (Math.random() * 10 - 5) + "px";
      fire.style.setProperty("--fire-drift", (Math.random() * 80 - 40) + "px");
      fire.style.setProperty("--fire-drop", (52 + Math.random() * 90) + "px");
      fire.style.setProperty("--fire-size", (4 + Math.random() * 7) + "px");
      fire.style.setProperty("--fire-duration", (.58 + Math.random() * .46) + "s");
      fire.style.setProperty("--fire-color", ["#ff4b00", "#ff8a18", "#ffd166"][Math.floor(Math.random() * 3)]);
      document.body.appendChild(fire);
      fire.addEventListener("animationend", () => fire.remove(), { once: true });
    }
  };

  document.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;

    if (!cursor.classList.contains("is-visible")) {
      currentX = targetX;
      currentY = targetY;
      cursor.classList.add("is-visible");
    }

    dropTrail();
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("a, button, input, textarea, select, [role=\"button\"]");
    cursor.classList.toggle("is-hovering", Boolean(target));
  });

  document.addEventListener("pointerdown", clickBurst);
  document.addEventListener("pointerup", () => cursor.classList.remove("is-clicking"));
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  window.addEventListener("pagehide", () => {
    if (cursorFrame) cancelAnimationFrame(cursorFrame);
  });

  moveCursor();
})();


// Whole-page cyberpunk effects that do not depend on the cursor.
(() => {
  const ambientLayer = document.createElement("div");
  ambientLayer.className = "ambient-effects";
  ambientLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(ambientLayer);

  const bootFlash = document.createElement("div");
  bootFlash.className = "boot-glitch-flash";
  bootFlash.setAttribute("aria-hidden", "true");
  document.body.appendChild(bootFlash);
  bootFlash.addEventListener("animationend", () => bootFlash.remove(), { once: true });

  for (let i = 0; i < 28; i++) {
    const spark = document.createElement("span");
    spark.className = "ambient-spark";
    spark.style.left = Math.random() * 100 + "vw";
    spark.style.top = Math.random() * 100 + "vh";
    spark.style.setProperty("--spark-delay", (Math.random() * -8) + "s");
    spark.style.setProperty("--spark-duration", (5 + Math.random() * 7) + "s");
    spark.style.setProperty("--spark-drift", (Math.random() * 180 - 90) + "px");
    spark.style.setProperty("--spark-color", Math.random() > .5 ? "#39f6ff" : "#ff2ee0");
    ambientLayer.appendChild(spark);
  }

  const setScrollEnergy = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, window.scrollY / maxScroll);
    document.body.style.setProperty("--scroll-energy", progress.toFixed(3));
  };

  setScrollEnergy();
  window.addEventListener("scroll", setScrollEnergy, { passive: true });
  window.addEventListener("resize", setScrollEnergy);
})();


// Extra hover tilt and code-rain details.
(() => {
  const canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover) {
    const tiltTargets = document.querySelectorAll(".profile-card, .skill-card");
    tiltTargets.forEach((target) => {
      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        target.style.setProperty("--tilt-x", (px * 8).toFixed(2) + "deg");
        target.style.setProperty("--tilt-y", (py * -8).toFixed(2) + "deg");
      });

      target.addEventListener("pointerleave", () => {
        target.style.setProperty("--tilt-x", "0deg");
        target.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const glyphs = ["</>", "01", "JS", "K", "HTML", "CSS", "RUN", "DEV", "PIX", "{ }", "#", "++"];
  const colors = ["#39f6ff", "#ff2ee0", "#7cff69", "#ffd500", "#8a5cff"];
  const count = Math.min(34, Math.max(16, Math.floor(window.innerWidth / 42)));

  for (let i = 0; i < count; i++) {
    const glyph = document.createElement("span");
    glyph.className = "code-glyph";
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    glyph.style.setProperty("--glyph-left", Math.random() * 100 + "vw");
    glyph.style.setProperty("--glyph-drift", (Math.random() * 130 - 65) + "px");
    glyph.style.setProperty("--glyph-duration", (6 + Math.random() * 8) + "s");
    glyph.style.setProperty("--glyph-delay", (Math.random() * -12) + "s");
    glyph.style.setProperty("--glyph-size", (9 + Math.random() * 7) + "px");
    glyph.style.setProperty("--glyph-color", colors[Math.floor(Math.random() * colors.length)]);
    document.body.appendChild(glyph);
  }
})();