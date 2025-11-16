// js/data.js - ЕДИНЫЙ ФАЙЛ ДАННЫХ
console.log('📊 Загрузка единого файла данных...');

const appData = {
  // 6 регионов
  regions: ['Астрахань', 'Бурятия', 'Курган', 'Калмыкия', 'Мордовия', 'Удмуртия'],
  
  // 28 ИП по регионам
  individualEntrepreneurs: {
    'Астрахань': ['ИП Крутоусов', 'ИП Храмова', 'ИП Янгалышева', 'ИП Наливайко', 'ИП Каширин'],
    'Бурятия': ['ИП Астанови', 'ИП Пинегин', 'ИП Ровда', 'ИП Ильенко'],
    'Курган': ['ИП Бондаренко', 'ИП Бобков', 'ИП Дюльгер', 'ИП Федчук', 'ИП Карбышев', 'ИП Овсейко', 'ИП Рябенко'],
    'Калмыкия': ['ИП Ибрагимов', 'ИП Никифорова', 'ИП Ярославцев'],
    'Мордовия': ['ИП Иванов', 'ИП Коротких', 'ИП Яковлева'],
    'Удмуртия': ['ИП Бадалов', 'ИП Емельнов', 'ИП Леонгард', 'ИП Саинова', 'ИП Самсонов', 'ИП Шефер']
  },

  // Данные карт из real-cards-data.js
  bankCards: window.REAL_CARDS_DATA || [],

  // Статьи расходов
  expenseItems: [
    '📱 Техника', '❤️ Благотворительность', '🧽 Клининг', '🔧 Ремонт', '🤝 Местные контр-ты',
    '🔄 Обмен платежами', '💰 Зарплата', '🛒 Продукты', '🧹 Хоз. товары', '💊 Медикаменты',
    '📎 Канцелярия', '⛽ АЗС', '☕ Кафе', '🖨️ Полиграфия', '🎉 Мероприятия', '📦 Отправка товаров',
    '🛡️ Страхование', '🧾 Чеки ККТ', '🏢 АРЕНДА ОФИСЫ', '💡 КОММ, ОФИСЫ', '🌐 ИНТЕРНЕТ ОФИСЫ',
    '🚗 Каршеринг', '📦 Упаковка'
  ],

  // Планы месяцев (перенесено из monthly-plans-data.js)
  monthlyPlans: {
    'Курган': {
      week1: {
        budget: 26000, reserve: 1500, total: 26000,
        tasks: [
          {
            id: 'kurgan_week1_1', category: 'salary', description: 'Снятие наличных',
            ip: 'ИП Бондаренко', card: '*7254', plan: 3000, fact: 0, status: 'planned',
            dateCompleted: '', responsible: 'Ксения Б.'
          },
          {
            id: 'kurgan_week1_2', category: 'products', description: 'Кофе, чай, сахар, печенье',
            ip: 'ИП Бондаренко', card: '*7254', plan: 1500, fact: 0, status: 'planned',
            dateCompleted: '', responsible: 'Ксения Б.'
          }
          // ... остальные задачи (можно добавить позже)
        ]
      },
      week2: { budget: 20300, reserve: 1500, total: 20300, tasks: [] },
      week3: { budget: 12500, reserve: 1500, total: 12500, tasks: [] },
      week4: { budget: 13250, reserve: 1500, total: 13250, tasks: [] }
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
  },

  // Методы для работы с данными
  getIPsByRegion(region) {
    return this.individualEntrepreneurs[region] || [];
  },

  getCardsByRegion(region) {
    return this.bankCards.filter(card => card.region === region || 
      (card.region && card.region.includes(region)));
  },

  getMonthlyPlan(region) {
    return this.monthlyPlans[region] || this.getEmptyPlan();
  },

  getEmptyPlan() {
    return {
      week1: { budget: 0, reserve: 0, total: 0, tasks: [] },
      week2: { budget: 0, reserve: 0, total: 0, tasks: [] },
      week3: { budget: 0, reserve: 0, total: 0, tasks: [] },
      week4: { budget: 0, reserve: 0, total: 0, tasks: [] }
    };
  }
};

// Делаем данные глобально доступными
window.appData = appData;
console.log('✅ Единый файл данных загружен');