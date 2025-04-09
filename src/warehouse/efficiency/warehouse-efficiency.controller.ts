import { Body, Controller, Get, HttpCode, HttpStatus, ParseArrayPipe, Post, Query, UseGuards } from '@nestjs/common';
import { WarehouseEfficiencyService } from './warehouse-efficiency.service';
import { CreateWarehouseEfficiencyDto, GetWarehouseEfficiencyDto, UpdateWarehouseEfficiencyDto } from './dto';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WarehouseEfficiency } from './models/warehouse-efficiency.model';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { Op } from 'sequelize';
import { BigbaseService } from 'src/bigbase/bigbase.service';


@ApiTags('Эффективность работы склада (WbDischarge)')
@Controller('warehouse/efficiency')
export class WarehouseEfficiencyController {
    constructor(
        private efficiencyService: WarehouseEfficiencyService,
        private bigbaseService: BigbaseService,
    ) {}

    @ApiOperation({ summary: "Создает записи об эффективности в БД" })
    @ApiResponse({ status: HttpStatus.CREATED, description: "Успешно", type: WarehouseEfficiency, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: [CreateWarehouseEfficiencyDto] })
    @UseGuards(GsUserGuard)
    @Post('/create')
    async createEfficiency(
        @Body() createEfficiencyDto: CreateWarehouseEfficiencyDto[],
    ) {
        createEfficiencyDto.forEach(item => { if (item.article) item.article = item.article.toLowerCase() });
        return await this.efficiencyService.createMany(createEfficiencyDto);
    }

    @ApiOperation({ summary: "Обновляет записи об эффективности в БД" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно"})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: [UpdateWarehouseEfficiencyDto] })
    @UseGuards(GsUserGuard)
    @Post('/update')
    @HttpCode(200)
    async updateEfficiency(
        @Body(new ParseArrayPipe({ items: UpdateWarehouseEfficiencyDto })) updateEfficiencyDto: UpdateWarehouseEfficiencyDto[],
    ) {
        const success = [];
        for (let record of updateEfficiencyDto) {
            let message = null;

            try {
                if (record.article) record.article = record.article.toLowerCase();
                await this.efficiencyService.update(record);
                message = 'Успешно обновлен'
            } catch (err) {
                console.log(record)
                message = `Ошибка: ${err == 'SequelizeUniqueConstraintError: Validation error' ? 'Сочетание строк дата, время, упаковщик не уникально' : err}`
            } finally {
                success.push({
                    [record.id]: message
                });
            }

        }
        return success;
    }

    @ApiOperation({ summary: "Получает записи об эффективности в БД" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: WarehouseEfficiency, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/list')
    @HttpCode(200)
    async getEfficiency(
        @Body() listEfficiencyDto: GetWarehouseEfficiencyDto,
    ) {
        if (
            listEfficiencyDto.filters &&
            !listEfficiencyDto.filters.some(filter => Object.keys(filter).length > 1) &&
            !listEfficiencyDto.filters.some(filter => Object.keys(filter).join('') != Object.keys(listEfficiencyDto.filters[0]).join(''))
        ) {
            const column = Object.keys(listEfficiencyDto.filters[0])[0];
            return this.efficiencyService.get({ 
                ...listEfficiencyDto, 
                filters: [{
                    [column]: {
                        [Op.in]: listEfficiencyDto.filters.map(filter => filter[column])
                    }
                }]
            });
        }
        return await this.efficiencyService.get(listEfficiencyDto);
    }

    @ApiOperation({ summary: "Удаляет записи об эффективности в БД" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно"})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/delete')
    @HttpCode(200)
    async deleteEfficiency(
        @Body() ids: string[],
    ) {
        return { "Удалено": await this.efficiencyService.delete(ids) };
    }

    @ApiOperation({ summary: "Возвращает набор данных для таблицы Рабочий стол Склада" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно"})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @Get('/desktop')
    async getDesktop(
        @Query ('from') from: string,
        @Query ('to') to: string,
        @Query ('model') model: string = null,
    ) {
        const records = await this.efficiencyService.get({ from, to, filters: model ? [{ model }] : [] });
        const products = (await this.bigbaseService.getProducts({ 
            columns: [ 'article', 'weight' ], 
            filters: [{ article: { [Op.in]: Array.from(new Set(records.map(record => record.article))) }}]
        })).reduce((acc, val) => {
            acc[val.article] = val.weight;
            return acc;
        }, {});
        
        return records.map(record => [
            record.date.toISOString().slice(0, 10).split('-').reverse().join('.'),
            record.packer,
            record.article,
            record.quantity,
            null ,
            products[record.article]
        ].join(';')).join('\n');
    }
}
