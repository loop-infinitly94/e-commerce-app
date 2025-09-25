require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import configurations
const database = require('./config/database');
const kafkaConfig = require('./config/kafka');

// Import core components
const OrderRepository = require('./repositories/OrderRepository');
const EventPublisher = require('./services/EventPublisher');
const OrderService = require('./services/OrderService');
const OrderController = require('./controllers/OrderController');
const createOrderRoutes = require('./routes/orderRoutes');

// Import middleware
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

class OrderServiceApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.isShuttingDown = false;
  }

  async initialize() {
    try {
      console.log('🚀 Starting Order Service...');
      
      // Connect to database
      await database.connect();
      
      // Initialize Kafka
      const kafkaProducer = await kafkaConfig.getProducer();
      
      // Setup dependency injection (SOLID: Dependency Inversion)
      const orderRepository = new OrderRepository();
      const eventPublisher = new EventPublisher(kafkaProducer);
      const orderService = new OrderService(orderRepository, eventPublisher);
      const orderController = new OrderController(orderService);
      
      // Setup Express middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes(orderController);
      
      // Setup error handling
      this.setupErrorHandling();
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      console.log('✅ Order Service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Order Service:', error.message);
      process.exit(1);
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(requestLogger);
    }
    
    // Health check endpoint (before rate limiting)
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Order Service is healthy',
        timestamp: new Date().toISOString(),
        service: 'order-service',
        version: '1.0.0',
        uptime: process.uptime()
      });
    });
  }

  setupRoutes(orderController) {
    // API routes
    this.app.use('/api/orders', createOrderRoutes(orderController));
    
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Order Service API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          orders: '/api/orders',
          docs: '/api/orders/health'
        }
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      if (this.isShuttingDown) return;
      
      console.log(`\n🔄 Received ${signal}, starting graceful shutdown...`);
      this.isShuttingDown = true;

      try {
        // Stop accepting new requests
        this.server.close(async () => {
          console.log('✅ HTTP server closed');
          
          try {
            // Close database connection
            await database.disconnect();
            
            // Close Kafka connections
            await kafkaConfig.disconnect();
            
            console.log('✅ All connections closed gracefully');
            process.exit(0);
          } catch (error) {
            console.error('❌ Error during graceful shutdown:', error.message);
            process.exit(1);
          }
        });

        // Force shutdown after 30 seconds
        setTimeout(() => {
          console.log('⏰ Force shutdown after 30 seconds');
          process.exit(1);
        }, 30000);
        
      } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  async start() {
    await this.initialize();
    
    this.server = this.app.listen(this.port, () => {
      console.log(`\n🌟 Order Service is running!`);
      console.log(`📍 URL: http://localhost:${this.port}`);
      console.log(`🏥 Health: http://localhost:${this.port}/health`);
      console.log(`📚 API: http://localhost:${this.port}/api/orders`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });

    return this.app;
  }
}

// Start the application
if (require.main === module) {
  const app = new OrderServiceApp();
  app.start().catch(error => {
    console.error('❌ Failed to start Order Service:', error.message);
    process.exit(1);
  });
}

module.exports = OrderServiceApp;