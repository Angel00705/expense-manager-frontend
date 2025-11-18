// js/modules/export-manager.js
const ExportManager = {
    // Экспорт всех задач в CSV
    exportToCSV() {
        const tasks = DataManager.getAllTasks();
        let csv = 'ID,Регион,Неделя,Категория,Описание,ИП,План,Факт,Статус,Дата выполнения,Ответственный\n';
        
        tasks.forEach(task => {
            csv += `"${task.id}","${task.region}","${task.week}","${task.category}","${task.description}",` +
                   `"${task.ip || ''}","${task.plan || 0}","${task.fact || 0}","${task.status}",` +
                   `"${task.dateCompleted || ''}","${task.responsible || ''}"\n`;
        });
        
        this.downloadFile(csv, `задачи_${this.getCurrentDate()}.csv`, 'text/csv');
        Notification.success('Данные экспортированы в CSV');
    },
    
    // Экспорт в Excel (CSV с разделителем табуляции)
    exportToExcel() {
        const tasks = DataManager.getAllTasks();
        let excelData = 'ID\tРегион\tНеделя\tКатегория\tОписание\tИП\tПлан\tФакт\tСтатус\tДата выполнения\tОтветственный\n';
        
        tasks.forEach(task => {
            excelData += `${task.id}\t${task.region}\t${task.week}\t${task.category}\t${task.description}\t` +
                        `${task.ip || ''}\t${task.plan || 0}\t${task.fact || 0}\t${task.status}\t` +
                        `${task.dateCompleted || ''}\t${task.responsible || ''}\n`;
        });
        
        this.downloadFile(excelData, `задачи_${this.getCurrentDate()}.xls`, 'application/vnd.ms-excel');
        Notification.success('Данные экспортированы в Excel');
    },
    
    // Вспомогательные методы
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }
};

window.ExportManager = ExportManager;