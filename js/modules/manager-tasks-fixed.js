// js/modules/manager-tasks-fixed.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const ManagerTasks = {
    currentUser: null,
    userRegion: null,

    init() {
        console.log('👤 Инициализация модуля управляющего');
        this.currentUser = window.app?.currentUser;
        
        if (!this.currentUser) {
            console.error('❌ Пользователь не найден');
            return;
        }
        
        this.userRegion = this.currentUser.region || this.currentUser.regions?.[0];
        
        if (!this.userRegion) {
            console.error('❌ Не удалось определить регион управляющего');
            return;
        }
        
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
            const userNameElement = document.getElementById('managerUserName');
            const regionNameElement = document.getElementById('managerRegionName');
            
            if (userNameElement) userNameElement.textContent = this.currentUser.name;
            if (regionNameElement) regionNameElement.textContent = this.userRegion;
        }

        // Настраиваем заголовок
        const subtitle = document.getElementById('pageSubtitle');
        if (subtitle) {
            subtitle.textContent = `Задачи в регионе ${this.userRegion}`;
        }

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
            if (btn.closest('.week-section')) {
                btn.style.display = 'none';
            }
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

    filterTasksByUserRegion() {
        console.log(`👀 Фильтрация задач для управляющего: ${this.userRegion}`);
        
        // Скрываем задачи других регионов
        document.querySelectorAll('.task-row').forEach(row => {
            const taskRegion = row.dataset.region;
            if (taskRegion && taskRegion !== this.userRegion) {
                row.style.display = 'none';
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
        
        container.innerHTML = tasks.map(task => this.renderMyTaskCard(task)).join('');
    },

    renderMyTaskCard(task) {
        return `
            <div class="my-task-card" data-task-id="${task.id}">
                <div class="task-main">
                    <div class="task-header">
                        <h4 class="task-title">${task.title || 'Без названия'}</h4>
                        <div class="task-meta">
                            <span class="task-category">${task.expenseItem || 'Общая'}</span>
                            <span class="task-amount">${task.plannedAmount || task.amount || 0} ₽</span>
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
                            <span class="detail-text">
                                ${task.dueDate ? this.formatDate(task.dueDate) : 'Без срока'}
                            </span>
                        </div>
                        <div class="task-detail">
                            <span class="detail-icon">🏢</span>
                            <span class="detail-text">${task.ip || 'Не указан'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-primary btn-sm" onclick="ManagerTasks.startTaskCompletion('${task.id}')">
                        <span class="nav-icon">✅</span>
                        Выполнить
                    </button>
                </div>
            </div>
        `;
    },

    startTaskCompletion(taskId) {
        console.log('✅ Начало выполнения задачи:', taskId);
        
        if (typeof TaskModals !== 'undefined') {
            TaskModals.openCompleteTaskModal(taskId);
        } else {
            // Резервный метод
            this.openSimpleCompletionModal(taskId);
        }
    },

    findTaskById(taskId) {
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        return allTasks.find(task => task.id === taskId);
    },

    openSimpleCompletionModal(taskId) {
        const task = this.findTaskById(taskId);
        if (!task) {
            this.showNotification('Задача не найдена', 'error');
            return;
        }
        
        const factAmount = prompt(`Введите фактическую сумму для задачи:\n"${task.description}"\n\nПлан: ${task.plannedAmount || task.amount} ₽`, task.plannedAmount || task.amount || '');
        
        if (factAmount !== null) {
            const amount = parseFloat(factAmount);
            if (!isNaN(amount)) {
                this.completeTaskSimple(taskId, amount);
            } else {
                this.showNotification('Неверная сумма', 'error');
            }
        }
    },

    completeTaskSimple(taskId, factAmount) {
        const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const updatedTasks = allTasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    factAmount: factAmount,
                    status: 'completed',
                    dateCompleted: new Date().toISOString()
                };
            }
            return task;
        });
        
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        this.showNotification('Задача выполнена!', 'success');
        this.loadMyTasks();
    },

    setupEventListeners() {
        const myTasksSearch = document.getElementById('myTasksSearch');
        const myTasksStatus = document.getElementById('myTasksStatus');
        const myTasksWeek = document.getElementById('myTasksWeek');
        
        if (myTasksSearch) myTasksSearch.addEventListener('input', () => this.filterMyTasks());
        if (myTasksStatus) myTasksStatus.addEventListener('change', () => this.filterMyTasks());
        if (myTasksWeek) myTasksWeek.addEventListener('change', () => this.filterMyTasks());
    },

    filterMyTasks() {
        this.loadMyTasks();
    },

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch {
            return dateString;
        }
    },

    showNotification(message, type = 'info') {
        if (typeof Notification !== 'undefined') {
            Notification[type === 'error' ? 'error' : 'success'](message);
        } else {
            alert(`${type === 'error' ? '❌' : '✅'} ${message}`);
        }
    }
};

// Глобальные функции для модальных окон
window.saveTaskCompletion = function() {
    if (window.ManagerTasks) {
        ManagerTasks.saveTaskCompletion();
    }
};

window.closeCompleteTaskModal = function() {
    if (window.ManagerTasks) {
        ManagerTasks.closeCompleteTaskModal();
    }
};