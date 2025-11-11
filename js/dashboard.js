// ===== DASHBOARD FUNCTIONALITY =====
function loadDashboardData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Загружаем задачи
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const userTasks = currentUser.role === 'admin' ? 
        tasks : 
        tasks.filter(task => currentUser.regions.includes(task.region));

    updateStatistics(userTasks);
    updateRecentTasks(userTasks);
}

function updateStatistics(tasks) {
    // Общие расходы
    const totalExpenses = tasks
        .filter(task => task.status === 'completed')
        .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
    
    document.getElementById('totalExpenses').textContent = 
        totalExpenses.toLocaleString('ru-RU') + ' ₽';

    // Активные задачи
    const activeTasks = tasks.filter(task => task.status === 'pending').length;
    document.getElementById('activeTasks').textContent = activeTasks;

    // Завершенные задачи
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    document.getElementById('completedTasks').textContent = completedTasks;

    // Активные ИП (уникальные)
    const activeIPs = new Set(tasks.map(task => task.ip)).size;
    document.getElementById('activeIPs').textContent = activeIPs;
}

function updateRecentTasks(tasks) {
    const recentTasksContainer = document.getElementById('recentTasks');
    const recentTasks = tasks.slice(-5).reverse(); // Последние 5 задач

    if (recentTasks.length === 0) {
        recentTasksContainer.innerHTML = `
            <div class="task-item">
                <div class="task-info">
                    <h4>Задач пока нет</h4>
                    <div class="task-meta">Создайте первую задачу</div>
                </div>
            </div>
        `;
        return;
    }

    recentTasksContainer.innerHTML = recentTasks.map(task => `
        <div class="task-item">
            <div class="task-info">
                <h4>${task.title || 'Без названия'}</h4>
                <div class="task-meta">
                    <span>Регион: ${task.region}</span>
                    <span>ИП: ${task.ip}</span>
                    <span>Сумма: ${parseFloat(task.amount || 0).toLocaleString('ru-RU')} ₽</span>
                </div>
            </div>
            <div class="task-status status-${task.status === 'completed' ? 'completed' : 'pending'}">
                ${task.status === 'completed' ? 'Завершено' : 'В работе'}
            </div>
        </div>
    `).join('');
}

// Инициализация дашборда
document.addEventListener('DOMContentLoaded', loadDashboardData);