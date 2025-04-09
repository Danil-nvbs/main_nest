import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class GetWarehouseEfficiencyDto {
    @ApiProperty({ description: "Массив (!) столбцов БД", example: "['article', 'name']", nullable: false })
    @IsArray()
    columns?: string[];

    @ApiProperty({ description: "Количество записей", nullable: true })
    @IsOptional()
    @IsNumber()
    limit?: number;
    
    @ApiProperty({ description: "Смещение записей", nullable: true })
    @IsOptional()
    @IsNumber()
    offset?: number;
    
    @ApiProperty({ description: "Начальная дата", nullable: true })
    @IsOptional()
    @IsString()
    from?: string;
    
    @ApiProperty({ description: "Конечная дата", nullable: true })
    @IsOptional()
    @IsString()
    to?: string;
    
    @ApiProperty({ description: "Массив (!) объектов фильтров", example: '[{ "article": "123" }, { "pack": "10" }]', nullable: true })
    @IsOptional()
    @IsArray()
    filters?: {
        [key: string]: any
    }[]
}