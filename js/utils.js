// js/utils.js - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ

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
  show: function(message, type = 'info') {
    console.log(`🔔 ${type}: ${message}`);
    // Временное решение - alert
    if (typeof alert !== 'undefined') {
      alert(message);
    }
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

// ПОЛНЫЙ TaskManager с ВСЕМИ методами
const TaskManager = {
  statuses: {
    'pending': '⏳ Ожидает выполнения',
    'in_progress': '🔄 В работе', 
    'completed': '✅ Выполнено',
    'cancelled': '❌ Отменено'
  },
  
  // Получить все задачи
  getAllTasks: function() {
    try {
      const tasks = localStorage.getItem('tasks');
      return tasks ? JSON.parse(tasks) : [];
    } catch (e) {
      console.error('Ошибка загрузки задач:', e);
      return [];
    }
  },
  
  // Сохранить задачи
  saveTasks: function(tasks) {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      return true;
    } catch (e) {
      console.error('Ошибка сохранения задач:', e);
      return false;
    }
  },
  
  // СОЗДАТЬ задачу
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
  
  // ОБНОВИТЬ задачу
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
  
  // УДАЛИТЬ задачу
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

// Утилиты форматирования
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

// Массовые операции
const BulkOperations = {
  createMultipleTasks: function(tasksData) {
    const results = {
      success: [],
      errors: []
    };
    
    tasksData.forEach((taskData, index) => {
      try {
        const task = TaskManager.createTask(taskData);
        results.success.push(task);
      } catch (error) {
        results.errors.push({ index, error: error.message });
      }
    });
    
    return results;
  },
  
  updateTasksStatus: function(taskIds, newStatus) {
    const results = {
      updated: [],
      errors: []
    };
    
    taskIds.forEach(taskId => {
      const updated = TaskManager.updateTask(taskId, { status: newStatus });
      if (updated) {
        results.updated.push(updated);
      } else {
        results.errors.push(taskId);
      }
    });
    
    return results;
  },
  
  exportTasksToCSV: function(tasks) {
    let csv = 'ID,Название,Регион,ИП,Статус,Сумма,Дата\n';
    
    tasks.forEach(task => {
      csv += `"${task.id}","${task.title}","${task.region}","${task.ip}","${task.status}","${task.plannedAmount}","${task.plannedDate}"\n`;
    });
    
    return csv;
  }
};

// Экспорт в глобальную область
window.Auth = Auth;
window.Notification = Notification;
window.TaskManager = TaskManager;
window.FormatHelper = FormatHelper;
window.BulkOperations = BulkOperations;

console.log('🔧 Utils.js загружен успешно');