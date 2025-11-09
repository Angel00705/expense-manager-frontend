// js/api.js - Super Simple API
console.log('🔄 API.js loaded');

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
                    ...(token && { 'Authorization': 'Bearer ' + token }),
                    ...options.headers
                }
            };
            
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
    
    // Expense Items
    getExpenseItems() {
        return this.request('/api/expense-items');
    },
    
    // Utils
    getRegions() {
        return this.request('/api/utils/regions');
    },
    
    getManagersByRegion(region) {
        return this.request(`/api/utils/managers/${region}`);
    },
    
    getIPsWithCardsByRegion(region) {
        return this.request(`/api/utils/ips-with-cards/${region}`);
    }
};

// Глобально доступно
window.API = API;
console.log('✅ API initialized');
