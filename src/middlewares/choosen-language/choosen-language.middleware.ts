import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ChoosenLanguageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const local_lang = req.headers['local-lang'] as string;

    if (local_lang === 'ar') {
      process.env.LOCAL = 'ar';
    } else {
      process.env.LOCAL = 'en';
    }
    next();
  }
}
