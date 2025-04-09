import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class WorkWithTableDto {
    @ApiProperty({ description: "Имя листа", nullable: false })
    @IsNotEmpty()
    readonly sourceSheetName: string;
}
