import { ApiProperty } from "@nestjs/swagger";

export class DeleteProductDto {
    @ApiProperty({ description: "Артикул товара (уникальный)", nullable: false })
    article: string;
}
