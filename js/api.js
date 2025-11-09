// api.js - API клиент для Expense Manager
console.log('🔧 API.js loaded');

const API = {
    BASE_URL: 'https://expense-manager-backend-kq9h.onrender.com',
    
    async request(endpoint, options = {}) {
        try {
            const url = this.BASE_URL + endpoint;
            const token = localStorage.getItem('token');
            
            const config = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (token) {
                config.headers['Authorization'] = 'Bearer ' + token;
            }
            
            if (options.body) {
                config.body = JSON.stringify(options.body);
            }
            
            console.log('📡 API Request:', config.method, url);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('💥 API Error:', error);
            throw error;
        }
    },
    
    // Auth
    login(credentials) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: credentials
        });
    },
    
    getCurrentUser() {
        return this.request('/api/auth/me');
    },
    
    // Tasks
    createTask(taskData) {
        return this.request('/api/tasks', {
            method: 'POST',
            body: taskData
        });
    },
    
    getTasks() {
        return this.request('/api/tasks');
    },
    
    getTasksByRegion(region) {
        return this.request('/api/tasks/region/' + encodeURIComponent(region));
    },
    
    getAssignedTasks(userId) {
        return this.request('/api/tasks/assigned-to/' + userId);
    },
    
    updateTask(taskId, updateData) {
        return this.request('/api/tasks/' + taskId, {
            method: 'PUT',
            body: updateData
        });
    },
    
    // Expense Items
    getExpenseItems() {
        return this.request('/api/expense-items');
    },
    
    createExpenseItem(itemData) {
        return this.request('/api/expense-items', {
            method: 'POST',
            body: itemData
        });
    },
    
    updateExpenseItem(itemId, updateData) {
        return this.request('/api/expense-items/' + itemId, {
            method: 'PUT',
            body: updateData
        });
    },
    
    deleteExpenseItem(itemId) {
        return this.request('/api/expense-items/' + itemId, {
            method: 'DELETE'
        });
    },
    
    // Utils
    getRegions() {
        return this.request('/api/utils/regions');
    },
    
    getManagersByRegion(region) {
        return this.request('/api/utils/managers/' + encodeURIComponent(region));
    },
    
    getIPsWithCardsByRegion(region) {
        return this.request('/api/utils/ips-with-cards/' + encodeURIComponent(region));
    },
    
    getHealth() {
        return this.request('/api/health');
    }
};

window.API = API;
