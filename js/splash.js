/**
 * ProCert Labs — Splash Fly-Through v3
 * Clean. Precise. Understated confidence.
 * Expects global THREE and gsap.
 */
;(function () {
  'use strict';

  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
    var el = document.getElementById('splashScreen');
    if (el) el.style.display = 'none';
    return;
  }

  // ── Config ──────────────────────────────────────────────────────
  var BG             = 0x050510;
  var INDIGO         = 0x6366f1;
  var VIOLET         = 0x8b5cf6;
  var CYAN           = 0x06b6d4;
  var WHITE          = 0xffffff;
  var PARTICLE_COUNT = 1500;
  var AUTO_DELAY     = 3500;
  var FLY_DURATION   = 2.2;

  // Hexagon: mathematically precise
  var HEX_R     = 1.8;    // outer radius
  var HEX_EDGE  = 0.055;  // tube thickness — thin and elegant
  var HEX_DEPTH = 0.6;    // tunnel depth

  // ── DOM ─────────────────────────────────────────────────────────
  var splashEl = document.getElementById('splashScreen');
  var canvas   = document.getElementById('splashCanvas');
  var textEl   = splashEl ? splashEl.querySelector('.splash-text') : null;
  var hintEl   = splashEl ? splashEl.querySelector('.splash-hint') : null;
  if (!splashEl || !canvas) return;

  // ── State ───────────────────────────────────────────────────────
  var triggered = false;
  var alive     = true;
  var clock     = new THREE.Clock();
  var mouseX    = 0;
  var mouseY    = 0;

  // ── Renderer ────────────────────────────────────────────────────
  var dpr      = Math.min(window.devicePixelRatio || 1, 2);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  // ── Scene & Camera ──────────────────────────────────────────────
  var scene  = new THREE.Scene();
  // No fog — keep geometry crisp at all distances
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 6);

  // ── Lighting — balanced, not overblown ──────────────────────────
  scene.add(new THREE.AmbientLight(WHITE, 0.6));

  var keyLight = new THREE.DirectionalLight(WHITE, 1.2);
  keyLight.position.set(2, 3, 5);
  scene.add(keyLight);

  var fillIndigo = new THREE.PointLight(INDIGO, 3, 15);
  fillIndigo.position.set(-2.5, 1.5, 4);
  scene.add(fillIndigo);

  var fillCyan = new THREE.PointLight(CYAN, 3, 15);
  fillCyan.position.set(2.5, -1.5, 4);
  scene.add(fillCyan);

  var backLight = new THREE.PointLight(VIOLET, 2, 12);
  backLight.position.set(0, 0, -2);
  scene.add(backLight);

  // ── Hexagon vertices — flat-top, mathematically exact ───────────
  function hexVerts(r, z) {
    var v = [];
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i + Math.PI / 6; // pointy-top: clean, symmetric
      v.push(new THREE.Vector3(
        +(r * Math.cos(a)).toFixed(10),
        +(r * Math.sin(a)).toFixed(10),
        z || 0
      ));
    }
    return v;
  }

  // ── Materials ───────────────────────────────────────────────────
  // Frame: clean metallic with subtle emissive — not glowing like a rave
  var frameMat = new THREE.MeshStandardMaterial({
    color: 0x7c7fff,
    emissive: INDIGO,
    emissiveIntensity: 0.4,
    metalness: 0.95,
    roughness: 0.1,
  });

  // Checkmark: brighter but still refined
  var checkMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: CYAN,
    emissiveIntensity: 0.8,
    metalness: 0.85,
    roughness: 0.12,
  });

  // ── Build Hexagonal Frame ───────────────────────────────────────
  var hexGroup   = new THREE.Group();
  var TUBE_SIDES = 24;  // round cross-section
  var TUBE_SEGS  = 2;   // segments along each edge

  function makeEdge(a, b) {
    var path = new THREE.LineCurve3(a, b);
    return new THREE.TubeGeometry(path, TUBE_SEGS, HEX_EDGE, TUBE_SIDES, false);
  }

  function makeJoint(pos) {
    var g = new THREE.SphereGeometry(HEX_EDGE, TUBE_SIDES, TUBE_SIDES);
    var m = new THREE.Mesh(g, frameMat);
    m.position.copy(pos);
    return m;
  }

  // Front face, back face, and depth struts
  var fv = hexVerts(HEX_R, HEX_DEPTH / 2);
  var bv = hexVerts(HEX_R, -HEX_DEPTH / 2);

  for (var i = 0; i < 6; i++) {
    var next = (i + 1) % 6;
    // Front ring edge + joint
    hexGroup.add(new THREE.Mesh(makeEdge(fv[i], fv[next]), frameMat));
    hexGroup.add(makeJoint(fv[i]));
    // Back ring edge + joint
    hexGroup.add(new THREE.Mesh(makeEdge(bv[i], bv[next]), frameMat));
    hexGroup.add(makeJoint(bv[i]));
    // Depth strut connecting front to back
    hexGroup.add(new THREE.Mesh(makeEdge(fv[i], bv[i]), frameMat));
  }

  // Subtle inner glow — very faint, just a breath of light inside the frame
  var glowRingGeo = new THREE.RingGeometry(HEX_R * 0.6, HEX_R * 0.85, 6, 1);
  // Rotate ring to align with hex orientation
  glowRingGeo.rotateZ(Math.PI / 6);
  var glowRingMat = new THREE.MeshBasicMaterial({
    color: INDIGO,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  var glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
  hexGroup.add(glowRing);

  scene.add(hexGroup);

  // ── Checkmark — centered, proportional to hex ───────────────────
  var checkGroup = new THREE.Group();

  // Proportional to hex radius: check fits ~55% of hex interior
  var s = HEX_R * 0.38;
  var cp1 = new THREE.Vector3(-0.50 * s, 0.05 * s, 0);
  var cp2 = new THREE.Vector3(-0.15 * s, -0.45 * s, 0);
  var cp3 = new THREE.Vector3(0.60 * s, 0.45 * s, 0);

  var checkPath = new THREE.CurvePath();
  checkPath.add(new THREE.LineCurve3(cp1, cp2));
  checkPath.add(new THREE.LineCurve3(cp2, cp3));

  var checkTube = HEX_EDGE * 1.4; // slightly thicker than frame
  var checkGeo  = new THREE.TubeGeometry(checkPath, 48, checkTube, TUBE_SIDES, false);
  checkGroup.add(new THREE.Mesh(checkGeo, checkMat));

  // Joints at check vertices for clean ends
  [cp1, cp2, cp3].forEach(function (p) {
    var sg = new THREE.SphereGeometry(checkTube, TUBE_SIDES, TUBE_SIDES);
    var sm = new THREE.Mesh(sg, checkMat);
    sm.position.copy(p);
    checkGroup.add(sm);
  });

  // Very subtle check glow
  var checkGlowMat = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  var checkGlowGeo = new THREE.TubeGeometry(checkPath, 48, checkTube * 2.5, 16, false);
  checkGroup.add(new THREE.Mesh(checkGlowGeo, checkGlowMat));

  checkGroup.position.z = HEX_DEPTH / 2 + 0.02;
  scene.add(checkGroup);

  // ── Particles — sparse, elegant, not busy ───────────────────────
  var pPos    = new Float32Array(PARTICLE_COUNT * 3);
  var pSpeeds = new Float32Array(PARTICLE_COUNT);

  for (var pi = 0; pi < PARTICLE_COUNT; pi++) {
    var pa = Math.random() * Math.PI * 2;
    var pr = 0.8 + Math.random() * 5;
    pPos[pi * 3]     = Math.cos(pa) * pr;
    pPos[pi * 3 + 1] = Math.sin(pa) * pr;
    pPos[pi * 3 + 2] = -Math.random() * 80 - 3;
    pSpeeds[pi]       = 0.015 + Math.random() * 0.03;
  }

  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  var pMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.03,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  var particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  var warp = { speed: 1, size: 0.03 };

  // ── Flash overlay ───────────────────────────────────────────────
  var flash = document.createElement('div');
  flash.style.cssText =
    'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:10001;';
  splashEl.appendChild(flash);

  // ── Resize ──────────────────────────────────────────────────────
  function onResize() {
    if (!alive) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener('mousemove', onMouseMove);

  // ── Render Loop ─────────────────────────────────────────────────
  var rafId;

  function animate() {
    if (!alive) return;
    rafId = requestAnimationFrame(animate);

    var t = clock.getElapsedTime();

    // Idle: very gentle, precise float — not wobbly
    if (!triggered) {
      hexGroup.rotation.y   = Math.sin(t * 0.4) * 0.06;
      hexGroup.rotation.x   = Math.sin(t * 0.28) * 0.025;
      hexGroup.position.y   = Math.sin(t * 0.6) * 0.08;
      checkGroup.rotation.y = hexGroup.rotation.y;
      checkGroup.rotation.x = hexGroup.rotation.x;
      checkGroup.position.y = hexGroup.position.y;
    }

    // Mouse parallax — subtle
    camera.position.x += (mouseX * 0.15 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.1 - camera.position.y) * 0.04;

    // Particles
    var pos = pGeo.attributes.position.array;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 2] += pSpeeds[i] * warp.speed;
      if (pos[i * 3 + 2] > camera.position.z + 2) {
        pos[i * 3 + 2] = camera.position.z - 60 - Math.random() * 30;
        var a = Math.random() * Math.PI * 2;
        var r = 0.8 + Math.random() * 5;
        pos[i * 3]     = Math.cos(a) * r;
        pos[i * 3 + 1] = Math.sin(a) * r;
      }
    }
    pGeo.attributes.position.needsUpdate = true;
    pMat.size = warp.size;

    // Lights track camera during fly-through
    fillIndigo.position.z = camera.position.z + 2;
    fillCyan.position.z   = camera.position.z + 2;
    backLight.position.z  = camera.position.z - 3;

    renderer.render(scene, camera);
  }

  // ── Fly-Through ─────────────────────────────────────────────────
  function triggerFly() {
    if (triggered) return;
    triggered = true;
    clearTimeout(autoTimer);

    splashEl.removeEventListener('click', triggerFly);
    window.removeEventListener('wheel', triggerFly);
    window.removeEventListener('touchstart', triggerFly);

    if (hintEl) gsap.to(hintEl, { opacity: 0, duration: 0.3 });

    // Get the hero title position to animate text toward it
    var heroTitle = document.querySelector('.hero-title');
    var targetY   = 0;
    if (heroTitle) {
      var rect = heroTitle.getBoundingClientRect();
      var currentRect = textEl ? textEl.getBoundingClientRect() : { top: window.innerHeight / 2 };
      targetY = rect.top - currentRect.top;
    }

    var tl = gsap.timeline({
      onComplete: function () { setTimeout(cleanup, 150); },
    });

    // 1. Straighten hex rotation to 0 before fly (clean entry)
    tl.to(hexGroup.rotation, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' }, 0);
    tl.to(hexGroup.position, { y: 0, duration: 0.4, ease: 'power2.out' }, 0);
    tl.to(checkGroup.rotation, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' }, 0);
    tl.to(checkGroup.position, { y: 0, duration: 0.4, ease: 'power2.out' }, 0);

    // 2. Checkmark dissolves
    tl.to(checkMat, {
      opacity: 0, emissiveIntensity: 0, duration: 0.5, ease: 'power2.in',
      onStart: function () { checkMat.transparent = true; },
    }, 0.2);
    tl.to(checkGlowMat, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.2);

    // 3. Hex scales uniformly — proportional throughout
    tl.to(hexGroup.scale, {
      x: 12, y: 12, z: 12,
      duration: FLY_DURATION,
      ease: 'power2.inOut',
    }, 0.4);

    // 4. Camera flies through
    tl.to(camera.position, {
      z: -25,
      duration: FLY_DURATION,
      ease: 'power2.inOut',
    }, 0.4);

    // 5. Particles: gentle warp then ease down
    tl.to(warp, { speed: 14, size: 0.08, duration: FLY_DURATION * 0.5, ease: 'power2.in' }, 0.4);
    tl.to(warp, { speed: 4, size: 0.04, duration: FLY_DURATION * 0.5, ease: 'power2.out' }, 0.4 + FLY_DURATION * 0.5);
    tl.to(pMat, { opacity: 0.8, duration: 0.5, ease: 'power2.in' }, 0.5);
    tl.to(pMat, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.4 + FLY_DURATION - 0.7);

    // 6. Soft flash at midpoint
    var flashT = 0.4 + FLY_DURATION * 0.42;
    tl.to(flash, { opacity: 0.35, duration: 0.2, ease: 'power1.in' }, flashT);
    tl.to(flash, { opacity: 0, duration: 0.9, ease: 'power2.out' }, flashT + 0.2);

    // 7. Text moves toward hero title position, then fades
    if (textEl) {
      tl.to(textEl, {
        y: targetY,
        opacity: 0,
        scale: 0.6,
        duration: 1.0,
        ease: 'power2.inOut',
      }, 0.2);
    }

    // 8. Splash fades — starts well before end, long duration
    tl.to(splashEl, {
      opacity: 0,
      duration: 1.2,
      ease: 'power1.out',
    }, 0.4 + FLY_DURATION * 0.4);
  }

  // ── Cleanup ─────────────────────────────────────────────────────
  function cleanup() {
    alive = false;
    cancelAnimationFrame(rafId);
    scene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(function (m) { m.dispose(); });
        else obj.material.dispose();
      }
    });
    renderer.dispose();
    splashEl.style.display = 'none';
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    if (flash.parentNode) flash.parentNode.removeChild(flash);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);
    window.dispatchEvent(new CustomEvent('splashComplete'));
  }

  // ── Bindings ────────────────────────────────────────────────────
  splashEl.addEventListener('click', triggerFly);
  window.addEventListener('wheel', triggerFly, { once: true });
  window.addEventListener('touchstart', triggerFly, { once: true });
  var autoTimer = setTimeout(triggerFly, AUTO_DELAY);

  // ── Entrance ────────────────────────────────────────────────────
  gsap.fromTo(splashEl, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
  if (textEl) {
    gsap.fromTo(textEl,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
    );
  }
  if (hintEl) {
    gsap.fromTo(hintEl,
      { opacity: 0 },
      { opacity: 0.4, duration: 0.6, delay: 1.5, ease: 'power2.out' }
    );
  }

  animate();

})();
