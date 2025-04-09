import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasOne, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { WbFbsOrder } from 'src/wildberries/fbs-orders/models/fbs-orders.model';

@Table({ tableName: 'printed_wb_fbs' })
export class WbFbsPrinted extends Model {
  @ApiProperty({ example: 5346346, description: 'ID сборочного задания' })
  @ForeignKey(() => WbFbsOrder)
  @Column({ type: DataType.BIGINT, primaryKey: true, allowNull: false })
  id: number;

  @BelongsTo(() => WbFbsOrder)
  order: WbFbsOrder;

  @ApiProperty({ description: 'КИЗ товара, отсканированного в это задание' })
  @Column({ type: DataType.STRING })
  kiz: string;

  @ApiProperty({ description: 'Кто отсканировал товар' })
  @Column({ type: DataType.STRING, allowNull: false })
  author: string;

  @ApiProperty({ description: 'Имя сканера, с которого был отсканирован товар' })
  @Column({ type: DataType.STRING, allowNull: false })
  scanner: string;

  @ApiProperty({ description: 'Имя принтера, на котором была напечатана этикетка' })
  @Column({ type: DataType.STRING, allowNull: false })
  printer: string;
} 

