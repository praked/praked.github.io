/* Site behaviour: sliding drawer, auto-hiding top bar, scroll reveal.
   Loaded with `defer` from _layouts/base.html. All of it is optional: the
   page is complete without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Drawer ---------------------------------------------------------- */
  var menuBtn = document.getElementById('_menuBtn');
  var sidebar = document.getElementById('_sidebar');
  var backdrop = document.getElementById('_backdrop');

  function isOpen() { return root.classList.contains('drawer-open'); }

  function setDrawer(open) {
    root.classList.toggle('drawer-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var first = sidebar && sidebar.querySelector('a');
      if (first) first.focus();
    } else if (menuBtn && sidebar && sidebar.contains(document.activeElement)) {
      menuBtn.focus();
    }
  }

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () { setDrawer(!isOpen()); });
    if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) setDrawer(false);
    });

    /* Swipe: from the left edge to open, leftwards anywhere to close.
       Horizontal travel must clearly beat vertical, or it is a scroll. */
    var startX = null, startY = null;
    document.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX, dy = t.clientY - startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        /* offsetParent is null while the menu button is hidden, i.e. on wide
           screens, where there is no drawer to open. */
        if (!isOpen() && startX < 28 && dx > 0 && menuBtn.offsetParent !== null) setDrawer(true);
        else if (isOpen() && dx < 0) setDrawer(false);
      }
      startX = null;
    }, { passive: true });
  }

  /* ---- Full-screen cover ------------------------------------------------ */
  /* Pages with `cover: true` get `has-cover` (and, on load, `cover-open`)
     from the inline script in the <head>.

     Closing: scroll down, swipe up or left, arrow/space/page-down, the hint
     button, a sidebar link to this same page, or drag the cover to the left.
     Scrolling, swiping and the keys first raise the camera (makeRise).
     Reopening: scroll up while already at the top of the page, pull down on a
     touch screen, arrow-up/page-up/home at the top, or drag the sidebar out
     to the right. */
  var main = document.getElementById('main');
  var hasCover = root.classList.contains('has-cover');
  var lastSwitch = 0;
  var rise = null;   /* the camera rise, set up at the end of this section */

  function coverOpen() { return root.classList.contains('cover-open'); }

  /* The scroll that dismisses the cover must do only that. A wheel or
     trackpad gesture keeps emitting events (momentum) well after the cover
     has started to move, and with the page unlocked those would scroll the
     content straight away. So the page stays locked until the slide has
     finished AND the wheel has gone quiet, with a hard cap as a backstop.

     The lock alone is not enough: a strong trackpad flick can coast for
     longer than the cap, and on phones overflow:hidden does not reliably
     stop a finger that is still moving. So the rest of the closing gesture
     is also cancelled outright: wheel events until the wheel goes quiet
     (however long that takes), and touch moves until the finger lifts. */
  var lastWheel = 0, eatWheel = false, eatTouch = false, touching = false;
  window.addEventListener('wheel', function (e) {
    lastWheel = Date.now();
    if (eatWheel) e.preventDefault();
  }, { passive: !hasCover });
  if (hasCover) {
    window.addEventListener('touchstart', function () { touching = true; }, { passive: true });
    window.addEventListener('touchmove', function (e) { if (eatTouch) e.preventDefault(); }, { passive: false });
    var lift = function () { touching = false; eatTouch = false; };
    window.addEventListener('touchend', lift, { passive: true });
    window.addEventListener('touchcancel', lift, { passive: true });
  }

  function lockScroll() {
    var started = Date.now(), locked = true;
    root.classList.add('cover-lock');
    eatWheel = true;
    eatTouch = touching;
    (function check() {
      var now = Date.now();
      var wheelQuiet = now - lastWheel > 180;
      if (locked && ((now - started > 800 && wheelQuiet) || now - started > 2500 || coverOpen())) {
        locked = false;
        root.classList.remove('cover-lock');
        window.scrollTo(0, 0);
      }
      if (wheelQuiet || coverOpen()) eatWheel = false;
      if (locked || eatWheel) setTimeout(check, 60);
    })();
  }

  function setCover(open) {
    if (coverOpen() === open) return;
    /* Either way the page is shown from the top: also when the browser
       restored an old scroll position on reload. */
    window.scrollTo(0, 0);
    root.classList.toggle('cover-open', open);
    /* After the toggle: the lock's first check, which runs at once, ends it
       if the cover is open, so it must not still see the old state. */
    if (!open) lockScroll();
    if (main) main.inert = open;   /* hidden content must not take focus */
    lastSwitch = Date.now();
    if (!open && rise) rise.onClose();
  }

  /* One wheel or touch gesture produces a burst of events. Without a pause
     after each switch, the tail of the gesture that closed the cover would
     immediately act on the page underneath, or reopen it. */
  function settled() { return Date.now() - lastSwitch > 700; }

  /* The sidebar art looks straight down on the fleet, except on the open
     cover, which starts from the low view (see makeRise). */
  if (!reduceMotion) window.siteCamInit = hasCover && coverOpen() ? 0 : 1;

  if (hasCover) {
    if (coverOpen() && main) main.inert = true;

    /* -- wheel -- */
    var atTopSince = window.scrollY <= 0 ? Date.now() : 0;
    var upTravel = 0, upTimer = null;
    window.addEventListener('scroll', function () {
      if (window.scrollY <= 0) { if (!atTopSince) atTopSince = Date.now(); }
      else { atTopSince = 0; upTravel = 0; }
    }, { passive: true });

    window.addEventListener('wheel', function (e) {
      if (rise && rise.wheel(e)) return;
      if (!settled()) return;
      if (coverOpen()) {
        if (e.deltaY > 4) setCover(false);
        return;
      }
      /* Reopen only on a deliberate upward scroll made while ALREADY resting
         at the top. Scrolling up the page and arriving at the top must not
         trigger it, hence the dwell time and the accumulated travel. */
      if (e.deltaY < 0 && atTopSince && Date.now() - atTopSince > 350) {
        upTravel += -e.deltaY;
        clearTimeout(upTimer);
        upTimer = setTimeout(function () { upTravel = 0; }, 400);
        if (upTravel > 120) { upTravel = 0; setCover(true); }
      } else if (e.deltaY > 0) {
        upTravel = 0;
      }
    }, { passive: true });

    /* -- touch -- */
    var tX = null, tY = null, tAtTop = false;
    window.addEventListener('touchstart', function (e) {
      tX = e.touches[0].clientX; tY = e.touches[0].clientY;
      tAtTop = window.scrollY <= 0;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (rise && rise.touch(e)) return;
      if (tY === null || !settled()) return;
      var dx = e.touches[0].clientX - tX, dy = e.touches[0].clientY - tY;
      if (coverOpen()) {
        if (dy < -36 || dx < -56) { setCover(false); tY = null; }
      } else if (tAtTop && window.scrollY <= 0 && dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) {
        setCover(true); tY = null;
      }
    }, { passive: true });

    /* -- keyboard -- */
    document.addEventListener('keydown', function (e) {
      var el = document.activeElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (rise && rise.key(e)) return;
      if (coverOpen()) {
        if (['ArrowDown', 'PageDown', 'End', ' ', 'Escape'].indexOf(e.key) === -1) return;
        /* Space on a focused link or button should activate it, not dismiss. */
        if (e.key === ' ' && el && /^(A|BUTTON)$/.test(el.tagName) && el.id !== '_coverHint') return;
        e.preventDefault();
        setCover(false);
      } else if (window.scrollY <= 0 && ['ArrowUp', 'PageUp', 'Home'].indexOf(e.key) !== -1) {
        e.preventDefault();
        setCover(true);
      }
    });

    var hint = document.getElementById('_coverHint');
    if (hint) hint.addEventListener('click', function () { if (!(rise && rise.next())) setCover(false); });

    /* A sidebar link to the page we are already on reveals it instead of
       reloading it. */
    if (sidebar) sidebar.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || !coverOpen()) return;
      if (a.origin === location.origin && a.pathname === location.pathname) {
        e.preventDefault();
        setCover(false);
      }
    });

    /* -- drag (wide screens) --
       The sidebar follows the pointer between its docked width and the full
       screen; on release it snaps to whichever side it was dragged towards. */
    var wide = window.matchMedia('(min-width: 64em)');
    if (sidebar && window.PointerEvent) {
      var drag = null;

      var lerp = function (from, to, p) { return from + (to - from) * p; };

      sidebar.addEventListener('pointerdown', function (e) {
        if (!wide.matches || e.button !== 0) return;
        if (e.target.closest && e.target.closest('a, button')) return;
        var rem = parseFloat(getComputedStyle(root).fontSize) || 16;
        drag = {
          id: e.pointerId, x: e.clientX, wasOpen: coverOpen(), active: false, p: 0,
          docked: 21 * rem, full: window.innerWidth,
          padLeft: [1.75 * rem, window.innerWidth / 2 - 8.75 * rem],
          padTop: [2.5 * rem, window.innerHeight * 0.24]
        };
      });

      sidebar.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x;
        if (!drag.active) {
          if (Math.abs(dx) < 8) return;
          drag.active = true;
          sidebar.setPointerCapture(drag.id);
          root.classList.add('cover-dragging');
        }
        var p = (drag.wasOpen ? 1 : 0) + dx / (drag.full - drag.docked);
        p = Math.max(0, Math.min(1, p));
        drag.p = p;
        sidebar.style.width = lerp(drag.docked, drag.full, p) + 'px';
        sidebar.style.paddingLeft = lerp(drag.padLeft[0], drag.padLeft[1], p) + 'px';
        sidebar.style.paddingTop = lerp(drag.padTop[0], drag.padTop[1], p) + 'px';
      });

      var endDrag = function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag; drag = null;
        if (!d.active) return;
        /* A quarter of the way is enough to commit in the direction dragged. */
        var open = d.wasOpen ? d.p > 0.75 : d.p > 0.25;
        root.classList.remove('cover-dragging');
        void sidebar.offsetWidth;          /* re-arm the transition first */
        sidebar.style.width = '';
        sidebar.style.paddingLeft = '';
        sidebar.style.paddingTop = '';
        setCover(open);
      };
      sidebar.addEventListener('pointerup', endDrag);
      sidebar.addEventListener('pointercancel', endDrag);
    }

    /* -- camera rise (see makeRise) -- */
    if (!reduceMotion) {
      root.classList.add('rise');
      rise = makeRise();
    }
  }

  /* ---- Cover: camera rise ---------------------------------------------- */
  /* While the cover is open, scrolling first flies the camera of the
     sailing-swarm art (below) up from the low view until it looks straight
     down on the fleet; a new scroll once it is there docks the cover. It
     reverses: from the top of the page, scrolling up reopens the cover in
     the top-down view, and scrolling up further lowers the camera to the
     horizon again. The docked sidebar keeps the top-down view, on every
     page. The bar under the cover's hint shows how far the camera has come.
     With reduced motion none of this runs and the cover simply slides. */
  function makeRise() {
    var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
    /* Wheel delta in pixels, whatever unit the device reports. */
    var px = function (e) { return e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1); };
    var DOWN = ['ArrowDown', 'PageDown', ' ', 'Enter'], UP = ['ArrowUp', 'PageUp', 'Home'], OUT = ['End', 'Escape'];
    var TRAVEL = .55;   /* scroll distance for the whole rise, in window heights */
    var label = document.querySelector('#_coverHint .cover-hint__label');

    /* The altitude ruler on the cover's right edge: the camera's real
       height and tilt, reported by the art (window.onSiteCam). Its scale
       runs to the top-down height, in 10 m steps. */
    var ruler = document.querySelector('.cover-ruler');
    var rulerScale = ruler && ruler.querySelector('.cover-ruler__scale');
    var rulerVal = ruler && ruler.querySelector('.cover-ruler__val');
    var rulerMax = 0;
    window.onSiteCam = function (h, pitch, top) {
      if (!ruler || !coverOpen()) return;
      var max = Math.max(40, Math.ceil(top / 10) * 10);
      if (max !== rulerMax) {
        rulerMax = max;
        Array.prototype.forEach.call(ruler.querySelectorAll('.cover-ruler__tick'), function (el) { el.remove(); });
        for (var v = 0; v <= max; v += 10) {
          var t = document.createElement('span');
          t.className = 'cover-ruler__tick';
          t.style.bottom = (v / max * 100) + '%';
          t.textContent = v;
          rulerScale.appendChild(t);
        }
        root.style.setProperty('--ruler-steps', String(max / 5));
      }
      root.style.setProperty('--alt', (h / max).toFixed(4));
      rulerVal.textContent = Math.round(h) + ' m \u00b7 ' + Math.round(pitch * 180 / Math.PI) + '\u00b0';
    };

    /* camT is where the camera is headed (0 low view, 1 top-down), cam where
       it is; the art draws from cam. */
    var camT = window.siteCamInit || 0, cam = camT, camRun = false, camLast = 0;
    var show = function () {
      root.style.setProperty('--rise', cam.toFixed(3));
      if (label) label.textContent = camT >= .999 ? 'Enter' : 'Scroll';
      root.classList.toggle('rise-done', camT >= .999);
    };
    var camFrame = function (t) {
      var dt = camLast ? Math.min(.05, (t - camLast) / 1000) : 1 / 60; camLast = t;
      cam += (camT - cam) * (1 - Math.exp(-11 * dt));
      if (Math.abs(camT - cam) < .001) cam = camT;
      if (window.siteCam) window.siteCam(cam);
      show();
      if (cam === camT) { camRun = false; camLast = 0; return; }
      requestAnimationFrame(camFrame);
    };
    var camTo = function (v) {
      camT = clamp(v, 0, 1);
      show();
      if (!camRun) { camRun = true; requestAnimationFrame(camFrame); }
    };

    /* A gesture is a burst of wheel events with no gap over 200 ms, or one
       touch. Its direction is set by its first movement. A downward gesture
       that starts with the camera already top-down docks the cover; any
       other gesture moves the camera, which stops at either end, so one
       long flick never both finishes the rise and docks. */
    var g = null, gTimer = null;
    var dock = function () { setCover(false); };
    var down = function () { if (camT < .999) camTo(1); else dock(); };
    var move = function (d, wheel) {
      if (!coverOpen() || !settled()) return false;
      var ad = Math.abs(d), first = !g;
      /* Trackpad momentum keeps one flick going for a second or two. A new
         flick made once the rise is complete shows as the deltas climbing
         again after decaying: treat it as a new gesture, so it can dock. */
      if (g && wheel && g.dir > 0 && g.from < .999 && g.fullAt && Date.now() - g.fullAt > 150 &&
          d > 0 && ad > Math.max(2 * g.last, 8)) first = true;
      if (first) {
        if (ad < 1) return true;
        g = { dir: d > 0 ? 1 : -1, from: camT, acc: 0, acted: false, last: ad, fullAt: 0 };
      }
      g.last = ad;
      if (g.dir > 0 && g.from >= .999) {
        /* One deliberate wheel notch is enough, as before the rise. */
        if (d > 0) g.acc += d;
        if (!g.acted && ((wheel && d > 4) || g.acc > 40)) { g.acted = true; dock(); }
        return true;
      }
      var step = d / (window.innerHeight * TRAVEL);
      /* Some mice report only a few pixels per notch: the first event of a
         wheel gesture always moves the camera a visible step. */
      if (first && wheel) step = (step < 0 ? -1 : 1) * Math.max(Math.abs(step), 1 / 6);
      camTo(camT + step);
      if (camT >= .999 && !g.fullAt) g.fullAt = Date.now();
      return true;
    };

    var tx0 = null, ty0 = null, ty = null;
    var touchEnd = function () { ty = ty0 = tx0 = null; g = null; };
    window.addEventListener('touchstart', function (e) {
      tx0 = e.touches[0].clientX; ty0 = ty = e.touches[0].clientY; g = null;
    }, { passive: true });
    window.addEventListener('touchend', touchEnd, { passive: true });
    window.addEventListener('touchcancel', touchEnd, { passive: true });

    show();
    return {
      wheel: function (e) {
        clearTimeout(gTimer);
        gTimer = setTimeout(function () { g = null; }, 200);
        /* A burst that is running while the cover opens or closes belongs to
           that switch: the original handler sees it, but its tail never
           moves the camera. */
        if (!coverOpen() || !settled()) { g = { dead: true }; return false; }
        if (g && g.dead) return true;
        return move(px(e), true);
      },
      touch: function (e) {
        if (ty === null) return false;
        var x = e.touches[0].clientX, y = e.touches[0].clientY;
        /* A clear swipe to the left still docks the cover at once. */
        var dx = x - tx0, dy = y - ty0;
        if (coverOpen() && dx < -56 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (settled() && !(g && g.acted)) { g = { dir: 1, from: 1, acc: 0, acted: true }; dock(); }
          return true;
        }
        var d = (ty - y) * 1.6;
        ty = y;
        return move(d, false);
      },
      key: function (e) {
        if (!coverOpen()) return false;
        var el = document.activeElement;
        var control = el && /^(A|BUTTON)$/.test(el.tagName);
        /* Enter or Space on a focused link or button activates it (Enter on
           the hint button clicks it, which docks). */
        if (control && (e.key === 'Enter' || (e.key === ' ' && el.id !== '_coverHint'))) return true;
        if (DOWN.indexOf(e.key) !== -1) { e.preventDefault(); down(); }
        else if (UP.indexOf(e.key) !== -1) { e.preventDefault(); camTo(0); }
        else if (OUT.indexOf(e.key) !== -1) { e.preventDefault(); dock(); }
        return true;
      },
      /* The hint button goes straight in; the camera still rises as the
         cover slides away (onClose). */
      next: function () { dock(); return true; },
      /* However the cover was closed, the sidebar settles on the top-down
         view, ready to be reversed. */
      onClose: function () { g = null; camTo(1); }
    };
  }

  /* ---- Auto-hiding top bar -------------------------------------------- */
  var topbar = document.getElementById('_topbar');
  if (topbar) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        /* Hide only once past the bar itself, and ignore tiny jitters. */
        if (y > lastY + 4 && y > 90) topbar.classList.add('topbar--hidden');
        else if (y < lastY - 4 || y <= 90) topbar.classList.remove('topbar--hidden');
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Scroll reveal --------------------------------------------------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    /* Gallery slides are excluded: they sit side by side in a horizontal
       scroller, so the off-screen ones would never intersect and never show. */
    var targets = document.querySelectorAll(
      '.tile, .timeline__item, .timeline__year, .project-card, .entry, ' +
      '.post-hero, .embed, .gallery, main h2, main figure:not(.gallery__slide), main p > img, ' +
      'main video, main iframe'
    );
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        el.classList.add('is-visible');
        /* Drop the classes afterwards so the hover transitions that some
           elements define for themselves are not overridden for good. */
        setTimeout(function () {
          el.classList.remove('reveal', 'is-visible');
          el.style.transitionDelay = '';
        }, 900);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    var fold = window.innerHeight;
    Array.prototype.forEach.call(targets, function (el) {
      /* Anything already on screen stays put: no flash on load. */
      if (el.getBoundingClientRect().top < fold) return;
      /* Grid siblings arrive one after another rather than as a block. */
      if (el.matches('.tile, .project-card')) {
        var i = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = (i % 3) * 70 + 'ms';
      }
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---- Sailing swarm (cover and sidebar background) -------------------- */
  /* A small top-down sailing-swarm simulation, drawn in perspective as line
     art. It follows the model of the SAB 2026 paper / SailSwarmSwIM, with the
     paper's default parameters:

       - wind-driven speed: a boat's speed depends on its angle to the wind,
         and it cannot sail inside the no-go cone (45 deg either side of
         upwind). To make ground upwind it sails close-hauled and tacks.
       - speed-weighted Couzin controller: repulsion inside 9 m (never
         weighted), orientation up to 22.5 m and attraction up to 40.5 m, both
         weighted by 1 / (neighbour speed + eps)^gamma.
       - sail luffing: a boat faster than its neighbourhood eases its sail to
         slow down (gain 0.4, trim rate 0.05 per second).

     The boats are drawn after a photo of the real SailSwarm boat: boxy
     hull, one tall flat-topped sail on a central post, small sail and
     antenna at the bow, wind-sensor arm at the stern. The sail sits to leeward, eases out as the
     boat bears away, swings across in a tack, and the boat heels with the
     wind. The fleet sails for a waypoint buoy that moves when they reach it.

     World units are metres: X to the right, Y away from the camera, Z up. */
  var art = document.querySelector('.sidebar-art');
  if (art) {
    window.siteArt = true;   /* see the cam-top fallback in _layouts/base.html */
    var NS = 'http://www.w3.org/2000/svg';
    var D2R = Math.PI / 180;
    var rand = function (a, b) { return a + Math.random() * (b - a); };
    var wrap = function (a) { while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI; return a; };
    var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
    var sign = function (v) { return v < 0 ? -1 : 1; };

    /* Camera: pinhole, low over the water, looking along +Y. The height is
       chosen so the nearest water (Y = NEAR) lands at the bottom of the
       picture and the boats are large enough to read as boats. */
    var F = 900, CAM_H = 5.2, HORIZON = 345, CX = 800;
    var NEAR = 9, FAR = 44;

    /* The camera can also rise and tilt down until it looks straight down
       on the fleet (the cover's camera rise). c = 0 is the low view, c = 1
       top-down. Looking down, it follows the fleet, and it climbs higher
       when the picture is narrow (the docked sidebar) so the fleet still
       fits. window.siteCamInit is where it starts on page load. */
    var cam = { c: -1, e: 0, th: 0, ct: 1, st: 0, cx: 0, cy: 0, h: CAM_H, py: HORIZON };
    var camWant = window.siteCamInit || 0, camDirty = true;
    var follow = { x: 0, y: 26, h: 34, seen: 1600, ready: false };
    var aim = function () {
      cam.cx = follow.x * cam.e; cam.cy = follow.y * cam.e;
      cam.h = CAM_H + (follow.h - CAM_H) * cam.e;
      camDirty = true;
    };
    var setCam = function (c) {
      var e = c * c * (3 - 2 * c);
      cam.c = c; cam.e = e;
      cam.th = e * Math.PI / 2; cam.ct = Math.cos(cam.th); cam.st = Math.sin(cam.th);
      cam.py = HORIZON + (450 - HORIZON) * e;
      aim();
    };
    window.siteCam = function (c) { camWant = c; };
    var px = function (X, Y, Z) {
      var dy = Y - cam.cy, dz = Z - cam.h;
      var k = F / Math.max(0.5, dy * cam.ct - dz * cam.st);
      return (CX + (X - cam.cx) * k).toFixed(1) + ',' + (cam.py - (dy * cam.st + dz * cam.ct) * k).toFixed(1);
    };
    var halfWidth = function (Y) { return 800 * Y / F; };

    /* Model parameters (SAB 2026, Table 1) — except the three zone radii,
       which are the paper's 4 / 10 / 18 m scaled by 2.25 so the boats sit
       further apart and overlap less on screen. */
    var SPACING = 2.25;
    var N = 10, NOGO = 45 * D2R, R_REP = 4 * SPACING, R_ORI = 10 * SPACING, R_ATT = 18 * SPACING;
    var GAMMA = 1, EPS = 0.1, KP = 0.4, TRIM_RATE = 0.05;
    var V_MAX = 2.0;          /* m/s on the fastest point of sail */
    var TIME = 0.75;          /* simulation seconds per real second: a calm pace */

    /* Speed as a fraction of V_MAX against the angle to the wind (degrees):
       nothing head-to-wind, fastest on a broad reach, slower dead downwind. */
    var POLAR = [[0, 0], [30, 0.05], [45, 0.6], [90, 0.95], [120, 1], [150, 0.9], [180, 0.75]];
    var polar = function (alpha) {
      var deg = Math.abs(alpha) / D2R;
      for (var k = 1; k < POLAR.length; k++) {
        if (deg <= POLAR[k][0]) {
          var a = POLAR[k - 1], b = POLAR[k];
          return a[1] + (b[1] - a[1]) * (deg - a[0]) / (b[0] - a[0]);
        }
      }
      return 0.75;
    };

    /* Wind: the direction it blows TOWARDS wanders slowly; strength gusts. */
    var wind0 = rand(0, 2 * Math.PI), simT = 0;
    var windTo = function () { return wind0 + 0.45 * Math.sin(simT / 47) + 0.2 * Math.sin(simT / 13 + 1); };
    var gust = function () { return 1 + 0.15 * Math.sin(simT / 7) + 0.08 * Math.sin(simT / 2.3); };

    var goal = { x: 0, y: 24, age: 0 };
    var newGoal = function () {
      goal.y = rand(13, 28);
      goal.x = rand(-0.6, 0.6) * halfWidth(goal.y);
      goal.age = 0;
    };
    newGoal();

    var fleetLayer = art.querySelector('.art-fleet');
    var wakeLayer = art.querySelector('.art-wakes');
    var mk = function (parent, cls) {
      var el = document.createElementNS(NS, 'path');
      el.setAttribute('class', cls);
      parent.appendChild(el);
      return el;
    };

    var boats = [];
    var cx0 = rand(-0.3, 0.3) * halfWidth(24), cy0 = rand(20, 30), psi0 = rand(0, 2 * Math.PI);
    for (var n = 0; n < N; n++) {
      var g = document.createElementNS(NS, 'g');
      fleetLayer.appendChild(g);
      boats.push({
        x: cx0 + rand(-16, 16), y: cy0 + rand(-10, 10), psi: psi0 + rand(-0.4, 0.4),
        v: 0.8, trim: 1, tack: 0, sinceTack: 99,
        boom: null,                       /* eased sail direction, boat frame */
        g: g, hull: mk(g, 'art-solid'), deck: mk(g, 'art-solid'), tail: mk(g, 'art-solid'),
        sail: mk(g, 'art-solid'), rig: mk(g, 'art-line'),
        wake: [], wakeEl: mk(wakeLayer, 'art-line'), wakeClock: 0
      });
    }

    var streaks = [];
    for (var s = 0; s < 34; s++) {
      var sy = rand(NEAR, FAR);
      streaks.push({ x: rand(-1.2, 1.2) * halfWidth(sy), y: sy });
    }

    /* ---- one simulation step ---- */
    var step = function (dt) {
      simT += dt;
      var wTo = windTo(), up = wTo + Math.PI, gs = gust();
      /* Shared with the page backdrop (_includes/backdrop.html), so its wind streaks agree with the fleet. */
      window.siteWind = { to: wTo, gust: gs };

      goal.age += dt;
      var mx = 0, my = 0;
      boats.forEach(function (b) { mx += b.x / N; my += b.y / N; });
      if (Math.hypot(goal.x - mx, goal.y - my) < 7 || goal.age > 80) newGoal();

      boats.forEach(function (b, i) {
        /* 1. Speed-weighted Couzin: desired social heading. */
        var rx = 0, ry = 0, ox = 0, oy = 0, ax = 0, ay = 0, nRep = 0, vSum = 0, vN = 0;
        boats.forEach(function (c, j) {
          if (i === j) return;
          var dx = c.x - b.x, dy = c.y - b.y, d = Math.hypot(dx, dy) || 1e-6;
          if (d < R_REP) { rx -= dx / d; ry -= dy / d; nRep++; }
          else if (d < R_ATT) {
            var w = 1 / Math.pow(c.v + EPS, GAMMA);
            if (d < R_ORI) { ox += w * Math.cos(c.psi); oy += w * Math.sin(c.psi); }
            else { ax += w * dx / d; ay += w * dy / d; }
          }
          if (d < R_ATT) { vSum += c.v; vN++; }
        });
        var dxs, dys;
        if (nRep) { dxs = rx; dys = ry; }
        else {
          var on = Math.hypot(ox, oy), an = Math.hypot(ax, ay);
          dxs = (on ? ox / on : 0) + (an ? ax / an : 0);
          dys = (on ? oy / on : 0) + (an ? ay / an : 0);
          if (!on && !an) { dxs = Math.cos(b.psi); dys = Math.sin(b.psi); }
        }
        var sn = Math.hypot(dxs, dys) || 1;
        dxs /= sn; dys /= sn;

        /* 2. The waypoint, and staying inside the visible stretch of water. */
        var gx = goal.x - b.x, gy = goal.y - b.y, gn = Math.hypot(gx, gy) || 1;
        dxs += 0.7 * gx / gn; dys += 0.7 * gy / gn;
        var hw = halfWidth(b.y) * 0.9;
        if (b.x > hw) dxs -= 2.5; else if (b.x < -hw) dxs += 2.5;
        if (b.y < NEAR + 3) dys += 2.5; else if (b.y > FAR - 6) dys -= 2.5;
        var psiD = Math.atan2(dys, dxs);

        /* 3. Sailing feasibility: no-go cone and tacking. A desired heading
              inside the cone becomes close-hauled on the current tack; the
              boat tacks once the target has clearly moved to the other side
              (it has reached the lay line), and not more often than every
              few seconds. */
        var off = wrap(psiD - up), psiT = psiD;
        b.sinceTack += dt;
        if (Math.abs(off) < NOGO) {
          if (!b.tack) b.tack = sign(off);
          if (sign(off) !== b.tack && Math.abs(off) > 10 * D2R && b.sinceTack > 8) {
            b.tack = sign(off); b.sinceTack = 0;
          }
          psiT = up + b.tack * (NOGO + 3 * D2R);
        } else {
          b.tack = sign(off);
        }

        /* 4. Rudder: turn rate is limited and needs boat speed to work. */
        var rate = (10 + 28 * Math.min(1, b.v)) * D2R;
        b.psi = wrap(b.psi + clamp(wrap(psiT - b.psi), -rate * dt, rate * dt));

        /* 5. Luffing: ease the sail when faster than the neighbourhood. */
        if (vN) {
          var vBar = vSum / vN;
          var want = b.trim - KP * (b.v - vBar) / Math.max(vBar, 1e-3);
          b.trim = clamp(b.trim + clamp(want - b.trim, -TRIM_RATE * dt, TRIM_RATE * dt), 0.35, 1);
        } else {
          b.trim = Math.min(1, b.trim + TRIM_RATE * dt);
        }

        /* 6. Wind-driven speed, with inertia so a boat carries way through a tack. */
        var alpha = wrap(b.psi - up);
        var vT = V_MAX * polar(alpha) * b.trim * gs;
        b.v += (vT - b.v) * Math.min(1, dt / 2.5);
        b.x += b.v * Math.cos(b.psi) * dt;
        b.y += b.v * Math.sin(b.psi) * dt;
        b.y = Math.max(NEAR - 1.5, b.y);

        b.wakeClock += dt;
        if (b.wakeClock > 0.6) {
          b.wakeClock = 0;
          b.wake.push([b.x, b.y]);
          if (b.wake.length > 7) b.wake.shift();   /* a short trail, not a scribble */
        }
      });

      /* Wind streaks ride the wind, faster than any boat. */
      streaks.forEach(function (p) {
        p.x += Math.cos(wTo) * 5 * gs * dt;
        p.y += Math.sin(wTo) * 5 * gs * dt;
        /* Looking down, they cover the whole picture around the camera. */
        if (cam.e > .5) {
          /* Just wider than the visible picture, which is narrow in the
             docked sidebar. */
          var rx = Math.max(8, 0.55 * follow.seen * cam.h / F), ry = cam.h * 0.6;
          if (Math.abs(p.x - cam.cx) > rx || Math.abs(p.y - cam.cy) > ry) {
            p.x = cam.cx + rand(-rx, rx); p.y = cam.cy + rand(-ry, ry);
          }
        } else if (p.y < NEAR - 3 || p.y > FAR + 6 || Math.abs(p.x) > halfWidth(Math.max(p.y, NEAR)) * 1.25) {
          p.y = rand(NEAR, FAR);
          p.x = rand(-1.2, 1.2) * halfWidth(p.y);
        }
      });
    };

    /* ---- drawing ---- */
    /* The SailSwarm boat, traced from a photo of it on the lake, in the boat's
       own frame: x forward, y to port, z up, in hull lengths.

         - a boxy hull with a flat deck and real freeboard;
         - one tall, narrow sail with a flat top, carried on a short post
           amidships. It is a balanced rig: the sail pivots on the post with
           about half of its foot ahead of it. The leading edge is raked and
           the foot rises towards the bow; the trailing edge is near vertical;
         - a small triangular sail and a whip antenna at the bow;
         - a wind-sensor arm raked up and out over the stern.

       Drawn about twice life size relative to the distances between boats, so
       that it reads as a boat and not as a dot. */
    var L = 2.2, DECK = 0.2;
    var DECK_PTS = [[0.5, 0.10], [0.42, 0.16], [-0.44, 0.16], [-0.5, 0.12],
                    [-0.5, -0.12], [-0.44, -0.16], [0.42, -0.16], [0.5, -0.10]];
    /* Sail corners as (chord position along the boom, height): chord is
       negative ahead of the pivot post, positive behind it. */
    var SAIL = { leadFoot: [-0.27, 0.42], trailFoot: [0.22, 0.26], trailTop: [0.16, 1.53], leadTop: [0.0, 1.53] };
    var BATTENS = [0.3, 0.55, 0.8];
    var lerp = function (a, b, f) { return a + (b - a) * f; };

    var windEl = art.querySelector('.art-wind');
    var linkEl = art.querySelector('.art-links');
    var buoyEl = art.querySelector('.art-buoy');
    var order = '';

    /* Camera move: the drawn horizon and waves slide up and fade, and a
       chart grid on the water fades in as the view turns top-down. */
    var statics = art.querySelectorAll('.art-horizon, .art-wave');
    var gridEl = document.createElementNS(NS, 'path');
    gridEl.setAttribute('class', 'art-grid');
    gridEl.setAttribute('fill', 'none');
    gridEl.setAttribute('stroke', 'currentColor');
    art.insertBefore(gridEl, windEl);
    var drawCamera = function () {
      camDirty = false;
      root.classList.remove('cam-top');   /* the script draws the water now */
      var hy = cam.th < 1.5 ? cam.py - F * Math.tan(cam.th) : -1e4;
      var fade = clamp(1 - cam.e * 2.2, 0, 1);
      Array.prototype.forEach.call(statics, function (el) {
        el.setAttribute('transform', 'translate(0,' + Math.max(-2000, hy - HORIZON).toFixed(1) + ')');
        el.setAttribute('stroke-opacity', fade.toFixed(3));
      });
      var gd = '';
      if (cam.e > 0.3) {
        /* Only water at least 2 m in front of the camera. */
        var y0 = cam.ct > 1e-3 ? cam.cy + (2 - cam.h * cam.st) / cam.ct : -1e3;
        /* A 6 m grid fixed to the water, around wherever the camera is. */
        var gr = Math.max(50, cam.h * 0.6);
        var gx0 = Math.floor((cam.cx - 60) / 6) * 6, ya = Math.max(y0, cam.cy - gr), yb = cam.cy + gr;
        for (var gx = gx0; gx <= gx0 + 120; gx += 6) gd += 'M' + px(gx, ya, 0) + ' L' + px(gx, yb, 0) + ' ';
        for (var gy = Math.ceil(ya / 6) * 6; gy <= yb; gy += 6) gd += 'M' + px(gx0, gy, 0) + ' L' + px(gx0 + 120, gy, 0) + ' ';
      }
      gridEl.setAttribute('d', gd);
      if (window.onSiteCam) window.onSiteCam(cam.h, cam.th, follow.h);
      gridEl.setAttribute('stroke-opacity', Math.pow(clamp((cam.e - 0.3) / 0.7, 0, 1), 1.5).toFixed(3));
    };

    var draw = function (dt) {
      var wTo = windTo(), up = wTo + Math.PI;

      /* Where the top-down camera wants to be: over the middle of the fleet,
         high enough for about 38 m of water across the visible picture. */
      var fx = 0, fy = 0, fh = follow.h;
      boats.forEach(function (b) { fx += b.x / N; fy += b.y / N; });
      if (cam.e > 0 || camWant > 0) {
        var box = art.getBoundingClientRect();
        var seen = Math.min(1600, 900 * box.width / Math.max(1, box.height));
        fh = clamp(F * 34 / Math.max(1, seen), 34, 100);
        follow.seen = seen;
      }
      if (!follow.ready) { follow.x = fx; follow.y = fy; follow.h = fh; follow.ready = true; }
      else {
        var kp = 1 - Math.exp(-dt / 1.5), kh = 1 - Math.exp(-dt / 0.5);
        follow.x += (fx - follow.x) * kp; follow.y += (fy - follow.y) * kp; follow.h += (fh - follow.h) * kh;
      }
      if (camWant !== cam.c) setCam(camWant);
      else if (cam.e > 0) aim();
      if (camDirty) drawCamera();

      boats.forEach(function (b) {
        var cs = Math.cos(b.psi), sn = Math.sin(b.psi);
        var alpha = wrap(b.psi - up), aAbs = Math.abs(alpha);

        /* Wind direction in the boat frame; its y sign is the leeward side. */
        var wx = Math.cos(wTo - b.psi), wy = Math.sin(wTo - b.psi);
        var lee = sign(wy);

        /* Sail angle off the centreline: half the wind angle, eased further
           when luffing. Head-to-wind the sail just streams like a flag. */
        var tx, ty;
        if (aAbs < 30 * D2R) { tx = wx; ty = wy; }
        else {
          var ease = clamp(aAbs * 0.5, 12 * D2R, 80 * D2R) + (1 - b.trim) * 30 * D2R;
          tx = -Math.cos(ease); ty = lee * Math.sin(ease);
        }
        if (!b.boom) b.boom = [tx, ty];
        var k = Math.min(1, dt * 3.5);     /* the boom swings, it does not jump */
        b.boom[0] += (tx - b.boom[0]) * k; b.boom[1] += (ty - b.boom[1]) * k;
        var bn = Math.hypot(b.boom[0], b.boom[1]) || 1;
        var bx = b.boom[0] / bn, by = b.boom[1] / bn;

        /* Heel to leeward, more when reaching hard and moving fast. */
        var heel = lee * 15 * D2R * Math.sin(aAbs) * Math.min(1, b.v / V_MAX) * (0.5 + 0.5 * b.trim);
        var ch = Math.cos(heel), sh = Math.sin(heel);

        /* boat frame -> heeled -> world -> screen */
        var pt = function (x, y, z) {
          var yh = y * ch + z * sh, zh = -y * sh + z * ch;
          return px(b.x + x * cs - yh * sn, b.y + x * sn + yh * cs, Math.max(0, zh + 0.05));
        };

        /* Hull: waterline outline, then the deck over it, joined by the
           corner edges so it reads as a solid box. */
        b.hull.setAttribute('d', 'M' + DECK_PTS.map(function (p) { return pt(p[0] * L * 0.97, p[1] * L * 0.94, 0); }).join(' L') + ' Z');
        b.deck.setAttribute('d', 'M' + DECK_PTS.map(function (p) { return pt(p[0] * L, p[1] * L, DECK * L); }).join(' L') + ' Z');

        /* Small fixed sail at the bow, in the centreline plane. */
        b.tail.setAttribute('d', 'M' + pt(0.30 * L, 0, DECK * L) + ' L' + pt(0.47 * L, 0, DECK * L) +
          ' L' + pt(0.42 * L, 0, 0.53 * L) + ' Z');

        /* A point on the main sail: u along the boom, z up. */
        var sp = function (c) { return pt(bx * c[0] * L, by * c[0] * L, c[1] * L); };
        b.sail.setAttribute('d', 'M' + sp(SAIL.leadFoot) + ' L' + sp(SAIL.trailFoot) +
          ' L' + sp(SAIL.trailTop) + ' L' + sp(SAIL.leadTop) + ' Z');

        var rig = '';
        /* corner edges of the hull */
        [0, 1, 2, 3, 4, 5, 6, 7].forEach(function (q) {
          var c = DECK_PTS[q];
          rig += 'M' + pt(c[0] * L * 0.97, c[1] * L * 0.94, 0) + ' L' + pt(c[0] * L, c[1] * L, DECK * L) + ' ';
        });
        /* pivot post under the sail */
        rig += 'M' + pt(0, 0, DECK * L) + ' L' + pt(0, 0, 0.34 * L) + ' ';
        /* battens across the sail */
        BATTENS.forEach(function (f) {
          rig += 'M' + sp([lerp(SAIL.leadFoot[0], SAIL.leadTop[0], f), lerp(SAIL.leadFoot[1], SAIL.leadTop[1], f)]) +
                 ' L' + sp([lerp(SAIL.trailFoot[0], SAIL.trailTop[0], f), lerp(SAIL.trailFoot[1], SAIL.trailTop[1], f)]) + ' ';
        });
        /* whip antenna at the bow */
        rig += 'M' + pt(0.44 * L, 0, DECK * L) + ' L' + pt(0.44 * L, 0, 0.8 * L) + ' ';
        /* wind-sensor arm over the stern, and the vane itself */
        rig += 'M' + pt(-0.42 * L, 0, DECK * L) + ' L' + pt(-0.62 * L, 0, 0.48 * L) +
               ' M' + pt(-0.56 * L, 0, 0.52 * L) + ' L' + pt(-0.71 * L, 0, 0.47 * L);
        b.rig.setAttribute('d', rig);

        /* Fainter with distance. */
        var depthFade = 0.4 + 0.6 * clamp(1 - (b.y - NEAR) / (FAR - NEAR), 0, 1);
        b.g.setAttribute('stroke-opacity', (depthFade + (1 - depthFade) * cam.e).toFixed(2));

        b.wakeEl.setAttribute('d', b.wake.length > 1
          ? 'M' + b.wake.map(function (p) { return px(p[0], p[1], 0); }).join(' L') + ' L' + px(b.x, b.y, 0)
          : '');
      });

      /* Far boats first, so near ones are drawn over them. */
      var sorted = boats.slice().sort(function (a, c) { return c.y - a.y; });
      var key = sorted.map(function (b) { return boats.indexOf(b); }).join(',');
      if (key !== order) { order = key; sorted.forEach(function (b) { fleetLayer.appendChild(b.g); }); }

      /* Links: boats within orientation range of each other. */
      var links = '';
      for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
        var a = boats[i], c = boats[j];
        if (Math.hypot(a.x - c.x, a.y - c.y) < R_ORI) links += 'M' + px(a.x, a.y, 1.3) + ' L' + px(c.x, c.y, 1.3) + ' ';
      }
      linkEl.setAttribute('d', links);

      var w = '', lx = Math.cos(wTo) * 1.1, ly = Math.sin(wTo) * 1.1;
      streaks.forEach(function (p) {
        /* Skip the ones right under the camera: perspective stretches them. */
        if (cam.e < .5 && p.y < NEAR + 3) return;
        w += 'M' + px(p.x, p.y, 0) + ' L' + px(p.x - lx, p.y - ly, 0) + ' ';
      });
      windEl.setAttribute('d', w);

      /* Waypoint buoy: float, staff and pennant. */
      buoyEl.setAttribute('d',
        'M' + px(goal.x - 0.35, goal.y, 0) + ' L' + px(goal.x + 0.35, goal.y, 0) +
        ' M' + px(goal.x, goal.y, 0) + ' L' + px(goal.x, goal.y, 1.5) +
        ' L' + px(goal.x + 0.5, goal.y, 1.3) + ' L' + px(goal.x, goal.y, 1.1));
    };

    /* Let the fleet settle into a sailing formation before it is first seen. */
    for (var warm = 0; warm < 120; warm++) step(0.5);
    draw(1);

    if (!reduceMotion) {
      var lastT = 0;
      var tick = function (now) {
        requestAnimationFrame(tick);
        var dt = Math.min(0.05, (now - lastT) / 1000 || 0);   /* clamp tab-switch gaps */
        lastT = now;
        step(dt * TIME);
        draw(dt);
      };
      requestAnimationFrame(tick);
    }
  }
})();
