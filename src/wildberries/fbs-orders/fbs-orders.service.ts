import { Injectable, Logger } from '@nestjs/common';
import { WbFbsOrdersApiService } from '../api/fbs-orders.service';
import { InjectModel } from '@nestjs/sequelize';
import { WbFbsOrder } from './models/fbs-orders.model';
import { BasicFilterDto } from 'src/common/basicFilter.dto';
import { Op, Sequelize } from 'sequelize';
import { WbFbsStickers } from './models/fbs-stickers.model';
import { FbsStickerDto, FbsSupplyDto } from '../api/dto';
import { last } from 'rxjs';
import { WbFbsStatuses } from './models/fbs-statuses.model';
import { WbFbsSupply } from './models/fbs-supplies.model';
import { WbFbsSuppliesApiService } from '../api/fbs-supplies.service';
import { WbFbsPrinted } from 'src/print-labels/models/printed-wb-fbs';

@Injectable()
export class WbFbsOrdersService {
    constructor(
        private readonly fbsOrdersService: WbFbsOrdersApiService,
        private readonly fbsSuppliesService: WbFbsSuppliesApiService,
        @InjectModel(WbFbsOrder) private wbFbsOrders: typeof WbFbsOrder,
        @InjectModel(WbFbsStickers) private wbFbsStickers: typeof WbFbsStickers,
        @InjectModel(WbFbsStatuses) private wbFbsStatuses: typeof WbFbsStatuses,
        @InjectModel(WbFbsSupply) private wbFbsSupply: typeof WbFbsSupply,
    ) {}

    private readonly logger = new Logger(WbFbsOrdersService.name);
    
    async getAllOrders() {

    }

    async getOrderById(id: string) {

    }

    async getOrderByArticle({article, supplyId}: {article: string, supplyId: string}) {
        return this.wbFbsOrders.findOne({

            include: [WbFbsStickers, WbFbsStatuses, WbFbsSupply, WbFbsPrinted],
            where: {
                [Op.and]: [
                    {article},
                    {supplyId},
                    Sequelize.where(Sequelize.col('printed.id'), 'IS', null)
                ]
            },
        })
    }

    async openSuppliesList({type}: {type: string}) {
        return this.wbFbsSupply.findAll({
            where: {
                type,
                closedAt: null
            }
        })
    }

    async refreshOrders({type, dateFrom, dateTo}: {type: string, dateFrom: string, dateTo: string}) {
        let fbsOrders = (await this.fbsOrdersService.getFbsOrders({type, dateFrom, dateTo})).map(m=>({...m, supplyId: m.supplyId || null, type}))

        let chunkSize = 1000
        let result = []
        for (let i = 0; i < fbsOrders.length; i += chunkSize) {
            this.logger.log(`WbFbsOrdersService refreshOrders: ${i} of ${fbsOrders.length}`)
            let chunk = fbsOrders.slice(i, i + chunkSize)
            result = result.concat(await this.wbFbsOrders.bulkCreate(chunk, {updateOnDuplicate: Object.keys(chunk[0])}))
        }

        return {ok: true, count: result.length}
    }

    async getOrders(dto: BasicFilterDto) {
        let { columns, limit = null, offset = 0, filters = [] } = dto;

        if (
            filters.length &&
            !filters.some(filter => Object.keys(filter).length > 1) &&
            !filters.some(filter => Object.keys(filter).join('') != Object.keys(filters[0]).join(''))
        ) {
            const column = Object.keys(filters[0])[0];
            return await this.wbFbsOrders.findAll({
                attributes: columns,
                limit,
                offset,
                order: [['article', 'ASC']],
                where: {
                    [column]: {
                        [Op.in]: filters.map(filter => filter[column])
                    }

                }
            });
        }

        return await this.wbFbsOrders.findAll({
            attributes: columns,
            limit,
            offset,
            order: [['article', 'ASC']],
            where: filters.length ? { [Op.or]: filters } : null,
            include: [{
                model: WbFbsStickers,
                required: false, // LEFT JOIN
              }]
        });        
    }

    async refreshStatuses({ type }: { type: string }) {
        let result = []
        let limit = 10000
        let offset = 0
        while (true) {
            const orders = await this.wbFbsOrders.findAll({
                attributes: ['id'], // Укажите нужные атрибуты
                limit,
                offset,
                include: [
                    {
                        model: WbFbsStatuses,
                        required: false,
                        as: 'status',
                        where: {
                            wbStatus: { [Op.notIn]: ['canceled', 'sold', 'canceled_by_client', 'declined_by_client']},
                        }
                    }
                ],                
            })
            if (orders.length === 0) break
            let statuses = await this.fbsOrdersService.getFbsStatuses({ type, orderIds: orders.map(m=>+m.id) })
            result = result.concat(await this.wbFbsStatuses.bulkCreate(statuses.map(status => ({
                id: status.id,
                supplierStatus: status.supplierStatus,
                wbStatus: status.wbStatus
            })), { updateOnDuplicate: ['supplierStatus', 'wbStatus'] }));
            offset += limit
        }
        return {ok: true, count: result.length}
    }

    async refreshStickers({ type }: {type: string}) {
        let result = []
        while (true) {
            const ordersWithoutStickers = await this.wbFbsOrders.findAll({
                attributes: ['id'], // Укажите нужные атрибуты
                limit: 1000,
                include: [
                    {
                        model: WbFbsStickers,
                        required: false, // LEFT JOIN
                        as: 'sticker' // Убедитесь, что алиас совпадает с тем, что используется в модели
                    },
                    {
                        model: WbFbsStatuses,
                        required: true,
                        as: 'status',
                        where: {
                            wbStatus: { [Op.ne]: 'canceled' },
                        }
                    }
                ],
                where: {
                    [Op.and]: [
                      Sequelize.where(Sequelize.col('sticker.orderId'), 'IS', null), // Условие для поиска записей, где sticker равен null
                      { supplyId: { [Op.ne]: null } }, // Условие для проверки, что supplyId не равен null
                      { supplyId: { [Op.ne]: '' } } // Условие для проверки, что supplyId не пустая строка
                    ]
                  }
            });
            this.logger.log(`Orders without stickers: ${ordersWithoutStickers.length}`)
            if (ordersWithoutStickers.length === 0) break
            let stickers: FbsStickerDto[] = await this.fbsOrdersService.getFbsStickers({ type, orderIds: ordersWithoutStickers.map(m=>+m.id) })
            result = result.concat(await this.wbFbsStickers.bulkCreate(stickers.map(sticker => ({
                orderId: sticker.orderId,
                partA: sticker.partA,
                partB: sticker.partB,
                barcode: sticker.barcode,
                file: sticker.file
            })), { updateOnDuplicate: ['orderId', 'partA', 'partB', 'barcode', 'file'] }));
        }

        return {ok: true, count: result.length}



    }

    async getAllSupplies({ type }: { type: string }) {
        return this.fbsSuppliesService.getFbsSupplies({ type })
    }

    async refreshSupplies({ type, fbsSupplies }: { type: string, fbsSupplies?: FbsSupplyDto[] }) {
        let fbsSuppliesWithType = (fbsSupplies || await this.getAllSupplies({ type })).map(m=>({...m, type}))

        let chunkSize = 10000
        let result = []
        for (let i = 0; i < fbsSuppliesWithType.length; i += chunkSize) {
            this.logger.log(`FbsSuppliesService refreshSupplies: ${i} of ${fbsSuppliesWithType.length}`)
            let chunk = fbsSuppliesWithType.slice(i, i + chunkSize)
            result = result.concat(await this.wbFbsSupply.bulkCreate(chunk, { 
                updateOnDuplicate: ['id', 'done', 'createdAt', 'closedAt', 'scanDt', 'name', 'cargoType', 'type'] 
            }));
        }

        return {ok: true, count: result.length}
    }

}
