import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as AdmZip from 'adm-zip';
import * as path from 'path';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucket = 'uploads';

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  async extractAndSaveFiles(zip: AdmZip, folderName: string, destPath: string): Promise<number> {
    const folder = zip.getEntries().find(
      (e) => e.entryName.endsWith(folderName) && e.isDirectory,
    );
    if (!folder) {
      console.log(`[Storage] Pasta "${folderName}" não encontrada no zip`);
      return 0;
    }

    const entries = zip.getEntries().filter(
      (e) => e.entryName.startsWith(folder.entryName) && !e.isDirectory,
    );

    console.log(`[Storage] Enviando ${entries.length} arquivos para ${destPath}`);

    for (const entry of entries) {
      const filename = path.basename(entry.entryName);
      const filePath = `${destPath}/${filename}`;
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, entry.getData(), { upsert: true });
      if (error) console.error(`[Storage] Erro ao enviar ${filePath}:`, error);
      else console.log(`[Storage] Enviado: ${filePath}`);
    }

    return entries.length;
  }

  async saveFile(buffer: Buffer, filePath: string): Promise<void> {
    await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, buffer, { upsert: true });
  }

  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  async moveFolder(oldPath: string, newPath: string): Promise<void> {
    const { data: files } = await this.supabase.storage
      .from(this.bucket)
      .list(oldPath);

    if (!files) return;

    for (const file of files) {
      await this.supabase.storage
        .from(this.bucket)
        .move(`${oldPath}/${file.name}`, `${newPath}/${file.name}`);
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    const { data: files } = await this.supabase.storage
      .from(this.bucket)
      .list(folderPath);

    if (!files || files.length === 0) return;

    const paths = files.map((f) => `${folderPath}/${f.name}`);
    await this.supabase.storage.from(this.bucket).remove(paths);
  }
}