import { ApiProperty } from "@nestjs/swagger";
import { CreateWarehouseEfficiencyDto } from "./create-warehouse-efficiency.dto";
import { IsNumber } from "class-validator";

export class UpdateWarehouseEfficiencyDto extends CreateWarehouseEfficiencyDto {
    @ApiProperty({ example: '123', description: 'Уникальный идентификатор записи' })
    @IsNumber()
    id: number;
}
