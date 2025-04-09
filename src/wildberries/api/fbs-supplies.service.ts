import { Logger } from '@nestjs/common';
import { BaseWildberriesApiService } from './baseWildberriesApi.serivce';
import { FbsSupplyDto } from './dto/index';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { HttpService } from '@nestjs/axios';

export class WbFbsSuppliesApiService extends BaseWildberriesApiService {

    constructor(
        gsheetsService: GsheetsService,
        httpService: HttpService,
    ) {
        super(gsheetsService, httpService);
    }

    private readonly logger = new Logger(WbFbsSuppliesApiService.name);

    async getFbsSupplies({ type }: {type: string}): Promise<FbsSupplyDto[]> {
        let failedAttempts = 0;
        let url = `https://marketplace-api.wildberries.ru/api/v3/supplies`
        let next = 0
        let limit = 1000
        let finArr: FbsSupplyDto[] = [];
        try {
            while (true) {
                let response = await this.httpService.axiosRef.get(url, {
                    params: { next, limit },
                    headers: await this.getHeaders(type) 
                });
                finArr = finArr.concat(response.data.supplies);
                if (response.data.supplies.length < limit || !response.data.next) break
                next = response.data.next;
            }
        } catch (err) {
            this.logger.error(`WbApi getFbsSupplies error: ${err.message}`);

            failedAttempts++;
            if (failedAttempts >= 10) {
                throw err.response;
            }
            await this.sleep(60*1000);
        }        
        let map = finArr.reduce((acc, order) => { acc[order.id] = (acc[order.id] || 0) + 1; return acc }, {})
        let finArrFiltered = finArr.filter(m => map[m.id] === 1)
        this.logger.log(`WbFbsSuppliesApiService getFbsSupplies success: ${finArr.length} supplies`)
        return finArrFiltered;
    }
}
