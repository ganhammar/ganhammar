define(() => {
    function getPixelRatio(context) {
        const backingStores = [
            'webkitBackingStorePixelRatio',
            'mozBackingStorePixelRatio',
            'msBackingStorePixelRatio',
            'oBackingStorePixelRatio',
            'backingStorePixelRatio'
        ];

        const deviceRatio = window.devicePixelRatio;

        const backingRatio = backingStores.reduce((_, curr) => {
            return context.hasOwnProperty(curr) ? context[curr] : 1;
        });

        return deviceRatio / backingRatio;
    }

    return getPixelRatio;
});
