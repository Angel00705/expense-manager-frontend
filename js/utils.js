// js/utils.js - УТИЛИТЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

// 🔔 СИСТЕМА УВЕДОМЛЕНИЙ
function showNotification(message, type = 'info', duration = 5000) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.2em;">${getNotificationIcon(type)}</span>
            <span>${message}</span>
        </div>
    `;
    
    // Добавляем в тело документа
    document.body.appendChild(notification);
    
    // Показываем с анимацией
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
    
    // Возможность закрыть кликом
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    return icons[type] || '💡';
}

// 🔐 ПРОВЕРКА ПРАВ ДОСТУПА
function isAdmin() {
    return appData.currentUser && appData.currentUser.role === 'admin';
}

function isManager() {
    return appData.currentUser && appData.currentUser.role === 'manager';
}

function checkAdminAccess() {
    if (!isAdmin()) {
        showNotification('❌ Доступ запрещен. Требуются права администратора.', 'error');
        return false;
    }
    return true;
}

// 📝 ФОРМАТИРОВАНИЕ ДАТ И СУММ
function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
    }).format(amount);
}

function parseCurrency(currencyString) {
    if (!currencyString) return 0;
    return parseFloat(currencyString.replace(/[^\d,]/g, '').replace(',', '.'));
}

// 🎯 РАБОТА С ФОРМАМИ
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Сбрасываем кастомные селекты
        const customSelects = form.querySelectorAll('.custom-select');
        customSelects.forEach(select => {
            if (select.dataset.value) {
                delete select.dataset.value;
            }
            const display = select.querySelector('.select-display');
            if (display) {
                display.textContent = 'Выберите...';
            }
        });
    }
}

function validateForm(formData, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].toString().trim() === '') {
            errors.push(`Поле "${field}" обязательно для заполнения`);
        }
    });
    
    if (formData.plannedAmount && formData.plannedAmount <= 0) {
        errors.push('Сумма должна быть больше 0');
    }
    
    return errors;
}

// 🔄 ЗАГРУЗКА ДАННЫХ
async function loadData(endpoint) {
    try {
        const response = await fetch(`https://expense-manager-backend-kq9h.onrender.com/api/${endpoint}`);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showNotification('⚠️ Ошибка загрузки данных', 'error');
        return [];
    }
}

async function saveData(endpoint, data) {
    try {
        const response = await fetch(`https://expense-manager-backend-kq9h.onrender.com/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Ошибка сохранения');
        
        const result = await response.json();
        showNotification('✅ Данные успешно сохранены', 'success');
        return result;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showNotification('❌ Ошибка сохранения данных', 'error');
        throw error;
    }
}

// 🎪 АНИМАЦИИ И ЭФФЕКТЫ
function addHoverEffects() {
    // Добавляем эффекты при наведении на карточки
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Эффекты для кнопок
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// 🔧 ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
function initializeApp() {
    // Загружаем данные пользователя из localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        appData.currentUser = JSON.parse(savedUser);
        updateUIForUser();
    }
    
    // Добавляем визуальные эффекты
    addHoverEffects();
    
    // Показываем приветственное сообщение
    if (appData.currentUser) {
        showNotification(`👋 Добро пожаловать, ${appData.currentUser.name}!`, 'success', 3000);
    }
}

function updateUIForUser() {
    // Обновляем интерфейс в зависимости от роли пользователя
    const adminElements = document.querySelectorAll('.admin-only');
    const managerElements = document.querySelectorAll('.manager-only');
    
    if (isAdmin()) {
        adminElements.forEach(el => el.style.display = 'block');
        managerElements.forEach(el => el.style.display = 'block');
    } else if (isManager()) {
        adminElements.forEach(el => el.style.display = 'none');
        managerElements.forEach(el => el.style.display = 'block');
    } else {
        adminElements.forEach(el => el.style.display = 'none');
        managerElements.forEach(el => el.style.display = 'none');
    }
    
    // Обновляем информацию о пользователе в хедере
    const userInfoElement = document.querySelector('.user-info');
    if (userInfoElement && appData.currentUser) {
        userInfoElement.innerHTML = `
            <span>👤 ${appData.currentUser.name}</span>
            <span class="badge ${appData.currentUser.role === 'admin' ? 'badge-success' : 'badge-info'}">
                ${appData.currentUser.role === 'admin' ? '👨‍💼 Бухгалтер' : '👨‍💻 Управляющий'}
            </span>
        `;
    }
}

// Экспортируем функции для использования в других файлах
window.showNotification = showNotification;
window.isAdmin = isAdmin;
window.isManager = isManager;
window.checkAdminAccess = checkAdminAccess;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.parseCurrency = parseCurrency;
window.clearForm = clearForm;
window.validateForm = validateForm;
window.loadData = loadData;
window.saveData = saveData;
window.initializeApp = initializeApp;
window.updateUIForUser = updateUIForUser;