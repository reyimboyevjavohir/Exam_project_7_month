import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Qo'shimcha unique constraint va indekslar
 * - attendance: bir student bir kunda bir guruhda faqat bitta yozuv bo'lishi mumkin
 * - payments: student bir oy uchun to'lov qilganligini tekshirish (soft constraint — servis darajasida)
 */
export class AddUniqueConstraints1700000000001 implements MigrationInterface {
  name = 'AddUniqueConstraints1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Attendance: studentId + groupId + date kombinatsiyasi unique bo'lishi kerak
    await queryRunner.query(`
      ALTER TABLE "attendance"
      ADD CONSTRAINT "UQ_attendance_student_group_date"
      UNIQUE ("studentId", "groupId", "date")
    `);

    // students: ismi + telefon indeksi (tezkor qidiruv uchun)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_students_fullName"
      ON "students" ("fullName")
    `);

    // teachers: telefon indeksi
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_teachers_phone"
      ON "teachers" ("phone")
    `);

    // complaints: status + createdAt indeksi (badge count uchun)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_complaints_status"
      ON "complaints" ("status")
    `);

    // attendance: studentId indeksi (o'quvchi davomati tarixi uchun)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_attendance_student"
      ON "attendance" ("studentId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_attendance_student"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_complaints_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_teachers_phone"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_students_fullName"`);
    await queryRunner.query(`
      ALTER TABLE "attendance"
      DROP CONSTRAINT IF EXISTS "UQ_attendance_student_group_date"
    `);
  }
}
