import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

class Price {
  @ApiProperty({ description: "Старая цена.", example: 1000 })
  old_price: number;

  @ApiProperty({ description: "Новая цена.", example: 900 })
  new_price: number;

  @ApiProperty({ description: "Рыночная цена.", example: 1100 })
  market_price: number;
}

export class Result {
  @ApiProperty({ description: "Бренд.", example: "ExampleBrand" })
  brand: string;

  @ApiProperty({ description: "Категория.", example: "ExampleCategory" })
  cat: string;

  @ApiProperty({ description: "Номер номенклатуры.", example: 12345 })
  nom: number;

  @ApiProperty({ description: "Штрихкод.", example: "123456789012" })
  barcode: string;

  @ApiProperty({ description: "Название.", example: "ExampleProduct" })
  name: string;

  @ApiProperty({ description: "Цены.", type: Price, required: false })
  @IsOptional()
  prices?: Price;
}

class Data {
  @ApiProperty({ description: "Текущая страница.", example: 1 })
  page: number;

  @ApiProperty({ description: "Количество элементов на странице.", example: 10 })
  limit: number;

  @ApiProperty({ description: "Общее количество элементов.", example: 100 })
  total: number;

  @ApiProperty({ description: "Дата обновления.", example: "2025-01-28T15:00:00Z" })
  updatedAt: string;

  @ApiProperty({ description: "Результаты.", type: [Result] })
  @IsArray()
  results: Result[];
}

export class DischargeOzonResponseDto {
  @ApiProperty({ description: "Статус ответа.", example: true })
  ok: boolean;

  @ApiProperty({ description: "Данные ответа.", type: Data })
  data: Data;
}
