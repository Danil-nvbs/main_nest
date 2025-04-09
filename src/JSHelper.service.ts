import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { parse } from 'papaparse';
import { GsheetsService } from 'src/gsheets/gsheets.service';


type Supplier = 'sima' | 'komus' | 'relef' | 'samson';

@Injectable()
export class JSHelperService {

    constructor(
        private readonly GsheetsService: GsheetsService,

    ) { }

    makeHeader({ sheetsValues }) {
        return sheetsValues[0].reduce((acc, header, index) => {
            acc[header] = index;
            return acc;
        }, {});

    }

    async getMinuses({ options }: { options: { type?: string, convert?: boolean } }) {
        options = options || {}
        let { type = 'ALL', convert = false } = options

        let finObj = {}
        let storeValues = await this.GsheetsService.getValues({ range: `'База'!A1:ZZ`, spreadsheetId: process.env.WAREHOUSE_SSID })
        let storeHeader = storeValues[0].reduce((acc, header, index) => {
            acc[header] = index;
            return acc;
        }, {});


        for (let row of storeValues.slice(1)) {
            let art = String(convert ? row[storeHeader['Номенклатура WB']] : row[storeHeader['Артикул склад']]).toLowerCase()
            if (!finObj.hasOwnProperty(art)) finObj[art] = String(row[storeHeader['СТАТУС']]).toLowerCase() == 'не активен' ? true : false
        }

        if (type != 'WB' && type != 'OZON') type = 'ALL'
        if (type == 'WB' || type == 'ALL') {
            let wbData = await this.GsheetsService.getValues({ range: `'Номенклатуры Минус'!${convert ? 'B' : 'C'}2:${convert ? 'B' : 'C'}`, spreadsheetId: process.env.PNDWB_SSID })
            for (let [art] of wbData) {
                if (!finObj.hasOwnProperty(String(art).toLowerCase())) finObj[String(art).toLowerCase()] = true
            }
        }

        if ((type == 'OZON' || type == 'ALL') && !convert) {
            let ozonData = await this.GsheetsService.getValues({ range: `'Номенклатуры Минус'!A2:A`, spreadsheetId: process.env.PNDOZON_SSID })
            for (let [art] of ozonData) {
                if (!finObj.hasOwnProperty(String(art).toLowerCase())) finObj[String(art).toLowerCase()] = true
            }
        }
        return finObj
    }

    async getKits() {
        let stocks = await this.getOurStocks()

        let kitsArr = await this.GsheetsService.getValues({ spreadsheetId: process.env.WAREHOUSE_SSID, range: "'База Наборов'!A1:ZZ" })
        let header = await this.makeHeader({ sheetsValues: kitsArr })

        let finObj = kitsArr.slice(1).reduce((acc, row) => {
            acc[row[header['Артикул набора']]] = {
                content: {},
                stock: 0,
                comment: row[header['Комментарий для склада']],
                onlyFbs: row[header['Только для фбс']] == 'да' ? true : false
            }

            for (let col in header) {
                if (col != 'Артикул набора' && col.split(' ')[0] == 'Артикул' && row[header[col]] && row[header[`Кол-во ${col.split(' ')[1]}`]]) {
                    acc[row[header['Артикул набора']]].content[row[header[col]]] = +row[header[`Кол-во ${col.split(' ')[1]}`]]
                }
            }

            return acc
        }, {})

        while (true) {
            let findAny = false
            for (let art in finObj) {

                let enought = true
                for (let ctx in finObj[art].content) {
                    if (stocks[String(ctx).toLowerCase()] < finObj[art].content[ctx]) enought = false
                }

                if (!enought) continue

                for (let ctx in finObj[art].content) stocks[String(ctx).toLowerCase()] -= finObj[art].content[ctx]
                finObj[art].stock += 1
                findAny = true
            }

            if (!findAny) break
        }
        return finObj
    }

    async getOurStocks() {
        let stocksValues = await this.GsheetsService.getValues({ spreadsheetId: process.env.WAREHOUSE_SSID, range: "'База'!A1:ZZ" })
        let header = await this.makeHeader({ sheetsValues: stocksValues })
        let result = stocksValues.slice(1).reduce((acc, row) => {
            let art = String(row[header['Артикул склад']]).toLowerCase()
            acc[art] = +this.parseNumber(row[header['Остаток склад']])
            return acc
        }, {})
        return result
    }

    async createLogisticCalc() {
        const spreadsheetId = process.env.PNDWB_SSID;

        const [sizeSettingValues, packagingValues] = await Promise.all([
            this.GsheetsService.getValues({ range: `'Параметры Размеров'!A1:ZZ`, spreadsheetId }),
            this.GsheetsService.getValues({ range: `'Упаковка'!A1:ZZ`, spreadsheetId })
        ]);

        const sizeHeaders = this.makeHeader({ sheetsValues: sizeSettingValues });
        const sizeSettings = sizeSettingValues.slice(1).reduce((acc, row) => {
            acc[row[sizeHeaders['Параметр']]] = this.parseNumber(row[sizeHeaders['Значение']]);
            return acc;
        }, {});

        const packagingSettings = packagingValues.reduce((acc, row) => {
            acc[row[0]] = this.parseNumber(row[1]);
            return acc;
        }, {});

        const settings = { ...sizeSettings, ...packagingSettings };

        return (volume: number) => {
            const logisticParams = {
                delivery_cost: null,
                storage_cost: null,
                pack_and_delivery_cost: null,
            };

            const deliveryCoef = volume > 1
                ? settings['Логистика базовая цена'] + (volume - 1) * settings['Логистика цена за доп. литр']
                : settings['Логистика базовая цена'];

            const storageCoef = volume > 1
                ? settings['Хранение базовая цена'] + (volume - 1) * settings['Хранение цена за доп. литр']
                : settings['Хранение базовая цена'];

            logisticParams.delivery_cost = deliveryCoef
                ? deliveryCoef * settings['Коэффициент на логистику сверху']
                : settings['Финальная стоимость доставки'];

            logisticParams.storage_cost = storageCoef
                ? storageCoef * settings['Хранение дней']
                : settings['Хранение закреп'];

            logisticParams.pack_and_delivery_cost = volume >= 1
                ? Math.min(
                    settings['Фиксированные расходы'] + (volume - 1) * settings['Расход на литры, кроме первого'],
                    settings['Максимальная стоимость упаковки и доставка на 1 товар']
                )
                : settings['Фиксированные расходы'];

            return logisticParams;
        };
    }

    parseNumber(value: string | number): number {
        const parsedValue = String(value).replace(/\s+/g, '').replace(/,/gi, '.');
        return parsedValue.includes('%')
            ? +parsedValue.replace(/%/gi, '') / 100
            : +parsedValue;
    }

    async createPriceCalc({ spreadsheetId }) {
        let labelsData = await this.GsheetsService.getValues({ range: "'Этикетки'!A1:ZZ", spreadsheetId: process.env.WAREHOUSE_SSID });
        let header = this.makeHeader({ sheetsValues: labelsData });

        let labelsPrice = labelsData.slice(1).reduce((acc, row) => {
            let lowArt = String(row[header['article']]).toLowerCase();
            if (!acc[lowArt]) acc[lowArt] = this.parseNumber(row[header['Цена 1 этикетки, руб']])
            return acc;
        }, {});
        let lostPrices = [];
        return async ({ art, bigBaseRow, final }: { art?: string, bigBaseRow?: {}, final?: string }) => {
            if (!final) {
                let basePrice = +bigBaseRow['cost_wb_stock_1c'] || +bigBaseRow['average_cost_full_1c'] || +bigBaseRow['cost_full_1c'] || +bigBaseRow['cost_invoice'];
                if (!basePrice) lostPrices.push([art, 'Нет закупочной цены']);
                if (!bigBaseRow['incoming_vat']) lostPrices.push([art, 'Нет входящего НДС']);
                if (!bigBaseRow['vat']) lostPrices.push([art, 'Нет исходящего НДС']);
                if (!basePrice || !bigBaseRow['incoming_vat'] || !bigBaseRow['vat']) return {};
                let inVat = String(bigBaseRow['incoming_vat']).toLowerCase() == 'без ндс' ? 0 : this.parseNumber(bigBaseRow['incoming_vat'])
                let outVat = String(bigBaseRow['vat']).toLowerCase() == 'без ндс' ? 0 : this.parseNumber(bigBaseRow['vat'])
                let finalPrice = ((basePrice * (bigBaseRow['pack'] || 1)) / (1 + inVat)) * (1 + outVat) + (labelsPrice[String(art).toLowerCase()] || 0);
                return { basePrice, finalPrice };
            } else {
                await this.GsheetsService.clearValues({ range: `'${final}'!A2:B`, spreadsheetId });
                if (!lostPrices.length) return;
                await this.GsheetsService.setValues({ range: `'${final}'!A2:B`, values: lostPrices, spreadsheetId });
                throw `Нет обязательных данных (Себестоимости, входящего или исходящего НДС, подробности на листе "${final}")`;
            }
        };
    }

    async getSupplierStocks({ supplier }: { supplier: Supplier }) {
        let ip = `http://${process.env.EXPRESS_SERVER_ADDRESS}`
        let fileName = supplier == 'sima'
            ? 'stocks.txt'
            : supplier == 'relef'
                ? 'stocks_relef.txt'
                : supplier == 'komus'
                    ? 'stocks_komus.txt'
                    : supplier == 'samson'
                        ? 'stocks_samson.txt'
                        : null

        let stocksFile = (await axios.get(ip + ':5464/wb_vendorcodes/' + fileName)).data;
        const stocksObj = (await new Promise<string[][]>((resolve, reject) => {
            parse(stocksFile, {
                delimiter: ';',
                header: false,
                complete: (results) => {
                    resolve(results.data as string[][]);
                },
                error: (error) => {
                    reject(error);
                }
            });
        }))
            .reduce((acc, row: string[]) => {
                if (!acc[row[0]]) acc[row[0]] = 0;
                acc[row[0]] += +row[1];
                return acc;
            }, {});
        return stocksObj
    }
}
