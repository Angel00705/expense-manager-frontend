// js/app.js - УПРОЩЕННАЯ ВЕРСИЯ
class IPExpenseManager {
    constructor() {
        this.currentUser = null;
        this.currentRegion = 'Курган';
    }

init() {
    console.log('🎯 Инициализация IP Expense Manager...');
    
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!this.currentUser) {
        console.log('❌ Пользователь не авторизован');
        window.location.href = 'index.html';
        return;
    }

    console.log('✅ Пользователь:', this.currentUser);

    // ИНИЦИАЛИЗИРУЕМ ДАННЫЕ ПЛАНОВ
    if (typeof appData !== 'undefined' && appData.initializePlanData) {
        appData.initializePlanData();
    }

    this.updateUserInterface();
    this.initializeModules();

    console.log('✅ IP Expense Manager инициализирован');
}

    updateUserInterface() {
        console.log('👤 Обновление интерфейса пользователя...');
        
        // Обновляем имя и роль
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) userNameElement.textContent = this.currentUser.name;
        if (userRoleElement) {
            userRoleElement.textContent = this.currentUser.role === 'admin' ? 'Администратор' : 'Управляющий';
        }

        // Добавляем класс для стилизации по роли
        document.body.classList.add(`role-${this.currentUser.role}`);
    }

    initializeModules() {
        console.log('🔧 Инициализация модулей задач...');
        
        // Инициализируем модальные окна
        if (typeof TaskModals !== 'undefined') {
            TaskModals.init();
        }
        
        // Инициализируем MonthlyPlan
        if (typeof MonthlyPlan !== 'undefined') {
            MonthlyPlan.currentRegion = this.currentRegion;
            MonthlyPlan.currentMonth = '2025-11';
            MonthlyPlan.init();
        }
        
        // Ролевая инициализация
        if (this.currentUser.role === 'admin') {
            this.initAdminInterface();
            if (typeof AdminTasks !== 'undefined') AdminTasks.init();
            if (typeof AllTasks !== 'undefined') AllTasks.init();
        } else {
            this.initManagerInterface();
            if (typeof ManagerTasks !== 'undefined') ManagerTasks.init();
        }
        
        // Настраиваем вкладки
        this.setupTabSwitching();
    }
// В init() метода после инициализации модулей
initializeModules() {
    console.log('🔧 Инициализация модулей задач...');
    
    // Загружаем данные из localStorage
    if (typeof MonthlyPlan !== 'undefined' && MonthlyPlan.loadFromLocalStorage) {
        MonthlyPlan.loadFromLocalStorage();
    }
    
    // Инициализируем данные регионов
    if (typeof RegionsInitialData !== 'undefined') {
        RegionsInitialData.init();
    }
    
    initAdminInterface() {
        console.log('👔 Инициализация интерфейса администратора');
        
        // Скрываем "Мои задачи" для админов
        const myTasksTab = document.getElementById('tabMyTasks');
        if (myTasksTab) myTasksTab.style.display = 'none';
        
        // Показываем сайдбар регионов
        const sidebar = document.getElementById('regionSidebar');
        if (sidebar) sidebar.style.display = 'block';
    }

    initManagerInterface() {
        console.log('👤 Инициализация интерфейса управляющего');
        
        // Скрываем "Все задачи" для управляющих
        const allTasksTab = document.getElementById('tabAllTasks');
        if (allTasksTab) allTasksTab.style.display = 'none';
        
        // Скрываем сайдбар регионов
        const sidebar = document.getElementById('regionSidebar');
        if (sidebar) sidebar.style.display = 'none';

        // Автоматически выбираем регион управляющего
        if (this.currentUser.region) {
            this.currentRegion = this.currentUser.region;
            const planRegionSelect = document.getElementById('planRegion');
            if (planRegionSelect) planRegionSelect.value = this.currentRegion;
        }
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
            });
        });
    }
}
// js/app.js - ОБНОВЛЁННАЯ ВЕРСИЯ
class IPExpenseManager {
    constructor() {
        this.currentUser = null;
        this.currentRegion = 'Курган';
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🎯 Инициализация IP Expense Manager...');
        
        try {
            // 1. Загружаем пользователя
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!this.currentUser) {
                window.location.href = 'index.html';
                return;
            }

            // 2. Инициализируем систему хранения
            if (typeof StorageManager !== 'undefined') {
                await StorageManager.initializeAllData();
            }

            // 3. Обновляем интерфейс
            this.updateUserInterface();
            
            // 4. Инициализируем модули
            await this.initializeModules();
            
            this.isInitialized = true;
            console.log('✅ IP Expense Manager полностью инициализирован');
            
        } catch (error) {
            console.error('💥 Ошибка инициализации:', error);
        }
    }

    updateUserInterface() {
        // ... существующий код ...
    }

    async initializeModules() {
        console.log('🔧 Инициализация модулей...');
        
        // Ждем загрузки данных
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Инициализируем модули в правильном порядке
        const initQueue = [
            () => this.initMonthlyPlan(),
            () => this.initRoleModules(),
            () => this.initModals(),
            () => this.initTabs()
        ];
        
        for (const initFunc of initQueue) {
            try {
                await initFunc();
            } catch (error) {
                console.error('Ошибка инициализации модуля:', error);
            }
        }
    }

    initMonthlyPlan() {
        return new Promise((resolve) => {
            if (typeof MonthlyPlan !== 'undefined') {
                MonthlyPlan.currentRegion = this.currentUser?.region || 'Курган';
                MonthlyPlan.currentMonth = '2025-11';
                
                // Ждем инициализации данных
                setTimeout(() => {
                    MonthlyPlan.init();
                    console.log('✅ MonthlyPlan инициализирован');
                    resolve();
                }, 150);
            } else {
                resolve();
            }
        });
    }

    initRoleModules() {
        const userRole = this.currentUser?.role;
        console.log('👤 Инициализация для роли:', userRole);
        
        if (userRole === 'admin') {
            if (typeof AdminTasks !== 'undefined') AdminTasks.init();
            if (typeof AllTasks !== 'undefined') AllTasks.init();
        } else {
            if (typeof ManagerTasks !== 'undefined') ManagerTasks.init();
        }
    }

    initModals() {
        if (typeof TaskModals !== 'undefined') {
            TaskModals.init();
        }
    }

    initTabs() {
        // ... существующий код ...
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM загружен, запуск приложения...');
    
    // Создаем глобальный экземпляр приложения
    window.app = new IPExpenseManager();
    
    // Запускаем инициализацию с задержкой для полной загрузки скриптов
    setTimeout(() => {
        window.app.init();
    }, 500);
});
// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM загружен, запуск приложения...');
    
    try {
        window.app = new IPExpenseManager();
        window.app.init();
    } catch (error) {
        console.error('💥 Критическая ошибка при запуске:', error);
    }
});