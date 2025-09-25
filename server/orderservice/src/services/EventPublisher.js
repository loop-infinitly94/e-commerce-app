/**
 * EventPublisher - Handles publishing events to Kafka
 * Following SOLID principles: Single Responsibility & Interface Segregation
 */
class EventPublisher {
  constructor(kafkaProducer) {
    this.producer = kafkaProducer;
    this.topic = 'order-events';
  }

  /**
   * Publish order created event
   * @param {Object} order - Order object
   */
  async publishOrderCreated(order) {
    const event = {
      type: 'ORDER_CREATED',
      timestamp: new Date().toISOString(),
      version: '1.0',
      source: 'order-service',
      data: order.toEventData()
    };

    return this.publishEvent(event, order.orderId);
  }
  /**
   * Generic method to publish any event
   * @param {Object} event - Event object
   * @param {String} key - Partition key (usually orderId)
   */
  async publishEvent(event, key) {
    try {
      const message = {
        topic: this.topic,
        messages: [{
          key: key,
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
          headers: {
            'event-type': event.type,
            'event-version': event.version,
            'source-service': event.source
          }
        }]
      };

      const result = await this.producer.send(message);
      
      console.log(`✅ Published event: ${event.type} for order: ${key}`);
      console.log('📤 Event details:', {
        topic: this.topic,
        partition: result[0].partition,
        offset: result[0].offset,
        eventType: event.type
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to publish event:', error.message);
      console.error('Event details:', { type: event.type, key });
      throw new Error(`Event publishing failed: ${error.message}`);
    }
  }

  /**
   * Health check method
   */
  async isHealthy() {
    try {
      // Send a simple health check event
      const healthEvent = {
        type: 'HEALTH_CHECK',
        timestamp: new Date().toISOString(),
        version: '1.0',
        source: 'order-service',
        data: { status: 'healthy' }
      };

      await this.publishEvent(healthEvent, 'health-check');
      return true;
    } catch (error) {
      console.error('❌ EventPublisher health check failed:', error.message);
      return false;
    }
  }
}

module.exports = EventPublisher;