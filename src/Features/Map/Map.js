define(() => {
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

            this.positionX = positionX;
            this.positionY = positionY;
            this.generateVisibleMap();
        }

        generateVisibleMap() {
            const startX = this.positionX - Math.floor(this.visibleWidth / 2);
            const startY = this.positionY - Math.floor(this.visibleHeight / 2);
            const endX = startX + this.visibleWidth;
            const endY = startY + this.visibleHeight;

            for (let x = startX; x <= endX; x++) {
                if (!this.map[x]) {
                    this.map[x] = Array(this.size);
                }

                for (let y = startY; y <= endY; y++) {
                    const previousPoint = this.map[x - 1][y - 1];

                    if (Math.floor(Math.random() * 10) === 0) {
                        this.map[x][y] = 'Thing';
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
