import { ApiProperty } from "@nestjs/swagger";

export class SyncMagnitDischargeDto {
    @ApiProperty({ description: "Тип", example: "FBO", nullable: false })
    type: string;

    @ApiProperty({ description: "Имя листа в таблице", example: "Выгрузка Магнит", nullable: false })
    sourceSheetName: string;
}