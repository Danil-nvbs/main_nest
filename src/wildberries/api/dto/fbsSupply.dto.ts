import { IsString, IsBoolean, IsDate, IsEnum } from 'class-validator';

export class FbsSupplyDto {
  @IsString()
  id: string;

  @IsBoolean()
  done: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  closedAt: Date;

  @IsDate()
  scanDt: Date;

  @IsString()
  name: string;

  @IsEnum([0, 1, 2, 3])
  cargoType: number;
}
