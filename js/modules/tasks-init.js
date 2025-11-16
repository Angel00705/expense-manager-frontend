// js/modules/tasks-init.js - ЕДИНЫЙ ИНИЦИАЛИЗАТОР ДЛЯ СТРАНИЦЫ ЗАДАЧ
console.log('🚀 Инициализация страницы задач...');

const TasksInitializer = {
    init() {
        console.log('🎯 Запуск инициализации модулей задач');
        
        // 1. Инициализируем основные модули
        this.initMonthlyPlan();
        this.initRoleModules();
        this.initModals();
        this.initTabs();
        
        console.log('✅ Все модули задач инициализированы');
    },
    
    initMonthlyPlan() {
        if (typeof MonthlyPlan !== 'undefined') {
            MonthlyPlan.currentRegion = window.app?.currentRegion || 'Курган';
            MonthlyPlan.currentMonth = '2025-11';
            MonthlyPlan.init();
            console.log('✅ MonthlyPlan инициализирован');
        } else {
            console.error('❌ MonthlyPlan не найден');
        }
    },
    
    initRoleModules() {
        const userRole = window.app?.currentUser?.role;
        console.log('👤 Роль пользователя:', userRole);
        
        if (userRole === 'admin') {
            this.initAdminModules();
        } else if (userRole === 'manager') {
            this.initManagerModules();
        }
    },
    
    initAdminModules() {
        console.log('👔 Инициализация модулей админа');
        
        if (typeof AdminTasks !== 'undefined') {
            AdminTasks.init();
        }
        
        if (typeof AllTasks !== 'undefined') {
            AllTasks.init();
        }
    },
    
    initManagerModules() {
        console.log('👤 Инициализация модулей управляющего');
        
        if (typeof ManagerTasks !== 'undefined') {
            ManagerTasks.init();
        }
    },
    
    initModals() {
        if (typeof TaskModals !== 'undefined') {
            TaskModals.init();
            console.log('✅ Модальные окна инициализированы');
        }
    },
    
    initTabs() {
        // Настраиваем переключение вкладок
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
                
                // Загружаем данные для вкладки
                this.loadTabData(tabName);
            });
        });
    },
    
    loadTabData(tabName) {
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
        }
    }
};

// Запускаем инициализацию когда DOM готов
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM готов, запускаем инициализацию задач...');
    
    // Ждем немного чтобы app.js успел инициализироваться
    setTimeout(() => {
        TasksInitializer.init();
    }, 100);
});

// Делаем глобально доступным
window.TasksInitializer = TasksInitializer;