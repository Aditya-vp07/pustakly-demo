/* Pustakly main.js — vanilla, no dependencies */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- kinetic hero: split headline into words ---- */
  document.querySelectorAll('.kinetic').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    // words wrapped in *asterisks* carry the accent, whole phrase not just single words
    var out = [], accent = false;
    words.forEach(function (w, i) {
      if (w.charAt(0) === '*') accent = true;
      out.push('<span class="w' + (accent ? ' accent' : '') + '" style="animation-delay:' + (i * 0.04) + 's">' + w.replace(/\*/g, '') + '</span>');
      if (w.charAt(w.length - 1) === '*') accent = false;
    });
    el.innerHTML = out.join(' ');
  });

  /* ---- scroll reveal (IntersectionObserver, once) ---- */
  var revealEls = document.querySelectorAll('.reveal, .stagger, .price-strike');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ---- count-up stats ---- */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var prefix = el.getAttribute('data-prefix') || '';
    if (reduceMotion) { el.textContent = prefix + target; return; }
    var start = null, dur = 900;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* ---- quiz ---- */
  var picks = {};
  var matchMap = {
    speaking: { name: 'Speak English Daily', live: false },
    studying: { name: 'Study Like a Topper', live: false },
    ai: { name: 'AI Tools for Students', live: true },
    money: { name: 'First Salary Money Basics', live: false }
  };
  var answers = { q2: {}, q3: {} };

  document.querySelectorAll('.opts').forEach(function (group) {
    var q = group.getAttribute('data-q');
    group.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group.querySelectorAll('button').forEach(function (b) { b.classList.remove('sel'); });
        btn.classList.add('sel');
        picks[q] = btn.getAttribute('data-v');
        if (picks.q1 && picks.q2 && picks.q3) showMatch();
      });
    });
  });

  function showMatch() {
    var m = matchMap[picks.q1];
    var card = document.querySelector('.match-card');
    if (!card || !m) return;
    card.querySelector('.m-name').textContent = m.name;
    var status = card.querySelector('.m-status');
    status.textContent = m.live ? 'Live now at the launch price.' : 'Coming soon at launch.';
    var ctx = [];
    if (picks.q2) ctx.push(picks.q2);
    if (picks.q3) ctx.push(picks.q3 + ' a day');
    card.querySelector('.m-ctx').textContent = ctx.length ? 'You said: ' + ctx.join(', ') + '.' : '';
    card.classList.add('show');
    card.setAttribute('tabindex', '-1');
    card.focus({ preventScroll: true });
  }

  /* ---- sticky buy bar ---- */
  var bar = document.querySelector('.buy-bar');
  var hero = document.querySelector('.hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) bar.classList.remove('show');
        else bar.classList.add('show');
      });
    });
    bio.observe(hero);
  }
})();
