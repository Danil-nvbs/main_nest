import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestService } from 'src/request/request.service';

@Injectable()
export class GSheetsMiddleware implements NestMiddleware {
  constructor(
    private readonly requestService: RequestService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const spreadsheetId = req.headers['x_spreadsheet_id'] as string;
    
    this.requestService.setSpreadsheetId(spreadsheetId);

    next();
  }
}