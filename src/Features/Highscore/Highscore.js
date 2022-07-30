define((require) => {
    const LoadingIndicator = require('../Engine/LoadingIndicator');
    const keysDown = require('../Game/utils/keysDown');

    class Highscore {
        onExit;
        isLoading = true;
        loadingIndicator = new LoadingIndicator();
        highscores = [];
        shouldExit = false;

        constructor(engine, onExit) {
            engine.addEntity(this);

            this.onExit = onExit;
            this.fetchHighscore();
        }

        update() {
            if (this.isLoading) {
                this.loadingIndicator.update();
                return;
            }

            if (keysDown.Enter || keysDown.Escape) {
                this.shouldExit = true;
            } else if (!keysDown.Enter && this.shouldExit) {
                this.onExit();
            }
        }

        render(context, constants) {
            if (this.isLoading) {
                this.loadingIndicator.render(context, constants);
                return;
            }

            const { width } = constants;
            const centerX = width / 2;

            context.font = '150px Anton';
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            context.strokeText('HIGHSCORES', centerX, 250);
            
            context.font = '50px Anton';
            const offsetPerRow = 80;
            let offset = 330 + offsetPerRow;

            this.highscores.forEach(({ credentials, score }) => {
                context.textBaseline = 'middle';
                context.textAlign = 'left';
                context.strokeText(credentials, centerX - 330, offset);
                context.textAlign = 'right';
                context.strokeText(score, centerX + 330, offset);
                offset += offsetPerRow;
            });

            context.textBaseline = 'middle';
            context.textAlign = 'left';
            context.strokeText('BACK', centerX - 330, offset + offsetPerRow);

            context.save();
            const size = 25;
            const topX = centerX - 370;
            const topY = offset + offsetPerRow - 20;
            const arrow = new Path2D();
            arrow.moveTo(topX, topY);
            arrow.lineTo(topX + size, topY + (size / 2));
            arrow.lineTo(topX, topY + size);
            arrow.lineTo(topX, topY);
            context.lineWidth = 2;
            context.stroke(arrow);
            context.restore();
        }

        fetchHighscore() {
            setTimeout(() => {
                this.isLoading = false;
                this.highscores = [
                    { credentials: 'PM', score: 9 },
                    { credentials: 'AG', score: 5 },
                    { credentials: 'BALLS', score: 3 },
                    { credentials: ':)', score: 2 },
                    { credentials: ':(', score: 1 },
                ]
            }, 1000);
        }
    }

    return Highscore;
});
