import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';


export class Result {
  @ApiProperty({ description: "ID товара внутри нашей базы", example: "1" })
  id: string;

  @ApiProperty({ description: "Артикул", example: "wln0367" })
  article: string;

  @ApiProperty({ description: "Штрихкод", example: "123456789012" })
  barcode: string;

  @ApiProperty({ description: "Бренд", example: "ExampleBrand" })
  brand: string;

  @ApiProperty({ description: "Категория", example: "Бытовая химия" })
  cat: string;

  @ApiProperty({ description: "Название", example: "Средство для удаления плесени" })
  name: string;

  @ApiProperty({ description: "Высота", example: 1 })
  height: number;

  @ApiProperty({ description: "Длина", example: 1 })
  length: number;

  @ApiProperty({ description: "Ширина", example: 1 })
  width: number;

  @ApiProperty({ description: "Название", example: 1 })
  weight: number;

  @ApiProperty({ description: "Цены (неизвестно что за объект)", example: "{}" })
  prices: object;

  @ApiProperty({ description: "Активен ли товар", example: true })
  active: boolean;
  
  @ApiProperty({ description: "Магазин", example: "PK" })
  type: string;
}

class Data {
  @ApiProperty({ description: "Текущая страница", example: 1 })
  page: number;

  @ApiProperty({ description: "Количество элементов на странице", example: 10 })
  limit: number;

  @ApiProperty({ description: "Общее количество элементов", example: 100 })
  total: number;

  @ApiProperty({ description: "Дата обновления", example: "2025-01-28T15:00:00Z" })
  updatedAt: string;

  @ApiProperty({ description: "Результаты", type: [Result] })
  @IsArray()
  results: Result[];
}

export class DischargeYandexResponseDto {
  @ApiProperty({ description: "Статус ответа", example: true })
  ok: boolean;

  @ApiProperty({ description: "Данные ответа", type: Data })
  data: Data;
}
