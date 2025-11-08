// API service for Expense Manager
const api = {
    // Базовый URL бэкенда
    baseUrl: 'https://expense-manager-backend-kq9h.onrender.com/api',
    
    // Получение заголовков с авторизацией
    getHeaders() {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },
    
    // Обработка ответа
    async handleResponse(response) {
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // Если не удалось распарсить JSON, используем стандартное сообщение
            }
            
            throw new Error(errorMessage);
        }
        
        return response.json();
    },
    
    // Базовые методы HTTP
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    },
    
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
                credentials: 'include'
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    },
    
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
                credentials: 'include'
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    },
    
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                credentials: 'include'
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    },
    
    // ==================== АВТОРИЗАЦИЯ ====================
    async login(email, password) {
        const data = { email, password };
        return this.post('/auth/login', data);
    },
    
    async register(userData) {
        return this.post('/auth/register', userData);
    },
    
    async getProfile() {
        return this.get('/auth/profile');
    },
    
    // ==================== ЗАДАЧИ ====================
    async getTasks() {
        return this.get('/tasks');
    },
    
    async getTasksByAssigned(userId) {
        return this.get(`/tasks/assigned-to/${userId}`);
    },
    
    async getTasksByRegion(region) {
        return this.get(`/tasks/region/${encodeURIComponent(region)}`);
    },
    
    async getTasksByEntrepreneur(entrepreneurId) {
        return this.get(`/tasks/entrepreneur/${entrepreneurId}`);
    },
    
    async createTask(taskData) {
        return this.post('/tasks', taskData);
    },
    
    async updateTask(id, taskData) {
        return this.put(`/tasks/${id}`, taskData);
    },
    
    async deleteTask(id) {
        return this.delete(`/tasks/${id}`);
    },
    
    // ==================== КАРТЫ ====================
    async getCards() {
        return this.get('/cards');
    },
    
    async getCardsByEntrepreneur(entrepreneurId) {
        return this.get(`/cards/entrepreneur/${entrepreneurId}`);
    },
    
    async createCard(cardData) {
        return this.post('/cards', cardData);
    },
    
    async updateCard(id, cardData) {
        return this.put(`/cards/${id}`, cardData);
    },
    
    async deleteCard(id) {
        return this.delete(`/cards/${id}`);
    },
    
    // ==================== ИП ====================
    async getIPs() {
        return this.get('/ips');
    },
    
    async getIPsByRegion(region) {
        return this.get(`/ips/region/${encodeURIComponent(region)}`);
    },
    
    async getIP(id) {
        return this.get(`/ips/${id}`);
    },
    
    async createIP(ipData) {
        return this.post('/ips', ipData);
    },
    
    async updateIP(id, ipData) {
        return this.put(`/ips/${id}`, ipData);
    },
    
    async deleteIP(id) {
        return this.delete(`/ips/${id}`);
    },
    
    // ==================== СТАТЬИ РАСХОДОВ ====================
    async getExpenseItems() {
        return this.get('/expense-items');
    },
    
    async getExpenseItemsByCreator(userId) {
        return this.get(`/expense-items/created-by/${userId}`);
    },
    
    async createExpenseItem(data) {
        return this.post('/expense-items', data);
    },
    
    async updateExpenseItem(id, data) {
        return this.put(`/expense-items/${id}`, data);
    },
    
    async deleteExpenseItem(id) {
        return this.delete(`/expense-items/${id}`);
    },
    
    // ==================== УТИЛИТЫ ====================
    async getRegions() {
        return this.get('/utils/regions');
    },
    
    async getManagersByRegion(region) {
        return this.get(`/utils/managers/${encodeURIComponent(region)}`);
    },
    
    async getCardsByIP(ipId) {
        return this.get(`/utils/cards-by-ip/${ipId}`);
    },
    
    async getIPsWithCardsByRegion(region) {
        return this.get(`/utils/ips-with-cards/${encodeURIComponent(region)}`);
    },
    
    // ==================== СИСТЕМНЫЕ ====================
    async healthCheck() {
        return this.get('/health');
    },
    
    async testConnection() {
        return this.get('/test');
    },
    
    async checkData() {
        return this.get('/check-data');
    },
    
    async importCards() {
        return this.get('/import-cards');
    }
};

// Вспомогательные функции для работы с API
const apiUtils = {
    // Форматирование даты
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    },
    
    // Форматирование даты и времени
    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU');
    },
    
    // Форматирование суммы
    formatAmount(amount) {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    },
    
    // Получение статуса задачи в читаемом виде
    getTaskStatusText(status) {
        const statusMap = {
            'assigned': 'Назначена',
            'in_progress': 'В работе',
            'completed': 'Выполнена',
            'cancelled': 'Отменена'
        };
        return statusMap[status] || status;
    },
    
    // Получение класса CSS для статуса
    getTaskStatusClass(status) {
        const classMap = {
            'assigned': 'status-assigned',
            'in_progress': 'status-in-progress',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };
        return classMap[status] || 'status-unknown';
    },
    
    // Валидация email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Валидация номера телефона (базовая)
    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone);
    },
    
    // Очистка номера телефона от лишних символов
    cleanPhone(phone) {
        return phone.replace(/[\s\-\+\(\)]/g, '');
    },
    
    // Генерация случайного ID (для временных данных)
    generateTempId() {
        return 'temp_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Проверка, является ли ID временным
    isTempId(id) {
        return id && id.startsWith('temp_');
    },
    
    // Deep clone объекта
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Дебаунс функция (для поиска и фильтрации)
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { api, apiUtils };
}
