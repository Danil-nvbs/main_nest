import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional } from "class-validator";

export class GetWbDischargeDto {
    @ApiProperty({ description: "Тип", example: "FBO", nullable: false })
    type: string;

    @ApiProperty({ description: "Массив (!) столбцов БД", example: "['nmID', 'imtID']", nullable: false })
    @IsArray()
    columns: string[];

    @ApiProperty({ description: "Количество записей", nullable: true })
    @IsOptional()
    limit?: number;
    
    @ApiProperty({ description: "Смещение записей", nullable: true })
    @IsOptional()
    offset?: number;
    
    @ApiProperty({ description: "Массив (!) объектов фильтров", example: '[{ "nmID": "123" }, { "imtID": "10" }]', nullable: true })
    @IsOptional()
    @IsArray()
    filters?: {
        [key: string]: any
    }[]
}