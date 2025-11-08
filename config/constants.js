// Конфигурация API
export const API_CONFIG = {
    BASE_URL: 'https://expense-manager-backend-kq9h.onrender.com/api',
    ENDPOINTS: {
        LOGIN: '/auth/login',
        CARDS: '/cards',
        TASKS: '/tasks',
        IPS: '/ips',
        HEALTH: '/health',
        CHECK_DATA: '/check-data'
    },
    TIMEOUT: 10000
};

// Роли пользователей
export const USER_ROLES = {
    ACCOUNTANT: 'accountant',
    MANAGER: 'manager'
};

// Регионы
export const REGIONS = {
    ALL: 'all',
    ASTRAKHAN: 'Астрахань',
    BURYATIA: 'Бурятия (УЛАН-УДЭ)',
    KURGAN: 'Курган',
    KALMYKIA: 'Калмыкия (ЭЛИСТА)',
    MORDOVIA: 'Мордовия (САРАНСК)',
    UDMURTIA: 'Удмуртия (ИЖЕВСК)'
};

// Тестовые пользователи для демонстрации
export const TEST_USERS = [
    { email: 'admin@test.ru', password: '123456', name: 'Администратор', role: 'accountant', region: 'all' },
    { email: 'astrakhan@test.ru', password: '123456', name: 'Управляющий (Астрахань)', role: 'manager', region: 'Астрахань' },
    { email: 'buryatia@test.ru', password: '123456', name: 'Управляющий (Бурятия)', role: 'manager', region: 'Бурятия (УЛАН-УДЭ)' },
    { email: 'kurgan@test.ru', password: '123456', name: 'Управляющий (Курган)', role: 'manager', region: 'Курган' },
    { email: 'kalmykia@test.ru', password: '123456', name: 'Управляющий (Калмыкия)', role: 'manager', region: 'Калмыкия (ЭЛИСТА)' }
];

// Статусы карт
export const CARD_STATUS = {
    IN_REGION: 'в регионе',
    IN_PVZ: 'В ПВЗ',
    RENEW: 'Перевыпустить'
};
