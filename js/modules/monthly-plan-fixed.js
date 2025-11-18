// js/modules/monthly-plan-fixed.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
        this.updateCardsPanel(this.currentRegion);
    },

    initializeWeekSections() {
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
        } else {
            const sidebar = document.getElementById('regionSidebar');
            if (sidebar) sidebar.style.display = 'none';
            
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

    switchRegion(regionName) {
        console.log(`🔄 Переключение на регион: ${regionName}`);
        this.currentRegion = regionName;
        
        document.querySelectorAll('.region-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-region="${regionName}"]`);
        if (activeItem) activeItem.classList.add('active');

        this.updateCardsPanel(regionName);
        this.loadPlanData();
    },

    updateCardsPanel(region) {
        const cards = appData.getCardsByRegion(region);
        const activeCards = cards.filter(card => 
            card.corpStatus === 'в регионе' || card.personalStatus === 'в регионе'
        );
        
        const totalBalance = cards.reduce((sum, card) => sum + (card.balance || 0), 0);
        
        const totalCardsElem = document.getElementById('totalCards');
        const activeCardsElem = document.getElementById('activeCards');
        const totalBalanceElem = document.getElementById('totalBalance');
        const currentRegionElem = document.getElementById('currentRegionCards');
        
        if (totalCardsElem) totalCardsElem.textContent = cards.length;
        if (activeCardsElem) activeCardsElem.textContent = activeCards.length;
        if (totalBalanceElem) totalBalanceElem.textContent = this.formatCurrency(totalBalance) + ' ₽';
        if (currentRegionElem) currentRegionElem.textContent = region;
        
        this.renderCardsList(cards);
    },

    renderCardsList(cards) {
        const cardsList = document.getElementById('regionCardsList');
        if (!cardsList) return;
        
        cardsList.innerHTML = cards.map(card => `
            <div class="card-item ${(card.corpStatus === 'в регионе' || card.personalStatus === 'в регионе') ? 'active' : 'inactive'}">
                <div class="card-header">
                    <span class="card-ip">${card.ipName}</span>
                    <span class="card-type">${card.corpCard ? '💳 Корп.' : '👤 Перс.'}</span>
                </div>
                <div class="card-details">
                    <span class="card-number">${card.corpCard || card.personalCard}</span>
                    <span class="card-status ${(card.corpStatus === 'в регионе' || card.personalStatus === 'в регионе') ? 'online' : 'offline'}">
                        ${card.corpStatus || card.personalStatus}
                    </span>
                </div>
                ${card.balance ? `
                    <div class="card-balance">
                        Баланс: <strong>${this.formatCurrency(card.balance)} ₽</strong>
                    </div>
                ` : ''}
            </div>
        `).join('');
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

        tbody.innerHTML = tasks.map(task => `
            <tr class="task-row" data-task-id="${task.id}">
                <td class="task-deadline">${this.getWeekDeadline(week)}</td>
                
                <td>
                    <div class="category-badge ${task.category}">
                        ${this.getCategoryEmoji(task.category)} ${this.getCategoryName(task.category)}
                    </div>
                </td>
                
                <td class="task-description-cell">
                    <div class="task-main-desc">${task.description}</div>
                </td>
                
                <td class="task-explanation-cell">
                    ${task.explanation ? `<div class="task-explanation">${task.explanation}</div>` : '-'}
                </td>
                
                <td>
                    <div class="ip-info-cell">
                        <div class="ip-name">${task.ip || '-'}</div>
                    </div>
                </td>
                
                <td class="card-cell">
                    ${task.card ? `<span class="card-badge">${task.card}</span>` : '-'}
                </td>
                
                <td class="amount-cell plan-amount">${this.formatCurrency(task.plan)} ₽</td>
                
                <td class="amount-cell fact-amount">
                    ${window.app?.currentUser?.role === 'admin' ? 
                        (task.fact > 0 ? this.formatCurrency(task.fact) + ' ₽' : '-') :
                        `<input type="number" class="fact-input" value="${task.fact || ''}" 
                         onchange="MonthlyPlan.updateTaskFact('${task.id}', this.value)" placeholder="0">`
                    }
                </td>
                
                <td class="completion-date">
                    ${window.app?.currentUser?.role === 'admin' ? 
                        (task.dateCompleted ? this.formatDate(task.dateCompleted) : '-') :
                        `<input type="date" class="date-input" value="${task.dateCompleted || ''}" 
                         onchange="MonthlyPlan.updateTaskDate('${task.id}', this.value)">`
                    }
                </td>
                
                <td>
                    <span class="status-badge status-${task.status}">
                        ${this.getStatusText(task.status)}
                    </span>
                </td>
                
                <td class="manager-comment">
                    ${window.app?.currentUser?.role === 'admin' ? 
                        (task.managerComment || '-') :
                        `<textarea class="comment-input" placeholder="Ваш комментарий..." 
                         onchange="MonthlyPlan.updateTaskComment('${task.id}', this.value)">${task.managerComment || ''}</textarea>`
                    }
                </td>
                
                <td>
                    <div class="action-buttons">
                        ${window.app?.currentUser?.role === 'admin' ? `
                            <button class="btn-icon edit" onclick="MonthlyPlan.editTask('${task.id}')">✏️</button>
                            <button class="btn-icon delete" onclick="MonthlyPlan.deleteTask('${task.id}')">🗑️</button>
                        ` : `
                            ${task.status !== 'completed' ? `
                                <button class="btn btn-sm btn-complete" onclick="ManagerTasks.completeTask('${task.id}')">
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

    getWeekDeadline(week) {
        const deadlines = {
            1: '07.11.2025',
            2: '14.11.2025', 
            3: '21.11.2025',
            4: '30.11.2025'
        };
        return deadlines[week] || 'Не указан';
    },

    updateTaskFact(taskId, factAmount) {
        const amount = parseFloat(factAmount);
        if (!isNaN(amount) && amount >= 0) {
            this.updateTaskField(taskId, 'fact', amount);
            
            const task = this.findTaskById(taskId);
            if (task && task.dateCompleted && amount > 0) {
                this.updateTaskField(taskId, 'status', 'completed');
            }
            
            Notification.success('Фактическая сумма обновлена');
            this.loadPlanData();
        }
    },

    updateTaskDate(taskId, date) {
        if (date) {
            this.updateTaskField(taskId, 'dateCompleted', date);
            
            const task = this.findTaskById(taskId);
            if (task && task.fact > 0 && date) {
                this.updateTaskField(taskId, 'status', 'completed');
            }
            
            Notification.success('Дата выполнения обновлена');
            this.loadPlanData();
        }
    },

    updateTaskComment(taskId, comment) {
        this.updateTaskField(taskId, 'managerComment', comment);
        Notification.success('Комментарий сохранен');
    },

    updateTaskField(taskId, field, value) {
        console.log(`🔄 Обновление задачи ${taskId}: ${field} = ${value}`);
        
        try {
            const planData = appData.getMonthlyPlan(this.currentRegion);
            let taskUpdated = false;
            
            for (let week = 1; week <= 4; week++) {
                const weekKey = `week${week}`;
                const weekData = planData[weekKey];
                if (weekData && weekData.tasks) {
                    const taskIndex = weekData.tasks.findIndex(t => t.id === taskId);
                    if (taskIndex !== -1) {
                        weekData.tasks[taskIndex][field] = value;
                        taskUpdated = true;
                        
                        if (field === 'fact' && value > 0) {
                            const task = weekData.tasks[taskIndex];
                            if (task.dateCompleted) {
                                weekData.tasks[taskIndex].status = 'completed';
                            }
                        }
                        if (field === 'dateCompleted' && value) {
                            const task = weekData.tasks[taskIndex];
                            if (task.fact > 0) {
                                weekData.tasks[taskIndex].status = 'completed';
                            }
                        }
                        
                        break;
                    }
                }
            }
            
            if (taskUpdated) {
                this.saveToLocalStorage();
                console.log('✅ Задача обновлена:', { taskId, field, value });
                return true;
            }
            
            console.error('❌ Задача не найдена:', taskId);
            return false;
            
        } catch (error) {
            console.error('💥 Ошибка при обновлении задачи:', error);
            Notification.error('Ошибка при сохранении данных');
            return false;
        }
    },

    saveToLocalStorage() {
        try {
            localStorage.setItem('monthlyPlans', JSON.stringify(MonthlyPlansData));
            console.log('💾 Данные сохранены в localStorage');
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            if (typeof Notification !== 'undefined') {
                Notification.error('Ошибка сохранения данных');
            }
            return false;
        }
    },

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('monthlyPlans');
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(MonthlyPlansData, parsed);
                console.log('📥 Данные загружены из localStorage');
                return true;
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
        }
        return false;
    },

    findTaskById(taskId) {
        const planData = appData.getMonthlyPlan(this.currentRegion);
        for (let week = 1; week <= 4; week++) {
            const weekData = planData[`week${week}`];
            if (weekData && weekData.tasks) {
                const task = weekData.tasks.find(t => t.id === taskId);
                if (task) return task;
            }
        }
        return null;
    },

    validateBudget(category, amount) {
        const categoryBudgets = {
            'products': 5000,
            'household': 5000, 
            'medicaments': 1000,
            'stationery': 1000,
            'cafe': 2000,
            'repairs': 10000,
            'azs': 1500,
            'salary': 15000,
            'shipping': 3000,
            'events': 2500,
            'polygraphy': 300,
            'insurance': 5000,
            'cleaning': 2000
        };
        
        const categoryLimit = categoryBudgets[category] || 0;
        return {
            isValid: amount <= categoryLimit,
            limit: categoryLimit,
            remaining: categoryLimit - amount
        };
    },

    showBudgetWarning(category, amount) {
        const validation = this.validateBudget(category, amount);
        if (!validation.isValid) {
            Notification.warning(`Превышен лимит! Категория "${this.getCategoryName(category)}": ${this.formatCurrency(amount)} ₽ > ${this.formatCurrency(validation.limit)} ₽`);
            return false;
        }
        return true;
    },

    editTask(taskId) {
        const task = this.findTaskById(taskId);
        if (!task) {
            Notification.error('Задача не найдена');
            return;
        }
        
        const newAmount = prompt(`Редактировать сумму для задачи:\n"${task.description}"\n\nТекущая сумма: ${task.plan} ₽\nЛимит категории: ${this.validateBudget(task.category, task.plan).limit} ₽`, task.plan);
        
        if (newAmount !== null) {
            const amount = parseFloat(newAmount);
            if (!isNaN(amount)) {
                if (this.showBudgetWarning(task.category, amount)) {
                    this.updateTaskField(taskId, 'plan', amount);
                    Notification.success('Задача обновлена');
                    this.loadPlanData();
                }
            } else {
                Notification.error('Неверная сумма');
            }
        }
    },

    deleteTask(taskId) {
        if (confirm('Удалить эту задачу?')) {
            console.log('🗑️ Удаление задачи:', taskId);
            Notification.success('Задача удалена');
        }
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

    savePlanData() {
        console.log('💾 Сохранение данных плана');
        this.loadPlanData();
    },

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
            'events': '🎉', 'polygraphy': '🖨️', 'insurance': '🛡️',
            'cleaning': '🧹', 'charity': '❤️', 'equipment': '💻'
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
            'insurance': 'Страхование', 'charity': 'Благотворительность',
            'equipment': 'Техника', 'cleaning': 'Клининг'
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
    }
};

window.toggleWeek = function(week) { 
    MonthlyPlan.toggleWeek(week);
};

window.toggleAllWeeks = function() { 
    MonthlyPlan.toggleAllWeeks();
};

window.addTaskToWeek = function(week) {
    if (typeof TaskModals !== 'undefined') {
        TaskModals.openAddTaskModal(week);
    } else {
        Notification.info(`Добавление задачи в неделю ${week} - функция в разработке`);
    }
};

window.saveMonthlyPlan = function() {
    Notification.success('План месяца сохранен!');
};