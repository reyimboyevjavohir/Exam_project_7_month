import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // ── Security ─────────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ── Compression ──────────────────────────────────────────────────
  app.use(compression());

  // ── CORS ─────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Global Validation Pipe ─────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Query params ni avtomatik convert qiladi
      },
    }),
  );

  // ── Swagger ───────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CRM Panel API')
      .setDescription(
        `
## CRM Panel — Ta'lim markazi boshqaruv tizimi

### Rollar va huquqlar:
| Rol | Huquqlar |
|-----|----------|
| **superadmin** | Barcha amallar, admin qo'shish/o'chirish |
| **admin** | O'quvchi, o'qituvchi, guruh, to'lov, davomat boshqaruvi |
| **user** | Faqat ko'rish va davomat qo'shish |

### Tezkor boshlash:
1. \`POST /api/auth/login\` — Token oling
2. Yuqoridagi **Authorize** tugmasini bosing
3. \`Bearer <token>\` formatida kiriting

### Default superadmin:
\`\`\`
Email: superadmin@crm.uz
Parol: SuperAdmin123
\`\`\`

> ⚠️ Ishga tushirishdan oldin \`.env\` faylini sozlang!
      `,
      )
      .setVersion('1.0')
      .setContact('CRM Panel', '', 'admin@crm.uz')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'JWT tokenni kiriting',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth (Autentifikatsiya)', 'Kirish, chiqish, profil')
      .addTag('Dashboard (Xisobot)', "Statistika va grafik ma'lumotlar")
      .addTag('Users (Foydalanuvchilar)', 'Admin va userlarni boshqarish')
      .addTag("Students (O'quvchilar)", "O'quvchilar ro'yxati va boshqaruvi")
      .addTag("Teachers (O'qituvchilar)", "O'qituvchilar ro'yxati va boshqaruvi")
      .addTag('Groups (Guruhlar)', "Guruhlar boshqaruvi va o'quvchilar ro'yxati")
      .addTag("Payments (To'lovlar)", "To'lovlar boshqaruvi va hisobotlar")
      .addTag('Attendance (Davomat)', 'Davomat kiritish va hisobotlar')
      .addTag('Complaints (Murojaatlar)', 'Murojaatlar va shikoyatlar')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: 'CRM Panel API Docs',
    });

    logger.log(`📚 Swagger: http://localhost:${process.env.PORT || 3000}/api/docs`);
  }

  // ── SuperAdmin seed ───────────────────────────────────────────────
  const authService = app.get(AuthService);
  await authService.seedSuperAdmin();

  // ── Listen ────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Server ishga tushdi: http://localhost:${port}/api`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((err) => {
  console.error('❌ Serverda xatolik:', err);
  process.exit(1);
});
