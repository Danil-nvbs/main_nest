import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OzonDischargeService } from 'src/ozon/discharge/discharge.service';
import { WbDischargeService } from 'src/wildberries/discharge/discharge.service';

@Injectable()
export class DischargeService {
    constructor(
        private wbDischargeService: WbDischargeService,
        private ozonDischargeService: OzonDischargeService,

    ) {}

    async getDischarge({market, columns=[], filters=[]}) {
        let method = `getDischarge${market}`
        if (!this[method]) throw new HttpException(`Неизвестный признак маркетплейса: ${market}`, HttpStatus.BAD_REQUEST);
        return this[method]({filters, columns})
    }

    async getDischargeWbPk({filters, columns}) {
        return this.getDischargeWb({ filters, columns, type: 'PK' })
    }

    async getDischargeWbIp({ filters, columns }) {
        return this.getDischargeWb({ filters, columns, type: 'IP' })
    }

    async getDischargeWb({ filters, columns, type}) {
        let finArr = []
        let limit = 1000
        let offset = 0
        while (true) {
            let chunk = await this.wbDischargeService.getWbDischarge({ limit, offset, filters, columns, type })
            finArr = finArr.concat(chunk)
            if (chunk.length < limit) break
            offset += limit
        }
        return finArr
    }

    async getDischargeOzonPk({ filters, columns }) {
        return this.getDischargeOzon({ filters, columns, type: 'PK' })
    }

    async getDischargeOzonFeyt({ filters, columns }) {
        return this.getDischargeOzon({ filters, columns, type: 'FEYT' })
    }

    async getDischargeOzon({ filters, columns, type }) {
        return this.ozonDischargeService.getDischarge({ filters, columns, type })
    }

    async getDischargeYm({ filters, columns }) {
    }
    async getDischargeMagnit({ filters, columns }) {}
    async getDischargeZYa({ filters, columns }) {}
    async getDischargeSber({ filters, columns }) {}
    async getDischargeVI({ filters, columns }) {}
    async getDischargeDM({ filters, columns }) {}

}
