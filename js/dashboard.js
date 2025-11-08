import { API_CONFIG } from './config/constants.js';
import { FormatUtils, DomUtils } from './utils.js';

export class CardsManager {
    constructor() {
        this.cards = [];
        this.filteredCards = [];
    }

    setCards(cards) {
        this.cards = cards;
        this.filteredCards = [...cards];
    }

    filterCardsByRegion(region) {
        if (region === 'all') {
            this.filteredCards = [...this.cards];
        } else {
            this.filteredCards = this.cards.filter(card => 
                card.region === region
            );
        }
        return this.filteredCards;
    }

    getStatistics() {
        const total = this.filteredCards.length;
        const corporate = this.filteredCards.filter(card => card.type === 'corp').length;
        const personal = this.filteredCards.filter(card => card.type === 'personal').length;

        return {
            total,
            corporate,
            personal
        };
    }

    renderCards(container) {
        if (!container) return;

        if (this.filteredCards.length === 0) {
            this.showEmptyState(container);
            return;
        }

        const cardsHTML = this.filteredCards.map(card => this.createCardHTML(card)).join('');
        container.innerHTML = cardsHTML;
        DomUtils.showElement(container);
    }

    createCardHTML(card) {
        const statusClass = this.getStatusClass(card.status);
        const cardNumber = FormatUtils.formatCardNumber(card.cardNumber);
        const expiryDate = FormatUtils.formatDate(card.expiryDate);
        const limit = FormatUtils.formatCurrency(card.limit);
        const balance = FormatUtils.formatCurrency(card.balance);

        return `
            <div class="card-item" data-card-id="${card.id}">
                <div class="card-header">
                    <div class="card-title">
                        <h4>${card.name}</h4>
                        <span class="card-type ${card.type}">
                            ${card.type === 'corp' ? 'Корпоративная' : 'Персональная'}
                        </span>
                    </div>
                    <div class="card-status ${statusClass}">
                        ${this.getStatusText(card.status)}
                    </div>
                </div>
                
                <div class="card-details">
                    <div class="detail-item">
                        <span class="detail-label">Номер карты:</span>
                        <span class="detail-value small">${cardNumber}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">ИП:</span>
                        <span class="detail-value">${card.ipName}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Регион:</span>
                        <span class="detail-value">${card.region}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Срок действия:</span>
                        <span class="detail-value">${expiryDate}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Лимит:</span>
                        <span class="detail-value">${limit}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Баланс:</span>
                        <span class="detail-value">${balance}</span>
                    </div>
                </div>
                
                ${this.createMonthStatusHTML(card.monthStatus)}
            </div>
        `;
    }

    createMonthStatusHTML(monthStatus) {
        if (!monthStatus || Object.keys(monthStatus).length === 0) {
            return '';
        }

        const months = Object.entries(monthStatus)
            .slice(0, 3) // Показываем только последние 3 месяца
            .map(([month, status]) => `
                <div class="month-status">
                    <strong>${month}:</strong>
                    <span>${status}</span>
                </div>
            `).join('');

        return `<div class="month-status-container">${months}</div>`;
    }

    getStatusClass(status) {
        const statusMap = {
            [CARD_STATUS.IN_REGION]: 'status-active',
            [CARD_STATUS.IN_PVZ]: 'status-warning',
            [CARD_STATUS.RENEW]: 'status-error'
        };
        return statusMap[status] || 'status-default';
    }

    getStatusText(status) {
        const statusTextMap = {
            [CARD_STATUS.IN_REGION]: 'В регионе',
            [CARD_STATUS.IN_PVZ]: 'В ПВЗ',
            [CARD_STATUS.RENEW]: 'Перевыпустить'
        };
        return statusTextMap[status] || status;
    }

    showEmptyState(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <h3>Карты не найдены</h3>
                <p>Для выбранного региона нет доступных карт</p>
            </div>
        `;
        DomUtils.showElement(container);
    }

    // Поиск карт
    searchCards(query) {
        if (!query.trim()) {
            this.filteredCards = [...this.cards];
            return this.filteredCards;
        }

        const lowerQuery = query.toLowerCase();
        this.filteredCards = this.cards.filter(card =>
            card.name.toLowerCase().includes(lowerQuery) ||
            card.ipName.toLowerCase().includes(lowerQuery) ||
            card.cardNumber.includes(lowerQuery) ||
            card.region.toLowerCase().includes(lowerQuery)
        );

        return this.filteredCards;
    }

    // Сортировка карт
    sortCards(field, direction = 'asc') {
        this.filteredCards.sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];

            if (field === 'limit' || field === 'balance') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            } else if (field === 'expiryDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else {
                aValue = String(aValue || '').toLowerCase();
                bValue = String(bValue || '').toLowerCase();
            }

            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return this.filteredCards;
    }
}

// Глобальный экземпляр CardsManager
export const cardsManager = new CardsManager();
