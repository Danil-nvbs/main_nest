import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GsUserGuard } from "src/auth/gs-email.guard";
import { StocksService } from "./stocks.service";
import { GetStocksDto } from "./dto/getStocks.dto";

@ApiTags("WB Stocks")
@Controller('wb/stocks')
export class StocksController {
    constructor(
        private readonly stocksService: StocksService
    ) { }
    private readonly logger = new Logger(StocksController.name)
        
    @ApiOperation({ summary: 'Обновление остатков на складах в БД' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/update')
    async update(@Query('type') type: string) {
        try {
            this.logger.log("Начинаем обновление остатков в БД")
            await this.stocksService.updateStocks(type);
        } catch (err) {
            this.logger.log(err);
            throw new HttpException(`Ошибка updateWbStocks: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: 'Получение данных об остатках из БД' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Get()
    async get(@Body() dto: GetStocksDto) {
        try {
            const res = await this.stocksService.getStocks(dto);
            return res;
        } catch (err) {
            this.logger.log(err);
            throw new HttpException(`Ошибка getWbStocks: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}