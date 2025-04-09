import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional } from "class-validator";

const markets = ['Wb', 'Ozon', 'Yandex'] as const;

export class GetDischargeDto {
    @ApiProperty({ enum: markets})
    market: 'Wb' | 'Ozon' | 'Yandex';

    @ApiProperty({ description: "Массив (!) столбцов БД", example: "['nmID', 'imtID']", nullable: false })
    @IsArray()
    columns: string[];
    
    @ApiProperty({ description: "Массив (!) объектов фильтров", example: '[{ "nmID": "123" }, { "imtID": "10" }]', nullable: true })
    @IsOptional()
    @IsArray()
    filters?: {
        [key: string]: any
    }[]
}