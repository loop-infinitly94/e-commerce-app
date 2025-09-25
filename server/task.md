# Event-Driven Microservices Architecture with Kafka

## Project Overview

Implementation of event-driven microservices architecture using Kafka for communication between Order Service and Notification Service.

## Architecture Components

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client    │───▶│Order Service│───▶│     Kafka       │───▶│Notification Svc │
│(E-commerce) │    │             │    │(Event Broker)   │    │                 │
└─────────────┘    └─────────────┘    └─────────────────┘    └─────────────────┘
                           │                                           │
                           ▼                                           ▼
                   ┌─────────────┐                           ┌─────────────┐
                   │  Local DB   │                           │Mock Customer│
                   │ (Orders)    │                           │Notification │
                   └─────────────┘                           └─────────────┘
```

## Services Structure

### 1. Order Service (`orderservice/`)

**Responsibilities:**
- Accept orders from e-commerce client
- Validate order data
- Save orders to local database
- Publish order events to Kafka

**Technology Stack:**
- Node.js with Express
- MongoDB for data persistence
- Kafka client (kafkajs)
- SOLID principles implementation

### 2. Notification Service (`notificationservice/`)

**Responsibilities:**
- Listen to Kafka order events
- Process order notifications
- Send mock notifications to customers

**Technology Stack:**
- Node.js
- Kafka consumer (kafkajs)
- Mock notification implementations

## Detailed Implementation Tasks

### Phase 1: Infrastructure Setup

#### Task 1.1: Docker Environment
- [x] Kafka setup with Zookeeper
- [x] Kafka UI for monitoring
- [ ] Add MongoDB/PostgreSQL to docker-compose
- [ ] Add Redis for caching (optional)

#### Task 1.2: Project Structure
```
server/
├── docker-compose.yml
├── task.md
├── orderservice/
│   ├── package.json
│   ├── src/
│   │   ├── controllers/
│   │   │   └── OrderController.js
│   │   ├── services/
│   │   │   ├── OrderService.js
│   │   │   └── EventPublisher.js
│   │   ├── models/
│   │   │   └── Order.js
│   │   ├── repositories/
│   │   │   └── OrderRepository.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── kafka.js
│   │   ├── middleware/
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   └── orderRoutes.js
│   │   └── index.js
│   └── Dockerfile
├── notificationservice/
│   ├── package.json
│   ├── src/
│   │   ├── consumers/
│   │   │   └── OrderEventConsumer.js
│   │   ├── services/
│   │   │   ├── NotificationService.js
│   │   │   └── EmailService.js (mock)
│   │   ├── config/
│   │   │   └── kafka.js
│   │   ├── handlers/
│   │   │   └── OrderEventHandler.js
│   │   └── index.js
│   └── Dockerfile
└── shared/
    ├── events/
    │   └── OrderEvents.js
    └── utils/
        └── logger.js
```

### Phase 2: Order Service Implementation

#### Task 2.1: Database Models (SOLID: Single Responsibility)
```javascript
// models/Order.js
class Order {
  constructor(orderData) {
    this.id = orderData.id;
    this.customerId = orderData.customerId;
    this.items = orderData.items;
    this.totalAmount = orderData.totalAmount;
    this.status = orderData.status || 'pending';
    this.createdAt = orderData.createdAt || new Date();
    this.updatedAt = orderData.updatedAt || new Date();
  }

  validate() {
    // Validation logic
  }

  calculateTotal() {
    // Total calculation logic
  }
}
```

#### Task 2.2: Repository Pattern (SOLID: Dependency Inversion)
```javascript
// repositories/OrderRepository.js
class OrderRepository {
  async save(order) {
    // Database save implementation
  }

  async findById(id) {
    // Find order by ID
  }

  async findByCustomerId(customerId) {
    // Find orders by customer
  }
}
```

#### Task 2.3: Service Layer (SOLID: Single Responsibility + Open/Closed)
```javascript
// services/OrderService.js
class OrderService {
  constructor(orderRepository, eventPublisher) {
    this.orderRepository = orderRepository;
    this.eventPublisher = eventPublisher;
  }

  async createOrder(orderData) {
    // 1. Validate order
    // 2. Save to database
    // 3. Publish event
  }

  async getOrder(id) {
    // Retrieve order logic
  }
}
```

#### Task 2.4: Event Publisher (SOLID: Interface Segregation)
```javascript
// services/EventPublisher.js
class EventPublisher {
  constructor(kafkaProducer) {
    this.producer = kafkaProducer;
  }

  async publishOrderCreated(order) {
    const event = {
      type: 'ORDER_CREATED',
      timestamp: new Date().toISOString(),
      data: {
        orderId: order.id,
        customerId: order.customerId,
        totalAmount: order.totalAmount,
        items: order.items
      }
    };
    
    await this.producer.send({
      topic: 'order-events',
      messages: [{
        key: order.id,
        value: JSON.stringify(event)
      }]
    });
  }
}
```

#### Task 2.5: Controller Layer (SOLID: Single Responsibility)
```javascript
// controllers/OrderController.js
class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  async createOrder(req, res, next) {
    try {
      const order = await this.orderService.createOrder(req.body);
      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req, res, next) {
    try {
      const order = await this.orderService.getOrder(req.params.id);
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### Task 3: Notification Service Implementation ✅

#### Task 3.1: Basic Structure ✅
- [x] Create notification service directory
- [x] Setup package.json with dependencies  
- [x] Create basic application structure

#### Task 3.2: Email Service ✅
- [x] Create EmailService with mock implementation
- [x] Add email templates for different order events
- [x] Implement email sending logic

#### Task 3.3: SMS Service ✅
- [x] Create SMSService with mock implementation  
- [x] Add SMS templates for order notifications
- [x] Implement SMS sending logic

#### Task 3.4: Notification Orchestration ✅
- [x] Create NotificationService to orchestrate email/SMS
- [x] Implement notification routing logic
- [x] Add notification preferences handling

#### Task 3.5: Event Handling ✅
- [x] Create Kafka consumer for order events
- [x] Implement event handlers for different order events
- [x] Add event validation and error handling

#### Task 3.6: Integration ✅
- [x] Connect to Kafka broker
- [x] Subscribe to order-events topic
- [x] Create comprehensive event schemas
- [x] Implement main application with dependency injection
- [x] Add graceful shutdown and health checks

### Phase 4: API Endpoints

#### Task 4.1: Order API Endpoints
```
POST /api/orders
- Create new order
- Request body: { customerId, items: [{ productId, quantity, price }] }
- Response: { success, data: order, message }

GET /api/orders/:id
- Get order by ID
- Response: { success, data: order }

GET /api/orders/customer/:customerId
- Get orders by customer
- Response: { success, data: orders[] }

PUT /api/orders/:id/status
- Update order status
- Request body: { status }
- Response: { success, data: order, message }
```

### Phase 5: Event Types and Schema

#### Task 5.1: Event Schema Definition
```javascript
// shared/events/OrderEvents.js
const OrderEvents = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_UPDATED: 'ORDER_UPDATED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED'
};

const OrderEventSchema = {
  type: 'string',
  timestamp: 'ISO string',
  data: {
    orderId: 'string',
    customerId: 'string',
    totalAmount: 'number',
    status: 'string',
    items: 'array'
  }
};
```

### Phase 6: Testing Strategy

#### Task 6.1: Unit Tests
- Order model validation
- OrderService business logic
- EventPublisher functionality
- NotificationService mock implementations

#### Task 6.2: Integration Tests
- Database operations
- Kafka producer/consumer
- API endpoints
- End-to-end order flow

#### Task 6.3: Mock Implementations
```javascript
// Mock Email Service
class MockEmailService {
  async send(emailContent) {
    console.log('📧 Mock Email Sent:');
    console.log(`To: ${emailContent.to}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Body: ${emailContent.body}`);
    return { success: true, messageId: 'mock-' + Date.now() };
  }
}
```

## Implementation Phases

### Phase 1: Setup (Week 1)
- [ ] Docker infrastructure
- [ ] Project structure
- [ ] Database setup
- [ ] Kafka configuration

### Phase 2: Order Service (Week 2)
- [ ] Models and repositories
- [ ] Service layer implementation
- [ ] Controller and routes
- [ ] Kafka producer setup

### Phase 3: Notification Service (Week 3)
- [ ] Kafka consumer setup
- [ ] Event handlers
- [ ] Mock notification services
- [ ] Service integration

### Phase 4: Testing & Documentation (Week 4)
- [ ] Unit and integration tests
- [ ] API documentation
- [ ] Performance testing
- [ ] Deployment scripts

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- **OrderController**: Only handles HTTP requests/responses
- **OrderService**: Only handles business logic
- **OrderRepository**: Only handles data persistence
- **EventPublisher**: Only handles event publishing

### Open/Closed Principle (OCP)
- **NotificationService**: Extensible for new notification types without modification
- **EventHandler**: Can add new event types without changing existing code

### Liskov Substitution Principle (LSP)
- **Repository interfaces**: Any implementation should be substitutable
- **Notification services**: Different notification providers should be interchangeable

### Interface Segregation Principle (ISP)
- **Separate interfaces** for different capabilities (EmailSender, SMSSender)
- **Focused contracts** for each service responsibility

### Dependency Inversion Principle (DIP)
- **Dependency injection** throughout the application
- **Abstract dependencies** rather than concrete implementations
- **Configuration-based** service instantiation

## Environment Configuration

```env
# Order Service
PORT=3001
DB_URL=mongodb://localhost:27017/orderdb
KAFKA_BROKERS=localhost:9092
NODE_ENV=development

# Notification Service
KAFKA_BROKERS=localhost:9092
NOTIFICATION_PORT=3002
```

## Success Criteria

1. ✅ Order service accepts and validates orders
2. ✅ Orders are persisted to local database
3. ✅ Order events are published to Kafka
4. ✅ Notification service consumes events
5. ✅ Mock notifications are sent successfully
6. ✅ SOLID principles are properly implemented
7. ✅ Services are loosely coupled
8. ✅ System is scalable and maintainable

## Getting Started

1. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```

2. **Install Dependencies**:
   ```bash
   cd orderservice && npm install
   cd ../notificationservice && npm install
   ```

3. **Run Services**:
   ```bash
   # Terminal 1
   cd orderservice && npm start

   # Terminal 2
   cd notificationservice && npm start
   ```

4. **Test the Flow**:
   ```bash
   curl -X POST http://localhost:3001/api/orders \
     -H "Content-Type: application/json" \
     -d '{"customerId":"123","items":[{"productId":"1","quantity":2,"price":29.99}]}'
   ```

This comprehensive task file provides a complete roadmap for implementing the event-driven microservices architecture with proper SOLID principles and Kafka integration.