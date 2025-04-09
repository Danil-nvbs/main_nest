import { HttpException, HttpStatus } from '@nestjs/common';

export class UserGsTokenAlreadyExistException extends HttpException {
  constructor() {
    super('User already exist!', HttpStatus.BAD_REQUEST);
  }
}