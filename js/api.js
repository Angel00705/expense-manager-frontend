// js/api.js - Ultra Simple API Client
class API {
    static BASE_URL = 'https://expense-manager-backend-kq9h.onrender.com';

    static async makeRequest(endpoint, method = 'GET', data = null) {
        console.log('🔄 API Request:', method, endpoint, data);
        
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

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            console.log('📡 Sending request to:', url);
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ API Success:', result);
            return result;
        } catch (error) {
            console.error('💥 API Fetch Error:', error);
            throw error;
        }
    }

    // 🔐 AUTH
    static async login(credentials) {
        return this.makeRequest('/api/auth/login', 'POST', credentials);
    }

    static async getCurrentUser() {
        return this.makeRequest('/api/auth/me');
    }

    // 📋 TASKS
    static async createTask(taskData) {
        return this.makeRequest('/api/tasks', 'POST', taskData);
    }

    static async getTasks() {
        return this.makeRequest('/api/tasks');
    }

    static async getTasksByRegion(region) {
        return this.makeRequest(`/api/tasks/region/${region}`);
    }

    static async getAssignedTasks(userId) {
        return this.makeRequest(`/api/tasks/assigned-to/${userId}`);
    }

    static async updateTask(taskId, updateData) {
        return this.makeRequest(`/api/tasks/${taskId}`, 'PUT', updateData);
    }

    // 💰 EXPENSE ITEMS
    static async getExpenseItems() {
        return this.makeRequest('/api/expense-items');
    }

    static async createExpenseItem(itemData) {
        return this.makeRequest('/api/expense-items', 'POST', itemData);
    }

    static async updateExpenseItem(itemId, updateData) {
        return this.makeRequest(`/api/expense-items/${itemId}`, 'PUT', updateData);
    }

    static async deleteExpenseItem(itemId) {
        return this.makeRequest(`/api/expense-items/${itemId}`, 'DELETE');
    }

    // 🏢 IPS & CARDS
    static async getIPs() {
        return this.makeRequest('/api/ips');
    }

    static async getCards() {
        return this.makeRequest('/api/cards');
    }

    // 🔧 UTILS
    static async getRegions() {
        return this.makeRequest('/api/utils/regions');
    }

    static async getManagersByRegion(region) {
        return this.makeRequest(`/api/utils/managers/${region}`);
    }

    static async getIPsWithCardsByRegion(region) {
        return this.makeRequest(`/api/utils/ips-with-cards/${region}`);
    }

    static async getHealth() {
        return this.makeRequest('/api/health');
    }
}

// Make it globally available
window.API = API;
