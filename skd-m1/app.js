/**
 * Sri Karthikeya Developers — Production Interactivity & Progressive Enhancements
 * - Sticky header fallback for browsers without CSS scroll-driven animations
 * - Slow, pausable Hero slider (01 / 02 / 03) with reduced-motion respect
 * - Drone aerial video lazy-play/pause toggle
 * - Interactive Rock Palms feature showcase switcher
 * - Scroll-triggered animated stat counters & subtle scroll reveals
 * - Native scroll-snap Testimonial Carousel with live marker & ARIA status sync
 * - Native <dialog> modals & mobile navigation drawer with light-dismiss fallback
 * - Formspree lead submission for Site Visit & Brochure Request forms
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ==========================================================================
   1. SMART SCROLL-REACTIVE HEADER (Hides on Scroll Down -> Contracted Pill on Scroll Up Past Hero)
   ========================================================================== */
const siteHeader = document.getElementById('site-header');
const heroCanvasForHeader = document.querySelector('.hero-canvas-frame, .about-hero-stage, .inner-hero-stage');

if (siteHeader) {
  let lastScrollY = Math.max(0, window.scrollY);
  let dirAccumulator = 0;
  let lastDirection = 0; // 1 = down, -1 = up
  let pillActive = false;
  let isHeaderHidden = false;
  let lastToggleTime = 0;
  let headerRafPending = false;

  const HIDE_DOWN_THRESHOLD = 28; // Minimum continuous downward scroll (px) to hide
  const SHOW_UP_THRESHOLD = 20;   // Minimum continuous upward scroll (px) to show
  const TOP_EXPAND_THRESHOLD = 40;
  const TOGGLE_COOLDOWN_MS = 220; // Prevents rapid back-and-forth flicker

  const getHeroThreshold = () => {
    if (heroCanvasForHeader) {
      return heroCanvasForHeader.offsetTop + heroCanvasForHeader.offsetHeight;
    }
    return Math.max(window.innerHeight * 0.9, 680);
  };

  const syncHeaderState = () => {
    headerRafPending = false;
    const currentY = Math.max(0, window.scrollY);
    const heroBottom = getHeroThreshold();
    const now = performance.now();

    // Reached top of page: smoothly ease-out expand from pill back to full-width flat header
    if (currentY <= TOP_EXPAND_THRESHOLD) {
      pillActive = false;
      isHeaderHidden = false;
      dirAccumulator = 0;
      lastDirection = 0;
      siteHeader.classList.remove('is-hidden', 'is-pill-compact');
      lastScrollY = currentY;
      return;
    }

    const stepDiff = currentY - lastScrollY;
    lastScrollY = currentY;
    if (Math.abs(stepDiff) < 0.5) return;

    const currentDir = stepDiff > 0 ? 1 : -1;
    if (currentDir !== lastDirection) {
      dirAccumulator = 0;
      lastDirection = currentDir;
    }
    dirAccumulator += stepDiff;

    if (now - lastToggleTime < TOGGLE_COOLDOWN_MS) {
      // Even during cooldown, pre-stage compact pill class while hidden once past hero
      if (isHeaderHidden && currentY > heroBottom && !pillActive) {
        pillActive = true;
        siteHeader.classList.add('is-pill-compact');
      }
      return;
    }

    // While hidden and past hero, always pre-stage .is-pill-compact so showing on scroll-up only animates transform!
    if (isHeaderHidden && currentY > heroBottom && !pillActive) {
      pillActive = true;
      siteHeader.classList.add('is-pill-compact');
    }

    if (dirAccumulator >= HIDE_DOWN_THRESHOLD) {
      // Scrolling DOWN continuously: slide navbar UP off screen with ease-in
      if (!isHeaderHidden) {
        isHeaderHidden = true;
        lastToggleTime = now;
        siteHeader.classList.add('is-hidden');
      }
      if (currentY > heroBottom && !pillActive) {
        pillActive = true;
        siteHeader.classList.add('is-pill-compact');
      }
      const dropdownBtn = document.getElementById('projects-dropdown-btn');
      const dropdownMenu = document.getElementById('projects-dropdown-menu');
      if (dropdownBtn && dropdownMenu && dropdownMenu.classList.contains('is-open')) {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.remove('is-open');
      }
      dirAccumulator = 0;
    } else if (dirAccumulator <= -SHOW_UP_THRESHOLD) {
      // Scrolling UP continuously: slide navbar DOWN into screen with ease-out
      if ((currentY > heroBottom || pillActive) && !siteHeader.classList.contains('is-pill-compact')) {
        pillActive = true;
        siteHeader.classList.add('is-pill-compact');
        // Force style flush while still at translate3d(0, -135%, 0) before removing .is-hidden
        void siteHeader.offsetHeight;
      }
      if (isHeaderHidden) {
        isHeaderHidden = false;
        lastToggleTime = now;
        siteHeader.classList.remove('is-hidden');
      }
      dirAccumulator = 0;
    }
  };

  syncHeaderState();
  window.addEventListener(
    'scroll',
    () => {
      if (!headerRafPending) {
        headerRafPending = true;
        requestAnimationFrame(syncHeaderState);
      }
    },
    { passive: true }
  );
}

/* ==========================================================================
   2. DESKTOP "OUR PROJECTS" ACCESSIBLE DROPDOWN
   ========================================================================== */
const projectsDropdownBtn = document.getElementById('projects-dropdown-btn');
const projectsDropdownMenu = document.getElementById('projects-dropdown-menu');

if (projectsDropdownBtn && projectsDropdownMenu) {
  const closeDropdown = () => {
    projectsDropdownBtn.setAttribute('aria-expanded', 'false');
    projectsDropdownMenu.classList.remove('is-open');
  };

  projectsDropdownBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isExpanded = projectsDropdownBtn.getAttribute('aria-expanded') === 'true';
    projectsDropdownBtn.setAttribute('aria-expanded', String(!isExpanded));
    projectsDropdownMenu.classList.toggle('is-open', !isExpanded);
  });

  document.addEventListener('click', (event) => {
    if (!projectsDropdownMenu.contains(event.target) && event.target !== projectsDropdownBtn) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectsDropdownBtn.getAttribute('aria-expanded') === 'true') {
      closeDropdown();
      projectsDropdownBtn.focus();
    }
  });
}

/* ==========================================================================
   3. NATIVE <dialog> MODALS & MOBILE MENU DRAWER (Light-Dismiss Fallback)
   ========================================================================== */
function attachLightDismissFallback(dialogEl) {
  if (!dialogEl || 'closedBy' in HTMLDialogElement.prototype) return;

  dialogEl.addEventListener('click', (event) => {
    if (event.target !== dialogEl) return;
    const rect = dialogEl.getBoundingClientRect();
    const clickedInsideContent =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!clickedInsideContent) {
      dialogEl.close();
    }
  });
}

const mobileDrawer = document.getElementById('mobile-drawer');
const mobileMenuOpenBtn = document.getElementById('mobile-menu-open');
const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');

if (mobileDrawer && mobileMenuOpenBtn && mobileMenuCloseBtn) {
  mobileMenuOpenBtn.addEventListener('click', () => {
    mobileDrawer.showModal();
    mobileMenuOpenBtn.setAttribute('aria-expanded', 'true');
  });

  mobileMenuCloseBtn.addEventListener('click', () => {
    mobileDrawer.close();
  });

  mobileDrawer.addEventListener('close', () => {
    mobileMenuOpenBtn.setAttribute('aria-expanded', 'false');
  });

  // Dismiss when clicking backdrop outside the drawer panel
  mobileDrawer.addEventListener('click', (event) => {
    const panel = mobileDrawer.querySelector('.mobile-drawer__panel');
    if (panel && !panel.contains(event.target)) {
      mobileDrawer.close();
    }
  });

  mobileDrawer.querySelectorAll('a, [data-modal-open]').forEach((el) => {
    el.addEventListener('click', () => {
      if (mobileDrawer.open) mobileDrawer.close();
    });
  });
}

// Site Visit & Brochure Modals
const siteVisitModal = document.getElementById('site-visit-modal');
const brochureModal = document.getElementById('brochure-modal');

[siteVisitModal, brochureModal].forEach((modal) => {
  if (!modal) return;
  attachLightDismissFallback(modal);
});

document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const targetId = trigger.getAttribute('data-modal-open');
    const dialog = document.getElementById(targetId);
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  });
});

document.querySelectorAll('[data-modal-close]').forEach((closeBtn) => {
  closeBtn.addEventListener('click', () => {
    const dialog = closeBtn.closest('dialog');
    if (dialog) dialog.close();
  });
});

/* ==========================================================================
   4. HERO SLIDER (01 / 02 / 03 — Slow, Pausable, Eager First Slide Only)
   ========================================================================== */
const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const heroSlideBtns = Array.from(document.querySelectorAll('[data-hero-slide-btn]'));
const heroPauseBtn = document.getElementById('hero-pause-btn');

if (heroSlides.length > 1 && heroSlideBtns.length === heroSlides.length) {
  let activeHeroIdx = 0;
  let isHeroPaused = prefersReducedMotion.matches;
  let heroTimer = null;

  const setHeroSlide = (index) => {
    activeHeroIdx = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((img, idx) => {
      const isCurrent = idx === activeHeroIdx;
      img.classList.toggle('is-active', isCurrent);
      if (isCurrent) {
        img.removeAttribute('aria-hidden');
      } else {
        img.setAttribute('aria-hidden', 'true');
      }
    });
    heroSlideBtns.forEach((btn, idx) => {
      btn.setAttribute('aria-current', idx === activeHeroIdx ? 'true' : 'false');
    });
  };

  const startHeroAutoplay = () => {
    clearInterval(heroTimer);
    if (isHeroPaused) return;
    heroTimer = setInterval(() => {
      setHeroSlide(activeHeroIdx + 1);
    }, 6500); // Slow 6.5s interval for calm luxury feel
  };

  heroSlideBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      setHeroSlide(idx);
      startHeroAutoplay();
    });
  });

  if (heroPauseBtn) {
    const syncPauseLabel = () => {
      heroPauseBtn.textContent = isHeroPaused ? 'Play' : 'Pause';
      heroPauseBtn.setAttribute(
        'aria-label',
        isHeroPaused ? 'Play hero image slideshow' : 'Pause hero image slideshow'
      );
    };
    syncPauseLabel();

    heroPauseBtn.addEventListener('click', () => {
      isHeroPaused = !isHeroPaused;
      syncPauseLabel();
      startHeroAutoplay();
    });
  }

  startHeroAutoplay();
}

/* ==========================================================================
   4A. HERO ALIGNMENT TOGGLE (Option A: Center vs Option B: Left)
       + FLOATING WHATSAPP VISIBILITY AFTER HERO
   ========================================================================== */
const heroCanvasFrame = document.querySelector('.hero-canvas-frame');
const heroAlignBtns = Array.from(document.querySelectorAll('[data-hero-align]'));
const headerBar = document.querySelector('.header-bar');
const navAlignBtns = Array.from(document.querySelectorAll('[data-nav-align]'));

if (heroCanvasFrame && heroAlignBtns.length > 0) {
  heroAlignBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-hero-align');
      const isLeft = mode === 'left';
      heroCanvasFrame.classList.toggle('is-left-aligned', isLeft);
      heroAlignBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
    });
  });
}

if (headerBar && navAlignBtns.length > 0) {
  navAlignBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-nav-align');
      const isLeft = mode === 'left';
      headerBar.classList.toggle('is-nav-left', isLeft);
      navAlignBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
    });
  });
}

const floatingWhatsapp = document.querySelector('.floating-whatsapp');
if (heroCanvasFrame && floatingWhatsapp && 'IntersectionObserver' in window) {
  const waObserver = new IntersectionObserver(
    ([entry]) => {
      // Show global floating WhatsApp button only once user scrolls past the Hero
      floatingWhatsapp.classList.toggle('is-visible', !entry.isIntersecting);
    },
    { threshold: 0.25 }
  );
  waObserver.observe(heroCanvasFrame);
} else if (floatingWhatsapp) {
  floatingWhatsapp.classList.add('is-visible');
}

/* ==========================================================================
   4B. PROJECT HIGHLIGHTS X-AXIS EXPANDING ACCORDION CARDS (Timed + Clickable)
   ========================================================================== */
const highlightsAccordion = document.getElementById('highlights-accordion');
if (highlightsAccordion) {
  const highlightCards = Array.from(highlightsAccordion.querySelectorAll('.highlight-card'));
  const HIGHLIGHT_INTERVAL = 5000;
  let activeHighlightIdx = 0;
  let highlightTimer = null;
  let isHighlightPaused = prefersReducedMotion.matches;

  const setActiveHighlight = (index) => {
    activeHighlightIdx = (index + highlightCards.length) % highlightCards.length;
    highlightCards.forEach((card, idx) => {
      const isCurrent = idx === activeHighlightIdx;
      card.classList.toggle('is-active', isCurrent);
      card.setAttribute('aria-expanded', String(isCurrent));

      // Restart CSS timer progress animation cleanly on the active card
      const fill = card.querySelector('.highlight-card__progress-fill');
      if (fill && isCurrent) {
        fill.style.animation = 'none';
        void fill.offsetWidth;
        fill.style.animation = '';
      }
    });
  };

  const scheduleNextHighlight = () => {
    clearTimeout(highlightTimer);
    if (isHighlightPaused) return;
    highlightTimer = setTimeout(() => {
      setActiveHighlight(activeHighlightIdx + 1);
      scheduleNextHighlight();
    }, HIGHLIGHT_INTERVAL);
  };

  const pauseHighlights = () => {
    isHighlightPaused = true;
    clearTimeout(highlightTimer);
    highlightsAccordion.classList.add('is-paused');
  };

  const resumeHighlights = () => {
    if (prefersReducedMotion.matches) return;
    isHighlightPaused = false;
    highlightsAccordion.classList.remove('is-paused');
    scheduleNextHighlight();
  };

  highlightCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      setActiveHighlight(idx);
      if (!isHighlightPaused) {
        scheduleNextHighlight();
      }
    });
  });

  highlightsAccordion.addEventListener('mouseenter', pauseHighlights);
  highlightsAccordion.addEventListener('mouseleave', resumeHighlights);
  highlightsAccordion.addEventListener('focusin', pauseHighlights);
  highlightsAccordion.addEventListener('focusout', (event) => {
    if (!highlightsAccordion.contains(event.relatedTarget)) {
      resumeHighlights();
    }
  });

  if (!isHighlightPaused) {
    scheduleNextHighlight();
  }
}

/* ==========================================================================
   5. DRONE VIDEO PLAYBACK & CONTROLS
   ========================================================================== */
const droneStage = document.getElementById('drone-stage');
const droneVideo = document.getElementById('drone-video');
const dronePlayBtn = document.getElementById('drone-play-btn');
const droneToggleBtn = document.getElementById('drone-toggle-btn');
const droneRewindBtn = document.getElementById('drone-rewind-btn');
const droneForwardBtn = document.getElementById('drone-forward-btn');

if (droneStage && droneVideo && dronePlayBtn) {
  const PLAY_ICON = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v14l11-7-11-7z"></path>
    </svg>
  `;
  const PAUSE_ICON = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1"></rect>
      <rect x="14" y="5" width="4" height="14" rx="1"></rect>
    </svg>
  `;

  const syncPlaybackUI = () => {
    const isPlaying = !droneVideo.paused && !droneVideo.ended;
    droneStage.classList.toggle('is-playing', isPlaying);
    if (isPlaying) {
      droneStage.classList.add('has-started');
    }
    if (droneToggleBtn) {
      droneToggleBtn.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
      droneToggleBtn.setAttribute(
        'aria-label',
        isPlaying ? 'Pause aerial tour video' : 'Play aerial tour video'
      );
    }
  };

  const toggleDronePlayback = () => {
    if (droneVideo.paused) {
      droneStage.classList.add('has-started');
      droneVideo.play().catch(() => {});
    } else {
      droneVideo.pause();
    }
  };

  const seekBy = (deltaSeconds) => {
    const duration = droneVideo.duration;
    const nextTime = droneVideo.currentTime + deltaSeconds;
    if (Number.isFinite(duration) && duration > 0) {
      droneVideo.currentTime = Math.max(0, Math.min(duration, nextTime));
    } else {
      droneVideo.currentTime = Math.max(0, nextTime);
    }
  };

  dronePlayBtn.addEventListener('click', toggleDronePlayback);
  droneVideo.addEventListener('click', toggleDronePlayback);

  if (droneToggleBtn) {
    droneToggleBtn.addEventListener('click', toggleDronePlayback);
  }
  if (droneRewindBtn) {
    droneRewindBtn.addEventListener('click', () => seekBy(-10));
  }
  if (droneForwardBtn) {
    droneForwardBtn.addEventListener('click', () => seekBy(10));
  }

  droneVideo.addEventListener('play', syncPlaybackUI);
  droneVideo.addEventListener('pause', syncPlaybackUI);
  droneVideo.addEventListener('ended', syncPlaybackUI);
}

/* ==========================================================================
   6. CONTINUOUS SCROLLYTELLING:
      Video Hold -> Scroll Expands Video to 100% Width & Slides Left Card Away ->
      Right "Our Projects" Cards Scroll Up & Crossfade 7 Images ->
      Image Decreases & 4 Project Locations Slide Up Centered
   ========================================================================== */
const projectsSection = document.getElementById('rock-palms-section');
const videoScrollZone = document.getElementById('projects-video-scroll-zone');
const projectsFeaturesList = document.getElementById('projects-features-list');
const projectsModeBtns = Array.from(document.querySelectorAll('[data-projects-mode]'));
const projectSteps = Array.from(document.querySelectorAll('[data-project-step]'));
const projectSlides = Array.from(document.querySelectorAll('[data-project-img]'));
const projectStepCount = document.getElementById('projects-step-count');
const projectStepLabel = document.getElementById('projects-step-label');

if (projectsSection && projectSteps.length > 0 && projectSlides.length > 0) {
  let activeProjectStep = -1; // -1 = Drone Video phase, 0..6 = 7 Project Images
  let hoveredCompactStep = 0; // In Compact Mode, scroll sets step 0; hovering any of the 6 features sets 1..6

  const setActiveProjectStep = (index) => {
    if (index === activeProjectStep) return;
    activeProjectStep = index;

    const isVideoMode = index < 0;
    projectsSection.classList.toggle('is-video-phase', isVideoMode);

    if (isVideoMode) {
      projectSlides.forEach((img) => img.classList.remove('is-active'));
      projectSteps.forEach((step) => step.classList.remove('is-active'));
      return;
    }

    // Pause video automatically once project images take over
    if (droneVideo && !droneVideo.paused) {
      droneVideo.pause();
    }

    const safeIdx = Math.max(0, Math.min(projectSlides.length - 1, index));
    projectSlides.forEach((img, idx) => {
      img.classList.toggle('is-active', idx === safeIdx);
    });

    projectSteps.forEach((step, idx) => {
      step.classList.toggle('is-active', idx === safeIdx);
    });

    if (projectStepCount) {
      projectStepCount.textContent = `${String(safeIdx + 1).padStart(2, '0')} / ${String(projectSlides.length).padStart(2, '0')}`;
    }

    if (projectStepLabel) {
      const label = projectSteps[safeIdx]?.getAttribute('data-step-label') || 'Rock Palms Abound Serenity';
      projectStepLabel.textContent = label;
    }
  };

  let projectScrollTicking = false;
  const updateProjectStepOnScroll = () => {
    projectScrollTicking = false;
    const vh = window.innerHeight;
    const secRect = projectsSection.getBoundingClientRect();
    const isCompactMode = projectsSection.classList.contains('is-compact-features');

    // 1. Continuous Video Expansion & Left Card Slide-Off Progress (0 -> 1)
    // Starts expanding once the sticky stage pins at the top (secRect.top <= 0)
    const scrolledInSection = Math.max(0, -secRect.top);
    const holdDistance = vh * 0.2; // Brief hold on pinned rounded video
    const expandDistance = vh * 0.65; // Smooth expansion distance to 100% full width
    const rawExp = (scrolledInSection - holdDistance) / Math.max(1, expandDistance);
    const expProgress = Math.max(0, Math.min(1, rawExp));

    const insetTop = Math.round(28 * (1 - expProgress));
    const insetX = Math.round(36 * (1 - expProgress));
    const radius = Math.round(24 * (1 - expProgress));

    projectsSection.style.setProperty('--vid-inset-top', `${insetTop}px`);
    projectsSection.style.setProperty('--vid-inset-bottom', `${insetTop}px`);
    projectsSection.style.setProperty('--vid-inset-x', `${insetX}px`);
    projectsSection.style.setProperty('--vid-radius', `${radius}px`);
    projectsSection.style.setProperty('--video-card-slide', expProgress.toFixed(3));
    projectsSection.style.setProperty('--video-ui-opacity', Math.max(0, 1 - expProgress * 1.25).toFixed(3));

    // 2. Check if first "Our Projects" card on the right has entered the bottom-right corner zone
    const firstCardRect = projectSteps[0].getBoundingClientRect();
    if (firstCardRect.top > vh * 0.82) {
      // Still in Drone Video phase
      hoveredCompactStep = 0;
      setActiveProjectStep(-1);
      projectsSection.classList.remove('is-locations-finale');
      return;
    }

    // 3. COMPACT 6-FEATURES CONTAINER MODE:
    //    - First scroll: "Our Projects" Intro Card changes image to step 0
    //    - Next scroll: Single container with all 6 features slides up; image only changes when user hovers/clicks a feature!
    if (isCompactMode) {
      if (projectsFeaturesList) {
        const trayRect = projectsFeaturesList.getBoundingClientRect();
        // When user is still on the Intro Card (before the 6-features tray slides up), show step 0
        if (trayRect.top > vh * 0.78) {
          hoveredCompactStep = 0;
          setActiveProjectStep(0);
        } else {
          setActiveProjectStep(hoveredCompactStep);
        }
        // Finale triggers as soon as the single 6-features tray exits the top
        const isFinale = trayRect.bottom <= -12;
        projectsSection.classList.toggle('is-locations-finale', isFinale);
        return;
      }
    }

    // 4. SCROLL 1-BY-1 MODE: activate whichever right-corner card is closest to bottom-right focal zone
    const focalY = vh * 0.64;
    let bestIdx = 0;
    let bestDist = Infinity;

    projectSteps.forEach((step, idx) => {
      const rect = step.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const dist = Math.abs(center - focalY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });

    setActiveProjectStep(bestIdx);

    // 5. Finale in 1-by-1 mode: wait until the 6th feature card has COMPLETELY exited the top of the screen
    const lastStep = projectSteps[projectSteps.length - 1];
    if (lastStep) {
      const lastRect = lastStep.getBoundingClientRect();
      const isFinale = lastRect.bottom <= -12;
      projectsSection.classList.toggle('is-locations-finale', isFinale);
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!projectScrollTicking) {
        projectScrollTicking = true;
        requestAnimationFrame(updateProjectStepOnScroll);
      }
    },
    { passive: true }
  );

  // Hover, Focus, Click & Keyboard support on every card (Intro card + all 6 Feature cards)
  projectSteps.forEach((step, idx) => {
    const activateFromPointer = () => {
      hoveredCompactStep = idx;
      setActiveProjectStep(idx);
    };
    step.addEventListener('mouseenter', activateFromPointer);
    step.addEventListener('focus', activateFromPointer);
    step.addEventListener('click', activateFromPointer);
    step.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateFromPointer();
      }
    });
  });

  // Mode Switcher Toggle ("Compact: 6 Features Hover" vs "Scroll: 1-by-1")
  if (projectsModeBtns.length > 0) {
    projectsModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-projects-mode');
        const isCompact = mode === 'compact';
        projectsSection.classList.toggle('is-compact-features', isCompact);
        projectsModeBtns.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        updateProjectStepOnScroll();
      });
    });
  }

  updateProjectStepOnScroll();
}

/* ==========================================================================
   7. SUBTLE SCROLL REVEAL & ANIMATED STAT COUNTERS
   ========================================================================== */
const revealNodes = document.querySelectorAll('.reveal-on-scroll');
if (revealNodes.length > 0) {
  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealNodes.forEach((node) => revealObserver.observe(node));
  }
}

const statCounters = document.querySelectorAll('[data-count-target]');
if (statCounters.length > 0 && 'IntersectionObserver' in window && !prefersReducedMotion.matches) {
  const animateCounter = (el) => {
    const targetRaw = parseFloat(el.getAttribute('data-count-target') || '0');
    const prefix = el.getAttribute('data-count-prefix') || '';
    const suffix = el.getAttribute('data-count-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
    const padZero = el.getAttribute('data-count-pad') === 'true';
    const duration = 1400;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = targetRaw * eased;

      let formatted = decimals > 0 ? currentVal.toFixed(decimals) : String(Math.round(currentVal));
      if (padZero && formatted.length === 1) {
        formatted = '0' + formatted;
      }

      el.textContent = `${prefix}${formatted}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        let finalFormatted = decimals > 0 ? targetRaw.toFixed(decimals) : String(targetRaw);
        if (padZero && finalFormatted.length === 1) finalFormatted = '0' + finalFormatted;
        el.textContent = `${prefix}${finalFormatted}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  statCounters.forEach((el) => counterObserver.observe(el));
}

/* ==========================================================================
   8. TIMED SINGLE-CARD TESTIMONIAL CAROUSEL WITH BOTTOM PROGRESS LINE & CARETS
   ========================================================================== */
const testimonialRegion = document.getElementById('testimonial-region');
const carouselTrack = document.getElementById('testimonial-track');
const testimonialTimerFill = document.getElementById('testimonial-timer-fill');
const carouselStatus = document.getElementById('testimonial-status');
const prevBtn = document.querySelector('[data-carousel-dir="prev"]');
const nextBtn = document.querySelector('[data-carousel-dir="next"]');

if (carouselTrack) {
  const slides = Array.from(carouselTrack.querySelectorAll('[role="group"][aria-roledescription="slide"]'));
  const TESTIMONIAL_INTERVAL = 5000;
  let activeIndex = 0;
  let settledIndex = 0;
  let pendingTargetIndex = null;
  let rafId = null;
  let autoTimer = null;
  let isPaused = prefersReducedMotion.matches;

  const restartTimerBar = () => {
    if (!testimonialTimerFill) return;
    testimonialTimerFill.classList.remove('is-animating');
    void testimonialTimerFill.offsetWidth;
    if (!prefersReducedMotion.matches) {
      testimonialTimerFill.classList.add('is-animating');
    }
  };

  const scheduleNextTestimonial = () => {
    clearTimeout(autoTimer);
    if (isPaused) return;
    autoTimer = setTimeout(() => {
      const nextIdx = (activeIndex + 1) % slides.length;
      scrollToSlide(nextIdx, false);
    }, TESTIMONIAL_INTERVAL);
  };

  const pauseTestimonials = () => {
    isPaused = true;
    clearTimeout(autoTimer);
    testimonialRegion?.classList.add('is-paused');
  };

  const resumeTestimonials = () => {
    if (prefersReducedMotion.matches) return;
    isPaused = false;
    testimonialRegion?.classList.remove('is-paused');
    restartTimerBar();
    scheduleNextTestimonial();
  };

  const getNearestSlideIndex = () => {
    const trackRect = carouselTrack.getBoundingClientRect();
    let closestIdx = 0;
    let minDistance = Infinity;
    slides.forEach((slide, idx) => {
      const slideRect = slide.getBoundingClientRect();
      const distance = Math.abs(slideRect.left - trackRect.left);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });
    return closestIdx;
  };

  const syncActiveSlide = (idx) => {
    activeIndex = idx;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-snapped', i === idx);
    });
  };

  const syncSettledState = (announce = true) => {
    const idx = getNearestSlideIndex();
    pendingTargetIndex = null;
    syncActiveSlide(idx);

    if (announce && idx !== settledIndex && carouselStatus) {
      carouselStatus.textContent = `Showing testimonial ${idx + 1} of ${slides.length}`;
    }
    settledIndex = idx;
  };

  const scrollToSlide = (targetIdx, announce = true) => {
    const wrappedIdx = (targetIdx + slides.length) % slides.length;
    pendingTargetIndex = wrappedIdx;
    syncActiveSlide(wrappedIdx);
    restartTimerBar();
    scheduleNextTestimonial();

    const targetSlide = slides[wrappedIdx];
    if (targetSlide) {
      const offset = targetSlide.offsetLeft - carouselTrack.offsetLeft;
      carouselTrack.scrollTo({
        left: offset,
        behavior: prefersReducedMotion.matches ? 'instant' : 'smooth',
      });
    }
    if (announce && carouselStatus) {
      carouselStatus.textContent = `Showing testimonial ${wrappedIdx + 1} of ${slides.length}`;
    }
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const baseIdx = pendingTargetIndex !== null ? pendingTargetIndex : getNearestSlideIndex();
      scrollToSlide(baseIdx - 1, true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const baseIdx = pendingTargetIndex !== null ? pendingTargetIndex : getNearestSlideIndex();
      scrollToSlide(baseIdx + 1, true);
    });
  }

  if (testimonialRegion) {
    testimonialRegion.addEventListener('mouseenter', pauseTestimonials);
    testimonialRegion.addEventListener('mouseleave', resumeTestimonials);
    testimonialRegion.addEventListener('focusin', pauseTestimonials);
    testimonialRegion.addEventListener('focusout', (event) => {
      if (!testimonialRegion.contains(event.relatedTarget)) {
        resumeTestimonials();
      }
    });
  }

  carouselTrack.addEventListener(
    'scroll',
    () => {
      if (pendingTargetIndex !== null) return;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        syncActiveSlide(getNearestSlideIndex());
      });
    },
    { passive: true }
  );

  if ('onscrollend' in window) {
    carouselTrack.addEventListener('scrollend', () => syncSettledState(false));
  } else {
    let scrollTimeout = null;
    carouselTrack.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => syncSettledState(false), 150);
      },
      { passive: true }
    );
  }

  syncSettledState(false);
  restartTimerBar();
  scheduleNextTestimonial();
}

/* ==========================================================================
   9. POST-INTERACTION FORM VALIDATION & FORMSPREE SUBMISSION
      (Modern Web Guidance: validate-input-after-interaction)
   ========================================================================== */
const syncFieldAriaInvalid = (el) => {
  if (!el || !el.matches || !el.matches('input, select, textarea')) return;
  const isUserInvalid = CSS.supports('selector(:user-invalid)')
    ? el.matches(':user-invalid')
    : !el.validity.valid;
  el.setAttribute('aria-invalid', isUserInvalid ? 'true' : 'false');
};

document.addEventListener('blur', (event) => syncFieldAriaInvalid(event.target), true);
document.addEventListener('input', (event) => {
  if (event.target?.hasAttribute?.('aria-invalid')) {
    syncFieldAriaInvalid(event.target);
  }
});
document.addEventListener('invalid', (event) => syncFieldAriaInvalid(event.target), true);

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpwqobwj';

document.querySelectorAll('form[data-skd-form]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formType = form.getAttribute('data-skd-form');
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnLabel = submitBtn ? submitBtn.textContent : '';

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (statusEl) {
      statusEl.className = 'form-status';
      statusEl.textContent = '';
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, type: formType }),
      });

      if (response.ok) {
        form.reset();
        if (statusEl) {
          statusEl.className = 'form-status is-visible is-success';
          statusEl.textContent =
            formType === 'BROCHER_REQUEST'
              ? 'Thank You! Your Brochure Is on Its Way. Your request has been successfully submitted. The brochure for Rock Palms Abound Serenity has been sent to your email.'
              : formType === 'CONTACT_US'
                ? 'Message sent successfully. Thank you for contacting Sri Karthikeya Developers — our team will get in touch with you shortly.'
                : 'Thank You! Your Booking Request Has Been Received. Your booking request has been successfully submitted. Our team will get in touch with you shortly to confirm your appointment and provide further details.';
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      if (statusEl) {
        statusEl.className = 'form-status is-visible is-error';
        statusEl.textContent = 'Failed to send message. Please call us directly at +91 952 645 6789.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnLabel;
      }
    }
  });
});

/* ==========================================================================
   13. ABOUT PAGE: 4-CHAPTER STORY PROGRESSION (Auto-Cycling 5s Timer + Click/Hover/Focus)
   ========================================================================== */
const aboutChaptersGrid = document.getElementById('about-chapters-grid');

if (aboutChaptersGrid) {
  const chapterCards = Array.from(aboutChaptersGrid.querySelectorAll('.about-chapter-card'));
  let activeChapterIdx = 0;
  let chapterTimer = null;
  let chapterPaused = false;
  const CHAPTER_DURATION_MS = 5000;

  const setActiveChapter = (index) => {
    activeChapterIdx = (index + chapterCards.length) % chapterCards.length;
    chapterCards.forEach((card, idx) => {
      const isMatch = idx === activeChapterIdx;
      card.classList.toggle('is-active', isMatch);
      const fill = card.querySelector('.about-chapter-card__progress-fill');
      if (fill && isMatch) {
        fill.style.animation = 'none';
        void fill.offsetWidth;
        fill.style.animation = '';
      }
    });
  };

  const startChapterTimer = () => {
    clearInterval(chapterTimer);
    if (prefersReducedMotion.matches) return;
    chapterTimer = setInterval(() => {
      if (!chapterPaused && !document.hidden) {
        setActiveChapter(activeChapterIdx + 1);
      }
    }, CHAPTER_DURATION_MS);
  };

  chapterCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      setActiveChapter(idx);
      startChapterTimer();
    });
    card.addEventListener('mouseenter', () => {
      setActiveChapter(idx);
    });
    card.addEventListener('focus', () => {
      setActiveChapter(idx);
    });
  });

  aboutChaptersGrid.addEventListener('mouseenter', () => {
    chapterPaused = true;
  });
  aboutChaptersGrid.addEventListener('mouseleave', () => {
    chapterPaused = false;
  });
  aboutChaptersGrid.addEventListener('focusin', () => {
    chapterPaused = true;
  });
  aboutChaptersGrid.addEventListener('focusout', () => {
    chapterPaused = false;
  });

  startChapterTimer();
}

/* ==========================================================================
   14. ABOUT PAGE: 4-PILLAR ARCHITECTURAL HOVER-REVEAL LEDGER
   ========================================================================== */
const aboutLedgerList = document.getElementById('about-ledger-list');
const aboutLedgerStage = document.getElementById('about-ledger-stage');

if (aboutLedgerList && aboutLedgerStage) {
  const ledgerRows = Array.from(aboutLedgerList.querySelectorAll('.about-ledger-row'));
  const ledgerSlides = Array.from(aboutLedgerStage.querySelectorAll('.about-ledger-slide'));
  const countEl = document.getElementById('about-pillar-count');
  const labelEl = document.getElementById('about-pillar-label');
  const captionEl = document.getElementById('about-pillar-caption');

  const activatePillar = (index) => {
    ledgerRows.forEach((row, idx) => {
      const isMatch = idx === index;
      row.classList.toggle('is-active', isMatch);
      if (isMatch) {
        if (countEl && row.dataset.pillarCount) countEl.textContent = row.dataset.pillarCount;
        if (labelEl && row.dataset.pillarTitle) labelEl.textContent = row.dataset.pillarTitle;
        if (captionEl && row.dataset.pillarCaption) captionEl.textContent = row.dataset.pillarCaption;
      }
    });

    ledgerSlides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === index);
    });
  };

  ledgerRows.forEach((row, idx) => {
    row.addEventListener('mouseenter', () => activatePillar(idx));
    row.addEventListener('focus', () => activatePillar(idx));
    row.addEventListener('click', () => activatePillar(idx));
  });
}

/* ==========================================================================
   15. LOCAL ROUTE NORMALIZER (Ensures No Nav Link Ever Redirects to Live Site)
   ========================================================================== */
const LOCAL_ROUTE_MAP = {
  'https://www.karthikeya.net/': 'index.html',
  'https://www.karthikeya.net': 'index.html',
  'https://www.karthikeya.net/about': 'about.html',
  'https://www.karthikeya.net/our-projects/ongoing': 'ongoing-projects.html',
  'https://www.karthikeya.net/our-projects/completed': 'completed-projects.html',
  'https://www.karthikeya.net/blogs': 'blogs.html',
  'https://www.karthikeya.net/contact-us': 'contact-us.html',
};

document.querySelectorAll('a[href]').forEach((anchor) => {
  const rawHref = anchor.getAttribute('href')?.trim();
  if (rawHref && LOCAL_ROUTE_MAP[rawHref]) {
    anchor.setAttribute('href', LOCAL_ROUTE_MAP[rawHref]);
  }
});

/* ==========================================================================
   15B. M2 RED COLOR THEME SWITCHER ("Bright" #ed1c24 vs "Dark" #800a0f)
   ========================================================================== */
const versionSwitcherPill = document.querySelector('.version-switcher-pill');

const applyRedTheme = (theme) => {
  const normalized = theme === 'dark' ? 'dark' : 'bright';
  if (normalized === 'dark') {
    document.documentElement.setAttribute('data-red-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-red-theme');
  }
  try {
    localStorage.setItem('skd-m2-red-theme', normalized);
  } catch {}
  document.querySelectorAll('[data-red-option]').forEach((btn) => {
    const isMatch = btn.getAttribute('data-red-option') === normalized;
    btn.classList.toggle('is-active', isMatch);
    btn.setAttribute('aria-pressed', String(isMatch));
  });
};

// Restore saved theme immediately
let initialRedTheme = 'bright';
try {
  initialRedTheme = localStorage.getItem('skd-m2-red-theme') || 'bright';
} catch {}
applyRedTheme(initialRedTheme);

if (versionSwitcherPill && !versionSwitcherPill.querySelector('[data-red-option]')) {
  const divider = document.createElement('span');
  divider.className = 'version-switcher-divider';
  divider.setAttribute('aria-hidden', 'true');

  const brightBtn = document.createElement('button');
  brightBtn.type = 'button';
  brightBtn.className = 'version-switch-btn version-red-btn';
  brightBtn.setAttribute('data-red-option', 'bright');
  brightBtn.innerHTML = '<span class="red-swatch red-swatch--bright" aria-hidden="true"></span>Bright';

  const darkBtn = document.createElement('button');
  darkBtn.type = 'button';
  darkBtn.className = 'version-switch-btn version-red-btn';
  darkBtn.setAttribute('data-red-option', 'dark');
  darkBtn.innerHTML = '<span class="red-swatch red-swatch--dark" aria-hidden="true"></span>Dark';

  brightBtn.addEventListener('click', () => applyRedTheme('bright'));
  darkBtn.addEventListener('click', () => applyRedTheme('dark'));

  versionSwitcherPill.append(divider, brightBtn, darkBtn);
  applyRedTheme(initialRedTheme);
}

/* ==========================================================================
   16. ONGOING PROJECTS: INTERACTIVE FLOOR PLAN SWITCHER (200 / 180 / 167 SQ. YD + Floor Thumbnails)
   ========================================================================== */
const floorplanSizeBtns = Array.from(document.querySelectorAll('.floorplan-size-btn'));
const villaPlanCards = Array.from(document.querySelectorAll('.villa-plan-card'));

// Exact BUA specification data from the live site (/our-projects/ongoing)
const VILLA_BUA_SPECS = {
  East: {
    200: { ground: '1361 Sft', first: '1416 SFT', second: '1301 Sft', parking: '199 Sft', total: '2700 Sft' },
    180: { ground: '959 Sft', first: '1092 SFT', second: '890 Sft', parking: '122 Sft', total: '2442 Sft' },
    167: { ground: '959 Sft', first: '1092 SFT', second: '890 Sft', parking: '122 Sft', total: '2442 Sft' },
  },
  West: {
    200: { ground: '1361 Sft', first: '1419 SFT', second: '1301 Sft', parking: '191 Sft', total: '2700 Sft' },
    180: { ground: '959 Sft', first: '1092 SFT', second: '890 Sft', parking: '122 Sft', total: '2442 Sft' },
    167: { ground: '959 Sft', first: '1082 SFT', second: '916 Sft', parking: '122 Sft', total: '2442 Sft' },
  },
};

if (floorplanSizeBtns.length > 0 && villaPlanCards.length > 0) {
  floorplanSizeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const plotSize = btn.getAttribute('data-plot-size') || '200';
      floorplanSizeBtns.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle('is-active', isCurrent);
        b.setAttribute('aria-selected', String(isCurrent));
      });

      villaPlanCards.forEach((card) => {
        const dir = card.getAttribute('data-villa-direction') || 'East';
        const spec = VILLA_BUA_SPECS[dir]?.[plotSize];
        card.querySelectorAll('.js-plot-size-num').forEach((el) => {
          el.textContent = plotSize;
        });
        if (spec) {
          const groundEl = card.querySelector('.js-bua-ground');
          const firstEl = card.querySelector('.js-bua-first');
          const secondEl = card.querySelector('.js-bua-second');
          const parkingEl = card.querySelector('.js-bua-parking');
          const totalEl = card.querySelector('.js-bua-total');
          if (groundEl) groundEl.textContent = spec.ground;
          if (firstEl) firstEl.textContent = spec.first;
          if (secondEl) secondEl.textContent = spec.second;
          if (parkingEl) parkingEl.textContent = spec.parking;
          if (totalEl) totalEl.textContent = spec.total;
        }
      });
    });
  });

  // Floor level thumbnail switcher inside each villa card
  villaPlanCards.forEach((card) => {
    const dir = card.getAttribute('data-villa-direction') || 'East';
    const mainImg = card.querySelector('.js-villa-main-img');
    const zoomBtn = card.querySelector('.js-villa-zoom-btn');
    const thumbBtns = Array.from(card.querySelectorAll('.villa-thumb-btn'));

    thumbBtns.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const src = thumb.getAttribute('data-plan-img');
        const label = thumb.getAttribute('data-plan-label') || 'Floor Plan';
        if (src && mainImg) {
          mainImg.src = src;
          mainImg.alt = `${dir} Facing Villa — ${label}`;
        }
        if (src && zoomBtn) {
          zoomBtn.setAttribute('data-lightbox-src', src);
          zoomBtn.setAttribute('data-lightbox-title', `${dir} Facing Villa (${label}) — Rock Palms Abound Serenity`);
        }
        thumbBtns.forEach((t) => t.classList.toggle('is-active', t === thumb));
      });
    });
  });
}

/* ==========================================================================
   17. FULL-VIEW PLAN & MAP LIGHTBOX MODAL (<dialog id="plan-lightbox-modal">)
   ========================================================================== */
const planLightboxModal = document.getElementById('plan-lightbox-modal');
const lightboxModalImg = document.getElementById('lightbox-modal-img');
const lightboxModalTitle = document.getElementById('lightbox-modal-title');

if (planLightboxModal && lightboxModalImg) {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lightbox-src]');
    if (!trigger) return;
    const src = trigger.getAttribute('data-lightbox-src');
    const title = trigger.getAttribute('data-lightbox-title') || 'Full View';
    if (src) {
      lightboxModalImg.src = src;
      lightboxModalImg.alt = title;
      if (lightboxModalTitle) lightboxModalTitle.textContent = title;
      if (typeof planLightboxModal.showModal === 'function') {
        planLightboxModal.showModal();
      }
    }
  });
}

/* ==========================================================================
   18. BLOGS PAGE: PAGINATION (Page 1 / Page 2 / All 6) & FULL ARTICLE READER VIEW
   (100% Verbatim Articles From Live Site Module 9166)
   ========================================================================== */
const SKD_BLOGS_DATA = [
  {
    id: 1,
    slug: 'dundigal-connectivity-infrastructure-blueprint-hyderabad-investment-hub',
    name: "The Infrastructure Blueprint: How Dundigal's Connectivity (ORR, RRR) is Forging Hyderabad's Next Great Investment Hub",
    date: '02 October, 2025',
    timeReq: '5 min Read',
    coverImage: 'https://www.karthikeya.net/_next/static/media/blog-1.18310ce9.png',
    article: {
      introduction: [
        'In the world of real estate, the age-old mantra is "location, location, location." But in Hyderabad, a city expanding at an unprecedented rate, that mantra has evolved. Today, the winning formula is "connectivity, connectivity, connectivity." No other region in the city embodies this new truth more powerfully than Dundigal.',
        "For years, Dundigal was a distant name, known primarily as the prestigious home of the Indian Air Force Academy. Today, it stands as one of the most strategic and intelligent investment locations in the entire Hyderabad Metropolitan Region (HMR). This transformation hasn't been accidental; it's the direct result of a massive, state-backed infrastructure blueprint that has turned a once-remote area into a hyper-connected nexus.",
        'For the savvy investor, understanding this infrastructure is key to understanding why Dundigal isn\'t just a "good" investment—it\'s arguably the best long-term bet in the city right now. This is a deep dive into the concrete, steel, and tarmac that is paving the way for Dundigal\'s explosive growth.',
      ],
      parts: [
        {
          label: 'Part 1: The Game-Changer (The ORR)',
          aboveParas: [
            "The first and most critical piece of the puzzle is the 158-kilometer, 8-lane marvel known as the Nehru Outer Ring Road (ORR). The ORR isn't just a road; it's an economic artery that has fundamentally redefined Hyderabad's geography.",
            "Dundigal's golden ticket is its direct access to this artery via Exit 5 (Dundigal/Medchal). This exit doesn't just put Dundigal on the map; it links it, via a high-speed, signal-free corridor, to every major economic hub in the city.",
          ],
          listParas: [
            {
              type: 'disc',
              para: "Let's quantify this impact:",
              list: [
                'To the IT Corridor: From the Dundigal ORR entry, an employee can reach the Gachibowli and Financial District exits in approximately 30-40 minutes. This single fact has transformed the region. It is no longer a remote outpost; it is now a viable and peaceful "commuter suburb" for the city\'s 600,000+ IT workforce. Professionals can now realistically work in the congested IT hub but live in the serene, green, and spacious environment of Dundigal.',
                'To the Airport: The ORR provides a seamless 45-50 minute drive to the Rajiv Gandhi International Airport (RGIA) in Shamshabad. This is a crucial factor for business travelers, NRIs, and the logistics industry.',
                "To Other Hubs: Its proximity to the Kompally exit (10-15 minutes) connects it to one of North Hyderabad's biggest commercial and retail zones",
              ],
            },
          ],
          belowParas: [
            "The ORR has already completed its primary mission: it unlocked the land's value and made it accessible. This accessibility triggered the first wave of residential development, primarily in the form of the gated villa and plotted communities that now define the area.",
          ],
        },
        {
          label: 'Part 2: The Future Multiplier (The RRR)',
          aboveParas: [
            'If the ORR was the match that lit the fire, the upcoming Regional Ring Road (RRR) is the fuel that will turn it into an inferno of growth.',
            "The RRR is a colossal 340-kilometer, 4-lane access-controlled expressway that will encircle Hyderabad outside the ORR. This project is the single largest infrastructure undertaking in Telangana's history and is a core component of the HMDA's long-term master plan.",
          ],
          listParas: [
            {
              type: 'numeric',
              para: 'Here’s why this is a generational opportunity for Dundigal investors:',
              list: [
                'Strategic Alignment: The RRR is being built in two parts: Northern (Sangareddy to Choutuppal) and Southern. The Northern part is the priority, and its alignment passes directly through this greater Dundigal-Medchal belt.',
                "Decongestion and New Hubs: The RRR's primary purpose is to divert all inter-state highway truck and cargo traffic away from the ORR, freeing the ORR to become a true intra-city expressway.",
                'Creation of Satellite Townships: The government\'s stated plan for the RRR is not just to build a road, but to create "new urban nodes and centres" and "satellite townships" all along its corridor [3]. These nodes are designated for massive industrial clusters, logistics parks, and IT centers.',
              ],
            },
          ],
          belowParas: [
            'Dundigal is perfectly positioned at the intersection of the existing ORR and the upcoming RRR. This creates a "growth sandwich," where the region benefits from both immediate city connectivity (ORR) and future regional economic connectivity (RRR).',
            'As of late 2024 and early 2025, the Northern segment of the RRR is in the advanced stages of tendering and land acquisition, with the foundation stone already laid [3]. Investors who buy in Dundigal now are buying at pre-RRR completion prices. The appreciation cycle that the ORR triggered in Kokapet and Narsingi from 2008 to 2018 is poised to repeat itself here, but on an even grander scale.',
          ],
        },
        {
          label: 'Part 3: The Arterial Network That Binds It Together',
          listParas: [
            {
              type: 'disc',
              para: 'Beyond the two "ring roads," Dundigal\'s connectivity is further strengthened by a robust network of national and state highways:',
              list: [
                'NH-44 (Srinagar-Kanyakumaru Highway): This major national highway runs through the adjacent Medchal area, providing a direct link to the northern states and the industrial belts of Kompally and Jeedimetla.',
                "Internal Master Plan Roads: As part of the HMDA's planned development, the area is seeing a rapid expansion of its internal road network, with 100-foot and 80-foot arterial roads connecting the ORR service road to the burgeoning residential layouts. This ensures that the region grows in an organized, grid-like fashion, preventing the chaotic bottlenecks seen in older parts of the city.",
              ],
            },
          ],
        },
      ],
      conclusion: {
        label: 'Conclusion: An Investment Paved in Concrete',
        paras: [
          'In real estate, speculation can be dangerous. But investing based on tangible, funded, and under-construction infrastructure is the safest and smartest form of strategic investment.',
          "The case for Dundigal is not built on hype; it's built on a foundation of asphalt and concrete.",
          'The ORR has already made it accessible and desirable. The RRR is set to make it a critical economic and logistics hub for the entire state. This "infrastructure-led" development ensures that the demand for property in Dundigal will be sustainable and multi-faceted, driven not just by residential demand but by the thousands of jobs the RRR corridor will create.',
          "Buying in Dundigal today is the equivalent of buying in Gachibowli in the early 2000s or Kokapet in 2010. The blueprint for its future is already drawn, and the machines are already on the ground. The only question is whether you'll be a part of it.",
        ],
      },
      references: [
        '[1] Aparna Constructions. (n.d.). "The Perfect Place for Open Plots Investment in Dundigal." [2] Housing.com. (Oct 2025). "Regional ring road (RRR) Hyderabad map, route and real estate impact." [3] HMDA. (n.d.). "Master Plan."',
      ],
    },
  },
  {
    id: 2,
    slug: 'dundigal-economic-anchor-new-frontier',
    name: "Beyond Residential: Dundigal's Rise as an Economic Anchor (Aerospace, Logistics, and IT's New Frontier)",
    date: '04 October, 2025',
    timeReq: '5 min Read',
    coverImage: 'https://www.karthikeya.net/_next/static/media/blog-2.68341841.png',
    article: {
      introduction: [
        'When investors evaluate a real estate market, they often look at the "pull factors"—the fundamental economic drivers that create jobs and pull a population to an area. For decades, Hyderabad\'s story had one pull factor: IT. This concentrated all growth in the western corridor, from HITEC City to Gachibowli.',
        'Today, a far more resilient and diverse economic story is unfolding in North-West Hyderabad, and Dundigal is at its epicenter. This region is not a sleepy suburb; it is a powerful economic anchor being fueled by a "triple-threat" of industry: Aerospace & Defence, Logistics & Warehousing, and the new, decentralized IT frontier.',
        'This diversified economy makes Dundigal one of the most stable and high-potential investment destinations in the city. A region with multiple job engines is insulated from the slumps of any single sector, ensuring consistent and long-term demand for housing.',
      ],
      parts: [
        {
          label: 'Part 1: The "Anchor" Tenant - Aerospace & Defence',
          listParas: [
            {
              type: 'disc',
              para: 'Long before it was a real estate hotspot, Dundigal was, and still is, the home of the prestigious Indian Air Force Academy (AFA). This massive defence installation acts as a powerful "anchor tenant" for the entire region, much like a major university or hospital. It provides:',
              list: [
                'Economic Stability: The AFA brings thousands of high-income, permanent personnel and their families to the area, creating a baseline of stable, non-speculative demand for housing and services.',
                "A High-Tech Ecosystem: The AFA's presence has naturally attracted a cluster of ancillary aerospace and defence industries. Hyderabad is one of India's biggest aerospace hubs, home to giants like Lockheed Martin, Boeing, TATA Advanced Systems, and GE Aviation [4]. Many of the MSMEs and component suppliers that form the backbone of this ecosystem are located in the northern belt, leveraging the proximity to both the AFA and the industrial parks of Medchal and Patancheru.",
              ],
            },
          ],
          belowParas: [
            "This defence and aerospace presence gives the region an economic identity that is separate from IT and provides a high-value, high-skill employment base that continues to grow as India's defence manufacturing sector expands.",
          ],
        },
        {
          label: 'Part 2: The "Growth Engine" - Logistics & Warehousing',
          listParas: [
            {
              type: 'disc',
              para: "This is the region's single biggest commercial driver. Dundigal's location is a logistician's dream, perfectly situated at the intersection of:",
              list: [
                'The Outer Ring Road (ORR): For fast, intra-city distribution.',
                'National Highway 44 (NH-44): The main highway connecting Hyderabad to North India.',
                'The upcoming Regional Ring Road (RRR): Designed specifically to be a freight and logistics corridor.',
              ],
            },
            {
              type: 'disc',
              para: "Because of this unparalleled connectivity, the Medchal-Dundigal-Kompally belt has exploded into Hyderabad's primary logistics and warehousing triangle. Reports from real estate consultancies like JLL and Knight Frank consistently highlight this zone as the leader in warehousing absorption. What does this mean for an investor?",
              list: [
                'Massive Job Creation: Logistics parks are not just empty sheds. They are sophisticated operations run by companies like Amazon, Flipkart, DHL, and countless 3PL (Third-Party Logistics) providers. These hubs create thousands of jobs, from warehouse managers and supply chain analysts to technicians and operations staff.',
                'Commercial Land Value: The demand for large-scale warehousing has driven up commercial land values, which has a positive "ripple effect" on adjacent residential plot values.',
                "A Self-Sustaining Economy: This logistics boom creates a massive B2B and B2C ecosystem. This isn't a future promise; it's a visible reality. A drive along the Medchal highway reveals massive warehouses and logistics parks already in full operation [5].",
              ],
            },
          ],
        },
        {
          label: 'Part 3: The "New Frontier" - IT and Education',
          listParas: [
            {
              type: 'numeric',
              para: 'While Dundigal is not Gachibowli, it is rapidly becoming a vital satellite hub for the IT sector, thanks to two major trends:',
              list: [
                'Decentralized Development: The Telangana government is actively promoting a "Look East" and "Look North" policy to de-congest the western IT corridor. The most prominent example of this in the north is the Gateway IT Park at Kandlakoya, just a 15-20 minute drive from Dundigal. This park is designed to host IT and ITeS companies, bringing thousands of tech jobs to the region\'s doorstep.',
                'The "Work-from-Near-Home" Model: The IT workforce, now highly mobile, is moving away from the congested core. They are seeking locations like Dundigal where they can get a larger home and a better quality of life, connected to their Gachibowli office via the ORR for the 2-3 days a week they need to commute.',
              ],
            },
          ],
          belowParas: [
            "Furthermore, Dundigal is a major educational hub. It is home to some of the city's largest and most respected engineering colleges, including the Institute of Aeronautical Engineering (IARE) and the MLR Institute of Technology (MLRIT). These institutions collectively have tens of thousands of students and faculty, creating an incredibly strong and consistent rental market for apartments and villas, independent of the IT cycle.",
          ],
        },
        {
          label: 'Conclusion: The Power of a Diversified Portfolio',
          listParas: [
            {
              type: 'disc',
              para: 'The real estate story of the old West (Gachibowli/Kokapet) is a story of a single engine: IT. The real estate story of Dundigal is that of a modern, resilient, multi-engine economy. When you invest in Dundigal, you are buying into a region supported by:',
              list: [
                'The stability of Government & Defence (AFA).',
                'The high-growth, high-tech industry of Aerospace.',
                'The explosive, job-creating engine of Logistics & Warehousing.',
                'The emerging wave of decentralized IT (Kandlakoya).',
                'The consistent rental demand from a massive Educational base (IARE, MLRIT).',
              ],
            },
          ],
          belowParas: [
            "This economic diversity is what makes Dundigal a uniquely secure and high-growth investment. It is not reliant on a single sector's fortunes but is instead built on the fundamental, interconnected pillars of the modern Hyderabad economy.",
          ],
        },
      ],
      references: [
        '[4] Property Adviser. (Mar 2021). "Hyderabad Has Emerged as a Hub of Aerospace Technology." [5] MagicBricks. (Oct 2025). "Warehouse/Godown For Rent in Medchal, Hyderabad." [14] Justdial. (n.d.). "Multinational Companies in Kandlakoya, Rangareddy."',
      ],
    },
  },
  {
    id: 3,
    slug: 'roi-analysis-dundigal-vs-hyderabad',
    name: "The ROI Deep Dive: A Data-Driven Analysis of Dundigal vs. Hyderabad's Saturated Corridors",
    date: '06 October, 2025',
    timeReq: '5 min Read',
    coverImage: 'https://www.karthikeya.net/_next/static/media/blog-3.22dfca0f.png',
    article: {
      introduction: [
        'In real estate investment, the ultimate goal is a strong Return on Investment (ROI). This return is a simple equation: high capital appreciation + stable rental income, all relative to a low acquisition cost.',
        'For the past decade, investors flocked to Hyderabad\'s western hubs like Gachibowli, Kokapet, and the Financial District. They paid a premium, and they saw good returns. But today, that market is mature. The entry barrier is astronomically high, and the percentage-wise growth has naturally slowed. The "10x" growth story in Kokapet is a story of the past. For the investor seeking the next 10x opportunity, the data points decisively to North-West Hyderabad, specifically the Dundigal-Bowrampet corridor. This region offers what the saturated west no longer can: a low entry point, a proven track record of high appreciation, and a future powered by massive infrastructure growth. This is a data-driven breakdown of why Dundigal is Hyderabad\'s new ROI champion.',
      ],
      parts: [
        {
          label: 'Part 1: The Affordability Advantage (The "Low Entry")',
          aboveParas: [
            "The first rule of high-growth investing is to buy before the market peaks. Dundigal's primary advantage is its affordability relative to the established hubs.",
          ],
          listParas: [
            {
              type: 'disc',
              para: "Let's compare the cost of a 200-square-yard plot, the standard for investment:",
              list: [
                'In Kokapet / Neopolis: A 200 sq. yd. plot in a new layout would cost upwards of ₹1.5 - ₹2.0 Lakhs per square yard. Total Investment: ₹3.0 Cr - ₹4.0 Cr.',
                'In Dundigal: A 200 sq. yd. plot in a premium, HMDA-approved, gated community layout costs between ₹30,000 - ₹40,000 per square yard [1, 12]. Total Investment: ₹60 L - ₹80 L.',
              ],
            },
          ],
          belowParas: [
            'The difference is staggering. For the price of one plot in Kokapet, an investor can acquire a portfolio of 4 to 5 plots in Dundigal. This diversification mitigates risk and multiplies the potential for upside. Even in the villa market, the story is the same. A 4BHK villa in Kokapet can easily breach ₹8 Cr - ₹10 Cr [15]. In Dundigal, brand new 3BHK and 4BHK villas from top developers are available in the ₹1.1 Cr - ₹2.5 Cr range [12]. This low acquisition cost is the foundation of a high-ROI strategy.',
          ],
        },
        {
          label: 'Part 2: The Proven Track Record (The "High Appreciation")',
          listParas: [
            {
              type: 'disc',
              para: 'A low entry price is only good if the value actually goes up. Dundigal is not a speculative "future" market; it has a proven 5-year track record of robust appreciation, backed by Hyderabad\'s overall market strength.',
              list: [
                "City-Wide Growth: According to research from ANAROCK, Hyderabad as a whole has seen some of the highest property price increases among India's top cities, with a consistent 10% average annual increase over the last five years [6].",
                'District-Level Dominance: A January 2025 report from Knight Frank, as cited by the New Indian Express, revealed that the Medchal-Malkajgiri district (where Dundigal is located) witnessed the highest price appreciation in all of Hyderabad, clocking an impressive 11% year-on-year price rise [8].',
              ],
            },
          ],
          belowParas: [
            "This isn't a projection; this is a historical fact. Dundigal is in the fastest-appreciating district in the entire city. While prices in mature areas grew by 5-7%, this region led the pack. Investors who bought a plot for ₹15,000/sq.yd in 2019 are seeing it valued at over ₹30,000/sq.yd today—a 100% return in 5 years.",
          ],
        },
        {
          label: 'Part 3: The Rental Yield Equation (The "Stable Income")',
          listParas: [
            {
              type: 'disc',
              para: "A common criticism of emerging markets is low rental yield. However, Dundigal's unique economic drivers create a surprisingly stable rental market:",
              list: [
                'The Educational Hub: The presence of massive engineering colleges (IARE, MLRIT) creates a captive audience of tens of thousands of students and faculty, all needing rental accommodation.',
                'The Industrial/Logistics Workforce: The growing logistics parks in Medchal and the industrial belt create strong rental demand from managers, analysts, and skilled workers.',
                'The IT "Spillover": Professionals working in Gachibowli are increasingly renting villas in the Dundigal/Bowrampet area, trading a small commute on the ORR for a much larger house at a lower rent.',
              ],
            },
          ],
          belowParas: [
            'A 2025 report on rental yields in Hyderabad places Bachupally (Dundigal\'s direct neighbor) at a healthy 3-4% rental yield [13]. While this may be a percentage point lower than Kokapet\'s 4-6%, the acquisition cost is 3-4 times lower. A 3.5% yield on a ₹1.5 Cr villa is a far more attractive and achievable proposition than a 5% yield on an ₹8 Cr villa.',
          ],
        },
        {
          label: 'Part 4: The X-Factor (The "Future Growth")',
          aboveParas: [
            'The final component of ROI is future potential. The 11% YoY growth seen so far was driven almost entirely by the ORR. The next wave of growth will be driven by the Regional Ring Road (RRR).',
          ],
          listParas: [
            {
              type: 'disc',
              para: 'As the RRR becomes operational, Dundigal will transform from a "commuter suburb" to a "critical economic node."',
              list: [
                'The Parallel: Investors in Kokapet saw their land values multiply when the ORR became operational and the Financial District was built.',
                'The Opportunity: Investors in Dundigal are in the same position today. They are buying before the RRR is operational and before the new logistics and IT parks (like Kandlakoya) are fully occupied.',
              ],
            },
          ],
        },
        {
          label: 'Conclusion: The Smart Money is Moving North-West',
          listParas: [
            {
              type: 'disc',
              para: 'When you run the numbers, the investment thesis for Dundigal is undeniable:',
              list: [
                'Low Acquisition Cost: 4-5 times cheaper than saturated western hubs.',
                'Highest Capital Appreciation: Already performing, with a proven 11% YoY growth, the highest in Hyderabad.',
                'Stable Rental Yield: A solid 3-4% return, supported by a diverse economy of education, logistics, and IT.',
                'Massive Future Upside: The RRR provides a clear, government-backed catalyst for the next wave of 10x growth.',
              ],
            },
          ],
          belowParas: [
            "The saturated markets of Kokapet and Gachibowli are a safe place to park money. Dundigal is the strategic location to grow it. The data shows the smart money is no longer just looking west; it's looking North-West.",
          ],
        },
      ],
      references: [
        '[1] MagicBricks. (Oct 2025). "Plots for Sale in Dundigal, Hyderabad." [6] The Hans India. (Feb 2023). "Hyderabad property prices up 10% yearly in last 5 years." [8] New Indian Express. (Feb 2025). "Hyderabad records 24 per cent YoY surge in value of homes in January 2025." [12] Housing.com. (Oct 2025). "New Residential Projects in Dundigal, Hyderabad." [13] Address Advisors. (Oct 2025). "Rental Yield in Hyderabad 2025."',
      ],
    },
  },
  {
    id: 4,
    slug: 'work-life-paradigm-families-professionals-choosing-dundigal-serenity',
    name: 'The New "Work-Life" Paradigm: Why Families and Professionals are Choosing Dundigal\'s Serenity Over City Congestion',
    date: '08 October, 2025',
    timeReq: '5 min Read',
    coverImage: 'https://www.karthikeya.net/_next/static/media/blog-4.b7310e14.png',
    article: {
      introduction: [
        'For the past decade, the Hyderabad dream was a 2BHK apartment in a high-rise, as close as possible to the IT corridor. The dream was about minimizing the commute. But this came at a cost: traffic, pollution, noise, and a life lived in "concrete boxes" with no room to breathe. The post-pandemic world has fundamentally changed this dream. The new "Hyderabad Dream" is no longer just about the commute; it\'s about quality of life. It\'s about space, clean air, a private garden, and a safe community for children to grow. And as professionals and families begin this search for a "no-compromise" lifestyle, one region is emerging as the clear answer: Dundigal.',
        'Dundigal\'s investment potential isn\'t just built on infrastructure and economics; it\'s built on a superior "lifestyle product" that is in high demand. It offers the perfect, and perhaps only, blend of urban connectivity and serene, spacious living.',
      ],
      parts: [
        {
          label: 'Part 1: Escaping the Concrete Jungle',
          aboveParas: [
            'The core appeal of Dundigal is its environment. The region is characterized by its rolling green landscapes, open spaces, and a naturally lower-density development profile. A significant reason for this is the "green buffer" created by the massive, 7,000-acre campus of the Dundigal Air Force Academy (AFA).',
          ],
          listParas: [
            {
              type: 'disc',
              para: 'This results in:',
              list: [
                "Cleaner Air: Being on the city's outskirts, with less traffic and more green cover, the air quality is measurably better.",
                'Less Noise Pollution: The region is free from the 24/7 din of city traffic, offering a tranquility that is impossible to find in Gachibowli or Kukatpally.',
                'A Room to Breathe: The skyline is open, the roads are wide, and the sense of space is immediate.',
              ],
            },
          ],
          belowParas: [
            'This is a powerful "pull factor" for families looking to escape the urban burnout and for professionals (especially in the hybrid work model) who no longer need to live five minutes from their office.',
          ],
        },
        {
          label: 'Part 2: The Rise of the Villa & Gated Community',
          listParas: [
            {
              type: 'disc',
              para: "Dundigal's real estate market is perfectly aligned with the new post-COVID demand for more space. The market here is dominated by:",
              list: [
                'Luxury Villas: Sprawling gated communities with 3, 4, and 5-BHK villas offer private gardens, home-office space, and premium amenities (clubhouses, pools, sports facilities) that families crave.',
                'Premium Plotted Layouts: Large, HMDA-approved plotted layouts give buyers the freedom to design their own dream homes in a secure, well-planned community.',
              ],
            },
          ],
          belowParas: [
            'This "product-market fit" is a key investment driver. The demand for spacious villas and plots is at an all-time high, and Dundigal is one of the few well-connected areas that can deliver this product at an accessible price point.',
          ],
        },
        {
          label: 'Part 3: The Myth of Isolation (The Social Infrastructure)',
          listParas: [
            {
              type: 'disc',
              para: "Anchored between the established Kompally and Bachupally corridors, Dundigal is not isolated; it is simply peaceful:",
              list: [
                'A Hub of Top-Tier Schools: The region is a 15-20 minute drive from some of the best educational institutions in Hyderabad.',
                "International Schools: DRS International, St. Peter's International, Delhi International (all in nearby Kompally) [9].",
                'CBSE/ICSE Schools: Oakridge International (Bachupally), Silver Oaks International (Bachupally), and many more are within an easy commute.',
                "Accessible Healthcare: Major multi-specialty hospitals like SLG Hospitals, Usha Mullapudi Cardiac Centre, and People's Hospital are all within a 20-25 minute drive.",
                'Retail & Entertainment: The entire commercial and retail hub of Kompally is just 15 minutes away, including multiplexes, malls, restaurants, and cafes.',
              ],
            },
          ],
        },
      ],
      conclusion: {
        label: 'Conclusion: Investing in a Better "Why"',
        paras: [
          'The "what" of the Dundigal investment is the land or the villa. The "where" is the high-growth North-West corridor. But the "why" is the lifestyle.',
          'Dundigal is at the forefront of this new paradigm. It offers the "no-compromise" solution: a spacious, serene, and green lifestyle for your family, backed by top-tier social infrastructure, and all connected to the city\'s economic heart by the ORR. For an end-user, it\'s an investment in your family\'s well-being. For a pure investor, it\'s a smart bet on the most in-demand real estate "product" in the market today: quality of life.',
        ],
      },
      references: [
        '[1] Housing.com. (Oct 2025). "Property Price & Trends in Dundigal, Hyderabad." [2] Aparna Constructions. (n.d.). "The Perfect Place for Open Plots Investment in Dundigal." [9] Sulekha.com. (Aug 2025). "Top International Schools in Dundigal, Hyderabad." [12] Housing.com. (Oct 2025). "New Residential Projects in Dundigal, Hyderabad."',
      ],
    },
  },
  {
    id: 5,
    slug: 'dundigal-hmda-2041-master-plan',
    name: "Future-Proofing Your Portfolio: Dundigal's Strategic Role in the HMDA 2041 Master Plan",
    date: '10 October, 2025',
    timeReq: '5 min Read',
    coverImage: 'https://www.karthikeya.net/_next/static/media/blog-5.9b83aa26.png',
    article: {
      introduction: [
        'A smart real estate investment isn\'t just a bet on current trends; it\'s an alignment with a long-term, official vision. The biggest investment wins don\'t come from chasing hype—they come from understanding a city\'s master plan and buying into a future that is already being built. In Hyderabad, that blueprint is the HMDA Master Plan, a comprehensive document that outlines the city\'s zoning, infrastructure, and growth trajectory until 2041. A close look at this master plan reveals that Dundigal\'s rise is not an accident. It is a deliberate and strategic component of the government\'s plan to de-congest Hyderabad and create new, self-sustaining economic hubs. For an investor, this means your investment is "future-proofed"—it is backed by government policy, aligned with planned infrastructure, and designed for sustainable, long-term growth.',
      ],
      parts: [
        {
          label: 'Part 1: What is the HMDA Master Plan?',
          listParas: [
            {
              type: 'disc',
              para: 'The Hyderabad Metropolitan Development Authority (HMDA) Master Plan is the statutory document that governs the development of the entire 7,257 sq. km. metropolitan region. It dictates:',
              list: [
                'Zoning: What land can be used for (Residential, Commercial, Industrial, Peri-Urban, Green Belt, etc.).',
                'Infrastructure: The alignment of major roads (like the ORR and RRR), metro lines, and logistics hubs.',
                'Growth Corridors: It identifies new areas for focused development to ensure the city grows in a planned manner, not a chaotic sprawl.',
              ],
            },
          ],
          belowParas: [
            'Investing in an area that is not aligned with the master plan is a gamble. Investing in a "growth corridor" designated by the plan is the safest bet you can make.',
          ],
        },
        {
          label: 'Part 2: Dundigal\'s Role: A "New Urban Node"',
          aboveParas: [
            'The core policy of the new HMDA Master Plan is decentralized development. The planners recognize that the western corridor (Gachibowli/Kukatpally) is overburdened. The only sustainable solution is to create new, self-sufficient "satellite townships" or "urban nodes" that have their own economic engines and social infrastructure.',
            'This is where the Regional Ring Road (RRR) comes in. The RRR is the primary tool for creating these new nodes. The HMDA plan explicitly states that the RRR corridor will be flanked by industrial clusters, logistics parks, IT centers, and satellite townships [3].',
          ],
          listParas: [
            {
              type: 'disc',
              para: 'Dundigal is not just near this new corridor; it is part of it. The Master Plan has zoned the Dundigal-Medchal belt for a mix of residential, institutional, and high-tech industrial use. This means:',
              list: [
                'Growth is Guaranteed: The government is actively pushing industries (logistics, aerospace, light manufacturing) to this region.',
                'Growth is Organized: The plan provides for wide 100-ft and 80-ft internal roads, green buffer zones, and designated commercial areas. This prevents the haphazard development that plagues older parts of the city and ensures a higher quality of life.',
                'Value is Protected: Your residential investment is protected from having a heavy industrial plant or a chaotic market pop up next to it, as all development must follow this zoning map.',
              ],
            },
          ],
        },
        {
          label: 'Part 3: The "Look North" Policy in Action',
          listParas: [
            {
              type: 'disc',
              para: "Beyond the RRR, the government's commitment to Dundigal's future is visible in its active promotion of non-IT and decentralized IT hubs in the area:",
              list: [
                'Gateway IT Park (Kandlakoya): Located just 15-20 minutes from Dundigal, this IT park is a flagship project of the "Look North" policy. It is designed to attract IT and ITeS companies, creating a tech-job ecosystem right at Dundigal\'s doorstep.',
                'Aerospace & Defence Hub: The state government has consistently promoted Hyderabad as India\'s "Aerospace Capital." The ecosystem anchored by the Dundigal Air Force Academy is a key part of this industrial policy, ensuring long-term state support and investment in the region\'s high-tech manufacturing base [4].',
              ],
            },
          ],
          belowParas: [
            'This policy-driven development is what "future-proofs" your investment. You are not just buying into a residential layout; you are buying into a comprehensive, government-backed economic plan that is already in motion.',
          ],
        },
        {
          label: 'Conclusion: Invest with Confidence, Invest with the Plan',
          aboveParas: [
            'A real estate "bubble" happens when prices are driven purely by speculation and hype, with no underlying economic or infrastructure fundamentals. Dundigal is the opposite of a bubble.',
          ],
          listParas: [
            {
              type: 'numeric',
              para: 'Its growth is fundamentally sound, built on two unshakable pillars:',
              list: [
                'Massive, Funded Infrastructure: The operational ORR and the under-construction RRR.',
                'A Deliberate Master Plan: The HMDA\'s official designation of the region as a new "Urban Node" for decentralized development (logistics, IT, aerospace).',
              ],
            },
          ],
          belowParas: [
            'When you invest in an HMDA-approved layout in Dundigal, you are doing more than just buying a piece of land. You are becoming a stakeholder in the official, long-term, and sustainable future of Hyderabad. The master plan provides a clear roadmap for appreciation, and all signs on that map point directly to Dundigal.',
          ],
        },
      ],
      references: [
        '[3] Housing.com. (Oct 2025). "Regional ring road (RRR) Hyderabad map, route and real estate impact." [4] Property Adviser. (Mar 2021). "Hyderabad Has Emerged as a Hub of Aerospace Technology." [11] HMDA. (n.d.). "Master Plan." [14] Justdial. (n.d.). "Multinational Companies in Kandlakoya, Rangareddy."',
      ],
    },
  },
  {
    id: 6,
    slug: 'dundigal-investor-playbook-plots-vs-villas-afa-noc',
    name: "The Investor's Playbook for Dundigal: Plots vs. Villas and the Critical Due Diligence (The AFA NOC Explained)",
    date: '12 October, 2025',
    timeReq: '5 min Read',
    coverImage: 'https://www.karthikeya.net/_next/static/media/blog-6.0b000f8c.png',
    article: {
      introduction: [
        "You've seen the data. You understand the infrastructure, the economic drivers, and the long-term master plan. You are convinced that Dundigal is Hyderabad's next great real estate frontier.",
        'Now comes the most important part: the how. How do you execute this investment safely and profitably?',
        'The Dundigal market is booming, but this very boom creates noise and attracts all kinds of players. A smart investor is a diligent investor. This is your practical playbook for investing in Dundigal, covering the two main investment choices (Plots vs. Villas) and the single most critical piece of due diligence unique to this area: the Air Force Academy (AFA) No Objection Certificate (NOC).',
      ],
      parts: [
        {
          label: 'Part 1: The Great Debate - Plots vs. Villas',
          aboveParas: [
            'Your first decision is what to buy. Your choice depends on your budget, timeline, and investment goals.',
          ],
          listParas: [
            {
              type: 'disc',
              para: 'Choice A: The Investment Plot (The "High-Growth" Play)',
              list: [
                'What it is: A piece of land, typically 150-300 square yards, in an HMDA-approved and RERA-registered gated layout [1, 12].',
                'Highest Capital Appreciation: Land is the asset that appreciates the most. As infrastructure (like the RRR) develops, the value of the land itself multiplies.',
                'Lower Entry Cost: A plot is 4-5 times cheaper than a villa, allowing you to enter the market for ₹60-80 Lakhs.',
                'Flexibility: You can hold it for 5-10 years and sell, or build your own custom home later.',
                'Lower Maintenance: No significant carrying costs beyond basic property taxes.',
              ],
            },
            {
              type: 'disc',
              para: 'Choice B: The Gated Villa (The "Lifestyle & Income" Play)',
              list: [
                'Immediate Lifestyle & Rental Utility: Move into a completed resort-style community or lease to families and professionals commuting via ORR Exit 5.',
                'Long-Term Horizon: Combines land appreciation with built-space utility.',
              ],
            },
          ],
        },
        {
          label: 'Part 2: The Critical Hurdle - The Air Force Academy (AFA) NOC',
          listParas: [
            {
              type: 'disc',
              para: 'This is the most important section of this playbook. You must understand this before you sign any cheque in Dundigal:',
              list: [
                'What is it? Dundigal is home to the Indian Air Force Academy (AFA), a sensitive and active defence installation. To ensure the safety of flight operations, the Government of India, under the Indian Aircraft Act, legally restricts construction within a certain radius of all aerodromes [10].',
                'What are the Rules? Any construction within a 20-kilometer radius of an IAF aerodrome requires a "No Objection Certificate" (NOC) from the Ministry of Defence / local AFA authorities [10]. This NOC primarily governs the maximum permissible height of the building.',
                'What is the Risk? If a developer builds a high-rise where the AFA NOC only permits low-rise villas, that project is non-compliant.',
                'What is the Investor\'s "Shield"? When evaluating any project in Dundigal—whether it\'s an apartment, a villa, or a plotted layout—always verify the HMDA, RERA, and AFA NOC approvals.',
              ],
            },
          ],
          belowParas: [
            'This single piece of paper is your proof that the project is compliant and that your investment is safe from this specific regional risk.',
          ],
        },
        {
          label: 'Part 3: Your 5-Point Due Diligence Checklist',
          listParas: [
            {
              type: 'numeric',
              para: 'Do not invest in Dundigal (or anywhere) without this 5-point check:',
              list: [
                'HMDA / RERA Approval: Is the layout 100% approved by HMDA and registered with Telangana RERA? Verify the RERA number on the official portal.',
                'AFA NOC: Verify the project has valid height clearance/NOC compliance.',
                'Clear Title & Link Documents: Perform a title search verifying an unbroken chain of ownership documents.',
                'Master Plan Alignment: Check the HMDA Master Plan to ensure the land is in a Residential (R1, R2) zone.',
                'Developer Reputation: Choose a developer with a proven track record of delivered communities in Hyderabad.',
              ],
            },
          ],
        },
      ],
      conclusion: {
        label: 'Conclusion: The Confident Investor',
        paras: [
          'Dundigal is a land of incredible opportunity, but it is not a "get rich quick" scheme. It is a strategic investment that rewards patience and diligence.',
          'By choosing the right asset for your goals (plot or villa) and, most importantly, by meticulously completing your due diligence (HMDA, RERA, and the AFA NOC), you mitigate your risk entirely. You transform from a speculator into a confident investor, ready to capitalize on what is verifiably one of the best real estate opportunities in India today.',
        ],
      },
      references: [
        '[1] MagicBricks. (Oct 2025). "Plots for Sale in Dundigal, Hyderabad." [10] "NOC Procedure for Civil Aerodromes" (IAF Policy Document ASI PART III/ATS/02/2006). [12] Housing.com. (Oct 2025). "New Residential Projects in Dundigal, Hyderabad." [13] Address Advisors. (Oct 2025). "Rental Yield in Hyderabad 2025."',
      ],
    },
  },
];

const blogsDirectoryView = document.getElementById('blogs-directory-view');
const blogArticleView = document.getElementById('blog-article-view');

if (blogsDirectoryView && blogArticleView) {
  const blogCards = Array.from(blogsDirectoryView.querySelectorAll('.blog-card'));
  const topPaginationEl = document.getElementById('blogs-page-tabs');
  const bottomPaginationEl = document.getElementById('blogs-bottom-pagination');
  const BLOG_PAGINATION_THRESHOLD = 10;
  const BLOGS_PER_PAGE = 9;

  // Keep all blogs in a single view until the blog count reaches 10+ articles
  if (blogCards.length < BLOG_PAGINATION_THRESHOLD) {
    blogCards.forEach((card) => card.classList.remove('is-hidden-page'));
    if (topPaginationEl) {
      topPaginationEl.classList.add('is-hidden');
      topPaginationEl.hidden = true;
    }
    if (bottomPaginationEl) {
      bottomPaginationEl.classList.add('is-hidden');
      bottomPaginationEl.hidden = true;
    }
  } else {
    const totalPages = Math.ceil(blogCards.length / BLOGS_PER_PAGE);
    let currentBlogPage = 1;

    const buildPaginationButtons = (includeViewAll) => {
      const btns = [
        `<button type="button" class="floorplan-size-btn" data-blog-page="prev" disabled>Prev</button>`,
      ];
      for (let p = 1; p <= totalPages; p += 1) {
        btns.push(
          `<button type="button" class="floorplan-size-btn${p === 1 ? ' is-active' : ''}" data-blog-page="${p}">${p}</button>`
        );
      }
      btns.push(`<button type="button" class="floorplan-size-btn" data-blog-page="next">Next</button>`);
      if (includeViewAll) {
        btns.push(
          `<button type="button" class="floorplan-size-btn" data-blog-page="all">View All (${blogCards.length})</button>`
        );
      }
      return btns.join('');
    };

    if (topPaginationEl) {
      topPaginationEl.innerHTML = buildPaginationButtons(true);
      topPaginationEl.classList.remove('is-hidden');
      topPaginationEl.hidden = false;
    }
    if (bottomPaginationEl) {
      bottomPaginationEl.innerHTML = buildPaginationButtons(false);
      bottomPaginationEl.classList.remove('is-hidden');
      bottomPaginationEl.hidden = false;
    }

    const pageBtns = Array.from(blogsDirectoryView.querySelectorAll('[data-blog-page]'));

    const setBlogPage = (targetPage) => {
      if (targetPage === 'prev') {
        currentBlogPage = Math.max(1, (Number(currentBlogPage) || 1) - 1);
      } else if (targetPage === 'next') {
        currentBlogPage = Math.min(totalPages, (Number(currentBlogPage) || 1) + 1);
      } else if (targetPage === 'all') {
        currentBlogPage = 'all';
      } else {
        currentBlogPage = Number(targetPage) || 1;
      }

      blogCards.forEach((card, idx) => {
        if (currentBlogPage === 'all') {
          card.classList.remove('is-hidden-page');
        } else {
          const start = (currentBlogPage - 1) * BLOGS_PER_PAGE;
          const visible = idx >= start && idx < start + BLOGS_PER_PAGE;
          card.classList.toggle('is-hidden-page', !visible);
        }
      });

      pageBtns.forEach((btn) => {
        const val = btn.getAttribute('data-blog-page');
        if (val === 'prev') {
          btn.disabled = currentBlogPage === 1 || currentBlogPage === 'all';
        } else if (val === 'next') {
          btn.disabled = currentBlogPage === totalPages || currentBlogPage === 'all';
        } else if (val === 'all') {
          btn.classList.toggle('is-active', currentBlogPage === 'all');
        } else {
          const num = Number(val);
          btn.classList.toggle('is-active', currentBlogPage === num);
        }
      });
    };

    pageBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        setBlogPage(btn.getAttribute('data-blog-page'));
      });
    });

    setBlogPage(1);
  }

  const renderBlogArticle = (slug, pushHistory = true) => {
    const blog = SKD_BLOGS_DATA.find((b) => b.slug === slug);
    if (!blog) {
      blogsDirectoryView.classList.remove('is-hidden');
      blogArticleView.classList.add('is-hidden');
      return;
    }

    document.getElementById('blog-article-kicker-text').textContent = blog.name;
    document.getElementById('blog-article-title').textContent = blog.name;
    document.getElementById('blog-breadcrumb-current').textContent = blog.name.slice(0, 42) + '...';
    document.getElementById('blog-article-date').textContent = blog.date;
    document.getElementById('blog-article-time').textContent = blog.timeReq;

    const coverEl = document.getElementById('blog-article-cover');
    if (coverEl) {
      coverEl.src = blog.coverImage;
      coverEl.alt = blog.name;
    }

    const proseEl = document.getElementById('blog-article-prose');
    if (proseEl) {
      const htmlParts = [];
      blog.article.introduction?.forEach((p) => {
        htmlParts.push(`<p>${p}</p>`);
      });

      blog.article.parts?.forEach((part) => {
        htmlParts.push(`<h2>${part.label}</h2>`);
        part.aboveParas?.forEach((p) => htmlParts.push(`<p>${p}</p>`));
        part.listParas?.forEach((lp) => {
          if (lp.para) htmlParts.push(`<p>${lp.para}</p>`);
          if (lp.list?.length) {
            const tag = lp.type === 'numeric' ? 'ol' : 'ul';
            const items = lp.list.filter(Boolean).map((li) => `<li>${li}</li>`).join('');
            htmlParts.push(`<${tag}>${items}</${tag}>`);
          }
        });
        part.belowParas?.forEach((p) => htmlParts.push(`<p>${p}</p>`));
      });

      if (blog.article.conclusion) {
        htmlParts.push(`<h2>${blog.article.conclusion.label}</h2>`);
        blog.article.conclusion.paras?.forEach((p) => htmlParts.push(`<p>${p}</p>`));
      }

      if (blog.article.references?.length) {
        htmlParts.push(
          `<div class="blog-references-box"><strong>References:</strong><br>${blog.article.references.join('<br>')}</div>`
        );
      }

      proseEl.innerHTML = htmlParts.join('');
    }

    // Populate "Latest Posts" sidebar with the 2 most recent other posts
    const sidebarPostsEl = document.getElementById('blog-sidebar-posts');
    if (sidebarPostsEl) {
      const others = [...SKD_BLOGS_DATA].reverse().filter((b) => b.slug !== slug).slice(0, 2);
      sidebarPostsEl.innerHTML = others
        .map(
          (item) => `
          <a href="?slug=${item.slug}" class="blog-sidebar-item" data-open-blog="${item.slug}">
            <img src="${item.coverImage}" alt="${item.name}" loading="lazy">
            <h3 class="blog-sidebar-item__title">${item.name}</h3>
            <div class="blog-sidebar-item__meta">
              <span>${item.date}</span>
              <span>${item.timeReq}</span>
            </div>
          </a>
        `
        )
        .join('');
    }

    blogsDirectoryView.classList.add('is-hidden');
    blogArticleView.classList.remove('is-hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pushHistory) {
      const nextUrl = `${window.location.pathname}?slug=${encodeURIComponent(slug)}`;
      window.history.pushState({ blogSlug: slug }, '', nextUrl);
    }
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-blog]');
    if (!trigger) return;
    event.preventDefault();
    const slug = trigger.getAttribute('data-open-blog');
    if (slug) renderBlogArticle(slug, true);
  });

  const backBtn = document.getElementById('blog-back-to-list');
  const breadcrumbRoot = document.getElementById('blog-breadcrumb-root');
  const closeReader = (event) => {
    if (event) event.preventDefault();
    blogArticleView.classList.add('is-hidden');
    blogsDirectoryView.classList.remove('is-hidden');
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (backBtn) backBtn.addEventListener('click', closeReader);
  if (breadcrumbRoot) breadcrumbRoot.addEventListener('click', closeReader);

  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const slugFromQuery = params.get('slug');
    if (slugFromQuery) {
      renderBlogArticle(slugFromQuery, false);
    } else {
      blogArticleView.classList.add('is-hidden');
      blogsDirectoryView.classList.remove('is-hidden');
    }
  });

  // Check initial URL for ?slug=<slug> or /blogs/<slug>
  const initialParams = new URLSearchParams(window.location.search);
  const initialSlug =
    initialParams.get('slug') ||
    SKD_BLOGS_DATA.find((b) => window.location.pathname.endsWith(b.slug))?.slug;
  if (initialSlug) {
    renderBlogArticle(initialSlug, false);
  }
}
