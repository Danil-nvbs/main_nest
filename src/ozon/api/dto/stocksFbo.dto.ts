import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class StocksFboDto {
    @ApiProperty({ description: "Идентификатор товара в системе Ozon — SKU", example: "443284" })
    sku: number;

    @ApiProperty({ description: "Идентификатор товара в системе продавца", example: 1439871458 })
    item_code: string;
    
    @ApiProperty({ description: "Название товара в системе Ozon", example: 62 })
    item_name: string;

    @ApiProperty({ description: "Количество товара, доступное к продаже на Ozon", example: 456 })
    free_to_sell_amount: number;

    @ApiProperty({ description: "Количество товара, указанное в подтверждённых будущих поставках", example: 456 })
    promised_amount: number;

    @ApiProperty({ description: "Количество товара, зарезервированное для покупки, возврата и перевозки между складами", example: 456 })
    reserved_amount: number;
    
    @ApiProperty({ description: "Название склада, где находится товар", example: 456 })
    warehouse_name: string;
    
    @ApiProperty({ description: "На сколько дней хватит остатка товара с учётом среднесуточных продаж", example: 456 })
    idc: number;

}