define((require) => {
    const Engine = require('../Engine/Engine');
    const Splash = require('../Splash/Splash');
    const Scene = require('../Scene/Scene');

    class Game {
        paused = true;

        constructor(gameRoot) {
            this.engine = new Engine(gameRoot, this.run.bind(this));
        }

        run() {
            this.engine.clearEntities();

            if (this.paused === true) {
                new Splash(this.engine, () => {
                    this.paused = false;
                    this.run();
                });
            } else {
                new Scene(this.engine, () => {
                    this.paused = true;
                    this.run();
                });
            }
        }
    }

    return Game;
});
