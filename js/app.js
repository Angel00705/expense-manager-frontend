document.addEventListener('DOMContentLoaded', function() {
    console.log('App loaded');
    
    if (window.location.pathname.includes('login.html')) {
        setupLoginPage();
    }
});

function setupLoginPage() {
    if (Auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    if (!email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Вход...';
    
    try {
        const success = await Auth.login(email, password);
        
        if (success) {
            window.location.href = 'dashboard.html';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти в систему';
        }
    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Войти в систему';
    }
}
