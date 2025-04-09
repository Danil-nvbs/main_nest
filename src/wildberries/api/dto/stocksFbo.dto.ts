import { ApiProperty } from '@nestjs/swagger';

export class StocksFboDto {
    @ApiProperty({ description: "Дата и время обновления информации в сервисе. Это поле соответствует параметру dateFrom в запросе. Если часовой пояс не указан, то берётся Московское время (UTC+3)", example: '2023-07-05T11:13:35' })
    lastChangeDate: string;

    @ApiProperty({ description: "Название склада", example: "Краснодар" })
    warehouseName: string;

    @ApiProperty({ description: "Артикул продавца", example: "443284" })
    supplierArticle: string;

    @ApiProperty({ description: "Артикул WB", example: 1439871458 })
    nmId: number;

    @ApiProperty({ description: "Баркод", example: "2037401340280" })
    barcode: string;

    @ApiProperty({ description: "Количество, доступное для продажи (сколько можно добавить в корзину)", example: 33 })
    quantity: number;

    @ApiProperty({ description: "В пути к клиенту", example: 1 })
    inWayToClient: number;

    @ApiProperty({ description: "В пути от клиента", example: 0 })
    inWayFromClient: number;

    @ApiProperty({ description: "Полное (непроданное) количество, которое числится за складом (= quantity + в пути)", example: 34 })
    quantityFull: number;

    @ApiProperty({ description: "Категория", example: "Посуда и инвентарь" })
    category: string;

    @ApiProperty({ description: "Предмет", example: "Формы для запекания" })
    subject: string;

    @ApiProperty({ description: "Бренд", example: "X" })
    brand: string;

    @ApiProperty({ description: "Размер", example: "0" })
    techSize: string;

    @ApiProperty({ description: "Цена", example: 185 })
    Price: number;

    @ApiProperty({ description: "Скидка", example: 0 })
    Discount: number;

    @ApiProperty({ description: "Договор поставки (внутренние технологические данные)", example: true })
    isSupply: boolean;

    @ApiProperty({ description: "Договор реализации (внутренние технологические данные)", example: false })
    isRealization: boolean;

    @ApiProperty({ description: "Код контракта (внутренние технологические данные)", example: "Tech" })
    SCCode: string;
}
