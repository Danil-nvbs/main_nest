import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

export class BaseYandexApiService {
    public headers: AxiosRequestConfig['headers'] = {
        'Content-Type': 'application/json',
        'Api-Key': process.env.YANDEX_TOKEN,
    };

    getCampaignId(model: string) {
        let campaignId = ['fby', 'fbo'].includes(String(model).toLowerCase()) 
                                    ? process.env.YANDEX_CAMPAINGID_FBY
                                    : String(model).toLowerCase() == 'fbs'
                                        ? process.env.YANDEX_CAMPAINGID_FBS
                                        : null
        if (!campaignId) throw new HttpException('Invalid model', HttpStatus.BAD_REQUEST)
        return campaignId
    }

    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
