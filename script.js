// Patna AC Services — Landing Page Script
// Handles: sticky nav, mobile menu, smooth scroll,
// active nav highlighting, scroll reveals, stat counters,
// contact form validation, and keyboard accessibility.

document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  // --- Sticky navbar (transparent → frosted glass on scroll) ---
  let ticking = false;

  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  updateNavbar(); // run once on load


  // --- Mobile hamburger menu ---
  function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when a nav link is clicked
  navMenu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when tapping the overlay area
  navMenu.addEventListener('click', e => {
    if (e.target === navMenu) closeMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
  });


  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 20;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });


  // --- Active nav link highlighting on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + navbar.offsetHeight + 100;
    sections.forEach(section => {
      const isActive = scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight;
      const link = navMenu.querySelector(`a[href="#${section.id}"]`);
      if (link) link.classList.toggle('active', isActive);
    });
  }, { passive: true });


  // --- Scroll reveal animations (staggered per container) ---
  const revealSelector = [
    '.service-card', '.feature-block', '.step', '.testimonial-card',
    '.section-header', '.hero__content', '.hero__visual',
    '.stats-card', '.contact__form-wrap', '.contact__info'
  ].join(', ');

  const revealItems = document.querySelectorAll(revealSelector);
  revealItems.forEach(el => el.classList.add('reveal'));

  const triggeredParents = new WeakSet();

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const parent = entry.target.parentElement;

      if (!triggeredParents.has(parent)) {
        triggeredParents.add(parent);
        parent.querySelectorAll('.reveal:not(.revealed)').forEach((el, i) => {
          setTimeout(() => el.classList.add('revealed'), i * 120);
          revealObserver.unobserve(el);
        });
      } else {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  revealItems.forEach(el => revealObserver.observe(el));


  // --- Animated stat counters ---
  const statNumbers = document.querySelectorAll('.stats-card__number[data-count]');
  let statsDone = false;

  function countUp(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const statsCard = document.querySelector('.stats-card');
  if (statsCard) {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting && !statsDone) {
        statsDone = true;
        statNumbers.forEach(countUp);
        obs.disconnect();
      }
    }, { threshold: 0.3 }).observe(statsCard);
  }


  // --- Contact form validation ---
  function showError(inputId, errorId, msg) {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(errorId);
    input.classList.remove('error');
    void input.offsetWidth; // force reflow to restart shake animation
    input.classList.add('error');
    errEl.textContent = msg;
  }

  function clearError(inputId, errorId) {
    document.getElementById(inputId).classList.remove('error');
    document.getElementById(errorId).textContent = '';
  }

  ['name', 'phone', 'service'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => clearError(id, `${id}Error`));
      el.addEventListener('change', () => clearError(id, `${id}Error`));
    }
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('name').value.trim();
    if (!name || name.length < 2) {
      showError('name', 'nameError', name ? 'Name must be at least 2 characters' : 'Please enter your name');
      valid = false;
    } else clearError('name', 'nameError');

    const phone = document.getElementById('phone').value.trim();
    if (!phone) {
      showError('phone', 'phoneError', 'Please enter your phone number');
      valid = false;
    } else if (!/^[+]?[\d\s\-()]{7,15}$/.test(phone)) {
      showError('phone', 'phoneError', 'Please enter a valid phone number');
      valid = false;
    } else clearError('phone', 'phoneError');

    const service = document.getElementById('service').value;
    if (!service) {
      showError('service', 'serviceError', 'Please select a service');
      valid = false;
    } else clearError('service', 'serviceError');

    if (!valid) return;

    // Success
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
    contactForm.reset();

    const btn = document.getElementById('submitBtn');
    btn.textContent = '✓ Submitted!';
    btn.style.cssText = 'background:#10B981; border-color:#10B981;';
    setTimeout(() => {
      btn.innerHTML = 'Get a Free Quote <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      btn.style.cssText = '';
    }, 3000);
  });

});
