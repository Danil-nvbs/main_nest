import { ApiProperty } from '@nestjs/swagger';

export class OrdersDto {
    @ApiProperty({ description: "Артикул", example: 41434767747 })
    id: bigint;

    @ApiProperty({ description: "Дата создания", example: '2025-02-17' })
    creationDate: object;

    @ApiProperty({ description: "Дата обновления статуса", example: '2025-02-18T05:47:34.074+03:00' })
    statusUpdateDate: string;

    @ApiProperty({ description: 'Текущий статус', example: 'PROCESSING' })
    status: string;

    @ApiProperty({ description: "ID заказа партнера", example: 'PUBLISHED' })
    partnerOrderId: string;
    
    @ApiProperty({ description: "Тип оплаты", example: 'PREPAID' })
    paymentType: string;

    @ApiProperty({ description: "???", example: false })
    fake: boolean;

    @ApiProperty({ description: "Регион доставки" })
    deliveryRegion: {
        id: number,
        name: string,
    };

    @ApiProperty({ description: "Статус товара" })
    items: {
        offerName: string,
        marketSku: number,
        shopSku: string,
        count: number,
        prices: [
            {
                type: string,
                costPerItem: number,
                total: number,
            }[],
        ],
        warehouse: {
            id: number,
            name: string,
        },
        details: object[],
        cisList: object[],
    }[];

    @ApiProperty({ description: "???" })
    payments: object[];

    @ApiProperty({ description: "???" })
    commissions: object[];

    @ApiProperty({ description: "???", example: 'PERSON'})
    buyerType: string;

    @ApiProperty({ description: '???', example: 'RUR' })
    currency: string;

}