import { Body, Controller, Get, HttpStatus, Injectable, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { ReportsApiService } from './reports.service';

import { StocksFboDto } from './dto';
import { PromotionsApiService } from './promotions.service';
import { PromotionsListDto, PromotionsDetailsDto } from './dto/index';

@ApiTags('Wildberries API')
@Controller('wb/api')
@Injectable()
export class WildberriesApiController {

    constructor(
        private readonly reportsApiService: ReportsApiService,
        private readonly promotionsApiService: PromotionsApiService,


    ) { }

    @ApiOperation({ summary: "Получить остатки FBO" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: StocksFboDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Get('stocks/fbo')
    async getFboStocks(@Query('type') type: string) {
        return await this.reportsApiService.getFboStocks(type);
    }

    @ApiOperation({ summary: "Получить список акций" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: PromotionsListDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Get('promotions/list')
    async getList(@Query('type') type: string) {
        return await this.promotionsApiService.getPromotionList({ type });
    }

    @ApiOperation({ summary: "Получить детализацию по списоку акций" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: PromotionsDetailsDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('promotions/details')
    async getPromotionsDetails(
        @Body('type') type: string,
        @Body('promotions') promotions: string[]
    ) {
        return await this.promotionsApiService.getPromotionsDetails({ type, promotions });
    }

    @ApiOperation({ summary: "Добавить товары в акцию" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: PromotionsDetailsDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('promotions/add')
    async addGoodsToPromotion(
        @Body('type') type: string,
        @Body('nmIds') nmIds: number[],
        @Body('promotionId') promotionId: number

    ) {
        return await this.promotionsApiService.addGoodsToPromotion({ type, nmIds, promotionId });
    }
}
