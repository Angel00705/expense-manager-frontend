// ===== CREATE TASK FUNCTIONALITY =====
let currentTemplate = 'none';
let isEditMode = false;
let editTaskId = null;

// Инициализация формы
function initCreateTask() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Проверяем режим редактирования
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        isEditMode = true;
        editTaskId = editId;
        enableEditMode();
    }

    loadFormData();
    setupEventListeners();
    updateUserInterface();
}

// Загрузка данных для формы
function loadFormData() {
    loadIPs();
    loadBankCards();
    loadManagers();
    loadTemplates();
}

// Загрузка списка ИП
function loadIPs() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const ipSelect = document.getElementById('taskIP');
    
    // Демо-данные ИП
    const ips = [
        { id: '1', name: 'ИП Петров А.С.', region: 'Астрахань' },
        { id: '2', name: 'ИП Сидоров В.К.', region: 'Курган' },
        { id: '3', name: 'ИП Иванова М.П.', region: 'Мордовия' },
        { id: '4', name: 'ИП Козлов Д.И.', region: 'Бурятия' },
        { id: '5', name: 'ИП Николаев С.П.', region: 'Калмыкия' },
        { id: '6', name: 'ИП Васнецова О.Л.', region: 'Удмуртия' }
    ];

    // Фильтруем ИП по регионам пользователя
    const userRegions = currentUser.regions;
    const filteredIPs = currentUser.role === 'admin' 
        ? ips 
        : ips.filter(ip => userRegions.includes(ip.region));

    ipSelect.innerHTML = '<option value="">Выберите ИП</option>';
    filteredIPs.forEach(ip => {
        const option = document.createElement('option');
        option.value = ip.id;
        option.textContent = ip.name;
        option.setAttribute('data-region', ip.region);
        ipSelect.appendChild(option);
    });
}

// Загрузка банковских карт
function loadBankCards() {
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    const cardSelect = document.getElementById('bankCard');
    
    cardSelect.innerHTML = '<option value="">Выберите карту</option>';
    cards.forEach(card => {
        if (card.status === 'active') {
            const option = document.createElement('option');
            option.value = card.id;
            option.textContent = `${card.number} (${card.bank}) - ${formatAmount(card.balance)}`;
            cardSelect.appendChild(option);
        }
    });
}

// Загрузка менеджеров
function loadManagers() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const managerSelect = document.getElementById('responsibleManager');
    
    const managers = [
        { id: 'manager1', name: 'Менеджер Иванов', regions: ['Астрахань', 'Бурятия'] },
        { id: 'manager2', name: 'Менеджер Петрова', regions: ['Курган', 'Калмыкия'] },
        { id: 'manager3', name: 'Менеджер Сидоров', regions: ['Мордовия', 'Удмуртия'] }
    ];

    // Фильтруем менеджеров по регионам пользователя
    const userRegions = currentUser.regions;
    const filteredManagers = currentUser.role === 'admin' 
        ? managers 
        : managers.filter(manager => 
            manager.regions.some(region => userRegions.includes(region))
        );

    managerSelect.innerHTML = '<option value="">Выберите менеджера</option>';
    filteredManagers.forEach(manager => {
        const option = document.createElement('option');
        option.value = manager.id;
        option.textContent = manager.name;
        managerSelect.appendChild(option);
    });
}

// Загрузка шаблонов
function loadTemplates() {
    // Шаблоны уже загружены в HTML
    selectTemplate('none');
}

// Выбор шаблона
function selectTemplate(templateId) {
    currentTemplate = templateId;
    
    // Сбрасываем выделение всех шаблонов
    document.querySelectorAll('.template-selector').forEach(template => {
        template.classList.remove('selected');
    });
    
    // Выделяем выбранный шаблон
    const selectedTemplate = document.querySelector(`.template-selector:nth-child(${getTemplateIndex(templateId) + 1})`);
    if (selectedTemplate) {
        selectedTemplate.classList.add('selected');
    }
    
    // Применяем настройки шаблона
    applyTemplateSettings(templateId);
}

// Получение индекса шаблона
function getTemplateIndex(templateId) {
    const templates = ['none', 'tax', 'salary', 'rent'];
    return templates.indexOf(templateId);
}

// Применение настроек шаблона
function applyTemplateSettings(templateId) {
    const settings = {
        'none': {
            title: '',
            description: '',
            amount: '',
            expenseItem: ''
        },
        'tax': {
            title: 'Уплата налогов',
            description: 'Ежемесячный налоговый платеж по УСН',
            amount: '5000',
            expenseItem: 'Налоги и сборы'
        },
        'salary': {
            title: 'Выплата зарплат',
            description: 'Ежемесячная выплата заработной платы сотрудникам',
            amount: '50000',
            expenseItem: 'Зарплаты'
        },
        'rent': {
            title: 'Арендный платеж',
            description: 'Оплата аренды офисного помещения',
            amount: '15000',
            expenseItem: 'Аренда помещений'
        }
    };
    
    const template = settings[templateId];
    if (template) {
        document.getElementById('taskTitle').value = template.title;
        document.getElementById('taskDescription').value = template.description;
        document.getElementById('taskAmount').value = template.amount;
        document.getElementById('expenseItem').value = template.expenseItem;
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    const form = document.getElementById('taskForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Автоматическое обновление ИП при выборе региона
    document.getElementById('taskRegion').addEventListener('change', updateIPsByRegion);
    
    // Валидация в реальном времени
    setupRealTimeValidation();
}

// Обновление ИП по выбранному региону
function updateIPsByRegion() {
    const region = document.getElementById('taskRegion').value;
    const ipSelect = document.getElementById('taskIP');
    const options = ipSelect.querySelectorAll('option');
    
    options.forEach(option => {
        if (option.value === '') return;
        const ipRegion = option.getAttribute('data-region');
        option.style.display = ipRegion === region ? '' : 'none';
    });
    
    // Сбрасываем выбор ИП если он не подходит для региона
    const selectedOption = ipSelect.options[ipSelect.selectedIndex];
    if (selectedOption && selectedOption.style.display === 'none') {
        ipSelect.value = '';
    }
}

// Валидация в реальном времени
function setupRealTimeValidation() {
    const fields = ['taskTitle', 'taskAmount', 'taskRegion', 'taskIP', 'bankCard', 'responsibleManager', 'expenseItem'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('blur', () => validateField(fieldId));
        field.addEventListener('input', () => clearError(fieldId));
    });
}

// Валидация поля
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const value = field.value.trim();
    const errorElement = document.getElementById(fieldId + 'Error');
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldId) {
        case 'taskTitle':
            if (!value) {
                isValid = false;
                errorMessage = '⚠️ Введите название задачи';
            } else if (value.length < 3) {
                isValid = false;
                errorMessage = '⚠️ Название должно быть не менее 3 символов';
            }
            break;
            
        case 'taskAmount':
            if (!value) {
                isValid = false;
                errorMessage = '⚠️ Введите сумму';
            } else if (parseFloat(value) <= 0) {
                isValid = false;
                errorMessage = '⚠️ Сумма должна быть больше 0';
            }
            break;
            
        case 'taskRegion':
        case 'taskIP':
        case 'bankCard':
        case 'responsibleManager':
        case 'expenseItem':
            if (!value) {
                isValid = false;
                errorMessage = '⚠️ Выберите значение';
            }
            break;
    }
    
    if (!isValid) {
        field.classList.add('error');
        errorElement.textContent = errorMessage;
    } else {
        field.classList.remove('error');
        errorElement.textContent = '';
    }
    
    return isValid;
}

// Очистка ошибки
function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    field.classList.remove('error');
    errorElement.textContent = '';
}

// Валидация всей формы
function validateForm() {
    const fields = ['taskTitle', 'taskAmount', 'taskRegion', 'taskIP', 'bankCard', 'responsibleManager', 'expenseItem'];
    let isValid = true;
    
    fields.forEach(fieldId => {
        if (!validateField(fieldId)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Обработчик отправки формы
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showNotification('❌ Исправьте ошибки в форме', 'error');
        return;
    }
    
    const taskData = collectFormData();
    
    if (isEditMode) {
        updateTask(taskData);
    } else {
        createTask(taskData);
    }
}

// Сбор данных формы
function collectFormData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    return {
        id: isEditMode ? editTaskId : generateTaskId(),
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        amount: parseFloat(document.getElementById('taskAmount').value),
        expenseItem: document.getElementById('expenseItem').value,
        region: document.getElementById('taskRegion').value,
        ip: document.getElementById('taskIP').value,
        bankCard: document.getElementById('bankCard').value,
        responsible: document.getElementById('responsibleManager').value,
        dueDate: document.getElementById('dueDate').value || null,
        priority: document.getElementById('taskPriority').value,
        tags: document.getElementById('taskTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'pending',
        createdAt: isEditMode ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.username,
        template: currentTemplate
    };
}

// Генерация ID задачи
function generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Создание задачи
function createTask(taskData) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(taskData);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    showSuccessMessage();
    showNotification('✅ Задача успешно создана!', 'success');
}

// Обновление задачи
function updateTask(taskData) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.id === editTaskId);
    
    if (taskIndex !== -1) {
        // Сохраняем оригинальную дату создания
        taskData.createdAt = tasks[taskIndex].createdAt;
        tasks[taskIndex] = taskData;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        showSuccessMessage();
        showNotification('✅ Задача успешно обновлена!', 'success');
    }
}

// Включение режима редактирования
function enableEditMode() {
    document.getElementById('pageTitle').textContent = 'Редактировать задачу';
    document.getElementById('pageSubtitle').textContent = 'Обновите информацию о задаче';
    
    // Загружаем данные задачи для редактирования
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === editTaskId);
    
    if (task) {
        document.getElementById('taskTitle').value = task.title || '';
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskAmount').value = task.amount || '';
        document.getElementById('expenseItem').value = task.expenseItem || '';
        document.getElementById('taskRegion').value = task.region || '';
        document.getElementById('taskIP').value = task.ip || '';
        document.getElementById('bankCard').value = task.bankCard || '';
        document.getElementById('responsibleManager').value = task.responsible || '';
        document.getElementById('dueDate').value = task.dueDate || '';
        document.getElementById('taskPriority').value = task.priority || 'medium';
        document.getElementById('taskTags').value = (task.tags || []).join(', ');
        
        if (task.template) {
            selectTemplate(task.template);
        }
    }
}

// Показать сообщение об успехе
function showSuccessMessage() {
    document.getElementById('taskForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
}

// Обновление интерфейса пользователя
function updateUserInterface() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.role !== 'admin') {
        // Ограничения для менеджеров
        const regionSelect = document.getElementById('taskRegion');
        const options = Array.from(regionSelect.options);
        
        options.forEach(option => {
            if (option.value && !currentUser.regions.includes(option.value)) {
                option.style.display = 'none';
            }
        });
    }
}

// Вспомогательные функции
function formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'info') {
    alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
}

function goBack() {
    window.history.back();
}

function goToTasks() {
    window.location.href = 'tasks.html';
}

function createAnother() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('taskForm').style.display = 'block';
    document.getElementById('taskForm').reset();
    selectTemplate('none');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initCreateTask);