import { authService } from './auth.js';
import { apiService } from './api.js';
import { cardsManager } from './cards.js';
import { DomUtils, FormatUtils } from './utils.js';

export class Dashboard {
    constructor() {
        this.init();
    }

    async init() {
        // Проверяем авторизацию
        if (!authService.checkPageAccess()) {
            return;
        }

        this.setupEventListeners();
        this.displayUserInfo();
        await this.loadDashboardData();
    }

    setupEventListeners() {
        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authService.logout();
            });
        }

        // Кнопка обновления
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
            });
        }

        // Кнопка повторной попытки
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadDashboardData();
            });
        }
    }

    displayUserInfo() {
        const user = authService.getUser();
        if (!user) return;

        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        const userRegionElement = document.getElementById('userRegion');

        if (userNameElement) {
            userNameElement.textContent = user.name;
        }

        if (userRoleElement) {
            userRoleElement.textContent = user.role === 'accountant' ? 'Бухгалтер' : 'Управляющий';
        }

        if (userRegionElement) {
            userRegionElement.textContent = user.region === 'all' ? 'Все регионы' : user.region;
        }
    }

    async loadDashboardData() {
        this.showLoading();
        this.hideError();
        this.hideCards();

        try {
            // Загружаем карты
            const cards = await apiService.getCards();
            cardsManager.setCards(cards);

            // Фильтруем карты по региону пользователя
            const user = authService.getUser();
            const filteredCards = cardsManager.filterCardsByRegion(user.region);

            // Обновляем статистику
            this.updateStatistics();

            // Показываем карты
            const cardsGrid = document.getElementById('cardsGrid');
            cardsManager.renderCards(cardsGrid);

            this.hideLoading();
            this.showCards();

        } catch (error) {
            console.error('Dashboard loading error:', error);
            this.hideLoading();
            this.showError(error.message);
        }
    }

    updateStatistics() {
        const stats = cardsManager.getStatistics();

        const totalElement = document.getElementById('totalCards');
        const corporateElement = document.getElementById('corporateCards');
        const personalElement = document.getElementById('personalCards');

        if (totalElement) totalElement.textContent = stats.total;
        if (corporateElement) corporateElement.textContent = stats.corporate;
        if (personalElement) personalElement.textContent = stats.personal;
    }

    showLoading() {
        const loadingElement = document.getElementById('loadingMessage');
        DomUtils.showElement(loadingElement);
    }

    hideLoading() {
        const loadingElement = document.getElementById('loadingMessage');
        DomUtils.hideElement(loadingElement);
    }

    showCards() {
        const cardsGrid = document.getElementById('cardsGrid');
        DomUtils.showElement(cardsGrid);
    }

    hideCards() {
        const cardsGrid = document.getElementById('cardsGrid');
        DomUtils.hideElement(cardsGrid);

        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            DomUtils.hideElement(emptyState);
        }
    }

    showError(message) {
        const errorContainer = document.getElementById('errorContainer');
        const errorMessage = document.getElementById('errorMessage');

        if (errorMessage) {
            errorMessage.textContent = message;
        }

        if (errorContainer) {
            DomUtils.showElement(errorContainer);
        }
    }

    hideError() {
        const errorContainer = document.getElementById('errorContainer');
        DomUtils.hideElement(errorContainer);
    }
}

// Инициализация дашборда когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});
