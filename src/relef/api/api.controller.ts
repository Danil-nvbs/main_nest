import { Body, Controller, Get, HttpStatus, Injectable, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { RelefApiService } from './relef.service';
import { ShipmentApiDto } from './dto';

@ApiTags('RELEF API')
@Controller('relef/api')
@Injectable()
export class RelefApiController {

    constructor(
        private readonly relefApiService: RelefApiService,

    ) { }

    @ApiOperation({ summary: "Получение списка поставок" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: ShipmentApiDto, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/shipments')
    async getShipmentsList(
        @Body('type') type: string,
        @Body('docNumbers') docNumbers: string[]
    ) {
        let shipments = await this.relefApiService.getShipments();
        if (docNumbers?.length) {
            shipments = shipments.filter(shipment => !docNumbers.includes(shipment.documentNumber));
        }
        return shipments;
    }

}
