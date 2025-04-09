import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { map, Observable, tap } from "rxjs";
import { BigBaseDict } from "./models/product.model";
import { InjectModel } from "@nestjs/sequelize";
import { GetProductDto } from "./dto/get-product.dto";
import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class BigbaseInterсeptor implements NestInterceptor {
    constructor(@InjectModel(BigBaseDict) private bigBaseDict: typeof BigBaseDict) {}
    private readonly logger = new Logger(BigbaseInterсeptor.name)

    async intercept(
        context: ExecutionContext, 
        next: CallHandler<any>
    ): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest()
        const endpoint = request.path.split('bigbase')[1]
        let dict = await this.bigBaseDict.findAll()
        let rus2eng = dict.reduce((acc, elem) => {
            acc[elem.rusname] = { name: elem.engname, type: elem.type }
            return acc
        }, {})

        let eng2rus = dict.reduce((acc, elem) => {
            acc[elem.engname] = { name: elem.rusname, type: elem.type }
            return acc
        }, {})

        this.logger.log(endpoint)
        switch (endpoint) {
            case '/list': {
                let body: GetProductDto = request.body
                if (body.columns && body.columns.length !== 0) {
                    body.columns = body.columns.map(column => {
                        if (!rus2eng[column] && !eng2rus[column]) throw new HttpException(`Не найден столбец ответа ${column} в базе`, HttpStatus.BAD_REQUEST) 
                        if (eng2rus[column]) return column 
                        return rus2eng[column].name
                    })
                    if (!body.columns.includes('article')) body.columns.push('article')
                }

                if (body.filters && body.filters.length !== 0) {
                    body.filters.forEach(filter => {
                        for (let column in filter) {
                            if (column == 'article') filter[column] = String(filter[column]).toLowerCase()
                            if (!rus2eng[column] && !eng2rus[column]) throw new HttpException(`Не найден столбец фильтра ${filter.column}в базе`, HttpStatus.BAD_REQUEST) 
                            if (rus2eng[column]) {
                                filter[rus2eng[column].name] = filter[column];
                                delete filter[column];
                            }
                        }
                    });
                }
                break
            }
            case '/create':
            case '/update': {
                request.body = request.body.map((product: CreateProductDto) => {
                    product.article = String(product.article).toLowerCase()
                    for (let field in product){
                        // this.logger.log(rus2eng[field].name)
                        if (!rus2eng[field] && !eng2rus[field]) throw new HttpException(`Не найден столбец ${field} в базе`, HttpStatus.BAD_REQUEST)
                        if (rus2eng[field]) {
                            product[rus2eng[field].name] = product[field]
                            delete product[field]
                        }
                    }
                    return product
                })
                break
            }
            case '/table/create':
            case '/table/update':
            case '/table/list':
            case '/logs/list':
            case '/barcodes/check':
                break
            default: {
                this.logger.log('here')
                throw new HttpException(`Не найден метод ${endpoint}`, HttpStatus.NOT_FOUND)
            }
        }

        let now = Date.now()


        return next.handle().pipe(
            map(async body => {
                switch (endpoint) {
                    case '/list': {
                        for (let product of body) {
                            for (let field in product.dataValues) {
                                product.dataValues[eng2rus[field].name] = product.dataValues[field]
                                delete product.dataValues[field]
                            }
                        }
                        break
                    }
                    case '/table/create':
                    case '/table/update':
                    case '/table/list':
                    case '/logs/list':
                    case '/barcodes/check':
                    case '/create':
                    case '/update': {
                        return body
                    }
                    default: {
                        console.log('err')
                    }
                }
                return body
            }),
            tap(() => this.logger.log(`Request to ${endpoint} finished in ${Date.now() - now} ms`)),
        )
    }
}