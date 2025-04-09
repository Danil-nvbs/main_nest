import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { PrintLabelsService } from './print-labels.service';
import { CreatePrintBaseShipmentDto } from './dto/create-printbaseshipment.dto';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { DischargeService } from 'src/discharge/discharge.service';
import { SetPrintedDto } from './dto';

@UseGuards(GsUserGuard)
@Controller('print-labels')
export class PrintLabelsController {
    constructor(
        private printLabelsService: PrintLabelsService,
        private dischargeService: DischargeService,
    ) {}

    @Post('create-shipment')
    async createShipment(@Body(new ValidationPipe({ transform: true })) createPrintBaseShipmentDto: CreatePrintBaseShipmentDto) {
        return this.printLabelsService.createShipment(createPrintBaseShipmentDto);
    }

    @Get('open-shipments')
    async getOpenShipments() {
        return this.printLabelsService.getOpenShipments();
    }

    @Get('find-by-barcode')
    async findByBarcode(
        @Query('barcode') barcode: string,
        @Query('market') market: string
    ) {
        const map = {
            WbPk: 'vendorCode',
            WbIp: 'vendorCode',
            OzonPk: 'article',
            OzonFeyt: 'article',
        }
        return this.dischargeService.getDischarge({market, columns: [map[market]], filters: [{barcode}]})
    }

    @Post('set-printed')
    async setPrinted(
        @Body(ValidationPipe) body: SetPrintedDto
    ) {
        try {
            return this.printLabelsService.setPrinted(body)
        } catch(err) {
            throw new HttpException(`Ошибка при записи события печати: ${err}`, HttpStatus.BAD_REQUEST)
        }
    }

    @Post('get-order-by-barcode')
    async getOrderByBarcode(
        @Body() body: {
            barcode: string, 
            market: string, 
            type: string, 
            model: string, 
            shipment_name: string
        }
    ) {
        try {
            return this.printLabelsService.getOrderByBarcode(body)
        } catch(err) {
            throw new HttpException(`Ошибка при получении заказа: ${err}`, HttpStatus.BAD_REQUEST)
        }
    }

}
