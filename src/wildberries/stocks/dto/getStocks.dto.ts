import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional } from "class-validator";

export class GetStocksDto {
    @ApiProperty({ description: "Массив (!) столбцов БД", example: "['warehouseName', 'supplierArticle']" })
    @IsOptional()
    @IsArray()
    columns?: string[];

    @ApiProperty({ description: "Количество записей" })
    @IsOptional()
    limit?: number;
    
    @ApiProperty({ description: "Смещение записей" })
    @IsOptional()
    offset?: number;
    
    @ApiProperty({ description: "Массив (!) объектов фильтров", example: '[{ "warehouseName": "Электросталь" }, { "warehouseName": "Подольск" }]' })
    @IsOptional()
    @IsArray()
    filters?: {
        [key: string]: any
    }[]
}