import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IMagnitDischargeBaseCreationAttrs {
    article: string;
    seller_sku_id: string;
    barcode: string;
    category_id: number;
    certificate: string;
    composition: string;
    currency_code: string;
    custom_characteristic_values_skus: { characteristic_title: string; characteristic_value: string }[];
    length: number;
    description: string;
    height: number;
    instruction: string;
    is_active: boolean;
    is_archive: boolean;
    is_blocked: boolean;
    is_no_stock: boolean;
    okpd2: string;
    old_price: number;
    photo_360: { url: string };
    price: number;
    product_id: number;
    product_images: { url: string }[];
    size_chart: string;
    sku_characteristic_list: { characteristic_title: string; characteristic_value: string }[];
    sku_id: number;
    title: string;
    vat: string;
    video: { url: string };
    weight: number;
    width: number;
    active: boolean;
    type: string
}

@Table({
    tableName: 'magnit_discharge',
    timestamps: false,
})
export class MagnitDischarge extends Model<MagnitDischarge, IMagnitDischargeBaseCreationAttrs> {

    @ApiProperty({
        example: 1,
        description: 'sku_id',
    })
    @Column({ type: DataType.INTEGER, primaryKey: true, allowNull: false })
    sku_id: number;

    @ApiProperty({
        example: "1234567",
        description: 'barcode',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    barcode: string;

    @ApiProperty({
        example: 123,
        description: 'category_id',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    category_id: number;

    @ApiProperty({
        example: 'Certificate example',
        description: 'certificate',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    certificate: string;

    @ApiProperty({
        example: 'Composition example',
        description: 'composition',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    composition: string;

    @ApiProperty({
        example: 'RUB',
        description: 'currency_code',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    currency_code: string;

    @ApiProperty({
        example: [{ characteristic_title: 'Title', characteristic_value: 'Value' }],
        description: 'custom_characteristic_values_skus',
    })
    @Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
    custom_characteristic_values_skus: { characteristic_title: string; characteristic_value: string }[];

    @ApiProperty({
        example: 10,
        description: 'length',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    length: number;

    @ApiProperty({
        example: 'Product description',
        description: 'description',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

    @ApiProperty({
        example: 20,
        description: 'height',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    height: number;

    @ApiProperty({
        example: 'Instruction example',
        description: 'instruction',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    instruction: string;

    @ApiProperty({
        example: true,
        description: 'is_active',
    })
    @Column({ type: DataType.BOOLEAN, allowNull: true })
    is_active: boolean;

    @ApiProperty({
        example: true,
        description: 'is_archive',
    })
    @Column({ type: DataType.BOOLEAN, allowNull: true })
    is_archive: boolean;

    @ApiProperty({
        example: true,
        description: 'is_blocked',
    })
    @Column({ type: DataType.BOOLEAN, allowNull: true })
    is_blocked: boolean;

    @ApiProperty({
        example: true,
        description: 'is_no_stock',
    })
    @Column({ type: DataType.BOOLEAN, allowNull: true })
    is_no_stock: boolean;

    @ApiProperty({
        example: 'OKPD2 code',
        description: 'okpd2',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    okpd2: string;

    @ApiProperty({
        example: 100,
        description: 'old_price',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    old_price: number;

    @ApiProperty({
        example: { url: 'http://example.com/photo_360.jpg' },
        description: 'photo_360',
    })
    @Column({ type: DataType.JSONB, allowNull: true })
    photo_360: { url: string };

    @ApiProperty({
        example: 150,
        description: 'price',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    price: number;

    @ApiProperty({
        example: 1,
        description: 'product_id',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    product_id: number;

    @ApiProperty({
        example: [{ url: 'http://example.com/image.jpg' }],
        description: 'product_images',
    })
    @Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
    product_images: { url: string }[];

    @ApiProperty({
        example: 'article',
        description: 'article',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    article: string;

    @ApiProperty({
        example: 'Size chart example',
        description: 'size_chart',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    size_chart: string;

    @ApiProperty({
        example: [{ characteristic_title: 'Title', characteristic_value: 'Value' }],
        description: 'sku_characteristic_list',
    })
    @Column({ type: DataType.ARRAY(DataType.JSONB), allowNull: true })
    sku_characteristic_list: { characteristic_title: string; characteristic_value: string }[];

    @ApiProperty({
        example: 'Product title',
        description: 'title',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    title: string;

    @ApiProperty({
        example: 'VAT code',
        description: 'vat',
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    vat: string;

    @ApiProperty({
        example: { url: 'http://example.com/video.mp4' },
        description: 'video',
    })
    @Column({ type: DataType.JSONB, allowNull: true })
    video: { url: string };

    @ApiProperty({
        example: 1000,
        description: 'weight',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    weight: number;

    @ApiProperty({
        example: 50,
        description: 'width',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    width: number;

    @ApiProperty({
        example: false,
        description: 'active',
    })
    @Column({ type: DataType.BOOLEAN, allowNull: true })
    active: boolean;

    @ApiProperty({
        example: 'PK',
        description: 'type',
    })
    @Column({ type: DataType.STRING, allowNull: true })
    type: string;
}
