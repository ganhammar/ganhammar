define(() => {
    class Planet {
        coordinateX;
        coordinateY;
        map;
        positionX;
        positionY;
        radius;
        maxRadius = 200;
        minRadius = 50;

        constructor(coordinateX, coordinateY, map) {
            this.coordinateX = coordinateX;
            this.coordinateY = coordinateY;
            this.map = map;
            this.radius = Math.floor(Math.random() * (this.maxRadius - this.minRadius)) + this.minRadius;
            this.setPosition();
        }

        isInside(x, y) {
            return this.coordinateX <= x && this.coordinateX + (this.radius * 2) >= x
                && this.coordinateY <= y && this.coordinateY + (this.radius * 2) >= y;
        }

        isPositionCollision(x, y) {
            const centerX = this.positionX + this.radius;
            const centerY = this.positionY + this.radius;

            return Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) < Math.pow(this.radius, 2);
        }

        update() {
            this.setPosition();
        }

        setPosition() {
            this.positionX = this.coordinateX - this.map.minX();
            this.positionY = this.coordinateY - this.map.minY();
        }

        render(context) {
            context.beginPath();
            context.arc(this.positionX + this.radius, this.positionY + this.radius, this.radius, 0, 2 * Math.PI, false);
            context.stroke();
        }
    }

    return Planet;
});
