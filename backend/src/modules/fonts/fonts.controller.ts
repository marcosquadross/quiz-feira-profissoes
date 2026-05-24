// import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
// import { FontsService } from './fonts.service';
// import { Response } from 'express';

// @Controller('fonts')
// export class FontsController {
//   constructor(private readonly fontsService: FontsService) {}

//   @Get(':family')
//   async getFont(@Param('family') family: string, @Res() res: Response) {
//     console.log(`Requisição para fonte: ${family}`);
//     try {
//       const css = await this.fontsService.getFontCss(family);
//       res.setHeader('Content-Type', 'text/css');
//       res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 dias
//       return res.send(css);
//     } catch (err) {
//       throw new HttpException(
//         `Erro ao buscar a fonte: ${family}`,
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }
// }

import { Controller, Get, Param, Res } from '@nestjs/common';
import { FontsService } from './fonts.service';
import { Response } from 'express';
import { Public } from '../../auth/decorators/public.decorator';

@Public()
@Controller('fonts')
export class FontsController {
  constructor(private readonly fontsService: FontsService) {}

  @Get(':fontFamily')
  async getFontCss(@Param('fontFamily') fontFamily: string, @Res() res: Response) {
    try {
      const css = await this.fontsService.getFontCss(fontFamily);
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.send(css);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
}