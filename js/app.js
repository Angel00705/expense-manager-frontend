// app.js - Основная логика приложения
console.log('🚀 app.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Login page loaded');
    
    // Проверяем если пользователь уже авторизован
    if (Auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Настраиваем форму входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Автозаполнение для тестирования
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('focus', function() {
            if (!this.value) {
                this.value = 'admin@test.ru';
            }
        });
    }
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('focus', function() {
            if (!this.value) {
                this.value = '123456';
            }
        });
    }
});

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    if (!email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Показываем загрузку
    submitBtn.disabled = true;
    submitBtn.textContent = 'Вход...';
    
    try {
        const success = await Auth.login(email, password);
        
        if (success) {
            console.log('✅ Login successful, redirecting...');
            window.location.href = 'dashboard.html';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти';
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Войти';
    }
}
