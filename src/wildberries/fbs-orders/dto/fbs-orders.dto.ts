import { IsString, IsNotEmpty, IsDate, Matches } from 'class-validator';

export class OnlyTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class RefreshOrdersQueryDto extends OnlyTypeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|30|31)$/, { message: 'dateFrom must be in the format YYYY-MM-DD' })
  dateFrom: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|1\d|2\d|30|31)$/, { message: 'dateFrom must be in the format YYYY-MM-DD' })
  dateTo: string;
}