import { Logger } from '@nestjs/common';
import axios from 'axios';
import { BaseOzonApiService } from './baseOzonApi.service';
import { QuestionsListApiDto } from './dto/questionsListApi.dto';
import { QuestionDetailsApiDto } from './dto/questionsDetailsApi.dto';

interface IGetQuestionsListInterface {
    status?: string,
    date_from?: string,
    date_to?: string,
    type: string,
    lastId?: string
}

interface IGetQuestionDetailsInterface {
    questionId: string,
    type: string
}

interface ISendQuestionAnswerInterface {
    questionId: string,
    type: string,
    answer: string,
    sku: number,
}

export class QuestionsApiService extends BaseOzonApiService {
    private readonly logger = new Logger(QuestionsApiService.name);

    constructor() {
        super()
    }

    async getQuestionsList({ status = 'ALL', date_from = "2019-01-01T00:00:00Z", date_to = new Date().toISOString(), type, lastId }: IGetQuestionsListInterface) {
        this.setHeaders(type);
        let failedAttempts = 0;
        let questions = []
        interface IBody {
            "filter": {
                "date_from": string,
                "date_to": string,
                "status": string
            },
            "last_id"?: string
        }
        let body: IBody = {
            "filter": {
                date_from,
                date_to,
                status
            },
            "last_id": lastId
        }
        while (true) {
            try {
                let partitionLimit = 5000
                let messageLimit = 1000

                let url = `https://api-seller.ozon.ru/v1/question/list`;
                let response = await axios.post(url, body, { headers: this.headers });
                let data: QuestionsListApiDto = response.data;
                questions = questions.concat(response.data.questions)
                if (questions.length % messageLimit === 0) {
                    this.logger.log(`Получено ${questions.length}/${partitionLimit} вопросов в партиции`)
                }

                body.last_id = data.last_id
                if (!data.questions.length) {
                    return { questions, hasNext: false }
                }
                if (questions.length % partitionLimit === 0) {
                    return { questions, hasNext: true, lastId: body.last_id }
                }

            } catch (err) {
                this.logger.error(`OzonAPI getQuestionsList: Error: ${err.message}`);
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

    async getQuestionDetails({ questionId, type }: IGetQuestionDetailsInterface) {
        this.setHeaders(type);
        let failedAttempts = 0;
        interface IBody {
            question_id: string;
        }
        let body: IBody = {
            question_id: questionId,
        };
        while (true) {
            try {
                let url = `https://api-seller.ozon.ru/v1/question/info`;
                let response = await axios.post(url, body, { headers: this.headers });
                let data: QuestionDetailsApiDto = response.data;
                return data;
            } catch (err) {
                this.logger.error(`OzonAPI getQuestionDetails: Error: ${err.message}`);

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

    async sendQuestionAnswer({ questionId, answer, sku, type }: ISendQuestionAnswerInterface) {
        this.setHeaders(type);
        let failedAttempts = 0;
        let body = {
            sku: +sku,
            question_id: questionId,
            text: answer,
        };
        while (true) {
            try {
                let url = `https://api-seller.ozon.ru/v1/question/answer/create`;
                await axios.post(url, body, { headers: this.headers });
                return "Загружен"
            } catch (err) {
                this.logger.error(`OzonAPI sendQuestionAnswer: Error:${err.message}`);
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

    async changeStatus({ questionsIds, status, type }: { questionsIds: string[], status: 'NEW' | 'VIEWED' | 'PROCESSED', type: string }) {
        this.setHeaders(type);
        let failedAttempts = 0;
        interface IBody {
            question_ids: string[],
            status: 'NEW' | 'VIEWED' | 'PROCESSED',
        }
        let body: IBody = {
            question_ids: questionsIds,
            status,
        };
        while (true) {
            try {
                let url = `https://api-seller.ozon.ru/v1/question/change-status`;
               
                await axios.post(url, body, { headers: this.headers });
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
}
