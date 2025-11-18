// Модуль для интерфейса администратора
const AdminTasks = {
    init() {
        console.log('🛠️ Инициализация модуля админа');
        this.setupAdminUI();
        this.setupAdminEventListeners();
    },

    setupAdminUI() {
        console.log('🎨 Настройка UI для админа');
        
        // Показываем все элементы управления
        document.querySelectorAll('.btn-edit, .btn-delete, .btn-add').forEach(btn => {
            btn.style.display = 'flex';
        });

        // Разблокируем редактирование
        document.querySelectorAll('.plan-amount').forEach(element => {
            element.style.pointerEvents = 'auto';
            element.style.opacity = '1';
        });

        // Показываем кнопки массовых операций
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) bulkActions.style.display = 'block';

        // Разблокируем выбор региона
        const planRegionSelect = document.getElementById('planRegion');
        if (planRegionSelect) {
            planRegionSelect.disabled = false;
            planRegionSelect.classList.remove('protected-field');
        }

        // Показываем кнопки управления в плане месяца
        const controlActions = document.querySelector('.plan-controls .control-actions');
        if (controlActions) controlActions.style.display = 'flex';

        // Показываем кнопки "Добавить" в неделях
        document.querySelectorAll('.week-section .btn').forEach(btn => {
            if (btn.textContent.includes('Добавить')) {
                btn.style.display = 'inline-flex';
            }
        });
    },

setupAdminEventListeners() {
    console.log('🔗 Настройка обработчиков для админа');
    // код метода
}, 

setupExportFunctionality() {
    const headerActions = document.getElementById('headerActions');
    if (!headerActions) return;
    
    // Добавляем кнопки экспорта только для админов
    if (this.isAdmin()) {
        const exportHTML = `
            <div class="export-buttons" style="display: flex; gap: 8px; align-items: center;">
                <button class="btn btn-secondary btn-sm" onclick="ExportManager.exportToCSV()" 
                        title="Экспорт всех задач в CSV">
                    <span class="nav-icon">📊</span> CSV
                </button>
                <button class="btn btn-secondary btn-sm" onclick="ExportManager.exportToExcel()" 
                        title="Экспорт всех задач в Excel">
                    <span class="nav-icon">📈</span> Excel
                </button>
            </div>
        `;
        headerActions.insertAdjacentHTML('beforeend', exportHTML);
    }
},

isAdmin() {
    return window.app?.currentUser?.role === 'admin';
}
};
window.AdminTasks = AdminTasks;