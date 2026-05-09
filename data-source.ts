import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config(); // .env ni o'qish

export const AppDataSource = new DataSource({
  type:     'postgres',
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME     || 'crm_db',

  // Entitylar
  entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],

  // Migrationlar
  migrations:       [join(__dirname, 'database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations_history',

  synchronize: false,   // Migration ishlatilganda ALBATTA false!
  logging:     true,
});
