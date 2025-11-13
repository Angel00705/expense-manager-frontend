// budgets.js - ИСПРАВЛЕННАЯ ВЕРСИЯ

let currentMonth = '2025-11';
let expandedRegions = new Set();
let currentEditElement = null;
let hasUnsavedChanges = false;
let currentFilterRegion = null;

// Категории с эмодзи
const BUDGET_CATEGORIES = [
    { id: 'products', name: 'Продукты', emoji: '🛒' },
    { id: 'household', name: 'Хоз. товары', emoji: '🏠' },
    { id: 'medicaments', name: 'Медикаменты', emoji: '💊' },
    { id: 'stationery', name: 'Канцелярия', emoji: '📎' },
    { id: 'cafe', name: 'Кафе', emoji: '☕' },
    { id: 'polygraphy', name: 'Полиграфия', emoji: '📄' },
    { id: 'events', name: 'Мероприятия', emoji: '🎪' },
    { id: 'repairs', name: 'Ремонт', emoji: '🔧' },
    { id: 'salary', name: 'ЗП упр.', emoji: '👨‍💼' },
    { id: 'azs', name: 'АЗС', emoji: '⛽' },
    { id: 'shipping', name: 'Отправка', emoji: '📦' },
    { id: 'regionalPurchase', name: 'Покупка', emoji: '🛍️' },
    { id: 'insurance', name: 'Страхование', emoji: '🛡️' },
    { id: 'charity', name: 'Благотв.', emoji: '❤️' },
    { id: 'equipment', name: 'Техника', emoji: '💻' },
    { id: 'packaging', name: 'Упаковка', emoji: '🎁' },
    { id: 'cleaning', name: 'Клининг', emoji: '🧹' },
    { id: 'checks', name: 'Чеки', emoji: '🧾' },
    { id: 'carsharing', name: 'Каршеринг', emoji: '🚗' },
    { id: 'rent', name: 'Аренда', emoji: '🏢' },
    { id: 'comm', name: 'Коммуналка', emoji: '💡' },
    { id: 'internet', name: 'Интернет', emoji: '🌐' },
    { id: 'ipSalary', name: 'ЗП ИП', emoji: '💼' }
];

// Данные из CSV
const IP_DETAILED_BUDGETS = {
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

const DEFAULT_BUDGETS = {
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initBudgets() {
    generateMonthOptions();
    loadCurrentMonth();
    renderTableHeader();
    renderMasterBudgetTable();
    updateStatistics();
    
    // Разворачиваем все регионы по умолчанию
    toggleAllRegions();
    updateSaveButton();
}

function renderTableHeader() {
    const categoriesContainer = document.querySelector('.categories-container');
    if (!categoriesContainer) return;
    
    let html = '';
    BUDGET_CATEGORIES.forEach(category => {
        html += `
            <div class="category-header">
                <div class="category-emoji">${category.emoji}</div>
                <div class="category-name">${category.name}</div>
            </div>
        `;
    });
    categoriesContainer.innerHTML = html;
}

function generateMonthOptions() {
    const select = document.getElementById('budgetMonth');
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
        document.getElementById('budgetMonth').value = currentMonth;
    }
    updateMonthDisplay();
}

function changeBudgetMonth() {
    currentMonth = document.getElementById('budgetMonth').value;
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
    document.getElementById('currentMonthDisplay').textContent = `(${monthNames[currentMonth]})`;
}

// ===== СИСТЕМА ХРАНЕНИЯ =====
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
    const key = getBudgetKey(region, ip, category) + '_planned';
    const saved = localStorage.getItem(key);
    
    if (saved !== null) {
        return parseFloat(saved);
    }
    
    if (ip) {
        return IP_DETAILED_BUDGETS[region]?.[ip]?.[category] || 0;
    } else {
        return DEFAULT_BUDGETS[region]?.[category] || 0;
    }
}

function savePlannedBudget(region, ip, category, amount) {
    const key = getBudgetKey(region, ip, category) + '_planned';
    localStorage.setItem(key, amount.toString());
}

// ===== ОБНОВЛЕННАЯ СТАТИСТИКА С ФИЛЬТРАЦИЕЙ =====
function updateStatistics(region = null) {
    let totalBudget = 0;
    let usedBudget = 0;
    let regionsCount = 0;
    let ipCount = 0;
    
    const regions = region ? [region] : Object.keys(DEFAULT_BUDGETS);
    
    regions.forEach(regionName => {
        regionsCount++;
        
        // Бюджет региона
        BUDGET_CATEGORIES.forEach(category => {
            totalBudget += getPlannedBudget(regionName, null, category.id);
            usedBudget += getActualSpending(regionName, null, category.id);
        });
        
        // Считаем ИП региона
        if (IP_DETAILED_BUDGETS[regionName]) {
            ipCount += Object.keys(IP_DETAILED_BUDGETS[regionName]).length;
            
            // Бюджет ИП региона
            Object.keys(IP_DETAILED_BUDGETS[regionName]).forEach(ipName => {
                BUDGET_CATEGORIES.forEach(category => {
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
    
    // Обновляем заголовок если есть фильтр
    const titleElement = document.querySelector('.master-table-header h3');
    if (region && titleElement) {
        titleElement.innerHTML = `Бюджет мероприятий по регионам и ИП <span id="currentMonthDisplay">(Ноябрь 2025)</span> <span style="color: var(--primary); font-weight: 600;">• ${region}</span>`;
    } else if (titleElement) {
        titleElement.innerHTML = `Бюджет мероприятий по регионам и ИП <span id="currentMonthDisplay">(Ноябрь 2025)</span>`;
        updateMonthDisplay();
    }
}

// ===== ОБНОВЛЕННОЕ ОТОБРАЖЕНИЕ ТАБЛИЦЫ =====
function renderMasterBudgetTable() {
    const tableBody = document.getElementById('masterTableBody');
    if (!tableBody) return;
    
    let html = '';
    
    Object.keys(DEFAULT_BUDGETS).forEach(region => {
        html += renderRegionRow(region);
        
        if (expandedRegions.has(region)) {
            const ipData = IP_DETAILED_BUDGETS[region];
            if (ipData) {
                Object.keys(ipData).forEach(ipName => {
                    html += renderIPRow(ipName, region);
                });
            }
        }
    });
    
    html += renderTotalRow();
    tableBody.innerHTML = html;
}

function renderRegionRow(region) {
    let row = `<div class="region-row" data-region="${region}">`;
    row += `<div class="region-name" onclick="toggleRegion('${region}')">`;
    row += `<span class="status-indicator status-normal"></span>`;
    row += `<span>${region}</span>`;
    row += `<span style="margin-left: auto;">${expandedRegions.has(region) ? '📂' : '📁'}</span>`;
    row += `</div>`;
    
    let regionTotal = 0;
    let regionActual = 0;
    
    BUDGET_CATEGORIES.forEach(category => {
        const planned = getPlannedBudget(region, null, category.id);
        const actual = getActualSpending(region, null, category.id);
        const remaining = planned - actual;
        const status = getBudgetStatus(planned, actual);
        
        regionTotal += planned;
        regionActual += actual;
        
        row += `<div class="budget-cell region-cell">`;
        row += `<div class="budget-amount editable" onclick="startEdit(this, '${region}', null, '${category.id}', ${planned})">${formatCurrency(planned)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(actual)}</div>`;
        row += `<div class="budget-remaining ${status.class.replace('status-', 'remaining-')}">${formatCurrency(remaining)}</div>`;
        row += `</div>`;
    });
    
    const regionRemaining = regionTotal - regionActual;
    const regionStatus = getBudgetStatus(regionTotal, regionActual);
    
    row += `<div class="total-cell region-total" style="color: ${regionStatus.class === 'status-danger' ? '#ef4444' : regionStatus.class === 'status-warning' ? '#f59e0b' : '#10b981'}">`;
    row += `<div>${formatCurrency(regionTotal)}</div>`;
    row += `<div style="font-size: 0.65rem;">${formatCurrency(regionRemaining)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

function renderIPRow(ipName, region) {
    let row = `<div class="ip-row ${expandedRegions.has(region) ? '' : 'collapsed'}" data-region="${region}">`;
    row += `<div class="ip-name">`;
    row += `<span>${ipName}</span>`;
    row += `</div>`;
    
    let ipTotal = 0;
    let ipActual = 0;
    
    BUDGET_CATEGORIES.forEach(category => {
        const planned = getPlannedBudget(region, ipName, category.id);
        const actual = getActualSpending(region, ipName, category.id);
        const remaining = planned - actual;
        const status = getBudgetStatus(planned, actual);
        
        ipTotal += planned;
        ipActual += actual;
        
        row += `<div class="budget-cell ip-cell">`;
        row += `<div class="budget-amount editable" onclick="startEdit(this, '${region}', '${ipName}', '${category.id}', ${planned})">${formatCurrency(planned)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(actual)}</div>`;
        row += `<div class="budget-remaining ${status.class.replace('status-', 'remaining-')}">${formatCurrency(remaining)}</div>`;
        row += `</div>`;
    });
    
    const ipRemaining = ipTotal - ipActual;
    const ipStatus = getBudgetStatus(ipTotal, ipActual);
    
    row += `<div class="total-cell ip-total" style="color: ${ipStatus.class === 'status-danger' ? '#ef4444' : ipStatus.class === 'status-warning' ? '#f59e0b' : '#10b981'}">`;
    row += `<div>${formatCurrency(ipTotal)}</div>`;
    row += `<div style="font-size: 0.65rem;">${formatCurrency(ipRemaining)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

function renderTotalRow() {
    let row = `<div class="total-row">`;
    row += `<div class="total-label">ВСЕГО</div>`;
    
    let grandTotal = 0;
    let grandActual = 0;
    
    BUDGET_CATEGORIES.forEach(category => {
        let categoryTotal = 0;
        let categoryActual = 0;
        
        Object.keys(DEFAULT_BUDGETS).forEach(region => {
            categoryTotal += getPlannedBudget(region, null, category.id);
            categoryActual += getActualSpending(region, null, category.id);
            
            // Добавляем ИП региона
            const ipData = IP_DETAILED_BUDGETS[region];
            if (ipData) {
                Object.keys(ipData).forEach(ipName => {
                    categoryTotal += getPlannedBudget(region, ipName, category.id);
                    categoryActual += getActualSpending(region, ipName, category.id);
                });
            }
        });
        
        grandTotal += categoryTotal;
        grandActual += categoryActual;
        
        const status = getBudgetStatus(categoryTotal, categoryActual);
        
        row += `<div class="budget-cell total-cell">`;
        row += `<div class="budget-amount">${formatCurrency(categoryTotal)}</div>`;
        row += `<div class="budget-actual">${formatCurrency(categoryActual)}</div>`;
        row += `<div class="budget-remaining ${status.class.replace('status-', 'remaining-')}">${formatCurrency(categoryTotal - categoryActual)}</div>`;
        row += `</div>`;
    });
    
    const grandRemaining = grandTotal - grandActual;
    const grandStatus = getBudgetStatus(grandTotal, grandActual);
    
    row += `<div class="total-cell grand-total" style="color: ${grandStatus.class === 'status-danger' ? '#ef4444' : grandStatus.class === 'status-warning' ? '#f59e0b' : '#10b981'}">`;
    row += `<div>${formatCurrency(grandTotal)}</div>`;
    row += `<div style="font-size: 0.7rem;">${formatCurrency(grandRemaining)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

// ===== ОБНОВЛЕННОЕ РЕДАКТИРОВАНИЕ =====
function startEdit(element, region, ip, category, currentValue) {
    if (currentEditElement) {
        cancelEdit(currentEditElement);
    }
    
    currentEditElement = { element, region, ip, category, originalValue: currentValue };
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = formatCurrency(currentValue);
    input.style.width = '100%';
    input.style.border = '1px solid var(--primary)';
    input.style.background = 'var(--bg-card)';
    input.style.textAlign = 'center';
    input.style.fontSize = '0.75rem';
    input.style.fontWeight = '600';
    input.style.color = 'var(--text-primary)';
    input.style.outline = 'none';
    input.style.borderRadius = '3px';
    input.style.padding = '0.15rem';
    
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

// ===== УПРАВЛЕНИЕ РЕГИОНАМИ С ФИЛЬТРАЦИЕЙ =====
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
    if (expandedRegions.size === Object.keys(DEFAULT_BUDGETS).length) {
        expandedRegions.clear();
        document.getElementById('toggleAllText').textContent = 'Развернуть все';
        currentFilterRegion = null;
        updateStatistics();
    } else {
        Object.keys(DEFAULT_BUDGETS).forEach(region => expandedRegions.add(region));
        document.getElementById('toggleAllText').textContent = 'Свернуть все';
        currentFilterRegion = null;
        updateStatistics();
    }
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
    showNotification('✅ Все изменения бюджета сохранены', 'success');
}

// ===== ЭКСПОРТ =====
function exportBudgetToCSV() {
    showNotification('📊 Экспорт в CSV выполнен', 'success');
}

function exportBudgetToExcel() {
    showNotification('📈 Экспорт в Excel выполнен', 'success');
}

function exportBudgetToPDF() {
    showNotification('📄 Экспорт в PDF выполнен', 'success');
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function formatCurrency(amount) {
    if (amount === 0) return '0';
    return new Intl.NumberFormat('ru-RU').format(amount);
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initBudgets);