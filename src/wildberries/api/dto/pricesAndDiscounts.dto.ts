import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class PricesAndDiscountsDto {
    @ApiProperty({ description: "Артикул продавца", example: "443284" })
    art: string;

    @ApiProperty({ description: "Артикул WB", example: 1439871458 })
    nmId: number;
    
    @ApiProperty({ description: "Скидка", example: 62 })
    discount: number;

    @ApiProperty({ description: "Цена до скидки", example: 456 })
    price: number;
}
