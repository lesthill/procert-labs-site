/**
 * ProCert Labs - Main Interaction JavaScript
 * Handles all non-marketplace UI interactions.
 * No dependencies. Vanilla JS only.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  /** Throttle a function to fire at most once every `ms` milliseconds. */
  function throttle(fn, ms) {
    let last = 0;
    let raf = null;
    return function () {
      const now = performance.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, arguments);
      } else if (!raf) {
        raf = requestAnimationFrame(function () {
          last = performance.now();
          raf = null;
          fn.apply(this, arguments);
        }.bind(this));
      }
    };
  }

  /** True if the device supports coarse pointer (touch). */
  function isTouchDevice() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  /** Format a number with commas (e.g. 12345 -> "12,345"). */
  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /** Ease-out exponential curve. t in [0,1] -> [0,1]. */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /** Clamp a value between min and max. */
  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const state = {
    scrollY: 0,
    mouseX: 0,
    mouseY: 0,
    isTouch: false,
    isMobile: false,
    navOpen: false,
    cursorRafId: null,
  };

  // ---------------------------------------------------------------------------
  // DOM references (populated in init)
  // ---------------------------------------------------------------------------

  let dom = {};

  function cacheDom() {
    dom.navbar = document.getElementById('navbar');
    dom.navToggle = document.getElementById('navToggle');
    dom.navLinks = document.getElementById('navLinks');
    dom.cursorGlow = document.getElementById('cursorGlow');
    dom.contactForm = document.getElementById('contactForm');
    dom.processSection = document.getElementById('process');
    dom.sections = document.querySelectorAll('section[id]');
    dom.navAnchors = dom.navLinks
      ? dom.navLinks.querySelectorAll('a[href^="#"]')
      : [];
    dom.allAnchorLinks = document.querySelectorAll('a[href^="#"]');
    dom.animateInEls = document.querySelectorAll('.animate-in');
    dom.statNumbers = document.querySelectorAll('.stat-number[data-target]');
    dom.programCards = document.querySelectorAll('.program-card');
    dom.heroOrbs = document.querySelectorAll('.hero-gradient-orb');
    dom.seal3d = document.querySelector('.seal-3d');
    dom.processLine = document.querySelector('.process-line');
    dom.skipLink = document.querySelector('.skip-to-content');
  }

  // ---------------------------------------------------------------------------
  // 1. Navbar scroll effect
  // ---------------------------------------------------------------------------

  function handleNavbarScroll() {
    if (!dom.navbar) return;
    if (window.scrollY > 50) {
      dom.navbar.classList.add('scrolled');
    } else {
      dom.navbar.classList.remove('scrolled');
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Mobile nav toggle
  // ---------------------------------------------------------------------------

  function openMobileNav() {
    if (!dom.navLinks || !dom.navToggle) return;
    state.navOpen = true;
    dom.navLinks.classList.add('nav-open');
    dom.navToggle.classList.add('active');
    dom.navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    if (!dom.navLinks || !dom.navToggle) return;
    state.navOpen = false;
    dom.navLinks.classList.remove('nav-open');
    dom.navToggle.classList.remove('active');
    dom.navToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileNav() {
    state.navOpen ? closeMobileNav() : openMobileNav();
  }

  function initMobileNav() {
    if (!dom.navToggle) return;

    dom.navToggle.setAttribute('aria-expanded', 'false');
    dom.navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileNav();
    });

    // Close on nav link click
    if (dom.navLinks) {
      dom.navLinks.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          closeMobileNav();
        }
      });
    }

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        state.navOpen &&
        dom.navLinks &&
        !dom.navLinks.contains(e.target) &&
        !dom.navToggle.contains(e.target)
      ) {
        closeMobileNav();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Smooth scroll for anchor links
  // ---------------------------------------------------------------------------

  function initSmoothScroll() {
    var NAV_OFFSET = 80;

    dom.allAnchorLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        var top =
          target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

        window.scrollTo({
          top: top,
          behavior: 'smooth',
        });

        // Update URL without jumping
        history.pushState(null, '', href);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Cursor glow
  // ---------------------------------------------------------------------------

  function initCursorGlow() {
    if (!dom.cursorGlow || state.isTouch) return;

    var glowX = 0;
    var glowY = 0;
    var targetX = 0;
    var targetY = 0;

    function updateGlow() {
      // Smooth lerp for buttery feel
      glowX += (targetX - glowX) * 0.15;
      glowY += (targetY - glowY) * 0.15;

      dom.cursorGlow.style.transform =
        'translate3d(' + (glowX - 200) + 'px,' + (glowY - 200) + 'px, 0)';

      state.cursorRafId = requestAnimationFrame(updateGlow);
    }

    document.addEventListener(
      'mousemove',
      function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
      },
      { passive: true }
    );

    // Start the animation loop
    state.cursorRafId = requestAnimationFrame(updateGlow);

    // Show glow on mouse enter, hide on leave
    document.addEventListener('mouseenter', function () {
      dom.cursorGlow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', function () {
      dom.cursorGlow.style.opacity = '0';
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Scroll animations (animate-in with staggered delays)
  // ---------------------------------------------------------------------------

  function initScrollAnimations() {
    if (!dom.animateInEls.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;

            // Determine stagger delay from .delay-N class
            var delay = 0;
            for (var i = 1; i <= 5; i++) {
              if (el.classList.contains('delay-' + i)) {
                delay = i * 100; // 100ms per step
                break;
              }
            }

            setTimeout(function () {
              el.classList.add('visible');
            }, delay);

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    dom.animateInEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Counter animation
  // ---------------------------------------------------------------------------

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    var duration = 2000; // 2 seconds
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var easedProgress = easeOutExpo(progress);
      var current = Math.round(easedProgress * target);

      var display = target > 999 ? formatNumber(current) : current.toString();
      el.textContent = display + '+';

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function initCounterAnimation() {
    if (!dom.statNumbers.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    dom.statNumbers.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Process timeline scroll fill
  // ---------------------------------------------------------------------------

  function updateProcessLine() {
    if (!dom.processSection || !dom.processLine) return;

    var rect = dom.processSection.getBoundingClientRect();
    var sectionHeight = rect.height;
    var viewportHeight = window.innerHeight;

    // Calculate how far through the section we've scrolled
    // Line starts filling when section top hits bottom of viewport
    // Line finishes filling when section bottom hits top of viewport
    var scrollProgress = (viewportHeight - rect.top) / (sectionHeight + viewportHeight);
    var fillPercent = clamp(scrollProgress * 100, 0, 100);

    dom.processLine.style.setProperty('--fill-height', fillPercent + '%');
  }

  // ---------------------------------------------------------------------------
  // 8. Program card tilt effect
  // ---------------------------------------------------------------------------

  function initCardTilt() {
    if (!dom.programCards.length || state.isTouch || state.isMobile) return;

    dom.programCards.forEach(function (card) {
      card.addEventListener(
        'mousemove',
        function (e) {
          var rect = card.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;

          // Normalize to -1 .. 1
          var normX = (x / rect.width - 0.5) * 2;
          var normY = (y / rect.height - 0.5) * 2;

          // Max 5 degrees of tilt
          var rotateX = -normY * 5;
          var rotateY = normX * 5;

          card.style.transform =
            'perspective(800px) rotateX(' +
            rotateX +
            'deg) rotateY(' +
            rotateY +
            'deg) scale3d(1.02, 1.02, 1.02)';
          card.style.transition = 'transform 0.1s ease-out';
        },
        { passive: true }
      );

      card.addEventListener(
        'mouseleave',
        function () {
          card.style.transform =
            'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
          card.style.transition = 'transform 0.4s ease-out';
        },
        { passive: true }
      );
    });
  }

  // ---------------------------------------------------------------------------
  // 9. Active nav link based on scroll position
  // ---------------------------------------------------------------------------

  function initActiveNavLink() {
    if (!dom.sections.length || !dom.navAnchors.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');

            dom.navAnchors.forEach(function (anchor) {
              anchor.classList.remove('active');
              if (anchor.getAttribute('href') === '#' + id) {
                anchor.classList.add('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    dom.sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ---------------------------------------------------------------------------
  // 10. Contact form validation and success state
  // ---------------------------------------------------------------------------

  function initContactForm() {
    if (!dom.contactForm) return;

    dom.contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Gather fields
      var fields = dom.contactForm.querySelectorAll(
        'input[required], textarea[required], select[required]'
      );
      var valid = true;

      fields.forEach(function (field) {
        // Remove previous error state
        field.classList.remove('error');

        var value = field.value.trim();

        if (!value) {
          valid = false;
          field.classList.add('error');
          return;
        }

        // Email validation
        if (field.type === 'email') {
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            valid = false;
            field.classList.add('error');
          }
        }

        // Phone validation (if present)
        if (field.type === 'tel' && value) {
          var phonePattern = /^[\d\s\-+().]{7,}$/;
          if (!phonePattern.test(value)) {
            valid = false;
            field.classList.add('error');
          }
        }
      });

      if (!valid) {
        // Shake the form briefly
        dom.contactForm.classList.add('shake');
        setTimeout(function () {
          dom.contactForm.classList.remove('shake');
        }, 600);
        return;
      }

      // Show success state
      var formRect = dom.contactForm.getBoundingClientRect();
      dom.contactForm.style.minHeight = formRect.height + 'px';
      dom.contactForm.classList.add('form-success');

      dom.contactForm.innerHTML =
        '<div class="form-success-message">' +
        '<div class="success-icon">' +
        '<svg width="64" height="64" viewBox="0 0 64 64" fill="none">' +
        '<circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2" opacity="0.3"/>' +
        '<path d="M20 33L28 41L44 25" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '</div>' +
        '<h3>Message Sent</h3>' +
        '<p>Thank you for reaching out. We\'ll be in touch within 24 hours.</p>' +
        '</div>';
    });

    // Live validation: clear error on input
    dom.contactForm.addEventListener('input', function (e) {
      if (e.target.classList.contains('error')) {
        e.target.classList.remove('error');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 11. Parallax on hero orbs
  // ---------------------------------------------------------------------------

  function updateHeroOrbs() {
    if (!dom.heroOrbs.length) return;

    var scrollY = window.scrollY;

    dom.heroOrbs.forEach(function (orb, index) {
      // Each orb moves at a different rate
      var rate = 0.03 + index * 0.02;
      var yOffset = scrollY * rate;
      orb.style.transform = 'translateY(' + yOffset + 'px)';
    });
  }

  // ---------------------------------------------------------------------------
  // 12. Section reveal on scroll
  // ---------------------------------------------------------------------------

  function initSectionReveal() {
    if (!dom.sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    dom.sections.forEach(function (section) {
      // Only add reveal behavior if section doesn't already have it
      if (!section.classList.contains('no-reveal')) {
        section.classList.add('section-reveal');
        observer.observe(section);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 13. Seal 3D parallax tilt
  // ---------------------------------------------------------------------------

  function initSealAnimation() {
    if (!dom.seal3d || state.isTouch || state.isMobile) return;

    document.addEventListener(
      'mousemove',
      function (e) {
        var rect = dom.seal3d.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;

        // Distance from center of seal
        var deltaX = (e.clientX - centerX) / window.innerWidth;
        var deltaY = (e.clientY - centerY) / window.innerHeight;

        // Subtle rotation (max ~8 degrees)
        var rotateY = deltaX * 8;
        var rotateX = -deltaY * 8;

        dom.seal3d.style.transform =
          'perspective(600px) rotateX(' +
          rotateX +
          'deg) rotateY(' +
          rotateY +
          'deg)';
      },
      { passive: true }
    );
  }

  // ---------------------------------------------------------------------------
  // 14. Combined throttled scroll handler
  // ---------------------------------------------------------------------------

  var onScroll = throttle(function () {
    state.scrollY = window.scrollY;
    handleNavbarScroll();
    updateProcessLine();
    updateHeroOrbs();
  }, 16);

  // ---------------------------------------------------------------------------
  // 15. Keyboard accessibility
  // ---------------------------------------------------------------------------

  function initAccessibility() {
    // Escape closes mobile nav
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.navOpen) {
        closeMobileNav();
        if (dom.navToggle) dom.navToggle.focus();
      }
    });

    // Skip-to-content link
    if (dom.skipLink) {
      dom.skipLink.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = this.getAttribute('href');
        var target = document.querySelector(targetId);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
        }
      });
    }

    // Visible focus ring only for keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', function () {
      document.body.classList.remove('keyboard-nav');
    });
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------

  function init() {
    state.isTouch = isTouchDevice();
    state.isMobile = window.innerWidth < 768;

    cacheDom();

    // Event listeners (passive where possible)
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize handler to update mobile state
    window.addEventListener(
      'resize',
      throttle(function () {
        state.isMobile = window.innerWidth < 768;

        // Close mobile nav if we resize to desktop
        if (!state.isMobile && state.navOpen) {
          closeMobileNav();
        }
      }, 200),
      { passive: true }
    );

    // Initialize modules
    initMobileNav();
    initSmoothScroll();
    initCursorGlow();
    initScrollAnimations();
    initCounterAnimation();
    initCardTilt();
    initActiveNavLink();
    initContactForm();
    initSectionReveal();
    initSealAnimation();
    initAccessibility();

    // Run scroll handler once on load to set initial state
    handleNavbarScroll();
    updateProcessLine();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
