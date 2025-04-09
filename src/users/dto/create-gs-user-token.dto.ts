import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail } from "class-validator";

export class CreateGsUserTokenDto {
    @ApiProperty({example: 'user@mail.ru', description:'Адрес электронной почты'})
    @IsString({message: 'Должно быть строкой'})
    @IsEmail({}, {message: 'Некорректный email'})
    readonly email: string;
    
    @ApiProperty({example: '3bb12eda3c298db5de25597f54d924f2e17e78a2...', description:'Секретный ключ регистрации'})
    @IsString({message: 'Должно быть строкой'})
    readonly secret: string;
}