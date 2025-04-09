import { Injectable } from '@nestjs/common';
import { MagnitCategories } from './models/categories.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { CategoryListDto } from '../api/dto/сategoryList.dto';

@Injectable()
export class MagnitCategoriesService {
    constructor(
        @InjectModel(MagnitCategories) private categories: typeof MagnitCategories,
    ) { }

    async upsertManyCategories(data: CategoryListDto[]) {
        await this.categories.sync({ force: false }) 
        const keys = Object.keys(data[0])
            .map((key: keyof MagnitCategories) => key)
            .filter((key) => key != 'category_id');

        try {
            const insertResult = await this.categories.bulkCreate(data.map(card => ({ ...card, category_id: card.category_id })), {
                updateOnDuplicate: keys,
                returning: false,
            });
            return insertResult;
        } catch (err) {
            throw err;
        }
    }

    async getCategoriesList() {
        await this.categories.sync({ force: false })
        let a = await this.categories.findAll()
        return a.reduce((acc, cat) => {
            acc[cat.dataValues.category_id] = {
                fullCategorie: cat.dataValues.category_string_path,
                title: cat.dataValues.category_title,
                firstCategorie:cat.dataValues.category_string_path.split('->')[0] || null,
                secondCategorie: cat.dataValues.category_string_path.split('->')[1] || null,
                thirdCategorie: cat.dataValues.category_string_path.split('->')[2] || null,
            }
            return acc
        }, {})
    }

}
