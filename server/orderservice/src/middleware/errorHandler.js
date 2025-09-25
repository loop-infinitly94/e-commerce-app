/**
 * Global error handler middleware
 * Following SOLID principles: Single Responsibility
 */

const errorHandler = (error, req, res, next) => {
  console.error('❌ Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate ${field}`,
      error: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Kafka errors
  if (error.message.includes('Kafka') || error.message.includes('Event publishing')) {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
      error: 'Event processing failed'
    });
  }

  // Database connection errors
  if (error.message.includes('MongoDB') || error.message.includes('database')) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable',
      error: 'Please try again later'
    });
  }

  // Business logic errors (thrown by services)
  if (error.message.includes('Order creation failed') || 
      error.message.includes('Validation failed') ||
      error.message.includes('Invalid status transition') ||
      error.message.includes('cannot be cancelled') ||
      error.message.includes('Minimum order value') ||
      error.message.includes('Maximum')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Not found errors
  if (error.message === 'Order not found') {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack
    })
  });
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.url}`, {
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusIcon = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
    
    console.log(`${statusIcon} ${req.method} ${req.url} - ${status} - ${duration}ms`);
  });

  next();
};

/**
 * Rate limiting helper (basic implementation)
 */
const createRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const key = req.ip;

    // Clean old entries
    if (requests.has(key)) {
      requests.set(key, requests.get(key).filter(time => time > windowStart));
    }

    const currentRequests = requests.get(key) || [];
    
    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    currentRequests.push(now);
    requests.set(key, currentRequests);
    next();
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger,
  createRateLimit
};