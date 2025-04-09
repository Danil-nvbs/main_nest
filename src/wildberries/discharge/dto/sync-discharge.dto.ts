import { ApiProperty } from "@nestjs/swagger";

export class SyncWbDischargeDto {
    @ApiProperty({ description: "Тип", example: "FBO", nullable: false })
    type: string;

    @ApiProperty({ description: "Имя листа в таблице", example: "Выгрузка ВБ", nullable: false })
    sourceSheetName: string;
}