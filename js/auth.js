class Auth {
    static async login(email, password) {
        try {
            const result = await API.login({email, password});
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                return true;
            }
        } catch (error) {
            alert('Ошибка входа: ' + error.message);
        }
        return false;
    }
    
    static logout() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
    
    static isLoggedIn() {
        return !!localStorage.getItem('token');
    }
}
window.Auth = Auth;
