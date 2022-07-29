define(() => {
    keysDown = {};
    onKeyPress = () => { };

    document.onkeydown = (event) => {
        if (!this.keysDown[event.key]) {
            this.keysDown[event.key] = true;
        }
    };

    document.onkeyup = (event) => {
        if (this.keysDown[event.key]) {
            this.keysDown[event.key] = false;
        }
        this.onKeyPress(event.key);
    };

    return keysDown;
});
