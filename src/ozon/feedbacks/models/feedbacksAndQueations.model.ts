import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsInt, IsArray, ValidateNested } from "class-validator";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Type } from 'class-transformer';

interface IOzonFeedbacksAndQuestionsCreationAttrs {
    message_id: string;
}

@Table({
    tableName: 'ozon_feedbacks',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['message_id'],
        },
    ]
})
export class OzonFeedbacksAndQuestions extends Model<OzonFeedbacksAndQuestions, IOzonFeedbacksAndQuestionsCreationAttrs> {
    @ApiProperty({ description: "Идентификатор отзыва.", example: "017c0db1-e985-3106-f8b1-3f490f70fcfa" })
    @Column({ type: DataType.TEXT, primaryKey: true, allowNull: false })
    message_id: string;

    @ApiProperty({ description: "Идентификатор товара в системе Ozon — SKU.", example: 170285690 })
    @Column({ type: DataType.INTEGER })
    sku: number;

    @ApiProperty({ description: "Текст отзыва.", example: "Ерунда полнейшая. Как она могла без скидки стоить более 1000 рублей? Купила за 290 и полностью разочаровалась. Никакого сюрприза, пришло в прозрачном пакете. Внутри был только пингвин и колечко. О каких нескольких подарках идёт речь? Не стоит эта чушь 300₽. Не ведитесь. Ребёнок даже расстроился. Цитата «и это все?!». Действительно, за такие деньги хоть бы конфету вложили😄" })
    @Column({ type: DataType.TEXT })
    text: string;

    @ApiProperty({ description: "Дата публикации отзыва.", example: "2020-04-25T20:26:52.585615Z" })
    @IsDateString()
    @Column({ type: DataType.DATE })
    date: string;

    @ApiProperty({ description: "Оценка отзыва.", example: 1 })
    @IsInt()
    @Column({ type: DataType.INTEGER })
    rating: number;

    @ApiProperty({ description: "Бренд товара.", example: "Happy Valley" })
    @Column({ type: DataType.TEXT })
    brand: string;

    @ApiProperty({ description: "Артикул товара.", example: "4296675" })
    @Column({ type: DataType.TEXT })
    article: string;

    @ApiProperty({ description: "Идентификатор товара в системе Ozon.", example: "21104339" })
    @Column({ type: DataType.TEXT })
    ozon_id: string;

    @ApiProperty({ description: "Информация о медиа (фото и видео).", example: "Фото: https://cdn1.ozone.ru/s3/rp-photo-2/44982e54-ace2-4be4-b166-ec7a86ec0ec7.jpeg" })
    @Column({ type: DataType.TEXT })
    media: string;

    @ApiProperty({ description: "Тип обращения", example: "Отзыв" })
    @Column({ type: DataType.TEXT })
    kind: string;

    @ApiProperty({ description: "Тип кабинета", example: "PK" })
    @Column({ type: DataType.TEXT })
    type: string;

    @ApiProperty({ description: "Наименование товара", example: "Колесо для грызунов" })
    @Column({ type: DataType.TEXT })
    product_name: string;

    @ApiProperty({ description: "Статус ответа", example: "Отвечен" })
    @Column({ type: DataType.TEXT })
    status: string;

    @ApiProperty({ description: "Текст ответа", example: "Спасибо за покупку" })
    @Column({ type: DataType.TEXT })
    answer: string;

    @ApiProperty({ description: "Автор ответа", example: "Александра" })
    @Column({ type: DataType.TEXT })
    manager: string;

    @ApiProperty({ description: "Жалоба на отзыв", example: true })
    @Column({ type: DataType.BOOLEAN })
    reject: boolean;

    @ApiProperty({ description: "Комментарий 1", example: "Повреждение при доставке" })
    @Column({ type: DataType.TEXT })
    comments1: string;

    @ApiProperty({ description: "Комментарий 2", example: "Повреждение при доставке" })
    @Column({ type: DataType.TEXT })
    comments2: string;

    @ApiProperty({ description: "Статус загрузки ответа на Озон", example: "Загружен" })
    @Column({ type: DataType.TEXT })
    loading_status: string;

    @ApiProperty({ description: "Признак СТМ", example: true })
    @Column({ type: DataType.BOOLEAN })
    isStm: boolean;

    @ApiProperty({ description: "Дата архивации отзыва.", example: "2020-04-25T20:26:52.585615Z" })
    @IsDateString()
    @Column({ type: DataType.DATE })
    archive_date: string;

    @ApiProperty({ description: "Количество комментариев", example: 0 })
    @IsInt()
    @Column({ type: DataType.INTEGER })
    comments_amount: number;

    @ApiProperty({ description: "Количество дизлайков", example: 0 })
    @IsInt()
    @Column({ type: DataType.INTEGER })
    dislikes_amount: number;

    @ApiProperty({ description: "Участник рейтинга", example: true })
    @IsBoolean()
    @Column({ type: DataType.BOOLEAN })
    is_rating_participant: boolean;

    @ApiProperty({ description: "Количество лайков", example: 0 })
    @IsInt()
    @Column({ type: DataType.INTEGER })
    likes_amount: number;

    @ApiProperty({ description: "Статус заказа", example: "string" })
    @Column({ type: DataType.TEXT })
    order_status: string

    @ApiProperty({ description: "Статус сообщения в Озон", example: "string" })
    @Column({ type: DataType.TEXT })
    message_status: string

    feedbackCount?: number;
}
