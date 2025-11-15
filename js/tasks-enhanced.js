// ===== ENHANCED TASKS FUNCTIONALITY =====
let currentUser = null;
let allTasks = [];
let selectedTasks = new Set();
let expandedWeeks = new Set([1]); // По умолчанию первая неделя развернута
let monthlyPlanData = {};

// Инициализация
function initEnhancedTasks() {
    console.log('🎯 Инициализация расширенной системы задач...');
    
    // Загружаем пользователя
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Загружаем задачи
    loadAllTasks();
    
    // Загружаем данные плана (из localStorage или начальные)
    loadMonthlyPlanData();
    
    // Инициализируем сайдбар регионов
    initializeRegionSidebar();
    
    // Настраиваем защиту данных
    setupDataProtection();
    
    // Настраиваем интерфейс по роли
    setupUserInterface();
    
    // Настраиваем обработчики
    setupEventListeners();
    
    // Загружаем данные для активной вкладки
    loadActiveTab();
    
    console.log('✅ Система задач инициализирована для:', currentUser.name);
}

// Загрузка всех задач
function loadAllTasks() {
    allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    console.log('📋 Загружено задач:', allTasks.length);
}

// Загрузка данных месячного плана
function loadMonthlyPlanData() {
    // Пробуем загрузить из localStorage
    const savedPlans = localStorage.getItem('weeklyPlans');
    if (savedPlans) {
        try {
            const parsedPlans = JSON.parse(savedPlans);
            // Объединяем с начальными данными
            appData.weeklyPlans = { ...appData.weeklyPlans, ...parsedPlans };
            console.log('📅 Загружены планы из localStorage');
        } catch (e) {
            console.error('❌ Ошибка загрузки планов:', e);
        }
    } else {
        // Сохраняем начальные данные
        savePlansToStorage();
    }
}

// ===== СИСТЕМА САЙДБАРА РЕГИОНОВ =====
function initializeRegionSidebar() {
    console.log('📍 Инициализация сайдбара регионов...');
    
    // Создаем список регионов
    renderRegionList();
    
    // Настраиваем обработчики
    setupRegionHandlers();
    
    // Показываем/скрываем сайдбар по роли
    setupSidebarByRole();
}

function renderRegionList() {
    const regionList = document.getElementById('regionList');
    if (!regionList) return;
    
    const regions = [
        { name: 'Курган', ipCount: 7, icon: '🏢' },
        { name: 'Астрахань', ipCount: 5, icon: '🏢' },
        { name: 'Бурятия', ipCount: 4, icon: '🏢' },
        { name: 'Калмыкия', ipCount: 3, icon: '🏢' },
        { name: 'Мордовия', ipCount: 3, icon: '🏢' },
        { name: 'Удмуртия', ipCount: 6, icon: '🏢' }
    ];
    
    regionList.innerHTML = regions.map(region => `
        <div class="region-item" data-region="${region.name}">
            <span class="region-icon">${region.icon}</span>
            <span class="region-name">${region.name}</span>
            <span class="region-badge">${region.ipCount} ИП</span>
        </div>
    `).join('');
    
    // Активируем первый регион по умолчанию
    const firstRegion = regionList.querySelector('.region-item');
    if (firstRegion) {
        firstRegion.classList.add('active');
        loadRegionData(firstRegion.dataset.region);
    }
}

function setupRegionHandlers() {
    // Обработчики клика по регионам
    document.addEventListener('click', (e) => {
        const regionItem = e.target.closest('.region-item');
        if (regionItem) {
            const region = regionItem.dataset.region;
            switchRegion(region);
        }
    });
}

function switchRegion(regionName) {
    console.log(`🔄 Переключение на регион: ${regionName}`);
    
    // Обновляем активный элемент
    document.querySelectorAll('.region-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-region="${regionName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Загружаем данные региона
    loadRegionData(regionName);
    
    // Обновляем выпадающий список в плане месяца
    updatePlanRegionSelector(regionName);
}

function loadRegionData(regionName) {
    console.log(`📥 Загрузка данных региона: ${regionName}`);
    
    // Показываем информационную панель
    const infoPanel = document.getElementById('regionInfoPanel');
    if (infoPanel) infoPanel.style.display = 'block';
    
    // Обновляем информацию о регионе
    updateRegionInfo(regionName);
    
    // Загружаем ИП региона
    updateRegionIPs(regionName);
    
    // Обновляем статистику
    updateRegionStats(regionName);
}

function updateRegionInfo(regionName) {
    document.getElementById('currentRegionName').textContent = regionName;
}

function updateRegionIPs(regionName) {
    const ipList = document.getElementById('regionIpList');
    if (!ipList) return;
    
    // Получаем ИП региона из реальных данных
    const regionIPs = REAL_CARDS_DATA.filter(ip => 
        getCorrectRegionForIP(ip) === regionName
    );
    
    ipList.innerHTML = regionIPs.map(ip => `
        <div class="ip-info">
            <span class="ip-name">${normalizeIPName(ip.ipName)}</span>
            <div class="ip-cards">
                ${ip.corpCard && ip.corpCard !== '-' && ip.corpCard !== '--' ? 
                    `<span class="card-badge">💳 Корп. ${formatCardNumber(ip.corpCard)}</span>` : ''}
                ${ip.personalCard && ip.personalCard !== '-' && ip.personalCard !== '--' ? 
                    `<span class="card-badge">💳 Физ. ${formatCardNumber(ip.personalCard)}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    // Обновляем счетчики
    document.getElementById('ipCount').textContent = regionIPs.length;
    
    const activeCards = regionIPs.reduce((count, ip) => {
        return count + 
            (ip.corpCard && ip.corpCard !== '-' && ip.corpCard !== '--' ? 1 : 0) +
            (ip.personalCard && ip.personalCard !== '-' && ip.personalCard !== '--' ? 1 : 0);
    }, 0);
    
    document.getElementById('activeCardsCount').textContent = activeCards;
}

function updateRegionStats(regionName) {
    // Здесь будем подтягивать бюджет региона из системы бюджетов
    const budgetData = getBudgetData(regionName, '2024-11');
    const totalBudget = budgetData.total || 0;
    
    document.getElementById('regionBudget').textContent = formatCurrency(totalBudget) + ' ₽';
}

function updatePlanRegionSelector(regionName) {
    const planRegionSelect = document.getElementById('planRegion');
    if (planRegionSelect) {
        planRegionSelect.value = regionName;
        
        // Если пользователь - управляющий, блокируем выбор
        if (currentUser && currentUser.role === 'manager') {
            planRegionSelect.disabled = true;
        }
        
        // Запускаем загрузку плана для нового региона
        loadMonthlyPlan();
    }
}

function setupSidebarByRole() {
    if (currentUser && currentUser.role === 'manager') {
        // Для управляющих скрываем сайдбар
        const sidebar = document.getElementById('regionSidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        
        // Автоматически выбираем регион управляющего
        const userRegion = currentUser.regions[0];
        if (userRegion) {
            updatePlanRegionSelector(userRegion);
        }
    }
}

// ===== СИСТЕМА ЗАЩИТЫ ДАННЫХ =====
function setupDataProtection() {
    if (currentUser.role === 'manager') {
        console.log('🔒 Настройка защиты данных для управляющего');
        
        // Скрываем элементы редактирования
        document.querySelectorAll('.btn-edit, .btn-delete, .btn-add').forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Блокируем редактирование плановых сумм
        document.querySelectorAll('.plan-amount').forEach(element => {
            element.style.pointerEvents = 'none';
            element.style.opacity = '0.8';
        });
        
        // Скрываем кнопки массовых операций
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) bulkActions.style.display = 'none';
        
        // Блокируем выбор региона
        const regionSelect = document.getElementById('planRegion');
        if (regionSelect) {
            regionSelect.disabled = true;
            regionSelect.title = 'Доступен только ваш регион';
        }
        
        // Скрываем кнопки управления в плане месяца
        const controlActions = document.querySelector('.plan-controls .control-actions');
        if (controlActions) controlActions.style.display = 'none';
        
        // Показываем только задачи своего региона
        filterTasksByUserRegion();
    }
}

function filterTasksByUserRegion() {
    if (currentUser.role !== 'manager') return;
    
    const userRegion = currentUser.regions[0];
    console.log(`👀 Фильтрация задач для управляющего: ${userRegion}`);
    
    // Скрываем задачи других регионов
    document.querySelectorAll('.task-row').forEach(row => {
        const taskRegion = row.dataset.region;
        if (taskRegion && taskRegion !== userRegion) {
            row.style.display = 'none';
        }
    });
    
    // Скрываем недели без задач текущего региона
    document.querySelectorAll('.week-section').forEach(section => {
        const weekTasks = section.querySelectorAll('.task-row');
        const visibleTasks = Array.from(weekTasks).filter(task => task.style.display !== 'none');
        
        if (visibleTasks.length === 0) {
            section.style.display = 'none';
        }
    });
}

// ===== НАСТРОЙКА ИНТЕРФЕЙСА ПО РОЛЯМ =====
function setupUserInterface() {
    console.log('👤 Настройка интерфейса для:', currentUser.role);
    
    if (currentUser.role === 'manager') {
        setupManagerView();
    } else {
        setupAdminView();
    }
}

function setupManagerView() {
    const userRegion = currentUser.regions[0];
    
    console.log(`👤 Настройка интерфейса для управляющего: ${userRegion}`);
    
    // Показываем информационную панель
    const infoPanel = document.getElementById('managerInfoPanel');
    if (infoPanel) {
        infoPanel.style.display = 'block';
        document.getElementById('managerUserName').textContent = currentUser.name;
        document.getElementById('managerRegionName').textContent = userRegion;
    }
    
    // Добавляем класс для CSS стилей
    document.body.classList.add('role-manager');
    
    // Скрываем вкладку "Все задачи"
    document.getElementById('tabAllTasks').style.display = 'none';
    
    // Настраиваем заголовок
    document.getElementById('pageSubtitle').textContent = `Задачи в регионе ${userRegion}`;
    
    // Блокируем выбор региона в плане месяца
    const planRegionSelect = document.getElementById('planRegion');
    if (planRegionSelect) {
        planRegionSelect.value = userRegion;
        planRegionSelect.disabled = true;
        planRegionSelect.classList.add('protected-field');
    }
    
    // Скрываем кнопки редактирования в плане месяца
    const controlActions = document.querySelector('.plan-controls .control-actions');
    if (controlActions) controlActions.style.display = 'none';
    
    // Скрываем кнопки "Добавить" в неделях
    document.querySelectorAll('.week-section .btn').forEach(btn => {
        if (btn.textContent.includes('Добавить')) {
            btn.style.display = 'none';
        }
    });
    
    // Обновляем ИП для региона
    updateIPsByRegion(userRegion);
}

function setupAdminView() {
    console.log('🛠️ Настройка интерфейса для администратора');
    
    // Показываем все вкладки
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.style.display = 'flex';
    });
    
    // Активируем сайдбар
    const sidebar = document.getElementById('regionSidebar');
    if (sidebar) sidebar.style.display = 'block';
    
    // Разблокируем выбор региона
    const planRegionSelect = document.getElementById('planRegion');
    if (planRegionSelect) {
        planRegionSelect.disabled = false;
        planRegionSelect.classList.remove('protected-field');
    }
}

// ===== ВКЛАДКА "ПЛАН МЕСЯЦА" =====
function loadMonthlyPlan() {
    const region = document.getElementById('planRegion').value;
    const month = document.getElementById('planMonth').value;
    
    console.log('📅 Загрузка реального плана для:', region, month);
    
    // Загружаем реальные данные вместо заглушек
    const realData = getRealPlanData(region, month);
    updatePlanStatistics(region, month, realData);
    renderRealWeeklyPlan(region, realData);
}

function getRealPlanData(region, month) {
    // Получаем данные из нашей системы
    return appData.getMonthlyPlan(region) || appData.getEmptyPlan();
}

function renderRealWeeklyPlan(region, planData) {
    // Обновляем каждую неделю реальными данными
    [1, 2, 3, 4].forEach(week => {
        const weekData = planData[`week${week}`] || { budget: 0, reserve: 0, total: 0, tasks: [] };
        const completion = calculateWeekCompletion(region, week);
        updateWeekHeader(week, weekData.total, completion);
        renderRealWeekTasks(week, weekData.tasks, region);
    });
    
    updateMonthSummary(planData);
}

function renderRealWeekTasks(week, tasks, region) {
    const tbody = document.getElementById(`week${week}Tasks`);
    
    if (!tbody) return;
    
    if (tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-week">
                    <div class="empty-state-small">
                        <span class="icon">📋</span>
                        <span>Нет запланированных задач</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = tasks.map((task, index) => `
        <tr class="task-row ${task.status}" data-task-id="${task.id}" data-region="${region}">
            <td>
                ${currentUser.role !== 'manager' ? `
                    <input type="checkbox" class="task-checkbox" onchange="toggleTaskSelection('${task.id}', this.checked)">
                ` : ''}
            </td>
            <td>
                <div class="category-badge ${task.category}">
                    ${getCategoryEmoji(task.category)} ${getCategoryName(task.category)}
                </div>
            </td>
            <td>
                <div class="task-description-cell">
                    <div class="task-main-desc">${task.description}</div>
                    ${task.responsible ? `<div class="task-responsible">👤 ${task.responsible}</div>` : ''}
                </div>
            </td>
            <td>
                <div class="ip-info-cell">
                    <div class="ip-name">${task.ip}</div>
                    ${task.card ? `<div class="card-number">${task.card}</div>` : ''}
                </div>
            </td>
            <td class="amount-cell plan-amount">${formatCurrency(task.plan)} ₽</td>
            <td class="amount-cell fact-amount">${task.fact > 0 ? formatCurrency(task.fact) + ' ₽' : '-'}</td>
            <td>
                <span class="status-badge status-${task.status}">
                    ${getStatusText(task.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${currentUser.role !== 'manager' ? `
                        <button class="btn-icon edit" onclick="editWeeklyTask(${week}, '${task.id}')" title="Редактировать">
                            ✏️
                        </button>
                        <button class="btn-icon delete" onclick="deleteWeeklyTask(${week}, '${task.id}')" title="Удалить">
                            🗑️
                        </button>
                    ` : `
                        ${task.status !== 'completed' ? `
                            <button class="btn btn-sm btn-complete" onclick="startTaskCompletion('${task.id}')" title="Выполнить">
                                ✅ Выполнить
                            </button>
                        ` : `
                            <span class="completed-badge">✅ Готово</span>
                        `}
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePlanStatistics(region, month, planData) {
    // Получаем данные бюджета из системы бюджетов
    const budgetData = getBudgetData(region, month);
    const totalPlan = Object.values(planData).reduce((sum, week) => sum + (week.total || 0), 0);
    
    const totalBudget = budgetData.total || 0;
    const totalPlanAmount = totalPlan;
    const remaining = Math.max(0, totalBudget - totalPlanAmount);
    const weeksWithPlan = Object.values(planData).filter(week => week.tasks && week.tasks.length > 0).length;
    
    document.getElementById('monthBudget').textContent = formatCurrency(totalBudget) + ' ₽';
    document.getElementById('monthPlan').textContent = formatCurrency(totalPlanAmount) + ' ₽';
    document.getElementById('monthRemaining').textContent = formatCurrency(remaining) + ' ₽';
    document.getElementById('weeksPlanned').textContent = `${weeksWithPlan}/4`;
}

function updateWeekHeader(week, total, completion) {
    const totalElement = document.getElementById(`week${week}Total`);
    const progressElement = document.querySelector(`[data-week="${week}"] .progress-fill`);
    const progressText = document.querySelector(`[data-week="${week}"] .progress-text`);
    
    if (totalElement) totalElement.textContent = formatCurrency(total) + ' ₽';
    if (progressElement) progressElement.style.width = `${completion.percentage}%`;
    if (progressText) progressText.textContent = `Выполнено: ${completion.percentage}%`;
    
    // Цвет прогресса в зависимости от выполнения
    if (progressElement) {
        if (completion.percentage >= 100) {
            progressElement.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        } else if (completion.percentage >= 80) {
            progressElement.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        } else {
            progressElement.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
        }
    }
}

function updateMonthSummary(planData) {
    const total = Object.values(planData).reduce((sum, week) => sum + (week.total || 0), 0);
    const totalElement = document.getElementById('monthTotal');
    
    if (totalElement) totalElement.textContent = formatCurrency(total) + ' ₽';
    
    // Обновляем breakdown по неделям
    [1, 2, 3, 4].forEach(week => {
        const weekData = planData[`week${week}`] || { total: 0 };
        const percentage = total > 0 ? Math.round((weekData.total / total) * 100) : 0;
        const breakdownElement = document.getElementById(`week${week}Breakdown`);
        
        if (breakdownElement) {
            breakdownElement.textContent = `${formatCurrency(weekData.total)} ₽ (${percentage}%)`;
        }
    });
}

// ===== СИСТЕМА ВЫПОЛНЕНИЯ ЗАДАЧ =====
function startTaskCompletion(taskId) {
    console.log('✅ Начало выполнения задачи:', taskId);
    
    // Находим задачу в данных плана
    const task = findTaskInPlans(taskId);
    
    if (!task) {
        Notification.error('Задача не найдена');
        return;
    }
    
    // Проверяем доступ для управляющего
    if (currentUser.role === 'manager') {
        const userRegion = currentUser.regions[0];
        const taskRegion = getTaskRegion(taskId);
        
        if (taskRegion !== userRegion) {
            Notification.error('У вас нет доступа к этой задаче');
            return;
        }
    }
    
    // Заполняем модальное окно
    document.getElementById('completeTaskId').value = taskId;
    document.getElementById('factAmount').value = task.plan || '';
    document.getElementById('completionDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('completionNotes').value = '';
    
    // Заполняем информацию о задаче
    const taskInfo = document.getElementById('completeTaskInfo');
    taskInfo.innerHTML = `
        <div class="task-preview">
            <h4>${getCategoryEmoji(task.category)} ${getCategoryName(task.category)}</h4>
            <p class="task-description-preview">${task.description}</p>
            <div class="task-details-preview">
                <div class="detail-row">
                    <span class="detail-label">ИП:</span>
                    <span class="detail-value">${task.ip}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Карта:</span>
                    <span class="detail-value">${task.card || 'Не указана'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Плановая сумма:</span>
                    <span class="detail-value">${formatCurrency(task.plan)} ₽</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Ответственный:</span>
                    <span class="detail-value">${task.responsible || 'Не назначен'}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('completeTaskModal').style.display = 'flex';
}

function findTaskInPlans(taskId) {
    // Ищем задачу во всех планах всех регионов
    for (const region in appData.weeklyPlans) {
        for (let week = 1; week <= 4; week++) {
            const weekData = appData.weeklyPlans[region][`week${week}`];
            if (weekData && weekData.tasks) {
                const task = weekData.tasks.find(t => t.id === taskId);
                if (task) return task;
            }
        }
    }
    return null;
}

function getTaskRegion(taskId) {
    // Определяем регион задачи по ID
    if (taskId.includes('kurgan')) return 'Курган';
    if (taskId.includes('astrakhan')) return 'Астрахань';
    if (taskId.includes('buryatia')) return 'Бурятия';
    if (taskId.includes('kalmykia')) return 'Калмыкия';
    if (taskId.includes('mordovia')) return 'Мордовия';
    if (taskId.includes('udmurtia')) return 'Удмуртия';
    return 'Общий';
}

function saveTaskCompletion() {
    const taskId = document.getElementById('completeTaskId').value;
    const factAmount = parseFloat(document.getElementById('factAmount').value);
    const completionDate = document.getElementById('completionDate').value;
    const notes = document.getElementById('completionNotes').value;
    
    if (!factAmount || !completionDate) {
        Notification.error('Заполните обязательные поля: Фактическая сумма и Дата выполнения');
        return;
    }
    
    // Находим и обновляем задачу
    const taskUpdated = updateTaskInPlans(taskId, {
        fact: factAmount,
        dateCompleted: completionDate,
        completionNotes: notes,
        status: 'completed',
        updatedAt: new Date().toISOString(),
        completedBy: currentUser.name
    });
    
    if (taskUpdated) {
        Notification.success('Задача выполнена!');
        closeCompleteTaskModal();
        
        // Перезагружаем данные
        loadActiveTab();
        
        // Синхронизируем с системой задач
        syncWithTaskSystem(taskId, factAmount, completionDate);
    } else {
        Notification.error('Ошибка при сохранении задачи');
    }
}

function updateTaskInPlans(taskId, updates) {
    // Обновляем задачу в данных плана
    for (const region in appData.weeklyPlans) {
        for (let week = 1; week <= 4; week++) {
            const weekKey = `week${week}`;
            if (appData.weeklyPlans[region][weekKey] && appData.weeklyPlans[region][weekKey].tasks) {
                const taskIndex = appData.weeklyPlans[region][weekKey].tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    appData.weeklyPlans[region][weekKey].tasks[taskIndex] = {
                        ...appData.weeklyPlans[region][weekKey].tasks[taskIndex],
                        ...updates
                    };
                    
                    // Сохраняем в localStorage
                    savePlansToStorage();
                    return true;
                }
            }
        }
    }
    return false;
}

function savePlansToStorage() {
    try {
        localStorage.setItem('weeklyPlans', JSON.stringify(appData.weeklyPlans));
        console.log('💾 Планы сохранены в localStorage');
        return true;
    } catch (e) {
        console.error('❌ Ошибка сохранения планов:', e);
        return false;
    }
}

function syncWithTaskSystem(taskId, factAmount, completionDate) {
    // Синхронизируем с основной системой задач
    const task = findTaskInPlans(taskId);
    if (task) {
        const taskData = {
            title: `${getCategoryName(task.category)} - ${task.description}`,
            description: task.description,
            region: getTaskRegion(taskId),
            ip: task.ip,
            plannedAmount: task.plan,
            factAmount: factAmount,
            status: 'completed',
            dateCompleted: completionDate,
            expenseItem: task.category,
            responsibleManager: task.responsible
        };
        
        // Создаем или обновляем задачу в основной системе
        if (window.TaskManager) {
            const existingTask = TaskManager.getAllTasks().find(t => t.originalPlanId === taskId);
            if (existingTask) {
                TaskManager.updateTask(existingTask.id, taskData);
            } else {
                TaskManager.createTask({
                    ...taskData,
                    originalPlanId: taskId,
                    type: 'planned'
                });
            }
        }
    }
}

// ===== ВКЛАДКА "МОИ ЗАДАЧИ" =====
function loadMyTasks() {
    const userRegion = currentUser.regions[0];
    
    // Фильтруем задачи управляющего
    const myTasks = allTasks.filter(task => 
        task.region === userRegion && 
        (task.responsible === currentUser.name || !task.responsible) &&
        task.status !== 'cancelled'
    );
    
    renderMyTasks(myTasks);
    updateMyTasksStats(myTasks);
}

function renderMyTasks(tasks) {
    const container = document.getElementById('myTasksGrid');
    const emptyState = document.getElementById('myTasksEmpty');
    
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Группируем задачи по статусу
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    container.innerHTML = `
        ${pendingTasks.length > 0 ? `
            <div class="tasks-section">
                <h4>📋 Текущие задачи (${pendingTasks.length})</h4>
                <div class="tasks-list">
                    ${pendingTasks.map(task => renderMyTaskCard(task)).join('')}
                </div>
            </div>
        ` : ''}
        
        ${completedTasks.length > 0 ? `
            <div class="tasks-section">
                <h4>✅ Выполненные задачи (${completedTasks.length})</h4>
                <div class="tasks-list completed-tasks">
                    ${completedTasks.map(task => renderMyTaskCard(task)).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

function renderMyTaskCard(task) {
    const isCompleted = task.status === 'completed';
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
    
    return `
        <div class="my-task-card ${task.priority || ''} ${task.status} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
            <div class="task-main">
                <div class="task-header">
                    <h4 class="task-title">${task.title || 'Без названия'}</h4>
                    <div class="task-meta">
                        <span class="task-category">${getCategoryEmoji(task.expenseItem)} ${getCategoryName(task.expenseItem)}</span>
                        <span class="task-amount">${formatCurrency(task.amount)} ₽</span>
                    </div>
                </div>
                
                ${task.description ? `
                    <div class="task-description">
                        ${task.description}
                    </div>
                ` : ''}
                
                <div class="task-details">
                    <div class="task-detail">
                        <span class="detail-icon">📅</span>
                        <span class="detail-text ${isOverdue ? 'overdue-text' : ''}">
                            ${task.dueDate ? formatDate(task.dueDate) : 'Без срока'}
                            ${isOverdue ? ' 🔴 Просрочено' : ''}
                        </span>
                    </div>
                    <div class="task-detail">
                        <span class="detail-icon">🏢</span>
                        <span class="detail-text">${task.ip || 'Не указан'}</span>
                    </div>
                    ${task.weekNumber ? `
                        <div class="task-detail">
                            <span class="detail-icon">📌</span>
                            <span class="detail-text">Неделя ${task.weekNumber}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="task-actions">
                ${isCompleted ? `
                    <div class="completion-info">
                        <div class="fact-amount">Факт: ${formatCurrency(task.factAmount)} ₽</div>
                        <div class="completion-date">${task.dateCompleted ? formatDate(task.dateCompleted) : ''}</div>
                    </div>
                ` : `
                    <button class="btn btn-primary btn-sm" onclick="startTaskCompletion('${task.id}')">
                        <span class="nav-icon">✅</span>
                        Выполнить
                    </button>
                `}
            </div>
        </div>
    `;
}

function updateMyTasksStats(tasks) {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const totalAmount = tasks.reduce((sum, task) => sum + (task.amount || 0), 0);
    
    console.log(`📊 Статистика управляющего: ${pending} в работе, ${completed} выполнено, всего: ${formatCurrency(totalAmount)} ₽`);
}

function filterMyTasks() {
    loadMyTasks();
}

// ===== ВКЛАДКА "ВСЕ ЗАДАЧИ" =====
function loadAllTasksView() {
    renderTasks(allTasks);
}

// ===== ОБЩИЕ ФУНКЦИИ =====
function toggleWeek(week) {
    const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
    const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '🔽';
        expandedWeeks.add(week);
    } else {
        content.style.display = 'none';
        icon.textContent = '▶️';
        expandedWeeks.delete(week);
    }
}

function toggleAllWeeks() {
    const allWeeks = [1, 2, 3, 4];
    const allExpanded = allWeeks.every(week => expandedWeeks.has(week));
    
    if (allExpanded) {
        // Сворачиваем все
        allWeeks.forEach(week => {
            const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
            const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
            if (content) content.style.display = 'none';
            if (icon) icon.textContent = '▶️';
        });
        expandedWeeks.clear();
        document.getElementById('toggleAllText').textContent = 'Развернуть все';
    } else {
        // Разворачиваем все
        allWeeks.forEach(week => {
            const content = document.querySelector(`.week-section[data-week="${week}"] .week-content`);
            const icon = document.querySelector(`.week-section[data-week="${week}"] .expand-icon`);
            if (content) content.style.display = 'block';
            if (icon) icon.textContent = '🔽';
            expandedWeeks.add(week);
        });
        document.getElementById('toggleAllText').textContent = 'Свернуть все';
    }
}

// ===== НАСТРОЙКА ОБРАБОТЧИКОВ =====
function setupEventListeners() {
    // Обработчики вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.closest('.tab-btn').dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Обработчики для плана месяца
    const planRegion = document.getElementById('planRegion');
    const planMonth = document.getElementById('planMonth');
    
    if (planRegion) planRegion.addEventListener('change', loadMonthlyPlan);
    if (planMonth) planMonth.addEventListener('change', loadMonthlyPlan);
    
    // Обработчики для "Мои задачи"
    const myTasksSearch = document.getElementById('myTasksSearch');
    const myTasksStatus = document.getElementById('myTasksStatus');
    const myTasksWeek = document.getElementById('myTasksWeek');
    
    if (myTasksSearch) myTasksSearch.addEventListener('input', filterMyTasks);
    if (myTasksStatus) myTasksStatus.addEventListener('change', filterMyTasks);
    if (myTasksWeek) myTasksWeek.addEventListener('change', filterMyTasks);
    
    // Обработчики для "Все задачи"
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const regionFilter = document.getElementById('regionFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (regionFilter) regionFilter.addEventListener('change', applyFilters);
    if (priorityFilter) priorityFilter.addEventListener('change', applyFilters);
    
    // Обработчики для модальных окон
    setupModalHandlers();
}

function setupModalHandlers() {
    // Закрытие модальных окон при клике вне контента
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function switchTab(tabName) {
    console.log('🔄 Переключение на вкладку:', tabName);
    
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активность со всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    const tabContent = document.getElementById(`${tabName}-content`);
    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (tabContent) tabContent.classList.add('active');
    if (tabButton) tabButton.classList.add('active');
    
    // Загружаем данные для вкладки
    loadTabData(tabName);
}

function loadActiveTab() {
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        loadTabData(activeTab.dataset.tab);
    }
}

function loadTabData(tabName) {
    console.log('📥 Загрузка данных для вкладки:', tabName);
    
    switch(tabName) {
        case 'month-plan':
            loadMonthlyPlan();
            break;
        case 'my-tasks':
            loadMyTasks();
            break;
        case 'all-tasks':
            loadAllTasksView();
            break;
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getBudgetData(region, month) {
    // Заглушка - будет интегрировано с budgets.js
    return {
        total: 50000,
        categories: {
            'products': 5000,
            'household': 3000,
            'medicaments': 1000,
            'azs': 2000
        }
    };
}

function calculateWeekCompletion(region, week) {
    // Заглушка - будет рассчитываться на основе выполненных задач
    const weekData = appData.getWeeklyPlan(region, week);
    const completedTasks = weekData.tasks.filter(task => task.status === 'completed').length;
    const totalTasks = weekData.tasks.length;
    
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
        percentage,
        completed: completedTasks,
        total: totalTasks
    };
}

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
        'products': '🛒',
        'household': '🏠',
        'medicaments': '💊',
        'stationery': '📎',
        'cafe': '☕',
        'repairs': '🔧',
        'azs': '⛽',
        'salary': '💰',
        'shipping': '📦',
        'events': '🎉',
        'polygraphy': '🖨️',
        'insurance': '🛡️',
        'charity': '❤️',
        'equipment': '💻',
        'cleaning': '🧹',
        'checks': '🧾',
        'carsharing': '🚗',
        'rent': '🏢',
        'comm': '💡',
        'internet': '🌐',
        'ipSalary': '💼'
    };
    return emojis[category] || '📋';
}

function getCategoryName(category) {
    const names = {
        'products': 'Продукты',
        'household': 'Хоз. товары',
        'medicaments': 'Медикаменты',
        'stationery': 'Канцелярия',
        'cafe': 'Кафе',
        'repairs': 'Ремонт',
        'azs': 'АЗС',
        'salary': 'Зарплата',
        'shipping': 'Отправка',
        'events': 'Мероприятия',
        'polygraphy': 'Полиграфия',
        'insurance': 'Страхование',
        'charity': 'Благотворительность',
        'equipment': 'Техника',
        'cleaning': 'Клининг',
        'checks': 'Чеки',
        'carsharing': 'Каршеринг',
        'rent': 'Аренда',
        'comm': 'Коммуналка',
        'internet': 'Интернет',
        'ipSalary': 'ЗП ИП'
    };
    return names[category] || category;
}

function getStatusText(status) {
    const statusMap = {
        'planned': 'Запланировано',
        'pending': 'В работе',
        'completed': 'Выполнено',
        'cancelled': 'Отменено'
    };
    return statusMap[status] || status;
}

function updateIPsByRegion(region) {
    const ipSelect = document.getElementById('taskIP');
    if (!ipSelect) return;
    
    // Получаем ИП региона из реальных данных
    const regionIPs = REAL_CARDS_DATA.filter(ip => 
        getCorrectRegionForIP(ip) === region
    ).map(ip => ip.ipName);
    
    ipSelect.innerHTML = '<option value="">Выберите ИП</option>' + 
        regionIPs.map(ip => `<option value="${ip}">${normalizeIPName(ip)}</option>`).join('');
}

function getCorrectRegionForIP(ip) {
    // Используем функцию из cards.js или создаем свою
    if (ip.region && ip.region.trim() !== '' && ip.region !== '-') {
        return ip.region.split(' (')[0];
    }
    
    const regionMap = {
        'ИП Крутоусов': 'Астрахань',
        'ИП Храмова': 'Астрахань',
        'ИП Янгалышева А.': 'Астрахань',
        'ИП НАЛИВАЙКО': 'Астрахань',
        'ИП КАШИРИН В.Г.': 'Астрахань',
        'ИП Астанови Араз': 'Бурятия',
        'ИП Пинегин': 'Бурятия',
        'ИП Ровда А.Ю.': 'Бурятия',
        'ИП ИЛЬЕНКО': 'Бурятия',
        'ИП Бондаренко Л.И.': 'Курган',
        'ИП Бобков': 'Курган',
        'ИП Дюльгер': 'Курган',
        'ИП Федчук': 'Курган',
        'ИП КАРБЫШЕВ': 'Курган',
        'ИП ОВСЕЙКО': 'Курган',
        'ИП РЯБЕНКО И.И': 'Курган',
        'ИП Ибрагимов Ш': 'Калмыкия',
        'ИП Никифорова': 'Калмыкия',
        'ИП Ярославцев Г.В.': 'Калмыкия',
        'ИП Иванов': 'Мордовия',
        'ИП Коротких': 'Мордовия',
        'ИП Яковлева': 'Мордовия',
        'ИП Бадалов': 'Удмуртия',
        'ИП Емельянов Г. И.': 'Удмуртия',
        'ИП Леонгард': 'Удмуртия',
        'ИП Саинова': 'Удмуртия',
        'ИП Самсонов А.Д.': 'Удмуртия',
        'ИП Шефер': 'Удмуртия'
    };
    
    return regionMap[ip.ipName] || 'Общий';
}

function normalizeIPName(ipName) {
    if (!ipName) return '';
    return ipName.replace(/\s+/g, ' ').replace(/\s*\.\s*/g, '. ').trim();
}

function formatCardNumber(number) {
    if (number.startsWith('*')) return number;
    return number.replace(/(\d{4})/g, '$1 ').trim();
}

// ===== СУЩЕСТВУЮЩИЕ ФУНКЦИИ ИЗ TASKS.JS =====
function renderTasks(tasks = allTasks) {
    const tasksGrid = document.getElementById('tasksGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!tasksGrid) return;
    
    if (tasks.length === 0) {
        tasksGrid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    tasksGrid.innerHTML = tasks.map(task => `
        <div class="task-card ${task.priority ? `priority-${task.priority}` : ''}" data-task-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${task.title || 'Без названия'}</h3>
                <div class="task-actions">
                    <input type="checkbox" class="task-checkbox" onchange="toggleTaskSelection('${task.id}', this.checked)">
                    <button class="btn-icon edit" onclick="editTask('${task.id}')" title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn-icon delete" onclick="deleteTask('${task.id}')" title="Удалить">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="task-meta">
                <div class="task-meta-item">
                    <span>📍</span>
                    <span>${task.region}</span>
                </div>
                <div class="task-meta-item">
                    <span>🏢</span>
                    <span>${task.ip}</span>
                </div>
                <div class="task-meta-item">
                    <span>💰</span>
                    <span>${formatCurrency(task.amount)} ₽</span>
                </div>
                <div class="task-meta-item">
                    <span>📅</span>
                    <span>${formatDate(task.createdAt)}</span>
                </div>
            </div>
            
            ${task.description ? `
                <div class="task-description">
                    ${task.description}
                </div>
            ` : ''}
            
            <div class="task-footer">
                <div class="status-badge status-${task.status || 'pending'}">
                    ${getStatusText(task.status)}
                </div>
                <div class="task-meta-item">
                    <span>👤</span>
                    <span>${task.responsible || 'Не назначен'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const region = document.getElementById('regionFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    
    let filteredTasks = allTasks.filter(task => {
        const matchesSearch = !searchTerm || 
            (task.title && task.title.toLowerCase().includes(searchTerm)) ||
            (task.description && task.description.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !status || task.status === status;
        const matchesRegion = !region || task.region === region;
        const matchesPriority = !priority || task.priority === priority;
        
        return matchesSearch && matchesStatus && matchesRegion && matchesPriority;
    });
    
    renderTasks(filteredTasks);
}

function toggleTaskSelection(taskId, isSelected) {
    if (isSelected) {
        selectedTasks.add(taskId);
    } else {
        selectedTasks.delete(taskId);
    }
    
    updateBulkActions();
}

function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (!bulkActions || !selectedCount) return;
    
    selectedCount.textContent = `${selectedTasks.size} задач выбрано`;
    
    if (selectedTasks.size > 0) {
        bulkActions.classList.add('show');
    } else {
        bulkActions.classList.remove('show');
    }
}

function completeSelected() {
    if (selectedTasks.size === 0) return;
    
    if (confirm(`Завершить ${selectedTasks.size} задач?`)) {
        allTasks = allTasks.map(task => {
            if (selectedTasks.has(task.id)) {
                return { 
                    ...task, 
                    status: 'completed',
                    dateCompleted: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            return task;
        });
        
        saveTasks();
        clearSelection();
        renderTasks();
    }
}

function deleteSelected() {
    if (selectedTasks.size === 0) return;
    
    if (confirm(`Удалить ${selectedTasks.size} задач?`)) {
        allTasks = allTasks.filter(task => !selectedTasks.has(task.id));
        saveTasks();
        clearSelection();
        renderTasks();
    }
}

function clearSelection() {
    selectedTasks.clear();
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateBulkActions();
}

function editTask(taskId) {
    window.location.href = `create-task.html?edit=${taskId}`;
}

function deleteTask(taskId) {
    if (confirm('Удалить эту задачу?')) {
        allTasks = allTasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}

// ===== ЗАГЛУШКИ ДЛЯ БУДУЩЕЙ РЕАЛИЗАЦИИ =====
function addTaskToWeek(week) {
    if (currentUser.role === 'manager') {
        alert('❌ У вас нет прав для добавления задач в план');
        return;
    }
    
    console.log('➕ Добавление задачи в неделю:', week);
    document.getElementById('modalWeek').value = week;
    document.getElementById('modalWeekNumber').textContent = week;
    document.getElementById('addTaskModal').style.display = 'flex';
}

function saveMonthlyPlan() {
    console.log('💾 Сохранение плана месяца');
    savePlansToStorage();
    Notification.success('План месяца сохранен!');
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').style.display = 'none';
}

function closeCompleteTaskModal() {
    document.getElementById('completeTaskModal').style.display = 'none';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initEnhancedTasks);