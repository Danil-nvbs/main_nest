import { Body, Controller, Get, HttpStatus, Injectable, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { KomusApiService } from './komus.service';
import { OrdersApiDto } from './dto';

@ApiTags('KOMUS API')
@Controller('komus/api')
@Injectable()
export class KomusApiController {

    constructor(
        private readonly komusApiService: KomusApiService,

    ) { }

    @ApiOperation({ summary: "Получение списка заказов" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: OrdersApiDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/orders')
    async getOrders(
        @Body('type') type: string,
        @Body('marketplace') marketplace: string,
        @Body('docNumbers') docNumbers: string[]
    ) {
        let orders = await this.komusApiService.getOrders({marketplace});
        if (docNumbers?.length) {
            orders = orders.filter(order => !docNumbers.includes(String(order.id)));
        }
        return orders;
    }

    @ApiOperation({ summary: "Получение детализации по заказу" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: OrdersApiDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/orders/details')
    async getOrdersDetails(
        @Body('type') type: string,
        @Body('marketplace') marketplace: string,
        @Body('id') id: string
    ) {
        return (await this.komusApiService.getOrdersDetails({ id, marketplace })).content;
    }

}
