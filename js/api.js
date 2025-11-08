// api.js - Работа с API бэкенда

class API {
    static BASE_URL = 'https://expense-manager-backend-kq9h.onrender.com';

    // Основной метод для выполнения запросов
    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Добавляем токен авторизации, если есть
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Добавляем тело запроса для POST/PUT методов
        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            
            // Проверяем статус ответа
            if (!response.ok) {
                // Если 401 Unauthorized - перенаправляем на логин
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
                }
                
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Для ответов без тела (например, 204 No Content)
            if (response.status === 204) {
                return { success: true };
            }

            return await response.json();
            
        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error);
            
            // Если это ошибка сети
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Ошибка соединения с сервером. Проверьте интернет-соединение.');
            }
            
            throw error;
        }
    }

    // ==================== АВТОРИЗАЦИЯ ====================
    static async login(credentials) {
        const response = await this.makeRequest('/api/auth/login', 'POST', credentials);
        return response;
    }

    static async register(userData) {
        const response = await this.makeRequest('/api/auth/register', 'POST', userData);
        return response;
    }

    // ==================== ЗАДАЧИ ====================
    static async createTask(taskData) {
        const response = await this.makeRequest('/api/tasks', 'POST', taskData);
        return response;
    }

    static async getTasks() {
        const response = await this.makeRequest('/api/tasks');
        return response;
    }

    static async getTaskById(taskId) {
        const response = await this.makeRequest(`/api/tasks/${taskId}`);
        return response;
    }

    static async getAssignedTasks(userId) {
        const response = await this.makeRequest(`/api/tasks/assigned-to/${userId}`);
        return response;
    }

    static async getTasksByRegion(region) {
        const response = await this.makeRequest(`/api/tasks/region/${region}`);
        return response;
    }

    static async updateTask(taskId, updateData) {
        const response = await this.makeRequest(`/api/tasks/${taskId}`, 'PUT', updateData);
        return response;
    }

    static async deleteTask(taskId) {
        const response = await this.makeRequest(`/api/tasks/${taskId}`, 'DELETE');
        return response;
    }

    // ==================== СТАТЬИ РАСХОДОВ ====================
    static async getExpenseItems() {
        const response = await this.makeRequest('/api/expense-items');
        return response;
    }

    static async createExpenseItem(itemData) {
        const response = await this.makeRequest('/api/expense-items', 'POST', itemData);
        return response;
    }

    static async updateExpenseItem(itemId, updateData) {
        const response = await this.makeRequest(`/api/expense-items/${itemId}`, 'PUT', updateData);
        return response;
    }

    static async deleteExpenseItem(itemId) {
        const response = await this.makeRequest(`/api/expense-items/${itemId}`, 'DELETE');
        return response;
    }

    // ==================== КАРТЫ ====================
    static async getCards() {
        const response = await this.makeRequest('/api/cards');
        return response;
    }

    static async getCardsByIP(ipId) {
        const response = await this.makeRequest(`/api/cards/ip/${ipId}`);
        return response;
    }

    static async createCard(cardData) {
        const response = await this.makeRequest('/api/cards', 'POST', cardData);
        return response;
    }

    static async updateCard(cardId, updateData) {
        const response = await this.makeRequest(`/api/cards/${cardId}`, 'PUT', updateData);
        return response;
    }

    // ==================== ИП ====================
    static async getIPs() {
        const response = await this.makeRequest('/api/ips');
        return response;
    }

    static async getIPsByRegion(region) {
        const response = await this.makeRequest(`/api/ips/region/${region}`);
        return response;
    }

    static async createIP(ipData) {
        const response = await this.makeRequest('/api/ips', 'POST', ipData);
        return response;
    }

    // ==================== УТИЛИТЫ ====================
    static async getRegions() {
        const response = await this.makeRequest('/api/utils/regions');
        return response;
    }

    static async getManagersByRegion(region) {
        const response = await this.makeRequest(`/api/utils/managers/${region}`);
        return response;
    }

    static async getIPsWithCardsByRegion(region) {
        const response = await this.makeRequest(`/api/utils/ips-with-cards/${region}`);
        return response;
    }

    static async getHealth() {
        const response = await this.makeRequest('/api/health');
        return response;
    }

    // ==================== ПОЛЬЗОВАТЕЛИ ====================
    static async getUsers() {
        const response = await this.makeRequest('/api/users');
        return response;
    }

    static async getUserById(userId) {
        const response = await this.makeRequest(`/api/users/${userId}`);
        return response;
    }

    static async updateUser(userId, updateData) {
        const response = await this.makeRequest(`/api/users/${userId}`, 'PUT', updateData);
        return response;
    }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
    
    // Проверка доступности сервера
    static async checkServerHealth() {
        try {
            const health = await this.getHealth();
            return health.success || false;
        } catch (error) {
            console.error('Server health check failed:', error);
            return false;
        }
    }

    // Загрузка файлов (если понадобится)
    static async uploadFile(endpoint, formData) {
        const url = `${this.BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const config = {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    // Скачивание файлов (если понадобится)
    static async downloadFile(endpoint, filename) {
        const url = `${this.BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const config = {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('File download error:', error);
            throw error;
        }
    }
}

// Глобальный экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
