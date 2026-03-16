/**
 * ProCert Labs — Splash Fly-Through v4
 * The logo physically flies to the nav. Pixar-smooth.
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
  var AUTO_DELAY     = 2200;
  var FLY_DURATION   = 2.0;
  var HEX_R          = 1.8;
  var HEX_EDGE       = 0.055;
  var HEX_DEPTH      = 0.6;

  // ── DOM ─────────────────────────────────────────────────────────
  var splashEl = document.getElementById('splashScreen');
  var canvas   = document.getElementById('splashCanvas');
  var textEl   = splashEl ? splashEl.querySelector('.splash-text') : null;
  var hintEl   = splashEl ? splashEl.querySelector('.splash-hint') : null;
  var navLogo  = document.querySelector('.nav-logo');
  if (!splashEl || !canvas) return;

  // Nav logo text starts hidden — the splash text will fly up and become it
  var navLogoText = navLogo ? navLogo.querySelector('.logo-text') : null;
  if (navLogoText) navLogoText.style.opacity = '0';

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
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  // Push camera back on small screens so hex fits centered
  var isMobile = window.innerWidth < 768;
  var camZ = isMobile ? 8.5 : 6;
  camera.position.set(0, 0, camZ);

  // ── Lighting ────────────────────────────────────────────────────
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

  // ── Hex geometry helpers ────────────────────────────────────────
  function hexVerts(r, z) {
    var v = [];
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i + Math.PI / 6;
      v.push(new THREE.Vector3(
        +(r * Math.cos(a)).toFixed(10),
        +(r * Math.sin(a)).toFixed(10),
        z || 0
      ));
    }
    return v;
  }

  var TUBE_SIDES = 24;
  var TUBE_SEGS  = 2;

  function makeEdge(a, b) {
    return new THREE.TubeGeometry(new THREE.LineCurve3(a, b), TUBE_SEGS, HEX_EDGE, TUBE_SIDES, false);
  }

  // ── Materials ───────────────────────────────────────────────────
  var frameMat = new THREE.MeshStandardMaterial({
    color: 0x7c7fff, emissive: INDIGO, emissiveIntensity: 0.4,
    metalness: 0.95, roughness: 0.1,
  });
  var checkMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9, emissive: CYAN, emissiveIntensity: 0.8,
    metalness: 0.85, roughness: 0.12,
  });

  // ── Build Hex Frame ─────────────────────────────────────────────
  var hexGroup = new THREE.Group();
  var fv = hexVerts(HEX_R, HEX_DEPTH / 2);
  var bv = hexVerts(HEX_R, -HEX_DEPTH / 2);

  for (var i = 0; i < 6; i++) {
    var next = (i + 1) % 6;
    hexGroup.add(new THREE.Mesh(makeEdge(fv[i], fv[next]), frameMat));
    hexGroup.add(new THREE.Mesh(makeEdge(bv[i], bv[next]), frameMat));
    hexGroup.add(new THREE.Mesh(makeEdge(fv[i], bv[i]), frameMat));
    // Sphere joints
    var sg = new THREE.SphereGeometry(HEX_EDGE, TUBE_SIDES, TUBE_SIDES);
    var sf = new THREE.Mesh(sg, frameMat); sf.position.copy(fv[i]); hexGroup.add(sf);
    var sb = new THREE.Mesh(sg.clone(), frameMat); sb.position.copy(bv[i]); hexGroup.add(sb);
  }

  // Subtle inner glow
  var glowRingGeo = new THREE.RingGeometry(HEX_R * 0.6, HEX_R * 0.85, 6, 1);
  glowRingGeo.rotateZ(Math.PI / 6);
  var glowRingMat = new THREE.MeshBasicMaterial({
    color: INDIGO, transparent: true, opacity: 0.08,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  hexGroup.add(new THREE.Mesh(glowRingGeo, glowRingMat));
  scene.add(hexGroup);

  // ── Checkmark ───────────────────────────────────────────────────
  var checkGroup = new THREE.Group();
  var s = HEX_R * 0.38;
  var cp1 = new THREE.Vector3(-0.50 * s, 0.05 * s, 0);
  var cp2 = new THREE.Vector3(-0.15 * s, -0.45 * s, 0);
  var cp3 = new THREE.Vector3(0.60 * s, 0.45 * s, 0);
  var checkPath = new THREE.CurvePath();
  checkPath.add(new THREE.LineCurve3(cp1, cp2));
  checkPath.add(new THREE.LineCurve3(cp2, cp3));

  var checkTube = HEX_EDGE * 1.4;
  checkGroup.add(new THREE.Mesh(new THREE.TubeGeometry(checkPath, 48, checkTube, TUBE_SIDES, false), checkMat));
  [cp1, cp2, cp3].forEach(function (p) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(checkTube, TUBE_SIDES, TUBE_SIDES), checkMat);
    m.position.copy(p); checkGroup.add(m);
  });

  var checkGlowMat = new THREE.MeshBasicMaterial({
    color: CYAN, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  checkGroup.add(new THREE.Mesh(new THREE.TubeGeometry(checkPath, 48, checkTube * 2.5, 16, false), checkGlowMat));
  checkGroup.position.z = HEX_DEPTH / 2 + 0.02;
  scene.add(checkGroup);

  // ── Particles ───────────────────────────────────────────────────
  var pPos = new Float32Array(PARTICLE_COUNT * 3);
  var pSpeeds = new Float32Array(PARTICLE_COUNT);
  for (var pi = 0; pi < PARTICLE_COUNT; pi++) {
    var pa = Math.random() * Math.PI * 2;
    var pr = 0.8 + Math.random() * 5;
    pPos[pi * 3] = Math.cos(pa) * pr;
    pPos[pi * 3 + 1] = Math.sin(pa) * pr;
    pPos[pi * 3 + 2] = -Math.random() * 80 - 3;
    pSpeeds[pi] = 0.015 + Math.random() * 0.03;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  var pMat = new THREE.PointsMaterial({
    color: 0x94a3b8, size: 0.03, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  scene.add(new THREE.Points(pGeo, pMat));
  var warp = { speed: 1, size: 0.03 };

  // ── Flash ───────────────────────────────────────────────────────
  var flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:10001;';
  splashEl.appendChild(flash);

  // ── Resize / Mouse ──────────────────────────────────────────────
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

    if (!triggered) {
      hexGroup.rotation.y = Math.sin(t * 0.4) * 0.06;
      hexGroup.rotation.x = Math.sin(t * 0.28) * 0.025;
      hexGroup.position.y = Math.sin(t * 0.6) * 0.08;
      checkGroup.rotation.y = hexGroup.rotation.y;
      checkGroup.rotation.x = hexGroup.rotation.x;
      checkGroup.position.y = hexGroup.position.y;
    }

    camera.position.x += (mouseX * 0.15 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.1 - camera.position.y) * 0.04;

    var pos = pGeo.attributes.position.array;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 2] += pSpeeds[i] * warp.speed;
      if (pos[i * 3 + 2] > camera.position.z + 2) {
        pos[i * 3 + 2] = camera.position.z - 60 - Math.random() * 30;
        var a = Math.random() * Math.PI * 2;
        var r = 0.8 + Math.random() * 5;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = Math.sin(a) * r;
      }
    }
    pGeo.attributes.position.needsUpdate = true;
    pMat.size = warp.size;

    fillIndigo.position.z = camera.position.z + 2;
    fillCyan.position.z = camera.position.z + 2;
    backLight.position.z = camera.position.z - 3;

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

    // Snapshot the nav logo text destination
    var navTextTarget = navLogoText ? navLogoText.getBoundingClientRect() : null;

    var tl = gsap.timeline({
      onComplete: function () {
        // Clean up 3D
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
      },
    });

    // 1. Straighten hex
    tl.to(hexGroup.rotation, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' }, 0);
    tl.to(hexGroup.position, { y: 0, duration: 0.3, ease: 'power2.out' }, 0);
    tl.to(checkGroup.rotation, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' }, 0);
    tl.to(checkGroup.position, { y: 0, duration: 0.3, ease: 'power2.out' }, 0);

    // 2. Checkmark dissolves
    tl.to(checkMat, {
      opacity: 0, emissiveIntensity: 0, duration: 0.4, ease: 'power2.in',
      onStart: function () { checkMat.transparent = true; },
    }, 0.15);
    tl.to(checkGlowMat, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.15);

    // 3. Hex scales + camera flies through
    tl.to(hexGroup.scale, { x: 12, y: 12, z: 12, duration: FLY_DURATION, ease: 'power2.inOut' }, 0.3);
    tl.to(camera.position, { z: -25, duration: FLY_DURATION, ease: 'power2.inOut' }, 0.3);

    // 4. Particles warp
    tl.to(warp, { speed: 14, size: 0.08, duration: FLY_DURATION * 0.5, ease: 'power2.in' }, 0.3);
    tl.to(warp, { speed: 4, size: 0.04, duration: FLY_DURATION * 0.5, ease: 'power2.out' }, 0.3 + FLY_DURATION * 0.5);
    tl.to(pMat, { opacity: 0.8, duration: 0.4, ease: 'power2.in' }, 0.4);
    tl.to(pMat, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.3 + FLY_DURATION - 0.6);

    // 5. Flash
    var flashT = 0.3 + FLY_DURATION * 0.42;
    tl.to(flash, { opacity: 0.3, duration: 0.2, ease: 'power1.in' }, flashT);
    tl.to(flash, { opacity: 0, duration: 0.8, ease: 'power2.out' }, flashT + 0.2);

    // 6. Splash fades (including original text — that's fine, we use a clone)
    tl.to(splashEl, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0.3 + FLY_DURATION * 0.4);

    // 7. TEXT FLIGHT — clone approach so splash fade can't interfere
    if (textEl && navTextTarget) {
      // Snapshot position while text is still visible and in the splash
      var startRect = textEl.getBoundingClientRect();
      var startStyles = getComputedStyle(textEl);

      // Create clone — no text-shadow (clean from the start, no compositing overhead)
      var flyText = document.createElement('div');
      flyText.textContent = textEl.textContent;
      flyText.style.cssText =
        'position:fixed;z-index:100000;pointer-events:none;' +
        'font-family:' + startStyles.fontFamily + ';' +
        'font-size:' + startStyles.fontSize + ';' +
        'font-weight:' + startStyles.fontWeight + ';' +
        'color:#fff;white-space:nowrap;' +
        'letter-spacing:' + startStyles.letterSpacing + ';' +
        'left:' + startRect.left + 'px;' +
        'top:' + startRect.top + 'px;' +
        'transform:translate(0,0) scale(1);' +
        'transform-origin:left top;' +
        'will-change:transform,opacity;';
      document.body.appendChild(flyText);

      // Kill all splash content — only the clone exists now
      textEl.style.display = 'none';
      if (hintEl) hintEl.style.display = 'none';
      canvas.style.opacity = '0';

      // Flight math
      var dx = navTextTarget.left - startRect.left;
      var dy = navTextTarget.top - startRect.top;
      var scaleRatio = navTextTarget.height / startRect.height;

      var flyStart = 0.3 + FLY_DURATION * 0.45;
      var flyDur = 1.2;

      // Single transform tween — exact same timing as the version you liked
      tl.to(flyText, {
        transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + scaleRatio + ')',
        duration: flyDur,
        ease: 'power3.inOut',
      }, flyStart);

      // Crossfade at 65% — same as the good version
      tl.to(flyText, {
        opacity: 0,
        duration: flyDur * 0.35,
        ease: 'power2.in',
      }, flyStart + flyDur * 0.65);

      // Reveal nav text at the same moment
      tl.call(function () {
        if (navLogoText) navLogoText.style.opacity = '1';
      }, null, flyStart + flyDur * 0.65);

      // Cleanup
      tl.call(function () {
        if (flyText.parentNode) flyText.parentNode.removeChild(flyText);
      }, null, flyStart + flyDur + 0.1);
    } else {
      // Fallback: just reveal nav text after splash
      if (navLogoText) {
        tl.set(navLogoText, { opacity: 1 }, 0.3 + FLY_DURATION);
      }
    }

    // 8. Hero content fades in
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      tl.to(heroContent, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      }, 0.3 + FLY_DURATION * 0.55);
    }
  }

  // ── Bindings ────────────────────────────────────────────────────
  splashEl.addEventListener('click', triggerFly);
  window.addEventListener('wheel', triggerFly, { once: true });
  window.addEventListener('touchstart', triggerFly, { once: true });
  var autoTimer = setTimeout(triggerFly, AUTO_DELAY);

  // ── Entrance ────────────────────────────────────────────────────
  gsap.fromTo(splashEl, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
  if (textEl) {
    gsap.fromTo(textEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' });
  }
  if (hintEl) {
    gsap.fromTo(hintEl, { opacity: 0 }, { opacity: 0.35, duration: 0.5, delay: 0.8, ease: 'power2.out' });
  }

  animate();
})();
