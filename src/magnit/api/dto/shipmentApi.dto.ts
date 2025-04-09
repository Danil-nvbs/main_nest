import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

class FinancialData {
  @ApiProperty({ description: 'Старая цена товара.', example: 385.6 })
  old_price: number;

  @ApiProperty({ description: 'Текущая цена товара.', example: 632.91 })
  price: number;
}

class Item {
  @ApiProperty({ description: 'Финансовые данные товара.', type: FinancialData })
  financial_data: FinancialData;

  @ApiProperty({ description: 'Количество товара.', example: 1 })
  quantity: number;

  @ApiProperty({ description: 'Идентификатор SKU товара.', example: 7028211 })
  sku_id: number;
}

class Order {
  @ApiProperty({ description: 'Дата создания заказа.', example: '2025-03-03T12:43:41.77708+03:00' })
  created_at: string;

  @ApiProperty({ description: 'Время отсечки заказа.', example: '2025-03-05T16:00:00+03:00' })
  cutoff_time: string;

  @ApiProperty({ description: 'Список товаров в заказе.', type: [Item] })
  @IsArray()
  items: Item[];

  @ApiProperty({ description: 'Идентификатор заказа.', example: '44' })
  order_id: string;

  @ApiProperty({ description: 'Статус заказа.', example: 'ASSEMBLED' })
  status: string;
}

export class ShipmentApiDto {
  @ApiProperty({ description: 'Список заказов.', type: [Order] })
  @IsArray()
  orders: Order[]

  @ApiProperty({ description: 'Токен следующей страницы', example: 'ASSEMBLED' })
  next_page_token: string;
}