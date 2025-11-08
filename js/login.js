import { authService } from './auth.js';
import { ApiUtils, DomUtils, ValidationUtils } from './utils.js';
import { TEST_USERS } from '../config/constants.js';

class LoginPage {
    constructor() {
        this.init();
    }

    async init() {
        // Если пользователь уже авторизован, перенаправляем на дашборд
        if (authService.isAuthenticated()) {
            window.location.href = './dashboard.html';
            return;
        }

        this.setupEventListeners();
        await this.checkApiStatus();
        this.displayTestUsers();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('loginButton');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (emailInput && passwordInput) {
            // Автозаполнение при выборе тестового пользователя
            [emailInput, passwordInput].forEach(input => {
                input.addEventListener('input', () => {
                    this.validateForm();
                });
            });
        }

        if (loginButton) {
            loginButton.addEventListener('click', () => {
                this.handleLogin();
            });
        }
    }

    async checkApiStatus() {
        const apiStatusElement = document.getElementById('apiStatus');
        if (!apiStatusElement) return;

        apiStatusElement.textContent = 'Проверка подключения...';
        apiStatusElement.className = 'api-status checking';

        try {
            const isOnline = await ApiUtils.checkApiHealth();
            if (isOnline) {
                apiStatusElement.textContent = '✅ API подключено';
                apiStatusElement.className = 'api-status online';
            } else {
                apiStatusElement.textContent = '⚠️ API недоступно, используется демо-режим';
                apiStatusElement.className = 'api-status offline';
            }
        } catch (error) {
            apiStatusElement.textContent = '⚠️ Ошибка подключения к API';
            apiStatusElement.className = 'api-status offline';
        }
    }

    displayTestUsers() {
        const testUsersContainer = document.getElementById('testUsers');
        if (!testUsersContainer) return;

        const usersHTML = TEST_USERS.map(user => `
            <div class="user-item" data-email="${user.email}" data-password="${user.password}">
                <strong>${user.name}</strong>
                <span>${user.email} / ${user.password}</span>
            </div>
        `).join('');

        testUsersContainer.innerHTML = usersHTML;

        // Добавляем обработчики для тестовых пользователей
        const userItems = testUsersContainer.querySelectorAll('.user-item');
        userItems.forEach(item => {
            item.addEventListener('click', () => {
                const email = item.getAttribute('data-email');
                const password = item.getAttribute('data-password');
                
                document.getElementById('email').value = email;
                document.getElementById('password').value = password;
                
                this.validateForm();
            });
        });
    }

    validateForm() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginButton = document.getElementById('loginButton');

        const isValid = ValidationUtils.isValidEmail(email) && 
                       ValidationUtils.isValidPassword(password);

        if (loginButton) {
            loginButton.disabled = !isValid;
        }

        return isValid;
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginButton = document.getElementById('loginButton');
        const errorMessage = document.getElementById('errorMessage');

        // Сбрасываем ошибку
        DomUtils.hideError(errorMessage);

        // Валидация
        if (!this.validateForm()) {
            DomUtils.showError('Проверьте правильность введенных данных', errorMessage);
            return;
        }

        // Блокируем кнопку
        DomUtils.disableButton(loginButton, 'Вход...');

        try {
            await authService.login(email, password);
            
            // Успешный вход - перенаправляем на дашборд
            window.location.href = './dashboard.html';
            
        } catch (error) {
            console.error('Login error:', error);
            DomUtils.showError(error.message, errorMessage);
        } finally {
            DomUtils.enableButton(loginButton);
        }
    }
}

// Инициализация страницы логина
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});
