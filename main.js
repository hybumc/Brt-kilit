const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // Çarpışma kutularını görmek için true yapabilirsiniz
        }
    },
    scene: [PreloadScene, CarSelectionScene, GameScene]
};

const game = new Phaser.Game(config);
