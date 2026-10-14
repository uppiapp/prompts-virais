/**
 * Prompts Virais - Client Enhancements & Interactivity Engine v2.0
 * Supports: VSL Player, Vitrine Autoplay, FAQ Accordions, Dual Countdown Timers,
 * Live Social Proof, Mobile Sticky CTA, Pix Checkout Modal & Smooth Scrolling
 */

(function () {
  'use strict';

  // 1. FAQ Accordion Engine
  function setupFaq() {
    const faqSection = document.getElementById('faq') || document.querySelector('.light-band');
    if (!faqSection) return;

    const cards = faqSection.querySelectorAll('.rounded-2xl.border');
    cards.forEach((card) => {
      const button = card.querySelector('button');
      let answerDiv = card.querySelector('.leading-relaxed');
      const chevron = card.querySelector('svg');

      if (!button || !answerDiv) return;

      button.onclick = (e) => {
        e.preventDefault();
        const isHidden = answerDiv.style.display === 'none' || getComputedStyle(answerDiv).display === 'none';

        // Close other items
        cards.forEach((c) => {
          if (c !== card) {
            const a = c.querySelector('.leading-relaxed');
            const ch = c.querySelector('svg');
            if (a) a.style.display = 'none';
            if (ch) ch.style.transform = 'none';
            c.style.borderColor = 'rgba(255,255,255,0.10)';
          }
        });

        // Toggle current item
        if (isHidden) {
          answerDiv.style.display = 'block';
          if (chevron) chevron.style.transform = 'rotate(180deg)';
          card.style.borderColor = 'rgba(31, 109, 255, 0.45)';
        } else {
          answerDiv.style.display = 'none';
          if (chevron) chevron.style.transform = 'none';
          card.style.borderColor = 'rgba(255,255,255,0.10)';
        }
      };
    });
  }

  // 2. VSL Video Player Engine
  function setupVsl() {
    const vslVideo = document.querySelector('video[src*="prompts-virais-vsl"]');
    if (!vslVideo) return;

    const vslContainer = vslVideo.parentElement;
    if (vslContainer) {
      vslContainer.style.position = 'relative';
    }

    const soundButton = document.querySelector('button[aria-label="Ativar som do vídeo"]');
    const nativeProgressBar = vslContainer ? vslContainer.querySelector('div[style*="width:"]') : null;

    // Floating volume toggle badge
    const volumeBadge = document.createElement('button');
    volumeBadge.className = 'vsl-volume-floating-badge';
    volumeBadge.innerHTML = `
      <svg class="vsl-vol-icon-mute" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>
      <svg class="vsl-vol-icon-unmute" style="display:none;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      <span class="vsl-vol-text">ATIVAR SOM</span>
    `;
    vslContainer.appendChild(volumeBadge);

    // Scrubber controls bar
    const controlsBar = document.createElement('div');
    controlsBar.className = 'vsl-custom-controls';
    controlsBar.innerHTML = `
      <div class="vsl-progress-wrapper">
        <div class="vsl-progress-fill"></div>
      </div>
      <div class="vsl-controls-row">
        <button class="vsl-play-btn" aria-label="Play/Pause">
          <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <svg class="pause-icon" style="display:none;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </button>
        <span class="vsl-time-display">00:00 / 00:00</span>
        <div style="flex:1"></div>
        <button class="vsl-fs-btn" aria-label="Tela cheia">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>
      </div>
    `;
    vslContainer.appendChild(controlsBar);

    function formatTime(s) {
      if (!Number.isFinite(s)) return '00:00';
      const min = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    function toggleAudio() {
      vslVideo.muted = !vslVideo.muted;
      if (!vslVideo.muted) {
        vslVideo.volume = 1;
        if (soundButton) soundButton.style.display = 'none';
        volumeBadge.querySelector('.vsl-vol-icon-mute').style.display = 'none';
        volumeBadge.querySelector('.vsl-vol-icon-unmute').style.display = 'inline-block';
        volumeBadge.querySelector('.vsl-vol-text').textContent = 'MUTAR';
      } else {
        volumeBadge.querySelector('.vsl-vol-icon-mute').style.display = 'inline-block';
        volumeBadge.querySelector('.vsl-vol-icon-unmute').style.display = 'none';
        volumeBadge.querySelector('.vsl-vol-text').textContent = 'ATIVAR SOM';
      }
      vslVideo.play().catch(() => {});
    }

    if (soundButton) {
      soundButton.addEventListener('click', (e) => {
        e.stopPropagation();
        vslVideo.currentTime = 0;
        toggleAudio();
      });
    }

    volumeBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });

    const playBtn = controlsBar.querySelector('.vsl-play-btn');
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');
    const timeDisplay = controlsBar.querySelector('.vsl-time-display');
    const progressFill = controlsBar.querySelector('.vsl-progress-fill');
    const progressWrapper = controlsBar.querySelector('.vsl-progress-wrapper');
    const fsBtn = controlsBar.querySelector('.vsl-fs-btn');

    function updatePlayState() {
      if (vslVideo.paused) {
        playIcon.style.display = 'inline-block';
        pauseIcon.style.display = 'none';
      } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline-block';
      }
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (vslVideo.paused) vslVideo.play();
      else vslVideo.pause();
      updatePlayState();
    });

    vslContainer.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.vsl-progress-wrapper')) return;
      if (soundButton && soundButton.style.display !== 'none') {
        toggleAudio();
      } else {
        if (vslVideo.paused) vslVideo.play();
        else vslVideo.pause();
        updatePlayState();
      }
    });

    vslVideo.addEventListener('timeupdate', () => {
      if (!vslVideo.duration) return;
      const progress = (vslVideo.currentTime / vslVideo.duration) * 100;
      progressFill.style.width = `${progress}%`;
      if (nativeProgressBar) {
        nativeProgressBar.style.width = `${progress}%`;
      }
      timeDisplay.textContent = `${formatTime(vslVideo.currentTime)} / ${formatTime(vslVideo.duration)}`;
    });

    vslVideo.addEventListener('play', updatePlayState);
    vslVideo.addEventListener('pause', updatePlayState);

    progressWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = progressWrapper.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      if (vslVideo.duration) {
        vslVideo.currentTime = pos * vslVideo.duration;
      }
    });

    fsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        if (vslContainer.requestFullscreen) vslContainer.requestFullscreen();
        else if (vslVideo.webkitRequestFullscreen) vslVideo.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });

    vslVideo.play().catch(() => {});
  }

  // 3. Vitrine & Marquee Video Observer (IntersectionObserver 60fps)
  function setupVideosObserver() {
    const allVideos = document.querySelectorAll('video');
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (vid.getAttribute('src')?.includes('prompts-virais-vsl')) return;
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, { threshold: 0.15 });

    allVideos.forEach(v => {
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', 'true');
      v.muted = true;
      observer.observe(v);
    });
  }

  // 4. Dual Countdown Timers (Top Bar 15:00 & Planos 24h)
  function setupCountdown() {
    // 4.1 Top Announcement Bar Timer
    const topTimerSpan = document.querySelector('.tabular-nums') || document.querySelector('.bg-\\[var\\(--flame\\)\\] span');
    let totalSeconds = 15 * 60;
    const stored = sessionStorage.getItem('pv_countdown_top');
    if (stored) totalSeconds = Math.max(10, parseInt(stored, 10));

    function renderTopTimer() {
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      if (topTimerSpan) {
        topTimerSpan.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }

      if (totalSeconds > 0) {
        totalSeconds--;
        sessionStorage.setItem('pv_countdown_top', totalSeconds.toString());
      } else {
        totalSeconds = 14 * 60 + 59;
      }
    }

    renderTopTimer();
    setInterval(renderTopTimer, 1000);

    // 4.2 Planos 24-Hour Timer (Hours, Min, Seg)
    const planosTimerBoxes = document.querySelectorAll('#planos .tabular-nums');
    if (planosTimerBoxes.length >= 3) {
      let planosSeconds = 23 * 3600 + 59 * 60 + 48;
      const storedPlanos = sessionStorage.getItem('pv_countdown_planos');
      if (storedPlanos) planosSeconds = Math.max(10, parseInt(storedPlanos, 10));

      function renderPlanosTimer() {
        const h = Math.floor(planosSeconds / 3600);
        const m = Math.floor((planosSeconds % 3600) / 60);
        const s = planosSeconds % 60;

        planosTimerBoxes[0].textContent = h.toString().padStart(2, '0');
        planosTimerBoxes[1].textContent = m.toString().padStart(2, '0');
        planosTimerBoxes[2].textContent = s.toString().padStart(2, '0');

        if (planosSeconds > 0) {
          planosSeconds--;
          sessionStorage.setItem('pv_countdown_planos', planosSeconds.toString());
        } else {
          planosSeconds = 23 * 3600 + 59 * 60 + 59;
        }
      }

      renderPlanosTimer();
      setInterval(renderPlanosTimer, 1000);
    }
  }

  // 5. Live Social Proof Sales Toasts
  function setupSocialProof() {
    const names = [
      { name: "Gabriel S.", city: "São Paulo, SP", plan: "Plano Vitalício VIP" },
      { name: "Mariana C.", city: "Belo Horizonte, MG", plan: "Plano Vitalício" },
      { name: "Rodrigo M.", city: "Curitiba, PR", plan: "Plano Vitalício VIP" },
      { name: "Camila R.", city: "Rio de Janeiro, RJ", plan: "Plano Vitalício" },
      { name: "Lucas F.", city: "Florianópolis, SC", plan: "Plano Básico Mensal" },
      { name: "Juliana T.", city: "Brasília, DF", plan: "Plano Vitalício VIP" },
      { name: "Matheus B.", city: "Porto Alegre, RS", plan: "Plano Vitalício VIP" },
      { name: "Larissa P.", city: "Fortaleza, CE", plan: "Plano Vitalício" }
    ];

    const toast = document.createElement('div');
    toast.className = 'pv-sales-toast';
    document.body.appendChild(toast);

    let idx = 0;
    function showNotification() {
      const item = names[idx % names.length];
      idx++;

      toast.innerHTML = `
        <div class="pv-toast-content">
          <div class="pv-toast-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="pv-toast-info">
            <div class="pv-toast-title"><strong>${item.name}</strong> (${item.city})</div>
            <div class="pv-toast-sub">Acabou de adquirir o <span class="pv-toast-plan">${item.plan}</span></div>
          </div>
        </div>
        <div class="pv-toast-time">há ${Math.floor(Math.random() * 3) + 1} min • compra verificada</div>
      `;

      toast.classList.add('visible');
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 5000);
    }

    setTimeout(showNotification, 3500);
    setInterval(showNotification, 16000);
  }

  // 6. Mobile Sticky CTA Bar
  function setupMobileBar() {
    const bar = document.createElement('div');
    bar.className = 'pv-mobile-bar';
    bar.innerHTML = `
      <div class="pv-mobile-bar-inner">
        <div class="pv-mobile-bar-text">
          <span class="pv-mobile-bar-price">R$ 197,90</span>
          <span class="pv-mobile-bar-sub">vitalício • sem mensalidade</span>
        </div>
        <a href="/checkout" class="pv-mobile-bar-btn">GARANTIR ACESSO</a>
      </div>
    `;
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 450) {
        bar.classList.add('visible');
      } else {
        bar.classList.remove('visible');
      }
    });
  }

  // 7. Smooth Anchor Scroll
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // 8. Checkout CTA Redirects (Captures ALL clicks)
  function setupCheckoutButtons() {
    // 8.1 Global Capture Listener (runs in capture phase before any React or other handler)
    window.addEventListener('click', function (e) {
      const el = e.target.closest('a, button');
      if (!el) return;

      const href = (el.getAttribute('href') || '').toLowerCase();
      const text = (el.textContent || '').toUpperCase().trim();

      // Block any legacy SharkCash or external checkout link
      if (href.includes('sharkcash') || href.includes('shark')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/checkout';
        return;
      }

      // Allow navigation links to subpages or anchor sections
      if (href === '#demo' || href === '#faq' || href === '#capacidades' || href === '#top') return;
      if (href === '/auth' || href === '/membros' || href === '/extrair-prompt') return;
      if (el.tagName === 'A' && href === '#planos' && (text === 'PLANOS' || text === 'VER PLANOS')) return;

      // Identify CTAs and Purchase Elements
      const isCtaText = /QUERO|GARANTIR|ASSINAR|LIBERAR|COMPRAR|COMEÇAR|COMECAR|VITALÍCIO|VITALICIO|BÁSICO|BASICO|CHECKOUT|PAGAR|ACESSO/i.test(text);
      const isGoldPill = el.classList.contains('gold-pill') || !!el.closest('.gold-pill');
      const isPlanosCardCta = !!el.closest('#planos') && (el.tagName === 'BUTTON' || el.tagName === 'A');

      if (isCtaText || isGoldPill || isPlanosCardCta) {
        const isBasic = /BÁSICO|BASICO|67|MENSAL/i.test(text) || href.includes('basic') || href.includes('mensal');
        const targetUrl = isBasic ? '/checkout?plan=basic' : '/checkout';

        e.preventDefault();
        e.stopPropagation();
        window.location.href = targetUrl;
      }
    }, true);

    const checkAndAttach = () => {
      // Find all CTA buttons across the entire page
      const selectors = [
        'a[href*="sharkcash"]',
        'a[href*="checkout"]',
        '#planos a',
        '#planos button',
        '.gold-pill',
        'button.gold-pill',
        'a.gold-pill',
        'a[href="#planos"]',
        '.pv-mobile-bar-btn'
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(btn => {
        if (btn.hasAttribute('data-co-attached')) return;

        const text = (btn.textContent || '').toUpperCase().trim();
        const href = (btn.getAttribute('href') || '').toLowerCase();

        // If it's pure navigation "PLANOS" in the top menu, allow scroll to #planos
        if (btn.tagName === 'A' && href === '#planos' && (text === 'PLANOS' || text === 'VER PLANOS')) {
          return;
        }

        // Determine if it should go to Basic plan or VIP plan
        const isBasic = text.includes('BÁSICO') || text.includes('BASICO') || text.includes('67') || href.includes('basic') || href.includes('mensal');
        const targetUrl = isBasic ? '/checkout?plan=basic' : '/checkout';

        btn.setAttribute('data-co-attached', 'true');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = targetUrl;
        });
      });
    };

    checkAndAttach();
    setTimeout(checkAndAttach, 500);
    setTimeout(checkAndAttach, 1200);
    setTimeout(checkAndAttach, 2500);
  }

  // 10. Hero Effects in #planos Section (Guaranteed visibility)
  function setupPlanosEffects() {
    const attachEffects = () => {
      const planos = document.getElementById('planos');
      if (!planos) return;

      planos.style.position = 'relative';
      planos.style.overflow = 'hidden';

      // Top accent line
      if (!planos.querySelector('.pv-planos-line')) {
        const line = document.createElement('div');
        line.className = 'pv-planos-line absolute inset-x-0 top-0 h-px pointer-events-none z-10';
        line.style.cssText = 'position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(31,109,255,0.7),transparent);pointer-events:none;z-index:10;';
        planos.prepend(line);
      }

      // Grid background
      if (!planos.querySelector('.pv-planos-grid')) {
        const grid = document.createElement('div');
        grid.className = 'pv-planos-grid absolute inset-0 bg-grid opacity-30 pointer-events-none z-0';
        grid.style.cssText = 'position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px);background-size:56px 56px;opacity:0.35;pointer-events:none;z-index:0;';
        planos.prepend(grid);
      }

      // Orb 1 (top-left)
      if (!planos.querySelector('.pv-planos-orb-1')) {
        const orb1 = document.createElement('div');
        orb1.className = 'pv-planos-orb-1 gold-orb';
        orb1.style.cssText = 'position:absolute;top:-160px;left:-120px;width:520px;height:520px;filter:blur(80px);background:radial-gradient(circle,rgba(31,109,255,0.55),rgba(79,107,245,0.28) 40%,transparent 70%);border-radius:9999px;animation:orb-drift 16s ease-in-out infinite;pointer-events:none;z-index:1;display:block;';
        planos.prepend(orb1);
      }

      // Orb 2 (bottom-right)
      if (!planos.querySelector('.pv-planos-orb-2')) {
        const orb2 = document.createElement('div');
        orb2.className = 'pv-planos-orb-2 gold-orb';
        orb2.style.cssText = 'position:absolute;bottom:-180px;right:-120px;width:560px;height:560px;filter:blur(80px);background:radial-gradient(circle,rgba(31,109,255,0.5),rgba(79,107,245,0.25) 40%,transparent 70%);border-radius:9999px;animation:orb-drift 16s ease-in-out infinite 3s;pointer-events:none;z-index:1;display:block;';
        planos.prepend(orb2);
      }

      // Shimmer & Neon application on buttons and cards
      const ctaButtons = planos.querySelectorAll('a[href*="checkout"], .group\\/cta, footer a');
      ctaButtons.forEach(btn => {
        btn.classList.add('shine-btn');
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
      });

      const planArticles = planos.querySelectorAll('article');
      if (planArticles.length >= 2) {
        const vipArticle = planArticles[1];
        vipArticle.style.boxShadow = '0 0 38px rgba(31, 109, 255, 0.45), 0 20px 55px rgba(0, 0, 0, 0.85)';
        vipArticle.style.borderColor = 'rgba(79, 107, 245, 0.85)';
      }
    };

    attachEffects();
    setTimeout(attachEffects, 400);
    setTimeout(attachEffects, 1000);
    setTimeout(attachEffects, 2500);

    const planos = document.getElementById('planos');
    if (planos) {
      const observer = new MutationObserver(() => {
        if (!planos.querySelector('.pv-planos-orb-1')) {
          attachEffects();
        }
      });
      observer.observe(planos, { childList: true });
    }
  }

  // 9. Mobile Responsiveness CSS Injector
  function injectMobileCSS() {
    if (document.getElementById('pv-mobile-css')) return;
    const style = document.createElement('style');
    style.id = 'pv-mobile-css';
    style.textContent = `
      /* ── Global mobile safety ── */
      html, body {
        overflow-x: hidden !important;
        max-width: 100vw !important;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }

      @media (max-width: 768px) {
        /* ── Hero section ── */
        .hero-section, section:first-of-type {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }

        /* ── Headings scale down ── */
        h1 { font-size: clamp(1.75rem, 7vw, 3rem) !important; line-height: 1.15 !important; }
        h2 { font-size: clamp(1.4rem, 6vw, 2.25rem) !important; line-height: 1.2 !important; }
        h3 { font-size: clamp(1.1rem, 5vw, 1.6rem) !important; }

        /* ── Plans cards stack vertically ── */
        #planos .grid, #planos [class*="grid-cols"] {
          grid-template-columns: 1fr !important;
          gap: 1.5rem !important;
        }
        #planos [class*="col-span"] {
          grid-column: span 1 !important;
        }

        /* ── Plan cards full width ── */
        #planos > * > * [class*="rounded"] {
          width: 100% !important;
          max-width: 100% !important;
        }

        /* ── Features / benefits grids ── */
        [class*="grid-cols-2"]:not(#planos *),
        [class*="grid-cols-3"]:not(#planos *) {
          grid-template-columns: 1fr !important;
        }
        [class*="grid-cols-4"] {
          grid-template-columns: repeat(2, 1fr) !important;
        }

        /* ── VSL video container ── */
        [class*="vsl"], .vsl-wrapper, .video-container {
          width: 100% !important;
          max-width: 100% !important;
          border-radius: 0.75rem !important;
        }
        video, iframe[src*="youtube"], iframe[src*="vimeo"] {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          min-height: 200px;
        }

        /* ── Vitrine carousel ── */
        .vitrine-scroll, [class*="carousel"], [class*="scroll-x"] {
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Buttons ── */
        .gold-pill, button[class*="gold"], a[class*="gold"] {
          width: 100% !important;
          text-align: center !important;
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }

        /* ── Prevent text overflow ── */
        p, li, span {
          overflow-wrap: break-word;
          word-break: break-word;
        }

        /* ── Nav / header ── */
        nav, header {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }

        /* ── Footer ── */
        footer {
          text-align: center !important;
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }
        footer [class*="flex"] {
          flex-direction: column !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }

        /* ── Images ── */
        img {
          max-width: 100% !important;
          height: auto !important;
        }

        /* ── Padding normalizer for sections ── */
        section {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }

        /* ── Flex column for two-column layouts ── */
        [class*="flex"][class*="gap"]:not([class*="flex-col"]):not([class*="flex-wrap"]) > * {
          flex-shrink: 0;
        }
      }

      @media (max-width: 480px) {
        /* Extra small screens */
        h1 { font-size: clamp(1.5rem, 8vw, 2rem) !important; }
        h2 { font-size: clamp(1.2rem, 6.5vw, 1.75rem) !important; }

        .gold-pill, button[class*="gold"], a[class*="gold"] {
          font-size: 0.95rem !important;
          padding-top: 0.85rem !important;
          padding-bottom: 0.85rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    injectMobileCSS();
    setupFaq();
    setupVsl();
    setupVideosObserver();
    setupCountdown();
    setupSocialProof();
    setupMobileBar();
    setupSmoothScroll();
    setupCheckoutButtons();
    setupPlanosEffects();
    console.log('Prompts Virais - Enhancements Engine v2.0 Ready!');
  }
})();
