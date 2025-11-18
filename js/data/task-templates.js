// js/data/task-templates.js
const TaskTemplates = {
    templates: [
        {
            id: 'weekly_products',
            name: 'Еженедельная закупка продуктов',
            category: 'products',
            description: 'Кофе, чай, сахар, печенье',
            typicalAmount: 1500,
            defaultIP: 'ИП Бондаренко'
        },
        {
            id: 'weekly_household',
            name: 'Хозяйственные товары',
            category: 'household', 
            description: 'Моющие средства, губки, бумажные полотенца',
            typicalAmount: 2500,
            defaultIP: 'ИП Бобков'
        },
        {
            id: 'monthly_salary',
            name: 'Выдача зарплаты',
            category: 'salary',
            description: 'Снятие наличных для выплаты зарплаты',
            typicalAmount: 5000,
            defaultIP: 'ИП Бондаренко'
        },
        {
            id: 'car_refuel',
            name: 'Заправка автомобиля',
            category: 'azs',
            description: 'Заправка автомобиля на АЗС',
            typicalAmount: 1000,
            defaultIP: 'ИП Овсейко'
        }
    ],
    
    applyTemplate(templateId, week, region) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) {
            Notification.error('Шаблон не найден');
            return;
        }
        
        const newTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: template.category,
            description: template.description,
            explanation: '',
            ip: template.defaultIP,
            card: '',
            plan: template.typicalAmount,
            fact: 0,
            status: 'planned',
            dateCompleted: '',
            responsible: window.app?.currentUser?.name || 'Система'
        };
        
        // Добавляем задачу в указанную неделю
        if (MonthlyPlansData[region] && MonthlyPlansData[region][`week${week}`]) {
            MonthlyPlansData[region][`week${week}`].tasks.push(newTask);
            
            // Сохраняем в localStorage
            localStorage.setItem('monthlyPlans', JSON.stringify(MonthlyPlansData));
            
            Notification.success(`Шаблон "${template.name}" применен`);
            
            // Обновляем отображение
            if (typeof MonthlyPlan !== 'undefined') {
                MonthlyPlan.loadPlanData();
            }
        } else {
            Notification.error('Ошибка применения шаблона');
        }
    },
    
    getTemplatesForCategory(category) {
        return this.templates.filter(template => template.category === category);
    }
};
// ДОБАВЬ В task-templates.js
applyTemplateToWeek(templateId, week, region) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
        Notification.error('Шаблон не найден');
        return;
    }
    
    const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category: template.category,
        description: template.description,
        explanation: template.explanation || '',
        ip: template.defaultIP,
        card: '',
        plan: template.typicalAmount,
        fact: 0,
        status: 'planned',
        dateCompleted: '',
        responsible: window.app?.currentUser?.name || 'Система',
        createdAt: new Date().toISOString()
    };
    
    // Добавляем в указанную неделю
    if (MonthlyPlansData[region] && MonthlyPlansData[region][`week${week}`]) {
        MonthlyPlansData[region][`week${week}`].tasks.push(newTask);
        localStorage.setItem('monthlyPlans', JSON.stringify(MonthlyPlansData));
        Notification.success(`Шаблон "${template.name}" применен к неделе ${week}`);
        
        // Обновляем отображение
        if (typeof MonthlyPlan !== 'undefined') {
            MonthlyPlan.loadPlanData();
        }
    }
},

// Быстрое применение шаблона
quickApplyTemplate(templateId, region) {
    // Применяем к текущей неделе (можно улучшить логику выбора недели)
    const currentWeek = this.getCurrentWeek();
    this.applyTemplateToWeek(templateId, currentWeek, region);
},

getCurrentWeek() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const pastDays = (today - firstDay) / (24 * 60 * 60 * 1000);
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
}
window.TaskTemplates = TaskTemplates;