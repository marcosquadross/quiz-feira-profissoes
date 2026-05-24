import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1756751876729 implements MigrationInterface {
    name = 'CreateTables1756751876729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "image" varchar, "audio" varchar, "answer1" varchar NOT NULL, "answer2" varchar NOT NULL, "answer3" varchar, "answer4" varchar, "answer5" varchar, "answer6" varchar, "correctAnswer" integer NOT NULL, "questionValue" integer NOT NULL, "time" text NOT NULL, "quizId" integer)`);
        await queryRunner.query(`CREATE TABLE "response" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "nickname" varchar NOT NULL, "score" integer, "totalTime" integer, "quizId" integer NOT NULL, "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "style" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "fontFamily" varchar, "textColor" varchar, "panelsColor" varchar, "backgroundColor" varchar, "backgroundImage" varchar, "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE TABLE "quiz" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accessIdentifier" varchar NOT NULL, "title" varchar NOT NULL, "selectedQuestions" integer NOT NULL, "totalQuestions" integer NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, "styleId" integer, CONSTRAINT "UQ_4372ecca315e724f4c84e639af9" UNIQUE ("accessIdentifier"), CONSTRAINT "REL_2f26bc42b7295e507eda574147" UNIQUE ("styleId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2f26bc42b7295e507eda574147" ON "quiz" ("styleId") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "hashedRefreshToken" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "temporary_question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "image" varchar, "audio" varchar, "answer1" varchar NOT NULL, "answer2" varchar NOT NULL, "answer3" varchar, "answer4" varchar, "answer5" varchar, "answer6" varchar, "correctAnswer" integer NOT NULL, "questionValue" integer NOT NULL, "time" text NOT NULL, "quizId" integer, CONSTRAINT "FK_4959a4225f25d923111e54c7cd2" FOREIGN KEY ("quizId") REFERENCES "quiz" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_question"("id", "text", "image", "audio", "answer1", "answer2", "answer3", "answer4", "answer5", "answer6", "correctAnswer", "questionValue", "time", "quizId") SELECT "id", "text", "image", "audio", "answer1", "answer2", "answer3", "answer4", "answer5", "answer6", "correctAnswer", "questionValue", "time", "quizId" FROM "question"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`ALTER TABLE "temporary_question" RENAME TO "question"`);
        await queryRunner.query(`CREATE TABLE "temporary_response" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "nickname" varchar NOT NULL, "score" integer, "totalTime" integer, "quizId" integer NOT NULL, "userId" integer, CONSTRAINT "FK_c37a9a05cdf8ac099e4b4900f51" FOREIGN KEY ("quizId") REFERENCES "quiz" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_a5386ec7299fc4d00b8735ecd42" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_response"("id", "nickname", "score", "totalTime", "quizId", "userId") SELECT "id", "nickname", "score", "totalTime", "quizId", "userId" FROM "response"`);
        await queryRunner.query(`DROP TABLE "response"`);
        await queryRunner.query(`ALTER TABLE "temporary_response" RENAME TO "response"`);
        await queryRunner.query(`DROP INDEX "IDX_2f26bc42b7295e507eda574147"`);
        await queryRunner.query(`CREATE TABLE "temporary_quiz" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accessIdentifier" varchar NOT NULL, "title" varchar NOT NULL, "selectedQuestions" integer NOT NULL, "totalQuestions" integer NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, "styleId" integer, CONSTRAINT "UQ_4372ecca315e724f4c84e639af9" UNIQUE ("accessIdentifier"), CONSTRAINT "REL_2f26bc42b7295e507eda574147" UNIQUE ("styleId"), CONSTRAINT "FK_52c158a608620611799fd63a927" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_2f26bc42b7295e507eda5741473" FOREIGN KEY ("styleId") REFERENCES "style" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_quiz"("id", "accessIdentifier", "title", "selectedQuestions", "totalQuestions", "updatedAt", "userId", "styleId") SELECT "id", "accessIdentifier", "title", "selectedQuestions", "totalQuestions", "updatedAt", "userId", "styleId" FROM "quiz"`);
        await queryRunner.query(`DROP TABLE "quiz"`);
        await queryRunner.query(`ALTER TABLE "temporary_quiz" RENAME TO "quiz"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2f26bc42b7295e507eda574147" ON "quiz" ("styleId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_2f26bc42b7295e507eda574147"`);
        await queryRunner.query(`ALTER TABLE "quiz" RENAME TO "temporary_quiz"`);
        await queryRunner.query(`CREATE TABLE "quiz" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "accessIdentifier" varchar NOT NULL, "title" varchar NOT NULL, "selectedQuestions" integer NOT NULL, "totalQuestions" integer NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, "styleId" integer, CONSTRAINT "UQ_4372ecca315e724f4c84e639af9" UNIQUE ("accessIdentifier"), CONSTRAINT "REL_2f26bc42b7295e507eda574147" UNIQUE ("styleId"))`);
        await queryRunner.query(`INSERT INTO "quiz"("id", "accessIdentifier", "title", "selectedQuestions", "totalQuestions", "updatedAt", "userId", "styleId") SELECT "id", "accessIdentifier", "title", "selectedQuestions", "totalQuestions", "updatedAt", "userId", "styleId" FROM "temporary_quiz"`);
        await queryRunner.query(`DROP TABLE "temporary_quiz"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2f26bc42b7295e507eda574147" ON "quiz" ("styleId") `);
        await queryRunner.query(`ALTER TABLE "response" RENAME TO "temporary_response"`);
        await queryRunner.query(`CREATE TABLE "response" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "nickname" varchar NOT NULL, "score" integer, "totalTime" integer, "quizId" integer NOT NULL, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "response"("id", "nickname", "score", "totalTime", "quizId", "userId") SELECT "id", "nickname", "score", "totalTime", "quizId", "userId" FROM "temporary_response"`);
        await queryRunner.query(`DROP TABLE "temporary_response"`);
        await queryRunner.query(`ALTER TABLE "question" RENAME TO "temporary_question"`);
        await queryRunner.query(`CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "image" varchar, "audio" varchar, "answer1" varchar NOT NULL, "answer2" varchar NOT NULL, "answer3" varchar, "answer4" varchar, "answer5" varchar, "answer6" varchar, "correctAnswer" integer NOT NULL, "questionValue" integer NOT NULL, "time" text NOT NULL, "quizId" integer)`);
        await queryRunner.query(`INSERT INTO "question"("id", "text", "image", "audio", "answer1", "answer2", "answer3", "answer4", "answer5", "answer6", "correctAnswer", "questionValue", "time", "quizId") SELECT "id", "text", "image", "audio", "answer1", "answer2", "answer3", "answer4", "answer5", "answer6", "correctAnswer", "questionValue", "time", "quizId" FROM "temporary_question"`);
        await queryRunner.query(`DROP TABLE "temporary_question"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "IDX_2f26bc42b7295e507eda574147"`);
        await queryRunner.query(`DROP TABLE "quiz"`);
        await queryRunner.query(`DROP TABLE "style"`);
        await queryRunner.query(`DROP TABLE "response"`);
        await queryRunner.query(`DROP TABLE "question"`);
    }

}
