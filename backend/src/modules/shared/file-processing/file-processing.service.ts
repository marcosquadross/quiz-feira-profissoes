import { Injectable } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import * as fsExtra from 'fs-extra';

@Injectable()
export class FileProcessingService {
  async extractAndSaveFiles(zip: AdmZip, folderName: string, destPath: string) {
    const folder = zip.getEntries().find(entry => entry.entryName.endsWith(folderName) && entry.isDirectory);
    if (folder) {
      fs.mkdirSync(destPath, { recursive: true });
      fsExtra.emptyDirSync(destPath);
      zip.extractEntryTo(folder, destPath, false, true);
      return zip.getEntries().filter(entry => entry.entryName.startsWith(folder.entryName) && !entry.isDirectory).length;
    }
    return 0;
  }

  async saveFile(file: Express.Multer.File, targetDir: string): Promise<void> {
    const targetPath = path.join(targetDir, file.originalname);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    } 
    
    fs.writeFileSync(targetPath, file.buffer);
  }

  async getFilesFromDir(dir: string): Promise<fs.ReadStream> {
    const filePath = path.join(process.env.UPLOADS_DIR, dir);
    try {
      const stats = await fs.promises.stat(filePath);
      if (!stats.isFile()) {
        throw new Error('O caminho não é um arquivo');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Erro ao acessar o arquivo: ${message}`);
    }

    return fs.createReadStream(filePath);
  }

  async updateQuizFolders(oldAccessIdentifier: string, newAccessIdentifier: string): Promise<void> {
    const imagesPath = path.join(process.env.UPLOADS_DIR, `/images/${oldAccessIdentifier}`);
    const audiosPath = path.join(process.env.UPLOADS_DIR, `/audios/${oldAccessIdentifier}`);
    const backgroundImagePath = path.join(process.env.UPLOADS_DIR, `/backgrounds/${oldAccessIdentifier}`);

    const newImagesPath = path.join(process.env.UPLOADS_DIR, `/images/${newAccessIdentifier}`);
    const newAudiosPath = path.join(process.env.UPLOADS_DIR, `/audios/${newAccessIdentifier}`);
    const newBackgroundImagePath = path.join(process.env.UPLOADS_DIR, `/backgrounds/${newAccessIdentifier}`);

    if (fs.existsSync(imagesPath)) {
      await fs.promises.rename(imagesPath, newImagesPath);
    }

    if (fs.existsSync(audiosPath)) {
      await fs.promises.rename(audiosPath, newAudiosPath);
    }

    if (fs.existsSync(backgroundImagePath)) {
      await fs.promises.rename(backgroundImagePath, newBackgroundImagePath);
    }
  }

  async deleteFile(filePath: string) {
    const file = path.join(process.env.UPLOADS_DIR, filePath);
    if (fs.existsSync(file)) {
      await fs.promises.rm(file, { recursive: true });
    }
  }

}
