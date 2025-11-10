// js/utils.js - ОКОНЧАТЕЛЬНО ИСПРАВЛЕННАЯ ВЕРСИЯ

const Auth = {
  currentUser: null,
  initialized: false,
  
  init: function() {
    if (this.initialized) {
      console.log('🔄 Auth уже инициализирован');
      return;
    }
    
    console.log('🔄 Инициализация системы авторизации...');
    
    // УБИРАЕМ ОЧИСТКУ ДЛЯ ТЕСТИРОВАНИЯ - ЭТО БЫЛА ОШИБКА!
    // localStorage.removeItem('currentUser');
    
    const savedUser = localStorage.getItem('currentUser');
    console.log('💾 Сохраненный пользователь в localStorage:', savedUser);
    
    if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.email && user.name && user.role) {
          this.currentUser = user;
          console.log('✅ Авторизованный пользователь загружен:', this.currentUser);
        } else {
          console.warn('⚠️ Невалидные данные пользователя');
          localStorage.removeItem('currentUser');
        }
      } catch (e) {
        console.error('❌ Ошибка при загрузке пользователя:', e);
        localStorage.removeItem('currentUser');
      }
    } else {
      console.log('🔐 Пользователь не авторизован');
      this.currentUser = null;
    }
    
    this.initialized = true;
    console.log('🏁 Инициализация Auth завершена');
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
      },
      'kurgan@test.ru': { 
        email: 'kurgan@test.ru', 
        name: 'Управляющий Курган', 
        role: 'manager',
        region: 'Курган',
        password: 'manager123'
      }
    };
    
    // УБИРАЕМ PROMISE - ДЕЛАЕМ СИНХРОННЫМ
    const user = users[email];
    
    if (user && user.password === password) {
      this.currentUser = {
        email: user.email,
        name: user.name,
        role: user.role,
        region: user.region
      };
      
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      console.log('✅ Успешный вход:', this.currentUser);
      
      return { success: true, user: this.currentUser };
    } else {
      console.log('❌ Неудачная попытка входа');
      return { success: false, error: 'Неверный email или пароль' };
    }
  },
  
  logout: function() {
    console.log('🚪 Выход из системы');
    this.currentUser = null;
    this.initialized = false;
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
    console.log('🔐 Проверка авторизации для страницы:', window.location.pathname);
    console.log('Текущий пользователь:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('❌ Доступ запрещен - перенаправляем на главную');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 100);
      return false;
    }
    
    console.log('✅ Доступ разрешен для:', this.currentUser.email);
    return true;
  },
  
  // Принудительная очистка для отладки
  clearAuth: function() {
    this.currentUser = null;
    this.initialized = false;
    localStorage.removeItem('currentUser');
    console.log('🧹 Авторизация очищена');
  }
};

// ИСПРАВЛЕННЫЕ УВЕДОМЛЕНИЯ
const Notification = {
  show: function(message, type = 'info', duration = 5000) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      z-index: 1000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      max-width: 400px;
    `;
    
    // Устанавливаем цвет в зависимости от типа
    if (type === 'success') {
      notification.style.background = '#10b981';
    } else if (type === 'error') {
      notification.style.background = '#ef4444';
    } else if (type === 'warning') {
      notification.style.background = '#f59e0b';
    } else {
      notification.style.background = '#3b82f6';
    }
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Показываем с анимацией
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие
    if (duration > 0) {
      setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
          }
        }, 300);
      }, duration);
    }
    
    return notification;
  },
  
  success: function(message, duration = 5000) {
    return this.show('✅ ' + message, 'success', duration);
  },
  
  error: function(message, duration = 5000) {
    return this.show('❌ ' + message, 'error', duration);
  },
  
  warning: function(message, duration = 5000) {
    return this.show('⚠️ ' + message, 'warning', duration);
  },
  
  info: function(message, duration = 5000) {
    return this.show('ℹ️ ' + message, 'info', duration);
  }
};

// 📝 ФОРМЫ И ВАЛИДАЦИЯ
const FormHelper = {
  // Валидация email
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // Валидация обязательных полей
  validateRequired: function(fields) {
    let isValid = true;
    for (const field of fields) {
      if (!field.value.trim()) {
        this.showFieldError(field, 'Это поле обязательно для заполнения');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    }
    return isValid;
  },
  
  // Показать ошибку поля
  showFieldError: function(field, message) {
    field.style.borderColor = '#ef4444';
    
    // Удаляем старую ошибку если есть
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Добавляем сообщение об ошибке
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = '#ef4444';
    errorElement.style.fontSize = '14px';
    errorElement.style.marginTop = '4px';
    errorElement.textContent = message;
    
    field.parentElement.appendChild(errorElement);
  },
  
  // Очистить ошибку поля
  clearFieldError: function(field) {
    field.style.borderColor = '';
    
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  },
  
  // Сброс формы
  resetForm: function(form) {
    form.reset();
    const errors = form.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());
    
    const fields = form.querySelectorAll('.form-control');
    fields.forEach(field => {
      field.style.borderColor = '';
    });
  }
};

// 🎯 РАБОТА С ДАННЫМИ ЗАДАЧ
const TaskManager = {
  // Статусы задач
  statuses: {
    'pending': '⏳ Ожидает выполнения',
    'in_progress': '🔄 В работе', 
    'completed': '✅ Выполнено',
    'cancelled': '❌ Отменено',
    'needs_review': '📝 Требует проверки'
  },
  
  // Получить все задачи (из localStorage)
  getAllTasks: function() {
    try {
      const tasks = localStorage.getItem('tasks');
      return tasks ? JSON.parse(tasks) : [];
    } catch (e) {
      console.error('Ошибка при загрузке задач:', e);
      return [];
    }
  },
  
  // Сохранить задачи
  saveTasks: function(tasks) {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      return true;
    } catch (e) {
      console.error('Ошибка при сохранении задач:', e);
      return false;
    }
  },
  
  // Создать новую задачу
  createTask: function(taskData) {
    const tasks = this.getAllTasks();
    
    const newTask = {
      id: 'task_' + Date.now(),
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
  
  // Обновить задачу
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
  
  // Удалить задачу
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
  
  // Получить задачи для текущего пользователя
  getUserTasks: function() {
    const tasks = this.getAllTasks();
    
    if (!Auth.currentUser) return [];
    
    if (Auth.isAdmin()) {
      return tasks; // Админ видит все задачи
    } else if (Auth.isManager()) {
      // Управляющий видит только свои задачи
      return tasks.filter(task => 
        task.responsibleManager === Auth.currentUser.name ||
        task.region === Auth.currentUser.region
      );
    }
    
    return [];
  }
};

// 🎨 УТИЛИТЫ ДЛЯ РАБОТЫ С DOM
const DOMHelper = {
  // Создать элемент с атрибутами
  createElement: function(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    }
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  }
};

// 📊 УТИЛИТЫ ДЛЯ ФОРМАТИРОВАНИЯ
const FormatHelper = {
  // Форматирование даты
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
  
  // Форматирование суммы
  formatAmount: function(amount) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  }
};

// НЕ ИНИЦИАЛИЗИРУЕМ АВТОРИЗАЦИЮ АВТОМАТИЧЕСКИ!
// Пусть каждая страница сама решает когда вызывать Auth.init()

// Делаем утилиты глобально доступными
window.Auth = Auth;
window.Notification = Notification;
window.FormHelper = FormHelper;
window.TaskManager = TaskManager;
window.DOMHelper = DOMHelper;
window.FormatHelper = FormatHelper;

console.log('🔧 Utils.js загружен, Auth НЕ инициализирован автоматически');