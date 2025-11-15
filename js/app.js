// Главный файл инициализации
class IPExpenseManager {
    constructor() {
        this.currentUser = null;
        this.currentRegion = 'Курган'; // По умолчанию
    }

    init() {
        console.log('🎯 Инициализация IP Expense Manager...');
        
        // Загружаем пользователя
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Инициализируем модули по роли
        if (this.currentUser.role === 'admin') {
            this.initAdminInterface();
        } else {
            this.initManagerInterface();
        }

        // Загружаем начальные данные
        this.loadInitialData();
    }

    initAdminInterface() {
    console.log('👔 Инициализация интерфейса администратора');
    
    // Инициализируем модули для админа
    if (typeof AdminTasks !== 'undefined') {
        AdminTasks.init();
    }
    if (typeof MonthlyPlan !== 'undefined') {
        MonthlyPlan.init();
    }
    if (typeof AllTasks !== 'undefined') {
        AllTasks.init();
    }
    
    // Скрываем "Мои задачи" для админов
    document.getElementById('tabMyTasks').style.display = 'none';
    
    // Показываем сайдбар регионов
    const sidebar = document.getElementById('regionSidebar');
    if (sidebar) sidebar.style.display = 'block';
}

    initManagerInterface() {
    console.log('👤 Инициализация интерфейса управляющего');
    
    // Инициализируем модули для управляющего
    if (typeof ManagerTasks !== 'undefined') {
        ManagerTasks.init();
    }
    if (typeof MonthlyPlan !== 'undefined') {
        MonthlyPlan.init();
    }
    
    // Скрываем "Все задачи" для управляющих
    document.getElementById('tabAllTasks').style.display = 'none';
    
    // Скрываем сайдбар регионов
    const sidebar = document.getElementById('regionSidebar');
    if (sidebar) sidebar.style.display = 'none';
}

// ===== ОБЩИЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
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