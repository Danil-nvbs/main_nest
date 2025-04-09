import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { DischargeService } from './discharge.service';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { GetDischargeDto } from './dto/get-discharge.dto';

@ApiTags('Discharge')
@Controller('discharge')
export class DischargeController {
    constructor(
        private readonly dischargeService: DischargeService,

    ) { }
    @ApiOperation({ summary: "Создает записи продуктов в БД" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: GetDischargeDto })
    @UseGuards(GsUserGuard)
    @Post('/list')
    async getDischarge(
        @Body() dto: GetDischargeDto,
        ) {
        return this.dischargeService.getDischarge(dto)
    }
}
