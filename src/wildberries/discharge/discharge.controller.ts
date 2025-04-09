import { ApiBasicAuth, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { WbDischargeService } from './discharge.service';
import { WbDischarge } from './models/discharge.model';
import { RequestService } from 'src/request/request.service';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { GetWbDischargeDto, SetActiveDischargeDto, SyncWbDischargeDto } from './dto';
import { Op } from 'sequelize';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { MicroServiceGuard } from 'src/guards/microservice.guard';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { TelegramBotService } from 'src/bot/bot.service';
import { JSHelperService } from 'src/JSHelper.service';

@ApiTags('Выгрузка Wildberries (WbDischarge)')
@Controller('/wb/discharge')
export class WbDischargeController {
    constructor(
        private readonly dischargeService: WbDischargeService,
        private readonly requestService: RequestService, 
        private readonly gsheetService: GsheetsService,
        private readonly regularTaskService: RegularTasksService,
        private readonly telegramBotService: TelegramBotService,
        private readonly jsHelperService: JSHelperService,
    ) {}


    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Обновляет или создает карточки не изменяя поле barcode' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_microservice_token')
    @UseGuards(MicroServiceGuard)
    @Post('/set/ignore/barcode')
    @HttpCode(200)
    async upsert(
        @Body() data: WbDischarge[]
    ) {
        const oldSizes = (await this.dischargeService.getWbDischarge({
            type: data[0].type,
            columns: ['dimensions', 'nmID', 'vendorCode', 'title'],
            filters: data.map(card => ({ nmID: card.nmID }))
        })).reduce((acc, card) => {
            acc[card.nmID] = card;
            return acc;
        }, {});

        const result = await this.dischargeService.upsertManyBarcodeless(data);
        
        const difference = data.reduce((acc, card) => {
            const apiVolume = card.dimensions?.length * card.dimensions?.length * card.dimensions?.width / 1000;
            const dbVolume = oldSizes[card.nmID]?.dimensions?.length * oldSizes[card.nmID]?.dimensions?.length * oldSizes[card.nmID]?.dimensions?.width / 1000;

            return apiVolume !== dbVolume && oldSizes[card.nmID]
                ? acc.concat([[
                    new Date().toLocaleDateString('ru'),
                    card.type == 'PK' ? 'ПК' : 'ИП',
                    oldSizes[card.nmID].vendorCode,
                    oldSizes[card.nmID].nmID,
                    oldSizes[card.nmID].title,
                    oldSizes[card.nmID].dimensions?.height,
                    oldSizes[card.nmID].dimensions?.length,
                    oldSizes[card.nmID].dimensions?.width,
                    dbVolume,
                    card.dimensions?.height,
                    card.dimensions?.length,
                    card.dimensions?.width,
                    apiVolume,
                ]])
                : acc
        }, []);
            

        if (difference.length) await this.gsheetService.appendValues({
            range: `'Проверить'`, 
            values: difference, 
            spreadsheetId: process.env.PNDWB_SSID,
        });

        return result;
    }

    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Изменяет статус active для не содержащихся в массиве карточек на false' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_microservice_token')
    @UseGuards(MicroServiceGuard)
    @Post('/active/set')
    @HttpCode(200)
    async setActive(
        @Body() dto: SetActiveDischargeDto,
    ) {
        return await this.dischargeService.setActive(dto);
    }

    @ApiOperation({ summary: 'Запускает процесс выгрузки карточек с WB' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Get('/start')
    async start(
        @Query('type') type: string
    ) {
        return await Promise.any([
            this.dischargeService.startWbDischarge(type),
            new Promise((resolve) => setTimeout(resolve, 10000, 'Запрос отправлен'))
        ])
    }


    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Обновляет баркоды в БД согласно Google таблице' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_microservice_token')
    @UseGuards(MicroServiceGuard)
    @Post('/sync')
    @HttpCode(200)
    async syncTable(
        @Body() syncDto: SyncWbDischargeDto,
    ) {
        const { sourceSheetName, type } = syncDto;
        const spreadsheetId = this.requestService.getSpreadsheetId();

        if (!spreadsheetId) throw new HttpException('Отсутствует заголовок x_spreadsheet_id', HttpStatus.BAD_REQUEST);

        const content = await this.gsheetService.getValues({ range: `'${sourceSheetName}'!A1:ZZ`, spreadsheetId });

        const headers = content[1];
        const headersObj = headers.reduce((acc, header, index) => {
            acc[header] = index;
            return acc;
        }, {});

        const rowsWithoutDoubles = [];

        const nmIDsObj = content.slice(2).reduce((acc, row) => {
            if (acc[Number(row[headersObj['Артикул WB']])] === undefined) rowsWithoutDoubles.push(row)
        
            acc[Number(row[headersObj['Артикул WB']])] = row[headersObj['Баркод']];
            return acc;
        }, {})

        const dataArray = Object.keys(nmIDsObj).map(key => ({
            nmID: Number(key),
            barcode: nmIDsObj[key]
        }))

        for(let index = 0; index < dataArray.length; index += 10000) {
            await this.dischargeService.updateBarcodes(dataArray.slice(index, index + 10000).filter(card => card.barcode));
        }

        const updatedDataObject: { [key: number]: { nmID: number; vendorCode: string | null; barcode: string | null } } = (
            await this.dischargeService.getWbDischarge({ type, columns: ['nmID', 'vendorCode', 'barcode'] })
        )
            .reduce((acc, card) => {
                acc[card.nmID] = card;
                return acc;
            }, {});
        
        const insertData = rowsWithoutDoubles.map(row => {
            const card = updatedDataObject[row[headersObj['Артикул WB']]];

            if (card) {
                row[headersObj['Артикул WB']] = card.nmID;
                row[headersObj['Артикул поставщика']] = card.vendorCode;
                row[headersObj['Баркод']] = card.barcode;

                delete updatedDataObject[row[headersObj['Артикул WB']]];
            }
    
            return row;
        }).concat(
            Object.values(updatedDataObject)
                .map((card) => {
                    const row = [];

                    row[headersObj['Артикул WB']] = card.nmID;
                    row[headersObj['Артикул поставщика']] = card.vendorCode;
                    row[headersObj['Баркод']] = card.barcode;

                    return row;
                })
        );

        await this.gsheetService.clearValues({ range: `'${sourceSheetName}'!A3:ZZ`, spreadsheetId });

        await this.gsheetService.setValues({ 
            range: `'${sourceSheetName}'!A1:ZZ`, 
            values: [[new Date().toLocaleString('ru')], [], ...insertData], 
            spreadsheetId 
        });

        return { message: 'Успешно' };
    }
    
    
    @ApiOperation({ summary: 'Возвращает массив карточек из выгрузки Wildberries' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно', type: WbDischarge, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/list')
    @HttpCode(200)
    async get(
        @Body() getDto: GetWbDischargeDto,
    ) {
        return await this.dischargeService.getWbDischarge(getDto);
    }


    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Отправляет запрос на регистрацию выполнения регулярной задачи' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_microservice_token')
    @UseGuards(MicroServiceGuard)
    @Post('/task')
    async sendRegularTask(
        @Body() dto: { codename: string; result: { success: boolean; message: string } }
    ) {
        return await this.regularTaskService.registerTask(dto.codename, dto.result);
    }


    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Проверяет наличие новых строк в листе Проверить и отправлят уведомление' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_microservice_token')
    @UseGuards(MicroServiceGuard)
    @Get('/sizes/check')
    async checkNewSizes() {
        const showSheetData = await this.gsheetService.getValues({ range: `'Проверить'!A1:ZZ`, spreadsheetId: process.env.PNDWB_SSID});
        
        const headers = this.jsHelperService.makeHeader({
            sheetsValues: showSheetData,
        });

        if (showSheetData.slice(1).some(row => row[headers['Комментарий']] !== 'проверено')) {
            await this.telegramBotService.sendMessage({
                message: '@aestarbien, новые изменения размеров в таблице "Проверить"\nhttps://docs.google.com/spreadsheets/d/1_KVZy_4WCkhn9XjG7_FJdt5llwVtqdZehLI3kCFY2Wc/edit?gid=392533262#gid=392533262', 
                chatId: process.env.SHIPMENTS_CHAT_ID,
            });

            return { message: "Есть непроверенные строки, уведомление отправлено" };
        }

        return { message: "Непроверенных строк нет" };
    }


    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Подгружает записи из старой базы в новую' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @Get('/base/old/load')
    async loadFromOldBase(
        @Query('type') type: string
    ) {
        let page = 0;
        while (true) {
            const response = await this.dischargeService.getDataFromOldBase(page, type);
            
            const { results } = response
            
            console.log(`page: ${page} | results: ${results.length}`)

            const oldRecordsObject = (await this.dischargeService.getWbDischarge({
                type,
                columns: [],
                filters: results.map(card => ({ nmID: card.nm_id })),
            })).reduce((acc, card) => {
                acc[card.nmID] = card;
                return acc;
            }, {});

            const data = results.map(card => {
                const obj = { ...oldRecordsObject[card.nm_id] };

                obj.nmID = +card.nm_id;
                obj.imtID = card.imt_id;
                obj.barcode = card.barcode;
                obj.vendorCode = card.article;
                obj.brand = card.brand;
                obj.dimensions = { 
                    width: card.width, 
                    length: card.length,
                    height: card.height,
                },
                obj.subjectName = card.cat;
                obj.title = card.name;
                obj.type = type;
                
                return obj;
            })

            await this.dischargeService.upsertManyBarcodeless(data);

            if (results.length < 10000) break;
            page++;
        }
        
        return { message: "Успешно" };
    }
}
