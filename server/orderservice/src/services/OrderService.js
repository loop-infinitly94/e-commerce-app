/**
 * OrderService - Simplified business logic for order creation
 * Following SOLID principles: Single Responsibility & Dependency Inversion
 */
class OrderService {
  constructor(orderRepository, eventPublisher) {
    this.orderRepository = orderRepository;
    this.eventPublisher = eventPublisher;
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order creation data from cart
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      console.log('🔄 Processing order creation...');
      
      // Validate required fields
      this.validateOrderData(orderData);
      
      // Prepare order for saving
      const orderToSave = {
        userId: orderData.userId,
        items: orderData.items,
        totalAmount: this.calculateTotal(orderData.items),
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        status: 'PENDING'
      };
      
      // Save to database  
      const savedOrder = await this.orderRepository.save(orderToSave);
      
      console.log(`💾 Order saved to database: ${savedOrder.orderId}`);
      
      // Publish order created event
      await this.eventPublisher.publishOrderCreated(savedOrder);
      
      console.log(`📢 Order created event published: ${savedOrder.orderId}`);
      
      return savedOrder;
      
    } catch (error) {
      console.error('❌ Failed to create order:', error.message);
      throw error;
    }
  }

  /**
   * Validate order data
   * @param {Object} orderData - Order data to validate
   */
  validateOrderData(orderData) {
    if (!orderData.userId) {
      throw new Error('User ID is required');
    }
    
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    
    if (!orderData.customerEmail) {
      throw new Error('Customer email is required');
    }
    
    if (!orderData.customerName) {
      throw new Error('Customer name is required');
    }
    
    // Validate each item
    orderData.items.forEach((item, index) => {
      if (!item.id) {
        throw new Error(`Item ${index + 1}: Product ID is required`);
      }
      if (!item.title) {
        throw new Error(`Item ${index + 1}: Product title is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Item ${index + 1}: Valid quantity is required`);
      }
      if (!item.price || item.price <= 0) {
        throw new Error(`Item ${index + 1}: Valid price is required`);
      }
    });
  }

  /**
   * Calculate total amount from items
   * @param {Array} items - Order items
   * @returns {Number} Total amount
   */
  calculateTotal(items) {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  }
}

module.exports = OrderService;