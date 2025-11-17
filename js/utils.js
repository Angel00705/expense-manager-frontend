// js/utils.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
console.log('🔧 Загрузка utils.js...');

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Auth !== 'undefined') {
        Auth.init();
        console.log('✅ Auth система готова');
    }
});

const Auth = {
  currentUser: null,
  initialized: false,
  
  init: function() {
    if (this.initialized) return;
    
    console.log('🔄 Инициализация Auth...');
    
    const savedUser = localStorage.getItem('currentUser');
    console.log('💾 Сохраненный пользователь:', savedUser);
    
    if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.email) {
          this.currentUser = user;
          console.log('✅ Пользователь загружен:', user.email);
        }
      } catch (e) {
        console.error('❌ Ошибка парсинга пользователя:', e);
        localStorage.removeItem('currentUser');
      }
    }
    
    this.initialized = true;
  },
  
  login: function(email, password) {
    console.log('🔐 Попытка входа:', email);
    
    const users = {
      'admin@test.ru': { 
        email: 'admin@test.ru', 
        name: 'Главный Бухгалтер', 
        role: 'admin',
        password: 'admin123'
      },
      'astrakhan@test.ru': { 
        email: 'astrakhan@test.ru', 
        name: 'Управляющий Астрахань', 
        role: 'manager',
        region: 'Астрахань',
        password: 'manager123'
      },
      'buryatia@test.ru': { 
        email: 'buryatia@test.ru', 
        name: 'Управляющий Бурятия', 
        role: 'manager',
        region: 'Бурятия',
        password: 'manager123'
      }
    };
    
    const user = users[email];
    
    if (user && user.password === password) {
      this.currentUser = {
        email: user.email,
        name: user.name,
        role: user.role,
        region: user.region
      };
      
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      console.log('✅ Успешный вход');
      
      return { success: true, user: this.currentUser };
    } else {
      return { success: false, error: 'Неверный email или пароль' };
    }
  },
  
  logout: function() {
    console.log('🚪 Выход из системы');
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  },
  
  isAdmin: function() {
    return this.currentUser && this.currentUser.role === 'admin';
  },
  
  isManager: function() {
    return this.currentUser && this.currentUser.role === 'manager';
  },
  
  requireAuth: function() {
    if (!this.currentUser) {
      console.log('❌ Нет авторизации - перенаправляем');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
};

// Уведомления
const Notification = {
    show: function(message, type = 'info', autoClose = true) {
        console.log(`🔔 ${type}: ${message}`);
        this.createToast(message, type, autoClose);
    },
    
    success: function(message) {
        this.show('✅ ' + message, 'success');
    },
    
    error: function(message) {
        this.show('❌ ' + message, 'error', false);
    },
    
    info: function(message) {
        this.show('ℹ️ ' + message, 'info');
    },
    
    createToast: function(message, type, autoClose) {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 400px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-weight: 500;
        `;
        
        toast.innerHTML = `
            <span style="font-size: 1.2em;">${this.getIcon(type)}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2em; padding: 4px;">✕</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        if (autoClose) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.transform = 'translateX(400px)';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 4000);
        }
    },
    
    getBackgroundColor: function(type) {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        return colors[type] || colors.info;
    },
    
    getIcon: function(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
};

// TaskManager
const TaskManager = {
  statuses: {
    'pending': '⏳ Ожидает выполнения',
    'in_progress': '🔄 В работе', 
    'completed': '✅ Выполнено',
    'cancelled': '❌ Отменено'
  },
  
  getAllTasks: function() {
    try {
      const tasks = localStorage.getItem('tasks');
      return tasks ? JSON.parse(tasks) : [];
    } catch (e) {
      console.error('Ошибка загрузки задач:', e);
      return [];
    }
  },
  
  saveTasks: function(tasks) {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      return true;
    } catch (e) {
      console.error('Ошибка сохранения задач:', e);
      return false;
    }
  },
  
  createTask: function(taskData) {
    const tasks = this.getAllTasks();
    
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: Auth.currentUser ? Auth.currentUser.email : 'system'
    };
    
    tasks.push(newTask);
    const success = this.saveTasks(tasks);
    
    if (success) {
      console.log('✅ Задача создана:', newTask);
      return newTask;
    } else {
      throw new Error('Ошибка при сохранении задачи');
    }
  },
  
  updateTask: function(taskId, updates) {
    const tasks = this.getAllTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const success = this.saveTasks(tasks);
      if (success) {
        console.log('✅ Задача обновлена:', tasks[taskIndex]);
        return tasks[taskIndex];
      }
    }
    
    console.error('❌ Задача не найдена:', taskId);
    return null;
  },
  
  deleteTask: function(taskId) {
    const tasks = this.getAllTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    const success = this.saveTasks(filteredTasks);
    
    if (success) {
      console.log('✅ Задача удалена:', taskId);
      return true;
    }
    
    return false;
  },
  
  getUserTasks: function() {
    const tasks = this.getAllTasks();
    
    if (!Auth.currentUser) return [];
    
    if (Auth.isAdmin()) {
      return tasks;
    } else if (Auth.isManager()) {
      return tasks.filter(task => 
        task.responsibleManager === Auth.currentUser.name ||
        task.region === Auth.currentUser.region
      );
    }
    
    return [];
  }
};

// Форматирование
const FormatHelper = {
  formatDate: function(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  },
  
  formatAmount: function(amount) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  }
};

// Глобальные функции для модальных окон
function closeAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) modal.style.display = 'none';
}

function closeCompleteTaskModal() {
    const modal = document.getElementById('completeTaskModal');
    if (modal) modal.style.display = 'none';
}

function saveWeeklyTask() {
    Notification.info('Функция сохранения задачи в разработке');
}

function saveTaskCompletion() {
    if (typeof ManagerTasks !== 'undefined') {
        ManagerTasks.saveTaskCompletion();
    } else {
        Notification.info('Завершение задачи в разработке');
    }
}

// Глобальные функции для кнопок
function toggleWeek(week) {
    if (typeof MonthlyPlan !== 'undefined') {
        MonthlyPlan.toggleWeek(week);
    }
}

function toggleAllWeeks() {
    if (typeof MonthlyPlan !== 'undefined') {
        MonthlyPlan.toggleAllWeeks();
    }
}

function addTaskToWeek(week) {
    if (typeof MonthlyPlan !== 'undefined') {
        MonthlyPlan.addTaskToWeek(week);
    }
}

function saveMonthlyPlan() {
    if (typeof MonthlyPlan !== 'undefined') {
        MonthlyPlan.saveMonthlyPlan();
    }
}

// Вспомогательные функции для форматов
function formatCurrency(amount) {
    if (!amount || amount === 0) return '0';
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount));
}

function formatDate(dateString) {
    if (!dateString) return 'Не указана';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    } catch {
        return 'Неверная дата';
    }
}

function getCategoryEmoji(category) {
    const emojis = {
        'products': '🛒', 'household': '🏠', 'medicaments': '💊',
        'stationery': '📎', 'cafe': '☕', 'repairs': '🔧',
        'azs': '⛽', 'salary': '💰', 'shipping': '📦',
        'events': '🎉', 'polygraphy': '🖨️', 'insurance': '🛡️',
        'charity': '❤️', 'equipment': '💻', 'cleaning': '🧹',
        'checks': '🧾', 'carsharing': '🚗', 'rent': '🏢',
        'comm': '💡', 'internet': '🌐', 'ipSalary': '💼'
    };
    return emojis[category] || '📋';
}

function getCategoryName(category) {
    const names = {
        'products': 'Продукты', 'household': 'Хоз. товары',
        'medicaments': 'Медикаменты', 'stationery': 'Канцелярия',
        'cafe': 'Кафе', 'repairs': 'Ремонт', 'azs': 'АЗС',
        'salary': 'Зарплата', 'shipping': 'Отправка',
        'events': 'Мероприятия', 'polygraphy': 'Полиграфия',
        'insurance': 'Страхование', 'charity': 'Благотворительность',
        'equipment': 'Техника', 'cleaning': 'Клининг',
        'checks': 'Чеки', 'carsharing': 'Каршеринг',
        'rent': 'Аренда', 'comm': 'Коммуналка',
        'internet': 'Интернет', 'ipSalary': 'ЗП ИП'
    };
    return names[category] || category;
}
// ДОБАВЬ В КОНЕЦ utils.js
function initializeDemoTasks() {
    const existingTasks = JSON.parse(localStorage.getItem('tasks'));
    if (!existingTasks || existingTasks.length === 0) {
        console.log('🔄 Создание демо-задач для тестирования...');
        
        const demoTasks = [
            {
                id: 'demo_1',
                title: 'Закупка канцелярии',
                description: 'Ручки, бумага, блокноты для офиса',
                region: 'Курган',
                ip: 'ИП Бондаренко',
                expenseItem: 'stationery',
                plannedAmount: 5000,
                status: 'pending',
                responsibleManager: 'Ксения Б.',
                createdAt: new Date().toISOString(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'demo_2', 
                title: 'Заправка автомобиля',
                description: 'Заправка на АЗС',
                region: 'Курган',
                ip: 'ИП Овсейко',
                expenseItem: 'azs',
                plannedAmount: 3000,
                status: 'completed',
                factAmount: 2850,
                responsibleManager: 'Ксения Б.',
                createdAt: new Date().toISOString(),
                dateCompleted: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('tasks', JSON.stringify(demoTasks));
        console.log('✅ Создано демо-задач:', demoTasks.length);
    }
}
// ДОБАВИТЬ В utils.js
const NotificationSystem = {
    init() {
        console.log('🔔 Инициализация системы уведомлений');
        this.setupDeadlineChecker();
    },
    
    setupDeadlineChecker() {
        // Проверяем дедлайны каждые 30 минут
        setInterval(() => this.checkDeadlines(), 30 * 60 * 1000);
        // Первая проверка через 5 секунд после загрузки
        setTimeout(() => this.checkDeadlines(), 5000);
    },
    
    checkDeadlines() {
        const plans = JSON.parse(localStorage.getItem('monthlyPlans')) || MonthlyPlansData;
        const today = new Date();
        
        Object.keys(plans).forEach(region => {
            for (let week = 1; week <= 4; week++) {
                const weekData = plans[region][`week${week}`];
                if (weekData && weekData.tasks) {
                    weekData.tasks.forEach(task => {
                        if (task.status !== 'completed' && !task.notificationSent) {
                            const deadline = this.getTaskDeadline(week);
                            if (deadline && this.isDeadlineClose(deadline, today)) {
                                this.sendDeadlineNotification(task, region, deadline);
                                task.notificationSent = true;
                            }
                        }
                    });
                }
            }
        });
    },
// ДОБАВИТЬ В utils.js в NotificationSystem
setupDeadlineNotifications() {
    // Ежедневная проверка в 9:00
    this.scheduleDailyCheck();
    
    // Первая проверка при загрузке
    this.checkAllDeadlines();
},

scheduleDailyCheck() {
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setHours(9, 0, 0, 0);
    
    if (now > nextCheck) {
        nextCheck.setDate(nextCheck.getDate() + 1);
    }
    
    const timeUntilCheck = nextCheck.getTime() - now.getTime();
    
    setTimeout(() => {
        this.checkAllDeadlines();
        // Повторяем каждые 24 часа
        setInterval(() => this.checkAllDeadlines(), 24 * 60 * 60 * 1000);
    }, timeUntilCheck);
},

checkAllDeadlines() {
    console.log('🔔 Проверка сроков задач...');
    const plans = StorageManager.load('monthlyPlans') || MonthlyPlansData;
    const today = new Date();
    
    Object.keys(plans).forEach(region => {
        for (let week = 1; week <= 4; week++) {
            const weekData = plans[region][`week${week}`];
            if (weekData && weekData.tasks) {
                weekData.tasks.forEach(task => {
                    if (task.status !== 'completed' && !task.notificationSent) {
                        this.checkTaskDeadline(task, region, week);
                    }
                });
            }
        }
    });
},    
    getTaskDeadline(week) {
        const deadlines = {
            1: '2025-11-07',
            2: '2025-11-14', 
            3: '2025-11-21',
            4: '2025-11-30'
        };
        return deadlines[week];
    },
    
    isDeadlineClose(deadline, today) {
        const deadlineDate = new Date(deadline);
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return daysDiff <= 3 && daysDiff >= 0;
    },
    
    sendDeadlineNotification(task, region, deadline) {
        const deadlineDate = new Date(deadline);
        const daysLeft = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        
        let message = `⏰ Задача "${task.description}" в регионе ${region} `;
        if (daysLeft === 0) {
            message += 'должна быть выполнена сегодня!';
        } else {
            message += `должна быть выполнена через ${daysLeft} дней`;
        }
        
        Notification.warning(message);
    },
    
    // Уведомление для админов о завершении задач
    sendCompletionNotification(task, region, manager) {
        if (Auth.isAdmin()) {
            Notification.info(`✅ Задача "${task.description}" в регионе ${region} выполнена управляющим ${manager}`);
        }
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    if (window.NotificationSystem) {
        NotificationSystem.init();
    }
});

window.NotificationSystem = NotificationSystem;
// Автоматически создаем демо-задачи при загрузке
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeDemoTasks, 1000);
});
// Экспорт в глобальную область
window.Auth = Auth;
window.Notification = Notification;
window.TaskManager = TaskManager;
window.FormatHelper = FormatHelper;

console.log('🔧 Utils.js загружен успешно');