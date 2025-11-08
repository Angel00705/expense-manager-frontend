// api.js - Enhanced API Client with Debugging
class API {
    static BASE_URL = 'https://expense-manager-backend-kq9h.onrender.com';

    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = this.BASE_URL + endpoint;
        const token = localStorage.getItem('token');
        
        console.log('🔄 API Request:', method, endpoint);
        console.log('📦 Request data:', data);
        console.log('🔑 Token exists:', !!token);

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'omit'
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            console.log('🌐 Sending request to:', url);
            const response = await fetch(url, options);
            
            console.log('📨 Response status:', response.status);
            console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                if (response.ok) {
                    return { success: true, status: response.status };
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const result = await response.json();
            console.log('📨 Response data:', result);
            
            if (!response.ok) {
                // Handle 401 Unauthorized
                if (response.status === 401) {
                    console.log('🚨 Unauthorized - clearing tokens');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
                }
                
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ API Error:', error);
            
            // Network errors
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                const networkError = new Error('Ошибка соединения с сервером. Проверьте интернет-соединение.');
                networkError.isNetworkError = true;
                throw networkError;
            }
            
            // CORS errors
            if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
                const corsError = new Error('Ошибка CORS. Сервер недоступен.');
                corsError.isCorsError = true;
                throw corsError;
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

    static async createExpenseItem(itemData) {
        return await this.makeRequest('/api/expense-items', 'POST', itemData);
    }

    static async updateExpenseItem(itemId, updateData) {
        return await this.makeRequest(`/api/expense-items/${itemId}`, 'PUT', updateData);
    }

    static async deleteExpenseItem(itemId) {
        return await this.makeRequest(`/api/expense-items/${itemId}`, 'DELETE');
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

    // ==================== ПРОВЕРКА СЕРВЕРА ====================
    static async checkHealth() {
        try {
            const health = await this.makeRequest('/api/health');
            return health.success || false;
        } catch (error) {
            console.error('Server health check failed:', error);
            return false;
        }
    }

    // ==================== ДЕБАГГИНГ ====================
    static async testConnection() {
        console.group('🔍 API Connection Test');
        try {
            const health = await this.checkHealth();
            console.log('✅ Server health:', health);
            
            const token = localStorage.getItem('token');
            console.log('✅ Token exists:', !!token);
            
            if (token) {
                console.log('✅ Token length:', token.length);
                const user = localStorage.getItem('user');
                console.log('✅ User data:', user ? JSON.parse(user) : 'No user data');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        } finally {
            console.groupEnd();
        }
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.API = API;
}

// Для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

console.log('✅ API module loaded successfully');
