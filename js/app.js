// js/app.js - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ
class IPExpenseManager {
    constructor() {
        this.currentUser = null;
        this.currentRegion = 'Курган';
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        console.log('🎯 Инициализация IP Expense Manager...');
        
        // Загружаем пользователя
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser) {
            console.log('❌ Пользователь не авторизован - перенаправляем на вход');
            window.location.href = 'index.html';
            return;
        }

        console.log('✅ Пользователь:', this.currentUser);

        // ✅ ВАЖНО: Ждем загрузки данных перед инициализацией модулей
        this.waitForData().then(() => {
            this.initializeApp();
        }).catch(error => {
            console.error('❌ Ошибка загрузки данных:', error);
            this.initializeApp(); // Все равно запускаем приложение
        });
    }

    waitForData() {
        return new Promise((resolve) => {
            console.log('⏳ Ожидание загрузки данных...');
            
            const checkData = () => {
                // Проверяем основные данные
                if (window.MonthlyPlansData && window.appData) {
                    console.log('✅ Все данные загружены');
                    resolve();
                } else {
                    console.log('⏱️ Данные еще не загружены, ждем...');
                    setTimeout(checkData, 100);
                }
            };
            
            checkData();
            
            // Таймаут на случай проблем
            setTimeout(() => {
                console.log('⚠️ Таймаут загрузки данных, продолжаем...');
                resolve();
            }, 3000);
        });
    }

    initializeApp() {
        console.log('🚀 Запуск инициализации приложения...');
        
        // Обновляем даты на ноябрь 2025
        this.updateDatesToNovember2025();

        // Обновляем интерфейс пользователя
        this.updateUserInterface();

        // ✅ ВАЖНО: Инициализируем MonthlyPlan ПЕРВЫМ
        if (typeof MonthlyPlan !== 'undefined') {
            console.log('📅 Инициализация MonthlyPlan...');
            MonthlyPlan.currentRegion = this.currentRegion;
            MonthlyPlan.currentMonth = '2025-11';
            MonthlyPlan.init();
        } else {
            console.error('❌ MonthlyPlan не найден!');
        }

        // Инициализируем ролевой интерфейс
        if (this.currentUser.role === 'admin') {
            this.initAdminInterface();
        } else {
            this.initManagerInterface();
        }

        this.setupTabSwitching();
        this.setupGlobalEventListeners();
        
        this.initialized = true;
        console.log('✅ IP Expense Manager полностью инициализирован');
    }

    updateDatesToNovember2025() {
        console.log('📅 Обновление дат на ноябрь 2025...');
        
        // Обновляем заголовки недель
        const weekHeaders = document.querySelectorAll('.week-title h3');
        if (weekHeaders.length >= 4) {
            weekHeaders[0].innerHTML = '📌 НЕДЕЛЯ 1 (1-7 ноября 2025)';
            weekHeaders[1].innerHTML = '📌 НЕДЕЛЯ 2 (8-14 ноября 2025)';
            weekHeaders[2].innerHTML = '📌 НЕДЕЛЯ 3 (15-21 ноября 2025)';
            weekHeaders[3].innerHTML = '📌 НЕДЕЛЯ 4 (22-30 ноября 2025)';
        }

        // Обновляем выпадающие списки месяцев
        const monthSelects = document.querySelectorAll('select[id*="Month"], select[id*="month"]');
        monthSelects.forEach(select => {
            if (select.innerHTML.includes('2024-11') || select.innerHTML.includes('Ноябрь')) {
                select.innerHTML = `
                    <option value="2025-11">Ноябрь 2025</option>
                    <option value="2025-12">Декабрь 2025</option>
                    <option value="2026-01">Январь 2026</option>
                `;
                select.value = '2025-11';
            }
        });
    }

    updateUserInterface() {
        console.log('👤 Обновление интерфейса пользователя...');
        
        // Обновляем имя и роль пользователя
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) userNameElement.textContent = this.currentUser.name;
        if (userRoleElement) {
            userRoleElement.textContent = this.currentUser.role === 'admin' ? 'Администратор' : 'Управляющий';
        }

        // Добавляем класс для стилизации по роли
        document.body.classList.add(`role-${this.currentUser.role}`);
        
        // Обновляем заголовок страницы для управляющих
        if (this.currentUser.role === 'manager' && this.currentUser.region) {
            const subtitle = document.getElementById('pageSubtitle');
            if (subtitle) {
                subtitle.textContent = `Задачи в регионе ${this.currentUser.region}`;
            }
        }
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
        if (typeof AdminTasks !== 'undefined') {
            AdminTasks.init();
        }
        if (typeof AllTasks !== 'undefined') {
            AllTasks.init();
        }
        
        console.log('✅ Интерфейс администратора настроен');
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
            if (planRegionSelect) {
                planRegionSelect.value = this.currentRegion;
            }
        }

        // Инициализируем модули для управляющего
        if (typeof ManagerTasks !== 'undefined') {
            ManagerTasks.init();
        }
        
        console.log('✅ Интерфейс управляющего настроен');
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
                if (targetTab) {
                    targetTab.classList.add('active');
                } else {
                    console.error(`❌ Вкладка не найдена: ${tabName}-content`);
                }

                // Загружаем данные для вкладки
                this.loadTabData(tabName);
            });
        });
        
        // Активируем первую вкладку
        const firstTab = document.querySelector('.tab-btn.active');
        if (firstTab) {
            const firstTabName = firstTab.dataset.tab;
            this.loadTabData(firstTabName);
        }
    }

    loadTabData(tabName) {
        console.log(`📊 Загрузка данных для вкладки: ${tabName}`);
        
        switch(tabName) {
            case 'month-plan':
                if (typeof MonthlyPlan !== 'undefined') {
                    console.log('🔄 Обновление данных плана месяца...');
                    MonthlyPlan.loadPlanData();
                } else {
                    console.error('❌ MonthlyPlan не доступен');
                }
                break;
                
            case 'my-tasks':
                if (typeof ManagerTasks !== 'undefined') {
                    console.log('🔄 Загрузка моих задач...');
                    ManagerTasks.loadMyTasks();
                }
                break;
                
            case 'all-tasks':
                if (typeof AllTasks !== 'undefined') {
                    console.log('🔄 Загрузка всех задач...');
                    AllTasks.loadAllTasks();
                }
                break;
                
            default:
                console.log(`⚠️ Неизвестная вкладка: ${tabName}`);
        }
    }

    setupGlobalEventListeners() {
        console.log('🔗 Настройка глобальных обработчиков...');
        
        // Обработчик для обновления данных при изменении региона
        document.addEventListener('regionChanged', (event) => {
            if (event.detail && event.detail.region) {
                this.currentRegion = event.detail.region;
                console.log(`🔄 Регион изменен на: ${this.currentRegion}`);
                
                // Обновляем данные, если активна вкладка плана месяца
                const activeTab = document.querySelector('.tab-btn.active');
                if (activeTab && activeTab.dataset.tab === 'month-plan') {
                    this.loadTabData('month-plan');
                }
            }
        });

        // Глобальный обработчик ошибок
        window.addEventListener('error', (event) => {
            console.error('🚨 Глобальная ошибка:', event.error);
        });
    }

    // Вспомогательные методы
    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentRegion() {
        return this.currentRegion;
    }

    setCurrentRegion(region) {
        this.currentRegion = region;
        console.log(`📍 Установлен регион: ${region}`);
        
        // Отправляем событие о смене региона
        document.dispatchEvent(new CustomEvent('regionChanged', {
            detail: { region: region }
        }));
    }
}

// Вспомогательные функции (добавляем в глобальную область)
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0';
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount));
}

function formatDate(dateString) {
    if (!dateString) return 'Не указана';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    } catch {
        return 'Неверная дата';
    }
}

function getCategoryEmoji(category) {
    const emojis = {
        'products': '🛒', 'household': '🏠', 'medicaments': '💊',
        'stationery': '📎', 'cafe': '☕', 'repairs': '🔧',
        'azs': '⛽', 'salary': '💰', 'shipping': '📦',
        'events': '🎉', 'polygraphy': '🖨️', 'insurance': '🛡️',
        'charity': '❤️', 'equipment': '💻', 'cleaning': '🧹',
        'checks': '🧾', 'carsharing': '🚗', 'rent': '🏢',
        'comm': '💡', 'internet': '🌐', 'ipSalary': '💼'
    };
    return emojis[category] || '📋';
}

function getCategoryName(category) {
    const names = {
        'products': 'Продукты', 'household': 'Хоз. товары',
        'medicaments': 'Медикаменты', 'stationery': 'Канцелярия',
        'cafe': 'Кафе', 'repairs': 'Ремонт', 'azs': 'АЗС',
        'salary': 'Зарплата', 'shipping': 'Отправка',
        'events': 'Мероприятия', 'polygraphy': 'Полиграфия',
        'insurance': 'Страхование', 'charity': 'Благотворительность',
        'equipment': 'Техника', 'cleaning': 'Клининг',
        'checks': 'Чеки', 'carsharing': 'Каршеринг',
        'rent': 'Аренда', 'comm': 'Коммуналка',
        'internet': 'Интернет', 'ipSalary': 'ЗП ИП'
    };
    return names[category] || category;
}

// Простая система уведомлений
const Notification = {
    success(message) {
        this.show(message, 'success');
    },
    error(message) {
        this.show(message, 'error');
    },
    info(message) {
        this.show(message, 'info');
    },
    show(message, type = 'info') {
        console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Автоудаление
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }
};

// Запуск приложения с защитой от ошибок
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM загружен, запуск приложения...');
    
    try {
        window.app = new IPExpenseManager();
        window.app.init();
    } catch (error) {
        console.error('💥 Критическая ошибка при запуске:', error);
        Notification.error('Ошибка загрузки приложения. Пожалуйста, обновите страницу.');
    }
});

// Экспортируем глобально
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getCategoryEmoji = getCategoryEmoji;
window.getCategoryName = getCategoryName;
window.Notification = Notification;

console.log('🔧 app.js загружен');