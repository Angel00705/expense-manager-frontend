// Модуль для плана месяца
const MonthlyPlan = {
    currentRegion: 'Курган',
    currentMonth: '2024-11',

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

        // Обработчики для сворачивания/разворачивания недель
        document.querySelectorAll('.week-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const week = header.closest('.week-section').dataset.week;
                    this.toggleWeek(week);
                }
            });
        });
    },

    setupRegionSidebar() {
        // Инициализация сайдбара регионов для админов
        if (app.currentUser.role === 'admin') {
            this.renderRegionList();
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
            <div class="region-item" data-region="${region.name}">
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
        
        // Получаем данные из data.js
        const planData = appData.getMonthlyPlan(this.currentRegion);
        
        // Обновляем статистику
        this.updatePlanStatistics(planData);
        
        // Рендерим недели
        this.renderWeeklyPlan(planData);
        
        // Обновляем информацию о регионе
        this.updateRegionInfo();
    },

    updatePlanStatistics(planData) {
        const totalPlan = Object.values(planData).reduce((sum, week) => sum + (week.total || 0), 0);
        const weeksWithPlan = Object.values(planData).filter(week => week.tasks && week.tasks.length > 0).length;

        // Здесь позже добавим бюджет из budgets.js
        const totalBudget = 50000; // Временная заглушка

        document.getElementById('monthBudget').textContent = formatCurrency(totalBudget) + ' ₽';
        document.getElementById('monthPlan').textContent = formatCurrency(totalPlan) + ' ₽';
        document.getElementById('monthRemaining').textContent = formatCurrency(Math.max(0, totalBudget - totalPlan)) + ' ₽';
        document.getElementById('weeksPlanned').textContent = `${weeksWithPlan}/4`;
    },

    renderWeeklyPlan(planData) {
        // Обновляем каждую неделю
        [1, 2, 3, 4].forEach(week => {
            const weekData = planData[`week${week}`] || { budget: 0, reserve: 0, total: 0, tasks: [] };
            this.updateWeekHeader(week, weekData.total);
            this.renderWeekTasks(week, weekData.tasks);
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
                    <td colspan="10" class="empty-week">
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
                        <input type="checkbox" class="task-checkbox">
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
                    </div>
                </td>
                <td>
                    <div class="task-explanation">${task.explanation || '-'}</div>
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
                            <button class="btn-icon edit" title="Редактировать">✏️</button>
                            <button class="btn-icon delete" title="Удалить">🗑️</button>
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
        const total = Object.values(planData).reduce((sum, week) => sum + (week.total || 0), 0);
        const totalElement = document.getElementById('monthTotal');
        
        if (totalElement) totalElement.textContent = formatCurrency(total) + ' ₽';
    },

    updateRegionInfo() {
        // Обновляем информацию о регионе в сайдбаре
        const regionNameElement = document.getElementById('currentRegionName');
        if (regionNameElement) regionNameElement.textContent = this.currentRegion;
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