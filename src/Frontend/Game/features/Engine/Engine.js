define((require) => {
    const generateCanvas = require('./utils/generateCanvas');
    const LoadingIndicator = require('./LoadingIndicator');

    class Engine {
        loading = true;
        onLoad;
        constants = {
            targetFps: 60,
            width: window.innerWidth,
            height: window.innerHeight,
        };
        state = {
            entities: [],
        };

        constructor(gameRoot, onLoad) {
            this.viewport = generateCanvas(this.constants.width, this.constants.height);
            this.viewport.id = 'gameViewport';

            this.context = this.viewport.getContext('2d');

            gameRoot.insertBefore(this.viewport, gameRoot.firstChild);

            this.onLoad = onLoad;
            this.loadingIndicator = new LoadingIndicator();

            this.loadFonts();
            this.startGameLoop();
        }

        loadFonts() {
            const gameFont = new FontFace(
                'Anton',
                'url(https://fonts.gstatic.com/s/anton/v23/1Ptgg87LROyAm3Kz-C8.woff2)'
            );

            gameFont.load().then((font) => {
                document.fonts.add(font);
                this.loading = false;
                this.onLoad();
            });
        }

        addEntity(entity) {
            this.state.entities.push(entity);
        }

        removeEntity(index) {
            this.state.entities.splice(index, 1);
        }

        clearEntities() {
            this.state.entities = [];
        }

        render() {
            this.context.clearRect(0, 0, this.constants.width, this.constants.height);
            this.context.fillStyle = '#222';
            this.context.fillRect(0, 0, this.constants.width, this.constants.height);
            this.context.strokeStyle = '#f9f9f9';

            if (this.loading === true) {
                this.loadingIndicator.render(this.context, this.constants);
            } else {
                this.state.entities.forEach((entity) => entity.render(this.context, this.constants));
            }
        }

        update() {
            if (this.loading === true) {
                this.loadingIndicator.update();
            } else {
                this.state.entities.forEach((entity) => entity.update(this.constants));
            }
        }

        startGameLoop() {
            const fps = this.constants.targetFps;
            this.fpsInterval = 100 / fps;
            this.before = window.performance.now();
            this.cycles = {
                new: {
                    frameCount: 0,
                    startTime: this.before,
                    sinceStart: 0,
                },
                old: {
                    frameCount: 0,
                    startTime: this.before,
                    sinceStart: 0,
                },
            };
            this.resetInterval = 5;
            this.resetState = 'new';
            this.currentFps = 0;
            this.gameLoop();
        }

        gameLoop(tframe) {
            this.loop = window.requestAnimationFrame(this.gameLoop.bind(this));

            const now = tframe;
            const elapsed = now - this.before;
            let activeCycle;
            let targetResetInterval;

            if (elapsed > this.fpsInterval) {
                this.before = now - (elapsed % this.fpsInterval);

                for (const calc in this.cycles) {
                    ++this.cycles[calc].frameCount;
                    this.cycles[calc].sinceStart = now - this.cycles[calc].startTime;
                }

                activeCycle = this.cycles[this.resetState];
                this.currentFps = Math.round(1000 / (activeCycle.sinceStart / activeCycle.frameCount) * 100) / 100;

                targetResetInterval = this.cycles.new.frameCount === this.cycles.old.frameCount
                    ? this.resetInterval * this.currentFps
                    : (this.resetInterval * 2) * this.currentFps;

                if (activeCycle.frameCount > targetResetInterval) {
                    this.cycles[this.resetState].frameCount = 0;
                    this.cycles[this.resetState].startTime = now;
                    this.cycles[this.resetState].sinceStart = 0;

                    this.resetState = this.resetState === 'new' ? 'old' : 'new';
                }

                this.update();
                this.render();
            }
        }
    }

    return Engine;
});
