requirejs.config({
    baseUrl: 'lib',
    paths: {
        features: '../features'
    }
});

requirejs(['./features/Game/Game'], (Game) => {
    const gameRoot = document.getElementById('game-root');
    
    new Game(gameRoot);
});
