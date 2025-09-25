/**
 * Event schemas and validation utilities
 * Following SOLID principles: Open/Closed Principle
 */

const Joi = require('joi');

/**
 * Base event schema that all events must follow
 */
const baseEventSchema = Joi.object({
  id: Joi.string().uuid().required(),
  type: Joi.string().required(),
  timestamp: Joi.date().iso().required(),
  version: Joi.string().default('1.0'),
  source: Joi.string().required(),
  data: Joi.object().required(),
  metadata: Joi.object().optional()
});

/**
 * Order Created Event Schema
 */
const orderCreatedEventSchema = baseEventSchema.keys({
  type: Joi.string().valid('ORDER_CREATED').required(),
  data: Joi.object({
    orderId: Joi.string().required(),
    userId: Joi.string().required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required()
      })
    ).min(1).required(),
    totalAmount: Joi.number().positive().required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    paymentMethod: Joi.string().required(),
    customerInfo: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().optional(),
      name: Joi.string().required()
    }).required()
  }).required()
});

/**
 * Order Status Updated Event Schema
 */
const orderStatusUpdatedEventSchema = baseEventSchema.keys({
  type: Joi.string().valid('ORDER_STATUS_UPDATED').required(),
  data: Joi.object({
    orderId: Joi.string().required(),
    userId: Joi.string().required(),
    oldStatus: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED').required(),
    newStatus: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED').required(),
    reason: Joi.string().optional(),
    updatedBy: Joi.string().optional(),
    estimatedDelivery: Joi.date().iso().optional(),
    trackingNumber: Joi.string().optional(),
    customerInfo: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().optional(),
      name: Joi.string().required()
    }).required()
  }).required()
});

/**
 * Order Cancelled Event Schema
 */
const orderCancelledEventSchema = baseEventSchema.keys({
  type: Joi.string().valid('ORDER_CANCELLED').required(),
  data: Joi.object({
    orderId: Joi.string().required(),
    userId: Joi.string().required(),
    reason: Joi.string().required(),
    refundAmount: Joi.number().positive().optional(),
    refundMethod: Joi.string().optional(),
    cancelledBy: Joi.string().required(), // 'USER' or 'SYSTEM' or 'ADMIN'
    customerInfo: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().optional(),
      name: Joi.string().required()
    }).required()
  }).required()
});

/**
 * Health Check Event Schema
 */
const healthCheckEventSchema = baseEventSchema.keys({
  type: Joi.string().valid('HEALTH_CHECK').required(),
  data: Joi.object({
    service: Joi.string().required(),
    status: Joi.string().valid('UP', 'DOWN', 'DEGRADED').required(),
    checks: Joi.object().optional(),
    timestamp: Joi.date().iso().required()
  }).required()
});

/**
 * Event Types Constants
 */
const EVENT_TYPES = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  HEALTH_CHECK: 'HEALTH_CHECK'
};

/**
 * Order Status Constants
 */
const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

/**
 * Event schema registry
 */
const eventSchemas = {
  [EVENT_TYPES.ORDER_CREATED]: orderCreatedEventSchema,
  [EVENT_TYPES.ORDER_STATUS_UPDATED]: orderStatusUpdatedEventSchema,
  [EVENT_TYPES.ORDER_CANCELLED]: orderCancelledEventSchema,
  [EVENT_TYPES.HEALTH_CHECK]: healthCheckEventSchema
};

/**
 * Event Validator - validates events against their schemas
 */
class EventValidator {
  /**
   * Validate an event against its schema
   * @param {Object} event - Event to validate
   * @returns {Object} Validation result
   */
  static validate(event) {
    try {
      // First validate against base schema
      const baseValidation = baseEventSchema.validate(event);
      if (baseValidation.error) {
        return {
          isValid: false,
          error: `Base validation failed: ${baseValidation.error.message}`,
          details: baseValidation.error.details
        };
      }

      // Then validate against specific event schema
      const eventSchema = eventSchemas[event.type];
      if (!eventSchema) {
        return {
          isValid: false,
          error: `Unknown event type: ${event.type}`,
          supportedTypes: Object.keys(EVENT_TYPES)
        };
      }

      const eventValidation = eventSchema.validate(event);
      if (eventValidation.error) {
        return {
          isValid: false,
          error: `Event validation failed: ${eventValidation.error.message}`,
          details: eventValidation.error.details
        };
      }

      return {
        isValid: true,
        event: eventValidation.value // Returns sanitized event
      };

    } catch (error) {
      return {
        isValid: false,
        error: `Validation error: ${error.message}`
      };
    }
  }

  /**
   * Get schema for a specific event type
   * @param {String} eventType - Event type
   * @returns {Object|null} Joi schema or null
   */
  static getSchema(eventType) {
    return eventSchemas[eventType] || null;
  }

  /**
   * Get all supported event types
   * @returns {Array} Array of supported event types
   */
  static getSupportedTypes() {
    return Object.keys(EVENT_TYPES);
  }
}

/**
 * Event Builder - helps create valid events
 */
class EventBuilder {
  /**
   * Create a new ORDER_CREATED event
   * @param {Object} orderData - Order data
   * @param {String} source - Event source service
   * @returns {Object} Valid event object
   */
  static createOrderCreatedEvent(orderData, source = 'order-service') {
    return {
      id: require('crypto').randomUUID(),
      type: EVENT_TYPES.ORDER_CREATED,
      timestamp: new Date().toISOString(),
      version: '1.0',
      source,
      data: orderData
    };
  }

  /**
   * Create a new ORDER_STATUS_UPDATED event
   * @param {Object} updateData - Status update data
   * @param {String} source - Event source service
   * @returns {Object} Valid event object
   */
  static createOrderStatusUpdatedEvent(updateData, source = 'order-service') {
    return {
      id: require('crypto').randomUUID(),
      type: EVENT_TYPES.ORDER_STATUS_UPDATED,
      timestamp: new Date().toISOString(),
      version: '1.0',
      source,
      data: updateData
    };
  }

  /**
   * Create a new ORDER_CANCELLED event
   * @param {Object} cancelData - Cancellation data
   * @param {String} source - Event source service
   * @returns {Object} Valid event object
   */
  static createOrderCancelledEvent(cancelData, source = 'order-service') {
    return {
      id: require('crypto').randomUUID(),
      type: EVENT_TYPES.ORDER_CANCELLED,
      timestamp: new Date().toISOString(),
      version: '1.0',
      source,
      data: cancelData
    };
  }

  /**
   * Create a new HEALTH_CHECK event
   * @param {Object} healthData - Health check data
   * @param {String} source - Event source service
   * @returns {Object} Valid event object
   */
  static createHealthCheckEvent(healthData, source) {
    return {
      id: require('crypto').randomUUID(),
      type: EVENT_TYPES.HEALTH_CHECK,
      timestamp: new Date().toISOString(),
      version: '1.0',
      source,
      data: healthData
    };
  }
}

/**
 * Event Utils - utility functions for event handling
 */
class EventUtils {
  /**
   * Extract order ID from event
   * @param {Object} event - Event object
   * @returns {String|null} Order ID or null
   */
  static getOrderId(event) {
    return event.data?.orderId || null;
  }

  /**
   * Extract user ID from event
   * @param {Object} event - Event object
   * @returns {String|null} User ID or null
   */
  static getUserId(event) {
    return event.data?.userId || null;
  }

  /**
   * Extract customer email from event
   * @param {Object} event - Event object
   * @returns {String|null} Customer email or null
   */
  static getCustomerEmail(event) {
    return event.data?.customerInfo?.email || null;
  }

  /**
   * Extract customer phone from event
   * @param {Object} event - Event object
   * @returns {String|null} Customer phone or null
   */
  static getCustomerPhone(event) {
    return event.data?.customerInfo?.phone || null;
  }

  /**
   * Check if event is retryable based on age
   * @param {Object} event - Event object
   * @param {Number} maxAgeMinutes - Maximum age in minutes (default: 60)
   * @returns {Boolean} Whether event is retryable
   */
  static isRetryable(event, maxAgeMinutes = 60) {
    const eventTime = new Date(event.timestamp);
    const now = new Date();
    const ageMinutes = (now - eventTime) / (1000 * 60);
    return ageMinutes <= maxAgeMinutes;
  }

  /**
   * Generate event fingerprint for deduplication
   * @param {Object} event - Event object
   * @returns {String} Event fingerprint
   */
  static generateFingerprint(event) {
    const { id, type, data } = event;
    const fingerprintData = {
      id,
      type,
      orderId: data?.orderId,
      userId: data?.userId
    };
    
    return require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(fingerprintData))
      .digest('hex');
  }
}

module.exports = {
  // Schemas
  baseEventSchema,
  orderCreatedEventSchema,
  orderStatusUpdatedEventSchema,
  orderCancelledEventSchema,
  healthCheckEventSchema,
  eventSchemas,

  // Constants
  EVENT_TYPES,
  ORDER_STATUSES,

  // Classes
  EventValidator,
  EventBuilder,
  EventUtils
};