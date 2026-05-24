import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnswerTable1756766696842 implements MigrationInterface {
    name = 'CreateAnswerTable1756766696842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "answer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "selectedOption" varchar NOT NULL, "isCorrect" boolean NOT NULL, "timeSpent" integer NOT NULL, "score" integer NOT NULL, "questionId" integer NOT NULL, "responseId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_answer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "selectedOption" varchar NOT NULL, "isCorrect" boolean NOT NULL, "timeSpent" integer NOT NULL, "score" integer NOT NULL, "questionId" integer NOT NULL, "responseId" integer NOT NULL, CONSTRAINT "FK_a4013f10cd6924793fbd5f0d637" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_9913c49cea0cb721636546791b2" FOREIGN KEY ("responseId") REFERENCES "response" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_answer"("id", "selectedOption", "isCorrect", "timeSpent", "score", "questionId", "responseId") SELECT "id", "selectedOption", "isCorrect", "timeSpent", "score", "questionId", "responseId" FROM "answer"`);
        await queryRunner.query(`DROP TABLE "answer"`);
        await queryRunner.query(`ALTER TABLE "temporary_answer" RENAME TO "answer"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer" RENAME TO "temporary_answer"`);
        await queryRunner.query(`CREATE TABLE "answer" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "selectedOption" varchar NOT NULL, "isCorrect" boolean NOT NULL, "timeSpent" integer NOT NULL, "score" integer NOT NULL, "questionId" integer NOT NULL, "responseId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "answer"("id", "selectedOption", "isCorrect", "timeSpent", "score", "questionId", "responseId") SELECT "id", "selectedOption", "isCorrect", "timeSpent", "score", "questionId", "responseId" FROM "temporary_answer"`);
        await queryRunner.query(`DROP TABLE "temporary_answer"`);
        await queryRunner.query(`DROP TABLE "answer"`);
    }

}
