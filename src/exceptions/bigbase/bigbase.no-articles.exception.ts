import { HttpException, HttpStatus } from '@nestjs/common';

export default class BigBaseNoArticlesException extends HttpException {
  constructor() {
    super('Не указаны артикулы', HttpStatus.BAD_REQUEST);
  }
}