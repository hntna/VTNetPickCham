/* Sports Energy — scroll reveal + tab ripple + group card color assignment */

// Scroll reveal via IntersectionObserver
(function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  function observeCards() {
    document.querySelectorAll('.group-card, .ko-match-card, .qualified-section, .champion-banner').forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        el.style.transitionDelay = (i * 0.06) + 's';
      }
      observer.observe(el);
    });
  }

  // Observe on load and whenever new content is injected
  observeCards();
  const contentRoot = document.getElementById('group-stage-content');
  const koRoot = document.getElementById('knockout-stage-content');

  [contentRoot, koRoot].forEach(root => {
    if (!root) return;
    const mo = new MutationObserver(observeCards);
    mo.observe(root, { childList: true, subtree: true });
  });
})();

// Tab ripple effect on touch/click
(function initRipple() {
  document.querySelectorAll('.main-tab').forEach(tab => {
    tab.addEventListener('pointerdown', function (e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();

// Assign data-group attribute to group cards for per-group glow colors
(function assignGroupColors() {
  function doAssign() {
    document.querySelectorAll('.group-card').forEach(card => {
      if (card.dataset.group) return;
      const title = card.querySelector('.group-card__title');
      if (!title) return;
      const match = title.textContent.match(/[A-F]/);
      if (match) card.dataset.group = match[0];
    });
  }

  doAssign();
  const root = document.getElementById('group-stage-content');
  if (root) {
    const mo = new MutationObserver(doAssign);
    mo.observe(root, { childList: true, subtree: true });
  }
})();
