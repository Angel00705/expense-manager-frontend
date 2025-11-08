import { API_CONFIG } from './config/constants.js';
import { apiService } from './api.js';
import { DomUtils, ValidationUtils } from './utils.js';

export class AuthService {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    loadUserFromStorage() {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.clearAuth();
            }
        }
    }

    saveUserToStorage(user) {
        this.currentUser = user;
        localStorage.setItem('user_data', JSON.stringify(user));
    }

    clearAuth() {
        this.currentUser = null;
        localStorage.removeItem('user_data');
        apiService.logout();
    }

    isAuthenticated() {
        return !!this.currentUser && !!localStorage.getItem('auth_token');
    }

    getUser() {
        return this.currentUser;
    }

    hasAccessToRegion(region) {
        if (!this.currentUser) return false;
        
        // Бухгалтер имеет доступ ко всем регионам
        if (this.currentUser.role === USER_ROLES.ACCOUNTANT) {
            return true;
        }
        
        // Менеджер имеет доступ только к своему региону
        return this.currentUser.region === region || this.currentUser.region === 'all';
    }

    async login(email, password) {
        // Валидация
        if (!ValidationUtils.isValidEmail(email)) {
            throw new Error('Введите корректный email');
        }

        if (!ValidationUtils.isValidPassword(password)) {
            throw new Error('Пароль должен содержать не менее 6 символов');
        }

        try {
            // Пробуем найти тестового пользователя
            const testUser = TEST_USERS.find(user => user.email === email && user.password === password);
            
            if (testUser) {
                // Тестовый пользователь - создаем фиктивный токен и сохраняем
                const userData = {
                    id: Date.now(),
                    email: testUser.email,
                    name: testUser.name,
                    role: testUser.role,
                    region: testUser.region
                };

                // Сохраняем фиктивный токен для API service
                apiService.setToken(`test_token_${Date.now()}`);
                this.saveUserToStorage(userData);
                
                return userData;
            }

            // Если не тестовый пользователь - пробуем через API
            const response = await apiService.login(email, password);
            
            if (response.user) {
                this.saveUserToStorage(response.user);
                return response.user;
            } else {
                throw new Error('Неверный email или пароль');
            }
        } catch (error) {
            this.clearAuth();
            throw error;
        }
    }

    logout() {
        this.clearAuth();
        window.location.href = './login.html';
    }

    // Проверка доступа к странице
    checkPageAccess(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = './login.html';
            return false;
        }

        if (requiredRole && this.currentUser.role !== requiredRole) {
            window.location.href = './dashboard.html';
            return false;
        }

        return true;
    }
}

// Глобальный экземпляр AuthService
export const authService = new AuthService();
