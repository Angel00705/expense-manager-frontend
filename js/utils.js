import { API_CONFIG } from './config/constants.js';

// Утилиты для работы с API
export class ApiUtils {
    static async checkApiHealth() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.ok;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }

    static async makeApiRequest(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }
}

// Утилиты для работы с DOM
export class DomUtils {
    static showElement(element) {
        if (element) element.style.display = 'block';
    }

    static hideElement(element) {
        if (element) element.style.display = 'none';
    }

    static setText(element, text) {
        if (element) element.textContent = text;
    }

    static enableButton(button) {
        if (button) {
            button.disabled = false;
            button.innerHTML = button.getAttribute('data-original-text') || button.innerHTML;
        }
    }

    static disableButton(button, loadingText = 'Загрузка...') {
        if (button) {
            button.setAttribute('data-original-text', button.innerHTML);
            button.disabled = true;
            button.innerHTML = loadingText;
        }
    }

    static showError(message, container) {
        if (container) {
            container.textContent = message;
            container.classList.add('show');
        }
    }

    static hideError(container) {
        if (container) {
            container.classList.remove('show');
        }
    }
}

// Утилиты для форматирования
export class FormatUtils {
    static formatCardNumber(number) {
        if (!number) return '';
        return number.replace(/(\d{4})/g, '$1 ').trim();
    }

    static formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    static formatCurrency(amount) {
        if (amount === null || amount === undefined) return '';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    }

    static capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}

// Утилиты для валидации
export class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password) {
        return password && password.length >= 6;
    }
}
static async testAPI() {
    console.log('🧪 Testing API connection...');
    
    try {
        // Test health endpoint
        const health = await API.getHealth();
        console.log('✅ Health check:', health);
        
        // Test regions
        const regions = await API.getRegions();
        console.log('✅ Regions:', regions);
        
        // Test expense items
        const items = await API.getExpenseItems();
        console.log('✅ Expense items:', items);
        
        return true;
    } catch (error) {
        console.error('❌ API test failed:', error);
        return false;
    }
}
