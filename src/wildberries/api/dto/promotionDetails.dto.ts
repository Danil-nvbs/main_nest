import { ApiProperty } from '@nestjs/swagger';

class Ranging {
    @ApiProperty({ description: "Условие для рейтинга", example: "productsInPromotion" })
    condition: string;

    @ApiProperty({ description: "Процент участия", example: 10 })
    participationRate: number;

    @ApiProperty({ description: "Увеличение", example: 7 })
    boost: number;
}

export class PromotionsDetailsDto {
    @ApiProperty({ description: "Идентификатор акции", example: 123 })
    id: number;

    @ApiProperty({ description: "Название акции", example: "ХИТЫ ГОДА" })
    name: string;

    @ApiProperty({ description: "Описание акции", example: "В акции принимают участие самые популярные товары 2023 года. Карточки товаров будут выделены плашкой «ХИТ ГОДА», чтобы покупатели замечали эти товары среди других. Также они будут размещены под баннерами на главной странице и примут участие в PUSH-уведомлениях. С ценами для вступления в акцию вы можете ознакомиться ниже." })
    description: string;

    @ApiProperty({ description: "Преимущества акции", example: ["Плашка", "Баннер", "Топ выдачи товаров"] })
    advantages: string[];

    @ApiProperty({ description: "Дата и время начала акции в формате ISO 8601", example: "2023-06-05T21:00:00Z" })
    startDateTime: string;

    @ApiProperty({ description: "Дата и время окончания акции в формате ISO 8601", example: "2023-06-05T21:00:00Z" })
    endDateTime: string;

    @ApiProperty({ description: "Остатки в акции", example: 45 })
    inPromoActionLeftovers: number;

    @ApiProperty({ description: "Общее количество в акции", example: 123 })
    inPromoActionTotal: number;

    @ApiProperty({ description: "Остатки не в акции", example: 3 })
    notInPromoActionLeftovers: number;

    @ApiProperty({ description: "Общее количество не в акции", example: 10 })
    notInPromoActionTotal: number;

    @ApiProperty({ description: "Процент участия", example: 10 })
    participationPercentage: number;

    @ApiProperty({ description: "Тип акции", example: "auto" })
    type: string;

    @ApiProperty({ description: "Количество исключенных товаров", example: 10 })
    exceptionProductsCount: number;

    @ApiProperty({ description: "Рейтинг", type: [Ranging] })
    ranging: Ranging[];
}
