/**
 * Valentine's Day Card for Sanam
 * A heartfelt interactive card with animations and celebration
 */

(function() {
  'use strict';

  // ============================================
  // Sound Manager - Web Audio API Synthesizer
  // ============================================
  const SoundManager = {
    ctx: null,
    isInitialized: false,

    init() {
      if (this.isInitialized) return;
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isInitialized = true;
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    },

    play(type) {
      if (!this.isInitialized || !this.ctx) return;

      const now = this.ctx.currentTime;
      const oscillator = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      switch (type) {
        case 'click':
          // Soft pop sound
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;

        case 'whoosh':
          // Card transition slide
          oscillator.frequency.setValueAtTime(200, now);
          oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;

        case 'dodge':
          // Quick whoosh for button escaping
          oscillator.frequency.setValueAtTime(600, now);
          oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
          gainNode.gain.setValueAtTime(0.12, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;

        case 'shrink':
          // Squish sound
          oscillator.frequency.setValueAtTime(400, now);
          oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;

        case 'tiny':
          // High-pitched eep
          oscillator.frequency.setValueAtTime(1200, now);
          oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.08);
          gainNode.gain.setValueAtTime(0.08, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          oscillator.start(now);
          oscillator.stop(now + 0.08);
          break;

        case 'poof':
          // Magic disappear sound
          oscillator.frequency.setValueAtTime(1000, now);
          oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;

        case 'tick':
          // Score counting tick
          oscillator.frequency.setValueAtTime(1000, now);
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
          oscillator.start(now);
          oscillator.stop(now + 0.03);
          break;

        case 'confetti':
          // Pop explosion
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2);
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;

        case 'victory':
          // Triumphant ding
          oscillator.frequency.setValueAtTime(1200, now);
          oscillator.frequency.setValueAtTime(1600, now + 0.05);
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          oscillator.start(now);
          oscillator.stop(now + 0.5);
          break;

        case 'fireworks':
          // Play fireworks audio file
          if (!this.fireworksAudio) {
            this.fireworksAudio = new Audio('fireworks.mp3');
            this.fireworksAudio.preload = 'auto';
          }
          this.fireworksAudio.currentTime = 0;
          this.fireworksAudio.volume = 0.6;
          this.fireworksAudio.play().catch(() => {});
          return; // Don't use oscillator for this one

        case 'chime':
          // Positive feedback chime
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.setValueAtTime(1200, now + 0.08);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
      }
    }
  };

  // ============================================
  // Canvas Fireworks Manager
  // ============================================
  const FireworksManager = {
    canvas: null,
    ctx: null,
    particles: [],
    rockets: [],
    isRunning: false,
    animationId: null,

    init() {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'fireworksCanvas';
        document.body.appendChild(this.canvas);
      }
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    },

    start() {
      if (this.isRunning) return;
      this.init();
      this.isRunning = true;
      this.particles = [];
      this.rockets = [];

      // Launch fireworks in 3 waves
      this.launchWave(0);
      setTimeout(() => this.launchWave(1), 1500);
      setTimeout(() => this.launchWave(2), 3000);

      this.animate();

      // Stop after 5 seconds
      setTimeout(() => this.stop(), 5000);
    },

    launchWave(waveNum) {
      const rocketCount = waveNum === 0 ? 5 : waveNum === 1 ? 4 : 3;
      for (let i = 0; i < rocketCount; i++) {
        setTimeout(() => {
          this.launchRocket();
        }, i * 200);
      }
    },

    launchRocket() {
      const rocket = {
        x: Math.random() * this.canvas.width * 0.6 + this.canvas.width * 0.2,
        y: this.canvas.height,
        targetY: Math.random() * this.canvas.height * 0.3 + this.canvas.height * 0.1,
        speed: 8 + Math.random() * 4,
        trail: [],
        color: this.getRandomColor()
      };
      this.rockets.push(rocket);
    },

    getRandomColor() {
      const colors = ['#FF1493', '#FFD700', '#FF69B4', '#FFFFFF', '#FF85C1', '#FFC0CB'];
      return colors[Math.floor(Math.random() * colors.length)];
    },

    explode(x, y, color) {
      const particleCount = 40 + Math.floor(Math.random() * 20);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.2;
        const speed = 2 + Math.random() * 4;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color, alpha: 1,
          size: 2 + Math.random() * 2,
          decay: 0.015 + Math.random() * 0.01,
          trail: []
        });
      }
      // Add sparkles
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: '#FFFFFF', alpha: 1,
          size: 1,
          decay: 0.03 + Math.random() * 0.02,
          trail: []
        });
      }
    },

    animate() {
      if (!this.isRunning) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Update rockets
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const rocket = this.rockets[i];
        rocket.y -= rocket.speed;
        rocket.trail.push({ x: rocket.x, y: rocket.y });
        if (rocket.trail.length > 10) rocket.trail.shift();

        // Draw trail
        for (let j = 0; j < rocket.trail.length; j++) {
          const t = rocket.trail[j];
          const alpha = j / rocket.trail.length * 0.5;
          this.ctx.beginPath();
          this.ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          this.ctx.fill();
        }

        // Draw rocket
        this.ctx.beginPath();
        this.ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = rocket.color;
        this.ctx.fill();

        if (rocket.y <= rocket.targetY) {
          this.explode(rocket.x, rocket.y, rocket.color);
          this.rockets.splice(i, 1);
        }
      }

      // Update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity
        p.alpha -= p.decay;

        p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
        if (p.trail.length > 5) p.trail.shift();

        // Draw trail
        for (let j = 0; j < p.trail.length; j++) {
          const t = p.trail[j];
          this.ctx.beginPath();
          this.ctx.arc(t.x, t.y, p.size * 0.5, 0, Math.PI * 2);
          this.ctx.fillStyle = this.colorWithAlpha(p.color, t.alpha * 0.3);
          this.ctx.fill();
        }

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colorWithAlpha(p.color, p.alpha);
        this.ctx.fill();

        if (p.alpha <= 0) this.particles.splice(i, 1);
      }

      this.animationId = requestAnimationFrame(() => this.animate());
    },

    colorWithAlpha(color, alpha) {
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${Math.max(0, alpha)})`;
      }
      return color;
    },

    stop() {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.ctx) {
        setTimeout(() => {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }, 500);
      }
    }
  };

  // ============================================
  // Quiz State
  // ============================================
  const quizState = {
    currentCardIndex: 0,
    isComplete: false,
    isTransitioning: false
  };

  // ============================================
  // Questions Data
  // ============================================
  // Counter for "No" clicks on the Valentine question card
  let valentineNoCount = 0;

  const questions = [
    // Card 0: Greeting
    {
      id: 0,
      type: 'greeting',
      question: "Happy Valentine's Day, Sanam.",
      subtext: "I made this for you.\nBecause I couldn't be there in person.\n\nSo here's the next best thing.",
      options: [
        { label: "Okay, show me", behavior: 'normal' }
      ]
    },

    // Card 1: Why I'm not there
    {
      id: 1,
      type: 'valentine',
      question: "So... why am I not with you today?",
      subtext: "My 5 brothers and I rarely all get together.\nLike, almost never.\n\nAnd when the chance came up for all of us to go on a trip together... I couldn't say no.\n\nFamily is family.\n\nBut I wish you were here too.",
      options: [
        { label: "I get it ❤️", behavior: 'normal' }
      ]
    },

    // Card 2: Transition
    {
      id: 2,
      type: 'valentine',
      question: "But while I'm away...",
      subtext: "I want to tell you some things I like about you.\n\nAnd explain a few things too.\n\nSo keep scrolling.",
      options: [
        { label: "I'm listening", behavior: 'normal' }
      ]
    },

    // Card 3
    {
      id: 3,
      type: 'valentine',
      question: "Your curiosity.",
      subtext: "You ask the silliest, loveliest questions.\n\nYou're curious about life, about past experiences, about everything.\n\nIt amuses me. You're full of energy and love of life.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 4
    {
      id: 4,
      type: 'valentine',
      question: "Your voice.",
      subtext: "The way you sing with your lovely voice while listening to music.\n\nWhile you hug me.\n\nLove listening to that.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 5
    {
      id: 5,
      type: 'valentine',
      question: "Your hands.",
      subtext: "There's energy in your fingers when you pet my hair like I'm a cat.\n\nYou could stop my headache just like that.\n\nThat means a lot.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 6
    {
      id: 6,
      type: 'valentine',
      question: "Your eyes.",
      subtext: "When you look at me while you are fully mine.\n\nI see lots of passion in you. It's very attractive.\n\nI want to make you feel like that all the time.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 7
    {
      id: 7,
      type: 'valentine',
      question: "You look lovely.",
      subtext: "When we're out, I'm proud of you.\n\nYou look lovely and you know how to be classy.\n\nI don't always fill you with compliments but I notice. Every time.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 8
    {
      id: 8,
      type: 'valentine',
      question: "You calm me down.",
      subtext: "I feel calm and relaxed when I hug you.\n\nSleeping next to you will be easy.\n\nAnd I hate sleeping with people.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 9
    {
      id: 9,
      type: 'valentine',
      question: "I'm a bully.",
      subtext: "I'm rude and I make questionable jokes.\n\nBecause I don't want to hide who I am.\n\nI love bullying you. But it's my weird way to show love.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 10
    {
      id: 10,
      type: 'valentine',
      question: "I just know.",
      subtext: "We haven't spent lots of time together.\n\nBut I know when a person feels like yours.\n\nYou're my baby.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 11
    {
      id: 11,
      type: 'valentine',
      question: "About the future.",
      subtext: "We might have different plans.\nYou want to study and live in China.\n\nI'll respect and support your choices.\n\nBut it doesn't matter how long we'll be together — I want to use every day to make this as happy for us as possible.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 12
    {
      id: 12,
      type: 'valentine',
      question: "Your coffee skin.",
      subtext: "I love your coffee skin.\n\nAnd the way you taste.",
      options: [
        { label: "Next card", behavior: 'normal' }
      ]
    },

    // Card 13: Will you be my Valentine?
    {
      id: 13,
      type: 'valentine',
      question: "Will you be my Valentine, Baby Sanam?",
      subtext: null,
      options: [
        { label: "Yes ❤️", behavior: 'normal' },
        { label: "No", behavior: 'valentine-no' }
      ]
    },

    // Card 14: Victory (Dyson reveal)
    {
      id: 14,
      type: 'victory',
      question: "Good Girl!",
      subtext: null,
      options: []
    }
  ];

  // ============================================
  // F1 Race Start Intro
  // ============================================
  const F1Intro = {
    lights: [],
    isRunning: false,
    f1Audio: null,

    init() {
      this.lights = [
        document.getElementById('light1'),
        document.getElementById('light2'),
        document.getElementById('light3'),
        document.getElementById('light4'),
        document.getElementById('light5')
      ];
      this.intro = document.getElementById('f1Intro');
      this.message = document.getElementById('f1Message');
      this.rules = document.getElementById('f1Rules');
      this.startBtn = document.getElementById('f1StartBtn');
      this.content = document.querySelector('.f1-content');
      this.speedLines = document.querySelector('.f1-speed-lines');

      // Preload F1 engine sounds
      this.f1Audio = new Audio('f1-sound.mp3');
      this.f1Audio.preload = 'auto';

      this.engineStartAudio = new Audio('engine-start.mp3');
      this.engineStartAudio.preload = 'auto';
    },

    async run() {
      this.isRunning = true;
      SoundManager.init();

      // Run light sequence (each light 1s apart)
      await this.runLightSequence();

      // Random delay before lights out (0.5-1.5s like real F1)
      const randomDelay = 500 + Math.random() * 1000;
      await this.delay(randomDelay);

      // Lights out!
      await this.lightsOut();
    },

    async runLightSequence() {
      for (let i = 0; i < this.lights.length; i++) {
        await this.delay(1000);
        this.lights[i].classList.add('on');
        this.playLightSound();
      }
    },

    async lightsOut() {
      // Turn all lights off at once
      this.lights.forEach(light => light.classList.remove('on'));

      // Activate speed lines
      this.speedLines.classList.add('active');

      // Show content area
      this.content.classList.add('visible');

      // Show "LIGHTS OUT AND AWAY WE GO!" message with F1 starting sound
      await this.delay(100);
      this.playStartSound();
      this.message.classList.add('visible');

      // Show rules after message
      await this.delay(700);
      this.rules.classList.add('visible');

      // Show start button
      await this.delay(700);
      this.startBtn.classList.add('visible');

      // Setup start button click handler
      this.startBtn.addEventListener('click', () => this.startQuiz());
    },

    playLightSound() {
      // Short beep using existing sound manager infrastructure
      if (!SoundManager.ctx || !SoundManager.isInitialized) return;

      const now = SoundManager.ctx.currentTime;
      const oscillator = SoundManager.ctx.createOscillator();
      const gainNode = SoundManager.ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(SoundManager.ctx.destination);

      // F1-style beep tone
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    },

    playStartSound() {
      // Play real F1 engine sound at lights out
      if (this.f1Audio) {
        this.f1Audio.currentTime = 0;
        this.f1Audio.volume = 0.7;
        this.f1Audio.play().catch(() => {});
      }
    },

    // F1 Engine Sound: Low rumbling idle (60-80Hz with tremolo)
    playEngineIdle() {
      if (!SoundManager.ctx || !SoundManager.isInitialized) return;

      const ctx = SoundManager.ctx;
      const now = ctx.currentTime;

      // Create base oscillator for engine rumble
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const lfo = ctx.createOscillator(); // For tremolo effect
      const lfoGain = ctx.createGain();

      // LFO modulates gain for tremolo
      lfo.frequency.setValueAtTime(8, now); // 8Hz tremolo
      lfoGain.gain.setValueAtTime(0.03, now);
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);

      // Main oscillator - low rumble
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(70, now);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Fade in, sustain quietly
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.5);

      osc.start(now);
      lfo.start(now);

      // Store reference to stop later
      this.idleOsc = osc;
      this.idleLfo = lfo;
      this.idleGain = gainNode;
    },

    stopEngineIdle() {
      if (!SoundManager.ctx || !SoundManager.isInitialized) return;
      const now = SoundManager.ctx.currentTime;

      if (this.idleGain) {
        this.idleGain.gain.linearRampToValueAtTime(0, now + 0.3);
      }
      if (this.idleOsc) {
        this.idleOsc.stop(now + 0.35);
        this.idleOsc = null;
      }
      if (this.idleLfo) {
        this.idleLfo.stop(now + 0.35);
        this.idleLfo = null;
      }
    },

    // F1 Engine Rev: Rising frequency sweep at lights out
    playEngineRev() {
      if (!SoundManager.ctx || !SoundManager.isInitialized) return;

      const ctx = SoundManager.ctx;
      const now = ctx.currentTime;

      // Main rev oscillator
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.6);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc.start(now);
      osc.stop(now + 0.8);

      // Add noise for texture
      this.playEngineNoise(0.6);
    },

    // F1 Vroom: Quick acceleration sound on START click
    playVroom() {
      if (!SoundManager.ctx || !SoundManager.isInitialized) return;

      const ctx = SoundManager.ctx;
      const now = ctx.currentTime;

      // Primary vroom oscillator
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      // Quick rise: 200Hz → 800Hz → settle at 400Hz
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.5);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);

      // Add noise burst
      this.playEngineNoise(0.3);
    },

    // Helper: Engine noise texture
    playEngineNoise(duration) {
      if (!SoundManager.ctx || !SoundManager.isInitialized) return;

      const ctx = SoundManager.ctx;
      const now = ctx.currentTime;

      // Create noise buffer
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noise.start(now);
      noise.stop(now + duration);
    },

    startQuiz() {
      // Fade out F1 sound smoothly
      if (this.f1Audio && !this.f1Audio.paused) {
        const fadeOut = setInterval(() => {
          if (this.f1Audio.volume > 0.1) {
            this.f1Audio.volume -= 0.1;
          } else {
            this.f1Audio.pause();
            clearInterval(fadeOut);
          }
        }, 50);
      }

      // Play engine start sound
      if (this.engineStartAudio) {
        this.engineStartAudio.currentTime = 0;
        this.engineStartAudio.volume = 0.8;
        this.engineStartAudio.play().catch(() => {});
      }

      // Fade out intro
      this.intro.classList.add('hidden');

      // Show progress indicator
      const progress = document.querySelector('.progress');
      if (progress) {
        progress.style.animation = 'fadeSlideIn 0.5s ease forwards 0.3s';
      }

      // Show first card after fade
      setTimeout(() => {
        showCard(0);
        this.isRunning = false;
      }, 500);
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  };

  // ============================================
  // DOM References
  // ============================================
  let cardContainer;
  let progressNumber;

  // ============================================
  // Initialization
  // ============================================
  function init() {
    cardContainer = document.getElementById('cardContainer');
    progressNumber = document.querySelector('.lap-number');

    // Hide progress indicator initially (F1 intro will show it)
    const progress = document.querySelector('.progress');
    if (progress) {
      progress.style.opacity = '0';
      progress.style.animation = 'none';
    }

    // Initialize F1 intro (but don't run yet)
    F1Intro.init();

    // Wait for click overlay to enable audio
    const clickOverlay = document.getElementById('clickOverlay');
    if (clickOverlay) {
      clickOverlay.addEventListener('click', () => {
        // Initialize audio on user interaction
        SoundManager.init();

        // Hide overlay
        clickOverlay.classList.add('hidden');

        // Now run F1 intro with audio enabled
        F1Intro.run();
      });
    }

    // Event delegation for button clicks
    cardContainer.addEventListener('click', handleClick);
  }

  // ============================================
  // Card Rendering
  // ============================================
  function renderCard(cardData) {
    // Special rendering for victory (fullscreen celebration)
    if (cardData.type === 'victory') {
      return renderVictoryScreen(cardData);
    }

    const card = document.createElement('div');
    // Add type-specific class for special styling
    const typeClass = cardData.type === 'greeting' ? 'greeting' :
                      cardData.type === 'valentine' ? 'valentine' : '';
    card.className = `card ${typeClass}`.trim();
    card.dataset.cardId = cardData.id;

    let content = `<div class="question">${cardData.question}</div>`;

    if (cardData.subtext) {
      content += `<div class="subtext">${cardData.subtext}</div>`;
    }

    // Options
    if (cardData.options && cardData.options.length > 0) {
      content += '<div class="options">';
      cardData.options.forEach((option, index) => {
        const isDisabled = option.behavior === 'disabled' ? 'disabled' : '';
        content += `
          <button class="btn" ${isDisabled} data-option-index="${index}">
            ${option.label}
          </button>
        `;
      });
      content += '</div>';
    }

    card.innerHTML = content;
    return card;
  }

  // Render recap as fullscreen (no card box)
  function renderRecapScreen(cardData) {
    const screen = document.createElement('div');
    screen.className = 'recap-screen';
    screen.dataset.cardId = cardData.id;

    // Title
    const title = document.createElement('div');
    title.className = 'recap-title';
    title.textContent = cardData.question;
    screen.appendChild(title);

    // List items (parse from subtext)
    const listContainer = document.createElement('div');
    listContainer.className = 'recap-list';
    const lines = cardData.subtext.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        const item = document.createElement('div');
        item.className = line.startsWith('✓') ? 'recap-item' : 'recap-note';
        item.textContent = line;
        listContainer.appendChild(item);
      }
    });
    screen.appendChild(listContainer);

    // Options
    if (cardData.options && cardData.options.length > 0) {
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'recap-options';
      cardData.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.dataset.optionIndex = index;
        btn.textContent = option.label;
        optionsDiv.appendChild(btn);
      });
      screen.appendChild(optionsDiv);
    }

    return screen;
  }

  // Render victory as fullscreen celebration
  function renderVictoryScreen(cardData) {
    const screen = document.createElement('div');
    screen.className = 'victory-screen';
    screen.dataset.cardId = cardData.id;

    // Main title - "Good Girl!"
    const title = document.createElement('div');
    title.className = 'victory-title';
    title.textContent = cardData.question;
    screen.appendChild(title);

    // Dyson image
    const img = document.createElement('img');
    img.src = 'dyson.webp';
    img.alt = 'Dyson';
    img.className = 'victory-image';
    screen.appendChild(img);

    // Message
    const message = document.createElement('div');
    message.className = 'victory-welcome';
    message.textContent = 'You won Dyson.';
    screen.appendChild(message);

    return screen;
  }

  function showCard(index) {
    if (quizState.isTransitioning) return;

    const cardData = questions[index];
    if (!cardData) return;

    quizState.currentCardIndex = index;
    updateProgress();

    const card = renderCard(cardData);
    cardContainer.appendChild(card);

    // Trigger animation
    requestAnimationFrame(() => {
      // Victory screen doesn't use .card class
      if (cardData.type === 'victory') {
        // Already has fade-in animation via CSS
        SoundManager.play('whoosh');
      } else {
        card.classList.add('active', 'entering');
        SoundManager.play('whoosh');
      }

      // Spawn confetti and fireworks for victory
      if (cardData.type === 'victory') {
        // Screen shake effect
        document.body.classList.add('victory-shake');
        setTimeout(() => document.body.classList.remove('victory-shake'), 500);

        setTimeout(() => {
          SoundManager.play('victory');
          SoundManager.play('fireworks');
          FireworksManager.start();
          spawnConfetti();
        }, 300);
      }
    });

    // Remove entering class after animation (not for victory screen)
    if (cardData.type !== 'victory') {
      setTimeout(() => {
        card.classList.remove('entering');
      }, 700);
    }
  }

  function hideCard(callback) {
    const currentCard = cardContainer.querySelector('.card.active');
    if (!currentCard) {
      if (callback) callback();
      return;
    }

    quizState.isTransitioning = true;
    currentCard.classList.remove('active');
    currentCard.classList.add('exiting');

    setTimeout(() => {
      currentCard.remove();
      quizState.isTransitioning = false;
      if (callback) callback();
    }, 500);
  }

  // ============================================
  // Navigation & Interaction
  // ============================================
  function handleClick(e) {
    const btn = e.target.closest('.btn');
    if (!btn || btn.disabled) return;

    // Skip if it's the Next button (handled separately)
    if (btn.classList.contains('next-btn')) return;

    // Initialize sound on first interaction
    SoundManager.init();

    // Play click sound
    SoundManager.play('click');

    // Create ripple effect
    createRipple(e, btn);

    const optionIndex = parseInt(btn.dataset.optionIndex);
    const cardData = questions[quizState.currentCardIndex];
    const option = cardData.options[optionIndex];

    // Skip if option not found
    if (!option) return;

    // Mark button as selected
    markButtonSelected(btn);

    // Handle "No" on the Valentine question card
    if (option.behavior === 'valentine-no') {
      const jokes = [
        "I know you don't mean that. Try again.",
        "Girl, you scrolled through all of this. We both know the answer.",
        "I'll wait.",
        "You're running out of excuses, Sanam.",
        "Fine. But the Dyson won't wait forever."
      ];
      const jokeIndex = Math.min(valentineNoCount, jokes.length - 1);
      const joke = valentineNoCount >= jokes.length ? "Just click Yes already." : jokes[jokeIndex];
      valentineNoCount++;
      showFeedback(joke);
      // Reset button states so she can click again
      const currentCard = cardContainer.querySelector('.card.active');
      if (currentCard) {
        currentCard.querySelectorAll('.btn:not(.next-btn)').forEach(b => {
          b.classList.remove('selected', 'not-selected');
        });
      }
      return;
    }

    // Handle disabled button (show feedback only)
    if (option.behavior === 'disabled') {
      showFeedback(option.feedback);
      showNextButton();
      return;
    }

    // Show feedback if exists
    if (option.feedback) {
      showFeedback(option.feedback);
      showNextButton();
      return;
    }

    // Advance to next card
    advanceToNextCard();
  }

  function markButtonSelected(selectedBtn) {
    const currentCard = cardContainer.querySelector('.card.active');
    if (!currentCard) return;

    // Clear existing feedback when selecting a new option
    const existingFeedback = currentCard.querySelector('.feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Get all option buttons (not next-btn)
    const allBtns = currentCard.querySelectorAll('.btn:not(.next-btn)');

    allBtns.forEach(btn => {
      if (btn === selectedBtn) {
        btn.classList.add('selected');
        btn.classList.remove('not-selected');
      } else {
        btn.classList.add('not-selected');
        btn.classList.remove('selected');
      }
    });
  }

  function showNextButton() {
    const currentCard = cardContainer.querySelector('.card.active');
    if (!currentCard) return;

    // Don't show if already exists
    if (currentCard.querySelector('.next-btn')) return;

    // Don't show on victory card
    if (quizState.currentCardIndex >= questions.length - 1) return;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn next-btn';
    nextBtn.textContent = '→';
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundManager.play('click');
      advanceToNextCard();
    });

    // Append to card (not options) for absolute positioning
    currentCard.appendChild(nextBtn);
  }

  function advanceToNextCard() {
    const nextIndex = quizState.currentCardIndex + 1;
    if (nextIndex >= questions.length) return;

    hideCard(() => {
      showCard(nextIndex);
    });
  }

  function updateProgress() {
    const totalCards = questions.length;
    const displayIndex = Math.min(quizState.currentCardIndex + 1, totalCards);
    if (progressNumber) {
      progressNumber.textContent = displayIndex;
    }

    // Update total count
    const lapTotal = document.querySelector('.lap-total');
    if (lapTotal) {
      lapTotal.textContent = totalCards;
    }

    // Hide progress on victory (last card)
    const progress = document.querySelector('.progress');
    if (progress) {
      progress.style.opacity = quizState.currentCardIndex >= totalCards - 1 ? '0' : '1';
    }
  }

  // ============================================
  // Ripple Effect
  // ============================================
  function createRipple(event, button) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    // Handle touch events (clientX/Y is undefined on touch)
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;

    const x = clientX - rect.left - size / 2;
    const y = clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    // Remove after animation
    setTimeout(() => ripple.remove(), 600);
  }

  // ============================================
  // Feedback System
  // ============================================
  function showFeedback(message) {
    // Play feedback chime
    SoundManager.play('chime');

    // Remove existing feedback
    const existingFeedback = cardContainer.querySelector('.feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.textContent = message;

    const currentCard = cardContainer.querySelector('.card.active');
    if (currentCard) {
      currentCard.appendChild(feedback);
    }
  }

  // ============================================
  // Premium Confetti System
  // ============================================
  function spawnConfetti() {
    SoundManager.play('confetti');

    const colors = ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#FFD700', '#ffffff'];
    const shapes = ['square', 'circle', 'heart', 'star'];
    const confettiCount = 80;

    // Wave 1 - Initial burst
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        createConfettiPiece(colors, shapes);
      }, i * 30);
    }

    // Wave 2 - Follow up
    setTimeout(() => {
      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          createConfettiPiece(colors, shapes);
        }, i * 40);
      }
    }, 1500);

    // Wave 3 - Final celebration
    setTimeout(() => {
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          createConfettiPiece(colors, shapes);
        }, i * 50);
      }
    }, 3000);
  }

  function createConfettiPiece(colors, shapes) {
    const confetti = document.createElement('div');
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    confetti.className = `confetti ${shape}`;

    // Set CSS custom properties for animation variety
    confetti.style.setProperty('--color', color);
    confetti.style.setProperty('--size', (Math.random() * 12 + 8) + 'px');
    confetti.style.setProperty('--duration', (Math.random() * 2 + 2.5) + 's');
    confetti.style.setProperty('--rotation', (Math.random() * 1080 + 360) + 'deg');
    confetti.style.setProperty('--sway', (Math.random() - 0.5) * 200 + 'px');

    // Position
    confetti.style.left = Math.random() * 100 + 'vw';

    // Add content for heart and star shapes
    if (shape === 'heart') {
      confetti.textContent = '♥';
    } else if (shape === 'star') {
      confetti.textContent = '★';
    }

    document.body.appendChild(confetti);

    // Cleanup after animation
    const duration = parseFloat(confetti.style.getPropertyValue('--duration')) * 1000;
    setTimeout(() => confetti.remove(), duration + 500);
  }

  // ============================================
  // Start the quiz when DOM is ready
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
