import { Body, Controller, Get, HttpException, HttpStatus, Injectable, Post, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';

@ApiTags('YANDEX API')
@Controller('yandex/api')
@Injectable()
export class YandexApiController {

    constructor(

    ) {}

}
