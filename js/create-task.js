// js/create-task.js - Simple version
console.log('📝 create-task.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Create Task page loaded');
    
    // Проверка авторизации
    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = Auth.getCurrentUser();
    console.log('👤 Current user:', user);
    
    // Простые обработчики
    setupEventListeners();
    loadInitialData();
});

function setupEventListeners() {
    console.log('🎯 Setting up event listeners');
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            Auth.logout();
        });
    }
    
    // Кнопка отмены
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    // Форма
    const form = document.getElementById('taskForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit();
        });
    }
    
    // Регион
    const regionSelect = document.getElementById('region');
    if (regionSelect) {
        regionSelect.addEventListener('change', function() {
            console.log('📍 Region selected:', this.value);
            loadRegionData(this.value);
        });
    }
}

async function loadInitialData() {
    console.log('📥 Loading initial data');
    
    try {
        // Загрузка регионов
        const regionsData = await API.getRegions();
        console.log('🏙️ Regions:', regionsData);
        
        if (regionsData.regions) {
            populateRegions(regionsData.regions);
        }
        
        // Загрузка статей расходов
        const itemsData = await API.getExpenseItems();
        console.log('💰 Expense items:', itemsData);
        
        if (itemsData.expenseItems) {
            populateExpenseItems(itemsData.expenseItems);
        }
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Ошибка загрузки данных: ' + error.message);
    }
}

function populateRegions(regions) {
    const select = document.getElementById('region');
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите регион</option>';
    
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        select.appendChild(option);
    });
}

function populateExpenseItems(items) {
    const select = document.getElementById('expenseItem');
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите статью расхода</option>';
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item._id;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

async function loadRegionData(region) {
    if (!region) return;
    
    console.log('🔄 Loading data for region:', region);
    
    try {
        // Показать загрузку
        const ipSelect = document.getElementById('ip');
        const managerSelect = document.getElementById('manager');
        
        if (ipSelect) {
            ipSelect.innerHTML = '<option value="">Загрузка...</option>';
            ipSelect.disabled = true;
        }
        
        if (managerSelect) {
            managerSelect.innerHTML = '<option value="">Загрузка...</option>';
            managerSelect.disabled = true;
        }
        
        // Загрузить данные региона
        const [managersData, ipsData] = await Promise.all([
            API.getManagersByRegion(region),
            API.getIPsWithCardsByRegion(region)
        ]);
        
        console.log('👨‍💼 Managers:', managersData);
        console.log('🏢 IPs:', ipsData);
        
        // Заполнить управляющих
        if (managerSelect && managersData.managers) {
            managerSelect.innerHTML = '<option value="">Выберите управляющего</option>';
            managersData.managers.forEach(manager => {
                const option = document.createElement('option');
                option.value = manager._id;
                option.textContent = manager.name;
                managerSelect.appendChild(option);
            });
            managerSelect.disabled = false;
        }
        
        // Заполнить ИП
        if (ipSelect && ipsData.ips) {
            ipSelect.innerHTML = '<option value="">Выберите ИП</option>';
            ipsData.ips.forEach(ip => {
                const option = document.createElement('option');
                option.value = ip._id;
                option.textContent = ip.name;
                option.dataset.cards = JSON.stringify(ip.cards || []);
                ipSelect.appendChild(option);
            });
            ipSelect.disabled = false;
            
            // Обработчик изменения ИП
            ipSelect.addEventListener('change', function() {
                loadCardsForIP(this.value);
            });
        }
        
    } catch (error) {
        console.error('❌ Error loading region data:', error);
        alert('Ошибка загрузки данных региона: ' + error.message);
    }
}

function loadCardsForIP(ipId) {
    const cardSelect = document.getElementById('card');
    if (!cardSelect) return;
    
    cardSelect.innerHTML = '<option value="">Выберите карту</option>';
    cardSelect.disabled = true;
    
    if (!ipId) return;
    
    const ipSelect = document.getElementById('ip');
    const selectedOption = ipSelect.options[ipSelect.selectedIndex];
    const cards = JSON.parse(selectedOption.dataset.cards || '[]');
    
    cards.forEach(card => {
        const option = document.createElement('option');
        option.value = card._id;
        option.textContent = `${card.cardNumber} - ${card.balance} руб.`;
        cardSelect.appendChild(option);
    });
    
    cardSelect.disabled = cards.length === 0;
}

async function handleFormSubmit() {
    console.log('📤 Form submitted');
    
    const formData = {
        region: document.getElementById('region')?.value,
        ip: document.getElementById('ip')?.value,
        card: document.getElementById('card')?.value,
        expenseItem: document.getElementById('expenseItem')?.value,
        manager: document.getElementById('manager')?.value,
        plannedAmount: document.getElementById('plannedAmount')?.value,
        plannedDate: document.getElementById('plannedDate')?.value,
        description: document.getElementById('description')?.value
    };
    
    console.log('📋 Form data:', formData);
    
    // Простая валидация
    if (!formData.region || !formData.ip || !formData.card || !formData.expenseItem || 
        !formData.manager || !formData.plannedAmount || !formData.plannedDate || !formData.description) {
        alert('❌ Заполните все обязательные поля!');
        return;
    }
    
    try {
        // Показать загрузку
        const submitBtn = document.getElementById('createTaskBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Создание...';
        }
        
        const taskData = {
            ...formData,
            plannedAmount: parseFloat(formData.plannedAmount),
            status: 'pending',
            createdBy: Auth.getCurrentUser()._id
        };
        
        console.log('📤 Creating task:', taskData);
        
        const result = await API.createTask(taskData);
        console.log('✅ Task created:', result);
        
        alert('✅ Задача успешно создана!');
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('❌ Error creating task:', error);
        alert('Ошибка создания задачи: ' + error.message);
        
        // Восстановить кнопку
        const submitBtn = document.getElementById('createTaskBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Создать задачу';
        }
    }
}
