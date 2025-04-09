import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional } from "class-validator";

export class GetProductDto {
    @ApiProperty({ description: "Массив (!) столбцов БД", example: "['article', 'name']", nullable: false })
    @IsArray()
    columns: string[];

    @ApiProperty({ description: "Количество записей", nullable: true })
    @IsOptional()
    limit?: number;
    
    @ApiProperty({ description: "Смещение записей", nullable: true })
    @IsOptional()
    offset?: number;
    
    @ApiProperty({ description: "Массив (!) объектов фильтров", example: '[{ "article": "123" }, { "pack": "10" }]', nullable: true })
    @IsOptional()
    @IsArray()
    filters?: {
        [key: string]: any
    }[]
}