define(() => {
    class LoadingCircle {
        opacity;
        direction;
        positionX;
        positionY;
        radius;

        constructor(initialOpacity, initialDirection, positionX, positionY, radius) {
            this.opacity = initialOpacity;
            this.direction = initialDirection;
            this.positionX = positionX;
            this.positionY = positionY;
            this.radius = radius;
        }

        update() {
            if (this.direction === 'out') {
                if (this.opacity > 0) {
                    this.opacity -= 2;
                } else {
                    this.direction = 'in';
                }
            } else {
                if (this.opacity < 100) {
                    this.opacity += 2;
                } else {
                    this.direction = 'out';
                }
            }
        }

        render(context) {
            context.beginPath();
            context.arc(this.positionX, this.positionY, this.radius, 0, 2 * Math.PI, false);
            context.fillStyle = '#f9f9f9';
            context.globalAlpha = this.opacity / 100;
            context.fill();
            context.globalAlpha = 1;
        }
    }

    return LoadingCircle;
});