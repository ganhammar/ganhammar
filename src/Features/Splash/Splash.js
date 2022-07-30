define((require) => {
    const keysDown = require('../Game/utils/keysDown');

    class Splash {
        onExit;
        opacity = 100;
        direction = 'out';
        isFading = false;
        textScale = 100;
        selectedOption = 'start';

        constructor(engine, onExit) {
            engine.addEntity(this);
            this.onExit = onExit;
        }

        update() {
            if (this.isFading) {
                if (this.textScale > 0) {
                    const factor = this.textScale < 100 ? Math.ceil((100 - this.textScale) / 10) : 1;

                    this.textScale -= factor;

                    if (this.textScale < 75) {
                        this.opacity -= factor;
                    } else {
                        this.opacity = 100;
                    }
                } else {
                    this.onExit(this.selectedOption);
                }
            }

            if (keysDown.ArrowDown) {
                this.selectedOption = 'highscore';
            } else if (keysDown.ArrowUp) {
                this.selectedOption = 'start';
            } else if (keysDown.Enter) {
                this.isFading = true;
                this.opacity = 100;
            }
        }

        render(context, { width, height }) {
            const centerX = width / 2;
            const centerY = height / 2;

            let fontSize = 150 * (this.textScale / 100);
            context.font = `${fontSize}px Anton`;
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            context.globalAlpha = this.isFading ? this.opacity / 100 : 1;
            context.strokeText('GANHAMMAR', centerX, centerY - 135 + (50 - (this.textScale / 2)));

            fontSize = 70 * (this.textScale / 100);
            context.font = `${fontSize}px Anton`;

            context.save();
            if (!this.isFading && this.selectedOption === 'start') {
                context.globalAlpha = 1;
            } else if (this.selectedOption !== 'start' && (!this.isFading || this.opacity > 30)) {
                context.globalAlpha = 0.3;
            }
            context.strokeText('START GAME', centerX, centerY + 5 - (70 - (this.textScale / 2)));
            context.restore();

            if (!this.isFading && this.selectedOption === 'highscore') {
                context.globalAlpha = 1;
            } else if (this.selectedOption !== 'highscore' && (!this.isFading || this.opacity > 30)) {
                context.globalAlpha = 0.3;
            }
            context.strokeText('HIGHSCORES', centerX, centerY + 65 - (this.isFading ? 100 - this.textScale : 0));
            context.globalAlpha = 1;

            // Selected Arrow
            if (!this.isFading) {
                context.save();
                const size = 35;
                const topX = centerX - 210;
                const topY = centerY - 45  + (this.selectedOption === 'start' ? 0 : 80);
                const arrow = new Path2D();
                arrow.moveTo(topX, topY);
                arrow.lineTo(topX + size, topY + (size / 2));
                arrow.lineTo(topX, topY + size);
                arrow.lineTo(topX, topY);
                context.lineWidth = 2;
                context.stroke(arrow);
                context.restore();
            }
        }
    }

    return Splash;
});
