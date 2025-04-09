import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsNumber, IsBoolean, IsDate } from 'class-validator';

class Status {
    @ApiProperty({ description: "Код статуса.", example: "N" })
    code: string;

    @ApiProperty({ description: "Название статуса.", example: "Ожидает резервирования." })
    name: string;
}

class Paysystem {
    @ApiProperty({ description: "Идентификатор платежной системы.", example: 9 })
    id: number;

    @ApiProperty({ description: "Название платежной системы.", example: "Безналичная - с отсрочкой платежа" })
    name: string;
}

class Delivery {
    @ApiProperty({ description: "Идентификатор доставки.", example: 38 })
    id: number;

    @ApiProperty({ description: "Название доставки.", example: "Курьерская доставка по Москве" })
    name: string;
}

class Order {
    @ApiProperty({ description: "Идентификатор заказа.", example: 55555551 })
    id: number;

    @ApiProperty({ description: "Статус заказа.", type: Status })
    status: Status;

    @ApiProperty({ description: "Цена заказа.", example: 805.34 })
    price: number;

    @ApiProperty({ description: "Цена доставки.", example: 0 })
    priceDelivery: number;

    @ApiProperty({ description: "Информация о платежной системе.", type: Paysystem })
    paysystem: Paysystem;

    @ApiProperty({ description: "Информация о доставке.", type: Delivery })
    delivery: Delivery;

    @ApiProperty({ description: "Отменен ли заказ.", example: 0 })
    canceled: number;

    @ApiProperty({ description: "Начало заказа.", example: 1 })
    startOrder: number;

    @ApiProperty({ description: "Дата создания заказа.", example: "2023-11-29 10:12:05" })
    dateCreate: string;

    @ApiProperty({ description: "Номер заказа.", example: 0 })
    orderNum: number;

    @ApiProperty({ description: "Статус выставления счета.", example: "N" })
    invoiceDone: string;
}

export class OrdersApiDto {
    @ApiProperty({ description: "Список заказов.", type: [Order] })
    @IsArray()
    content: Order[];

    @ApiProperty({ description: "Количество заказов.", example: 2 })
    count: number;

    @ApiProperty({ description: "Текущая страница.", example: 1 })
    page: number;

    @ApiProperty({ description: "Предыдущая страница.", example: null })
    prev: number | null;

    @ApiProperty({ description: "Следующая страница.", example: 2 })
    next: number | null;

    @ApiProperty({ description: "Общее количество страниц.", example: 57 })
    pages: number;
}
