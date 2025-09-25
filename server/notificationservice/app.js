/**
 * Main Notification Service Application
 * Following SOLID principles: Dependency Inversion Principle
 */

// Load environment variables
require('dotenv').config();

const { Kafka, logLevel } = require('kafkajs');
const OrderEventConsumer = require('./src/consumers/OrderEventConsumer');
const OrderEventHandler = require('./src/handlers/OrderEventHandler');
const NotificationService = require('./src/services/NotificationService');
const EmailService = require('./src/services/EmailService');
const SMSService = require('./src/services/SMSService');

class NotificationServiceApp {
  constructor() {
    // Kafka configuration
    this.kafkaClient = new Kafka({
      clientId: 'notification-service',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9093'],
      connectionTimeout: 30000,
      requestTimeout: 25000,
      retry: {
        initialRetryTime: 100,
        retries: 8
      },
      logLevel: process.env.NODE_ENV === 'production' ? logLevel.WARN : logLevel.INFO
    });

    // Initialize services (Dependency Injection)
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.notificationService = new NotificationService(this.emailService, this.smsService);
    
    // Initialize event handler
    this.orderEventHandler = new OrderEventHandler(this.notificationService);
    
    // Initialize Kafka consumer
    this.orderEventConsumer = new OrderEventConsumer(
      this.kafkaClient,
      this.orderEventHandler
    );

    // Application state
    this.isStarted = false;
    this.startTime = null;
    this.metrics = {
      messagesProcessed: 0,
      errorsEncountered: 0,
      lastError: null,
      uptime: 0
    };

    // Bind shutdown handlers
    this.setupGracefulShutdown();
  }

  /**
   * Start the notification service
   * @returns {Promise<void>}
   */
  async start() {
    try {
      console.log('🚀 Starting Notification Service...');
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Kafka Brokers: ${process.env.KAFKA_BROKERS || 'localhost:9092'}`);
      
      this.startTime = new Date();

      // Test Kafka connectivity
      await this.testKafkaConnection();

      // Initialize services
      await this.initializeServices();

      // Start consuming events
      await this.orderEventConsumer.start();

      this.isStarted = true;
      
      console.log('✅ Notification Service started successfully!');
      console.log(`🕒 Started at: ${this.startTime.toISOString()}`);
      
      // Start health check interval
      this.startHealthCheck();

      // Keep the process alive
      this.keepAlive();

    } catch (error) {
      console.error('❌ Failed to start Notification Service:', error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    }
  }

  /**
   * Test Kafka connection
   * @returns {Promise<void>}
   */
  async testKafkaConnection() {
    try {
      console.log('🔍 Testing Kafka connection...');
      
      const admin = this.kafkaClient.admin();
      await admin.connect();
      
      // List topics to verify connection
      const topics = await admin.listTopics();
      console.log(`✅ Connected to Kafka. Available topics: ${topics.length}`);
      
      // Check if order-events topic exists
      if (topics.includes('order-events')) {
        console.log('✅ order-events topic found');
      } else {
        console.log('⚠️  order-events topic not found - it will be created when needed');
      }
      
      await admin.disconnect();
      
    } catch (error) {
      console.error('❌ Kafka connection test failed:', error.message);
      throw new Error(`Kafka connectivity failed: ${error.message}`);
    }
  }

  /**
   * Initialize all services
   * @returns {Promise<void>}
   */
  async initializeServices() {
    try {
      console.log('🔧 Initializing services...');

      // Initialize email service
      console.log('📧 Initializing Email Service...');
      
      // Initialize SMS service  
      console.log('📱 Initializing SMS Service...');
      
      // Initialize notification service
      console.log('🔔 Initializing Notification Service...');
      
      console.log('✅ All services initialized');
      
    } catch (error) {
      console.error('❌ Service initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Start health check interval
   */
  startHealthCheck() {
    const healthCheckInterval = parseInt(process.env.HEALTH_CHECK_INTERVAL_MS) || 30000; // 30 seconds

    setInterval(() => {
      this.performHealthCheck();
    }, healthCheckInterval);

    console.log(`💊 Health check started (interval: ${healthCheckInterval}ms)`);
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    try {
      const now = new Date();
      this.metrics.uptime = now - this.startTime;
      
      const health = {
        service: 'notification-service',
        status: this.isStarted && this.orderEventConsumer.isHealthy() ? 'UP' : 'DOWN',
        timestamp: now.toISOString(),
        uptime: this.metrics.uptime,
        metrics: {
          messagesProcessed: this.metrics.messagesProcessed,
          errorsEncountered: this.metrics.errorsEncountered,
          lastError: this.metrics.lastError
        },
        components: {
          kafkaConsumer: this.orderEventConsumer.isHealthy() ? 'UP' : 'DOWN',
          emailService: 'UP', // Mock services are always UP
          smsService: 'UP',
          notificationService: 'UP'
        }
      };

      // Log health status periodically (every 5 minutes)
      const fiveMinutes = 5 * 60 * 1000;
      if (this.metrics.uptime % fiveMinutes < 30000) { // Within 30 second window
        console.log('💊 Health Check:', {
          status: health.status,
          uptime: `${Math.floor(health.uptime / 1000)}s`,
          messagesProcessed: health.metrics.messagesProcessed
        });
      }

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.metrics.errorsEncountered++;
      this.metrics.lastError = error.message;
    }
  }

  /**
   * Keep the process alive
   */
  keepAlive() {
    // Prevent the Node.js process from exiting
    const keepAliveInterval = setInterval(() => {
      // This function intentionally does nothing except keep the event loop active
    }, 1000);

    // Store interval for cleanup
    this.keepAliveInterval = keepAliveInterval;
  }

  /**
   * Stop the notification service gracefully
   * @returns {Promise<void>}
   */
  async stop() {
    try {
      console.log('🔄 Stopping Notification Service gracefully...');

      this.isStarted = false;

      // Clear keep-alive interval
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }

      // Stop Kafka consumer
      console.log('🔄 Stopping Kafka consumer...');
      await this.orderEventConsumer.stop();

      // Stop other services if needed
      console.log('🔄 Stopping other services...');

      const stopTime = new Date();
      const totalUptime = stopTime - this.startTime;
      
      console.log('✅ Notification Service stopped gracefully');
      console.log(`📊 Final Stats:`, {
        totalUptime: `${Math.floor(totalUptime / 1000)}s`,
        messagesProcessed: this.metrics.messagesProcessed,
        errorsEncountered: this.metrics.errorsEncountered
      });

    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error.message);
      throw error;
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\n📡 Received SIGINT (Ctrl+C). Initiating graceful shutdown...');
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
      }
    });

    // Handle SIGTERM (Docker/K8s termination)
    process.on('SIGTERM', async () => {
      console.log('\n📡 Received SIGTERM. Initiating graceful shutdown...');
      try {
        await this.stop();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('💥 Uncaught Exception:', error.message);
      console.error('Stack:', error.stack);
      
      try {
        await this.stop();
      } catch (shutdownError) {
        console.error('❌ Error during emergency shutdown:', shutdownError.message);
      }
      
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('💥 Unhandled Promise Rejection at:', promise);
      console.error('Reason:', reason);
      
      this.metrics.errorsEncountered++;
      this.metrics.lastError = reason?.message || 'Unhandled promise rejection';
      
      // Don't exit on unhandled rejections in production, but log them
      if (process.env.NODE_ENV !== 'production') {
        try {
          await this.stop();
        } catch (shutdownError) {
          console.error('❌ Error during emergency shutdown:', shutdownError.message);
        }
        process.exit(1);
      }
    });

    console.log('🛡️  Graceful shutdown handlers registered');
  }

  /**
   * Get application metrics
   * @returns {Object} Application metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      isStarted: this.isStarted,
      startTime: this.startTime?.toISOString(),
      uptime: this.startTime ? new Date() - this.startTime : 0
    };
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  const app = new NotificationServiceApp();
  
  // Handle startup
  app.start().catch(error => {
    console.error('💥 Failed to start application:', error.message);
    process.exit(1);
  });
}

module.exports = NotificationServiceApp;