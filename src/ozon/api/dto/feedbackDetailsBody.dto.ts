import { ApiProperty } from '@nestjs/swagger';

export class FeedbackDetailsBodyDto {
    @ApiProperty({ description: "ID отзыва Ozon", type: String })
    feedbackId: string;

    @ApiProperty({ description: "Тип магазина Ozon", type: String })
    type?: string
}

