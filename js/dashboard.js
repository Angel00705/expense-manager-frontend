// js/dashboard.js - ЛОГИКА ДАШБОРДА С КАЛЕНДАРЕМ

const DashboardManager = {
    init: function() {
        console.log('📊 Инициализация дашборда...');
        this.loadStatistics();
        this.initCalendar();
        this.loadRecentTasks();
    },

    // ЗАГРУЗКА СТАТИСТИКИ
    loadStatistics: function() {
        try {
            const tasks = TaskManager.getUserTasks();
            
            // Активные задачи
            const activeTasks = tasks.filter(task => 
                task.status === 'pending' || task.status === 'in_progress'
            ).length;
            
            // Задачи выполненные сегодня
            const today = new Date().toISOString().split('T')[0];
            const completedToday = tasks.filter(task => 
                task.status === 'completed' && 
                task.updatedAt && 
                task.updatedAt.includes(today)
            ).length;
            
            // Сумма расходов за месяц
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyExpenses = tasks
                .filter(task => {
                    if (!task.plannedAmount) return false;
                    const taskDate = new Date(task.createdAt);
                    return taskDate.getMonth() === currentMonth && 
                           taskDate.getFullYear() === currentYear;
                })
                .reduce((sum, task) => sum + (parseFloat(task.plannedAmount) || 0), 0);
            
            // Обновляем UI
            document.getElementById('activeTasks').textContent = activeTasks;
            document.getElementById('completedToday').textContent = completedToday;
            document.getElementById('monthlyExpenses').textContent = 
                FormatHelper.formatAmount(monthlyExpenses);
                
        } catch (error) {
            console.error('❌ Ошибка загрузки статистики:', error);
        }
    },

    // ИНИЦИАЛИЗАЦИЯ КАЛЕНДАРЯ
    initCalendar: function() {
        const calendarEl = document.getElementById('taskCalendar');
        if (!calendarEl) return;
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Создаем календарь
        this.renderCalendar(calendarEl, currentMonth, currentYear);
    },

    // ОТРИСОВКА КАЛЕНДАРЯ
    renderCalendar: function(container, month, year) {
        const tasks = TaskManager.getUserTasks();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        let calendarHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0; color: var(--text-dark);">
                    ${this.getMonthName(month)} ${year}
                </h4>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;">
        `;
        
        // Заголовки дней недели
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayNames.forEach(day => {
            calendarHTML += `<div style="font-weight: 600; color: var(--text-light); padding: 8px; font-size: 0.8rem;">${day}</div>`;
        });
        
        // Пустые ячейки до первого дня месяца
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = 0; i < startDay; i++) {
            calendarHTML += `<div style="padding: 8px;"></div>`;
        }
        
        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(task => 
                task.plannedDate && task.plannedDate.includes(dateStr)
            );
            
            const hasTasks = dayTasks.length > 0;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'calendar-today' : ''} ${hasTasks ? 'calendar-has-tasks' : ''}" 
                     onclick="DashboardManager.showDayTasks('${dateStr}')"
                     style="padding: 8px; border-radius: 8px; cursor: pointer; transition: var(--transition);
                            ${isToday ? 'background: var(--primary); color: white;' : ''}
                            ${hasTasks ? 'border: 2px solid var(--success);' : 'border: 1px solid var(--border-light);'}">
                    ${day}
                    ${hasTasks ? '<div style="font-size: 0.6rem; margin-top: 2px;">📌</div>' : ''}
                </div>
            `;
        }
        
        calendarHTML += `</div>`;
        container.innerHTML = calendarHTML;
    },

    // ПОКАЗАТЬ ЗАДАЧИ НА ДЕНЬ
    showDayTasks: function(dateStr) {
        const tasks = TaskManager.getUserTasks();
        const dayTasks = tasks.filter(task => 
            task.plannedDate && task.plannedDate.includes(dateStr)
        );
        
        const modal = document.getElementById('calendarModal');
        const title = document.getElementById('modalDateTitle');
        const tasksList = document.getElementById('modalTasksList');
        
        if (!modal || !title || !tasksList) return;
        
        const date = new Date(dateStr);
        title.textContent = `Задачи на ${date.toLocaleDateString('ru-RU')}`;
        
        if (dayTasks.length === 0) {
            tasksList.innerHTML = `
                <div style="text-align: center; color: var(--text-light); padding: 20px;">
                    <div style="font-size: 2rem; margin-bottom: 8px;">📋</div>
                    <p>Задач на этот день нет</p>
                </div>
            `;
        } else {
            tasksList.innerHTML = dayTasks.map(task => `
                <div class="glass-card" style="padding: 12px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 4px 0; color: var(--text-dark);">${task.title}</h4>
                            <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">${task.region} • ${task.ip}</p>
                            <p style="margin: 4px 0 0 0; color: var(--text-light); font-size: 0.8rem;">
                                ${FormatHelper.formatAmount(task.plannedAmount || 0)}
                            </p>
                        </div>
                        <span class="badge ${this.getStatusBadgeClass(task.status)}" style="font-size: 0.7rem;">
                            ${TaskManager.statuses[task.status] || task.status}
                        </span>
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'block';
    },

    // ЗАКРЫТЬ МОДАЛКУ КАЛЕНДАРЯ
    closeCalendarModal: function() {
        const modal = document.getElementById('calendarModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // ЗАГРУЗКА ПОСЛЕДНИХ ЗАДАЧ
    loadRecentTasks: function() {
        const container = document.getElementById('recentTasks');
        if (!container) return;
        
        try {
            const tasks = TaskManager.getUserTasks();
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const recentTasks = tasks
                .filter(task => {
                    const taskDate = new Date(task.createdAt);
                    return taskDate.getMonth() === currentMonth && 
                           taskDate.getFullYear() === currentYear;
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            
            if (recentTasks.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: var(--text-light); padding: 40px;">
                        <div style="font-size: 3rem; margin-bottom: 16px;">📋</div>
                        <p>Задач в этом месяце пока нет</p>
                        ${Auth.isAdmin() ? 
                            '<a href="create-task.html" class="btn btn-primary" style="margin-top: 16px;">➕ Создать задачу</a>' : 
                            ''
                        }
                    </div>
                `;
                return;
            }
            
            container.innerHTML = recentTasks.map(task => `
                <div class="glass-card" style="padding: 16px; margin-bottom: 12px; transition: var(--transition);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 4px 0; color: var(--text-dark); font-size: 1rem;">${task.title}</h4>
                            <p style="margin: 0; color: var(--text-light); font-size: 0.8rem;">
                                ${task.region} • ${task.ip} • ${FormatHelper.formatDate(task.plannedDate)}
                            </p>
                        </div>
                        <span class="badge ${this.getStatusBadgeClass(task.status)}" style="font-size: 0.7rem;">
                            ${TaskManager.statuses[task.status] || task.status}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--primary); font-weight: 600; font-size: 0.9rem;">
                            ${FormatHelper.formatAmount(task.plannedAmount || 0)}
                        </span>
                        <span style="color: var(--text-light); font-size: 0.8rem;">
                            ${FormatHelper.formatDate(task.createdAt)}
                        </span>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('❌ Ошибка загрузки задач:', error);
            container.innerHTML = `
                <div style="text-align: center; color: var(--error); padding: 20px;">
                    ❌ Ошибка загрузки задач
                </div>
            `;
        }
    },

    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    getMonthName: function(month) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[month];
    },

    getStatusBadgeClass: function(status) {
        switch (status) {
            case 'completed': return 'badge-success';
            case 'in_progress': return 'badge-warning';
            case 'pending': return 'badge-info';
            case 'cancelled': return 'badge-error';
            default: return 'badge-info';
        }
    }
};

// Глобальная функция для закрытия модалки
window.closeCalendarModal = function() {
    DashboardManager.closeCalendarModal();
};

// Экспорт
window.DashboardManager = DashboardManager;
console.log('📊 DashboardManager загружен');