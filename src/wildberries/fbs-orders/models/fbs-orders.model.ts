import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasOne, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { WbFbsStickers } from './fbs-stickers.model';
import { WbFbsStatuses } from './fbs-statuses.model';
import { WbFbsSupply } from './fbs-supplies.model';
import { WbFbsPrinted } from 'src/print-labels/models/printed-wb-fbs';

@Table({ tableName: 'wb_fbs_orders', timestamps: false })
export class WbFbsOrder extends Model {
  @ApiProperty({ example: 13833711, description: 'ID сборочного задания в Маркетплейсе' })
  @Column({ type: DataType.BIGINT, primaryKey: true, allowNull: false })
  id: number;

  @ApiProperty({
    description: 'Детализованный адрес покупателя для доставки',
    nullable: true,
    type: 'object',
    properties: {
      fullAddress: { type: 'string', example: 'Челябинская область, г. Челябинск, 51-я улица Арабкира, д. 10А, кв. 42' },
      longitude: { type: 'number', example: 44.519068 },
      latitude: { type: 'number', example: 40.20192 }
    }
  })
  @Column({ type: DataType.JSONB, allowNull: true })
  address: {
    fullAddress: string;
    longitude: number;
    latitude: number;
  };

  @ApiProperty({ example: 1500, description: 'Цена приёмки в копейках' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  scanPrice: number;

  @ApiProperty({ example: 'PK', description: 'Магазин', enum: ['PK', 'IP'] })
  @Column({ type: DataType.STRING, allowNull: false })
  type: string;

  @ApiProperty({ example: 'fbs', description: 'Тип доставки', enum: ['fbs', 'wbgo'] })
  @Column({ type: DataType.STRING, allowNull: false })
  deliveryType: string;

  // @ApiProperty({ example: 'WB-GI-92937123', description: 'ID поставки' })
  // @Column({ type: DataType.STRING })
  // supplyId: string;

  @ApiProperty({ example: '165918930_629fbc924b984618a44354475ca58675', description: 'ID транзакции для группировки сборочных заданий' })
  @Column({ type: DataType.STRING })
  orderUid: string;

  @ApiProperty({ example: 'one-ring-7548', description: 'Артикул продавца' })
  @Column({ type: DataType.STRING, allowNull: false })
  article: string;

  @ApiProperty({ example: 'RAL 3017', description: 'Код цвета' })
  @Column({ type: DataType.STRING })
  colorCode: string;

  @ApiProperty({ example: 'f884001e44e511edb8780242ac120002', description: 'ID сборочного задания в системе Wildberries' })
  @Column({ type: DataType.STRING })
  rid: string;

  @ApiProperty({ example: '2022-05-04T07:56:29Z', description: 'Дата создания сборочного задания' })
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @ApiProperty({ example: ['Калуга'], description: 'Список офисов, куда следует привезти товар' })
  @Column({ type: DataType.ARRAY(DataType.STRING) })
  offices: string[];

  @ApiProperty({ example: ['6665956397512'], description: 'Массив баркодов товара' })
  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  skus: string[];

  @ApiProperty({ example: 658434, description: 'ID склада продавца' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  warehouseId: number;

  @ApiProperty({ example: 12345678, description: 'Артикул WB' })
  @Column({ type: DataType.BIGINT, allowNull: false })
  nmId: number;

  @ApiProperty({ example: 987654321, description: 'ID размера товара в системе Wildberries' })
  @Column({ type: DataType.BIGINT })
  chrtId: number;

  @ApiProperty({ example: 1014, description: 'Цена в валюте продажи' })
  @Column({ type: DataType.INTEGER })
  price: number;

  @ApiProperty({ example: 28322, description: 'Конвертированная цена товара' })
  @Column({ type: DataType.INTEGER })
  convertedPrice: number;

  @ApiProperty({ example: 933, description: 'Код валюты продажи' })
  @Column({ type: DataType.INTEGER })
  currencyCode: number;

  @ApiProperty({ example: 643, description: 'Конвертированный код валюты' })
  @Column({ type: DataType.INTEGER })
  convertedCurrencyCode: number;

  @ApiProperty({ example: 1, description: 'Тип товара', enum: [1, 2, 3] })
  @Column({ type: DataType.INTEGER })
  cargoType: number;

  @ApiProperty({ example: 'Упакуйте в плёнку, пожалуйста', description: 'Комментарий покупателя', maxLength: 300 })
  @Column({ type: DataType.STRING })
  comment: string;

  @ApiProperty({ example: false, description: 'Признак заказа сделанного на нулевой остаток товара' })
  @Column({ type: DataType.BOOLEAN })
  isZeroOrder: boolean;

  @ApiProperty({
    description: 'Опции заказа',
    type: 'object',
    properties: {
      isB2b: { type: 'boolean' }
    }
  })
  @Column({ type: DataType.JSONB })
  options: {
    isB2b: boolean;
  };

  @ForeignKey(() => WbFbsSupply)
  @Column({ type: DataType.STRING })
  supplyId: string;
  
  @BelongsTo(() => WbFbsSupply)
  supply: WbFbsSupply;

  @HasOne(() => WbFbsStickers)
  sticker: WbFbsStickers;

  @HasOne(() => WbFbsStatuses)
  status: WbFbsStatuses;

  @HasOne(() => WbFbsPrinted)
  printed: WbFbsPrinted;
} 

