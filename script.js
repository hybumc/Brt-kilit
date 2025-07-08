document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTLERİ SEÇME ---
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const notificationsIcon = document.getElementById('notifications-icon');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationDot = document.getElementById('notification-dot');
    const notificationList = document.getElementById('notification-list');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSliderContainer = document.getElementById('volume-slider-container');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeSpan = document.getElementById('current-time');
    const runningAppsList = document.getElementById('running-apps-list');

    // --- SİSTEM DEĞİŞKENLERİ ---
    let activeWindows = {};
    let installedApps = JSON.parse(localStorage.getItem('brtosInstalledApps')) || {};
    let highestZIndex = 100;

    // --- SES ALTYAPISI ---
    const audioBootElement = new Audio('https://www.soundjay.com/buttons/sounds/button-1.mp3');
    const audioNotificationElement = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
    let audioContext, gainNode;

    // --- UYGULAMA TANIMLARI ---
    const APPS = {
        'settings': { name: 'Ayarlar', icon: '⚙️' },
        'task-manager': { name: 'Görev Yöneticisi', icon: '📊' },
        'brt-store': { name: 'BRT STORE', icon: '🛍️' },
        'calculator': { name: 'Hesap Makinesi', icon: '🧮' },
        'notepad': { name: 'Not Defteri', icon: '📝' }
    };

    // --- TEMEL SİSTEM FONKSİYONLARI ---

    function bootSystem() {
        // Saati başlat
        updateTime();
        setInterval(updateTime, 1000);

        // Açılış ekranını göster
        const bootScreen = document.getElementById('boot-screen');
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            audioBootElement.play().catch(e => console.warn("Autoplay engellendi."));
            setTimeout(() => {
                bootScreen.style.display = 'none';
                desktop.style.display = 'block';
                taskbar.style.display = 'flex';
                renderDesktopIcons();
            }, 1000);
        }, 2000);
    }

    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        currentTimeSpan.textContent = `${hours}:${minutes}`;
        
        // Widget saatini de güncelle
        const widgetTime = document.getElementById('widget-time');
        const widgetDate = document.getElementById('widget-date');
        if (widgetTime) widgetTime.textContent = `${hours}:${minutes}`;
        if (widgetDate) {
             const day = now.getDate().toString().padStart(2, '0');
             const month = (now.getMonth() + 1).toString().padStart(2, '0');
             const year = now.getFullYear();
             widgetDate.textContent = `${day}.${month}.${year}`;
        }
    }

    function addNotification(message) {
        audioNotificationElement.play().catch(e => console.warn("Ses çalınamadı."));
        notificationDot.style.display = 'block';
        const noNotificationMsg = notificationList.querySelector('.no-notifications');
        if (noNotificationMsg) noNotificationMsg.style.display = 'none';

        const item = document.createElement('div');
        item.className = 'notification-item';
        item.textContent = message;
        notificationList.prepend(item);
        setTimeout(() => item.remove(), 5000);
    }
    
    // --- PENCERE YÖNETİMİ ---

    function openWindow(appId) {
        if (!APPS[appId]) return;

        if (activeWindows[appId]) { // Pencere zaten açıksa öne getir
            bringWindowToFront(activeWindows[appId].element);
            return;
        }

        const windowElement = document.getElementById(`${appId}-window`);
        if (!windowElement) return;

        windowElement.style.display = 'flex';
        bringWindowToFront(windowElement);
        
        activeWindows[appId] = {
            id: appId,
            name: APPS[appId].name,
            element: windowElement,
        };
        updateTaskManagerList();
    }
    
    function closeWindow(appId) {
        if (!activeWindows[appId]) return;
        
        const { element, name } = activeWindows[appId];
        element.style.display = 'none';
        delete activeWindows[appId];
        
        addNotification(`'${name}' kapatıldı.`);
        updateTaskManagerList();
    }

    function bringWindowToFront(windowElement) {
        highestZIndex++;
        windowElement.style.zIndex = highestZIndex;
        // Tüm pencerelerden 'active' sınıfını kaldır
        document.querySelectorAll('.window').forEach(win => win.classList.remove('active'));
        // Tıklanan pencereye 'active' sınıfını ekle
        windowElement.classList.add('active');
    }

    function updateTaskManagerList() {
        runningAppsList.innerHTML = '';
        if (Object.keys(activeWindows).length === 0) {
            runningAppsList.innerHTML = '<li>Çalışan uygulama yok.</li>';
            return;
        }
        for (const appId in activeWindows) {
            const app = activeWindows[appId];
            const li = document.createElement('li');
            li.textContent = app.name;
            const terminateBtn = document.createElement('button');
            terminateBtn.textContent = 'Sonlandır';
            terminateBtn.onclick = () => closeWindow(appId);
            li.appendChild(terminateBtn);
            runningAppsList.appendChild(li);
        }
    }
    
    // --- İKON VE MENÜ RENDER ---
    
    function renderDesktopIcons() {
        // Sistem uygulamaları her zaman yüklüdür
        installedApps['settings'] = true;
        installedApps['task-manager'] = true;
        installedApps['brt-store'] = true;

        document.querySelectorAll('.desktop-icon').forEach(icon => {
            const appId = icon.dataset.appId;
            if (installedApps[appId]) {
                icon.style.display = 'flex';
                setTimeout(() => icon.classList.add('loaded'), Math.random() * 500);
            } else {
                icon.style.display = 'none';
            }
        });
        renderStartMenuApps();
    }

    function renderStartMenuApps() {
        const appListContainer = document.getElementById('start-menu-apps-list');
        appListContainer.innerHTML = '';
        Object.keys(installedApps).forEach(appId => {
            if (installedApps[appId] && APPS[appId] && !['settings', 'task-manager', 'brt-store'].includes(appId)) {
                const item = document.createElement('div');
                item.className = 'start-menu-item';
                item.dataset.appId = appId;
                item.innerHTML = `<span>${APPS[appId].icon}</span> <span>${APPS[appId].name}</span>`;
                appListContainer.appendChild(item);
            }
        });
    }

    // --- OLAY DİNLEYİCİLERİ ---

    function setupEventListeners() {
        // İlk tıklamada ses altyapısını kur
        document.body.addEventListener('click', setupAudio, { once: true });

        // Masaüstü ve Başlat Menüsü tıklamaları
        desktop.addEventListener('click', (e) => {
            // Panelleri kapat
            startMenu.classList.remove('show');
            notificationPanel.classList.remove('show');
            volumeSliderContainer.classList.remove('show');

            // Bir masaüstü simgesine tıklandıysa uygulamayı aç
            const icon = e.target.closest('.desktop-icon');
            if (icon) {
                openWindow(icon.dataset.appId);
            }
        });

        startMenu.addEventListener('click', (e) => {
            const item = e.target.closest('.start-menu-item');
            if (item && item.dataset.appId) {
                openWindow(item.dataset.appId);
                startMenu.classList.remove('show');
            }
        });

        // Görev Çubuğu Butonları
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPanel.classList.remove('show');
            volumeSliderContainer.classList.remove('show');
            startMenu.classList.toggle('show');
        });
        
        notificationsIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.remove('show');
            volumeSliderContainer.classList.remove('show');
            notificationPanel.classList.toggle('show');
            notificationDot.style.display = 'none';
        });

        volumeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.remove('show');
            notificationPanel.classList.remove('show');
            volumeSliderContainer.classList.toggle('show');
        });

        volumeSlider.addEventListener('input', (e) => {
            if (gainNode) gainNode.gain.value = e.target.value;
            audioBootElement.volume = e.target.value;
            audioNotificationElement.volume = e.target.value;
        });

        // Pencere Kontrolleri (Kapat, Küçült vb.)
        document.querySelectorAll('.window').forEach(windowEl => {
            const header = windowEl.querySelector('.window-header');
            const appId = windowEl.id.replace('-window', '');

            // Pencereyi öne getirme
            windowEl.addEventListener('mousedown', () => bringWindowToFront(windowEl));
            
            // Pencere kontrolleri
            header.querySelector('.close-button')?.addEventListener('click', () => closeWindow(appId));
            // Diğer kontroller (minimize, maximize) buraya eklenebilir
            
            // Sürüklenebilir yapma
            makeDraggable(windowEl, header);
        });

        // Diğer uygulama özel event'leri
        setupBrtStore();
        setupCalculator();
        // Not Defteri ve diğerleri için de benzer fonksiyonlar oluşturulabilir.
    }
    
    // --- UYGULAMA ÖZEL FONKSİYONLARI ---

    function setupBrtStore() {
        const storeWindow = document.getElementById('brt-store-window');
        const storeAppList = document.getElementById('store-app-list');
        
        function renderStore() {
            storeAppList.innerHTML = '';
            Object.keys(APPS).forEach(appId => {
                // Sadece yüklenebilir uygulamaları göster
                if (['calculator', 'notepad'].includes(appId)) {
                    const isInstalled = !!installedApps[appId];
                    const app = APPS[appId];
                    const card = document.createElement('div');
                    card.className = 'app-card';
                    card.innerHTML = `
                        <h4>${app.name}</h4>
                        <button class="install-btn" data-app-id="${appId}" ${isInstalled ? 'disabled' : ''}>${isInstalled ? 'Yüklendi' : 'Yükle'}</button>
                        ${isInstalled ? `<button class="uninstall-btn" data-app-id="${appId}">Kaldır</button>` : ''}
                    `;
                    storeAppList.appendChild(card);
                }
            });
        }
        
        storeWindow.addEventListener('click', (e) => {
            const target = e.target;
            const appId = target.dataset.appId;
            if (target.classList.contains('install-btn') && !target.disabled) {
                installedApps[appId] = true;
                localStorage.setItem('brtosInstalledApps', JSON.stringify(installedApps));
                addNotification(`${APPS[appId].name} yüklendi.`);
                renderDesktopIcons();
                renderStore();
            } else if (target.classList.contains('uninstall-btn')) {
                delete installedApps[appId];
                localStorage.setItem('brtosInstalledApps', JSON.stringify(installedApps));
                addNotification(`${APPS[appId].name} kaldırıldı.`);
                renderDesktopIcons();
                renderStore();
            }
        });
        
        // Mağaza açıldığında listeyi render et
        document.querySelector('[data-app-id="brt-store"]').addEventListener('click', renderStore);
    }
    
    function setupCalculator() {
        const display = document.getElementById('calculator-display');
        const buttons = document.getElementById('calculator-buttons');
        let currentValue = '';
        let operator = '';
        let previousValue = '';

        buttons.addEventListener('click', e => {
            const btn = e.target;
            const value = btn.textContent;

            if (!isNaN(value) || value === '.') {
                currentValue += value;
                display.textContent = currentValue;
            } else if (btn.classList.contains('operator')) {
                previousValue = currentValue;
                currentValue = '';
                operator = value;
            } else if (btn.classList.contains('equals')) {
                if (previousValue && currentValue && operator) {
                    const result = eval(`${previousValue} ${operator} ${currentValue}`);
                    display.textContent = result;
                    currentValue = result;
                    previousValue = '';
                }
            } else if (btn.classList.contains('clear')) {
                currentValue = '';
                previousValue = '';
                operator = '';
                display.textContent = '0';
            }
        });
    }

    // --- YARDIMCI FONKSİYONLAR ---

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    function setupAudio() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        
        const source1 = audioContext.createMediaElementSource(audioBootElement);
        const source2 = audioContext.createMediaElementSource(audioNotificationElement);
        
        source1.connect(gainNode);
        source2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Slider değerini ses seviyesine ata
        gainNode.gain.value = volumeSlider.value;
        audioBootElement.volume = volumeSlider.value;
        audioNotificationElement.volume = volumeSlider.value;
    }

    // --- SİSTEMİ BAŞLAT ---
    setupEventListeners();
    bootSystem();
});
