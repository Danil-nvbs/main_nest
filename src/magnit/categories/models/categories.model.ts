import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IMagnitCategories {
    category_string_path: string;
    category_id: number;
    category_title: string;
    
}

@Table({
    tableName: 'magnit_categories',
    timestamps: false,
})
export class MagnitCategories extends Model<MagnitCategories, IMagnitCategories> {

    @ApiProperty({
        example: 1,
        description: 'category_id',
    })
    @Column({ type: DataType.INTEGER, primaryKey: true, allowNull: false })
    category_id: number;

    @ApiProperty({
        example: "Бытовая химия и личная гигиена->Средства для посудомоечных машин->Гели и жидкости",
        description: 'category_string_path',
    })
    @Column({ type: DataType.TEXT,  allowNull: false })
    category_string_path: string;

    @ApiProperty({
        example:  "Гели и жидкости",
        description: 'category_title',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    category_title: string;
}
