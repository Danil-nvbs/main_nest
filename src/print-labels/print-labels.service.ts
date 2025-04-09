import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrintBaseShipment, PrintBaseShipmentContent } from './models/printbase.model';
import { CreatePrintBaseShipmentDto, SetPrintedDto } from './dto/index';
import { InjectModel } from '@nestjs/sequelize';
import { RequestService } from 'src/request/request.service';
import { DischargeService } from 'src/discharge/discharge.service';
import { WbFbsOrdersService } from 'src/wildberries/fbs-orders/fbs-orders.service';
import { WbFbsPrinted } from './models/printed-wb-fbs';

@Injectable()
export class PrintLabelsService {
    constructor(
        @InjectModel(PrintBaseShipment) private printBaseShipment: typeof PrintBaseShipment,
        @InjectModel(PrintBaseShipmentContent) private printBaseShipmentContent: typeof PrintBaseShipmentContent,
        private dischargeService: DischargeService,
        private requestService: RequestService,
        private wbFbsOrdersService: WbFbsOrdersService
    ) {}

    private readonly logger = new Logger(PrintLabelsService.name);

    async createShipment(createPrintBaseShipmentDto: CreatePrintBaseShipmentDto) {

        try {
            const author = this.requestService.getAuthor();
            const { items, ...shipmentData } = createPrintBaseShipmentDto;
            const shipment = await this.printBaseShipment.create({...shipmentData, author});
            const fullItems = []
            for (let item of items) {
                for (let i = 0; i < item.qty; i++) {
                    fullItems.push({ ...item, shipment_name: shipment.name })
                }
            }
            const contents = await this.printBaseShipmentContent.bulkCreate(fullItems);
            return { ok: true, shipment, contents }
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new HttpException('Отгрузка с таким названием уже существует', HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException('Ошибка при создании отгрузки', HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }

    async getOpenShipments() {
        const shipments = await this.printBaseShipment.findAll({
            where: {
                finished: false
            }
        })
        return shipments
    }

    async getProductByBarcode({ barcode, shipment_name, market}: {barcode: string, shipment_name: string, market: string}) {

    }

    async getOrderByBarcode(body: {
        barcode: string, 
        market: string, 
        type: string, 
        model: string, 
        shipment_name: string
    }) {
        const {barcode, market, type, model, shipment_name} = body    
        const article = await this.dischargeService.getDischarge({market: `${market}${type}`, filters: [{barcode}]})
        if (article.length === 0) throw new HttpException('Товар не найден', HttpStatus.BAD_REQUEST)
        
        if (market === 'Wb' && type === 'Pk' && model === 'fbs') {
            this.logger.log(`getOrderByBarcode: ${article[0].vendorCode.toUpperCase()} ${shipment_name}`)
            const order = await this.wbFbsOrdersService.getOrderByArticle({ article: article[0].vendorCode.toUpperCase(), supplyId: shipment_name })
            if (!order) throw new HttpException('Заказ не найден', HttpStatus.BAD_REQUEST)
            return order
        }
        
        return article[0]
    }

    async setPrinted(body: SetPrintedDto) {
        if (body.market === 'Wb' && body.type === 'Pk' && body.model === 'fbs') {
            try {
                return WbFbsPrinted.create({
                id: body.orderId,
                kiz: body.kiz,
                author: body.author,
                scanner: body.scanner,
                printer: body.printer
            })
            } catch(err) {
                throw new HttpException (`Ошибка при записи события печати: ${err}`, HttpStatus.BAD_REQUEST)
            }
        }
    } 
    
}
