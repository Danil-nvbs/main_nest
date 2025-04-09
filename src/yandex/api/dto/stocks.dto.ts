import { ApiProperty } from '@nestjs/swagger';

export class StocksDto {
    @ApiProperty({ description: "ID склада", example: 435669 })
    warehouseId: number;

    @ApiProperty({ description: "???" })
    quantum: object;

    @ApiProperty({ description: "Остатки" })
    offers: {
        offerId: string,
        stocks: {
            type: string;
            count: number;
        }[],
        updatedAt: string
    }[]

}