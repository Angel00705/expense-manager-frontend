import { API_CONFIG } from './config/constants.js';
import { ApiUtils } from './utils.js';

export class ApiService {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async login(email, password) {
        try {
            const response = await ApiUtils.makeApiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ email, password }),
            });

            if (response.token) {
                this.setToken(response.token);
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Ошибка входа. Проверьте email и пароль.');
        }
    }

    async getCards() {
        try {
            const response = await ApiUtils.makeApiRequest(API_CONFIG.ENDPOINTS.CARDS, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            return response.cards || [];
        } catch (error) {
            console.error('Get cards error:', error);
            throw new Error('Ошибка загрузки карт');
        }
    }

    async getIPs() {
        try {
            const response = await ApiUtils.makeApiRequest(API_CONFIG.ENDPOINTS.IPS, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            return response.ips || [];
        } catch (error) {
            console.error('Get IPs error:', error);
            throw new Error('Ошибка загрузки ИП');
        }
    }

    async getTasks() {
        try {
            const response = await ApiUtils.makeApiRequest(API_CONFIG.ENDPOINTS.TASKS, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            return response.tasks || [];
        } catch (error) {
            console.error('Get tasks error:', error);
            throw new Error('Ошибка загрузки задач');
        }
    }

    async checkData() {
        try {
            const response = await ApiUtils.makeApiRequest(API_CONFIG.ENDPOINTS.CHECK_DATA, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });
            return response;
        } catch (error) {
            console.error('Check data error:', error);
            throw new Error('Ошибка проверки данных');
        }
    }

    async logout() {
        this.setToken(null);
        localStorage.removeItem('user_data');
    }
}

// Создаем глобальный экземпляр API service
export const apiService = new ApiService();
