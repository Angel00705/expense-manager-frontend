// ===== ANALYTICS FUNCTIONALITY =====
const Analytics = {
    charts: {},
    tasksData: [],
    
    // Инициализация аналитики
    init: function() {
        console.log('📊 Инициализация системы аналитики');
        this.loadAnalyticsData();
        this.setupEventListeners();
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Добавляем обработчики для обновления данных
        document.addEventListener('tasksUpdated', () => {
            this.refreshData();
        });
    },
    
    // Загрузка данных для аналитики
    loadAnalyticsData: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Фильтруем задачи по регионам для менеджеров
        if (currentUser.role !== 'admin') {
            this.tasksData = tasks.filter(task => currentUser.regions.includes(task.region));
        } else {
            this.tasksData = tasks;
        }
        
        this.generateReports();
    },
    
    // Генерация всех отчетов
    generateReports: function() {
        this.generateExpensesByRegion();
        this.generateManagerPerformance();
        this.generatePlanVsActual();
        this.generateTaskKPIs();
        this.generateExpenseDistribution();
        this.generateMonthlyTrends();
    },
    
    // 📈 ГРАФИК: РАСХОДЫ ПО РЕГИОНАМ
    generateExpensesByRegion: function() {
        const expensesByRegion = {};
        
        this.tasksData.forEach(task => {
            if (!expensesByRegion[task.region]) {
                expensesByRegion[task.region] = 0;
            }
            if (task.amount) {
                expensesByRegion[task.region] += parseFloat(task.amount) || 0;
            }
        });
        
        const regions = Object.keys(expensesByRegion);
        const amounts = Object.values(expensesByRegion);
        
        const ctx = document.getElementById('expensesByRegionChart');
        if (!ctx) return;
        
        // Уничтожаем предыдущий график
        if (this.charts.expensesByRegion) {
            this.charts.expensesByRegion.destroy();
        }
        
        const isDark = true;
        const textColor = isDark ? '#f8fafc' : '#1e293b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        this.charts.expensesByRegion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: regions,
                datasets: [{
                    label: '💰 Расходы по регионам',
                    data: amounts,
                    backgroundColor: [
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(59, 130, 246, 0.7)'
                    ],
                    borderColor: [
                        'rgb(139, 92, 246)',
                        'rgb(99, 102, 241)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                        'rgb(59, 130, 246)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `💰 ${formatAmount(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return formatAmount(value);
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    },
    
    // 👥 ОТЧЕТ: ЭФФЕКТИВНОСТЬ УПРАВЛЯЮЩИХ
    generateManagerPerformance: function() {
        const managerStats = {};
        
        this.tasksData.forEach(task => {
            const manager = task.responsible || 'Не назначен';
            if (!managerStats[manager]) {
                managerStats[manager] = {
                    totalTasks: 0,
                    completedTasks: 0,
                    totalAmount: 0,
                    regions: new Set()
                };
            }
            
            const stats = managerStats[manager];
            stats.totalTasks++;
            stats.totalAmount += parseFloat(task.amount) || 0;
            stats.regions.add(task.region);
            
            if (task.status === 'completed') {
                stats.completedTasks++;
            }
        });
        
        // Обновляем таблицу эффективности
        this.updateManagerPerformanceTable(managerStats);
        
        // Создаем график эффективности
        this.createManagerPerformanceChart(managerStats);
    },
    
    // 📊 ТАБЛИЦА ЭФФЕКТИВНОСТИ УПРАВЛЯЮЩИХ
    updateManagerPerformanceTable: function(managerStats) {
        const tableBody = document.getElementById('managerPerformanceTable');
        if (!tableBody) return;
        
        let html = '';
        
        Object.entries(managerStats).forEach(([manager, stats]) => {
            const completionRate = stats.totalTasks > 0 
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                : 0;
                
            const avgAmount = stats.totalTasks > 0 
                ? Math.round(stats.totalAmount / stats.totalTasks) 
                : 0;
                
            html += `
                <tr>
                    <td>👤 ${manager}</td>
                    <td>${stats.totalTasks}</td>
                    <td>${stats.completedTasks}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${completionRate}%"></div>
                            </div>
                            <span>${completionRate}%</span>
                        </div>
                    </td>
                    <td>${formatAmount(avgAmount)}</td>
                    <td>${Array.from(stats.regions).join(', ')}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    },
    
    // 📈 ГРАФИК ЭФФЕКТИВНОСТИ УПРАВЛЯЮЩИХ
    createManagerPerformanceChart: function(managerStats) {
        const ctx = document.getElementById('managerPerformanceChart');
        if (!ctx) return;
        
        const managers = Object.keys(managerStats);
        const completionRates = managers.map(manager => {
            const stats = managerStats[manager];
            return stats.totalTasks > 0 
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                : 0;
        });
        
        // Уничтожаем предыдущий график
        if (this.charts.managerPerformance) {
            this.charts.managerPerformance.destroy();
        }
        
        const isDark = true;
        const textColor = isDark ? '#f8fafc' : '#1e293b';
        
        this.charts.managerPerformance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: managers,
                datasets: [{
                    data: completionRates,
                    backgroundColor: [
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: 'white'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `📊 ${context.label}: ${context.parsed}% выполнения`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    // 💰 ДАШБОРД: ПЛАН VS ФАКТ
    generatePlanVsActual: function() {
        // Для демонстрации используем случайные данные
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
        const planned = months.map(() => Math.floor(Math.random() * 500000) + 200000);
        const actual = months.map((_, i) => planned[i] * (0.7 + Math.random() * 0.6));
        
        const ctx = document.getElementById('planVsActualChart');
        if (!ctx) return;
        
        // Уничтожаем предыдущий график
        if (this.charts.planVsActual) {
            this.charts.planVsActual.destroy();
        }
        
        const isDark = true;
        const textColor = isDark ? '#f8fafc' : '#1e293b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        this.charts.planVsActual = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: '📅 План',
                        data: planned,
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '📊 Факт',
                        data: actual,
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatAmount(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return formatAmount(value);
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    },
    
    // 🎯 KPI ВЫПОЛНЕНИЯ ЗАДАЧ
    generateTaskKPIs: function() {
        const totalTasks = this.tasksData.length;
        const completedTasks = this.tasksData.filter(task => task.status === 'completed').length;
        const inProgressTasks = this.tasksData.filter(task => task.status === 'pending').length;
        const pendingTasks = this.tasksData.filter(task => !task.status || task.status === 'new');
        
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const avgCompletionTime = this.calculateAverageCompletionTime();
        
        // Обновляем метрики
        this.updateKPIMetrics({
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            completionRate,
            avgCompletionTime
        });
        
        // Создаем график статусов задач
        this.createTaskStatusChart({
            completed: completedTasks,
            inProgress: inProgressTasks,
            pending: pendingTasks
        });
    },
    
    // 📊 РАСЧЕТ СРЕДНЕГО ВРЕМЕНИ ВЫПОЛНЕНИЯ
    calculateAverageCompletionTime: function() {
        const completedTasks = this.tasksData.filter(task => 
            task.status === 'completed' && task.createdAt && task.updatedAt
        );
        
        if (completedTasks.length === 0) return 0;
        
        const totalTime = completedTasks.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const updated = new Date(task.updatedAt);
            return sum + (updated - created);
        }, 0);
        
        return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // в днях
    },
    
    // 🔢 ОБНОВЛЕНИЕ KPI МЕТРИК
    updateKPIMetrics: function(metrics) {
        const elements = {
            totalTasks: document.getElementById('kpiTotalTasks'),
            completedTasks: document.getElementById('kpiCompletedTasks'),
            completionRate: document.getElementById('kpiCompletionRate'),
            avgCompletionTime: document.getElementById('kpiAvgCompletionTime')
        };
        
        if (elements.totalTasks) elements.totalTasks.textContent = metrics.totalTasks;
        if (elements.completedTasks) elements.completedTasks.textContent = metrics.completedTasks;
        if (elements.completionRate) elements.completionRate.textContent = `${metrics.completionRate}%`;
        if (elements.avgCompletionTime) {
            elements.avgCompletionTime.textContent = `${metrics.avgCompletionTime} дн.`;
        }
    },
    
    // 📈 ГРАФИК СТАТУСОВ ЗАДАЧ
    createTaskStatusChart: function(statusData) {
        const ctx = document.getElementById('taskStatusChart');
        if (!ctx) return;
        
        // Уничтожаем предыдущий график
        if (this.charts.taskStatus) {
            this.charts.taskStatus.destroy();
        }
        
        const isDark = true;
        const textColor = isDark ? '#f8fafc' : '#1e293b';
        
        this.charts.taskStatus = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['✅ Выполнено', '🔄 В работе', '⏳ Ожидает'],
                datasets: [{
                    data: [statusData.completed, statusData.inProgress, statusData.pending],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: 'white'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 20
                        }
                    }
                }
            }
        });
    },
    
    // 📊 РАСПРЕДЕЛЕНИЕ РАСХОДОВ ПО СТАТЬЯМ
    generateExpenseDistribution: function() {
        const expenseDistribution = {};
        
        this.tasksData.forEach(task => {
            const expenseItem = task.expenseItem || 'Прочие расходы';
            if (!expenseDistribution[expenseItem]) {
                expenseDistribution[expenseItem] = 0;
            }
            expenseDistribution[expenseItem] += parseFloat(task.amount) || 0;
        });
        
        const expenses = Object.entries(expenseDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8); // Топ 8 статей расходов
        
        const ctx = document.getElementById('expenseDistributionChart');
        if (!ctx) return;
        
        // Уничтожаем предыдущий график
        if (this.charts.expenseDistribution) {
            this.charts.expenseDistribution.destroy();
        }
        
        const isDark = true;
        const textColor = isDark ? '#f8fafc' : '#1e293b';
        
        this.charts.expenseDistribution = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: expenses.map(([expense]) => expense),
                datasets: [{
                    data: expenses.map(([, amount]) => amount),
                    backgroundColor: [
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(99, 102, 241, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(168, 85, 247, 0.7)',
                        'rgba(14, 165, 233, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${formatAmount(context.parsed.r)}`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    // 📈 ТРЕНДЫ ПО МЕСЯЦАМ
    generateMonthlyTrends: function() {
        const monthlyData = {};
        
        this.tasksData.forEach(task => {
            if (task.createdAt) {
                const month = new Date(task.createdAt).toLocaleDateString('ru-RU', { 
                    month: 'short', 
                    year: 'numeric' 
                });
                
                if (!monthlyData[month]) {
                    monthlyData[month] = { tasks: 0, amount: 0 };
                }
                
                monthlyData[month].tasks++;
                monthlyData[month].amount += parseFloat(task.amount) || 0;
            }
        });
        
        const months = Object.keys(monthlyData).slice(-6); // Последние 6 месяцев
        const tasksCount = months.map(month => monthlyData[month].tasks);
        const amounts = months.map(month => monthlyData[month].amount);
        
        const ctx = document.getElementById('monthlyTrendsChart');
        if (!ctx) return;
        
        // Уничтожаем предыдущий график
        if (this.charts.monthlyTrends) {
            this.charts.monthlyTrends.destroy();
        }
        
        const isDark = true;
        const textColor = isDark ? '#f8fafc' : '#1e293b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        this.charts.monthlyTrends = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: '📋 Количество задач',
                        data: tasksCount,
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        yAxisID: 'y'
                    },
                    {
                        label: '💰 Сумма расходов',
                        data: amounts,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        yAxisID: 'y1',
                        type: 'line'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Количество задач'
                        },
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Сумма расходов'
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return formatAmount(value);
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    },
    
    // 🔄 ОБНОВЛЕНИЕ ДАННЫХ
    refreshData: function() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        this.charts = {};
        this.loadAnalyticsData();
        
        this.showNotification('📊 Данные аналитики обновлены', 'success');
    },
    
    // 📄 ЭКСПОРТ ОТЧЕТОВ
    exportReport: function(format) {
        const reportData = this.generateExportData();
        
        if (format === 'csv') {
            this.exportToCSV(reportData);
        } else if (format === 'pdf') {
            this.exportToPDF(reportData);
        }
        
        this.showNotification(`📄 Отчет экспортирован в формате ${format.toUpperCase()}`, 'success');
    },
    
    // 📊 ГЕНЕРАЦИЯ ДАННЫХ ДЛЯ ЭКСПОРТА
    generateExportData: function() {
        return {
            generatedAt: new Date().toLocaleString('ru-RU'),
            totalTasks: this.tasksData.length,
            completedTasks: this.tasksData.filter(task => task.status === 'completed').length,
            totalAmount: this.tasksData.reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0),
            tasksByRegion: this.getTasksByRegion(),
            tasksByManager: this.getTasksByManager()
        };
    },
    
    // 📋 ЗАДАЧИ ПО РЕГИОНАМ
    getTasksByRegion: function() {
        const byRegion = {};
        this.tasksData.forEach(task => {
            if (!byRegion[task.region]) {
                byRegion[task.region] = { tasks: 0, amount: 0 };
            }
            byRegion[task.region].tasks++;
            byRegion[task.region].amount += parseFloat(task.amount) || 0;
        });
        return byRegion;
    },
    
    // 👥 ЗАДАЧИ ПО УПРАВЛЯЮЩИМ
    getTasksByManager: function() {
        const byManager = {};
        this.tasksData.forEach(task => {
            const manager = task.responsible || 'Не назначен';
            if (!byManager[manager]) {
                byManager[manager] = { tasks: 0, completed: 0, amount: 0 };
            }
            byManager[manager].tasks++;
            byManager[manager].amount += parseFloat(task.amount) || 0;
            if (task.status === 'completed') {
                byManager[manager].completed++;
            }
        });
        return byManager;
    },
    
    // 📄 ЭКСПОРТ В CSV
    exportToCSV: function(data) {
        let csv = 'Отчет IP Expense Manager\n';
        csv += `Сгенерировано: ${data.generatedAt}\n\n`;
        
        csv += 'Общая статистика:\n';
        csv += `Всего задач,${data.totalTasks}\n`;
        csv += `Выполнено задач,${data.completedTasks}\n`;
        csv += `Общая сумма,${formatAmount(data.totalAmount)}\n\n`;
        
        csv += 'Задачи по регионам:\n';
        csv += 'Регион,Кол-во задач,Сумма\n';
        Object.entries(data.tasksByRegion).forEach(([region, stats]) => {
            csv += `${region},${stats.tasks},${formatAmount(stats.amount)}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `expense_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // 📄 ЭКСПОРТ В PDF (заглушка)
    exportToPDF: function(data) {
        this.showNotification('📄 Функция экспорта в PDF будет реализована в следующем обновлении', 'info');
    },
    
    // 🔔 УВЕДОМЛЕНИЯ
    showNotification: function(message, type = 'info') {
        // Простая реализация уведомлений
        alert(`${type === 'success' ? '✅' : 'ℹ️'} ${message}`);
    }
};

// Вспомогательные функции
function formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function refreshAnalytics() {
    Analytics.refreshData();
}

function exportToCSV() {
    Analytics.exportReport('csv');
}

function generatePDFReport() {
    Analytics.exportReport('pdf');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    Analytics.init();
});

// Делаем Analytics глобально доступным
window.Analytics = Analytics;