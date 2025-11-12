// ===== ANALYTICS FUNCTIONALITY =====
let charts = {};

function initAnalytics() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    loadAnalyticsData();
    renderCharts();
    updateKPI();
}

function loadAnalyticsData() {
    // Загружаем задачи для анализа
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Фильтруем задачи по регионам для менеджеров
    if (currentUser.role !== 'admin') {
        tasks = tasks.filter(task => currentUser.regions.includes(task.region));
    }
    
    return tasks;
}

function renderCharts() {
    const tasks = loadAnalyticsData();
    const chartType = document.getElementById('chartType').value;
    
    renderExpensesChart(tasks, chartType);
    renderRegionsChart(tasks, chartType);
    renderCategoriesChart(tasks, chartType);
    renderManagersChart(tasks, chartType);
}

function renderExpensesChart(tasks, type = 'bar') {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    
    // Данные за последние 6 месяцев
    const months = getLastMonths(6);
    const monthlyData = months.map(month => {
        const monthTasks = tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate.getMonth() === month.month && 
                   taskDate.getFullYear() === month.year;
        });
        return monthTasks.reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
    });
    
    if (charts.expensesChart) {
        charts.expensesChart.destroy();
    }
    
    charts.expensesChart = new Chart(ctx, {
        type: type,
        data: {
            labels: months.map(m => m.label),
            datasets: [{
                label: 'Расходы, ₽',
                data: monthlyData,
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value.toLocaleString('ru-RU') + ' ₽';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function renderRegionsChart(tasks, type = 'pie') {
    const ctx = document.getElementById('regionsChart').getContext('2d');
    
    const regions = ['Астрахань', 'Бурятия', 'Курган', 'Калмыкия', 'Мордовия', 'Удмуртия'];
    const regionData = regions.map(region => {
        const regionTasks = tasks.filter(task => task.region === region);
        return regionTasks.reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
    });
    
    if (charts.regionsChart) {
        charts.regionsChart.destroy();
    }
    
    charts.regionsChart = new Chart(ctx, {
        type: type,
        data: {
            labels: regions,
            datasets: [{
                data: regionData,
                backgroundColor: [
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(139, 92, 246, 0.5)'
                ],
                borderColor: [
                    'rgba(139, 92, 246, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#f8fafc',
                        padding: 20
                    }
                }
            }
        }
    });
}

function renderCategoriesChart(tasks, type = 'doughnut') {
    const ctx = document.getElementById('categoriesChart').getContext('2d');
    
    // Пример категорий расходов
    const categories = ['Налоги', 'Зарплаты', 'Аренда', 'Маркетинг', 'Оборудование', 'Прочее'];
    const categoryData = categories.map(() => Math.random() * 100000);
    
    if (charts.categoriesChart) {
        charts.categoriesChart.destroy();
    }
    
    charts.categoriesChart = new Chart(ctx, {
        type: type,
        data: {
            labels: categories,
            datasets: [{
                data: categoryData,
                backgroundColor: [
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(156, 163, 175, 0.8)'
                ],
                borderColor: [
                    'rgba(139, 92, 246, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(156, 163, 175, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#f8fafc',
                        padding: 20
                    }
                }
            }
        }
    });
}

function renderManagersChart(tasks, type = 'bar') {
    const ctx = document.getElementById('managersChart').getContext('2d');
    
    const managers = ['Менеджер 1', 'Менеджер 2', 'Менеджер 3'];
    const managerData = managers.map(manager => {
        const managerTasks = tasks.filter(task => task.responsible === manager);
        return managerTasks.reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
    });
    
    if (charts.managersChart) {
        charts.managersChart.destroy();
    }
    
    charts.managersChart = new Chart(ctx, {
        type: type,
        data: {
            labels: managers,
            datasets: [{
                label: 'Оборот, ₽',
                data: managerData,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value.toLocaleString('ru-RU') + ' ₽';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function updateKPI() {
    const tasks = loadAnalyticsData();
    
    const totalExpenses = tasks.reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const activeIPs = new Set(tasks.map(task => task.ip)).size;
    const avgTaskCost = completedTasks > 0 ? totalExpenses / completedTasks : 0;
    
    document.getElementById('totalExpensesKpi').textContent = totalExpenses.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('completedTasksKpi').textContent = completedTasks;
    document.getElementById('activeIPsKpi').textContent = activeIPs;
    document.getElementById('avgTaskCostKpi').textContent = avgTaskCost.toLocaleString('ru-RU') + ' ₽';
}

function getLastMonths(n) {
    const months = [];
    const date = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        months.push({
            label: d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
            month: d.getMonth(),
            year: d.getFullYear()
        });
    }
    
    return months;
}

function updateCharts() {
    renderCharts();
    updateKPI();
}

function updateChartTypes() {
    renderCharts();
}

function downloadChart(chartId) {
    const chart = charts[chartId];
    if (chart) {
        const link = document.createElement('a');
        link.download = `${chartId}.png`;
        link.href = chart.toBase64Image();
        link.click();
    }
}

function exportToCSV() {
    const tasks = loadAnalyticsData();
    
    const headers = ['Название', 'Регион', 'ИП', 'Сумма', 'Статус', 'Дата создания'];
    const csvData = tasks.map(task => [
        task.title || '',
        task.region || '',
        task.ip || '',
        task.amount || '0',
        task.status || 'pending',
        task.createdAt || new Date().toISOString()
    ]);
    
    const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function generatePDFReport() {
    alert('Функция генерации PDF отчета будет реализована в следующей версии');
}

function printCharts() {
    window.print();
}

// Инициализация
document.addEventListener('DOMContentLoaded', initAnalytics);