import { Logger } from '@nestjs/common';
import axios from 'axios';
import { OrdersApiDto, OrdersDetailsApiDto } from './dto/index';
import { BaseKomusApiService } from './baseKomusApi.service';

export class KomusApiService extends BaseKomusApiService {
    private readonly logger = new Logger(KomusApiService.name);

    constructor() {
        super();
    }

    async getOrders({ marketplace }: { marketplace: string }) {
        this.setHeaders({marketplace});
        let failedAttempts = 0;
        let orders = [];
        let params = {
            page: 1,
            limit: 250
        }
        while (true) {
            try {
                let url = `https://komus-opt.ru/api2/orders`;
                let response = await axios.get(url, {
                    params,
                    headers: this.headers
                });
                let data: OrdersApiDto = response.data;
                orders = orders.concat(data.content);
                if (!data.next) {
                    return orders;
                }
                params.page++
                failedAttempts = 0;

            } catch (err) {
                this.logger.error(`KomusApi getShipments: Error: ${err.message}`);
                failedAttempts++;

                if (failedAttempts >= 10) {
                    throw err.response;
                }

                await this.sleep(1000 * failedAttempts ** 2);
            }
        }
    }

    async getOrdersDetails({ id, marketplace }: { id: string, marketplace: string }) {
        this.setHeaders({marketplace});
        let failedAttempts = 0;
        while (true) {
            try {
                let url = `https://komus-opt.ru/api2/orders/${id}`;
                let response = await axios.get(url, {
                    headers: this.headers
                });
                let data: OrdersDetailsApiDto = response.data;
                return data

            } catch (err) {
                this.logger.error(`KomusApi getShipments: Error: ${err.message}`);
                failedAttempts++;

                if (failedAttempts >= 10) {
                    throw err.response;
                }

                await this.sleep(1000 * failedAttempts ** 2);
            }
        }

    }
}