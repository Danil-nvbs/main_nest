import { ApiProperty } from '@nestjs/swagger';

export class sendAndArchiveBody {
    @ApiProperty({ description: "Является ли обработка СТМ?", example: true })
    isStm: boolean;

    @ApiProperty({ description: "Является ли обработка для автоответчика?", example: true })
    isAuto?: boolean;

    @ApiProperty({ description: "Является ли обработкой вопроса?", example: true })
    isQuestion?: boolean;

    @ApiProperty({ description: "Кол-во отправляемых отзывов", example: 1000 })
    sendLimit?: number;

    @ApiProperty({ description: "Тип магазина Озон", example: 'PK' })
    type?: number;

}