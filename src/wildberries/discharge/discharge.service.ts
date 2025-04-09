import { Injectable } from '@nestjs/common';
import { WbDischarge } from './models/discharge.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { GetWbDischargeDto, SetActiveDischargeDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { WbDischargeLogs } from './models/discharge-logs.model';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WbDischargeService {
    private wbDischargeUrl = `http://${process.env.WB_DISCHARGE_MICRO_SERVER_ADDRESS}:${process.env.WB_DISCHARGE_MICRO_SERVER_PORT}/wb/discharge`;
    private oldDischargeUrl = `http://${process.env.EXPRESS_SERVER_ADDRESS}:${process.env.EXPRESS_SERVER_PORT}/DischargeReport`;

    private headers = {
        'x_microservice_token': process.env.MICRO_SERVICE_TOKEN
    }

    constructor(
        @InjectModel(WbDischarge) private discharge: typeof WbDischarge,
        @InjectModel(WbDischargeLogs) private logs: typeof WbDischargeLogs,
        private readonly httpService: HttpService,
    ) {}

    async upsertManyBarcodeless(data: WbDischarge[]) {
        const keys = Object.keys(data[0])
            .map((key: keyof WbDischarge) => key)
            .filter((key) => key != 'nmID' && key != 'barcode');

        const startDate = new Date();

        try {
            const oldDataObject = (await this.discharge.findAll({ where: { nmID: { [Op.in]: data.map(card => card.nmID) } } }))
                .reduce((acc, card) => {
                    acc[card.nmID] = card;
                    return acc;
                }, {});

            const insertResult = await this.discharge.bulkCreate(data.map(card => ({ ...card, vendorCode: card.vendorCode.toLowerCase() })), {
                updateOnDuplicate: keys,
                returning: false,
            });

            for (let card of data) {
                await this.logDischargeTransaction({
                    startDate,
                    type: oldDataObject[card.nmID] ? 'create' : 'update',
                    oldObject: oldDataObject[card.nmID],
                    newObject: { ...card, vendorCode: card.vendorCode.toLowerCase() },
                });
            }

            return insertResult;
        } catch (err) {
            throw err;
        }
    }

    async updateBarcodes(data: { nmID: number, barcode: string }[]) {
        const startDate = new Date();

        try {
            const oldDataObject = (await this.discharge.findAll({ 
                where: { nmID: { [Op.in]: data.map(card => card.nmID) }},
                attributes: ['nmID', 'barcode']
            }))
                .reduce((acc, card) => { 
                    acc[card.nmID] = card; 
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
                    oldObject: oldDataObject[card.nmID],
                    newObject: card,
                });
            }

            return insertResult;
        } catch (err) {
            throw err;
        }
    }

    async setActive({ nmIDs, type }: SetActiveDischargeDto) {
        return await this.discharge.update({ active: false }, { where: { [Op.and]: [{ type }, { nmID: { [Op.notIn]: nmIDs } }] } });
    }

    async startWbDischarge(type: string) {
        return await this.httpService.axiosRef.get(this.wbDischargeUrl + `?type=${type}`, { headers: this.headers});
    }

    async getDataFromOldBase(page: number, type: string): Promise<
        { 
            ok: boolean, 
            page: number, 
            limit: number, 
            total: number, 
            updatedAt: string, 
            results: {
                article, 
                nm_id, 
                barcode, 
                name, 
                height, 
                length, 
                width, 
                cat, 
                brand, 
                imt_id,
            }[],
            error: string,
        }
    > {
        return (await this.httpService.axiosRef.post(
            this.oldDischargeUrl,
            {
                action: 'getDischargeReportJSON',
                page,
                limit: 10000,
                short: false,
                type,
            },
            { headers: this.headers}
        )).data.data;
    }

    async getWbDischarge(dto: GetWbDischargeDto) {
        let {columns, limit=null, offset=0, filters = [], type} = dto;

        if (!columns.length) columns = Object.keys(this.discharge.getAttributes());

        if (filters) {
            filters = filters.map(filter => filter.vendorCode ? ({ ...filter, vendorCode: filter.vendorCode.toLowerCase() }) : filter);
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
                order: ['nmID'],
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
            order: ['nmID'],
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
                        nmID: newObject.nmID,
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
