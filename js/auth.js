class Auth {
    static async login(email, password) {
        try {
            const result = await API.login({ email, password });
            
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                return true;
            }
        } catch (error) {
            console.error('Login failed:', error);
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

window.Auth = Auth;
