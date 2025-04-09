import { ApiProperty } from '@nestjs/swagger';

export class PricesDto {
    @ApiProperty({ description: "Артикул", example: 'WLN0367'})
    offerId: string;

    @ApiProperty({ description: "???" })
    quantum: object;

    @ApiProperty({ description: "Общая цена" })
    basicPrice: {
        value: number,
        currencyId: string,
        discountBase: number,
        updatedAt: string

    }

    @ApiProperty({ description: 'Цена магазина' })
    campaignPrice: {
        value: number,
        discountBase: number,
        currencyId: string,
        vat: number,
        updatedAt: string
    }

    @ApiProperty({ description: "Статус товара", example: 'PUBLISHED'})
    status: string;
}