import { Logger } from '@nestjs/common';
import axios from 'axios';
import { BaseOzonApiService } from './baseOzonApi.service';
import { OzonApiOrdersDto } from './dto/index';

interface IOrders {
    type: string;
    model?: string;
    onlySales?: boolean;
    dateFrom?: string;
    dateTo?: string;
    days?: number;
    agregateByRegion?: boolean;
}
export class OzonOrdersApiService extends BaseOzonApiService {

    constructor() {
        super();
    }

    private readonly logger = new Logger(OzonOrdersApiService.name);

    async getOrders({ type, model, onlySales, dateFrom, dateTo, days = 30, agregateByRegion = false }: IOrders) {
        this.setHeaders(type)
        if (!dateFrom && !dateTo) {
            let now = new Date();
            now.setDate(now.getDate());
            now.setHours(3, 0, 0, 0);
            now.setMilliseconds(now.getMilliseconds() - 1);
            dateTo = now.toISOString();

            now.setDate(now.getDate() - days);
            now.setMilliseconds(now.getMilliseconds() + 1);
            dateFrom = now.toISOString();
        } else {
            let [year, month, day] = dateFrom.split('-');
            if (dateFrom) {
                let dateFromObj = new Date(Date.UTC(+year, +month - 1, +day));
                dateFrom = dateFromObj.toISOString();
            }

            if (dateTo) {
                let dateToParts = dateTo.split('-');
                let dateToObj = new Date(Date.UTC(+year, +month - 1, +day, 23, 59, 59, 999));
                dateTo = dateToObj.toISOString();
            }
        }

        this.logger.log(`Gettion OZON orders for type: ${type}, model: ${model || 'ALL'}, dates: ${dateFrom}-${dateTo}`)
        let finArr: OzonApiOrdersDto[] = [];
        let attemps = 0;

        let urls = [];

        if (model == 'fbo' || !model) urls.push('https://api-seller.ozon.ru/v2/posting/fbo/list');
        if (model == 'fbs' || !model) urls.push('https://api-seller.ozon.ru/v2/posting/fbs/list');

        const ordersGetter = async (url: string) => {
            let limit = 1000;
            let maxOffset = 20000;
            let body = {
                dir: 'asc',
                filter: {
                    since: dateFrom,
                    status: onlySales ? 'delivered' : '',
                    to: dateTo,
                },
                ...(agregateByRegion ? {
                    with: {
                        analytics_data: true,
                        financial_data: true,
                    }
                } : {}),
                limit,
                offset: 0,
            };

            while (true) {
                try {
                    let response = await axios.post(url, body, { headers: this.headers });
                    if (response.data.message) break;

                    finArr = finArr.concat(response.data.result);

                    body.offset += limit;
                    if (body.offset >= maxOffset) {
                        body.filter.since = finArr[finArr.length - 1].created_at;
                        body.offset = 0;
                    }

                    if (!response.data.result.length) break;
                } catch (err) {
                    attemps++;
                    if (attemps > 10) throw `OzonApi getOrders ${err}`;
                    if (err.code === 'EPIPE') {
                        this.logger.error('Broken pipe error. Retrying...');
                        await this.sleep(1000 * 60);
                    }
                    console.log(err);
                }
            }
        }

        await Promise.all(urls.map(url => ordersGetter(url)))

        this.logger.log(`Ozon Orders: getted ${finArr.length} orders`)
        return finArr;
    }

    async agregateOrders(orders: OzonApiOrdersDto[]) {
        let finObj = orders.reduce((acc, order) => {
            for (let product of order.products) {
                if (!acc[product.offer_id]) acc[product.offer_id] = {}
                if (!acc[product.offer_id][order.financial_data.cluster_to]) acc[product.offer_id][order.financial_data.cluster_to] = 0
                acc[product.offer_id][order.financial_data.cluster_to] += product.quantity
            }
            return acc
        }, {})
        let finArr = []
        for (let key in finObj) {
            finArr.push({ ...finObj[key], article: key })
        }
        return finArr
    }
}
