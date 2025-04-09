import { ApiProperty } from '@nestjs/swagger';

export class PromotionsListDto {
    @ApiProperty({ description: "Идентификатор акции", example: 123 })
    id: number;

    @ApiProperty({ description: "Название акции", example: "скидки" })
    name: string;

    @ApiProperty({ description: "Дата и время начала акции в формате ISO 8601", example: "2023-06-05T21:00:00Z" })
    startDateTime: string;

    @ApiProperty({ description: "Дата и время окончания акции в формате ISO 8601", example: "2023-06-05T21:00:00Z" })
    endDateTime: string;

    @ApiProperty({ description: "Тип акции", example: "regular" })
    type: string;
}
