document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM ELEMENTLERİ ---
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const bootScreen = document.getElementById('boot-screen');
    const currentTimeSpan = document.getElementById('current-time');

    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    
    // YENİ EKLENDİ: Ses Kontrol Elemanları
    const notificationVolumeSlider = document.getElementById('notification-volume');
    const audioNotification = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');

    const openAppsBar = document.getElementById('open-apps-bar');
    
    // --- 2. SİSTEM DEĞİŞKENLERİ ---
    let openWindows = {};
    let highestZIndex = 100;
    
    const appData = {
        'settings': { name: 'Ayarlar', window: document.getElementById('settings-window') },
        'calculator': { name: 'Hesap Makinesi', window: document.getElementById('calculator-window') },
    };

    // --- 3. TEMEL SİSTEM FONKSİYONLARI ---
    
    function updateTime() {
        currentTimeSpan.textContent = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }

    function bootSystem() {
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            setTimeout(() => {
                bootScreen.style.display = 'none';
                desktop.style.display = 'block';
                taskbar.style.display = 'flex';
            }, 1000);
        }, 1500);
    }

    // --- 4. PENCERE YÖNETİMİ ---

    function openWindow(appId) {
        const app = appData[appId];
        if (!app) return;

        app.window.style.display = 'flex';
        bringToFront(app.window);
        
        if (!openWindows[appId]) {
            openWindows[appId] = app;
            updateTaskbar();
        }
        setActiveTaskbarIcon(appId);
    }
    
    function closeWindow(appId) {
        const app = appData[appId];
        if (app) {
            app.window.style.display = 'none';
            delete openWindows[appId];
            updateTaskbar();
        }
    }
    
    function bringToFront(windowEl) {
        highestZIndex++;
        windowEl.style.zIndex = highestZIndex;
        if(windowEl.dataset.appId) {
            setActiveTaskbarIcon(windowEl.dataset.appId);
        }
    }

    function makeWindowsDraggable() {
        document.querySelectorAll('.window').forEach(windowEl => {
            const header = windowEl.querySelector('.window-header');
            header.addEventListener('mousedown', (e) => {
                let offsetX = e.clientX - windowEl.offsetLeft;
                let offsetY = e.clientY - windowEl.offsetTop;
                function mouseMove(e) {
                    windowEl.style.left = `${e.clientX - offsetX}px`;
                    windowEl.style.top = `${e.clientY - offsetY}px`;
                }
                function mouseUp() {
                    document.removeEventListener('mousemove', mouseMove);
                    document.removeEventListener('mouseup', mouseUp);
                }
                document.addEventListener('mousemove', mouseMove);
                document.addEventListener('mouseup', mouseUp);
            });
        });
    }

    // --- 5. GÖREV ÇUBUĞU YÖNETİMİ ---

    function updateTaskbar() {
        openAppsBar.innerHTML = '';
        for (const appId in openWindows) {
            const appIcon = document.createElement('span');
            appIcon.className = 'taskbar-app';
            appIcon.textContent = openWindows[appId].name;
            appIcon.dataset.appId = appId;
            appIcon.onclick = () => openWindow(appId);
            openAppsBar.appendChild(appIcon);
        }
    }

    function setActiveTaskbarIcon(activeAppId) {
        document.querySelectorAll('.taskbar-app').forEach(icon => {
            icon.classList.toggle('active', icon.dataset.appId === activeAppId);
        });
    }

    // --- 6. UYGULAMA MANTIKLARI ---
    
    // a) YENİ HESAP MAKİNESİ MANTIĞI
    class Calculator {
        constructor(previousOperandTextElement, currentOperandTextElement) {
            this.previousOperandTextElement = previousOperandTextElement;
            this.currentOperandTextElement = currentOperandTextElement;
            this.clear();
        }

        clear() {
            this.currentOperand = '';
            this.previousOperand = '';
            this.operation = undefined;
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
            if (this.previousOperand !== '') {
                this.compute();
            }
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
            this.currentOperandTextElement.innerText = this.currentOperand;
            if (this.operation != null) {
                this.previousOperandTextElement.innerText = `${this.previousOperand} ${this.operation}`;
            } else {
                this.previousOperandTextElement.innerText = '';
            }
        }
    }

    const calculator = new Calculator(
        document.querySelector('.previous-operand'),
        document.querySelector('.current-operand')
    );

    document.querySelectorAll('[data-number]').forEach(button => {
        button.addEventListener('click', () => {
            calculator.appendNumber(button.innerText);
            calculator.updateDisplay();
        });
    });

    document.querySelectorAll('[data-operation]').forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.innerText);
            calculator.updateDisplay();
        });
    });

    document.querySelector('[data-action="equals"]').addEventListener('click', () => {
        calculator.compute();
        calculator.updateDisplay();
    });

    document.querySelector('[data-action="clear"]').addEventListener('click', () => {
        calculator.clear();
        calculator.updateDisplay();
    });

    document.querySelector('[data-action="delete"]').addEventListener('click', () => {
        calculator.delete();
        calculator.updateDisplay();
    });

    // b) YENİ EKLENDİ: Ses Ayarı Mantığı
    function setNotificationVolume(volume, save = true) {
        const newVolume = parseFloat(volume);
        if (isNaN(newVolume)) return;
        
        audioNotification.volume = newVolume;
        notificationVolumeSlider.value = newVolume;
        if (save) {
            localStorage.setItem('brtos_notification_volume', newVolume);
        }
    }
    
    notificationVolumeSlider.addEventListener('input', (e) => setNotificationVolume(e.target.value));
    notificationVolumeSlider.addEventListener('change', () => audioNotification.play()); // Ayar değiştiğinde test sesi


    // --- 7. OLAY DİNLEYİCİLERİNİ BAŞLATMA ---
    function initializeEventListeners() {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('click', () => openWindow(icon.dataset.appId));
        });
        
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && e.target !== startButton) {
                startMenu.style.display = 'none';
            }
        });
        
        startMenu.addEventListener('click', (e) => {
            const target = e.target.closest('.start-menu-item');
            if (target) {
                openWindow(target.dataset.appId);
                startMenu.style.display = 'none';
            }
        });

        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeWindow(e.target.closest('.window').dataset.appId);
            });
        });
        
        document.querySelectorAll('.window').forEach(win => {
           win.addEventListener('mousedown', () => bringToFront(win)); 
        });
    }

    // --- 8. SİSTEMİ BAŞLAT ---
    updateTime();
    setInterval(updateTime, 1000);
    
    // Kaydedilmiş ses ayarını yükle
    const savedVolume = localStorage.getItem('brtos_notification_volume') || 0.5;
    setNotificationVolume(savedVolume, false);

    initializeEventListeners();
    makeWindowsDraggable();
    bootSystem();
});
