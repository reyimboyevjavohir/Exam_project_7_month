import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {

    // ── ENUM types ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('superadmin','admin','user')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."users_provider_enum" AS ENUM('local','google','github')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."students_status_enum" AS ENUM('active','inactive','left')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."payments_method_enum" AS ENUM('cash','card','transfer')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."payments_status_enum" AS ENUM('paid','pending','overdue')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."attendance_status_enum" AS ENUM('present','absent','late','excused')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."complaints_status_enum" AS ENUM('new','in_progress','resolved','rejected')
    `);

    // ── users ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"         SERIAL PRIMARY KEY,
        "fullName"   VARCHAR NOT NULL,
        "email"      VARCHAR NOT NULL UNIQUE,
        "password"   VARCHAR,
        "phone"      VARCHAR,
        "role"       "public"."users_role_enum"     NOT NULL DEFAULT 'user',
        "provider"   "public"."users_provider_enum" NOT NULL DEFAULT 'local',
        "providerId" VARCHAR,
        "avatar"     VARCHAR,
        "isActive"   BOOLEAN NOT NULL DEFAULT true,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── teachers ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "teachers" (
        "id"              SERIAL PRIMARY KEY,
        "fullName"        VARCHAR NOT NULL,
        "phone"           VARCHAR NOT NULL,
        "subject"         VARCHAR NOT NULL,
        "email"           VARCHAR,
        "experienceYears" INTEGER,
        "isActive"        BOOLEAN NOT NULL DEFAULT true,
        "createdAt"       TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"       TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── groups ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "groups" (
        "id"         SERIAL PRIMARY KEY,
        "name"       VARCHAR NOT NULL,
        "subject"    VARCHAR NOT NULL,
        "startTime"  VARCHAR NOT NULL,
        "endTime"    VARCHAR NOT NULL,
        "days"       VARCHAR NOT NULL,
        "monthlyFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "isActive"   BOOLEAN NOT NULL DEFAULT true,
        "teacherId"  INTEGER REFERENCES "teachers"("id") ON DELETE SET NULL,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── students ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "students" (
        "id"          SERIAL PRIMARY KEY,
        "fullName"    VARCHAR NOT NULL,
        "phone"       VARCHAR NOT NULL,
        "parentPhone" VARCHAR,
        "birthDate"   DATE,
        "status"      "public"."students_status_enum" NOT NULL DEFAULT 'active',
        "leftDate"    DATE,
        "leftReason"  VARCHAR,
        "groupId"     INTEGER REFERENCES "groups"("id") ON DELETE SET NULL,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── payments ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id"          SERIAL PRIMARY KEY,
        "amount"      DECIMAL(10,2) NOT NULL,
        "method"      "public"."payments_method_enum" NOT NULL DEFAULT 'cash',
        "status"      "public"."payments_status_enum" NOT NULL DEFAULT 'paid',
        "month"       VARCHAR NOT NULL,
        "description" VARCHAR,
        "studentId"   INTEGER NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
        "paidAt"      TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── attendance ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "attendance" (
        "id"        SERIAL PRIMARY KEY,
        "date"      DATE NOT NULL,
        "status"    "public"."attendance_status_enum" NOT NULL DEFAULT 'present',
        "note"      VARCHAR,
        "studentId" INTEGER NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
        "groupId"   INTEGER NOT NULL REFERENCES "groups"("id")   ON DELETE CASCADE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── complaints ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "complaints" (
        "id"            SERIAL PRIMARY KEY,
        "title"         VARCHAR NOT NULL,
        "description"   TEXT NOT NULL,
        "status"        "public"."complaints_status_enum" NOT NULL DEFAULT 'new',
        "adminResponse" TEXT,
        "contactPhone"  VARCHAR NOT NULL,
        "studentId"     INTEGER REFERENCES "students"("id") ON DELETE SET NULL,
        "createdAt"     TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── Indexlar ─────────────────────────────────────────────────
    await queryRunner.query(`CREATE INDEX "IDX_users_email"      ON "users"      ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_provider"   ON "users"      ("provider","providerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_students_group"   ON "students"   ("groupId")`);
    await queryRunner.query(`CREATE INDEX "IDX_students_status"  ON "students"   ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_student" ON "payments"   ("studentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_month"   ON "payments"   ("month")`);
    await queryRunner.query(`CREATE INDEX "IDX_attendance_group" ON "attendance" ("groupId","date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "complaints"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "students"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teachers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."complaints_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."attendance_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."payments_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."students_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
