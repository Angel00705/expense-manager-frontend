const API = {
    BASE_URL: 'https://expense-manager-backend-kq9h.onrender.com',
    
    async request(endpoint, options) {
        const url = this.BASE_URL + endpoint;
        const token = localStorage.getItem('token');
        const config = {
            method: options.method,
            headers: {'Content-Type':'application/json'}
        };
        if (token) config.headers.Authorization = 'Bearer ' + token;
        if (options.body) config.body = JSON.stringify(options.body);
        const response = await fetch(url, config);
        return response.json();
    },
    
    login(credentials) {
        return this.request('/api/auth/login', {method:'POST', body:credentials});
    }
};
window.API = API;
