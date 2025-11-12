// ===== CARDS FUNCTIONALITY =====
let allCards = [];

function loadCards() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // ПРОВЕРЯЕМ: если есть реальные данные - используем их, иначе демо
    if (typeof REAL_CARDS_DATA !== 'undefined' && REAL_CARDS_DATA.length > 0) {
        console.log('✅ Загружаем РЕАЛЬНЫЕ данные карт');
        allCards = convertRealCardsToAppFormat();
    } else {
        console.log('⚠️ Используем демо-данные карт');
        allCards = getDemoCards();
    }
    
    saveCards();
    updateStatistics();
    renderCards();
}

// Функция для преобразования реальных данных в формат приложения
function convertRealCardsToAppFormat() {
    const cards = [];
    let cardId = 1;

    REAL_CARDS_DATA.forEach(ip => {
        // Обрабатываем корпоративные карты
        if (ip.corpCard && ip.corpCard !== '-' && ip.corpCard !== '--' && ip.corpCard !== '') {
            cards.push({
                id: `card-${cardId++}`,
                number: ip.corpCard,
                holder: ip.ipName,
                bank: getBankByRegion(ip.region),
                balance: Math.floor(Math.random() * 50000) + 10000,
                regions: [ip.region],
                status: getCardStatus(ip.corpStatus),
                type: '💳 Корп.'
            });
        }

        // Обрабатываем персональные карты
        if (ip.personalCard && ip.personalCard !== '-' && ip.personalCard !== '--' && ip.personalCard !== '') {
            cards.push({
                id: `card-${cardId++}`,
                number: ip.personalCard,
                holder: ip.ipName,
                bank: getBankByRegion(ip.region),
                balance: Math.floor(Math.random() * 30000) + 5000,
                regions: [ip.region],
                status: getCardStatus(ip.personalStatus),
                type: '💳 Физ.'
            });
        }
    });

    console.log(`🔄 Преобразовано ${cards.length} карт из реальных данных`);
    return cards;
}

// Функция для определения банка по региону
function getBankByRegion(region) {
    const bankMap = {
        'Астрахань': 'Тинькофф',
        'Бурятия': 'Сбербанк', 
        'Курган': 'ВТБ',
        'Калмыкия': 'Альфа-Банк',
        'Мордовия': 'Газпромбанк',
        'Удмуртия': 'Райффайзенбанк'
    };
    
    return bankMap[region] || 'Тинькофф';
}

// Функция для преобразования статусов из CSV
function getCardStatus(statusText) {
    const statusMap = {
        'в регионе': 'active',
        'В ПВЗ Наливайко': 'active', 
        'В ПВЗ Овсейко': 'active',
        'В ПВЗ Леонгард': 'active',
        'В ПВЗ Емельянов': 'active',
        'В ПВЗ Шефер': 'active',
        'Перевыпустить': 'blocked',
        'У Никиты Р.': 'active',
        '': 'inactive',
        '-': 'inactive',
        '--': 'inactive'
    };
    
    return statusMap[statusText] || 'inactive';
}

// Старые демо-данные (на всякий случай)
function getDemoCards() {
    return [
        {
            id: '1',
            number: '5536 9138 2356 2847',
            holder: 'ИП ПЕТРОВ А.С.',
            bank: 'Тинькофф',
            balance: 150000,
            regions: ['Астрахань'],
            status: 'active',
            type: '💳 Корп.'
        }
    ];
}

function updateStatistics(cards = null) {
    const cardsToCount = cards || allCards;
    const totalCards = cardsToCount.length;
    const activeCards = cardsToCount.filter(card => card.status === 'active').length;
    const totalBalance = cardsToCount.reduce((sum, card) => sum + (parseFloat(card.balance) || 0), 0);
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('activeCards').textContent = activeCards;
    document.getElementById('totalBalance').textContent = totalBalance.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('coveredRegions').textContent = new Set(cardsToCount.map(card => card.regions[0])).size;
}

function renderCards(filteredCards = null) {
    const cardsGrid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');
    const cardsToShow = filteredCards || allCards;
    
    if (cardsToShow.length === 0) {
        cardsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    cardsGrid.innerHTML = cardsToShow.map(card => `
        <div class="card-item">
            <div class="card-header">
                <div>
                    <div class="card-type">${card.type}</div>
                    <div class="card-number">${formatCardNumber(card.number)}</div>
                </div>
                <div class="card-status status-${card.status}">
                    ${getStatusText(card.status)}
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
                <div class="detail-label">Регион</div>
                <div class="regions-list">
                    <span class="region-tag">${card.regions[0]}</span>
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

// Функция для текстового отображения статуса
function getStatusText(status) {
    const statusTexts = {
        'active': 'Активна',
        'inactive': 'Неактивна', 
        'blocked': 'Заблокирована'
    };
    return statusTexts[status] || 'Неизвестно';
}

function formatCardNumber(number) {
    // Для номеров вида *3420 - не форматируем
    if (number.startsWith('*')) {
        return number;
    }
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
    document.getElementById('cardRegion').value = card.regions[0];
    document.getElementById('cardType').value = card.type.includes('Корп.') ? 'corporate' : 'personal';
    
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
    const cardType = document.getElementById('cardType').value;
    
    const cardData = {
        number: document.getElementById('cardNumber').value,
        holder: document.getElementById('cardHolder').value,
        bank: document.getElementById('cardBank').value,
        balance: parseFloat(document.getElementById('cardBalance').value),
        regions: [document.getElementById('cardRegion').value],
        status: document.getElementById('cardStatus').value,
        type: cardType === 'corporate' ? '💳 Корп.' : '💳 Физ.'
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

// ФУНКЦИИ ФИЛЬТРАЦИИ
function filterCards() {
    const regionFilter = document.getElementById('filterRegion').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const searchFilter = document.getElementById('searchCards').value.toLowerCase();
    
    let filtered = allCards;
    
    // Фильтр по региону
    if (regionFilter) {
        filtered = filtered.filter(card => card.regions[0] === regionFilter);
    }
    
    // Фильтр по статусу
    if (statusFilter) {
        filtered = filtered.filter(card => card.status === statusFilter);
    }
    
    // Поиск по номеру карты или ИП
    if (searchFilter) {
        filtered = filtered.filter(card => 
            card.number.toLowerCase().includes(searchFilter) ||
            card.holder.toLowerCase().includes(searchFilter)
        );
    }
    
    renderCards(filtered);
    updateStatistics(filtered);
}

// Сбрасываем фильтры
function resetFilters() {
    document.getElementById('filterRegion').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('searchCards').value = '';
    renderCards();
    updateStatistics();
}

// Закрытие модального окна при клике вне его
document.getElementById('cardModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCardModal();
    }
});

// Инициализация
document.addEventListener('DOMContentLoaded', loadCards);