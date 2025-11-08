// create-task.js - Функционал создания задач

class CreateTaskManager {
    constructor() {
        this.regions = [];
        this.managers = [];
        this.ips = [];
        this.cards = [];
        this.expenseItems = [];
        
        this.init();
    }

    async init() {
        // Проверяем авторизацию и роль бухгалтера
        if (!this.checkAccess()) return;
        
        await this.loadInitialData();
        this.setupEventListeners();
    }

    checkAccess() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (user.role !== 'accountant') {
            alert('Доступ запрещен. Только бухгалтеры могут создавать задачи.');
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    }

    async loadInitialData() {
        try {
            // Загружаем регионы
            this.regions = await API.getRegions();
            this.populateRegions();
            
            // Загружаем статьи расходов
            this.expenseItems = await API.getExpenseItems();
            this.populateExpenseItems();
            
        } catch (error) {
            this.showError('Ошибка загрузки данных: ' + error.message);
        }
    }

    populateRegions() {
        const regionSelect = document.getElementById('region');
        regionSelect.innerHTML = '<option value="">Выберите регион</option>';
        
        this.regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
    }

    populateExpenseItems() {
        const expenseSelect = document.getElementById('expenseItem');
        expenseSelect.innerHTML = '<option value="">Выберите статью расхода</option>';
        
        this.expenseItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item._id;
            option.textContent = `${item.name} (${item.category})`;
            expenseSelect.appendChild(option);
        });
    }

    async loadManagersForRegion(region) {
        try {
            this.managers = await API.getManagersByRegion(region);
            this.populateManagers();
        } catch (error) {
            this.showError('Ошибка загрузки управляющих: ' + error.message);
        }
    }

    async loadIPsForRegion(region) {
        try {
            this.ips = await API.getIPsWithCardsByRegion(region);
            this.populateIPs();
        } catch (error) {
            this.showError('Ошибка загрузки ИП: ' + error.message);
        }
    }

    populateManagers() {
        const managerSelect = document.getElementById('manager');
        managerSelect.innerHTML = '<option value="">Выберите управляющего</option>';
        
        this.managers.forEach(manager => {
            const option = document.createElement('option');
            option.value = manager._id;
            option.textContent = `${manager.name} (${manager.email})`;
            managerSelect.appendChild(option);
        });
        
        managerSelect.disabled = false;
    }

    populateIPs() {
        const ipSelect = document.getElementById('ip');
        ipSelect.innerHTML = '<option value="">Выберите ИП</option>';
        
        this.ips.forEach(ip => {
            const option = document.createElement('option');
            option.value = ip._id;
            option.textContent = `${ip.name} (${ip.inn})`;
            option.dataset.cards = JSON.stringify(ip.cards || []);
            ipSelect.appendChild(option);
        });
        
        ipSelect.disabled = false;
    }

    populateCards(cardsData) {
        const cardSelect = document.getElementById('card');
        cardSelect.innerHTML = '<option value="">Выберите карту</option>';
        
        if (!cardsData || cardsData.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Нет доступных карт';
            cardSelect.appendChild(option);
            cardSelect.disabled = true;
            return;
        }
        
        cardsData.forEach(card => {
            const option = document.createElement('option');
            option.value = card._id;
            const cardType = card.type === 'corporate' ? 'Корпоративная' : 'Персональная';
            option.textContent = `${card.cardNumber} - ${card.bankName} (${cardType})`;
            option.dataset.balance = card.balance;
            option.dataset.limit = card.limit;
            cardSelect.appendChild(option);
        });
        
        cardSelect.disabled = false;
    }

    setupEventListeners() {
        // Изменение региона
        document.getElementById('region').addEventListener('change', (e) => {
            const region = e.target.value;
            this.onRegionChange(region);
        });

        // Изменение ИП
        document.getElementById('ip').addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            if (selectedOption.dataset.cards) {
                const cards = JSON.parse(selectedOption.dataset.cards);
                this.populateCards(cards);
            } else {
                this.populateCards([]);
            }
        });

        // Кнопка отмены
        document.getElementById('cancelBtn').addEventListener('click', () => {
            if (confirm('Отменить создание задачи? Все введенные данные будут потеряны.')) {
                window.location.href = 'dashboard.html';
            }
        });

        // Отправка формы
        document.getElementById('createTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Выход из системы
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Выйти из системы?')) {
                logout();
            }
        });
    }

    async onRegionChange(region) {
        if (!region) {
            this.resetDependentFields(['ip', 'card', 'manager']);
            return;
        }

        this.setLoadingState(true, 'region');

        try {
            await Promise.all([
                this.loadManagersForRegion(region),
                this.loadIPsForRegion(region)
            ]);
        } catch (error) {
            this.showError('Ошибка загрузки данных региона: ' + error.message);
        } finally {
            this.setLoadingState(false, 'region');
        }
    }

    resetDependentFields(fieldNames) {
        fieldNames.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            field.innerHTML = `<option value="">Сначала выберите ${this.getFieldLabel(fieldName)}</option>`;
            field.disabled = true;
        });
    }

    getFieldLabel(fieldName) {
        const labels = {
            'ip': 'регион',
            'card': 'ИП', 
            'manager': 'регион'
        };
        return labels[fieldName] || '';
    }

    async handleSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            this.setLoadingState(true, 'submit');
            
            const taskData = {
                region: formData.region,
                ip: formData.ip,
                card: formData.card,
                manager: formData.manager,
                expenseItem: formData.expenseItem,
                plannedAmount: parseFloat(formData.plannedAmount),
                plannedDate: formData.plannedDate,
                comment: formData.comment,
                status: 'pending',
                createdBy: JSON.parse(localStorage.getItem('user'))._id
            };

            await API.createTask(taskData);
            this.showSuccess('Задача успешно создана! Перенаправление на дашборд...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            this.showError('Ошибка создания задачи: ' + error.message);
        } finally {
            this.setLoadingState(false, 'submit');
        }
    }

    getFormData() {
        const form = document.getElementById('createTaskForm');
        return {
            region: form.region.value,
            ip: form.ip.value,
            card: form.card.value,
            manager: form.manager.value,
            expenseItem: form.expenseItem.value,
            plannedAmount: form.plannedAmount.value,
            plannedDate: form.plannedDate.value,
            comment: form.comment.value
        };
    }

    validateForm(data) {
        const errors = [];
        
        if (!data.region) errors.push('Выберите регион');
        if (!data.ip) errors.push('Выберите ИП');
        if (!data.card) errors.push('Выберите карту');
        if (!data.manager) errors.push('Выберите управляющего');
        if (!data.expenseItem) errors.push('Выберите статью расхода');
        if (!data.plannedAmount || data.plannedAmount <= 0) errors.push('Введите корректную сумму');
        if (!data.plannedDate) errors.push('Выберите дату выполнения');

        // Проверка даты
        if (data.plannedDate) {
            const selectedDate = new Date(data.plannedDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errors.push('Дата выполнения не может быть в прошлом');
            }
        }

        if (errors.length > 0) {
            this.showError('Исправьте ошибки:<br>' + errors.join('<br>'));
            return false;
        }

        return true;
    }

    setLoadingState(isLoading, type = 'general') {
        const submitBtn = document.querySelector('button[type="submit"]');
        
        if (type === 'submit') {
            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Создание...';
                submitBtn.classList.add('loading');
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Создать задачу';
                submitBtn.classList.remove('loading');
            }
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.innerHTML = message;

        const form = document.getElementById('createTaskForm');
        form.insertBefore(messageDiv, form.firstChild);

        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new CreateTaskManager();
});
