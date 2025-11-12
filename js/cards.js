// ===== CARDS FUNCTIONALITY =====
// ===== CARDS FUNCTIONALITY =====
let allCards = [];

function loadCards() {
    console.log('🔄 Начинаем загрузку карт...');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        console.log('❌ Пользователь не авторизован');
        return;
    }

    if (typeof REAL_CARDS_DATA !== 'undefined' && REAL_CARDS_DATA.length > 0) {
        console.log('✅ Загружаем РЕАЛЬНЫЕ данные карт из CSV');
        allCards = convertRealCardsToAppFormat();
    } else {
        console.log('❌ Реальные данные не найдены');
        allCards = [];
    }
    
    // Инициализируем регионы и статусы в формах
    populateRegionsInForm();
    populateStatusesInForm();
    populateStatusesInFilter();
    saveCards();
    updateStatistics();
    renderCards();
    populateIPsInForm();
    populateBanksInForm();
    
    console.log(`✅ Загружено ${allCards.length} карт`);
}

// Функция для заполнения списка статусов в форме добавления/редактирования
function populateStatusesInForm() {
    const statusSelect = document.getElementById('cardStatus');
    
    // Очищаем существующие опции
    statusSelect.innerHTML = '<option value="">Выберите статус</option>';
    
    // Уникальные статусы (убрали дублирование)
    const statuses = [
        { value: 'в регионе', text: '📍 В регионе' },
        { value: 'В ПВЗ Наливайко', text: '🏢 В ПВЗ Наливайко' },
        { value: 'В ПВЗ Овсейко', text: '🏢 В ПВЗ Овсейко' },
        { value: 'В ПВЗ Леонгард', text: '🏢 В ПВЗ Леонгард' },
        { value: 'В ПВЗ Емельянов', text: '🏢 В ПВЗ Емельянов' },
        { value: 'В ПВЗ Шефер', text: '🏢 В ПВЗ Шефер' },
        { value: 'У Никиты Р.', text: '👤 У Никиты Р.' },
        { value: 'Перевыпустить', text: '🔄 Перевыпустить' },
        { value: 'active', text: '✅ Активна' },
        { value: 'inactive', text: '❌ Неактивна' },
        { value: 'blocked', text: '🚫 Заблокирована' }
    ];
    
    // Добавляем статусы в выпадающий список
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.value;
        option.textContent = status.text;
        statusSelect.appendChild(option);
    });
    
    console.log(`✅ Добавлено ${statuses.length} статусов в форму`);
}

// Функция для заполнения списка статусов в фильтре
function populateStatusesInFilter() {
    const statusFilter = document.getElementById('filterStatus');
    
    // Очищаем существующие опции (кроме первой)
    while (statusFilter.options.length > 1) {
        statusFilter.remove(1);
    }
    
    // Все возможные статусы для фильтра
    const statuses = [
        { value: '', text: 'Все статусы' },
        { value: 'active', text: '✅ Активна' },
        { value: 'inactive', text: '❌ Неактивна' },
        { value: 'blocked', text: '🚫 Заблокирована' },
        { value: 'в регионе', text: '📍 В регионе' },
        { value: 'В ПВЗ Наливайко', text: '🏢 В ПВЗ Наливайко' },
        { value: 'В ПВЗ Овсейко', text: '🏢 В ПВЗ Овсейко' },
        { value: 'В ПВЗ Леонгард', text: '🏢 В ПВЗ Леонгард' },
        { value: 'В ПВЗ Емельянов', text: '🏢 В ПВЗ Емельянов' },
        { value: 'В ПВЗ Шефер', text: '🏢 В ПВЗ Шефер' },
        { value: 'У Никиты Р.', text: '👤 У Никиты Р.' },
        { value: 'Перевыпустить', text: '🔄 Перевыпустить' }
    ];
    
    // Добавляем статусы в фильтр (начиная с индекса 1)
    statuses.forEach((status, index) => {
        if (index > 0) { // Пропускаем первую опцию "Все статусы"
            const option = document.createElement('option');
            option.value = status.value;
            option.textContent = status.text;
            statusFilter.appendChild(option);
        }
    });
    
    console.log(`✅ Добавлено ${statuses.length - 1} статусов в фильтр`);
}

// Функция для заполнения списка регионов в форме
function populateRegionsInForm() {
    const regionSelect = document.getElementById('cardRegion');
    
    // Очищаем существующие опции
    regionSelect.innerHTML = '<option value="">Выберите регион</option>';
    
    // Уникальные регионы из реальных данных
    const uniqueRegions = [...new Set(REAL_CARDS_DATA.map(ip => getCorrectRegionForIP(ip)))].filter(region => region);
    
    // Основные регионы
    const regions = [
        'Астрахань',
        'Бурятия', 
        'Курган',
        'Калмыкия',
        'Мордовия',
        'Удмуртия',
        'Общий'
    ];
    
    // Объединяем и убираем дубликаты
    const allRegions = [...new Set([...regions, ...uniqueRegions])];
    
    // Добавляем регионы в выпадающий список
    allRegions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
    
    console.log(`✅ Добавлено ${allRegions.length} регионов в форму`);
}

// Функция для заполнения списка ИП в форме добавления карты
function populateIPsInForm() {
    const cardHolderSelect = document.getElementById('cardHolder');
    
    // Очищаем существующие опции
    cardHolderSelect.innerHTML = '<option value="">Выберите ИП</option>';
    
    // Сортируем ИП по имени для удобства
    const sortedIPs = [...REAL_CARDS_DATA].sort((a, b) => a.ipName.localeCompare(b.ipName));
    
    // Добавляем ИП из реальных данных
    sortedIPs.forEach(ip => {
        const option = document.createElement('option');
        option.value = ip.ipName;
        option.textContent = normalizeIPName(ip.ipName);
        cardHolderSelect.appendChild(option);
    });
    
    console.log(`✅ Добавлено ${REAL_CARDS_DATA.length} ИП в форму`);
}

// Функция для нормализации имени ИП (убираем лишние пробелы, точки)
function normalizeIPName(ipName) {
    if (!ipName) return '';
    
    return ipName
        .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
        .replace(/\s*\.\s*/g, '. ') // Форматируем точки
        .trim();
}

// Функция для заполнения списка банков в форме
function populateBanksInForm() {
    const cardBankSelect = document.getElementById('cardBank');
    
    // Очищаем существующие опции
    cardBankSelect.innerHTML = '<option value="">Выберите банк</option>';
    
    // Основные банки для выбора
    const banks = [
        'Модульбанк',
        'Сбербанк', 
        'ВТБ',
        'Альфа-Банк',
        'Газпромбанк',
        'Райффайзенбанк',
        'Т-Банк',
        'Открытие',
        'Россельхозбанк',
        'Промсвязьбанк',
        'Совкомбанк',
      ];
    
    // Добавляем банки в выпадающий список
    banks.forEach(bank => {
        const option = document.createElement('option');
        option.value = bank;
        option.textContent = bank;
        cardBankSelect.appendChild(option);
    });
    
    console.log(`✅ Добавлено ${banks.length} банков в форму`);
}

// Функция для преобразования реальных CSV данных в формат приложения
function convertRealCardsToAppFormat() {
    const cards = [];
    let cardId = 1;

    console.log('🔄 Преобразуем реальные данные CSV в формат приложения...');

    REAL_CARDS_DATA.forEach(ip => {
        // Получаем корректный регион для ИП
        const region = getCorrectRegionForIP(ip);
        
        // Обрабатываем корпоративные карты
        if (ip.corpCard && ip.corpCard !== '-' && ip.corpCard !== '--' && ip.corpCard !== '') {
            cards.push({
                id: `card-${cardId++}`,
                number: ip.corpCard,
                holder: ip.ipName,
                bank: 'Тинькофф', // По умолчанию
                balance: Math.floor(Math.random() * 50000) + 10000,
                regions: [region],
                status: ip.corpStatus || 'inactive',
                type: '💳 Корп.'
            });
            
            console.log(`➕ Добавлена корп. карта: ${ip.corpCard} для ${ip.ipName}`);
        }

        // Обрабатываем персональные карты
        if (ip.personalCard && ip.personalCard !== '-' && ip.personalCard !== '--' && ip.personalCard !== '') {
            cards.push({
                id: `card-${cardId++}`,
                number: ip.personalCard,
                holder: ip.ipName,
                bank: 'Тинькофф', // По умолчанию
                balance: Math.floor(Math.random() * 30000) + 5000,
                regions: [region],
                status: ip.personalStatus || 'inactive',
                type: '💳 Физ.'
            });
            
            console.log(`➕ Добавлена физ. карта: ${ip.personalCard} для ${ip.ipName}`);
        }
    });

    console.log(`✅ Преобразовано ${cards.length} карт из реальных данных`);
    return cards;
}

// Функция для определения корректного региона для ИП
function getCorrectRegionForIP(ip) {
    // Если у ИП явно указан регион - используем его
    if (ip.region && ip.region.trim() !== '' && ip.region !== '-') {
        return ip.region.split(' (')[0];
    }
    
    // Ищем регион по имени ИП в других записях
    const ipWithRegion = REAL_CARDS_DATA.find(item => 
        item.ipName === ip.ipName && item.region && item.region.trim() !== '' && item.region !== '-'
    );
    
    if (ipWithRegion) {
        return ipWithRegion.region.split(' (')[0];
    }
    
    // Карта регионов по ИП
    const regionMap = {
        'ИП Крутоусов': 'Астрахань',
        'ИП Храмова': 'Астрахань',
        'ИП Янгалышева А.': 'Астрахань',
        'ИП НАЛИВАЙКО': 'Астрахань',
        'ИП КАШИРИН В.Г.': 'Астрахань',
        'ИП Астанови Араз': 'Бурятия',
        'ИП Пинегин': 'Бурятия',
        'ИП Ровда А.Ю.': 'Бурятия',
        'ИП ИЛЬЕНКО': 'Бурятия',
        'ИП Бондаренко Л.И.': 'Курган',
        'ИП Бобков': 'Курган',
        'ИП Дюльгер': 'Курган',
        'ИП Федчук': 'Курган',
        'ИП КАРБЫШЕВ': 'Курган',
        'ИП ОВСЕЙКО': 'Курган',
        'ИП РЯБЕНКО И.И': 'Курган',
        'ИП Ибрагимов Ш': 'Калмыкия',
        'ИП Никифорова': 'Калмыкия',
        'ИП Ярославцев Г.В.': 'Калмыкия',
        'ИП Иванов': 'Мордовия',
        'ИП Коротких': 'Мордовия',
        'ИП Яковлева': 'Мордовия',
        'ИП Бадалов': 'Удмуртия',
        'ИП Емельянов Г. И.': 'Удмуртия',
        'ИП Леонгард': 'Удмуртия',
        'ИП Саинова': 'Удмуртия',
        'ИП Самсонов А.Д.': 'Удмуртия',
        'ИП Шефер': 'Удмуртия'
    };
    
    return regionMap[ip.ipName] || 'Общий';
}

// Функция для получения текстового отображения статуса
function getStatusText(status) {
    const statusMap = {
        'в регионе': 'в регионе',
        'В ПВЗ Наливайко': 'В ПВЗ Наливайко',
        'В ПВЗ Овсейко': 'В ПВЗ Овсейко', 
        'В ПВЗ Леонгард': 'В ПВЗ Леонгард',
        'В ПВЗ Емельянов': 'В ПВЗ Емельянов',
        'В ПВЗ Шефер': 'В ПВЗ Шефер',
        'У Никиты Р.': 'У Никиты Р.',
        'Перевыпустить': 'Перевыпустить',
        'inactive': 'Неактивна',
        'active': 'Активна',
        'blocked': 'Заблокирована'
    };
    
    return statusMap[status] || status || 'Неизвестно';
}

// Функция для получения CSS класса статуса
function getStatusClass(status) {
    const statusClassMap = {
        'в регионе': 'status-в-регионе',
        'В ПВЗ Наливайко': 'status-в-пвз',
        'В ПВЗ Овсейко': 'status-в-пвз',
        'В ПВЗ Леонгард': 'status-в-пвз',
        'В ПВЗ Емельянов': 'status-в-пвз',
        'В ПВЗ Шефер': 'status-в-пвз',
        'У Никиты Р.': 'status-у-никиты',
        'Перевыпустить': 'status-перевыпустить',
        'inactive': 'status-inactive',
        'active': 'status-active',
        'blocked': 'status-blocked'
    };
    
    return statusClassMap[status] || 'status-inactive';
}

// Функция обновления статистики
function updateStatistics(cards = null) {
    const cardsToCount = cards || allCards;
    const totalCards = cardsToCount.length;
    
    const activeCards = cardsToCount.filter(card => 
        card.status !== 'inactive' && card.status !== '' && card.status !== '-' && card.status !== '--'
    ).length;
    
    const totalBalance = cardsToCount.reduce((sum, card) => sum + (parseFloat(card.balance) || 0), 0);
    
    const uniqueRegions = new Set();
    cardsToCount.forEach(card => {
        if (card.regions[0] && card.regions[0] !== 'Общий') {
            uniqueRegions.add(card.regions[0]);
        }
    });
    const coveredRegions = uniqueRegions.size;
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('activeCards').textContent = activeCards;
    document.getElementById('totalBalance').textContent = totalBalance.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('coveredRegions').textContent = coveredRegions;
    
    console.log(`📊 Статистика обновлена: ${totalCards} карт, ${activeCards} активных, ${coveredRegions} регионов`);
}

// Основная функция отображения карт
function renderCards(filteredCards = null) {
    const cardsGrid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');
    const cardsToShow = filteredCards || allCards;
    
    console.log(`🔄 Отображаем ${cardsToShow.length} карт...`);
    
    if (cardsToShow.length === 0) {
        cardsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        console.log('ℹ️ Нет карт для отображения');
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
                <div class="card-status ${getStatusClass(card.status)}">
                    ${getStatusText(card.status)}
                </div>
            </div>
            
            <div class="card-details">
                <div class="card-detail">
                    <div class="detail-label">Держатель</div>
                    <div class="detail-value">${normalizeIPName(card.holder)}</div>
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
    
    console.log('✅ Карты успешно отображены');
}

// Функция форматирования номера карты
function formatCardNumber(number) {
    if (number.startsWith('*')) {
        return number;
    }
    return number.replace(/(\d{4})/g, '$1 ').trim();
}

// Функция автозаполнения региона при выборе ИП
function autoFillRegion() {
    const holder = document.getElementById('cardHolder').value;
    const regionSelect = document.getElementById('cardRegion');
    
    console.log(`🔄 Автозаполнение региона для ИП: ${holder}`);
    
    if (holder) {
        const region = getCorrectRegionForIP({ ipName: holder });
        if (region) {
            regionSelect.value = region;
            console.log(`✅ Автоматически заполнен регион: ${region}`);
        } else {
            regionSelect.value = '';
            console.log('❌ Регион не найден для выбранного ИП');
        }
    } else {
        regionSelect.value = '';
    }
}

// Функция открытия модального окна добавления карты
function openAddCardModal() {
    console.log('📝 Открываем форму добавления карты');
    
    document.getElementById('modalTitle').textContent = 'Добавить карту';
    document.getElementById('cardForm').reset();
    document.getElementById('cardId').value = '';
    document.getElementById('cardModal').classList.add('show');
    
    // Сбрасываем регион при открытии формы добавления
    document.getElementById('cardRegion').value = '';
}

// Функция закрытия модального окна
function closeCardModal() {
    console.log('❌ Закрываем модальное окно');
    document.getElementById('cardModal').classList.remove('show');
}

// Функция редактирования карты
function editCard(cardId) {
    console.log(`✏️ Редактируем карту: ${cardId}`);
    
    const card = allCards.find(c => c.id === cardId);
    if (!card) {
        console.log('❌ Карта для редактирования не найдена');
        return;
    }
    
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
    console.log('✅ Форма редактирования заполнена');
}

// Функция удаления карты
function deleteCard(cardId) {
    console.log(`🗑️ Пытаемся удалить карту: ${cardId}`);
    
    if (confirm('Вы уверены, что хотите удалить эту карту?')) {
        allCards = allCards.filter(card => card.id !== cardId);
        saveCards();
        updateStatistics();
        renderCards();
        console.log('✅ Карта удалена');
    } else {
        console.log('❌ Удаление карты отменено');
    }
}

// Функция фильтрации карт
function filterCards() {
    const regionFilter = document.getElementById('filterRegion').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const searchFilter = document.getElementById('searchCards').value.toLowerCase();
    
    console.log(`🔍 Фильтрация: регион=${regionFilter}, статус=${statusFilter}, поиск=${searchFilter}`);
    
    let filtered = allCards;
    
    // Фильтр по региону
    if (regionFilter) {
        filtered = filtered.filter(card => card.regions[0] === regionFilter);
        console.log(`📍 Отфильтровано по региону: ${filtered.length} карт`);
    }
    
    // Фильтр по статусу (работает с реальными статусами)
    if (statusFilter) {
        if (statusFilter === 'active') {
            // Показываем все не-inactive статусы
            filtered = filtered.filter(card => 
                card.status !== 'inactive' && card.status !== '' && card.status !== '-' && card.status !== '--'
            );
            console.log(`✅ Отфильтровано активные: ${filtered.length} карт`);
        } else if (statusFilter === 'inactive') {
            // Показываем только inactive
            filtered = filtered.filter(card => 
                card.status === 'inactive' || card.status === '' || card.status === '-' || card.status === '--'
            );
            console.log(`❌ Отфильтровано неактивные: ${filtered.length} карт`);
        } else {
            // Фильтр по конкретному статусу
            filtered = filtered.filter(card => card.status === statusFilter);
            console.log(`🎯 Отфильтровано по статусу ${statusFilter}: ${filtered.length} карт`);
        }
    }
    
    // Поиск по номеру карты или ИП
    if (searchFilter) {
        filtered = filtered.filter(card => 
            card.number.toLowerCase().includes(searchFilter) ||
            card.holder.toLowerCase().includes(searchFilter)
        );
        console.log(`🔎 Отфильтровано по поиску: ${filtered.length} карт`);
    }
    
    renderCards(filtered);
    updateStatistics(filtered);
}

// Функция сброса фильтров
function resetFilters() {
    console.log('🔄 Сбрасываем все фильтры');
    
    document.getElementById('filterRegion').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('searchCards').value = '';
    renderCards();
    updateStatistics();
}

// Функция сохранения карт в локальное хранилище
function saveCards() {
    localStorage.setItem('cards', JSON.stringify(allCards));
    console.log('💾 Карты сохранены в локальное хранилище');
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

// Обработчик отправки формы
document.getElementById('cardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('📨 Отправка формы карты');
    
    const cardId = document.getElementById('cardId').value;
    const cardType = document.getElementById('cardType').value;
    
    // Собираем данные из формы
    const cardData = {
        number: document.getElementById('cardNumber').value,
        holder: document.getElementById('cardHolder').value,
        bank: document.getElementById('cardBank').value,
        balance: parseFloat(document.getElementById('cardBalance').value) || 0,
        regions: [document.getElementById('cardRegion').value],
        status: document.getElementById('cardStatus').value,
        type: cardType === 'corporate' ? '💳 Корп.' : '💳 Физ.'
    };
    
    // Валидация данных
    if (!cardData.number || !cardData.holder || !cardData.bank || isNaN(cardData.balance) || !cardData.regions[0] || !cardData.status) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    if (cardId) {
        // Редактирование существующей карты
        const index = allCards.findIndex(card => card.id === cardId);
        if (index !== -1) {
            allCards[index] = { ...allCards[index], ...cardData };
            console.log(`✏️ Карта ${cardId} отредактирована`);
        }
    } else {
        // Добавление новой карты
        cardData.id = 'card-' + Date.now();
        allCards.push(cardData);
        console.log(`➕ Добавлена новая карта: ${cardData.id}`);
    }
    
    saveCards();
    updateStatistics();
    renderCards();
    closeCardModal();
});

// Закрытие модального окна при клике вне его
document.getElementById('cardModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCardModal();
    }
});

// Закрытие модального окна по клавише Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCardModal();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Страница карт загружена, инициализируем...');
    loadCards();
});