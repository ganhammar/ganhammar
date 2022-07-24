define(() => {
    class Map {
        map;
        size = 10000;

        positionX = this.size / 2;
        positionY = this.size / 2;

        constructor() {
            this.create();
        }

        create() {
            const map = [];

            for (let i = 0; i < this.size; i++) {
                map[i] = Array(this.size);
            }

            this.map = map;
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
        }

        position() {
            return { x: this.positionX, y: this.positionY };
        }
    }

    return Map;
});
