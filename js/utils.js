// js/utils.js - УТИЛИТЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

// 🔐 СИСТЕМА АВТОРИЗАЦИИ
// 🔐 СИСТЕМА АВТОРИЗАЦИИ (ОБНОВЛЕННАЯ)
const Auth = {
  currentUser: null,
  
  init: function() {
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        console.log('Авторизованный пользователь:', this.currentUser);
      } catch (e) {
        console.error('Ошибка при загрузке пользователя:', e);
        localStorage.removeItem('currentUser');
      }
    }
  },
  
  login: function(email, password) {
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
    
    const user = users[email];
    if (user && user.password === password) {
      this.currentUser = {
        email: user.email,
        name: user.name,
        role: user.role,
        region: user.region
      };
      
      // Сохраняем в localStorage
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      console.log('Успешный вход:', this.currentUser);
      
      return { success: true, user: this.currentUser };
    }
    
    return { success: false, error: 'Неверный email или пароль' };
  },
  
  logout: function() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  },
  
  isAdmin: function() {
    return this.currentUser && this.currentUser.role === 'admin';
  },
  
  isManager: function() {
    return this.currentUser && this.currentUser.role === 'manager';
  },
  
  requireAuth: function(redirectTo = 'index.html') {  // Изменили с login.html на index.html
  if (!this.currentUser) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
  },
  
  // Получить текущего пользователя
  getCurrentUser: function() {
    return this.currentUser;
  }
};

// 🔔 СИСТЕМА УВЕДОМЛЕНИЙ
const Notification = {
  show: function(message, type = 'info', duration = 5000) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Добавляем в тело документа
    document.body.appendChild(notification);
    
    // Показываем с анимацией
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Автоматическое скрытие
    if (duration > 0) {
      setTimeout(() => {
        notification.classList.remove('show');
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
    for (const field of fields) {
      if (!field.value.trim()) {
        this.showFieldError(field, 'Это поле обязательно для заполнения');
        return false;
      }
      this.clearFieldError(field);
    }
    return true;
  },
  
  // Показать ошибку поля
  showFieldError: function(field, message) {
    field.style.borderColor = 'var(--error)';
    
    // Удаляем старую ошибку если есть
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Добавляем сообщение об ошибке
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = 'var(--error)';
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
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  },
  
  // Сохранить задачи
  saveTasks: function(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
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
    this.saveTasks(tasks);
    
    return newTask;
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
      
      this.saveTasks(tasks);
      return tasks[taskIndex];
    }
    
    return null;
  },
  
  // Удалить задачу
  deleteTask: function(taskId) {
    const tasks = this.getAllTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    this.saveTasks(filteredTasks);
    
    return filteredTasks.length !== tasks.length;
  },
  
  // Получить задачи для текущего пользователя
  getUserTasks: function() {
    const tasks = this.getAllTasks();
    
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
  },
  
  // Фильтрация задач
  filterTasks: function(tasks, filters = {}) {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.region && task.region !== filters.region) return false;
      if (filters.responsibleManager && task.responsibleManager !== filters.responsibleManager) return false;
      if (filters.ip && task.ip !== filters.ip) return false;
      
      return true;
    });
  }
};

// 🎨 УТИЛИТЫ ДЛЯ РАБОТЫ С DOM
const DOMHelper = {
  // Создать элемент с атрибутами
  createElement: function(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Устанавливаем атрибуты
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
    
    // Добавляем детей
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  // Очистить контейнер
  clearContainer: function(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  },
  
  // Показать/скрыть элемент
  toggleElement: function(element, show) {
    element.style.display = show ? '' : 'none';
  },
  
  // Добавить обработчик с делегированием
  delegate: function(container, event, selector, handler) {
    container.addEventListener(event, function(e) {
      if (e.target.matches(selector)) {
        handler(e);
      }
    });
  }
};

// 📊 УТИЛИТЫ ДЛЯ ФОРМАТИРОВАНИЯ
const FormatHelper = {
  // Форматирование даты
  formatDate: function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },
  
  // Форматирование суммы
  formatAmount: function(amount) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  },
  
  // Сокращение текста
  truncateText: function(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },
  
  // Получить цвет статуса
  getStatusColor: function(status) {
    const colors = {
      'pending': 'var(--warning)',
      'in_progress': 'var(--info)',
      'completed': 'var(--success)',
      'cancelled': 'var(--error)',
      'needs_review': 'var(--warning)'
    };
    
    return colors[status] || 'var(--text-light)';
  }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  Auth.init();
});

// Делаем утилиты глобально доступными
window.Auth = Auth;
window.Notification = Notification;
window.FormHelper = FormHelper;
window.TaskManager = TaskManager;
window.DOMHelper = DOMHelper;
window.FormatHelper = FormatHelper;