import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { MarginService } from './margin.service';
import { RequestService } from 'src/request/request.service';

@Controller('margin')
export class MarginController {

    constructor(
        private readonly regularTaskService: RegularTasksService,
        private marginService: MarginService,
    ) { }

    @ApiOperation({ summary: `Обновление листа в таблице "Маржа по брендам"` })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Get('/update')
    async updateMarginSheet() {
        return this.marginService.updateMarginSheet()
    }
}
