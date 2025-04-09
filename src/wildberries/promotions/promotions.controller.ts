import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { PromotionsService } from './promotions.service';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { GdriveService } from 'src/gdrive/gdrive.service';
import { JSHelperService } from 'src/JSHelper.service';
import { BigbaseService } from 'src/bigbase/bigbase.service';
import { WbDischargeService } from 'src/wildberries/discharge/discharge.service';

@ApiTags('WB PROMOTIONS')
@Controller('wb')
export class PromotionsController {
    constructor(
        private readonly PromotionsService: PromotionsService,
        private readonly GsheetsService: GsheetsService,
        private readonly GdriveService: GdriveService,
        private readonly JSHelperService: JSHelperService,
        private readonly BigbaseService: BigbaseService,
        private readonly WbDischargeService: WbDischargeService,

    ) { }
    private readonly logger = new Logger(PromotionsController.name)


    @ApiOperation({ summary: 'Заполенение листа "Список акций"' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/promotions/list')
    async setPromotionsList(
        @Body() body: { type?: string }
    ) {
        const { type = 'PK' } = body;
        let res = await this.PromotionsService.setPromotionsList({ type })
        return res
    }


    @ApiOperation({ summary: "Удаление всех товаров из акции" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/promotions/delete')
    async deleteGoods(
        @Body() body: { type?: string, promotionId: number }

    ) {
        const { type = 'PK', promotionId } = body;
        try {
            let excelData = await this.PromotionsService.downloadPromotionExcelCookie({ type, promotionId, isRecovery: true })
            await this.PromotionsService.deletePromotionGoodsCookie({ type, excelData })
            this.logger.log(`Акция ${promotionId} очищена от товаров`)
        } catch (err) {
            this.logger.error(`Ошибка очищении от товаров акции ${promotionId}: ${err.message}`);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Ошибка очищении от товаров акции',
                message: err.response.data.errorText,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Добавление товаров в акцию" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/promotions/add')
    async addGoods(
        @Body() body: { type?: string; promotionId: number, nmIds: number[] }

    ) {
        const { type = 'PK', promotionId, nmIds } = body;
        try {
            let excelData = await this.PromotionsService.downloadPromotionExcelCookie({ type, promotionId, isRecovery: false })
            await this.PromotionsService.addPromotionGoodsCookie({ type, excelData, nmIds })
            this.logger.log(`В акцию ${promotionId} добавлено ${nmIds.length} товаров`)
        } catch (err) {
            this.logger.error(`Ошибка при обавлении товаров в акцию ${promotionId}: ${err.message}`);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Ошибка при обавлении товаров в акцию',
                message: err.response.data.errorText,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: 'Скачивание файла товаров акции на гугл диск' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/promotions/download')
    async downloadPromotionGoods(@Body() body: { type?: string; promotionId: number }) {
        const { type = 'PK', promotionId } = body;

        try {
            await this.GdriveService.clearFolder({ folderId: process.env.WB_PROMOTIONS_FOLDER_ID });

            let excelData = await this.PromotionsService.downloadPromotionExcelCookie({ type, promotionId, isRecovery: false });
            let finArr = [excelData.header];
            for (let chunk of excelData.chunks) {
                finArr.push(...chunk);
            }
            let data = {
                values: finArr,
                sheetName: 'Акции',
            };
            await this.GsheetsService.createSpreadsheetWithData({ data: [data], fileName: `Товары акции ${promotionId}`, folderId: process.env.WB_PROMOTIONS_FOLDER_ID });

            this.logger.log(`Акция ${promotionId} скачена на диск для обработки`);
        } catch (err) {
            this.logger.error(`Ошибка при скачивании акции ${promotionId}: ${err.message}`);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Ошибка при скачивании акции',
                message: err.response.data.errorText,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Обработка по файлу из гугл диска" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/promotions/update')
    async update(
        @Body() body: { type: string }
    ) {
        const { type = 'PK' } = body;

        let files = await this.GdriveService.getFilesList({ folderId: process.env.WB_PROMOTIONS_FOLDER_ID })
        if (!files.length) throw `Нет файла в папке ${process.env.WB_PROMOTIONS_FOLDER_ID}`
        if (files.length > 1) throw `Более 1 файла в папке ${process.env.WB_PROMOTIONS_FOLDER_ID}`
        let promotionFile = files[0]

        let params = await this.PromotionsService.getParams()

        let promotionFileValues = await this.GsheetsService.getValues({ range: `'Акции'!A1:ZZ`, spreadsheetId: promotionFile.id })
        let promotionFileHeader = await this.JSHelperService.makeHeader({ sheetsValues: promotionFileValues })

        let header = await this.JSHelperService.makeHeader(
            {
                sheetsValues: (await this.GsheetsService.getValues({ range: `'Обработка'!A1:ZZ`, spreadsheetId: process.env.WB_PROMOTIONS_SSID }))
            }
        )

        let kits = await this.JSHelperService.getKits()
        let minuses = await this.JSHelperService.getMinuses({ options: { type: 'WB', convert: true } })
        let stm = await this.BigbaseService.getStm()

        let bigBasefilters = promotionFileValues.slice(1).map(m => ({
            article: m[promotionFileHeader['Артикул поставщика']].split('/')[0].split('_')[0].split('-')[0].toLowerCase()
        }));
        let columns = [
            'article',
            'cost_wb_stock_1c',
            'average_cost_full_1c',
            'cost_full_1c',
            'cost_invoice',
            'vat',
            'incoming_vat',
        ]
        let bigBase = (await this.BigbaseService.getProducts({ columns, filters: bigBasefilters }))
            .reduce((acc, item) => {
                acc[item.article] = item
                return acc
            }, {})

        let priceCalc = await this.JSHelperService.createPriceCalc({ spreadsheetId: process.env.WB_PROMOTIONS_SSID })
        let logisticCalc = await this.JSHelperService.createLogisticCalc()

        let simaStocksObj = await this.JSHelperService.getSupplierStocks({ supplier: 'sima' })
        let relefStocksObj = await this.JSHelperService.getSupplierStocks({ supplier: 'relef' })
        let komusStocksObj = await this.JSHelperService.getSupplierStocks({ supplier: 'komus' })
        let samsonStocksObj = await this.JSHelperService.getSupplierStocks({ supplier: 'samson' })

        let tarifsData = await this.PromotionsService.getTarifs()

        let dischargeFilters = promotionFileValues.slice(1).map(m => ({
            vendorCode: m[promotionFileHeader['Артикул поставщика']].split('/')[0].split('_')[0].split('-')[0].toLowerCase()
        }));
        let discharge = (await this.WbDischargeService.getWbDischarge({
            columns: ['vendorCode', 'nmID', 'dimensions'],
            filters: dischargeFilters,
            type,
        }))
            .reduce((acc, item) => {
                acc[item.vendorCode] = item
                return acc
            }, {})

        let finArr = []
        for (let row of promotionFileValues.slice(1)) {
            let art = row[promotionFileHeader['Артикул поставщика']];
            let nom = row[promotionFileHeader['Артикул WB']];
            if (!art || !nom) continue;

            let lowerArt = art.split('/')[0].split('_')[0].split('-')[0].toLowerCase();
            let bigBaseRow = bigBase[lowerArt] || bigBase[lowerArt.split('/')[0]] || bigBase[lowerArt.split('/')[1]] || bigBase[lowerArt.split('_')[0]] || bigBase[lowerArt.split('_')[1]] || {};
            let price = await priceCalc({ art: lowerArt, bigBaseRow });
            if (!price.finalPrice) continue;

            let stockWb = row[promotionFileHeader['Остаток товара на складах Wb (шт.)']];
            if ((stm[art] || stockWb != 0) && !kits[art]) {
                let newRow = new Array(Object.keys(header).length).fill(null);

                const dimensions = discharge[lowerArt]?.dimensions;
                const volume = dimensions ? (dimensions.height * dimensions.length * dimensions.width) / 1000 : 0;
                const { delivery_cost, storage_cost, pack_and_delivery_cost } = logisticCalc(volume);

                newRow[header['Бренд']] = row[promotionFileHeader['Бренд']];
                newRow[header['Артикул поставщика']] = art;
                newRow[header['Номенклатура (код 1С)']] = nom;
                newRow[header['Остаток товара на складах Wb (шт.)']] = stockWb;
                newRow[header['Остаток товара на складе продавца Wb (шт.)']] = row[promotionFileHeader['Остаток товара на складе продавца Wb (шт.)']];
                newRow[header['Остаток СИМА']] = art.includes('KMS')
                    ? komusStocksObj[art.split('KMS')[1]]
                    : art.includes('RELEF')
                        ? relefStocksObj[art.split('RELEF')[1]]
                        : art.includes('SAMSON')
                            ? samsonStocksObj[art.split('SAMSON')[1]]
                            : simaStocksObj[art]
                                ? simaStocksObj[art]
                                : 0;
                newRow[header['Плановая цена для акции']] = row[promotionFileHeader['Плановая цена для акции']];
                newRow[header['Текущая розничная цена']] = row[promotionFileHeader['Текущая розничная цена']];
                newRow[header['Текущая скидка на сайте, %']] = row[promotionFileHeader['Текущая скидка на сайте, %']];
                newRow[header['Загружаемая скидка для участия в акции']] = row[promotionFileHeader['Загружаемая скидка для участия в акции']];
                newRow[header['Минусованный товар?']] = minuses[nom] ? 'ДА' : '';
                newRow[header['СЦК ВБ']] = price.finalPrice;
                newRow[header['Комиссия ВБ']] = tarifsData[row[promotionFileHeader['Предмет']]] || params["Комиссия, если не найдено в тарифах"];
                newRow[header['Доставка ВБ']] = delivery_cost || params["Доставка ВБ"];
                newRow[header['Платная приёмка']] = 0;
                newRow[header['Упаковка и доставка']] = minuses[nom] ? '' : pack_and_delivery_cost || params["Упаковка и доставка"];
                newRow[header['Хранение 60 дней']] = minuses[nom] ? 0 : storage_cost || params["Хранение 60"];
                newRow[header['Оборачиваемость']] = row[promotionFileHeader['Оборачиваемость']];

                finArr.push(newRow);
            }
        }


        await this.GsheetsService.clearValues({ range: `'Обработка'!A2:ZZ`, spreadsheetId: process.env.WB_PROMOTIONS_SSID })
        if (finArr.length) {
            await this.GsheetsService.setValues2({ range: `'Обработка'!A2:ZZ`, values: finArr, spreadsheetId: process.env.WB_PROMOTIONS_SSID })
        }
        try {
            await priceCalc({ final: "Нет себестоимости" })
        } catch (err) {
            throw new HttpException('Нет себестоимости у некоторых товаров, проверте лист "Нет себестоимости"', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
