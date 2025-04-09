import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { GsUserToken } from './model/gs-users-tokens.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
    constructor(@InjectModel(GsUserToken) private gsUserRepository: typeof GsUserToken) {}

    async createUserGs(email: string) {
        return await this.gsUserRepository.create({ email, hash: this.createGsUserToken(email)});
    }

    async getUsersGs(filters: {[key: string]: string}[]) {
        return await this.gsUserRepository.findAll({where: filters.length ? { [Op.or]: filters } : null});
    }

    createGsUserToken(email: string) {
        return crypto.createHmac('sha512', process.env.EMAIL_HASH_SALT).update(email).digest('hex');
    }

    getUserByGsToken(token: string) {
        return this.gsUserRepository.findOne({ where: { hash: token }});
    }
}
