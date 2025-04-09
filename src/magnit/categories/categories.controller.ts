import { ApiBasicAuth, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { MagnitCategoriesService } from './categories.service';
import { MagnitApiService } from '../api/api.service';
import { GsUserGuard } from 'src/auth/gs-email.guard';

@ApiTags('Категории Magnit')
@Controller('/magnit/categories')
export class MagnitCategoriesController {
    constructor(
        private readonly categoriesService: MagnitCategoriesService,
        private readonly apiService: MagnitApiService,

    ) { }
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Обновляет или создает карточки не изменяя поле barcode' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/update')
    @HttpCode(200)
    async update(
        @Body('type') type: string
    ) {
        let data = await this.apiService.getCategories({ type })
        await this.categoriesService.upsertManyCategories(data)

    }

    @ApiExcludeEndpoint()
    @ApiOperation({ summary: 'Обновляет или создает карточки не изменяя поле barcode' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Успешно' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Некорректный запрос' })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Get('/get')
    @HttpCode(200)
    async getCategories() {
        return await this.categoriesService.getCategoriesList()

    }
}
