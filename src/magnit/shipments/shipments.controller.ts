import { Body, Controller, HttpStatus, Injectable, Post, Res, UseGuards } from "@nestjs/common";
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GsUserGuard } from "src/auth/gs-email.guard";
import { MagnitApiService } from "../api/api.service";
import { GsheetsService } from "src/gsheets/gsheets.service";
import { JSHelperService } from "src/JSHelper.service";
import * as fs from 'fs';
import * as path from 'path';
import { MagnitDischargeService } from "../discharge/discharge.service";



@ApiTags('MAGNIT API')
@Controller('magnit/shipment')
@Injectable()
export class MagnitShipmentController {
    constructor(
        private readonly shipmentsApiService: MagnitApiService,
        private readonly gsheetsService: GsheetsService,
        private readonly jsHelperService: JSHelperService,
        private readonly dischargeService: MagnitDischargeService,

    ) { }

    @ApiOperation({ summary: 'Получить список необработанных заданий' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/list')
    async getShipmentList(
        @Body('type') type: string
    ) {
        let sheetValues = await this.gsheetsService.getValues({ range: `'Обработка отгрузки'!A1:ZZ`, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        let headers = await this.jsHelperService.makeHeader({ sheetsValues: sheetValues.slice(3) })

        let shipmentData = await this.shipmentsApiService.getShipmentList({ dateTo: new Date().toISOString(), type, status: "NEW", dateFrom: "2023-09-01T00:00:00Z" })
        let discharge = (await this.dischargeService.getDischarge({ columns: ["article", "sku_id"], type })).reduce((acc, item) => {
            acc[item.sku_id] = item.article
            return acc
        }, {})
        let finArr = []
        for (let shipment of shipmentData) {
            for (let item of shipment.items) {
                let newRow = new Array(Object.keys(headers).length).fill(null)
                newRow[headers['loading_at']] = new Date().toLocaleDateString('ru')
                newRow[headers['created_at']] = new Date(shipment.created_at).toLocaleDateString('ru')
                newRow[headers['cutoff_time']] = new Date(shipment.cutoff_time).toLocaleDateString('ru')
                newRow[headers['price']] = item.financial_data.price
                newRow[headers['old_price']] = item.financial_data.old_price
                newRow[headers['sku_id']] = item.sku_id
                newRow[headers['quantity']] = item.quantity
                newRow[headers['order_id']] = shipment.order_id
                newRow[headers['Seller SKU ID']] = discharge[item.sku_id]
                finArr.push(newRow)
            }
        }
        await this.gsheetsService.clearValues({ range: `'Обработка отгрузки'!A5:ZZ`, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        await this.gsheetsService.clearValues({ range: `'Обработка отгрузки'!B2`, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        await this.gsheetsService.setValues2({ range: `'Обработка отгрузки'!A5:ZZ`, values: finArr, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
    }

    @ApiOperation({ summary: 'Создать посылки из заданий' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/create')
    async createShipment(
        @Body('type') type: string
    ) {
        let sheetValues = await this.gsheetsService.getValues({ range: `'Обработка отгрузки'!A1:ZZ`, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        let headers = await this.jsHelperService.makeHeader({ sheetsValues: sheetValues.slice(3) })
        let ordersObj = sheetValues.slice(4).reduce((acc, row) => {
            if (!acc[row[headers['order_id']]]) acc[row[headers['order_id']]] = []
            acc[row[headers['order_id']]].push({ sku_id: +row[headers['sku_id']], quantity: +row[headers['quantity']] })
            return acc
        }, {})
        let parcelData = {}
        for (let orderId in ordersObj) {
            let parcelCreateResult = (await this.shipmentsApiService.createParcels({ orderId, items: ordersObj[orderId], type }))

            parcelData[orderId] = parcelCreateResult.items.reduce((acc, item) => {
                acc[item.sku_id] = { ...item, parcelId: parcelCreateResult.parcel_id }
                return acc
            }, {})
        }

        let finArr = sheetValues.slice(4).map(row => {
            if (parcelData?.[row[headers['order_id']]]?.[row[headers['sku_id']]]) row[headers['parcel_id']] = parcelData[row[headers['order_id']]][row[headers['sku_id']]].parcelId
            return row
        })
        await this.gsheetsService.clearValues({ range: `'Обработка отгрузки'!A5:ZZ`, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        await this.gsheetsService.setValues2({ range: `'Обработка отгрузки'!A5:ZZ`, values: finArr, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        return parcelData
    }

    @ApiOperation({ summary: 'Подтверждение сборки' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/confirm')
    async confirmShipment(@Body('type') type: string) {
        let sheetValues = await this.gsheetsService.getValues({
            range: `'Обработка отгрузки'!A1:ZZ`,
            spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID,
        });

        let headers = await this.jsHelperService.makeHeader({ sheetsValues: sheetValues.slice(3) });
        let completeObj = {};
        let parcelIds = [];
        let finArrPromises = sheetValues.slice(4).map(async (row) => {
            if (!completeObj[row[headers['order_id']]]) {
                let shipmentData = await this.shipmentsApiService.completeShipments({ orderId: row[headers['order_id']], type });
                completeObj[row[headers['order_id']]] = shipmentData.parcels.reduce((acc, parcel) => {
                    acc[parcel.parcel_id] = parcel.barcode;
                    return acc;
                }, {});
            }
            row[headers['barcode (parcel)']] = completeObj[row[headers['order_id']]][row[headers['parcel_id']]];
            parcelIds.push(row[headers['parcel_id']]);
            return row;
        });

        let finArr = await Promise.all(finArrPromises);
        let parcelList =  ((await this.shipmentsApiService.getParcelsList({ type, parcelIds }))).reduce((acc, parcel) => {
            acc[parcel.parcel_id] = parcel.status
            return acc
        }, {})

        finArr.forEach((row) => {
            row[headers['status']] = parcelList[row[headers['parcel_id']]];
        });

        await this.gsheetsService.clearValues({ range: `'Обработка отгрузки'!A5:ZZ`, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        await this.gsheetsService.setValues2({ range: `'Обработка отгрузки'!A5:ZZ`, values: finArr, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        return finArr
    }


    @ApiOperation({ summary: 'Добавить посылки к отгрузке' })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/add')
    async addShipment(
        @Body('type') type: string,
    ) {

        let sheetValues = await this.gsheetsService.getValues({ range: `'Обработка отгрузки'!A1:ZZ`, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        let headers = await this.jsHelperService.makeHeader({ sheetsValues: sheetValues.slice(3) })
        let parcelIds = sheetValues.slice(4).map(row => row[headers['parcel_id']])
        parcelIds = [...new Set(parcelIds)]
        let addResult = await this.shipmentsApiService.addParcels({ type, parcelIds })
        let finArr = sheetValues.map(row => {
            row[headers['shipment_id']] = addResult.shipment_id
            return row
        })
        await this.gsheetsService.setValue({ range: `'Обработка отгрузки'!B2`, value: addResult.shipment_id, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        await this.gsheetsService.clearValues({ range: `'Обработка отгрузки'!A5:ZZ`, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })
        await this.gsheetsService.setValues2({ range: `'Обработка отгрузки'!A5:ZZ`, values: finArr, spreadsheetId: process.env.MAGNIT_SHIPMENTS_SSID })

        return addResult
    }
}