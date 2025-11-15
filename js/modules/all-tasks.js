// Модуль для всех задач (интерфейс администратора)
const AllTasks = {
    allTasks: [],
    selectedTasks: new Set(),
    filters: {
        search: '',
        status: '',
        region: '',
        priority: ''
    },

    init() {
        console.log('👁️ Инициализация модуля всех задач');
        this.loadAllTasks();
        this.setupFilters();
        this.setupEventListeners();
        this.renderTasks();
    },

    loadAllTasks() {
        this.allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        console.log('📋 Загружено задач:', this.allTasks.length);
    },

    setupFilters() {
        console.log('🔍 Настройка фильтров');
        // Инициализируем выпадающие списки
        this.initializeFilterOptions();
    },

    initializeFilterOptions() {
        // Заполняем регионы
        const regionFilter = document.getElementById('regionFilter');
        if (regionFilter) {
            const regions = ['Астрахань', 'Бурятия', 'Курган', 'Калмыкия', 'Мордовия', 'Удмуртия'];
            regionFilter.innerHTML = '<option value="">Все регионы</option>' +
                regions.map(region => `<option value="${region}">${region}</option>`).join('');
        }
    },

    setupEventListeners() {
        // Обработчики поиска и фильтров
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const regionFilter = document.getElementById('regionFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        if (searchInput) searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        if (statusFilter) statusFilter.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        if (regionFilter) regionFilter.addEventListener('change', (e) => {
            this.filters.region = e.target.value;
            this.applyFilters();
        });

        if (priorityFilter) priorityFilter.addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.applyFilters();
        });

        // Обработчики массовых действий
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTaskSelection(e.target.dataset.taskId, e.target.checked);
            }
        });
    },

    applyFilters() {
        console.log('🎯 Применение фильтров:', this.filters);
        
        let filteredTasks = this.allTasks.filter(task => {
            const matchesSearch = !this.filters.search || 
                (task.title && task.title.toLowerCase().includes(this.filters.search)) ||
                (task.description && task.description.toLowerCase().includes(this.filters.search)) ||
                (task.ip && task.ip.toLowerCase().includes(this.filters.search));
            
            const matchesStatus = !this.filters.status || task.status === this.filters.status;
            const matchesRegion = !this.filters.region || task.region === this.filters.region;
            const matchesPriority = !this.filters.priority || task.priority === this.filters.priority;
            
            return matchesSearch && matchesStatus && matchesRegion && matchesPriority;
        });
        
        this.renderTasks(filteredTasks);
    },

    renderTasks(tasks = this.allTasks) {
        const tasksGrid = document.getElementById('tasksGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!tasksGrid) return;
        
        if (tasks.length === 0) {
            tasksGrid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        tasksGrid.innerHTML = tasks.map(task => `
            <div class="task-card ${task.priority ? `priority-${task.priority}` : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <h3 class="task-title">${task.title || 'Без названия'}</h3>
                    <div class="task-actions">
                        <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" 
                               ${this.selectedTasks.has(task.id) ? 'checked' : ''}>
                        <button class="btn-icon edit" onclick="AllTasks.editTask('${task.id}')" title="Редактировать">
                            ✏️
                        </button>
                        <button class="btn-icon delete" onclick="AllTasks.deleteTask('${task.id}')" title="Удалить">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="task-meta">
                    <div class="task-meta-item">
                        <span>📍</span>
                        <span>${task.region || 'Не указан'}</span>
                    </div>
                    <div class="task-meta-item">
                        <span>🏢</span>
                        <span>${task.ip || 'Не указан'}</span>
                    </div>
                    <div class="task-meta-item">
                        <span>💰</span>
                        <span>${formatCurrency(task.plannedAmount || task.amount || 0)} ₽</span>
                    </div>
                    <div class="task-meta-item">
                        <span>📅</span>
                        <span>${formatDate(task.createdAt)}</span>
                    </div>
                </div>
                
                ${task.description ? `
                    <div class="task-description">
                        ${task.description}
                    </div>
                ` : ''}
                
                <div class="task-footer">
                    <div class="status-badge status-${task.status || 'pending'}">
                        ${this.getStatusText(task.status)}
                    </div>
                    <div class="task-meta-item">
                        <span>👤</span>
                        <span>${task.responsibleManager || task.responsible || 'Не назначен'}</span>
                    </div>
                </div>

                <!-- Дополнительная информация -->
                <div class="task-additional-info">
                    ${task.factAmount ? `
                        <div class="task-info-item">
                            <span>💸 Факт:</span>
                            <span>${formatCurrency(task.factAmount)} ₽</span>
                        </div>
                    ` : ''}
                    ${task.dateCompleted ? `
                        <div class="task-info-item">
                            <span>✅ Выполнено:</span>
                            <span>${formatDate(task.dateCompleted)}</span>
                        </div>
                    ` : ''}
                    ${task.dueDate ? `
                        <div class="task-info-item">
                            <span>⏰ Срок:</span>
                            <span class="${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'overdue-text' : ''}">
                                ${formatDate(task.dueDate)}
                                ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? ' 🔴 Просрочено' : ''}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    toggleTaskSelection(taskId, isSelected) {
        if (isSelected) {
            this.selectedTasks.add(taskId);
        } else {
            this.selectedTasks.delete(taskId);
        }
        
        this.updateBulkActions();
    },

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (!bulkActions || !selectedCount) return;
        
        selectedCount.textContent = `${this.selectedTasks.size} задач выбрано`;
        
        if (this.selectedTasks.size > 0) {
            bulkActions.classList.add('show');
        } else {
            bulkActions.classList.remove('show');
        }
    },

    completeSelected() {
        if (this.selectedTasks.size === 0) return;
        
        if (confirm(`Завершить ${this.selectedTasks.size} задач?`)) {
            this.allTasks = this.allTasks.map(task => {
                if (this.selectedTasks.has(task.id)) {
                    return { 
                        ...task, 
                        status: 'completed',
                        dateCompleted: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                }
                return task;
            });
            
            this.saveTasks();
            this.clearSelection();
            this.renderTasks();
            Notification.success(`Завершено ${this.selectedTasks.size} задач`);
        }
    },

    deleteSelected() {
        if (this.selectedTasks.size === 0) return;
        
        if (confirm(`Удалить ${this.selectedTasks.size} задач?`)) {
            this.allTasks = this.allTasks.filter(task => !this.selectedTasks.has(task.id));
            this.saveTasks();
            this.clearSelection();
            this.renderTasks();
            Notification.success(`Удалено ${this.selectedTasks.size} задач`);
        }
    },

    clearSelection() {
        this.selectedTasks.clear();
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateBulkActions();
    },

    editTask(taskId) {
        window.location.href = `create-task.html?edit=${taskId}`;
    },

    deleteTask(taskId) {
        if (confirm('Удалить эту задачу?')) {
            this.allTasks = this.allTasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            Notification.success('Задача удалена');
        }
    },

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.allTasks));
        console.log('💾 Задачи сохранены');
    },

    getStatusText(status) {
        const statusMap = {
            'pending': '⏳ Ожидает выполнения',
            'in_progress': '🔄 В работе', 
            'completed': '✅ Выполнено',
            'cancelled': '❌ Отменено'
        };
        return statusMap[status] || status || '⏳ Ожидает выполнения';
    },

    // Экспорт задач в CSV
    exportToCSV() {
        const tasksToExport = this.allTasks.length > 0 ? this.allTasks : this.allTasks;
        
        let csv = 'ID,Название,Регион,ИП,Статус,Плановая сумма,Фактическая сумма,Дата создания,Дата выполнения,Ответственный\n';
        
        tasksToExport.forEach(task => {
            csv += `"${task.id}","${task.title || ''}","${task.region || ''}","${task.ip || ''}","${task.status || ''}",` +
                   `"${task.plannedAmount || task.amount || 0}","${task.factAmount || ''}","${formatDate(task.createdAt)}",` +
                   `"${formatDate(task.dateCompleted)}","${task.responsibleManager || task.responsible || ''}"\n`;
        });
        
        // Создаем и скачиваем файл
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `задачи_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Notification.success('Данные экспортированы в CSV');
    }
};