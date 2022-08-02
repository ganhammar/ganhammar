define((require) => {
    const keysDown = require('../Game/utils/keysDown');

    class Player {
        positionX;
        positionY;
        rotation = 0;
        edgePadding = 300;

        playerWidth = 32;
        playerHeight = 48;
        thrusterHeight = 10;

        fuelMax = 100;
        fuel = 67;
        fuelConsumption = 0.06;

        closeToPlanet;
        reFuelingSpeed = 0.2;

        acceleration = 1;
        accelerationInterval = 30;
        minSpeed = 2;
        maxSpeed = 15;

        backingSpeed = 2;

        currentSpeed = 0;
        currentAccelerationFrame = 0;

        isGameOver = false;
        gameOverRadius = 1;
        maxGameOverRadius = 300;
        gameOverAlpha = 100;

        onEdge;
        onProbe;

        constructor(onEdge, onProbe, onExit) {
            this.onEdge = onEdge;
            this.onProbe = onProbe;
            this.onExit = onExit;
        }

        update({ width, height }) {
            if (this.isGameOver) {
                if (this.gameOverRadius >= this.maxGameOverRadius) {
                    this.onExit();
                }
                this.gameOverRadius += Math.ceil(this.gameOverRadius / 10);
                this.gameOverAlpha = 100 - (this.gameOverRadius / this.maxGameOverRadius) * 100;
                return;
            }

            if (keysDown.ArrowLeft) {
                this.rotation = this.rotation - 1 > 0 ? this.rotation - 2 : 360;
            } else if (keysDown.ArrowRight) {
                this.rotation = this.rotation + 1 <= 360 ? this.rotation + 2 : 0;
            }

            let newPositionX = this.positionX;
            let newPositionY = this.positionY;
            let isPushingUp = false;
            let isPushingDown = false;
            let isPushingLeft = false;
            let isPushingRight = false;

            if (keysDown.ArrowUp || (this.currentSpeed > 0 && !keysDown.ArrowDown)) {
                if (!keysDown.ArrowUp) {
                    if (this.currentAccelerationFrame >= this.accelerationInterval) {
                        this.currentAccelerationFrame = 0;
                        this.currentSpeed -= this.acceleration;
                    } else {
                        this.currentAccelerationFrame += 2;
                    }
                } else if (this.currentSpeed < this.maxSpeed) {
                    if (this.currentSpeed === 0) {
                        this.currentSpeed += this.minSpeed;
                    } else if (this.currentAccelerationFrame >= this.accelerationInterval) {
                        this.currentAccelerationFrame = 0;
                        this.currentSpeed = this.currentSpeed + this.acceleration < this.maxSpeed
                            ? this.currentSpeed + this.acceleration
                            : this.maxSpeed;
                    } else {
                        this.currentAccelerationFrame += 1;
                    }
                }

                const phi = (this.rotation - 90) * (Math.PI / 180);
                newPositionX = this.positionX + (Math.cos(phi) * this.currentSpeed);
                newPositionY = this.positionY + (Math.sin(phi) * this.currentSpeed);
            } else if (keysDown.ArrowDown) {
                newPositionY = this.positionY + 1;
            } else {
                this.currentAccelerationFrame = 0;
                this.currentSpeed = 0;
            }

            if (newPositionX <= this.edgePadding) {
                this.positionX = this.edgePadding;
                isPushingLeft = true;
            } else if (newPositionX >= width - this.edgePadding) {
                this.positionX = width - this.edgePadding;
                isPushingRight = true;
            } else {
                this.positionX = newPositionX;
            }

            if (newPositionY <= this.edgePadding) {
                this.positionY = this.edgePadding;
                isPushingUp = true;
            } else if (newPositionY >= height - this.edgePadding) {
                this.positionY = height - this.edgePadding;
                isPushingDown = true;
            } else {
                this.positionY = newPositionY;
            }

            if (keysDown.ArrowUp) {
                this.fuel -= this.fuelConsumption;
            }

            if (keysDown.d && this.closeToPlanet && this.closeToPlanet.probed === false) {
                this.onProbe(this.closeToPlanet);
            }

            if (keysDown.e && this.closeToPlanet && this.closeToPlanet.fuel > 0) {
                this.closeToPlanet.fuel -= this.reFuelingSpeed;
                this.fuel += this.reFuelingSpeed;
            }

            this.onEdge({
                isPushingUp,
                isPushingDown,
                isPushingLeft,
                isPushingRight,
                speed: this.currentSpeed,
            });
        }

        render(context, { width, height }) {
            // Fuel Meter
            context.save();

            // Text
            context.fillStyle = '#f9f9f9';
            context.font = `30px Anton`;
            context.textAlign = 'right';
            context.textBaseline = 'top';
            context.fillText(Math.round(this.fuel), width - 30, 30);

            // Drop
            const dropShadow = new Path2D('M38.489,64.981c-1.657,0-3-1.343-3-3s1.343-3,3-3c5.616,0,10.186-4.567,10.186-10.183c0-1.657,1.343-3,3-3c1.656,0,3,1.343,3,3C54.674,57.721,47.413,64.981,38.489,64.981z');
            const drop = new Path2D('M38.489,76.977c-15.54,0-28.183-12.643-28.183-28.182c0-14.53,23.185-44.307,25.828-47.654C36.703,0.421,37.571,0,38.488,0c0.917,0,1.785,0.42,2.354,1.141c2.644,3.348,25.828,33.124,25.828,47.654C66.671,64.334,54.029,76.977,38.489,76.977zM38.489,7.917c-7.847,10.409-22.183,31.389-22.183,40.878c0,12.231,9.951,22.182,22.183,22.182s22.183-9.95,22.183-22.182C60.671,39.306,46.335,18.326,38.489,7.917z');
            drop.addPath(dropShadow);
            context.translate(width - 105, 26);
            context.scale(0.38, 0.38);
            context.fill(drop);

            context.restore();

            if (this.isGameOver) {
                context.save();
                context.beginPath();
                context.arc(this.positionX, this.positionY, this.gameOverRadius, 0, 2 * Math.PI, false);
                context.globalAlpha = this.gameOverAlpha / 100;
                context.fillStyle = '#f9f9f9';
                context.fill();
                context.restore();
                return;
            }

            if (!this.positionY && !this.positionX) {
                this.positionX = width / 2;
                this.positionY = height / 2;
            }

            context.save();

            const player = new Path2D();
            player.moveTo(this.positionX - (this.playerWidth / 2), this.positionY + ((this.playerHeight - this.thrusterHeight) / 2));
            player.lineTo(this.positionX, this.positionY - ((this.playerHeight - this.thrusterHeight) / 2));
            player.lineTo(this.positionX + (this.playerWidth / 2), this.positionY + ((this.playerHeight - this.thrusterHeight) / 2));

            // Right Thruster
            player.lineTo(this.positionX + (this.playerWidth / 2) - 6, this.positionY + ((this.playerHeight - this.thrusterHeight) / 2));
            player.lineTo(this.positionX + (this.playerWidth / 2) - 4, this.positionY + (this.playerHeight / 2));
            player.lineTo(this.positionX + (this.playerWidth / 2) - 12, this.positionY + (this.playerHeight / 2));
            player.lineTo(this.positionX + (this.playerWidth / 2) - 10, this.positionY + ((this.playerHeight - this.thrusterHeight) / 2));

            player.lineTo(this.positionX - (this.playerWidth / 2) + 10, this.positionY + ((this.playerHeight - this.thrusterHeight) / 2));

            // Left Thruster
            player.lineTo(this.positionX - (this.playerWidth / 2) + 12, this.positionY + (this.playerHeight / 2));
            player.lineTo(this.positionX - (this.playerWidth / 2) + 4, this.positionY + (this.playerHeight / 2));
            player.lineTo(this.positionX - (this.playerWidth / 2) + 6, this.positionY + ((this.playerHeight - this.thrusterHeight) / 2));
            player.lineTo(this.positionX - (this.playerWidth / 2), this.positionY + ((this.playerHeight - this.thrusterHeight) / 2));

            // Flame
            if (keysDown.ArrowUp) {
                const drawFlame = (startX, startY, thrusterWidth) => {
                    const flameHeight = Math.floor(Math.random() * 3) + 9;
                    const thrusterOffset = 2;

                    player.moveTo(startX + thrusterOffset, startY);
                    player.lineTo(startX + thrusterOffset - 2, startY + flameHeight - 3);
                    player.lineTo(startX + thrusterOffset, startY + flameHeight - 4);
                    player.lineTo(startX + (thrusterWidth / 2), startY + flameHeight);
                    player.lineTo(startX + thrusterWidth - 2, startY + flameHeight - 4);
                    player.lineTo(startX + thrusterWidth, startY + flameHeight - 3);
                    player.lineTo(startX + thrusterWidth - thrusterOffset, startY);
                }
                drawFlame(this.positionX + (this.playerWidth / 2) - 12, this.positionY + (this.playerHeight / 2), 8);
                drawFlame(this.positionX - (this.playerWidth / 2) + 4, this.positionY + (this.playerHeight / 2), 8);
            }

            // Rotation
            context.translate(this.positionX, this.positionY);
            context.rotate(this.rotation * (Math.PI / 180));
            context.translate(-this.positionX, -this.positionY);
            context.stroke(player);

            context.restore();

            // Planet Interaction
            if (this.closeToPlanet) {
                context.save();
    
                context.fillStyle = '#f9f9f9';
                context.font = `25px Anton`;
                context.textAlign = 'middle';
                context.textBaseline = 'bottom';
                context.fillText(`Planet ${this.closeToPlanet.coordinateX}.${this.closeToPlanet.coordinateY}`, width / 2, height - 250);

                context.font = `20px Anton`;
                context.fillText(this.closeToPlanet.probed ? 'Probe Launched' : 'Press "D" To Launch Probe', width / 2, height - 220);

                if (this.closeToPlanet.fuel > 0) {
                    context.font = `20px Anton`;
                    context.fillText('Hydrogen Found, Hold Down "E" To Re-Fuel', width / 2, height - 190);
                }

                context.restore();
            }
        }
    }

    return Player;
});
