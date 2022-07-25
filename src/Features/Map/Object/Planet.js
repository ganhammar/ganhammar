define(() => {
    class Planet {
        coordinateX;
        coordinateY;
        map;
        positionX;
        positionY;
        radius;

        constructor(coordinateX, coordinateY, map) {
            this.coordinateX = coordinateX;
            this.coordinateY = coordinateY;
            this.map = map;
            this.radius = Math.floor(Math.random() * 150) + 50;
        }

        isInside(x, y) {
            return this.positionX <= x && this.positionX + (this.radius * 2) >= x
                && this.positionY <= y && this.positionY + (this.radius * 2) >= y;
        }

        update() {
            this.positionX = this.coordinateX - this.map.minX();
            this.positionY = this.coordinateY - this.map.minY();
        }

        render(context) {
            context.beginPath();
            context.arc(this.positionX, this.positionY, this.radius, 0, 2 * Math.PI, false);
            context.stroke();
        }
    }

    return Planet;
})