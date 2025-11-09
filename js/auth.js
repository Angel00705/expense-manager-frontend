// auth.js - minimal working version
class Auth {
    static login(email, password) {
        console.log('Login attempt:', email);
        return Promise.resolve(true);
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
