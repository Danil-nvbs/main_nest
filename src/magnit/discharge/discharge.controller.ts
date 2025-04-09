import { ApiBasicAuth, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { MagnitDischargeService } from './discharge.service';
import { MagnitDischarge } from './models/discharge.model';
import { RequestService } from 'src/request/request.service';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { GetMagnitDischargeDto, SetActiveDischargeDto, SyncMagnitDischargeDto } from './dto';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { MicroServiceGuard } from 'src/guards/microservice.guard';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { TelegramBotService } from 'src/bot/bot.service';
import { JSHelperService } from 'src/JSHelper.service';
import { MagnitApiService } from '../api/api.service';
import { MagnitCategoriesService } from '../categories/categories.service';

@ApiTags('Выгрузка Magnit (MagnitDischarge)')
@Controller('/magnit/discharge')
export class MagnitDischargeController {
    constructor(
        private readonly dischargeService: MagnitDischargeService,
        private readonly requestService: RequestService,
        private readonly gsheetService: GsheetsService,
        private readonly regularTaskService: RegularTasksService,
        private readonly telegramBotService: TelegramBotService,
        private readonly jsHelperService: JSHelperService,
        private readonly apiService: MagnitApiService,
        private readonly categoriesService: MagnitCategoriesService,

    ) { }
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Обновляет или создает карточки не изменяя поле barcode' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    // @ApiBasicAuth('x_microservice_token')
    // @UseGuards(MicroServiceGuard)
    @Post('/set/test')
    @HttpCode(200)
    async test(
        @Body('type') type: string
    ) {
        let data = await this.apiService.getProductList({ type })
        const batchSize = 1000;

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);

            batch.forEach((card) => {
                card.article = card.seller_sku_id;
                card.length = card.depth;
                card.barcode = String(card.barcode);
                card.active = true;
                card.type = type;
            });
            await this.upsert(batch);
        }

    }

    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Обновляет или создает карточки не изменяя поле barcode' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_microservice_token')
    @UseGuards(MicroServiceGuard)
    @Post('/set/ignore/barcode')
    @HttpCode(200)
    async upsert(
        @Body() data: MagnitDischarge[]
    ) {
        const oldSizes = (await this.dischargeService.getDischarge({
            type: data[0].type,
            columns: ['length', 'width', 'height', 'sku_id', 'article', 'title'],
            filters: data.map(card => ({ sku_id: card.sku_id }))
        })).reduce((acc, card) => {
            acc[card.sku_id] = card;
            return acc;
        }, {});

        const result = await this.dischargeService.upsertManyBarcodeless(data);

        const difference = data.reduce((acc, card) => {
            const apiVolume = card.length * card.height * card.width / 1000;
            const dbVolume = oldSizes[card.sku_id]?.length * oldSizes[card.sku_id]?.height * oldSizes[card.sku_id]?.width / 1000;

            return apiVolume !== dbVolume && oldSizes[card.sku_id]
                ? acc.concat([[
                    new Date().toLocaleDateString('ru'),
                    card.type == 'PK' ? 'ПК' : 'FEYT',
                    oldSizes[card.sku_id].article,
                    oldSizes[card.sku_id].sku_id,
                    oldSizes[card.sku_id].title,
                    oldSizes[card.sku_id].height,
                    oldSizes[card.sku_id].length,
                    oldSizes[card.sku_id].width,
                    dbVolume,
                    card.height,
                    card.length,
                    card.width,
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
            this.dischargeService.startDischarge(type),
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
        @Body() syncDto: SyncMagnitDischargeDto,
    ) {
        const { sourceSheetName, type } = syncDto;
        const spreadsheetId = this.requestService.getSpreadsheetId();

        if (!spreadsheetId) throw new HttpException('Отсутствует заголовок x_spreadsheet_id', HttpStatus.BAD_REQUEST);

        const content = await this.gsheetService.getValues({ range: `'${sourceSheetName}'!A2:ZZ`, spreadsheetId });
        const headers = await this.jsHelperService.makeHeader({ sheetsValues: content })
        const rowsWithoutDoubles = [];

        const idsObj = content.slice(2).reduce((acc, row) => {
            if (acc[Number(row[headers['SKU']])] === undefined) rowsWithoutDoubles.push(row)

            acc[Number(row[headers['SKU']])] = row[headers['Штрих-код']];
            return acc;
        }, {})

        const dataArray = Object.keys(idsObj).map(key => ({
            sku_id: Number(key),
            barcode: idsObj[key]
        }))
        for (let index = 0; index < dataArray.length; index += 10000) {
            await this.dischargeService.updateBarcodes(dataArray.slice(index, index + 10000).filter(card => card.barcode));
        }
        let categories = await this.categoriesService.getCategoriesList()
        const updatedDataObject: {
            [key: number]:
            {
                product_id: number;
                article: string | null;
                sku_id: number;
                title: string | null;
                category_id: number | null;
                barcode: string | null
            }
        } = (
            await this.dischargeService.getDischarge({ type, columns: ['product_id', 'article', 'barcode', "sku_id", "title", "category_id"] })
        )
            .reduce((acc, card) => {
                acc[card.product_id] = card;
                return acc;
            }, {});

        const insertData = rowsWithoutDoubles.map(row => {
            const card = updatedDataObject[row[headers['ID']]];

            if (card) {
                row[headers['ID']] = card.product_id;
                row[headers['SKU']] = card.sku_id;
                row[headers['Штрих-код']] = card.barcode;
                row[headers['Бренд']] = card.title.split('-')[0];
                row[headers['Артикул']] = card.article;
                row[headers['Категория 1']] = categories[card.category_id].firstCategorie;
                row[headers['Категория 2']] = categories[card.category_id].secondCategorie;
                row[headers['Категория 3']] = categories[card.category_id].thirdCategorie;

                delete updatedDataObject[row[headers['ID']]];
            }

            return row;
        }).concat(
            Object.values(updatedDataObject)
                .map((card) => {
                    const row = [];
                    row[headers['ID']] = card.product_id;
                    row[headers['SKU']] = card.sku_id;
                    row[headers['Штрих-код']] = card.barcode;
                    row[headers['Бренд']] = card.title.split('-')[0];
                    row[headers['Артикул']] = card.article;
                    row[headers['Категория 1']] = categories[card.category_id].firstCategorie;
                    row[headers['Категория 2']] = categories[card.category_id].secondCategorie;
                    row[headers['Категория 3']] = categories[card.category_id].thirdCategorie;

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


    @ApiOperation({ summary: 'Возвращает массив карточек из выгрузки Magnit' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно', type: MagnitDischarge, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/list')
    @HttpCode(200)
    async get(
        @Body() getDto: GetMagnitDischargeDto,
    ) {
        return await this.dischargeService.getDischarge(getDto);
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
        const showSheetData = await this.gsheetService.getValues({ range: `'Проверить'!A1:ZZ`, spreadsheetId: process.env.PNDWB_SSID });

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

            const oldRecordsObject = (await this.dischargeService.getDischarge({
                type,
                columns: [],
                filters: results.map(card => ({ sku_id: card.sku_id })),
            })).reduce((acc, card) => {
                acc[card.sku_id] = card;
                return acc;
            }, {});

            const data = results.map(card => {
                const obj = { ...oldRecordsObject[card.sku_id] };

                obj.sku_id = +card.sku_id;
                obj.id_magnit = card.id_magnit;
                obj.barcode = card.barcode;
                obj.article = card.article;
                obj.brand = card.brand;
                obj.dimensions = {
                    width: card.width,
                    length: card.length,
                    height: card.height,
                };
                // obj.subjectName = card.cat1;
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
