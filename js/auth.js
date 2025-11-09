// js/auth.js - Simple Auth
console.log('🔐 auth.js loaded');

class Auth {
    static async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            const result = await API.login({ email, password });
            
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                console.log('✅ Login successful');
                return true;
            }
        } catch (error) {
            console.error('❌ Login failed:', error);
            alert('Ошибка входа: ' + error.message);
        }
        return false;
    }
    
    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
    
    static getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
    
    static isLoggedIn() {
        return !!localStorage.getItem('token');
    }
    
    static requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Глобально доступно
window.Auth = Auth;
console.log('✅ Auth initialized');
