/* ========================= */
/* p5.js Particle Background */
/* ========================= */
let particles = [];
const numParticles = 60;
const connectionDistance = 180;
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
    background(250);

    // Calculate mouse velocity for dynamic effects
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
                stroke(60, 60, 70, alpha);
                strokeWeight(1.5);
                line(p.pos.x, p.pos.y, other.pos.x, other.pos.y);
            }
        }

        // Connect to mouse with color accent
        let mouseD = dist(p.pos.x, p.pos.y, mouseX, mouseY);
        if (mouseD < mouseInfluenceRadius) {
            let alpha = map(mouseD, 0, mouseInfluenceRadius, 120, 0);
            let hue = map(mouseD, 0, mouseInfluenceRadius, 200, 240);

            // Subtle blue-gray accent near mouse
            stroke(80, 90, 110, alpha);
            strokeWeight(1.5);
            line(p.pos.x, p.pos.y, mouseX, mouseY);
        }
    });

    // Draw subtle mouse point
    if (mouseX > 0 && mouseY > 0) {
        noStroke();
        fill(80, 90, 110, 40);
        circle(mouseX, mouseY, 8);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

class Particle {
    constructor() {
        // Start particles scattered around the center region
        this.pos = createVector(
            width/2 + random(-width/3, width/3),
            height/2 + random(-height/3, height/3)
        );
        this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
        this.baseVel = this.vel.copy();
        this.size = random(3, 6);
        this.baseSize = this.size;
        this.centerX = width / 2;
        this.centerY = height / 2;
    }

    update(mx, my, mouseSpeed) {
        // Update center reference on resize
        this.centerX = width / 2;
        this.centerY = height / 2;

        // Mouse repulsion/attraction effect
        let mouseD = dist(this.pos.x, this.pos.y, mx, my);
        if (mouseD < mouseInfluenceRadius) {
            let force = map(mouseD, 0, mouseInfluenceRadius, 0.8, 0);
            let angle = atan2(this.pos.y - my, this.pos.x - mx);
            this.vel.x += cos(angle) * force * 0.1;
            this.vel.y += sin(angle) * force * 0.1;

            // Grow slightly when near mouse
            this.size = lerp(this.size, this.baseSize * 1.5, 0.1);
        } else {
            this.size = lerp(this.size, this.baseSize, 0.05);
        }

        // Calculate distance from center
        let distFromCenter = dist(this.pos.x, this.pos.y, this.centerX, this.centerY);
        let maxDist = min(width, height) * 0.45; // Edge threshold

        // Gradually pull back toward center when approaching edges
        if (distFromCenter > maxDist * 0.6) {
            let pullStrength = map(distFromCenter, maxDist * 0.6, maxDist, 0, 0.03);
            pullStrength = constrain(pullStrength, 0, 0.05);

            // Calculate direction back to center
            let angleToCenter = atan2(this.centerY - this.pos.y, this.centerX - this.pos.x);
            this.vel.x += cos(angleToCenter) * pullStrength;
            this.vel.y += sin(angleToCenter) * pullStrength;
        }

        // Dampen velocity
        this.vel.x = lerp(this.vel.x, this.baseVel.x, 0.015);
        this.vel.y = lerp(this.vel.y, this.baseVel.y, 0.015);

        // Limit max velocity
        let maxVel = 2;
        this.vel.x = constrain(this.vel.x, -maxVel, maxVel);
        this.vel.y = constrain(this.vel.y, -maxVel, maxVel);

        this.pos.add(this.vel);

        // Soft boundary - if somehow beyond edge, gently push back
        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
            let angleToCenter = atan2(this.centerY - this.pos.y, this.centerX - this.pos.x);
            this.vel.x = cos(angleToCenter) * 1;
            this.vel.y = sin(angleToCenter) * 1;
        }
    }

    draw() {
        noStroke();
        // Slightly darker, more visible particles
        fill(50, 55, 65, 180);
        circle(this.pos.x, this.pos.y, this.size);
    }
}

/* ========================= */
/* Scroll Animation          */
/* ========================= */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

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
