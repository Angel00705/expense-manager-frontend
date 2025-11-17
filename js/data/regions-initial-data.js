// js/data/regions-initial-data.js
const RegionsInitialData = {
    init() {
        console.log('🔄 Инициализация данных для всех регионов...');
        
        // Проверяем, нужно ли инициализировать
        if (this.shouldInitialize()) {
            this.initializeAllRegions();
            console.log('✅ Данные регионов инициализированы');
        }
    },
    
    shouldInitialize() {
        // Проверяем, есть ли уже данные для других регионов
        const regions = ['Астрахань', 'Бурятия', 'Калмыкия', 'Мордовия', 'Удмуртия'];
        return regions.some(region => 
            !MonthlyPlansData[region] || 
            MonthlyPlansData[region].week1.tasks.length === 0
        );
    },
    
    initializeAllRegions() {
        const regions = ['Астрахань', 'Бурятия', 'Калмыкия', 'Мордовия', 'Удмуртия'];
        
        regions.forEach(region => {
            if (!MonthlyPlansData[region]) {
                MonthlyPlansData[region] = this.createRegionData(region);
            } else {
                // Дополняем существующие данные
                this.fillEmptyWeeks(region);
            }
        });
        
        // Сохраняем в localStorage
        localStorage.setItem('monthlyPlans', JSON.stringify(MonthlyPlansData));
    },
    
    createRegionData(region) {
        const baseBudget = this.getRegionBudget(region);
        const weeklyBudget = Math.floor(baseBudget / 4);
        
        return {
            week1: { 
                budget: weeklyBudget, 
                reserve: 1500, 
                total: weeklyBudget,
                tasks: this.generateWeekTasks(region, 1, weeklyBudget)
            },
            week2: { 
                budget: weeklyBudget, 
                reserve: 1500, 
                total: weeklyBudget,
                tasks: this.generateWeekTasks(region, 2, weeklyBudget)
            },
            week3: { 
                budget: weeklyBudget, 
                reserve: 1500, 
                total: weeklyBudget,
                tasks: this.generateWeekTasks(region, 3, weeklyBudget)
            },
            week4: { 
                budget: weeklyBudget, 
                reserve: 1500, 
                total: weeklyBudget,
                tasks: this.generateWeekTasks(region, 4, weeklyBudget)
            }
        };
    },
    
    generateWeekTasks(region, week, budget) {
        const ips = appData.getIPsByRegion(region);
        if (!ips || ips.length === 0) return [];
        
        // Базовые задачи для каждой недели
        const baseTasks = [
            {
                category: 'products',
                description: 'Базовая закупка продуктов',
                plan: Math.min(2000, budget * 0.3)
            },
            {
                category: 'household', 
                description: 'Хозяйственные товары',
                plan: Math.min(1500, budget * 0.2)
            },
            {
                category: 'azs',
                description: 'Заправка автомобиля',
                plan: Math.min(1000, budget * 0.15)
            }
        ];
        
        return baseTasks.map((task, index) => ({
            id: `${region.toLowerCase()}_week${week}_${index + 1}`,
            category: task.category,
            description: task.description,
            explanation: '',
            ip: ips[0], // Первый ИП в регионе
            card: '',
            plan: task.plan,
            fact: 0,
            status: 'planned',
            dateCompleted: '',
            responsible: 'Система'
        }));
    },
    
    getRegionBudget(region) {
        const budgets = {
            'Астрахань': 45000,
            'Бурятия': 38000,
            'Калмыкия': 32000, 
            'Мордовия': 35000,
            'Удмуртия': 65000
        };
        return budgets[region] || 30000;
    },
    
    fillEmptyWeeks(region) {
        for (let week = 1; week <= 4; week++) {
            const weekKey = `week${week}`;
            if (!MonthlyPlansData[region][weekKey].tasks || 
                MonthlyPlansData[region][weekKey].tasks.length === 0) {
                
                const weeklyBudget = Math.floor(this.getRegionBudget(region) / 4);
                MonthlyPlansData[region][weekKey].tasks = 
                    this.generateWeekTasks(region, week, weeklyBudget);
            }
        }
    }
};

// Автоматическая инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.RegionsInitialData) {
            RegionsInitialData.init();
        }
    }, 1000);
});

window.RegionsInitialData = RegionsInitialData;