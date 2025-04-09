import { Body, Controller, Post, Get, HttpStatus } from '@nestjs/common';
import { CreateGsUserTokenDto } from './dto/create-gs-user-token.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserToken } from './model/gs-users-tokens.model';
import { UserGsWrongSecretKeyException, UserGsTokenAlreadyExistException } from 'src/exceptions/user';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiOperation({summary: 'Создание пользователя Apps Script'})
    @ApiResponse({status: HttpStatus.CREATED, type: GsUserToken, description: "Успешно"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Неверный секретный ключ"})
    @ApiResponse({status: HttpStatus.CONFLICT, description: "Электронный адрес занят"})
    @Post()
    async create(@Body() userDto: CreateGsUserTokenDto) {
        if (userDto.secret !== process.env.GS_EMAIL_REG_KEY) throw new UserGsWrongSecretKeyException();

        if ((await this.usersService.getUsersGs([{ email: userDto.email }])).length) throw new UserGsTokenAlreadyExistException();
        
        return await this.usersService.createUserGs(userDto.email);
    }
}
