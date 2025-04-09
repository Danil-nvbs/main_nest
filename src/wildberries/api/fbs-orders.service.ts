import { Logger } from '@nestjs/common';
import { BaseWildberriesApiService } from './baseWildberriesApi.serivce';
import { FbsOrderDto, FbsStickerDto } from './dto/index';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { HttpService } from '@nestjs/axios';
import { FbsStatusDto } from './dto/fbsStatus.dto';
export class WbFbsOrdersApiService extends BaseWildberriesApiService {

    constructor(
        gsheetsService: GsheetsService,
        httpService: HttpService,
    ) {
        super(gsheetsService, httpService);
    }

    private readonly logger = new Logger(WbFbsOrdersApiService.name);

    async getFbsOrders({type, dateFrom, dateTo}: {type: string, dateFrom: string, dateTo: string}): Promise<FbsOrderDto[]> {
        let failedAttempts = 0;
        let url = `https://marketplace-api.wildberries.ru/api/v3/orders`
        let next = 0
        let limit = 1000
        let finArr: FbsOrderDto[] = [];
        let curDateFrom = new Date(dateFrom)
        while (true) {
            let curDateTo = new Date(new Date(curDateFrom).setDate(curDateFrom.getDate() + 30))
            curDateTo.setSeconds(curDateTo.getSeconds() - 1)
            if (curDateTo > new Date(dateTo)) curDateTo = new Date(dateTo)
            try {
                while (true) {
                    this.logger.log(`get orders from ${curDateFrom} to ${curDateTo} with next ${next} and limit ${limit}`)
                    let response = await this.httpService.axiosRef.get(url, {
                        params: { dateFrom: new Date(curDateFrom).getTime() / 1000, dateTo: new Date(curDateTo).getTime() / 1000, next, limit },
                        headers: await this.getHeaders(type) 
                    });
                    finArr = finArr.concat(response.data.orders);
                    if (response.data.orders.length < limit) break

                    next = response.data.next;
                }
            } catch (err) {
                this.logger.error(`WbApi getFbsOrders error: ${err.message}`);

                failedAttempts++;
                if (failedAttempts >= 10) {
                    throw err.response;
                }
                await this.sleep(60*1000);
            }
            if (curDateTo >= new Date(dateTo)) break
            curDateFrom = new Date(curDateTo)
            curDateFrom.setSeconds(curDateFrom.getSeconds() + 1)
        }
        
        let map = finArr.reduce((acc, order) => { acc[order.id] = (acc[order.id] || 0) + 1; return acc }, {})
        let finArrFiltered = finArr.filter(m => map[m.id] === 1)
        this.logger.log(`WbFbsOrdersApiService getFbsOrders success: ${finArr.length} orders`)
        return finArrFiltered;
    }

    async getFbsStickers({ type, orderIds }: {type: string, orderIds: number[]}): Promise<FbsStickerDto[]> {
        let failedAttempts = 0;
        let url = `https://marketplace-api.wildberries.ru/api/v3/orders/stickers`
        let limit = 100
        let finArr: FbsStickerDto[] = [];
        this.logger.log(`Getting stickers for ${orderIds.length} orders`)
        for (let i = 0; i < orderIds.length; i += limit) {
            let chunk = orderIds.slice(i, i + limit)

            while (true) {
                try {
                    let body = {orders: chunk}
                    let response = await this.httpService.axiosRef.post(url, body, {
                        params: {
                            type: 'zplv',
                            width: 58,
                            height: 40,
                        },
                        headers: await this.getHeaders(type)
                    })
                    finArr = finArr.concat(response.data.stickers)
                    break
                } catch (err) {
                    this.logger.error(`WbApi getFbsStickers error: ${err.message}`);

                    failedAttempts++;
                    if (failedAttempts >= 10) {
                        throw err.response;
                    }
                    await this.sleep(60000)
                }
            }
        }
        
        this.logger.log(`getFbsStickers success: ${finArr.length} stickers`)
        return finArr;
    }

    async getFbsStatuses({ type, orderIds }: {type: string, orderIds: number[]}): Promise<FbsStatusDto[]> {
        let failedAttempts = 0;
        let url = `https://marketplace-api.wildberries.ru/api/v3/orders/status`
        let limit = 1000
        let finArr: FbsStatusDto[] = [];
        this.logger.log(`Getting statuses for ${orderIds.length} orders`)
        for (let i = 0; i < orderIds.length; i += limit) {
            let chunk = orderIds.slice(i, i + limit)

            while (true) {
                try {
                    let body = {orders: chunk}
                    let response = await this.httpService.axiosRef.post(url, body, {
                        headers: await this.getHeaders(type)
                    })
                    finArr = finArr.concat(response.data.orders)
                    break
                } catch (err) {
                    this.logger.error(`WbApi getFbsStatuses error: ${err.message}`);
                    
                    failedAttempts++;
                    if (failedAttempts >= 10) {
                        throw err.response;
                    }
                    await this.sleep(60000)
                }
            }
        }
        
        this.logger.log(`getFbsStatuses success: ${finArr.length} statuses`)
        return finArr;
    }
}
