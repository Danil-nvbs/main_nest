import { ApiProperty } from "@nestjs/swagger";

export class CheckBarcodeDto {
    @ApiProperty({ description: "Артикул товара (уникальный)", nullable: false })
    readonly article: string;
    
    @ApiProperty({ description: "Штрихкод (значение)", nullable: false })
    readonly barcode: string;
}
