// api.js - Simple API Client
class API {
    static BASE_URL = 'https://expense-manager-backend-kq9h.onrender.com';

    static async makeRequest(endpoint, method = 'GET', data = null) {
        const url = this.BASE_URL + endpoint;
        console.log('API Request to:', url);
        
        const options = {
            method: method,
            headers: {'Content-Type': 'application/json'}
        };

        const token = localStorage.getItem('token');
        if (token) options.headers['Authorization'] = 'Bearer ' + token;
        if (data) options.body = JSON.stringify(data);

        const response = await fetch(url, options);
        return await response.json();
    }

    static async login(credentials) {
        return this.makeRequest('/api/auth/login', 'POST', credentials);
    }

    static async getRegions() {
        return this.makeRequest('/api/utils/regions');
    }

    static async getExpenseItems() {
        return this.makeRequest('/api/expense-items');
    }

    static async createTask(taskData) {
        return this.makeRequest('/api/tasks', 'POST', taskData);
    }
}

window.API = API;
console.log('✅ API loaded');
