// ===== EXPENSE ITEMS FUNCTIONALITY =====
let allCategories = [];
let expenseItems = [];

// Инициализация страницы
function initExpenseItems() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    loadCategories();
    loadExpenseData();
    setupEventListeners();
    updateStatistics();
}

// Загрузка категорий
function loadCategories() {
    // Загружаем категории из localStorage или создаем демо-данные
    allCategories = JSON.parse(localStorage.getItem('expenseCategories')) || getDefaultCategories();
    
    // Сохраняем категории если их нет
    if (allCategories.length === 0) {
        allCategories = getDefaultCategories();
        saveCategories();
    }
    
    renderCategories();
}

// Получение категорий по умолчанию
function getDefaultCategories() {
    return [
        {
            id: '1',
            name: 'Налоги и сборы',
            icon: '📊',
            description: 'Уплата налогов, сборов и пошлин',
            budget: 50000,
            spent: 45000,
            status: 'active',
            tags: ['налог', 'обязательный', 'ежемесячно'],
            tasksCount: 12,
            color: '#8b5cf6'
        },
        {
            id: '2',
            name: 'Зарплаты',
            icon: '👥',
            description: 'Выплата заработной платы сотрудникам',
            budget: 150000,
            spent: 145000,
            status: 'active',
            tags: ['персонал', 'зарплата', 'ежемесячно'],
            tasksCount: 8,
            color: '#3b82f6'
        },
        {
            id: '3',
            name: 'Аренда помещений',
            icon: '🏢',
            description: 'Аренда офисных и производственных помещений',
            budget: 75000,
            spent: 75000,
            status: 'active',
            tags: ['аренда', 'офис', 'ежемесячно'],
            tasksCount: 6,
            color: '#10b981'
        },
        {
            id: '4',
            name: 'Коммунальные услуги',
            icon: '⚡',
            description: 'Электричество, вода, отопление, интернет',
            budget: 25000,
            spent: 22000,
            status: 'active',
            tags: ['коммуналка', 'услуги', 'ежемесячно'],
            tasksCount: 10,
            color: '#f59e0b'
        },
        {
            id: '5',
            name: 'Маркетинг и реклама',
            icon: '🎯',
            description: 'Рекламные кампании и маркетинговые активности',
            budget: 30000,
            spent: 18500,
            status: 'active',
            tags: ['маркетинг', 'реклама', 'продвижение'],
            tasksCount: 15,
            color: '#ec4899'
        },
        {
            id: '6',
            name: 'Транспортные расходы',
            icon: '🚗',
            description: 'Топливо, обслуживание транспорта, такси',
            budget: 15000,
            spent: 12000,
            status: 'active',
            tags: ['транспорт', 'логистика', 'топливо'],
            tasksCount: 9,
            color: '#6366f1'
        },
        {
            id: '7',
            name: 'Канцелярия и офис',
            icon: '🛒',
            description: 'Канцелярские товары и офисные принадлежности',
            budget: 8000,
            spent: 6500,
            status: 'active',
            tags: ['офис', 'канцелярия', 'расходники'],
            tasksCount: 7,
            color: '#14b8a6'
        },
        {
            id: '8',
            name: 'Командировочные',
            icon: '✈️',
            description: 'Расходы на командировки сотрудников',
            budget: 20000,
            spent: 8500,
            status: 'active',
            tags: ['командировки', 'проезд', 'проживание'],
            tasksCount: 5,
            color: '#f97316'
        }
    ];
}

// Загрузка данных о расходах
function loadExpenseData() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    expenseItems = tasks;
}

// Сохранение категорий
function saveCategories() {
    localStorage.setItem('expenseCategories', JSON.stringify(allCategories));
}

// Настройка обработчиков событий
function setupEventListeners() {
    const form = document.getElementById('categoryForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Закрытие модального окна при клике вне его
    document.getElementById('categoryModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCategoryModal();
        }
    });
}

// Рендеринг категорий
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    const emptyState = document.getElementById('emptyState');
    
    const activeCategories = allCategories.filter(cat => cat.status === 'active');
    
    if (activeCategories.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = activeCategories.map(category => `
        <div class="category-card">
            <div class="category-header">
                <div>
                    <div class="category-icon">${category.icon}</div>
                    <h3 class="category-name">${category.name}</h3>
                </div>
                <div class="category-actions">
                    <button class="btn-icon edit" onclick="editCategory('${category.id}')" title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn-icon delete" onclick="deleteCategory('${category.id}')" title="Удалить">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="category-description">
                ${category.description}
            </div>
            
            <div class="category-stats">
                <div class="category-stat">
                    <div class="stat-number">${category.tasksCount}</div>
                    <div class="stat-label-small">задач</div>
                </div>
                <div class="category-stat">
                    <div class="stat-number">${formatAmount(category.spent)}</div>
                    <div class="stat-label-small">потрачено</div>
                </div>
            </div>
            
            ${category.budget > 0 ? `
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min((category.spent / category.budget) * 100, 100)}%"></div>
                    </div>
                    <div class="progress-text">
                        ${formatAmount(category.spent)} / ${formatAmount(category.budget)}
                    </div>
                </div>
            ` : ''}
            
            <div class="category-tags">
                ${category.tags.map(tag => `
                    <span class="category-tag">${tag}</span>
                `).join('')}
            </div>
            
            <div class="category-footer">
                <div class="category-usage">
                    Используется в ${category.tasksCount} задачах
                </div>
                <div class="category-status">
                    <span style="color: ${getStatusColor(category.status)}">●</span>
                    ${getStatusText(category.status)}
                </div>
            </div>
        </div>
    `).join('');
}

// Обновление статистики
function updateStatistics() {
    const totalCategories = allCategories.length;
    const activeCategories = allCategories.filter(cat => cat.status === 'active').length;
    
    const totalExpenses = allCategories.reduce((sum, cat) => sum + cat.spent, 0);
    const avgPerCategory = activeCategories > 0 ? totalExpenses / activeCategories : 0;
    
    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('activeCategories').textContent = activeCategories;
    document.getElementById('totalExpenses').textContent = formatAmount(totalExpenses);
    document.getElementById('avgPerCategory').textContent = formatAmount(avgPerCategory);
}

// Открытие модального окна добавления
function openAddCategoryModal() {
    document.getElementById('modalTitle').textContent = 'Добавить статью расходов';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryModal').classList.add('show');
}

// Закрытие модального окна
function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('show');
}

// Редактирование категории
function editCategory(categoryId) {
    const category = allCategories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    document.getElementById('modalTitle').textContent = 'Редактировать статью расходов';
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryDescription').value = category.description || '';
    document.getElementById('categoryBudget').value = category.budget || '';
    document.getElementById('categoryTags').value = category.tags.join(', ');
    document.getElementById('categoryStatus').value = category.status;
    
    document.getElementById('categoryModal').classList.add('show');
}

// Удаление категории
function deleteCategory(categoryId) {
    if (confirm('Удалить эту статью расходов?')) {
        allCategories = allCategories.filter(cat => cat.id !== categoryId);
        saveCategories();
        renderCategories();
        updateStatistics();
    }
}

// Обработчик отправки формы
function handleFormSubmit(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const categoryData = {
        name: document.getElementById('categoryName').value.trim(),
        icon: document.getElementById('categoryIcon').value,
        description: document.getElementById('categoryDescription').value.trim(),
        budget: parseFloat(document.getElementById('categoryBudget').value) || 0,
        tags: document.getElementById('categoryTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: document.getElementById('categoryStatus').value
    };
    
    if (categoryId) {
        // Редактирование существующей категории
        const index = allCategories.findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
            // Сохраняем неизменяемые поля
            categoryData.id = categoryId;
            categoryData.spent = allCategories[index].spent;
            categoryData.tasksCount = allCategories[index].tasksCount;
            categoryData.color = allCategories[index].color;
            
            allCategories[index] = categoryData;
        }
    } else {
        // Добавление новой категории
        categoryData.id = Date.now().toString();
        categoryData.spent = 0;
        categoryData.tasksCount = 0;
        categoryData.color = getRandomColor();
        
        allCategories.push(categoryData);
    }
    
    saveCategories();
    renderCategories();
    updateStatistics();
    closeCategoryModal();
    
    showNotification(categoryId ? '✅ Статья расходов обновлена!' : '✅ Новая статья расходов добавлена!');
}

// Вспомогательные функции
function formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function getStatusText(status) {
    const statuses = {
        'active': 'Активна',
        'inactive': 'Неактивна',
        'archived': 'В архиве'
    };
    return statuses[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'active': '#10b981',
        'inactive': '#64748b',
        'archived': '#f59e0b'
    };
    return colors[status] || '#64748b';
}

function getRandomColor() {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showNotification(message) {
    alert(message);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initExpenseItems);