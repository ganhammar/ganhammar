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
            keysDown.onkeyup = (key) => {
                if (key === 'ArrowDown') {
                    this.selectedOption = this.selectedOption === 'start' ? 'highscore' : 'sourceCode';
                } else if (key === 'ArrowUp') {
                    this.selectedOption = this.selectedOption === 'sourceCode' ? 'highscore' : 'start';
                }
            };
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

            if (keysDown.Enter) {
                if (this.selectedOption === 'sourceCode') {
                    window.location.href = 'https://github.com/ganhammar/ganhammar';
                    return;
                }

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
            context.strokeText('HIGHSCORES', centerX, centerY + 65 - (this.isFading ? 120 - (this.textScale * 1.2) : 0));
            context.globalAlpha = 1;

            if (!this.isFading && this.selectedOption === 'sourceCode') {
                context.globalAlpha = 1;
            } else if (this.selectedOption !== 'sourceCode' && (!this.isFading || this.opacity > 30)) {
                context.globalAlpha = 0.3;
            }
            context.strokeText('SOURCE CODE', centerX, centerY + 145 - (this.isFading ? 190 - (this.textScale * 1.9) : 0));
            context.globalAlpha = 1;

            // Selected Arrow
            if (!this.isFading) {
                context.save();
                const size = 35;
                let topX = centerX - 210;
                let topY = centerY - 45;

                switch (this.selectedOption) {
                    case 'highscore':
                        topY += 80;
                        topX += 3;
                        break;
                    case 'sourceCode':
                        topY += 160;
                        topX -= 12;
                        break;
                }

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
