import { ApiProperty } from "@nestjs/swagger";

export class SetActiveDischargeDto {
    @ApiProperty({ description: "Тип", example: "PK", nullable: false })
    type: string;

    @ApiProperty({ description: "Список артикулов Магнит", example: "[2130202, 1200320]", nullable: false })
    sku_ids: number[];
}