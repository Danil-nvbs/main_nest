import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

class Identifier {
  @ApiProperty({ description: 'CIS идентификатор.', example: 'string' })
  cis: string;

  @ApiProperty({ description: 'UIN идентификатор.', example: 'string' })
  uin: string;

  @ApiProperty({ description: 'RNPT идентификатор.', example: 'string' })
  rnpt: string;

  @ApiProperty({ description: 'GTD идентификатор.', example: 'string' })
  gtd: string;
}

class Item {
  @ApiProperty({ description: 'Идентификатор SKU товара.', example: 4323435 })
  sku_id: number;

  @ApiProperty({ description: 'Количество товара.', example: 1 })
  quantity: number;

  @ApiProperty({ description: 'Идентификаторы товара.', type: [Identifier] })
  @IsArray()
  identifiers: Identifier[];
}

export class ParcelCreateApiDto {
  @ApiProperty({ description: 'Идентификатор посылки.', example: 'string' })
  parcel_id: string;

  @ApiProperty({ description: 'Список товаров в посылке.', type: [Item] })
  @IsArray()
  items: Item[];
}
