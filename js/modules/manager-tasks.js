// Модуль для интерфейса управляющего
const ManagerTasks = {
    currentUser: null,
    userRegion: null,

    init() {
        console.log('👤 Инициализация модуля управляющего');
        this.currentUser = app.currentUser;
        this.userRegion = this.currentUser.regions[0];
        
        this.setupManagerUI();
        this.setupDataProtection();
        this.loadManagerData();
        this.setupEventListeners();
    },

    setupManagerUI() {
        console.log('🎨 Настройка UI для управляющего');
        
        // Показываем информационную панель
        const infoPanel = document.getElementById('managerInfoPanel');
        if (infoPanel) {
            infoPanel.style.display = 'block';
            document.getElementById('managerUserName').textContent = this.currentUser.name;
            document.getElementById('managerRegionName').textContent = this.userRegion;
        }

        // Настраиваем заголовок
        document.getElementById('pageSubtitle').textContent = `Задачи в регионе ${this.userRegion}`;

        // Блокируем выбор региона в плане месяца
        const planRegionSelect = document.getElementById('planRegion');
        if (planRegionSelect) {
            planRegionSelect.value = this.userRegion;
            planRegionSelect.disabled = true;
            planRegionSelect.classList.add('protected-field');
        }

        // Скрываем кнопки редактирования в плане месяца
        const controlActions = document.querySelector('.plan-controls .control-actions');
        if (controlActions) controlActions.style.display = 'none';

        // Скрываем кнопки "Добавить" в неделях
        document.querySelectorAll('.week-section .btn').forEach(btn => {
            if (btn.textContent.includes('Добавить')) {
                btn.style.display = 'none';
            }
        });
    },

    setupDataProtection() {
        console.log('🔒 Настройка защиты данных для управляющего');
        
        // Скрываем элементы редактирования
        document.querySelectorAll('.btn-edit, .btn-delete, .btn-add').forEach(btn => {
            btn.style.display = 'none';
        });

        // Блокируем редактирование плановых сумм
        document.querySelectorAll('.plan-amount').forEach(element => {
            element.style.pointerEvents = 'none';
            element.style.opacity = '0.8';
        });

        // Скрываем кнопки массовых операций
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) bulkActions.style.display = 'none';

        // Показываем только задачи своего региона
        this.filterTasksByUserRegion();
    },

    setupEventListeners() {
        // Обработчики для вкладки "Мои задачи"
        const myTasksSearch = document.getElementById('myTasksSearch');
        const myTasksStatus = document.getElementById('myTasksStatus');
        const myTasksWeek = document.getElementById('myTasksWeek');
        
        if (myTasksSearch) myTasksSearch.addEventListener('input', () => this.filterMyTasks());
        if (myTasksStatus) myTasksStatus.addEventListener('change', () => this.filterMyTasks());
        if (myTasksWeek) myTasksWeek.addEventListener('change', () => this.filterMyTasks());
    },

    filterTasksByUserRegion() {
        console.log(`👀 Фильтрация задач для управляющего: ${this.userRegion}`);
        
        // Скрываем задачи других регионов
        document.querySelectorAll('.task-row').forEach(row => {
            const taskRegion = row.dataset.region;
            if (taskRegion && taskRegion !== this.userRegion) {
                row.style.display = 'none';
            }
        });
        
        // Скрываем недели без задач текущего региона
        document.querySelectorAll('.week-section').forEach(section => {
            const weekTasks = section.querySelectorAll('.task-row');
            const visibleTasks = Array.from(weekTasks).filter(task => task.style.display !== 'none');
            
            if (visibleTasks.length === 0) {
                section.style.display = 'none';
            }
        });
    },

    loadManagerData() {
        console.log('📊 Загрузка данных управляющего');
        this.loadMyTasks();
    },

    loadMyTasks() {
        // Загружаем задачи для текущего управляющего
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        const myTasks = allTasks.filter(task => 
            task.region === this.userRegion && 
            (task.responsible === this.currentUser.name || !task.responsible) &&
            task.status !== 'cancelled'
        );
        
        this.renderMyTasks(myTasks);
        this.updateMyTasksStats(myTasks);
    },

    renderMyTasks(tasks) {
        const container = document.getElementById('myTasksGrid');
        const emptyState = document.getElementById('myTasksEmpty');
        
        if (!container) return;
        
        if (tasks.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        // Группируем задачи по статусу
        const pendingTasks = tasks.filter(task => task.status === 'pending');
        const completedTasks = tasks.filter(task => task.status === 'completed');
        
        container.innerHTML = `
            ${pendingTasks.length > 0 ? `
                <div class="tasks-section">
                    <h4>📋 Текущие задачи (${pendingTasks.length})</h4>
                    <div class="tasks-list">
                        ${pendingTasks.map(task => this.renderMyTaskCard(task)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${completedTasks.length > 0 ? `
                <div class="tasks-section">
                    <h4>✅ Выполненные задачи (${completedTasks.length})</h4>
                    <div class="tasks-list completed-tasks">
                        ${completedTasks.map(task => this.renderMyTaskCard(task)).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    },

    renderMyTaskCard(task) {
        const isCompleted = task.status === 'completed';
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
        
        return `
            <div class="my-task-card ${task.priority || ''} ${task.status} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-main">
                    <div class="task-header">
                        <h4 class="task-title">${task.title || 'Без названия'}</h4>
                        <div class="task-meta">
                            <span class="task-category">${getCategoryEmoji(task.expenseItem)} ${getCategoryName(task.expenseItem)}</span>
                            <span class="task-amount">${formatCurrency(task.plannedAmount || task.amount)} ₽</span>
                        </div>
                    </div>
                    
                    ${task.description ? `
                        <div class="task-description">
                            ${task.description}
                        </div>
                    ` : ''}
                    
                    <div class="task-details">
                        <div class="task-detail">
                            <span class="detail-icon">📅</span>
                            <span class="detail-text ${isOverdue ? 'overdue-text' : ''}">
                                ${task.dueDate ? formatDate(task.dueDate) : 'Без срока'}
                                ${isOverdue ? ' 🔴 Просрочено' : ''}
                            </span>
                        </div>
                        <div class="task-detail">
                            <span class="detail-icon">🏢</span>
                            <span class="detail-text">${task.ip || 'Не указан'}</span>
                        </div>
                        ${task.weekNumber ? `
                            <div class="task-detail">
                                <span class="detail-icon">📌</span>
                                <span class="detail-text">Неделя ${task.weekNumber}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    ${isCompleted ? `
                        <div class="completion-info">
                            <div class="fact-amount">Факт: ${formatCurrency(task.factAmount)} ₽</div>
                            <div class="completion-date">${task.dateCompleted ? formatDate(task.dateCompleted) : ''}</div>
                        </div>
                    ` : `
                        <button class="btn btn-primary btn-sm" onclick="ManagerTasks.startTaskCompletion('${task.id}')">
                            <span class="nav-icon">✅</span>
                            Выполнить
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    updateMyTasksStats(tasks) {
        const pending = tasks.filter(t => t.status === 'pending').length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const totalAmount = tasks.reduce((sum, task) => sum + (task.plannedAmount || task.amount || 0), 0);
        
        console.log(`📊 Статистика управляющего: ${pending} в работе, ${completed} выполнено, всего: ${formatCurrency(totalAmount)} ₽`);
    },

    filterMyTasks() {
        this.loadMyTasks(); // Пока простой фильтр - потом улучшим
    },

    startTaskCompletion(taskId) {
        console.log('✅ Начало выполнения задачи:', taskId);
        
        // Находим задачу в данных плана
        const task = this.findTaskInPlans(taskId);
        
        if (!task) {
            Notification.error('Задача не найдена');
            return;
        }
        
        // Проверяем доступ для управляющего
        const taskRegion = this.getTaskRegion(taskId);
        if (taskRegion !== this.userRegion) {
            Notification.error('У вас нет доступа к этой задаче');
            return;
        }
        
        // Заполняем модальное окно
        document.getElementById('completeTaskId').value = taskId;
        document.getElementById('factAmount').value = task.plan || '';
        document.getElementById('completionDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('completionNotes').value = '';
        
        // Заполняем информацию о задаче
        const taskInfo = document.getElementById('completeTaskInfo');
        taskInfo.innerHTML = `
            <div class="task-preview">
                <h4>${getCategoryEmoji(task.category)} ${getCategoryName(task.category)}</h4>
                <p class="task-description-preview">${task.description}</p>
                <div class="task-details-preview">
                    <div class="detail-row">
                        <span class="detail-label">ИП:</span>
                        <span class="detail-value">${task.ip}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Карта:</span>
                        <span class="detail-value">${task.card || 'Не указана'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Плановая сумма:</span>
                        <span class="detail-value">${formatCurrency(task.plan)} ₽</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Ответственный:</span>
                        <span class="detail-value">${task.responsible || 'Не назначен'}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('completeTaskModal').style.display = 'flex';
    },

    findTaskInPlans(taskId) {
        // Ищем задачу во всех планах всех регионов
        for (const region in appData.weeklyPlans) {
            for (let week = 1; week <= 4; week++) {
                const weekData = appData.weeklyPlans[region][`week${week}`];
                if (weekData && weekData.tasks) {
                    const task = weekData.tasks.find(t => t.id === taskId);
                    if (task) return task;
                }
            }
        }
        return null;
    },

    getTaskRegion(taskId) {
        // Определяем регион задачи по ID
        if (taskId.includes('kurgan')) return 'Курган';
        if (taskId.includes('astrakhan')) return 'Астрахань';
        if (taskId.includes('buryatia')) return 'Бурятия';
        if (taskId.includes('kalmykia')) return 'Калмыкия';
        if (taskId.includes('mordovia')) return 'Мордовия';
        if (taskId.includes('udmurtia')) return 'Удмуртия';
        return 'Общий';
    },

    saveTaskCompletion() {
        const taskId = document.getElementById('completeTaskId').value;
        const factAmount = parseFloat(document.getElementById('factAmount').value);
        const completionDate = document.getElementById('completionDate').value;
        const notes = document.getElementById('completionNotes').value;
        
        if (!factAmount || !completionDate) {
            Notification.error('Заполните обязательные поля: Фактическая сумма и Дата выполнения');
            return;
        }
        
        // Находим и обновляем задачу
        const taskUpdated = this.updateTaskInPlans(taskId, {
            fact: factAmount,
            dateCompleted: completionDate,
            completionNotes: notes,
            status: 'completed',
            updatedAt: new Date().toISOString(),
            completedBy: this.currentUser.name
        });
        
        if (taskUpdated) {
            Notification.success('Задача выполнена!');
            this.closeCompleteTaskModal();
            
            // Перезагружаем данные
            this.loadManagerData();
            MonthlyPlan.loadPlanData();
            
            // Синхронизируем с системой задач
            this.syncWithTaskSystem(taskId, factAmount, completionDate);
        } else {
            Notification.error('Ошибка при сохранении задачи');
        }
    },

    updateTaskInPlans(taskId, updates) {
        // Обновляем задачу в данных плана
        for (const region in appData.weeklyPlans) {
            for (let week = 1; week <= 4; week++) {
                const weekKey = `week${week}`;
                if (appData.weeklyPlans[region][weekKey] && appData.weeklyPlans[region][weekKey].tasks) {
                    const taskIndex = appData.weeklyPlans[region][weekKey].tasks.findIndex(t => t.id === taskId);
                    if (taskIndex !== -1) {
                        appData.weeklyPlans[region][weekKey].tasks[taskIndex] = {
                            ...appData.weeklyPlans[region][weekKey].tasks[taskIndex],
                            ...updates
                        };
                        
                        // Сохраняем в localStorage
                        this.savePlansToStorage();
                        return true;
                    }
                }
            }
        }
        return false;
    },

    savePlansToStorage() {
        try {
            localStorage.setItem('weeklyPlans', JSON.stringify(appData.weeklyPlans));
            console.log('💾 Планы сохранены в localStorage');
            return true;
        } catch (e) {
            console.error('❌ Ошибка сохранения планов:', e);
            return false;
        }
    },

    syncWithTaskSystem(taskId, factAmount, completionDate) {
        // Синхронизируем с основной системой задач
        const task = this.findTaskInPlans(taskId);
        if (task) {
            const taskData = {
                title: `${getCategoryName(task.category)} - ${task.description}`,
                description: task.description,
                region: this.getTaskRegion(taskId),
                ip: task.ip,
                plannedAmount: task.plan,
                factAmount: factAmount,
                status: 'completed',
                dateCompleted: completionDate,
                expenseItem: task.category,
                responsibleManager: task.responsible
            };
            
            // Создаем или обновляем задачу в основной системе
            if (window.TaskManager) {
                const existingTask = TaskManager.getAllTasks().find(t => t.originalPlanId === taskId);
                if (existingTask) {
                    TaskManager.updateTask(existingTask.id, taskData);
                } else {
                    TaskManager.createTask({
                        ...taskData,
                        originalPlanId: taskId,
                        type: 'planned'
                    });
                }
            }
        }
    },

    closeCompleteTaskModal() {
        document.getElementById('completeTaskModal').style.display = 'none';
    }
};
// В ManagerTasks добавляем методы:
startTaskCompletion(taskId) {
    const task = this.findTaskInPlans(taskId);
    if (!task) {
        Notification.error('Задача не найдена');
        return;
    }

    // Заполняем модальное окно
    document.getElementById('completeTaskId').value = taskId;
    document.getElementById('factAmount').value = task.plan || '';
    document.getElementById('completionDate').value = new Date().toISOString().split('T')[0];
    
    // Показываем информацию о задаче
    const taskInfo = document.getElementById('completeTaskInfo');
    taskInfo.innerHTML = `
        <div class="task-preview">
            <h4>${task.description}</h4>
            ${task.explanation ? `<p class="task-explanation">${task.explanation}</p>` : ''}
            <div class="task-details-preview">
                <div class="detail-row">
                    <span class="detail-label">Категория:</span>
                    <span class="detail-value">${getCategoryName(task.category)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">ИП:</span>
                    <span class="detail-value">${task.ip}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Плановая сумма:</span>
                    <span class="detail-value">${formatCurrency(task.plan)} ₽</span>
                </div>
            </div>
        </div>
    `;
    
    // Показываем модальное окно
    document.getElementById('completeTaskModal').style.display = 'flex';
}

saveTaskCompletion() {
    const taskId = document.getElementById('completeTaskId').value;
    const factAmount = parseFloat(document.getElementById('factAmount').value);
    const completionDate = document.getElementById('completionDate').value;
    
    if (!factAmount || !completionDate) {
        Notification.error('Заполните обязательные поля');
        return;
    }
    
    // Обновляем задачу
    const success = this.updateTaskInPlans(taskId, {
        fact: factAmount,
        dateCompleted: completionDate,
        status: 'completed',
        updatedAt: new Date().toISOString()
    });
    
    if (success) {
        Notification.success('Задача выполнена!');
        this.closeCompleteTaskModal();
        this.loadManagerData();
    }
}

closeCompleteTaskModal() {
    document.getElementById('completeTaskModal').style.display = 'none';
}