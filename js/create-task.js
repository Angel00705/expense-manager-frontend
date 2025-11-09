// create-task.js - логика страницы создания задач
let currentIPs = [];
let currentExpenseItems = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Create Task page initialized');
    loadInitialData();
});

function goBack() {
    window.location.href = 'dashboard.html';
}

async function loadInitialData() {
    try {
        console.log('📥 Loading initial data...');
        
        // Загружаем регионы
        const regionsData = await API.getRegions();
        const regionSelect = document.getElementById('regionSelect');
        
        regionSelect.innerHTML = '<option value="">-- Выберите регион --</option>';
        regionsData.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });

        // Загружаем статьи расходов
        const expenseItemsData = await API.getExpenseItems();
        currentExpenseItems = expenseItemsData;
        const expenseSelect = document.getElementById('expenseItemSelect');
        
        expenseSelect.innerHTML = '<option value="">-- Выберите статью расхода --</option>';
        expenseItemsData.forEach(item => {
            const option = document.createElement('option');
            option.value = item._id;
            option.textContent = `${item.name} (${item.category})`;
            expenseSelect.appendChild(option);
        });

        console.log('✅ Initial data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading initial data:', error);
        showError('regionError', 'Ошибка загрузки данных: ' + error.message);
    }
}

async function onRegionChange() {
    const regionSelect = document.getElementById('regionSelect');
    const ipSelect = document.getElementById('ipSelect');
    const cardSelect = document.getElementById('cardSelect');
    const region = regionSelect.value;

    clearErrors();
    ipSelect.disabled = true;
    cardSelect.disabled = true;
    
    ipSelect.innerHTML = '<option value="">-- Загрузка ИП... --</option>';
    cardSelect.innerHTML = '<option value="">-- Сначала выберите ИП --</option>';

    if (!region) {
        ipSelect.innerHTML = '<option value="">-- Сначала выберите регион --</option>';
        return;
    }

    try {
        console.log(`🌍 Loading IPs for region: ${region}`);
        const ipsData = await API.getIPsWithCardsByRegion(region);
        currentIPs = ipsData;

        ipSelect.innerHTML = '<option value="">-- Выберите ИП --</option>';
        ipsData.forEach(ip => {
            const option = document.createElement('option');
            option.value = ip._id;
            option.textContent = `${ip.name} (ИНН: ${ip.inn})`;
            ipSelect.appendChild(option);
        });

        ipSelect.disabled = false;
        console.log(`✅ Loaded ${ipsData.length} IPs`);

    } catch (error) {
        console.error('❌ Error loading IPs:', error);
        ipSelect.innerHTML = '<option value="">-- Ошибка загрузки --</option>';
        showError('regionError', 'Ошибка загрузки ИП: ' + error.message);
    }
}

function onIPChange() {
    const ipSelect = document.getElementById('ipSelect');
    const cardSelect = document.getElementById('cardSelect');
    const ipId = ipSelect.value;

    clearErrors();
    cardSelect.disabled = true;
    cardSelect.innerHTML = '<option value="">-- Выберите карту --</option>';

    if (!ipId) {
        cardSelect.innerHTML = '<option value="">-- Сначала выберите ИП --</option>';
        return;
    }

    const selectedIP = currentIPs.find(ip => ip._id === ipId);
    if (selectedIP && selectedIP.cards) {
        selectedIP.cards.forEach(card => {
            const option = document.createElement('option');
            option.value = card._id;
            option.textContent = `${card.cardNumber} (${card.bankName}) - ${card.balance} руб`;
            cardSelect.appendChild(option);
        });
        cardSelect.disabled = false;
    }
}

function onCardChange() {
    console.log('💳 Card selected:', document.getElementById('cardSelect').value);
}

async function createTask() {
    const createBtn = document.getElementById('createBtn');
    const resultMessage = document.getElementById('resultMessage');
    
    clearErrors();
    resultMessage.innerHTML = '';

    if (!validateForm()) {
        return;
    }

    try {
        createBtn.classList.add('loading');
        createBtn.textContent = 'Создание задачи...';

        const taskData = {
            region: document.getElementById('regionSelect').value,
            ipId: document.getElementById('ipSelect').value,
            cardId: document.getElementById('cardSelect').value,
            expenseItemId: document.getElementById('expenseItemSelect').value,
            plannedAmount: parseFloat(document.getElementById('plannedAmount').value),
            plannedDate: document.getElementById('plannedDate').value,
            comments: document.getElementById('comments').value,
            status: 'assigned'
        };

        console.log('📤 Sending task data:', taskData);
        const result = await API.createTask(taskData);
        
        resultMessage.innerHTML = `<div class="success">✅ Задача успешно создана! ID: ${result._id}</div>`;
        createBtn.textContent = 'Задача создана!';
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);

    } catch (error) {
        console.error('❌ Error creating task:', error);
        resultMessage.innerHTML = `<div class="error">❌ Ошибка создания задачи: ${error.message}</div>`;
        createBtn.classList.remove('loading');
        createBtn.textContent = 'Создать задачу';
    }
}

function validateForm() {
    let isValid = true;

    if (!document.getElementById('regionSelect').value) {
        showError('regionError', 'Выберите регион');
        isValid = false;
    }
    if (!document.getElementById('ipSelect').value) {
        showError('ipError', 'Выберите ИП');
        isValid = false;
    }
    if (!document.getElementById('cardSelect').value) {
        showError('cardError', 'Выберите карту');
        isValid = false;
    }
    if (!document.getElementById('expenseItemSelect').value) {
        showError('expenseError', 'Выберите статью расхода');
        isValid = false;
    }
    if (!document.getElementById('plannedAmount').value || document.getElementById('plannedAmount').value <= 0) {
        showError('amountError', 'Введите корректную сумму');
        isValid = false;
    }
    if (!document.getElementById('plannedDate').value) {
        showError('dateError', 'Выберите дату');
        isValid = false;
    }

    return isValid;
}

function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(el => el.textContent = '');
}