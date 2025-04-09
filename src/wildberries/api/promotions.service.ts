import { Logger } from '@nestjs/common';
import axios from 'axios';
import {
    PromotionsListDto,
    PromotionsDetailsDto,
    AddedGoodsToPromotionListDto,
    PromotionsDetailsCookiesDto,
    СreatePromotionsExcelDto,
    PromotionsExcelDto
} from './dto/index'
import { BaseWildberriesApiService } from './baseWildberriesApi.serivce';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { HttpService } from '@nestjs/axios';
export class PromotionsApiService extends BaseWildberriesApiService {

    constructor(
        gsheetsService: GsheetsService, 
        httpService: HttpService
    ) {
        super(gsheetsService, httpService);
    }

    private readonly logger = new Logger(PromotionsApiService.name);

    async getPromotionList({ type }: { type: string }): Promise<PromotionsListDto[]> {
        let failedAttempts = 0;
        let url = `https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions`

        let today = new Date()
        let startDateTime = today.toISOString()
        let nextYear = new Date()
        nextYear.setUTCFullYear(nextYear.getUTCFullYear() + 1)
        let endDateTime = nextYear.toISOString()

        while (true) {
            try {
                let response = await axios.get(url, {
                    params: {
                        startDateTime,
                        endDateTime,
                        allPromo: false
                    },
                    headers: await this.getHeaders(type)
                });
                let data: PromotionsListDto[] = response.data.data.promotions;
                return data
            } catch (err) {
                this.logger.error(`WbApi getPromotionList error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err;
                }
                await this.sleep(60 * 1000);
            }
        }
    }

    async getPromotionsDetails({ type, promotions }: { type: string, promotions: string[] }): Promise<PromotionsDetailsDto[]> {
        let failedAttempts = 0;
        const chunkSize = 100;
        const allPromotionDetails: PromotionsDetailsDto[] = [];

        for (let i = 0; i < promotions.length; i += chunkSize) {
            const chunk = promotions.slice(i, i + chunkSize);
            let promotionParams = chunk.map(m => `promotionIDs=${m}`).join('&');
            let url = `https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/details?${promotionParams}`;

            while (true) {
                try {
                    let response = await axios.get(url, {
                        headers: await this.getHeaders(type)
                    });
                    let data: PromotionsDetailsDto[] = response.data.data.promotions;
                    allPromotionDetails.push(...data);
                    break;
                } catch (err) {
                    this.logger.error(`WbApi getPromotionsDetails error: ${err.message}`);
                    failedAttempts++;
                    if (failedAttempts >= 10) {
                        throw err;
                    }
                    await this.sleep(60 * 1000);
                }
            }
        }

        return allPromotionDetails;
    }

    async addGoodsToPromotion({ type, nmIds, promotionId }: { type: string, nmIds: number[], promotionId: number }): Promise<AddedGoodsToPromotionListDto[]> {
        let failedAttempts = 0;
        let url = `https://dp-calendar-api.wildberries.ru/api/v1/calendar/promotions/upload`;
        let allData: AddedGoodsToPromotionListDto[] = [];
        const chunkSize = 1000;

        for (let i = 0; i < nmIds.length; i += chunkSize) {
            const chunk = nmIds.slice(i, i + chunkSize);
            let body = {
                "data": {
                    "promotionID": promotionId,
                    "uploadNow": false,
                    "nomenclatures": chunk
                }
            };
            while (true) {
                try {
                    let response = await axios.post(url, body, {
                        headers: await this.getHeaders(type)
                    });
                    let data: AddedGoodsToPromotionListDto[] = response.data.data;
                    allData = allData.concat(data);
                    break;
                } catch (err) {
                    this.logger.error(`WbApi addGoodsToPromotion error: ${err.message}`);
                    failedAttempts++;
                    this.logger.log(err.response.data)
                    if (failedAttempts >= 10) {
                        throw err;
                    }
                    await this.sleep(60 * 1000);
                }
            }
        }

        return allData;
    }

    async getPromotionsDetailsCookies({ type, promotionId }: { type: string, promotionId: number }): Promise<PromotionsDetailsCookiesDto> {
        let failedAttempts = 0;
        let url = `https://discounts-prices.wildberries.ru/ns/calendar-api/dp-calendar/suppliers/api/v1/promo/action?promoActionID=${promotionId}`;

        while (true) {
            try {
                let response = await axios.get(url, {
                    headers: await this.getHeaders(type)
                });
                let data: PromotionsDetailsCookiesDto = response.data.data;
                return data
            } catch (err) {
                this.logger.error(`WbApi getPromotionsDetailsCookies error: ${err.message}`);
                failedAttempts++;
                console.log(err)
                this.logger.log(err.response.data)
                if (failedAttempts >= 10 || err.response.status == 400) {
                    throw err;
                }
                if (err.response.code == 401) {
                    await this.refreshCookies(type)
                }
                await this.sleep(60 * 1000);
            }
        }
    }

    async createPromotionsExcel({ type, periodID, isRecovery }: { type: string, periodID: number, isRecovery: boolean }): Promise<СreatePromotionsExcelDto> {
        let failedAttempts = 0;
        let url = `https://discounts-prices.wildberries.ru/ns/calendar-api/dp-calendar/suppliers/api/v1/recovery`;
        let body = {
            periodID,
            isRecovery
        }

        while (true) {
            try {
                let response = await axios.post(url,
                    body,
                    {
                        headers: await this.getHeaders(type)
                    });
                let data: СreatePromotionsExcelDto = response.data;
                return data
            } catch (err) {
                this.logger.error(`WbApi createPromotionsExcel error: ${err.message}`);
                failedAttempts++;
                if (failedAttempts >= 10 || err.response.status == 400) {
                    throw err;
                }
                if (err.response.code == 401) {
                    await this.refreshCookies(type)
                }
                await this.sleep(60 * 1000);
            }
        }
    }

    async getPromotionsExcelData({ type, periodID, isRecovery }: { type: string, periodID: number, isRecovery: boolean }): Promise<PromotionsExcelDto> {
        let failedAttempts = 0;
        let url = `https://discounts-prices.wildberries.ru/ns/calendar-api/dp-calendar/suppliers/api/v1/recovery?isRecovery=${isRecovery}&periodID=${periodID}`;
        while (true) {
            try {
                let response = await axios.get(url, {
                    headers: await this.getHeaders(type),
                });

                const data = response.data.data
                return data;
            } catch (err) {
                this.logger.error(`WbApi getPromotionsExcelData error: ${err.message}`);
                this.logger.log(err.response.data)
                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err;
                }
                if (err.response.code == 401) {
                    await this.refreshCookies(type)
                }
                await this.sleep(60 * 1000);
            }
        }
    }

    async changePromotionGoodsByExcel({ type, periodID, file, isRecovery }: { type: string, periodID: number, file: string, isRecovery: boolean }): Promise<PromotionsExcelDto> {
        let failedAttempts = 0;
        let url = `https://discounts-prices.wildberries.ru/ns/calendar-api/dp-calendar/suppliers/api/v1/recovery/apply`;
        let body = {
            file,
            isRecovery: !isRecovery,
            periodID
        }
        while (true) {
            try {
                let response = await axios.post(url,
                    body,
                    {
                        headers: await this.getHeaders(type),
                        timeout: 30000
                    });
                return response.data;
            } catch (err) {
                this.logger.error(`WbApi downloadPromotionsExcel error: ${err.message}`);
                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err;
                }
                if (err?.response?.status === 401 || err?.response?.code == 401) {
                    await this.refreshCookies(type)
                }
                await this.sleep(60 * 1000);
            }
        }
    }

}
