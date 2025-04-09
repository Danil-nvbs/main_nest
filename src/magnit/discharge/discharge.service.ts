import { Injectable } from '@nestjs/common';
import { MagnitDischarge } from './models/discharge.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { GetMagnitDischargeDto, SetActiveDischargeDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { MagnitDischargeLogs } from './models/discharge-logs.model';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class MagnitDischargeService {
    private magnitDischargeUrl = `http://${process.env.WB_DISCHARGE_MICRO_SERVER_ADDRESS}:${process.env.WB_DISCHARGE_MICRO_SERVER_PORT}/wb/discharge`;
    private oldDischargeUrl = `http://${process.env.EXPRESS_SERVER_ADDRESS}:${process.env.EXPRESS_SERVER_PORT}/DischargeMagnit`;

    private headers = {
        'x_microservice_token': process.env.MICRO_SERVICE_TOKEN
    }

    constructor(
        @InjectModel(MagnitDischarge) private discharge: typeof MagnitDischarge,
        @InjectModel(MagnitDischargeLogs) private logs: typeof MagnitDischargeLogs,
        private readonly httpService: HttpService,
    ) { }

    async upsertManyBarcodeless(data: MagnitDischarge[]) {
        await this.discharge.sync({ force: false })
        const keys = Object.keys(data[0])
            .map((key: keyof MagnitDischarge) => key)
            .filter((key) => key != 'sku_id' && key != 'barcode');

        const startDate = new Date();

        try {
            const oldDataObject = (await this.discharge.findAll({ where: { sku_id: { [Op.in]: data.map(card => card.sku_id) } } }))
                .reduce((acc, card) => {
                    acc[card.sku_id] = card;
                    return acc;
                }, {});

            const insertResult = await this.discharge.bulkCreate(data.map(card => ({ ...card, article: card.article.toLowerCase() })), {
                updateOnDuplicate: keys,
                returning: false,
            });

            for (let card of data) {
                await this.logDischargeTransaction({
                    startDate,
                    type: oldDataObject[card.sku_id] ? 'create' : 'update',
                    oldObject: oldDataObject[card.sku_id],
                    newObject: { ...card, article: card.article.toLowerCase() },
                });
            }

            return insertResult;
        } catch (err) {
            throw err;
        }
    }

    async updateBarcodes(data: { sku_id: number, barcode: string }[]) {
        await this.discharge.sync({ force: false })
        const startDate = new Date();

        try {
            const oldDataObject = (await this.discharge.findAll({
                where: { sku_id: { [Op.in]: data.map(card => card.sku_id) } },
                attributes: ['sku_id', 'barcode']
            }))
                .reduce((acc, card) => {
                    acc[card.sku_id] = card;
                    return acc;
                }, {});

            const insertResult = await this.discharge.bulkCreate(data, {
                updateOnDuplicate: ['barcode'],
                returning: false,
            });

            for (let card of data) {
                await this.logDischargeTransaction({
                    startDate,
                    type: 'update',
                    oldObject: oldDataObject[card.sku_id],
                    newObject: card,
                });
            }

            return insertResult;
        } catch (err) {
            throw err;
        }
    } 

    async setActive({ sku_ids, type }: SetActiveDischargeDto) {
        await this.discharge.sync({ force: false })
        return await this.discharge.update({ active: false }, { where: { [Op.and]: [{ type }, { sku_id: { [Op.notIn]: sku_ids } }] } })
    }

    async startDischarge(type: string) {
        await this.discharge.sync({ force: false })
        return await this.httpService.axiosRef.get(this.magnitDischargeUrl + `?type=${type}`, { headers: this.headers });
    }

    async getDataFromOldBase(page: number, type: string): Promise<
        {
            ok: boolean,
            page: number,
            limit: number,
            total: number,
            updatedAt: string,
            results: {
                'article': string,
                'id_magnit': number,
                'sku': string,
                'barcode': string,
                'brand': string,
                'sku_id': number,
                'name': string,
                'height': number,
                'width': number,
                'length': number
            }[],
            error: string,
        }
    > {
        return (await this.httpService.axiosRef.post(
            this.oldDischargeUrl,
            {
                action: 'getJSON',
                page,
                limit: 10000,
                short: false,
                type,
            },
            { headers: this.headers }
        )).data.data;
    }

    async getDischarge(dto: GetMagnitDischargeDto) {
        await this.discharge.sync({ force: false })
        let { columns, limit = null, offset = 0, filters = [], type } = dto;

        if (!columns.length) columns = Object.keys(this.discharge.getAttributes());

        if (filters) {
            filters = filters.map(filter => filter.article ? ({ ...filter, article: filter.article.toLowerCase() }) : filter);
        }

        if (
            filters.length &&
            !filters.some(filter => Object.keys(filter).length > 1) &&
            !filters.some(filter => Object.keys(filter).join('') != Object.keys(filters[0]).join(''))
        ) {
            const column = Object.keys(filters[0])[0];
            return await this.discharge.findAll({
                attributes: columns,
                limit,
                offset,
                order: ['sku_id'],
                where: {
                    [Op.and]: [
                        { type },
                        {
                            [column]: {
                                [Op.in]: filters.map(filter => filter[column])
                            }
                        },
                    ]
                }
            })
        }

        return await this.discharge.findAll({
            attributes: columns,
            limit,
            offset,
            order: ['sku_id'],
            where: {
                [Op.and]: [
                    { type },
                    filters.length ? { [Op.or]: filters } : null,
                ]
            }
        })
    }

    async logDischargeTransaction({ startDate, type, oldObject = null, newObject }) {
        const transaction_id = uuidv4();
        const transaction = [];

        for (const column in newObject) {
            if (!oldObject || (oldObject && JSON.stringify(newObject[column]) !== JSON.stringify(oldObject[column]))) {
                transaction.push(
                    this.logs.create({
                        sku_id: newObject.sku_id,
                        startDate,
                        type,
                        transaction_id,
                        column,
                        prev_value: oldObject ? JSON.stringify(oldObject[column]) : null,
                        next_value: JSON.stringify(newObject[column]),
                    })
                );
            }
        }

        return await Promise.all(transaction);
    }
}
