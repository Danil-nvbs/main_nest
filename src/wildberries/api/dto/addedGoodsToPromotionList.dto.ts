import { ApiProperty } from '@nestjs/swagger';

export class AddedGoodsToPromotionListDto {
    @ApiProperty({ description: "Флаг, указывающий, существует ли уже загрузка", example: false })
    alreadyExists: boolean;

    @ApiProperty({ description: "Идентификатор загрузки", example: 11 })
    uploadID: number;
}
