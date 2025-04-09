import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IWbDischargeBaseCreationAttrs {
    nmID: number;
}

@Table({
    tableName: 'wb_discharge',
    timestamps: false,
})
export class WbDischarge extends Model<WbDischarge, IWbDischargeBaseCreationAttrs> {
    @ApiProperty({
        example: 1234567,
        description: 'nmID',
    })
    @Column({ type: DataType.INTEGER, primaryKey: true, allowNull: false })
    nmID: number;

    @ApiProperty({
        example: 123654789,
        description: 'ImtID',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    imtID: number;

    @ApiProperty({
        example: '01bda0b1-5c0b-736c-b2be-d0a6543e9be',
        description: 'nmUUID',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    nmUUID: string;

    @ApiProperty({
        example: '9874563216541',
        description: 'barcode',
    })
    @Column({ type: DataType.TEXT, allowNull: false })
    barcode: string;

    @ApiProperty({
        example: 7771,
        description: 'subjectID',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    subjectID: number;

    @ApiProperty({
        example: 'AKF системы',
        description: 'subjectName',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    subjectName: string;

    @ApiProperty({
        example: 'wb7f6mumjr1',
        description: 'vendorCode',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    vendorCode: string;

    @ApiProperty({
        example: '',
        description: 'brand',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    brand: string;

    @ApiProperty({
        example: '',
        description: 'title',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    title: string;

    @ApiProperty({
        example: '',
        description: 'description',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @ApiProperty({
        example: '',
        description: 'photos',
    })
    @Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
    photos: {
        big: string;
        c246x328: string;
        c516x688: string;
        square: string;
        tm: string;
    }[];

    @ApiProperty({
        example: '',
        description: 'video',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    video: string;

    @ApiProperty({
        example: '',
        description: 'needKiz',
    })
    @Column({ type: DataType.BOOLEAN, allowNull: true })
    needKiz: boolean;

    @ApiProperty({
        example: '',
        description: 'dimensions',
    })
    @Column({ type: DataType.JSONB, allowNull: true })
    dimensions: {
        length: number;
        width: number;
        height: number;
        isValid: boolean;
    };

    @ApiProperty({
        example: '',
        description: 'characteristics',
    })
    @Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
    characteristics: {
        id: number;
        name: string;
        value: string[];
    }[];

    @ApiProperty({
        example: '',
        description: 'sizes',
    })
    @Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
    sizes: {
        chrtID: number;
        techSize: string;
        skus: string[];
    }[];

    @ApiProperty({
        example: '',
        description: 'tags',
    })
    @Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
    tags: {
        id: number;
        name: string;
        color: string;
    }[];

    @ApiProperty({
        example: '',
        description: 'createdAt',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    createdAt: string;

    @ApiProperty({
        example: '',
        description: 'createdAt',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    updatedAt: string;

    @ApiProperty({
        example: '',
        description: 'active',
    })
    @Column({ type: DataType.BOOLEAN, allowNull: true })
    active: boolean;

    @ApiProperty({
        example: 'PK',
        description: 'type',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    type: string;
}
