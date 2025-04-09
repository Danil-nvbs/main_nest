import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

// DTO для создания записи
export class CreatePrintBaseShipmentContentDto {
    @ApiProperty({ description: 'Название связанной отгрузки', example: 'WB-2024-03-15-001', required: true }) 
    @IsString() 
    @IsNotEmpty()
    shipment_name: string;
  
    @ApiProperty({ description: 'Артикул товара', example: 'WB-12345', required: true }) 
    @IsString() 
    @IsNotEmpty()
    article: string;
  
    @ApiProperty({ description: 'ID стикера Wildberries', example: 'WB-STICKER-001', required: false }) 
    @IsString() 
    @IsOptional()
    wb_sticker_id?: string;
  
    @ApiProperty({ description: 'Дата создания в Wildberries', example: '2024-03-15', required: false }) 
    @IsString() 
    @IsOptional()
    wb_created_at?: string;
  
    @ApiProperty({ description: 'ID в Wildberries', example: 'WB-ID-001', required: false }) 
    @IsString() 
    @IsOptional()
    wb_id?: string;
  
    @ApiProperty({ description: 'UID заказа в Wildberries', example: 'WB-ORDER-001', required: false }) 
    @IsString() 
    @IsOptional()
    wb_orderUid?: string;
  
    @ApiProperty({ description: 'RID в Wildberries', example: 'WB-RID-001', required: false }) 
    @IsString() 
    @IsOptional()
    wb_rid?: string;
  
    @ApiProperty({ description: 'SKU в Wildberries', example: 'WB-SKU-001', required: false }) 
    @IsString() 
    @IsOptional()
    wb_skus?: string;
  
    @ApiProperty({ description: 'NM ID в Wildberries', example: 'WB-NM-001', required: false }) 
    @IsString() 
    @IsOptional()
    wb_nmId?: string;
  
    @ApiProperty({ description: 'ID склада в Wildberries', example: 'WB-WH-001', required: false }) 
    @IsString() 
    @IsOptional()
    wb_warehouseId?: string;
  
    @ApiProperty({ description: 'Статус печати', example: false, default: false, required: false }) 
    @IsBoolean() 
    @IsOptional() 
    @Type(() => Boolean)
    printed?: boolean;
  
    @ApiProperty({ description: 'Требуется ли КИЗ', example: true, required: false }) 
    @IsBoolean() 
    @IsOptional() 
    @Type(() => Boolean)
    needKiz?: boolean;
  
    @ApiProperty({ description: 'Код КИЗ', example: 'KIZ-001', required: false }) 
    @IsString() 
    @IsOptional()
    kiz?: string;
  
    @ApiProperty({ description: 'Статус коррекции', example: false, default: false, required: false }) 
    @IsBoolean() 
    @IsOptional() 
    @Type(() => Boolean)
    correction?: boolean;
  
    @ApiProperty({ description: 'Тип коррекции', example: 'PRICE', required: false }) 
    @IsString() 
    @IsOptional()
    correction_type?: string;
  }