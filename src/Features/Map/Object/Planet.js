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
            this.setPosition();
        }

        isInside(x, y) {
            const pointX = x - this.map.minX();
            const pointY = y - this.map.minY();

            return this.positionX <= pointX && this.positionX + (this.radius * 2) >= pointX
                && this.positionY <= pointY && this.positionY + (this.radius * 2) >= pointY;
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
            context.arc(this.positionX, this.positionY, this.radius, 0, 2 * Math.PI, false);
            context.stroke();
        }
    }

    return Planet;
})