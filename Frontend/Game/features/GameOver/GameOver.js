define((require) => {
    const keysDown = require('../Game/utils/keysDown');

    class GameOver {
        score;
        credentials = [undefined, undefined, undefined, undefined, undefined];
        onExit;
        underscoreAlpha = 100;
        underscoreDirection = 'out';
        pressedChars = [];
        selectedOption = 'cancel';
        enterIsDown = false;
        showInfo = false;

        constructor(engine, score, onExit) {
            engine.addEntity(this);
            this.score = score;
            this.onExit = onExit;
            keysDown.onkeyup = (key) => {
                if (key.length === 1 || key === 'Backspace') {
                    this.pressedChars.push(key.toUpperCase());
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

                if (index === -1 || this.pressedChars[0].length !== 1) {
                    break;
                }

                this.credentials[index] = this.pressedChars[0];
                this.pressedChars.splice(0, 1);
            }

            if (keysDown.ArrowRight) {
                this.selectedOption = 'submit';
            } else if (keysDown.ArrowLeft) {
                this.selectedOption = 'cancel';
            }

            if (keysDown.Enter) {
                this.enterIsDown = true;
            } else if (this.enterIsDown) {
                switch (this.selectedOption) {
                    case 'cancel':
                        this.onExit();
                        break;
                    case 'submit':
                        if (this.credentials.findIndex((char) => char === undefined) !== 0) {
                            console.log('Submitting score');
                            this.onExit();
                        } else {
                            this.showInfo = true;
                            this.enterIsDown = false;
                        }
                        break;
                }
            }
        }

        render(context, { width, height }) {
            const centerX = width / 2;
            const centerY = height / 2;

            context.font = '150px Anton';
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            context.strokeText('GAME OVER', centerX, centerY - 250);

            context.font = '70px Anton';
            context.strokeText(`YOU FOUND ${this.score} HABITABLE PLANETS`, centerX, centerY - 140);

            // Inputs
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

            // Buttons
            context.save();
            context.font = '70px Anton';
            context.textBaseline = 'top';
            context.textAlign = 'left';

            if (this.selectedOption === 'cancel') {
                context.globalAlpha = 1;
            } else {
                context.globalAlpha = 0.3;
            }
            context.strokeText('CANCEL', centerX - 290, centerY + 160);

            if (this.selectedOption === 'submit') {
                context.globalAlpha = 1;
            } else {
                context.globalAlpha = 0.3;
            }
            context.textAlign = 'right';
            context.strokeText('SUBMIT', centerX + 290, centerY + 160);
            context.restore();

            // Selected Arrow
            context.save();
            const size = 35;
            const topX = centerX - 340 + (this.selectedOption === 'cancel' ? 0 : 385);
            const topY = centerY + 164;
            const arrow = new Path2D();
            arrow.moveTo(topX, topY);
            arrow.lineTo(topX + size, topY + (size / 2));
            arrow.lineTo(topX, topY + size);
            arrow.lineTo(topX, topY);
            context.lineWidth = 2;
            context.stroke(arrow);
            context.restore();

            if (this.showInfo) {
                context.fillStyle = '#f9f9f9';
                context.font = '20px Anton';
                context.textAlign = 'right';
                context.fillText('TYPE NICKNAME IN ORDER TO SUBMIT HIGHSCORE', centerX + 290, centerY + 250);
                context.restore();
            }
        }
    }

    return GameOver;
});
