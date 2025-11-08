class API {
    // ... существующие методы ...

    // Задачи
    static async createTask(taskData) {
        const response = await this.makeRequest('/api/tasks', 'POST', taskData);
        return response;
    }

    static async getTasks() {
        const response = await this.makeRequest('/api/tasks');
        return response;
    }

    static async getAssignedTasks(userId) {
        const response = await this.makeRequest(`/api/tasks/assigned-to/${userId}`);
        return response;
    }

    static async updateTask(taskId, updateData) {
        const response = await this.makeRequest(`/api/tasks/${taskId}`, 'PUT', updateData);
        return response;
    }

    // Утилиты
    static async getRegions() {
        const response = await this.makeRequest('/api/utils/regions');
        return response;
    }

    static async getManagersByRegion(region) {
        const response = await this.makeRequest(`/api/utils/managers/${region}`);
        return response;
    }

    static async getIPsWithCardsByRegion(region) {
        const response = await this.makeRequest(`/api/utils/ips-with-cards/${region}`);
        return response;
    }
}
