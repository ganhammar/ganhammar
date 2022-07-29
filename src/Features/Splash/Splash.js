define((require) => {
    const keysDown = require('../Game/utils/keysDown');

    class Splash {
        onExit;
        opacity = 100;
        direction = 'out';
        isFading = false;
        textScale = 100;

        constructor(engine, onExit) {
            engine.addEntity(this);
            this.onExit = onExit;
        }

        update() {
            const except = ['Alt', 'Tab'];
            if (Object.entries(keysDown).findIndex(([key, value]) => except.indexOf(key) === -1 && value === true) !== -1) {
                this.isFading = true;
                this.opacity = 100;
            }

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
                    this.onExit();
                }
            } else {
                if (this.direction === 'out') {
                    if (this.opacity > 50) {
                        this.opacity -= 1;
                    } else {
                        this.direction = 'in';
                    }
                } else {
                    if (this.opacity < 100) {
                        this.opacity += 1;
                    } else {
                        this.direction = 'out';
                    }
                }
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
            context.strokeText('GANHAMMAR', centerX, centerY - 50 + (50 - (this.textScale / 2)));
            context.globalAlpha = 1;

            fontSize = 70 * (this.textScale / 100);
            context.font = `${fontSize}px Anton`;
            context.globalAlpha = this.opacity / 100;
            context.strokeText('PRESS ANY KEY', centerX, centerY + 60 - (50 - (this.textScale / 2)));
            context.globalAlpha = 1;
        }
    }

    return Splash;
});
