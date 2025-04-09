import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript"

interface WarehouseEfficiencyCreationAttrs {
    article: string;
}

@Table({
    tableName: 'warehouse_efficiency',
    timestamps: false,
    indexes: [
    {
        unique: true,
        fields: ['date', 'time', 'scanner'],
    },
]})

export class WarehouseEfficiency extends Model<WarehouseEfficiency, WarehouseEfficiencyCreationAttrs> {
    @ApiProperty({ example: '1', description: 'Идентификатор записи' })
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false })
    id: number;

    @ApiProperty({ example: '2024-02-15', description: 'Дата' })
    @Column({ type: DataType.DATE, allowNull: false })
    date: Date;

    @ApiProperty({ example: '11:08:19', description: 'Время' })
    @Column({ type: DataType.TEXT, allowNull: false })
    time: string;

    @ApiProperty({ example: 'Иванов Иван', description: 'Упаковщик' })
    @Column({ type: DataType.TEXT, allowNull: false })
    packer: string;

    @ApiProperty({ example: '10', description: 'Количество' })
    @Column({ type: DataType.INTEGER, allowNull: false })
    quantity: number;

    @ApiProperty({ example: 'WLN123', description: 'Артикул' })
    @Column({ type: DataType.TEXT, allowNull: false })
    article: string;

    @ApiProperty({ example: 'FBS', description: 'Модель (FBS/FBO)' })
    @Column({ type: DataType.TEXT, allowNull: false })
    model: string;

    @ApiProperty({ example: '4820024700016', description: 'Штрихкод' })
    @Column({ type: DataType.TEXT, allowNull: true })
    barcode: string;

    @ApiProperty({ example: '15102554-0240-6', description: 'ID заказа/Номер поставки' })
    @Column({ type: DataType.TEXT, allowNull: true })
    order_id: string;

    @ApiProperty({ example: 'Scanner10', description: 'Сканер' })
    @Column({ type: DataType.TEXT, allowNull: true })
    scanner: string;

    @ApiProperty({ example: 'OZON_MZ_CTM', description: 'Платформа' })
    @Column({ type: DataType.TEXT, allowNull: true })
    platform: string;

    @ApiProperty({ example: 'Москва', description: 'Склад' })
    @Column({ type: DataType.TEXT, allowNull: true })
    warehouse: string;
}