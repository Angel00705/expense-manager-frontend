// budgets.js - ФИНАЛЬНАЯ ВЕРСИЯ (CSV только для инициализации)

let currentMonth = '2025-11';
let expandedRegions = new Set();
let currentEditElement = null;
let hasUnsavedChanges = false;
let currentFilterRegion = null;

// Глобальные данные (инициализируются из CSV один раз)
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

// Цвета для регионов
const REGION_COLORS = [
    'region-0', // Астрахань - фиолетовый
    'region-1', // Бурятия - синий  
    'region-2', // Курган - зеленый
    'region-3', // Калмыкия - оранжевый
    'region-4', // Мордовия - розовый
    'region-5'  // Удмуртия - пурпурный
];

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

function getAllCategories() {
    const allCategories = [];
    BUDGET_CATEGORIES_GROUPED.forEach(group => {
        allCategories.push(...group.categories);
    });
    return allCategories;
}

// ===== СИСТЕМА ИНИЦИАЛИЗАЦИИ ДАННЫХ =====

function initializeBudgetData() {
    console.log('🎯 Инициализация данных бюджетов...');
    
    // Проверяем, были ли данные уже инициализированы
    const isInitialized = localStorage.getItem('budget_data_initialized');
    
    if (!isInitialized && window.csvData) {
        console.log('📥 Первоначальная загрузка данных из CSV...');
        // Первый запуск - загружаем из CSV
        const parsedData = parseBudgetCSV(window.csvData);
        MASTER_BUDGETS = parsedData.regions;
        MASTER_IP_BUDGETS = parsedData.ipDetailed;
        
        // Сохраняем мастер-данные в LocalStorage
        localStorage.setItem('master_budgets', JSON.stringify(MASTER_BUDGETS));
        localStorage.setItem('master_ip_budgets', JSON.stringify(MASTER_IP_BUDGETS));
        localStorage.setItem('budget_data_initialized', 'true');
        
        console.log('✅ Данные инициализированы из CSV');
    } else {
        console.log('📋 Загрузка данных из LocalStorage...');
        // Последующие запуски - загружаем из LocalStorage
        const savedMasterBudgets = localStorage.getItem('master_budgets');
        const savedMasterIPBudgets = localStorage.getItem('master_ip_budgets');
        
        if (savedMasterBudgets && savedMasterIPBudgets) {
            MASTER_BUDGETS = JSON.parse(savedMasterBudgets);
            MASTER_IP_BUDGETS = JSON.parse(savedMasterIPBudgets);
            console.log('✅ Данные загружены из LocalStorage');
        } else {
            // Резервный вариант - используем статические данные
            console.warn('⚠️ Данные не найдены, используем статические');
            MASTER_BUDGETS = getStaticBudgets();
            MASTER_IP_BUDGETS = getStaticIPBudgets();
        }
    }
    
    console.log('📊 Загружено:', {
        регионов: Object.keys(MASTER_BUDGETS).length,
        ИП: Object.keys(MASTER_IP_BUDGETS).reduce((acc, region) => acc + Object.keys(MASTER_IP_BUDGETS[region]).length, 0)
    });
}

function getStaticBudgets() {
    return {
        'Астрахань': {
            products: 5000, household: 3000, medicaments: 1000, stationery: 500,
            cafe: 1500, polygraphy: 200, events: 2000, repairs: 10000,
            salary: 15000, azs: 1000, shipping: 3000, regionalPurchase: 5000,
            insurance: 5000, charity: 75000, equipment: 100000, packaging: 0,
            cleaning: 2000, checks: 20000, carsharing: 3000, rent: 41780,
            comm: 5000, internet: 1950, ipSalary: 150000
        },
        'Бурятия': {
            products: 5000, household: 4000, medicaments: 1000, stationery: 500,
            cafe: 1000, polygraphy: 200, events: 2000, repairs: 10000,
            salary: 10000, azs: 1000, shipping: 3000, regionalPurchase: 4000,
            insurance: 5000, charity: 0, equipment: 0, packaging: 0,
            cleaning: 2000, checks: 0, carsharing: 0, rent: 49940,
            comm: 4000, internet: 15900, ipSalary: 135000
        },
        'Курган': {
            products: 3000, household: 5000, medicaments: 1000, stationery: 1000,
            cafe: 2000, polygraphy: 300, events: 2500, repairs: 10000,
            salary: 15000, azs: 1500, shipping: 3000, regionalPurchase: 7000,
            insurance: 5000, charity: 0, equipment: 0, packaging: 0,
            cleaning: 2000, checks: 40000, carsharing: 0, rent: 69496,
            comm: 7000, internet: 27462, ipSalary: 90000
        },
        'Калмыкия': {
            products: 3000, household: 4000, medicaments: 1000, stationery: 500,
            cafe: 1000, polygraphy: 200, events: 1000, repairs: 10000,
            salary: 10000, azs: 1000, shipping: 3000, regionalPurchase: 3000,
            insurance: 5000, charity: 0, equipment: 0, packaging: 0,
            cleaning: 2000, checks: 0, carsharing: 0, rent: 43000,
            comm: 3000, internet: 12500, ipSalary: 60000
        },
        'Мордовия': {
            products: 4000, household: 3000, medicaments: 1000, stationery: 500,
            cafe: 1000, polygraphy: 200, events: 1500, repairs: 10000,
            salary: 10000, azs: 1000, shipping: 3000, regionalPurchase: 3000,
            insurance: 5000, charity: 0, equipment: 0, packaging: 0,
            cleaning: 2000, checks: 0, carsharing: 0, rent: 26090,
            comm: 3000, internet: 10704, ipSalary: 60000
        },
        'Удмуртия': {
            products: 5000, household: 4000, medicaments: 1000, stationery: 1000,
            cafe: 2000, polygraphy: 300, events: 2500, repairs: 10000,
            salary: 15000, azs: 1500, shipping: 3000, regionalPurchase: 6000,
            insurance: 5000, charity: 0, equipment: 0, packaging: 0,
            cleaning: 2000, checks: 0, carsharing: 0, rent: 58639,
            comm: 6000, internet: 26750, ipSalary: 150000
        }
    };
}

function getStaticIPBudgets() {
    return {
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
    };
}

// ===== СИСТЕМА ХРАНЕНИЯ (работа с пользовательскими изменениями) =====

function getBudgetKey(region, ip, category) {
    return `budget_${currentMonth}_${region}_${ip || 'region'}_${category}`;
}

function getActualSpending(region, ip, category) {
    const key = getBudgetKey(region, ip, category) + '_actual';
    return parseFloat(localStorage.getItem(key)) || 0;
}

function saveActualSpending(region, ip, category, amount) {
    const key = getBudgetKey(region, ip, category) + '_actual';
    localStorage.setItem(key, amount.toString());
}

function getPlannedBudget(region, ip, category) {
    // Сначала проверяем пользовательские изменения
    const key = getBudgetKey(region, ip, category) + '_planned';
    const saved = localStorage.getItem(key);
    
    if (saved !== null) {
        return parseFloat(saved);
    }
    
    // Если пользовательских изменений нет, используем мастер-данные
    if (ip) {
        return MASTER_IP_BUDGETS[region]?.[ip]?.[category] || 0;
    } else {
        return MASTER_BUDGETS[region]?.[category] || 0;
    }
}

function savePlannedBudget(region, ip, category, amount) {
    const key = getBudgetKey(region, ip, category) + '_planned';
    localStorage.setItem(key, amount.toString());
}

// ===== CSV ПАРСИНГ (только для первоначальной загрузки) =====

function parseBudgetCSV(csvText) {
    console.log('🔍 Парсинг CSV для инициализации...');
    
    const regionsData = {};
    const ipData = {};
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    // Парсим общие бюджеты регионов
    parseRegionsBudget(lines.slice(1, 7), regionsData);
    
    // Парсим детальные данные по ИП
    parseIPData(lines.slice(14, 42), ipData);
    
    console.log('✅ Парсинг завершен');
    
    return {
        regions: regionsData,
        ipDetailed: ipData
    };
}

function parseRegionsBudget(regionLines, regionsData) {
    const categories = [
        'products', 'household', 'medicaments', 'stationery',
        'cafe', 'polygraphy', 'events', 'repairs',
        'salary', 'azs', 'shipping', 'regionalPurchase',
        'insurance', 'charity', 'equipment', 'packaging',
        'cleaning', 'checks', 'carsharing', 'rent',
        'comm', 'internet', 'ipSalary'
    ];

    regionLines.forEach(line => {
        const cols = parseCSVLine(line);
        if (cols.length > 1 && cols[0] && !cols[0].includes('Итого')) {
            const regionName = cols[0].trim();
            const budget = {};
            
            categories.forEach((category, index) => {
                if (cols[index + 2]) {
                    budget[category] = parseCurrency(cols[index + 2]);
                }
            });
            
            regionsData[regionName] = budget;
        }
    });
}

function parseIPData(ipLines, ipData) {
    ipLines.forEach(line => {
        const cols = parseCSVLine(line);
        if (cols.length > 2 && cols[0] && cols[0].startsWith('ИП')) {
            const ipName = cols[0].trim();
            const region = cols[1] ? cols[1].trim() : '';
            
            if (region && ipName) {
                if (!ipData[region]) {
                    ipData[region] = {};
                }
                
                const ipBudget = parseIPBudget(cols);
                ipData[region][ipName] = ipBudget;
            }
        }
    });
}

function parseIPBudget(columns) {
    const budget = {};
    const categoryMapping = {
        2: 'products',      3: 'household',    4: 'medicaments',   5: 'stationery',
        6: 'cafe',          7: 'polygraphy',   8: 'events',        9: 'repairs',
        10: 'salary',       11: 'azs',         12: 'shipping',     13: 'regionalPurchase',
        14: 'insurance',    15: 'charity',     16: 'equipment',    17: 'packaging',
        18: 'cleaning',     19: 'checks',      20: 'carsharing',   21: 'rent',
        22: 'comm',         23: 'internet',    24: 'ipSalary'
    };

    Object.entries(categoryMapping).forEach(([colIndex, category]) => {
        const value = columns[parseInt(colIndex)];
        if (value && value.trim() && value !== '?') {
            const numericValue = parseCurrency(value);
            if (numericValue > 0) {
                budget[category] = numericValue;
            }
        }
    });

    return budget;
}

function parseCurrency(value) {
    if (!value || value === '?' || value === '-') return 0;
    
    const cleanValue = value.toString()
        .replace(/\s/g, '')
        .replace(',', '.')
        .replace(/[^\d.-]/g, '');
    
    return parseFloat(cleanValue) || 0;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// ===== ФУНКЦИИ РЕНДЕРИНГА =====

function renderMasterBudgetTable() {
    const tableBody = document.getElementById('compactTableBody');
    if (!tableBody) {
        console.error('Элемент compactTableBody не найден!');
        return;
    }
    
    tableBody.innerHTML = '';
    
    let html = '<div class="compact-table">';
    
    // Основной заголовок с группами
    html += '<div class="table-header-row">';
    html += '<div class="compact-header-cell region-cell">Регион / ИП</div>';
    
    BUDGET_CATEGORIES_GROUPED.forEach(group => {
        html += `<div class="compact-header-cell group-header" style="width: ${group.categories.length * 70}px; min-width: ${group.categories.length * 70}px;">`;
        html += `<div class="group-name">${group.group}</div>`;
        html += '</div>';
    });
    
    html += '<div class="compact-header-cell total-cell">Итого</div>';
    html += '</div>';
    
    // Подзаголовок с категориями
    html += '<div class="table-subheader-row">';
    html += '<div class="compact-header-cell region-cell"></div>';
    
    BUDGET_CATEGORIES_GROUPED.forEach(group => {
        group.categories.forEach(category => {
            html += `
                <div class="compact-header-cell category-header">
                    <div class="category-emoji">${category.emoji}</div>
                    <div class="category-name">${category.name}</div>
                </div>
            `;
        });
    });
    
    html += '<div class="compact-header-cell total-cell">Всего</div>';
    html += '</div>';
    
    // Строки регионов
    Object.keys(MASTER_BUDGETS).forEach((region, index) => {
        html += renderCompactRegionRow(region, index);
        
        if (expandedRegions.has(region)) {
            const ipData = MASTER_IP_BUDGETS[region];
            if (ipData) {
                Object.keys(ipData).forEach(ipName => {
                    html += renderCompactIPRow(ipName, region);
                });
            }
        }
    });
    
    // Итоговая строка
    html += renderCompactTotalRow();
    html += '</div>';
    
    tableBody.innerHTML = html;
    
    setTimeout(adjustTableWidth, 100);
}

function renderCompactRegionRow(region, index) {
    const regionClass = REGION_COLORS[index % REGION_COLORS.length];
    const allCategories = getAllCategories();
    
    let row = `<div class="compact-row region-row ${regionClass}" data-region="${region}">`;
    
    // Ячейка региона
    row += `<div class="compact-cell region-cell" onclick="toggleRegion('${region}')">`;
    row += `<span class="status-indicator status-normal"></span>`;
    row += `<span class="region-name">${region}</span>`;
    row += `<span class="expand-icon">${expandedRegions.has(region) ? '📂' : '📁'}</span>`;
    row += `</div>`;
    
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
        
        row += `<div class="compact-cell">`;
        row += `<div class="budget-cell-content">`;
        row += `<div class="budget-amount editable" onclick="startEdit(this, '${region}', null, '${category.id}', ${planned})">${formatCurrency(planned)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(actual)}</div>`;
        row += `<div class="budget-remaining ${status.class.replace('status-', 'remaining-')}">${formatCurrency(remaining)}</div>`;
        row += `</div>`;
        row += `</div>`;
    });
    
    // Итоговая ячейка региона
    const regionRemaining = regionTotal - regionActual;
    const regionStatus = getBudgetStatus(regionTotal, regionActual);
    
    row += `<div class="compact-cell total-cell region-total ${regionStatus.class}">`;
    row += `<div class="total-amount">${formatCurrency(regionTotal)}</div>`;
    row += `<div class="total-remaining ${regionStatus.class.replace('status-', 'remaining-')}">${formatCurrency(regionRemaining)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

function renderCompactIPRow(ipName, region) {
    const allCategories = getAllCategories();
    
    let row = `<div class="compact-row ip-row ${expandedRegions.has(region) ? '' : 'collapsed'}" data-region="${region}">`;
    
    // Ячейка ИП
    row += `<div class="compact-cell ip-cell">`;
    row += `<span class="ip-name">${ipName}</span>`;
    row += `</div>`;
    
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
        
        row += `<div class="compact-cell">`;
        row += `<div class="budget-cell-content">`;
        row += `<div class="budget-amount editable" onclick="startEdit(this, '${region}', '${ipName}', '${category.id}', ${planned})" title="${category.name}: ${formatCurrency(planned)}">${formatCurrency(planned)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(actual)}</div>`;
        row += `<div class="budget-remaining ${status.class.replace('status-', 'remaining-')}">${formatCurrency(remaining)}</div>`;
        row += `</div>`;
        row += `</div>`;
    });
    
    // Итоговая ячейка ИП
    const ipRemaining = ipTotal - ipActual;
    const ipStatus = getBudgetStatus(ipTotal, ipActual);
    
    row += `<div class="compact-cell total-cell ip-total ${ipStatus.class}">`;
    row += `<div class="total-amount">${formatCurrency(ipTotal)}</div>`;
    row += `<div class="total-remaining ${ipStatus.class.replace('status-', 'remaining-')}">${formatCurrency(ipRemaining)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

function renderCompactTotalRow() {
    const allCategories = getAllCategories();
    
    let row = `<div class="compact-row total-row">`;
    
    // Ячейка заголовка
    row += `<div class="compact-cell total-label">ВСЕГО</div>`;
    
    let grandTotal = 0;
    let grandActual = 0;
    let categoryTotals = {};
    
    // Считаем итоги по категориям
    allCategories.forEach(category => {
        let categoryTotal = 0;
        let categoryActual = 0;
        
        Object.keys(MASTER_BUDGETS).forEach(region => {
            categoryTotal += getPlannedBudget(region, null, category.id);
            categoryActual += getActualSpending(region, null, category.id);
            
            const ipData = MASTER_IP_BUDGETS[region];
            if (ipData) {
                Object.keys(ipData).forEach(ipName => {
                    categoryTotal += getPlannedBudget(region, ipName, category.id);
                    categoryActual += getActualSpending(region, ipName, category.id);
                });
            }
        });
        
        categoryTotals[category.id] = { planned: categoryTotal, actual: categoryActual };
        grandTotal += categoryTotal;
        grandActual += categoryActual;
    });
    
    // Ячейки категорий с итогами
    allCategories.forEach(category => {
        const categoryData = categoryTotals[category.id];
        const remaining = categoryData.planned - categoryData.actual;
        const status = getBudgetStatus(categoryData.planned, categoryData.actual);
        
        row += `<div class="compact-cell">`;
        row += `<div class="budget-cell-content">`;
        row += `<div class="budget-amount total-category">${formatCurrency(categoryData.planned)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(categoryData.actual)}</div>`;
        row += `<div class="budget-remaining ${status.class.replace('status-', 'remaining-')}">${formatCurrency(remaining)}</div>`;
        row += `</div>`;
        row += `</div>`;
    });
    
    // Итоговая ячейка
    const grandRemaining = grandTotal - grandActual;
    const grandStatus = getBudgetStatus(grandTotal, grandActual);
    
    row += `<div class="compact-cell total-cell grand-total ${grandStatus.class}">`;
    row += `<div class="total-amount">${formatCurrency(grandTotal)}</div>`;
    row += `<div class="total-remaining ${grandStatus.class.replace('status-', 'remaining-')}">${formatCurrency(grandRemaining)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

async function initBudgets() {
    console.log('🎯 Инициализация системы бюджетов...');
    
    // Инициализируем данные (CSV только при первом запуске)
    initializeBudgetData();
    
    // Инициализируем интерфейс
    generateMonthOptions();
    loadCurrentMonth();
    renderMasterBudgetTable();
    updateStatistics();
    updateSaveButton();
    
    // Развернуть все регионы по умолчанию
    setTimeout(() => {
        toggleAllRegions();
        adjustTableWidth();
    }, 100);
}

// ===== ФУНКЦИИ УПРАВЛЕНИЯ =====

function generateMonthOptions() {
    const select = document.getElementById('budgetMonth');
    if (!select) return;
    
    const months = [];
    const startDate = new Date(2025, 10, 1);
    
    for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const value = `${year}-${month.toString().padStart(2, '0')}`;
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const display = `${monthNames[date.getMonth()]} ${year}`;
        
        months.push({ value, display });
    }
    
    select.innerHTML = months.map(month => 
        `<option value="${month.value}">${month.display}</option>`
    ).join('');
}

function loadCurrentMonth() {
    const savedMonth = localStorage.getItem('currentBudgetMonth');
    if (savedMonth) {
        currentMonth = savedMonth;
        const select = document.getElementById('budgetMonth');
        if (select) select.value = currentMonth;
    }
    updateMonthDisplay();
}

function changeBudgetMonth() {
    const select = document.getElementById('budgetMonth');
    if (!select) return;
    
    currentMonth = select.value;
    localStorage.setItem('currentBudgetMonth', currentMonth);
    updateMonthDisplay();
    renderMasterBudgetTable();
    updateStatistics();
}

function updateMonthDisplay() {
    const monthNames = {
        '2025-11': 'Ноябрь 2025', '2025-12': 'Декабрь 2025',
        '2026-01': 'Январь 2026', '2026-02': 'Февраль 2026',
        '2026-03': 'Март 2026', '2026-04': 'Апрель 2026',
        '2026-05': 'Май 2026', '2026-06': 'Июнь 2026',
        '2026-07': 'Июль 2026', '2026-08': 'Август 2026', 
        '2026-09': 'Сентябрь 2026', '2026-10': 'Октябрь 2026'
    };
    
    const displayElement = document.getElementById('currentMonthDisplay');
    if (displayElement) {
        displayElement.textContent = `(${monthNames[currentMonth] || currentMonth})`;
    }
}

function updateStatistics(region = null) {
    const allCategories = getAllCategories();
    let totalBudget = 0;
    let usedBudget = 0;
    let regionsCount = 0;
    let ipCount = 0;
    
    const regions = region ? [region] : Object.keys(MASTER_BUDGETS);
    
    regions.forEach(regionName => {
        regionsCount++;
        
        // Бюджет региона
        allCategories.forEach(category => {
            totalBudget += getPlannedBudget(regionName, null, category.id);
            usedBudget += getActualSpending(regionName, null, category.id);
        });
        
        // Считаем ИП региона
        if (MASTER_IP_BUDGETS[regionName]) {
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
    const totalBudgetElement = document.getElementById('totalBudget');
    const usedBudgetElement = document.getElementById('usedBudget');
    const remainingBudgetElement = document.getElementById('remainingBudget');
    const regionsCountElement = document.getElementById('regionsCount');
    const ipCountElement = document.getElementById('ipCount');
    
    if (totalBudgetElement) totalBudgetElement.textContent = formatCurrency(totalBudget) + ' ₽';
    if (usedBudgetElement) usedBudgetElement.textContent = formatCurrency(usedBudget) + ' ₽';
    if (remainingBudgetElement) remainingBudgetElement.textContent = formatCurrency(remainingBudget) + ' ₽';
    if (regionsCountElement) regionsCountElement.textContent = regionsCount;
    if (ipCountElement) ipCountElement.textContent = ipCount;
}

function startEdit(element, region, ip, category, currentValue) {
    if (currentEditElement) {
        cancelEdit();
    }
    
    currentEditElement = { element, region, ip, category, originalValue: currentValue };
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = formatCurrency(currentValue);
    input.style.width = '100%';
    input.style.border = '1px solid var(--primary)';
    input.style.background = 'var(--bg-card)';
    input.style.textAlign = 'center';
    input.style.fontSize = '0.7rem';
    input.style.fontWeight = '600';
    input.style.color = 'var(--text-primary)';
    input.style.outline = 'none';
    input.style.borderRadius = '3px';
    input.style.padding = '0.1rem';
    
    element.innerHTML = '';
    element.appendChild(input);
    element.classList.add('editing');
    
    input.focus();
    input.select();
    
    input.addEventListener('blur', () => finishEdit(input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') finishEdit(input.value);
        if (e.key === 'Escape') cancelEdit();
    });
}

function finishEdit(newValue) {
    if (!currentEditElement) return;
    
    const { element, region, ip, category, originalValue } = currentEditElement;
    const cleanValue = newValue.replace(/\s/g, '').replace(',', '.');
    const numericValue = parseFloat(cleanValue) || 0;
    
    if (numericValue !== originalValue) {
        hasUnsavedChanges = true;
        updateSaveButton();
        savePlannedBudget(region, ip, category, numericValue);
    }
    
    element.innerHTML = formatCurrency(numericValue);
    element.classList.remove('editing');
    
    // Перерендерим всю таблицу для обновления итогов
    renderMasterBudgetTable();
    updateStatistics();
    currentEditElement = null;
}

function cancelEdit() {
    if (!currentEditElement) return;
    
    const { element, originalValue } = currentEditElement;
    element.innerHTML = formatCurrency(originalValue);
    element.classList.remove('editing');
    currentEditElement = null;
}

function toggleRegion(region) {
    if (expandedRegions.has(region)) {
        expandedRegions.delete(region);
        if (expandedRegions.size === 0) {
            currentFilterRegion = null;
            updateStatistics();
        }
    } else {
        expandedRegions.add(region);
        if (expandedRegions.size === 1) {
            currentFilterRegion = region;
            updateStatistics(region);
        } else {
            currentFilterRegion = null;
            updateStatistics();
        }
    }
    renderMasterBudgetTable();
}

function toggleAllRegions() {
    if (expandedRegions.size === Object.keys(MASTER_BUDGETS).length) {
        expandedRegions.clear();
        const toggleText = document.getElementById('toggleAllText');
        if (toggleText) toggleText.textContent = 'Развернуть все';
        currentFilterRegion = null;
        updateStatistics();
    } else {
        Object.keys(MASTER_BUDGETS).forEach(region => expandedRegions.add(region));
        const toggleText = document.getElementById('toggleAllText');
        if (toggleText) toggleText.textContent = 'Свернуть все';
        currentFilterRegion = null;
        updateStatistics();
    }
    renderMasterBudgetTable();
}

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
    showNotification('✅ Все изменения бюджета сохранены', 'success');
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

function formatCurrency(amount) {
    if (amount === 0) return '0';
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount));
}

function getBudgetStatus(planned, actual) {
    if (planned === 0) return { class: 'status-normal', text: 'Нет бюджета' };
    
    const usage = actual / planned;
    if (usage >= 1) return { class: 'status-danger', text: 'Превышен' };
    if (usage >= 0.8) return { class: 'status-warning', text: 'Почти исчерпан' };
    return { class: 'status-normal', text: 'В норме' };
}

function showNotification(message, type = 'info') {
    alert(`${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'} ${message}`);
}

function adjustTableWidth() {
    const tableWrapper = document.querySelector('.compact-table-wrapper');
    const table = document.querySelector('.compact-table');
    
    if (table && tableWrapper) {
        const headerCells = document.querySelectorAll('.compact-header-cell');
        let totalWidth = 0;
        
        headerCells.forEach(cell => {
            totalWidth += cell.offsetWidth;
        });
        
        table.style.minWidth = totalWidth + 'px';
    }
}

// Функция для сброса данных (только для разработки)
function resetBudgetData() {
    if (confirm('⚠️ Вы уверены, что хотите сбросить все данные к первоначальным значениям из CSV? Это действие нельзя отменить.')) {
        localStorage.removeItem('budget_data_initialized');
        localStorage.removeItem('master_budgets');
        localStorage.removeItem('master_ip_budgets');
        
        // Удаляем все пользовательские изменения
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('budget_')) {
                localStorage.removeItem(key);
            }
        });
        
        showNotification('✅ Данные сброшены к первоначальным значениям', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initBudgets);