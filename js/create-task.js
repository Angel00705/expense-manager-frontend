// create-task.js - Simple version
console.log('create-task.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready');
    
    // Basic event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    // Form submission
    const form = document.getElementById('taskForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Форма отправлена! В реальной системе здесь будет создание задачи.');
            window.location.href = 'dashboard.html';
        });
    }
    
    // Region change
    const regionSelect = document.getElementById('region');
    if (regionSelect) {
        regionSelect.addEventListener('change', function() {
            console.log('Region changed:', this.value);
        });
    }
    
    console.log('All event listeners set');
});
