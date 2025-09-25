# Event-Driven E-Commerce Architecture

A modern microservices-based e-commerce application demonstrating event-driven architecture patterns with React frontend, Node.js backend services, and Apache Kafka for event streaming.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React App (Vite + TypeScript)                                 │
│  ├─ Redux Toolkit (State Management)                           │
│  ├─ RTK Query (API Integration)                                │
│  ├─ Tailwind CSS (Styling)                                     │
│  └─ React Router (Navigation)                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/REST
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Order Service (Express.js)                                    │
│  ├─ RESTful APIs                                               │
│  ├─ Request Validation (Joi)                                   │
│  ├─ Security (Helmet, CORS)                                    │
│  └─ MongoDB Integration                                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Kafka Events
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT STREAMING LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  Apache Kafka + Zookeeper                                      │
│  ├─ Event Topics (order-events)                                │
│  ├─ Event Producers                                            │
│  └─ Event Consumers                                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Event Consumption
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS SERVICES LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  Notification Service (Node.js)                                │
│  ├─ Event Handlers (Order Events)                              │
│  ├─ Email Service (SMTP)                                       │
│  ├─ SMS Service (Twilio)                                       │
│  └─ SOLID Principles Implementation                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA PERSISTENCE LAYER                    │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB (Document Database)                                   │
│  ├─ Orders Collection                                          │
│  ├─ Products Collection                                        │
│  └─ Users Collection                                           │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - Predictable state management
- **RTK Query** - Powerful data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Declarative routing
- **Heroicons** - Beautiful SVG icons

### Backend Services
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL document database
- **Apache Kafka** - Distributed event streaming platform
- **Zookeeper** - Coordination service for Kafka
- **KafkaJS** - Modern Kafka client for Node.js

### Development & Security
- **Joi** - Object schema validation
- **Helmet** - Security middleware
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management
- **Nodemon** - Development auto-reload
- **ESLint** - Code linting and formatting

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Git** - Version control

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ED-architecture
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
cd client/e-commerce-app
npm install
```

#### Backend Dependencies
```bash
# Order Service
cd ../../server/orderservice
npm install

# Notification Service
cd ../notificationservice
npm install
```

### 3. Environment Configuration

#### Order Service Environment
Create `.env` file in `server/orderservice/`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/orderdb
NODE_ENV=development
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=order-service
JWT_SECRET=your_jwt_secret_key
```

#### Notification Service Environment
Create `.env` file in `server/notificationservice/`:

```env
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=notification-service
KAFKA_GROUP_ID=notification-service-group
NODE_ENV=development
EMAIL_SERVICE_URL=http://localhost:3003
SMS_SERVICE_URL=http://localhost:3004
```

## 🏃‍♂️ Running the Application

### 1. Start Infrastructure Services

Start MongoDB, Kafka, and Zookeeper using Docker Compose:

```bash
cd server
docker-compose up -d
```

This will start:
- MongoDB on `localhost:27017`
- Kafka on `localhost:9092`
- Zookeeper on `localhost:2181`

### 2. Start Backend Services

#### Terminal 1: Order Service
```bash
cd server/orderservice
npm start
```
The Order Service will be available at `http://localhost:3001`

#### Terminal 2: Notification Service
```bash
cd server/notificationservice
npm start
```
The Notification Service will start consuming events from Kafka.

### 3. Start Frontend Application

#### Terminal 3: React App
```bash
cd client/e-commerce-app
npm run dev
```
The React app will be available at `http://localhost:5173`

## 📊 API Documentation

### Order Service Endpoints

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_123",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 2
    }
  ],
  "customer": {
    "id": "customer_456",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "NY",
    "zipCode": "12345",
    "country": "USA"
  }
}
```

#### Get Order
```http
GET /api/orders/:id
```

#### Health Check
```http
GET /api/health
```

## 🔄 Event Flow

1. **Order Creation**: User creates an order through the React frontend
2. **API Processing**: Order Service validates and saves order to MongoDB
3. **Event Publishing**: Order Service publishes `OrderCreated` event to Kafka
4. **Event Consumption**: Notification Service consumes the event
5. **Notification Processing**: Notification handlers process email/SMS notifications

### Event Schema

```javascript
// OrderCreated Event
{
  "eventType": "OrderCreated",
  "orderId": "order_123",
  "customerId": "customer_456",
  "orderTotal": 59.98,
  "items": [...],
  "timestamp": "2025-09-25T06:00:00Z"
}
```

## 🧪 Testing the Application

### 1. Create an Order
- Navigate to `http://localhost:5173`
- Add items to cart
- Proceed to checkout
- Fill in customer and shipping information
- Submit the order

### 2. Verify Event Processing
- Check Order Service logs for successful order creation
- Check Notification Service logs for event consumption
- Verify order appears in MongoDB

### 3. Health Checks
```bash
# Order Service Health
curl http://localhost:3001/api/health

# Check Kafka Topics
docker exec -it <kafka-container> kafka-topics.sh --list --bootstrap-server localhost:9092
```

## 📁 Project Structure

```
ED-architecture/
├── client/
│   └── e-commerce-app/
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── store/          # Redux store & slices
│       │   ├── services/       # RTK Query APIs
│       │   └── types/          # TypeScript definitions
│       ├── package.json
│       └── vite.config.ts
├── server/
│   ├── docker-compose.yml      # Infrastructure services
│   ├── orderservice/
│   │   ├── src/
│   │   │   ├── controllers/    # Route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── models/         # Data models
│   │   │   ├── repositories/   # Data access layer
│   │   │   └── events/         # Event publishers
│   │   └── package.json
│   └── notificationservice/
│       ├── src/
│       │   ├── consumers/      # Kafka consumers
│       │   ├── handlers/       # Event handlers
│       │   ├── services/       # Notification services
│       │   └── utils/          # Utility functions
│       └── package.json
└── README.md
```

## 🔧 Development

### Development Mode
```bash
# Order Service with auto-reload
cd server/orderservice
npm run dev

# Notification Service with auto-reload
cd server/notificationservice
npm run dev

# React app with hot reload
cd client/e-commerce-app
npm run dev
```

### Linting
```bash
# Frontend
cd client/e-commerce-app
npm run lint

# Backend services
cd server/orderservice
npm run lint
```

## 🐳 Docker Support

### Building Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build order-service
```

### Production Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **Kafka Connection Issues**
   ```bash
   # Check if Kafka is running
   docker-compose ps
   
   # Restart Kafka services
   docker-compose restart kafka zookeeper
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB connection
   docker exec -it <mongo-container> mongosh
   ```

3. **Port Conflicts**
   - Frontend: `http://localhost:5173`
   - Order Service: `http://localhost:3001`
   - MongoDB: `localhost:27017`
   - Kafka: `localhost:9092`

4. **Dependencies Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing frontend library
- Express.js community for the robust backend framework
- Apache Kafka for reliable event streaming
- MongoDB for flexible document storage
- All open-source contributors who made this project possible