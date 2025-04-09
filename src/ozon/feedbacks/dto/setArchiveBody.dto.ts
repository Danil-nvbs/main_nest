import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class setArchiveBody {
    @ApiProperty({ description: "Дата начала периода для вывода архивных записей", example: '2025-01-01' })
    @IsDateString()
    dateFrom?: string;

    @ApiProperty({ description: "Дата конца периода для вывода архивных записей", example: '2025-02-01' })
    @IsDateString()
    dateTo?: string;

}