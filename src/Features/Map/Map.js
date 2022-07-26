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
            const minX = Math.floor(this.minX() / this.squareSize);
            const minY = Math.floor(this.minY() / this.squareSize);
            const maxX = Math.ceil(this.maxX() / this.squareSize);
            const maxY = Math.ceil(this.maxY() / this.squareSize);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    const obj = this.map[x][y];

                    if (obj && obj.coordinateX === x * this.squareSize && obj.coordinateY === y * this.squareSize) {
                        objects.push(obj);
                    }
                }
            }

            return objects;
        }

        generateVisibleMap() {
            const minX = Math.floor(this.minX() / this.squareSize);
            const minY = Math.floor(this.minY() / this.squareSize);
            const maxX = Math.ceil(this.maxX() / this.squareSize);
            const maxY = Math.ceil(this.maxY() / this.squareSize);

            for (let x = minX; x <= maxX; x++) {
                if (!this.map[x]) {
                    this.map[x] = Array(this.size);
                }

                for (let y = minY; y <= maxY; y++) {
                    const previousPoint = this.map[x][y - 1]; // Directly to the right
                    const previousPointIsInside = previousPoint?.isInside(x * this.squareSize, y * this.squareSize);

                    if (Math.floor(Math.random() * 10) !== 0 || previousPointIsInside === true) {
                        continue;
                    }

                    let planet = new Planet(x * this.squareSize, y * this.squareSize, this);
                    const possibleIntersections = Math.ceil((planet.radius * 2) / this.squareSize);

                    for (let possibleIntersection = 0; possibleIntersection < possibleIntersections; possibleIntersection++) {
                        const iy = x + possibleIntersection;
                        const point = (this.map[x - 1] ?? [])[iy]; // Above
                        let isInside = point?.isInside((x - 1) * this.squareSize, iy * this.squareSize);

                        if (isInside) {
                            planet = point;
                            break;
                        }
                    }

                    this.map[x][y] = planet;
                }
            }
        }

        position() {
            return { x: this.positionX, y: this.positionY };
        }
    }

    return Map;
});
