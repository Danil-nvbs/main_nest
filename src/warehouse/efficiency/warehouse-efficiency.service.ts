import { Injectable } from '@nestjs/common';
import { WarehouseEfficiency } from './models/warehouse-efficiency.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateWarehouseEfficiencyDto, GetWarehouseEfficiencyDto, UpdateWarehouseEfficiencyDto } from './dto';
import { Op } from 'sequelize';


@Injectable()
export class WarehouseEfficiencyService {
    constructor(
        @InjectModel(WarehouseEfficiency) private warehouseEfficiencyRepository: typeof WarehouseEfficiency,
    ) {}

    async createMany(records: CreateWarehouseEfficiencyDto[]) {
        return await this.warehouseEfficiencyRepository.bulkCreate(records, { ignoreDuplicates: true });
    }

    async create(record: CreateWarehouseEfficiencyDto) {
        return await this.warehouseEfficiencyRepository.create(record);
    }

    async get(dto: GetWarehouseEfficiencyDto) {        
        let {columns=null, limit=null, offset=0, filters = [], from='1970-01-01', to='2099-01-01'} = dto;

        const where = filters.length ? { [Op.or]: filters } : {};

        where['date'] = {
            [Op.gte]: (new Date(from)).toISOString(),
            [Op.lte]: (new Date(to)).toISOString(),
        }
    
        return await this.warehouseEfficiencyRepository.findAll({
            attributes: columns || Object.keys(this.warehouseEfficiencyRepository.getAttributes()),
            limit,
            offset,
            order: ['date', 'time'],
            where,
        })
    }

    async update(record: UpdateWarehouseEfficiencyDto) {
        return await this.warehouseEfficiencyRepository.update(record, { where: { id: record.id }});
    }

    async delete(ids: string[]) {
        return await this.warehouseEfficiencyRepository.destroy({ where: { id: { [Op.in]: ids} }});
    }
}