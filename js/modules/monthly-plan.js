// js/modules/monthly-plan.js
const MonthlyPlan = {
    currentRegion: 'Курган',
    currentMonth: '2025-11', // Обновили на ноябрь 2025

    init() {
        console.log('📅 Инициализация модуля плана месяца');
        this.setupEventListeners();
        this.loadPlanData();
        this.setupRegionSidebar();
    },

    setupEventListeners() {
        // Обработчики для выбора региона и месяца
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
    },

    setupRegionSidebar() {
        // Инициализация сайдбара регионов только для админов
        if (app.currentUser.role === 'admin') {
            this.renderRegionList();
        } else {
            // Скрываем сайдбар для управляющих
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

        // Обработчики клика по регионам
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
        
        // Обновляем активный элемент
        document.querySelectorAll('.region-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-region="${regionName}"]`);
        if (activeItem) activeItem.classList.add('active');

        // Обновляем выпадающий список
        const planRegionSelect = document.getElementById('planRegion');
        if (planRegionSelect) planRegionSelect.value = regionName;

        // Загружаем данные региона
        this.loadPlanData();
    },

    loadPlanData() {
        console.log(`📥 Загрузка плана для: ${this.currentRegion}, ${this.currentMonth}`);
        
        // Получаем данные из monthly-plans-data.js
        const planData = getMonthlyPlan(this.currentRegion);
        
        // Обновляем статистику
        this.updatePlanStatistics(planData);
        
        // Рендерим недели
        this.renderWeeklyPlan(planData);
        
        // Обновляем информацию о регионе
        this.updateRegionInfo();
    },

    updatePlanStatistics(planData) {
        const totalPlan = Object.values(planData).reduce((sum, week) => {
            return sum + (week.tasks ? week.tasks.reduce((weekSum, task) => weekSum + (task.plan || 0), 0) : 0);
        }, 0);
        
        const weeksWithPlan = Object.values(planData).filter(week => week.tasks && week.tasks.length > 0).length;

        // Бюджет из CSV
        const totalBudget = 72050;

        document.getElementById('monthBudget').textContent = formatCurrency(totalBudget) + ' ₽';
        document.getElementById('monthPlan').textContent = formatCurrency(totalPlan) + ' ₽';
        document.getElementById('monthRemaining').textContent = formatCurrency(Math.max(0, totalBudget - totalPlan)) + ' ₽';
        document.getElementById('weeksPlanned').textContent = `${weeksWithPlan}/4`;
    },

    renderWeeklyPlan(planData) {
        // Обновляем каждую неделю
        [1, 2, 3, 4].forEach(week => {
            const weekData = planData[`week${week}`] || { tasks: [] };
            const weekTotal = weekData.tasks ? weekData.tasks.reduce((sum, task) => sum + (task.plan || 0), 0) : 0;
            
            this.updateWeekHeader(week, weekTotal);
            this.renderWeekTasks(week, weekData.tasks || []);
        });
        
        this.updateMonthSummary(planData);
    },

    updateWeekHeader(week, total) {
        const totalElement = document.getElementById(`week${week}Total`);
        if (totalElement) totalElement.textContent = formatCurrency(total) + ' ₽';
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
                <td>
                    <div class="task-description-cell">
                        <div class="task-main-desc">${task.description}</div>
                        ${task.explanation ? `<div class="task-explanation">${task.explanation}</div>` : ''}
                    </div>
                </td>
                <td>
                    <div class="ip-info-cell">
                        <div class="ip-name">${task.ip}</div>
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
                            <button class="btn-icon edit" onclick="editWeeklyTask(${week}, '${task.id}')" title="Редактировать">
                                ✏️
                            </button>
                            <button class="btn-icon delete" onclick="deleteWeeklyTask(${week}, '${task.id}')" title="Удалить">
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
        const total = Object.values(planData).reduce((sum, week) => {
            return sum + (week.tasks ? week.tasks.reduce((weekSum, task) => weekSum + (task.plan || 0), 0) : 0);
        }, 0);
        
        const totalElement = document.getElementById('monthTotal');
        if (totalElement) totalElement.textContent = formatCurrency(total) + ' ₽';
    },

    updateRegionInfo() {
        // Обновляем информацию о регионе в сайдбаре
        const regionNameElement = document.getElementById('currentRegionName');
        if (regionNameElement) regionNameElement.textContent = this.currentRegion;
        
        // Обновляем статистику региона
        const ips = appData.getIPsByRegion(this.currentRegion);
        const cards = appData.getCardsByRegion(this.currentRegion);
        
        document.getElementById('ipCount').textContent = ips.length;
        document.getElementById('activeCardsCount').textContent = cards.filter(card => card.status === 'в регионе').length;
        document.getElementById('regionBudget').textContent = '72,050 ₽'; // Из CSV
    },

    getStatusText(status) {
        const statusMap = {
            'planned': 'Запланировано',
            'pending': 'В работе', 
            'completed': 'Выполнено',
            'cancelled': 'Отменено'
        };
        return statusMap[status] || status;
    }
};

// Глобальные функции
function toggleWeek(week) {
    const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
    const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '🔽';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶️';
    }
}

function addTaskToWeek(week) {
    if (app.currentUser.role === 'manager') {
        Notification.error('❌ У вас нет прав для добавления задач в план');
        return;
    }
    console.log('➕ Добавление задачи в неделю:', week);
}

function editWeeklyTask(week, taskId) {
    console.log('✏️ Редактирование задачи:', taskId, 'в неделе:', week);
}

function deleteWeeklyTask(week, taskId) {
    if (confirm('Удалить эту задачу из плана?')) {
        console.log('🗑️ Удаление задачи:', taskId, 'из недели:', week);
    }
}

function saveMonthlyPlan() {
    console.log('💾 Сохранение плана месяца');
    Notification.success('План месяца сохранен!');
}

function toggleAllWeeks() {
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
    
    document.getElementById('toggleAllText').textContent = allExpanded ? 'Развернуть все' : 'Свернуть все';
}