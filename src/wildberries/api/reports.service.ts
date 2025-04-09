import { Logger } from '@nestjs/common';
import { BaseWildberriesApiService } from './baseWildberriesApi.serivce';
import { StocksFboDto } from './dto/index';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { HttpService } from '@nestjs/axios';
export class ReportsApiService extends BaseWildberriesApiService {

    constructor(
        public readonly gsheetsService: GsheetsService,
        public readonly httpService: HttpService,
    ) {
        super(gsheetsService, httpService);
    }

    private readonly logger = new Logger(ReportsApiService.name);

    async getFboStocks(type: string): Promise<StocksFboDto[]> {
        let failedAttempts = 0;
        let url = `https://statistics-api.wildberries.ru/api/v1/supplier/stocks`
        while (true) {
            try {
                const rowLimit = 60000;
                let dateFrom = '2018-01-01';
                let fboStocks: StocksFboDto[] = [];
                while (true) {
                    let response = await this.httpService.axiosRef.get(url, {
                        params: { dateFrom },
                        headers: await this.getHeaders(type) 
                    });
                    fboStocks = fboStocks.concat(response.data);
                    if (response.data.length < rowLimit) return fboStocks;

                    dateFrom = fboStocks[fboStocks.length - 1].lastChangeDate;
                    await this.sleep(60*1000);
                }
            } catch (err) {
                this.logger.error(`WbApi getFboStocks error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err.response;
                }
                await this.sleep(60*1000);
            }
        }
    }
}
