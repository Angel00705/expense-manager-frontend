// js/data/monthly-plans-data.js
const MonthlyPlansData = {
    'Курган': {
        week1: {
            budget: 26000,
            reserve: 1500,
            total: 26000,
            tasks: [
                {
                    id: 'kurgan_week1_1',
                    category: 'salary',
                    description: 'Снятие наличных',
                    explanation: '',
                    ip: 'ИП Бондаренко',
                    card: '*7254',
                    plan: 3000,
                    fact: 0,
                    status: 'planned',
                    dateCompleted: '',
                    responsible: 'Ксения Б.'
                },
                {
                    id: 'kurgan_week1_2',
                    category: 'products', 
                    description: 'Кофе, чай, сахар, печенье',
                    explanation: '',
                    ip: 'ИП Бондаренко',
                    card: '*7254',
                    plan: 1500,
                    fact: 0,
                    status: 'planned',
                    dateCompleted: '',
                    responsible: 'Ксения Б.'
                }
                // ... остальные задачи недели 1 из CSV
            ]
        },
        week2: {
            budget: 20300,
            reserve: 1500, 
            total: 20300,
            tasks: [
                // ... задачи недели 2 из CSV
            ]
        },
        week3: {
            budget: 12500,
            reserve: 1500,
            total: 12500, 
            tasks: [
                // ... задачи недели 3 из CSV
            ]
        },
        week4: {
            budget: 13250,
            reserve: 1500,
            total: 13250,
            tasks: [
                // ... задачи недели 4 из CSV  
            ]
        }
    },
    
    // ПУСТЫЕ ДАННЫЕ ДЛЯ ДРУГИХ РЕГИОНОВ
    'Астрахань': {
        week1: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week2: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week3: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week4: { budget: 0, reserve: 0, total: 0, tasks: [] }
    },
    'Бурятия': {
        week1: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week2: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week3: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week4: { budget: 0, reserve: 0, total: 0, tasks: [] }
    },
    'Калмыкия': {
        week1: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week2: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week3: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week4: { budget: 0, reserve: 0, total: 0, tasks: [] }
    },
    'Мордовия': {
        week1: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week2: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week3: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week4: { budget: 0, reserve: 0, total: 0, tasks: [] }
    },
    'Удмуртия': {
        week1: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week2: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week3: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week4: { budget: 0, reserve: 0, total: 0, tasks: [] }
    }
};

// Функция для получения плана региона
function getMonthlyPlan(region) {
    return MonthlyPlansData[region] || { 
        week1: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week2: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week3: { budget: 0, reserve: 0, total: 0, tasks: [] },
        week4: { budget: 0, reserve: 0, total: 0, tasks: [] }
    };
}

// Функция для обновления задачи
function updateMonthlyTask(region, week, taskId, updates) {
    const weekKey = `week${week}`;
    const weekData = MonthlyPlansData[region]?.[weekKey];
    if (weekData && weekData.tasks) {
        const taskIndex = weekData.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            MonthlyPlansData[region][weekKey].tasks[taskIndex] = {
                ...MonthlyPlansData[region][weekKey].tasks[taskIndex],
                ...updates
            };
            return true;
        }
    }
    return false;
}