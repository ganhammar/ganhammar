define((require) => {
    const keysDown = require('../Game/utils/keysDown');

    class Player {
        positionX;
        positionY;
        rotation = 0;
        edgePadding = 30;

        acceleration = 1;
        accelerationInterval = 30;
        minSpeed = 2;
        maxSpeed = 9;

        backingSpeed = 2;

        currentSpeed = 0;
        currentAccelerationFrame = 0;

        onEdge;

        constructor(onEdge) {
            this.onEdge = onEdge;
        }

        update({ width, height }) {
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
                        this.currentSpeed -= this.acceleration * 2;
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
                newPositionX = this.positionX + Math.round(Math.cos(phi) * this.currentSpeed);
                newPositionY = this.positionY + Math.round(Math.sin(phi) * this.currentSpeed);
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

            this.onEdge({
                isPushingUp,
                isPushingDown,
                isPushingLeft,
                isPushingRight,
                speed: this.currentSpeed,
            });
        }

        render(context, { width, height }) {
            const playerWidth = 32;
            const playerHeight = 48;
            const thrusterHeight = 10;

            if (!this.positionY && !this.positionX) {
                this.positionX = width / 2;
                this.positionY = height / 2;
            }

            context.save();

            const player = new Path2D();
            player.moveTo(this.positionX - (playerWidth / 2), this.positionY + ((playerHeight - thrusterHeight) / 2));
            player.lineTo(this.positionX, this.positionY - ((playerHeight - thrusterHeight) / 2));
            player.lineTo(this.positionX + (playerWidth / 2), this.positionY + ((playerHeight - thrusterHeight) / 2));

            // Right Thruster
            player.lineTo(this.positionX + (playerWidth / 2) - 6, this.positionY + ((playerHeight - thrusterHeight) / 2));
            player.lineTo(this.positionX + (playerWidth / 2) - 4, this.positionY + (playerHeight / 2));
            player.lineTo(this.positionX + (playerWidth / 2) - 12, this.positionY + (playerHeight / 2));
            player.lineTo(this.positionX + (playerWidth / 2) - 10, this.positionY + ((playerHeight - thrusterHeight) / 2));

            player.lineTo(this.positionX - (playerWidth / 2) + 10, this.positionY + ((playerHeight - thrusterHeight) / 2));

            // Left Thruster
            player.lineTo(this.positionX - (playerWidth / 2) + 12, this.positionY + (playerHeight / 2));
            player.lineTo(this.positionX - (playerWidth / 2) + 4, this.positionY + (playerHeight / 2));
            player.lineTo(this.positionX - (playerWidth / 2) + 6, this.positionY + ((playerHeight - thrusterHeight) / 2));
            player.lineTo(this.positionX - (playerWidth / 2), this.positionY + ((playerHeight - thrusterHeight) / 2));

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
                drawFlame(this.positionX + (playerWidth / 2) - 12, this.positionY + (playerHeight / 2), 8);
                drawFlame(this.positionX - (playerWidth / 2) + 4, this.positionY + (playerHeight / 2), 8);
            }

            // Rotation
            context.translate(this.positionX, this.positionY);
            context.rotate(this.rotation * (Math.PI / 180));
            context.translate(-this.positionX, -this.positionY);
            context.stroke(player);

            context.restore();
        }
    }

    return Player;
});
