define((require) => {
    const Player = require('../Player/Player');
    const Planet = require('../Map/Object/Planet');

    class Scene {
        engine;
        onExit;
        map;
        player;

        constructor(engine, map, onExit) {
            this.engine = engine;
            this.map = map;
            this.onExit = onExit;

            this.player = new Player(this.handleMapMove.bind(this));
            this.updateEntities();
        }

        updateEntities() {
            this.engine.clearEntities();
            this.engine.addEntity(this.player);
            this.map.getVisibleObjects()
                .forEach((obj) => this.engine.addEntity(obj));
        }

        handleMapMove({ isPushingUp, isPushingDown, isPushingLeft, isPushingRight, speed }) {
            let x = 0;
            let y = 0;

            if (isPushingUp) {
                y -= speed;
            } else if (isPushingDown) {
                y += speed;
            }

            if (isPushingLeft) {
                x -= speed;
            } else if (isPushingRight) {
                x += speed;
            }

            if (x !== 0 || y !== 0) {
                this.map.moveBy(x, y);
                this.updateEntities();
            }
        }
    }

    return Scene;
});
