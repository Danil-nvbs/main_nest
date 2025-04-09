import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasOne, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { WbFbsOrder } from './fbs-orders.model';

@Table({ tableName: 'wb_fbs_stickers', timestamps: false })
export class WbFbsStickers extends Model {
  @ApiProperty({ example: 5346346, description: 'ID сборочного задания' })
  @ForeignKey(() => WbFbsOrder)
  @Column({ type: DataType.BIGINT, primaryKey: true, allowNull: false })
  orderId: number;

  @BelongsTo(() => WbFbsOrder)
  order: WbFbsOrder;

  @ApiProperty({ example: 231648, description: 'Первая часть ID стикера (для печати подписи)' })
  @Column({ type: DataType.INTEGER, allowNull: true })
  partA: number;

  @ApiProperty({ example: 9753, description: 'Вторая часть ID стикера' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  partB: number;

  @ApiProperty({ example: '!uKEtQZVx', description: 'Закодированное значение стикера' })
  @Column({ type: DataType.STRING, allowNull: false })
  barcode: string;

  @ApiProperty({ example: 'PD94bWwgdmVyc2lvbj0iMS4wIj8+CjwhLS0gR2VuZXJhdGVkIGJ5IFNWR28gLS0+Cjxzdmcgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiCiAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjQwMCIgaGVpZQiIGhlaWdodD0iMTcwIiBzdHlsZT0iZmlsbDpibGFjayIgLz4KPHJlY3QgeD0iMzE4IiB5PSIyMCIgd2lkdGg9IjYiIGhlaWdodD0iMTcwIiBzdHlsZT0iZmlsbDpibGFjayIgLz4KPHJlY3QgeD0iMzI2IiB5PSIyMCIgd2lkdGg9IjIiIGhlaWdodD0iMTcwIiBzdHlsZT0iZmlsbDpibGFjayIgLz4KPHJlY3QgeD0iMzMwIiB5PSIyMCIgd2lkdGg9IjQiIGhlaWdodD0iMTcwIiBzdHlsZT0iZmlsbDpibGFjayIgLz4KPHJlY3QgeD0iMjAiIHk9IjIwMCIgd2lkdGg9IjM1MCIgaGVpZ2h0PSI5MCIgc3R5bGU9ImZpbGw6YmxhY2siIC8+Cjx0ZXh0IHg9IjMwIiB5PSIyNDAiIHN0eWxlPSJmaWxsOndoaXRlO2ZvbnQtc2l6ZTozMHB0O3RleHQtYW5jaG9yOnN0YXJ0IiA+MjMxNjQ4PC90ZXh0Pgo8dGV4dCB4PSIzNTAiIHk9IjI3MCIgc3R5bGU9ImZpbGw6d2hpdGU7Zm9udC1zaXplOjUwcHQ7dGV4dC1hbmNob3I6ZW5kIiA+OTc1MzwvdGV4dD4KPC9zdmc+Cg==', description: 'Полное представление стикера в заданном формате. (кодировка base64)' })
  @Column({ type: DataType.TEXT })
  file: string;
} 

