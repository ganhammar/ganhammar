define((require) => {
    const Planet = require('./Object/Planet');

    class Map {
        size = 1000000;
        squareSize = 20;
        map = {};

        positionX = this.size / 2;
        positionY = this.size / 2;

        objectMaxRadius = 200;
        visibleWidth;
        visibleHeight;

        hasGeneratedObject = false;
        initialProbability = 1000;
        objectProbability = 4000;

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
            const minX = Math.floor((this.minX() - (this.objectMaxRadius * 2)) / this.squareSize);
            const maxX = Math.ceil(this.maxX() / this.squareSize);
            const minY = Math.floor((this.minY() - (this.objectMaxRadius * 2)) / this.squareSize);
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
            const minX = Math.floor((this.minX() - (this.objectMaxRadius * 2)) / this.squareSize);
            const maxX = Math.ceil(this.maxX() / this.squareSize);
            const minY = Math.floor((this.minY() - (this.objectMaxRadius * 2)) / this.squareSize);
            const maxY = Math.ceil(this.maxY() / this.squareSize);
            
            const center = (this.size / 2) / this.squareSize;

            for (let x = minX; x <= maxX; x++) {
                if (!this.map[x]) {
                    this.map[x] = {};
                }

                for (let y = minY; y <= maxY; y++) {
                    if (this.map[x][y] !== undefined) {
                        continue;
                    }

                    const possiblePlanet = new Planet(x * this.squareSize, y * this.squareSize, this);
                    const possibleIntersections = Math.ceil(possiblePlanet.width() / this.squareSize);

                    if (x >= center - possibleIntersections && x <= center + possibleIntersections
                        && y >= center - possibleIntersections && y <= center + possibleIntersections) {
                        this.map[x][y] = null;
                        continue;
                    }

                    let isInside = false;

                    for (let possibleIntersection = -1; possibleIntersection <= possibleIntersections + 1; possibleIntersection++) {
                        const iy = y + possibleIntersection;
                        const ix = x + possibleIntersection;

                        const above = (this.map[x - 1] ?? {})[iy]; // Above
                        const left = (this.map[ix] ?? {})[y - 1] // Left
                        const below = (this.map[x + possibleIntersections + 1] ?? {})[iy] // Below
                        const right = (this.map[ix] ?? {})[y + possibleIntersections + 1] // Right

                        isInside = above?.isInside(x * this.squareSize, iy * this.squareSize) === true
                            || left?.isInside(ix * this.squareSize, y * this.squareSize) === true
                            || below?.isInside((x + possibleIntersections) * this.squareSize, iy * this.squareSize) === true
                            || right?.isInside(ix * this.squareSize, (y + possibleIntersections) * this.squareSize) === true;

                        if (isInside) {
                            break;
                        }
                    }

                    const probability = this.hasGeneratedObject === false ? this.initialProbability : this.objectProbability;
                    if (!isInside && Math.floor(Math.random() * probability) === 0) {
                        this.hasGeneratedObject = true;

                        for (let ix = 0; ix < possibleIntersections; ix++) {
                            for (let iy = 0; iy < possibleIntersections; iy++) {
                                if (!this.map[x + ix]) {
                                    this.map[x + ix] = {};
                                }

                                this.map[x + ix][y + iy] = possiblePlanet;
                            }
                        }
                    } else {
                        this.map[x][y] = null;
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
