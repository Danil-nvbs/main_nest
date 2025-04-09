import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Question } from './questionsListApi.dto';

export class QuestionsListResponseDto {
    @ApiProperty({ description: "Список вопросов", type: [Question] })
    @IsArray()
    question: Question[];
}

