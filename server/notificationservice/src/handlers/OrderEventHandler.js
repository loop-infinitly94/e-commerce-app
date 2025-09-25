/**
 * OrderEventHandler - Handles different types of order events
 * Following SOLID principles: Single Responsibility & Open/Closed
 */
class OrderEventHandler {
  constructor(notificationService) {
    this.notificationService = notificationService;
    this.processedEvents = new Set(); // Simple deduplication
  }

  /**
   * Main event handler - routes events to appropriate handlers
   * @param {Object} event - Kafka event message
   * @returns {Promise<void>}
   */
  async handle(event) {
    try {
      // Basic event validation
      if (!this.isValidEvent(event)) {
        console.warn('⚠️  Received invalid event structure:', event);
        return;
      }

      // Deduplication check
      const eventId = this.generateEventId(event);
      if (this.processedEvents.has(eventId)) {
        console.log(`🔄 Duplicate event ignored: ${event.type} - ${eventId}`);
        return;
      }

      console.log(`📨 Processing event: ${event.type} for order: ${event.data?.orderId}`);
      
      // Only handle ORDER_CREATED events
      if (event.type === 'ORDER_CREATED') {
        await this.handleOrderCreated(event);
      } else {
        console.log(`ℹ️  Ignoring event type: ${event.type} - only handling ORDER_CREATED`);
        return;
      }

      // Mark event as processed
      this.processedEvents.add(eventId);
      
      // Clean up old processed events (keep last 1000)
      if (this.processedEvents.size > 1000) {
        const eventsArray = Array.from(this.processedEvents);
        this.processedEvents.clear();
        eventsArray.slice(-500).forEach(id => this.processedEvents.add(id));
      }

      console.log(`✅ Successfully processed event: ${event.type} - ${eventId}`);
      
    } catch (error) {
      console.error(`❌ Failed to process event:`, {
        eventType: event.type,
        orderId: event.data?.orderId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // In production, you might want to:
      // 1. Send to dead letter queue
      // 2. Alert monitoring systems
      // 3. Implement retry logic
      throw error; // Re-throw to let Kafka handle retry
    }
  }

  /**
   * Handle ORDER_CREATED events
   * @param {Object} event - Order created event
   */
  async handleOrderCreated(event) {
    const orderData = event.data;
    
    console.log(`🎉 New order created: ${orderData.orderId} - Customer: ${orderData.customerEmail}`);
    
    try {
      const notificationResult = await this.notificationService.sendOrderConfirmation(orderData);
      
      console.log(`✅ Order confirmation notifications sent:`, {
        orderId: orderData.orderId,
        notifications: notificationResult.notifications.length,
        successful: notificationResult.notifications.filter(n => n.status === 'success').length
      });
      
    } catch (error) {
      console.error(`❌ Failed to send order confirmation for ${orderData.orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Handle ORDER_STATUS_UPDATED events
   * @param {Object} event - Order status updated event
   */
  async handleOrderStatusUpdated(event) {
    const orderData = event.data;
    
    console.log(`📝 Order status updated: ${orderData.orderId} - ${orderData.previousStatus} → ${orderData.status}`);
    
    try {
      const notificationResult = await this.notificationService.sendStatusUpdateNotification(orderData);
      
      console.log(`✅ Status update notifications sent:`, {
        orderId: orderData.orderId,
        newStatus: orderData.status,
        notifications: notificationResult.notifications.length,
        successful: notificationResult.notifications.filter(n => n.status === 'success').length
      });
      
    } catch (error) {
      console.error(`❌ Failed to send status update for ${orderData.orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Handle ORDER_CANCELLED events
   * @param {Object} event - Order cancelled event
   */
  async handleOrderCancelled(event) {
    const orderData = event.data;
    
    console.log(`❌ Order cancelled: ${orderData.orderId} - Reason: ${orderData.cancellationReason}`);
    
    try {
      const notificationResult = await this.notificationService.sendCancellationNotification(orderData);
      
      console.log(`✅ Cancellation notifications sent:`, {
        orderId: orderData.orderId,
        reason: orderData.cancellationReason,
        notifications: notificationResult.notifications.length,
        successful: notificationResult.notifications.filter(n => n.status === 'success').length
      });
      
    } catch (error) {
      console.error(`❌ Failed to send cancellation notification for ${orderData.orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Handle HEALTH_CHECK events
   * @param {Object} event - Health check event
   */
  async handleHealthCheck(event) {
    console.log('🏥 Received health check event from order service');
    
    try {
      const healthStatus = await this.notificationService.checkHealth();
      console.log('📊 Notification service health:', healthStatus);
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }
  }

  /**
   * Validate event structure
   * @param {Object} event - Event to validate
   * @returns {Boolean} Is valid event
   */
  isValidEvent(event) {
    return (
      event &&
      typeof event === 'object' &&
      event.type &&
      event.timestamp &&
      event.data &&
      typeof event.data === 'object'
    );
  }

  /**
   * Generate unique event ID for deduplication
   * @param {Object} event - Event object
   * @returns {String} Event ID
   */
  generateEventId(event) {
    const orderId = event.data?.orderId || 'unknown';
    const timestamp = event.timestamp || Date.now();
    const type = event.type;
    
    return `${type}-${orderId}-${timestamp}`;
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing stats
   */
  getStats() {
    return {
      processedEventsCount: this.processedEvents.size,
      lastProcessedAt: new Date().toISOString()
    };
  }
}

module.exports = OrderEventHandler;