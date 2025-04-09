import { GetProductDto } from "./get-product.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class GetLogsDto  extends GetProductDto {
    @ApiProperty({ description: "Начальная дата выборки", example: '16.01.2025, 16:41:37', nullable: true })
    @IsOptional()
    @IsDateString()
    from?: string
        
    @ApiProperty({ description: "Конечная дата выборки", example: '16.01.2025, 16:41:37', nullable: true })
    @IsOptional()
    @IsDateString()
    to?: string
}