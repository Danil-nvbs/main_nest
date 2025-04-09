import { ApiProperty } from '@nestjs/swagger';

export class СreatePromotionsExcelDto {
    @ApiProperty({ description: "Данные", example: null })
    data: any | null;

    @ApiProperty({ description: "Флаг ошибки", example: false })
    error: boolean;

    @ApiProperty({ description: "Текст ошибки", example: "" })
    errorText: string;
}
