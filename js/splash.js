/**
 * ProCert Labs — Premium Splash Screen Fly-Through
 *
 * Cinematic drone-through-the-logo animation using Three.js + GSAP.
 * Expects global THREE and gsap to be loaded via CDN script tags.
 *
 * DOM contract:
 *   #splashScreen  — full-viewport overlay
 *   #splashCanvas  — Three.js render target
 *   .splash-text   — "ProCert Labs" label
 *   .splash-hint   — "Click anywhere to enter"
 */
;(function () {
  'use strict';

  // ---------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------
  if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
    console.warn('[splash] THREE or gsap not found — skipping splash.');
    var el = document.getElementById('splashScreen');
    if (el) el.style.display = 'none';
    return;
  }

  // ---------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------
  var BG            = 0x050510;
  var INDIGO        = 0x6366f1;
  var CYAN          = 0x06b6d4;
  var WHITE         = 0xffffff;
  var PARTICLE_COUNT = 2500;
  var AUTO_DELAY     = 3000;   // ms before auto-trigger
  var FLY_DURATION   = 1.8;    // seconds for the fly-through
  var HEX_RADIUS     = 2.2;
  var HEX_TUBE       = 0.16;   // tube radius for the hexagon frame edges
  var HEX_DEPTH      = 1.0;    // how deep the hexagonal tunnel is

  // ---------------------------------------------------------------
  // DOM references
  // ---------------------------------------------------------------
  var splashEl   = document.getElementById('splashScreen');
  var canvas     = document.getElementById('splashCanvas');
  var textEl     = splashEl ? splashEl.querySelector('.splash-text') : null;
  var hintEl     = splashEl ? splashEl.querySelector('.splash-hint') : null;

  if (!splashEl || !canvas) {
    console.warn('[splash] Missing DOM elements — skipping.');
    return;
  }

  // ---------------------------------------------------------------
  // State
  // ---------------------------------------------------------------
  var triggered   = false;
  var alive       = true;
  var clock       = new THREE.Clock();
  var mouseX      = 0;
  var mouseY      = 0;

  // ---------------------------------------------------------------
  // Renderer
  // ---------------------------------------------------------------
  var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  var renderer   = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;

  // ---------------------------------------------------------------
  // Scene & Camera
  // ---------------------------------------------------------------
  var scene  = new THREE.Scene();
  scene.fog  = new THREE.FogExp2(BG, 0.012);

  var camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 6);

  // ---------------------------------------------------------------
  // Lighting
  // ---------------------------------------------------------------
  var ambientLight = new THREE.AmbientLight(WHITE, 0.5);
  scene.add(ambientLight);

  var pointIndigo = new THREE.PointLight(INDIGO, 6, 30);
  pointIndigo.position.set(-3, 2, 5);
  scene.add(pointIndigo);

  var pointCyan = new THREE.PointLight(CYAN, 6, 30);
  pointCyan.position.set(3, -2, 5);
  scene.add(pointCyan);

  var rimLight = new THREE.PointLight(WHITE, 3, 20);
  rimLight.position.set(0, 0, 9);
  scene.add(rimLight);

  // Front fill light so the hexagon pops
  var frontFill = new THREE.PointLight(0x8b5cf6, 4, 15);
  frontFill.position.set(0, 0, 3);
  scene.add(frontFill);

  // ---------------------------------------------------------------
  // Helper — hexagon vertex positions (flat-top)
  // ---------------------------------------------------------------
  function hexPoints(radius, z) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI / 3) * i - Math.PI / 6; // flat-top orientation
      pts.push(new THREE.Vector3(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        z || 0
      ));
    }
    return pts;
  }

  // ---------------------------------------------------------------
  // Hexagonal Frame (tube-based edges — hollow, fly-through-able)
  // ---------------------------------------------------------------
  var hexGroup = new THREE.Group();

  var frameMat = new THREE.MeshStandardMaterial({
    color: 0x4f46e5,
    emissive: INDIGO,
    emissiveIntensity: 1.2,
    metalness: 0.9,
    roughness: 0.15,
  });

  // Front ring, back ring, and connecting struts form the 3D tunnel frame
  function buildHexRing(z) {
    var pts = hexPoints(HEX_RADIUS, z);
    var group = new THREE.Group();
    for (var i = 0; i < 6; i++) {
      var a = pts[i];
      var b = pts[(i + 1) % 6];
      var path = new THREE.LineCurve3(a, b);
      var tubeGeo = new THREE.TubeGeometry(path, 4, HEX_TUBE, 32, false);
      var mesh = new THREE.Mesh(tubeGeo, frameMat);
      group.add(mesh);

      // Sphere at each vertex for perfectly smooth joins
      var sphereGeo = new THREE.SphereGeometry(HEX_TUBE, 32, 32);
      var sphere = new THREE.Mesh(sphereGeo, frameMat);
      sphere.position.copy(a);
      group.add(sphere);
    }
    return group;
  }

  // Front and back hex rings
  var frontRing = buildHexRing(HEX_DEPTH / 2);
  hexGroup.add(frontRing);

  var backRing = buildHexRing(-HEX_DEPTH / 2);
  hexGroup.add(backRing);

  // Connecting struts between front and back at each vertex
  var frontPts = hexPoints(HEX_RADIUS, HEX_DEPTH / 2);
  var backPts  = hexPoints(HEX_RADIUS, -HEX_DEPTH / 2);
  for (var i = 0; i < 6; i++) {
    var path = new THREE.LineCurve3(frontPts[i], backPts[i]);
    var strutGeo = new THREE.TubeGeometry(path, 4, HEX_TUBE, 32, false);
    var strut = new THREE.Mesh(strutGeo, frameMat);
    hexGroup.add(strut);
  }

  // Inner glow plane (additive, semi-transparent hex disc gives bloom feel)
  var glowShape = new THREE.Shape();
  var gPts = hexPoints(HEX_RADIUS * 0.95, 0);
  glowShape.moveTo(gPts[0].x, gPts[0].y);
  for (var g = 1; g < 6; g++) {
    glowShape.lineTo(gPts[g].x, gPts[g].y);
  }
  glowShape.closePath();

  // Cut a smaller hex hole so it is a ring / halo, not a solid fill
  var holePoints = hexPoints(HEX_RADIUS * 0.7, 0);
  var holePath = new THREE.Path();
  holePath.moveTo(holePoints[0].x, holePoints[0].y);
  for (var h = 1; h < 6; h++) {
    holePath.lineTo(holePoints[h].x, holePoints[h].y);
  }
  holePath.closePath();
  glowShape.holes.push(holePath);

  var glowGeo = new THREE.ShapeGeometry(glowShape);
  var glowMat = new THREE.MeshBasicMaterial({
    color: INDIGO,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  var glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.z = 0;
  hexGroup.add(glowMesh);

  scene.add(hexGroup);

  // ---------------------------------------------------------------
  // Checkmark
  // ---------------------------------------------------------------
  var checkGroup = new THREE.Group();

  // Checkmark path: short stroke down-right, then long stroke up-right
  var checkPath = new THREE.CurvePath();
  var p1 = new THREE.Vector3(-0.55, 0.0, 0);
  var p2 = new THREE.Vector3(-0.15, -0.45, 0);
  var p3 = new THREE.Vector3(0.65, 0.5, 0);
  checkPath.add(new THREE.LineCurve3(p1, p2));
  checkPath.add(new THREE.LineCurve3(p2, p3));

  var checkGeo = new THREE.TubeGeometry(checkPath, 64, 0.1, 32, false);
  var checkMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: CYAN,
    emissiveIntensity: 1.5,
    metalness: 0.7,
    roughness: 0.2,
  });
  var checkMesh = new THREE.Mesh(checkGeo, checkMat);
  checkGroup.add(checkMesh);

  // Checkmark glow halo (additive)
  var checkGlowGeo = new THREE.TubeGeometry(checkPath, 64, 0.25, 32, false);
  var checkGlowMat = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  var checkGlow = new THREE.Mesh(checkGlowGeo, checkGlowMat);
  checkGroup.add(checkGlow);

  checkGroup.position.z = HEX_DEPTH / 2 + 0.05; // sit just in front of hexagon
  scene.add(checkGroup);

  // ---------------------------------------------------------------
  // Particles (tunnel / warp field)
  // ---------------------------------------------------------------
  var particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  var particleSpeeds    = new Float32Array(PARTICLE_COUNT);
  var particleBaseAlpha = new Float32Array(PARTICLE_COUNT);

  // Distribute in a cylindrical tunnel stretching behind the logo
  for (var pi = 0; pi < PARTICLE_COUNT; pi++) {
    var angle  = Math.random() * Math.PI * 2;
    var radius = 0.4 + Math.random() * 4.5;
    var z      = -Math.random() * 80 - 2;

    particlePositions[pi * 3]     = Math.cos(angle) * radius;
    particlePositions[pi * 3 + 1] = Math.sin(angle) * radius;
    particlePositions[pi * 3 + 2] = z;

    particleSpeeds[pi]    = 0.02 + Math.random() * 0.04;
    particleBaseAlpha[pi] = 0.3 + Math.random() * 0.7;
  }

  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  var particleMat = new THREE.PointsMaterial({
    color: 0xa5b4fc,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  var particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Warp speed multiplier — animated by GSAP during fly-through
  var warpState = { speed: 1, particleSize: 0.04 };

  // ---------------------------------------------------------------
  // White flash overlay (CSS-driven for simplicity)
  // ---------------------------------------------------------------
  var flashOverlay = document.createElement('div');
  flashOverlay.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'background:#fff;opacity:0;pointer-events:none;z-index:10001;';
  splashEl.appendChild(flashOverlay);

  // ---------------------------------------------------------------
  // Resize handler
  // ---------------------------------------------------------------
  function onResize() {
    if (!alive) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Subtle parallax from mouse
  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener('mousemove', onMouseMove);

  // ---------------------------------------------------------------
  // Render loop
  // ---------------------------------------------------------------
  var rafId;

  function animate() {
    if (!alive) return;
    rafId = requestAnimationFrame(animate);

    var t = clock.getElapsedTime();

    // -- Idle hover for hexagon --
    if (!triggered) {
      hexGroup.rotation.y = Math.sin(t * 0.5) * 0.12;
      hexGroup.rotation.x = Math.sin(t * 0.35) * 0.05;
      hexGroup.position.y = Math.sin(t * 0.8) * 0.15;
      checkGroup.rotation.y = hexGroup.rotation.y;
      checkGroup.rotation.x = hexGroup.rotation.x;
      checkGroup.position.y = hexGroup.position.y;
    }

    // Subtle camera sway from mouse
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.05;

    // -- Particles drift / warp --
    var positions = particleGeo.attributes.position.array;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 2] += particleSpeeds[i] * warpState.speed;

      // Reset particles that pass the camera
      if (positions[i * 3 + 2] > camera.position.z + 2) {
        positions[i * 3 + 2] = camera.position.z - 60 - Math.random() * 30;
        var a = Math.random() * Math.PI * 2;
        var r = 0.4 + Math.random() * 4.5;
        positions[i * 3]     = Math.cos(a) * r;
        positions[i * 3 + 1] = Math.sin(a) * r;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Update particle size during warp
    particleMat.size = warpState.particleSize;

    // Lights follow camera loosely during fly-through
    pointIndigo.position.z = camera.position.z + 1;
    pointCyan.position.z   = camera.position.z + 1;
    rimLight.position.z    = camera.position.z + 3;

    renderer.render(scene, camera);
  }

  // ---------------------------------------------------------------
  // Trigger the fly-through
  // ---------------------------------------------------------------
  function triggerFlyThrough() {
    if (triggered) return;
    triggered = true;

    // Remove interaction listeners
    splashEl.removeEventListener('click', triggerFlyThrough);
    window.removeEventListener('wheel', triggerFlyThrough);
    window.removeEventListener('touchstart', triggerFlyThrough);

    // Fade hint immediately
    if (hintEl) {
      gsap.to(hintEl, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    }

    // Master timeline — delay cleanup so canvas doesn't rip out mid-frame
    var tl = gsap.timeline({
      onComplete: function () {
        // Let the fade fully settle before destroying anything
        setTimeout(cleanup, 200);
      },
    });

    // 1. Checkmark fades out
    tl.to(checkMat, {
      opacity: 0,
      emissiveIntensity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onStart: function () { checkMat.transparent = true; },
    }, 0);
    tl.to(checkGlowMat, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    }, 0);

    // 2. Hexagon scales up (camera fits through the tunnel)
    tl.to(hexGroup.scale, {
      x: 10, y: 10, z: 10,
      duration: FLY_DURATION,
      ease: 'power2.inOut',
    }, 0.2);

    // 3. Camera flies forward — smooth in AND out, no dead stop
    tl.to(camera.position, {
      z: -30,
      duration: FLY_DURATION,
      ease: 'power2.inOut',
    }, 0.2);

    // 4. Warp speed particles — smooth ramp up then ease down
    tl.to(warpState, {
      speed: 18,
      particleSize: 0.12,
      duration: FLY_DURATION * 0.5,
      ease: 'power2.in',
    }, 0.2);
    tl.to(warpState, {
      speed: 6,
      particleSize: 0.06,
      duration: FLY_DURATION * 0.5,
      ease: 'power2.out',
    }, 0.2 + FLY_DURATION * 0.5);

    // 5. Particle opacity: ramp up then fade
    tl.to(particleMat, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.in',
    }, 0.3);
    tl.to(particleMat, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, 0.2 + FLY_DURATION - 0.5);

    // 6. White flash at the midpoint — gentler
    tl.to(flashOverlay, {
      opacity: 0.5,
      duration: 0.2,
      ease: 'power1.in',
    }, 0.2 + FLY_DURATION * 0.45);
    tl.to(flashOverlay, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, 0.2 + FLY_DURATION * 0.45 + 0.2);

    // 7. Text fades
    if (textEl) {
      tl.to(textEl, {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: 'power2.in',
      }, 0.1);
    }

    // 8. Splash fades out — start earlier, take longer, buttery smooth
    tl.to(splashEl, {
      opacity: 0,
      duration: 1.0,
      ease: 'power1.out',
    }, 0.2 + FLY_DURATION * 0.5);
  }

  // ---------------------------------------------------------------
  // Cleanup — dispose Three.js resources, remove DOM
  // ---------------------------------------------------------------
  function cleanup() {
    alive = false;
    cancelAnimationFrame(rafId);

    // Dispose geometries and materials
    scene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(function (m) { m.dispose(); });
        } else {
          obj.material.dispose();
        }
      }
    });

    renderer.dispose();

    // Remove from DOM
    splashEl.style.display = 'none';
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    if (flashOverlay.parentNode) flashOverlay.parentNode.removeChild(flashOverlay);

    // Remove listeners
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);

    // Dispatch custom event so the rest of the site knows the splash is done
    window.dispatchEvent(new CustomEvent('splashComplete'));
  }

  // ---------------------------------------------------------------
  // Event bindings
  // ---------------------------------------------------------------
  splashEl.addEventListener('click', triggerFlyThrough);
  window.addEventListener('wheel', triggerFlyThrough, { once: true });
  window.addEventListener('touchstart', triggerFlyThrough, { once: true });

  // Auto-trigger after delay
  var autoTimer = setTimeout(function () {
    triggerFlyThrough();
  }, AUTO_DELAY);

  // ---------------------------------------------------------------
  // Kick off
  // ---------------------------------------------------------------
  // Subtle entrance: fade the splash elements in
  gsap.fromTo(splashEl, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' });
  if (textEl) {
    gsap.fromTo(textEl,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power2.out' }
    );
  }
  if (hintEl) {
    gsap.fromTo(hintEl,
      { opacity: 0 },
      { opacity: 0.6, duration: 0.8, delay: 1.2, ease: 'power2.out' }
    );
  }

  animate();

})();
