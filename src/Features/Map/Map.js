define((require) => {
    const Planet = require('./Object/Planet');

    class Map {
        size = 10000;
        squareSize = 10;
        map = Array(this.size);

        positionX = this.size / 2;
        positionY = this.size / 2;

        visibleWidth;
        visibleHeight;

        constructor({ width, height }) {
            this.visibleWidth = width;
            this.visibleHeight = height;
            this.generateVisibleMap();
        }

        minX() { return this.positionX - Math.floor(this.visibleWidth / 2); }
        minY() { return this.positionY - Math.floor(this.visibleHeight / 2); }
        maxX() { return this.minX() + this.visibleWidth; }
        maxY() { return this.minY() + this.visibleHeight; }

        moveBy(x, y) {
            let positionX = this.positionX + x;
            let positionY = this.positionY + y;

            if (positionX > this.size) {
                positionX = 0;
            } else if (positionX < 0) {
                positionX = this.size;
            }

            if (positionY > this.size) {
                positionY = 0;
            } else if (positionY < 0) {
                positionY = this.size;
            }

            if (this.positionX !== positionX || this.positionY !== positionY) {
                this.positionX = positionX;
                this.positionY = positionY;
                this.generateVisibleMap();
            }
        }

        getVisibleObjects() {
            const objects = [];
            const minX = this.minX();
            const minY = this.minY();
            const maxX = this.maxX();
            const maxY = this.maxY();

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const obj = this.map[x][y];

                    if (obj && obj.coordinateX === x && obj.coordinateY === y) {
                        objects.push(obj);
                    }
                }
            }

            return objects;
        }

        generateVisibleMap() {
            const minX = this.minX();
            const minY = this.minY();
            const maxX = this.maxX();
            const maxY = this.maxY();

            for (let x = minX; x <= maxX; x++) {
                if (!this.map[x]) {
                    this.map[x] = Array(this.size);
                }

                for (let y = minY; y <= maxY; y++) {
                    const previousPoint = (this.map[x - 1] ?? [])[y - 1];

                    if (!previousPoint && Math.floor(Math.random() * 10) === 0) {
                        this.map[x][y] = new Planet(x, y, this);
                    } else if (previousPoint?.isInside(x, y) === true) {
                        this.map[x][y] = previousPoint;
                    }
                }
            }
        }

        position() {
            return { x: this.positionX, y: this.positionY };
        }
    }

    return Map;
});
