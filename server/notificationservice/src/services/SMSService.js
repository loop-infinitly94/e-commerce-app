/**
 * SMSService - Mock SMS notification service
 * Following SOLID principles: Single Responsibility
 */
class SMSService {
  constructor() {
    this.serviceName = 'SMS Service';
  }

  /**
   * Send order confirmation SMS
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Send result
   */
  async sendOrderConfirmationSMS(orderData) {
    try {
      const message = `Order ${orderData.orderId} confirmed! Total: $${orderData.totalAmount.toFixed(2)}. Thank you for your purchase!`;
      
      await this.mockSendSMS(orderData.customerPhone || '+1234567890', message);
      
      console.log(`📱 Order confirmation SMS sent for order ${orderData.orderId}`);
      
      return {
        success: true,
        messageId: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipient: orderData.customerPhone || '+1234567890',
        message
      };
    } catch (error) {
      console.error('❌ Failed to send order confirmation SMS:', error.message);
      throw error;
    }
  }

  /**
   * Send shipping notification SMS
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Send result
   */
  async sendShippingNotificationSMS(orderData) {
    try {
      const message = `Good news! Your order ${orderData.orderId} has been shipped and is on its way to you!`;
      
      await this.mockSendSMS(orderData.customerPhone || '+1234567890', message);
      
      console.log(`📱 Shipping notification SMS sent for order ${orderData.orderId}`);
      
      return {
        success: true,
        messageId: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipient: orderData.customerPhone || '+1234567890',
        message
      };
    } catch (error) {
      console.error('❌ Failed to send shipping SMS:', error.message);
      throw error;
    }
  }

  /**
   * Mock SMS sending function
   * @param {String} phoneNumber - Recipient phone number
   * @param {String} message - SMS message
   * @returns {Promise<void>}
   */
  async mockSendSMS(phoneNumber, message) {
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
    
    // Mock occasional failure for testing
    if (Math.random() < 0.03) { // 3% failure rate
      throw new Error('Mock SMS service temporarily unavailable');
    }
    
    // Log the SMS details
    console.log('\n📲 MOCK SMS SENT:');
    console.log('┌─────────────────────────────────────');
    console.log(`│ To: ${phoneNumber}`);
    console.log(`│ Message: ${message}`);
    console.log('└─────────────────────────────────────\n');
  }

  /**
   * Health check for SMS service
   * @returns {Promise<Boolean>} Service health status
   */
  async isHealthy() {
    try {
      await new Promise(resolve => setTimeout(resolve, 30));
      return true;
    } catch (error) {
      console.error('SMS service health check failed:', error.message);
      return false;
    }
  }
}

module.exports = SMSService;