import { Logger } from '@nestjs/common';
import axios from 'axios';

export class OzonExpressConnectorService {

    constructor() {}

    private readonly logger = new Logger(OzonExpressConnectorService.name);

    async getOzonStocksHistory(type: string, days: number = 30) {
        let failedAttempts = 0;
        let url = `http://${process.env.EXPRESS_SERVER_ADDRESS}:${process.env.EXPRESS_SERVER_PORT}/Stocks`;
        while (true) {
            try {
                this.logger.log(`getOzonStocksHistory request sended`)
                let response = await axios.post(url, {
                    action: 'getStocksHistory',
                    market: `ozon`,
                    days,
                });
                return response.data.data;
            } catch (err) {
                this.logger.error(`getOzonStocksHistory error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err.response;
                }
                await new Promise(resolve => setTimeout(resolve, 60*1000));
            }
        }
    }

}
