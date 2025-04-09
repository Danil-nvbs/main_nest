import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasOne, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { WbFbsOrder } from './fbs-orders.model';

@Table({ tableName: 'wb_fbs_statuses', timestamps: false })
export class WbFbsStatuses extends Model {
  @ApiProperty({ example: 5346346, description: 'ID сборочного задания' })
  @ForeignKey(() => WbFbsOrder)
  @Column({ type: DataType.BIGINT, primaryKey: true, allowNull: false })
  id: number;

  @BelongsTo(() => WbFbsOrder)
  order: WbFbsOrder;

  @ApiProperty({ description: 'Статус сборочного задания продавца (устанавливается продавцом)', enum: ['new', 'confirm', 'complete', 'cancel'] })
  @Column({ type: DataType.STRING, allowNull: false })
  supplierStatus: string;

  @ApiProperty({ description: 'Статус сборочного задания в системе WB', enum: ['waiting', 'sorted', 'sold', 'canceled', 'canceled_by_client'] })
  @Column({ type: DataType.STRING, allowNull: false })
  wbStatus: string;
} 

