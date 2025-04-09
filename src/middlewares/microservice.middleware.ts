import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestService } from 'src/request/request.service';

@Injectable()
export class MicroServiceMiddleware implements NestMiddleware {
  constructor(
    private readonly requestService: RequestService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const microserviceToken = req.headers['x_microservice_token'] as string;
    
    this.requestService.setServiceToken(microserviceToken);

    next();
  }
}