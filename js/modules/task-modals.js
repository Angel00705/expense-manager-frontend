// js/modules/task-modals.js - МОДАЛЬНЫЕ ОКНА ДЛЯ ЗАДАЧ
const TaskModals = {
    currentWeek: null,
    currentTask: null,

    init() {
        console.log('🪟 Инициализация модальных окон задач');
        this.setupModalListeners();
    },

    setupModalListeners() {
        // Закрытие модальных окон по клику на фон
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },

    // Модальное окно добавления задачи
    openAddTaskModal(week) {
        this.currentWeek = week;
        
        const modal = document.getElementById('addTaskModal');
        const weekNumber = document.getElementById('modalWeekNumber');
        const weekInput = document.getElementById('modalWeek');
        
        if (weekNumber) weekNumber.textContent = week;
        if (weekInput) weekInput.value = week;

        // Заполняем список ИП для текущего региона
        this.populateIPSelect();
        
        // Показываем модальное окно
        modal.style.display = 'flex';
        
        // Фокусируемся на первом поле
        setTimeout(() => {
            const firstInput = document.getElementById('taskCategory');
            if (firstInput) firstInput.focus();
        }, 100);
    },

    populateIPSelect() {
        const ipSelect = document.getElementById('taskIP');
        if (!ipSelect) return;

        const currentRegion = MonthlyPlan.currentRegion;
        const ips = appData.getIPsByRegion(currentRegion);
        
        ipSelect.innerHTML = '<option value="">Выберите ИП</option>' +
            ips.map(ip => `<option value="${ip}">${ip}</option>`).join('');
    },

    closeAddTaskModal() {
        const modal = document.getElementById('addTaskModal');
        if (modal) modal.style.display = 'none';
        
        // Очищаем форму
        const form = document.getElementById('addTaskForm');
        if (form) form.reset();
    },

    // Модальное окно выполнения задачи
    openCompleteTaskModal(taskId) {
        this.currentTask = this.findTaskById(taskId);
        if (!this.currentTask) {
            Notification.error('Задача не найдена');
            return;
        }

        const modal = document.getElementById('completeTaskModal');
        const taskIdInput = document.getElementById('completeTaskId');
        const taskInfo = document.getElementById('completeTaskInfo');
        
        if (taskIdInput) taskIdInput.value = taskId;
        
        // Заполняем информацию о задаче
        if (taskInfo) {
            taskInfo.innerHTML = `
                <div class="task-preview">
                    <h4>${this.currentTask.description}</h4>
                    <div class="task-details">
                        <div class="detail-item">
                            <span class="label">Категория:</span>
                            <span class="value">${MonthlyPlan.getCategoryName(this.currentTask.category)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">ИП:</span>
                            <span class="value">${this.currentTask.ip || 'Не указан'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Плановая сумма:</span>
                            <span class="value">${MonthlyPlan.formatCurrency(this.currentTask.plan)} ₽</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Устанавливаем сегодняшнюю дату по умолчанию
        const dateInput = document.getElementById('completionDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Устанавливаем плановую сумму как значение по умолчанию
        const amountInput = document.getElementById('factAmount');
        if (amountInput) {
            amountInput.value = this.currentTask.plan || '';
        }

        modal.style.display = 'flex';
    },

    findTaskById(taskId) {
        // Ищем задачу в данных MonthlyPlan
        const planData = appData.getMonthlyPlan(MonthlyPlan.currentRegion);
        
        for (let week = 1; week <= 4; week++) {
            const weekData = planData[`week${week}`];
            if (weekData && weekData.tasks) {
                const task = weekData.tasks.find(t => t.id === taskId);
                if (task) return task;
            }
        }
        return null;
    },

    closeCompleteTaskModal() {
        const modal = document.getElementById('completeTaskModal');
        if (modal) modal.style.display = 'none';
        
        // Очищаем форму
        const form = document.getElementById('completeTaskForm');
        if (form) form.reset();
    },

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    },

    // Сохранение новой задачи
    saveWeeklyTask() {
        const form = document.getElementById('addTaskForm');
        if (!form) return;

        const formData = new FormData(form);
        const category = document.getElementById('taskCategory').value;
        const description = document.getElementById('taskDescription').value;
        const ip = document.getElementById('taskIP').value;
        const planAmount = parseFloat(document.getElementById('taskPlanAmount').value);

        // Валидация
        if (!category || !description || !ip || !planAmount) {
            Notification.error('Заполните все обязательные поля');
            return;
        }

        // Создаем новую задачу
        const newTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: category,
            description: description,
            ip: ip,
            plan: planAmount,
            fact: 0,
            status: 'planned',
            dateCompleted: '',
            responsible: window.app?.currentUser?.name || 'Система'
        };

        // Здесь будет логика сохранения в данных
        console.log('✅ Новая задача:', newTask);
        Notification.success('Задача успешно добавлена!');
        
        this.closeAddTaskModal();
        
        // Обновляем отображение
        MonthlyPlan.loadPlanData();
    },

    // Сохранение выполнения задачи
    saveTaskCompletion() {
        const taskId = document.getElementById('completeTaskId').value;
        const factAmount = parseFloat(document.getElementById('factAmount').value);
        const completionDate = document.getElementById('completionDate').value;
        const notes = document.getElementById('completionNotes').value;

        // Валидация
        if (!factAmount || !completionDate) {
            Notification.error('Заполните обязательные поля');
            return;
        }

        // Обновляем задачу
        const updatedTask = {
            ...this.currentTask,
            fact: factAmount,
            dateCompleted: completionDate,
            status: 'completed',
            completionNotes: notes,
            completedBy: window.app?.currentUser?.name
        };

        // Здесь будет логика сохранения в данных
        console.log('✅ Задача выполнена:', updatedTask);
        Notification.success('Задача отмечена как выполненная!');
        
        this.closeCompleteTaskModal();
        
        // Обновляем отображение
        MonthlyPlan.loadPlanData();
    }
};

// Глобальные функции для HTML
window.closeAddTaskModal = function() {
    TaskModals.closeAddTaskModal();
};

window.closeCompleteTaskModal = function() {
    TaskModals.closeCompleteTaskModal();
};

window.saveWeeklyTask = function() {
    TaskModals.saveWeeklyTask();
};

window.saveTaskCompletion = function() {
    TaskModals.saveTaskCompletion();
};

window.addTaskToWeek = function(week) {
    TaskModals.openAddTaskModal(week);
};