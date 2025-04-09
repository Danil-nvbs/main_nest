import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Feedbacks } from './feedbacksListApi.dto';

export class FeedbacksListResponseDto {
    @ApiProperty({ description: "Список отзывов", type: [Feedbacks] })
    @IsArray()
    feedbacks: Feedbacks[];
}

