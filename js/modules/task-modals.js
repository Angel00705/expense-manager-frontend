// js/modules/task-modals.js - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ
const TaskModals = {
    currentWeek: null,
    currentTask: null,

    init() {
        console.log('🪟 Инициализация модальных окон задач');
        this.setupModalListeners();
    },

    setupModalListeners() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },

    openAddTaskModal(week) {
        this.currentWeek = week;
        
        const modal = document.getElementById('addTaskModal');
        const weekNumber = document.getElementById('modalWeekNumber');
        const weekInput = document.getElementById('modalWeek');
        
        if (weekNumber) weekNumber.textContent = week;
        if (weekInput) weekInput.value = week;

        this.populateIPSelect();
        this.populateCardSelect();
        
        modal.style.display = 'flex';
        
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

    populateCardSelect() {
        const cardSelect = document.getElementById('taskCard');
        if (!cardSelect) return;

        const currentRegion = MonthlyPlan.currentRegion;
        const cards = appData.getCardsByRegion(currentRegion);
        
        cardSelect.innerHTML = '<option value="">Выберите карту</option>' +
            cards.filter(card => card.corpStatus === 'в регионе' || card.personalStatus === 'в регионе')
                .map(card => {
                    const cardNumber = card.corpCard || card.personalCard;
                    return `<option value="${cardNumber}">${card.ipName} - ${cardNumber}</option>`;
                }).join('');
    },

    closeAddTaskModal() {
        const modal = document.getElementById('addTaskModal');
        if (modal) modal.style.display = 'none';
        
        const form = document.getElementById('addTaskForm');
        if (form) form.reset();
    },

    openCompleteTaskModal(taskId) {
        const taskInfo = this.findTaskById(taskId);
        if (!taskInfo) {
            Notification.error('Задача не найдена');
            return;
        }

        this.currentTask = taskInfo.task;
        this.currentWeek = taskInfo.week;

        const modal = document.getElementById('completeTaskModal');
        const taskIdInput = document.getElementById('completeTaskId');
        const taskInfoElement = document.getElementById('completeTaskInfo');
        
        if (taskIdInput) taskIdInput.value = taskId;
        
        if (taskInfoElement) {
            taskInfoElement.innerHTML = `
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
                        ${this.currentTask.explanation ? `
                        <div class="detail-item">
                            <span class="label">Пояснение:</span>
                            <span class="value">${this.currentTask.explanation}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        const dateInput = document.getElementById('completionDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        const amountInput = document.getElementById('factAmount');
        if (amountInput) {
            amountInput.value = this.currentTask.plan || '';
        }

        modal.style.display = 'flex';
    },

    findTaskById(taskId) {
        const planData = appData.getMonthlyPlan(MonthlyPlan.currentRegion);
        
        for (let week = 1; week <= 4; week++) {
            const weekData = planData[`week${week}`];
            if (weekData && weekData.tasks) {
                const task = weekData.tasks.find(t => t.id === taskId);
                if (task) return { task, week };
            }
        }
        return null;
    },

    closeCompleteTaskModal() {
        const modal = document.getElementById('completeTaskModal');
        if (modal) modal.style.display = 'none';
        
        const form = document.getElementById('completeTaskForm');
        if (form) form.reset();
    },

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    },

    saveWeeklyTask() {
        const form = document.getElementById('addTaskForm');
        if (!form) return;

        const category = document.getElementById('taskCategory').value;
        const description = document.getElementById('taskDescription').value;
        const explanation = document.getElementById('taskExplanation').value;
        const ip = document.getElementById('taskIP').value;
        const card = document.getElementById('taskCard').value;
        const planAmount = parseFloat(document.getElementById('taskPlanAmount').value);

        if (!category || !description || !ip || !planAmount) {
            Notification.error('Заполните все обязательные поля (Категория, Описание, ИП, Сумма)');
            return;
        }

        if (!MonthlyPlan.showBudgetWarning(category, planAmount)) {
            return;
        }

        const newTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: category,
            description: description,
            explanation: explanation || '',
            ip: ip,
            card: card || '',
            plan: planAmount,
            fact: 0,
            status: 'planned',
            dateCompleted: '',
            managerComment: '',
            responsible: window.app?.currentUser?.name || 'Система'
        };

        const week = this.currentWeek;
        const region = MonthlyPlan.currentRegion;
        if (MonthlyPlansData[region] && MonthlyPlansData[region][`week${week}`]) {
            MonthlyPlansData[region][`week${week}`].tasks.push(newTask);
            localStorage.setItem('monthlyPlans', JSON.stringify(MonthlyPlansData));
            Notification.success('Задача успешно добавлена!');
            this.closeAddTaskModal();
            MonthlyPlan.loadPlanData();
        } else {
            Notification.error('Ошибка при добавлении задачи');
        }
    },

    saveTaskCompletion() {
        const taskId = document.getElementById('completeTaskId').value;
        const factAmount = parseFloat(document.getElementById('factAmount').value);
        const completionDate = document.getElementById('completionDate').value;
        const notes = document.getElementById('completionNotes').value;

        if (!factAmount || !completionDate) {
            Notification.error('Заполните обязательные поля');
            return;
        }

        // Обновляем задачу через MonthlyPlan
        MonthlyPlan.updateTaskFact(taskId, factAmount);
        MonthlyPlan.updateTaskDate(taskId, completionDate);
        MonthlyPlan.updateTaskComment(taskId, notes);
        
        Notification.success('Задача отмечена как выполненная!');
        this.closeCompleteTaskModal();
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