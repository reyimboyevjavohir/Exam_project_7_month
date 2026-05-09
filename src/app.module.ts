import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { GroupsModule } from './groups/groups.module';
import { PaymentsModule } from './payments/payments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { User } from './users/user.entity';
import { Student } from './students/student.entity';
import { Teacher } from './teachers/teacher.entity';
import { Group } from './groups/group.entity';
import { Payment } from './payments/payment.entity';
import { Attendance } from './attendance/attendance.entity';
import { Complaint } from './complaints/complaint.entity';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Rate Limiting (DDoS himoyasi) ────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,      // 1 soniyada
        limit: 10,      // max 10 so'rov
      },
      {
        name: 'medium',
        ttl: 60_000,    // 1 minutda
        limit: 100,     // max 100 so'rov
      },
    ]),

    // ── Database ─────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST', 'localhost'),
        port:     config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'yourpassword'),
        database: config.get<string>('DB_NAME', 'crm_db'),
        entities: [User, Student, Teacher, Group, Payment, Attendance, Complaint],
        synchronize: false,        // Migration bilan boshqariladi
        logging: config.get('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
        // Connection pool
        extra: {
          max: 10,    // Maksimal ulanishlar soni
          min: 2,     // Minimal ulanishlar soni
          idleTimeoutMillis: 30_000,
        },
      }),
    }),

    // ── Feature modules ──────────────────────────────────────────────
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    GroupsModule,
    PaymentsModule,
    AttendanceModule,
    ComplaintsModule,
    DashboardModule,
  ],
  providers: [
    // ThrottlerGuard ni global qilish
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
