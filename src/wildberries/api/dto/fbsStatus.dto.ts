import { IsString, IsNumber } from 'class-validator';

export class FbsStatusDto {
  @IsNumber()
  id: number;

  @IsString()
  supplierStatus: string;

  @IsString()
  wbStatus: string;

}
