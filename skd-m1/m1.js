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
   1. STICKY HEADER SCROLL FALLBACK
   ========================================================================== */
const siteHeader = document.getElementById('site-header');
if (siteHeader) {
  const syncHeaderState = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 36);
  };
  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
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
   5. DRONE VIDEO BAND ("Experience Serenity from Above" — Lazy Play/Pause)
   ========================================================================== */
const droneVideo = document.getElementById('drone-video');
const dronePlayBtn = document.getElementById('drone-play-btn');

if (droneVideo && dronePlayBtn) {
  const toggleDronePlayback = () => {
    if (droneVideo.paused) {
      droneVideo.play();
      dronePlayBtn.setAttribute('aria-label', 'Pause aerial tour video');
      dronePlayBtn.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1"></rect>
          <rect x="14" y="5" width="4" height="14" rx="1"></rect>
        </svg>
      `;
    } else {
      droneVideo.pause();
      dronePlayBtn.setAttribute('aria-label', 'Play aerial tour video');
      dronePlayBtn.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.14v14l11-7-11-7z"></path>
        </svg>
      `;
    }
  };

  dronePlayBtn.addEventListener('click', toggleDronePlayback);
}

/* ==========================================================================
   6. OUR PROJECTS FEATURE CARDS -> SHOWCASE IMAGE SWITCHER
   ========================================================================== */
const projectShowcaseImg = document.getElementById('project-showcase-img');
const featureCards = Array.from(document.querySelectorAll('[data-feature-img]'));

if (projectShowcaseImg && featureCards.length > 0) {
  featureCards.forEach((card) => {
    const activateCard = () => {
      const newSrc = card.getAttribute('data-feature-img');
      const newAlt = card.getAttribute('data-feature-alt');
      if (newSrc && projectShowcaseImg.getAttribute('src') !== newSrc) {
        projectShowcaseImg.src = newSrc;
        if (newAlt) projectShowcaseImg.alt = newAlt;
      }
    };

    card.addEventListener('mouseenter', activateCard);
    card.addEventListener('click', activateCard);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateCard();
      }
    });
  });
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
   8. ACCESSIBLE NATIVE SCROLL-SNAP TESTIMONIAL CAROUSEL
      (Modern Web Guidance: carousel)
   ========================================================================== */
const carouselTrack = document.getElementById('testimonial-track');
const carouselMarkersNav = document.getElementById('testimonial-markers');
const carouselStatus = document.getElementById('testimonial-status');
const prevBtn = document.querySelector('[data-carousel-dir="prev"]');
const nextBtn = document.querySelector('[data-carousel-dir="next"]');

if (carouselTrack && carouselMarkersNav) {
  const slides = Array.from(carouselTrack.querySelectorAll('[role="group"][aria-roledescription="slide"]'));
  let activeIndex = 0;
  let settledIndex = 0;
  let pendingTargetIndex = null;
  let rafId = null;

  // Build marker buttons from data-marker-name
  const markerBtns = slides.map((slide, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'carousel-marker-btn';
    btn.setAttribute('aria-label', slide.getAttribute('data-marker-name') || `Go to testimonial ${idx + 1}`);
    btn.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
    btn.innerHTML = '<span class="carousel-marker-dot" aria-hidden="true"></span>';
    btn.addEventListener('click', () => scrollToSlide(idx));
    carouselMarkersNav.appendChild(btn);
    return btn;
  });

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

  const syncMarkers = (idx) => {
    if (idx === activeIndex && markerBtns[idx]?.getAttribute('aria-current') === 'true') return;
    activeIndex = idx;
    markerBtns.forEach((btn, i) => {
      btn.setAttribute('aria-current', i === idx ? 'true' : 'false');
    });
  };

  const syncSettledState = (announce = true) => {
    const idx = getNearestSlideIndex();
    pendingTargetIndex = null;
    syncMarkers(idx);
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx >= slides.length - 1;

    if (announce && idx !== settledIndex && carouselStatus) {
      carouselStatus.textContent = `Showing testimonial ${idx + 1} of ${slides.length}`;
    }
    settledIndex = idx;
  };

  const scrollToSlide = (targetIdx) => {
    const clampedIdx = Math.max(0, Math.min(slides.length - 1, targetIdx));
    pendingTargetIndex = clampedIdx;
    syncMarkers(clampedIdx);

    const targetSlide = slides[clampedIdx];
    if (targetSlide) {
      const offset = targetSlide.offsetLeft - carouselTrack.offsetLeft;
      carouselTrack.scrollTo({
        left: offset,
        behavior: prefersReducedMotion.matches ? 'instant' : 'smooth',
      });
    }
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const baseIdx = pendingTargetIndex !== null ? pendingTargetIndex : getNearestSlideIndex();
      scrollToSlide(baseIdx - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const baseIdx = pendingTargetIndex !== null ? pendingTargetIndex : getNearestSlideIndex();
      scrollToSlide(baseIdx + 1);
    });
  }

  carouselTrack.addEventListener(
    'scroll',
    () => {
      if (pendingTargetIndex !== null) return;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        syncMarkers(getNearestSlideIndex());
      });
    },
    { passive: true }
  );

  if ('onscrollend' in window) {
    carouselTrack.addEventListener('scrollend', () => syncSettledState(true));
  } else {
    let scrollTimeout = null;
    carouselTrack.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => syncSettledState(true), 150);
      },
      { passive: true }
    );
  }

  syncSettledState(false);
}

/* ==========================================================================
   9. FORMSPREE LEAD SUBMISSION (Site Visit & Brochure Forms)
   ========================================================================== */
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
