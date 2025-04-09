import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested } from 'class-validator';

class ParcelDto {
  @ApiProperty({ description: 'Идентификатор посылки.', example: 'parcel_123' })
  @IsString()
  parcel_id: string;

  @ApiProperty({ description: 'Штрих-код посылки.', example: 'barcode_123' })
  @IsString()
  barcode: string;
}

export class ConfirmShipmentDto {
  @ApiProperty({ description: 'Идентификатор отправления.', example: 'shipment_123' })
  @IsString()
  shipment_id: string;

  @ApiProperty({ description: 'Список посылок.', type: [ParcelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  parcels: ParcelDto[];
}
