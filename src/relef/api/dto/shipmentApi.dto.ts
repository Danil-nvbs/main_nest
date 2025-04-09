import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsNumber, IsBoolean, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Bookmark {
    @ApiProperty({ description: "Идентификатор закладки.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    guid: string;
}

class DeliveryCompanyInfo {
    @ApiProperty({ description: "Идентификатор компании доставки.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    guid: string;

    @ApiProperty({ description: "Название компании доставки.", example: "string" })
    title: string;
}

class Status {
    @ApiProperty({ description: "Код статуса.", example: "string" })
    code: string;

    @ApiProperty({ description: "Название статуса.", example: "string" })
    title: string;
}

class Forwarder {
    @ApiProperty({ description: "Название экспедитора.", example: "string" })
    title: string;

    @ApiProperty({ description: "Телефон экспедитора.", example: "string" })
    phone: string;
}

class Service {
    @ApiProperty({ description: "Идентификатор услуги.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    guid: string;

    @ApiProperty({ description: "Количество услуг.", example: 0 })
    quantity: number;

    @ApiProperty({ description: "Цена услуги.", example: 0 })
    price: number;

    @ApiProperty({ description: "Налог на услугу.", example: 0 })
    tax: number;
}

class Product {
    @ApiProperty({ description: "Идентификатор продукта.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    guid: string;

    @ApiProperty({ description: "Название продукта.", example: "string" })
    name: string;

    @ApiProperty({ description: "Код 1С продукта.", example: "string" })
    code1C: string;

    @ApiProperty({ description: "Заголовок продукта.", example: "string" })
    title: string;

    @ApiProperty({ description: "Артикул продукта.", example: "string" })
    article: string;

    @ApiProperty({ description: "Цена продукта.", example: 0 })
    price: number;

    @ApiProperty({ description: "Дата выставления счета.", example: "2025-03-04T10:43:05.650Z" })
    bill: string;

    @ApiProperty({ description: "Количество продуктов.", example: 0 })
    quantity: number;

    @ApiProperty({ description: "Налог на продукт.", example: 0 })
    tax: number;

    @ApiProperty({ description: "Вес продукта.", example: 0 })
    weight: number;

    @ApiProperty({ description: "Объем продукта.", example: 0 })
    volume: number;
}

export class ShipmentApiDto {
    @ApiProperty({ description: "Идентификатор отправления.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    guid: string;

    @ApiProperty({ description: "Идентификатор контрагента.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    contractor: string;

    @ApiProperty({ description: "Номер документа.", example: "string" })
    documentNumber: string;

    @ApiProperty({ description: "Номер обновления.", example: "string" })
    updNumber: string;

    @ApiProperty({ description: "Наличие бонуса.", example: true })
    bonus: boolean;

    @ApiProperty({ description: "Информация о закладке.", type: Bookmark })
    @ValidateNested()
    @Type(() => Bookmark)
    bookmark: Bookmark;

    @ApiProperty({ description: "Информация о компании доставки.", type: DeliveryCompanyInfo })
    @ValidateNested()
    @Type(() => DeliveryCompanyInfo)
    deliveryCompanyInfo: DeliveryCompanyInfo;

    @ApiProperty({ description: "Идентификатор магазина.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    store: string;

    @ApiProperty({ description: "Тип доставки.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    deliveryType: string;

    @ApiProperty({ description: "Адрес доставки.", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
    deliveryAddress: string;

    @ApiProperty({ description: "Дата доставки.", example: "2025-03-04T10:43:05.650Z" })
    deliveryDate: string;

    @ApiProperty({ description: "Дата доставки.", example: "2025-03-04T10:43:05.650Z" })
    dateDelivery: string;

    @ApiProperty({ description: "Компания доставки.", example: "string" })
    deliveryCompany: string;

    @ApiProperty({ description: "Статус отправления.", type: Status })
    @ValidateNested()
    @Type(() => Status)
    status: Status;

    @ApiProperty({ description: "Количество товаров.", example: 0 })
    quantity: number;

    @ApiProperty({ description: "Сумма заказа.", example: 0 })
    sum: number;

    @ApiProperty({ description: "Дата создания.", example: "2025-03-04T10:43:05.650Z" })
    dateCreate: string;

    @ApiProperty({ description: "Дата обновления.", example: "2025-03-04T10:43:05.650Z" })
    dateUpdate: string;

    @ApiProperty({ description: "Информация об экспедиторе.", type: Forwarder })
    @ValidateNested()
    @Type(() => Forwarder)
    forwarder: Forwarder;

    @ApiProperty({ description: "Список услуг.", type: [Service] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Service)
    services: Service[];

    @ApiProperty({ description: "Список продуктов.", type: [Product] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Product)
    products: Product[];
}