import { Logger } from '@nestjs/common';
import axios from 'axios';
import { BaseOzonApiService } from './baseOzonApi.service';
import { StocksFboDto } from './dto/index';
export class StocksApiService extends BaseOzonApiService {

    constructor() {
        super();
    }

    private readonly logger = new Logger(StocksApiService.name);

    async getFboStocks(type: string): Promise<StocksFboDto[]> {
        this.setHeaders(type)
        let failedAttempts = 0;
        let url = `https://api-seller.ozon.ru/v2/analytics/stock_on_warehouses`
        let limit = 1000
        let offset = 0
        let finArr = []
        while (true) {
            try {
                let response = await axios.post(url, {limit, offset, warehouse_type: 'ALL'}, { headers: this.headers });
                let rows: StocksFboDto[] = response.data.result.rows
                finArr = finArr.concat(rows)
                if (!rows.length || rows.length < limit) break
                offset += limit
            } catch (err) {
                this.logger.error(`OzonApi getFboStocks error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err.response;
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...');
                    await this.sleep(1000 * 60);
                }
                await this.sleep(60*1000);
            }
        }
        return finArr
    }
}
