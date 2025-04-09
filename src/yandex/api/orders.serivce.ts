import { Logger } from '@nestjs/common';
import axios from 'axios';
import { OrdersDto } from './dto/index';
import { BaseYandexApiService } from './baseYandexApi.service';

interface IOrders {
    model?: string;
    dateFrom?: string;
    dateTo?: string;
    days?: number;
}
export class YandexOrdersApiService extends BaseYandexApiService {

    constructor() {
        super();
    }

    private readonly logger = new Logger(YandexOrdersApiService.name);
    
    async getOrders({ model, dateTo, dateFrom, days }: IOrders) {

        let now = new Date();
        now.setDate(now.getDate());
        now.setHours(0, 0, 0, 0);
        now.setMilliseconds(now.getMilliseconds() - 1);
        dateTo = dateTo || now.toISOString().split('T')[0];

        now.setDate(now.getDate() - (days ? days-1 : 29));
        now.setMilliseconds(now.getMilliseconds() + 1);
        dateFrom = dateFrom || now.toISOString().split('T')[0];

        let statuses = [
            'DELIVERY',
            'DELIVERED',
            'PARTIALLY_DELIVERED',
            'PARTIALLY_RETURNED',
            'PENDING',
            'PICKUP',
            'PROCESSING',
            'RESERVED',
            'UNPAID',
        ];

        let finArr: OrdersDto[] = []
        let limit = 100
        let page = 0
        let pageToken = null

        let urls = [];
        if (!model || String(model).toLowerCase() == 'fbs') urls.push(`https://api.partner.market.yandex.ru/campaigns/${this.getCampaignId('fbs')}/stats/orders`)
        if (!model || ['fbo', 'fby'].includes(String(model).toLowerCase())) urls.push(`https://api.partner.market.yandex.ru/campaigns/${this.getCampaignId('fbo')}/stats/orders`)

        let ordersGetter = async (url: string) => {
            let attempts = 0
            while (true) {
                try {
                    this.logger.log(`Getting YANDEX orders with paging: page ${page+1} of ???`)
                    let response = await axios.post(url, { dateFrom, dateTo, statuses }, { headers: this.headers, params: {
                        limit,
                        page_token: pageToken
                    } })
                    attempts = 0
                    finArr = finArr.concat(response.data.result.orders)
                    if (!response.data.result?.paging?.nextPageToken) break
                    pageToken = response.data.result?.paging?.nextPageToken
                    page++
                } catch (err) {
                    attempts++;
                    this.logger.log(`Attempt ${attempts}: ${err}`)
                    if (attempts >= 10) throw err
                    await this.sleep(60*1000)
                }
            }
        }

        await Promise.all(urls.map(m=>ordersGetter(m)))
        return finArr
    }
}




