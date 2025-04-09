import { ApiProperty } from "@nestjs/swagger";
import { BelongsTo, Column, DataType, HasMany, Model, Table } from "sequelize-typescript"

@Table({ tableName: 'print_labels_shipments' })
export class PrintBaseShipment extends Model {
  @ApiProperty({ description: 'Уникальный идентификатор отгрузки', example: 1, required: true })
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, unique: true, allowNull: false })
  declare id: number;

  @ApiProperty({ description: 'Модель отгрузки', example: 'StandardShipment', required: true }) 
  @Column({ type: DataType.TEXT, allowNull: false })
  declare model: string;

  @ApiProperty({ description: 'Маркетплейс', example: 'Wildberries', required: true })
  @Column({ type: DataType.TEXT, allowNull: false })
  declare market: string;

  @ApiProperty({ description: 'Статус завершения отгрузки', example: false, default: false, required: true })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare finished: boolean;

  @ApiProperty({ description: 'Автор отгрузки', example: 'John Doe', required: true })
  @Column({ type: DataType.TEXT, allowNull: false })
  declare author: string;

  @ApiProperty({ description: 'Проект', example: 'MainProject', required: true })
  @Column({ type: DataType.TEXT, allowNull: false })
  declare project: string;

  @ApiProperty({ description: 'Склад маркетплейса', example: 'WB-Moscow-1', required: true })
  @Column({ type: DataType.TEXT, allowNull: false })
  declare market_warehouse: string;

  @ApiProperty({ description: 'Склад распределительного центра', example: 'DC-Central', required: true })
  @Column({ type: DataType.TEXT, allowNull: false })
  declare dc_warehouse: string;

  @ApiProperty({ description: 'Уникальное название отгрузки', example: 'WB-2024-03-15-001', required: true })
  @Column({ type: DataType.TEXT, allowNull: false, unique: true })
  declare name: string;

  @HasMany(() => PrintBaseShipmentContent, {
    foreignKey: 'shipment_name',
    sourceKey: 'name'
  })
  contents: PrintBaseShipmentContent[];
}


@Table({ tableName: 'print_labels_shipments_content' })
export class PrintBaseShipmentContent extends Model {
  @ApiProperty({ description: 'Уникальный идентификатор контента отгрузки', example: 1, required: true })
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, unique: true, allowNull: false })
  declare id: number;

  @ApiProperty({ description: 'Артикул товара', example: 'WB-12345', required: true })
  @Column({ type: DataType.TEXT, allowNull: false })
  declare article: string;

  @ApiProperty({ description: 'Штрихкод', example: '4609321726124', required: false })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare barcode: string;

  @ApiProperty({ description: 'Статус печати', example: false, default: false, required: true })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare printed: boolean;

  @ApiProperty({ description: 'Требуется ли КИЗ', example: true, required: false })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare needKiz: boolean;

  @ApiProperty({ description: 'Код КИЗ', example: 'KIZ-001', required: false })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare kiz: string;

  @ApiProperty({ description: 'Статус коррекции', example: false, default: false, required: true })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare correction: boolean;

  @ApiProperty({ description: 'Тип коррекции', example: 'Брак', required: false })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare correction_type: string;

  @BelongsTo(() => PrintBaseShipment, {
    foreignKey: 'shipment_name',
    targetKey: 'name'
  })
  shipment: PrintBaseShipment;
}