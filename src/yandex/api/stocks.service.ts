import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { StocksDto } from './dto/index';
import { BaseYandexApiService } from './baseYandexApi.service';

interface IStocks {
    articles?: string[];
    model: string;
}
export class YandexStocksApiService extends BaseYandexApiService {

    constructor() {
        super();
    }

    private readonly logger = new Logger(YandexStocksApiService.name);
    
    async getStocks({ articles = [], model }: IStocks) {
        let url = `https://api.partner.market.yandex.ru/campaigns/${this.getCampaignId(model)}/offers/stocks`

        let finArr:StocksDto[] = []
        let limit = 100
        let attempts = 0
        let page = 0
        let pageToken = null
        if (!articles.length) {
            while (true) {
                let attempts = 0
                try {
                    this.logger.log(`Getting YANDEX stocks with paging: page ${page+1} of ???`)
                    
                    let response = await axios.post(url, {}, { headers: this.headers, params: {
                        limit,
                        page_token: pageToken
                    } })
                    attempts = 0
                    finArr = finArr.concat(response.data.result.warehouses);
                    if (!response.data.result?.paging?.nextPageToken) break;
                    pageToken = response.data.result?.paging?.nextPageToken;
                    page++
                } catch (err) {
                    attempts++;
                    this.logger.log(`Attempt ${attempts}: ${err}`);
                    if (attempts >= 10) throw err;
                    await this.sleep(60*1000)
                }
            }
        } else {
            while (true) {
                try {
                    let chunk = articles.slice(page * limit, (page + 1) * limit);
                    if (!chunk.length) break;
                    this.logger.log(`Getting YANDEX stocks by articles: page ${page+1} of ${Math.ceil(articles.length / limit)}`)
                    let response = await axios.post(url, { offerIds: chunk }, { headers: this.headers });
                    attempts = 0
                    finArr = finArr.concat(response.data.result.warehouses);
                    page++;
                } catch (err) {
                    attempts++;
                    this.logger.log(`Attempt ${attempts}: ${err}`);
                    if (attempts >= 10) throw err;
                    await this.sleep(60*1000)
                }
            }
        }
        return finArr
    }
}




