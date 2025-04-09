import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CategoryListDto {
  @ApiProperty({ description: 'Идентификатор категории.', example: 123 })
  @IsNumber()
  category_id: number;

  @ApiProperty({ description: 'Строковый путь категории.', example: 'Electronics -> Computers -> Laptops' })
  @IsString()
  category_string_path: string;

  @ApiProperty({ description: 'Заголовок категории.', example: 'Laptops' })
  @IsString()
  category_title: string;
}
