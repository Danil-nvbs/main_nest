import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
    @ApiProperty({ description: "Артикул товара (уникальный)", nullable: false })
    article: string;
    
    @ApiProperty({ description: "ПАК, шт", nullable: true })
    readonly pack?: number;
    
    @ApiProperty({ description: "Брэнд товара", nullable: true })
    readonly brand?: string;
    
    @ApiProperty({ description: "Наименование", nullable: true })
    readonly name?: string;
    
    @ApiProperty({ description: "Название из УПД", nullable: true })
    readonly invoice_name?: string;
    
    @ApiProperty({ description: "Краткое наименование", nullable: true })
    readonly short_name?: string;
    
    @ApiProperty({ description: "Описание товара", nullable: true })
    readonly description?: string;
    
    @ApiProperty({ description: "Поставщик товара", nullable: true })
    readonly supplier?: string;
    
    @ApiProperty({ description: "Вес 1 единицы товара (г)", nullable: true })
    readonly weight?: number;
    
    @ApiProperty({ description: "Высота 1 единицы товара (см)", nullable: true })
    readonly height?: number;
    
    @ApiProperty({ description: "Длина 1 единицы товара (см)", nullable: true })
    readonly length?: number;
    
    @ApiProperty({ description: "Ширина 1 единицы товара (см)", nullable: true })
    readonly width?: number;
    
    @ApiProperty({ description: "Высота упаковки товара (см)", nullable: true })
    readonly pack_height?: number;
    
    @ApiProperty({ description: "Длина упаковки товара (см)", nullable: true })
    readonly pack_length?: number;
    
    @ApiProperty({ description: "Ширина упаковки товара (см)", nullable: true })
    readonly pack_width?: number;
    
    @ApiProperty({ description: "Годен месяцев", nullable: true })
    readonly usable_time?: string;
    
    @ApiProperty({ description: "Гост", nullable: true })
    readonly gost?: string;
    
    @ApiProperty({ description: "Код ТНВЭД", nullable: true })
    readonly tnved?: string;
    
    @ApiProperty({ description: "Состав", nullable: true })
    readonly composition?: string;
    
    @ApiProperty({ description: "Производитель", nullable: true })
    readonly manufacturer?: string;
    
    @ApiProperty({ description: "Сертификат", nullable: true })
    readonly certificate?: string;
    
    @ApiProperty({ description: "Исходящий НДС", nullable: true })
    readonly vat?: number;
    
    @ApiProperty({ description: "Страна происхождения", nullable: true })
    readonly county?: string;
    
    @ApiProperty({ description: "Торговая марка", nullable: true })
    readonly trademark?: string;
    
    @ApiProperty({ description: "Фирма производитель", nullable: true })
    readonly producer?: string;
    
    @ApiProperty({ description: "Форма сертификации", nullable: true })
    readonly certification_form?: string;
    
    @ApiProperty({ description: "Штрихкод", nullable: true })
    readonly barcode?: string;
    
    @ApiProperty({ description: "Штрихкод Сима", nullable: true })
    readonly barcode_sima?: string;
    
    @ApiProperty({ description: "Штрихкод поставщика", nullable: true })
    readonly barcode_supplier?: string;
    
    @ApiProperty({ description: "ШК поставщика NEW", nullable: true })
    readonly barcode_new?: string;
    
    @ApiProperty({ description: "ШК поставщика EAN13", nullable: true })
    readonly barcode_ean1?: string;
    
    @ApiProperty({ description: "ШК поставщика EAN13-2", nullable: true })
    readonly barcode_ean2?: string;
    
    @ApiProperty({ description: "ШК поставщика EAN13-3", nullable: true })
    readonly barcode_ean3?: string;
    
    @ApiProperty({ description: "ШК поставщика EAN13-4", nullable: true })
    readonly barcode_ean4?: string;
    
    @ApiProperty({ description: "ШК поставщика EAN13-5", nullable: true })
    readonly barcode_ean5?: string;
    
    @ApiProperty({ description: "ШК поставщика EAN13-6", nullable: true })
    readonly barcode_ean6?: string;
    
    @ApiProperty({ description: "ШК поставщика EAN13-7", nullable: true })
    readonly barcode_ean7?: string;
    
    @ApiProperty({ description: "Адрес производителя", nullable: true })
    readonly producer_address?: string;
    
    @ApiProperty({ description: "Комментарий", nullable: true })
    readonly comment?: string;
    
    @ApiProperty({ description: "Номер ГТД", nullable: true })
    readonly gtd_number?: string;
    
    @ApiProperty({ description: "Сертификат выдан", nullable: true })
    readonly certificate_issued_by?: string;
    
    @ApiProperty({ description: "Срок годности", nullable: true })
    readonly lifetime?: string;
    
    @ApiProperty({ description: "Импортёр и уполномоченное лицо", nullable: true })
    readonly importer?: string;
    
    @ApiProperty({ description: "Единица", nullable: true })
    readonly unit?: string;
    
    @ApiProperty({ description: "Единица измерения", nullable: true })
    readonly unit2?: string;
    
    @ApiProperty({ description: "Код", nullable: true })
    readonly code?: string;
    
    @ApiProperty({ description: "Цифровой код", nullable: true })
    readonly numeric_code?: string;
    
    @ApiProperty({ description: "Цена из УПД", nullable: true })
    readonly cost_invoice?: number;
    
    @ApiProperty({ description: "СЦК ВБ", nullable: true })
    readonly cost_wb_stock_1c?: number;
    
    @ApiProperty({ description: "Цена из 1С", nullable: true })
    readonly cost_full_1c?: number;

    @ApiProperty({ description: "Средняя цена из 1С", nullable: true })
    readonly average_cost_full_1c?: number;
    
    @ApiProperty({ description: "Артикул поставщика", nullable: true })
    readonly supplier_article?: string;
    
    @ApiProperty({ description: "Размер короба ДхШхВ (м)", nullable: true })
    readonly box_dimensions?: string;
    
    @ApiProperty({ description: "Вес бокса (кг)", nullable: true })
    readonly box_weight?: string;
    
    @ApiProperty({ description: "Наименование сайт", nullable: true })
    readonly site_name?: string;
    
    @ApiProperty({ description: "Состав на этикетке", nullable: true })
    readonly label_composition?: string;
    
    @ApiProperty({ description: "Требуется обмер от Комуса", nullable: true })
    readonly need_measure_komus?: string;
    
    @ApiProperty({ description: "ШК Старый", nullable: true })
    readonly barcode_old?: string;
    
    @ApiProperty({ description: "Цена из API Симы", nullable: true })
    readonly sima_wholesale_price?: number;
    
    @ApiProperty({ description: "Честный знак", nullable: true })
    readonly kiz_znak?: string;
    
    @ApiProperty({ description: "Меркурий", nullable: true })
    readonly kiz_mercury?: string;
    
    @ApiProperty({ description: "Микс Цвет", nullable: true })
    readonly mix_color?: string;
    
    @ApiProperty({ description: "Признак СТМ", nullable: true })
    readonly isStm?: string;
    
    @ApiProperty({ description: "Упаковка", nullable: true })
    readonly package?: string;
    
    @ApiProperty({ description: "Ключевые слова", nullable: true })
    readonly keywords?: string;
    
    @ApiProperty({ description: "Входящий НДС", nullable: true })
    readonly incoming_vat?: string;
    
    @ApiProperty({ description: 'описание SEO', nullable: true })
    readonly seo_description?: string;

    @ApiProperty({ description: 'Размер стикера', nullable: true })
    readonly sticker_size?: string;

    @ApiProperty({ description: 'moq', nullable: true })
    readonly moq?: number;
    
    @ApiProperty({ description: 'Сезонность товара', nullable: true })
    readonly seasonal?: string;
}
