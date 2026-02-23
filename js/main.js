/* ========================= */
/* p5.js Particle Background */
/* ========================= */
let particles = [];
const numParticles = 100;
const connectionDistance = 200;
let mouseInfluenceRadius = 250;

function setup() {
    pixelDensity(1);
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');

    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function draw() {
    background(0);

    let mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);

    particles.forEach((p, index) => {
        p.update(mouseX, mouseY, mouseSpeed);
        p.draw();

        // Connect nearby particles
        for (let j = index + 1; j < particles.length; j++) {
            let other = particles[j];
            let d = dist(p.pos.x, p.pos.y, other.pos.x, other.pos.y);
            if (d < connectionDistance) {
                let alpha = map(d, 0, connectionDistance, 80, 0);
                stroke(180, 190, 210, alpha);
                strokeWeight(1.5);
                line(p.pos.x, p.pos.y, other.pos.x, other.pos.y);
            }
        }

        // Connect to mouse with color accent
        let mouseD = dist(p.pos.x, p.pos.y, mouseX, mouseY);
        if (mouseD < mouseInfluenceRadius) {
            let alpha = map(mouseD, 0, mouseInfluenceRadius, 120, 0);
            stroke(140, 160, 220, alpha);
            strokeWeight(1.5);
            line(p.pos.x, p.pos.y, mouseX, mouseY);
        }
    });

    // Draw subtle mouse point
    if (mouseX > 0 && mouseY > 0) {
        noStroke();
        fill(140, 160, 220, 40);
        circle(mouseX, mouseY, 8);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

class Particle {
    constructor() {
        this.pos = createVector(
            width / 2 + random(-width / 3, width / 3),
            height / 2 + random(-height / 3, height / 3)
        );
        this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
        this.baseVel = this.vel.copy();
        this.size = random(3, 6);
        this.baseSize = this.size;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.hue = random(180, 240);
        this.brightness = random(180, 230);
    }

    update(mx, my, mouseSpeed) {
        this.centerX = width / 2;
        this.centerY = height / 2;

        let mouseD = dist(this.pos.x, this.pos.y, mx, my);
        if (mouseD < mouseInfluenceRadius) {
            let force = map(mouseD, 0, mouseInfluenceRadius, 0.8, 0);
            let angle = atan2(this.pos.y - my, this.pos.x - mx);
            this.vel.x += cos(angle) * force * 0.1;
            this.vel.y += sin(angle) * force * 0.1;
            this.size = lerp(this.size, this.baseSize * 1.5, 0.1);
        } else {
            this.size = lerp(this.size, this.baseSize, 0.05);
        }

        let distFromCenter = dist(this.pos.x, this.pos.y, this.centerX, this.centerY);
        let maxDist = min(width, height) * 0.45;

        if (distFromCenter > maxDist * 0.6) {
            let pullStrength = map(distFromCenter, maxDist * 0.6, maxDist, 0, 0.03);
            pullStrength = constrain(pullStrength, 0, 0.05);
            let angleToCenter = atan2(this.centerY - this.pos.y, this.centerX - this.pos.x);
            this.vel.x += cos(angleToCenter) * pullStrength;
            this.vel.y += sin(angleToCenter) * pullStrength;
        }

        this.vel.x = lerp(this.vel.x, this.baseVel.x, 0.015);
        this.vel.y = lerp(this.vel.y, this.baseVel.y, 0.015);

        let maxVel = 2;
        this.vel.x = constrain(this.vel.x, -maxVel, maxVel);
        this.vel.y = constrain(this.vel.y, -maxVel, maxVel);

        this.pos.add(this.vel);

        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
            let angleToCenter = atan2(this.centerY - this.pos.y, this.centerX - this.pos.x);
            this.vel.x = cos(angleToCenter) * 1;
            this.vel.y = sin(angleToCenter) * 1;
        }
    }

    draw() {
        noStroke();
        // Glow layer
        fill(this.brightness, this.brightness + 10, 255, 25);
        circle(this.pos.x, this.pos.y, this.size * 3);
        // Core particle
        fill(200, 210, 230, 150);
        circle(this.pos.x, this.pos.y, this.size);
    }
}

/* ========================= */
/* Reduced Motion Check      */
/* ========================= */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========================= */
/* GSAP Initialization       */
/* ========================= */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        // Fallback: use IntersectionObserver if GSAP didn't load
        initFallbackObserver();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) {
        // Show everything immediately, hide canvas
        gsap.set('.fade-in', { opacity: 1, y: 0 });
        gsap.set('.hero-line', { opacity: 1, y: 0 });
        gsap.set('.hero .subtitle', { opacity: 1 });
        gsap.set('.scroll-indicator', { opacity: 1 });
        const p5Container = document.getElementById('p5-container');
        if (p5Container) p5Container.style.display = 'none';
        return;
    }

    initHeroAnimation();
    initScrollAnimations();
    initNavBehavior();
    initCustomCursor();
    initMagneticButtons();
});

/* ========================= */
/* Hero Text Entrance        */
/* ========================= */
function initHeroAnimation() {
    const heroLines = document.querySelectorAll('.hero-line');
    const subtitle = document.querySelector('.hero .subtitle');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (!heroLines.length) return;

    const tl = gsap.timeline({ delay: 0.3 });

    tl.from(heroLines, {
        y: 120,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out'
    });

    if (subtitle) {
        tl.from(subtitle, {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.4');
    }

    if (scrollIndicator) {
        tl.from(scrollIndicator, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.2');
    }
}

/* ========================= */
/* Scroll Animations (Phase 3) */
/* ========================= */
function initScrollAnimations() {
    // Batch fade-in elements
    ScrollTrigger.batch('.fade-in', {
        onEnter: (batch) => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power2.out',
                overwrite: true
            });
        },
        start: 'top 88%',
        once: true
    });

    // Set initial state for fade-in elements (CSS handles this too, but ensure GSAP controls it)
    gsap.set('.fade-in', { opacity: 0, y: 40 });

    // Parallax on section headings
    gsap.utils.toArray('section h2').forEach(heading => {
        gsap.fromTo(heading, { y: 60 }, {
            y: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: heading,
                start: 'top bottom',
                end: 'top 30%',
                scrub: 1
            }
        });
    });

    // Parallax on bento images
    gsap.utils.toArray('.bento-item img').forEach(img => {
        gsap.fromTo(img, { y: 30 }, {
            y: -30,
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.bento-item'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    });
}

/* ========================= */
/* Nav Scroll Behavior (Phase 4) */
/* ========================= */
function initNavBehavior() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let lastScrollY = 0;
    let ticking = false;

    function updateNav() {
        const scrollY = window.scrollY;

        // Add/remove scrolled class
        if (scrollY > 80) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }

        // Hide on scroll down, show on scroll up
        if (scrollY > lastScrollY && scrollY > 300) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });
}

/* ========================= */
/* Custom Cursor (Phase 4)   */
/* ========================= */
function initCustomCursor() {
    // Only on devices with fine pointer (desktop)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.cursor-follower');
    if (!cursor || !follower) return;

    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
    });

    function animateFollower() {
        followerX += (cursorX - followerX) * 0.15;
        followerY += (cursorY - followerY) * 0.15;
        follower.style.transform = `translate(${followerX - 18}px, ${followerY - 18}px)`;
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Expand on interactive elements
    const interactiveSelectors = 'a, button, .bento-item, .showcase-card';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            follower.classList.remove('cursor-hover');
        });
    });
}

/* ========================= */
/* Magnetic Buttons (Phase 4) */
/* ========================= */
function initMagneticButtons() {
    const magneticEls = document.querySelectorAll('.submit-btn, .blog-link, .social-links a');

    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { el.style.transition = ''; }, 400);
        });
    });
}

/* ========================= */
/* Fallback Observer         */
/* ========================= */
function initFallbackObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
}

/* ========================= */
/* Drag Scroll for Showcase  */
/* ========================= */
document.querySelectorAll('.showcase-track').forEach(track => {
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.style.cursor = 'grabbing';
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
        isDown = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', () => {
        isDown = false;
        track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2;
        track.scrollLeft = scrollLeft - walk;
    });

    track.style.cursor = 'grab';
});

/* ========================= */
/* Listen Button Handler     */
/* ========================= */
document.querySelectorAll('.listen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const href = btn.getAttribute('data-href');
        if (href && href !== '#') {
            window.open(href, '_blank');
        }
    });
});
