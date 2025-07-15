class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Yükleme barı oluştur
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const loadingText = this.make.text({
            x: 400,
            y: 250,
            text: 'Yükleniyor...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // Bu bölümde resim indirmek yerine kod ile çizim yapıyoruz!
        // Kendi resimlerinizi kullanmak isterseniz bu bölümü değiştirebilirsiniz.
        this.createPlaceholderImages();
    }

    createPlaceholderImages() {
        // Yol Resmi Oluştur
        let roadGraphics = this.make.graphics({x: 0, y: 0}, false);
        roadGraphics.fillStyle(0x555555); // Asfalt rengi
        roadGraphics.fillRect(0, 0, 100, 100);
        roadGraphics.fillStyle(0xffffff, 0.6); // Şerit rengi
        roadGraphics.fillRect(48, 0, 4, 100); // Ortadaki şerit
        roadGraphics.generateTexture('road', 100, 100);
        roadGraphics.destroy();

        // Araba 1 (Kırmızı)
        let car1Graphics = this.make.graphics({x: 0, y: 0}, false);
        car1Graphics.fillStyle(0xff0000); // Kırmızı
        car1Graphics.fillRect(0, 0, 40, 80);
        car1Graphics.fillStyle(0x000000, 0.5); // Cam
        car1Graphics.fillRect(5, 10, 30, 20);
        car1Graphics.generateTexture('car1', 40, 80);
        car1Graphics.destroy();

        // Araba 2 (Mavi)
        let car2Graphics = this.make.graphics({x: 0, y: 0}, false);
        car2Graphics.fillStyle(0x0000ff); // Mavi
        car2Graphics.fillRect(0, 0, 40, 80);
        car2Graphics.fillStyle(0x000000, 0.5); // Cam
        car2Graphics.fillRect(5, 10, 30, 20);
        car2Graphics.generateTexture('car2', 40, 80);
        car2Graphics.destroy();
        
        // Sinyal ışığı
        let signalGraphics = this.make.graphics({x: 0, y: 0}, false);
        signalGraphics.fillStyle(0xffa500); // Turuncu
        signalGraphics.fillRect(0, 0, 10, 10);
        signalGraphics.generateTexture('signal', 10, 10);
        signalGraphics.destroy();

        // Her şey hazır olunca diğer sahneye geç
        this.scene.start('CarSelectionScene');
    }
}
