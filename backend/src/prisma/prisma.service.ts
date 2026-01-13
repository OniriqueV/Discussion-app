import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // ✅ Initialize Prisma with configuration for Docker environment
    super({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // ✅ Let Prisma auto-detect the correct engine
    });
  }

  async onModuleInit() {
    try {
      console.log('🔗 Connecting to database...');
      console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@'));
      
      // ✅ Add connection timeout
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 15000)
      );
      
      await Promise.race([this.$connect(), timeout]);
      console.log('✅ Database connected successfully');
      
      // ✅ Test query to verify connection
      await this.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database query test passed');
      
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      console.error('🔍 Debug info:', {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        PRISMA_CLIENT_ENGINE_TYPE: process.env.PRISMA_CLIENT_ENGINE_TYPE,
        PRISMA_QUERY_ENGINE_LIBRARY: process.env.PRISMA_QUERY_ENGINE_LIBRARY,
      });
      throw error;
    }
  }

  async onModuleDestroy() {
    console.log('🔌 Disconnecting from database...');
    try {
      await this.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }

  // ✅ Enhanced health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  // ✅ Add method to check database connection
  async checkConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      await this.$queryRaw`SELECT NOW() as current_time`;
      return { connected: true };
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}