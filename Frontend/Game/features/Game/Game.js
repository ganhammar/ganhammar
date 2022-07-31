define((require) => {
    const Engine = require('../Engine/Engine');
    const Splash = require('../Splash/Splash');
    const Map = require('../Map/Map');
    const Scene = require('../Scene/Scene');
    const GameOver = require('../GameOver/GameOver');
    const Highscore = require('../Highscore/Highscore');

    class Game {
        state = 'paused';
        map;

        constructor(gameRoot) {
            this.engine = new Engine(gameRoot, this.run.bind(this));
            this.map = new Map(this.engine.constants);
        }

        run(score) {
            this.engine.clearEntities();

            switch (this.state) {
                case 'paused':
                    new Splash(this.engine, (selected) => {
                        switch (selected) {
                            case 'highscore':
                                this.state = 'highscore';
                                break;
                            case 'start': default:
                                this.state = 'running';
                                break;
                        }
                        this.run();
                    });
                    break;
                case 'highscore':
                    new Highscore(this.engine, () => {
                        this.state = 'paused';
                        this.run();
                    });
                    break;
                case 'running':
                    new Scene(this.engine, this.map, (score) => {
                        this.state = 'gameover';
                        this.run(score);
                    });
                    break;
                case 'gameover':
                    this.map = new Map(this.engine.constants);
                    new GameOver(this.engine, score, () => {
                        this.state = 'paused';
                        this.run();
                    });
                    break;
            }
        }
    }

    return Game;
});
