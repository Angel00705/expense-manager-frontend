// ===== CARDS FUNCTIONALITY =====
let allCards = [];

function loadCards() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Загружаем карты
    allCards = JSON.parse(localStorage.getItem('cards')) || [];
    
    // Если карт нет, создаем демо-данные
    if (allCards.length === 0) {
        allCards = getDemoCards();
        saveCards();
    }
    
    updateStatistics();
    renderCards();
}

function getDemoCards() {
    return [
        {
            id: '1',
            number: '5536 9138 2356 2847',
            holder: 'ИП ПЕТРОВ А.С.',
            bank: 'Тинькофф',
            balance: 150000,
            regions: ['Астрахань', 'Бурятия'],
            status: 'active',
            type: '💳'
        },
        {
            id: '2', 
            number: '4276 3800 1234 5678',
            holder: 'ИП СИДОРОВ В.К.',
            bank: 'Сбербанк',
            balance: 75000,
            regions: ['Курган', 'Калмыкия'],
            status: 'active',
            type: '💳'
        },
        {
            id: '3',
            number: '5200 8282 8282 8210',
            holder: 'ИП ИВАНОВА М.П.',
            bank: 'Альфа-Банк',
            balance: 230000,
            regions: ['Мордовия', 'Удмуртия'],
            status: 'active',
            type: '💳'
        }
    ];
}

function updateStatistics() {
    const totalCards = allCards.length;
    const activeCards = allCards.filter(card => card.status === 'active').length;
    const totalBalance = allCards.reduce((sum, card) => sum + (parseFloat(card.balance) || 0), 0);
    
    // Уникальные регионы с картами
    const allRegions = new Set();
    allCards.forEach(card => {
        card.regions.forEach(region => allRegions.add(region));
    });
    const coveredRegions = allRegions.size;
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('activeCards').textContent = activeCards;
    document.getElementById('totalBalance').textContent = totalBalance.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('coveredRegions').textContent = coveredRegions;
}

function renderCards() {
    const cardsGrid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (allCards.length === 0) {
        cardsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    cardsGrid.innerHTML = allCards.map(card => `
        <div class="card-item">
            <div class="card-header">
                <div>
                    <div class="card-type">${card.type}</div>
                    <div class="card-number">${formatCardNumber(card.number)}</div>
                </div>
                <div class="card-status status-${card.status}">
                    ${card.status === 'active' ? 'Активна' : 'Неактивна'}
                </div>
            </div>
            
            <div class="card-details">
                <div class="card-detail">
                    <div class="detail-label">Держатель</div>
                    <div class="detail-value">${card.holder}</div>
                </div>
                <div class="card-detail">
                    <div class="detail-label">Банк</div>
                    <div class="detail-value">${card.bank}</div>
                </div>
            </div>
            
            <div class="card-balance">
                <div class="balance-label">Текущий баланс</div>
                <div class="balance-amount">${parseFloat(card.balance || 0).toLocaleString('ru-RU')} ₽</div>
            </div>
            
            <div class="card-detail">
                <div class="detail-label">Регионы</div>
                <div class="regions-list">
                    ${card.regions.map(region => `
                        <span class="region-tag">${region}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="card-footer">
                <div class="card-actions">
                    <button class="btn-icon edit" onclick="editCard('${card.id}')" title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn-icon delete" onclick="deleteCard('${card.id}')" title="Удалить">
                        🗑️
                    </button>
                </div>
                <div class="card-meta">
                    <div class="detail-label">ID: ${card.id}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function formatCardNumber(number) {
    return number.replace(/(\d{4})/g, '$1 ').trim();
}

function openAddCardModal() {
    document.getElementById('modalTitle').textContent = 'Добавить карту';
    document.getElementById('cardForm').reset();
    document.getElementById('cardId').value = '';
    document.getElementById('cardModal').classList.add('show');
}

function closeCardModal() {
    document.getElementById('cardModal').classList.remove('show');
}

function editCard(cardId) {
    const card = allCards.find(c => c.id === cardId);
    if (!card) return;
    
    document.getElementById('modalTitle').textContent = 'Редактировать карту';
    document.getElementById('cardId').value = card.id;
    document.getElementById('cardNumber').value = card.number;
    document.getElementById('cardHolder').value = card.holder;
    document.getElementById('cardBank').value = card.bank;
    document.getElementById('cardBalance').value = card.balance;
    document.getElementById('cardStatus').value = card.status;
    
    // Устанавливаем выбранные регионы
    const regionsSelect = document.getElementById('cardRegions');
    Array.from(regionsSelect.options).forEach(option => {
        option.selected = card.regions.includes(option.value);
    });
    
    document.getElementById('cardModal').classList.add('show');
}

function deleteCard(cardId) {
    if (confirm('Удалить эту карту?')) {
        allCards = allCards.filter(card => card.id !== cardId);
        saveCards();
        updateStatistics();
        renderCards();
    }
}

// Обработчик формы
document.getElementById('cardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cardId = document.getElementById('cardId').value;
    const cardData = {
        number: document.getElementById('cardNumber').value,
        holder: document.getElementById('cardHolder').value,
        bank: document.getElementById('cardBank').value,
        balance: parseFloat(document.getElementById('cardBalance').value),
        regions: Array.from(document.getElementById('cardRegions').selectedOptions).map(opt => opt.value),
        status: document.getElementById('cardStatus').value,
        type: '💳'
    };
    
    if (cardId) {
        // Редактирование существующей карты
        const index = allCards.findIndex(card => card.id === cardId);
        if (index !== -1) {
            allCards[index] = { ...allCards[index], ...cardData };
        }
    } else {
        // Добавление новой карты
        cardData.id = Date.now().toString();
        allCards.push(cardData);
    }
    
    saveCards();
    updateStatistics();
    renderCards();
    closeCardModal();
});

function saveCards() {
    localStorage.setItem('cards', JSON.stringify(allCards));
}

// Закрытие модального окна при клике вне его
document.getElementById('cardModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCardModal();
    }
});

// Инициализация
document.addEventListener('DOMContentLoaded', loadCards);