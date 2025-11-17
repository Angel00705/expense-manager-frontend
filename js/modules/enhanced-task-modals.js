// js/modules/enhanced-task-modals.js
const EnhancedTaskModals = {
    init() {
        this.setupEnhancedModals();
        this.setupBudgetValidation();
    },

    setupEnhancedModals() {
        // Динамическая валидация бюджета при вводе
        const planAmountInput = document.getElementById('taskPlanAmount');
        if (planAmountInput) {
            planAmountInput.addEventListener('input', (e) => {
                this.validateBudgetInRealTime();
            });
        }

        // Автозаполнение при выборе категории
        const categorySelect = document.getElementById('taskCategory');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.autoFillFromCategory(e.target.value);
            });
        }
    },

    validateBudgetInRealTime() {
        const category = document.getElementById('taskCategory')?.value;
        const amount = parseFloat(document.getElementById('taskPlanAmount')?.value) || 0;
        
        if (!category) return;
        
        const validation = MonthlyPlan.validateBudget(category, amount);
        const warningElement = document.getElementById('budgetWarning');
        
        if (!warningElement) return;
        
        if (!validation.isValid) {
            warningElement.innerHTML = `
                <div class="warning-message">
                    ⚠️ <strong>Превышен лимит!</strong><br>
                    Категория: ${MonthlyPlan.getCategoryName(category)}<br>
                    Введено: ${MonthlyPlan.formatCurrency(amount)} ₽<br>
                    Лимит: ${MonthlyPlan.formatCurrency(validation.limit)} ₽<br>
                    <em>Превышение: ${MonthlyPlan.formatCurrency(amount - validation.limit)} ₽</em>
                </div>
            `;
            warningElement.style.display = 'block';
        } else if (amount > 0) {
            warningElement.innerHTML = `
                <div class="info-message">
                    ℹ️ <strong>В рамках бюджета</strong><br>
                    Остаток: ${MonthlyPlan.formatCurrency(validation.remaining)} ₽
                </div>
            `;
            warningElement.style.display = 'block';
        } else {
            warningElement.style.display = 'none';
        }
    },

    autoFillFromCategory(category) {
        if (!category) return;
        
        // Автозаполнение описания на основе категории
        const descriptionMap = {
            'products': 'Кофе, чай, сахар, печенье, продукты питания',
            'household': 'Моющие средства, губки, бумажные полотенца',
            'medicaments': 'Аптечка первой помощи, лекарства',
            'stationery': 'Ручки, блокноты, бумага, канцелярские товары',
            'azs': 'Заправка автомобиля на АЗС',
            'salary': 'Снятие наличных для выплаты зарплаты'
        };
        
        const descriptionField = document.getElementById('taskDescription');
        if (descriptionField && !descriptionField.value) {
            descriptionField.value = descriptionMap[category] || '';
        }
        
        // Автовыбор ИП на основе региона
        this.autoSelectIP(category);
    },

    autoSelectIP(category) {
        const currentRegion = MonthlyPlan.currentRegion;
        const ips = appData.getIPsByRegion(currentRegion);
        if (!ips || ips.length === 0) return;
        
        const ipSelect = document.getElementById('taskIP');
        if (!ipSelect) return;
        
        // Простая логика: первый ИП в списке
        if (ipSelect.selectedIndex === 0 && ips.length > 0) {
            ipSelect.value = ips[0];
        }
    }
};

// Интеграция с существующими модальными окнами
if (typeof TaskModals !== 'undefined') {
    // Расширяем функциональность существующих модальных окон
    const originalOpenAddTaskModal = TaskModals.openAddTaskModal;
    TaskModals.openAddTaskModal = function(week) {
        originalOpenAddTaskModal.call(this, week);
        EnhancedTaskModals.validateBudgetInRealTime();
    };
}

window.EnhancedTaskModals = EnhancedTaskModals;