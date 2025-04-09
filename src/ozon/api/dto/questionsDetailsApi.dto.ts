import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class QuestionDetailsApiDto {
    @ApiProperty({ description: "Количество ответов на вопрос.", example: 0 })
    answers_count: number;

    @ApiProperty({ description: "Имя автора вопроса.", example: "Пользователь OZON" })
    author_name: string;

    @ApiProperty({ description: "Идентификатор вопроса.", example: "0192a009-769f-7ee9-b412-893045171a66" })
    id: string;

    @ApiProperty({ description: "Идентификатор товара в системе Ozon — SKU.", example: 646399170 })
    sku: number;

    @ApiProperty({ description: "URL товара.", example: "https://www.ozon.ru/product/149829950/" })
    product_url: string;

    @ApiProperty({ description: "Текст вопроса.", example: "Я отказываюсь от твоего отказа!" })
    text: string;

    @ApiProperty({ description: "Ссылка на вопрос.", example: "https://www.ozon.ru/product/149829950/questions/?qid=290125772&utm_campaign=reviews_sc_link&utm_medium=share_button&utm_source=smm" })
    question_link: string;

    @ApiProperty({ description: "Дата публикации вопроса.", example: "2024-10-08T10:09:29.099284Z" })
    published_at: string;

    @ApiProperty({ description: "Статус вопроса: UNPROCESSED — не обработан, PROCESSED — обработан.", example: "VIEWED" })
    status: string;
}