import { ApiProperty } from '@nestjs/swagger';

export class QuestionDetailsBodyDto {
    @ApiProperty({ description: "ID вопроса Ozon", type: String })
    questionId: string;
}

