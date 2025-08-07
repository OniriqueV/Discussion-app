import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ CORS configuration - Updated and more permissive
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://next-frontend:3000',
        'https://accounts.google.com',
        'https://play.google.com',
      ];
      
      // Check if origin is in allowed list or is a localhost variant
      if (allowedOrigins.includes(origin) || 
          origin.startsWith('http://localhost:') || 
          origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      
      return callback(null, true); // Allow all for development
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-Forwarded-For',
      'X-Real-IP'
    ],
    exposedHeaders: ['Authorization', 'Set-Cookie'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200, // Changed from 204 to 200
  });

  // ✅ Additional middleware for handling CORS manually
  app.use((req, res, next) => {
    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

  // ✅ Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      // Enable CORS for images
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=31557600'); // 1 year
    },
  });

  // ✅ Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false for more flexibility
      disableErrorMessages: false,
    })
  );

  // ✅ Add health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // ✅ Debug environment
  console.log('🔍 Environment check:', {
    JWT_SECRET: process.env.JWT_SECRET ? 'Found' : 'Missing',
    DATABASE_URL: process.env.DATABASE_URL ? 'Found' : 'Missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Missing',
    NODE_ENV: process.env.NODE_ENV,
    PRISMA_CLIENT_ENGINE_TYPE: process.env.PRISMA_CLIENT_ENGINE_TYPE,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // Bind to all interfaces
  
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📡 Container accessible at http://localhost:3001 (external port)`);
}

bootstrap().catch((error) => {
  console.error('💥 Failed to start application:', error);
  process.exit(1);
});