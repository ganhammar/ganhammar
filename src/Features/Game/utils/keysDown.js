define(() => {
    keysDown = {};

    document.onkeydown = (event) => {
        if (!this.keysDown[event.key]) {
            this.keysDown[event.key] = true;
        }
    };

    document.onkeyup = (event) => {
        if (this.keysDown[event.key]) {
            this.keysDown[event.key] = false;
        }
    };

    return keysDown;
});
