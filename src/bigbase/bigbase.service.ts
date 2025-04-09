import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BigBaseDict, BigBaseLogs, Product } from './models/product.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProductDto, UpdateProductDto, GetProductDto, GetLogsDto, DeleteProductDto } from './dto';
import { Op } from 'sequelize';

@Injectable()
export class BigbaseService {
    constructor(
        @InjectModel(Product) private bigBase: typeof Product,
        @InjectModel(BigBaseDict) private bigBaseDict: typeof BigBaseDict,
        @InjectModel(BigBaseLogs) private bigBaseLogs: typeof BigBaseLogs,
    ) { }
    private readonly logger = new Logger(BigbaseService.name)

    async logBigBaseTransaction({ author, type, oldObject = null, newObject = null }: { author: string, type: string, oldObject?: any, newObject?: any }) {
        if (!oldObject && !newObject) throw new Error(`Не передан ни новый ни старый объект в logBigBaseTransaction`)
        const transaction_id = uuidv4();
        let artibutes = ['create', 'update'].includes(type) ? Object.keys(newObject) : Object.keys(oldObject)
        for (let column of artibutes) {
            if (['id', 'article'].includes(column)) continue
            if (oldObject && newObject && oldObject[column] === newObject[column]) continue
            this.bigBaseLogs.create({
                article: oldObject.article || newObject.article,
                author,
                type,
                transaction_id,
                column,
                prev_value: oldObject ? oldObject[column] : null,
                next_value: newObject ? newObject[column] : null,
            });
        }
    }

    async deleteProducts(products: DeleteProductDto[], author: string) {
        let result = []
        for (let index = 0; index < products.length; index += 100) {
            result = result.concat(await Promise.all(products.slice(index, index + 100).map(product => this.deleteProduct(product, author))));
        }
        return result
    }

    async deleteProduct(product: DeleteProductDto, author: string) {
        const article = String(product.article).toLowerCase();
        try {
            const productInDb = await this.bigBase.findOne({ where: { article } });
            await this.logBigBaseTransaction({
                author,
                type: 'delete',
                oldObject: JSON.parse(JSON.stringify(productInDb)),
            });
            await productInDb.destroy();
            return {
                article,
                result: 'ok',
                error: null
            };
        } catch (err) {
            return {
                article,
                result: 'error',
                error: err.message
            }
        }
    }

    async createProducts(products: CreateProductDto[], author: string) {
        let result = [];

        for (let index = 0; index < products.length; index += 100) {
            result = result.concat(await Promise.all(products.slice(index, index + 100).map(product => this.createProduct(product, author))));
        }

        return result;
    }

    async createProduct(product: CreateProductDto, author: string) {
        try {
            product.article = String(product.article).toLowerCase();
            const result = await this.bigBase.create(product);

            await this.logBigBaseTransaction({
                author,
                type: 'create',
                newObject: product,
            });

            return {
                article: product.article,
                result: 'ok',
                error: null
            };
        } catch (err) {
            return {
                article: product.article,
                result: 'error',
                error: err.message
            }
        };
    }

    async getProducts(dto: GetProductDto) {
        let { columns, limit = null, offset = 0, filters = [] } = dto;

        if (!columns.length) columns = Object.keys(this.bigBase.getAttributes()).filter(f => f != 'id');

        if (filters) {
            filters = filters.map(filter => filter.vendorCode ? ({ ...filter, vendorCode: filter.vendorCode.toLowerCase() }) : filter);
        }

        if (
            filters.length &&
            !filters.some(filter => Object.keys(filter).length > 1) &&
            !filters.some(filter => Object.keys(filter).join('') != Object.keys(filters[0]).join(''))
        ) {
            const column = Object.keys(filters[0])[0];
            return await this.bigBase.findAll({
                attributes: columns,
                limit,
                offset,
                order: [['article', 'ASC']],
                where: {
                    [column]: {
                        [Op.in]: filters.map(filter => filter[column])
                    }

                }
            });
        }

        return await this.bigBase.findAll({
            attributes: columns,
            limit,
            offset,
            order: [['article', 'ASC']],
            where: filters.length ? { [Op.or]: filters } : null,
        });
    }


    async updateProducts(productsDto: UpdateProductDto[], author: string) {
        let result = [];

        for (let index = 0; index < productsDto.length; index += 100) {
            result = result.concat(await Promise.all(productsDto.slice(index, index + 100).map(product => this.updateProduct(product, author))));
        }

        return result;
    }

    async updateProduct(productChanges: UpdateProductDto, author: string) {
        try {
            const product = await this.bigBase.findOne({ where: { article: productChanges.article.toLowerCase() } });

            if (!product) throw new Error(`BigbaseService: не найден продукт с article: ${productChanges.article.toLowerCase()}`);

            await this.logBigBaseTransaction({
                author,
                type: 'update',
                newObject: productChanges,
                oldObject: JSON.parse(JSON.stringify(product))
            });

            await product.update(productChanges);
            await product.save();



            return {
                article: product.article,
                result: 'ok',
                error: null
            };
        } catch (err) {
            return {
                article: productChanges.article,
                result: 'error',
                error: err.message
            }
        };
    }

    async getLogs(dto: GetLogsDto) {
        let { columns = null, limit = null, offset = 0, filters = [], from = '1970-01-01', to = '2099-01-01' } = dto;

        const where = filters.length ? { [Op.or]: filters } : {};

        where['createdAt'] = {
            [Op.gt]: from,
            [Op.lt]: to,
        }

        let products = await this.bigBaseLogs.findAll({
            attributes: columns || Object.keys(this.bigBaseLogs.getAttributes()),
            limit,
            offset,
            order: [['article', 'ASC']],
            where,
        })

        return products;
    }

    async getDictObj() {
        let dictObj = (await this.bigBaseDict.findAll()).reduce((acc, elem) => {
            acc[elem.rusname] = { name: elem.engname, type: elem.type };
            return acc;
        }, {});

        return dictObj;
    }

    async splitBarcodes(supplierCode: string = '') {
        let result = {};
        const dictObj = await this.getDictObj();

        let barcodes = String(supplierCode).split(', ').filter((f: string) => f.match(/^\d{13}$/) && f.slice(0, 1) != '0');
        let barcodesCols = [
            'ШК поставщика EAN13',
            'ШК поставщика EAN13-2',
            'ШК поставщика EAN13-3',
            'ШК поставщика EAN13-4',
            'ШК поставщика EAN13-5',
            'ШК поставщика EAN13-6',
            'ШК поставщика EAN13-7',
        ];

        barcodesCols.forEach((barcodeName, index) => result[dictObj[barcodeName].name] = barcodes[index] || null);

        return result;
    }

    async getProducDtoFromGTableRow(row: Array<string>, headers: string[], dictionary: { [key: string]: { name: string, type: string } }) {
        const result: CreateProductDto = { article: null };
        dictionary = dictionary || await this.getDictObj();

        for (let index = 0; index < headers.length; index++) {
            if (!row[index]) {
                result[dictionary[headers[index]].name] = null;
                continue;
            };

            let value: string | number = row[index];
            const column = headers[index];

            result[dictionary[column].name] =
                dictionary[column].type === 'real'
                    ? String(value).match(/%/)
                        ? +String(value).replace(/[%\s]/gi, '').replace(/,/gi, '.') / 100
                        : +String(value).replace(/\s/gi, '').replace(/,/gi, '.')
                    : dictionary[column].type === 'lower'
                        ? value = String(value).toLowerCase()
                        : value;
        };

        return result;
    }

    convertToGsFormat(value: string | number | null, type: string) {
        if (!value) return null;
        switch (type) {
            case 'real':
                return Number(value);
            default:
                return String(value);
        }
    }

    async getStm() {
        let stm = (
            await this.bigBase.findAll({
                where: { [Op.or]: [{ isStm: 'Да' }, { isStm: 'да' }, { isStm: 'ДА' }] },
                attributes: ['article', 'brand', 'name'],
            })
        )
            .reduce((acc, elem) => {
                if (!elem?.dataValues?.article) return acc;
                acc[elem?.dataValues?.article] = {
                    brand: elem.dataValues.brand,
                    name: elem.dataValues.name,
                };
                return acc;
            }, {});
        return stm
    }
}