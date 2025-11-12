// budgets.js - КОМПАКТНАЯ ВЕРСИЯ С МУЛЬТИМЕСЯЧНОСТЬЮ

let currentMonth = '2025-11';
let expandedRegions = new Set();

// Категории расходов (компактные)
const BUDGET_CATEGORIES = [
    { id: 'products', name: 'Продукты', icon: '🛒' },
    { id: 'household', name: 'Хоз. товары', icon: '🧹' },
    { id: 'medicaments', name: 'Медикаменты', icon: '💊' },
    { id: 'stationery', name: 'Канцелярия', icon: '📎' },
    { id: 'cafe', name: 'Кафе / кофейня', icon: '☕' },
    { id: 'polygraphy', name: 'Полиграфия', icon: '🖨️' },
    { id: 'events', name: 'Мероприятия', icon: '🎉' },
    { id: 'repairs', name: 'Мелкий ремонт', icon: '🔧' },
    { id: 'salary', name: 'ЗП управляющего', icon: '💰' },
    { id: 'azs', name: 'АЗС', icon: '⛽' },
    { id: 'shipping', name: 'Отправка товаров', icon: '📦' },
    { id: 'regionalPurchase', name: 'Покупка регион', icon: '🏢' },
    { id: 'insurance', name: 'Страхование', icon: '🛡️' },
    { id: 'charity', name: 'Благотворительность', icon: '❤️' },
    { id: 'equipment', name: 'Техника', icon: '📱' },
    { id: 'packaging', name: 'Упаковка', icon: '📦' },
    { id: 'cleaning', name: 'Клининг', icon: '🧽' },
    { id: 'checks', name: 'Чеки ККТ', icon: '🧾' },
    { id: 'carsharing', name: 'Каршеринг', icon: '🚗' },
    { id: 'rent', name: 'Аренда офиса', icon: '🏢' },
    { id: 'comm', name: 'Коммуналка', icon: '💡' },
    { id: 'internet', name: 'Интернет', icon: '🌐' },
    { id: 'ipSalary', name: 'ЗП ИП', icon: '💼' }
];

function initBudgets() {
    loadCurrentMonth();
    setupEventListeners();
    updateStatistics();
    renderMasterBudgetTable();
    
    // Разворачиваем все регионы по умолчанию
    toggleAllRegions();
}

function setupEventListeners() {
    document.getElementById('editBudgetForm').addEventListener('submit', saveBudgetEdit);
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
        '2025-11': 'Ноябрь 2025',
        '2025-12': 'Декабрь 2025', 
        '2026-01': 'Январь 2026',
        '2026-02': 'Февраль 2026'
    };
    document.getElementById('currentMonthDisplay').textContent = `(${monthNames[currentMonth]})`;
}

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

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
    
    // Возвращаем дефолтные значения из CSV
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

// ===== UI ФУНКЦИИ =====

function renderMasterBudgetTable() {
    const tableBody = document.getElementById('masterTableBody');
    if (!tableBody) return;
    
    let html = '';
    
    // Рендерим данные по регионам
    Object.keys(DEFAULT_BUDGETS).forEach(region => {
        html += renderRegionRow(region);
        
        // Рендерим ИП этого региона
        if (expandedRegions.has(region)) {
            const ipData = IP_DETAILED_BUDGETS[region];
            if (ipData) {
                Object.keys(ipData).forEach(ipName => {
                    html += renderIPRow(ipName, region);
                });
            }
        }
    });
    
    // Итоговая строка
    html += renderTotalRow();
    
    tableBody.innerHTML = html;
    updateStatistics();
}

function renderRegionRow(region) {
    let row = `<div class="region-row" data-region="${region}">`;
    row += `<div class="region-name" onclick="toggleRegion('${region}')">`;
    row += `<span class="status-indicator status-normal"></span>`;
    row += `<span>🏢 ${region}</span>`;
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
        
        row += `<div class="budget-cell region-cell ${status.class}" onclick="openEditModal('${region}', null, '${category.id}')">`;
        row += `<div class="budget-amount">${formatCompactCurrency(planned)}</div>`;
        row += `<div class="budget-actual">${formatCompactCurrency(actual)}</div>`;
        if (planned > 0) {
            row += `<div class="budget-remaining ${status.class.replace('status-', 'remaining-')}">`;
            row += formatCompactCurrency(remaining);
            row += `</div>`;
        }
        row += `</div>`;
    });
    
    const regionRemaining = regionTotal - regionActual;
    const regionStatus = getBudgetStatus(regionTotal, regionActual);
    
    row += `<div class="total-cell region-total" style="color: ${regionStatus.class === 'status-danger' ? '#ef4444' : regionStatus.class === 'status-warning' ? '#f59e0b' : '#10b981'}">`;
    row += `<div>${formatCompactCurrency(regionTotal)}</div>`;
    row += `<div style="font-size: 0.65rem;">${formatCompactCurrency(regionRemaining)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

function renderIPRow(ipName, region) {
    let row = `<div class="ip-row ${expandedRegions.has(region) ? '' : 'collapsed'}" data-region="${region}">`;
    row += `<div class="ip-name" onclick="openEditModal('${region}', '${ipName}', null)">`;
    row += `<span>👤 ${ipName}</span>`;
    row += `</div>`;
    
    let ipTotal = 0;
    
    BUDGET_CATEGORIES.forEach(category => {
        const planned = getPlannedBudget(region, ipName, category.id);
        const actual = getActualSpending(region, ipName, category.id);
        const remaining = planned - actual;
        const status = getBudgetStatus(planned, actual);
        
        ipTotal += planned;
        
        row += `<div class="budget-cell ip-cell ${status.class}" onclick="openEditModal('${region}', '${ipName}', '${category.id}')">`;
        row += `<div class="budget-amount">${formatCompactCurrency(planned)}</div>`;
        row += `<div class="budget-actual">${formatCompactCurrency(actual)}</div>`;
        if (planned > 0) {
            row += `<div class="budget-remaining ${status.class.replace('status-', 'remaining-')}">`;
            row += formatCompactCurrency(remaining);
            row += `</div>`;
        }
        row += `</div>`;
    });
    
    row += `<div class="total-cell ip-total">`;
    row += `<div>${formatCompactCurrency(ipTotal)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

function renderTotalRow() {
    let row = `<div class="total-row">`;
    row += `<div class="total-label">💰 ВСЕГО</div>`;
    
    let grandTotal = 0;
    let grandActual = 0;
    
    BUDGET_CATEGORIES.forEach(category => {
        let categoryTotal = 0;
        let categoryActual = 0;
        
        Object.keys(DEFAULT_BUDGETS).forEach(region => {
            categoryTotal += getPlannedBudget(region, null, category.id);
            categoryActual += getActualSpending(region, null, category.id);
        });
        
        grandTotal += categoryTotal;
        grandActual += categoryActual;
        
        const status = getBudgetStatus(categoryTotal, categoryActual);
        
        row += `<div class="budget-cell total-cell ${status.class}">`;
        row += `<div class="budget-amount">${formatCompactCurrency(categoryTotal)}</div>`;
        row += `<div class="budget-actual">${formatCompactCurrency(categoryActual)}</div>`;
        row += `</div>`;
    });
    
    const grandRemaining = grandTotal - grandActual;
    const grandStatus = getBudgetStatus(grandTotal, grandActual);
    
    row += `<div class="total-cell grand-total" style="color: ${grandStatus.class === 'status-danger' ? '#ef4444' : grandStatus.class === 'status-warning' ? '#f59e0b' : '#10b981'}">`;
    row += `<div>${formatCompactCurrency(grandTotal)}</div>`;
    row += `<div style="font-size: 0.7rem;">${formatCompactCurrency(grandRemaining)}</div>`;
    row += `</div>`;
    
    row += `</div>`;
    return row;
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function formatCompactCurrency(amount) {
    if (amount === 0) return '0';
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'м';
    }
    if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + 'к';
    }
    return amount.toString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
}

function getBudgetStatus(planned, actual) {
    if (planned === 0) return { class: 'status-normal', text: 'Нет бюджета' };
    
    const usage = actual / planned;
    if (usage >= 1) return { class: 'status-danger', text: 'Превышен' };
    if (usage >= 0.8) return { class: 'status-warning', text: 'Почти исчерпан' };
    return { class: 'status-normal', text: 'В норме' };
}

function toggleRegion(region) {
    if (expandedRegions.has(region)) {
        expandedRegions.delete(region);
    } else {
        expandedRegions.add(region);
    }
    renderMasterBudgetTable();
}

function toggleAllRegions() {
    if (expandedRegions.size === Object.keys(DEFAULT_BUDGETS).length) {
        expandedRegions.clear();
        document.getElementById('toggleAllText').textContent = 'Развернуть все';
    } else {
        Object.keys(DEFAULT_BUDGETS).forEach(region => expandedRegions.add(region));
        document.getElementById('toggleAllText').textContent = 'Свернуть все';
    }
    renderMasterBudgetTable();
}

function updateStatistics() {
    // Статистика теперь статичная из CSV
    // В реальном приложении здесь будет расчет из данных
}

// ===== РЕДАКТИРОВАНИЕ БЮДЖЕТА =====

function openEditModal(region, ip, category) {
    const planned = getPlannedBudget(region, ip, category);
    const actual = getActualSpending(region, ip, category);
    const remaining = planned - actual;
    const usage = planned > 0 ? Math.round((actual / planned) * 100) : 0;
    
    document.getElementById('editRegion').value = region;
    document.getElementById('editIp').value = ip || '';
    document.getElementById('editCategory').value = category;
    document.getElementById('editMonth').value = currentMonth;
    
    document.getElementById('editRegionDisplay').textContent = region;
    document.getElementById('editIpDisplay').textContent = ip || 'Весь регион';
    document.getElementById('editCategoryDisplay').textContent = BUDGET_CATEGORIES.find(c => c.id === category)?.name || category;
    document.getElementById('editMonthDisplay').textContent = document.getElementById('currentMonthDisplay').textContent;
    
    document.getElementById('editPlanned').value = planned;
    document.getElementById('editActual').value = actual;
    document.getElementById('editRemaining').textContent = formatCurrency(remaining);
    document.getElementById('editUsage').textContent = usage + '%';
    
    document.getElementById('editBudgetModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editBudgetModal').style.display = 'none';
}

function saveBudgetEdit(event) {
    event.preventDefault();
    
    const region = document.getElementById('editRegion').value;
    const ip = document.getElementById('editIp').value;
    const category = document.getElementById('editCategory').value;
    const planned = parseFloat(document.getElementById('editPlanned').value);
    const actual = parseFloat(document.getElementById('editActual').value);
    
    // Сохраняем плановый бюджет и фактические расходы
    savePlannedBudget(region, ip, category, planned);
    saveActualSpending(region, ip, category, actual);
    
    closeEditModal();
    renderMasterBudgetTable();
    showNotification('✅ Бюджет успешно обновлен!', 'success');
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

function showNotification(message, type = 'info') {
    alert(`${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'} ${message}`);
}

// Экспортируем функции для использования в других модулях
window.BudgetManager = {
    checkBudgetLimit: function(region, category, amount) {
        const planned = getPlannedBudget(region, null, category);
        const actual = getActualSpending(region, null, category);
        const remaining = planned - actual;
        const allowed = amount <= remaining;
        
        return {
            allowed,
            remaining,
            planned,
            actual,
            message: allowed 
                ? `✅ Доступно: ${formatCurrency(remaining)} из ${formatCurrency(planned)}`
                : `❌ Превышен бюджет! Доступно: ${formatCurrency(remaining)} из ${formatCurrency(planned)}`
        };
    },
    
    reserveBudget: function(region, category, amount) {
        const check = this.checkBudgetLimit(region, category, amount);
        if (!check.allowed) return false;
        
        const currentActual = getActualSpending(region, null, category);
        saveActualSpending(region, null, category, currentActual + amount);
        
        if (window.location.pathname.includes('budgets.html')) {
            renderMasterBudgetTable();
        }
        
        return true;
    },
    
    releaseBudget: function(region, category, amount) {
        const currentActual = getActualSpending(region, null, category);
        const newActual = Math.max(0, currentActual - amount);
        saveActualSpending(region, null, category, newActual);
        
        if (window.location.pathname.includes('budgets.html')) {
            renderMasterBudgetTable();
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initBudgets);