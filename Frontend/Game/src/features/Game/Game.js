define((require) => {
    const Engine = require('../Engine/Engine');
    const Splash = require('../Splash/Splash');
    const Map = require('../Map/Map');
    const Scene = require('../Scene/Scene');
    const GameOver = require('../GameOver/GameOver');
    const Highscore = require('../Highscore/Highscore');

    const SESSION_KEY = 'SESSION_ID';

    class Game {
        state = 'paused';
        sessionId;
        map;

        constructor(gameRoot) {
            this.engine = new Engine(gameRoot, this.run.bind(this));
            this.map = new Map(this.engine.constants);
            this.getSessionId();
        }

        async getSessionId() {
            if (sessionStorage.getItem(SESSION_KEY)) {
                this.sessionId = sessionStorage.getItem('SESSION_ID');
            } else {
                const response = await fetch(`${document.API_BASE_URL}/sessionId`);
                const { id: sessionId } = await response.json();
                sessionStorage.setItem(SESSION_KEY, sessionId);
                this.sessionId = sessionId;
            }
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
                    new GameOver(this.engine, score, this.sessionId, () => {
                        this.state = 'paused';
                        this.run();
                    });
                    break;
            }
        }
    }

    return Game;
});
