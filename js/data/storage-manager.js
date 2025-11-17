// js/data/storage-manager.js
const StorageManager = {
    // Ключи для localStorage
    KEYS: {
        MONTHLY_PLANS: 'monthlyPlans',
        TASKS: 'tasks',
        USER_PREFERENCES: 'userPrefs',
        TEMPLATES: 'taskTemplates'
    },

    // Инициализация всех данных
    initializeAllData() {
        console.log('🔄 Инициализация всех данных...');
        
        // 1. Инициализируем планы месяцев
        this.initializeMonthlyPlans();
        
        // 2. Инициализируем демо-задачи
        if (typeof DemoTasksData !== 'undefined') {
            DemoTasksData.initializeDemoData();
        }
        
        // 3. Инициализируем регионы
        if (typeof RegionsInitialData !== 'undefined') {
            RegionsInitialData.init();
        }
        
        console.log('✅ Все данные инициализированы');
    },

    // Инициализация планов месяцев
    initializeMonthlyPlans() {
        const savedPlans = localStorage.getItem(this.KEYS.MONTHLY_PLANS);
        
        if (!savedPlans) {
            // Первая загрузка - сохраняем демо-данные
            localStorage.setItem(this.KEYS.MONTHLY_PLANS, JSON.stringify(MonthlyPlansData));
            console.log('✅ Демо-планы сохранены в localStorage');
        } else {
            // Мержим существующие данные с новыми
            const existingPlans = JSON.parse(savedPlans);
            const mergedPlans = this.mergePlansData(existingPlans, MonthlyPlansData);
            localStorage.setItem(this.KEYS.MONTHLY_PLANS, JSON.stringify(mergedPlans));
            console.log('✅ Планы обновлены и сохранены');
        }
    },

    // Умное слияние данных планов
    mergePlansData(existing, newData) {
        const merged = { ...newData };
        
        Object.keys(existing).forEach(region => {
            if (!merged[region]) {
                merged[region] = existing[region];
            } else {
                // Мержим задачи по неделям
                for (let week = 1; week <= 4; week++) {
                    const weekKey = `week${week}`;
                    if (existing[region][weekKey] && existing[region][weekKey].tasks) {
                        // Сохраняем существующие задачи, но обновляем структуру
                        merged[region][weekKey].tasks = [
                            ...existing[region][weekKey].tasks
                        ];
                    }
                }
            }
        });
        
        return merged;
    },

    // Автосохранение с дебаунсом
    autoSave(key, data, delay = 1000) {
        clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
            this.save(key, data);
        }, delay);
    },

    // Простое сохранение
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            Notification.error('Ошибка сохранения данных');
            return false;
        }
    },

    // Загрузка данных
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            return defaultValue;
        }
    }
};

window.StorageManager = StorageManager;