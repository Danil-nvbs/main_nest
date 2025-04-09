import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { WbFbsOrder } from './fbs-orders.model';

@Table({ tableName: 'wb_fbs_supplies', timestamps: false })
export class WbFbsSupply extends Model {
  @ApiProperty({ example: 'WB-GI-1234567', description: 'ID поставки' })
  @Column({ type: DataType.STRING, primaryKey: true, allowNull: false })
  id: string;

  @ApiProperty({ example: true, description: 'Флаг закрытия поставки' })
  @Column({ type: DataType.BOOLEAN })
  done: boolean;

  @ApiProperty({ example: '2022-05-04T07:56:29Z', description: 'Дата создания поставки (RFC3339)' })
  @Column({ type: DataType.DATE })
  createdAt: string;

  @ApiProperty({ example: '2022-05-04T07:56:29Z', description: 'Дата закрытия поставки (RFC3339)' })
  @Column({ type: DataType.DATE })
  closedAt: string;

  @ApiProperty({ example: '2022-05-04T07:56:29Z', description: 'Дата скана поставки (RFC3339)' })
  @Column({ type: DataType.DATE})
  scanDt: string;

  @ApiProperty({ example: 'Тестовая поставка', description: 'Наименование поставки' })
  @Column({ type: DataType.STRING })
  name: string;

  @ApiProperty({ description: 'Тип поставки', enum: [0, 1, 2, 3] })
  @Column({ type: DataType.INTEGER })
  cargoType: number;

  @ApiProperty({ description: 'Тип магазина', enum: ['PK', 'IP'] })
  @Column({ type: DataType.STRING })
  type: string;

  @HasMany(() => WbFbsOrder)
  orders: WbFbsOrder[];
} 

