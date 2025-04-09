import { Injectable, Logger } from '@nestjs/common';
import { OzonFeedbacksAndQuestions } from './models/feedbacksAndQueations.model';
import { InjectModel } from '@nestjs/sequelize';
import { FeedbacksApiService } from '../api/feedbacks.service';
import { OzonDischargeService } from '../discharge/discharge.service';
import { BigbaseService } from 'src/bigbase/bigbase.service';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { col, fn, Op } from 'sequelize';
import { QuestionsApiService } from '../api/question.service';
import { JSHelperService } from 'src/JSHelper.service';

@Injectable()
export class FeedbacksAndQuestionService {

    currentSSId: string;
    private readonly logger = new Logger(FeedbacksAndQuestionService.name)

    constructor(
        @InjectModel(OzonFeedbacksAndQuestions) private ozonFeedbacksAndQuestions: typeof OzonFeedbacksAndQuestions,
        private readonly FeedbacksApiService: FeedbacksApiService,
        private readonly DischargeService: OzonDischargeService,
        private readonly BigbaseService: BigbaseService,
        private readonly GsheetsService: GsheetsService,
        private readonly QuestionsApiService: QuestionsApiService,
        private readonly JSHelperService: JSHelperService,

    ) { }

    async getFeedbacksData({ type, lastId }) {
        let stm = await this.BigbaseService.getStm()
        let feedbacksList = await this.FeedbacksApiService.getFeedbacksList({ status: 'UNPROCESSED', type, lastId })
        let discharge = (await this.DischargeService.getDischarge({
            filters: feedbacksList.feedbacks.map(m => ({ sku: String(m.sku) })),
            columns: ["sku", "ozon_id", "article", "brand", 'name'],
            type,
        })).reduce((acc, elem) => {
                acc[elem.sku] = elem;
                return acc;
            }, {});

        let feedbacksData = []
        for (let feedback of feedbacksList.feedbacks) {
            let sku = feedback.sku
            if (!discharge[sku]) {
                this.logger.log(`SKU ${sku} отсутвует в discharge Ozon`)
                continue
            }

            let media = '';
            let feedbackId = feedback.id;
            let details = null
            try {
                details = await this.FeedbacksApiService.getFeedbackDetails({ feedbackId, type });
            }
            catch (err) {
                this.logger.log(`Ошибка в получении детализации по id отзыву с id:${feedbackId}`)
                continue
            }

            if (details?.photos?.length)
                media += 'Фото: ' + details.photos.map(link => link.url).join('\n') + '\n';
            if (details?.videos?.length)
                media += 'Видео: ' + details.videos.map(link => link.url).join('\n') + '\n';


            let newObj = {
                message_id: feedback.id,
                sku,
                text: feedback?.text?.length ? feedback.text : null,
                date: feedback.published_at,
                brand: discharge[sku].brand,
                rating: feedback.rating,
                article: discharge[sku].article,
                ozon_id: discharge[sku].ozon_id,
                media: media?.length ? media : null,
                kind: "Отзыв",
                type,
                product_name: discharge[sku].name,
                isStm: stm[String(discharge[sku].article).toLocaleLowerCase()] ? true : false,
                comments_amount: details?.comments_amount,
                dislikes_amount: details?.dislikes_amount,
                is_rating_participant: details.is_rating_participant,
                likes_amount: details?.likes_amount,
                order_status: details?.order_status,
                message_status: feedback.status

            }
            feedbacksData.push(newObj)
            if (feedbacksData.length % 500 === 0) { this.logger.log(`Получена детализация и обработано ${feedbacksData.length}/${feedbacksList.feedbacks.length} отзывов в партиции`); }
        }
        return { feedbacksData, hasNext: feedbacksList.hasNext, lastId: feedbacksList.lastId }
    }

    async getQuestionsData({ type, lastId }) {
        let stm = await this.BigbaseService.getStm()
        let questionsList = (await this.QuestionsApiService.getQuestionsList({ status: 'UNPROCESSED', type, lastId }))
        let discharge = (await this.DischargeService.getDischarge({
            filters: questionsList.questions.map(m => ({ sku: String(m.sku) })), 
            columns: ["sku", "ozon_id", "article", "brand", 'name'], 
            type,
        })).reduce((acc, elem) => {
                acc[elem.sku] = elem;
                return acc;
            }, {});
        let questionsData = []
        for (let question of questionsList.questions) {
            let sku = question.sku
            if (!discharge[sku]) {
                this.logger.log(`SKU ${sku} отсутвует в discharge Ozon`)
                continue
            }

            let newObj = {
                message_id: question.id,
                sku,
                text: question?.text?.length ? question.text : null,
                date: question.published_at,
                brand: discharge[sku].brand,
                article: discharge[sku].article,
                ozon_id: discharge[sku].ozon_id,
                kind: "Вопрос",
                type,
                product_name: discharge[sku].name,
                isStm: stm[String(discharge[sku].article).toLocaleLowerCase()] ? true : false,
                message_status: question.status
            }
            questionsData.push(newObj)
            if (questionsData.length % 500 === 0) {
                this.logger.log(`Вопросов обработано ${questionsData.length}/${questionsList.questions.length} в партиции`)
            }
        }
        return { questionsData, hasNext: questionsList.hasNext, lastId: questionsList.lastId }
    }

    async updateFeedbacksAndQuestionsDB({ messageData, fields }) {
        await this.ozonFeedbacksAndQuestions.sync({ force: false });

        this.logger.log(`Запись новых отзывов в БД`);

        const chunkSize = 10000;
        const totalChunks = Math.ceil(messageData.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = messageData.slice(i * chunkSize, (i + 1) * chunkSize);

            try {
                await this.ozonFeedbacksAndQuestions.bulkCreate(chunk, {
                    updateOnDuplicate: fields
                })
                this.logger.log(`Чанк ${i + 1} из ${totalChunks} успешно обработан`);
            } catch (err) {
                this.logger.log(`Ошибка при обработке чанка ${i + 1}:`, err);
            }
        }
    }

    async setNewFeedbacks({ isStm, isAuto }) {
        if (isStm && !isAuto) this.currentSSId = process.env.OZON_STM_MANGER_SSID;
        if (!isStm && !isAuto) this.currentSSId = process.env.OZON_SIMA_MANGER_SSID
        if (isStm && isAuto) this.currentSSId = process.env.OZON_STM_AUTO_SSID;
        if (!isStm && isAuto) this.currentSSId = process.env.OZON_SIMA_AUTO_SSID
        this.logger.log(`Запись новых отзывов с СТМ = ${isStm} и автоматический ответ= ${isAuto} в таблицу ${this.currentSSId}`,);

        const baseWhereClause = {
            kind: 'Отзыв',
            isStm: isStm,
            loading_status: {
                [Op.or]: {
                    [Op.is]: null,
                    [Op.ne]: 'Загружен',
                }

            },
        };
        let whereClause = await this.buildFiltersForAuto({ isAuto, baseWhereClause })

        let sheetsValues = await this.GsheetsService.getValues({ range: `'Отзывы'!A1:ZZ`, spreadsheetId: this.currentSSId });
        let headers = this.JSHelperService.makeHeader({ sheetsValues })
        let idsList = sheetsValues.slice(1).map(m => m[headers['ID сообщения']]).filter(f => f);
        whereClause.message_id = {
            [Op.notIn]: idsList,
        };

        const feedbacks = await this.ozonFeedbacksAndQuestions.findAll({ where: whereClause })
        const resultObject = feedbacks.reduce((acc, feedback) => {
            acc[feedback.message_id] = feedback;
            return acc;
        }, {});

        let botAnswerObj = isAuto ? await this.getBotAnswer() : null

        let finArr = [];
        for (let id in resultObject) {
            let feedback = resultObject[id].dataValues;
            let newRow = [];

            newRow[headers['Рейтинг']] = feedback.rating;
            newRow[headers['Озон']] = `www.ozon.ru/product/${feedback.sku}`;
            newRow[headers['СИМА']] = feedback.article.includes('KMS')
                ? `https://komus-opt.ru/search/?q=${feedback.article.split('KMS')[1]}`
                : feedback.article.includes('RELEF')
                    ? `https://relefopt.ru/search?q=${feedback.article.split('RELEF')[1]}`
                    : feedback.article.includes('SAMSON')
                        ? `https://www.samsonopt.ru/zakaz/index.php?ID=160755&CODE=${feedback.article.split('SAMSON')[1]}`
                        : isFinite(feedback.article)
                            ? `https://www.sima-land.ru/${feedback.article}`
                            : null;
            newRow[headers['Название товара']] = feedback.product_name;
            newRow[headers['Текст отзыва']] = feedback.text;
            newRow[headers['Наш ответ']] = feedback.answer;
            newRow[headers['Статус']] = feedback.status;
            newRow[headers['Ответственный']] = feedback.manager;
            newRow[headers['Комментарии']] = feedback.comments1;
            newRow[headers['Комментарии 2']] = feedback.comments2;
            newRow[headers['Загрузка']] = feedback.loading_status;
            newRow[headers['Бренд']] = feedback.brand;
            newRow[headers['Дата']] = new Date(feedback.date).toLocaleString('ru');
            newRow[headers['ID сообщения']] = feedback.message_id;
            newRow[headers['Артикул']] = feedback.article;
            newRow[headers['Номенклатура']] = feedback.sku;
            newRow[headers['Медиа']] = feedback.media;

            if (isAuto) {
                newRow[headers['Наш ответ']] = await this.setBotAnswer({
                    botAnswerObj,
                    clientName: feedback.client_name,
                    rating: feedback.rating,
                    brand: isStm ? feedback.brand : null,
                });
                newRow[headers['Статус']] = newRow[headers['Наш ответ']] ? 'Отвечен' : null;
                newRow[headers['Ответственный']] = 'Авто';
            }
            finArr.push(newRow);
        }

        finArr.sort((a, b) => {
            const dateA = new Date(a[headers['Дата']].replace(/(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')).getTime();
            const dateB = new Date(b[headers['Дата']].replace(/(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')).getTime();
            return dateA - dateB;
          });
          
        if (!idsList.length) await this.GsheetsService.setValues2({ range: `'Отзывы'!A2:ZZ`, values: finArr, spreadsheetId: this.currentSSId })
        else if (finArr.length) {
            await this.GsheetsService.addEmptyRows({ sheetName: `'Отзывы'`, numberOfRows: finArr.length, spreadsheetId: this.currentSSId });
            await this.GsheetsService.setValues2({ range: `'Отзывы'!A${idsList.length + 2}:ZZ`, values: finArr, spreadsheetId: this.currentSSId })
        }

        this.logger.log(`Запись новых отзывов с СТМ = ${isStm} и автоматический ответ= ${isAuto} в таблицу ${this.currentSSId} прошла успешно`,);

    }

    async setNewQuestions({ isStm }) {
        if (isStm) this.currentSSId = process.env.OZON_STM_MANGER_SSID;
        if (!isStm) this.currentSSId = process.env.OZON_SIMA_MANGER_SSID
        this.logger.log(`Запись новых вопросов с СТМ = ${isStm} в таблицу ${this.currentSSId}`,);

        let sheetsValues = await this.GsheetsService.getValues({ range: `'Вопросы'!A1:ZZ`, spreadsheetId: this.currentSSId });
        let headers = this.JSHelperService.makeHeader({ sheetsValues })
        let idsList = sheetsValues.slice(1).map(m => m[headers['ID сообщения']]).filter(f => f);
        let whereClause = {
            kind: 'Вопрос',
            [Op.or]: [
                { loading_status: { [Op.ne]: 'Загружен' } },
                { loading_status: null },
            ],
            message_id: { [Op.notIn]: idsList },
            isStm: isStm ? true : false
        };

        const questions = await this.ozonFeedbacksAndQuestions.findAll({ where: whereClause })
        const resultObject = questions.reduce((acc, question) => {
            acc[question.message_id] = question;
            return acc;
        }, {});

        let finArr = [];
        for (let id in resultObject) {
            let question = resultObject[id];
            let newRow = []
            newRow[headers['Озон']] = `www.ozon.ru/product/${question.sku}`;
            newRow[headers['Ссылка Сима']] = question?.article?.includes('KMS')
                ? `https://komus-opt.ru/search/?q=${question.article.split('KMS')[1]}`
                : question?.article?.includes('RELEF')
                    ? `https://relefopt.ru/search?q=${question.article.split('RELEF')[1]}`
                    : question?.article?.includes('SAMSON')
                        ? `https://www.samsonopt.ru/zakaz/index.php?ID=160755&CODE=${question.article.split('SAMSON')[1]}`
                        : isFinite(question.article)
                            ? `https://www.sima-land.ru/${question.article}`
                            : null;
            newRow[headers['Название товара']] = question.product_name;
            newRow[headers['Текст вопроса']] = question.text;
            newRow[headers['Наш ответ']] = question.answer;
            newRow[headers['Статус']] = question.status;
            newRow[headers['Ответственный']] = question.manager;
            newRow[headers['Комментарии']] = question.comments1;
            newRow[headers['Комментарии 2']] = question.comments2;
            newRow[headers['Загрузка']] = question.loading_status;
            newRow[headers['Бренд']] = question.brand;
            newRow[headers['Дата']] = new Date(question.date).toLocaleString('ru');
            newRow[headers['ID сообщения']] = question.message_id;
            newRow[headers['Артикул']] = question.article;
            newRow[headers['Номенклатура']] = question.sku;
            newRow[headers['Регион']] = question.region;
            finArr.push(newRow);
        }
        finArr.sort((a, b) => {
            const dateA = new Date(a[headers['Дата']].replace(/(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')).getTime();
            const dateB = new Date(b[headers['Дата']].replace(/(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')).getTime();
            return dateA - dateB;
          });
        if (!idsList.length) await this.GsheetsService.setValues2({ range: `'Вопросы'!A2:ZZ`, values: finArr, spreadsheetId: this.currentSSId })
        else if (finArr.length) {
            await this.GsheetsService.addEmptyRows({ sheetName: `'Вопросы'`, numberOfRows: finArr.length, spreadsheetId: this.currentSSId });
            await this.GsheetsService.setValues2({ range: `'Вопросы'!A${idsList.length + 2}:ZZ`, values: finArr, spreadsheetId: this.currentSSId })
        }
        this.logger.log(`Запись новых вопросов с СТМ = ${isStm} в таблицу ${this.currentSSId} прошла успешно`);

    }

    private async buildFiltersForAuto({ isAuto, baseWhereClause = {} }) {
        let whereClause;

        if (isAuto) {
            whereClause = {
                ...baseWhereClause,
                [Op.or]: [
                    {
                        text: null,
                        media: null,
                    },
                    { rating: 5 },
                ],
            };
        } else {
            whereClause = {
                ...baseWhereClause,
                [Op.and]: [
                    {
                        [Op.or]: [
                            { text: { [Op.ne]: null } },
                            { media: { [Op.ne]: null } },
                        ],
                    },
                    {
                        [Op.or]: [
                            { rating: { [Op.ne]: 5 } },
                            { rating: { [Op.is]: null } },
                        ],
                    },
                ],
            };
        }
        return whereClause
    }

    private async getBotAnswer() {
        this.logger.log(`Получение ответов бота из таблицы ${this.currentSSId}`);
        let sheetsValues = await this.GsheetsService.getValues({ range: `'Шаблоны ответов'!A1:ZZ`, spreadsheetId: this.currentSSId })
        let headers = this.JSHelperService.makeHeader({ sheetsValues })

        let botAnswerObj = sheetsValues.slice(1).reduce((acc, row) => {
            let brand = row[headers['Бренд']] || null;
            let rating = row[headers['Кол-во звезд']];
            let key = `${rating}_${brand}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(row[headers['Шаблоны ответов']]);
            return acc;
        }, {});

        this.logger.log(`Получение ответов бота из таблицы ${this.currentSSId} завершено`);
        return botAnswerObj;
    }

    private async setBotAnswer({ botAnswerObj, clientName, rating, brand }) {
        let key = `${rating}_${brand}`;
        let answer = '';

        if (!botAnswerObj[key]) {
            answer = null;
        } else {
            let randomIndex = Math.floor(Math.random() * botAnswerObj[key].length);
            let template = botAnswerObj[key][randomIndex];

            if (clientName) {
                answer = template.replace('{ИМЯ}', clientName);
            } else {
                answer = template.replace(/,\s*{ИМЯ}/, '');
            }
        }
        return answer;
    }

    async getFeedbacksAnswers({ isStm, isAuto, sendLimit = 1000 }) {
        if (isStm && !isAuto) this.currentSSId = process.env.OZON_STM_MANGER_SSID;
        if (!isStm && !isAuto) this.currentSSId = process.env.OZON_SIMA_MANGER_SSID
        if (isStm && isAuto) this.currentSSId = process.env.OZON_STM_AUTO_SSID;
        if (!isStm && isAuto) this.currentSSId = process.env.OZON_SIMA_AUTO_SSID
        this.logger.log(`Отправка отвеченных отзывов с СТМ = ${isStm} и автоматический ответ= ${isAuto} из таблицы ${this.currentSSId}`);

        let sheetsValues = await this.GsheetsService.getValues({ range: `'Отзывы'!A1:ZZ`, spreadsheetId: this.currentSSId });
        let headers = this.JSHelperService.makeHeader({ sheetsValues })

        let count = 0;
        let feedbackObj = sheetsValues.slice(1).reduce((acc, row) => {
            if (
                row[headers['Статус']] != 'Отвечен' ||
                row[headers['Загрузка']] == 'Загружен' ||
                count >= sendLimit
            )
                return acc;
            acc[row[headers['ID сообщения']]] = {
                message_id: row[headers['ID сообщения']],
                answer: row[headers['Наш ответ']],
                manager: row[headers['Ответственный']],
                status: row[headers['Статус']],
                reject: false,
            };
            count++;
            return acc;
        }, {});

        return feedbackObj
    }

    async getQuestionsAnswers({ isStm }) {
        if (isStm) this.currentSSId = process.env.OZON_STM_MANGER_SSID;
        if (!isStm) this.currentSSId = process.env.OZON_SIMA_MANGER_SSID

        this.logger.log(`Отправка отвеченных вопросов с СТМ = ${isStm} из таблицы ${this.currentSSId}`);
        let sheetsValues = await this.GsheetsService.getValues({ range: `'Вопросы'!A1:ZZ`, spreadsheetId: this.currentSSId });
        let headers = this.JSHelperService.makeHeader({ sheetsValues })

        let questionObj = sheetsValues.slice(1).reduce((acc, row) => {
            if (row[headers['Статус']] != 'Отвечен' || row[headers['Загрузка']] == 'Загружен') return acc;
            acc[row[headers['ID сообщения']]] = {
                id_wb: row[headers['ID сообщения']],
                answer: row[headers['Наш ответ']],
                manager: row[headers['Ответственный']],
                sku: row[headers['Номенклатура']],
            };
            return acc;
        }, {});

        return questionObj
    }

    private async checkSendResult({ isQuestion, messageId, answer, sku, type }: { isQuestion: boolean, messageId: string, answer: string, sku?: number, type: string }) {
        try {
            return isQuestion
                ? await this.QuestionsApiService.sendQuestionAnswer({ questionId: messageId, answer, sku, type })
                : await this.FeedbacksApiService.sendFeedbackAnswer({ feedbackId: messageId, answer, type })
        }
        catch (err) {
            this.logger.warn(`При отправке сообщения ${messageId} получена ошибка ${err.message} с данными:`)
            this.logger.warn(err.response.data)
            return `Ошибка: ${err.message}. ${err.response.data.message}`;
        }
    }

    async sendFeedbacksAnswers({ feedbackObj, type }) {
        let count = 0
        if (!Object.keys(feedbackObj).length) {
            this.logger.log(`Нет новых ответов на отзывы`);
            return {};
        }
        this.logger.log(`Отправка ${Object.keys(feedbackObj).length} отвеченных отзывов`);
        for (let feedbackId in feedbackObj) {
            let answer = feedbackObj[feedbackId].answer

            feedbackObj[feedbackId].loading_status = await this.checkSendResult({ isQuestion: false, messageId: feedbackId, answer, type })
            count++
            if (count % 100 === 0)
                this.logger.log(`Отправлено ${count}/${Object.keys(feedbackObj).length} ответов`);
        }
        let messageData = Object.values(feedbackObj)
        await this.updateFeedbacksAndQuestionsDB({ messageData, fields: ['answer', 'loading_status', 'status', 'manager'] })
        return feedbackObj
    }

    async sendQuestionsAnswers({ questionObj, type }) {
        let count = 0
        if (!Object.keys(questionObj).length) {
            this.logger.log(`Нет новых ответов на вопросы`);
            return {};
        }
        this.logger.log(`Отправка ${Object.keys(questionObj).length} отвеченных вопросов`);
        for (let questionId in questionObj) {
            let answer = questionObj[questionId].answer
            let sku = questionObj[questionId].sku

            questionObj[questionId].loading_status = await this.checkSendResult({ isQuestion: true, messageId: questionId, answer, type, sku })
            count++
            if (count % 100 === 0)
                this.logger.log(`Отправлено ${count}/${Object.keys(questionObj).length} ответов`);
        }
        let messageData = Object.values(questionObj)
        await this.updateFeedbacksAndQuestionsDB({ messageData, fields: ['answer', 'loading_status', 'status', 'manager'] })


        return questionObj
    }

    async setSendingResult({ messageObj, isQuestion = false }) {
        if (!Object.keys(messageObj).length) {
            this.logger.log(`Нет новых данных БД по отвеченным сообщениям`);
            return
        }
        const sheetName = isQuestion ? 'Вопросы' : 'Отзывы';
        let sheetsValues = await this.GsheetsService.getValues({ range: `'${sheetName}'!A1:ZZ`, spreadsheetId: this.currentSSId });
        let headers = this.JSHelperService.makeHeader({ sheetsValues })

        let finArr = sheetsValues.slice(1).map(row => {
            let currentFeedback = messageObj[row[headers['ID сообщения']]];
            if (currentFeedback) {
                row[headers['Загрузка']] = currentFeedback.loading_status;
            }
            return row;
        });
        finArr.length && await this.GsheetsService.setValues2({ range: `'${sheetName}'!A2:ZZ`, values: finArr, spreadsheetId: this.currentSSId });
        this.logger.log(`Обновление данных БД по отвеченным сообщениям прошла успешно`);
    }

    async archivate({ isStm, isAuto = false, isQuestion = false }) {
        if (isStm && !isAuto) this.currentSSId = process.env.OZON_STM_MANGER_SSID;
        if (!isStm && !isAuto) this.currentSSId = process.env.OZON_SIMA_MANGER_SSID;
        if (isStm && isAuto) this.currentSSId = process.env.OZON_STM_AUTO_SSID;
        if (!isStm && isAuto) this.currentSSId = process.env.OZON_SIMA_AUTO_SSID;

        const sheetName = isQuestion ? 'Вопросы' : 'Отзывы';
        const range = `'${sheetName}'!A1:ZZ`;

        this.logger.log(`Архивация ${isQuestion ? 'вопросов' : 'отзывов'} с СТМ = ${isStm} и автоматический ответ = ${isAuto} в таблицу ${this.currentSSId}`);

        let sheetsValues = await this.GsheetsService.getValues({ range, spreadsheetId: this.currentSSId });
        let headers = this.JSHelperService.makeHeader({ sheetsValues })

        let delRowsIndecies = [];
        let archiveValues = sheetsValues.reduce((acc, row, index) => {
            if (row[headers['Статус']] != 'Отвечен' || row[headers['Загрузка']] != 'Загружен') return acc;

            let dbObj = {
                message_id: row[headers['ID сообщения']],
                answer: row[headers['Наш ответ']],
                status: row[headers['Статус']],
                manager: row[headers['Ответственный']].length ? row[headers['Ответственный']] : 'Авто',
                comments1: row[headers['Комментарии']],
                comments2: row[headers['Комментарии 2']],
                loading_status: row[headers['Загрузка']],
                archive_date: new Date().toISOString().split('T')[0],
            };
            acc.push(dbObj);
            delRowsIndecies.push(index);
            return acc;
        }, []);

        if (!archiveValues.length) {
            this.logger.log(`Нет данных на обновление и архивацию`);
            return;
        }


        await this.updateFeedbacksAndQuestionsDB({ messageData: archiveValues, fields: ['answer', 'status', 'manager', 'comments1', 'comments2', 'loading_status', 'archive_date'] });

        delRowsIndecies = delRowsIndecies.filter(f => f);
        if (delRowsIndecies.length + 1 == sheetsValues.length) {
            await this.GsheetsService.addEmptyRows({ sheetName, spreadsheetId: this.currentSSId, numberOfRows: 1 })
        }
        await this.GsheetsService.deleteRowsByIndices({ sheetName, rowIndices: delRowsIndecies, spreadsheetId: this.currentSSId });
        this.logger.log(`Архивация ${isQuestion ? 'вопросов' : 'отзывов'} с СТМ = ${isStm} и автоматический ответ = ${isAuto} в таблицу ${this.currentSSId} успешно завершена`);
    }

    async setArchive({ dateTo, dateFrom }) {
        try {
            this.logger.log(`Запись архивных данных`);
            let ssIdArchive = process.env.OZON_ARCHIVE_SSID
            await this.GsheetsService.clearValues({ range: `'Архив'!A2:ZZ`, spreadsheetId: ssIdArchive });

            if (!dateTo) {
                dateTo = new Date();
                dateTo.setDate(dateTo.getDate());
            } else dateTo = new Date(dateTo);
            dateTo.setHours(0, 0, 0, 0);
            dateTo.setTime(dateTo.getTime() + 3 * 60 * 60 * 1000);

            if (!dateFrom) {
                dateFrom = new Date(dateTo);
                dateFrom.setDate(dateFrom.getDate() - 14);
            } else dateFrom = new Date(dateFrom);
            dateFrom.setHours(23, 59, 59, 0);
            dateFrom.setTime(dateFrom.getTime() + 3 * 60 * 60 * 1000);

            let sheetsValues = await this.GsheetsService.getValues({ range: `'Архив'!A1:ZZ`, spreadsheetId: ssIdArchive });
            let headers = sheetsValues[0].reduce((acc, header, index) => {
                acc[header] = index;
                return acc;
            }, {});
            // this.logger.log(dateTo)
            // this.logger.log(dateFrom)

            const dbRows = await this.ozonFeedbacksAndQuestions.findAll({
                where: {
                    archive_date: {
                        [Op.between]: [dateFrom, dateTo],
                    },
                    loading_status: 'Загружен',
                    manager: {
                        [Op.ne]: 'Архив',
                    },
                },
            });
            const resultObject = dbRows.reduce((acc, feedback) => {
                acc[feedback.message_id] = feedback;
                return acc;
            }, {});

            let finArr = [];
            for (let id in resultObject) {
                let dbRow = resultObject[id];
                let newRow = [];
                newRow[headers['Рейтинг']] = dbRow.rating;
                newRow[headers['Тип']] = dbRow.kind;
                newRow[headers['СТМ']] = dbRow.isStm ? 'Да' : 'Нет';
                newRow[headers['Озон']] = `www.ozon.ru/product/${dbRow.sku}`;
                newRow[headers['СИМА']] = dbRow.article.includes('KMS')
                    ? `https://komus-opt.ru/search/?q=${dbRow.article.split('KMS')[1]}`
                    : dbRow.article.includes('RELEF')
                        ? `https://relefopt.ru/search?q=${dbRow.article.split('RELEF')[1]}`
                        : dbRow.article.includes('SAMSON')
                            ? `https://www.samsonopt.ru/zakaz/index.php?ID=160755&CODE=${dbRow.article.split('SAMSON')[1]}`
                            : isFinite(dbRow.article)
                                ? `https://www.sima-land.ru/${dbRow.article}`
                                : null;
                newRow[headers['Название товара']] = dbRow.product_name;
                newRow[headers['Текст']] = dbRow.text;
                newRow[headers['Наш ответ']] = dbRow.answer;
                newRow[headers['Статус']] = dbRow.status;
                newRow[headers['Ответственный']] = dbRow.manager;
                newRow[headers['Комментарии']] = dbRow.comments1;
                newRow[headers['Комментарии 2']] = dbRow.comments2;
                newRow[headers['Загрузка']] = dbRow.loading_status;
                newRow[headers['Бренд']] = dbRow.brand;
                newRow[headers['Дата']] = new Date(dbRow.date).toLocaleString('ru');
                newRow[headers['ID сообщения']] = dbRow.id_wb;
                newRow[headers['Артикул']] = dbRow.article;
                newRow[headers['Номенклатура']] = dbRow.nm_id;
                newRow[headers['Дата архивации']] = new Date(dbRow.archive_date).toLocaleDateString('ru');
                finArr.push(newRow);
            }

            if (finArr.length) {
                await this.GsheetsService.setValues2({ range: `'Архив'!A2:ZZ`, values: finArr, spreadsheetId: ssIdArchive });
            }

            this.logger.log(`Запись архивных данных успешно завершена`);
        } catch (err) {
            throw `setArchive ${err}`;
        }
    }

    async setAnswerStatistics({ isStm, isAuto }) {
        try {
            if (isStm && !isAuto) this.currentSSId = process.env.OZON_STM_MANGER_SSID;
            if (!isStm && !isAuto) this.currentSSId = process.env.OZON_SIMA_MANGER_SSID
            if (isStm && isAuto) this.currentSSId = process.env.OZON_STM_AUTO_SSID;
            if (!isStm && isAuto) this.currentSSId = process.env.OZON_SIMA_AUTO_SSID
            this.logger.log(`Запись статистики с СТМ = ${isStm} и автоматический ответ= ${isAuto} в таблицу ${this.currentSSId}`);

            const today = new Date();
            today.setUTCHours(today.getUTCHours() + 3);

            const yesterday = new Date(today);
            yesterday.setDate(today.getUTCDate() - 1);

            const startOfYesterday = new Date(yesterday);
            startOfYesterday.setUTCHours(0, 0, 0, 0);

            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setUTCHours(23, 59, 59, 999);

            const startOfYesterdayISO = startOfYesterday.toISOString();
            const endOfYesterdayISO = endOfYesterday.toISOString();

            // this.logger.log(startOfYesterdayISO);
            // this.logger.log(endOfYesterdayISO);

            let baseWhereClause = {
                archive_date: {
                    [Op.between]: [startOfYesterdayISO, endOfYesterdayISO],
                },
                loading_status: 'Загружен',
                isStm: isStm,
                manager: { [Op.ne]: 'Архив' },
            };

            let whereClause = await this.buildFiltersForAuto({ isAuto, baseWhereClause })

            const feedbackCounts = await this.ozonFeedbacksAndQuestions.findAll({
                attributes: ['manager', 'kind', [fn('COUNT', col('manager')), 'feedbackCount']],
                where: whereClause,
                group: ['manager', 'kind'],
            })

            let result = feedbackCounts.reduce((acc, row) => {
                if (!row.dataValues.manager || !row.dataValues.kind) return acc;
                if (!acc[row.dataValues.kind]) acc[row.dataValues.kind] = {};

                const manager = row.dataValues.manager;
                const feedbackCount = +row.dataValues.feedbackCount;

                if (isAuto && manager === 'Авто') {
                    acc[row.dataValues.kind]['Авто'] = (acc[row.dataValues.kind]['Авто'] || 0) + feedbackCount;
                } else if (!isAuto && manager !== 'Авто') {
                    acc[row.dataValues.kind][manager] = (acc[row.dataValues.kind][manager] || 0) + feedbackCount;
                }

                return acc;
            }, {});

            let sheetsValues = await this.GsheetsService.getValues({ range: `'Статистика'!A1:ZZ`, spreadsheetId: this.currentSSId });
            let headers = sheetsValues[0].reduce((acc, header, index) => {
                acc[header] = index;
                return acc;
            }, {});

            let dateIndices = sheetsValues.reduce((acc, row, index) => {
                acc[row[headers['Дата']]] = index + 1;
                return acc;
            }, {});
            const finArr = new Array(Object.keys(headers).length).fill(null);
            const getTotal = obj => Object.values(obj).reduce((sum: number, value: number) => sum + value, 0);

            for (const [header, index] of Object.entries(headers) as [string, number][]) {
                if (header === 'Дата') {
                    finArr[index] = new Date(yesterday).toLocaleDateString('ru');
                } else if (header.includes('(общие)')) {
                    const type = header.includes('ОТЗЫВЫ') ? 'Отзыв' : 'Вопрос';
                    finArr[index] = getTotal(result[type] || {});
                } else {
                    const type = header.includes('ОТЗЫВЫ') ? 'Отзыв' : 'Вопрос';
                    const name = header.split('\n')[1];
                    finArr[index] = result[type]?.[name] || 0;
                }
            }

            if (dateIndices[new Date(yesterday).toLocaleDateString('ru')]) {
                let row = dateIndices[new Date(yesterday).toLocaleDateString('ru')];
                await this.GsheetsService.setValues2({ range: `'Статистика'!A${row}:ZZ${row}`, values: [finArr], spreadsheetId: this.currentSSId });
            } else {
                await this.GsheetsService.addEmptyRows({ sheetName: `'Статистика'`, numberOfRows: 1, spreadsheetId: this.currentSSId });
                await this.GsheetsService.setValues2({ range: `'Статистика'!A${sheetsValues.length + 1}:ZZ`, values: [finArr], spreadsheetId: this.currentSSId });

            }
        } catch (err) {
            throw `setAnswerStatistics ${err}`;
        }
    }

    async getUnprocessedMessages(): Promise<{ message_id: string, kind: string, message_status: string, loading_status: string }[]> {
        await this.ozonFeedbacksAndQuestions.sync({ force: false });

        this.logger.log(`Поиск всех необработанных ВиО в БД`);
        return await this.ozonFeedbacksAndQuestions.findAll({
            attributes: ['message_id', 'kind', 'message_status', 'loading_status'],
            where: {
                [Op.or]: [
                    { message_status: { [Op.is]: null } },
                    { message_status: { [Op.ne]: 'PROCESSED' } }
                ],
                loading_status: 'Загружен'
            }
        });
    }

    async changeStatus({ messageIds, isQuestion, type }) {
        let messageIdChunks = [];
        let chunkSize = 100;
        for (let i = 0; i < messageIds.length; i += chunkSize) {
            messageIdChunks.push(messageIds.slice(i, i + chunkSize));
        }

        let processedMessages = [];
        let messageType = isQuestion ? 'вопросов' : 'отзывов';
        let apiService = isQuestion ? this.QuestionsApiService : this.FeedbacksApiService;

        for (let i = 0; i < messageIdChunks.length; i++) {
            let chunk = messageIdChunks[i];
            let params: any = {
                status: 'PROCESSED',
                type,
                ...(isQuestion ? { questionsIds: chunk } : { feedbackIds: chunk })
            };

            try {
                await apiService.changeStatus(params as typeof params);
                this.logger.log(`ВиО Озон обновление статусов ${messageType}: ${i * chunkSize}/${messageIds.length}`);
                chunk.forEach(id => {
                    processedMessages.push({
                        message_id: id,
                        message_status: 'PROCESSED',
                        loading_status: 'Загружен'
                    });
                });
            } catch (err) {
                this.logger.warn(`ВиО Озон обновление статусов ${messageType} ${chunk}: Ошибка с кодом ${err.response.code} ${err.response.data}`);
                continue;
            }
        }

        await this.updateFeedbacksAndQuestionsDB({ messageData: processedMessages, fields: ['message_status', 'loading_status'] });
        this.logger.log(`ВиО Озон обновление статусов закончено`);
    }


}


