const { Kafka } = require('kafkajs');

class KafkaConsumerConfig {
  constructor() {
    this.kafka = null;
    this.consumer = null;
  }

  async initialize() {
    try {
      const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
      
      this.kafka = new Kafka({
        clientId: 'notification-service',
        brokers: brokers,
        retry: {
          initialRetryTime: 100,
          retries: 8
        }
      });

      console.log('✅ Kafka configuration initialized for notification service');
      return this.kafka;
    } catch (error) {
      console.error('❌ Failed to initialize Kafka for notification service:', error.message);
      throw error;
    }
  }

  async createConsumer() {
    try {
      if (!this.kafka) {
        await this.initialize();
      }

      this.consumer = this.kafka.consumer({
        groupId: 'notification-service-group',
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
        heartbeatInterval: 3000,
        allowAutoTopicCreation: false,
        maxBytesPerPartition: 1048576, // 1MB
      });

      console.log('✅ Kafka consumer created for notification service');
      return this.consumer;
    } catch (error) {
      console.error('❌ Failed to create Kafka consumer:', error.message);
      throw error;
    }
  }

  async getConsumer() {
    if (!this.consumer) {
      await this.createConsumer();
    }
    return this.consumer;
  }

  async disconnect() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        console.log('✅ Kafka consumer disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting Kafka consumer:', error.message);
    }
  }
}

module.exports = new KafkaConsumerConfig();