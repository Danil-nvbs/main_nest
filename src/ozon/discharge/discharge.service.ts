import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { DischargeOzonResponseDto } from './dto/dischargeOzonResponseDto';


@Injectable()
export class OzonDischargeService {

    private readonly logger = new Logger(OzonDischargeService.name);
    private headers: AxiosRequestConfig['headers'] = {
        'Content-Type': 'application/json',
    };
    constructor() { }

    async getDischarge({ filters = [], columns = [], type }) {
        let failedAttempts = 0;
        let discharge = []
        interface IBody {
            "action": string,
            'type': string,
            "offset"?: number,
            'columns'?: string[],
            'filter'?: Object[] 
        }
        let body: IBody = {
            offset: 0,
            filter: filters,
            columns,
            action: 'getJSON',
            type,
        }
        while (true) {
            try {
                let url = `http://${process.env.EXPRESS_SERVER_ADDRESS}:${process.env.EXPRESS_SERVER_PORT}/DischargeOzon`;
                let response = await axios.post(url, body, { headers: this.headers });
                let data: DischargeOzonResponseDto = response.data;

                if (!data.data.results.length) {
                    return discharge;
                }
                discharge.push(...data.data.results)
                body.offset += data.data.results.length
            } catch (err) {
                this.logger.log(err.message);
                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err;
                }
                await this.sleep(5000);
            }
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
