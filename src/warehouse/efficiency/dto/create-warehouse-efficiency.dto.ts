import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateWarehouseEfficiencyDto {
    @ApiProperty({ example: '2024-02-15', description: 'Дата' })
    @IsString()
    date: Date;

    @ApiProperty({ example: '11:08:19', description: 'Время' })
    @IsString()
    time: string;

    @ApiProperty({ example: 'Иванов Иван', description: 'Упаковщик' })
    @IsString()
    packer: string;

    @ApiProperty({ example: '10', description: 'Количество' })
    @IsNumber()
    quantity: number;

    @ApiProperty({ example: 'WLN123', description: 'Артикул' })
    @IsString()
    article: string;

    @ApiProperty({ example: 'FBS', description: 'Модель (FBS/FBO)' })
    @IsString()
    model: string;

    @ApiProperty({ example: '15102554-0240-6', description: 'ID заказа/Номер поставки' })
    @IsOptional()
    @IsString()
    order_id: string;

    @ApiProperty({ example: '4820024700016', description: 'Штрихкод' })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiProperty({ example: 'Scanner10', description: 'Сканер' })
    @IsOptional()
    @IsString()
    scanner?: string;

    @ApiProperty({ example: 'OZON_MZ_CTM', description: 'Платформа' })
    @IsOptional()
    @IsString()
    platform?: string;

    @ApiProperty({ example: 'Москва', description: 'Склад' })
    @IsOptional()
    @IsString()
    warehouse?: string;
}
