// Управление статьями расходов
let currentExpenseItemId = null;

// Загрузка страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadExpenseItems();
    setupExpenseItemForm();
});

// Проверка авторизации
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('userName').textContent = user.name;
}

// Загрузка списка статей расходов
async function loadExpenseItems() {
    try {
        showLoading('expenseItemsContainer');
        
        const expenseItems = await api.get('/expense-items');
        
        if (expenseItems.length === 0) {
            showEmptyState();
            return;
        }
        
        renderExpenseItems(expenseItems);
        
    } catch (error) {
        showError('errorExpenseItems', 'Ошибка загрузки статей расходов: ' + error.message);
    } finally {
        hideLoading('expenseItemsContainer');
    }
}

// Показать состояние "пусто"
function showEmptyState() {
    const container = document.getElementById('expenseItemsContainer');
    container.innerHTML = `
        <div class="empty-state">
            <h3>Статьи расходов не найдены</h3>
            <p>Добавьте первую статью расхода для начала работы</p>
        </div>
    `;
}

// Отображение статей расходов
function renderExpenseItems(expenseItems) {
    const container = document.getElementById('expenseItemsContainer');
    
    container.innerHTML = expenseItems.map(item => `
        <div class="expense-item-card">
            <div class="expense-item-header">
                <h3 class="expense-item-name">${escapeHtml(item.name)}</h3>
                <div class="expense-item-actions">
                    <button onclick="editExpenseItem('${item._id}')" class="btn btn-outline">
                        ✏️ Редактировать
                    </button>
                    <button onclick="deleteExpenseItem('${item._id}')" class="btn btn-danger">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
            ${item.description ? `<p class="expense-item-description">${escapeHtml(item.description)}</p>` : ''}
            <div class="expense-item-meta">
                Создано: ${new Date(item.createdAt).toLocaleDateString('ru-RU')}
            </div>
        </div>
    `).join('');
}

// Показать форму добавления
function showAddExpenseItemForm() {
    currentExpenseItemId = null;
    document.getElementById('modalTitle').textContent = 'Добавить статью расхода';
    document.getElementById('expenseItemForm').reset();
    document.getElementById('expenseItemModal').style.display = 'block';
}

// Редактирование статьи расхода
async function editExpenseItem(id) {
    try {
        const expenseItem = await api.get(`/expense-items/${id}`);
        
        currentExpenseItemId = id;
        document.getElementById('modalTitle').textContent = 'Редактировать статью расхода';
        document.getElementById('expenseItemName').value = expenseItem.name;
        document.getElementById('expenseItemDescription').value = expenseItem.description || '';
        document.getElementById('expenseItemModal').style.display = 'block';
        
    } catch (error) {
        alert('Ошибка загрузки статьи расхода: ' + error.message);
    }
}

// Настройка формы
function setupExpenseItemForm() {
    const form = document.getElementById('expenseItemForm');
    form.addEventListener('submit', handleExpenseItemSubmit);
}

// Обработка отправки формы
async function handleExpenseItemSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('expenseItemName').value.trim(),
        description: document.getElementById('expenseItemDescription').value.trim()
    };
    
    if (!formData.name) {
        alert('Введите название статьи расхода');
        return;
    }
    
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        formData.createdBy = user._id;
        
        if (currentExpenseItemId) {
            // Редактирование
            await api.put(`/expense-items/${currentExpenseItemId}`, formData);
        } else {
            // Создание
            await api.post('/expense-items', formData);
        }
        
        closeExpenseItemModal();
        loadExpenseItems(); // Перезагружаем список
        
    } catch (error) {
        alert('Ошибка сохранения: ' + error.message);
    }
}

// Удаление статьи расхода
async function deleteExpenseItem(id) {
    if (!confirm('Вы уверены, что хотите удалить эту статью расхода?')) {
        return;
    }
    
    try {
        await api.delete(`/expense-items/${id}`);
        loadExpenseItems(); // Перезагружаем список
    } catch (error) {
        alert('Ошибка удаления: ' + error.message);
    }
}

// Закрытие модального окна
function closeExpenseItemModal() {
    document.getElementById('expenseItemModal').style.display = 'none';
    currentExpenseItemId = null;
}

// Вспомогательные функции
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = '<div class="loading">Загрузка...</div>';
}

function hideLoading(containerId) {
    const loading = document.querySelector(`#${containerId} .loading`);
    if (loading) loading.remove();
}

function showError(containerId, message) {
    document.getElementById(containerId).style.display = 'block';
    document.getElementById(containerId).textContent = message;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Выход
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
