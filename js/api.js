// api.js - Ultra Simple API Client
class API {
    static BASE_URL = 'https://expense-manager-backend-kq9h.onrender.com';

    static async makeRequest(endpoint, method = 'GET', data = null) {
        console.log('API Request:', method, endpoint, data);
        
        const url = this.BASE_URL + endpoint;
        const token = localStorage.getItem('token');
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
        }

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'API Error');
            }
            
            return result;
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

    // Expense Items
    static async getExpenseItems() {
        return this.makeRequest('/api/expense-items');
    }

    // Utils
    static async getRegions() {
        return this.makeRequest('/api/utils/regions');
    }

    static async getManagersByRegion(region) {
        return this.makeRequest('/api/utils/managers/' + region);
    }

    static async getIPsWithCardsByRegion(region) {
        return this.makeRequest('/api/utils/ips-with-cards/' + region);
    }
}

// Make it globally available
window.API = API;
