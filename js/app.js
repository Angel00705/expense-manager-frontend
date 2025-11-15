// js/app.js
class IPExpenseManager {
    constructor() {
        this.currentUser = null;
        this.currentRegion = 'Курган';
    }

    init() {
        console.log('🎯 Инициализация IP Expense Manager...');
        
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Обновляем даты на ноябрь 2025
        this.updateDatesToNovember2025();

        if (this.currentUser.role === 'admin') {
            this.initAdminInterface();
        } else {
            this.initManagerInterface();
        }

        this.loadInitialData();
    }

    updateDatesToNovember2025() {
        // Обновляем выпадающие списки месяцев
        const monthSelects = document.querySelectorAll('select[id*="Month"], select[id*="month"]');
        monthSelects.forEach(select => {
            if (select.innerHTML.includes('2024-11')) {
                select.innerHTML = select.innerHTML.replace('2024-11', '2025-11')
                                                  .replace('2024-12', '2025-12')
                                                  .replace('2025-01', '2026-01');
                select.value = '2025-11';
            }
        });
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
        if (typeof MonthlyPlan !== 'undefined') MonthlyPlan.init();
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

        // Инициализируем модули для управляющего
        if (typeof ManagerTasks !== 'undefined') ManagerTasks.init();
        if (typeof MonthlyPlan !== 'undefined') MonthlyPlan.init();
    }

    loadInitialData() {
        console.log('📊 Загрузка начальных данных...');
    }
}

// Вспомогательные функции
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0';
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

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    window.app = new IPExpenseManager();
    app.init();
});