class CarSelectionScene extends Phaser.Scene {
    constructor() {
        super('CarSelectionScene');
    }

    create() {
        this.add.text(400, 100, 'Arabanı Seç', { fontSize: '48px', fill: '#ffffff' }).setOrigin(0.5);

        // Araba 1 Butonu
        const car1Button = this.add.image(250, 300, 'car1').setScale(1.5).setInteractive();
        car1Button.on('pointerdown', () => {
            this.scene.start('GameScene', { selectedCarKey: 'car1' });
        });
        car1Button.on('pointerover', () => car1Button.setTint(0xcccccc));
        car1Button.on('pointerout', () => car1Button.clearTint());

        // Araba 2 Butonu
        const car2Button = this.add.image(550, 300, 'car2').setScale(1.5).setInteractive();
        car2Button.on('pointerdown', () => {
            this.scene.start('GameScene', { selectedCarKey: 'car2' });
        });
        car2Button.on('pointerover', () => car2Button.setTint(0xcccccc));
        car2Button.on('pointerout', () => car2Button.clearTint());
    }
}
