// api.js - Работа с API бэкенда
class API {
    static BASE_URL = 'https://expense-manager-backend-kq9h.onrender.com';

    // Основной метод для выполнения запросов
    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = this.BASE_URL + endpoint;
        const token = localStorage.getItem('token');
        
        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Добавляем токен авторизации, если есть
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Добавляем тело запроса для POST/PUT методов
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            console.log(`Making ${method} request to: ${url}`, data);
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
                
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: `HTTP error! status: ${response.status}` };
                }
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Для ответов без тела (например, 204 No Content)
            if (response.status === 204) {
                return { success: true };
            }

            const responseData = await response.json();
            console.log(`Response from ${url}:`, responseData);
            return responseData;
            
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
        return await this.makeRequest('/api/auth/login', 'POST', credentials);
    }

    // ==================== ЗАДАЧИ ====================
    static async createTask(taskData) {
        return await this.makeRequest('/api/tasks', 'POST', taskData);
    }

    static async getTasks() {
        return await this.makeRequest('/api/tasks');
    }

    static async getAssignedTasks(userId) {
        return await this.makeRequest(`/api/tasks/assigned-to/${userId}`);
    }

    static async updateTask(taskId, updateData) {
        return await this.makeRequest(`/api/tasks/${taskId}`, 'PUT', updateData);
    }

    // ==================== СТАТЬИ РАСХОДОВ ====================
    static async getExpenseItems() {
        return await this.makeRequest('/api/expense-items');
    }

    // ==================== УТИЛИТЫ ====================
    static async getRegions() {
        return await this.makeRequest('/api/utils/regions');
    }

    static async getManagersByRegion(region) {
        return await this.makeRequest(`/api/utils/managers/${encodeURIComponent(region)}`);
    }

    static async getIPsWithCardsByRegion(region) {
        return await this.makeRequest(`/api/utils/ips-with-cards/${encodeURIComponent(region)}`);
    }

    // ==================== ПРОВЕРКА ЗДОРОВЬЯ ====================
    static async getHealth() {
        return await this.makeRequest('/api/health');
    }
}

// Создаем глобальную переменную для обратной совместимости
window.API = API;
