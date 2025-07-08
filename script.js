document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM ELEMENTLERİ ---
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const bootScreen = document.getElementById('boot-screen');
    const currentTimeSpan = document.getElementById('current-time');

    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    
    const volumeIcon = document.getElementById('volume-icon');
    const volumePanel = document.getElementById('volume-panel');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeLevelText = document.getElementById('volume-level-text');

    const openAppsBar = document.getElementById('open-apps-bar');
    
    // --- 2. SİSTEM DEĞİŞKENLERİ ---
    let openWindows = {}; // Açık pencereleri takip etmek için
    let highestZIndex = 100;
    
    const appData = {
        'settings': { name: 'Ayarlar', window: document.getElementById('settings-window') },
        'brt-store': { name: 'BRT Store', window: document.getElementById('brt-store-window') },
        'calculator': { name: 'Hesap Makinesi', window: document.getElementById('calculator-window') },
    };

    // --- 3. TEMEL SİSTEM FONKSİYONLARI ---
    
    function updateTime() {
        const now = new Date();
        currentTimeSpan.textContent = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }

    function bootSystem() {
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            setTimeout(() => {
                bootScreen.style.display = 'none';
                desktop.style.display = 'block';
                taskbar.style.display = 'flex';
            }, 1000);
        }, 2000); // 2 saniyelik açılış süresi
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
            appIcon.onclick = () => {
                openWindow(appId);
            };
            openAppsBar.appendChild(appIcon);
        }
    }

    function setActiveTaskbarIcon(activeAppId) {
        document.querySelectorAll('.taskbar-app').forEach(icon => {
            if(icon.dataset.appId === activeAppId) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });
    }

    // --- 6. UYGULAMA MANTIKLARI ---
    
    // a) Hesap Makinesi
    const calcDisplay = document.getElementById('calculator-display');
    const calcHistoryList = document.getElementById('calc-history-list');
    let calcHistory = [];
    
    document.getElementById('calculator-buttons').addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;
        const key = e.target.textContent;
        const currentVal = calcDisplay.textContent;

        if (key === 'C') {
            calcDisplay.textContent = '0';
        } else if (key === 'CE') {
            calcDisplay.textContent = '0';
        } else if (key === '=') {
            try {
                const result = eval(currentVal.replace(/%/g, '/100'));
                addCalcHistory(`${currentVal} = ${result}`);
                calcDisplay.textContent = result;
            } catch {
                calcDisplay.textContent = 'Hata';
            }
        } else {
            if (currentVal === '0' || currentVal === 'Hata') {
                calcDisplay.textContent = key;
            } else {
                calcDisplay.textContent += key;
            }
        }
    });

    function addCalcHistory(entry) {
        calcHistory.unshift(entry);
        if (calcHistory.length > 10) calcHistory.pop();
        
        calcHistoryList.innerHTML = '';
        calcHistory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            calcHistoryList.appendChild(li);
        });
    }

    // --- 7. OLAY DİNLEYİCİLERİNİ BAŞLATMA ---
    function initializeEventListeners() {
        // Masaüstü Simgeleri
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const appId = e.currentTarget.dataset.appId;
                openWindow(appId);
            });
        });
        
        // Başlat Menüsü
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && e.target !== startButton) {
                startMenu.style.display = 'none';
            }
            if (!volumePanel.contains(e.target) && e.target !== volumeIcon) {
                volumePanel.style.display = 'none';
            }
        });
        
        // Başlat Menüsü Uygulamaları
        startMenu.addEventListener('click', (e) => {
            const target = e.target.closest('.start-menu-item');
            if (target) {
                openWindow(target.dataset.appId);
                startMenu.style.display = 'none';
            }
        });

        // Pencere Kapatma Butonları
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const appId = e.target.closest('.window').dataset.appId;
                closeWindow(appId);
            });
        });
        
        // Pencereleri Öne Getirme
        document.querySelectorAll('.window').forEach(win => {
           win.addEventListener('mousedown', () => bringToFront(win)); 
        });

        // Ses Ayarlayıcı
        volumeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            volumePanel.style.display = volumePanel.style.display === 'block' ? 'none' : 'block';
        });
        volumeSlider.addEventListener('input', (e) => {
            volumeLevelText.textContent = e.target.value;
        });
    }

    // --- 8. SİSTEMİ BAŞLAT ---
    updateTime();
    setInterval(updateTime, 1000);
    initializeEventListeners();
    makeWindowsDraggable();
    bootSystem();
});
