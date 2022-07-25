define((require) => {
    const Player = require('../Player/Player');

    class Scene {
        engine;
        onExit;
        map;

        constructor(engine, map, onExit) {
            this.engine = engine;
            this.map = map;
            this.onExit = onExit;

            this.engine.addEntity(new Player(this.handleMapMove.bind(this)));
            console.log(this.map.getVisibleObjects());
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
            }
        }
    }

    return Scene;
});
