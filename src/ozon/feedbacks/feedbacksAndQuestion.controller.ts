import { Body, Controller, Get, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { FeedbacksAndQuestionService } from './feedbacksAndQuestion.service';
import { setArchiveBody } from './dto/setArchiveBody.dto';
import { sendAndArchiveBody } from './dto/sendAndArchiveBody.dto';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';

@ApiTags('OZON FEEDBACKS AND QUESTIONS')
@Controller('ozon')
export class FeedbacksAndQuestionsController {
    constructor(
        private readonly FeedbacksAndQuestionService: FeedbacksAndQuestionService,
        private readonly RegularTasksService: RegularTasksService,
    ) { }
    private readonly logger = new Logger(FeedbacksAndQuestionsController.name)


    @ApiOperation({ summary: "Обновление БД ВиО" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/feedbacks/update')
    async updateAllDB(
        @Body() body: { type?: string }
    ) {
        try {
            const { type = 'PK' } = body;
            let fields = [
                'sku',
                'text',
                'date',
                'brand',
                'rating',
                'article',
                'ozon_id',
                'media',
                'kind',
                'type',
                'product_name',
                'isStm',
                'comments_amount',
                'dislikes_amount',
                'is_rating_participant',
                'likes_amount',
                'order_status',
                'message_status'
            ]
            let hasNextQuestions = true
            let totalQuestions = 0
            let lastIdQuestions = null
            while (hasNextQuestions) {
                let messageData = await this.FeedbacksAndQuestionService.getQuestionsData({ type, lastId: lastIdQuestions });
                await this.FeedbacksAndQuestionService.updateFeedbacksAndQuestionsDB({ messageData: messageData.questionsData, fields })
                lastIdQuestions = messageData.lastId
                hasNextQuestions = messageData.hasNext
                totalQuestions += messageData.questionsData.length
                this.logger.log(`Суммарно обработано ${totalQuestions} вопросов, переход к следующей партиции`)
            }

            let hasNextFeedbacks = true
            let totalFeedbacks = 0
            let lastIdFeedbacks = null
            while (hasNextFeedbacks) {
                let messageData = await this.FeedbacksAndQuestionService.getFeedbacksData({ type, lastId: lastIdFeedbacks });
                await this.FeedbacksAndQuestionService.updateFeedbacksAndQuestionsDB({ messageData: messageData.feedbacksData, fields })
                let cancelledFeedbacksIds = messageData.feedbacksData
                    .filter(feedback => feedback.order_status === 'CANCELLED')
                    .map(feedback => feedback.message_id)
                cancelledFeedbacksIds.length && await this.FeedbacksAndQuestionService.changeStatus({ messageIds: cancelledFeedbacksIds, type, isQuestion: false })

                lastIdFeedbacks = messageData.lastId
                hasNextFeedbacks = messageData.hasNext
                totalFeedbacks += messageData.feedbacksData.length
                this.logger.log(`Суммарно обработано ${totalFeedbacks} отзывов, переход к следующей партиции`)
            }
            this.logger.log(`База ВиО Озон обновлена успешно`)
            await this.RegularTasksService.registerTask('ozon_feedbacks_update', { success: true, message: `База ВиО Озон обновлена успешно` })
        } catch (err) {
            await this.RegularTasksService.registerTask('ozon_feedbacks_update', { success: false, message: err.message })
            return err
        }

    }

    @ApiOperation({ summary: "Выгрузка новых отзывов и вопросов из БД в таблицу" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/feedbacks/set')
    async setNewFeedbacksAndQuestions(
        @Body() body: sendAndArchiveBody
    ) {
        let { isStm, isAuto, isQuestion } = body
        let stmPart = isStm ? 'stm' : 'non-stm'
        let autoPart = isAuto ? 'auto' : 'non-auto'
        let questionPart = isQuestion ? 'question' : 'non-question'
        let codename = `ozon_feedbacks_set_${stmPart}_${autoPart}_${questionPart}`
        try {
            if (isQuestion) {
                await this.FeedbacksAndQuestionService.setNewQuestions({ isStm })
            }
            else {
                await this.FeedbacksAndQuestionService.setNewFeedbacks({ isStm, isAuto })
            }
            await this.RegularTasksService.registerTask(codename, {
                success: true,
                message: `Новые сообщения ВиО Озон записаны в таблицу успешно (${stmPart}, ${autoPart}, ${questionPart})`
            })
        } catch (err) {
            await this.RegularTasksService.registerTask(codename, { success: false, message: err.message })
            return err
        }
    }

    @ApiOperation({ summary: "Отправка ответов на ВиО из таблицы" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/feedbacks/send')
    async sendFeedbacksAndQuestionsAnswer(
        @Body() body: sendAndArchiveBody
    ) {
        let { isStm, isAuto, isQuestion, sendLimit, type = 'PK' } = body
        let stmPart = isStm ? 'stm' : 'non-stm'
        let autoPart = isAuto ? 'auto' : 'non-auto'
        let questionPart = isQuestion ? 'question' : 'non-question'
        let codename = `ozon_feedbacks_send_${stmPart}_${autoPart}_${questionPart}`
        try {
            if (isQuestion) {
                let questionObj = await this.FeedbacksAndQuestionService.getQuestionsAnswers({ isStm })
                questionObj = await this.FeedbacksAndQuestionService.sendQuestionsAnswers({ questionObj, type })
                await this.FeedbacksAndQuestionService.changeStatus({ messageIds: Object.keys(questionObj), type, isQuestion });
                await this.FeedbacksAndQuestionService.setSendingResult({ messageObj: questionObj, isQuestion })
            }
            else {
                let feedbackObj = await this.FeedbacksAndQuestionService.getFeedbacksAnswers({ isStm, isAuto, sendLimit })
                feedbackObj = await this.FeedbacksAndQuestionService.sendFeedbacksAnswers({ feedbackObj, type })
                // await this.FeedbacksAndQuestionService.changeStatus({ messageIds: Object.keys(feedbackObj), type, isQuestion });
                await this.FeedbacksAndQuestionService.setSendingResult({ messageObj: feedbackObj })
            }
            await this.RegularTasksService.registerTask(codename, { success: true, message: `Ответы ВиО Озон отправлены успешно (${stmPart}, ${autoPart}, ${questionPart})` })

        } catch (err) {
            await this.RegularTasksService.registerTask(codename, { success: false, message: err.message })
            return err
        }
    }

    @ApiOperation({ summary: "Архивация ВиО из таблицы" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/feedbacks/archive')
    async archiveFeedbacksAndQuestions(
        @Body() body: sendAndArchiveBody
    ) {
        let { isStm, isAuto, isQuestion } = body
        let stmPart = isStm ? 'stm' : 'non-stm'
        let autoPart = isAuto ? 'auto' : 'non-auto'
        let questionPart = isQuestion ? 'question' : 'non-question'
        let codename = `ozon_feedbacks_archive_${stmPart}_${autoPart}_${questionPart}`
        try {
            await this.FeedbacksAndQuestionService.archivate({ isStm, isAuto, isQuestion })
            let res = await this.FeedbacksAndQuestionService.setAnswerStatistics({ isStm, isAuto })
            await this.RegularTasksService.registerTask(codename, { success: true, message: `Архивация ВиО Озон прошла успешно (${stmPart}, ${autoPart}, ${questionPart})` })
            return res
        } catch (err) {
            await this.RegularTasksService.registerTask(codename, { success: false, message: err.message })
            return err
        }
    }

    @ApiOperation({ summary: "Запись архивных данных ВиО за период в таблицу Архив" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/feedbacks/archive/set')
    async setArchive(
        @Body() body: setArchiveBody
    ) {
        const { dateFrom, dateTo } = body;
        await this.FeedbacksAndQuestionService.setArchive({ dateFrom, dateTo });
    }

    @ApiOperation({ summary: "Обновление статуса на Озон для всех отвеченных сообщений в БД" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/feedbacks/status/change/current')
    async changeCurrentStatus(
        @Body('type') type: string,
    ) {
        let rows = await this.FeedbacksAndQuestionService.getUnprocessedMessages();
        let questionsIds = []
        let feedbacksIds = []
        for (let row of rows) {
            switch (row.kind) {
                case 'Отзыв': {
                    feedbacksIds.push(row.message_id)
                    break
                }
                case 'Вопрос': {
                    questionsIds.push(row.message_id)
                    break
                }
                default: continue
            }
        }

        await this.FeedbacksAndQuestionService.changeStatus({ messageIds: feedbacksIds, type, isQuestion: false });
        await this.FeedbacksAndQuestionService.changeStatus({ messageIds: questionsIds, type, isQuestion: true });
    }
}
