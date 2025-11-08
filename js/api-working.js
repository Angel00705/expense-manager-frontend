// api.js - Working API Client
class API {
    static BASE_URL = 'https://expense-manager-backend-kq9h.onrender.com';

    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = this.BASE_URL + endpoint;
        const token = localStorage.getItem('token');
        
        console.log('🔄 API Request:', method, endpoint, data);

        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                    throw new Error('Сессия истекла');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    static async login(credentials) {
        return this.makeRequest('/api/auth/login', 'POST', credentials);
    }

    // Tasks
    static async createTask(taskData) {
        return this.makeRequest('/api/tasks', 'POST', taskData);
    }

    static async getTasks() {
        return this.makeRequest('/api/tasks');
    }

    static async getAssignedTasks(userId) {
        return this.makeRequest(`/api/tasks/assigned-to/${userId}`);
    }

    // Expense Items
    static async getExpenseItems() {
        return this.makeRequest('/api/expense-items');
    }

    // Utils
    static async getRegions() {
        return this.makeRequest('/api/utils/regions');
    }

    static async getManagersByRegion(region) {
        return this.makeRequest(`/api/utils/managers/${region}`);
    }

    static async getIPsWithCardsByRegion(region) {
        return this.makeRequest(`/api/utils/ips-with-cards/${region}`);
    }
}

// Make global
window.API = API;
