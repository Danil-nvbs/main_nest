import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsDate, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum ParcelStatus {
  NEW = 'NEW',
  READY_TO_SHIPMENT = 'READY_TO_SHIPMENT',
  AWAITING_DELIVERY = 'AWAITING_DELIVERY',
  DELIVERING = 'DELIVERING',
  RECEIVED = 'RECEIVED',
  CANCELED = 'CANCELED'
}

class IdentifierDto {
  @ApiProperty({ description: 'CIS идентификатор.', example: 'string' })
  @IsString()
  cis: string;

  @ApiProperty({ description: 'UIN идентификатор.', example: 'string' })
  @IsString()
  uin: string;

  @ApiProperty({ description: 'RNPT идентификатор.', example: 'string' })
  @IsString()
  rnpt: string;

  @ApiProperty({ description: 'GTD идентификатор.', example: 'string' })
  @IsString()
  gtd: string;
}

class ItemDto {
  @ApiProperty({ description: 'Идентификатор SKU.', example: 4323435 })
  @IsNumber()
  sku_id: number;

  @ApiProperty({ description: 'Количество.', example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Идентификаторы.', type: [IdentifierDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdentifierDto)
  identifiers: IdentifierDto[];
}

class ParcelDto {
  @ApiProperty({ description: 'Идентификатор посылки.', example: 'string' })
  @IsString()
  parcel_id: string;

  @ApiProperty({ description: 'Идентификатор заказа.', example: 'string' })
  @IsString()
  order_id: string;

  @ApiProperty({ description: 'Статус посылки.', example: ParcelStatus.NEW, enum: ParcelStatus })
  @IsEnum(ParcelStatus)
  status: ParcelStatus;

  @ApiProperty({ description: 'Штрихкод.', example: 'string' })
  @IsString()
  barcode: string;

  @ApiProperty({ description: 'Время отсечки.', example: '2019-08-24T14:15:22' })
  @IsDate()
  cutoff_time: Date;

  @ApiProperty({ description: 'Элементы.', type: [ItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}

export class ParcelListDto {
  @ApiProperty({ description: 'Токен следующей страницы.', example: 'string' })
  @IsString()
  next_page_token: string;

  @ApiProperty({ description: 'Список посылок.', type: [ParcelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParcelDto)
  parcels: ParcelDto[];
}
