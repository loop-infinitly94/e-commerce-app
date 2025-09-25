/**
 * EmailService - Mock email notification service
 * Following SOLID principles: Single Responsibility & Interface Segregation
 */
class EmailService {
  constructor() {
    this.serviceName = 'Email Service';
  }

  /**
   * Send order confirmation email
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Send result
   */
  async sendOrderConfirmation(orderData) {
    try {
      const emailContent = {
        to: orderData.customerEmail,
        subject: `Order Confirmation - ${orderData.orderId}`,
        html: this.generateOrderConfirmationHTML(orderData)
      };

      // Mock email sending
      await this.mockSendEmail(emailContent);
      
      console.log(`📧 Order confirmation email sent to ${orderData.customerEmail}`);
      
      return {
        success: true,
        messageId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipient: orderData.customerEmail,
        subject: emailContent.subject
      };
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error.message);
      throw error;
    }
  }

  /**
   * Send order status update email
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Send result
   */
  async sendStatusUpdateEmail(orderData) {
    try {
      const emailContent = {
        to: orderData.customerEmail,
        subject: `Order ${orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)} - ${orderData.orderId}`,
        html: this.generateStatusUpdateHTML(orderData)
      };

      await this.mockSendEmail(emailContent);
      
      console.log(`📧 Status update email sent to ${orderData.customerEmail} - Status: ${orderData.status}`);
      
      return {
        success: true,
        messageId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipient: orderData.customerEmail,
        subject: emailContent.subject
      };
    } catch (error) {
      console.error('❌ Failed to send status update email:', error.message);
      throw error;
    }
  }

  /**
   * Send order cancellation email
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Send result
   */
  async sendCancellationEmail(orderData) {
    try {
      const emailContent = {
        to: orderData.customerEmail,
        subject: `Order Cancelled - ${orderData.orderId}`,
        html: this.generateCancellationHTML(orderData)
      };

      await this.mockSendEmail(emailContent);
      
      console.log(`📧 Cancellation email sent to ${orderData.customerEmail}`);
      
      return {
        success: true,
        messageId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipient: orderData.customerEmail,
        subject: emailContent.subject
      };
    } catch (error) {
      console.error('❌ Failed to send cancellation email:', error.message);
      throw error;
    }
  }

  /**
   * Mock email sending function
   * @param {Object} emailContent - Email content
   * @returns {Promise<void>}
   */
  async mockSendEmail(emailContent) {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
    
    // Mock occasional failure for testing
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Mock email service temporarily unavailable');
    }
    
    // Log the email details
    console.log('\n📨 MOCK EMAIL SENT:');
    console.log('┌─────────────────────────────────────');
    console.log(`│ To: ${emailContent.to}`);
    console.log(`│ Subject: ${emailContent.subject}`);
    console.log('│ Content: (HTML email body)');
    console.log('└─────────────────────────────────────\n');
  }

  /**
   * Generate order confirmation HTML
   * @param {Object} orderData - Order data
   * @returns {String} HTML content
   */
  generateOrderConfirmationHTML(orderData) {
    const itemsHTML = orderData.items.map(item => 
      `<tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>`
    ).join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #2c5aa0;">Order Confirmation</h1>
          <p>Thank you for your order! Here are the details:</p>
          
          <h3>Order Information</h3>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${orderData.status}</p>
          
          <h3>Items Ordered</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <h3 style="color: #2c5aa0;">Total Amount: $${orderData.totalAmount.toFixed(2)}</h3>
          
          <p>We'll send you another email when your order ships.</p>
          <p>Thank you for shopping with us!</p>
        </body>
      </html>
    `;
  }

  /**
   * Generate status update HTML
   * @param {Object} orderData - Order data
   * @returns {String} HTML content
   */
  generateStatusUpdateHTML(orderData) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is currently being processed.',
      shipped: 'Great news! Your order has been shipped.',
      delivered: 'Your order has been delivered. We hope you enjoy your purchase!'
    };

    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #2c5aa0;">Order Status Update</h1>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>New Status:</strong> ${orderData.status.toUpperCase()}</p>
          
          <p>${statusMessages[orderData.status] || 'Your order status has been updated.'}</p>
          
          <p>Thank you for your patience!</p>
        </body>
      </html>
    `;
  }

  /**
   * Generate cancellation HTML
   * @param {Object} orderData - Order data
   * @returns {String} HTML content
   */
  generateCancellationHTML(orderData) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #dc3545;">Order Cancelled</h1>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          
          <p>Your order has been cancelled as requested.</p>
          <p><strong>Reason:</strong> ${orderData.cancellationReason || 'Customer request'}</p>
          
          <p>If you have any questions, please contact our customer service.</p>
          <p>We hope to serve you again in the future!</p>
        </body>
      </html>
    `;
  }

  /**
   * Health check for email service
   * @returns {Promise<Boolean>} Service health status
   */
  async isHealthy() {
    try {
      // Mock health check
      await new Promise(resolve => setTimeout(resolve, 50));
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = EmailService;