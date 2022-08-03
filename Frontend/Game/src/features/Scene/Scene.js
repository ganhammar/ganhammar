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

        introduction = [
            'Oh, great, your awake!',
            'As you might remember, new-new-earth failed..',
            'Resources ran out; droughts, floods and fires..',
            'But no worries, this time we have learned from our mistakes..',
            'Instead of moving to one planet, we move to as many as we can!',
            'That\'s where you come in, you need to scout as many planets as you can',
            'Move in close to them and send a probe, but don\'t go to close..',
            'Oh, the ship runs on hydrogen, which is very common, so grab some when you can',
            'Good luck! The future of humanity lays in your hands!'
        ];
        currentIntroductionText = 0;
        showIntroductionTextFor = 3.5*60;
        shownCurrentIntroductionTextFor = 0;

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
            const topCenterX = this.player.positionX;
            const topCenterY = this.player.positionY - ((this.player.playerHeight - this.player.thrusterHeight) / 2);
            const bottomLeftCornerX = this.player.positionX - (this.player.playerWidth / 2);
            const bottomLeftCornerY = this.player.positionY + (this.player.playerHeight / 2);
            const bottomRightCornerX = this.player.positionX + (this.player.playerWidth / 2);
            const bottomRightCornerY = this.player.positionY + (this.player.playerHeight / 2);

            let isGameOver = this.map.getVisibleObjects()
                .findIndex(obj => obj.isPositionCollision(topCenterX, topCenterY)
                    || obj.isPositionCollision(bottomLeftCornerX, bottomLeftCornerY)
                    || obj.isPositionCollision(bottomRightCornerX, bottomRightCornerY)) !== -1;

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
                const number = Math.floor(Math.random() * 5000);
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

            if (this.currentIntroductionText < this.introduction.length) {
                if (this.shownCurrentIntroductionTextFor < this.showIntroductionTextFor) {
                    this.shownCurrentIntroductionTextFor += 1;
                } else {
                    this.currentIntroductionText += 1;
                    this.shownCurrentIntroductionTextFor = 0;
                }
            }
        }

        render(context, { width }) {
            // Introduction
            if (this.currentIntroductionText < this.introduction.length) {
                context.save();

                context.fillStyle = '#f9f9f9';
                context.font = `25px Anton`;
                context.textAlign = 'middle';
                context.textBaseline = 'bottom';

                if (this.shownCurrentIntroductionTextFor < 30) {
                    context.globalAlpha = this.shownCurrentIntroductionTextFor / 30;
                } else if (this.shownCurrentIntroductionTextFor > this.showIntroductionTextFor - 30) {
                    context.globalAlpha = (this.showIntroductionTextFor - this.shownCurrentIntroductionTextFor) / 30;
                }

                context.fillText(this.introduction[this.currentIntroductionText], width / 2, 240);

                context.restore();
            }

            // Notices
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

            // Medal
            const medalInner = new Path2D('m130.061,87.042l53.592-53.59c2.93-2.929 2.93-7.678 0.001-10.607l-20.646-20.648c-1.406-1.407-3.315-2.197-5.304-2.197h-107.182c-1.989,0-3.896,0.79-5.304,2.196l-20.646,20.647c-1.406,1.407-2.196,3.314-2.196,5.304s0.79,3.896 2.196,5.304l63.702,63.702c-23.562,6.874-40.833,28.661-40.833,54.422 0,31.238 25.423,56.652 56.671,56.652 31.249,0 56.672-25.414 56.672-56.652 0-25.761-17.271-47.549-40.834-54.422l10.102-10.102c0.003-0.003 0.007-0.006 0.009-0.009zm37.683-58.893l-42.984,42.982-10.04-10.04 42.984-42.984 10.04,10.042zm-42.348,1.05h-42.567l-14.199-14.199h70.967l-14.201,14.199zm-15,15l-6.284,6.284-6.284-6.284h12.568zm-59.874-26.092l63.63,63.631-10.04,10.039-63.63-63.63 10.04-10.04zm95.262,133.467c0,22.967-18.694,41.652-41.672,41.652-22.978,0-41.671-18.686-41.671-41.652 0-22.988 18.693-41.691 41.671-41.691 22.978-1.42109e-14 41.672,18.703 41.672,41.691z');
            const medal = new Path2D('m71.727,151.572c0,17.849 14.528,32.369 32.387,32.369 17.865,0 32.399-14.521 32.399-32.369 0-17.867-14.534-32.403-32.399-32.403-17.859-1.42109e-14-32.387,14.536-32.387,32.403zm32.386-17.403c9.594,0 17.399,7.807 17.399,17.403 0,9.577-7.806,17.369-17.399,17.369-9.587,0-17.387-7.792-17.387-17.369 0.001-9.596 7.8-17.403 17.387-17.403z');
            medal.addPath(medalInner);
            context.translate(width - 105, 66);
            context.scale(0.15, 0.15);
            context.fill(medal);

            context.restore();

            // Probe Count
            context.save();

            // Text
            context.fillStyle = '#f9f9f9';
            context.font = `30px Anton`;
            context.textAlign = 'right';
            context.textBaseline = 'top';
            context.fillText(Math.round(this.probes.length), width - 30, 110);

            // Medal
            const satelliteInner1 = new Path2D('M201.359,137.3l-43.831-43.831l11.453-11.452c1.407-1.407,2.197-3.314,2.197-5.304c0-1.989-0.79-3.896-2.197-5.304l-36.835-36.834c-2.929-2.928-7.677-2.928-10.606,0l-11.452,11.452L66.253,2.196c-2.93-2.928-7.678-2.928-10.606,0L18.813,39.03c-2.929,2.93-2.929,7.678,0,10.607l43.831,43.831l-11.453,11.452c-1.407,1.407-2.197,3.314-2.197,5.304s0.79,3.896,2.197,5.304l36.837,36.836c1.464,1.464,3.384,2.196,5.303,2.196c1.919,0,3.839-0.732,5.303-2.196l11.453-11.453l43.83,43.83c1.465,1.464,3.384,2.196,5.303,2.196c1.919,0,3.839-0.732,5.303-2.196l36.835-36.834c1.407-1.407,2.197-3.314,2.197-5.304C203.556,140.614,202.766,138.707,201.359,137.3z M34.723,44.334L60.95,18.107l38.53,38.526L82.314,73.799l-9.063,9.063L34.723,44.334z M93.331,136.454l-26.23-26.229l11.448-11.447c0.002-0.002,0.003-0.003,0.005-0.005l12.443-12.443l35.845-35.844l26.229,26.228l-11.446,11.446c-0.003,0.003-0.005,0.005-0.007,0.007l-18.417,18.418L93.331,136.454z M159.221,168.831l-38.527-38.526l26.229-26.229l38.527,38.527L159.221,168.831z');
            const satelliteInner2 = new Path2D('M72.344,188.555c-15.317,0.001-29.717-5.964-40.548-16.795C20.965,160.929,15,146.528,15,131.211c0-4.143-3.358-7.5-7.5-7.5c-4.143,0-7.5,3.358-7.5,7.5c0,19.324,7.526,37.491,21.189,51.155c13.663,13.664,31.829,21.189,51.152,21.189c0.001,0,0.002,0,0.004,0c4.142,0,7.499-3.358,7.499-7.5C79.845,191.912,76.486,188.555,72.344,188.555z');
            const satellite = new Path2D('M69.346,174.133c4.142,0,7.5-3.357,7.5-7.5c0-4.143-3.358-7.5-7.5-7.5c-6.658,0-12.916-2.593-17.624-7.3c-4.707-4.707-7.299-10.965-7.299-17.622c0-4.142-3.357-7.5-7.5-7.5h0c-4.142,0-7.5,3.358-7.5,7.5c-0.001,10.663,4.152,20.688,11.693,28.229C48.656,169.981,58.682,174.133,69.346,174.133z');
            satellite.addPath(satelliteInner1);
            satellite.addPath(satelliteInner2);
            context.translate(width - 105, 106);
            context.scale(0.14, 0.14);
            context.fill(satellite);

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
