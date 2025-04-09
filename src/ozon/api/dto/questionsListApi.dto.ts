import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class Question {
    @ApiProperty({ description: "Количество ответов на вопрос.", example: 1 })
    answers_count: number;

    @ApiProperty({ description: "Имя автора вопроса.", example: "Пользователь OZON" })
    author_name: string;

    @ApiProperty({ description: "Идентификатор вопроса.", example: "019294ff-6888-7009-89d8-26569e4e450d" })
    id: string;

    @ApiProperty({ description: "Идентификатор товара в системе Ozon — SKU.", example: 646399170 })
    sku: number;

    @ApiProperty({ description: "URL товара.", example: "https://www.ozon.ru/product/1649246352/" })
    product_url: string;

    @ApiProperty({ description: "Дата публикации вопроса.", example: "2024-08-14T12:02:01.889Z" })
    published_at: string;

    @ApiProperty({ description: "Ссылка на вопрос.", example: "https://www.ozon.ru/product/1649246352/questions/?qid=290180206&utm_campaign=reviews_sc_link&utm_medium=share_button&utm_source=smm" })
    question_link: string;

    @ApiProperty({ description: "Текст вопроса.", example: "Новый вопрос о товаре Света" })
    text: string;

    @ApiProperty({ description: "Статус вопроса: UNPROCESSED — не обработан, PROCESSED — обработан.", example: "PROCESSED" })
    status: string;
}

export class QuestionsListApiDto {
    @ApiProperty({ description: "Список вопросов.", type: [Question] })
    @IsArray()
    questions: Question[];

    @ApiProperty({ description: "Идентификатор последнего вопроса на странице.", example: "019228a7-91d8-76af-a73a-e989dfac7ac8" })
    last_id: string;
}