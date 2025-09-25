const express = require('express');

/**
 * Simplified Order Routes - Only create order endpoint
 */
const createOrderRoutes = (orderController) => {
  const router = express.Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      service: 'order-service',
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  });

  // Create new order - simplified
  router.post('/', orderController.createOrder.bind(orderController));

  return router;
};

module.exports = createOrderRoutes;