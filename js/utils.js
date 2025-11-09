// utils.js - minimal working version
class Utils {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU');
    }
    
    static formatCurrency(amount) {
        return amount + ' ₽';
    }
}

window.Utils = Utils;
