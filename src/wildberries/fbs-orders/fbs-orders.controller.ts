import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WbFbsOrdersService } from './fbs-orders.service';
import { OnlyTypeDto, RefreshOrdersQueryDto } from './dto/fbs-orders.dto';

@ApiTags('FBS Orders')
@Controller('wb/fbs-orders')
export class FbsOrdersController {
    constructor(private readonly fbsOrdersService: WbFbsOrdersService) {}

    @Get('/list/supplies/open')
    @ApiOperation({ summary: 'Получить список поставки' })
    @ApiResponse({ status: 200, description: 'Список поставки' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    async listSupplies(@Query(ValidationPipe) { type }: OnlyTypeDto) {
        let supplies = await this.fbsOrdersService.getAllSupplies({ type })
        this.fbsOrdersService.refreshSupplies({ type, fbsSupplies: supplies })
        return supplies.filter(f=>!f.closedAt)
    }

    @Get('/refresh/orders')
    @ApiOperation({ summary: 'Обновить заказы в базе данных' })
    @ApiResponse({ status: 201, description: 'Заказы успешно обновлены' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    async refreshOrders(@Query(ValidationPipe) { type, dateFrom, dateTo }: RefreshOrdersQueryDto) {
        return this.fbsOrdersService.refreshOrders({ type, dateFrom, dateTo })
    }

    @Get('/refresh/stickers')
    @ApiOperation({ summary: 'Получить стикеры для заказов' })
    @ApiResponse({ status: 200, description: 'Стикеры для заказов' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    async refreshStickers(@Query(ValidationPipe) { type }: OnlyTypeDto) {
        return this.fbsOrdersService.refreshStickers({ type })
    }

    @Get('/refresh/statuses')
    @ApiOperation({ summary: 'Получить стикеры для заказов' })
    @ApiResponse({ status: 200, description: 'Стикеры для заказов' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    async refreshStatuses(@Query(ValidationPipe) { type }: OnlyTypeDto) {
        return this.fbsOrdersService.refreshStatuses({ type })
    }

    @Get('/refresh/supplies')
    @ApiOperation({ summary: 'Получить поставки' })
    @ApiResponse({ status: 200, description: 'Поставки' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    async refreshSupplies(@Query(ValidationPipe) { type }: OnlyTypeDto) {
        return this.fbsOrdersService.refreshSupplies({ type })
    }

    @Get('/refresh/all')
    @ApiOperation({ summary: 'Получить все заказы, статусы и стикеры' })
    @ApiResponse({ status: 200, description: 'Все заказы, статусы и стикеры' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    async refreshAll(@Query(ValidationPipe) { type, dateFrom, dateTo }: RefreshOrdersQueryDto) {
        await this.refreshSupplies({ type })
        await this.refreshOrders({ type, dateFrom, dateTo })
        await this.refreshStatuses({ type })
        return await this.refreshStickers({ type })
    }
}
