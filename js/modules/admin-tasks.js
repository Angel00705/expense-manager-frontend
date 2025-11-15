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
        // Обработчики для админских функций
        console.log('🔗 Настройка обработчиков для админа');

        // Обработчик для кнопки экспорта
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-secondary';
        exportBtn.innerHTML = '<span class="nav-icon">📤</span>Экспорт в CSV';
        exportBtn.onclick = () => AllTasks.exportToCSV();
        
        // Добавляем кнопку экспорта в заголовок
        const headerActions = document.getElementById('headerActions');
        if (headerActions) {
            headerActions.appendChild(exportBtn);
        }
    }
};