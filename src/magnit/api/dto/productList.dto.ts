import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

class Photo360 {
  @ApiProperty({ description: 'URL фото 360.', example: 'string' })
  url: string;
}

class ProductImage {
  @ApiProperty({ description: 'URL изображения товара.', example: 'string' })
  url: string;
}

class Video {
  @ApiProperty({ description: 'URL видео.', example: 'string' })
  url: string;
}

class CustomCharacteristicValue {
  @ApiProperty({ description: 'Название характеристики.', example: 'string' })
  characteristic_title: string;

  @ApiProperty({ description: 'Значение характеристики.', example: 'string' })
  characteristic_value: string;
}

class SkuCharacteristic {
  @ApiProperty({ description: 'Идентификатор характеристики.', example: 0 })
  characteristic_id: number;

  @ApiProperty({ description: 'Значение характеристики.', example: 'string' })
  characteristic_value: string;
}

class Product {
  @ApiProperty({ description: 'Штрихкод товара.', example: 0 })
  barcode: number;

  @ApiProperty({ description: 'Идентификатор категории.', example: 0 })
  category_id: number;

  @ApiProperty({ description: 'Сертификат.', example: 'string' })
  certificate: string;

  @ApiProperty({ description: 'Состав товара.', example: 'string' })
  composition: string;

  @ApiProperty({ description: 'Код валюты.', example: 'string' })
  currency_code: string;

  @ApiProperty({ description: 'Пользовательские характеристики SKU.', type: [CustomCharacteristicValue] })
  @IsArray()
  custom_characteristic_values_skus: CustomCharacteristicValue[];

  @ApiProperty({ description: 'Глубина товара.', example: 0 })
  depth: number;

  @ApiProperty({ description: 'Описание товара.', example: 'string' })
  description: string;

  @ApiProperty({ description: 'Высота товара.', example: 0 })
  height: number;

  @ApiProperty({ description: 'Инструкция.', example: 'string' })
  instruction: string;

  @ApiProperty({ description: 'Активен ли товар.', example: true })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ description: 'Товар в архиве.', example: true })
  @IsBoolean()
  is_archive: boolean;

  @ApiProperty({ description: 'Товар заблокирован.', example: true })
  @IsBoolean()
  is_blocked: boolean;

  @ApiProperty({ description: 'Товар без остатков.', example: true })
  @IsBoolean()
  is_no_stock: boolean;

  @ApiProperty({ description: 'OKPD2 код.', example: 'string' })
  okpd2: string;

  @ApiProperty({ description: 'Старая цена товара.', example: 0 })
  old_price: number;
@ApiProperty({ description: 'Фото 360.', type: Photo360 })
  photo_360: Photo360;

  @ApiProperty({ description: 'Текущая цена товара.', example: 0 })
  price: number;

  @ApiProperty({ description: 'Идентификатор товара.', example: 0 })
  product_id: number;

  @ApiProperty({ description: 'Изображения товара.', type: [ProductImage] })
  @IsArray()
  product_images: ProductImage[];

  @ApiProperty({ description: 'Идентификатор SKU продавца.', example: 'string' })
  seller_sku_id: string;

  @ApiProperty({ description: 'Таблица размеров.', example: 'string' })
  size_chart: string;

  @ApiProperty({ description: 'Список характеристик SKU.', type: [SkuCharacteristic] })
  @IsArray()
  sku_characteristic_list: SkuCharacteristic[];

  @ApiProperty({ description: 'Идентификатор SKU.', example: 0 })
  sku_id: number;

  @ApiProperty({ description: 'Название товара.', example: 'string' })
  title: string;

  @ApiProperty({ description: 'НДС.', example: 'string' })
  vat: string;

  @ApiProperty({ description: 'Видео.', type: Video })
  video: Video;

  @ApiProperty({ description: 'Вес товара.', example: 0 })
  weight: number;

  @ApiProperty({ description: 'Ширина товара.', example: 0 })
  width: number;
}

export class ProductListApiDto {
  @ApiProperty({ description: 'Список товаров.', type: [Product] })
  @IsArray()
  result: Product[];
}
