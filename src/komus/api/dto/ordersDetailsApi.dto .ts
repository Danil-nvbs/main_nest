import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsNumber, IsBoolean, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
    @ApiProperty({ description: "Код доставки.", example: 1 })
    code: number;

    @ApiProperty({ description: "Название доставки.", example: "Доставка курьером" })
    name: string;
}

class Row {
    @ApiProperty({ description: "Идентификатор строки.", example: 8424808 })
    id: number;

    @ApiProperty({ description: "Артикул.", example: 434191 })
    artnumber: number;

    @ApiProperty({ description: "Количество.", example: 1 })
    quantity: number;

    @ApiProperty({ description: "Подтвержденное количество.", example: 1 })
    quantityConfirmed: number;

    @ApiProperty({ description: "Цена.", example: 18.4 })
    price: number;

    @ApiProperty({ description: "Общая сумма.", example: 18.4 })
    total: number;

    @ApiProperty({ description: "НДС.", example: 20 })
    nds: number;

    @ApiProperty({ description: "Вес.", example: 0.005 })
    weight: number;

    @ApiProperty({ description: "Объем.", example: 19.42493 })
    volume: number;
}

class Order {
    @ApiProperty({ description: "Идентификатор заказа.", example: 55555551 })
    id: number;

    @ApiProperty({ description: "Статус заказа.", type: Status })
    @ValidateNested()
    @Type(() => Status)
    status: Status;

    @ApiProperty({ description: "Цена заказа.", example: 805.34 })
    price: number;

    @ApiProperty({ description: "Цена доставки.", example: 505.34 })
    priceDelivery: number;

    @ApiProperty({ description: "Комментарий к заказу.", example: "Test Тестовый заказ" })
    comment: string;

    @ApiProperty({ description: "Информация о платежной системе.", type: Paysystem })
    @ValidateNested()
    @Type(() => Paysystem)
    paysystem: Paysystem;

    @ApiProperty({ description: "Информация о доставке.", type: Delivery })
    @ValidateNested()
    @Type(() => Delivery)
    delivery: Delivery;

    @ApiProperty({ description: "Отменен ли заказ.", example: 0 })
    canceled: number;

    @ApiProperty({ description: "Начало заказа.", example: 0 })
    startOrder: number;

    @ApiProperty({ description: "Дата создания заказа.", example: "2023-07-21 12:42:10" })
    dateCreate: string;

    @ApiProperty({ description: "Номер заказа.", example: 1258076 })
    orderNum: number;

    @ApiProperty({ description: "Статус выставления счета.", example: "string" })
    invoiceDone: string;

    @ApiProperty({ description: "Количество строк.", example: 5 })
    rowsNumber: number;

    @ApiProperty({ description: "Список строк.", type: [Row] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Row)
    rows: Row[];
}

export class OrdersDetailsApiDto {
    @ApiProperty({ description: "Список заказов.", type: Order })
    @ValidateNested()
    @Type(() => Order)
    content: Order;

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
