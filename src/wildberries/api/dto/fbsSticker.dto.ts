import { IsString, IsNumber } from 'class-validator';

export class FbsStickerDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  partA: number;

  @IsNumber()
  partB: number;

  @IsString()
  barcode: string;

  @IsString()
  file: string;

}
