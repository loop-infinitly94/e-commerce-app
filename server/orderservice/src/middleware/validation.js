const Joi = require('joi');

// Order creation validation schema
const createOrderSchema = Joi.object({
  customerId: Joi.string().required().min(1).max(100),
  customerEmail: Joi.string().email().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      name: Joi.string().required().min(1).max(200),
      quantity: Joi.number().integer().min(1).max(99).required(),
      price: Joi.number().positive().precision(2).required()
    })
  ).min(1).max(50).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'cash_on_delivery').required(),
  notes: Joi.string().max(500).optional()
});

// Status update validation schema
const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required()
});

// Cancel order validation schema
const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(200).optional()
});

/**
 * Validate request body for order creation
 */
const validateCreateOrder = (req, res, next) => {
  const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  req.body = value; // Use validated and sanitized data
  next();
};

/**
 * Validate request body for status update
 */
const validateUpdateStatus = (req, res, next) => {
  const { error, value } = updateStatusSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => detail.message)
    });
  }
  
  req.body = value;
  next();
};

/**
 * Validate request body for order cancellation
 */
const validateCancelOrder = (req, res, next) => {
  const { error, value } = cancelOrderSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => detail.message)
    });
  }
  
  req.body = value;
  next();
};

/**
 * Validate UUID format for order ID parameter
 */
const validateOrderId = (req, res, next) => {
  const { id } = req.params;
  
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID format'
    });
  }
  
  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  next();
};

module.exports = {
  validateCreateOrder,
  validateUpdateStatus,
  validateCancelOrder,
  validateOrderId,
  validatePagination
};