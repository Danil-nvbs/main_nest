import { Body, Controller, HttpCode, HttpException, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { BigbaseService } from './bigbase.service';
import { CreateProductDto, GetProductDto, UpdateProductDto, WorkWithTableDto, GetLogsDto, CheckBarcodeDto, } from './dto';
import { BigbaseInterсeptor } from './bigbase.interceptor';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './models/product.model';
import { GsUserGuard } from 'src/auth/gs-email.guard';
import { ProductsPipe } from 'src/pipes/products.pipe';
import { RequestService } from 'src/request/request.service';
import { BigBaseNoArticlesException } from 'src/exceptions/bigbase';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { Op } from 'sequelize';


@ApiTags('BigBase')
@Controller('bigbase')
export class BigbaseController {
    constructor(
        private bigBaseService: BigbaseService, 
        private gsheetService: GsheetsService,
        private requestService: RequestService,
    ) {}

    
    @ApiOperation({ summary: "Создает записи продуктов в БД" })
    @ApiResponse({ status: HttpStatus.CREATED, description: "Успешно", type: Product, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: [CreateProductDto] })
    @UseGuards(GsUserGuard)
    @Post('/create')
    @UseInterceptors(BigbaseInterсeptor)
    async create(
        @Body(ProductsPipe) products: CreateProductDto[],
    ) {
        const author = this.requestService.getAuthor();
        return this.bigBaseService.createProducts(products, author);
    }


    @ApiOperation({ summary: "Обновляет запись продукта в БД" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: Product, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @ApiBody({ type: [UpdateProductDto] })
    @UseGuards(GsUserGuard)
    @Post('/update')
    @HttpCode(200)
    @UseInterceptors(BigbaseInterсeptor)
    async update(
        @Body() products: UpdateProductDto[],
    ) {
        const author = this.requestService.getAuthor();
        return this.bigBaseService.updateProducts(products, author);
    }


    @ApiOperation({ summary: "Получает список продуктов по фильтрам" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно", type: Product, isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/list')
    @HttpCode(200)
    @UseInterceptors(BigbaseInterсeptor)
    get(
        @Body() getDto: GetProductDto,
    ) {
        // if (
        //     getDto.filters &&
        //     !getDto.filters.some(filter => Object.keys(filter).length > 1) &&
        //     !getDto.filters.some(filter => Object.keys(filter).join('') != Object.keys(getDto.filters[0]).join(''))
        // ) {
        //     const column = Object.keys(getDto.filters[0])[0];
        //     return this.bigBaseService.getProducts({ 
        //         ...getDto, 
        //         filters: [{
        //             [column]: {
        //                 [Op.in]: getDto.filters.map(filter => filter[column])
        //             }
        //         }]
        //     });
        // }
        return this.bigBaseService.getProducts(getDto);
    }


    @ApiOperation({ summary: "Создает записи продуктов в БД из Google таблицы" })
    @ApiResponse({ status: HttpStatus.CREATED, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/table/create')
    @UseInterceptors(BigbaseInterсeptor)
    async createFromTable(
        @Body(ValidationPipe) data: WorkWithTableDto,
    ) {
        const { sourceSheetName = 'Добавление' } = data;

        const author = this.requestService.getAuthor();
        const spreadsheetId = this.requestService.getSpreadsheetId();

        if (!spreadsheetId) throw new HttpException('Отсутствует заголовок x_spreadsheet_id', HttpStatus.BAD_REQUEST);

        const googleTableRows = await this.gsheetService.getValues({ range: `'${sourceSheetName}'!B1:ZZ`, spreadsheetId });
        const headerDictionary = await this.bigBaseService.getDictObj();

        const headers = googleTableRows[0];
        const contentArray = googleTableRows.slice(1);

        let resultArr = [];

        for (const row of contentArray) {
            let insert: CreateProductDto = { article: null };

            insert = await this.bigBaseService.getProducDtoFromGTableRow(row, headers, headerDictionary);
            
            if (!insert.article) {
                resultArr.push(['Не указан артикул']);
                continue;
            }

            if (insert.barcode_supplier) {
                const barcodes = await this.bigBaseService.splitBarcodes(insert.barcode_supplier);
                for (const key in barcodes) insert[key] = barcodes[key];
            }
            
            try {
                await this.bigBaseService.createProduct(insert, author);
                resultArr.push(['Добавлен']);
            } catch (err) {
                resultArr.push([`Ошибка добавления: ${err}`])
            }
        };
        
        await this.gsheetService.setValues({ range: `'${sourceSheetName}'!A2:A`, values: resultArr, spreadsheetId });

        return resultArr;
    }


    @ApiOperation({ summary: "Обновляет записи продуктов в БД из Google таблицы" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/table/update')
    @HttpCode(200)
    @UseInterceptors(BigbaseInterсeptor)
    async updateFromTable(
        @Body(ValidationPipe) data: WorkWithTableDto,
    ) {
        const { sourceSheetName = 'Изменение' } = data;

        const author = this.requestService.getAuthor();
        const spreadsheetId = this.requestService.getSpreadsheetId();

        if (!spreadsheetId) throw new HttpException('Отсутствует заголовок x_spreadsheet_id', HttpStatus.BAD_REQUEST);

        const googleTableRows = await this.gsheetService.getValues({ range: `'${sourceSheetName}'!B1:ZZ`, spreadsheetId });
        const headerDictionary = await this.bigBaseService.getDictObj();

        const headers = googleTableRows[0];
        const contentArray = googleTableRows.slice(1);

        let resultArr = [];

        for (const row of contentArray) {
            let updateProductData: UpdateProductDto = { article: null };

            updateProductData = await this.bigBaseService.getProducDtoFromGTableRow(row, headers, headerDictionary);
            
            if (!updateProductData.article) {
                resultArr.push(['Не указан артикул']);
                continue;
            }

            updateProductData.article = updateProductData.article.toLowerCase();

            const barcodes = await this.bigBaseService.splitBarcodes(updateProductData.barcode_supplier || '');
            for (const key in barcodes) updateProductData[key] = barcodes[key];
            
            try {
                await this.bigBaseService.updateProduct(updateProductData, author);
                resultArr.push(['Обновлен']);
            } catch (err) {
                resultArr.push([`Ошибка обновления: ${err.message}`])
            }
        };
        
        await this.gsheetService.setValues({ range: `'${sourceSheetName}'!A2:A`, values: resultArr, spreadsheetId });

        return resultArr;
    }


    @ApiOperation({ summary: "Заполняет лист в Google таблице из БД" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/table/list')
    @HttpCode(200)
    @UseInterceptors(BigbaseInterсeptor)
    async updateTable(
        @Body(ValidationPipe) data: WorkWithTableDto,
    ) {
        const { sourceSheetName = 'Просмотр' } = data;
        const spreadsheetId = this.requestService.getSpreadsheetId();

        if (!spreadsheetId) throw new HttpException('Отсутствует заголовок x_spreadsheet_id', HttpStatus.BAD_REQUEST);

        const content = await this.gsheetService.getValues({ range: `'${sourceSheetName}'!A1:ZZ`, spreadsheetId });

        const headers = content[0];
        const headersObj = headers.reduce((acc, header, index) => {
            acc[header] = index;
            return acc;
        }, {});

        const headerDictionary = await this.bigBaseService.getDictObj();

        const articles = content.slice(1).map(row => row[headersObj['Артикул']]);
        const lowArticles = articles.filter(a => a).map(article => article.toLowerCase());

        if (!lowArticles.length) throw new BigBaseNoArticlesException();

        const products = await this.bigBaseService.getProducts({ 
            columns: headers.filter(header => header in headerDictionary).map(header => headerDictionary[header].name), 
            filters: lowArticles.map(article => ({article})),
        });

        const productsObject = products.reduce((acc, product) => { 
            acc[product.article] = product;
            return acc;
        }, {});

        let resultArr = [];
        for (let article of articles) {
            let newRow = [];

            const product = productsObject[article?.toLowerCase()];

            if (product) {
                for (let key of headers) {
                    if (headerDictionary[key]) { 
                        newRow[headersObj[key]] =  this.bigBaseService.convertToGsFormat(product[headerDictionary[key].name], headerDictionary[key].type);
                    }
                }
            }

            newRow[headersObj['Артикул']] = article;

            resultArr.push(newRow);
        }

        await this.gsheetService.clearValues({ range: `'${sourceSheetName}'!A2:ZZ`, spreadsheetId });

        await this.gsheetService.setValues2({ range: `'${sourceSheetName}'!A2:ZZ`, values: resultArr, spreadsheetId });

        return { message: 'Успешно' };
    }

    @ApiOperation({ summary: "Удаляет из БД артикулы из базы по листу Удалить в Google таблице" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/table/delete')
    @HttpCode(200)
    async deleteFromTable() {
        const sourceSheetName = 'Удаление';
        const spreadsheetId = this.requestService.getSpreadsheetId();
        const author = this.requestService.getAuthor();
        
        if (!spreadsheetId) throw new HttpException('Отсутствует заголовок x_spreadsheet_id', HttpStatus.BAD_REQUEST);
        if (author != 'prostoexport@gmail.com') throw new HttpException('Недостаточно прав для удаления товаров из БД', HttpStatus.FORBIDDEN);
        
        const content = await this.gsheetService.getValues({ range: `'${sourceSheetName}'!A1:ZZ`, spreadsheetId });
        const headers = content[0].reduce((acc, header, index) => {
            acc[header] = index;
            return acc;
        }, {});

        const articles = content.slice(1).filter(f=>f[headers['Артикул']]).map(row => ({article: row[headers['Артикул']]}));
        if (!articles.length) throw new BigBaseNoArticlesException();

        const results = await this.bigBaseService.deleteProducts(articles, author);
        const resultsArr = content.slice(1).map((row, index) => {
            row[headers['Результат']] = results[index].result
            return row
        });

        await this.gsheetService.clearValues({ range: `'${sourceSheetName}'!A2:ZZ`, spreadsheetId });
        await this.gsheetService.setValues2({ range: `'${sourceSheetName}'!A2:ZZ`, values: resultsArr, spreadsheetId });

        return { message: 'Успешно' };
    }

    @ApiOperation({ summary: "Возвращает логи изменений таблицы BigBase" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно" })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/logs/list')
    @HttpCode(200)
    @UseInterceptors(BigbaseInterсeptor)
    async getLogs(
        @Body() getDto: GetLogsDto,
    ) {
        return this.bigBaseService.getLogs(getDto);
    }


    @ApiOperation({ summary: "Выполняет поиск артикулов с указанным ШК, отличных от переданного" })
    @ApiResponse({ status: HttpStatus.OK, description: "Успешно"})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Некорректный запрос" })
    @ApiBody({ type: [CheckBarcodeDto] })
    @ApiBasicAuth('x_gs_token')
    @UseGuards(GsUserGuard)
    @Post('/barcodes/check')
    @HttpCode(200)
    @UseInterceptors(BigbaseInterсeptor)
    async checkBarcodes(
        @Body() dto: CheckBarcodeDto[],
    ) {
        const dictObject = await this.bigBaseService.getDictObj();
        const barcodeTypes = ['ШК', 'Штрихкод Сима', 'Штрихкод поставщика', 'ШК поставщика NEW', 'ШК поставщика EAN13', 'ШК поставщика EAN13-2', 'ШК поставщика EAN13-3', 'ШК поставщика EAN13-4', 'ШК поставщика EAN13-5', 'ШК поставщика EAN13-6', 'ШК поставщика EAN13-7']
            .map(ruType => dictObject[ruType].name);
        
        let duplicates = [];

        (await Promise.all(
            barcodeTypes.map((type: string) =>  
                this.bigBaseService.getProducts({ 
                    columns: ['article', type],
                    filters: dto.map(item => ({[type]: item.barcode})),
                    // filters: [{ [type]: { [Op.in]: dto.map(item => item.barcode)}}]
                }))
            )
        ).forEach(value => {
            duplicates = duplicates.concat(value);
        });
        
        const duplicatesObject = duplicates.reduce((acc, duplicate) => {
            for (let key in duplicate.dataValues) {
                if (key != 'article') {
                    const barcode = duplicate.dataValues[key];
                    if (barcode) {
                        if (!acc[barcode]) acc[barcode] = [];
                        acc[barcode].push(duplicate.dataValues.article)
                    }
                }
            }
            return acc;
        }, {});
        
        if (!duplicates.length) return [];

        return dto
            .map(item => ({ 
                ...item, 
                duplicates: duplicatesObject[item.barcode]
            }))
            .filter(item => item.duplicates)
            .map(item => ({ 
                ...item, 
                duplicates: item.duplicates.filter((article: string) => article != item.article.toLowerCase())
            }))
            .filter(item => item.duplicates.length);
    }
}
