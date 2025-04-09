import { Body, Controller, Get, HttpStatus, Injectable, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { FeedbacksApiService } from './feedbacks.service';
import {
    FeedbacksListResponseDto,
    FeedbackDetailsBodyDto,
    FeedbackDetailsApiDto,
    QuestionDetailsBodyDto,
    QuestionDetailsApiDto,
    QuestionsListResponseDto,
} from './dto/index';
import { QuestionsApiService } from './question.service';
import { OzonOrdersApiService } from './orders.service';

@ApiTags('OZON API')
@Controller('ozon/api')
@Injectable()
export class OzonApiController {

    constructor(
        private readonly feedbacksApiService: FeedbacksApiService,
        private readonly questionApiService: QuestionsApiService,
        private readonly ordersApiService: OzonOrdersApiService,

    ) { }

    @ApiOperation({ summary: "Получение списка отзывов" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: FeedbacksListResponseDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('feedbacks/list')
    async getFeedbacksList(
        @Body('type') type: string
    ) {
        const feedbacks = await this.feedbacksApiService.getFeedbacksList({ type });
        return feedbacks
    }

    @ApiOperation({ summary: "Получение детализации по отзыву" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: FeedbackDetailsApiDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: FeedbackDetailsBodyDto })
    @UseGuards(GsUserGuard)
    @Post('feedbacks/details')
    async getFeedbackDetails(
        @Body('feedbackId') feedbackId: string,
        @Body('type') type: string,
    ) {
        const feedbackDetails = await this.feedbacksApiService.getFeedbackDetails({ feedbackId, type });
        return feedbackDetails;
    }

    @ApiOperation({ summary: "Получение списка вопросов" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: QuestionsListResponseDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('questions/list')
    async getQuestionsList(
        @Body('type') type: string
    ) {
        const questions = await this.questionApiService.getQuestionsList({ type });
        return questions
    }

    @ApiOperation({ summary: "Получение детализации по вопросу" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: QuestionDetailsApiDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: QuestionDetailsBodyDto })
    @UseGuards(GsUserGuard)
    @Post('questions/details')
    async getQuestionDetails(
        @Body('questionId') questionId: string,
        @Body('type') type: string,
    ) {
        const questionDetails = await this.questionApiService.getQuestionDetails({ questionId, type });
        return questionDetails;
    }

    @ApiOperation({ summary: "Отправка ответа на отзыв" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: QuestionDetailsApiDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: QuestionDetailsBodyDto })
    @UseGuards(GsUserGuard)
    @Post('feedbacks/send')
    async sendFeedbackAnswer(
        @Body('feedbackId') feedbackId: string,
        @Body('answer') answer: string,
        @Body('type') type: string,
    ) {
        await this.feedbacksApiService.sendFeedbackAnswer({ feedbackId, answer, type });
    }

    @ApiOperation({ summary: "Получить список отправлений" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    // @ApiQuery({DcApiOrdersDto})
    @UseGuards(GsUserGuard)
    @Get('orders/list')
    async getOrders(
        @Query('type') type: string,
        @Query('onlySales') onlySales?: boolean,
        @Query('model') model?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('days') days?: number,
        @Query('agregateByRegion') agregateByRegion?: boolean
    ) {
        let orders = await this.ordersApiService.getOrders({ type, model, onlySales, dateFrom, dateTo, days, agregateByRegion }) 
        if (!agregateByRegion) return orders
        let agregateOrders = await this.ordersApiService.agregateOrders(orders)
        return agregateOrders
    }

    @ApiOperation({ summary: "Отправка статуса отзыва" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: QuestionDetailsApiDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: QuestionDetailsBodyDto })
    @UseGuards(GsUserGuard)
    @Post('feedbacks/status/change')
    async changeFeedbackStatus(
        @Body('feedbackIds') feedbackIds: string[],
        @Body('status') status: "PROCESSED" | "UNPROCESSED",
        @Body('type') type: string,
    ) {
        await this.feedbacksApiService.changeStatus({ feedbackIds, status, type });
    }

    @ApiOperation({ summary: "Отправка статуса вопроса" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: QuestionDetailsApiDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: QuestionDetailsBodyDto })
    @UseGuards(GsUserGuard)
    @Post('questions/status/change')
    async changeQuestionsStatus(
        @Body('questionsIds') questionsIds: string[],
        @Body('status') status: 'NEW' | 'VIEWED' | 'PROCESSED',
        @Body('type') type: string,
    ) {
        await this.questionApiService.changeStatus({ questionsIds, status, type });
    }
}
