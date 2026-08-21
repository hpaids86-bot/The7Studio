/* ==========================================================================
   THE7STUDIO - CINEMATIC INTRO ANIMATION & HERO BACKGROUND VIDEO ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('The7Studio Web Application Initialized.');

    // Initialize Hero Background Canvas Engine (Cinematic Camera Particles & Golden Bokeh)
    initHeroBgCanvas();

    // Initialize Mobile Navigation Toggle functionality
    initMobileNav();

    // Check if intro overlay exists on current page (e.g. index.html)
    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) {
        startCinematicIntroSequence();
    } else {
        // Non-homepage or page without overlay: ensure navbar & content are instantly visible
        revealNavigationAndHeroImmediately();
    }
});

/* ==========================================================================
   9-STEP CINEMATIC INTRO SEQUENCE CONTROLLER
   ========================================================================== */

let introTimeouts = [];

function clearIntroTimeouts() {
    introTimeouts.forEach(t => clearTimeout(t));
    introTimeouts = [];
}

function startCinematicIntroSequence() {
    clearIntroTimeouts();

    const body = document.body;
    const introOverlay = document.getElementById('intro-overlay');
    const logoBox = document.getElementById('intro-logo-box');
    const goldSweep = document.getElementById('gold-light-sweep');
    const aperture = document.getElementById('camera-aperture');
    const cameraFlash = document.getElementById('camera-flash');

    const mainHeader = document.getElementById('main-header');
    const heroContent = document.getElementById('hero-content');
    const heroVideo = document.getElementById('hero-bg-video');

    if (!introOverlay) return;

    // Reset Elements State
    introOverlay.style.display = 'flex';
    introOverlay.classList.remove('intro-overlay-fadeout');

    if (logoBox) logoBox.className = 'intro-logo-box';
    if (goldSweep) goldSweep.className = 'gold-light-sweep';
    if (aperture) aperture.className = 'camera-aperture';
    if (cameraFlash) cameraFlash.className = 'camera-flash';


    if (mainHeader) {
        mainHeader.classList.remove('intro-show-nav');
        mainHeader.classList.add('intro-hidden-nav');
    }
    if (heroContent) {
        heroContent.classList.remove('intro-show-hero');
        heroContent.classList.add('intro-hidden-hero');
    }

    // STEP 1: Open Website & Black Screen (0ms - 500ms)
    body.classList.add('intro-active');

    // STEP 2: The7Studio Logo Appears (500ms)
    introTimeouts.push(setTimeout(() => {
        if (logoBox) logoBox.classList.add('animate-logo');
    }, 500));

    // STEP 3: Gold Light Sweep (1500ms)
    introTimeouts.push(setTimeout(() => {
        if (goldSweep) goldSweep.classList.add('animate-sweep');
    }, 1500));

    // STEP 4: Camera Lens Opens (2700ms)
    introTimeouts.push(setTimeout(() => {
        if (aperture) aperture.classList.add('animate-aperture');
    }, 2700));

    // STEP 5: Camera Flash (3700ms)
    introTimeouts.push(setTimeout(() => {
        if (cameraFlash) cameraFlash.classList.add('animate-flash');
        synthesizeCameraShutterAudio();
    }, 3700));

    // STEP 6: Background Video Starts (4200ms)
    introTimeouts.push(setTimeout(() => {
        if (heroVideo) {
            heroVideo.play().catch(() => {
                console.log('Autoplay muted playback initialized.');
            });
        }
        if (introOverlay) {
            introOverlay.classList.add('intro-overlay-fadeout');
        }
    }, 4200));

    // STEP 7: Navbar Appears (4700ms)
    introTimeouts.push(setTimeout(() => {

        if (mainHeader) {
            mainHeader.classList.remove('intro-hidden-nav');
            mainHeader.classList.add('intro-show-nav');
        }
    }, 4700));

    // STEP 8: Hero Text Appears (5400ms)
    introTimeouts.push(setTimeout(() => {
        if (heroContent) {
            heroContent.classList.remove('intro-hidden-hero');
            heroContent.classList.add('intro-show-hero');
        }
    }, 5400));

    // STEP 9: Website Opens & Complete Unlock (6300ms)
    introTimeouts.push(setTimeout(() => {
        body.classList.remove('intro-active');
        if (introOverlay) {
            introOverlay.style.display = 'none';
        }
    }, 6300));
}



function revealNavigationAndHeroImmediately() {

    const mainHeader = document.getElementById('main-header');
    const heroContent = document.getElementById('hero-content');


    if (mainHeader) {
        mainHeader.classList.remove('intro-hidden-nav');
        mainHeader.classList.add('intro-show-nav');
    }
    if (heroContent) {
        heroContent.classList.remove('intro-hidden-hero');
        heroContent.classList.add('intro-show-hero');
    }
}

/* ==========================================================================
   WEB AUDIO API CAMERA SHUTTER & FLASH SYNTHESIZER
   ========================================================================== */

function synthesizeCameraShutterAudio() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // 1. Shutter Mechanical Click (High Frequency Noise Burst)
        const bufferSize = ctx.sampleRate * 0.05; // 50ms click
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1800;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start();

        // 2. High Shimmer Flash Capacitor Sound Sweep
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(3500, ctx.currentTime + 0.08);

        oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    } catch (err) {
        // Audio playback may require user interaction on some mobile browsers
    }
}

/* ==========================================================================
   AMBIENT HERO BACKGROUND VIDEO CANVAS RENDERER
   Generates bokeh particles, camera reticle grid, and gold light beams
   ========================================================================== */

function initHeroBgCanvas() {
    const canvas = document.getElementById('hero-video-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.width = canvas.offsetWidth || window.innerWidth;
        height = canvas.height = canvas.offsetHeight || window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Create 45 Bokeh Light Particles
    const particles = [];
    const particleCount = 45;
    const colors = ['rgba(230, 198, 135, ', 'rgba(212, 175, 55, ', 'rgba(255, 255, 255, ', 'rgba(180, 140, 60, '];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 6 + 2,
            colorPrefix: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.5 + 0.1,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.6 - 0.2,
            pulseSpeed: Math.random() * 0.02 + 0.005
        });
    }

    let angle = 0;

    function render() {
        ctx.clearRect(0, 0, width, height);

        // Ambient Light Beams
        angle += 0.008;
        const beamX = width * 0.5 + Math.sin(angle) * (width * 0.2);

        const beamGrad = ctx.createRadialGradient(beamX, height * 0.3, 20, beamX, height * 0.5, width * 0.6);
        beamGrad.addColorStop(0, 'rgba(230, 198, 135, 0.08)');
        beamGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.03)');
        beamGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 0, width, height);

        // Update and Render Bokeh Particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha += Math.sin(angle * 2) * p.pulseSpeed;

            // Wrap edges
            if (p.y < -20) {
                p.y = height + 20;
                p.x = Math.random() * width;
            }
            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;

            const currAlpha = Math.max(0.05, Math.min(0.65, p.alpha));

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.colorPrefix + currAlpha + ')';
            ctx.fill();
        });

        // Subtle Camera Focus Viewfinder Reticle Corners
        ctx.strokeStyle = 'rgba(230, 198, 135, 0.15)';
        ctx.lineWidth = 1.5;
        const cornerSize = 25;
        const margin = 40;

        // Top-Left Corner
        ctx.beginPath();
        ctx.moveTo(margin, margin + cornerSize);
        ctx.lineTo(margin, margin);
        ctx.lineTo(margin + cornerSize, margin);
        ctx.stroke();

        // Top-Right Corner
        ctx.beginPath();
        ctx.moveTo(width - margin - cornerSize, margin);
        ctx.lineTo(width - margin, margin);
        ctx.lineTo(width - margin, margin + cornerSize);
        ctx.stroke();

        // Bottom-Left Corner
        ctx.beginPath();
        ctx.moveTo(margin, height - margin - cornerSize);
        ctx.lineTo(margin, height - margin);
        ctx.lineTo(margin + cornerSize, height - margin);
        ctx.stroke();

        // Bottom-Right Corner
        ctx.beginPath();
        ctx.moveTo(width - margin - cornerSize, height - margin);
        ctx.lineTo(width - margin, height - margin);
        ctx.lineTo(width - margin, height - margin - cornerSize);
        ctx.stroke();

        requestAnimationFrame(render);
    }

    render();
}

async function handleBookingFormSubmission(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = document.getElementById('booking-submit-btn') || form.querySelector('button[type="submit"]');
  const responseBox = document.getElementById('booking-response');

  if (!submitBtn) return;

  const originalBtnHtml = submitBtn.innerHTML;

  const name = (form.name ? form.name.value : '').trim();
  const phone = (form.phone ? form.phone.value : '').trim();
  const email = (form.email ? form.email.value : '').trim();
  const event_type = form.event_type ? form.event_type.value : '';
  const event_date = form.event_date ? form.event_date.value : '';
  const preferred_time = form.preferred_time ? form.preferred_time.value : '';
  const location = (form.location ? form.location.value : '').trim();
  const hours = form.hours ? form.hours.value : '';
  const message = (form.message ? form.message.value : '').trim();

  const serviceCheckboxes = form.querySelectorAll('input[name="services"]:checked');
  const services = Array.from(serviceCheckboxes).map(cb => cb.value);

  const errors = [];
  if (!name || name.length < 2) {
    errors.push('Please enter your full name.');
  }

  const cleanedPhone = phone.replace(/[^0-9+]/g, '');
  if (!phone || cleanedPhone.length < 10) {
    errors.push('Please enter a valid phone number (at least 10 digits).');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address.');
  }

  if (!event_type) {
    errors.push('Please select an event type.');
  }

  if (!event_date) {
    errors.push('Please select your event date.');
  }

  if (errors.length > 0) {
    if (responseBox) {
      responseBox.style.display = 'block';
      responseBox.innerHTML = `
        <div style="background: rgba(255, 77, 77, 0.1); border: 1px solid #ff4d4d; border-radius: 8px; padding: 1rem; color: #ff8080; font-size: 0.85rem;">
          <i class="fa-solid fa-triangle-exclamation" style="margin-right:0.4rem;"></i>
          ${errors.join('<br>')}
        </div>
      `;
    } else {
      alert(errors.join('\n'));
    }
    return;
  }

  if (responseBox) {
    responseBox.style.display = 'none';
    responseBox.innerHTML = '';
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Request...';

  const payload = {
    name,
    phone,
    email,
    event_type,
    event_date,
    preferred_time,
    location,
    package: services.length ? services.join(', ') : '',
    hours,
    message
  };

  try {
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      if (responseBox) {
        responseBox.style.display = 'block';
        responseBox.innerHTML = `
          <div style="background: rgba(200, 169, 107, 0.12); border: 1px solid var(--gold); border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; color: #F5F1E8;">
            <div style="display:flex; align-items:center; gap:0.6rem; color: var(--gold); font-weight:600; font-size: 1rem; margin-bottom: 0.5rem;">
              <i class="fa-solid fa-circle-check" style="font-size:1.3rem;"></i>
              <span>Booking Request Received Successfully!</span>
            </div>
            <p style="font-size:0.88rem; color: var(--text-secondary); margin:0; line-height: 1.6;">
              Our team will contact you shortly to confirm availability.
            </p>
            <div style="margin-top:1rem; text-align:center;">
              <a href="https://wa.me/919790301168?text=${encodeURIComponent('Hi The7Studio, I just submitted a booking request for ' + event_type + ' on ' + event_date + '.')}"
                 target="_blank" rel="noopener"
                 style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:#25D366; border:1px solid #25D366; background: rgba(37,211,102,0.08); padding:0.5rem 1rem; border-radius:4px; text-decoration:none; font-weight:500;">
                <i class="fa-brands fa-whatsapp" style="font-size:1rem;"></i> Chat directly on WhatsApp
              </a>
            </div>
          </div>
        `;
      }
      form.reset();
    } else {
      if (responseBox) {
        responseBox.style.display = 'block';
        responseBox.innerHTML = `
          <div style="background: rgba(255, 77, 77, 0.1); border: 1px solid #ff4d4d; border-radius: 8px; padding: 1rem; color: #ff8080; font-size: 0.85rem;">
            <i class="fa-solid fa-triangle-exclamation" style="margin-right:0.4rem;"></i>
            ${data.error || 'Submission failed. Please try again or reach out to us via WhatsApp.'}
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('[Booking Submit Error]', err);
    if (responseBox) {
      responseBox.style.display = 'block';
      responseBox.innerHTML = `
        <div style="background: rgba(255, 77, 77, 0.1); border: 1px solid #ff4d4d; border-radius: 8px; padding: 1rem; color: #ff8080; font-size: 0.85rem;">
          <i class="fa-solid fa-triangle-exclamation" style="margin-right:0.4rem;"></i>
          Network or server error occurred. Please check your internet connection or contact us directly on WhatsApp (+91 97903 01168).
        </div>
      `;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  }
}

// Background Form Submission using Formspree -> WhatsApp
function handleWhatsAppFormSubmission(event, formType) {
    event.preventDefault();
    const form = event.target;
    
    // Disable the submit button to prevent multiple clicks
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redirecting...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = new FormData(form);
    
    let message = `*New ${formType.charAt(0).toUpperCase() + formType.slice(1)} Request*\n\n`;
    for (let [key, value] of formData.entries()) {
        message += `*${key.charAt(0).toUpperCase() + key.slice(1)}*: ${value}\n`;
    }

    // Phone number from contact info
    const phoneNumber = "919790301168";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    form.reset();
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
}

// Mobile Navigation Toggler implementation
function initMobileNav() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Update menu icon (bars <-> xmark)
        const icon = menuToggle.querySelector('i');
        if (icon) {
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            body.classList.remove('menu-open');
            const icon = menuToggle.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        }
    });

    // Close menu when clicking a navigation link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            body.classList.remove('menu-open');
            const icon = menuToggle.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        });
    });
}
