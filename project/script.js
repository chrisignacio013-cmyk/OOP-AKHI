document.addEventListener('DOMContentLoaded', () => {
    // Reveal Elements on Scroll
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    // Initial check
    revealOnScroll();

    // Check on scroll
    window.addEventListener('scroll', revealOnScroll);

    // Navbar Background on Scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(28, 28, 30, 0.85)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Animate hamburger
            hamburger.classList.toggle('toggle');
        });

        // Close mobile menu on link click
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Mouse cursor light effect
    const cursorLight = document.createElement('div');
    cursorLight.classList.add('cursor-light');
    document.body.appendChild(cursorLight);

    let isMouseMoving = false;
    let mouseTimeout;

    document.addEventListener('mousemove', (e) => {
        cursorLight.style.left = e.clientX + 'px';
        cursorLight.style.top = e.clientY + 'px';
        cursorLight.style.opacity = '1';

        // Add a subtle 3D tilt to cards on hover
        const targetCard = e.target.closest('.card');
        if (targetCard) {
            const rect = targetCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            targetCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            targetCard.style.transition = 'transform 0.1s ease';
        }

        clearTimeout(mouseTimeout);
        isMouseMoving = true;

        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
            cursorLight.style.opacity = '0';
        }, 1500);
    });

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.4s ease';
        });
    });

    // Background Canvas Stars
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let isWarpSpeed = false;
        let warpMultiplier = 0;

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let mouse = { x: null, y: null };
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        document.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Brake effect on load (entering the page)
        isWarpSpeed = true;
        warpMultiplier = 30;
        let startBrakeTime = Date.now();
        let brakeDuration = 1000;

        let animateBrake = () => {
            let elapsed = Date.now() - startBrakeTime;
            let progress = Math.min(elapsed / brakeDuration, 1);

            // Ease out: starts fast, slows down
            let reverseProgress = 1 - progress;
            warpMultiplier = Math.pow(reverseProgress, 3) * 30;

            if (progress < 1) {
                requestAnimationFrame(animateBrake);
            } else {
                isWarpSpeed = false;
                warpMultiplier = 0;
            }
        };
        requestAnimationFrame(animateBrake);

        // Intercept links for warp speed transition
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) return; // ignore smooth scroll links
                if (href && href.startsWith('mailto')) return;

                // If it's an external or internal page link, do warp speed
                if (href) {
                    // Only skip if it's linking to the exact same page without a hash
                    if (href === window.location.pathname.split('/').pop()) return;

                    e.preventDefault();
                    isWarpSpeed = true;

                    let startTime = Date.now();
                    let duration = 1000; // time before jumping to next page

                    let animateWarp = () => {
                        let elapsed = Date.now() - startTime;
                        let progress = Math.min(elapsed / duration, 1);

                        // Ease in cubic: t^3
                        warpMultiplier = Math.pow(progress, 3) * 30;

                        if (progress < 1) {
                            requestAnimationFrame(animateWarp);
                        } else {
                            window.location.href = href;
                        }
                    };
                    requestAnimationFrame(animateWarp);
                }
            });
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.baseAlpha = Math.random() * 0.4 + 0.6; // brighter base
                this.alpha = this.baseAlpha;
                this.z = Math.random() * width; // depth for warp speed
                // random drift speed for dust-like floating
                this.driftX = (Math.random() - 0.5) * 0.4;
                this.driftY = (Math.random() - 0.5) * 0.4;
                // Spark state
                this.sparkTimer = 0;          // counts down while sparking
                this.sparkDuration = 0;       // total duration of this spark
                this.nextSpark = this._randNextSpark(); // frames until next spark
            }

            _randNextSpark() {
                // trigger a spark roughly every 3–12 seconds at 60fps
                return Math.floor(Math.random() * 420 + 180);
            }

            draw() {
                // Always draw the core sphere
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();

                // If sparking, draw cross spikes on top
                if (this.sparkTimer > 0) {
                    // progress: 0→1 flash in, 1→0 fade out (peak at halfway)
                    const t = this.sparkTimer / this.sparkDuration;
                    // Triangle wave: peaks at 0.5
                    const peakT = 1 - Math.abs(t - 0.5) * 2;
                    const spikeAlpha = peakT;
                    const spikeLen = this.size * 6 * peakT;

                    ctx.save();
                    ctx.globalAlpha = spikeAlpha * 0.9;
                    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
                    ctx.lineWidth = this.size * 0.35;
                    ctx.lineCap = 'round';
                    // Horizontal
                    ctx.beginPath();
                    ctx.moveTo(this.x - spikeLen, this.y);
                    ctx.lineTo(this.x + spikeLen, this.y);
                    ctx.stroke();
                    // Vertical
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - spikeLen);
                    ctx.lineTo(this.x, this.y + spikeLen);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            update() {
                // Spark countdown logic
                if (this.sparkTimer > 0) {
                    this.sparkTimer--;
                    // Briefly boost brightness at the flash peak
                    const t = this.sparkTimer / this.sparkDuration;
                    const peakT = 1 - Math.abs(t - 0.5) * 2;
                    this.alpha = Math.min(1, this.baseAlpha + peakT * 0.4);
                } else {
                    this.alpha = this.baseAlpha;
                    this.nextSpark--;
                    if (this.nextSpark <= 0) {
                        // Trigger a new spark
                        this.sparkDuration = Math.floor(Math.random() * 60 + 90); // 90-150 frames (~1.5-2.5s)
                        this.sparkTimer = this.sparkDuration;
                        this.nextSpark = this._randNextSpark();
                    }
                }

                // Constantly update base positions for a slow drift effect
                this.baseX += this.driftX;
                this.baseY += this.driftY;

                // Wrap around edges to maintain continuous starfield
                if (this.baseX < 0) this.baseX = width;
                if (this.baseX > width) this.baseX = 0;
                if (this.baseY < 0) this.baseY = height;
                if (this.baseY > height) this.baseY = 0;

                if (isWarpSpeed) {
                    let centerX = width / 2;
                    let centerY = height / 2;
                    let dx = this.x - centerX;
                    let dy = this.y - centerY;

                    // Apply velocity radially
                    let vx = dx * warpMultiplier * 0.05;
                    let vy = dy * warpMultiplier * 0.05;

                    this.x += vx;
                    this.y += vy;

                    // Draw line stretching out
                    ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
                    ctx.lineWidth = this.size;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x - vx * 2, this.y - vy * 2);
                    ctx.stroke();

                    // reset if it goes off screen
                    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                        this.x = centerX + (Math.random() - 0.5) * 10;
                        this.y = centerY + (Math.random() - 0.5) * 10;
                    }
                    return;
                }

                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                let maxDistance = 150;

                if (distance < maxDistance && mouse.x != null) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        let speed = dx / 8;
                        let maxSpeed = 3;
                        if (speed > maxSpeed) speed = maxSpeed;
                        if (speed < -maxSpeed) speed = -maxSpeed;
                        this.x -= speed;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        let speed = dy / 8;
                        let maxSpeed = 3;
                        if (speed > maxSpeed) speed = maxSpeed;
                        if (speed < -maxSpeed) speed = -maxSpeed;
                        this.y -= speed;
                    }
                }
                this.draw();
            }
        }

        const initParticles = () => {
            particles = [];
            let numberOfParticles = (width * height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animateParticles = () => {
            if (isWarpSpeed) {
                // leave trails by using a semi-transparent fill
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(0, 0, width, height);
            } else {
                ctx.clearRect(0, 0, width, height);
            }

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            requestAnimationFrame(animateParticles);
        };

        initParticles();
        animateParticles();
    }

    // Terminal Simulation Logic
    const termInputs = document.querySelectorAll('.term-input');

    termInputs.forEach(input => {
        // Enable input
        input.disabled = false;
        input.placeholder = "Type a command and press Enter...";

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                const targetId = this.id.replace('input-', 'term-');
                const termBody = document.getElementById(targetId);

                if (command) {
                    // Echo command
                    const cmdLine = document.createElement('div');
                    cmdLine.className = 'term-line';
                    cmdLine.innerHTML = `<span style="color: #f5f5f7;">guest@portfolio:~$</span> ${command}`;
                    termBody.appendChild(cmdLine);

                    // Simulate processing (Wait for real logic)
                    const outLine = document.createElement('div');
                    outLine.className = 'term-line output';
                    outLine.style.color = '#00ff00';
                    outLine.textContent = `Processing: ${command} ... (Awaiting Java logic implementation)`;
                    termBody.appendChild(outLine);

                    // Scroll to bottom
                    termBody.scrollTop = termBody.scrollHeight;

                    // Clear input
                    this.value = '';
                }
            }
        });
    });
});
