import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript"

interface WBDischargeLogsCreationAttrs {
    nmID: string;
    transaction_id: string;
    startDate: Date;
    column: string;
    prev_value: string;
    next_value: string;
    type: string;
}

@Table({
    tableName: 'wb_discharge_logs',
    timestamps: true,
})

export class WbDischargeLogs extends Model<WbDischargeLogs, WBDischargeLogsCreationAttrs> {
    @ApiProperty({ example: '1', description: 'Идентификатор' })
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false })
    id: number;

    @ApiProperty({ example: 'c4bca3b0-43e2-451c-8aed-c9cf8c120ff7', description: 'Идентификатор транзакции (записи)' })
    @Column({ type: DataType.TEXT, allowNull: false })
    transaction_id: string;

    @ApiProperty({ example: '1211123', description: 'Артикул ВБ' })
    @Column({ type: DataType.TEXT, allowNull: false })
    nmID: string;

    @ApiProperty({ example: '2025-02-02', description: 'Автор записи' })
    @Column({ type: DataType.DATE, allowNull: false })
    startDate: Date;

    @ApiProperty({ example: 'article', description: 'Измененный столбец' })
    @Column({ type: DataType.TEXT, allowNull: false })
    column: string;

    @ApiProperty({ example: 'NULL', description: 'Предыдущее значение' })
    @Column({ type: DataType.TEXT, allowNull: true })
    prev_value: string;

    @ApiProperty({ example: '1211123', description: 'Новое значение' })
    @Column({ type: DataType.TEXT, allowNull: true })
    next_value: string;

    @ApiProperty({ example: 'create', description: 'Тип изменения' })
    @Column({ type: DataType.TEXT, allowNull: false })
    type: string;
}