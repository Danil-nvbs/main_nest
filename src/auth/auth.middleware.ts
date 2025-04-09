import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestService } from 'src/request/request.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly requestService: RequestService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x_gs_token'] as string;

    if (!token) throw new UnauthorizedException('Пользователь не авторизован!');

    const author = await this.usersService.getUserByGsToken(token);

    if (!author) throw new UnauthorizedException('Передан невалидный токен в заголовке');
    
    this.requestService.setAuthor(author.email);

    next();
  }
}