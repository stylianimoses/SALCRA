// 1. Initialize Feather Icons
feather.replace();

// 1.5 Desktop Dropdown Click Logic
const dropdownParents = document.querySelectorAll('.nav-dropdown-parent');

dropdownParents.forEach(parent => {
  const toggle = parent.querySelector('.dropdown-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = parent.classList.contains('dropdown-open');

      // Close all others
      dropdownParents.forEach(p => {
        p.classList.remove('dropdown-open');
        const btn = p.querySelector('.dropdown-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        parent.classList.add('dropdown-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-dropdown-parent')) {
    dropdownParents.forEach(parent => {
      parent.classList.remove('dropdown-open');
      const toggle = parent.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }
});

// 1.7 Submenu Accordion Toggle
const submenuParents = document.querySelectorAll('.submenu-parent');
submenuParents.forEach(parent => {
  const toggle = parent.querySelector('.submenu-toggle');
  const content = parent.querySelector('.submenu-content');
  if (toggle && content) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = parent.classList.contains('open');
      
      // Close other submenus inside the same dropdown
      const siblingSubmenus = parent.parentElement.querySelectorAll('.submenu-parent');
      siblingSubmenus.forEach(sibling => {
        if (sibling !== parent) {
          sibling.classList.remove('open');
        }
      });
      
      if (isOpen) {
        parent.classList.remove('open');
      } else {
        parent.classList.add('open');
      }
    });
  }
});

// 2. Mobile Menu Logic (Hamburger + Drawer)
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileDrawer = document.getElementById('mobile-drawer');
const mobileClose = document.getElementById('mobile-menu-close');

function openMobileMenu() {
  mobileMenu.classList.remove('hidden');
  // small delay to allow display:block to apply before animating opacity/transform
  requestAnimationFrame(() => {
    mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
    mobileDrawer.classList.remove('translate-x-full');
    mobileBtn.setAttribute('aria-expanded', 'true');
  });
  document.body.style.overflow = 'hidden'; // prevent background scrolling
}

function closeMobileMenu() {
  mobileMenu.classList.add('opacity-0', 'pointer-events-none');
  mobileDrawer.classList.add('translate-x-full');
  mobileBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';

  // wait for transition to finish before hiding
  setTimeout(() => {
    mobileMenu.classList.add('hidden');
  }, 300);
}

if (mobileBtn && mobileClose) {
  mobileBtn.addEventListener('click', openMobileMenu);
  mobileClose.addEventListener('click', closeMobileMenu);
  // Close on clicking overlay
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
  });
}

// 3. Sticky Nav Style Toggle
const mainNav = document.getElementById('main-nav');
if (mainNav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 120) {
      mainNav.classList.add('is-sticky');
    } else {
      mainNav.classList.remove('is-sticky');
    }
  }, { passive: true });
  if (window.scrollY > 120) mainNav.classList.add('is-sticky');
}

// 4. Scroll Animations (Intersection Observer)
const fadeElements = document.querySelectorAll('.fade-up');
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const fadeObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // run once
    }
  });
}, observerOptions);

fadeElements.forEach(el => fadeObserver.observe(el));

// 5. Hero Slider Drag/Swipe Logic
const slidesContainer = document.getElementById('slides-container');
const slides = document.querySelectorAll('.slide-item');
const prevSlideBtn = document.getElementById('slider-prev');
const nextSlideBtn = document.getElementById('slider-next');
const dotsContainer = document.getElementById('slider-dots');

if (slidesContainer && slides.length > 0) {
  let currentSlide = 0;
  const totalSlides = slides.length;
  let sliderInterval;

  // Create pagination dots
  if (dotsContainer) dotsContainer.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `rounded-full transition-all duration-300 focus:outline-none ${index === 0 ? 'bg-primary w-8 h-3 border border-white/20' : 'bg-black/40 border border-white/40 hover:bg-black/60 w-3 h-3'}`;
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    if (dotsContainer) dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer ? dotsContainer.querySelectorAll('button') : [];

  function updateSlider() {
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        dot.className = 'rounded-full transition-all duration-300 focus:outline-none bg-primary w-8 h-3 border border-white/20';
      } else {
        dot.className = 'rounded-full transition-all duration-300 focus:outline-none bg-black/40 border border-white/40 hover:bg-black/60 w-3 h-3';
      }
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
  }

  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    resetInterval();
  }

  function resetInterval() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(nextSlide, 5000);
  }

  if (nextSlideBtn && prevSlideBtn) {
    nextSlideBtn.addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });
    prevSlideBtn.addEventListener('click', () => {
      prevSlide();
      resetInterval();
    });
  }

  resetInterval();

  // Drag/Swipe Variables
  let isDragging = false;
  let startPos = 0;
  let currentDiff = 0;
  let isSwiping = false;

  const heroSlider = document.getElementById('hero-slider');
  if (heroSlider) {
    heroSlider.style.cursor = 'grab';

    // Prevent native image drag
    heroSlider.addEventListener('dragstart', (e) => e.preventDefault());

    // Prevent clicks after swipe
    heroSlider.addEventListener('click', (e) => {
      if (isSwiping) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Mouse Events
    heroSlider.addEventListener('mousedown', dragStart);
    window.addEventListener('mouseup', dragEnd); // Use window to catch releases outside
    // Touch Events
    heroSlider.addEventListener('touchstart', dragStart, { passive: true });
    heroSlider.addEventListener('touchend', dragEnd);

    // Move events (only active while dragging)
    function addMoveListeners() {
      heroSlider.addEventListener('mousemove', dragAction);
      heroSlider.addEventListener('touchmove', dragAction, { passive: true });
    }
    function removeMoveListeners() {
      heroSlider.removeEventListener('mousemove', dragAction);
      heroSlider.removeEventListener('touchmove', dragAction);
    }

    function getPositionX(event) {
      return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    function dragStart(event) {
      isDragging = true;
      isSwiping = false;
      startPos = getPositionX(event);
      currentDiff = 0;
      clearInterval(sliderInterval);
      slidesContainer.classList.remove('transition-transform', 'duration-700', 'ease-in-out');
      heroSlider.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      addMoveListeners();
    }

    function dragAction(event) {
      if (!isDragging) return;
      const currentPosition = getPositionX(event);
      currentDiff = currentPosition - startPos;

      if (Math.abs(currentDiff) > 5) {
        isSwiping = true;
      }

      const translatePercent = (currentDiff / window.innerWidth) * 100;
      slidesContainer.style.transform = `translateX(calc(-${currentSlide * 100}% + ${translatePercent}%))`;
    }

    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      heroSlider.style.cursor = 'grab';
      document.body.style.userSelect = '';
      slidesContainer.classList.add('transition-transform', 'duration-700', 'ease-in-out');
      removeMoveListeners();

      const threshold = window.innerWidth * 0.1; // 10% to swipe

      if (currentDiff < -threshold) {
        nextSlide();
      } else if (currentDiff > threshold) {
        prevSlide();
      } else {
        updateSlider();
      }
      resetInterval();

      if (isSwiping) {
        setTimeout(() => { isSwiping = false; }, 50);
      }
    }
  }
}

// ============================================================
// SIDE MENU MODAL & INTERACTIVE WIDGET LOGIC
// ============================================================

window.openSideMenuModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    // Refresh feather icons inside the modal when it opens
    if (window.feather) {
      window.feather.replace();
    }
    // small delay for transform/opacity animation
    setTimeout(() => {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      const box = modal.querySelector('.modal-box');
      if (box) box.classList.remove('scale-95', 'opacity-0');
    }, 10);
    document.body.style.overflow = 'hidden';
  }
}

window.closeSideMenuModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    const box = modal.querySelector('.modal-box');
    if (box) box.classList.add('scale-95', 'opacity-0');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
}

// Close modals on clicking outside the content area
document.addEventListener('click', (e) => {
  const openModals = document.querySelectorAll('.sidemenu-modal:not(.hidden)');
  openModals.forEach(modal => {
    const box = modal.querySelector('.modal-box');
    if (box && !box.contains(e.target) && !e.target.closest('button[onclick*="openSideMenuModal"]')) {
      const modalId = modal.id;
      window.closeSideMenuModal(modalId);
    }
  });
});

// Interactive Calendar Day Clicks
const calendarDays = document.querySelectorAll('.calendar-day-btn');
const eventPanelContent = document.getElementById('calendar-event-content');

if (calendarDays.length > 0 && eventPanelContent) {
  const mockEvents = {
    '2': {
      title: 'SALCRA Management Committee Meeting',
      time: '09:00 AM - 01:00 PM',
      loc: 'Boardroom, Wisma SALCRA'
    },
    '12': {
      title: 'Pre-Tender Briefing: Upstream Fertilizer Supply Logistics',
      time: '10:30 AM - 12:30 PM',
      loc: 'Seminar Hall, Wisma SALCRA'
    },
    '24': {
      title: 'Annual MSPO Surveillance Audit (Lubok Antu Estate)',
      time: '08:00 AM - 05:00 PM',
      loc: 'Lubok Antu Estate Office'
    },
    '28': {
      title: 'Community Social Responsibility (CSR) Outreach & NCR Land Seminar',
      time: '09:30 AM - 03:00 PM',
      loc: 'Serian Division Community Hall'
    }
  };

  calendarDays.forEach(dayBtn => {
    dayBtn.addEventListener('click', () => {
      // Remove active states from all days
      calendarDays.forEach(btn => btn.classList.remove('ring-2', 'ring-primary', 'bg-primary/20', 'font-bold'));
      
      // Highlight the clicked day
      dayBtn.classList.add('ring-2', 'ring-primary');

      const dayVal = dayBtn.getAttribute('data-day');
      if (mockEvents[dayVal]) {
        const ev = mockEvents[dayVal];
        eventPanelContent.innerHTML = `
          <div class="p-3 bg-primary/10 border-l-4 border-primary rounded-r-lg">
            <h6 class="font-bold text-gray-900 text-sm">${ev.title}</h6>
            <p class="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg> ${ev.time}
            </p>
            <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg> ${ev.loc}
            </p>
          </div>
        `;
      } else {
        eventPanelContent.innerHTML = `
          <div class="text-center py-6 text-gray-400 text-xs italic">
            No events scheduled for June ${dayVal}, 2026.
          </div>
        `;
      }
    });
  });
}

// Interactive Poll Voting
window.submitWebPoll = function(event) {
  if (event) event.preventDefault();
  
  const pollForm = document.getElementById('web-poll-form');
  const pollResults = document.getElementById('web-poll-results');
  
  if (pollForm && pollResults) {
    const selectedOption = pollForm.querySelector('input[name="question"]:checked');
    if (!selectedOption) {
      alert("Please select an option before voting.");
      return;
    }
    
    // Animate transition to results
    pollForm.classList.add('opacity-0');
    setTimeout(() => {
      pollForm.classList.add('hidden');
      pollResults.classList.remove('hidden');
      // small delay to trigger width transitions
      setTimeout(() => {
        pollResults.classList.remove('opacity-0');
        const progressBars = pollResults.querySelectorAll('.poll-progress');
        progressBars.forEach(bar => {
          const targetWidth = bar.getAttribute('data-width');
          bar.style.width = targetWidth;
        });
      }, 50);
    }, 200);
  }
}

// Highlight active page on the menu bar
document.addEventListener('DOMContentLoaded', () => {
  function cleanPath(p) {
    if (!p) return '';
    // Strip query parameters, hashes, relative dot-segments, and replace hyphens, underscores, spaces with empty strings
    return p.split('?')[0].split('#')[0].replace(/^(\.\.\/|\.\/)+/g, '').toLowerCase().replace(/[-_\s%]/g, '');
  }

  function updateActiveNav() {
    let rawPath = '';
    try {
      rawPath = decodeURIComponent(window.location.pathname);
    } catch (e) {
      rawPath = window.location.pathname;
    }
    
    const currentClean = cleanPath(rawPath);
    const navItems = document.querySelectorAll('#main-nav > div > ul > li');
    const currentHash = window.location.hash ? window.location.hash.replace('#', '') : '';
    
    navItems.forEach(li => {
      const parentButtonOrLink = li.querySelector('a, button.dropdown-toggle');
      if (!parentButtonOrLink) return;
      
      let isParentActive = false;
      
      // Check if the parent link itself is active (non-dropdown items like HOME or CONTACT US)
      if (parentButtonOrLink.tagName === 'A') {
        const href = parentButtonOrLink.getAttribute('href');
        if (href) {
          const normalized = cleanPath(href);
          if (normalized === 'index.html' || normalized === 'index') {
            isParentActive = currentClean.endsWith('index.html') || currentClean.endsWith('index') || currentClean.endsWith('/') || currentClean.endsWith('salcra');
          } else {
            isParentActive = currentClean.endsWith(normalized);
          }
        }
      }
      
      // Check sub-menu links inside this dropdown parent
      const dropdownLinks = li.querySelectorAll('.dropdown-menu a');
      dropdownLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const normalized = cleanPath(href);
          if (currentClean.endsWith(normalized)) {
            // Determine if the link specifies a hash section
            const hashIndex = href.indexOf('#');
            const linkHash = hashIndex !== -1 ? href.substring(hashIndex + 1) : '';
            
            let hashMatches = false;
            if (!linkHash) {
              // If the dropdown link itself has no hash in its href, it matches the page pathname regardless of active section hash
              hashMatches = true;
            } else {
              // If the dropdown link has a hash, it must match the current hash context
              if (currentHash) {
                if (linkHash === 'vision-mission') {
                  hashMatches = (currentHash === 'vision-mission' || currentHash === 'values');
                } else {
                  hashMatches = (linkHash === currentHash);
                }
              } else {
                // If there's no hash in the URL, default to matching 'overview'
                hashMatches = (linkHash === 'overview');
              }
            }
            
            if (hashMatches) {
              link.classList.add('nav-drop-active');
              isParentActive = true;
            } else {
              link.classList.remove('nav-drop-active');
            }
          } else {
            link.classList.remove('nav-drop-active');
          }
        }
      });
      
      // Apply active class to parent item if active
      if (isParentActive) {
        parentButtonOrLink.classList.add('nav-active');
        parentButtonOrLink.classList.remove('border-transparent');
      } else {
        parentButtonOrLink.classList.remove('nav-active');
        // Only restore border-transparent if it's a link (not dropdown button trigger)
        if (parentButtonOrLink.tagName === 'A') {
          parentButtonOrLink.classList.add('border-transparent');
        }
      }
    });
  }

  updateActiveNav();
  window.addEventListener('hashchange', updateActiveNav);

  // Watch for active state changes in the in-page navigation tabs
  const inPageObserver = new MutationObserver((mutations) => {
    let changed = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('text-primary')) {
          const href = target.getAttribute('href');
          const sectionId = target.getAttribute('data-section') || (href ? href.replace('#', '') : '');
          if (sectionId) {
            // Silently update hash in address bar without scrolling
            history.replaceState(null, null, '#' + sectionId);
            changed = true;
          }
        }
      }
    });
    if (changed) {
      updateActiveNav();
    }
  });

  // Start observing all in-page tabs
  document.querySelectorAll('.inpage-tab').forEach(tab => {
    inPageObserver.observe(tab, { attributes: true });
  });
});

// Back to Top Button Behavior
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
      backToTopBtn.classList.add('translate-y-0', 'opacity-100');
    } else {
      backToTopBtn.classList.remove('translate-y-0', 'opacity-100');
      backToTopBtn.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Latest Activities Carousel Logic
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('activities-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  const totalItems = 15;
  
  function getItemsPerPage() {
    if (window.innerWidth >= 768) return 3; // md
    if (window.innerWidth >= 640) return 2; // sm
    return 1;
  }

  function updateCarousel() {
    const itemsPerPage = getItemsPerPage();
    const maxIndex = totalItems - itemsPerPage;
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const firstItem = track.children[0];
    if (!firstItem) return;
    const itemWidth = firstItem.offsetWidth;
    const gap = 24; // gap-6 is 24px
    
    const moveAmount = currentIndex * (itemWidth + gap);
    track.style.transform = `translateX(-${moveAmount}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  prevBtn.addEventListener('click', () => {
    const itemsPerPage = getItemsPerPage();
    currentIndex = Math.max(0, currentIndex - itemsPerPage);
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    const itemsPerPage = getItemsPerPage();
    const maxIndex = totalItems - itemsPerPage;
    currentIndex = Math.min(maxIndex, currentIndex + itemsPerPage);
    updateCarousel();
  });

  window.addEventListener('resize', updateCarousel);
  
  if (window.feather) {
    window.feather.replace();
  }
  
  setTimeout(updateCarousel, 150);
});


