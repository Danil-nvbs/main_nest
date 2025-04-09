import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript"

interface BigBaseCreationAttrs {
    article: string;
}

@Table({
    tableName: 'bigbase',
    timestamps: false,
    indexes: [
    {
        unique: true,
        fields: ['article'],
    },
]})

export class Product extends Model<Product, BigBaseCreationAttrs> {
    @ApiProperty({ example: '123123', description: 'Идентификатор товара в БД (автогенерируемый)' })
    @Column({ type: DataType.INTEGER, autoIncrement: true, allowNull: false, })
    id: string;
    
    @ApiProperty({ example: 'samson641902', description: 'Артикул товара (уникальный)' })
    @Column({ type: DataType.TEXT, primaryKey: true, allowNull: false })
    article: string;

    @ApiProperty({ example: '10', description: 'ПАК, шт' })
    @Column({ type: DataType.SMALLINT })
    pack: number;

    @ApiProperty({ example: 'Mellingward', description: 'Брэнд товара' })
    @Column({ type: DataType.TEXT })
    brand: string;

    @ApiProperty({ example: 'Кукла Снегурочка', description: 'Наименование' })
    @Column({ type: DataType.TEXT })
    name: string;

    @ApiProperty({ example: 'HAPPY VALLEY Кукла-снегурочка "Зимняя царевна" 4240004', description: 'Название из УПД' })
    @Column({ type: DataType.TEXT })
    invoice_name: string;

    @ApiProperty({ example: 'Китай', description: 'Краткое наименование' })
    @Column({ type: DataType.TEXT })
    short_name: string;

    @ApiProperty({ example: 'Чайник эмалированный 3,5 л Базилик 60075224...', description: 'Описание товара' })
    @Column({ type: DataType.TEXT })
    description: string;

    @ApiProperty({ example: 'ООО Комус', description: 'Поставщик товара' })
    @Column({ type: DataType.TEXT })
    supplier: string;

    @ApiProperty({ example: '1310', description: 'Вес 1 единицы товара (г)' })
    @Column({ type: DataType.REAL })
    weight: number;

    @ApiProperty({ example: '25', description: 'Высота 1 единицы товара (см)' })
    @Column({ type: DataType.REAL })
    height: number;

    @ApiProperty({ example: '41', description: 'Длина 1 единицы товара (см)' })
    @Column({ type: DataType.REAL })
    length: number;

    @ApiProperty({ example: '41', description: 'Ширина 1 единицы товара (см)' })
    @Column({ type: DataType.REAL })
    width: number;

    @ApiProperty({ example: '25', description: 'Высота упаковки товара (см)' })
    @Column({ type: DataType.REAL })
    pack_height: number;

    @ApiProperty({ example: '41', description: 'Длина упаковки товара (см)' })
    @Column({ type: DataType.REAL })
    pack_length: number;

    @ApiProperty({ example: '41', description: 'Ширина упаковки товара (см)' })
    @Column({ type: DataType.REAL })
    pack_width: number;

    @ApiProperty({ example: '12', description: 'Годен месяцев' })
    @Column({ type: DataType.TEXT })
    usable_time: string;

    @ApiProperty({ example: 'ТР ТС 008/2011', description: 'Гост' })
    @Column({ type: DataType.TEXT })
    gost: string;

    @ApiProperty({ example: '9503002100', description: 'Код ТНВЭД' })
    @Column({ type: DataType.TEXT })
    tnved: string;

    @ApiProperty({ example: 'пластик, текстиль', description: 'Состав' })
    @Column({ type: DataType.TEXT })
    composition: string;

    @ApiProperty({ example: 'Shantou Chenghai Zhencheng plastic toys factory', description: 'Производитель' })
    @Column({ type: DataType.TEXT })
    manufacturer: string;

    @ApiProperty({ example: 'ЕАЭС KG 417/КЦА.ОСП.025.CN.02.04803', description: 'Сертификат' })
    @Column({ type: DataType.TEXT })
    certificate: string;

    @ApiProperty({ example: '0.1', description: 'Исходящий НДС' })
    @Column({ type: DataType.REAL })
    vat: number;

    @ApiProperty({ example: 'Китай', description: 'Страна происхождения' })
    @Column({ type: DataType.TEXT })
    county: string;

    @ApiProperty({ example: 'Happy Valley', description: 'Торговая марка' })
    @Column({ type: DataType.TEXT })
    trademark: string;

    @ApiProperty({ example: 'Шантоу Ченгхай Женхенг пластик тойс фактори', description: 'Фирма производитель' })
    @Column({ type: DataType.TEXT })
    producer: string;

    @ApiProperty({ example: 'ЕАС', description: 'Форма сертификации' })
    @Column({ type: DataType.TEXT })
    certification_form: string;

    @ApiProperty({ example: '2038658913012', description: 'Штрихкод' })
    @Column({ type: DataType.TEXT })
    barcode: string;

    @ApiProperty({ example: '6900042400049', description: 'Штрихкод Сима' })
    @Column({ type: DataType.TEXT })
    barcode_sima: string;

    @ApiProperty({ example: '2013672044546, 2013672044546, 2900042400043, 6900042400049', description: 'Штрихкод поставщика' })
    @Column({ type: DataType.TEXT })
    barcode_supplier: string;

    @ApiProperty({ example: '2900042400043', description: 'ШК поставщика NEW' })
    @Column({ type: DataType.TEXT })
    barcode_new: string;

    @ApiProperty({ example: '2013672044546', description: 'ШК поставщика EAN13' })
    @Column({ type: DataType.TEXT })
    barcode_ean1: string;

    @ApiProperty({ example: '2900042400043', description: 'ШК поставщика EAN13-2' })
    @Column({ type: DataType.TEXT })
    barcode_ean2: string;

    @ApiProperty({ example: '6900042400049', description: 'ШК поставщика EAN13-3' })
    @Column({ type: DataType.TEXT })
    barcode_ean3: string;

    @ApiProperty({ example: '6900043519627', description: 'ШК поставщика EAN13-4' })
    @Column({ type: DataType.TEXT })
    barcode_ean4: string;

    @ApiProperty({ example: '6901597190003', description: 'ШК поставщика EAN13-5' })
    @Column({ type: DataType.TEXT })
    barcode_ean5: string;

    @ApiProperty({ example: '5907006760356', description: 'ШК поставщика EAN13-6' })
    @Column({ type: DataType.TEXT })
    barcode_ean6: string;

    @ApiProperty({ example: '6900016394022', description: 'ШК поставщика EAN13-7' })
    @Column({ type: DataType.TEXT })
    barcode_ean7: string;

    @ApiProperty({ example: 'Китай, Shantou city, Chenghai dsitrict, Ling Xia, Zhen Jianyang village, Haimen industrial zone, China (Китай)', description: 'Адрес производителя' })
    @Column({ type: DataType.TEXT })
    producer_address: string;

    @ApiProperty({ example: 'Состав: пластик,текстиль', description: 'Комментарий' })
    @Column({ type: DataType.TEXT })
    comment: string;

    @ApiProperty({ example: '10702070/240723/3301780', description: 'Номер ГТД' })
    @Column({ type: DataType.TEXT })
    gtd_number: string;

    @ApiProperty({ example: '02.04803 выдан: KG 417/КЦА.ОСП.025 с 29.10.2021 по 28.10.2026', description: 'Сертификат выдан' })
    @Column({ type: DataType.TEXT })
    certificate_issued_by: string;

    @ApiProperty({ example: '24', description: 'Срок годности' })
    @Column({ type: DataType.TEXT })
    lifetime: string;

    @ApiProperty({ example: 'Импортёр: ООО «Пилат», РФ, Свердловская обл...', description: 'Импортёр и уполномоченное лицо' })
    @Column({ type: DataType.TEXT })
    importer: string;

    @ApiProperty({ example: 'шт', description: 'Единица' })
    @Column({ type: DataType.TEXT })
    unit: string;

    @ApiProperty({ example: 'шт', description: 'Единица измерения' })
    @Column({ type: DataType.TEXT })
    unit2: string;

    @ApiProperty({ example: '796', description: 'Код' })
    @Column({ type: DataType.TEXT })
    code: string;

    @ApiProperty({ example: '156', description: 'Цифровой код' })
    @Column({ type: DataType.TEXT })
    numeric_code: string;

    @ApiProperty({ example: '299.25', description: 'Цена из УПД' })
    @Column({ type: DataType.REAL })
    cost_invoice: number;

    @ApiProperty({ example: '317.21', description: 'СЦК ВБ' })
    @Column({ type: DataType.REAL })
    cost_wb_stock_1c: number;

    @ApiProperty({ example: '285', description: 'Цена из 1С' })
    @Column({ type: DataType.REAL })
    cost_full_1c: number;

    @ApiProperty({ example: '213.53', description: 'Средняя цена из 1С' })
    @Column({ type: DataType.REAL })
    average_cost_full_1c: number;

    @ApiProperty({ example: 'ЧТ/505', description: 'Артикул поставщика' })
    @Column({ type: DataType.TEXT })
    supplier_article: string;

    @ApiProperty({ example: '350*250*250', description: 'Размер короба ДхШхВ (м)' })
    @Column({ type: DataType.TEXT })
    box_dimensions: string;

    @ApiProperty({ example: '4,996', description: 'Вес бокса (кг)' })
    @Column({ type: DataType.TEXT })
    box_weight: string;

    @ApiProperty({ example: 'HAPPY VALLEY Кукла-снегурочка "Зимняя царевна" 4240004', description: 'Наименование сайт' })
    @Column({ type: DataType.TEXT })
    site_name: string;

    @ApiProperty({ example: 'вода очищенная; стабилизатор; эфирные масла цитронеллы, гвоздики, бархатцев, лаванды; консервант', description: 'Состав на этикетке' })
    @Column({ type: DataType.TEXT })
    label_composition: string;

    @ApiProperty({ example: 'да', description: 'Требуется обмер от Комуса' })
    @Column({ type: DataType.TEXT })
    need_measure_komus: string;

    @ApiProperty({ example: '2037028481571', description: 'ШК Старый' })
    @Column({ type: DataType.TEXT })
    barcode_old: string;

    @ApiProperty({ example: '537', description: 'Цена из API Симы' })
    @Column({ type: DataType.REAL })
    sima_wholesale_price: number;

    @ApiProperty({ example: 'Нет', description: 'Честный знак' })
    @Column({ type: DataType.TEXT })
    kiz_znak: string;

    @ApiProperty({ example: 'Да', description: 'Меркурий' })
    @Column({ type: DataType.TEXT })
    kiz_mercury: string;

    @ApiProperty({ example: 'Нет', description: 'Микс Цвет' })
    @Column({ type: DataType.TEXT })
    mix_color: string;

    @ApiProperty({ example: 'да', description: 'Признак СТМ' })
    @Column({ type: DataType.TEXT })
    isStm: string;

    @ApiProperty({ example: '', description: 'Упаковка' })
    @Column({ type: DataType.TEXT })
    package: string;

    @ApiProperty({ example: 'средство для мытья натяжных потолков, антипыль для уборки', description: 'Ключевые слова' })
    @Column({ type: DataType.TEXT })
    keywords: string;

    @ApiProperty({ example: '0.2', description: 'Входящий НДС' })
    @Column({ type: DataType.TEXT })
    incoming_vat: string;

    @ApiProperty({ example: 'описание SEO', description: 'описание SEO' })
    @Column({ type: DataType.TEXT })
    seo_description: string;

    @ApiProperty({ example: '156-x-', description: 'Размер стикера' })
    @Column({ type: DataType.TEXT })
    sticker_size: string;

    @ApiProperty({ example: '156', description: 'moq' })
    @Column({ type: DataType.INTEGER })
    moq: number;

    @ApiProperty({ example: '???', description: 'Сезонность товара' })
    @Column({ type: DataType.TEXT })
    seasonal: string;
}

interface BigBaseDictCreationAttrs {
    rusname: string;
    engname: string;
    type: string;
}

@Table({
    tableName: 'bigbase_dict',
    timestamps: false,
})

export class BigBaseDict extends Model<BigBaseDict, BigBaseDictCreationAttrs> {
    @ApiProperty({ example: '1', description: 'Идентификатор' })
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false })
    id: number;

    @ApiProperty({ example: 'ПАК, шт', description: 'Столбец на русском языке' })
    @Column({ type: DataType.TEXT, unique: true, allowNull: false })
    rusname: string;

    @ApiProperty({ example: 'pack', description: 'Столбец на английском языке' })
    @Column({ type: DataType.TEXT, unique: true, allowNull: false })
    engname: string;

    @ApiProperty({ example: 'text', description: 'Тип' })
    @Column({ type: DataType.TEXT, allowNull: false })
    type: string;

}

interface BigBaseLogsCreationAttrs {
    article: string;
    transaction_id: string;
    author: string;
    column: string;
    prev_value: string;
    next_value: string;
    type: string;
}

@Table({
    tableName: 'bigbase_logs',
    timestamps: true,
})

export class BigBaseLogs extends Model<BigBaseLogs, BigBaseLogsCreationAttrs> {
    @ApiProperty({ example: '1', description: 'Идентификатор' })
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false })
    id: number;

    @ApiProperty({ example: 'c4bca3b0-43e2-451c-8aed-c9cf8c120ff7', description: 'Идентификатор транзакции (записи)' })
    @Column({ type: DataType.TEXT, allowNull: false })
    transaction_id: string;

    @ApiProperty({ example: '1211123', description: 'Артикул товара' })
    @Column({ type: DataType.TEXT, allowNull: false })
    article: string;

    @ApiProperty({ example: 'john.doe.04@gmail.com', description: 'Автор записи' })
    @Column({ type: DataType.TEXT, allowNull: false })
    author: string;

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