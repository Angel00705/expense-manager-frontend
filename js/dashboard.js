// js/dashboard.js - Функционал для обновленного дашборда

const DashboardManager = {
    currentDate: new Date(),
    
    init: function() {
        this.loadDashboardData();
        this.renderCalendar();
    },
    
    loadDashboardData: function() {
        const tasks = TaskManager.getUserTasks();
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        // Активные задачи
        const activeTasks = tasks.filter(task => 
            task.status === 'pending' || task.status === 'in_progress'
        ).length;
        
        // Выполнено сегодня
        const today = new Date().toDateString();
        const completedToday = tasks.filter(task => {
            if (task.status === 'completed' && task.updatedAt) {
                const taskDate = new Date(task.updatedAt).toDateString();
                return taskDate === today;
            }
            return false;
        }).length;
        
        // Расходы за текущий месяц
        const monthlyExpenses = tasks
            .filter(task => {
                if (task.createdAt) {
                    const taskDate = new Date(task.createdAt);
                    return taskDate.getMonth() === currentMonth && 
                           taskDate.getFullYear() === currentYear;
                }
                return false;
            })
            .reduce((sum, task) => sum + (task.plannedAmount || 0), 0);
        
        // Обновляем статистику
        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedToday').textContent = completedToday;
        document.getElementById('monthlyExpenses').textContent = 
            FormatHelper.formatAmount(monthlyExpenses);
        
        // Загружаем задачи текущего месяца
        this.loadCurrentMonthTasks(tasks);
    },
    
    loadCurrentMonthTasks: function(tasks) {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const currentMonthTasks = tasks
            .filter(task => {
                if (task.createdAt) {
                    const taskDate = new Date(task.createdAt);
                    return taskDate.getMonth() === currentMonth && 
                           taskDate.getFullYear() === currentYear;
                }
                return false;
            })
            .slice(0, 8); // Показываем до 8 задач
        
        this.displayRecentTasks(currentMonthTasks);
        this.updateCalendarTasks(tasks);
    },
    
    displayRecentTasks: function(tasks) {
        const container = document.getElementById('recentTasks');
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-light); padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📋</div>
                    <p>Нет задач за текущий месяц</p>
                    ${Auth.isAdmin() ? 
                        '<a href="create-task.html" class="btn btn-primary" style="margin-top: 16px;">➕ Создать первую задачу</a>' : 
                        ''
                    }
                </div>
            `;
            return;
        }
        
        const tasksHtml = tasks.map(task => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--border-light); transition: var(--transition);">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 4px; font-size: 0.9rem;">${task.title}</div>
                    <div style="font-size: 0.8rem; color: var(--text-light);">
                        ${task.region} • ${FormatHelper.formatDate(task.plannedDate)}
                    </div>
                </div>
                <span class="badge ${task.status === 'completed' ? 'badge-success' : task.status === 'in_progress' ? 'badge-warning' : 'badge-info'}" style="font-size: 0.7rem;">
                    ${TaskManager.statuses[task.status]}
                </span>
            </div>
        `).join('');
        
        container.innerHTML = tasksHtml;
    },
    
    renderCalendar: function() {
        const calendarEl = document.getElementById('taskCalendar');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Заголовки дней недели
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        let calendarHtml = '<div class="calendar-header">';
        
        dayNames.forEach(day => {
            calendarHtml += `<div class="calendar-day-header">${day}</div>`;
        });
        calendarHtml += '</div><div class="calendar">';
        
        // Первый день месяца
        const firstDay = new Date(year, month, 1);
        // Последний день месяца
        const lastDay = new Date(year, month + 1, 0);
        
        // Дни из предыдущего месяца
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // Заполняем календарь
        let dayCount = 1;
        let nextMonthDay = 1;
        
        for (let i = 0; i < 42; i++) { // 6 недель
            let dayNumber;
            let isCurrentMonth = true;
            let isToday = false;
            
            if (i < startingDay) {
                // Дни предыдущего месяца
                dayNumber = prevMonthLastDay - startingDay + i + 1;
                isCurrentMonth = false;
            } else if (dayCount > lastDay.getDate()) {
                // Дни следующего месяца
                dayNumber = nextMonthDay++;
                isCurrentMonth = false;
            } else {
                // Дни текущего месяца
                dayNumber = dayCount++;
                const currentDate = new Date();
                isToday = currentDate.getDate() === dayNumber && 
                         currentDate.getMonth() === month && 
                         currentDate.getFullYear() === year;
            }
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
            const hasTasks = this.hasTasksOnDate(dateStr);
            
            let dayClass = 'calendar-day';
            if (!isCurrentMonth) dayClass += ' other-month';
            if (isToday) dayClass += ' today';
            if (hasTasks) dayClass += ' has-tasks';
            
            calendarHtml += `
                <div class="${dayClass}" onclick="DashboardManager.showDayTasks('${dateStr}')">
                    ${dayNumber}
                </div>
            `;
        }
        
        calendarHtml += '</div>';
        calendarEl.innerHTML = calendarHtml;
    },
    
    // В функции hasTasksOnDate - добавить проверку на существование plannedDate
hasTasksOnDate: function(dateStr) {
    const tasks = TaskManager.getUserTasks();
    return tasks.some(task => {
        if (!task.plannedDate) return false; // Добавить эту проверку
        const taskDate = task.plannedDate.split('T')[0];
        return taskDate === dateStr;
    });
},
    
    showDayTasks: function(dateStr) {
        const tasks = TaskManager.getUserTasks();
        const dayTasks = tasks.filter(task => {
            const taskDate = task.plannedDate ? task.plannedDate.split('T')[0] : '';
            return taskDate === dateStr;
        });
        
        const modal = document.getElementById('calendarModal');
        const modalTitle = document.getElementById('modalDateTitle');
        const tasksList = document.getElementById('modalTasksList');
        
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        modalTitle.textContent = `Задачи на ${formattedDate}`;
        
        if (dayTasks.length === 0) {
            tasksList.innerHTML = `
                <div style="text-align: center; color: var(--text-light); padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📅</div>
                    <p>Нет задач на эту дату</p>
                </div>
            `;
        } else {
            tasksList.innerHTML = dayTasks.map(task => `
                <div class="glass-card" style="padding: 16px; margin-bottom: 12px;">
                    <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 8px;">${task.title}</div>
                    <div style="font-size: 0.8rem; color: var(--text-light); margin-bottom: 8px;">
                        ${task.region} • ${task.ip}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="badge ${task.status === 'completed' ? 'badge-success' : task.status === 'in_progress' ? 'badge-warning' : 'badge-info'}" style="font-size: 0.7rem;">
                            ${TaskManager.statuses[task.status]}
                        </span>
                        <div style="font-weight: 600; color: var(--primary);">
                            ${FormatHelper.formatAmount(task.plannedAmount)}
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'flex';
    }
};

function closeCalendarModal() {
    document.getElementById('calendarModal').style.display = 'none';
}
// В dashboard.js - реализация календаря
function renderTaskCalendar() {
    const tasks = TaskManager.getUserTasks();
    const calendarEl = document.getElementById('taskCalendar');
    
    // Группировка задач по датам
    const tasksByDate = {};
    tasks.forEach(task => {
        const date = task.plannedDate.split('T')[0];
        if (!tasksByDate[date]) tasksByDate[date] = [];
        tasksByDate[date].push(task);
    });
    
    // Отображение календаря
    calendarEl.innerHTML = Object.keys(tasksByDate)
        .map(date => `<div class="calendar-day" onclick="showDateTasks('${date}')">
            ${FormatHelper.formatDate(date)}: ${tasksByDate[date].length} задач
        </div>`)
        .join('');
}
// Закрытие модального окна по клику вне его
document.addEventListener('click', function(event) {
    const modal = document.getElementById('calendarModal');
    if (event.target === modal) {
        closeCalendarModal();
    }
});

window.DashboardManager = DashboardManager;