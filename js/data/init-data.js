// js/data/init-data.js - НОВЫЙ ФАЙЛ
console.log('📊 Инициализация данных приложения...');

// Функция для инициализации всех данных
function initializeAppData() {
    console.log('🔄 Инициализация данных...');
    
    // Проверяем и инициализируем MonthlyPlansData
    if (!window.MonthlyPlansData) {
        console.log('📝 Создаем MonthlyPlansData...');
        window.MonthlyPlansData = {
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
                        // ... остальные задачи недели 1
                    ]
                },
                week2: {
                    budget: 20300,
                    reserve: 1500,
                    total: 20300,
                    tasks: [
                        {
                            id: 'kurgan_week2_1',
                            category: 'salary',
                            description: 'Снятие наличных',
                            explanation: 'Есть смысл перенести на последнюю неделю',
                            ip: 'ИП Бобков',
                            card: '',
                            plan: 5000,
                            fact: 0,
                            status: 'planned',
                            dateCompleted: '',
                            responsible: 'Ксения Б.'
                        }
                        // ... остальные задачи недели 2
                    ]
                },
                week3: {
                    budget: 12500,
                    reserve: 1500,
                    total: 12500,
                    tasks: [
                        // ... задачи недели 3
                    ]
                },
                week4: {
                    budget: 13250,
                    reserve: 1500,
                    total: 13250,
                    tasks: [
                        // ... задачи недели 4
                    ]
                }
            },
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
    }
    
    // Проверяем и инициализируем appData
    if (!window.appData) {
        console.log('📝 Создаем appData...');
        window.appData = {
            regions: ['Астрахань', 'Бурятия', 'Курган', 'Калмыкия', 'Мордовия', 'Удмуртия'],
            individualEntrepreneurs: {
                'Астрахань': ['ИП Крутоусов', 'ИП Храмова', 'ИП Янгалышева', 'ИП Наливайко', 'ИП Каширин'],
                'Бурятия': ['ИП Астанови', 'ИП Пинегин', 'ИП Ровда', 'ИП Ильенко'],
                'Курган': ['ИП Бондаренко', 'ИП Бобков', 'ИП Дюльгер', 'ИП Федчук', 'ИП Карбышев', 'ИП Овсейко', 'ИП Рябенко'],
                'Калмыкия': ['ИП Ибрагимов', 'ИП Никифорова', 'ИП Ярославцев'],
                'Мордовия': ['ИП Иванов', 'ИП Коротких', 'ИП Яковлева'],
                'Удмуртия': ['ИП Бадалов', 'ИП Емельнов', 'ИП Леонгард', 'ИП Саинова', 'ИП Самсонов', 'ИП Шефер']
            }
        };
    }
    
    console.log('✅ Данные инициализированы');
}

// Запускаем инициализацию при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeAppData();
});