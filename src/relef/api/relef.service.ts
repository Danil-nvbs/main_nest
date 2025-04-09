import { Logger } from '@nestjs/common';
import axios from 'axios';
import { ShipmentApiDto } from './dto/index';
import { BaseRelefApiService } from './baseRelefApi.service';
import * as NodeCache from 'node-cache';
import { Agent as HttpsAgent } from 'https';

export class RelefApiService extends BaseRelefApiService {
    private readonly logger = new Logger(RelefApiService.name);

    constructor() {
        super();
    }

    async getShipments() {
        this.setHeaders();
        let failedAttempts = 0;
        let shipments = [];

        interface IBody {
            "limit": number,
            "offset": number
        }

        let body: IBody = {
            "limit": 100,
            "offset": 0,
        };

        while (true) {
            try {
                let url = `https://api-sale.relef.ru/api/v2/shipments`;
                let response = await axios.post(url, body, { headers: this.headers });
                let data: ShipmentApiDto[] = response.data.list;
                if (data.length === 0) {
                    return shipments;
                }

                shipments = shipments.concat(data);
                body.offset += body.limit;
                failedAttempts = 0;

            } catch (err) {
                this.logger.error(`RelefApi getShipments: Error: ${err.message}`);
                failedAttempts++;

                if (failedAttempts >= 10) {
                    throw err.response;
                }

                await this.sleep(1000 * failedAttempts ** 2);
            }
        }

    }
}