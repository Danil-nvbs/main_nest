import { ApiProperty } from '@nestjs/swagger';

export class OzonApiOrdersDto {
    @ApiProperty({ description: "Дополнительная информация", example: "[{key1: value1}, {key2: value2}]" })
    additional_data: {
        key: string;
        value: string;
    }[]

    @ApiProperty({ description: "Идентификатор причины отмены отправления", example: 123})
    cancel_reason_id: number;
    
    @ApiProperty({ description: "Дата и время создания отправления", example: '2021-09-01T00:23:45.607000Z' })
    created_at: string;

    @ApiProperty({ description: "Дата и время начала обработки отправления", example: '2021-09-01T00:25:30.120000Z' })
    in_process_at: number;

    @ApiProperty({ description: "Идентификатор заказа, к которому относится отправление", example: 354680487 })
    order_id: number;

    @ApiProperty({ description: "Номер заказа, к которому относится отправление", example: '16965409-0014' })
    order_number: string;
    
    @ApiProperty({ description: "Номер отправления", example: '16965409-0014-1' })
    posting_number: string;
    
    @ApiProperty({ description: "Статус отправления", example: 'delivered' })
    status: string;

    @ApiProperty({ description: "Список товаров в отправлении"})
    products: {
        digital_codes: string[]
        name: string
        offer_id: string
        currency_code: string
        price: string
        quantity: number
        sku: number
    }[];

    @ApiProperty({ description: 'Финансовая информация'})
    financial_data: {
        products: [],
        posting_services: any,
        cluster_from: string,
        cluster_to: string,
    }
}

export class DcApiOrdersDto {
    @ApiProperty({ description: "Магазин (PK, FEYT)", example: 'PK' })
    type: string;

    @ApiProperty({ description: "Модель (FBS/FBO), если не передан - выгружаются все", example: "FBO" })
    model?: string;

    @ApiProperty({ description: `Выгружать только отправления в статусе "Delivered"`, example: true })
    onlySales?: boolean;

    @ApiProperty({ description: "Дата от которой выгружать отправления", example: "2025-01-20" })
    dateFrom?: string;

    @ApiProperty({ description: "Дата до которой выгружать отправления", example: "2025-02-20" })
    dateTo?: string;

    @ApiProperty({ description: "Дней отчёта включая вчерашний", example: 30 })
    days?: number;

    @ApiProperty({ description: "Свести по регионам? Default=false", example: true })
    agregateByRegion?: boolean;

}