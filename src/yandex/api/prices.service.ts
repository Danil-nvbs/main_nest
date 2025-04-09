import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { PricesDto } from './dto/index';
import { BaseYandexApiService } from './baseYandexApi.service';

interface IPrices {
    articles?: string[];
    model: string;
}
export class YandexPricesApiService extends BaseYandexApiService {

    constructor() {
        super();
    }

    private readonly logger = new Logger(YandexPricesApiService.name);
    
    async getPrices({ articles = [], model }: IPrices) {
        let url = `https://api.partner.market.yandex.ru/campaigns/${this.getCampaignId(model)}/offers`;
    
        let finArr: PricesDto[] = [];
        
        let limit = 100
        let attempts = 0
        let pageToken = null
        if (!articles.length) {
            while (true) {
                try {
                    this.logger.log(`Getting YANDEX prices with paging: page ${Math.ceil(finArr.length / limit) +1} of ???`)
                    let response = await axios.post(url, {}, { headers: this.headers, params: {
                        limit,
                        page_token: pageToken
                    } });
                    finArr = finArr.concat(response.data.result.offers);
                    if (!response.data.result?.paging?.nextPageToken) break;
                    pageToken = response.data.result?.paging?.nextPageToken;
                } catch (err) {
                    attempts++;
                    this.logger.log(`Attempt ${attempts}: ${err}`);
                    if (attempts >= 10) throw err;
                    await this.sleep(60*1000)
                }
            }
        } else {
            let page = 0;
            while (true) {
                try {
                    let chunk = articles.slice(page * limit, (page + 1) * limit);
                    if (!chunk.length) break;
                    this.logger.log(`Getting YANDEX prices by articles: page ${page+1} of ${Math.ceil(articles.length / limit)}`)
                    let response = await axios.post(url, { offerIds: chunk }, { headers: this.headers });
                    finArr = finArr.concat(response.data.result.offers);
                    page++;
                } catch (err) {
                    attempts++;
                    this.logger.log(`Attempt ${attempts}: ${err}`);
                    if (attempts >= 10) throw err;
                    await this.sleep(60*1000)
                }
            }
        }
        return finArr;
    }
}




