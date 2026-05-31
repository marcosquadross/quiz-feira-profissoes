import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import * as fs from 'fs';
import * as path from 'path';
import 'multer';

import AdmZip = require('adm-zip');
import * as Excel from 'exceljs';

import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { Style } from './schemas/style.schema';
import { Response, ResponseDocument } from '../response/schemas/response.schema';

import { UpdateQuizDto } from './dto/update-quiz.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { CreateQuestionDto } from './dto/create-question.dto';

import { FileProcessingService } from '../shared/file-processing/file-processing.service';
import { StorageService } from '../shared/storage/storage.service'; // ← NOVO

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    @InjectModel(Response.name) private readonly responseModel: Model<ResponseDocument>,
    private readonly fileProcessingService: FileProcessingService,
    private readonly storageService: StorageService, // ← NOVO
  ) { }

  // ─── Helpers internos ────────────────────────────────────────────────────────

  private async processXlsxFile(
    zip: AdmZip,
    xlsxFileEntry: AdmZip.IZipEntry,
  ): Promise<CreateQuestionDto[]> {
    // Mantido com fs — arquivo temporário que não precisa persistir
    const tempPath = path.join('/tmp', '_temp.xlsx');
    fs.writeFileSync(tempPath, xlsxFileEntry.getData());

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(tempPath);
    fs.unlinkSync(tempPath);

    const worksheet = workbook.worksheets[0];
    this.validateColumns(worksheet);

    const questions: CreateQuestionDto[] = [];
    for (let rowNumber = 8; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (!row.values[2]) break;
      const rowData = Array.isArray(row.values) ? row.values.slice(2) : [];
      questions.push(new CreateQuestionDto(rowData));
    }
    return questions;
  }

  private validateColumns(worksheet: Excel.Worksheet) {
    const expectedColumns = [
      'Questão',
      'Arquivo de imagem',
      'Arquivo de som',
      'Resposta 1',
      'Resposta 2',
      'Resposta 3',
      'Resposta 4',
      'Resposta 5',
      'Resposta 6',
      'Resposta correta',
      'Pontuação',
      'Tempo limite',
    ];
    const headerRow = worksheet.getRow(7);
    for (let i = 0; i < expectedColumns.length; i++) {
      const cellValue = headerRow.getCell(i + 2).value?.toString();
      if (!cellValue?.includes(expectedColumns[i])) {
        throw new Error(
          `A coluna "${expectedColumns[i]}" está faltando ou foi mal formatada.`,
        );
      }
    }
  }

  // ─── QUIZ CRUD ────────────────────────────────────────────────────────────────

  async finalizeQuizCreation(
    updateQuizDto: Partial<UpdateQuizDto>,
    styleData?: Partial<Quiz['style']>,
    backgroundImageFile?: { originalname: string; buffer: Buffer },
  ): Promise<Quiz> {
    const quiz = await this.quizModel.findById(updateQuizDto._id);
    if (!quiz) throw new Error(`Quiz com id ${updateQuizDto._id} não encontrado`);

    if (updateQuizDto) Object.assign(quiz, updateQuizDto);
    if (styleData) quiz.style = { ...quiz.style, ...styleData };

    if (backgroundImageFile) {
      // ── ANTES (fs local) ──────────────────────────────────────────────────────
      // const filePath = path.join(
      //   process.env.UPLOADS_DIR,
      //   'backgrounds',
      //   quiz.accessIdentifier,
      // );
      // fs.mkdirSync(filePath, { recursive: true });
      // fs.writeFileSync(
      //   path.join(filePath, backgroundImageFile.originalname),
      //   backgroundImageFile.buffer,
      // );
      // quiz.style.backgroundImage = path.join(filePath, backgroundImageFile.originalname);
      // ── DEPOIS (Supabase) ─────────────────────────────────────────────────────
      const bgPath = `backgrounds/${quiz.accessIdentifier}/${backgroundImageFile.originalname}`;
      await this.storageService.saveFile(backgroundImageFile.buffer, bgPath);
      quiz.style.backgroundImage = bgPath;
    }

    // ── ANTES (fs local) ──────────────────────────────────────────────────────
    // const tempImagesPath = path.join(process.env.UPLOADS_DIR, `/images/_quiz/${quiz._id}`);
    // const finalImagesPath = path.join(process.env.UPLOADS_DIR, `/images/${quiz.accessIdentifier}`);
    // if (fs.existsSync(tempImagesPath)) {
    //   fs.mkdirSync(finalImagesPath, { recursive: true });
    //   fs.readdirSync(tempImagesPath).forEach((file) =>
    //     fs.renameSync(path.join(tempImagesPath, file), path.join(finalImagesPath, file)),
    //   );
    //   fs.rmdirSync(tempImagesPath);
    // }
    // ── DEPOIS (Supabase) ─────────────────────────────────────────────────────
    await this.storageService.moveFolder(
      `images/_quiz/${quiz._id}`,
      `images/${quiz.accessIdentifier}`,
    );

    quiz.questions.forEach((question) => {
      if (question.image) question.image = `images/${quiz.accessIdentifier}/${question.image}`;
      if (question.audio) question.audio = `audios/${quiz.accessIdentifier}/${question.audio}`;
    });

    // ── ANTES (fs local) ──────────────────────────────────────────────────────
    // const tempAudiosPath = path.join(process.env.UPLOADS_DIR, `/audios/_quiz/${quiz._id}`);
    // const finalAudiosPath = path.join(process.env.UPLOADS_DIR, `/audios/${quiz.accessIdentifier}`);
    // if (fs.existsSync(tempAudiosPath)) {
    //   fs.mkdirSync(finalAudiosPath, { recursive: true });
    //   fs.readdirSync(tempAudiosPath).forEach((file) =>
    //     fs.renameSync(path.join(tempAudiosPath, file), path.join(finalAudiosPath, file)),
    //   );
    //   fs.rmdirSync(tempAudiosPath);
    // }
    // ── DEPOIS (Supabase) ─────────────────────────────────────────────────────
    await this.storageService.moveFolder(
      `audios/_quiz/${quiz._id}`,
      `audios/${quiz.accessIdentifier}`,
    );

    return quiz.save();
  }

  async findOne(accessIdentifier: string): Promise<Quiz | null> {
    return this.quizModel.findOne({ accessIdentifier }).exec();
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizModel.find().exec();
  }

  async findAllQuizzes(): Promise<
    { quizId: string; title: string; accessIdentifier: string }[]
  > {
    const quizzes = await this.quizModel
      .find()
      .select('title accessIdentifier style')
      .exec();

    return quizzes.map((quiz) => ({
      quizId: quiz._id.toString(),
      title: quiz.title,
      accessIdentifier: quiz.accessIdentifier,
    }));
  }

  // ✅ Versão original — mantida para uso interno
  async findQuizzesByAccessIdentifiers(
    accessIdentifiers: string[],
  ): Promise<{ quizId: string; title: string; accessIdentifier: string }[]> {
    const quizzes = await this.quizModel
      .find({ accessIdentifier: { $in: accessIdentifiers } })
      .select('title accessIdentifier')
      .exec();

    return quizzes.map((quiz) => ({
      quizId: quiz._id.toString(),
      title: quiz.title,
      accessIdentifier: quiz.accessIdentifier,
    }));
  }

  // ✅ Nova versão — agrega responses da coleção própria (usada pelo ranking)
  async findQuizzesByAccessIdentifiersWithResponses(
    accessIdentifiers: string[],
  ): Promise<{
    quizId: string;
    title: string;
    accessIdentifier: string;
    responses: any[];
  }[]> {
    const quizzes = await this.quizModel
      .find({ accessIdentifier: { $in: accessIdentifiers } })
      .select('title accessIdentifier')
      .exec();

    const quizIds = quizzes.map((q) => q._id);

    // Busca todas as responses dos quizzes de uma vez (evita N+1)
    const allResponses = await this.responseModel
      .find({
        quiz: { $in: quizIds },
        finalScore: { $ne: null }, // apenas respostas finalizadas
      })
      .select('quiz nickname finalScore finalTime user createdAt')
      .lean()
      .exec();

    // Agrupa responses por quizId
    const responsesByQuiz = new Map<string, any[]>();
    for (const resp of allResponses) {
      const key = resp.quiz.toString();
      if (!responsesByQuiz.has(key)) responsesByQuiz.set(key, []);
      responsesByQuiz.get(key).push(resp);
    }

    return quizzes.map((quiz) => {
      const quizId = quiz._id.toString();
      const responses = responsesByQuiz.get(quizId) ?? [];

      // Ordena por finalScore desc (ranking)
      responses.sort((a, b) => b.finalScore - a.finalScore);

      return {
        quizId,
        title: quiz.title,
        accessIdentifier: quiz.accessIdentifier,
        responses,
      };
    });
  }

  async findQuizzesByUser(userId: string): Promise<Quiz[]> {
    return this.quizModel.find({ 'user._id': userId }).exec();
  }

  async getQuizById(_id: string): Promise<Quiz> {
    return this.quizModel
      .findById(_id)
      .select('_id accessIdentifier title selectedQuestions style')
      .exec();
  }

  async getStyleByQuizId(quizId: string): Promise<Style> {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new BadRequestException('Quiz não encontrado');
    return quiz.style;
  }

  async update(
    updateQuizDto: UpdateQuizDto,
    newStyle?: UpdateStyleDto,
    backgroundImageFile?: Express.Multer.File,
  ): Promise<Quiz | null> {
    const quiz = await this.quizModel.findById(updateQuizDto._id);
    if (!quiz) return null;

    quiz.title = updateQuizDto.title ?? quiz.title;
    quiz.selectedQuestions = updateQuizDto.selectedQuestions ?? quiz.selectedQuestions;

    if (
      updateQuizDto.accessIdentifier &&
      updateQuizDto.accessIdentifier !== quiz.accessIdentifier
    ) {
      // ── ANTES (fs local) ────────────────────────────────────────────────────
      // const oldPath = path.join(process.env.UPLOADS_DIR, 'backgrounds', quiz.accessIdentifier);
      // const newPath = path.join(process.env.UPLOADS_DIR, 'backgrounds', updateQuizDto.accessIdentifier);
      // if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
      // ── DEPOIS (Supabase) ───────────────────────────────────────────────────
      await this.storageService.moveFolder(
        `backgrounds/${quiz.accessIdentifier}`,
        `backgrounds/${updateQuizDto.accessIdentifier}`,
      );
      quiz.accessIdentifier = updateQuizDto.accessIdentifier;
    }

    if (newStyle) Object.assign(quiz.style, newStyle);

    if (backgroundImageFile) {
      // ── ANTES (fs local) ────────────────────────────────────────────────────
      // const filePath = path.join(process.env.UPLOADS_DIR, 'backgrounds', quiz.accessIdentifier);
      // fs.mkdirSync(filePath, { recursive: true });
      // fs.writeFileSync(
      //   path.join(filePath, backgroundImageFile.originalname),
      //   backgroundImageFile.buffer,
      // );
      // quiz.style.backgroundImage = path.join(filePath, backgroundImageFile.originalname);
      // ── DEPOIS (Supabase) ───────────────────────────────────────────────────
      const bgPath = `backgrounds/${quiz.accessIdentifier}/${backgroundImageFile.originalname}`;
      await this.storageService.saveFile(backgroundImageFile.buffer, bgPath);
      quiz.style.backgroundImage = bgPath;
    }

    return quiz.save();
  }

  async delete(quizId: string): Promise<any> {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) return null;

    // ── ANTES (fs local) ──────────────────────────────────────────────────────
    // const backgroundImagePath = path.join(process.env.UPLOADS_DIR, 'backgrounds', quiz.accessIdentifier);
    // if (fs.existsSync(backgroundImagePath))
    //   await fs.promises.rm(backgroundImagePath, { recursive: true });
    // const imagesPath = path.join(process.env.UPLOADS_DIR, 'images', quiz.accessIdentifier);
    // if (fs.existsSync(imagesPath))
    //   await fs.promises.rm(imagesPath, { recursive: true });
    // const audiosPath = path.join(process.env.UPLOADS_DIR, 'audios', quiz.accessIdentifier);
    // if (fs.existsSync(audiosPath))
    //   await fs.promises.rm(audiosPath, { recursive: true });
    // ── DEPOIS (Supabase) ─────────────────────────────────────────────────────
    await this.storageService.deleteFolder(`backgrounds/${quiz.accessIdentifier}`);
    await this.storageService.deleteFolder(`images/${quiz.accessIdentifier}`);
    await this.storageService.deleteFolder(`audios/${quiz.accessIdentifier}`);

    return quiz.deleteOne();
  }

  // ─── QUESTIONS ────────────────────────────────────────────────────────────────

  async removeExistingPlaceholderQuiz(userId: string): Promise<void> {
    const existingQuiz = await this.quizModel.findOne({
      'user._id': new Types.ObjectId(userId),
      title: 'TBD',
      accessIdentifier: 'TBD',
    });

    if (existingQuiz) {
      // ── ANTES (fs local) ──────────────────────────────────────────────────
      // for (const question of existingQuiz.questions) {
      //   if (question.image) {
      //     const imgPath = path.join(process.env.UPLOADS_DIR, question.image);
      //     if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      //   }
      //   if (question.audio) {
      //     const audioPath = path.join(process.env.UPLOADS_DIR, question.audio);
      //     if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      //   }
      // }
      // ── DEPOIS (Supabase) ─────────────────────────────────────────────────
      await this.storageService.deleteFolder(`images/_quiz/${existingQuiz._id}`);
      await this.storageService.deleteFolder(`audios/_quiz/${existingQuiz._id}`);

      await this.quizModel.deleteOne({ _id: existingQuiz._id });
    }
  }

  async createQuestions(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    message: string;
    quizId?: string;
    questions?: number;
    images?: number;
    audios?: number;
  }> {
    await this.removeExistingPlaceholderQuiz(userId);

    const zipFilePath = path.join('/tmp', file.originalname);
    fs.writeFileSync(zipFilePath, file.buffer);

    let imagesCount = 0;
    let audiosCount = 0;

    try {
      const zip = new AdmZip(zipFilePath);
      const xlsxEntry = zip
        .getEntries()
        .find((e) => e.entryName.endsWith('.xlsx') && !e.isDirectory);

      if (!xlsxEntry) return { message: 'Nenhum arquivo .xlsx encontrado no zip' };

      const questions: CreateQuestionDto[] = await this.processXlsxFile(zip, xlsxEntry);

      if (questions.length === 0) {
        return { message: 'Nenhuma questão encontrada no arquivo.', questions: 0, images: 0, audios: 0 };
      }

      const quiz = new this.quizModel({
        user: { _id: new Types.ObjectId(userId) },
        title: 'TBD',
        accessIdentifier: 'TBD',
        selectedQuestions: 0,
        totalQuestions: questions.length,
        questions: questions.map((q) => ({
          text: q.text,
          image: q.image,
          audio: q.audio,
          answer1: q.answer1,
          answer2: q.answer2,
          ...(q.answer3 && { answer3: q.answer3 }),
          ...(q.answer4 && { answer4: q.answer4 }),
          ...(q.answer5 && { answer5: q.answer5 }),
          ...(q.answer6 && { answer6: q.answer6 }),
          correctAnswer: q[`answer${q.correctAnswer}`],
          questionValue: q.questionValue,
          time: q.time,
        })),
      });

      const savedQuiz = await quiz.save();

      // ── ANTES (fs local) ────────────────────────────────────────────────────
      // const imagesPath = path.join(process.env.UPLOADS_DIR, `/images/_quiz/${savedQuiz._id}`);
      // const audiosPath = path.join(process.env.UPLOADS_DIR, `/audios/_quiz/${savedQuiz._id}`);
      // imagesCount = await this.fileProcessingService.extractAndSaveFiles(zip, 'imagens/', imagesPath);
      // audiosCount = await this.fileProcessingService.extractAndSaveFiles(zip, 'audios/', audiosPath);
      // ── DEPOIS (Supabase) ───────────────────────────────────────────────────
      imagesCount = await this.storageService.extractAndSaveFiles(zip, 'imagens/', `images/_quiz/${savedQuiz._id}`);
      audiosCount = await this.storageService.extractAndSaveFiles(zip, 'audios/', `audios/_quiz/${savedQuiz._id}`);

      return {
        message: 'Upload bem-sucedido',
        quizId: savedQuiz._id.toString(),
        questions: questions.length,
        images: imagesCount,
        audios: audiosCount,
      };
    } catch (error) {
      const err = error as Error;
      return { message: `Erro ao extrair o arquivo: ${err.message}` };
    } finally {
      fs.unlinkSync(zipFilePath);
    }
  }

  async getQuestionsByQuiz(accessIdentifier: string): Promise<{
    questions: Question[];
    images: string[] | null;
    audios: string[] | null;
  }> {
    const quiz = await this.quizModel.findOne({ accessIdentifier });
    if (!quiz) throw new BadRequestException('Quiz não encontrado');

    const imagens = quiz.questions.filter((q) => q.image).map((q) => q.image);
    const audios = quiz.questions.filter((q) => q.audio).map((q) => q.audio);
    const selectedQuestions = quiz.questions
      .slice(0, quiz.selectedQuestions)
      .sort(() => Math.random() - 0.5);

    return {
      questions: selectedQuestions,
      images: imagens.length ? imagens : null,
      audios: audios.length ? audios : null,
    };
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new BadRequestException('Quiz não encontrado');
    return quiz.questions;
  }

  async getQuestionByIndex(quizId: string, index: number): Promise<Question> {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new BadRequestException('Quiz não encontrado');
    if (index < 0 || index >= quiz.questions.length)
      throw new BadRequestException('Índice de questão inválido');
    return quiz.questions[index];
  }
}