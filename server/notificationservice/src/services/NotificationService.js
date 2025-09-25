/**
 * NotificationService - Orchestrates different notification channels
 * Following SOLID principles: Open/Closed & Single Responsibility
 */
class NotificationService {
  constructor(emailService, smsService) {
    this.emailService = emailService;
    this.smsService = smsService;
    this.notificationHistory = new Map(); // In-memory storage for demo
  }

  /**
   * Send order confirmation notifications
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Notification results
   */
  async sendOrderConfirmation(orderData) {
    console.log(`🔔 Sending order confirmation notifications for order: ${orderData.orderId}`);
    
    const results = {
      orderId: orderData.orderId,
      notifications: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Send email notification
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

    // Store notification history
    this.storeNotificationHistory(orderData.orderId, 'ORDER_CONFIRMATION', results);

    return results;
  }

  /**
   * Send order status update notifications
   * @param {Object} orderData - Order information with updated status
   * @returns {Promise<Object>} Notification results
   */
  async sendStatusUpdateNotification(orderData) {
    console.log(`🔔 Sending status update notifications for order: ${orderData.orderId} - Status: ${orderData.status}`);
    
    const results = {
      orderId: orderData.orderId,
      newStatus: orderData.status,
      notifications: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Send email notification
      const emailResult = await this.emailService.sendStatusUpdateEmail(orderData);
      results.notifications.push({
        type: 'email',
        status: 'success',
        result: emailResult
      });
    } catch (error) {
      console.error('Status update email failed:', error.message);
      results.notifications.push({
        type: 'email',
        status: 'failed',
        error: error.message
      });
    }

    // Send SMS for shipping updates
    if (orderData.status === 'shipped') {
      try {
        const smsResult = await this.smsService.sendShippingNotificationSMS(orderData);
        results.notifications.push({
          type: 'sms',
          status: 'success',
          result: smsResult
        });
      } catch (error) {
        console.error('Shipping SMS failed:', error.message);
        results.notifications.push({
          type: 'sms',
          status: 'failed',
          error: error.message
        });
      }
    }

    // Store notification history
    this.storeNotificationHistory(orderData.orderId, 'STATUS_UPDATE', results);

    return results;
  }

  /**
   * Send order cancellation notifications
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Notification results
   */
  async sendCancellationNotification(orderData) {
    console.log(`🔔 Sending cancellation notifications for order: ${orderData.orderId}`);
    
    const results = {
      orderId: orderData.orderId,
      cancellationReason: orderData.cancellationReason,
      notifications: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Send cancellation email
      const emailResult = await this.emailService.sendCancellationEmail(orderData);
      results.notifications.push({
        type: 'email',
        status: 'success',
        result: emailResult
      });
    } catch (error) {
      console.error('Cancellation email failed:', error.message);
      results.notifications.push({
        type: 'email',
        status: 'failed',
        error: error.message
      });
    }

    // Store notification history
    this.storeNotificationHistory(orderData.orderId, 'ORDER_CANCELLATION', results);

    return results;
  }

  /**
   * Send batch notifications for multiple orders
   * @param {Array} ordersData - Array of order data
   * @param {String} notificationType - Type of notification
   * @returns {Promise<Array>} Array of notification results
   */
  async sendBatchNotifications(ordersData, notificationType) {
    console.log(`🔔 Sending batch ${notificationType} notifications for ${ordersData.length} orders`);
    
    const batchResults = [];
    
    // Process notifications in parallel with concurrency limit
    const concurrencyLimit = 5;
    for (let i = 0; i < ordersData.length; i += concurrencyLimit) {
      const batch = ordersData.slice(i, i + concurrencyLimit);
      
      const batchPromises = batch.map(async (orderData) => {
        try {
          switch (notificationType) {
            case 'ORDER_CONFIRMATION':
              return await this.sendOrderConfirmation(orderData);
            case 'STATUS_UPDATE':
              return await this.sendStatusUpdateNotification(orderData);
            case 'ORDER_CANCELLATION':
              return await this.sendCancellationNotification(orderData);
            default:
              throw new Error(`Unknown notification type: ${notificationType}`);
          }
        } catch (error) {
          console.error(`Batch notification failed for order ${orderData.orderId}:`, error.message);
          return {
            orderId: orderData.orderId,
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      });

      const batchResult = await Promise.allSettled(batchPromises);
      batchResults.push(...batchResult.map(result => result.value || result.reason));
    }

    return batchResults;
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
   * Get notification statistics
   * @returns {Object} Notification statistics
   */
  getNotificationStats() {
    let totalNotifications = 0;
    let successfulNotifications = 0;
    let failedNotifications = 0;

    for (const notifications of this.notificationHistory.values()) {
      for (const notification of notifications) {
        notification.result?.notifications?.forEach(notif => {
          totalNotifications++;
          if (notif.status === 'success') {
            successfulNotifications++;
          } else {
            failedNotifications++;
          }
        });
      }
    }

    return {
      totalNotifications,
      successfulNotifications,
      failedNotifications,
      successRate: totalNotifications > 0 ? (successfulNotifications / totalNotifications * 100).toFixed(2) : 0,
      totalOrders: this.notificationHistory.size
    };
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
   * Health check for all notification services
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const emailHealth = await this.emailService.isHealthy();
      const smsHealth = await this.smsService.isHealthy();
      
      return {
        status: emailHealth && smsHealth ? 'healthy' : 'degraded',
        services: {
          email: emailHealth ? 'healthy' : 'unhealthy',
          sms: smsHealth ? 'healthy' : 'unhealthy'
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