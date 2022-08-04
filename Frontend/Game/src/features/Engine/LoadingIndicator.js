define((require) => {
    const LoadingCircle = require('./LoadingCircle');

    class LoadingIndicator {
        circles = [];

        createCircles(width, height) {
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 15;
            let opacity = 100;
            let offsetX = -60;

            for (let i = 0; i < 3; i++) {
                this.circles.push(new LoadingCircle(opacity, 'out', centerX - offsetX, centerY, radius));
                opacity -= 33;
                offsetX += 60;
            }
        }

        update() {
            this.circles.forEach((circle) => circle.update());
        }

        render(context, { width, height }) {
            if (this.circles.length === 0) {
                this.createCircles(width, height);
            }

            this.circles.forEach((circle) => circle.render(context));
        }
    }

    return LoadingIndicator;
});
