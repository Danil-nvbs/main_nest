import { Injectable, Logger } from '@nestjs/common';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { PromotionsApiService } from 'src/wildberries/api/promotions.service';
import { JSHelperService } from 'src/JSHelper.service';
import * as xlsx from 'xlsx';


@Injectable()
export class PromotionsService {

    currentSSId: string;
    private readonly logger = new Logger(PromotionsService.name)

    constructor(
        private readonly GsheetsService: GsheetsService,
        private readonly JSHelperService: JSHelperService,
        private readonly PromotionsApiService: PromotionsApiService,
    ) { }

    async setPromotionsList({ type }) {
        await this.GsheetsService.clearValues({ range: `'Список акций'!A2:ZZ`, spreadsheetId: process.env.WB_PROMOTIONS_SSID });
        let promotionList = await this.PromotionsApiService.getPromotionList({ type })
        let idsList = promotionList.map(m => String(m.id))

        let promotionDetails = await this.PromotionsApiService.getPromotionsDetails({ type, promotions: idsList });

        let sheetsValues = await this.GsheetsService.getValues({ range: `'Список акций'!A1:ZZ`, spreadsheetId: process.env.WB_PROMOTIONS_SSID });
        let headers = this.JSHelperService.makeHeader({ sheetsValues })
        let finArr = promotionDetails.map(promotion => {
            let newRow = new Array(Object.keys(headers).length).fill(null)
            newRow[headers['Идентификатор акции']] = promotion.id
            newRow[headers['Название акции']] = promotion.name
            newRow[headers['Тип акции']] = promotion.type == 'auto'
                ? "Автоматическая"
                : promotion.type == 'regular'
                    ? "Регулярная"
                    : '-'
            newRow[headers['Описание акции']] = promotion.description
            newRow[headers['Дата начала акции']] = new Date(promotion.startDateTime).toLocaleDateString('ru')
            newRow[headers['Дата окончания акции']] = new Date(promotion.endDateTime).toLocaleDateString('ru')
            newRow[headers['Преимущества']] = promotion?.advantages?.join(', \n') || ''
            newRow[headers['Товаров в акции с остатком']] = promotion.inPromoActionLeftovers
            newRow[headers['Товаров в акции']] = promotion.inPromoActionTotal
            newRow[headers['Товаров НЕ в акции с остатком']] = promotion.notInPromoActionLeftovers
            newRow[headers['Товаров НЕ в акции']] = promotion.notInPromoActionTotal
            newRow[headers['Процент участия']] = promotion.participationPercentage + "%"
            return newRow
        })

        await this.GsheetsService.setValues({ range: `'Список акций'!A2:ZZ`, spreadsheetId: process.env.WB_PROMOTIONS_SSID, values: finArr });
        return promotionDetails

    }

    async addGoodsToPromotion({ type }) {
        let sheetsValues = await this.GsheetsService.getValues({ range: `'Добавление товаров в акцию'!A1:ZZ`, spreadsheetId: process.env.WB_PROMOTIONS_SSID });
        let headers = this.JSHelperService.makeHeader({ sheetsValues })
        let promotionId = +sheetsValues[1][headers['Идентификатор акции']]
        let nmIds = sheetsValues.slice(1).map(m => +m[headers['Список артикулов']])
        let addedResultChunk = await this.PromotionsApiService.addGoodsToPromotion({ type, nmIds, promotionId });
        return addedResultChunk
    }

    async downloadPromotionExcelCookie({ type, promotionId, isRecovery }: { type: string, promotionId: number, isRecovery: boolean }) {
        let promotionDetails = await this.PromotionsApiService.getPromotionsDetailsCookies({ type, promotionId });
        await this.PromotionsApiService.createPromotionsExcel({ type, periodID: promotionDetails.periodID, isRecovery });
        let base64String = (await this.PromotionsApiService.getPromotionsExcelData({ type, periodID: promotionDetails.periodID, isRecovery })).file;

        const buffer = Buffer.from(base64String, 'base64');
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: string[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const chunkSize = 100000;
        const header = jsonData[0];
        const chunks = [];
        for (let i = 1; i < jsonData.length; i += chunkSize) {
            chunks.push(jsonData.slice(i, i + chunkSize));
        }

        return { periodID: promotionDetails.periodID, chunks, header, isRecovery };
    }

    async deletePromotionGoodsCookie({ type, excelData }
        : { type: string, excelData: { periodID: number, chunks: any[], header: string[], isRecovery: boolean } })
        : Promise<void> {
        const { chunks, header, isRecovery, periodID } = excelData

        for (const chunk of chunks) {
            const chunkWithHeader = [header, ...chunk];
            const newWorkbook = xlsx.utils.book_new();
            const newWorksheet = xlsx.utils.aoa_to_sheet(chunkWithHeader);
            xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, `Акции`);
            const buffer = xlsx.write(newWorkbook, { type: 'buffer' });
            const base64String = buffer.toString('base64');

            await this.PromotionsApiService.changePromotionGoodsByExcel({ type, periodID, file: base64String, isRecovery });
        }
    }

    async addPromotionGoodsCookie({ type, excelData, nmIds }
        : { type: string, nmIds: number[], excelData: { periodID: number, chunks: any[], header: string[], isRecovery: boolean } })
        : Promise<void> {
        const { chunks, header, periodID, isRecovery } = excelData

        for (const chunk of chunks) {
            const chunkWithHeader = [header, ...chunk];
            const nmIdColIndex = header.indexOf('Артикул WB');

            if (nmIdColIndex === -1) {
                this.logger.error(`Столбец "Артикул WB" не найден в файле.`);
                continue;
            }

            const filteredData = [header, ...chunkWithHeader.slice(1).filter(row => nmIds.includes(+row[nmIdColIndex]))];

            if (filteredData.length === 1) {
                this.logger.log(`Необходимых данных в файле нет.`);
                continue;
            }

            const newWorkbook = xlsx.utils.book_new();
            const newWorksheet = xlsx.utils.aoa_to_sheet(filteredData);
            xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, `Акции`);
            const buffer = xlsx.write(newWorkbook, { type: 'buffer' });
            const base64String = buffer.toString('base64');

            await this.PromotionsApiService.changePromotionGoodsByExcel({ type, periodID, file: base64String, isRecovery });
        }
    }

    async getParams() {
        let values = await this.GsheetsService.getValues({ range: `'Параметры'!A1:ZZ`, spreadsheetId: process.env.WB_PROMOTIONS_SSID })
        let header = await this.JSHelperService.makeHeader({ sheetsValues: values })
        return values
            .slice(1)
            .reduce((acc, row) => {
                acc[row[header['Параметр']]] = this.JSHelperService.parseNumber(row[header['Значение']])
                return acc
            }, {})
    }

    async getTarifs() {
        let values = await this.GsheetsService.getValues({ range: `'Комиссия ВБ'!A1:ZZ`, spreadsheetId: process.env.WB_COMMISSION_SSID })
        let header = await this.JSHelperService.makeHeader({ sheetsValues: values })
        return values
            .slice(1)
            .reduce((acc, row) => {
                acc[row[header['Предмет']]] = this.JSHelperService.parseNumber(row[header['Склад WB, %']])
                return acc
            }, {})
    }
}
