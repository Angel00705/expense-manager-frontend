// js/modules/enhanced-task-modals.js
const EnhancedTaskModals = {
    init() {
        console.log('🔄 Инициализация улучшенных модальных окон');
        this.setupEnhancedModals();
        this.setupBudgetValidation();
        this.setupAutoFill();
    },

    setupEnhancedModals() {
        // Валидация бюджета в реальном времени
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

        // Автозаполнение карт при выборе ИП
        const ipSelect = document.getElementById('taskIP');
        if (ipSelect) {
            ipSelect.addEventListener('change', (e) => {
                this.autoFillCardsForIP(e.target.value);
            });
        }
    },

    setupAutoFill() {
        // Автозаполнение даты выполнения текущей датой
        const completionDate = document.getElementById('completionDate');
        if (completionDate && !completionDate.value) {
            completionDate.value = new Date().toISOString().split('T')[0];
        }
    },

    autoFillCardsForIP(ipName) {
        const cardSelect = document.getElementById('taskCard');
        if (!cardSelect) return;

        const currentRegion = MonthlyPlan.currentRegion;
        const cards = appData.getCardsByRegion(currentRegion);
        
        // Фильтруем карты по выбранному ИП
        const ipCards = cards.filter(card => 
            card.ipName === ipName && 
            (card.corpStatus === 'в регионе' || card.personalStatus === 'в регионе')
        );
        
        cardSelect.innerHTML = '<option value="">Выберите карту</option>' +
            ipCards.map(card => {
                const cardNumber = card.corpCard || card.personalCard;
                const cardType = card.corpCard ? '💳 Корп.' : '👤 Перс.';
                return `<option value="${cardNumber}">${cardType} ${cardNumber}</option>`;
            }).join('');
    },

    validateBudgetInRealTime() {
        const category = document.getElementById('taskCategory')?.value;
        const amount = parseFloat(document.getElementById('taskPlanAmount')?.value) || 0;
        
        if (!category) return;
        
        const validation = MonthlyPlan.validateBudget(category, amount);
        const warningElement = document.getElementById('budgetWarning');
        
        if (!warningElement) return;
        
        if (!validation.isValid) {
            warningElement.innerHTML = this.getWarningHTML(category, amount, validation);
            warningElement.style.display = 'block';
            warningElement.className = 'budget-warning error';
        } else if (amount > 0) {
            warningElement.innerHTML = this.getInfoHTML(validation);
            warningElement.style.display = 'block';
            warningElement.className = 'budget-warning info';
        } else {
            warningElement.style.display = 'none';
        }
    },

    getWarningHTML(category, amount, validation) {
        return `
            <div class="warning-content">
                <span class="warning-icon">⚠️</span>
                <div class="warning-details">
                    <strong>Превышен лимит категории!</strong>
                    <div>Категория: ${MonthlyPlan.getCategoryName(category)}</div>
                    <div>Введено: ${MonthlyPlan.formatCurrency(amount)} ₽</div>
                    <div>Лимит: ${MonthlyPlan.formatCurrency(validation.limit)} ₽</div>
                    <div class="exceeded-amount">
                        Превышение: ${MonthlyPlan.formatCurrency(amount - validation.limit)} ₽
                    </div>
                </div>
            </div>
        `;
    },

    getInfoHTML(validation) {
        return `
            <div class="info-content">
                <span class="info-icon">ℹ️</span>
                <div class="info-details">
                    <strong>В рамках бюджета</strong>
                    <div>Остаток: ${MonthlyPlan.formatCurrency(validation.remaining)} ₽</div>
                </div>
            </div>
        `;
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
            'salary': 'Снятие наличных для выплаты зарплаты',
            'repairs': 'Ремонтные работы в офисе',
            'shipping': 'Отправка товаров и документов'
        };
        
        const descriptionField = document.getElementById('taskDescription');
        if (descriptionField && !descriptionField.value) {
            descriptionField.value = descriptionMap[category] || '';
        }
        
        // Автозаполнение пояснения
        const explanationMap = {
            'products': 'Еженедельная закупка продуктов для офиса',
            'azs': 'Заправка служебного автомобиля',
            'salary': 'Выдача заработной платы сотрудникам'
        };
        
        const explanationField = document.getElementById('taskExplanation');
        if (explanationField && !explanationField.value) {
            explanationField.value = explanationMap[category] || '';
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