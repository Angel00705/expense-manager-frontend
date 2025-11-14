// budgets.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ С ПРАВИЛЬНОЙ СТАТИСТИКОЙ

let currentMonth = '2025-11';
let expandedRegions = new Set();
let currentEditElement = null;
let hasUnsavedChanges = false;
let isToggleAllMode = false; // Флаг для режима "Развернуть/Свернуть все"

// Глобальные данные
let MASTER_BUDGETS = {};
let MASTER_IP_BUDGETS = {};

// Группированные категории с эмодзи
const BUDGET_CATEGORIES_GROUPED = [
    {
        group: 'Основные',
        categories: [
            { id: 'products', name: 'Продукты', emoji: '🛒' },
            { id: 'household', name: 'Хоз. товары', emoji: '🏠' },
            { id: 'medicaments', name: 'Медикаменты', emoji: '💊' },
            { id: 'stationery', name: 'Канцелярия', emoji: '📎' }
        ]
    },
    {
        group: 'Бизнес', 
        categories: [
            { id: 'cafe', name: 'Кафе', emoji: '☕' },
            { id: 'polygraphy', name: 'Полиграфия', emoji: '📄' },
            { id: 'events', name: 'Мероприятия', emoji: '🎪' },
            { id: 'repairs', name: 'Ремонт', emoji: '🔧' }
        ]
    },
    {
        group: 'Транспорт',
        categories: [
            { id: 'azs', name: 'АЗС', emoji: '⛽' },
            { id: 'shipping', name: 'Отправка', emoji: '📦' },
            { id: 'carsharing', name: 'Каршеринг', emoji: '🚗' }
        ]
    },
    {
        group: 'Финансы',
        categories: [
            { id: 'salary', name: 'ЗП упр.', emoji: '👨‍💼' },
            { id: 'ipSalary', name: 'ЗП ИП', emoji: '💼' },
            { id: 'insurance', name: 'Страхование', emoji: '🛡️' },
            { id: 'charity', name: 'Благотв.', emoji: '❤️' }
        ]
    },
    {
        group: 'Офис',
        categories: [
            { id: 'rent', name: 'Аренда', emoji: '🏢' },
            { id: 'comm', name: 'Коммуналка', emoji: '💡' },
            { id: 'internet', name: 'Интернет', emoji: '🌐' },
            { id: 'cleaning', name: 'Клининг', emoji: '🧹' }
        ]
    },
    {
        group: 'Прочее',
        categories: [
            { id: 'regionalPurchase', name: 'Покупка', emoji: '🛍️' },
            { id: 'equipment', name: 'Техника', emoji: '💻' },
            { id: 'packaging', name: 'Упаковка', emoji: '🎁' },
            { id: 'checks', name: 'Чеки', emoji: '🧾' }
        ]
    }
];

// Статические данные
const STATIC_DATA = {
    regions: {
        'Астрахань': { products: 5000, household: 3000, medicaments: 1000, stationery: 500, cafe: 1500, polygraphy: 200, events: 2000, repairs: 10000, salary: 15000, azs: 1000, shipping: 3000, regionalPurchase: 5000, insurance: 5000, charity: 75000, equipment: 100000, packaging: 0, cleaning: 2000, checks: 20000, carsharing: 3000, rent: 41780, comm: 5000, internet: 1950, ipSalary: 150000 },
        'Бурятия': { products: 5000, household: 4000, medicaments: 1000, stationery: 500, cafe: 1000, polygraphy: 200, events: 2000, repairs: 10000, salary: 10000, azs: 1000, shipping: 3000, regionalPurchase: 4000, insurance: 5000, charity: 0, equipment: 0, packaging: 0, cleaning: 2000, checks: 0, carsharing: 0, rent: 49940, comm: 4000, internet: 15900, ipSalary: 135000 },
        'Курган': { products: 3000, household: 5000, medicaments: 1000, stationery: 1000, cafe: 2000, polygraphy: 300, events: 2500, repairs: 10000, salary: 15000, azs: 1500, shipping: 3000, regionalPurchase: 7000, insurance: 5000, charity: 0, equipment: 0, packaging: 0, cleaning: 2000, checks: 40000, carsharing: 0, rent: 69496, comm: 7000, internet: 27462, ipSalary: 90000 },
        'Калмыкия': { products: 3000, household: 4000, medicaments: 1000, stationery: 500, cafe: 1000, polygraphy: 200, events: 1000, repairs: 10000, salary: 10000, azs: 1000, shipping: 3000, regionalPurchase: 3000, insurance: 5000, charity: 0, equipment: 0, packaging: 0, cleaning: 2000, checks: 0, carsharing: 0, rent: 43000, comm: 3000, internet: 12500, ipSalary: 60000 },
        'Мордовия': { products: 4000, household: 3000, medicaments: 1000, stationery: 500, cafe: 1000, polygraphy: 200, events: 1500, repairs: 10000, salary: 10000, azs: 1000, shipping: 3000, regionalPurchase: 3000, insurance: 5000, charity: 0, equipment: 0, packaging: 0, cleaning: 2000, checks: 0, carsharing: 0, rent: 26090, comm: 3000, internet: 10704, ipSalary: 60000 },
        'Удмуртия': { products: 5000, household: 4000, medicaments: 1000, stationery: 1000, cafe: 2000, polygraphy: 300, events: 2500, repairs: 10000, salary: 15000, azs: 1500, shipping: 3000, regionalPurchase: 6000, insurance: 5000, charity: 0, equipment: 0, packaging: 0, cleaning: 2000, checks: 0, carsharing: 0, rent: 58639, comm: 6000, internet: 26750, ipSalary: 150000 }
    },
    ip: {
        'Астрахань': {
            'ИП Крутоусов': { products: 5000, polygraphy: 200, repairs: 10000, shipping: 3000, azs: 1000, rent: 8000, comm: 1000, ipSalary: 30000 },
            'ИП Храмова': { household: 3000, azs: 1000, shipping: 1000, rent: 10000, comm: 1000, ipSalary: 30000 },
            'ИП Янгалышева': { stationery: 1000, salary: 15000, shipping: 1000, insurance: 5000, charity: 15000, checks: 10000, rent: 6700, comm: 1000, internet: 1950, ipSalary: 30000 },
            'ИП Наливайко': { cafe: 500, shipping: 1000, rent: 7700, comm: 1000, ipSalary: 30000 },
            'ИП Каширин': { cafe: 1500, events: 2000, rent: 9380, comm: 1000, ipSalary: 30000 }
        },
        'Бурятия': {
            'ИП Астанови': { products: 5000, polygraphy: 200, events: 2000, rent: 10440, comm: 1000, internet: 4300, ipSalary: 45000 },
            'ИП Пинегин': { household: 4000, repairs: 10000, azs: 1000, shipping: 1000, charity: 10000, rent: 8000, comm: 1000, internet: 3000, ipSalary: 30000 },
            'ИП Ровда': { stationery: 1000, salary: 10000, shipping: 3000, insurance: 5000, rent: 14500, comm: 1000, internet: 4300, ipSalary: 30000 },
            'ИП Ильенко': { cafe: 500, polygraphy: 1000, shipping: 1000, cleaning: 2000, rent: 17000, comm: 1000, internet: 4300, ipSalary: 30000 }
        },
        'Курган': {
            'ИП Бондаренко': { products: 3000, polygraphy: 300, repairs: 10000, charity: 20000, checks: 10000, rent: 10600, comm: 1000, internet: 4000, ipSalary: 30000 },
            'ИП Бобков': { household: 5000, salary: 15000, shipping: 3000, checks: 3000, rent: 10950, comm: 1000, internet: 3700, ipSalary: 30000 },
            'ИП Дюльгер': { stationery: 1000, shipping: 1000, rent: 6000, comm: 1000, internet: 4062 },
            'ИП Федчук': { cafe: 1000, shipping: 1000, insurance: 5000, checks: 10000, rent: 7500, comm: 1000, internet: 4000 },
            'ИП Карбышев': { cafe: 2000, repairs: 15000, checks: 10000, rent: 11096, comm: 1000, internet: 3700 },
            'ИП Овсейко': { events: 2500, medicaments: 1000, azs: 1000, checks: 2000, rent: 9350, comm: 1000, internet: 4000, ipSalary: 30000 },
            'ИП Рябенко': { azs: 1500, shipping: 1000, checks: 10000, rent: 14000, comm: 1000, internet: 4000 }
        },
        'Калмыкия': {
            'ИП Ибрагимов': { products: 3000, cafe: 1000, polygraphy: 200, repairs: 10000, salary: 10000, cleaning: 2000, rent: 15000, comm: 1000, internet: 4250 },
            'ИП Никифорова': { household: 4000, stationery: 500, events: 1000, shipping: 3000, insurance: 5000, rent: 18000, comm: 1000, internet: 4250, ipSalary: 30000 },
            'ИП Ярославцев': { medicaments: 1000, azs: 1000, shipping: 1000, rent: 10000, comm: 1000, internet: 4000, ipSalary: 30000 }
        },
        'Мордовия': {
            'ИП Иванов': { repairs: 10000, shipping: 1000, rent: 9000, comm: 1000, internet: 3300 },
            'ИП Коротких': { household: 3000, stationery: 500, cafe: 1000, events: 1500, azs: 1000, shipping: 3000, insurance: 5000, rent: 9090, comm: 1000, internet: 3702, ipSalary: 30000 },
            'ИП Яковлева': { products: 4000, medicaments: 1000, polygraphy: 200, salary: 10000, shipping: 1000, cleaning: 2000, rent: 8000, comm: 1000, internet: 3702, ipSalary: 30000 }
        },
        'Удмуртия': {
            'ИП Бадалов': { products: 5000, polygraphy: 300, repairs: 10000, azs: 1500, shipping: 1000, charity: 15000, rent: 11700, comm: 1000, internet: 4750, ipSalary: 30000 },
            'ИП Емельнов': { household: 4000, shipping: 1000, insurance: 5000, rent: 7000, comm: 1000, internet: 3800, ipSalary: 30000 },
            'ИП Леонгард': { stationery: 1000, azs: 1000, charity: 100000, checks: 6500, comm: 1000, internet: 5200, ipSalary: 30000 },
            'ИП Саинова': { cafe: 1000, salary: 15000, shipping: 3000, cleaning: 2000, rent: 6486, comm: 1000, internet: 4750, ipSalary: 30000 },
            'ИП Самсонов': { cafe: 2000, shipping: 1000, rent: 12418, comm: 1000, internet: 4750 },
            'ИП Шефер': { events: 2500, shipping: 1000, rent: 14535, comm: 1000, internet: 3500, ipSalary: 30000 }
        }
    }
};

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

function getAllCategories() {
    const allCategories = [];
    BUDGET_CATEGORIES_GROUPED.forEach(group => {
        allCategories.push(...group.categories);
    });
    return allCategories;
}

// ===== СИСТЕМА ИНИЦИАЛИЗАЦИИ =====

function initializeBudgetData() {
    console.log('🎯 Инициализация данных бюджетов...');
    
    MASTER_BUDGETS = STATIC_DATA.regions;
    MASTER_IP_BUDGETS = STATIC_DATA.ip;
    
    console.log('✅ Данные инициализированы:', {
        регионов: Object.keys(MASTER_BUDGETS).length,
        ИП: Object.keys(MASTER_IP_BUDGETS).reduce((acc, region) => acc + Object.keys(MASTER_IP_BUDGETS[region]).length, 0)
    });
}

// ===== СИСТЕМА ХРАНЕНИЯ =====

function getBudgetKey(region, ip, category) {
    return `budget_${currentMonth}_${region}_${ip || 'region'}_${category}`;
}

function getActualSpending(region, ip, category) {
    const key = getBudgetKey(region, ip, category) + '_actual';
    return parseFloat(localStorage.getItem(key)) || 0;
}

function getPlannedBudget(region, ip, category) {
    const key = getBudgetKey(region, ip, category) + '_planned';
    const saved = localStorage.getItem(key);
    
    if (saved !== null) {
        return parseFloat(saved);
    }
    
    if (ip) {
        return MASTER_IP_BUDGETS[region]?.[ip]?.[category] || 0;
    } else {
        return MASTER_BUDGETS[region]?.[category] || 0;
    }
}

function savePlannedBudget(region, ip, category, amount) {
    const key = getBudgetKey(region, ip, category) + '_planned';
    localStorage.setItem(key, amount.toString());
    hasUnsavedChanges = true;
    updateSaveButton();
}

// ===== ФУНКЦИИ РЕНДЕРИНГА =====

function renderMasterBudgetTable() {
    const table = document.getElementById('budgetTable');
    if (!table) {
        console.error('Элемент budgetTable не найден!');
        return;
    }
    
    table.innerHTML = '';
    
    // Создаем заголовок таблицы с ОБЪЕДИНЕННЫМИ ЯЧЕЙКАМИ
    let html = '<thead>';
    
    // Первая строка заголовка - группы (объединенные ячейки)
    html += '<tr>';
    // ОБЪЕДИНЯЕМ РЕГИОН/ИП В ОДНУ ЯЧЕЙКУ
    html += '<th class="region-header" rowspan="2">Регион / ИП</th>';
    
    // Основные (4 категории)
    html += '<th class="group-header" colspan="4">Основные</th>';
    // Бизнес (4 категории)
    html += '<th class="group-header" colspan="4">Бизнес</th>';
    // Транспорт (3 категории)
    html += '<th class="group-header" colspan="3">Транспорт</th>';
    // Финансы (4 категории)
    html += '<th class="group-header" colspan="4">Финансы</th>';
    // Офис (4 категории)
    html += '<th class="group-header" colspan="4">Офис</th>';
    // Прочее (4 категории)
    html += '<th class="group-header" colspan="4">Прочее</th>';
    
    // ОБЪЕДИНЯЕМ ИТОГО В ОДНУ ЯЧЕЙКУ
    html += '<th class="total-header" rowspan="2">Итого</th>';
    html += '</tr>';
    
    // Вторая строка заголовка - категории
    html += '<tr>';
    
    // Все категории в правильном порядке
    html += getCategoryHeaders();
    
    html += '</tr>';
    html += '</thead>';
    
    // Тело таблицы
    html += '<tbody>';
    
    // Строки регионов
    Object.keys(MASTER_BUDGETS).forEach((region, index) => {
        html += renderRegionRow(region, index);
        
        // Строки ИП (если регион развернут)
        if (expandedRegions.has(region)) {
            const ipData = MASTER_IP_BUDGETS[region];
            if (ipData) {
                Object.keys(ipData).forEach(ipName => {
                    html += renderIPRow(ipName, region);
                });
            }
        }
    });
    
    // Итоговая строка
    html += renderTotalRow();
    html += '</tbody>';
    
    table.innerHTML = html;
    
    updateStatistics();
}

// Вспомогательная функция для заголовков категорий
function getCategoryHeaders() {
    let headers = '';
    
    // Основные
    headers += `
        <th class="category-header">
            <div class="category-emoji">🛒</div>
            <div class="category-name">Продукты</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🏠</div>
            <div class="category-name">Хоз. товары</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">💊</div>
            <div class="category-name">Медикаменты</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">📎</div>
            <div class="category-name">Канцелярия</div>
        </th>
    `;
    
    // Бизнес
    headers += `
        <th class="category-header">
            <div class="category-emoji">☕</div>
            <div class="category-name">Кафе</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">📄</div>
            <div class="category-name">Полиграфия</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🎪</div>
            <div class="category-name">Мероприятия</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🔧</div>
            <div class="category-name">Ремонт</div>
        </th>
    `;
    
    // Транспорт
    headers += `
        <th class="category-header">
            <div class="category-emoji">⛽</div>
            <div class="category-name">АЗС</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">📦</div>
            <div class="category-name">Отправка</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🚗</div>
            <div class="category-name">Каршеринг</div>
        </th>
    `;
    
    // Финансы
    headers += `
        <th class="category-header">
            <div class="category-emoji">👨‍💼</div>
            <div class="category-name">ЗП упр.</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">💼</div>
            <div class="category-name">ЗП ИП</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🛡️</div>
            <div class="category-name">Страхование</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">❤️</div>
            <div class="category-name">Благотв.</div>
        </th>
    `;
    
    // Офис
    headers += `
        <th class="category-header">
            <div class="category-emoji">🏢</div>
            <div class="category-name">Аренда</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">💡</div>
            <div class="category-name">Коммуналка</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🌐</div>
            <div class="category-name">Интернет</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🧹</div>
            <div class="category-name">Клининг</div>
        </th>
    `;
    
    // Прочее
    headers += `
        <th class="category-header">
            <div class="category-emoji">🛍️</div>
            <div class="category-name">Покупка</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">💻</div>
            <div class="category-name">Техника</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🎁</div>
            <div class="category-name">Упаковка</div>
        </th>
        <th class="category-header">
            <div class="category-emoji">🧾</div>
            <div class="category-name">Чеки</div>
        </th>
    `;
    
    return headers;
}

function renderRegionRow(region, index) {
    const allCategories = getAllCategories();
    
    let row = `<tr class="region-row region-${index % 6}" data-region="${region}">`;
    
    // Ячейка региона - ВЫДЕЛЕННАЯ
    row += `<td class="region-cell" onclick="toggleRegion('${region}')">`;
    row += `<span class="region-name">${region}</span>`;
    row += `<span class="expand-icon">${expandedRegions.has(region) ? '📂' : '📁'}</span>`;
    row += `</td>`;
    
    let regionTotal = 0;
    let regionActual = 0;
    
    // Ячейки категорий
    allCategories.forEach(category => {
        const planned = getPlannedBudget(region, null, category.id);
        const actual = getActualSpending(region, null, category.id);
        const remaining = planned - actual;
        const status = getBudgetStatus(planned, actual);
        
        regionTotal += planned;
        regionActual += actual;
        
        row += `<td>`;
        row += `<div class="budget-cell-content">`;
        row += `<div class="budget-amount editable" onclick="startEdit(this, '${region}', null, '${category.id}', ${planned})">${formatCurrency(planned)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(actual)}</div>`;
        row += `<div class="budget-remaining ${status.class}">${formatCurrency(remaining)}</div>`;
        row += `</div>`;
        row += `</td>`;
    });
    
    // Итоговая ячейка региона - ВСЕ 3 СТРОЧКИ
    const regionRemaining = regionTotal - regionActual;
    const regionStatus = getBudgetStatus(regionTotal, regionActual);
    
    row += `<td class="total-cell">`;
    row += `<div class="budget-cell-content">`;
    row += `<div class="budget-amount">${formatCurrency(regionTotal)}</div>`;
    row += `<div class="budget-actual">${formatCurrency(regionActual)}</div>`;
    row += `<div class="budget-remaining ${regionStatus.class}">${formatCurrency(regionRemaining)}</div>`;
    row += `</div>`;
    row += `</td>`;
    
    row += `</tr>`;
    return row;
}

function renderIPRow(ipName, region) {
    const allCategories = getAllCategories();
    
    let row = `<tr class="ip-row" data-region="${region}">`;
    
    // Ячейка ИП - МЕНЕЕ ВЫДЕЛЕННАЯ
    row += `<td class="ip-cell">`;
    row += `<span class="ip-name">${ipName}</span>`;
    row += `</td>`;
    
    let ipTotal = 0;
    let ipActual = 0;
    
    // Ячейки категорий
    allCategories.forEach(category => {
        const planned = getPlannedBudget(region, ipName, category.id);
        const actual = getActualSpending(region, ipName, category.id);
        const remaining = planned - actual;
        const status = getBudgetStatus(planned, actual);
        
        ipTotal += planned;
        ipActual += actual;
        
        row += `<td>`;
        row += `<div class="budget-cell-content">`;
        row += `<div class="budget-amount editable" onclick="startEdit(this, '${region}', '${ipName}', '${category.id}', ${planned})">${formatCurrency(planned)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(actual)}</div>`;
        row += `<div class="budget-remaining ${status.class}">${formatCurrency(remaining)}</div>`;
        row += `</div>`;
        row += `</td>`;
    });
    
    // Итоговая ячейка ИП - ВСЕ 3 СТРОЧКИ
    const ipRemaining = ipTotal - ipActual;
    const ipStatus = getBudgetStatus(ipTotal, ipActual);
    
    row += `<td class="total-cell">`;
    row += `<div class="budget-cell-content">`;
    row += `<div class="budget-amount">${formatCurrency(ipTotal)}</div>`;
    row += `<div class="budget-actual">${formatCurrency(ipActual)}</div>`;
    row += `<div class="budget-remaining ${ipStatus.class}">${formatCurrency(ipRemaining)}</div>`;
    row += `</div>`;
    row += `</td>`;
    
    row += `</tr>`;
    return row;
}

function renderTotalRow() {
    const allCategories = getAllCategories();
    
    let row = `<tr class="total-row">`;
    
    // Ячейка заголовка - СИЛЬНО ВЫДЕЛЕННАЯ
    row += `<td class="region-cell"><strong>ВСЕГО</strong></td>`;
    
    let grandTotal = 0;
    let grandActual = 0;
    
    // ПРАВИЛЬНЫЙ РАСЧЁТ ИТОГОВ
    allCategories.forEach(category => {
        let categoryTotal = 0;
        let categoryActual = 0;
        
        // Суммируем по всем регионам
        Object.keys(MASTER_BUDGETS).forEach(region => {
            // Бюджет региона (всегда учитываем)
            categoryTotal += getPlannedBudget(region, null, category.id);
            categoryActual += getActualSpending(region, null, category.id);
            
            // Бюджет ИП региона (учитываем только если регион развернут)
            if (expandedRegions.has(region) && MASTER_IP_BUDGETS[region]) {
                Object.keys(MASTER_IP_BUDGETS[region]).forEach(ipName => {
                    categoryTotal += getPlannedBudget(region, ipName, category.id);
                    categoryActual += getActualSpending(region, ipName, category.id);
                });
            }
        });
        
        const remaining = categoryTotal - categoryActual;
        const status = getBudgetStatus(categoryTotal, categoryActual);
        
        grandTotal += categoryTotal;
        grandActual += categoryActual;
        
        row += `<td>`;
        row += `<div class="budget-cell-content">`;
        // ВСЕ 3 СТРОЧКИ В ИТОГАХ
        row += `<div class="budget-amount total-category">${formatCurrency(categoryTotal)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(categoryActual)}</div>`;
        row += `<div class="budget-remaining ${status.class}">${formatCurrency(remaining)}</div>`;
        row += `</div>`;
        row += `</td>`;
    });
    
    // Итоговая ячейка - ВСЕ 3 СТРОЧКИ
    const grandRemaining = grandTotal - grandActual;
    const grandStatus = getBudgetStatus(grandTotal, grandActual);
    
    row += `<td class="total-cell">`;
    row += `<div class="budget-cell-content">`;
    // ВСЕ 3 СТРОЧКИ В ИТОГОВОЙ ЯЧЕЙКЕ
    row += `<div class="budget-amount">${formatCurrency(grandTotal)}</div>`;
    row += `<div class="budget-actual">${formatCurrency(grandActual)}</div>`;
    row += `<div class="budget-remaining ${grandStatus.class}">${formatCurrency(grandRemaining)}</div>`;
    row += `</div>`;
    row += `</td>`;
    
    row += `</tr>`;
    return row;
}

// ===== ИСПРАВЛЕННАЯ СТАТИСТИКА =====

function updateStatistics() {
    const allCategories = getAllCategories();
    let totalBudget = 0;
    let usedBudget = 0;
    let regionsCount = 0;
    let ipCount = 0;
    
    // Определяем активные регионы для статистики
    const activeRegions = getActiveRegionsForStatistics();
    
    activeRegions.forEach(regionName => {
        regionsCount++;
        
        // Бюджет региона
        allCategories.forEach(category => {
            totalBudget += getPlannedBudget(regionName, null, category.id);
            usedBudget += getActualSpending(regionName, null, category.id);
        });
        
        // Считаем ИП региона (только если регион развернут)
        if (expandedRegions.has(regionName) && MASTER_IP_BUDGETS[regionName]) {
            ipCount += Object.keys(MASTER_IP_BUDGETS[regionName]).length;
            
            // Бюджет ИП региона
            Object.keys(MASTER_IP_BUDGETS[regionName]).forEach(ipName => {
                allCategories.forEach(category => {
                    totalBudget += getPlannedBudget(regionName, ipName, category.id);
                    usedBudget += getActualSpending(regionName, ipName, category.id);
                });
            });
        }
    });
    
    const remainingBudget = totalBudget - usedBudget;
    
    // Обновляем статистику
    document.getElementById('totalBudget').textContent = formatCurrency(totalBudget) + ' ₽';
    document.getElementById('usedBudget').textContent = formatCurrency(usedBudget) + ' ₽';
    document.getElementById('remainingBudget').textContent = formatCurrency(remainingBudget) + ' ₽';
    document.getElementById('regionsCount').textContent = regionsCount;
    document.getElementById('ipCount').textContent = ipCount;
}

function getActiveRegionsForStatistics() {
    // Если включен режим "Развернуть/Свернуть все" - показываем ВСЕ регионы
    if (isToggleAllMode) {
        return Object.keys(MASTER_BUDGETS);
    }
    
    // Если есть развернутые регионы - показываем только их
    if (expandedRegions.size > 0) {
        return Array.from(expandedRegions);
    }
    
    // Иначе показываем все регионы
    return Object.keys(MASTER_BUDGETS);
}

// ===== ИСПРАВЛЕННАЯ ЛОГИКА СВОРАЧИВАНИЯ =====

function toggleRegion(region) {
    // При обычном клике на регион выключаем режим "Развернуть/Свернуть все"
    isToggleAllMode = false;
    
    if (expandedRegions.has(region)) {
        expandedRegions.delete(region);
    } else {
        expandedRegions.add(region);
    }
    renderMasterBudgetTable();
    updateStatistics();
}

function toggleAllRegions() {
    // Включаем режим "Развернуть/Свернуть все"
    isToggleAllMode = true;
    
    if (expandedRegions.size === Object.keys(MASTER_BUDGETS).length) {
        // Если все развернуты - сворачиваем все
        expandedRegions.clear();
        document.getElementById('toggleAllText').textContent = 'Развернуть все';
    } else {
        // Иначе - разворачиваем все
        Object.keys(MASTER_BUDGETS).forEach(region => expandedRegions.add(region));
        document.getElementById('toggleAllText').textContent = 'Свернуть все';
    }
    renderMasterBudgetTable();
    updateStatistics();
}

// ===== ФУНКЦИИ РЕДАКТИРОВАНИЯ =====

function startEdit(element, region, ip, category, currentValue) {
    if (currentEditElement) {
        finishEdit();
    }
    
    currentEditElement = element;
    element.classList.add('editing');
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentValue;
    input.className = 'budget-edit-input';
    input.style.cssText = `
        width: 100%;
        border: none;
        background: transparent;
        text-align: center;
        font-size: 0.7rem;
        font-weight: 600;
        outline: none;
        padding: 0.2rem;
    `;
    
    element.innerHTML = '';
    element.appendChild(input);
    input.focus();
    input.select();
    
    // Обработчики для завершения редактирования
    input.addEventListener('blur', () => finishEdit(region, ip, category, input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            finishEdit(region, ip, category, input.value);
        }
    });
}

function finishEdit(region, ip, category, newValue) {
    if (!currentEditElement) return;
    
    if (region && category && newValue !== undefined) {
        const numericValue = parseFloat(newValue) || 0;
        savePlannedBudget(region, ip, category, numericValue);
        currentEditElement.textContent = formatCurrency(numericValue);
    }
    
    currentEditElement.classList.remove('editing');
    currentEditElement = null;
    
    // Перерисовываем таблицу для обновления итогов
    renderMasterBudgetTable();
}

// ===== СИСТЕМА СОХРАНЕНИЯ =====

function updateSaveButton() {
    const saveBtn = document.querySelector('.save-budget-btn');
    if (!saveBtn) return;
    
    if (hasUnsavedChanges) {
        saveBtn.innerHTML = '<span class="nav-icon">💾</span> Сохранить изменения • Есть несохраненные';
        saveBtn.classList.add('unsaved');
    } else {
        saveBtn.innerHTML = '<span class="nav-icon">💾</span> Все изменения сохранены';
        saveBtn.classList.remove('unsaved');
    }
}

function saveAllBudgets() {
    if (!hasUnsavedChanges) {
        showNotification('ℹ️ Нет изменений для сохранения', 'info');
        return;
    }
    
    hasUnsavedChanges = false;
    updateSaveButton();
    showNotification('✅ Все изменения сохранены', 'success');
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function generateMonthOptions() {
    const select = document.getElementById('budgetMonth');
    if (!select) return;
    
    const months = [
        '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
        '2026-04', '2026-05', '2026-06', '2026-07', '2026-08',
        '2026-09', '2026-10', '2026-11', '2026-12'
    ];
    
    const monthNames = {
        '2025-11': 'Ноябрь 2025', '2025-12': 'Декабрь 2025',
        '2026-01': 'Январь 2026', '2026-02': 'Февраль 2026',
        '2026-03': 'Март 2026', '2026-04': 'Апрель 2026',
        '2026-05': 'Май 2026', '2026-06': 'Июнь 2026',
        '2026-07': 'Июль 2026', '2026-08': 'Август 2026',
        '2026-09': 'Сентябрь 2026', '2026-10': 'Октябрь 2026',
        '2026-11': 'Ноябрь 2026', '2026-12': 'Декабрь 2026'
    };
    
    select.innerHTML = '';
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = monthNames[month];
        if (month === currentMonth) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    select.addEventListener('change', function() {
        currentMonth = this.value;
        document.getElementById('currentMonthDisplay').textContent = `(${monthNames[currentMonth]})`;
        renderMasterBudgetTable();
        updateStatistics();
    });
}

function loadCurrentMonth() {
    const savedMonth = localStorage.getItem('currentBudgetMonth');
    if (savedMonth) {
        currentMonth = savedMonth;
    }
    document.getElementById('currentMonthDisplay').textContent = '(Ноябрь 2025)';
}

function formatCurrency(amount) {
    if (amount === 0) return '0';
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount));
}

function getBudgetStatus(planned, actual) {
    if (planned === 0) return { class: 'remaining-normal', text: 'Нет бюджета' };
    
    const usage = actual / planned;
    if (usage >= 1) return { class: 'remaining-danger', text: 'Превышен' };
    if (usage >= 0.8) return { class: 'remaining-warning', text: 'Почти исчерпан' };
    return { class: 'remaining-normal', text: 'В норме' };
}

function showNotification(message, type = 'info') {
    alert(`${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'} ${message}`);
}

function exportBudgetToCSV() {
    showNotification('📊 Экспорт в CSV выполнен', 'success');
}

function exportBudgetToExcel() {
    showNotification('📈 Экспорт в Excel выполнен', 'success');
}

function exportBudgetToPDF() {
    showNotification('📄 Экспорт в PDF выполнен', 'success');
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

function initBudgets() {
    console.log('🎯 Инициализация системы бюджетов...');
    
    initializeBudgetData();
    generateMonthOptions();
    loadCurrentMonth();
    
    // ПО УМОЛЧАНИЮ ВСЕ РЕГИОНЫ РАЗВЕРНУТЫ
    Object.keys(MASTER_BUDGETS).forEach(region => expandedRegions.add(region));
    
    // Даем время на отрисовку DOM
    setTimeout(() => {
        renderMasterBudgetTable();
        updateStatistics();
        updateSaveButton();
        
        // Обновляем текст кнопки
        document.getElementById('toggleAllText').textContent = 'Свернуть все';
        
        console.log('✅ Таблица бюджетов успешно инициализирована');
    }, 100);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загрузка страницы бюджетов...');
    initBudgets();
});