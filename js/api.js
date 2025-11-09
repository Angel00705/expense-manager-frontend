// api.js - Ultra Robust API Client
class API {
    static BASE_URL = 'https://expense-manager-backend-kq9h.onrender.com';

    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = this.BASE_URL + endpoint;
        const token = localStorage.getItem('token');
        
        console.log(`🔄 API Call: ${method} ${url}`, data);

        // Проверка сети
        if (!navigator.onLine) {
            throw new Error('Отсутствует подключение к интернету. Проверьте ваше соединение.');
        }

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            // Таймаут для Render.com (он иногда "засыпает")
            signal: AbortSignal.timeout(15000)
        };

        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
            console.log('🔑 Token added to request');
        }

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            // Проверка на HTTP ошибки
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ HTTP Error ${response.status}:`, errorText);
                
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
                }
                
                throw new Error(`Ошибка сервера: ${response.status}`);
            }

            const result = await response.json();
            console.log(`✅ API Success: ${method} ${endpoint}`, result);
            return result;

        } catch (error) {
            console.error(`💥 API Critical Error: ${method} ${endpoint}`, error);
            
            if (error.name === 'TimeoutError') {
                throw new Error('Сервер не отвечает. Попробуйте еще раз через несколько секунд.');
            }
            
            throw error;
        }
    }

    // Auth methods
    static async login(credentials) {
        return this.makeRequest('/api/auth/login', 'POST', credentials);
    }

    static async validateToken() {
        return this.makeRequest('/api/auth/validate');
    }

    // Tasks methods
    static async createTask(taskData) {
        return this.makeRequest('/api/tasks', 'POST', taskData);
    }

    static async getTasks() {
        return this.makeRequest('/api/tasks');
    }

    static async getTasksForManager() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return this.makeRequest(`/api/tasks/assigned-to/${user._id}`);
    }

    static async updateTask(taskId, updateData) {
        return this.makeRequest(`/api/tasks/${taskId}`, 'PUT', updateData);
    }

    // Expense Items
    static async getExpenseItems() {
        return this.makeRequest('/api/expense-items');
    }

    // Utils methods
    static async getRegions() {
        return this.makeRequest('/api/utils/regions');
    }

    static async getManagersByRegion(region) {
        if (!region) throw new Error('Регион не указан');
        return this.makeRequest('/api/utils/managers/' + encodeURIComponent(region));
    }

    static async getIPsWithCardsByRegion(region) {
        if (!region) throw new Error('Регион не указан');
        return this.makeRequest('/api/utils/ips-with-cards/' + encodeURIComponent(region));
    }
}

// Глобальная доступность и обработка ошибок загрузки
if (typeof window !== 'undefined') {
    window.API = API;
    console.log('✅ API class loaded successfully');
}

export default API;
