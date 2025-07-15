class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.car = null;
        this.cursors = null;
        this.speed = 0;
        this.leftSignal = null;
        this.rightSignal = null;
        this.isLeftSignalOn = false;
        this.isRightSignalOn = false;
    }

    init(data) {
        this.selectedCarKey = data.selectedCarKey;
    }

    create() {
        // Yol
        this.road = this.add.tileSprite(400, 300, 800, 600, 'road');

        // Araba
        this.car = this.physics.add.sprite(400, 500, this.selectedCarKey);
        this.car.setCollideWorldBounds(true);
        this.car.setDamping(true);
        this.car.setDrag(0.98);
        this.car.setMaxVelocity(400); 

        // Sinyaller (Görünmez yapıp gerektiğinde gösteriyoruz)
        this.leftSignal = this.add.sprite(this.car.x - 25, this.car.y, 'signal').setVisible(false);
        this.rightSignal = this.add.sprite(this.car.x + 25, this.car.y, 'signal').setVisible(false);

        // Kamera
        this.cameras.main.startFollow(this.car, true, 0.08, 0.08);

        // Kontroller
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        
        // Sinyal Tuşları (Q ve E)
        this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Bilgi Ekranı (HUD)
        this.speedText = this.add.text(10, 10, 'Hız: 0 km/s', { font: '18px Arial', fill: '#ffffff' }).setScrollFactor(0);
        this.signalText = this.add.text(10, 30, 'Sinyal: Kapalı', { font: '18px Arial', fill: '#ffffff' }).setScrollFactor(0);
        this.add.text(10, 570, 'Kontroller: Yön Tuşları/WASD | Sinyal: Q/E', { font: '14px Arial', fill: '#ffffff' }).setScrollFactor(0);

        // Sinyallerin yanıp sönmesi için zamanlayıcı
        this.signalTimer = this.time.addEvent({
            delay: 400,
            callback: this.flashSignals,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        // Yolun akma efekti
        this.road.tilePositionY -= this.speed * 0.05;

        const maxAngularVelocity = 200;
        const acceleration = 300;
        const rotationAmount = 0.03; // Direksiyon hassasiyeti

        // Direksiyon (Sola/Sağa Dönüş)
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.car.setAngularVelocity(-maxAngularVelocity);
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.car.setAngularVelocity(maxAngularVelocity);
        } else {
            this.car.setAngularVelocity(0);
        }

        // Gaz ve Fren
        if (this.cursors.up.isDown || this.keyW.isDown) {
            this.physics.velocityFromRotation(this.car.rotation - Math.PI / 2, 600, this.car.body.acceleration);
        } else {
            this.car.setAcceleration(0);
        }
        
        if (this.cursors.down.isDown || this.keyS.isDown) {
             this.physics.velocityFromRotation(this.car.rotation - Math.PI / 2, -300, this.car.body.acceleration);
        }

        // Hız bilgisini güncelle
        this.speed = this.car.body.velocity.length();
        this.speedText.setText('Hız: ' + Math.floor(this.speed) + ' km/s');

        // Sinyal tuş kontrolü
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
            this.isLeftSignalOn = !this.isLeftSignalOn;
            this.isRightSignalOn = false; // Diğerini kapat
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.isRightSignalOn = !this.isRightSignalOn;
            this.isLeftSignalOn = false; // Diğerini kapat
        }
        
        // Sinyal ışıklarının pozisyonunu arabayla birlikte güncelle
        const angle = this.car.rotation;
        const offsetX = 25;
        const offsetY = 10;
        this.leftSignal.x = this.car.x - offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
        this.leftSignal.y = this.car.y - offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
        this.rightSignal.x = this.car.x + offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
        this.rightSignal.y = this.car.y + offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
    }

    flashSignals() {
        let signalStatus = 'Kapalı';
        
        if(this.isLeftSignalOn) {
            this.leftSignal.setVisible(!this.leftSignal.visible);
            this.rightSignal.setVisible(false);
            signalStatus = 'Sol Açık';
        } else if (this.isRightSignalOn) {
            this.rightSignal.setVisible(!this.rightSignal.visible);
            this.leftSignal.setVisible(false);
            signalStatus = 'Sağ Açık';
        } else {
            this.leftSignal.setVisible(false);
            this.rightSignal.setVisible(false);
        }
        
        this.signalText.setText('Sinyal: ' + signalStatus);
    }
}
