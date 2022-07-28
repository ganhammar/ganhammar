define((require) => {
    const Player = require('../Player/Player');

    class Scene {
        engine;
        onExit;
        map;
        player;
        probes = [];
        score = 0;

        probeSuccessProbability = 1;
        probeFailProbability = 5;

        notices = [];
        showNoticeFor = 5*60;

        constructor(engine, map, onExit) {
            this.engine = engine;
            this.map = map;
            this.onExit = onExit;

            this.player = new Player(
                this.handleMapMove.bind(this),
                this.handleProbeLaunch.bind(this),
                () => this.onExit(this.score));
            this.updateEntities();
        }

        updateEntities() {
            this.engine.clearEntities();
            this.engine.addEntity(this);
            this.engine.addEntity(this.player);
            this.map.getVisibleObjects()
                .forEach((obj) => this.engine.addEntity(obj));
        }

        update() {
            let isGameOver = this.map.getVisibleObjects()
                .findIndex(obj => obj.isPositionCollision(this.player.positionX, this.player.positionY)) !== -1;

            if (!isGameOver) {
                isGameOver = this.player.fuel <= 0;
            }

            if (isGameOver) {
                this.player.isGameOver = true;
            }

            this.player.closeToPlanet = this.map.getVisibleObjects()
                .find(obj => obj.isPositionInAtmosphere(this.player.positionX, this.player.positionY));

            this.probes.forEach((planet, index) =>
            {
                const number = Math.floor(Math.random() * 10000);
                if (number <= this.probeSuccessProbability) {
                    this.probes.splice(index, 1);
                    this.score += 1;
                    this.notices.push({
                        isSuccess: true,
                        shownFor: 0,
                        planet,
                    });
                } else if (number <= this.probeFailProbability) {
                    this.probes.splice(index, 1);
                    this.notices.push({
                        isSuccess: false,
                        shownFor: 0,
                        planet,
                    });
                }
            });
        }

        render(context, { width }) {
            if (this.notices.length > 0) {
                const { planet, isSuccess, shownFor } = this.notices[0];

                context.save();
    
                context.fillStyle = '#f9f9f9';
                context.font = `20px Anton`;
                context.textAlign = 'middle';
                context.textBaseline = 'bottom';
                context.fillText(`Planet ${planet.coordinateX}.${planet.coordinateY} ${isSuccess ? 'is' : 'is not'} Habitable`, width / 2, 200);

                context.restore();
                
                if (shownFor >= this.showNoticeFor) {
                    this.notices.splice(0, 1);
                } else {
                    this.notices[0].shownFor += 1;
                }
            }

            // Score
            context.save();

            // Text
            context.fillStyle = '#f9f9f9';
            context.font = `30px Anton`;
            context.textAlign = 'right';
            context.textBaseline = 'top';
            context.fillText(Math.round(this.score), width - 30, 70);

            // Drop
            const medalInner = new Path2D('m130.061,87.042l53.592-53.59c2.93-2.929 2.93-7.678 0.001-10.607l-20.646-20.648c-1.406-1.407-3.315-2.197-5.304-2.197h-107.182c-1.989,0-3.896,0.79-5.304,2.196l-20.646,20.647c-1.406,1.407-2.196,3.314-2.196,5.304s0.79,3.896 2.196,5.304l63.702,63.702c-23.562,6.874-40.833,28.661-40.833,54.422 0,31.238 25.423,56.652 56.671,56.652 31.249,0 56.672-25.414 56.672-56.652 0-25.761-17.271-47.549-40.834-54.422l10.102-10.102c0.003-0.003 0.007-0.006 0.009-0.009zm37.683-58.893l-42.984,42.982-10.04-10.04 42.984-42.984 10.04,10.042zm-42.348,1.05h-42.567l-14.199-14.199h70.967l-14.201,14.199zm-15,15l-6.284,6.284-6.284-6.284h12.568zm-59.874-26.092l63.63,63.631-10.04,10.039-63.63-63.63 10.04-10.04zm95.262,133.467c0,22.967-18.694,41.652-41.672,41.652-22.978,0-41.671-18.686-41.671-41.652 0-22.988 18.693-41.691 41.671-41.691 22.978-1.42109e-14 41.672,18.703 41.672,41.691z');
            const medal = new Path2D('m71.727,151.572c0,17.849 14.528,32.369 32.387,32.369 17.865,0 32.399-14.521 32.399-32.369 0-17.867-14.534-32.403-32.399-32.403-17.859-1.42109e-14-32.387,14.536-32.387,32.403zm32.386-17.403c9.594,0 17.399,7.807 17.399,17.403 0,9.577-7.806,17.369-17.399,17.369-9.587,0-17.387-7.792-17.387-17.369 0.001-9.596 7.8-17.403 17.387-17.403z');
            medal.addPath(medalInner);
            context.translate(width - 105, 66);
            context.scale(0.15, 0.15);
            context.fill(medal);

            context.restore();
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

        handleProbeLaunch(planet) {
            planet.probed = true;
            this.probes.push(planet);
        }
    }

    return Scene;
});
