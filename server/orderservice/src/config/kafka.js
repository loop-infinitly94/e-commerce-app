const { Kafka } = require('kafkajs');

class KafkaConfig {
  constructor() {
    this.kafka = null;
    this.producer = null;
    this.admin = null;
  }

  async initialize() {
    try {
      const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
      
      this.kafka = new Kafka({
        clientId: 'order-service',
        brokers: brokers,
        retry: {
          initialRetryTime: 100,
          retries: 8
        }
      });

      // Create admin client for topic management
      this.admin = this.kafka.admin();
      await this.admin.connect();

      // Ensure topics exist
      await this.createTopics();

      console.log('✅ Kafka configuration initialized');
      return this.kafka;
    } catch (error) {
      console.error('❌ Failed to initialize Kafka:', error.message);
      throw error;
    }
  }

  async createProducer() {
    try {
      if (!this.kafka) {
        await this.initialize();
      }

      this.producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: true,
        transactionTimeout: 30000,
      });

      await this.producer.connect();
      console.log('✅ Kafka producer connected');
      
      return this.producer;
    } catch (error) {
      console.error('❌ Failed to create Kafka producer:', error.message);
      throw error;
    }
  }

  async createTopics() {
    try {
      const topics = [
        {
          topic: 'order-events',
          numPartitions: 3,
          replicationFactor: 1,
          configEntries: [
            { name: 'cleanup.policy', value: 'compact' },
            { name: 'retention.ms', value: '86400000' } // 24 hours
          ]
        }
      ];

      const existingTopics = await this.admin.listTopics();
      const topicsToCreate = topics.filter(t => !existingTopics.includes(t.topic));

      if (topicsToCreate.length > 0) {
        await this.admin.createTopics({
          topics: topicsToCreate
        });
        console.log(`✅ Created topics: ${topicsToCreate.map(t => t.topic).join(', ')}`);
      } else {
        console.log('ℹ️  All required topics already exist');
      }
    } catch (error) {
      console.error('❌ Failed to create topics:', error.message);
      // Don't throw - topics might already exist
    }
  }

  async getProducer() {
    if (!this.producer) {
      await this.createProducer();
    }
    return this.producer;
  }

  async disconnect() {
    try {
      if (this.producer) {
        await this.producer.disconnect();
        console.log('✅ Kafka producer disconnected');
      }
      
      if (this.admin) {
        await this.admin.disconnect();
        console.log('✅ Kafka admin disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting Kafka:', error.message);
    }
  }
}

module.exports = new KafkaConfig();