/*
==============================================================
 BREAKOUT ULTRA - VERSIÓN COMPLETA
==============================================================
 Requisitos del HTML:

 <canvas id="myCanvas"></canvas>
 <script src="ejercicio10.js"></script>

 Copia todo este archivo dentro de tu archivo .js.

 CONTROLES:
 - Flechas A/D: mover la barra
 - Mouse o toque: mover la barra
 - Espacio: iniciar y lanzar la bola
 - P o Escape: pausar/reanudar
 - R: reiniciar la partida
 - M: activar/desactivar sonidos
 - Clic en los botones dibujados dentro del juego
==============================================================
*/

(function () {
    "use strict";

    // ---------- CANVAS Y CONFIGURACIÓN GENERAL ----------
    const canvas = document.getElementById("myCanvas");
    if (!canvas) {
        throw new Error('No se encontró un canvas con id="myCanvas".');
    }

    const ctx = canvas.getContext("2d");
    canvas.width = 960;
    canvas.height = 640;
    canvas.style.width = "min(96vw, 960px)";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "18px auto";
    canvas.style.border = "3px solid #18213a";
    canvas.style.borderRadius = "16px";
    canvas.style.boxShadow = "0 18px 55px rgba(0,0,0,.35)";
    canvas.style.background = "#081225";
    canvas.style.touchAction = "none";
    canvas.tabIndex = 0;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const TAU = Math.PI * 2;

    const CONFIG = {
        startLives: 4,
        paddleSpeed: 720,
        startBallSpeed: 390,
        maxBallSpeed: 720,
        powerUpChance: 0.30,
        maxParticles: 650
    };

    // ---------- ESTADO DEL JUEGO ----------
    let state = "menu"; // menu, playing, paused, gameOver, victory
    let score = 0;
    let highScore = Number(localStorage.getItem("breakoutUltraRecord") || 0);
    let lives = CONFIG.startLives;
    let level = 1;
    let combo = 0;
    let comboTimer = 0;
    let shake = 0;
    let flash = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let soundEnabled = true;
    let audioContext = null;

    const keys = { left: false, right: false };
    const pointer = { x: WIDTH / 2, y: HEIGHT / 2, active: false };

    const paddle = {
        x: WIDTH / 2 - 65,
        y: HEIGHT - 55,
        w: 130,
        h: 18,
        baseW: 130,
        targetW: 130,
        vx: 0,
        laser: 0,
        magnet: 0,
        shield: 0,
        glow: 0
    };

    let balls = [];
    let bricks = [];
    let particles = [];
    let powerUps = [];
    let bullets = [];
    let floatingTexts = [];
    let stars = [];

    const POWER_TYPES = {
        expand: { icon: "↔", color: "#45f3ff", name: "BARRA GRANDE" },
        slow:   { icon: "S", color: "#8bff76", name: "BOLA LENTA" },
        multi:  { icon: "×3", color: "#ff70df", name: "MULTIBOLA" },
        laser:  { icon: "L", color: "#ff5252", name: "LÁSER" },
        life:   { icon: "+1", color: "#ffd84d", name: "VIDA EXTRA" },
        shield: { icon: "◆", color: "#74a8ff", name: "ESCUDO" },
        magnet: { icon: "U", color: "#c28cff", name: "IMÁN" }
    };

    // ---------- UTILIDADES ----------
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const random = (min, max) => Math.random() * (max - min) + min;
    const choose = array => array[Math.floor(Math.random() * array.length)];

    function roundedRect(x, y, w, h, radius) {
        const r = Math.min(radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
    }

    function circle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TAU);
    }

    function getCanvasPoint(event) {
        const rect = canvas.getBoundingClientRect();
        const source = event.touches ? event.touches[0] : event;
        return {
            x: (source.clientX - rect.left) * WIDTH / rect.width,
            y: (source.clientY - rect.top) * HEIGHT / rect.height
        };
    }

    function saveHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("breakoutUltraRecord", String(highScore));
        }
    }

    // Sonidos creados con Web Audio; no se necesitan archivos externos.
    function sound(frequency, duration, type = "sine", volume = 0.035, slide = 0) {
        if (!soundEnabled) return;
        try {
            audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === "suspended") audioContext.resume();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const now = audioContext.currentTime;
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, now);
            oscillator.frequency.linearRampToValueAtTime(Math.max(40, frequency + slide), now + duration);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            oscillator.connect(gain).connect(audioContext.destination);
            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (_) {
            soundEnabled = false;
        }
    }

    function addText(x, y, text, color = "#ffffff", size = 18) {
        floatingTexts.push({ x, y, text, color, size, life: 1, maxLife: 1 });
    }

    function addParticles(x, y, color, amount = 14, force = 220) {
        for (let i = 0; i < amount && particles.length < CONFIG.maxParticles; i++) {
            const angle = random(0, TAU);
            const speed = random(force * 0.25, force);
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: random(2, 7),
                color,
                life: random(0.35, 0.9),
                maxLife: 0.9,
                gravity: random(80, 240)
            });
        }
    }

    // ---------- CREACIÓN DE NIVELES ----------
    function createStars() {
        stars = Array.from({ length: 85 }, () => ({
            x: random(0, WIDTH),
            y: random(0, HEIGHT),
            size: random(0.5, 2.2),
            speed: random(4, 20),
            alpha: random(0.2, 0.85)
        }));
    }

    function createBall(x = WIDTH / 2, y = paddle.y - 15, angle = -Math.PI / 2) {
        const speed = CONFIG.startBallSpeed + (level - 1) * 24;
        return {
            x, y,
            r: 9,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            trail: [],
            stuck: true,
            offset: 0,
            fire: 0,
            lastBrick: null
        };
    }

    function brickTypeFor(row, column) {
        // Distribución fija para que el único nivel siempre esté bien equilibrado.
        if ((row === 1 && (column === 2 || column === 7)) ||
            (row === 4 && (column === 4 || column === 5))) return "solid";
        if ((row === 2 && (column === 1 || column === 8)) ||
            (row === 3 && (column === 3 || column === 6))) return "explosive";
        if (row < 2 || (row + column) % 5 === 0) return "strong";
        return "normal";
    }

    function createLevel() {
        bricks = [];
        particles = [];
        powerUps = [];
        bullets = [];
        floatingTexts = [];
        combo = 0;
        comboTimer = 0;

        const columns = 10;
        const rows = 6;
        const gap = 7;
        const side = 42;
        const top = 92;
        const brickW = (WIDTH - side * 2 - gap * (columns - 1)) / columns;
        const brickH = 25;

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const type = brickTypeFor(row, column);
                const hp = type === "strong" ? (row === 0 ? 3 : 2) : 1;
                const hue = (row * 38 + column * 7 + level * 25) % 360;
                bricks.push({
                    x: side + column * (brickW + gap),
                    y: top + row * (brickH + gap),
                    w: brickW,
                    h: brickH,
                    type,
                    hp,
                    maxHp: hp,
                    hue,
                    alive: true,
                    hit: 0
                });
            }
        }

        resetPaddleEffects();
        balls = [createBall()];
        state = "playing";
        addText(WIDTH / 2, HEIGHT / 2, "¡A ROMPER!", "#ffffff", 34);
    }

    function resetPaddleEffects() {
        paddle.targetW = paddle.baseW;
        paddle.w = paddle.baseW;
        paddle.x = WIDTH / 2 - paddle.w / 2;
        paddle.laser = 0;
        paddle.magnet = 0;
        paddle.shield = 0;
        paddle.glow = 0;
    }

    function newGame() {
        score = 0;
        lives = CONFIG.startLives;
        level = 1;
        createLevel();
        sound(420, 0.1, "triangle", 0.04, 180);
    }

    function launchBalls() {
        let launched = false;
        balls.forEach((ball, index) => {
            if (!ball.stuck) return;
            ball.stuck = false;
            const angle = -Math.PI / 2 + random(-0.62, 0.62) + index * 0.12;
            const speed = CONFIG.startBallSpeed + (level - 1) * 24;
            ball.vx = Math.cos(angle) * speed;
            ball.vy = Math.sin(angle) * speed;
            launched = true;
        });
        if (launched) sound(520, 0.08, "square", 0.025, 120);
    }

    // ---------- POWER-UPS ----------
    function dropPowerUp(x, y) {
        if (Math.random() > CONFIG.powerUpChance) return;
        const bag = ["expand", "slow", "multi", "laser", "shield", "magnet", "expand", "slow"];
        if (lives < 3) bag.push("life", "life");
        const type = choose(bag);
        powerUps.push({ x, y, w: 34, h: 24, vy: 145, type, spin: 0 });
    }

    function applyPowerUp(type) {
        const data = POWER_TYPES[type];
        addText(paddle.x + paddle.w / 2, paddle.y - 10, data.name, data.color, 20);
        addParticles(paddle.x + paddle.w / 2, paddle.y, data.color, 24, 250);
        paddle.glow = 1;
        score += 75;

        if (type === "expand") {
            paddle.targetW = 205;
            setTimeout(() => { paddle.targetW = paddle.baseW; }, 12000);
        } else if (type === "slow") {
            balls.forEach(ball => {
                const speed = Math.hypot(ball.vx, ball.vy);
                if (speed > 300) {
                    ball.vx *= 0.72;
                    ball.vy *= 0.72;
                }
            });
        } else if (type === "multi") {
            const source = balls[0] || createBall();
            const speed = clamp(Math.hypot(source.vx, source.vy), 330, CONFIG.maxBallSpeed);
            [-0.48, 0.48].forEach(turn => {
                const angle = Math.atan2(source.vy, source.vx) + turn;
                balls.push({ ...createBall(source.x, source.y, angle), stuck: false,
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
            });
        } else if (type === "laser") {
            paddle.laser = 12;
        } else if (type === "life") {
            lives = Math.min(9, lives + 1);
        } else if (type === "shield") {
            paddle.shield = 2;
        } else if (type === "magnet") {
            paddle.magnet = 12;
        }

        sound(700, 0.16, "sine", 0.05, 420);
    }

    function shoot() {
        if (paddle.laser <= 0 || state !== "playing") return;
        bullets.push({ x: paddle.x + 12, y: paddle.y, vy: -700 });
        bullets.push({ x: paddle.x + paddle.w - 12, y: paddle.y, vy: -700 });
        paddle.laser--;
        sound(330, 0.07, "sawtooth", 0.025, 240);
    }

    // ---------- COLISIONES ----------
    function circleRectangle(ball, rect) {
        const nearestX = clamp(ball.x, rect.x, rect.x + rect.w);
        const nearestY = clamp(ball.y, rect.y, rect.y + rect.h);
        const diffX = ball.x - nearestX;
        const diffY = ball.y - nearestY;
        return diffX * diffX + diffY * diffY <= ball.r * ball.r;
    }

    function bounceFromBrick(ball, brick) {
        const overlapLeft = ball.x + ball.r - brick.x;
        const overlapRight = brick.x + brick.w - (ball.x - ball.r);
        const overlapTop = ball.y + ball.r - brick.y;
        const overlapBottom = brick.y + brick.h - (ball.y - ball.r);
        const minimum = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minimum === overlapLeft) {
            ball.x = brick.x - ball.r - 0.5;
            ball.vx = -Math.abs(ball.vx);
        } else if (minimum === overlapRight) {
            ball.x = brick.x + brick.w + ball.r + 0.5;
            ball.vx = Math.abs(ball.vx);
        } else if (minimum === overlapTop) {
            ball.y = brick.y - ball.r - 0.5;
            ball.vy = -Math.abs(ball.vy);
        } else {
            ball.y = brick.y + brick.h + ball.r + 0.5;
            ball.vy = Math.abs(ball.vy);
        }
    }

    function damageBrick(brick, damage = 1, ball = null) {
        if (!brick.alive) return;
        brick.hit = 1;

        if (brick.type === "solid") {
            addParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, "#a9bbd6", 7, 100);
            sound(120, 0.06, "square", 0.025, -20);
            return;
        }

        brick.hp -= damage;
        if (brick.hp > 0) {
            score += 8;
            addParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, `hsl(${brick.hue} 90% 65%)`, 7, 125);
            sound(210 + brick.hp * 40, 0.05, "triangle", 0.025, 35);
            return;
        }

        brick.alive = false;
        combo = comboTimer > 0 ? combo + 1 : 1;
        comboTimer = 1.7;
        const points = (brick.type === "explosive" ? 180 : brick.maxHp * 100) * Math.min(combo, 6);
        score += points;
        const color = brick.type === "explosive" ? "#ff923d" : `hsl(${brick.hue} 92% 62%)`;
        addParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, color,
            brick.type === "explosive" ? 34 : 18, brick.type === "explosive" ? 370 : 230);
        addText(brick.x + brick.w / 2, brick.y, "+" + points, color, combo > 2 ? 21 : 16);
        dropPowerUp(brick.x + brick.w / 2, brick.y + brick.h / 2);
        sound(260 + Math.min(combo, 8) * 40, 0.07, "square", 0.03, 80);

        if (brick.type === "explosive") {
            shake = Math.max(shake, 9);
            flash = Math.max(flash, 0.18);
            const centerX = brick.x + brick.w / 2;
            const centerY = brick.y + brick.h / 2;
            bricks.forEach(other => {
                if (!other.alive || other === brick || other.type === "solid") return;
                const ox = other.x + other.w / 2;
                const oy = other.y + other.h / 2;
                if (Math.hypot(ox - centerX, oy - centerY) < 100) damageBrick(other, 1, ball);
            });
        }

        saveHighScore();
    }

    function checkBallBrickCollisions(ball) {
        for (const brick of bricks) {
            if (!brick.alive || brick === ball.lastBrick || !circleRectangle(ball, brick)) continue;
            bounceFromBrick(ball, brick);
            damageBrick(brick, ball.fire > 0 ? 2 : 1, ball);
            ball.lastBrick = brick;
            setTimeout(() => { if (ball.lastBrick === brick) ball.lastBrick = null; }, 45);
            break;
        }
    }

    function checkBulletBricks(bullet) {
        for (const brick of bricks) {
            if (!brick.alive || brick.type === "solid") continue;
            if (bullet.x >= brick.x && bullet.x <= brick.x + brick.w &&
                bullet.y >= brick.y && bullet.y <= brick.y + brick.h) {
                bullet.dead = true;
                damageBrick(brick, 1);
                return;
            }
        }
    }

    // ---------- ACTUALIZACIÓN ----------
    function updatePaddle(dt) {
        paddle.vx = 0;
        if (keys.left) paddle.vx -= CONFIG.paddleSpeed;
        if (keys.right) paddle.vx += CONFIG.paddleSpeed;

        if (pointer.active && !keys.left && !keys.right) {
            const target = pointer.x - paddle.w / 2;
            paddle.vx = clamp((target - paddle.x) * 12, -CONFIG.paddleSpeed * 1.4, CONFIG.paddleSpeed * 1.4);
        }

        paddle.x = clamp(paddle.x + paddle.vx * dt, 15, WIDTH - paddle.w - 15);
        paddle.w += (paddle.targetW - paddle.w) * Math.min(1, dt * 8);
        paddle.x = clamp(paddle.x, 15, WIDTH - paddle.w - 15);
        paddle.glow = Math.max(0, paddle.glow - dt * 1.8);
        paddle.magnet = Math.max(0, paddle.magnet - dt);

        balls.forEach(ball => {
            if (ball.stuck) {
                ball.x = clamp(paddle.x + paddle.w / 2 + ball.offset, ball.r, WIDTH - ball.r);
                ball.y = paddle.y - ball.r - 2;
            }
        });
    }

    function updateBalls(dt) {
        for (const ball of balls) {
            if (ball.stuck) continue;

            ball.trail.unshift({ x: ball.x, y: ball.y });
            if (ball.trail.length > 13) ball.trail.pop();

            // Subpasos para evitar atravesar ladrillos cuando la bola va rápido.
            const travel = Math.hypot(ball.vx, ball.vy) * dt;
            const steps = Math.max(1, Math.ceil(travel / (ball.r * 0.65)));
            const stepDt = dt / steps;

            for (let step = 0; step < steps; step++) {
                ball.x += ball.vx * stepDt;
                ball.y += ball.vy * stepDt;

                if (ball.x - ball.r <= 0) {
                    ball.x = ball.r;
                    ball.vx = Math.abs(ball.vx);
                    sound(180, 0.025, "sine", 0.012);
                } else if (ball.x + ball.r >= WIDTH) {
                    ball.x = WIDTH - ball.r;
                    ball.vx = -Math.abs(ball.vx);
                    sound(180, 0.025, "sine", 0.012);
                }

                if (ball.y - ball.r <= 58) {
                    ball.y = 58 + ball.r;
                    ball.vy = Math.abs(ball.vy);
                    sound(200, 0.025, "sine", 0.012);
                }

                if (ball.vy > 0 && circleRectangle(ball, paddle)) {
                    ball.y = paddle.y - ball.r - 0.5;
                    const relative = clamp((ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2), -1, 1);
                    const speed = clamp(Math.hypot(ball.vx, ball.vy) * 1.018, 330, CONFIG.maxBallSpeed);
                    const angle = -Math.PI / 2 + relative * 1.05;
                    ball.vx = Math.sin(relative * 1.1) * speed + paddle.vx * 0.12;
                    ball.vy = -Math.abs(Math.cos(angle + Math.PI / 2) * speed);
                    if (Math.abs(ball.vy) < speed * 0.42) ball.vy = -speed * 0.42;
                    if (paddle.magnet > 0) {
                        ball.stuck = true;
                        ball.offset = clamp(ball.x - (paddle.x + paddle.w / 2), -paddle.w / 2 + 12, paddle.w / 2 - 12);
                    }
                    combo = 0;
                    sound(330, 0.045, "triangle", 0.025, 45);
                }

                checkBallBrickCollisions(ball);
            }
        }

        balls = balls.filter(ball => {
            if (ball.y - ball.r <= HEIGHT + 20) return true;

            if (paddle.shield > 0) {
                paddle.shield--;
                ball.y = HEIGHT - 33;
                ball.vy = -Math.abs(ball.vy);
                addParticles(ball.x, HEIGHT - 20, "#74a8ff", 28, 250);
                shake = 5;
                sound(180, 0.18, "sine", 0.04, 450);
                return true;
            }
            return false;
        });

        if (balls.length === 0) loseLife();
    }

    function loseLife() {
        lives--;
        combo = 0;
        shake = 11;
        flash = 0.24;
        sound(190, 0.35, "sawtooth", 0.04, -130);

        if (lives <= 0) {
            saveHighScore();
            state = "gameOver";
            return;
        }

        resetPaddleEffects();
        balls = [createBall()];
        powerUps = [];
        bullets = [];
        addText(WIDTH / 2, HEIGHT / 2, "¡CUIDADO! " + lives + " VIDAS", "#ff6b82", 28);
    }

    function updateObjects(dt) {
        stars.forEach(star => {
            star.y += star.speed * dt;
            if (star.y > HEIGHT) { star.y = 0; star.x = random(0, WIDTH); }
        });

        bricks.forEach(brick => { brick.hit = Math.max(0, brick.hit - dt * 7); });

        particles.forEach(particle => {
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vy += particle.gravity * dt;
            particle.vx *= Math.pow(0.985, dt * 60);
            particle.life -= dt;
        });
        particles = particles.filter(particle => particle.life > 0);

        floatingTexts.forEach(text => {
            text.y -= 42 * dt;
            text.life -= dt;
        });
        floatingTexts = floatingTexts.filter(text => text.life > 0);

        powerUps.forEach(power => {
            power.y += power.vy * dt;
            power.spin += dt * 4;
            if (power.y + power.h >= paddle.y && power.y <= paddle.y + paddle.h &&
                power.x + power.w / 2 >= paddle.x && power.x - power.w / 2 <= paddle.x + paddle.w) {
                power.caught = true;
                applyPowerUp(power.type);
            }
        });
        powerUps = powerUps.filter(power => !power.caught && power.y < HEIGHT + 50);

        bullets.forEach(bullet => {
            bullet.y += bullet.vy * dt;
            checkBulletBricks(bullet);
        });
        bullets = bullets.filter(bullet => !bullet.dead && bullet.y > 55);

        comboTimer -= dt;
        if (comboTimer <= 0) combo = 0;
        shake = Math.max(0, shake - dt * 30);
        flash = Math.max(0, flash - dt);
    }

    function destructibleBricksLeft() {
        return bricks.some(brick => brick.alive && brick.type !== "solid");
    }

    function update(dt) {
        elapsed += dt;
        updateObjects(dt);

        if (state !== "playing") {
            return;
        }

        updatePaddle(dt);
        updateBalls(dt);

        if (!destructibleBricksLeft()) {
            score += 3000;
            saveHighScore();
            state = "victory";
            addParticles(WIDTH / 2, HEIGHT / 2, "#ffd84d", 70, 420);
            sound(520, 0.45, "triangle", 0.055, 600);
        }
    }

    // ---------- DIBUJO ----------
    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, "#07152e");
        gradient.addColorStop(0.55, "#102754");
        gradient.addColorStop(1, "#07101f");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const glow = ctx.createRadialGradient(WIDTH / 2, 250, 20, WIDTH / 2, 250, 500);
        glow.addColorStop(0, "rgba(50,120,255,.15)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        for (const star of stars) {
            ctx.globalAlpha = star.alpha * (0.7 + Math.sin(elapsed * 2 + star.x) * 0.3);
            ctx.fillStyle = "#d8ecff";
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        ctx.globalAlpha = 1;
    }

    function drawHud() {
        ctx.fillStyle = "rgba(3,9,23,.72)";
        ctx.fillRect(0, 0, WIDTH, 58);
        ctx.strokeStyle = "rgba(91,183,255,.3)";
        ctx.beginPath();
        ctx.moveTo(0, 58);
        ctx.lineTo(WIDTH, 58);
        ctx.stroke();

        ctx.textBaseline = "middle";
        ctx.font = "700 17px Arial";
        ctx.fillStyle = "#eaf7ff";
        ctx.textAlign = "left";
        ctx.fillText("PUNTOS  " + score.toLocaleString(), 24, 29);
        ctx.fillStyle = "#86d8ff";
        ctx.fillText("RÉCORD  " + highScore.toLocaleString(), 225, 29);

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd84d";
        ctx.fillText("NIVEL ÚNICO", WIDTH / 2, 29);

        ctx.textAlign = "right";
        ctx.fillStyle = "#ff8094";
        ctx.fillText("VIDAS  " + "●".repeat(Math.max(0, lives)), WIDTH - 120, 29);

        drawSmallButton(WIDTH - 94, 13, 34, 32, state === "paused" ? "▶" : "Ⅱ");
        drawSmallButton(WIDTH - 50, 13, 34, 32, soundEnabled ? "♪" : "×");
    }

    function drawSmallButton(x, y, w, h, label) {
        roundedRect(x, y, w, h, 8);
        ctx.fillStyle = "rgba(255,255,255,.10)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.28)";
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 17px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    }

    function brickColor(brick) {
        if (brick.type === "solid") return ["#53657e", "#b9c9dc"];
        if (brick.type === "explosive") return ["#b82932", "#ff9a3c"];
        const lightness = 42 + (brick.hp / brick.maxHp) * 18;
        return [`hsl(${brick.hue} 78% ${lightness - 12}%)`, `hsl(${brick.hue} 94% ${lightness + 10}%)`];
    }

    function drawBricks() {
        for (const brick of bricks) {
            if (!brick.alive) continue;
            const pulse = brick.hit * 5;
            const colors = brickColor(brick);
            const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.h);
            gradient.addColorStop(0, colors[1]);
            gradient.addColorStop(1, colors[0]);

            ctx.save();
            ctx.shadowColor = colors[1];
            ctx.shadowBlur = 6 + pulse * 2;
            roundedRect(brick.x - pulse / 2, brick.y - pulse / 2, brick.w + pulse, brick.h + pulse, 6);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(255,255,255,.30)";
            ctx.lineWidth = 1.4;
            ctx.stroke();

            if (brick.type === "strong") {
                ctx.fillStyle = "rgba(4,10,22,.7)";
                for (let i = 0; i < brick.hp; i++) {
                    circle(brick.x + brick.w / 2 + (i - (brick.hp - 1) / 2) * 10, brick.y + brick.h / 2, 2.7);
                    ctx.fill();
                }
            } else if (brick.type === "solid") {
                ctx.strokeStyle = "rgba(255,255,255,.5)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(brick.x + 10, brick.y + brick.h - 5);
                ctx.lineTo(brick.x + brick.w - 8, brick.y + 5);
                ctx.stroke();
            } else if (brick.type === "explosive") {
                ctx.fillStyle = "#fff0a5";
                ctx.font = "bold 17px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("✦", brick.x + brick.w / 2, brick.y + brick.h / 2 + 1);
            }
            ctx.restore();
        }
    }

    function drawPaddle() {
        const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
        gradient.addColorStop(0, paddle.laser > 0 ? "#ff7777" : "#70fff0");
        gradient.addColorStop(1, paddle.laser > 0 ? "#b31c36" : "#087c9c");
        ctx.save();
        ctx.shadowColor = paddle.laser > 0 ? "#ff314f" : "#36dfff";
        ctx.shadowBlur = 12 + paddle.glow * 25;
        roundedRect(paddle.x, paddle.y, paddle.w, paddle.h, 9);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.75)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        if (paddle.laser > 0) {
            ctx.fillStyle = "#ffdcdf";
            ctx.fillRect(paddle.x + 8, paddle.y - 7, 8, 10);
            ctx.fillRect(paddle.x + paddle.w - 16, paddle.y - 7, 8, 10);
        }

        if (paddle.shield > 0) {
            ctx.strokeStyle = `rgba(91,164,255,${0.65 + Math.sin(elapsed * 7) * 0.2})`;
            ctx.lineWidth = 5;
            ctx.shadowColor = "#5ba4ff";
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.moveTo(20, HEIGHT - 20);
            ctx.lineTo(WIDTH - 20, HEIGHT - 20);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function drawBalls() {
        for (const ball of balls) {
            ball.trail.forEach((point, index) => {
                const alpha = (1 - index / ball.trail.length) * 0.24;
                circle(point.x, point.y, Math.max(1, ball.r * (1 - index / ball.trail.length)));
                ctx.fillStyle = `rgba(255,110,205,${alpha})`;
                ctx.fill();
            });

            const gradient = ctx.createRadialGradient(ball.x - 3, ball.y - 4, 1, ball.x, ball.y, ball.r + 3);
            gradient.addColorStop(0, "#ffffff");
            gradient.addColorStop(0.28, "#ffcaef");
            gradient.addColorStop(1, "#ef278f");
            ctx.save();
            ctx.shadowColor = "#ff4eaf";
            ctx.shadowBlur = 18;
            circle(ball.x, ball.y, ball.r);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
        }
    }

    function drawPowerUps() {
        for (const power of powerUps) {
            const data = POWER_TYPES[power.type];
            const x = power.x - power.w / 2;
            ctx.save();
            ctx.shadowColor = data.color;
            ctx.shadowBlur = 14;
            roundedRect(x, power.y, power.w, power.h, 7);
            ctx.fillStyle = data.color;
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#061020";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(data.icon, power.x, power.y + power.h / 2 + 1);
            ctx.restore();
        }
    }

    function drawEffects() {
        for (const bullet of bullets) {
            const gradient = ctx.createLinearGradient(0, bullet.y, 0, bullet.y + 22);
            gradient.addColorStop(0, "#ffffff");
            gradient.addColorStop(1, "rgba(255,35,70,0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(bullet.x - 2, bullet.y, 4, 24);
        }

        for (const particle of particles) {
            ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
            ctx.fillStyle = particle.color;
            circle(particle.x, particle.y, particle.size);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        for (const item of floatingTexts) {
            ctx.globalAlpha = clamp(item.life / item.maxLife, 0, 1);
            ctx.fillStyle = item.color;
            ctx.font = `bold ${item.size}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(item.text, item.x, item.y);
        }
        ctx.globalAlpha = 1;

        if (combo >= 2 && comboTimer > 0) {
            ctx.textAlign = "center";
            ctx.fillStyle = combo >= 5 ? "#ffd84d" : "#ff8ddb";
            ctx.font = `900 ${25 + Math.min(combo, 8) * 2}px Arial`;
            ctx.fillText("COMBO ×" + combo, WIDTH / 2, HEIGHT - 100);
        }
    }

    function drawPanel(title, subtitle, buttonText) {
        ctx.fillStyle = "rgba(1,5,16,.72)";
        ctx.fillRect(0, 58, WIDTH, HEIGHT - 58);

        const panelW = 560;
        const panelH = 300;
        const panelX = (WIDTH - panelW) / 2;
        const panelY = 155;
        const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
        gradient.addColorStop(0, "rgba(24,53,105,.96)");
        gradient.addColorStop(1, "rgba(7,18,43,.97)");
        roundedRect(panelX, panelY, panelW, panelH, 25);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = "rgba(99,205,255,.55)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 48px Arial";
        ctx.shadowColor = "#41baff";
        ctx.shadowBlur = 18;
        ctx.fillText(title, WIDTH / 2, panelY + 66);
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#b9d9f5";
        ctx.font = "18px Arial";
        ctx.fillText(subtitle, WIDTH / 2, panelY + 117);

        drawMainButton(WIDTH / 2 - 135, panelY + 155, 270, 58, buttonText);
        ctx.fillStyle = "#769bc0";
        ctx.font = "14px Arial";
        ctx.fillText("Flechas o A/D · Espacio · P pausa · M sonido", WIDTH / 2, panelY + 255);
    }

    function drawMainButton(x, y, w, h, text) {
        const gradient = ctx.createLinearGradient(x, y, x + w, y);
        gradient.addColorStop(0, "#00c6ff");
        gradient.addColorStop(1, "#7a5cff");
        ctx.save();
        ctx.shadowColor = "#27b9ff";
        ctx.shadowBlur = 18;
        roundedRect(x, y, w, h, 15);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + w / 2, y + h / 2 + 1);
    }

    function draw() {
        ctx.save();
        const offsetX = shake > 0 ? random(-shake, shake) : 0;
        const offsetY = shake > 0 ? random(-shake, shake) : 0;
        ctx.translate(offsetX, offsetY);

        drawBackground();
        drawBricks();
        drawPowerUps();
        drawPaddle();
        drawBalls();
        drawEffects();
        drawHud();

        if (state === "menu") {
            drawPanel("BREAKOUT ULTRA", "Un gran nivel, bloques especiales y 7 power-ups", "INICIAR PARTIDA");
        } else if (state === "paused") {
            drawPanel("PAUSA", "La partida está detenida", "CONTINUAR");
        } else if (state === "gameOver") {
            drawPanel("GAME OVER", "Puntaje final: " + score.toLocaleString(), "VOLVER A JUGAR");
        } else if (state === "victory") {
            drawPanel("¡CAMPEÓN!", "Completaste el nivel · " + score.toLocaleString() + " puntos", "JUGAR DE NUEVO");
        } else if (balls.some(ball => ball.stuck)) {
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(255,255,255,.9)";
            ctx.font = "bold 16px Arial";
            ctx.fillText("PRESIONA ESPACIO O HAZ CLIC PARA LANZAR", WIDTH / 2, HEIGHT - 92);
        }

        if (flash > 0) {
            ctx.globalAlpha = flash * 2;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-20, -20, WIDTH + 40, HEIGHT + 40);
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    // ---------- CONTROLES ----------
    function togglePause() {
        if (state === "playing") state = "paused";
        else if (state === "paused") state = "playing";
    }

    function primaryAction() {
        if (state === "menu" || state === "gameOver" || state === "victory") newGame();
        else if (state === "paused") state = "playing";
        else if (state === "playing") {
            if (balls.some(ball => ball.stuck)) launchBalls();
            else shoot();
        }
    }

    document.addEventListener("keydown", event => {
        const key = event.key.toLowerCase();
        if (["arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
        if (key === "arrowleft" || key === "a") keys.left = true;
        if (key === "arrowright" || key === "d") keys.right = true;
        if (key === " " || key === "enter") primaryAction();
        if ((key === "p" || key === "escape") && !event.repeat) togglePause();
        if (key === "r" && !event.repeat) newGame();
        if (key === "m" && !event.repeat) soundEnabled = !soundEnabled;
    });

    document.addEventListener("keyup", event => {
        const key = event.key.toLowerCase();
        if (key === "arrowleft" || key === "a") keys.left = false;
        if (key === "arrowright" || key === "d") keys.right = false;
    });

    canvas.addEventListener("pointermove", event => {
        const point = getCanvasPoint(event);
        pointer.x = point.x;
        pointer.y = point.y;
        pointer.active = true;
    });

    canvas.addEventListener("pointerleave", () => { pointer.active = false; });

    canvas.addEventListener("pointerdown", event => {
        const point = getCanvasPoint(event);
        pointer.x = point.x;
        pointer.y = point.y;
        pointer.active = true;
        canvas.focus();

        if (point.y >= 13 && point.y <= 45 && point.x >= WIDTH - 94 && point.x <= WIDTH - 60) {
            togglePause();
            return;
        }
        if (point.y >= 13 && point.y <= 45 && point.x >= WIDTH - 50 && point.x <= WIDTH - 16) {
            soundEnabled = !soundEnabled;
            return;
        }
        primaryAction();
    });

    // Pausa automática si el jugador cambia de pestaña.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && state === "playing") state = "paused";
    });

    // ---------- CICLO PRINCIPAL ----------
    function gameLoop(now) {
        const dt = Math.min(0.025, Math.max(0, (now - lastTime) / 1000));
        lastTime = now;
        update(dt);
        draw();
        requestAnimationFrame(gameLoop);
    }

    createStars();
    balls = [createBall()];
    requestAnimationFrame(gameLoop);
})();