// Limy Student · UX sunumu — kaydırma efektleri
(function () {
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var progress = document.getElementById('progress');
  var nav = document.getElementById('nav');
  var mobile = window.matchMedia('(max-width: 900px)');

  // Önce / sonra bölümleri
  var chapters = Array.prototype.map.call(document.querySelectorAll('.chapter'), function (el) {
    return {
      el: el,
      phone: el.querySelector('.compare'),
      bar: el.querySelector('.ch-bar'),
      rows: el.querySelectorAll('.changes li')
    };
  });

  function chapterProgress(c, vh) {
    if (mobile.matches) {
      // Mobilde yapışkan alan yok: telefon ekrandan geçerken dönüşüm olur
      var r = c.phone.getBoundingClientRect();
      return clamp((vh * 0.6 - r.top) / (r.height * 0.8), 0, 1);
    }
    var rect = c.el.getBoundingClientRect();
    var total = c.el.offsetHeight - vh;
    return clamp(-rect.top / total, 0, 1);
  }

  // Üst menü: bulunulan bölümün bağlantısı aktif olur
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var navTargets = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function updateNav(vh) {
    var line = vh * 0.35;
    var current = -1;
    navTargets.forEach(function (t, i) {
      if (t && t.getBoundingClientRect().top <= line) current = i;
    });
    // Sayfa sonuna gelindiyse son bağlantı
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = navLinks.length - 1;
    navLinks.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  function update() {
    var vh = window.innerHeight;
    var doc = document.documentElement;
    var y = window.scrollY;
    progress.style.transform = 'scaleX(' + clamp(y / (doc.scrollHeight - vh), 0, 1) + ')';
    nav.classList.toggle('scrolled', y > 10);
    updateNav(vh);

    chapters.forEach(function (c) {
      var p = chapterProgress(c, vh);
      // Baştaki ve sondaki kısa bölümde ekran sabit kalır
      var w = clamp((p - 0.12) / 0.72, 0, 1);
      c.phone.style.setProperty('--w', w.toFixed(4));
      c.bar.style.setProperty('--p', p.toFixed(4));
      var n = c.rows.length;
      for (var i = 0; i < n; i++) {
        // Mobilde liste telefonun altında: her satır ekranın ortasına gelince döner
        var done = mobile.matches ? c.rows[i].getBoundingClientRect().top < vh * 0.62 : w >= (i + 0.6) / n;
        c.rows[i].classList.toggle('done', done);
      }
    });
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Belirerek gelen bloklar ve sayaçlar
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el) {
    var target = +el.getAttribute('data-count');
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null;
    function step(t) {
      if (!start) start = t;
      var k = clamp((t - start) / 1200, 0, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Ekran haritası sekmeleri
  var tabs = document.querySelectorAll('.tabbar button');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
      document.querySelectorAll('.panel').forEach(function (p) {
        p.classList.toggle('active', p.id === 'p-' + btn.getAttribute('data-tab'));
      });
    });
  });

  // Büyütme
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('p');
  document.addEventListener('click', function (e) {
    var z = e.target.closest('.zoomable');
    if (!z) return;
    lbImg.src = z.getAttribute('data-full');
    lbImg.alt = z.getAttribute('data-cap') || '';
    lbCap.textContent = z.getAttribute('data-cap') || '';
    lb.classList.add('open');
  });
  lb.addEventListener('click', function () { lb.classList.remove('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
})();
