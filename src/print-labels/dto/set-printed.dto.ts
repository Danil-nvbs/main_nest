import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsNotEmpty, IsOptional } from "class-validator";


export class SetPrintedDto {
  @ApiProperty({ description: 'Уникальный идентификатор заказа' })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ description: 'Название рынка' })
  @IsString()
  @IsNotEmpty()
  market: string;

  @ApiProperty({ description: 'Тип заказа' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Модель, связанная с заказом' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Код КИЗ' })
  @IsString()
  @IsOptional()
  kiz: string;

  @ApiProperty({ description: 'Кто отсканировал товар' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ description: 'Сканер, используемый для печати' })
  @IsString()
  @IsNotEmpty()
  scanner: string;

  @ApiProperty({ description: 'Принтер, используемый для печати' })
  @IsString()
  @IsNotEmpty()
  printer: string;
}