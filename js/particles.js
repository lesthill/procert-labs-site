/**
 * Particle Network Animation
 * Constellation/node network effect for dark-themed hero section.
 * Canvas element: #particleCanvas
 */
(function () {
  'use strict';

  const CONFIG = {
    particleCountMin: 80,
    particleCountMax: 120,
    particleRadiusMin: 1,
    particleRadiusMax: 3,
    particleOpacityMin: 0.1,
    particleOpacityMax: 0.4,
    particleSpeedMin: 0.15,
    particleSpeedMax: 0.6,
    connectionDistance: 150,
    connectionDistanceSq: 150 * 150,
    connectionMaxOpacity: 0.08,
    mouseRadius: 200,
    mouseRadiusSq: 200 * 200,
    mouseForce: 0.8,
    brightParticleCount: 5,
    brightPulseSpeed: 0.008,
    brightRadiusMin: 3,
    brightRadiusMax: 5,
    brightOpacityMin: 0.4,
    brightOpacityMax: 0.7,
    accentColor: { r: 99, g: 102, b: 241 }, // #6366f1
    accentProbability: 0.3,
  };

  let canvas, ctx;
  let width, height;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let animationId;

  // --- Utility ---

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // --- Particle ---

  function createParticle(isBright) {
    const useAccent = Math.random() < CONFIG.accentProbability;
    const color = useAccent ? CONFIG.accentColor : { r: 255, g: 255, b: 255 };
    const baseOpacity = useAccent ? 0.3 : 1;

    if (isBright) {
      return {
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-CONFIG.particleSpeedMin, CONFIG.particleSpeedMin),
        vy: rand(-CONFIG.particleSpeedMin, CONFIG.particleSpeedMin),
        radius: rand(CONFIG.brightRadiusMin, CONFIG.brightRadiusMax),
        baseRadius: rand(CONFIG.brightRadiusMin, CONFIG.brightRadiusMax),
        opacity: rand(CONFIG.brightOpacityMin, CONFIG.brightOpacityMax),
        baseOpacity: rand(CONFIG.brightOpacityMin, CONFIG.brightOpacityMax),
        color: color,
        colorOpacity: baseOpacity,
        bright: true,
        pulseOffset: rand(0, Math.PI * 2),
      };
    }

    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-CONFIG.particleSpeedMax, CONFIG.particleSpeedMax),
      vy: rand(-CONFIG.particleSpeedMax, CONFIG.particleSpeedMax),
      radius: rand(CONFIG.particleRadiusMin, CONFIG.particleRadiusMax),
      baseRadius: rand(CONFIG.particleRadiusMin, CONFIG.particleRadiusMax),
      opacity: rand(CONFIG.particleOpacityMin, CONFIG.particleOpacityMax),
      baseOpacity: rand(CONFIG.particleOpacityMin, CONFIG.particleOpacityMax),
      color: color,
      colorOpacity: baseOpacity,
      bright: false,
      pulseOffset: 0,
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.round(
      lerp(CONFIG.particleCountMin, CONFIG.particleCountMax, Math.min(width / 1920, 1))
    );

    for (let i = 0; i < CONFIG.brightParticleCount; i++) {
      particles.push(createParticle(true));
    }
    for (let i = 0; i < count - CONFIG.brightParticleCount; i++) {
      particles.push(createParticle(false));
    }
  }

  // --- Update ---

  function updateParticles() {
    const time = performance.now();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < CONFIG.mouseRadiusSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * CONFIG.mouseForce;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Dampen velocity so mouse push fades
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Ensure minimum drift speed
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const minSpeed = p.bright ? CONFIG.particleSpeedMin * 0.5 : CONFIG.particleSpeedMin;
      if (speed < minSpeed) {
        const angle = Math.atan2(p.vy, p.vx);
        p.vx = Math.cos(angle) * minSpeed;
        p.vy = Math.sin(angle) * minSpeed;
      }

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -10) p.x = width + 10;
      else if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      else if (p.y > height + 10) p.y = -10;

      // Bright particle pulse
      if (p.bright) {
        const pulse = Math.sin(time * CONFIG.brightPulseSpeed + p.pulseOffset);
        const t = (pulse + 1) * 0.5; // 0..1
        p.radius = lerp(p.baseRadius * 0.7, p.baseRadius * 1.3, t);
        p.opacity = lerp(p.baseOpacity * 0.6, p.baseOpacity, t);
      }
    }
  }

  // --- Draw ---

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);

    const len = particles.length;

    // Draw connections
    for (let i = 0; i < len; i++) {
      const a = particles[i];
      for (let j = i + 1; j < len; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < CONFIG.connectionDistanceSq) {
          const opacity =
            CONFIG.connectionMaxOpacity *
            (1 - distSq / CONFIG.connectionDistanceSq);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(255,255,255,' + opacity + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < len; i++) {
      const p = particles[i];
      const r = p.color.r;
      const g = p.color.g;
      const b = p.color.b;
      const alpha = p.opacity * p.colorOpacity;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
      ctx.fill();

      // Bright particles get a soft glow
      if (p.bright) {
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 4
        );
        gradient.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.3) + ')');
        gradient.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
  }

  // --- Loop ---

  function animate() {
    updateParticles();
    drawParticles();
    animationId = requestAnimationFrame(animate);
  }

  // --- Resize ---

  function resize() {
    const parent = canvas.parentElement;
    width = parent ? parent.offsetWidth : window.innerWidth;
    height = parent ? parent.offsetHeight : window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
  }

  // --- Init ---

  function init() {
    canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    resize();

    canvas.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    window.addEventListener('resize', function () {
      if (animationId) cancelAnimationFrame(animationId);
      resize();
      animate();
    });

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
