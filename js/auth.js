// auth.js - Управление авторизацией и аутентификацией

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
    }

    // Проверка состояния авторизации
    checkAuthState() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const currentPage = window.location.pathname.split('/').pop();

        // Если пользователь авторизован и на странице логина - перенаправляем на дашборд
        if (token && user && currentPage === 'login.html') {
            window.location.href = 'dashboard.html';
            return;
        }

        // Если пользователь не авторизован и не на странице логина - перенаправляем на логин
        if ((!token || !user) && currentPage !== 'login.html' && currentPage !== 'index.html') {
            window.location.href = 'login.html';
            return;
        }

        // Если на странице логина и есть токен - скрываем кнопку выхода
        if (currentPage === 'login.html') {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Обработка формы логина
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Автозаполнение для тестирования
        this.setupTestAccounts();
    }

    // Обработка входа
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const errorMessage = document.getElementById('errorMessage');

        // Валидация
        if (!email || !password) {
            this.showError('Пожалуйста, заполните все поля');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Пожалуйста, введите корректный email');
            return;
        }

        // Показываем индикатор загрузки
        this.setLoadingState(true);

        try {
            const response = await fetch('https://expense-manager-backend-kq9h.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email.toLowerCase(),
                    password 
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Сохраняем токен и данные пользователя
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Показываем успешное сообщение
                this.showSuccess('Успешный вход! Перенаправление...');
                
                // Перенаправляем на дашборд через 1 секунду
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                this.showError(data.message || 'Ошибка авторизации. Проверьте email и пароль.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Ошибка соединения с сервером. Проверьте интернет-соединение.');
        } finally {
            this.setLoadingState(false);
        }
    }

    // Выход из системы
    logout() {
        // Очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Перенаправляем на страницу логина
        window.location.href = 'login.html';
    }

    // Получение текущего пользователя
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    // Получение токена
    getToken() {
        return localStorage.getItem('token');
    }

    // Проверка роли пользователя
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    // Проверка региона пользователя
    hasRegion(region) {
        const user = this.getCurrentUser();
        return user && user.region === region;
    }

    // Проверка валидности email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Установка состояния загрузки
    setLoadingState(isLoading) {
        const loginBtn = document.getElementById('loginBtn');
        if (!loginBtn) return;

        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoading = loginBtn.querySelector('.btn-loading');

        if (isLoading) {
            loginBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';
        } else {
            loginBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    // Показать сообщение об ошибке
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (!errorMessage) return;

        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message';
        
        // Автоматически скрываем ошибку через 5 секунд
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Показать сообщение об успехе
    showSuccess(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (!errorMessage) return;

        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'success-message';
        
        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    // Настройка тестовых аккаунтов
    setupTestAccounts() {
        const urlParams = new URLSearchParams(window.location.search);
        const testUser = urlParams.get('test');
        
        const testAccounts = {
            'admin': { email: 'admin@test.ru', password: '123456' },
            'astrakhan': { email: 'astrakhan@test.ru', password: '123456' },
            'buryatia': { email: 'buryatia@test.ru', password: '123456' },
            'kurgan': { email: 'kurgan@test.ru', password: '123456' },
            'kalmykia': { email: 'kalmykia@test.ru', password: '123456' },
            'mordovia': { email: 'mordovia@test.ru', password: '123456' },
            'udmurtia': { email: 'udmurtia@test.ru', password: '123456' }
        };
        
        if (testUser && testAccounts[testUser]) {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            if (emailInput) emailInput.value = testAccounts[testUser].email;
            if (passwordInput) passwordInput.value = testAccounts[testUser].password;
        }
    }

    // Проверка авторизации для защищенных страниц
    requireAuth() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        
        if (!token || !user) {
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    }

    // Проверка роли для доступа к страницам
    requireRole(requiredRole) {
        if (!this.requireAuth()) return false;
        
        const user = this.getCurrentUser();
        if (user.role !== requiredRole) {
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    }

    // Обновление данных пользователя
    updateUserData(userData) {
        try {
            const currentUser = this.getCurrentUser();
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return true;
        } catch (error) {
            console.error('Error updating user data:', error);
            return false;
        }
    }

    // Проверка срока действия токена
    isTokenExpired() {
        // В реальном приложении здесь была бы проверка JWT токена
        // Для простоты считаем, что токен всегда валиден пока пользователь в системе
        return false;
    }

    // Принудительный выход при истечении токена
    forceLogout() {
        this.logout();
        this.showError('Сессия истекла. Пожалуйста, войдите снова.');
    }
}

// Глобальный экземпляр менеджера авторизации
const authManager = new AuthManager();

// Вспомогательные функции для глобального использования
function getCurrentUser() {
    return authManager.getCurrentUser();
}

function getAuthToken() {
    return authManager.getToken();
}

function isAuthenticated() {
    return !!authManager.getToken();
}

function requireAuth() {
    return authManager.requireAuth();
}

function requireRole(role) {
    return authManager.requireRole(role);
}

function logout() {
    return authManager.logout();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Дополнительная инициализация, если нужна
    console.log('Auth system initialized');
});

// Обработка неавторизованных запросов
window.addEventListener('unauthorized', function() {
    authManager.forceLogout();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthManager,
        getCurrentUser,
        getAuthToken,
        isAuthenticated,
        requireAuth,
        requireRole,
        logout
    };
}
