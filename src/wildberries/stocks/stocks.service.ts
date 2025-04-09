import { Injectable, Logger } from "@nestjs/common";
import { ReportsApiService } from "../api/reports.service";
import { InjectModel } from "@nestjs/sequelize";
import { WbStocks } from "./stocks.model"
import { GetStocksDto } from "./dto/getStocks.dto";
import { Op } from "sequelize";

@Injectable()
export class StocksService {
    constructor(
        @InjectModel(WbStocks) private wbStocks: typeof WbStocks,
        private readonly reportsApiService: ReportsApiService,
    ) { }
    private readonly logger = new Logger(StocksService.name)
        
    async updateStocks(type: string) {
        const today = new Date().toISOString().slice(0, 10);

        const stocksArr = await this.reportsApiService.getFboStocks(type);
        this.logger.log("Получены данные об остатках из WB API");
        let stocksObj = {}
        for (let stock of stocksArr) {
            let index = stock.warehouseName + ' ' + stock.supplierArticle + ' ' + stock.isSupply + ' ' + stock.isRealization;
            if (!stocksObj[index]) {
                stocksObj[index] = {
                    ...stock,
                    type,
                    updateDate: today,
                }
            }
            else {
                stocksObj[index] = {
                    ...stocksObj[index],
                    quantity: stocksObj[index].quantity + stock.quantity,
                    inWayFromClient: stocksObj[index].inWayFromClient + stock.inWayFromClient,
                    inWayToClient: stocksObj[index].inWayToClient + stock.inWayToClient,
                    quantityFull: stocksObj[index].quantityFull + stock.quantityFull,
                };
            }
        }
        let filteredStocks = [];
        for (let index in stocksObj) {
            filteredStocks.push(stocksObj[index])
        }
        
        await this.wbStocks.bulkCreate(filteredStocks, {
            updateOnDuplicate: ['quantity', 'inWayFromClient', 'inWayToClient', 'quantityFull', 'lastChangeDate'],
            returning: false,
        })
        this.logger.log(`Данные об остатках записаны в БД: ${filteredStocks.length} записей`);
    }

    async getStocks({columns, limit, offset, filters}: GetStocksDto) {
        let transformToOpIn = true;
        let opInKey: string;
        let opInValues = [];

        if (filters) {
            opInKey = Object.keys(filters[0])[0];
            for (const filter of filters) {
                const keys = Object.keys(filter);
                if (keys.length !== 1 || keys[0] !== opInKey) {
                    transformToOpIn = false;
                    break;
                }
                opInValues.push(filter[opInKey]);
            }
        }

        const where = transformToOpIn
            ? {
                [opInKey]: { [Op.in]: opInValues }
            }
            : {
                [Op.or]: filters,
            };

        const res = await WbStocks.findAll({ 
            attributes: columns, 
            limit,
            offset,
            ...(filters && { where }),
        });

        this.logger.log(`Данные об остатках получены: ${res.length} записей`);
        return res;
    }
}