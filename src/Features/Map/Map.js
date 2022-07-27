define((require) => {
    const Planet = require('./Object/Planet');

    class Map {
        size = 1000000;
        squareSize = 10;
        map = {};

        positionX = this.size / 2;
        positionY = this.size / 2;

        objectMaxRadius = 200;
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

            for (let x = minX; x <= maxX; x++) {
                if (!this.map[x]) {
                    this.map[x] = {};
                }

                for (let y = minY; y <= maxY; y++) {
                    if (this.map[x][y] !== undefined) {
                        continue;
                    }

                    let obj;
                    const possiblePlanet = new Planet(x * this.squareSize, y * this.squareSize, this);
                    const possibleIntersections = Math.ceil((possiblePlanet.radius * 2) / this.squareSize);

                    possibleIntersectionLoop:
                    for (let px = 0; px <= possibleIntersections; px++) {
                        for (let py = 0; py <= possibleIntersections; py++) {
                            const above = (this.map[x + px - 1] ?? [])[y + py];
                            const left = ((this.map[x + px] ?? [])[y + py - 1]);
                            const below = ((this.map[x + px + 1] ?? [])[y + py]);
                            const right = ((this.map[x + px] ?? [])[y + py + 1]);

                            const aboveIsInside = above?.isInside((x + px) * this.squareSize, (y + py) * this.squareSize);
                            const leftIsInside = left?.isInside((x + px) * this.squareSize, (y + py) * this.squareSize);
                            const belowIsInside = below?.isInside((x + px) * this.squareSize, (y + py) * this.squareSize);
                            const rightIsInside = right?.isInside((x + px) * this.squareSize, (y + py) * this.squareSize);

                            if (aboveIsInside === true) {
                                obj = above;
                            } else if (leftIsInside === true) {
                                obj = left;
                            } else if (rightIsInside === true) {
                                obj == right;
                            } else if (belowIsInside === true) {
                                obj = below;
                            }
    
                            if (obj) {
                                break possibleIntersectionLoop;
                            }
                        }
                    }

                    // for (let possibleIntersection = -1; possibleIntersection <= possibleIntersections + 1; possibleIntersection++) {
                    //     const iy = y + possibleIntersection;
                    //     const ix = x + possibleIntersection;

                    //     const above = (this.map[x - 1] ?? [])[iy]; // Above
                    //     const left = (this.map[ix] ?? [])[y - 1] // Left
                    //     const below = (this.map[x + possibleIntersections + 1] ?? [])[iy] // Below
                    //     const right = (this.map[ix] ?? [])[y + possibleIntersections + 1] // Right

                    //     const aboveIsInside = above?.isInside(x * this.squareSize, iy * this.squareSize)
                    //     const leftIsInside = left?.isInside(ix * this.squareSize, y * this.squareSize)
                    //     const belowIsInside = below?.isInside((x + possibleIntersections) * this.squareSize, iy * this.squareSize)
                    //     const rightIsInside = right?.isInside(ix * this.squareSize, (y + possibleIntersections) * this.squareSize);

                    //     if (aboveIsInside === true) {
                    //         obj = above;
                    //     } else if (leftIsInside === true) {
                    //         obj = left;
                    //     } else if (rightIsInside === true) {
                    //         obj == right;
                    //     } else if (belowIsInside === true) {
                    //         obj = below;
                    //     }

                    //     if (obj) {
                    //         break;
                    //     }
                    // }

                    if (obj) {
                        this.map[x][y] = obj;
                    } else if (Math.floor(Math.random() * 300) === 0) {
                        this.map[x][y] = possiblePlanet;
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
