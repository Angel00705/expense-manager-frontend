// js/utils.js - ИСПРАВЛЕННАЯ ВЕРСИЯ АВТОРИЗАЦИИ

const Auth = {
  currentUser: null,
  initialized: false,
  
  init: function() {
    if (this.initialized) {
      console.log('🔄 Auth уже инициализирован');
      return;
    }
    
    console.log('🔄 Инициализация Auth...');
    
    // НЕ очищаем localStorage - это была ошибка!
    const savedUser = localStorage.getItem('currentUser');
    console.log('💾 Сохраненный пользователь:', savedUser ? 'есть' : 'нет');
    
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
    
    // Тестовые пользователи
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

// Простые уведомления
const Notification = {
  show: function(message, type = 'info') {
    console.log(`🔔 ${type}: ${message}`);
    alert(message); // Временное решение
  },
  
  success: function(message) {
    this.show('✅ ' + message, 'success');
  },
  
  error: function(message) {
    this.show('❌ ' + message, 'error');
  },
  
  info: function(message) {
    this.show('ℹ️ ' + message, 'info');
  }
};

// Простые утилиты для форм
const FormHelper = {
  validateRequired: function(fields) {
    for (const field of fields) {
      if (!field.value.trim()) {
        return false;
      }
    }
    return true;
  }
};

// Базовый менеджер задач
const TaskManager = {
  statuses: {
    'pending': '⏳ Ожидает выполнения',
    'in_progress': '🔄 В работе', 
    'completed': '✅ Выполнено'
  },
  
  getAllTasks: function() {
    try {
      const tasks = localStorage.getItem('tasks');
      return tasks ? JSON.parse(tasks) : [];
    } catch (e) {
      return [];
    }
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

// Утилиты форматирования
const FormatHelper = {
  formatDate: function(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
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

// Экспорт в глобальную область
window.Auth = Auth;
window.Notification = Notification;
window.FormHelper = FormHelper;
window.TaskManager = TaskManager;
window.FormatHelper = FormatHelper;

console.log('🔧 Utils.js загружен успешно');