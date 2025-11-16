// js/app.js - УПРОЩЕННАЯ ВЕРСИЯ
class IPExpenseManager {
    constructor() {
        this.currentUser = null;
        this.currentRegion = 'Курган';
    }

    init() {
        console.log('🎯 Инициализация IP Expense Manager...');
        
        // Загружаем пользователя
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser) {
            console.log('❌ Пользователь не авторизован');
            window.location.href = 'index.html';
            return;
        }

        console.log('✅ Пользователь:', this.currentUser);

        // Обновляем интерфейс
        this.updateUserInterface();

        // Инициализируем модули
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
        // Инициализируем MonthlyPlan
        if (typeof MonthlyPlan !== 'undefined') {
            MonthlyPlan.currentRegion = this.currentRegion;
            MonthlyPlan.currentMonth = '2025-11';
            MonthlyPlan.init();
        }

        // Инициализируем ролевые модули
        if (this.currentUser.role === 'admin') {
            this.initAdminInterface();
        } else {
            this.initManagerInterface();
        }

        // Настраиваем вкладки
        this.setupTabSwitching();
    }

    initAdminInterface() {
        console.log('👔 Инициализация интерфейса администратора');
        
        // Скрываем "Мои задачи" для админов
        const myTasksTab = document.getElementById('tabMyTasks');
        if (myTasksTab) myTasksTab.style.display = 'none';
        
        // Показываем сайдбар регионов
        const sidebar = document.getElementById('regionSidebar');
        if (sidebar) sidebar.style.display = 'block';

        // Инициализируем модули для админа
        if (typeof AdminTasks !== 'undefined') AdminTasks.init();
        if (typeof AllTasks !== 'undefined') AllTasks.init();
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

        // Инициализируем модули для управляющего
        if (typeof ManagerTasks !== 'undefined') ManagerTasks.init();
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