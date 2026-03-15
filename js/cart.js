/**
 * ProCert Labs — Shopping Cart System
 * Premium slide-out cart panel for the courseware marketplace.
 * Self-contained: injects its own styles.
 */

(function () {
  'use strict';

  // ─── Constants ──────────────────────────────────────────────────────
  var STORAGE_KEY = 'procert-cart';
  var PROGRAM_COLORS = {
    mos:     { bg: '#dbeafe', text: '#1e40af' },
    mta:     { bg: '#ede9fe', text: '#5b21b6' },
    comptia: { bg: '#dcfce7', text: '#166534' },
    adobe:   { bg: '#fee2e2', text: '#991b1b' },
    ic3:     { bg: '#fef9c3', text: '#854d0e' },
    cisco:   { bg: '#cffafe', text: '#155e75' }
  };
  var MAX_TOASTS = 3;
  var toastQueue = [];

  // ─── Cart Data Model ───────────────────────────────────────────────
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function addToCart(item) {
    var cart = getCart();
    // Don't add duplicates
    if (cart.some(function (c) { return c.id === item.id; })) {
      return false;
    }
    cart.push({
      id: item.id,
      title: item.title,
      publisher: item.publisher,
      program: item.program,
      exam: item.exam,
      examName: item.examName,
      rating: item.rating,
      coverageScore: item.coverageScore,
      formats: item.formats,
      quantity: 1
    });
    saveCart(cart);
    return true;
  }

  function removeFromCart(id) {
    var cart = getCart();
    cart = cart.filter(function (c) { return c.id !== id; });
    saveCart(cart);
  }

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getCartCount() {
    return getCart().length;
  }

  // ─── Inject Styles ─────────────────────────────────────────────────
  function injectCartStyles() {
    var style = document.createElement('style');
    style.id = 'procert-cart-styles';
    style.textContent =
      /* ── Cart Icon Button ── */
      '.cart-icon-btn{' +
        'position:fixed;right:2rem;top:5rem;z-index:900;' +
        'width:52px;height:52px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);' +
        'background:rgba(12,12,24,0.85);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);' +
        'color:#f8fafc;font-size:20px;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;' +
        'transition:all 0.3s cubic-bezier(0.16,1,0.3,1);' +
        'box-shadow:0 4px 24px rgba(0,0,0,0.25);' +
      '}' +
      '.cart-icon-btn:hover{' +
        'background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.3);' +
        'transform:scale(1.05);box-shadow:0 8px 32px rgba(99,102,241,0.15);' +
      '}' +
      '.cart-icon-btn:active{transform:scale(0.97);}' +
      '.cart-icon-btn.scrolled{opacity:0.7;}' +
      '.cart-icon-btn.scrolled:hover{opacity:1;}' +
      '.cart-count-badge{' +
        'position:absolute;top:-6px;right:-6px;' +
        'min-width:20px;height:20px;border-radius:10px;' +
        'background:linear-gradient(135deg,#6366f1,#8b5cf6);' +
        'color:#fff;font-size:11px;font-weight:700;font-family:"Inter","Space Grotesk",sans-serif;' +
        'display:flex;align-items:center;justify-content:center;' +
        'padding:0 5px;opacity:0;transform:scale(0);' +
        'transition:all 0.35s cubic-bezier(0.16,1,0.3,1);' +
      '}' +
      '.cart-count-badge.visible{opacity:1;transform:scale(1);}' +
      '.cart-count-badge.bounce{animation:cartBadgeBounce 0.5s cubic-bezier(0.16,1,0.3,1);}' +
      '@keyframes cartBadgeBounce{0%{transform:scale(1);}30%{transform:scale(1.35);}60%{transform:scale(0.9);}100%{transform:scale(1);}}' +

      /* ── Cart Overlay ── */
      '.cart-overlay{' +
        'position:fixed;inset:0;z-index:9990;' +
        'background:rgba(0,0,0,0);' +
        'pointer-events:none;' +
        'transition:background 0.4s cubic-bezier(0.16,1,0.3,1);' +
      '}' +
      '.cart-overlay.active{background:rgba(0,0,0,0.5);pointer-events:all;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}' +

      /* ── Cart Panel ── */
      '.cart-panel{' +
        'position:fixed;top:0;right:0;bottom:0;z-index:9991;' +
        'width:420px;max-width:100vw;' +
        'background:rgba(12,12,24,0.98);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);' +
        'border-left:1px solid rgba(255,255,255,0.08);' +
        'display:flex;flex-direction:column;' +
        'transform:translateX(100%);' +
        'transition:transform 0.45s cubic-bezier(0.16,1,0.3,1);' +
        'box-shadow:-16px 0 64px rgba(0,0,0,0.4);' +
        'font-family:"Inter","Space Grotesk",sans-serif;' +
      '}' +
      '.cart-panel.open{transform:translateX(0);}' +

      /* ── Panel Header ── */
      '.cart-panel-header{' +
        'display:flex;align-items:center;gap:12px;' +
        'padding:24px 24px 20px;' +
        'border-bottom:1px solid rgba(255,255,255,0.08);' +
        'flex-shrink:0;' +
      '}' +
      '.cart-panel-header h2{' +
        'font-size:18px;font-weight:600;color:#f8fafc;margin:0;flex:1;' +
        'letter-spacing:-0.01em;' +
      '}' +
      '.cart-header-count{' +
        'font-size:13px;font-weight:500;color:#94a3b8;' +
        'background:rgba(255,255,255,0.05);padding:3px 10px;border-radius:20px;' +
      '}' +
      '.cart-close-btn{' +
        'width:36px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);' +
        'background:rgba(255,255,255,0.03);color:#94a3b8;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;font-size:14px;' +
        'transition:all 0.2s ease;' +
      '}' +
      '.cart-close-btn:hover{background:rgba(255,255,255,0.08);color:#f8fafc;}' +

      /* ── Panel Body (scrollable) ── */
      '.cart-panel-body{' +
        'flex:1;overflow-y:auto;padding:16px 24px;' +
        'scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.08) transparent;' +
      '}' +
      '.cart-panel-body::-webkit-scrollbar{width:6px;}' +
      '.cart-panel-body::-webkit-scrollbar-track{background:transparent;}' +
      '.cart-panel-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px;}' +

      /* ── Cart Item ── */
      '.cart-item{' +
        'position:relative;' +
        'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);' +
        'border-radius:14px;padding:16px;margin-bottom:12px;' +
        'transition:all 0.4s cubic-bezier(0.16,1,0.3,1);' +
        'overflow:hidden;' +
      '}' +
      '.cart-item:hover{border-color:rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);}' +
      '.cart-item.removing{transform:translateX(-100%);opacity:0;margin-bottom:-70px;padding-top:0;padding-bottom:0;}' +
      '.cart-item-badge{' +
        'display:inline-block;padding:3px 9px;border-radius:6px;' +
        'font-size:11px;font-weight:600;letter-spacing:0.02em;margin-bottom:8px;' +
      '}' +
      '.cart-item-title{' +
        'font-size:14px;font-weight:600;color:#f8fafc;line-height:1.35;margin-bottom:4px;' +
        'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;' +
      '}' +
      '.cart-item-publisher{font-size:12px;color:#64748b;margin-bottom:8px;}' +
      '.cart-item-meta{display:flex;align-items:center;gap:12px;font-size:12px;color:#94a3b8;}' +
      '.cart-item-meta .stars{color:#eab308;font-size:10px;display:flex;gap:1px;}' +
      '.cart-item-meta .coverage{color:#06b6d4;font-weight:600;}' +
      '.cart-item-remove{' +
        'position:absolute;top:12px;right:12px;' +
        'width:28px;height:28px;border-radius:8px;border:none;' +
        'background:transparent;color:#64748b;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;font-size:12px;' +
        'transition:all 0.2s ease;' +
      '}' +
      '.cart-item-remove:hover{background:rgba(239,68,68,0.1);color:#ef4444;transform:translateX(-2px);}' +

      /* ── Empty State ── */
      '.cart-empty{' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'padding:60px 20px;text-align:center;' +
      '}' +
      '.cart-empty-icon{font-size:48px;color:rgba(99,102,241,0.2);margin-bottom:20px;}' +
      '.cart-empty h3{font-size:16px;color:#94a3b8;font-weight:500;margin:0 0 8px;}' +
      '.cart-empty p{font-size:13px;color:#64748b;margin:0 0 20px;}' +
      '.cart-empty-link{' +
        'font-size:13px;color:#6366f1;cursor:pointer;' +
        'text-decoration:none;font-weight:500;' +
        'transition:color 0.2s;' +
      '}' +
      '.cart-empty-link:hover{color:#8b5cf6;}' +

      /* ── Panel Footer ── */
      '.cart-panel-footer{' +
        'padding:20px 24px 24px;' +
        'border-top:1px solid rgba(255,255,255,0.08);' +
        'flex-shrink:0;' +
      '}' +
      '.cart-subtotal{' +
        'display:flex;align-items:center;justify-content:space-between;' +
        'margin-bottom:16px;font-size:14px;' +
      '}' +
      '.cart-subtotal-label{color:#94a3b8;}' +
      '.cart-subtotal-value{color:#f8fafc;font-weight:600;font-size:15px;}' +
      '.cart-checkout-btn{' +
        'width:100%;height:48px;border:none;border-radius:12px;' +
        'background:linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4);' +
        'background-size:200% 200%;' +
        'color:#fff;font-size:15px;font-weight:600;font-family:inherit;' +
        'cursor:pointer;letter-spacing:0.01em;' +
        'transition:all 0.3s cubic-bezier(0.16,1,0.3,1);' +
        'display:flex;align-items:center;justify-content:center;gap:8px;' +
      '}' +
      '.cart-checkout-btn:hover{background-position:100% 100%;transform:translateY(-1px);box-shadow:0 8px 24px rgba(99,102,241,0.3);}' +
      '.cart-checkout-btn:active{transform:translateY(0);box-shadow:none;}' +
      '.cart-checkout-btn:disabled{opacity:0.4;cursor:default;transform:none;box-shadow:none;}' +

      /* ── Success State ── */
      '.cart-success{' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'padding:60px 20px;text-align:center;' +
      '}' +
      '.cart-success-icon{' +
        'width:64px;height:64px;border-radius:50%;' +
        'background:linear-gradient(135deg,#6366f1,#06b6d4);' +
        'display:flex;align-items:center;justify-content:center;' +
        'font-size:28px;color:#fff;margin-bottom:20px;' +
        'animation:cartSuccessPop 0.5s cubic-bezier(0.16,1,0.3,1);' +
      '}' +
      '.cart-success h3{font-size:18px;color:#f8fafc;font-weight:600;margin:0 0 8px;}' +
      '.cart-success p{font-size:13px;color:#94a3b8;margin:0;line-height:1.5;}' +
      '@keyframes cartSuccessPop{0%{transform:scale(0);opacity:0;}60%{transform:scale(1.15);}100%{transform:scale(1);opacity:1;}}' +

      /* ── Checkmark animation ── */
      '.checkmark-svg{width:28px;height:28px;}' +
      '.checkmark-svg path{' +
        'stroke:#fff;stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round;' +
        'stroke-dasharray:24;stroke-dashoffset:24;' +
        'animation:checkDraw 0.4s 0.2s ease forwards;' +
      '}' +
      '@keyframes checkDraw{to{stroke-dashoffset:0;}}' +

      /* ── Toast Notifications ── */
      '.cart-toast-container{' +
        'position:fixed;bottom:2rem;right:2rem;z-index:9995;' +
        'display:flex;flex-direction:column-reverse;gap:8px;' +
        'pointer-events:none;' +
      '}' +
      '.cart-toast{' +
        'background:rgba(12,12,24,0.95);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);' +
        'border:1px solid rgba(99,102,241,0.2);border-radius:12px;' +
        'padding:12px 16px;display:flex;align-items:center;gap:10px;' +
        'pointer-events:all;min-width:240px;max-width:340px;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.3);' +
        'transform:translateY(16px);opacity:0;' +
        'transition:all 0.35s cubic-bezier(0.16,1,0.3,1);' +
        'font-family:"Inter","Space Grotesk",sans-serif;' +
      '}' +
      '.cart-toast.visible{transform:translateY(0);opacity:1;}' +
      '.cart-toast.exiting{transform:translateY(8px);opacity:0;}' +
      '.cart-toast-icon{' +
        'width:28px;height:28px;border-radius:8px;flex-shrink:0;' +
        'background:linear-gradient(135deg,#6366f1,#8b5cf6);' +
        'display:flex;align-items:center;justify-content:center;' +
        'font-size:12px;color:#fff;' +
      '}' +
      '.cart-toast-text{flex:1;min-width:0;}' +
      '.cart-toast-label{font-size:12px;font-weight:600;color:#f8fafc;margin-bottom:1px;}' +
      '.cart-toast-title{font-size:11px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +

      /* ── Mobile responsive ── */
      '@media(max-width:576px){' +
        '.cart-panel{width:100%;border-left:none;border-radius:20px 20px 0 0;}' +
        '.cart-icon-btn{right:1rem;top:4.5rem;width:46px;height:46px;border-radius:14px;font-size:18px;}' +
        '.cart-toast-container{right:1rem;left:1rem;bottom:1rem;}' +
        '.cart-toast{min-width:auto;max-width:100%;}' +
      '}';

    document.head.appendChild(style);
  }

  // ─── Star rendering (simplified) ───────────────────────────────────
  function miniStars(rating) {
    var html = '';
    var full = Math.floor(rating);
    var half = rating - full >= 0.3 ? 1 : 0;
    for (var i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
    if (half) html += '<i class="fas fa-star-half-stroke"></i>';
    for (var i = 0; i < 5 - full - half; i++) html += '<i class="far fa-star"></i>';
    return html;
  }

  // ─── DOM Creation ──────────────────────────────────────────────────
  var cartPanel, cartOverlay, cartBody, cartFooter, cartCountBadge, cartHeaderCount, cartIconBtn;
  var toastContainer;
  var panelOpen = false;

  function createCartDOM() {
    // Overlay
    cartOverlay = document.createElement('div');
    cartOverlay.className = 'cart-overlay';
    cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cartOverlay);

    // Panel
    cartPanel = document.createElement('div');
    cartPanel.className = 'cart-panel';
    cartPanel.setAttribute('role', 'dialog');
    cartPanel.setAttribute('aria-label', 'Shopping cart');
    cartPanel.setAttribute('aria-modal', 'true');
    cartPanel.innerHTML =
      '<div class="cart-panel-header">' +
        '<h2>Your Courseware</h2>' +
        '<span class="cart-header-count">0 items</span>' +
        '<button class="cart-close-btn" aria-label="Close cart"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="cart-panel-body"></div>' +
      '<div class="cart-panel-footer">' +
        '<div class="cart-subtotal">' +
          '<span class="cart-subtotal-label">Selected titles</span>' +
          '<span class="cart-subtotal-value">0 items</span>' +
        '</div>' +
        '<button class="cart-checkout-btn" disabled>' +
          '<i class="fas fa-paper-plane"></i>' +
          '<span>Request Access</span>' +
        '</button>' +
      '</div>';
    document.body.appendChild(cartPanel);

    cartBody = cartPanel.querySelector('.cart-panel-body');
    cartFooter = cartPanel.querySelector('.cart-panel-footer');
    cartHeaderCount = cartPanel.querySelector('.cart-header-count');

    // Cart icon button
    cartIconBtn = document.createElement('button');
    cartIconBtn.className = 'cart-icon-btn';
    cartIconBtn.setAttribute('aria-label', 'Open shopping cart');
    cartIconBtn.innerHTML =
      '<i class="fas fa-shopping-bag"></i>' +
      '<span class="cart-count-badge">0</span>';
    document.body.appendChild(cartIconBtn);
    cartCountBadge = cartIconBtn.querySelector('.cart-count-badge');

    // Toast container
    toastContainer = document.createElement('div');
    toastContainer.className = 'cart-toast-container';
    document.body.appendChild(toastContainer);
  }

  // ─── Panel Open / Close ────────────────────────────────────────────
  var focusBeforeOpen = null;
  var focusTrapHandler = null;

  function openCartPanel() {
    if (panelOpen) return;
    panelOpen = true;
    focusBeforeOpen = document.activeElement;
    renderCartItems();
    cartOverlay.classList.add('active');
    cartPanel.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus the close button
    setTimeout(function () {
      var closeBtn = cartPanel.querySelector('.cart-close-btn');
      if (closeBtn) closeBtn.focus();
    }, 100);

    // Focus trap
    focusTrapHandler = function (e) {
      if (e.key === 'Escape') {
        closeCartPanel();
        return;
      }
      if (e.key !== 'Tab') return;
      var focusable = cartPanel.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', focusTrapHandler);
  }

  function closeCartPanel() {
    if (!panelOpen) return;
    panelOpen = false;
    cartOverlay.classList.remove('active');
    cartPanel.classList.remove('open');
    document.body.style.overflow = '';

    if (focusTrapHandler) {
      document.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
    if (focusBeforeOpen) {
      focusBeforeOpen.focus();
      focusBeforeOpen = null;
    }
  }

  // ─── Render Cart Items ─────────────────────────────────────────────
  function renderCartItems() {
    var cart = getCart();
    var count = cart.length;

    // Update header count
    cartHeaderCount.textContent = count + (count === 1 ? ' item' : ' items');

    // Update footer
    var subtotalValue = cartFooter.querySelector('.cart-subtotal-value');
    var checkoutBtn = cartFooter.querySelector('.cart-checkout-btn');
    subtotalValue.textContent = count + (count === 1 ? ' title' : ' titles');
    checkoutBtn.disabled = count === 0;

    if (count === 0) {
      cartBody.innerHTML =
        '<div class="cart-empty">' +
          '<div class="cart-empty-icon"><i class="fas fa-shopping-bag"></i></div>' +
          '<h3>Your cart is empty</h3>' +
          '<p>Add courseware from the marketplace to get started.</p>' +
          '<a class="cart-empty-link" data-action="browse">Browse Courseware</a>' +
        '</div>';

      // Footer hidden when empty
      cartFooter.style.display = 'none';
      return;
    }

    cartFooter.style.display = '';

    cartBody.innerHTML = cart.map(function (item) {
      var c = PROGRAM_COLORS[item.program] || { bg: '#e2e8f0', text: '#334155' };
      return (
        '<div class="cart-item" data-cart-id="' + item.id + '">' +
          '<button class="cart-item-remove" data-remove-id="' + item.id + '" aria-label="Remove ' + item.title + '">' +
            '<i class="fas fa-times"></i>' +
          '</button>' +
          '<span class="cart-item-badge" style="background:' + c.bg + ';color:' + c.text + '">' + item.exam + '</span>' +
          '<div class="cart-item-title">' + item.title + '</div>' +
          '<div class="cart-item-publisher">' + item.publisher + '</div>' +
          '<div class="cart-item-meta">' +
            '<span class="stars">' + miniStars(item.rating) + '</span>' +
            '<span>' + item.rating.toFixed(1) + '</span>' +
            '<span class="coverage">' + item.coverageScore + '% coverage</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ─── Update Cart Badge ─────────────────────────────────────────────
  function updateCartBadge() {
    var count = getCartCount();
    cartCountBadge.textContent = count;
    if (count > 0) {
      cartCountBadge.classList.add('visible');
      // Bounce animation
      cartCountBadge.classList.remove('bounce');
      void cartCountBadge.offsetWidth; // reflow
      cartCountBadge.classList.add('bounce');
    } else {
      cartCountBadge.classList.remove('visible');
    }
  }

  // ─── Toast Notification ────────────────────────────────────────────
  function showToast(title) {
    // Enforce max toasts
    while (toastQueue.length >= MAX_TOASTS) {
      var oldest = toastQueue.shift();
      removeToast(oldest);
    }

    var toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML =
      '<div class="cart-toast-icon"><i class="fas fa-check"></i></div>' +
      '<div class="cart-toast-text">' +
        '<div class="cart-toast-label">Added to cart</div>' +
        '<div class="cart-toast-title">' + title + '</div>' +
      '</div>';
    toastContainer.appendChild(toast);
    toastQueue.push(toast);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('visible');
      });
    });

    // Auto-dismiss
    setTimeout(function () {
      removeToast(toast);
    }, 2500);
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('visible');
    toast.classList.add('exiting');
    var idx = toastQueue.indexOf(toast);
    if (idx > -1) toastQueue.splice(idx, 1);
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }

  // ─── Checkout / Request Access ─────────────────────────────────────
  function handleCheckout() {
    var cart = getCart();
    if (cart.length === 0) return;

    // Show success state in body
    cartBody.innerHTML =
      '<div class="cart-success">' +
        '<div class="cart-success-icon">' +
          '<svg class="checkmark-svg" viewBox="0 0 24 24"><path d="M5 12l5 5L19 7"/></svg>' +
        '</div>' +
        '<h3>Request Submitted!</h3>' +
        '<p>Your courseware access request has been received. A licensing specialist will reach out shortly.</p>' +
      '</div>';

    cartFooter.style.display = 'none';
    cartHeaderCount.textContent = 'Done';

    // Clear cart after 2s and close
    setTimeout(function () {
      clearCart();
      updateCartBadge();
      closeCartPanel();
      // Reset panel for next open
      setTimeout(function () {
        renderCartItems();
        cartFooter.style.display = '';
      }, 500);
    }, 2000);
  }

  // ─── Event Binding ─────────────────────────────────────────────────
  function bindCartEvents() {
    // Cart icon click
    cartIconBtn.addEventListener('click', openCartPanel);

    // Overlay click
    cartOverlay.addEventListener('click', closeCartPanel);

    // Close button
    cartPanel.querySelector('.cart-close-btn').addEventListener('click', closeCartPanel);

    // Remove item click (delegated)
    cartBody.addEventListener('click', function (e) {
      var removeBtn = e.target.closest('[data-remove-id]');
      if (removeBtn) {
        var id = parseInt(removeBtn.dataset.removeId, 10);
        var itemEl = cartBody.querySelector('.cart-item[data-cart-id="' + id + '"]');
        if (itemEl) {
          itemEl.classList.add('removing');
          setTimeout(function () {
            removeFromCart(id);
            renderCartItems();
            updateCartBadge();
          }, 400);
        }
        return;
      }
      // Browse link
      var browseLink = e.target.closest('[data-action="browse"]');
      if (browseLink) {
        closeCartPanel();
        var marketplace = document.getElementById('marketplace');
        if (marketplace) {
          marketplace.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // Checkout button
    cartPanel.querySelector('.cart-checkout-btn').addEventListener('click', handleCheckout);

    // Scroll fade for cart icon
    var scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        requestAnimationFrame(function () {
          cartIconBtn.classList.toggle('scrolled', window.scrollY > 200);
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });

    // Listen for .card-cta clicks (marketplace "Get Courseware" buttons)
    document.addEventListener('click', function (e) {
      var cta = e.target.closest('.card-cta');
      if (!cta) return;

      e.preventDefault();
      e.stopPropagation();

      var id = parseInt(cta.dataset.id, 10);
      if (!id || !window.coursewareData) return;

      var item = window.coursewareData.find(function (d) { return d.id === id; });
      if (!item) return;

      var added = addToCart(item);
      if (added) {
        showToast(item.title);
        updateCartBadge();
      } else {
        // Already in cart — open the panel to show them
        showToast(item.title + ' (already in cart)');
        openCartPanel();
      }
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────
  function init() {
    injectCartStyles();
    createCartDOM();
    bindCartEvents();
    updateCartBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API on window for external use
  window.procertCart = {
    add: addToCart,
    remove: removeFromCart,
    get: getCart,
    clear: clearCart,
    count: getCartCount,
    open: openCartPanel,
    close: closeCartPanel
  };

})();
