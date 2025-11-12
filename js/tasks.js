// ===== TASKS FUNCTIONALITY =====
let allTasks = [];
let selectedTasks = new Set();

function loadTasks() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Загружаем задачи
    allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Фильтруем задачи по регионам для менеджеров
    if (currentUser.role !== 'admin') {
        allTasks = allTasks.filter(task => currentUser.regions.includes(task.region));
    }
    
    renderTasks();
    setupFilters();
}

function renderTasks(tasks = allTasks) {
    const tasksGrid = document.getElementById('tasksGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (tasks.length === 0) {
        tasksGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tasksGrid.innerHTML = tasks.map(task => `
        <div class="task-card ${task.priority ? `priority-${task.priority}` : ''}" data-task-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${task.title || 'Без названия'}</h3>
                <div class="task-actions">
                    <input type="checkbox" class="task-checkbox" onchange="toggleTaskSelection('${task.id}', this.checked)">
                    <button class="btn-icon edit" onclick="editTask('${task.id}')" title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn-icon delete" onclick="deleteTask('${task.id}')" title="Удалить">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="task-meta">
                <div class="task-meta-item">
                    <span>📍</span>
                    <span>${task.region}</span>
                </div>
                <div class="task-meta-item">
                    <span>🏢</span>
                    <span>${task.ip}</span>
                </div>
                <div class="task-meta-item">
                    <span>💰</span>
                    <span>${parseFloat(task.amount || 0).toLocaleString('ru-RU')} ₽</span>
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
                    ${getStatusText(task.status)}
                </div>
                <div class="task-meta-item">
                    <span>👤</span>
                    <span>${task.responsible || 'Не назначен'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const regionFilter = document.getElementById('regionFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    
    [searchInput, statusFilter, regionFilter, priorityFilter].forEach(element => {
        element.addEventListener('change', applyFilters);
        element.addEventListener('input', applyFilters);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const region = document.getElementById('regionFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    
    let filteredTasks = allTasks.filter(task => {
        const matchesSearch = !searchTerm || 
            (task.title && task.title.toLowerCase().includes(searchTerm)) ||
            (task.description && task.description.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !status || task.status === status;
        const matchesRegion = !region || task.region === region;
        const matchesPriority = !priority || task.priority === priority;
        
        return matchesSearch && matchesStatus && matchesRegion && matchesPriority;
    });
    
    renderTasks(filteredTasks);
}

function toggleTaskSelection(taskId, isSelected) {
    if (isSelected) {
        selectedTasks.add(taskId);
    } else {
        selectedTasks.delete(taskId);
    }
    
    updateBulkActions();
}

function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    selectedCount.textContent = `${selectedTasks.size} задач выбрано`;
    
    if (selectedTasks.size > 0) {
        bulkActions.classList.add('show');
    } else {
        bulkActions.classList.remove('show');
    }
}

function completeSelected() {
    if (selectedTasks.size === 0) return;
    
    if (confirm(`Завершить ${selectedTasks.size} задач?`)) {
        allTasks = allTasks.map(task => {
            if (selectedTasks.has(task.id)) {
                return { ...task, status: 'completed' };
            }
            return task;
        });
        
        saveTasks();
        clearSelection();
        renderTasks();
    }
}

function deleteSelected() {
    if (selectedTasks.size === 0) return;
    
    if (confirm(`Удалить ${selectedTasks.size} задач?`)) {
        allTasks = allTasks.filter(task => !selectedTasks.has(task.id));
        saveTasks();
        clearSelection();
        renderTasks();
    }
}

function clearSelection() {
    selectedTasks.clear();
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateBulkActions();
}

function editTask(taskId) {
    // Переход на страницу редактирования
    window.location.href = `create-task.html?edit=${taskId}`;
}

function deleteTask(taskId) {
    if (confirm('Удалить эту задачу?')) {
        allTasks = allTasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'В работе',
        'completed': 'Завершено', 
        'cancelled': 'Отменено'
    };
    return statusMap[status] || 'В работе';
}

function formatDate(dateString) {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadTasks);