/**
 * NotificationService - Orchestrates different notification channels
 * Following SOLID principles: Open/Closed & Single Responsibility
 */
class NotificationService {
  constructor(emailService) {
    this.emailService = emailService;
    this.notificationHistory = new Map(); // In-memory storage for demo
  }

  /**
   * Send order confirmation notification (only email)
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Notification result
   */
  async sendOrderConfirmation(orderData) {
    console.log(`🔔 Sending order confirmation email for order: ${orderData.orderId}`);
    const results = {
      orderId: orderData.orderId,
      notifications: [],
      timestamp: new Date().toISOString()
    };
    try {
      const emailResult = await this.emailService.sendOrderConfirmation(orderData);
      results.notifications.push({
        type: 'email',
        status: 'success',
        result: emailResult
      });
    } catch (error) {
      console.error('Email notification failed:', error.message);
      results.notifications.push({
        type: 'email',
        status: 'failed',
        error: error.message
      });
    }
    this.storeNotificationHistory(orderData.orderId, 'ORDER_CONFIRMATION', results);
    return results;
  }

  /**
   * Store notification history (in-memory for demo)
   * @param {String} orderId - Order ID
   * @param {String} type - Notification type
   * @param {Object} result - Notification result
   */
  storeNotificationHistory(orderId, type, result) {
    if (!this.notificationHistory.has(orderId)) {
      this.notificationHistory.set(orderId, []);
    }
    
    this.notificationHistory.get(orderId).push({
      type,
      result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get notification history for an order
   * @param {String} orderId - Order ID
   * @returns {Array} Notification history
   */
  getNotificationHistory(orderId) {
    return this.notificationHistory.get(orderId) || [];
  }

  /**
   * Health check for email service only
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const emailHealth = await this.emailService.isHealthy();
      
      return {
        status: emailHealth ? 'healthy' : 'unhealthy',
        services: {
          email: emailHealth ? 'healthy' : 'unhealthy'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = NotificationService;