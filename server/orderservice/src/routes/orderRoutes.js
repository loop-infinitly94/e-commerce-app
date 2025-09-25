const express = require('express');

/**
 * Simplified Order Routes - Dependency Injection Pattern
 * Following SOLID principles: Dependency Inversion
 */
const createOrderRoutes = (dependencies) => {
  const router = express.Router();
  const { orderController } = dependencies;

  // Validate dependencies
  if (!orderController) {
    throw new Error('OrderController dependency is required');
  }

  // Health check endpoint - checks service health
  router.get('/health', async (req, res) => {
    try {
      // Could check database, Kafka, etc.
      const healthStatus = {
        success: true,
        service: 'order-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
        dependencies: {
          database: 'UP', // Could check actual DB connection
          kafka: 'UP',    // Could check actual Kafka connection
        }
      };
      
      res.json(healthStatus);
    } catch (error) {
      res.status(503).json({
        success: false,
        service: 'order-service',
        status: 'DOWN',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Create new order - simplified endpoint
  router.post('/', async (req, res) => {
    try {
      await orderController.createOrder(req, res);
    } catch (error) {
      console.error('❌ Route error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  return router;
};

module.exports = createOrderRoutes;