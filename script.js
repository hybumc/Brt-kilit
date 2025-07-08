document.addEventListener('DOMContentLoaded', () => {

    // --- 1. TÜM DOM ELEMENTLERİ ---
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const bootScreen = document.getElementById('boot-screen');
    const currentTimeSpan = document.getElementById('current-time');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const notificationVolumeSlider = document.getElementById('notification-volume');
    const audioNotification = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');

    // --- 2. SİSTEM DEĞİŞKENLERİ VE VERİLERİ ---
    let openWindows = {};
    let highestZIndex = 100;
    const appData = {
        'settings': { name: 'Ayarlar', window: document.getElementById('settings-window') },
        'task-manager': { name: 'Görev Yöneticisi', window: document.getElementById('task-manager-window') },
        'brt-store': { name: 'BRT Store', window: document.getElementById('brt-store-window') },
        'calculator': { name: 'Hesap Makinesi', window: document.getElementById('calculator-window') },
        'notepad': { name: 'Not Defteri', window: document.getElementById('notepad-window') },
    };

    // --- 3. TEMEL SİSTEM FONKSİYONLARI ---
    const updateTime = () => {
        currentTimeSpan.textContent = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const bootSystem = () => {
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            desktop.style.display = 'block';
            taskbar.style.display = 'flex';
        }, 1500);
    };

    // --- 4. PENCERE YÖNETİMİ ---
    const openWindow = (appId) => {
        const app = appData[appId];
        if (!app) return;
        const windowEl = app.window;
        windowEl.style.display = 'flex';
        bringToFront(windowEl);
        openWindows[appId] = app;
    };
    
    const closeWindow = (appId) => {
        if (appData[appId]) {
            appData[appId].window.style.display = 'none';
            delete openWindows[appId];
        }
    };

    const bringToFront = (windowEl) => {
        highestZIndex++;
        windowEl.style.zIndex = highestZIndex;
    };

    const makeWindowsDraggable = () => {
        document.querySelectorAll('.window').forEach(windowEl => {
            const header = windowEl.querySelector('.window-header');
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('close-btn')) return;
                let offsetX = e.clientX - windowEl.offsetLeft;
                let offsetY = e.clientY - windowEl.offsetTop;
                const mouseMove = (e) => {
                    windowEl.style.left = `${e.clientX - offsetX}px`;
                    windowEl.style.top = `${e.clientY - offsetY}px`;
                };
                const mouseUp = () => {
                    document.removeEventListener('mousemove', mouseMove);
                    document.removeEventListener('mouseup', mouseUp);
                };
                document.addEventListener('mousemove', mouseMove);
                document.addEventListener('mouseup', mouseUp);
            });
        });
    };

    // --- 5. HESAP MAKİNESİ (Yeniden Yazıldı) ---
    class Calculator {
        constructor(prevEl, currentEl) {
            this.prevEl = prevEl;
            this.currentEl = currentEl;
            this.clear();
        }
        clear() {
            this.currentOperand = '';
            this.previousOperand = '';
            this.operation = undefined;
            this.updateDisplay();
        }
        delete() {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
        appendNumber(number) {
            if (number === '.' && this.currentOperand.includes('.')) return;
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        chooseOperation(operation) {
            if (this.currentOperand === '') return;
            if (this.previousOperand !== '') this.compute();
            this.operation = operation;
            this.previousOperand = this.currentOperand;
            this.currentOperand = '';
        }
        compute() {
            let computation;
            const prev = parseFloat(this.previousOperand);
            const current = parseFloat(this.currentOperand);
            if (isNaN(prev) || isNaN(current)) return;
            switch (this.operation) {
                case '+': computation = prev + current; break;
                case '-': computation = prev - current; break;
                case '*': computation = prev * current; break;
                case '÷': computation = prev / current; break;
                default: return;
            }
            this.currentOperand = computation;
            this.operation = undefined;
            this.previousOperand = '';
        }
        updateDisplay() {
            this.currentEl.innerText = this.currentOperand || '0';
            this.prevEl.innerText = this.operation ? `${this.previousOperand} ${this.operation}` : '';
        }
    }
    const calculator = new Calculator(
        document.querySelector('.previous-operand'),
        document.querySelector('.current-operand')
    );
    document.querySelectorAll('[data-number]').forEach(b => b.addEventListener('click', () => { calculator.appendNumber(b.innerText); calculator.updateDisplay(); }));
    document.querySelectorAll('[data-operation]').forEach(b => b.addEventListener('click', () => { calculator.chooseOperation(b.innerText); calculator.updateDisplay(); }));
    document.querySelector('[data-action="equals"]').addEventListener('click', () => { calculator.compute(); calculator.updateDisplay(); });
    document.querySelector('[data-action="clear"]').addEventListener('click', () => { calculator.clear(); });
    document.querySelector('[data-action="delete"]').addEventListener('click', () => { calculator.delete(); calculator.updateDisplay(); });

    // --- 6. SES AYARI (Yeni Eklendi) ---
    const setNotificationVolume = (volume, save = true) => {
        const newVolume = parseFloat(volume);
        if (isNaN(newVolume)) return;
        audioNotification.volume = newVolume;
        notificationVolumeSlider.value = newVolume;
        if (save) localStorage.setItem('brtos_notification_volume', newVolume);
    };
    notificationVolumeSlider.addEventListener('input', (e) => setNotificationVolume(e.target.value));
    notificationVolumeSlider.addEventListener('change', () => audioNotification.play());

    // --- 7. OLAY DİNLEYİCİLERİ VE BAŞLATMA ---
    const initializeSystem = () => {
        // İkonlara tıklama
        document.querySelectorAll('.desktop-icon, .start-menu-item').forEach(icon => {
            icon.addEventListener('click', () => {
                openWindow(icon.dataset.appId);
                startMenu.style.display = 'none';
            });
        });

        // Pencere kapatma
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeWindow(e.target.closest('.window').dataset.appId);
            });
        });
        
        // Pencereleri öne getirme
        document.querySelectorAll('.window').forEach(win => win.addEventListener('mousedown', () => bringToFront(win)));

        // Başlat menüsü
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && e.target !== startButton) {
                startMenu.style.display = 'none';
            }
        });

        // Zamanı güncelle
        updateTime();
        setInterval(updateTime, 60000);

        // Kayıtlı ayarları yükle
        const savedVolume = localStorage.getItem('brtos_notification_volume') || 0.5;
        setNotificationVolume(savedVolume, false);
        const savedTheme = localStorage.getItem('brtos_theme') || 'dark';
        document.body.className = `${savedTheme}-theme`;
        document.getElementById('theme-select').value = savedTheme;

        document.getElementById('theme-select').addEventListener('change', (e)=>{
            document.body.className = `${e.target.value}-theme`;
            localStorage.setItem('brtos_theme', e.target.value);
        });

        // Diğer fonksiyonları başlat
        makeWindowsDraggable();
        bootSystem();
    };

    initializeSystem();
});
