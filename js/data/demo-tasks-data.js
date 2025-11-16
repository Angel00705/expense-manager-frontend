// js/data/demo-tasks-data.js - ДЕМО-ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ
console.log('📋 Загрузка демо-задач...');

const DemoTasksData = {
    generateDemoTasks() {
        const regions = ['Астрахань', 'Бурятия', 'Курган', 'Калмыкия', 'Мордовия', 'Удмуртия'];
        const categories = ['products', 'household', 'medicaments', 'stationery', 'cafe', 'repairs', 'azs'];
        const statuses = ['pending', 'in_progress', 'completed'];
        
        const demoTasks = [];
        
        regions.forEach(region => {
            const ips = window.appData?.getIPsByRegion(region) || [`ИП Демо ${region}`];
            
            // Создаем по 3-5 задач для каждого региона
            for (let i = 1; i <= 5; i++) {
                const task = {
                    id: `demo_${region}_${i}_${Date.now()}`,
                    title: `Демо задача ${i} - ${region}`,
                    description: `Это демонстрационная задача для тестирования интерфейса в регионе ${region}`,
                    region: region,
                    ip: ips[Math.floor(Math.random() * ips.length)],
                    expenseItem: categories[Math.floor(Math.random() * categories.length)],
                    plannedAmount: Math.floor(Math.random() * 10000) + 1000,
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    responsibleManager: `Менеджер ${region}`,
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
                    dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
                };
                
                // Для некоторых задач добавляем фактические данные
                if (task.status === 'completed') {
                    task.factAmount = task.plannedAmount * (0.8 + Math.random() * 0.4); // ±20%
                    task.dateCompleted = new Date().toISOString();
                }
                
                demoTasks.push(task);
            }
        });
        
        return demoTasks;
    },
    
    initializeDemoData() {
        // Проверяем, есть ли уже задачи
        const existingTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        if (existingTasks.length === 0) {
            console.log('🔄 Создание демо-задач...');
            const demoTasks = this.generateDemoTasks();
            localStorage.setItem('tasks', JSON.stringify(demoTasks));
            console.log(`✅ Создано ${demoTasks.length} демо-задач`);
        } else {
            console.log(`📊 В localStorage уже есть ${existingTasks.length} задач`);
        }
    }
};

// Автоматически инициализируем демо-данные при загрузке
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        DemoTasksData.initializeDemoData();
    }, 2000); // Ждем чтобы остальные модули загрузились
});

window.DemoTasksData = DemoTasksData;