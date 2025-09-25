/**
 * OrderEventConsumer - Kafka consumer for order events
 * Following SOLID principles: Single Responsibility
 */
class OrderEventConsumer {
  constructor(kafka, orderEventHandler) {
    this.kafka = kafka;
    this.orderEventHandler = orderEventHandler;
    this.consumer = null;
    this.isRunning = false;
    this.topics = ['order-events'];
  }

  /**
   * Start consuming events from Kafka
   * @returns {Promise<void>}
   */
  async start() {
    try {
      console.log('🚀 Starting Kafka event consumer...');
      
      // Create consumer
      this.consumer = this.kafka.consumer({
        groupId: 'notification-service-group',
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
        heartbeatInterval: 3000,
        allowAutoTopicCreation: false,
        maxBytesPerPartition: 1048576, // 1MB
      });

      // Connect consumer
      await this.consumer.connect();
      console.log('✅ Kafka consumer connected');

      // Subscribe to topics
      await this.consumer.subscribe({
        topics: this.topics,
        fromBeginning: false // Only consume new messages
      });

      console.log(`✅ Subscribed to topics: ${this.topics.join(', ')}`);

      // Start consuming messages
      this.isRunning = true;
      await this.consumer.run({
        // Process each message
        eachMessage: async ({ topic, partition, message, heartbeat }) => {
          try {
            await this.processMessage(topic, partition, message, heartbeat);
          } catch (error) {
            console.error('❌ Error processing message:', error.message);
            // Don't re-throw here to prevent consumer crash
            // Message will be retried based on Kafka configuration
          }
        },
      });

    } catch (error) {
      console.error('❌ Failed to start Kafka consumer:', error.message);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Process individual message
   * @param {String} topic - Kafka topic
   * @param {Number} partition - Partition number
   * @param {Object} message - Kafka message
   * @param {Function} heartbeat - Heartbeat function
   */
  async processMessage(topic, partition, message, heartbeat) {
    const startTime = Date.now();
    
    try {
      // Parse message
      const event = this.parseMessage(message);
      
      console.log(`📨 Received message:`, {
        topic,
        partition,
        offset: message.offset,
        eventType: event.type,
        orderId: event.data?.orderId,
        timestamp: event.timestamp
      });

      // Send heartbeat to prevent rebalance during processing
      await heartbeat();

      // Process the event
      await this.orderEventHandler.handle(event);

      // Log successful processing
      const processingTime = Date.now() - startTime;
      console.log(`✅ Message processed successfully in ${processingTime}ms:`, {
        topic,
        partition,
        offset: message.offset,
        eventType: event.type
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Failed to process message after ${processingTime}ms:`, {
        topic,
        partition,
        offset: message.offset,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      // In production, you might want to:
      // 1. Send to dead letter queue after X retries
      // 2. Alert monitoring systems
      // 3. Implement exponential backoff
      
      throw error; // Let Kafka handle retry logic
    }
  }

  /**
   * Parse Kafka message to event object
   * @param {Object} message - Raw Kafka message
   * @returns {Object} Parsed event
   */
  parseMessage(message) {
    try {
      // Parse the JSON message
      const event = JSON.parse(message.value.toString());
      
      // Extract headers if available
      const headers = {};
      if (message.headers) {
        Object.keys(message.headers).forEach(key => {
          headers[key] = message.headers[key].toString();
        });
      }

      // Add metadata
      event.metadata = {
        headers,
        key: message.key?.toString(),
        offset: message.offset,
        timestamp: message.timestamp,
        receivedAt: new Date().toISOString()
      };

      return event;
      
    } catch (error) {
      console.error('❌ Failed to parse message:', error.message);
      console.error('Raw message value:', message.value.toString());
      throw new Error(`Message parsing failed: ${error.message}`);
    }
  }

  /**
   * Process batch of messages (alternative to eachMessage)
   * @param {Object} batch - Batch of messages
   * @param {Function} resolveOffset - Offset resolution function
   * @param {Function} heartbeat - Heartbeat function
   */
  async processBatch(batch, resolveOffset, heartbeat) {
    console.log(`📦 Processing batch of ${batch.messages.length} messages from ${batch.topic}`);
    
    for (const message of batch.messages) {
      try {
        await this.processMessage(batch.topic, batch.partition, message, heartbeat);
        
        // Resolve offset after successful processing
        resolveOffset(message.offset);
        
      } catch (error) {
        console.error(`❌ Failed to process message in batch:`, {
          topic: batch.topic,
          partition: batch.partition,
          offset: message.offset,
          error: error.message
        });
        
        // Stop processing batch on error
        break;
      }
    }
  }

  /**
   * Stop the consumer gracefully
   * @returns {Promise<void>}
   */
  async stop() {
    try {
      console.log('🔄 Stopping Kafka consumer...');
      
      this.isRunning = false;
      
      if (this.consumer) {
        await this.consumer.disconnect();
        console.log('✅ Kafka consumer stopped gracefully');
      }
    } catch (error) {
      console.error('❌ Error stopping Kafka consumer:', error.message);
      throw error;
    }
  }

  /**
   * Check if consumer is healthy
   * @returns {Boolean} Consumer health status
   */
  isHealthy() {
    return this.isRunning && this.consumer !== null;
  }

  /**
   * Get consumer statistics
   * @returns {Object} Consumer stats
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      topics: this.topics,
      groupId: 'notification-service-group',
      lastHeartbeat: new Date().toISOString()
    };
  }

  /**
   * Pause consumer
   * @returns {Promise<void>}
   */
  async pause() {
    if (this.consumer && this.isRunning) {
      await this.consumer.pause([{ topic: this.topics[0] }]);
      console.log('⏸️  Kafka consumer paused');
    }
  }

  /**
   * Resume consumer
   * @returns {Promise<void>}
   */
  async resume() {
    if (this.consumer && this.isRunning) {
      await this.consumer.resume([{ topic: this.topics[0] }]);
      console.log('▶️  Kafka consumer resumed');
    }
  }
}

module.exports = OrderEventConsumer;