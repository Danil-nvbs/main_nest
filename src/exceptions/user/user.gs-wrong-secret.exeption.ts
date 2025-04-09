import { HttpException, HttpStatus } from '@nestjs/common';

export class UserGsWrongSecretKeyException extends HttpException {
  constructor() {
    super('Wrong secret key!', HttpStatus.UNAUTHORIZED);
  }
}