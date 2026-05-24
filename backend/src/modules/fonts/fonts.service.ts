import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FontsService {
  private cacheDir = path.join(__dirname, '../../cache/fonts');

  constructor() {
    if (!fs.existsSync(this.cacheDir)) fs.mkdirSync(this.cacheDir, { recursive: true });
  }

  async getFontCss(family: string): Promise<string> {
    const fileName = family.replace(/ /g, '+') + '.css';
    const filePath = path.join(this.cacheDir, fileName);

    // Se já existe no cache, retorna direto 
    if (fs.existsSync(filePath)) {
        console.log(`Fonte ${family} carregada do cache`);
      return fs.readFileSync(filePath, 'utf-8');
    }

    // Baixa do Google Fonts
    const googleUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&display=swap`;
    const response = await fetch(googleUrl);
    if (!response.ok) {
      throw new Error(`Não foi possível baixar a fonte ${family}`);
    }
    const css = await response.text();

    // Salva no cache
    fs.writeFileSync(filePath, css);
    return css;
  }
}