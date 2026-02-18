/**
 * ============================================
 * [Business Name] — Landing Page Script
 * AC, Cooler & Electronics Repair
 * ============================================
 * 
 * Features:
 * - Sticky navbar with scroll effect
 * - Mobile hamburger menu
 * - Smooth scroll navigation
 * - Section fade-in animations (Intersection Observer)
 * - Animated stat counters
 * - Contact form validation
 * - Toast notification
 * - Active nav link highlighting
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. NAVBAR — Scroll Effect (transparent → solid)
  // ============================================
  const navbar = document.getElementById('navbar');

  const handleNavScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run once on load

  // ============================================
  // 2. MOBILE HAMBURGER MENU
  // ============================================
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu when a link is clicked
  navMenu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close when clicking overlay area
  navMenu.addEventListener('click', (e) => {
    if (e.target === navMenu) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // ============================================
  // 3. SMOOTH SCROLL for anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // 4. ACTIVE NAV LINK HIGHLIGHTING on scroll
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  const highlightNav = () => {
    const scrollY = window.scrollY + navbar.offsetHeight + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ============================================
  // 5. SCROLL REVEAL ANIMATIONS
  // ============================================
  const revealElements = document.querySelectorAll(
    '.service-card, .feature-block, .step, .testimonial-card, ' +
    '.section-header, .hero__content, .hero__visual, ' +
    '.stats-card, .contact__form-wrap, .contact__info'
  );

  // Add the reveal class to all target elements
  revealElements.forEach(el => {
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the animation for sibling elements
        const parent = entry.target.parentElement;
        const siblings = parent.querySelectorAll('.reveal');
        let siblingIndex = 0;

        siblings.forEach((sib, i) => {
          if (sib === entry.target) siblingIndex = i;
        });

        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, siblingIndex * 100); // 100ms stagger

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // 6. ANIMATED STAT COUNTERS
  // ============================================
  const statNumbers = document.querySelectorAll('.stats-card__number[data-count]');
  let statsCounted = false;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(eased * target);

      el.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach(num => animateCount(num));
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsCard = document.querySelector('.stats-card');
  if (statsCard) statsObserver.observe(statsCard);

  // ============================================
  // 7. CONTACT FORM VALIDATION
  // ============================================
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  const showError = (inputId, errorId, message) => {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.add('error');
    error.textContent = message;
  };

  const clearError = (inputId, errorId) => {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.remove('error');
    error.textContent = '';
  };

  // Real-time validation — clear errors as user types
  ['name', 'phone', 'service'].forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('input', () => {
        clearError(fieldId, `${fieldId}Error`);
      });
      input.addEventListener('change', () => {
        clearError(fieldId, `${fieldId}Error`);
      });
    }
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Name validation
    const name = document.getElementById('name').value.trim();
    if (!name) {
      showError('name', 'nameError', 'Please enter your name');
      isValid = false;
    } else if (name.length < 2) {
      showError('name', 'nameError', 'Name must be at least 2 characters');
      isValid = false;
    } else {
      clearError('name', 'nameError');
    }

    // Phone validation
    const phone = document.getElementById('phone').value.trim();
    if (!phone) {
      showError('phone', 'phoneError', 'Please enter your phone number');
      isValid = false;
    } else if (!/^[+]?[\d\s\-()]{7,15}$/.test(phone)) {
      showError('phone', 'phoneError', 'Please enter a valid phone number');
      isValid = false;
    } else {
      clearError('phone', 'phoneError');
    }

    // Service validation
    const service = document.getElementById('service').value;
    if (!service) {
      showError('service', 'serviceError', 'Please select a service');
      isValid = false;
    } else {
      clearError('service', 'serviceError');
    }

    if (isValid) {
      // Show success toast
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);

      // Reset form
      contactForm.reset();

      // Animate submit button
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.textContent = '✓ Submitted!';
      submitBtn.style.background = '#10B981';
      submitBtn.style.borderColor = '#10B981';

      setTimeout(() => {
        submitBtn.innerHTML = 'Get a Free Quote <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        submitBtn.style.background = '';
        submitBtn.style.borderColor = '';
      }, 3000);
    }
  });

  // ============================================
  // 8. KEYBOARD ACCESSIBILITY — ESC to close menu
  // ============================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

});
