import { Logger } from '@nestjs/common';
import axios from 'axios';
import { PricesAndDiscountsDto } from './dto/index';
export class WbExpressConnectorService {

    constructor() {}

    private readonly logger = new Logger(WbExpressConnectorService.name);

    async getWbPricesAndDiscounts(type: string, limit?: number): Promise<PricesAndDiscountsDto[]> {
        let failedAttempts = 0;
        let url = `http://${process.env.EXPRESS_SERVER_ADDRESS}:${process.env.EXPRESS_SERVER_PORT}/WbClient`;
        while (true) {
            try {
                this.logger.log(`WbPricesAndDiscounts request sended`)
                let response = await axios.post(url, {
                    action: 'getPricesDiscounts',
                    limit,
                    type,
                });
                if (response.data.data.error) throw new Error(response.data.data.error)
                let goods: PricesAndDiscountsDto[] = response.data.data.goods;
                return goods
            } catch (err) {
                this.logger.error(`getWbPricesAndDiscounts error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err.response;
                }
                await new Promise(resolve => setTimeout(resolve, 60*1000));
            }
        }
    }

    async getWbOrders(type: string, days?: number, articles: boolean = true) {
        let failedAttempts = 0;
        let url = `http://${process.env.EXPRESS_SERVER_ADDRESS}:${process.env.EXPRESS_SERVER_PORT}/WBOrders`;
        while (true) {
            try {
                this.logger.log(`getWbOrders request sended`)
                let response = await axios.post(url, {
                    action: 'getOrders',
                    type,
                    days,
                    articles,
                });
                return response.data.data;
            } catch (err) {
                this.logger.error(`getWbOrders error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err.response;
                }
                await new Promise(resolve => setTimeout(resolve, 60*1000));
            }
        }

    }

    async getWbStocksHistory(type: string, days: number = 30) {
        let failedAttempts = 0;
        let url = `http://${process.env.EXPRESS_SERVER_ADDRESS}:${process.env.EXPRESS_SERVER_PORT}/Stocks`;
        while (true) {
            try {
                this.logger.log(`getWbStocksHistory request sended`)
                let response = await axios.post(url, {
                    action: 'getStocksHistory',
                    market: `wb${type[0].toUpperCase()}${type[1].toLowerCase()}`,
                    days,
                });
                return response.data.data;
            } catch (err) {
                this.logger.error(`getWbStocksHistory error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err.response;
                }
                await new Promise(resolve => setTimeout(resolve, 60*1000));
            }
        }

    }

}
