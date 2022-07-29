define(() => {
    class GameOver {
        score;
        credentials = [undefined, undefined, undefined, undefined, undefined];
        onExit;
        underscoreAlpha = 100;
        underscoreDirection = 'out';
        pressedChars = [];

        constructor(engine, score, onExit) {
            engine.addEntity(this);
            this.score = score;
            this.onExit = onExit;
            document.onkeyup = (event) => {
                if (event.key.length === 1 || event.key === 'Backspace') {
                    this.pressedChars.push(event.key.toUpperCase());
                }
            };
        }

        update() {
            if (this.underscoreDirection === 'out') {
                if (this.underscoreAlpha > 30) {
                    this.underscoreAlpha -= 1;
                } else {
                    this.underscoreDirection = 'in';
                }
            } else {
                if (this.underscoreAlpha < 100) {
                    this.underscoreAlpha += 1;
                } else {
                    this.underscoreDirection = 'out';
                }
            }

            while (this.pressedChars.length > 0) {
                const index = this.credentials.findIndex((char) => char === undefined);

                if (this.pressedChars[0] === 'BACKSPACE') {
                    this.credentials[index !== -1 ? index - 1 : this.credentials.length - 1] = undefined;
                    this.pressedChars.splice(0, 1);
                    continue;
                }
                
                if (index === -1) {
                    break;
                }

                this.credentials[index] = this.pressedChars[0];
                this.pressedChars.splice(0, 1);
            }
        }

        render(context, { width, height }) {
            const centerX = width / 2;
            const centerY = height / 2;

            context.font = '150px Anton';
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            context.strokeText('GAME OVER', centerX, centerY - 210);

            context.font = '70px Anton';
            context.strokeText(`YOU FOUND ${this.score} HABITABLE PLANETS`, centerX, centerY - 100);

            const underscoreWidth = 100;
            const underscoreHeight = 8;
            const underscoreOffset = 20;

            const renderUnderscore = (offset, isDefined) => {
                context.save();
                const underscore = new Path2D();
                underscore.moveTo(centerX - (underscoreWidth / 2) + offset, centerY + 110);
                underscore.lineTo(centerX + (underscoreWidth / 2) + offset, centerY + 110);
                underscore.lineTo(centerX + (underscoreWidth / 2) + offset, centerY + 110 + underscoreHeight);
                underscore.lineTo(centerX - (underscoreWidth / 2) + offset, centerY + 110 + underscoreHeight);
                underscore.lineTo(centerX - (underscoreWidth / 2) + offset, centerY + 110);

                if (isDefined === false) {
                    context.globalAlpha = this.underscoreAlpha / 100;
                }

                context.stroke(underscore);
                context.restore();
            };

            const renderCharacter = (character, offset) => {
                if (character) {
                    context.font = `100px Anton`;
                    context.textBaseline = 'middle';
                    context.textAlign = 'top';
                    context.strokeText(character, centerX + offset, centerY + 70);
                }
                renderUnderscore(offset, character !== undefined);
            };

            const offset = -(((underscoreWidth + underscoreOffset) * this.credentials.length) / 2) + (underscoreOffset * 3);
            this.credentials.forEach((char, index) => renderCharacter(char, offset + ((underscoreWidth + underscoreOffset) * index)));
        }
    }

    return GameOver;
});
