// ===== NAVBAR UTILITIES =====
function initializeNavbar() {
    // Проверяем авторизацию
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || !currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Обновляем информацию пользователя в навбаре
    updateUserInfo(currentUser);
    
    // Отмечаем активную страницу
    highlightActivePage();
    
    // Инициализируем мобильное меню
    initMobileMenu();
}

function updateUserInfo(user) {
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = user.role === 'admin' ? 'Администратор' : 'Менеджер';
    }
}

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.navbar-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-open');
        });
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}

// Инициализируем навбар при загрузке
document.addEventListener('DOMContentLoaded', initializeNavbar);