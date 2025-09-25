/**
 * OrderController - Simplified to handle only order creation
 * Following SOLID principles: Single Responsibility
 */
class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  /**
   * Create a new order
   * POST /orders
   */
  async createOrder(req, res) {
    try {
      console.log('📝 Creating order with data:', JSON.stringify(req.body, null, 2));
      
      const order = await this.orderService.createOrder(req.body);
      
      console.log('✅ Order created successfully:', order.orderId);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.orderId,
          status: order.status,
          totalAmount: order.totalAmount,
          items: order.items,
          createdAt: order.createdAt
        }
      });
    } catch (error) {
      console.error('❌ Create order error:', error.message);
      console.error('Stack:', error.stack);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create order',
        details: error.details || null
      });
    }
  }
}

module.exports = OrderController;