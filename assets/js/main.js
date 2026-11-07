/* Site behaviors — deferred, runs once per page load.
 * Blocks: theme toggle, scroll progress bar, back-to-top button,
 * reveal-on-scroll, code copy buttons, image asset hints. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    initThemeToggle();
    initScrollProgress();
    initBackToTop();
    initRevealOnScroll();
    initCodeCopyButtons();
    initImageHints();
  }

  /* Theme toggle: persist choice, re-render diagrams with matching theme */
  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      if (!current) {
        current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      if (typeof window.refreshMermaidDiagrams === 'function') {
        window.refreshMermaidDiagrams();
      }
    });
  }

  /* Scroll progress bar */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var progress = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', progress, { passive: true });
    progress();
  }

  /* Back to top button */
  function initBackToTop() {
    var topBtn = document.createElement('button');
    topBtn.className = 'back-to-top';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.title = 'Back to top';
    topBtn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    document.body.appendChild(topBtn);
    var toggleTop = function () {
      topBtn.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleTop, { passive: true });
    toggleTop();
  }

  /* Reveal sections on scroll */
  function initRevealOnScroll() {
    var targets = document.querySelectorAll('.section-header, .about-section, .post-navigation');
    if (reduceMotion || !('IntersectionObserver' in window) || !targets.length) return;
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { observer.observe(el); });
  }

  /* Copy-to-clipboard buttons on fenced code blocks (GitHub-style) */
  function initCodeCopyButtons() {
    if (!document.querySelectorAll('.highlighter-rouge').length) return;
    document.querySelectorAll('.highlighter-rouge').forEach(function (block) {
      var pre = block.querySelector('pre');
      if (!pre) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        copyText(pre.innerText || pre.textContent).then(function () {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1600);
        });
      });
      block.appendChild(btn);
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  /* Hint the browser to defer offscreen images and decode asynchronously */
  function initImageHints() {
    document.querySelectorAll('.post-content img, .post-excerpt img').forEach(function (img) {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
