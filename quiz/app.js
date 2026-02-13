/**
 * Girlfriend Quiz App
 * A fun, interactive quiz to ask Sanam to be my girlfriend
 * Features: 15 questions, misbehaving No button, compatibility score, premium confetti
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

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
    noButtonAttempts: 0,
    isComplete: false,
    score: (94 + Math.random() * 4).toFixed(1), // Random 94-98%
    isTransitioning: false
  };

  // ============================================
  // Questions Data
  // ============================================
  const questions = [
    // Card 0: Greeting
    {
      id: 0,
      type: 'greeting',
      question: "Greetings, Miss Sanam.",
      subtext: "You've been selected for a very important compatibility assessment.\n\n(You cannot decline. I already know where you live.)",
      options: [
        { label: "Proceed with caution", behavior: 'normal' },
        { label: "Call the police", behavior: 'disabled', feedback: "Nice try." }
      ]
    },

    // Card 1: Setup
    {
      id: 1,
      type: 'question',
      question: "Just a few clarifying questions.",
      subtext: "This will be fun.\n(For me. Unclear about you.)",
      options: [
        { label: "I'm scared", behavior: 'normal' },
        { label: "Get on with it", behavior: 'normal' },
        { label: "Is this legally binding?", behavior: 'normal', feedback: "We'll see." }
      ]
    },

    // Card 2: Memory Pitch
    {
      id: 2,
      type: 'question',
      question: "Do you want your life to be less boring, more exciting?",
      subtext: "Maybe something that you will remember when you are old?\n\nDon't worry. Dr. Lk got you.",
      options: [
        { label: "Yes, my life needs this", behavior: 'normal' },
        { label: "I'm already exciting enough", behavior: 'normal', feedback: "Sure you are." },
        { label: "Who is Dr. Lk?", behavior: 'normal', feedback: "Dr. LK: The man. The legend. Contributor to your interesting life." }
      ]
    },

    // Card 3: Friend Situation
    {
      id: 3,
      type: 'question',
      question: "Do you want at least ONE real friend?",
      subtext: "Because let's be honest...\nyour current situation is sad. no one loves you, no one needs you.",
      options: [
        { label: "I feel attacked but yes", behavior: 'normal' },
        { label: "I have friends!", behavior: 'normal', feedback: "Name three. Without googling." },
        { label: "Ouch. But fair.", behavior: 'normal' }
      ]
    },

    // Card 4: Compliments Package
    {
      id: 4,
      type: 'question',
      question: "What about someone who will give you at least 5 compliments per day?",
      subtext: "(Quality may vary. Quantity guaranteed.)",
      options: [
        { label: "My ego needs this", behavior: 'normal' },
        { label: "Only 5?", behavior: 'normal', feedback: "Don't be greedy." },
        { label: "What kind of compliments?", behavior: 'normal', feedback: "70% genuine, 30% sarcastic. You won't know which is which." }
      ]
    },

    // Card 5: Lemon Fizzy Water
    {
      id: 5,
      type: 'question',
      question: "Need a personal damage control specialist?",
      subtext: "We both know what happens after drink #3.\n\n(You're welcome, by the way.)",
      options: [
        { label: "I can handle my drinks!", behavior: 'normal', feedback: "Girl, you can barely handle standing." },
        { label: "...fine, I need supervision", behavior: 'normal' },
        { label: "The lemon water does help", behavior: 'normal', feedback: "I know. I've seen the recovery speed." }
      ]
    },

    // Card 6: Amazon Upgrade
    {
      id: 6,
      type: 'question',
      question: "Maybe someone who can give you an Amazon account?",
      subtext: "So you can finally stop shopping on Temu like a war refugee.\n\nYour clothes won't dissolve in the wash.\nRevolutionary concept, I know.",
      options: [
        { label: "I feel personally attacked", behavior: 'normal', feedback: "Good." },
        { label: "Temu has good stuff!", behavior: 'normal', feedback: "Your dissolving wardrobe disagrees." },
        { label: "Finally, a real upgrade", behavior: 'normal' }
      ]
    },

    // Card 7: Valentine Proposal
    {
      id: 7,
      type: 'question',
      question: "Need a Valentine?",
      subtext: "It's in a couple of days.\nI'm available.\nYou're... also available. Obviously.\n\nLet's not pretend you had other options other than flower sending landlords.",
      options: [
        { label: "I have other options!", behavior: 'normal', feedback: "I am the cutest." },
        { label: "This feels like a trap", behavior: 'normal', feedback: "I spent like 2 hours on this so I guess I am the one trapped." },
        { label: "Fine. What's the plan?", behavior: 'normal', feedback: "Bold of you to assume there's a plan." }
      ]
    },

    // Card 8: Party Clause
    {
      id: 8,
      type: 'question',
      question: "Need a party?",
      subtext: "Just call.\nI'll take you to the places I've been 100 times.\nWhere I spent my most precious and healthy years drinking like a bomj.\n\nLovely experience.\nI'll whisper toxic ideas in your ear in a way you're gonna love.",
      options: [
        { label: "That sounds... concerning", behavior: 'normal', feedback: "That's the fun part." },
        { label: "What kind of toxic ideas?", behavior: 'normal', feedback: "The kind that feel right at 2am." },
        { label: "I'm intrigued", behavior: 'normal' }
      ]
    },

    // Card 9: Toxicity Offering
    {
      id: 9,
      type: 'question',
      question: "Need a bit of toxicity and drama?",
      subtext: "I can deliver.\n\nNot too much. Just enough to keep things interesting and your friends worried.",
      options: [
        { label: "Finally, honesty in advertising", behavior: 'normal' },
        { label: "Define 'a bit'", behavior: 'normal', feedback: "Enough for stories, not enough for court." },
        { label: "I'm trying to heal actually", behavior: 'normal', feedback: "Healing is boring. Next question." }
      ]
    },

    // Card 10: Self-Assessment
    {
      id: 10,
      type: 'question',
      question: "Look, I might not be your type.",
      subtext: "But I am definitely, uniquely fucked up in a way you're gonna enjoy.",
      options: [
        { label: "I feel called out", behavior: 'normal', feedback: "Good. Someone had to say it." },
        { label: "Define 'fucked up'", behavior: 'normal', feedback: "Entertaining enough to keep. Broken enough to understand you." },
        { label: "I like normal guys", behavior: 'normal', feedback: "No you don't, you like me." }
      ]
    },

    // Card 11: Recap Card (fullscreen, no card box)
    {
      id: 11,
      type: 'recap',
      question: "What's on the table:",
      subtext: "✓ Memories you'll never forget\n✓ An actual friend (rare find)\n✓ Daily compliments (5 minimum)\n✓ Post-drunk hydration service\n✓ Amazon account upgrade\n✓ Valentine sorted\n✓ On-call party companion\n✓ Personal attack dog for rude people\n✓ Premium toxicity (controlled doses)\n✓ Entertainment value (guaranteed)\n\nThis is a limited time offer.\n(It's not. But sounds better.)",
      options: [
        { label: "This is a lot", behavior: 'normal' },
        { label: "I've seen worse deals", behavior: 'normal' },
        { label: "What's the catch?", behavior: 'normal', feedback: "You have to put up with me." }
      ]
    },

    // Card 12: Compatibility Score
    {
      id: 12,
      type: 'score',
      question: "Calculating compatibility...",
      subtext: null,
      options: [
        { label: "I wonder who's being difficult", behavior: 'normal' },
        { label: "This feels rigged", behavior: 'normal', feedback: "It is. Your point?" },
        { label: "Only " + quizState.score + "%?", behavior: 'normal', feedback: "The remaining " + (100 - parseFloat(quizState.score)).toFixed(1) + "% is your stubbornness." }
      ]
    },

    // Card 13: THE FINAL QUESTION
    {
      id: 13,
      type: 'final',
      question: "Will you be my girlfriend?",
      subtext: "Okay. Enough games.\n\nYou scrolled through all of this.\nYou're still here.\nWe both know what that means.",
      options: [
        { label: "Yes", behavior: 'normal', isCorrect: true },
        { label: "Absolutely not", behavior: 'escalating-escape' }
      ]
    },

    // Card 14: Victory
    {
      id: 14,
      type: 'victory',
      question: "Finally.",
      subtext: "Status: Girlfriend (official)\nEffective: Right now\nDuration: TBD\n\nTerms & Conditions:\n• No refunds\n• Complaining is allowed\n• Escape attempts will be noted\n\nWelcome aboard, Miss Sanam.\n\nThis is going to be fun.\n(For me. Still unclear about you.)\n\n🏁 P1 - Champion of my heart",
      options: []
    }
  ];

  // ============================================
  // No Button Escalation States
  // ============================================
  const noButtonStates = [
    { attempts: 1, action: 'dodge', text: 'Absolutely not' },
    { attempts: 2, action: 'dodge', text: 'Absolutely not' },
    { attempts: 3, action: 'dodge-shrink', text: 'Reconsider' },
    { attempts: 4, action: 'shrink', text: 'Think again' },
    { attempts: 5, action: 'tiny', text: 'Please?' },
    { attempts: 6, action: 'disappear', text: null }
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
    cardContainer.addEventListener('pointerenter', handlePointerEnter, true);
  }

  // ============================================
  // Card Rendering
  // ============================================
  function renderCard(cardData) {
    // Special rendering for final question (no card container)
    if (cardData.type === 'final') {
      return renderFinalScreen(cardData);
    }

    // Special rendering for victory (fullscreen celebration)
    if (cardData.type === 'victory') {
      return renderVictoryScreen(cardData);
    }

    // Special rendering for recap (fullscreen list, no card box)
    if (cardData.type === 'recap') {
      return renderRecapScreen(cardData);
    }

    const card = document.createElement('div');
    // Add type-specific class for special styling
    const typeClass = cardData.type === 'greeting' ? 'greeting' : '';
    card.className = `card ${typeClass}`.trim();
    card.dataset.cardId = cardData.id;

    let content = `<div class="question">${cardData.question}</div>`;

    if (cardData.subtext) {
      content += `<div class="subtext">${cardData.subtext}</div>`;
    }

    // Score display for score card
    if (cardData.type === 'score') {
      content += `
        <div class="score-label">Compatibility Score</div>
        <div class="score-display" id="scoreDisplay">0.0%</div>
      `;
    }

    // Options
    if (cardData.options && cardData.options.length > 0) {
      content += '<div class="options">';
      cardData.options.forEach((option, index) => {
        const isDisabled = option.behavior === 'disabled' ? 'disabled' : '';
        const isNoButton = option.behavior === 'escalating-escape' ? 'data-no-button="true"' : '';
        content += `
          <button class="btn" ${isDisabled} ${isNoButton} data-option-index="${index}">
            ${option.label}
          </button>
        `;
      });
      content += '</div>';
    }

    card.innerHTML = content;
    return card;
  }

  // Render final question as fullscreen (no card)
  function renderFinalScreen(cardData) {
    const screen = document.createElement('div');
    screen.className = 'final-question-screen';
    screen.dataset.cardId = cardData.id;

    // Question text
    const question = document.createElement('div');
    question.className = 'final-question';
    question.textContent = cardData.question;
    screen.appendChild(question);

    // Subtext
    if (cardData.subtext) {
      const subtext = document.createElement('div');
      subtext.className = 'final-subtext';
      subtext.textContent = cardData.subtext;
      screen.appendChild(subtext);
    }

    // Yes button (fixed at bottom center)
    const yesBtn = document.createElement('button');
    yesBtn.className = 'btn final-yes-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.dataset.optionIndex = '0';
    screen.appendChild(yesBtn);

    // No button (fixed, will roam the screen)
    const noBtn = document.createElement('button');
    noBtn.className = 'btn final-no-btn';
    noBtn.textContent = 'Absolutely not';
    noBtn.dataset.optionIndex = '1';
    noBtn.dataset.noButton = 'true';
    // Initial position using LEFT for consistent smooth animations
    noBtn.style.left = (window.innerWidth - 220) + 'px';
    noBtn.style.top = '100px';
    screen.appendChild(noBtn);

    // Setup cursor-aware smooth dodge
    setTimeout(() => setupCursorDodge(noBtn), 100);

    return screen;
  }

  // ============================================
  // Cursor-Aware Smooth Dodge System
  // ============================================
  function setupCursorDodge(btn) {
    let isMoving = false;
    let lastMoveTime = 0;
    const dodgeRadius = 150;
    const moveThrottle = 200;
    const margin = 60;

    function getDistance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function smoothDodge(cursorX, cursorY) {
      if (isMoving || btn.classList.contains('hidden') || !btn.isConnected) return;

      const now = Date.now();
      if (now - lastMoveTime < moveThrottle) return;

      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const distance = getDistance(cursorX, cursorY, btnCenterX, btnCenterY);

      if (distance > dodgeRadius) return;

      isMoving = true;
      lastMoveTime = now;

      // Direction away from cursor
      let dx = btnCenterX - cursorX;
      let dy = btnCenterY - cursorY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= len;
      dy /= len;

      // Faster escape when closer
      const escapeForce = Math.max(1, (dodgeRadius - distance) / 50);
      const dodgeX = dx * (150 + Math.random() * 100) * escapeForce;
      const dodgeY = dy * (100 + Math.random() * 80) * escapeForce;

      // Randomness
      const randomX = (Math.random() - 0.5) * 80;
      const randomY = (Math.random() - 0.5) * 60;

      let newX = rect.left + dodgeX + randomX;
      let newY = rect.top + dodgeY + randomY;

      // Clamp to screen
      const maxX = window.innerWidth - rect.width - margin;
      const maxY = window.innerHeight - rect.height - margin;
      newX = clamp(newX, margin, maxX);
      newY = clamp(newY, margin, maxY);

      // If still too close, jump to opposite side
      const newCenterX = newX + rect.width / 2;
      const newCenterY = newY + rect.height / 2;
      if (getDistance(cursorX, cursorY, newCenterX, newCenterY) < dodgeRadius * 0.6) {
        newX = cursorX < window.innerWidth / 2 ? maxX - Math.random() * 100 : margin + Math.random() * 100;
        newY = cursorY < window.innerHeight / 2 ? maxY - Math.random() * 100 : margin + 80 + Math.random() * 100;
      }

      btn.style.left = newX + 'px';
      btn.style.top = newY + 'px';

      if (Math.random() > 0.5) SoundManager.play('dodge');

      setTimeout(() => { isMoving = false; }, moveThrottle);
    }

    const onMouseMove = (e) => smoothDodge(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) smoothDodge(e.touches[0].clientX, e.touches[0].clientY);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove, { passive: true });

    btn._cleanupDodge = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
    };
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

    // Main title
    const title = document.createElement('div');
    title.className = 'victory-title';
    title.textContent = cardData.question;
    screen.appendChild(title);

    // Status section
    const statusSection = document.createElement('div');
    statusSection.className = 'victory-status';
    statusSection.innerHTML = `
      <div class="status-line"><span class="status-label">Status:</span> <span class="status-value highlight">Girlfriend (official)</span></div>
      <div class="status-line"><span class="status-label">Effective:</span> <span class="status-value">Right now</span></div>
      <div class="status-line"><span class="status-label">Duration:</span> <span class="status-value">TBD</span></div>
    `;
    screen.appendChild(statusSection);

    // Terms section
    const termsSection = document.createElement('div');
    termsSection.className = 'victory-terms';
    termsSection.innerHTML = `
      <div class="terms-title">Terms & Conditions:</div>
      <div class="terms-item">• No refunds</div>
      <div class="terms-item">• Complaining is allowed</div>
      <div class="terms-item">• Escape attempts will be noted</div>
    `;
    screen.appendChild(termsSection);

    // Welcome message
    const welcome = document.createElement('div');
    welcome.className = 'victory-welcome';
    welcome.textContent = 'Welcome aboard, Miss Sanam.';
    screen.appendChild(welcome);

    // Fun message
    const funMsg = document.createElement('div');
    funMsg.className = 'victory-fun';
    funMsg.innerHTML = `This is going to be fun.<br><span class="fun-note">(For me. Still unclear about you.)</span>`;
    screen.appendChild(funMsg);

    // Champion badge
    const badge = document.createElement('div');
    badge.className = 'victory-badge';
    badge.innerHTML = '🏁 P1 - Champion of my heart';
    screen.appendChild(badge);

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
      // Final and victory screens don't use .card class
      if (cardData.type === 'final' || cardData.type === 'victory') {
        // Already has fade-in animation via CSS
        SoundManager.play('whoosh');
      } else {
        card.classList.add('active', 'entering');
        SoundManager.play('whoosh');
      }

      // Animate score if it's the score card
      if (cardData.type === 'score') {
        setTimeout(() => animateScore(), 500);
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

    // Remove entering class after animation (not for final or victory screen)
    if (cardData.type !== 'final' && cardData.type !== 'victory') {
      setTimeout(() => {
        card.classList.remove('entering');
      }, 700);
    }
  }

  function hideCard(callback) {
    // Check for regular card or final screen
    const currentCard = cardContainer.querySelector('.card.active') ||
                        cardContainer.querySelector('.final-question-screen');
    if (!currentCard) {
      if (callback) callback();
      return;
    }

    quizState.isTransitioning = true;

    // Handle final screen differently (no .active class)
    if (currentCard.classList.contains('final-question-screen')) {
      currentCard.style.opacity = '0';
      currentCard.style.transition = 'opacity 0.5s ease';
    } else {
      currentCard.classList.remove('active');
      currentCard.classList.add('exiting');
    }

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

    // Handle No button special behavior
    if (btn.dataset.noButton === 'true') {
      handleNoButtonClick(btn);
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

    // Victory check
    if (option.isCorrect && cardData.type === 'final') {
      quizState.isComplete = true;
      advanceToNextCard();
      return;
    }

    // Show Next button instead of auto-advancing
    showNextButton();
  }

  function handlePointerEnter(e) {
    const btn = e.target.closest('.btn[data-no-button="true"]');
    if (!btn || e.pointerType !== 'mouse') return;

    // Skip for final screen - it uses smooth cursor-tracking dodge
    if (btn.classList.contains('final-no-btn')) return;

    // Trigger dodge on hover for other screens
    handleNoButtonHover(btn);
  }

  function handleNoButtonClick(btn) {
    quizState.noButtonAttempts++;
    const state = noButtonStates.find(s => s.attempts === quizState.noButtonAttempts)
                 || noButtonStates[noButtonStates.length - 1];

    // Check if we're on the final question (fullscreen mode)
    const isFinalScreen = btn.classList.contains('final-no-btn');

    switch (state.action) {
      case 'dodge':
        SoundManager.play('dodge');
        if (isFinalScreen) {
          dodgeButtonFullscreen(btn, quizState.noButtonAttempts);
        } else {
          dodgeButton(btn);
        }
        break;
      case 'dodge-shrink':
        SoundManager.play('dodge');
        if (isFinalScreen) {
          dodgeButtonFullscreen(btn, quizState.noButtonAttempts);
          btn.classList.add('shrinking');
          btn.style.transform = 'scale(0.85)';
        } else {
          dodgeButton(btn);
          shrinkButton(btn, 0.85);
        }
        if (state.text) btn.textContent = state.text;
        break;
      case 'shrink':
        SoundManager.play('shrink');
        if (isFinalScreen) {
          dodgeButtonFullscreen(btn, quizState.noButtonAttempts);
          btn.classList.add('shrinking');
          btn.style.transform = 'scale(0.7)';
        } else {
          shrinkButton(btn, 0.7);
        }
        if (state.text) btn.textContent = state.text;
        break;
      case 'tiny':
        SoundManager.play('tiny');
        if (isFinalScreen) {
          dodgeButtonFullscreen(btn, quizState.noButtonAttempts);
          btn.classList.add('shrinking');
          btn.style.transform = 'scale(0.5)';
        } else {
          shrinkButton(btn, 0.5);
        }
        if (state.text) btn.textContent = state.text;
        break;
      case 'disappear':
        SoundManager.play('poof');
        disappearButton(btn);
        break;
    }
  }

  function handleNoButtonHover(btn) {
    if (quizState.noButtonAttempts < 2) {
      const isFinalScreen = btn.classList.contains('final-no-btn');
      if (isFinalScreen) {
        dodgeButtonFullscreen(btn, quizState.noButtonAttempts);
      } else {
        dodgeButton(btn);
      }
    }
  }

  function markButtonSelected(selectedBtn) {
    const currentCard = cardContainer.querySelector('.card.active') ||
                        cardContainer.querySelector('.final-question-screen');
    if (!currentCard) return;

    // Clear existing feedback when selecting a new option
    const existingFeedback = currentCard.querySelector('.feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Get all option buttons (not next-btn, final-yes-btn, final-no-btn)
    const allBtns = currentCard.querySelectorAll('.btn:not(.next-btn):not(.final-yes-btn):not(.final-no-btn)');

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
    const displayIndex = Math.min(quizState.currentCardIndex + 1, 15);
    if (progressNumber) {
      progressNumber.textContent = displayIndex;
    }

    // Hide progress on victory
    const progress = document.querySelector('.progress');
    if (progress) {
      progress.style.opacity = quizState.currentCardIndex >= 15 ? '0' : '1';
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
  // No Button Misbehavior
  // ============================================
  function dodgeButton(btn) {
    const container = btn.closest('.options');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // Calculate random position within container bounds
    const maxX = containerRect.width - btnRect.width;
    const maxY = Math.min(100, containerRect.height);

    const randomX = (Math.random() - 0.5) * maxX * 0.8;
    const randomY = (Math.random() - 0.5) * maxY;

    btn.classList.add('dodging');
    btn.style.transform = `translate(${randomX}px, ${randomY}px)`;

    setTimeout(() => {
      btn.classList.remove('dodging');
    }, 200);
  }

  // Full-screen dodge for final question
  function dodgeButtonFullscreen(btn, attempt) {
    const margin = 60;
    const btnRect = btn.getBoundingClientRect();

    // Calculate available area
    let maxX = window.innerWidth - btnRect.width - margin;
    let maxY = window.innerHeight - btnRect.height - margin;
    let minY = margin;

    // After attempt 4, restrict to bottom half and slow down
    if (attempt >= 4) {
      minY = window.innerHeight / 2;
      btn.classList.add('trembling');
    }

    // Calculate new position
    let newX = margin + Math.random() * (maxX - margin);
    let newY = minY + Math.random() * (maxY - minY);

    // Apply position
    btn.style.left = newX + 'px';
    btn.style.top = newY + 'px';
    btn.style.right = 'auto';
  }

  function shrinkButton(btn, scale) {
    btn.classList.add('shrinking');
    btn.style.transform = `scale(${scale})`;
  }

  function disappearButton(btn) {
    btn.classList.add('hidden');

    const isFinalScreen = btn.classList.contains('final-no-btn');

    // Add second Yes button
    setTimeout(() => {
      if (isFinalScreen) {
        // For final screen, add another Yes button somewhere on screen
        const finalScreen = btn.closest('.final-question-screen');
        if (finalScreen) {
          const secondYes = document.createElement('button');
          secondYes.className = 'btn final-yes-btn';
          secondYes.textContent = 'Yes';
          secondYes.dataset.optionIndex = '0';
          secondYes.style.opacity = '0';
          secondYes.style.bottom = '140px'; // Position above the other Yes
          secondYes.style.transform = 'translateX(-50%) scale(0.8)';
          finalScreen.appendChild(secondYes);

          requestAnimationFrame(() => {
            secondYes.style.transition = 'all 0.3s ease';
            secondYes.style.opacity = '1';
            secondYes.style.transform = 'translateX(-50%) scale(1)';
          });

          secondYes.addEventListener('click', () => {
            quizState.isComplete = true;
            advanceToNextCard();
          });
        }
      } else {
        const options = btn.closest('.options');
        if (options) {
          const secondYes = document.createElement('button');
          secondYes.className = 'btn';
          secondYes.textContent = 'Yes';
          secondYes.dataset.optionIndex = '0';
          secondYes.style.opacity = '0';
          secondYes.style.transform = 'scale(0.8)';
          options.appendChild(secondYes);

          requestAnimationFrame(() => {
            secondYes.style.transition = 'all 0.3s ease';
            secondYes.style.opacity = '1';
            secondYes.style.transform = 'scale(1)';
          });

          // Update first Yes button's data to handle victory
          const firstYes = options.querySelector('.btn:not(.hidden):not([data-no-button])');
          if (firstYes) {
            firstYes.addEventListener('click', () => {
              quizState.isComplete = true;
              advanceToNextCard();
            });
          }

          secondYes.addEventListener('click', () => {
            quizState.isComplete = true;
            advanceToNextCard();
          });
        }
      }
    }, 300);
  }

  // ============================================
  // Enhanced Score Animation with Particles
  // ============================================
  function animateScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (!scoreDisplay) return;

    const target = parseFloat(quizState.score);
    const duration = 2000;
    const start = performance.now();
    let lastParticleValue = 0;

    // Add counting class for pulse effect
    scoreDisplay.classList.add('counting');

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const currentValue = target * eased;

      scoreDisplay.textContent = currentValue.toFixed(1) + '%';

      // Spawn particle every 10%
      if (Math.floor(currentValue / 10) > lastParticleValue) {
        lastParticleValue = Math.floor(currentValue / 10);
        SoundManager.play('tick');
        spawnScoreParticle(scoreDisplay, '+' + Math.floor(currentValue / 10) * 10);
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Complete - add celebration effect
        scoreDisplay.classList.remove('counting');
        scoreDisplay.classList.add('complete');
        scoreDisplay.style.textShadow = '0 0 50px rgba(255, 20, 147, 0.8)';

        // Small confetti burst on score complete
        spawnMiniConfetti(scoreDisplay);
      }
    }

    requestAnimationFrame(update);
  }

  function spawnScoreParticle(parent, text) {
    const particle = document.createElement('span');
    particle.className = 'score-particle';
    particle.textContent = text;
    particle.style.left = (Math.random() * 60 + 20) + '%';
    particle.style.top = '50%';
    parent.appendChild(particle);

    setTimeout(() => particle.remove(), 800);
  }

  function spawnMiniConfetti(element) {
    const rect = element.getBoundingClientRect();
    const colors = ['#FF1493', '#FF69B4', '#FFB6C1', '#FFD700'];

    for (let i = 0; i < 12; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti circle';
      confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
      confetti.style.setProperty('--size', (Math.random() * 6 + 4) + 'px');
      confetti.style.setProperty('--duration', (Math.random() * 0.8 + 0.6) + 's');
      confetti.style.setProperty('--sway', (Math.random() - 0.5) * 60 + 'px');
      confetti.style.left = rect.left + rect.width / 2 + (Math.random() - 0.5) * 100 + 'px';
      confetti.style.top = rect.top + 'px';

      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 1500);
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
