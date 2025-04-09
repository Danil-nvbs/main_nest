import { Body, Controller, HttpStatus, Injectable, Post, Res, UseGuards } from "@nestjs/common";
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GsUserGuard } from "src/auth/gs-email.guard";
import { MagnitApiService } from "./api.service";
import { GsheetsService } from "src/gsheets/gsheets.service";
import { JSHelperService } from "src/JSHelper.service";



@ApiTags('MAGNIT API')
@Controller('magnit/api')
@Injectable()
export class MagnitApiController {
    constructor(
        private readonly shipmentsApiService: MagnitApiService,
        private readonly gsheetsService: GsheetsService,
        private readonly jsHelperService: JSHelperService,


    ) { }

    @ApiOperation({ summary: 'Получение списка на сборку' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/shipment/list')
    async getShipmentList(
        @Body('type') type: string,
        @Body('status') status: "NEW" | "IN_ASSEMBLY" | "ASSEMBLED" | "CANCELED",
        @Body('dateFrom') dateFrom: string,

    ) {
        return await this.shipmentsApiService.getShipmentList({ dateFrom, type, status})
    }

    @ApiOperation({ summary: 'Получение списка товаров' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/product/list')
    async getProductList(
        @Body('type') type: string
    ) {
        return await this.shipmentsApiService.getProductList({ type });
    }

    @ApiOperation({ summary: 'Создание посылки' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/parcel/create')
    async createParcels(
        @Body('type') type: string,
        @Body('items') items: any[],
        @Body('orderId') orderId: string,
    ) {
        return await this.shipmentsApiService.createParcels({ orderId, type, items });
    }

    @ApiOperation({ summary: 'Получение категорий' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/categories')
    async getCategories(
        @Body('type') type: string,
    ) {
        return await this.shipmentsApiService.getCategories({ type });
    }

    @ApiOperation({ summary: 'Подтверждение отгрузки' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/shipment/confirm')
    async confirmShipment(
        @Body('type') type: string,
        @Body('deliveryDate') deliveryDate: string,

    ) {
        return await this.shipmentsApiService.confirmShipment({ type, deliveryDate });
    }

    @ApiOperation({ summary: 'Добавить посылки к отгрузке' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/shipment/add')
    async addParcels(
        @Body('type') type: string,
        @Body('parcelIds') parcelIds: string[],

    ) {
        return await this.shipmentsApiService.addParcels({ type, parcelIds });
    }

    @ApiOperation({ summary: 'Получить список посылок' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/parcel/list')
    async getParcelsList(
        @Body('type') type: string,
        @Body('parcelIds') parcelIds: string[],

    ) {
        return await this.shipmentsApiService.getParcelsList({ type, parcelIds });
    }

    // @ApiOperation({ summary: 'Сохранение pdf файла' })
    // @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    // @ApiBasicAuth('x_gs_token')
    // @UseGuards(GsUserGuard)
    // @Post('/order/pdf')
    // async getPDF(
    //     @Body('type') type: string
    // ) {
    //     const ordersData = await this.shipmentsApiService.getPDF({ type });
    //     const downloadPath = path.join(__dirname, 'download', 'order.pdf');
    //     const dir = path.dirname(downloadPath);
    //     if (!fs.existsSync(dir)) {
    //         fs.mkdirSync(dir, { recursive: true });
    //     }
    //     fs.writeFileSync(downloadPath, ordersData.file_content, 'binary');
    // }
}