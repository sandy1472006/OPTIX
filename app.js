/**
 * OPTIX ENGINE
 * Clean, Robust Conveyor Simulation with Reliable Air Jet Diversion
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER ---
  class SoundManager {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx && typeof window.AudioContext !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playLaser() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.14);
      } catch (e) {}
    }

    playAirJet() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const bufferSize = this.ctx.sampleRate * 0.28;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 950;
        filter.Q.value = 1.6;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (e) {}
    }

    playDecision(decision) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        if (decision === 'PASS') {
          [523.25, 659.25].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            gain.gain.setValueAtTime(0.04, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.25);
          });
        } else {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.setValueAtTime(280, now + 0.1);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      } catch (e) {}
    }
  }

  const soundMgr = new SoundManager();

  // --- GLOBAL STATE ---
  const STATE = {
    foodType: 'poultry',
    contaminationType: 'none',
    contaminationLocation: 'center',
    conveyorSpeed: 1.5,

    foodItems: [],
    particles: [],
    beltOffset: 0,
    isContinuous: false,
    nextItemTimer: 0,

    activeItem: null,
    scanProgress: 0,

    currentDecision: 'PASS',
    riskScore: 0.04,
    uncertainty: 0.02,

    stats: {
      inspected: 12,
      pass: 10,
      divert: 2,
      quarantine: 0
    },

    airJetActive: false,
    airJetTimer: 0,
    labSampleId: 'TG-0042'
  };

  // --- DOM REFERENCES ---
  const DOM = {
    btnSoundToggle: document.getElementById('btnSoundToggle'),
    soundIcon: document.getElementById('soundIcon'),
    btnAutoStream: document.getElementById('btnAutoStream'),
    txtAutoStream: document.getElementById('txtAutoStream'),
    btnResetConveyor: document.getElementById('btnResetConveyor'),

    scenarioButtons: document.querySelectorAll('.btn-scenario'),
    selFoodType: document.getElementById('selFoodType'),
    rangeSpeed: document.getElementById('rangeSpeed'),
    valSpeed: document.getElementById('valSpeed'),
    btnStartScan: document.getElementById('btnStartScan'),

    conveyorCanvas: document.getElementById('conveyorCanvas'),
    scanStateBadge: document.getElementById('scanStateBadge'),
    spectralProgressBar: document.getElementById('spectralProgressBar'),
    airJetAlert: document.getElementById('airJetAlert'),

    spectralCanvas: document.getElementById('spectralCanvas'),
    valDeviation: document.getElementById('valDeviation'),
    heatmapCanvas: document.getElementById('heatmapCanvas'),
    heatmapTooltip: document.getElementById('heatmapTooltip'),
    tooltipCoord: document.getElementById('tooltipCoord'),
    tooltipRisk: document.getElementById('tooltipRisk'),
    txtClusterLoc: document.getElementById('txtClusterLoc'),

    riskLevelBadge: document.getElementById('riskLevelBadge'),
    riskLevelText: document.getElementById('riskLevelText'),
    metricAnomaly: document.getElementById('metricAnomaly'),
    metricUncertainty: document.getElementById('metricUncertainty'),
    decPass: document.getElementById('decPass'),
    decDivert: document.getElementById('decDivert'),
    decQuarantine: document.getElementById('decQuarantine'),

    labSampleId: document.getElementById('labSampleId'),
    labResultText: document.getElementById('labResultText'),
    btnSimulateLab: document.getElementById('btnSimulateLab'),
    labFeedbackStatus: document.getElementById('labFeedbackStatus'),

    cntTotal: document.getElementById('cntTotal'),
    cntPass: document.getElementById('cntPass'),
    cntDivert: document.getElementById('cntDivert'),
    cntQuarantine: document.getElementById('cntQuarantine')
  };

  const ctxConveyor = DOM.conveyorCanvas.getContext('2d');
  const ctxSpectral = DOM.spectralCanvas.getContext('2d');
  const ctxHeatmap = DOM.heatmapCanvas.getContext('2d');

  // --- CANVAS RESIZING ---
  function handleResize() {
    [DOM.conveyorCanvas, DOM.spectralCanvas, DOM.heatmapCanvas].forEach(canvas => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.floor(rect.width);
        canvas.height = Math.floor(rect.height);
      }
    });

    renderSpectralGraph(STATE.activeItem || new FoodItem('poultry', 'none', 'center'));
    renderHeatmap(STATE.activeItem || new FoodItem('poultry', 'none', 'center'));
  }

  window.addEventListener('resize', handleResize);

  // --- FOOD ITEM CLASS ---
  class FoodItem {
    constructor(type, contamination, location, xPos = -90) {
      this.id = 'ITEM-' + Math.floor(1000 + Math.random() * 9000);
      this.type = type || STATE.foodType;
      this.contamination = contamination || STATE.contaminationType;
      this.location = location || STATE.contaminationLocation;

      this.x = xPos;
      this.width = 72;
      this.height = 44;
      this.rotation = 0;
      this.opacity = 1.0;

      this.scanned = false;
      this.isScanning = false;
      this.decision = null;
      this.diverted = false;
      this.inBin = false;
      this.vy = 0;
      this.vx = 0;
      this.vRot = 0;

      this.computeMetrics();
    }

    computeMetrics() {
      if (this.contamination === 'none') {
        this.anomalyScore = +(0.02 + Math.random() * 0.04).toFixed(2);
        this.uncertaintyScore = +(0.01 + Math.random() * 0.03).toFixed(2);
        this.targetDecision = 'PASS';
      } else if (this.contamination === 'localized') {
        this.anomalyScore = +(0.44 + Math.random() * 0.12).toFixed(2);
        this.uncertaintyScore = +(0.06 + Math.random() * 0.04).toFixed(2);
        this.targetDecision = 'DIVERT';
      } else if (this.contamination === 'high') {
        this.anomalyScore = +(0.78 + Math.random() * 0.14).toFixed(2);
        this.uncertaintyScore = +(0.10 + Math.random() * 0.05).toFixed(2);
        this.targetDecision = 'DIVERT';
      } else {
        // uncertain
        this.anomalyScore = +(0.46 + Math.random() * 0.16).toFixed(2);
        this.uncertaintyScore = +(0.65 + Math.random() * 0.20).toFixed(2);
        this.targetDecision = 'QUARANTINE';
      }
    }

    update(speedPixels, beltY) {
      if (this.inBin) return;

      if (!this.diverted) {
        this.x += speedPixels;
        this.y = beltY - this.height + 6;
      } else {
        // Physical deflection down into Quarantine Bin
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.45; // gravity
        this.rotation += this.vRot;

        if (this.y > beltY + 50) {
          this.inBin = true;
          this.y = beltY + 54;
          this.opacity = 0.85;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      const w = this.width;
      const h = this.height;

      // Belt shadow
      ctx.beginPath();
      ctx.ellipse(0, h * 0.44, w * 0.45, h * 0.16, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Organic shape
      ctx.beginPath();
      ctx.moveTo(-w * 0.42, 0);
      ctx.bezierCurveTo(-w * 0.45, -h * 0.4, -w * 0.1, -h * 0.48, w * 0.15, -h * 0.42);
      ctx.bezierCurveTo(w * 0.45, -h * 0.35, w * 0.48, 0, w * 0.38, h * 0.35);
      ctx.bezierCurveTo(w * 0.1, h * 0.48, -w * 0.25, h * 0.42, -w * 0.42, 0);
      ctx.closePath();

      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      if (this.type === 'fish') {
        grad.addColorStop(0, '#fb923c');
        grad.addColorStop(1, '#ea580c');
      } else if (this.type === 'produce') {
        grad.addColorStop(0, '#86efac');
        grad.addColorStop(1, '#15803d');
      } else {
        // Poultry
        grad.addColorStop(0, '#fed7aa');
        grad.addColorStop(0.5, '#fde68a');
        grad.addColorStop(1, '#fbcfe8');
      }
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.stroke();

      // Anomaly spot
      if (this.contamination !== 'none') {
        let spotX = 0;
        let spotY = 0;
        if (this.location === 'top-right') {
          spotX = w * 0.2;
          spotY = -h * 0.18;
        } else if (this.location === 'bottom-left') {
          spotX = -w * 0.2;
          spotY = h * 0.15;
        }
        const radius = this.contamination === 'high' ? 12 : 8;
        drawSpot(ctx, spotX, spotY, radius, this.contamination);
      }

      // Scanned outline
      if (this.scanned && !this.diverted) {
        ctx.strokeStyle = this.decision === 'PASS' ? '#10b981' : (this.decision === 'DIVERT' ? '#f59e0b' : '#eab308');
        ctx.lineWidth = 1.8;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(-w * 0.48, -h * 0.48, w * 0.96, h * 0.96);
        ctx.setLineDash([]);
      }

      ctx.restore();
    }
  }

  function drawSpot(ctx, x, y, radius, contaminationType) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.7, 0, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(x, y, 1, x, y, radius);
    if (contaminationType === 'uncertain') {
      grad.addColorStop(0, 'rgba(234, 179, 8, 0.85)');
      grad.addColorStop(1, 'rgba(234, 179, 8, 0.05)');
    } else if (contaminationType === 'high') {
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    } else {
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.85)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
    }
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // --- AIR JET PARTICLES ---
  class AirParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.2) * 5 + 3;
      this.vy = Math.random() * 8 + 5; // blowing downward
      this.size = Math.random() * 12 + 6;
      this.life = 1.0;
      this.decay = Math.random() * 0.08 + 0.04;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.size += 0.5;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life * 0.75);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- TRIGGER AIR JET ---
  function fireAirJet(item, jetX, jetY) {
    STATE.airJetActive = true;
    STATE.airJetTimer = 22;

    // Show visual banner alert
    DOM.airJetAlert.classList.remove('hidden');
    setTimeout(() => {
      DOM.airJetAlert.classList.add('hidden');
    }, 1200);

    soundMgr.playAirJet();

    // Spawn 45 particles at the nozzle
    for (let i = 0; i < 45; i++) {
      STATE.particles.push(new AirParticle(jetX, jetY + 36));
    }

    // Physical deflection
    if (item) {
      item.diverted = true;
      item.vx = 2.4;
      item.vy = 5.2; // direct downward knock
      item.vRot = 0.08;
    }
  }

  // --- MAIN ANIMATION LOOP ---
  let lastTimestamp = performance.now();

  function simulationLoop(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    const speedFactor = STATE.conveyorSpeed * 95;
    const speedPx = speedFactor * dt;

    STATE.beltOffset = (STATE.beltOffset + speedPx) % 24;

    if (STATE.airJetActive) {
      STATE.airJetTimer--;
      if (STATE.airJetTimer <= 0) {
        STATE.airJetActive = false;
      }
    }

    // Continuous auto-feed
    if (STATE.isContinuous) {
      STATE.nextItemTimer += dt;
      if (STATE.nextItemTimer > 2.8 / STATE.conveyorSpeed) {
        STATE.nextItemTimer = 0;
        const types = ['none', 'localized', 'none', 'high', 'none', 'uncertain'];
        const rType = types[Math.floor(Math.random() * types.length)];
        const locations = ['center', 'top-right', 'bottom-left'];
        const rLoc = locations[Math.floor(Math.random() * locations.length)];
        STATE.foodItems.push(new FoodItem(STATE.foodType, rType, rLoc, -90));
      }
    }

    // Update Particles
    for (let i = STATE.particles.length - 1; i >= 0; i--) {
      STATE.particles[i].update();
      if (STATE.particles[i].life <= 0) {
        STATE.particles.splice(i, 1);
      }
    }

    const canvasW = DOM.conveyorCanvas.width || 800;
    const canvasH = DOM.conveyorCanvas.height || 300;
    const beltY = Math.floor(canvasH * 0.62);

    const scanZoneX = Math.floor(canvasW * 0.35);
    const divertZoneX = Math.floor(canvasW * 0.70);
    const jetX = divertZoneX;
    const jetY = Math.floor(canvasH * 0.32);

    // Update Food Items
    for (let i = STATE.foodItems.length - 1; i >= 0; i--) {
      const item = STATE.foodItems[i];
      item.update(speedPx, beltY);

      // SENSING ZONE (HSI Camera)
      if (!item.scanned && item.x >= scanZoneX - 25) {
        if (!item.isScanning) {
          item.isScanning = true;
          STATE.activeItem = item;
          soundMgr.playLaser();
          DOM.scanStateBadge.textContent = 'SCANNING SPECTRAL BANDS...';
          DOM.scanStateBadge.style.color = '#38bdf8';
        }

        // Complete scan progress reliably
        STATE.scanProgress = Math.min(100, STATE.scanProgress + dt * 260 * STATE.conveyorSpeed);
        DOM.spectralProgressBar.style.width = STATE.scanProgress + '%';

        if (STATE.scanProgress >= 100) {
          item.scanned = true;
          item.isScanning = false;
          // Synchronous decision
          finalizeItemDecision(item);
          renderSpectralGraph(item);
          renderHeatmap(item);
        }
      }

      // SORTING ZONE (Pneumatic Air Jet)
      if (item.scanned && !item.diverted && item.x >= divertZoneX - 20) {
        if (item.decision === 'DIVERT' || item.decision === 'QUARANTINE') {
          fireAirJet(item, jetX, jetY);
        }
      }

      // Cleanup offscreen items
      if (item.x > canvasW + 60 || (item.inBin && item.opacity <= 0)) {
        STATE.foodItems.splice(i, 1);
      }
    }

    // Render Scene
    drawConveyorScene(canvasW, canvasH, beltY, scanZoneX, jetX, jetY);

    requestAnimationFrame(simulationLoop);
  }

  // --- DRAW SCENE ---
  function drawConveyorScene(w, h, beltY, scanZoneX, jetX, jetY) {
    ctxConveyor.clearRect(0, 0, w, h);

    // Subtle background
    ctxConveyor.fillStyle = '#060911';
    ctxConveyor.fillRect(0, 0, w, h);

    ctxConveyor.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctxConveyor.lineWidth = 1;
    for (let x = 0; x < w; x += 28) {
      ctxConveyor.beginPath();
      ctxConveyor.moveTo(x, 0);
      ctxConveyor.lineTo(x, h);
      ctxConveyor.stroke();
    }

    // Conveyor structural frame
    const beltH = 26;
    ctxConveyor.fillStyle = '#1e293b';
    ctxConveyor.fillRect(0, beltY + beltH, w, 10);
    ctxConveyor.fillStyle = '#0f172a';
    ctxConveyor.fillRect(0, beltY + beltH + 10, w, 4);

    // Rubber belt
    ctxConveyor.fillStyle = '#090e17';
    ctxConveyor.fillRect(0, beltY, w, beltH);
    ctxConveyor.strokeStyle = '#334155';
    ctxConveyor.lineWidth = 1.5;
    ctxConveyor.strokeRect(0, beltY, w, beltH);

    // Belt slats
    ctxConveyor.strokeStyle = '#1e293b';
    ctxConveyor.lineWidth = 1.5;
    for (let x = STATE.beltOffset; x < w; x += 24) {
      ctxConveyor.beginPath();
      ctxConveyor.moveTo(x, beltY);
      ctxConveyor.lineTo(x, beltY + beltH);
      ctxConveyor.stroke();
    }

    // Rollers
    drawRoller(ctxConveyor, 18, beltY + beltH / 2, 11);
    drawRoller(ctxConveyor, w - 18, beltY + beltH / 2, 11);

    // Quarantine Isolation Bin (Right under Air Jet)
    const binX = jetX - 35;
    const binY = beltY + beltH + 16;
    const binW = 100;
    const binH = h - binY - 12;

    if (binH > 20) {
      // Funnel chute
      ctxConveyor.beginPath();
      ctxConveyor.moveTo(jetX - 25, beltY + beltH);
      ctxConveyor.lineTo(binX, binY);
      ctxConveyor.lineTo(binX + binW, binY);
      ctxConveyor.lineTo(jetX + 65, beltY + beltH);
      ctxConveyor.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctxConveyor.fill();
      ctxConveyor.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctxConveyor.stroke();

      // Bin Body
      ctxConveyor.fillStyle = '#0f172a';
      ctxConveyor.fillRect(binX, binY, binW, binH);
      ctxConveyor.lineWidth = 1.5;
      ctxConveyor.strokeStyle = '#ef4444';
      ctxConveyor.strokeRect(binX, binY, binW, binH);

      // Hazard stripes on rim
      drawHazardStripes(ctxConveyor, binX, binY, binW, 6);

      ctxConveyor.fillStyle = '#ef4444';
      ctxConveyor.font = 'bold 9px JetBrains Mono';
      ctxConveyor.fillText('QUARANTINE BIN', binX + 12, binY + 20);
    }

    // Draw Food Items on Belt
    STATE.foodItems.forEach(item => item.draw(ctxConveyor));

    // Overhead HSI Camera (scanZoneX)
    const camY = 16;
    const camW = 72;
    const camH = 38;

    // UV-A Optical Cone Beam
    const isScanning = STATE.foodItems.some(it => it.isScanning);
    const gradCone = ctxConveyor.createLinearGradient(scanZoneX, camY + camH, scanZoneX, beltY);
    if (isScanning) {
      gradCone.addColorStop(0, 'rgba(192, 132, 252, 0.65)');
      gradCone.addColorStop(0.5, 'rgba(56, 189, 248, 0.22)');
      gradCone.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    } else {
      gradCone.addColorStop(0, 'rgba(192, 132, 252, 0.22)');
      gradCone.addColorStop(1, 'rgba(192, 132, 252, 0.01)');
    }

    ctxConveyor.beginPath();
    ctxConveyor.moveTo(scanZoneX - 16, camY + camH);
    ctxConveyor.lineTo(scanZoneX - 56, beltY);
    ctxConveyor.lineTo(scanZoneX + 56, beltY);
    ctxConveyor.lineTo(scanZoneX + 16, camY + camH);
    ctxConveyor.closePath();
    ctxConveyor.fillStyle = gradCone;
    ctxConveyor.fill();

    // Laser sweep
    if (isScanning) {
      const sweepX = scanZoneX - 35 + ((Date.now() / 6) % 70);
      ctxConveyor.beginPath();
      ctxConveyor.moveTo(sweepX, camY + camH);
      ctxConveyor.lineTo(sweepX, beltY);
      ctxConveyor.strokeStyle = '#38bdf8';
      ctxConveyor.lineWidth = 2.2;
      ctxConveyor.shadowColor = '#38bdf8';
      ctxConveyor.shadowBlur = 10;
      ctxConveyor.stroke();
      ctxConveyor.shadowBlur = 0;
    }

    // Camera Enclosure
    ctxConveyor.fillStyle = '#0f172a';
    ctxConveyor.strokeStyle = '#38bdf8';
    ctxConveyor.lineWidth = 1.2;
    ctxConveyor.fillRect(scanZoneX - camW / 2, camY, camW, camH);
    ctxConveyor.strokeRect(scanZoneX - camW / 2, camY, camW, camH);

    // Lens Barrel
    ctxConveyor.fillStyle = '#1e293b';
    ctxConveyor.fillRect(scanZoneX - 16, camY + camH, 32, 10);
    ctxConveyor.fillStyle = '#38bdf8';
    ctxConveyor.fillRect(scanZoneX - 10, camY + camH + 10, 20, 3);

    // UV Emitter LEDs
    ctxConveyor.fillStyle = '#c084fc';
    ctxConveyor.beginPath();
    ctxConveyor.arc(scanZoneX - 24, camY + camH - 6, 3, 0, Math.PI * 2);
    ctxConveyor.arc(scanZoneX + 24, camY + camH - 6, 3, 0, Math.PI * 2);
    ctxConveyor.fill();

    ctxConveyor.fillStyle = '#ffffff';
    ctxConveyor.font = 'bold 8px JetBrains Mono';
    ctxConveyor.fillText('HSI VNIR', scanZoneX - 18, camY + 16);
    ctxConveyor.fillStyle = '#38bdf8';
    ctxConveyor.font = '7px JetBrains Mono';
    ctxConveyor.fillText('+ UV-A 365nm', scanZoneX - 22, camY + 28);

    // Pneumatic Air Jet Nozzle (jetX, jetY)
    ctxConveyor.fillStyle = '#1e293b';
    ctxConveyor.fillRect(jetX - 10, jetY, 20, 36);
    ctxConveyor.strokeStyle = STATE.airJetActive ? '#38bdf8' : '#64748b';
    ctxConveyor.lineWidth = STATE.airJetActive ? 2 : 1.2;
    ctxConveyor.strokeRect(jetX - 10, jetY, 20, 36);

    // Nozzle tip
    ctxConveyor.beginPath();
    ctxConveyor.moveTo(jetX - 5, jetY + 36);
    ctxConveyor.lineTo(jetX - 2, jetY + 48);
    ctxConveyor.lineTo(jetX + 2, jetY + 48);
    ctxConveyor.lineTo(jetX + 5, jetY + 36);
    ctxConveyor.fillStyle = '#475569';
    ctxConveyor.fill();

    // Air hose
    ctxConveyor.beginPath();
    ctxConveyor.moveTo(jetX, 0);
    ctxConveyor.lineTo(jetX, jetY);
    ctxConveyor.strokeStyle = '#38bdf8';
    ctxConveyor.lineWidth = 2.5;
    ctxConveyor.stroke();

    ctxConveyor.fillStyle = STATE.airJetActive ? '#38bdf8' : '#94a3b8';
    ctxConveyor.font = 'bold 7px JetBrains Mono';
    ctxConveyor.fillText('AIR JET', jetX - 14, jetY - 4);

    // Air blast shockwave ring when active
    if (STATE.airJetActive) {
      ctxConveyor.save();
      ctxConveyor.beginPath();
      ctxConveyor.arc(jetX, jetY + 55, 30, 0, Math.PI * 2);
      ctxConveyor.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctxConveyor.lineWidth = 2;
      ctxConveyor.stroke();
      ctxConveyor.restore();
    }

    // Draw Air Particles
    STATE.particles.forEach(p => p.draw(ctxConveyor));
  }

  function drawRoller(ctx, cx, cy, radius) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
  }

  function drawHazardStripes(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.fillStyle = '#eab308';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#0f172a';
    for (let sx = x - 15; sx < x + w + 15; sx += 10) {
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.lineTo(sx + 6, y);
      ctx.lineTo(sx - 3, y + h);
      ctx.lineTo(sx - 9, y + h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // --- FINALIZE DECISION ---
  function finalizeItemDecision(item) {
    item.decision = item.targetDecision;
    STATE.currentDecision = item.decision;
    STATE.riskScore = item.anomalyScore;
    STATE.uncertainty = item.uncertaintyScore;

    updateDecisionUI(item.decision, item.anomalyScore, item.uncertaintyScore);
    soundMgr.playDecision(item.decision);

    STATE.stats.inspected++;
    if (item.decision === 'PASS') STATE.stats.pass++;
    else if (item.decision === 'DIVERT') STATE.stats.divert++;
    else if (item.decision === 'QUARANTINE') STATE.stats.quarantine++;

    DOM.cntTotal.textContent = STATE.stats.inspected;
    DOM.cntPass.textContent = STATE.stats.pass;
    DOM.cntDivert.textContent = STATE.stats.divert;
    DOM.cntQuarantine.textContent = STATE.stats.quarantine;

    if (item.decision === 'DIVERT' || item.decision === 'QUARANTINE') {
      STATE.labSampleId = 'TG-' + Math.floor(1000 + Math.random() * 9000);
      DOM.labSampleId.textContent = STATE.labSampleId;
      DOM.labResultText.textContent = 'Awaiting Culture/PCR';
      DOM.labFeedbackStatus.textContent = 'Product diverted to Quarantine Bin for lab confirmation.';
    } else {
      DOM.labResultText.textContent = 'Normal (No Isolation)';
      DOM.labFeedbackStatus.textContent = 'Clean baseline tissue passed to packaging line.';
    }
  }

  function updateDecisionUI(decision, score, uncertainty) {
    DOM.decPass.classList.remove('active');
    DOM.decDivert.classList.remove('active');
    DOM.decQuarantine.classList.remove('active');

    DOM.riskLevelBadge.className = 'risk-badge';
    DOM.metricAnomaly.textContent = score.toFixed(2);
    DOM.metricUncertainty.textContent = uncertainty.toFixed(2);

    if (decision === 'PASS') {
      DOM.decPass.classList.add('active');
      DOM.riskLevelBadge.classList.add('risk-low');
      DOM.riskLevelText.textContent = 'LOW RISK (NORMAL)';
      DOM.scanStateBadge.textContent = 'DECISION: PASS (PACKAGING)';
      DOM.scanStateBadge.style.color = '#10b981';
    } else if (decision === 'DIVERT') {
      DOM.decDivert.classList.add('active');
      DOM.riskLevelBadge.classList.add('risk-suspicious');
      DOM.riskLevelText.textContent = score > 0.7 ? 'HIGH RISK ANOMALY' : 'SUSPICIOUS SPOT';
      DOM.scanStateBadge.textContent = 'DECISION: DIVERT (AIR JET)';
      DOM.scanStateBadge.style.color = '#f59e0b';
    } else {
      DOM.decQuarantine.classList.add('active');
      DOM.riskLevelBadge.classList.add('risk-uncertain');
      DOM.riskLevelText.textContent = 'UNCERTAIN PATTERN';
      DOM.scanStateBadge.textContent = 'DECISION: QUARANTINE';
      DOM.scanStateBadge.style.color = '#eab308';
    }
  }

  // --- SPECTRAL GRAPH ---
  function renderSpectralGraph(item) {
    const w = DOM.spectralCanvas.width || 300;
    const h = DOM.spectralCanvas.height || 140;
    ctxSpectral.clearRect(0, 0, w, h);

    const padLeft = 32;
    const padRight = 14;
    const padTop = 15;
    const padBottom = 22;
    const graphW = w - padLeft - padRight;
    const graphH = h - padTop - padBottom;

    ctxSpectral.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctxSpectral.lineWidth = 1;

    ctxSpectral.fillStyle = '#64748b';
    ctxSpectral.font = '9px JetBrains Mono';
    ctxSpectral.textAlign = 'right';
    for (let i = 0; i <= 3; i++) {
      const yVal = (1.0 - i * 0.33).toFixed(1);
      const yPos = padTop + (graphH * (i / 3));
      ctxSpectral.beginPath();
      ctxSpectral.moveTo(padLeft, yPos);
      ctxSpectral.lineTo(w - padRight, yPos);
      ctxSpectral.stroke();
      ctxSpectral.fillText(yVal, padLeft - 4, yPos + 3);
    }

    ctxSpectral.textAlign = 'center';
    const wavelengths = [400, 550, 700, 850, 1000];
    wavelengths.forEach((wl, idx) => {
      const xPos = padLeft + (graphW * (idx / (wavelengths.length - 1)));
      ctxSpectral.beginPath();
      ctxSpectral.moveTo(xPos, padTop);
      ctxSpectral.lineTo(xPos, h - padBottom);
      ctxSpectral.stroke();
      ctxSpectral.fillText(wl + 'nm', xPos, h - padBottom + 13);
    });

    const pointsCount = 45;
    const normalPoints = [];
    const samplePoints = [];

    const isAnomaly = item && item.contamination !== 'none';
    const isUncertain = item && item.contamination === 'uncertain';
    const isHigh = item && item.contamination === 'high';

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const wl = 400 + t * 600;

      const baseIntensity = 0.25 + 0.55 * Math.sin(t * Math.PI * 0.9) - 0.12 * Math.sin(t * Math.PI * 2.8);
      const normY = Math.max(0.1, Math.min(0.95, baseIntensity));
      normalPoints.push({ x: padLeft + t * graphW, y: h - padBottom - normY * graphH });

      let sampleY = normY;
      if (isAnomaly) {
        if (isUncertain) {
          sampleY += 0.2 * Math.sin(t * Math.PI * 6.5) - 0.12 * Math.cos(t * Math.PI * 3.2);
        } else if (isHigh) {
          const delta = Math.exp(-Math.pow((wl - 580) / 75, 2)) * 0.38;
          sampleY = normY - delta;
        } else {
          const delta = Math.exp(-Math.pow((wl - 540) / 60, 2)) * 0.24;
          sampleY = normY - delta;
        }
      } else {
        sampleY += (Math.random() * 0.02 - 0.01);
      }
      sampleY = Math.max(0.08, Math.min(0.96, sampleY));
      samplePoints.push({ x: padLeft + t * graphW, y: h - padBottom - sampleY * graphH });
    }

    // Normal curve (blue)
    ctxSpectral.beginPath();
    normalPoints.forEach((pt, idx) => {
      if (idx === 0) ctxSpectral.moveTo(pt.x, pt.y);
      else ctxSpectral.lineTo(pt.x, pt.y);
    });
    ctxSpectral.strokeStyle = '#3b82f6';
    ctxSpectral.lineWidth = 2;
    ctxSpectral.stroke();

    // Sample curve (green/red)
    ctxSpectral.beginPath();
    samplePoints.forEach((pt, idx) => {
      if (idx === 0) ctxSpectral.moveTo(pt.x, pt.y);
      else ctxSpectral.lineTo(pt.x, pt.y);
    });
    ctxSpectral.strokeStyle = isAnomaly ? '#ef4444' : '#10b981';
    ctxSpectral.lineWidth = 2;
    ctxSpectral.stroke();

    // Fill deviation
    ctxSpectral.beginPath();
    normalPoints.forEach((pt, idx) => {
      if (idx === 0) ctxSpectral.moveTo(pt.x, pt.y);
      else ctxSpectral.lineTo(pt.x, pt.y);
    });
    for (let idx = samplePoints.length - 1; idx >= 0; idx--) {
      ctxSpectral.lineTo(samplePoints[idx].x, samplePoints[idx].y);
    }
    ctxSpectral.closePath();
    ctxSpectral.fillStyle = isAnomaly ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.08)';
    ctxSpectral.fill();

    if (!isAnomaly) {
      DOM.valDeviation.textContent = 'LOW (0.04)';
      DOM.valDeviation.className = 'text-green';
    } else if (isHigh) {
      DOM.valDeviation.textContent = 'HIGH (0.78)';
      DOM.valDeviation.className = 'text-red';
    } else if (isUncertain) {
      DOM.valDeviation.textContent = 'IRREGULAR (0.46)';
      DOM.valDeviation.className = 'text-yellow';
    } else {
      DOM.valDeviation.textContent = 'MODERATE (0.44)';
      DOM.valDeviation.className = 'text-orange';
    }
  }

  // --- HEATMAP ---
  function renderHeatmap(item) {
    const w = DOM.heatmapCanvas.width || 300;
    const h = DOM.heatmapCanvas.height || 140;
    ctxHeatmap.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const meatW = Math.min(160, w * 0.65);
    const meatH = Math.min(95, h * 0.7);

    ctxHeatmap.fillStyle = '#080d17';
    ctxHeatmap.fillRect(0, 0, w, h);

    ctxHeatmap.save();
    ctxHeatmap.beginPath();
    ctxHeatmap.moveTo(cx - meatW * 0.45, cy);
    ctxHeatmap.bezierCurveTo(cx - meatW * 0.48, cy - meatH * 0.45, cx - meatW * 0.1, cy - meatH * 0.5, cx + meatW * 0.2, cy - meatH * 0.42);
    ctxHeatmap.bezierCurveTo(cx + meatW * 0.48, cy - meatH * 0.35, cx + meatW * 0.5, cy, cx + meatW * 0.38, cy + meatH * 0.38);
    ctxHeatmap.bezierCurveTo(cx + meatW * 0.1, cy + meatH * 0.5, cx - meatW * 0.25, cy + meatH * 0.45, cx - meatW * 0.45, cy);
    ctxHeatmap.closePath();
    ctxHeatmap.clip();

    ctxHeatmap.fillStyle = 'rgba(16, 185, 129, 0.35)';
    ctxHeatmap.fillRect(0, 0, w, h);

    const isAnomaly = item && item.contamination !== 'none';
    if (isAnomaly) {
      let spotX = cx;
      let spotY = cy;

      if (item.location === 'top-right') {
        spotX = cx + meatW * 0.2;
        spotY = cy - meatH * 0.18;
        DOM.txtClusterLoc.textContent = 'Upper-Right Margin Anomaly';
      } else if (item.location === 'bottom-left') {
        spotX = cx - meatW * 0.22;
        spotY = cy + meatH * 0.18;
        DOM.txtClusterLoc.textContent = 'Lower-Left Margin Anomaly';
      } else {
        DOM.txtClusterLoc.textContent = 'Center Localized Anomaly';
      }

      const radius = item.contamination === 'high' ? 44 : (item.contamination === 'uncertain' ? 32 : 36);
      const color = item.contamination === 'high' ? '#ef4444' : (item.contamination === 'uncertain' ? '#eab308' : '#f59e0b');
      drawHeatmapSpot(ctxHeatmap, spotX, spotY, radius, color);
    } else {
      DOM.txtClusterLoc.textContent = 'Normal Baseline (No Anomaly)';
    }

    ctxHeatmap.restore();

    ctxHeatmap.beginPath();
    ctxHeatmap.moveTo(cx - meatW * 0.45, cy);
    ctxHeatmap.bezierCurveTo(cx - meatW * 0.48, cy - meatH * 0.45, cx - meatW * 0.1, cy - meatH * 0.5, cx + meatW * 0.2, cy - meatH * 0.42);
    ctxHeatmap.bezierCurveTo(cx + meatW * 0.48, cy - meatH * 0.35, cx + meatW * 0.5, cy, cx + meatW * 0.38, cy + meatH * 0.38);
    ctxHeatmap.bezierCurveTo(cx + meatW * 0.1, cy + meatH * 0.5, cx - meatW * 0.25, cy + meatH * 0.45, cx - meatW * 0.45, cy);
    ctxHeatmap.closePath();
    ctxHeatmap.strokeStyle = '#38bdf8';
    ctxHeatmap.lineWidth = 1.2;
    ctxHeatmap.stroke();
  }

  function drawHeatmapSpot(ctx, x, y, radius, colorHex) {
    const grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
    grad.addColorStop(0, colorHex);
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.7)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  DOM.heatmapCanvas.addEventListener('mousemove', (e) => {
    const rect = DOM.heatmapCanvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    DOM.tooltipCoord.textContent = `(${x}, ${y})`;
    if (STATE.currentDecision === 'PASS') {
      DOM.tooltipRisk.textContent = (Math.random() * 5 + 2).toFixed(1) + '%';
    } else {
      const dist = Math.hypot(x - DOM.heatmapCanvas.width / 2, y - DOM.heatmapCanvas.height / 2);
      if (dist < 40) {
        DOM.tooltipRisk.textContent = (Math.random() * 15 + 75).toFixed(1) + '%';
      } else {
        DOM.tooltipRisk.textContent = (Math.random() * 15 + 15).toFixed(1) + '%';
      }
    }
    DOM.heatmapTooltip.classList.remove('hidden');
  });

  DOM.heatmapCanvas.addEventListener('mouseleave', () => {
    DOM.heatmapTooltip.classList.add('hidden');
  });

  // --- TRIGGER SCAN & SCENARIOS ---
  function launchInspectionScan(contamination, location) {
    STATE.scanProgress = 0;
    DOM.spectralProgressBar.style.width = '0%';
    DOM.scanStateBadge.textContent = 'CONVEYING ITEM TO SCANNER...';
    DOM.scanStateBadge.style.color = '#38bdf8';

    // Remove old items that haven't reached scan yet
    STATE.foodItems = STATE.foodItems.filter(item => item.x > 260);

    const newItem = new FoodItem(
      STATE.foodType,
      contamination || STATE.contaminationType,
      location || STATE.contaminationLocation,
      -80
    );
    STATE.foodItems.push(newItem);
  }

  function applyScenario(scenarioKey) {
    DOM.scenarioButtons.forEach(btn => {
      if (btn.getAttribute('data-scenario') === scenarioKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (scenarioKey === 'clean') {
      STATE.contaminationType = 'none';
      launchInspectionScan('none', 'center');
    } else if (scenarioKey === 'suspicious') {
      STATE.contaminationType = 'localized';
      STATE.contaminationLocation = 'center';
      launchInspectionScan('localized', 'center');
    } else if (scenarioKey === 'high-risk') {
      STATE.contaminationType = 'high';
      STATE.contaminationLocation = 'top-right';
      launchInspectionScan('high', 'top-right');
    } else if (scenarioKey === 'uncertain') {
      STATE.contaminationType = 'uncertain';
      STATE.contaminationLocation = 'center';
      launchInspectionScan('uncertain', 'center');
    }
  }

  // --- LAB SIMULATION ---
  function handleLabConfirmation() {
    DOM.labResultText.textContent = 'PCR Assaying (8s)...';
    DOM.btnSimulateLab.disabled = true;

    setTimeout(() => {
      if (STATE.currentDecision === 'DIVERT') {
        DOM.labResultText.textContent = 'Confirmed Microbial Contamination';
        DOM.labResultText.className = 'text-red';
        DOM.labFeedbackStatus.innerHTML = `<strong>Model Update:</strong> Validated anomaly spectrum incorporated into TensorRT baseline.`;
      } else {
        DOM.labResultText.textContent = 'Confirmed Baseline Normal';
        DOM.labResultText.className = 'text-green';
        DOM.labFeedbackStatus.innerHTML = `<strong>Tolerance Adapted:</strong> Variance registered to baseline clustering.`;
      }
      DOM.btnSimulateLab.disabled = false;
    }, 1000);
  }

  // --- EVENT LISTENERS ---
  function initEventListeners() {
    DOM.selFoodType.addEventListener('change', (e) => { STATE.foodType = e.target.value; });

    DOM.rangeSpeed.addEventListener('input', (e) => {
      const spd = parseFloat(e.target.value);
      STATE.conveyorSpeed = spd;
      DOM.valSpeed.textContent = spd.toFixed(1) + ' m/s';
    });

    DOM.scenarioButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        applyScenario(btn.getAttribute('data-scenario'));
      });
    });

    DOM.btnStartScan.addEventListener('click', () => {
      launchInspectionScan();
    });

    DOM.btnAutoStream.addEventListener('click', () => {
      STATE.isContinuous = !STATE.isContinuous;
      if (STATE.isContinuous) {
        DOM.btnAutoStream.classList.add('active');
        DOM.txtAutoStream.textContent = 'Stop Feed';
      } else {
        DOM.btnAutoStream.classList.remove('active');
        DOM.txtAutoStream.textContent = 'Auto Feed';
      }
    });

    DOM.btnResetConveyor.addEventListener('click', () => {
      STATE.foodItems = [];
      STATE.particles = [];
      STATE.scanProgress = 0;
      DOM.spectralProgressBar.style.width = '0%';
      DOM.scanStateBadge.textContent = 'CONVEYOR IDLE';
      DOM.scanStateBadge.style.color = '#94a3b8';
    });

    DOM.btnSoundToggle.addEventListener('click', () => {
      soundMgr.enabled = !soundMgr.enabled;
      DOM.soundIcon.textContent = soundMgr.enabled ? '🔊' : '🔇';
    });

    DOM.btnSimulateLab.addEventListener('click', handleLabConfirmation);
  }

  function sanitizeFoodOptions() {
    const sel = document.getElementById('selFoodType');
    if (sel) {
      sel.innerHTML = `
        <option value="poultry" selected>Poultry (Chicken Breast Cut)</option>
        <option value="fish">Fish (Salmon Fillet)</option>
        <option value="produce">Fresh Produce (Greens)</option>
      `;
    }
  }

  function init() {
    sanitizeFoodOptions();
    initEventListeners();
    handleResize();

    const initialItem = new FoodItem('poultry', 'none', 'center', 40);
    STATE.foodItems.push(initialItem);

    requestAnimationFrame(simulationLoop);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
