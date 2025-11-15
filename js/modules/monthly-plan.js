// js/modules/monthly-plan.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const MonthlyPlan = {
    currentRegion: 'Курган',
    currentMonth: '2025-11',

    init() {
        console.log('📅 Инициализация модуля плана месяца');
        this.setupEventListeners();
        this.loadPlanData();
        this.setupRegionSidebar();
    },

    setupEventListeners() {
        const planRegion = document.getElementById('planRegion');
        const planMonth = document.getElementById('planMonth');
        
        if (planRegion) planRegion.addEventListener('change', (e) => {
            this.currentRegion = e.target.value;
            this.loadPlanData();
        });
        
        if (planMonth) planMonth.addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.loadPlanData();
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.week-header')) {
                const weekSection = e.target.closest('.week-section');
                if (weekSection) {
                    const week = weekSection.dataset.week;
                    this.toggleWeek(week);
                }
            }
        });
    },

    setupRegionSidebar() {
        if (app.currentUser.role === 'admin') {
            this.renderRegionList();
        } else {
            const sidebar = document.getElementById('regionSidebar');
            if (sidebar) sidebar.style.display = 'none';
        }
    },

    renderRegionList() {
        const regionList = document.getElementById('regionList');
        if (!regionList) return;

        const regions = [
            { name: 'Курган', ipCount: 7, icon: '🏢' },
            { name: 'Астрахань', ipCount: 5, icon: '🏢' },
            { name: 'Бурятия', ipCount: 4, icon: '🏢' },
            { name: 'Калмыкия', ipCount: 3, icon: '🏢' },
            { name: 'Мордовия', ipCount: 3, icon: '🏢' },
            { name: 'Удмуртия', ipCount: 6, icon: '🏢' }
        ];

        regionList.innerHTML = regions.map(region => `
            <div class="region-item ${region.name === this.currentRegion ? 'active' : ''}" 
                 data-region="${region.name}">
                <span class="region-icon">${region.icon}</span>
                <span class="region-name">${region.name}</span>
                <span class="region-badge">${region.ipCount} ИП</span>
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

        const planRegionSelect = document.getElementById('planRegion');
        if (planRegionSelect) planRegionSelect.value = regionName;

        this.loadPlanData();
    },

    loadPlanData() {
        console.log(`📥 Загрузка плана для: ${this.currentRegion}, ${this.currentMonth}`);
        
        const planData = this.getMonthlyPlan(this.currentRegion);
        this.updatePlanStatistics(planData);
        this.renderWeeklyPlan(planData);
        this.updateRegionInfo();
    },

    // ДОБАВЛЕНА ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ПЛАНА
    getMonthlyPlan(region) {
        return MonthlyPlansData[region] || { 
            week1: { budget: 0, reserve: 0, total: 0, tasks: [] },
            week2: { budget: 0, reserve: 0, total: 0, tasks: [] },
            week3: { budget: 0, reserve: 0, total: 0, tasks: [] },
            week4: { budget: 0, reserve: 0, total: 0, tasks: [] }
        };
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
            }
        }

        const totalBudget = 72050;

        document.getElementById('monthBudget').textContent = formatCurrency(totalBudget) + ' ₽';
        document.getElementById('monthPlan').textContent = formatCurrency(totalPlan) + ' ₽';
        document.getElementById('monthRemaining').textContent = formatCurrency(Math.max(0, totalBudget - totalPlan)) + ' ₽';
        document.getElementById('weeksPlanned').textContent = `${weeksWithPlan}/4`;
    },

    updateWeekHeader(week, total) {
        const totalElement = document.getElementById(`week${week}Total`);
        if (totalElement) {
            totalElement.textContent = formatCurrency(total) + ' ₽';
        }

        const progressElement = document.querySelector(`[data-week="${week}"] .progress-fill`);
        if (progressElement) {
            const completedTasks = this.getCompletedTasksCount(this.currentRegion, week);
            const totalTasks = this.getTotalTasksCount(this.currentRegion, week);
            const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            progressElement.style.width = `${progressPercent}%`;
            
            const progressText = document.querySelector(`[data-week="${week}"] .progress-text`);
            if (progressText) {
                progressText.textContent = `Выполнено: ${Math.round(progressPercent)}%`;
            }
        }
    },

    getCompletedTasksCount(region, week) {
        const weekData = this.getMonthlyPlan(region)[`week${week}`];
        if (!weekData || !weekData.tasks) return 0;
        return weekData.tasks.filter(task => task.status === 'completed').length;
    },

    getTotalTasksCount(region, week) {
        const weekData = this.getMonthlyPlan(region)[`week${week}`];
        if (!weekData || !weekData.tasks) return 0;
        return weekData.tasks.length;
    },

    renderWeeklyPlan(planData) {
        for (let week = 1; week <= 4; week++) {
            const weekData = planData[`week${week}`] || { tasks: [] };
            this.renderWeekTasks(week, weekData.tasks || []);
        }
        
        this.updateMonthSummary(planData);
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
            <tr class="task-row ${task.status}" data-task-id="${task.id}" data-region="${this.currentRegion}">
                <td>
                    ${app.currentUser.role === 'admin' ? `
                        <input type="checkbox" class="task-checkbox" data-task-id="${task.id}">
                    ` : ''}
                </td>
                <td>
                    <div class="category-badge ${task.category}">
                        ${getCategoryEmoji(task.category)} ${getCategoryName(task.category)}
                    </div>
                </td>
                <td class="task-description-cell">
                    <div class="task-main-desc">${task.description}</div>
                    ${task.explanation ? `<div class="task-explanation">${task.explanation}</div>` : ''}
                    ${task.responsible ? `<div class="task-responsible">👤 ${task.responsible}</div>` : ''}
                </td>
                <td>
                    <div class="ip-info-cell">
                        <div class="ip-name">${task.ip || '-'}</div>
                        ${task.card ? `<div class="card-number">${task.card}</div>` : ''}
                    </div>
                </td>
                <td class="amount-cell plan-amount">${formatCurrency(task.plan)} ₽</td>
                <td class="amount-cell fact-amount">${task.fact > 0 ? formatCurrency(task.fact) + ' ₽' : '-'}</td>
                <td class="completion-date">${task.dateCompleted ? formatDate(task.dateCompleted) : '-'}</td>
                <td>
                    <span class="status-badge status-${task.status}">
                        ${this.getStatusText(task.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${app.currentUser.role === 'admin' ? `
                            <button class="btn-icon edit" onclick="MonthlyPlan.editTask(${week}, '${task.id}')" title="Редактировать">
                                ✏️
                            </button>
                            <button class="btn-icon delete" onclick="MonthlyPlan.deleteTask(${week}, '${task.id}')" title="Удалить">
                                🗑️
                            </button>
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

    updateMonthSummary(planData) {
        const total = Object.values(planData).reduce((sum, weekData) => {
            return sum + (weekData.tasks ? weekData.tasks.reduce((weekSum, task) => weekSum + (task.plan || 0), 0) : 0);
        }, 0);
        
        const totalElement = document.getElementById('monthTotal');
        if (totalElement) totalElement.textContent = formatCurrency(total) + ' ₽';
    },

    updateRegionInfo() {
        const regionNameElement = document.getElementById('currentRegionName');
        if (regionNameElement) regionNameElement.textContent = this.currentRegion;
        
        const ips = appData.getIPsByRegion(this.currentRegion);
        const cards = appData.getCardsByRegion(this.currentRegion);
        
        const ipCountElement = document.getElementById('ipCount');
        const cardsCountElement = document.getElementById('activeCardsCount');
        const budgetElement = document.getElementById('regionBudget');
        
        if (ipCountElement) ipCountElement.textContent = ips.length;
        if (cardsCountElement) cardsCountElement.textContent = cards.filter(card => card.status === 'в регионе').length;
        if (budgetElement) budgetElement.textContent = '72,050 ₽';
        
        this.renderIpList(ips);
    },

    renderIpList(ips) {
        const ipListElement = document.getElementById('regionIpList');
        if (!ipListElement) return;

        ipListElement.innerHTML = ips.map(ip => `
            <div class="ip-info">
                <span class="ip-name">${ip}</span>
                <div class="ip-cards">
                    ${this.getCardsForIp(ip).map(card => `
                        <span class="card-badge">${card.number}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    getCardsForIp(ipName) {
        const cards = appData.getCardsByRegion(this.currentRegion);
        return cards.filter(card => card.ip === ipName);
    },

    toggleWeek(week) {
        const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
        const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.textContent = '🔽';
        } else {
            content.style.display = 'none';
            icon.textContent = '▶️';
        }
    },

    toggleAllWeeks() {
        const allWeeks = [1, 2, 3, 4];
        const allExpanded = allWeeks.every(week => {
            const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
            return content && content.style.display !== 'none';
        });
        
        allWeeks.forEach(week => {
            const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
            const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
            if (content && icon) {
                if (allExpanded) {
                    content.style.display = 'none';
                    icon.textContent = '▶️';
                } else {
                    content.style.display = 'block';
                    icon.textContent = '🔽';
                }
            }
        });
        
        const toggleText = document.getElementById('toggleAllText');
        if (toggleText) {
            toggleText.textContent = allExpanded ? 'Развернуть все' : 'Свернуть все';
        }
    },

    addTaskToWeek(week) {
        if (app.currentUser.role === 'manager') {
            Notification.error('❌ У вас нет прав для добавления задач в план');
            return;
        }
        console.log('➕ Добавление задачи в неделю:', week);
        Notification.info('Функция добавления задачи в разработке');
    },

    saveMonthlyPlan() {
        console.log('💾 Сохранение плана месяца');
        Notification.success('План месяца сохранен!');
    },

    editTask(week, taskId) {
        console.log('✏️ Редактирование задачи:', taskId, 'в неделе:', week);
        Notification.info('Функция редактирования в разработке');
    },

    deleteTask(week, taskId) {
        if (confirm('Удалить эту задачу из плана?')) {
            console.log('🗑️ Удаление задачи:', taskId, 'из недели:', week);
            Notification.success('Задача удалена из плана');
        }
    },

    getStatusText(status) {
        const statusMap = {
            'planned': '📅 Запланировано',
            'pending': '🔄 В работе', 
            'completed': '✅ Выполнено',
            'cancelled': '❌ Отменено',
            'reserve': '🛡️ Резерв'
        };
        return statusMap[status] || status;
    }
};

// Глобальные функции для HTML onclick
function toggleAllWeeks() { MonthlyPlan.toggleAllWeeks(); }
function addTaskToWeek(week) { MonthlyPlan.addTaskToWeek(week); }
function saveMonthlyPlan() { MonthlyPlan.saveMonthlyPlan(); }