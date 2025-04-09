import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table ({
    tableName: "wb_stocks",
    timestamps: false,
    indexes: [{
        name: 'wb_stocks_unique_index',
        unique: true,
        fields: ['updateDate', 'warehouseName', 'supplierArticle', 'isSupply', 'isRealization']
    }],
})
export class WbStocks extends Model<WbStocks, WbStocks> {
    @ApiProperty({ example: '1', description: 'Идентификатор' })
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false })
    id: string;

    @ApiProperty({ description: "Тип магазина WB", example: "PK"})
    @Column ({ type: DataType.TEXT, allowNull: false })
    type: string;

    @ApiProperty({ description: "Дата получения данных", example: "2025-03-28"})
    @Column ({ type: DataType.DATEONLY, allowNull: false })
    updateDate: string;

    @ApiProperty({ 
        description: "Дата и время обновления информации в сервисе. Это поле соответствует параметру dateFrom в запросе. Если часовой пояс не указан, то берётся Московское время (UTC+3)",
        example: '2023-07-05T11:13:35'
    })
    @Column ({ type: DataType.TEXT, allowNull: false })
    lastChangeDate: string;

    @ApiProperty({ description: "Название склада", example: "Краснодар" })
    @Column ({ type: DataType.TEXT })
    warehouseName: string;

    @ApiProperty({ description: "Артикул продавца", example: "443284" })
    @Column ({ type: DataType.TEXT })
    supplierArticle: string;

    @ApiProperty({ description: "Артикул WB", example: 1439871458 })
    @Column ({ type: DataType.INTEGER })
    nmId: number;

    @ApiProperty({ description: "Баркод", example: "2037401340280" })
    @Column ({ type: DataType.TEXT })
    barcode: string;

    @ApiProperty({ description: "Количество, доступное для продажи (сколько можно добавить в корзину)", example: 33 })
    @Column ({ type: DataType.INTEGER })
    quantity: number;

    @ApiProperty({ description: "В пути к клиенту", example: 1 })
    @Column ({ type: DataType.INTEGER })
    inWayToClient: number;

    @ApiProperty({ description: "В пути от клиента", example: 0 })
    @Column ({ type: DataType.INTEGER })
    inWayFromClient: number;

    @ApiProperty({ description: "Полное (непроданное) количество, которое числится за складом (= quantity + в пути)", example: 34 })
    @Column ({ type: DataType.INTEGER })
    quantityFull: number;

    @ApiProperty({ description: "Категория", example: "Посуда и инвентарь" })
    @Column ({ type: DataType.TEXT })
    category: string;

    @ApiProperty({ description: "Предмет", example: "Формы для запекания" })
    @Column ({ type: DataType.TEXT })
    subject: string;

    @ApiProperty({ description: "Бренд", example: "X" })
    @Column ({ type: DataType.TEXT })
    brand: string;

    @ApiProperty({ description: "Размер", example: "0" })
    @Column ({ type: DataType.TEXT })
    techSize: string;

    @ApiProperty({ description: "Цена", example: 185 })
    @Column ({ type: DataType.INTEGER })
    Price: number;

    @ApiProperty({ description: "Скидка", example: 0 })
    @Column ({ type: DataType.INTEGER })
    Discount: number;

    @ApiProperty({ description: "Договор поставки (внутренние технологические данные)", example: true })
    @Column ({ type: DataType.BOOLEAN })
    isSupply: boolean;

    @ApiProperty({ description: "Договор реализации (внутренние технологические данные)", example: false })
    @Column ({ type: DataType.BOOLEAN })
    isRealization: boolean;

    @ApiProperty({ description: "Код контракта (внутренние технологические данные)", example: "Tech" })
    @Column ({ type: DataType.TEXT })
    SCCode: string;
}