import { Injectable, Logger } from '@nestjs/common';
import { BigbaseService } from 'src/bigbase/bigbase.service';
import { StocksApiService } from 'src/ozon/api/stocks.service';
import { OzonDischargeService } from 'src/ozon/discharge/discharge.service';
import { OzonExpressConnectorService } from 'src/ozon/expressConnector.service';
import { WbExpressConnectorService } from 'src/wildberries/api/expressConnector.service';
import { ReportsApiService } from 'src/wildberries/api/reports.service';
import { OzonOrdersApiService } from 'src/ozon/api/orders.service'
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { YandexExpressConnectorService } from 'src/yandex/expressConnector.service';
import { YandexPricesApiService } from 'src/yandex/api/prices.service'
import { YandexStocksApiService } from 'src/yandex/api/stocks.service';
import { YandexOrdersApiService } from 'src/yandex/api/orders.serivce';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';

@Injectable()
export class MarginService {
        constructor(  
            private readonly BigbaseService: BigbaseService,
            private readonly WildberriesReportsApiService: ReportsApiService,
            private readonly WbExpressConnectorService: WbExpressConnectorService,
            private readonly OzonDischargeService: OzonDischargeService,
            private readonly OzonStocksApiService: StocksApiService,
            private readonly OzonExpressConnectorService: OzonExpressConnectorService,
            private readonly OzonOrdersApiService: OzonOrdersApiService,
            private readonly GsheetService: GsheetsService,
            private readonly YandexExpressConnectorService: YandexExpressConnectorService,
            private readonly YandexPricesApiService: YandexPricesApiService,
            private readonly YandexStocksApiService: YandexStocksApiService,
            private readonly YandexOrdersApiService: YandexOrdersApiService,
            private readonly RegularTasksService: RegularTasksService,
        ) {}
        private readonly logger = new Logger(MarginService.name)
        STM: {}

        async updateMarginSheet() {
            try {
                const STM = await this.BigbaseService.getStm()
                await Promise.all([
                    this.getWbData(STM), 
                    this.getOzonData(STM), 
                    this.getYandexData(STM),
                ])
                this.logger.log(`Markets promises solved`)
                this.countCountable(STM)
    
                let headers = (await this.GsheetService.getValues({ 
                    range: `'Маржа по брендам (как надо)'!1:1`, 
                    spreadsheetId: process.env.MARGIN_SSID
                }))[0].reduce((acc, col, idx) => {acc[col] = idx; return acc}, {})
    
                let finArr = []
                for (let art in STM) {
                    let newRow = []
                    newRow[headers['Артикул']] = String(art).toUpperCase()
                    newRow[headers['Бренд']] = STM[art].brand
                    newRow[headers['Название']] = STM[art].name
                    for (let col in STM[art]) {
                        if (!headers.hasOwnProperty(col)) continue
                        newRow[headers[col]] = STM[art][col]
                    }
                    finArr.push(newRow)
                }
                await this.GsheetService.clearValues({ 
                    range: `'Маржа по брендам (как надо)'!A2:ZZ`, 
                    spreadsheetId: process.env.MARGIN_SSID 
                })
                await this.GsheetService.setValues2({
                    range: `'Маржа по брендам (как надо)'!A2:ZZ`, 
                    spreadsheetId: process.env.MARGIN_SSID, 
                    values: finArr 
                })
                await this.RegularTasksService.registerTask('margin_refresh', { success: true, message: 'Маржа обновлена' })
                return STM
            } catch (err) {
                await this.RegularTasksService.registerTask('margin_refresh', { success: false, message: err.message })
                return err
            }
        }

        async getWbData(STM) {
            let [
                prices, 
                stocks, 
                orders, 
                stocksHistory,
            ] = await Promise.all([
                this.WbExpressConnectorService.getWbPricesAndDiscounts('PK'),
                this.WildberriesReportsApiService.getFboStocks('PK'),
                this.WbExpressConnectorService.getWbOrders('PK'),
                this.WbExpressConnectorService.getWbStocksHistory('PK'),                
            ])

            for (let priceElem of prices) {
                let lowArt = String(priceElem.art).toLowerCase()
                if (!STM[lowArt]) continue
                STM[lowArt]['Номенклатура ВБ'] = priceElem.nmId
                STM[lowArt]['РРЦ WB'] = Math.round(priceElem.price * (1-(priceElem.discount/100)))
            } 

            for (let stockElem of stocks) {
                let lowArt = String(stockElem.supplierArticle).toLowerCase()
                if (!STM[lowArt]) continue
                if (!STM[lowArt]['Остаток WB']) STM[lowArt]['Остаток WB'] = 0
                STM[lowArt]['Остаток WB'] += +stockElem.quantity
            }

            for (let art in orders) {
                let lowArt = String(art).toLowerCase()
                if (!STM[lowArt]) continue
                STM[lowArt]['Заказы WB'] = orders[art]
            }

            for (let art in stocksHistory) {
                let lowArt = String(art).toLowerCase()
                if (!STM[lowArt]) continue
                STM[lowArt]['Дней на стоке WB'] = stocksHistory[art]
            }
        }

        async getOzonData(STM) {
            let [
                discharge,
                stocks,
                orders, 
                stocksHistory,
            ] = await Promise.all([
                this.OzonDischargeService.getDischarge({columns: ['article', 'ozon_id', 'price_with_disc', 'sku'], type: 'PK'}),
                this.OzonStocksApiService.getFboStocks('PK'),
                this.OzonOrdersApiService.getOrders({type: 'PK'}),
                this.OzonExpressConnectorService.getOzonStocksHistory('pk'),
            ]);

            for (let stockElem of stocks) {
                let lowArt = String(stockElem.item_code).toLowerCase()
                if (!STM[lowArt]) continue
                if (!STM[lowArt]['Остаток OZON']) STM[lowArt]['Остаток OZON'] = 0
                STM[lowArt]['Остаток OZON'] += +stockElem.free_to_sell_amount
            }

            for (let orderElem of orders) {
                for (let product of orderElem.products) {
                    let lowArt = String(product.offer_id).toLowerCase()
                    if (!STM[lowArt]) continue
                    if (!STM[lowArt]['Заказы OZON']) STM[lowArt]['Заказы OZON'] = 0
                    STM[lowArt]['Заказы OZON'] += +product.quantity
                }
            }

            for (let art in stocksHistory) {
                let lowArt = String(art).toLowerCase()
                if (!STM[lowArt]) continue
                STM[lowArt]['Дней на стоке OZON'] = stocksHistory[art]
            }

            for (let dischargeElem of discharge) {
                let lowArt = String(dischargeElem.article).toLowerCase()
                if (!STM[lowArt]) continue
                STM[lowArt]['OZON ID'] = dischargeElem.ozon_id
                STM[lowArt]['OZON SKU'] = dischargeElem.sku
                STM[lowArt]['РРЦ OZON'] = dischargeElem.price_with_disc

            }
        }

        async getYandexData(STM) {
            let [
                pricesFbo,
                pricesFbs,
                stocks,
                orders, 
                stocksHistory,
            ] = await Promise.all([
                this.YandexPricesApiService.getPrices({ model: 'fbo', articles: Object.keys(STM).map(m=>String(m).toUpperCase()) }),
                this.YandexPricesApiService.getPrices({ model: 'fbs', articles: Object.keys(STM).map(m=>String(m).toUpperCase()) }),
                this.YandexStocksApiService.getStocks({ model: 'fbo' }),
                this.YandexOrdersApiService.getOrders({}),
                this.YandexExpressConnectorService.getYandexStocksHistory('pk'),
            ]);


            for (let pricesFboElem of pricesFbo) {
                let lowArt = String(pricesFboElem.offerId).toLowerCase()
                if (!STM[lowArt]) continue
                STM[lowArt]['РРЦ YANDEX FBY'] = pricesFboElem?.campaignPrice?.value || null
            }

            for (let pricesFbsElem of pricesFbs) {
                let lowArt = String(pricesFbsElem.offerId).toLowerCase()
                if (!STM[lowArt]) continue
                STM[lowArt]['РРЦ YANDEX FBS'] = pricesFbsElem?.campaignPrice?.value || null
            }

            for (let warehouse of stocks) {
                for (let offer of warehouse.offers) {
                    let lowArt = String(offer.offerId).toLowerCase()
                    if (!STM[lowArt]) continue
                    if (!STM[lowArt]['Остаток YANDEX']) STM[lowArt]['Остаток YANDEX'] = 0
                    STM[lowArt]['Остаток YANDEX'] += +offer.stocks
                                                               .filter(f=>f.type == 'AVAILABLE')
                                                               .reduce((acc, elem) => acc + +elem.count, 0)
                }
            }

            for (let order of orders) {
                for (let item of order.items) {
                    let lowArt = String(item.shopSku).toLowerCase()
                    if (!STM[lowArt]) continue
                    if (!STM[lowArt]['Заказы YANDEX']) STM[lowArt]['Заказы YANDEX'] = 0
                    STM[lowArt]['Заказы YANDEX'] += +item.count
                }
            }

            for (let art in stocksHistory) {
                let lowArt = String(art).toLowerCase()
                if (!STM[lowArt]) continue
                if (!STM[lowArt]['Дней на стоке YANDEX']) STM[lowArt]['Дней на стоке YANDEX'] = 0
                STM[lowArt]['Дней на стоке YANDEX'] += +stocksHistory[art]
            }
        }

        countCountable(STM) {
            for (let market of ['WB', 'OZON', 'YANDEX']) {
                for (let art in STM) {
                    STM[art][`Заказы ${market}`] = STM[art][`Заказы ${market}`] || 0
                    STM[art][`Дней на стоке ${market}`] = STM[art][`Дней на стоке ${market}`] || 0
    
                    STM[art][`Средние заказы ${market}`] = STM[art][`Заказы ${market}`] / (STM[art][`Дней на стоке ${market}`] || 0);
                    STM[art][`Средние заказы ${market}`]= isFinite(STM[art][`Средние заказы ${market}`]) ? STM[art][`Средние заказы ${market}`] : 'N/A';
    
                    STM[art][`Оборачиваемость ${market}`] = STM[art][`Остаток ${market}`] / STM[art][`Средние заказы ${market}`] || 99999;
                    STM[art][`Оборачиваемость ${market}`] = isFinite(STM[art][`Оборачиваемость ${market}`]) ? STM[art][`Оборачиваемость ${market}`] : 99999;
                }
            }
        }
}
