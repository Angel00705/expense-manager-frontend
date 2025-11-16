const MonthlyPlan = {
    currentRegion: 'Курган',
    currentMonth: '2025-11',
    isAllExpanded: false,

    init() {
        console.log('📅 Инициализация модуля плана месяца');
        
        this.setupEventListeners();
        this.loadPlanData();
        this.setupRegionSidebar();
        this.initializeWeekSections();
    },

    initializeWeekSections() {
        // Инициализируем все недели как свернутые
        for (let week = 1; week <= 4; week++) {
            const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
            const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
            if (content && icon) {
                content.style.display = 'none';
                icon.textContent = '▶️';
            }
        }
    },

    setupEventListeners() {
        const planMonth = document.getElementById('planMonth');
        
        if (planMonth) {
            planMonth.addEventListener('change', (e) => {
                this.currentMonth = e.target.value;
                this.loadPlanData();
            });
        }

        // Обработчики для заголовков недель
        document.querySelectorAll('.week-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const weekSection = e.currentTarget.closest('.week-section');
                if (weekSection) {
                    const week = weekSection.dataset.week;
                    this.toggleWeek(week);
                }
            });
        });
    },

    setupRegionSidebar() {
        if (window.app?.currentUser?.role === 'admin') {
            this.renderRegionList();
            this.setupRegionInfo();
        } else {
            const sidebar = document.getElementById('regionSidebar');
            if (sidebar) sidebar.style.display = 'none';
            
            // Для управляющих автоматически устанавливаем их регион
            if (window.app?.currentUser?.region) {
                this.currentRegion = window.app.currentUser.region;
            }
        }
    },

    renderRegionList() {
        const regionList = document.getElementById('regionList');
        if (!regionList) return;

        const regions = [
            { name: 'Курган', ipCount: 7, icon: '🏢', budget: '72,050 ₽' },
            { name: 'Астрахань', ipCount: 5, icon: '🏢', budget: '45,000 ₽' },
            { name: 'Бурятия', ipCount: 4, icon: '🏢', budget: '38,000 ₽' },
            { name: 'Калмыкия', ipCount: 3, icon: '🏢', budget: '32,000 ₽' },
            { name: 'Мордовия', ipCount: 3, icon: '🏢', budget: '35,000 ₽' },
            { name: 'Удмуртия', ipCount: 6, icon: '🏢', budget: '65,000 ₽' }
        ];

        regionList.innerHTML = regions.map(region => `
            <div class="region-item ${region.name === this.currentRegion ? 'active' : ''}" 
                 data-region="${region.name}">
                <div class="region-info">
                    <div class="region-main">
                        <span class="region-icon">${region.icon}</span>
                        <span class="region-name">${region.name}</span>
                    </div>
                    <div class="region-stats">
                        <span class="region-stat">${region.ipCount} ИП</span>
                        <span class="region-budget">${region.budget}</span>
                    </div>
                </div>
            </div>
        `).join('');

        regionList.addEventListener('click', (e) => {
            const regionItem = e.target.closest('.region-item');
            if (regionItem) {
                this.switchRegion(regionItem.dataset.region);
            }
        });
    },

    setupRegionInfo() {
        const regionInfoPanel = document.getElementById('regionInfoPanel');
        if (regionInfoPanel) {
            regionInfoPanel.style.display = 'block';
            this.updateRegionInfo();
        }
    },

    updateRegionInfo() {
        const currentRegionName = document.getElementById('currentRegionName');
        const ipCount = document.getElementById('ipCount');
        const activeCardsCount = document.getElementById('activeCardsCount');
        const regionBudget = document.getElementById('regionBudget');
        const regionIpList = document.getElementById('regionIpList');

        if (currentRegionName) currentRegionName.textContent = this.currentRegion;
        
        // Получаем реальные данные из appData
        const ips = appData.getIPsByRegion(this.currentRegion);
        const cards = appData.getCardsByRegion(this.currentRegion);
        const activeCards = cards.filter(card => card.status === 'active');

        if (ipCount) ipCount.textContent = ips.length;
        if (activeCardsCount) activeCardsCount.textContent = activeCards.length;
        if (regionBudget) regionBudget.textContent = this.getRegionBudget(this.currentRegion);

        // Обновляем список ИП с реальными картами
        if (regionIpList) {
            regionIpList.innerHTML = ips.map(ip => {
                const ipCards = cards.filter(card => card.owner === ip);
                const hasCards = ipCards.length > 0;
                
                return `
                    <div class="ip-info">
                        <div class="ip-name">${ip}</div>
                        <div class="ip-cards">
                            ${hasCards ? ipCards.map(card => `
                                <span class="card-badge ${card.status || 'active'}">
                                    ${card.cardNumber} - ${this.formatCurrency(card.balance || 0)} ₽
                                </span>
                            `).join('') : `
                                <span class="card-badge inactive">Нет карт</span>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    getRegionBudget(region) {
        const budgets = {
            'Курган': '72,050 ₽',
            'Астрахань': '45,000 ₽', 
            'Бурятия': '38,000 ₽',
            'Калмыкия': '32,000 ₽',
            'Мордовия': '35,000 ₽',
            'Удмуртия': '65,000 ₽'
        };
        return budgets[region] || '0 ₽';
    },
updateRegionCardsInfo() {
    const regionIpList = document.getElementById('regionIpList');
    if (!regionIpList) return;

    const ips = appData.getIPsByRegion(this.currentRegion);
    const cards = appData.getCardsByRegion(this.currentRegion);
    
    regionIpList.innerHTML = ips.map(ip => {
        const ipCards = cards.filter(card => card.owner === ip);
        const hasCards = ipCards.length > 0;
        
        return `
            <div class="ip-info">
                <div class="ip-name">${ip}</div>
                <div class="ip-cards">
                    ${hasCards ? ipCards.map(card => `
                        <span class="card-badge ${card.status || 'active'}">
                            ${card.cardNumber} - ${this.formatCurrency(card.balance || 0)} ₽
                        </span>
                    `).join('') : `
                        <span class="card-badge inactive">Нет карт</span>
                    `}
                </div>
            </div>
        `;
    }).join('');
},
    switchRegion(regionName) {
    console.log(`🔄 Переключение на регион: ${regionName}`);
    this.currentRegion = regionName;
    
    // Обновляем активный элемент в списке
    document.querySelectorAll('.region-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-region="${regionName}"]`);
    if (activeItem) activeItem.classList.add('active');

    // Обновляем информацию о регионе
    this.updateRegionInfo();
    this.updateRegionCardsInfo(); // ДОБАВЬ ЭТУ СТРОЧКУ
    
    // Загружаем план для нового региона
    this.loadPlanData();
},

    loadPlanData() {
        console.log(`📥 Загрузка плана для: ${this.currentRegion}`);
        
        const planData = appData.getMonthlyPlan(this.currentRegion);
        this.updatePlanStatistics(planData);
        this.renderWeeklyPlan(planData);
    },

    updatePlanStatistics(planData) {
        let totalPlan = 0;
        let weeksWithPlan = 0;

        for (let week = 1; week <= 4; week++) {
            const weekData = planData[`week${week}`];
            if (weekData && weekData.tasks && weekData.tasks.length > 0) {
                const weekTotal = weekData.tasks.reduce((sum, task) => sum + (task.plan || 0), 0);
                totalPlan += weekTotal;
                weeksWithPlan++;
                
                this.updateWeekHeader(week, weekTotal);
            } else {
                this.updateWeekHeader(week, 0);
            }
        }

        const totalBudget = this.getRegionBudgetNumber(this.currentRegion);

        const monthBudget = document.getElementById('monthBudget');
        const monthPlan = document.getElementById('monthPlan');
        const monthRemaining = document.getElementById('monthRemaining');
        const weeksPlanned = document.getElementById('weeksPlanned');

        if (monthBudget) monthBudget.textContent = this.formatCurrency(totalBudget) + ' ₽';
        if (monthPlan) monthPlan.textContent = this.formatCurrency(totalPlan) + ' ₽';
        if (monthRemaining) monthRemaining.textContent = this.formatCurrency(Math.max(0, totalBudget - totalPlan)) + ' ₽';
        if (weeksPlanned) weeksPlanned.textContent = `${weeksWithPlan}/4`;
    },

    getRegionBudgetNumber(region) {
        const budgets = {
            'Курган': 72050,
            'Астрахань': 45000, 
            'Бурятия': 38000,
            'Калмыкия': 32000,
            'Мордовия': 35000,
            'Удмуртия': 65000
        };
        return budgets[region] || 0;
    },

    updateWeekHeader(week, total) {
        const totalElement = document.getElementById(`week${week}Total`);
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total) + ' ₽';
        }
    },

    renderWeeklyPlan(planData) {
        for (let week = 1; week <= 4; week++) {
            const weekData = planData[`week${week}`] || { tasks: [] };
            this.renderWeekTasks(week, weekData.tasks || []);
        }
    },

    renderWeekTasks(week, tasks) {
        const tbody = document.getElementById(`week${week}Tasks`);
        if (!tbody) return;

        if (tasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-week">
                        <div class="empty-state-small">
                            <span class="icon">📋</span>
                            <span>Нет запланированных задач</span>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = tasks.map(task => `
            <tr class="task-row" data-task-id="${task.id}" data-region="${this.currentRegion}">
                <td>
                    ${window.app?.currentUser?.role === 'admin' ? `
                        <input type="checkbox" class="task-checkbox" data-task-id="${task.id}">
                    ` : ''}
                </td>
                <td>
                    <div class="category-badge ${task.category}">
                        ${this.getCategoryEmoji(task.category)} ${this.getCategoryName(task.category)}
                    </div>
                </td>
                <td class="task-description-cell">
                    <div class="task-main-desc">${task.description}</div>
                    ${task.explanation ? `<div class="task-explanation">${task.explanation}</div>` : ''}
                </td>
                <td>
                    <div class="ip-info-cell">
                        <div class="ip-name">${task.ip || '-'}</div>
                        ${task.card ? `<div class="card-number">${task.card}</div>` : ''}
                    </div>
                </td>
                <td class="amount-cell plan-amount">${this.formatCurrency(task.plan)} ₽</td>
                <td class="amount-cell fact-amount">${task.fact > 0 ? this.formatCurrency(task.fact) + ' ₽' : '-'}</td>
                <td class="completion-date">${task.dateCompleted ? this.formatDate(task.dateCompleted) : '-'}</td>
                <td>
                    <span class="status-badge status-${task.status}">
                        ${this.getStatusText(task.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${window.app?.currentUser?.role === 'admin' ? `
                            <button class="btn-icon edit" onclick="MonthlyPlan.editTask('${task.id}')" title="Редактировать">✏️</button>
                            <button class="btn-icon delete" onclick="MonthlyPlan.deleteTask('${task.id}')" title="Удалить">🗑️</button>
                        ` : `
                            ${task.status !== 'completed' ? `
                                <button class="btn btn-sm btn-complete" onclick="ManagerTasks.startTaskCompletion('${task.id}')" title="Выполнить">
                                    ✅ Выполнить
                                </button>
                            ` : `
                                <span class="completed-badge">✅ Готово</span>
                            `}
                        `}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    toggleWeek(week) {
        const weekSection = document.querySelector(`.week-section[data-week="${week}"]`);
        const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
        const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
        
        if (!content || !icon || !weekSection) return;
        
        const isExpanded = content.style.display === 'block';
        
        if (isExpanded) {
            content.style.display = 'none';
            icon.textContent = '▶️';
            weekSection.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            icon.textContent = '🔽';
            weekSection.classList.add('expanded');
        }
    },

    toggleAllWeeks() {
        const toggleBtn = document.getElementById('toggleAllText');
        this.isAllExpanded = !this.isAllExpanded;
        
        for (let week = 1; week <= 4; week++) {
            const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
            const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
            const weekSection = document.querySelector(`.week-section[data-week="${week}"]`);
            
            if (content && icon && weekSection) {
                if (this.isAllExpanded) {
                    content.style.display = 'block';
                    icon.textContent = '🔽';
                    weekSection.classList.add('expanded');
                } else {
                    content.style.display = 'none';
                    icon.textContent = '▶️';
                    weekSection.classList.remove('expanded');
                }
            }
        }
        
        if (toggleBtn) {
            toggleBtn.textContent = this.isAllExpanded ? 'Свернуть все' : 'Развернуть все';
        }
    },

    // Методы для работы с задачами
    editTask(taskId) {
        console.log('✏️ Редактирование задачи:', taskId);
        Notification.info('Редактирование задачи - функция в разработке');
    },

    deleteTask(taskId) {
        if (confirm('Удалить эту задачу?')) {
            console.log('🗑️ Удаление задачи:', taskId);
            Notification.success('Задача удалена');
            // Здесь будет логика удаления из данных
        }
    },

    // Вспомогательные функции
    formatCurrency(amount) {
        if (!amount && amount !== 0) return '0';
        return new Intl.NumberFormat('ru-RU').format(Math.round(amount));
    },

    formatDate(dateString) {
        if (!dateString) return 'Не указана';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch {
            return 'Неверная дата';
        }
    },

    getCategoryEmoji(category) {
        const emojis = {
            'products': '🛒', 'household': '🏠', 'medicaments': '💊',
            'stationery': '📎', 'cafe': '☕', 'repairs': '🔧',
            'azs': '⛽', 'salary': '💰', 'shipping': '📦',
            'events': '🎉', 'polygraphy': '🖨️', 'insurance': '🛡️'
        };
        return emojis[category] || '📋';
    },

    getCategoryName(category) {
        const names = {
            'products': 'Продукты', 'household': 'Хоз. товары',
            'medicaments': 'Медикаменты', 'stationery': 'Канцелярия',
            'cafe': 'Кафе', 'repairs': 'Ремонт', 'azs': 'АЗС',
            'salary': 'Зарплата', 'shipping': 'Отправка',
            'events': 'Мероприятия', 'polygraphy': 'Полиграфия',
            'insurance': 'Страхование'
        };
        return names[category] || category;
    },

    getStatusText(status) {
        const statusMap = {
            'planned': '📅 Запланировано',
            'pending': '🔄 В работе', 
            'completed': '✅ Выполнено',
            'cancelled': '❌ Отменено',
            'reserve': '💰 Резерв'
        };
        return statusMap[status] || status;
    }
};

// Глобальные функции для HTML
window.toggleWeek = function(week) { 
    MonthlyPlan.toggleWeek(week);
};

window.toggleAllWeeks = function() { 
    MonthlyPlan.toggleAllWeeks();
};

window.addTaskToWeek = function(week) {
    Notification.info(`Добавление задачи в неделю ${week} - функция в разработке`);
};

window.saveMonthlyPlan = function() {
    Notification.success('План месяца сохранен!');
};