const MAX_CONFETTI_COUNT = 1000;
const CONFETTI_SIZE = 5;
const MAX_BALLOONS = 10;

let balloonManager;
let confettiExplosions = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    balloonManager = new BalloonManager(MAX_BALLOONS);
}

function draw() {
    background(51);
    // Can be used to give happy birthday text static color.
    // stroke();
    textAlign(CENTER, CENTER);
    textSize(50);
    text('HAPPY BIRTHDAY MANDY !', windowWidth / 2, windowHeight / 2);

    balloonManager.run();

    for (let i = confettiExplosions.length - 1; i >= 0; i--) {
        explosion = confettiExplosions[i];
        explosion.run();
        if (explosion.isDone()) {
            confettiExplosions.splice(i, 1);
        }
    }
}

function mouseClicked() {
    explosion = new ConfettiExplosion(mouseX, mouseY);
    explosion.packConfetti(100, 3);
    confettiExplosions.push(explosion);
}

function getRandomColor() {
    return color(random(255), random(255), random(255));
}

class CanvasEntity {
    constructor(location) {
        if (this.show === undefined) {
            throw new TypeError('Method show() must be defined.');
        }

        if (this.update === undefined) {
            throw new TypeError('Method update() must be defined.');
        }

        this.location = location;
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    inFrame() {
        return (0 <= this.location.x && this.location.x <= width) &&
            (0 <= this.location.y && this.location.y <= height);
    }
}

class Balloon extends CanvasEntity {
    constructor(location, color, size = 75, hasString = true) {
        super(location);
        this.color = color;
        this.size = size;
        this.stringOptions = new StringOptions();
        this.seen = false;
    }

    show() {
        fill(this.color);
        noStroke();
        ellipse(this.location.x, this.location.y, this.size / 2.0, this.size);

        if (this.stringOptions.hasString) {
            stroke(255);
            let radius = this.size / 2;
            line(this.location.x,
                this.location.y + radius,
                this.location.x,
                this.location.y + radius + this.stringOptions.stringLength);
        }
    }

    update() {
        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.velocity.mult(0.95);
        this.acceleration.mult(0);
    }
}

class StringOptions {
    constructor(hasString = true, stringLength = 50) {
        this.hasString = hasString;
        this.stringLength = stringLength;
    }
}

class BalloonManager {
    constructor(maxBalloons = 10) {
        this.balloons = [];
        this.maxBalloons = maxBalloons;
    }

    generateBalloon() {
        let balloon = new Balloon(
            createVector(random(0, width), random(height + 10, height + 300)),
            getRandomColor());
        balloon.stringOptions.stringLength = 100;
        this.balloons.push(balloon);
    }

    run() {
        if (this.balloons.length < this.maxBalloons) {
            this.generateBalloon();
        }

        for (let i = this.balloons.length - 1; i >= 0; i--) {
            let balloon = this.balloons[i];
            balloon.applyForce(createVector(0, random(-0.1, -0.2)));
            balloon.show();
            balloon.update();

            if (balloon.inFrame()) {
                balloon.seen = true;
            }

            // Remove the balloon if its no longer visible after it has become visible.
            if (!balloon.inFrame() && balloon.seen) {
                console.log('Balloon Removed');
                this.balloons.splice(i, 1);
            }
        }
    }
}

class ConfettiParticle extends CanvasEntity {
    constructor(location, size, color, lifespan = 255.0, decay = 5.0) {
        super(location);
        this.size = size;
        this.color = color;
        this.lifespan = lifespan;
        this.decay = decay;
    }

    isDead() {
        return this.lifespan <= 0;
    }

    show() {
        fill(this.color);
        noStroke();
        rect(this.location.x, this.location.y, this.size, this.size);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.velocity.mult(0.95);
        this.acceleration.mult(0);
        this.lifespan -= this.decay;
    }
}

class ConfettiExplosion {
    constructor(xPosition, yPosition, gravity = createVector(0, 0.2)) {
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.gravity = gravity;
        this.confettiParticles = [];
    }

    // TODO: Allow for more flexible color choices.
    packConfetti(count, size) {
        for (let i = 0; i < count; i++) {
            let particle = new ConfettiParticle(
                createVector(this.xPosition, this.yPosition),
                size,
                getRandomColor());
            particle.velocity = createVector(random(-5, 5), random(-5, 5));
            this.confettiParticles.push(particle);
        }
    }

    isDone() {
        return this.confettiParticles.length == 0;
    }

    run() {
        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            let particle = this.confettiParticles[i];
            particle.applyForce(this.gravity);
            particle.show();
            particle.update();

            // Remove the particle from the explosion if its no longer visible.
            if (!particle.inFrame()) {
                this.confettiParticles.splice(i, 1);
            }
        }
    }
}