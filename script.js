document.addEventListener('DOMContentLoaded', () => {

    // --- 1. VERİ YAPILARI VE SABİTLER ---

    // Uygulama veritabanı
    const APPS_DB = [
        { id: 'settings', name: 'Ayarlar', icon: 'fa-solid fa-gear', category: 'utilities', description: 'Sistem temasını ve genel ayarları değiştirin.' },
        { id: 'brt-store', name: 'BRT Store', icon: 'fa-solid fa-store', category: 'utilities', description: 'BRTOS için yeni uygulamalar edinin.' },
        { id: 'calculator', name: 'Hesap Makinesi', icon: 'fa-solid fa-calculator', category: 'utilities', description: 'Standart ve bilimsel hesaplamalar yapın.', rating: 5 },
        { id: 'password-manager', name: 'Şifre Yöneticisi', icon: 'fa-solid fa-key', category: 'utilities', description: 'Şifrelerinizi yerel olarak güvenle saklayın.', rating: 4 },
    ];

    // Hesap makinesi tuşları
    const CALC_KEYS = {
        standard: [
            ['C', 'CE', '%', '/'],
            ['7', '8', '9', '*'],
            ['4', '5', '6', '-'],
            ['1', '2', '3', '+'],
            ['+/-', '0', '.', '=']
        ],
        scientific: [
            ['(', ')', '√', '^'],
            ['sin', 'cos', 'tan', 'log'],
            ['ln', 'e', 'π', '!'],
            ...JSON.parse(JSON.stringify(CALC_KEYS.standard)) // Standart tuşları kopyala
        ]
    };
    
    // Sanal klavye tuşları
    const KEYBOARD_LAYOUT = [ "1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm" ];


    // --- 2. DOM ELEMENTLERİ SEÇİMİ ---
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const currentTimeSpan = document.getElementById('current-time');
    const allWindows = document.querySelectorAll('.window');
    
    // Sistem Tepsisi
    const volumeIcon = document.getElementById('volume-icon');
    const volumePanel = document.getElementById('volume-panel');
    const notificationsIcon = document.getElementById('notifications-icon');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationDot = document.getElementById('notification-dot');

    // Sanal Klavye
    const keyboardToggleIcon = document.getElementById('keyboard-toggle-icon');
    const virtualKeyboard = document.getElementById('virtual-keyboard');


    // --- 3. SİSTEM DURUMU (STATE) ---
    let activeWindows = {};
    let highestZIndex = 100;
    let systemVolume = 80;
    let passwords = JSON.parse(localStorage.getItem('brtos_passwords')) || [];


    // --- 4. TEMEL SİSTEM FONKSİYONLARI ---

    function bootSystem() {
        // ... (boot logic)
    }

    function updateTime() {
        currentTimeSpan.textContent = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }

    function addNotification(message, icon = 'fa-solid fa-circle-info') {
        // ... (notification logic)
    }


    // --- 5. PENCERE YÖNETİMİ ---
    
    function openWindow(appId) {
        const windowEl = document.getElementById(`${appId}-window`);
        if (!windowEl) return;

        windowEl.style.display = 'flex';
        bringToFront(windowEl);
    }
    
    function closeWindow(appId) {
        const windowEl = document.getElementById(`${appId}-window`);
        if (windowEl) windowEl.style.display = 'none';
    }

    function bringToFront(element) {
        highestZIndex++;
        element.style.zIndex = highestZIndex;
    }
    
    function makeWindowsDraggable() {
        allWindows.forEach(windowEl => {
            // ... (draggable logic)
        });
    }


    // --- 6. UYGULAMA MANTIKLARI ---

    // a) Hesap Makinesi
    const calcResultEl = document.getElementById('calculator-result');
    const calcExpressionEl = document.getElementById('calculator-expression');
    const calcHistoryList = document.getElementById('calc-history-list');
    let calcHistory = [];
    
    function initCalculator() {
        // Bilimsel hesaplama, geçmiş ve mod değiştirme mantığı
        // Bu kısım çok detaylı olduğu için özetlenmiştir.
        // Temel fikir: Kullanıcı girişini bir ifadede biriktirip
        // 'eval' kullanmadan güvenli bir şekilde hesaplamak.
        // Örnek: '2+3*sin(90)'
        console.log("Hesap makinesi başlatıldı.");
    }

    // b) BRT Store
    const storeAppList = document.getElementById('store-app-list');
    function renderStore(category = 'all') {
        storeAppList.innerHTML = '';
        APPS_DB.filter(app => category === 'all' || app.category === category)
        .forEach(app => {
            const ratingStars = app.rating ? Array(5).fill(0).map((_, i) => `<i class="fa-${i < app.rating ? 'solid' : 'regular'} fa-star"></i>`).join('') : 'Değerlendirme yok';
            storeAppList.innerHTML += `
                <div class="store-app-card">
                    <div class="app-card-header"><i class="${app.icon}"></i><h3>${app.name}</h3></div>
                    <div class="app-card-details"><p>${app.description}</p><div class="app-card-rating">${ratingStars}</div></div>
                </div>`;
        });
    }

    // c) Şifre Yöneticisi
    const pmService = document.getElementById('pm-service');
    const pmUsername = document.getElementById('pm-username');
    const pmPassword = document.getElementById('pm-password');
    const pmList = document.getElementById('pm-list');
    
    function renderPasswords() {
        pmList.innerHTML = '';
        if (passwords.length === 0) {
            pmList.innerHTML = '<li>Kayıtlı şifre yok.</li>';
            return;
        }
        passwords.forEach(p => {
             pmList.innerHTML += `<li><span><i class="fa-solid fa-shield-halved"></i> ${p.service}</span><span class="pm-actions"><button class="show-pass" data-id="${p.id}"><i class="fa-solid fa-eye"></i></button><button class="delete-pass" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button></span></li>`;
        });
    }

    function savePassword() {
        // Dikkat: Bu gerçek bir şifreleme değildir, sadece gösterim amaçlıdır!
        const encryptedPassword = btoa(pmPassword.value); 
        passwords.push({ id: Date.now(), service: pmService.value, username: pmUsername.value, password: encryptedPassword });
        localStorage.setItem('brtos_passwords', JSON.stringify(passwords));
        renderPasswords();
    }
    
    function handlePasswordActions(e) {
        const id = e.target.closest('button').dataset.id;
        if(e.target.closest('.show-pass')) {
            const pass = passwords.find(p => p.id == id);
            alert(`Şifre: ${atob(pass.password)}`); // Base64'ü çöz
        }
        // ... silme mantığı ...
    }


    // d) Sanal Klavye
    function initKeyboard() {
        let keyboardHTML = '';
        KEYBOARD_LAYOUT.forEach(row => {
            keyboardHTML += '<div class="keyboard-row">';
            row.split('').forEach(key => {
                keyboardHTML += `<button class="keyboard-key">${key}</button>`;
            });
            keyboardHTML += '</div>';
        });
        // Özel tuşları ekle...
        virtualKeyboard.innerHTML = keyboardHTML;
    }


    // --- 7. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---
    function initEventListeners() {
        // Masaüstü ikonlarına tıklama
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('click', () => openWindow(icon.dataset.appId));
        });

        // Pencere kontrolleri (kapat, küçült vs.)
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appId = e.target.closest('.window').dataset.appId;
                closeWindow(appId);
            });
        });
        
        // Sistem tepsisi ikonları
        volumeIcon.addEventListener('click', () => volumePanel.style.display = volumePanel.style.display === 'block' ? 'none' : 'block');
        keyboardToggleIcon.addEventListener('click', () => virtualKeyboard.classList.toggle('hidden'));

        // Şifre Yöneticisi butonları
        document.getElementById('pm-save-btn').addEventListener('click', savePassword);
        pmList.addEventListener('click', handlePasswordActions);
    }


    // --- 8. SİSTEM BAŞLATMA ---
    function initialize() {
        renderDesktopIcons();
        initEventListeners();
        makeWindowsDraggable();
        initCalculator();
        initKeyboard();
        renderStore();
        renderPasswords();
        updateTime();
        setInterval(updateTime, 1000);
        
        // Açılış ekranını gizle
        setTimeout(() => {
            document.getElementById('boot-screen').classList.add('hidden');
            desktop.style.display = 'block';
            taskbar.style.display = 'flex';
        }, 1500);
    }
    
    function renderDesktopIcons() {
         desktop.innerHTML += APPS_DB.map((app, index) => 
            `<div class="desktop-icon" data-app-id="${app.id}" style="top: ${30 + Math.floor(index / 5) * 100}px; left: ${30 + (index % 5) * 100}px;">
                <i class="${app.icon}"></i><span>${app.name}</span>
            </div>`
         ).join('');
    }

    initialize();
});
