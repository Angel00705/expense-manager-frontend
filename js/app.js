// js/app.js - ПОЛНОСТЬЮ ПЕРЕПРОВЕРЕННАЯ И ИСПРАВЛЕННАЯ ВЕРСИЯ
class IPExpenseManager {
    constructor() {
        this.currentUser = null;
        this.currentRegion = 'Курган';
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) {
            console.log('⚠️ Приложение уже инициализировано');
            return;
        }
        
        console.log('🎯 Инициализация IP Expense Manager...');
        
        try {
            // 1. Загружаем пользователя
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!this.currentUser) {
                console.log('❌ Пользователь не авторизован - перенаправляем на вход');
                window.location.href = 'index.html';
                return;
            }

            console.log('✅ Пользователь загружен:', this.currentUser);

            // 2. Обновляем интерфейс пользователя
            this.updateUserInterface();

            // 3. Инициализируем систему хранения данных
            this.initializeDataSystems();

            // 4. Инициализируем основные модули
            this.initializeCoreModules();

            // 5. Инициализируем ролевые модули
            this.initializeRoleModules();

            // 6. Настраиваем UI компоненты
            this.setupUIComponents();

            this.isInitialized = true;
            console.log('✅ IP Expense Manager полностью инициализирован');
            
        } catch (error) {
            console.error('💥 Критическая ошибка инициализации:', error);
            this.showEmergencyError('Ошибка загрузки приложения. Пожалуйста, перезагрузите страницу.');
        }
    }

    updateUserInterface() {
        console.log('👤 Обновление интерфейса пользователя...');
        
        // Обновляем имя и роль в навбаре
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name || 'Пользователь';
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = this.currentUser.role === 'admin' ? 'Администратор' : 'Управляющий';
        }

        // Добавляем класс для стилизации по роли
        document.body.classList.add(`role-${this.currentUser.role}`);
        
        // Обновляем заголовок страницы если есть
        const pageSubtitle = document.getElementById('pageSubtitle');
        if (pageSubtitle && this.currentUser.role === 'manager') {
            pageSubtitle.textContent = `Задачи в регионе ${this.currentUser.region || 'Курган'}`;
        }
    }

initializeDataSystems() {
    console.log('💾 Инициализация систем данных...');
    
    // 1. Инициализируем StorageManager если доступен
    if (typeof StorageManager !== 'undefined' && StorageManager.initializeAllData) {
        StorageManager.initializeAllData();
    }
    
    // 2. Инициализируем appData если доступен
    if (typeof appData !== 'undefined' && appData.init) {
        appData.init();
    }
    
    // 3. Загружаем данные планов из localStorage
    if (typeof MonthlyPlan !== 'undefined' && MonthlyPlan.loadFromLocalStorage) {
        MonthlyPlan.loadFromLocalStorage();
    }
    
    // 4. Инициализируем данные планов
    if (typeof MonthlyPlansData !== 'undefined' && MonthlyPlansData.initializeAllRegions) {
        MonthlyPlansData.initializeAllRegions();
    }
    
    // 5. Инициализируем систему уведомлений
    if (typeof NotificationSystem !== 'undefined' && NotificationSystem.init) {
        NotificationSystem.init();
    }
}

    initializeCoreModules() {
        console.log('🔧 Инициализация основных модулей...');
        
        // Модальные окна - критически важны
        if (typeof TaskModals !== 'undefined') {
            TaskModals.init();
            console.log('✅ Модальные окна инициализированы');
        }
        
        // Enhanced модальные окна если есть
        if (typeof EnhancedTaskModals !== 'undefined') {
            EnhancedTaskModals.init();
            console.log('✅ Улучшенные модальные окна инициализированы');
        }
        
        // MonthlyPlan - основной модуль страницы задач
        if (typeof MonthlyPlan !== 'undefined') {
            MonthlyPlan.currentRegion = this.currentUser.region || 'Курган';
            MonthlyPlan.currentMonth = '2025-11';
            MonthlyPlan.init();
            console.log('✅ MonthlyPlan инициализирован');
        }
    }

    initializeRoleModules() {
        const userRole = this.currentUser.role;
        console.log(`👤 Инициализация модулей для роли: ${userRole}`);
        
        if (userRole === 'admin') {
            this.initializeAdminModules();
        } else if (userRole === 'manager') {
            this.initializeManagerModules();
        }
    }

    initializeAdminModules() {
        console.log('👔 Инициализация модулей администратора');
        
        // AdminTasks
        if (typeof AdminTasks !== 'undefined') {
            AdminTasks.init();
            console.log('✅ AdminTasks инициализирован');
        }
        
        // AllTasks
        if (typeof AllTasks !== 'undefined') {
            AllTasks.init();
            console.log('✅ AllTasks инициализирован');
        }
        
        // Настраиваем UI для админа
        this.setupAdminUI();
    }

    initializeManagerModules() {
        console.log('👤 Инициализация модулей управляющего');
        
        // ManagerTasks
        if (typeof ManagerTasks !== 'undefined') {
            ManagerTasks.init();
            console.log('✅ ManagerTasks инициализирован');
        }
        
        // Настраиваем UI для управляющего
        this.setupManagerUI();
    }

    setupAdminUI() {
        console.log('🎨 Настройка UI администратора');
        
        // Скрываем вкладку "Мои задачи" для админов
        const myTasksTab = document.getElementById('tabMyTasks');
        if (myTasksTab) myTasksTab.style.display = 'none';
        
        // Показываем сайдбар регионов
        const sidebar = document.getElementById('regionSidebar');
        if (sidebar) sidebar.style.display = 'block';
        
        // Разблокируем выбор региона в плане месяца
        const planRegionSelect = document.getElementById('planRegion');
        if (planRegionSelect) {
            planRegionSelect.disabled = false;
            planRegionSelect.classList.remove('protected-field');
        }
    }

    setupManagerUI() {
        console.log('🎨 Настройка UI управляющего');
        
        // Скрываем вкладку "Все задачи" для управляющих
        const allTasksTab = document.getElementById('tabAllTasks');
        if (allTasksTab) allTasksTab.style.display = 'none';
        
        // Скрываем сайдбар регионов
        const sidebar = document.getElementById('regionSidebar');
        if (sidebar) sidebar.style.display = 'none';
        
        // Блокируем выбор региона в плане месяца
        const planRegionSelect = document.getElementById('planRegion');
        if (planRegionSelect && this.currentUser.region) {
            planRegionSelect.value = this.currentUser.region;
            planRegionSelect.disabled = true;
            planRegionSelect.classList.add('protected-field');
        }
        
        // Показываем информационную панель управляющего
        const managerPanel = document.getElementById('managerInfoPanel');
        if (managerPanel) {
            managerPanel.style.display = 'block';
            const userNameElement = document.getElementById('managerUserName');
            const regionNameElement = document.getElementById('managerRegionName');
            
            if (userNameElement) userNameElement.textContent = this.currentUser.name;
            if (regionNameElement) regionNameElement.textContent = this.currentUser.region || 'Курган';
        }
    }

    setupUIComponents() {
        console.log('🔄 Настройка UI компонентов...');
        
        this.setupTabSwitching();
        this.setupGlobalEventListeners();
    }

    setupTabSwitching() {
        console.log('🔀 Настройка переключения вкладок...');
        
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                console.log(`🔄 Переключение на вкладку: ${tabName}`);
                
                // Убираем активные классы
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Добавляем активные классы
                btn.classList.add('active');
                const targetTab = document.getElementById(`${tabName}-content`);
                if (targetTab) targetTab.classList.add('active');
                
                // Загружаем данные для активной вкладки
                this.loadTabData(tabName);
            });
        });
    }

    setupGlobalEventListeners() {
        console.log('🔗 Настройка глобальных обработчиков...');
        
        // Обработчик для кнопки выхода
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Глобальная обработка ошибок
        window.addEventListener('error', (e) => {
            console.error('🚨 Глобальная ошибка:', e.error);
        });
    }

    loadTabData(tabName) {
        console.log(`📥 Загрузка данных для вкладки: ${tabName}`);
        
        switch(tabName) {
            case 'my-tasks':
                if (typeof ManagerTasks !== 'undefined' && ManagerTasks.loadMyTasks) {
                    ManagerTasks.loadMyTasks();
                }
                break;
            case 'all-tasks':
                if (typeof AllTasks !== 'undefined' && AllTasks.loadAllTasks) {
                    AllTasks.loadAllTasks();
                }
                break;
            case 'month-plan':
                // Данные уже загружены при инициализации MonthlyPlan
                break;
        }
    }

    logout() {
        console.log('🚪 Выход из системы...');
        
        this.currentUser = null;
        this.isInitialized = false;
        localStorage.removeItem('currentUser');
        
        // Показываем уведомление
        if (typeof Notification !== 'undefined') {
            Notification.info('Вы вышли из системы');
        }
        
        // Перенаправляем на страницу входа
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    showEmergencyError(message) {
        // Создаем экстренное сообщение об ошибке
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            z-index: 10000;
            font-weight: bold;
        `;
        errorDiv.textContent = `🚨 ${message}`;
        document.body.appendChild(errorDiv);
        
        console.error('🚨 Экстренная ошибка:', message);
    }
}

// Запуск приложения когда DOM готов
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM загружен, запуск приложения...');
    
    // Даем время на загрузку всех скриптов
    setTimeout(() => {
        try {
            window.app = new IPExpenseManager();
            window.app.init();
        } catch (error) {
            console.error('💥 Критическая ошибка при запуске:', error);
            
            // Экстренное сообщение если все сломалось
            const emergencyMsg = document.createElement('div');
            emergencyMsg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 10000;
                max-width: 400px;
            `;
            emergencyMsg.innerHTML = `
                <h2 style="color: #dc2626; margin-bottom: 15px;">😵 Ошибка загрузки</h2>
                <p>Приложение не смогло загрузиться. Пожалуйста:</p>
                <ol style="text-align: left; margin: 15px 0;">
                    <li>Проверьте подключение к интернету</li>
                    <li>Обновите страницу (F5)</li>
                    <li>Если проблема повторяется, обратитесь к администратору</li>
                </ol>
                <button onclick="window.location.reload()" style="
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">🔄 Обновить страницу</button>
            `;
            document.body.appendChild(emergencyMsg);
        }
    }, 100);
});