define(() => {
    class Planet {
        coordinateX;
        coordinateY;
        map;
        positionX;
        positionY;
        radius;
        atmosphereRadius = 50;
        maxRadius = 200;
        minRadius = 50;
        fuel = Math.ceil(Math.random() * 15) + 5;
        probed = false;

        constructor(coordinateX, coordinateY, map) {
            this.coordinateX = coordinateX;
            this.coordinateY = coordinateY;
            this.map = map;
            this.radius = Math.floor(Math.random() * (this.maxRadius - this.minRadius)) + this.minRadius;
            this.setPosition();
        }

        width() {
            return (this.radius + this.atmosphereRadius) * 2;
        }

        centerX() {
            return this.positionX + this.atmosphereRadius + this.radius;
        }

        centerY() {
            return this.positionY + this.atmosphereRadius + this.radius;
        }

        isInside(x, y) {
            return this.coordinateX <= x && this.coordinateX + this.width() >= x
                && this.coordinateY <= y && this.coordinateY + this.width() >= y;
        }

        isPositionCollision(x, y) {
            return Math.pow(x - this.centerX(), 2) + Math.pow(y - this.centerY(), 2) < Math.pow(this.radius, 2);
        }

        isPositionInAtmosphere(x, y) {
            return Math.pow(x - this.centerX(), 2) + Math.pow(y - this.centerY(), 2) < Math.pow(this.radius + this.atmosphereRadius, 2);
        }

        update() {
            this.setPosition();
        }

        setPosition() {
            this.positionX = this.coordinateX - this.map.minX();
            this.positionY = this.coordinateY - this.map.minY();
        }

        render(context) {
            context.save();
            context.beginPath();
            context.arc(this.centerX(), this.centerY(), this.radius, 0, 2 * Math.PI, false);
            context.lineWidth = 3;
            context.stroke();
            context.restore();
        }
    }

    return Planet;
});
