// ===== HISTORY FUNCTIONALITY =====
let allHistory = [];
let filteredHistory = [];
let currentPage = 1;
const itemsPerPage = 10;

// Инициализация истории
function initHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    loadHistoryData();
    setupEventListeners();
    updateStatistics();
}

// Загрузка данных истории
function loadHistoryData() {
    // Загружаем историю из localStorage или создаем демо-данные
    allHistory = JSON.parse(localStorage.getItem('history')) || generateDemoHistory();
    
    // Сохраняем демо-данные если их нет
    if (allHistory.length === 0) {
        allHistory = generateDemoHistory();
        saveHistory();
    }
    
    filteredHistory = [...allHistory];
    renderHistory();
}

// Генерация демо-истории
function generateDemoHistory() {
    const actions = [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = ['admin', 'manager1', 'manager2', 'manager3'];
    const actionTypes = ['created', 'updated', 'deleted', 'completed'];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Создаем историю на основе существующих задач
    tasks.forEach(task => {
        // Создание задачи
        actions.push({
            id: `action_${task.id}_created`,
            type: 'created',
            entity: 'task',
            entityId: task.id,
            entityName: task.title,
            description: `Создана новая задача "${task.title}"`,
            details: {
                amount: task.amount,
                region: task.region,
                ip: task.ip,
                expenseItem: task.expenseItem
            },
            user: task.createdBy || 'admin',
            timestamp: task.createdAt || new Date().toISOString(),
            changes: []
        });
        
        // Обновления задачи (случайные)
        if (Math.random() > 0.5) {
            actions.push({
                id: `action_${task.id}_updated`,
                type: 'updated',
                entity: 'task',
                entityId: task.id,
                entityName: task.title,
                description: `Обновлена задача "${task.title}"`,
                details: {
                    amount: task.amount,
                    region: task.region
                },
                user: users[Math.floor(Math.random() * users.length)],
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                changes: [
                    { field: 'status', oldValue: 'pending', newValue: 'completed', type: 'modified' },
                    { field: 'amount', oldValue: task.amount * 0.8, newValue: task.amount, type: 'modified' }
                ]
            });
        }
        
        // Завершение задачи
        if (task.status === 'completed') {
            actions.push({
                id: `action_${task.id}_completed`,
                type: 'completed',
                entity: 'task',
                entityId: task.id,
                entityName: task.title,
                description: `Задача "${task.title}" завершена`,
                details: {
                    amount: task.amount,
                    region: task.region
                },
                user: task.responsible || 'admin',
                timestamp: task.updatedAt || new Date().toISOString(),
                changes: []
            });
        }
    });
    
    // Добавляем действия с картами
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    cards.forEach(card => {
        actions.push({
            id: `action_card_${card.id}_created`,
            type: 'created',
            entity: 'card',
            entityId: card.id,
            entityName: `Карта ${card.number}`,
            description: `Добавлена новая карта ${card.number}`,
            details: {
                bank: card.bank,
                balance: card.balance,
                regions: card.regions.join(', ')
            },
            user: 'admin',
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            changes: []
        });
    });
    
    return actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Сохранение истории
function saveHistory() {
    localStorage.setItem('history', JSON.stringify(allHistory));
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Авто-обновление истории при изменениях
    document.addEventListener('taskCreated', (e) => {
        addHistoryItem({
            type: 'created',
            entity: 'task',
            entityId: e.detail.id,
            entityName: e.detail.title,
            description: `Создана новая задача "${e.detail.title}"`,
            details: {
                amount: e.detail.amount,
                region: e.detail.region,
                ip: e.detail.ip
            },
            user: e.detail.createdBy,
            timestamp: new Date().toISOString(),
            changes: []
        });
    });
    
    document.addEventListener('taskUpdated', (e) => {
        addHistoryItem({
            type: 'updated',
            entity: 'task',
            entityId: e.detail.id,
            entityName: e.detail.title,
            description: `Обновлена задача "${e.detail.title}"`,
            details: {
                amount: e.detail.amount,
                region: e.detail.region
            },
            user: e.detail.updatedBy,
            timestamp: new Date().toISOString(),
            changes: e.detail.changes || []
        });
    });
    
    document.addEventListener('taskDeleted', (e) => {
        addHistoryItem({
            type: 'deleted',
            entity: 'task',
            entityId: e.detail.id,
            entityName: e.detail.title,
            description: `Удалена задача "${e.detail.title}"`,
            details: {
                amount: e.detail.amount,
                region: e.detail.region
            },
            user: e.detail.deletedBy,
            timestamp: new Date().toISOString(),
            changes: []
        });
    });
}

// Добавление элемента истории
function addHistoryItem(historyItem) {
    historyItem.id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    allHistory.unshift(historyItem);
    filteredHistory.unshift(historyItem);
    saveHistory();
    updateStatistics();
    renderHistory();
}

// Рендеринг истории
function renderHistory() {
    const timeline = document.getElementById('historyTimeline');
    const emptyState = document.getElementById('emptyState');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (filteredHistory.length === 0) {
        timeline.innerHTML = '';
        emptyState.style.display = 'block';
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Показываем только текущую страницу
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const itemsToShow = filteredHistory.slice(startIndex, endIndex);
    
    timeline.innerHTML = itemsToShow.map(item => `
        <div class="timeline-item">
            <div class="timeline-header">
                <h3 class="timeline-title">${item.description}</h3>
                <div class="timeline-meta">
                    <div class="timeline-date">
                        <span class="nav-icon">📅</span>
                        ${formatDate(item.timestamp)}
                    </div>
                    <div class="timeline-type type-${item.type}">
                        ${getActionTypeText(item.type)}
                    </div>
                </div>
            </div>
            
            <div class="timeline-content">
                ${getEntityDescription(item)}
            </div>
            
            ${item.details && Object.keys(item.details).length > 0 ? `
                <div class="timeline-details">
                    ${Object.entries(item.details).map(([key, value]) => `
                        <div class="detail-item">
                            <div class="detail-label">${getDetailLabel(key)}</div>
                            <div class="detail-value">${formatDetailValue(key, value)}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${item.changes && item.changes.length > 0 ? `
                <div class="timeline-changes">
                    <div class="changes-title">Изменения:</div>
                    <div class="changes-list">
                        ${item.changes.map(change => `
                            <div class="change-item">
                                <span class="change-badge badge-${getChangeType(change.type)}">
                                    ${getChangeTypeText(change.type)}
                                </span>
                                <strong>${getFieldLabel(change.field)}:</strong>
                                ${change.oldValue ? `<s>${formatChangeValue(change.field, change.oldValue)}</s> → ` : ''}
                                ${formatChangeValue(change.field, change.newValue)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="timeline-user">
                <div class="user-avatar">
                    ${getUserInitials(item.user)}
                </div>
                <span>${getUserName(item.user)}</span>
            </div>
        </div>
    `).join('');
    
    // Показываем кнопку "Загрузить еще" если есть еще элементы
    if (endIndex < filteredHistory.length) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Фильтрация истории
function filterHistory() {
    const actionType = document.getElementById('actionType').value;
    const dateRange = document.getElementById('dateRange').value;
    const userFilter = document.getElementById('userFilter').value;
    const searchText = document.getElementById('searchHistory').value.toLowerCase();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    filteredHistory = allHistory.filter(item => {
        // Фильтр по типу действия
        if (actionType && item.type !== actionType) return false;
        
        // Фильтр по дате
        if (dateRange && !filterByDate(item.timestamp, dateRange)) return false;
        
        // Фильтр по пользователю
        if (userFilter === 'current' && item.user !== currentUser.username) return false;
        
        // Поиск по тексту
        if (searchText && !item.description.toLowerCase().includes(searchText)) {
            return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    renderHistory();
    updateStatistics();
}

// Фильтр по дате
function filterByDate(timestamp, range) {
    const date = new Date(timestamp);
    const now = new Date();
    
    switch (range) {
        case 'today':
            return date.toDateString() === now.toDateString();
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
        case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return date >= monthAgo;
        default:
            return true;
    }
}

// Загрузка дополнительной истории
function loadMoreHistory() {
    currentPage++;
    renderHistory();
}

// Обновление статистики
function updateStatistics() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const today = new Date().toDateString();
    
    const totalActions = allHistory.length;
    const todayActions = allHistory.filter(item => 
        new Date(item.timestamp).toDateString() === today
    ).length;
    const userActions = allHistory.filter(item => 
        item.user === currentUser.username
    ).length;
    const taskChanges = allHistory.filter(item => 
        item.entity === 'task'
    ).length;
    
    document.getElementById('totalActions').textContent = totalActions;
    document.getElementById('todayActions').textContent = todayActions;
    document.getElementById('userActions').textContent = userActions;
    document.getElementById('taskChanges').textContent = taskChanges;
}

// Экспорт истории
function exportHistory() {
    const csvContent = generateHistoryCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `history_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Генерация CSV для экспорта
function generateHistoryCSV() {
    let csv = 'История изменений - IP Expense Manager\n';
    csv += `Экспортировано: ${new Date().toLocaleString('ru-RU')}\n\n`;
    
    csv += 'Дата;Тип;Действие;Объект;Пользователь;Детали\n';
    
    filteredHistory.forEach(item => {
        const date = formatDate(item.timestamp);
        const type = getActionTypeText(item.type);
        const action = item.description;
        const entity = getEntityTypeText(item.entity);
        const user = getUserName(item.user);
        const details = Object.entries(item.details || {})
            .map(([key, value]) => `${getDetailLabel(key)}: ${value}`)
            .join(', ');
        
        csv += `"${date}";"${type}";"${action}";"${entity}";"${user}";"${details}"\n`;
    });
    
    return csv;
}

// Сброс фильтров
function clearFilters() {
    document.getElementById('actionType').value = '';
    document.getElementById('dateRange').value = 'all';
    document.getElementById('userFilter').value = '';
    document.getElementById('searchHistory').value = '';
    
    filteredHistory = [...allHistory];
    currentPage = 1;
    renderHistory();
    updateStatistics();
}

// Вспомогательные функции
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getActionTypeText(type) {
    const types = {
        'created': 'Создание',
        'updated': 'Изменение',
        'deleted': 'Удаление',
        'completed': 'Завершение'
    };
    return types[type] || type;
}

function getEntityTypeText(entity) {
    const entities = {
        'task': 'Задача',
        'card': 'Карта',
        'template': 'Шаблон'
    };
    return entities[entity] || entity;
}

function getEntityDescription(item) {
    const entities = {
        'task': `Задача: ${item.entityName}`,
        'card': `Банковская карта: ${item.entityName}`,
        'template': `Шаблон: ${item.entityName}`
    };
    return entities[item.entity] || item.entityName;
}

function getDetailLabel(key) {
    const labels = {
        'amount': 'Сумма',
        'region': 'Регион',
        'ip': 'ИП',
        'expenseItem': 'Статья расходов',
        'bank': 'Банк',
        'balance': 'Баланс',
        'regions': 'Регионы'
    };
    return labels[key] || key;
}

function formatDetailValue(key, value) {
    if (key === 'amount') {
        return formatAmount(value);
    }
    return value;
}

function formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function getChangeType(type) {
    const types = {
        'added': 'added',
        'modified': 'modified',
        'removed': 'removed'
    };
    return types[type] || 'modified';
}

function getChangeTypeText(type) {
    const types = {
        'added': '+',
        'modified': '~',
        'removed': '-'
    };
    return types[type] || '~';
}

function getFieldLabel(field) {
    const labels = {
        'status': 'Статус',
        'amount': 'Сумма',
        'title': 'Название',
        'description': 'Описание',
        'region': 'Регион',
        'ip': 'ИП',
        'responsible': 'Ответственный'
    };
    return labels[field] || field;
}

function formatChangeValue(field, value) {
    if (field === 'amount') {
        return formatAmount(value);
    }
    if (field === 'status') {
        const statuses = {
            'pending': 'В работе',
            'completed': 'Завершено',
            'cancelled': 'Отменено'
        };
        return statuses[value] || value;
    }
    return value;
}

function getUserInitials(username) {
    const users = {
        'admin': 'A',
        'manager1': 'И',
        'manager2': 'П',
        'manager3': 'С'
    };
    return users[username] || username.charAt(0).toUpperCase();
}

function getUserName(username) {
    const users = {
        'admin': 'Администратор',
        'manager1': 'Менеджер Иванов',
        'manager2': 'Менеджер Петрова',
        'manager3': 'Менеджер Сидоров'
    };
    return users[username] || username;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initHistory);