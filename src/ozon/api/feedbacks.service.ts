import { Logger } from '@nestjs/common';
import axios from 'axios';
import { FeedbacksListApiDto, FeedbackDetailsApiDto } from './dto/index';
import { BaseOzonApiService } from './baseOzonApi.service';
import * as NodeCache from 'node-cache';
import { Agent as HttpsAgent } from 'https';

const dnsCache = new NodeCache({ stdTTL: 60000 }); // TTL 60 секунд

interface ISendFeedbackAnswerBodyInterface {
    feedbackId: string,
    answer: string,
    type: string
}

interface IFeedbackDetailsBodyInterface {
    feedbackId: string,
    type: string
}

interface IFeedbackListBodyInterface {
    status?: string,
    type: string,
    lastId?: string
}

export class FeedbacksApiService extends BaseOzonApiService {
    private readonly logger = new Logger(FeedbacksApiService.name);

    constructor() {
        super();
    }

    async getFeedbacksList({ status = 'ALL', type, lastId }: IFeedbackListBodyInterface) {
        this.setHeaders(type);
        let failedAttempts = 0;
        let feedbacks = [];
        interface IBody {
            "limit": number,
            "sort_dir": string,
            "status": string,
            "last_id"?: string
        }
        let body: IBody = {
            "limit": 100,
            "sort_dir": "ASC",
            "status": status,
            "last_id": lastId
        };
        while (true) {
            try {
                let partitionLimit = 5000
                let messageLimit = 1000
                let url = `https://api-seller.ozon.ru/v1/review/list`;
                const hostname = new URL(url).hostname;
                const cachedAddress = dnsCache.get(hostname);
                const address = cachedAddress || await this.resolveDns(hostname);
                dnsCache.set(hostname, address);

                const agent = new HttpsAgent({
                    host: address as string,
                    keepAlive: true,
                });

                let response = await axios.post(url, body, { headers: this.headers, httpsAgent: agent });
                let data: FeedbacksListApiDto = response.data;
                feedbacks = feedbacks.concat(response.data.reviews);

                if (feedbacks.length % messageLimit === 0) {
                    this.logger.log(`Получено ${feedbacks.length}/${partitionLimit} отзывов в партиции`);
                }

                body.last_id = data.last_id;
                if (!data.has_next || feedbacks.length % partitionLimit === 0) {
                    return { feedbacks, hasNext: data.has_next, lastId: body.last_id };
                }


            } catch (err) {
                this.logger.error(`OzonAPI getFeedbacksList: Error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err.response;
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...');
                    await this.sleep(1000 * 60);
                }
                await this.sleep(1000 * failedAttempts ** 2);
            }
        }
    }

    async getFeedbackDetails({ feedbackId, type }: IFeedbackDetailsBodyInterface) {
        this.setHeaders(type);
        let failedAttempts = 0;
        interface IBody {
            review_id: string;
        }
        let body: IBody = {
            review_id: feedbackId,
        };
        while (true) {
            try {
                let url = `https://api-seller.ozon.ru/v1/review/info`;
                const hostname = new URL(url).hostname;
                const cachedAddress = dnsCache.get(hostname);
                const address = cachedAddress || await this.resolveDns(hostname);
                dnsCache.set(hostname, address);

                const agent = new HttpsAgent({
                    host: address as string,
                    keepAlive: true,
                });

                let response = await axios.post(url, body, { headers: this.headers, httpsAgent: agent });
                let data: FeedbackDetailsApiDto = response.data;
                return data;
            } catch (err) {
                this.logger.error(`OzonAPI getFeedbackDetails: Error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    this.logger.log(`Ошибка в получении детализации ${feedbackId}`);
                    throw err.response;
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...');
                    await this.sleep(1000 * 60);
                }
                await this.sleep(1000 * failedAttempts ** 2);
            }
        }
    }

    async sendFeedbackAnswer({ feedbackId, answer, type }: ISendFeedbackAnswerBodyInterface) {
        this.setHeaders(type);
        let failedAttempts = 0;
        interface IBody {
            mark_review_as_processed: boolean,
            review_id: string,
            text: string,
        }
        let body: IBody = {
            mark_review_as_processed: true,
            review_id: feedbackId,
            text: answer,
        };
        while (true) {
            try {
                let url = `https://api-seller.ozon.ru/v1/review/comment/create`;
                const hostname = new URL(url).hostname;
                const cachedAddress = dnsCache.get(hostname);
                const address = cachedAddress || await this.resolveDns(hostname);
                dnsCache.set(hostname, address);

                const agent = new HttpsAgent({
                    host: address as string,
                    keepAlive: true,
                });

                await axios.post(url, body, { headers: this.headers, httpsAgent: agent });
                return "Загружен";
            } catch (err) {
                this.logger.error(`OzonAPI sendFeedbackAnswer: Error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...');
                    await this.sleep(1000 * 60);
                }
                await this.sleep(1000 * failedAttempts ** 2);
            }
        }
    }

    async changeStatus({ feedbackIds, status, type }: { feedbackIds: string[], status: 'PROCESSED' | 'UNPROCESSED', type: string }) {
        this.setHeaders(type);
        let failedAttempts = 0;
        interface IBody {
            review_ids: string[],
            status: 'PROCESSED' | 'UNPROCESSED',
        }
        let body: IBody = {
            review_ids: feedbackIds,
            status,
        };
        while (true) {
            try {
                let url = `https://api-seller.ozon.ru/v1/review/change-status`;
                const hostname = new URL(url).hostname;
                const cachedAddress = dnsCache.get(hostname);
                const address = cachedAddress || await this.resolveDns(hostname);
                dnsCache.set(hostname, address);

                const agent = new HttpsAgent({
                    host: address as string,
                    keepAlive: true,
                });

                await axios.post(url, body, { headers: this.headers, httpsAgent: agent });
                return "Загружен";
            } catch (err) {
                this.logger.error(`OzonAPI changeStatus: Error: ${err.message}`);
                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...');
                    await this.sleep(1000 * 60);
                }
                await this.sleep(1000 * failedAttempts ** 2);
            }
        }
    }

    private async resolveDns(hostname: string): Promise<string> {
        // Используем внешний DNS-сервис для разрешения имени
        const response = await axios.get(`https://dns.google/resolve?name=${hostname}&type=A`);
        const address = response.data.Answer[0].data;
        return address;
    }
}
