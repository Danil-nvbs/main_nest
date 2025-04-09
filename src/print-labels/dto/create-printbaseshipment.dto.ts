import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreatePrintBaseShipmentContentRawDto } from "./create-printbaseshipmentcontent-raw.dto";

export class CreatePrintBaseShipmentDto {
    @ApiProperty({ description: 'Модель отгрузки', example: 'StandardShipment' })
    @IsString() 
    @IsNotEmpty()
    model: string;
  
    @ApiProperty({ description: 'Маркетплейс', example: 'Wildberries' })
    @IsString() 
    @IsNotEmpty()
    market: string;
  
    @ApiProperty({ description: 'Статус завершения обработки', example: false, default: false })
    @IsBoolean()
    @IsOptional()
    finished: boolean;
  
    @ApiProperty({ description: 'Автор отгрузки', example: 'dcontract.danil@gmail.com' })
    @IsString() 
    @IsOptional()
    author: string;
  
    @ApiProperty({ description: 'Проект', example: 'СТМ' })
    @IsString() 
    @IsNotEmpty()
    project: string;
  
    @ApiProperty({ description: 'Склад маркетплейса', example: 'Электросталь' })
    @IsString() 
    @IsNotEmpty()
    market_warehouse: string;
  
    @ApiProperty({ description: 'Наш склад', example: 'МСК' })
    @IsString() 
    @IsNotEmpty()
    dc_warehouse: string;
  
    @ApiProperty({ description: 'Уникальное название отгрузки', example: 'WB-2024-03-15-001' })
    @IsString() 
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Состав поставки', example: [{ article: '1234567890', count: 1 }, { article: '1234567891', count: 2 }] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePrintBaseShipmentContentRawDto)
    items: CreatePrintBaseShipmentContentRawDto[]
  }