define((require) => {
    const Player = require('../Player/Player');

    class Scene {
        engine;
        onExit;

        constructor(engine, onExit) {
            this.engine = engine;
            this.onExit = onExit;

            this.engine.addEntity(new Player(({ isPushingUp, isPushingDown, isPushingLeft, isPushingRight, speed }) => {
                if (isPushingUp || isPushingDown || isPushingLeft || isPushingRight) {
                    console.log(`Move world with ${speed}`);
                }
            }));
        }
    }

    return Scene;
});
