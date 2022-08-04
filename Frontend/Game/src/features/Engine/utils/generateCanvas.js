define((require) => {
    const getPixelRatio = require('./getPixelRatio');

    function generateCanvas(w, h) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const ratio = getPixelRatio(context);

        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        return canvas;
    }

    return generateCanvas;
});
