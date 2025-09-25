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
    return results;
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