// create-task.js
class CreateTaskManager {
    constructor() {
        this.regions = [];
        this.managers = [];
        this.ips = [];
        this.expenseItems = [];
        this.currentUser = null;
        
        this.init();
    }

    async init() {
        try {
            // Check auth
            this.currentUser = await this.checkAuth();
            if (!this.currentUser) return;

            // Load initial data
            await this.loadInitialData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ CreateTaskManager initialized');
        } catch (error) {
            console.error('❌ Init error:', error);
            this.showError('Ошибка инициализации: ' + error.message);
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return null;
        }

        try {
            const user = await API.getCurrentUser();
            if (user.role !== 'accountant') {
                this.showError('Только бухгалтеры могут создавать задачи');
                setTimeout(() => window.location.href = 'dashboard.html', 2000);
                return null;
            }
            return user;
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
            return null;
        }
    }

    async loadInitialData() {
        try {
            this.showLoading(true);
            
            // Load regions
            const regionsData = await API.getRegions();
            this.regions = regionsData.regions || [];
            this.populateRegions();
            
            // Load expense items
            const itemsData = await API.getExpenseItems();
            this.expenseItems = itemsData.expenseItems || [];
            this.populateExpenseItems();
            
            console.log('📊 Loaded data:', {
                regions: this.regions.length,
                expenseItems: this.expenseItems.length
            });
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Ошибка загрузки данных: ' + error.message);
        } finally {
            this.showLoading(false);
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
        const itemSelect = document.getElementById('expenseItem');
        itemSelect.innerHTML = '<option value="">Выберите статью расхода</option>';
        
        this.expenseItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item._id;
            option.textContent = `${item.name} (${item.category})`;
            option.title = item.description || '';
            itemSelect.appendChild(option);
        });
    }

    async onRegionChange(region) {
        const ipSelect = document.getElementById('ip');
        const managerSelect = document.getElementById('manager');
        const cardSelect = document.getElementById('card');
        
        // Reset dependent fields
        ipSelect.innerHTML = '<option value="">Загрузка...</option>';
        ipSelect.disabled = true;
        managerSelect.innerHTML = '<option value="">Загрузка...</option>';
        managerSelect.disabled = true;
        cardSelect.innerHTML = '<option value="">Сначала выберите ИП</option>';
        cardSelect.disabled = true;
        
        if (!region) return;

        try {
            // Load managers and IPs in parallel
            const [managersData, ipsData] = await Promise.all([
                API.getManagersByRegion(region),
                API.getIPsWithCardsByRegion(region)
            ]);

            this.managers = managersData.managers || [];
            this.ips = ipsData.ips || [];

            // Populate IPs
            this.populateIPs();
            
            // Populate managers
            this.populateManagers();
            
        } catch (error) {
            console.error('Error loading region data:', error);
            this.showError('Ошибка загрузки данных региона: ' + error.message);
        }
    }

    populateIPs() {
        const ipSelect = document.getElementById('ip');
        ipSelect.innerHTML = '<option value="">Выберите ИП</option>';
        
        this.ips.forEach(ip => {
            const option = document.createElement('option');
            option.value = ip._id;
            option.textContent = `${ip.name} (ИНН: ${ip.inn})`;
            option.dataset.cards = JSON.stringify(ip.cards || []);
            ipSelect.appendChild(option);
        });
        
        ipSelect.disabled = false;
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

    onIPChange(ipId) {
        const cardSelect = document.getElementById('card');
        const cardInfo = document.getElementById('cardInfo');
        
        cardSelect.innerHTML = '<option value="">Выберите карту</option>';
        cardInfo.style.display = 'none';
        
        if (!ipId) {
            cardSelect.disabled = true;
            return;
        }

        const ipSelect = document.getElementById('ip');
        const selectedOption = ipSelect.options[ipSelect.selectedIndex];
        const cards = JSON.parse(selectedOption.dataset.cards || '[]');

        cards.forEach(card => {
            const option = document.createElement('option');
            option.value = card._id;
            option.textContent = `${card.cardNumber} - ${card.balance} руб.`;
            option.dataset.card = JSON.stringify(card);
            cardSelect.appendChild(option);
        });
        
        cardSelect.disabled = cards.length === 0;
    }

    onCardChange(cardId) {
        const cardInfo = document.getElementById('cardInfo');
        
        if (!cardId) {
            cardInfo.style.display = 'none';
            return;
        }

        const cardSelect = document.getElementById('card');
        const selectedOption = cardSelect.options[cardSelect.selectedIndex];
        const card = JSON.parse(selectedOption.dataset.card || '{}');

        cardInfo.innerHTML = `
            <div><strong>Номер карты:</strong> <span class="card-number">${card.cardNumber || ''}</span></div>
            <div><strong>Баланс:</strong> <span class="card-balance">${card.balance || 0} руб.</span></div>
            <div><strong>Тип:</strong> ${card.cardType || 'Не указан'}</div>
        `;
        cardInfo.style.display = 'block';
    }

    async onSubmit(formData) {
        try {
            this.showLoading(true);
            
            const taskData = {
                region: formData.region,
                ip: formData.ip,
                card: formData.card,
                expenseItem: formData.expenseItem,
                assignedTo: formData.manager,
                plannedAmount: parseFloat(formData.plannedAmount),
                plannedDate: formData.plannedDate,
                description: formData.description,
                status: 'pending',
                createdBy: this.currentUser._id
            };

            console.log('📤 Creating task:', taskData);
            
            const result = await API.createTask(taskData);
            
            this.showSuccess('Задача успешно создана!');
            
            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error creating task:', error);
            this.showError('Ошибка создания задачи: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        // Region change
        document.getElementById('region').addEventListener('change', (e) => {
            this.onRegionChange(e.target.value);
        });

        // IP change
        document.getElementById('ip').addEventListener('change', (e) => {
            this.onIPChange(e.target.value);
        });

        // Card change
        document.getElementById('card').addEventListener('change', (e) => {
            this.onCardChange(e.target.value);
        });

        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            if (confirm('Отменить создание задачи?')) {
                window.location.href = 'dashboard.html';
            }
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    handleSubmit() {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
        
        const data = {
            region: formData.get('region'),
            ip: formData.get('ip'),
            card: formData.get('card'),
            expenseItem: formData.get('expenseItem'),
            manager: formData.get('manager'),
            plannedAmount: formData.get('plannedAmount'),
            plannedDate: formData.get('plannedDate'),
            description: formData.get('description')
        };

        // Validation
        if (!this.validateForm(data)) return;

        this.onSubmit(data);
    }

    validateForm(data) {
        const errors = [];

        if (!data.region) errors.push('Выберите регион');
        if (!data.ip) errors.push('Выберите ИП');
        if (!data.card) errors.push('Выберите карту');
        if (!data.expenseItem) errors.push('Выберите статью расхода');
        if (!data.manager) errors.push('Выберите управляющего');
        if (!data.plannedAmount || data.plannedAmount <= 0) errors.push('Введите корректную сумму');
        if (!data.plannedDate) errors.push('Выберите плановую дату');
        if (!data.description || data.description.trim().length < 10) {
            errors.push('Описание должно содержать минимум 10 символов');
        }

        if (errors.length > 0) {
            this.showError('Исправьте ошибки:\n' + errors.join('\n• '));
            return false;
        }

        return true;
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
        
        const form = document.getElementById('taskForm');
        form.classList.toggle('loading', show);
    }

    showError(message) {
        alert('❌ ' + message);
    }

    showSuccess(message) {
        alert('✅ ' + message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CreateTaskManager();
});
