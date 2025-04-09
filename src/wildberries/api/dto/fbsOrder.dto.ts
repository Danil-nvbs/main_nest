import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Address {
  @IsString()
  @IsOptional()
  fullAddress?: string;

  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;
}

class Options {
  @IsBoolean()
  isB2b: boolean;
}

export class FbsOrderDto {
  @IsObject()
  @ValidateNested()
  @Type(() => Address)
  @IsOptional()
  address?: Address;

  @IsNumber()
  scanPrice: number;

  @IsEnum(['fbs', 'wbgo'])
  deliveryType: string;

  @IsString()
  @IsOptional()
  supplyId?: string;

  @IsString()
  orderUid: string;

  @IsString()
  article: string;

  @IsString()
  colorCode: string;

  @IsString()
  rid: string;

  @IsString()
  createdAt: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  offices?: string[];

  @IsArray()
  @IsString({ each: true })
  skus: string[];

  @IsNumber()
  id: number;

  @IsNumber()
  warehouseId: number;

  @IsNumber()
  nmId: number;

  @IsNumber()
  chrtId: number;

  @IsNumber()
  price: number;

  @IsNumber()
  convertedPrice: number;

  @IsNumber()
  currencyCode: number;

  @IsNumber()
  convertedCurrencyCode: number;

  @IsEnum([1, 2, 3])
  cargoType: number;

  @IsString()
  comment: string;

  @IsBoolean()
  isZeroOrder: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => Options)
  options: Options;
}
