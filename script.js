document.addEventListener('DOMContentLoaded', () => {
    // TEMEL ELEMENTLER
    const bootScreen = document.getElementById('boot-screen');
    const bootMessage = document.getElementById('boot-message');
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const osTitle = document.getElementById('os-title');
    const currentTimeSpan = document.getElementById('current-time');

    // WIDGET ELEMENTLERİ
    const timeWidget = document.getElementById('time-widget');
    const widgetTime = document.getElementById('widget-time');
    const widgetDate = document.getElementById('widget-date');

    // PENCERE ELEMENTLERİ
    const settingsWindow = document.getElementById('settings-window');
    const taskManagerWindow = document.getElementById('task-manager-window');
    const brtStoreWindow = document.getElementById('brt-store-window');
    const calculatorWindow = document.getElementById('calculator-window');
    const notepadWindow = document.getElementById('notepad-window');
    
    // İKON ve BUTON ELEMENTLERİ
    const settingsDesktopIcon = document.getElementById('settings-desktop-icon');
    const taskManagerDesktopIcon = document.getElementById('task-manager-desktop-icon');
    const brtStoreDesktopIcon = document.getElementById('brt-store-desktop-icon');
    const calculatorDesktopIcon = document.getElementById('calculator-desktop-icon');
    const notepadDesktopIcon = document.getElementById('notepad-desktop-icon');

    const closeSettingsButton = document.getElementById('close-settings-button');
    const closeTaskManagerButton = document.getElementById('close-task-manager-button');
    const closeBrtStoreButton = document.getElementById('close-brt-store-button');
    const closeCalculatorButton = document.getElementById('close-calculator-button');
    const closeNotepadButton = document.getElementById('close-notepad-button');

    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');

    const notificationsIcon = document.getElementById('notifications-icon');
    const notificationDot = document.getElementById('notification-dot');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationList = document.getElementById('notification-list');
    
    // UYGULAMA İÇİ ELEMENTLER
    const runningAppsList = document.getElementById('running-apps-list');
    const storeAppList = document.getElementById('store-app-list');
    const calculatorDisplay = document.getElementById('calculator-display');
    const calculatorButtons = document.getElementById('calculator-buttons');
    const createNewNoteButton = document.getElementById('create-new-note');
    const notepadNotesList = document.getElementById('notepad-notes-list');
    const notepadNoteEditor = document.getElementById('notepad-note-editor');
    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentInput = document.getElementById('note-content-input');
    const saveNoteButton = document.getElementById('save-note-button');
    const cancelNoteButton = document.getElementById('cancel-note-button');
    const themeSelect = document.getElementById('theme-select');
    const currentBrtosVersionSpan = document.getElementById('current-brtos-version');
    const checkforUpdatesButton = document.getElementById('check-for-updates');
    const updateStatusMessage = document.getElementById('update-status-message');


    // SİSTEM DEĞİŞKENLERİ VE VERİLERİ
    const audioBoot = new Audio('https://www.soundjay.com/buttons/sounds/button-1.mp3');
    const audioNotification = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
    let installedApps = JSON.parse(localStorage.getItem('brtosInstalledApps')) || {};
    let notes = JSON.parse(localStorage.getItem('brtosNotes')) || [];
    let activeWindows = {};

    const availableApps = [
        { id: 'settings', name: 'Ayarlar', windowElement: settingsWindow, openFunction: () => openWindow(settingsWindow, 'settings', 'Ayarlar') },
        { id: 'task-manager', name: 'Görev Yöneticisi', windowElement: taskManagerWindow, openFunction: () => openWindow(taskManagerWindow, 'task-manager', 'Görev Yöneticisi') },
        { id: 'brt-store', name: 'BRT STORE', windowElement: brtStoreWindow, openFunction: () => openWindow(brtStoreWindow, 'brt-store', 'BRT STORE') },
        { id: 'calculator', name: 'Hesap Makinesi', windowElement: calculatorWindow, openFunction: () => openWindow(calculatorWindow, 'calculator', 'Hesap Makinesi') },
        { id: 'notepad', name: 'Not Defteri', windowElement: notepadWindow, openFunction: () => openWindow(notepadWindow, 'notepad', 'Not Defteri') }
    ];

    // --- SİSTEM BAŞLANGIÇ FONKSİYONLARI ---

    function bootSystem() {
        updateTime();
        setInterval(updateTime, 1000);

        setTimeout(() => {
            bootScreen.classList.add('hidden');
            audioBoot.play();
            setTimeout(() => {
                bootScreen.style.display = 'none';
                desktop.style.display = 'block';
                taskbar.style.display = 'flex';
                renderDesktopIcons();
            }, 1000);
        }, 2000); // 2 saniye açılış süresi
    }

    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();

        currentTimeSpan.textContent = `${hours}:${minutes}`;
        if (widgetTime) widgetTime.textContent = `${hours}:${minutes}`;
        if (widgetDate) widgetDate.textContent = `${day}.${month}.${year}`;
    }

    // --- PENCERE YÖNETİMİ ---

    function openWindow(windowElement, appId, appName) {
        if (windowElement.style.display === 'flex' && !windowElement.classList.contains('minimized')) {
            bringWindowToFront(windowElement);
            return;
        }

        if (windowElement.classList.contains('minimized')) {
            windowElement.classList.remove('minimized');
        }

        windowElement.style.display = 'flex';
        bringWindowToFront(windowElement);
        addAppToTaskManager(appName, appId, windowElement);
    }

    function closeWindow(windowElement, appId) {
        windowElement.style.display = 'none';
        removeAppFromTaskManager(appId);
        addNotification(`'${activeWindows[appId]?.name || appId}' kapatıldı.`);
    }
    
    function minimizeWindow(windowElement, appId) {
        windowElement.classList.add('minimized');
        setTimeout(() => { windowElement.style.display = 'none'; }, 300);
        if(activeWindows[appId]) activeWindows[appId].minimized = true;
        updateTaskManagerList();
    }

    function bringWindowToFront(windowElement) {
        let maxZIndex = 1001;
        document.querySelectorAll('.window').forEach(el => {
            const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10);
            if (zIndex > maxZIndex) maxZIndex = zIndex;
        });
        windowElement.style.zIndex = maxZIndex + 1;
    }
    
    // --- GÖREV YÖNETİCİSİ ---
    
    function addAppToTaskManager(appName, appId, windowElement) {
        if (!activeWindows[appId]) {
            activeWindows[appId] = { name: appName, element: windowElement, minimized: false };
            updateTaskManagerList();
        }
    }

    function removeAppFromTaskManager(appId) {
        if (activeWindows[appId]) {
            delete activeWindows[appId];
            updateTaskManagerList();
        }
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
            terminateBtn.onclick = () => closeWindow(app.element, appId);
            li.appendChild(terminateBtn);
            runningAppsList.appendChild(li);
        }
    }


    // --- SÜRÜKLEME FONKSİYONU ---
    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const dragHandle = handle || element;

        dragHandle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            bringWindowToFront(element);
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
    
    // --- UYGULAMA MANTIKLARI ---
    
    // BRT Store
    function renderBrtStore() {
        storeAppList.innerHTML = '';
        const appsToDisplay = availableApps.filter(app => ['calculator', 'notepad'].includes(app.id));
        appsToDisplay.forEach(app => {
            const isInstalled = installedApps[app.id] && installedApps[app.id].installed;
            const card = document.createElement('div');
            card.className = 'app-card';
            card.innerHTML = `
                <img src="${document.getElementById(app.id + '-desktop-icon').querySelector('img').src}" alt="${app.name}">
                <h4>${app.name}</h4>
                <div class="progress-overlay"></div>
                <button class="install-btn" data-app-id="${app.id}" ${isInstalled ? 'disabled' : ''}>${isInstalled ? 'Yüklendi' : 'Yükle'}</button>
                ${isInstalled ? `<button class="uninstall-btn" data-app-id="${app.id}">Kaldır</button>` : ''}
            `;
            storeAppList.appendChild(card);
        });
    }
    
    function installApp(appId) {
        installedApps[appId] = { installed: true };
        localStorage.setItem('brtosInstalledApps', JSON.stringify(installedApps));
        addNotification(`${appId} yüklendi!`);
        renderBrtStore();
        renderDesktopIcons();
    }
    
    function uninstallApp(appId) {
        if (confirm(`${appId} uygulamasını kaldırmak istediğinizden emin misiniz?`)) {
            delete installedApps[appId];
            localStorage.setItem('brtosInstalledApps', JSON.stringify(installedApps));
            addNotification(`${appId} kaldırıldı.`);
            renderBrtStore();
            renderDesktopIcons();
        }
    }
    
    // Hesap Makinesi
    let calcCurrentInput = '0';
    let calcOperator = null;
    let calcFirstOperand = null;
    let calcWaitingForSecond = false;
    
    function updateCalcDisplay() { calculatorDisplay.textContent = calcCurrentInput; }
    
    function handleCalculatorClick(e) {
        const target = e.target;
        if (!target.matches('button')) return;

        if (target.classList.contains('operator')) {
             handleOperator(target.textContent);
        } else if (target.classList.contains('decimal')) {
            inputDecimal(target.textContent);
        } else if (target.classList.contains('clear')) {
            resetCalculator();
        } else if (target.classList.contains('equals')) {
            calculate();
        } else {
            inputDigit(target.textContent);
        }
        updateCalcDisplay();
    }
    
    function inputDigit(digit) {
        if (calcWaitingForSecond) {
            calcCurrentInput = digit;
            calcWaitingForSecond = false;
        } else {
            calcCurrentInput = calcCurrentInput === '0' ? digit : calcCurrentInput + digit;
        }
    }
    
    function inputDecimal(dot) {
        if (!calcCurrentInput.includes(dot)) calcCurrentInput += dot;
    }
    
    function handleOperator(nextOperator) {
        const inputValue = parseFloat(calcCurrentInput);
        if (calcOperator && calcWaitingForSecond) {
            calcOperator = nextOperator;
            return;
        }
        if (calcFirstOperand === null) {
            calcFirstOperand = inputValue;
        } else if (calcOperator) {
            const result = performCalculation[calcOperator](calcFirstOperand, inputValue);
            calcCurrentInput = String(result);
            calcFirstOperand = result;
        }
        calcWaitingForSecond = true;
        calcOperator = nextOperator;
    }

    const performCalculation = {
        '/': (first, second) => first / second,
        '*': (first, second) => first * second,
        '+': (first, second) => first + second,
        '-': (first, second) => first - second,
    };
    
    function calculate() {
        if (calcOperator && !calcWaitingForSecond) {
            const result = performCalculation[calcOperator](calcFirstOperand, parseFloat(calcCurrentInput));
            calcCurrentInput = String(result);
            calcOperator = null;
            calcFirstOperand = null;
        }
    }
    
    function resetCalculator() {
        calcCurrentInput = '0';
        calcOperator = null;
        calcFirstOperand = null;
        calcWaitingForSecond = false;
    }
    
    // Not Defteri
    let currentEditingNoteId = null;
    function renderNotepadNotes() {
        notepadNotesList.innerHTML = '';
        if (notes.length === 0) {
            notepadNotesList.innerHTML = '<li>Henüz not yok.</li>';
            return;
        }
        notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note.title || 'Başlıksız Not';
            li.dataset.noteId = note.id;
            li.onclick = () => editNote(note.id);
            notepadNotesList.appendChild(li);
        });
    }
    
    function showNoteEditor(note) {
        if (note) {
            currentEditingNoteId = note.id;
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
        } else {
            currentEditingNoteId = null;
            noteTitleInput.value = '';
            noteContentInput.value = '';
        }
        notepadNoteEditor.style.display = 'block';
    }
    
    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        if (currentEditingNoteId) {
            const noteIndex = notes.findIndex(n => n.id === currentEditingNoteId);
            notes[noteIndex] = { ...notes[noteIndex], title, content };
        } else {
            notes.push({ id: Date.now(), title, content });
        }
        localStorage.setItem('brtosNotes', JSON.stringify(notes));
        notepadNoteEditor.style.display = 'none';
        renderNotepadNotes();
    }
    
    function editNote(id) {
        const note = notes.find(n => n.id === id);
        showNoteEditor(note);
    }
    
    // --- Bildirimler ---
    function addNotification(message) {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.textContent = message;
        notificationList.prepend(item);
        notificationDot.style.display = 'block';
        audioNotification.play();
        const noNotificationMsg = notificationList.querySelector('.no-notifications');
        if (noNotificationMsg) noNotificationMsg.style.display = 'none';

        setTimeout(() => item.remove(), 5000);
    }
    
    // --- MASAÜSTÜ İKON YÖNETİMİ ---
    function renderDesktopIcons() {
        // Varsayılan uygulamaları her zaman yüklü kabul et
        ['settings', 'task-manager', 'brt-store'].forEach(id => {
            installedApps[id] = { installed: true };
        });
        
        availableApps.forEach(app => {
            const iconElement = document.getElementById(`${app.id}-desktop-icon`);
            if (iconElement) {
                const isInstalled = installedApps[app.id] && installedApps[app.id].installed;
                iconElement.style.display = isInstalled ? 'flex' : 'none';
                if (isInstalled) {
                    iconElement.classList.add('loaded');
                }
            }
        });
    }

    // --- ETKİNLİK DİNLEYİCİLERİ (Event Listeners) ---
    function setupEventListeners() {
        // Pencereler
        settingsDesktopIcon.onclick = () => openWindow(settingsWindow, 'settings', 'Ayarlar');
        taskManagerDesktopIcon.onclick = () => openWindow(taskManagerWindow, 'task-manager', 'Görev Yöneticisi');
        brtStoreDesktopIcon.onclick = () => { openWindow(brtStoreWindow, 'brt-store', 'BRT STORE'); renderBrtStore(); };
        calculatorDesktopIcon.onclick = () => openWindow(calculatorWindow, 'calculator', 'Hesap Makinesi');
        notepadDesktopIcon.onclick = () => { openWindow(notepadWindow, 'notepad', 'Not Defteri'); renderNotepadNotes(); };

        closeSettingsButton.onclick = () => closeWindow(settingsWindow, 'settings');
        closeTaskManagerButton.onclick = () => closeWindow(taskManagerWindow, 'task-manager');
        closeBrtStoreButton.onclick = () => closeWindow(brtStoreWindow, 'brt-store');
        closeCalculatorButton.onclick = () => closeWindow(calculatorWindow, 'calculator');
        closeNotepadButton.onclick = () => closeWindow(notepadWindow, 'notepad');

        // Görev Çubuğu
        startButton.onclick = (e) => { e.stopPropagation(); startMenu.classList.toggle('show'); };
        desktop.onclick = () => startMenu.classList.remove('show');
        notificationsIcon.onclick = (e) => { e.stopPropagation(); notificationPanel.classList.toggle('show'); notificationDot.style.display = 'none'; };
        
        // Tema Değişikliği
        themeSelect.onchange = (e) => {
            document.body.className = `${e.target.value}-theme`;
        };
        
        // BRT Store Butonları
        storeAppList.addEventListener('click', (e) => {
            const appId = e.target.dataset.appId;
            if (e.target.classList.contains('install-btn')) installApp(appId);
            if (e.target.classList.contains('uninstall-btn')) uninstallApp(appId);
        });
        
        // Hesap Makinesi
        calculatorButtons.onclick = handleCalculatorClick;

        // Not Defteri
        createNewNoteButton.onclick = () => showNoteEditor(null);
        saveNoteButton.onclick = saveNote;
        cancelNoteButton.onclick = () => { notepadNoteEditor.style.display = 'none'; };

        // Pencereleri sürüklenebilir yap
        document.querySelectorAll('.window').forEach(windowEl => {
            makeDraggable(windowEl, windowEl.querySelector('.window-header'));
        });
    }

    // --- SİSTEMİ BAŞLAT ---
    setupEventListeners();
    bootSystem();
});
