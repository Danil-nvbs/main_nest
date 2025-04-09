import { Logger } from "@nestjs/common"
import { BaseMagnitApiService } from "./baseMagnitApi.service"
import axios from "axios"
import {
    ShipmentApiDto,
    ProductListApiDto,
    ParcelCreateApiDto,
    CategoryListDto,
    ConfirmShipmentDto,
    ParcelListDto
} from "./dto"

export class MagnitApiService extends BaseMagnitApiService {
    private readonly logger = new Logger(MagnitApiService.name)
    constructor() {
        super()
    }

    async getShipmentList({ status = 'NEW', type, dateTo, dateFrom }:
        {
            status: "NEW" | "IN_ASSEMBLY" | "ASSEMBLED" | "CANCELED",
            type: string,
            dateFrom?: string,
            dateTo?: string
        }
    ) {
        let failedAttempts = 0
        let shipments = []
        interface IBody {
            "page_size": number,
            "page_token"?: string,
            "dir": string,
            "created_at": {
                from: string,
                to?: string,
            },
            status: string
        }
        let body: IBody = {
            "page_size": 1000,
            "dir": "ASC",
            "created_at": {
                from: dateFrom,
                ...(dateTo ? { to: dateTo } : {}),

            },
            status
        }
        while (true) {
            try {
                let url = `https://b2b-api-gateway.uat.ya.magnit.ru/api/seller/v1/orders/list`
                let response = await axios.post(url, body, { headers: await this.getHeaders(type) })
                let data: ShipmentApiDto = response.data
                shipments = shipments.concat(response.data.orders)
                if (!data.next_page_token) {
                    return shipments
                }
                body.page_token = data.next_page_token
            } catch (err) {
                this.logger.error(`MagnitAPI getShipmentList: Error: ${err.message}`)
                console.log(err.response.data)
                failedAttempts++
                if (failedAttempts >= 10) {
                    throw err.response
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...')
                    await this.sleep(1000 * 60)
                }
                await this.sleep(1000 * failedAttempts ** 2)
            }
        }
    }

    async getProductList({ type }: { type: string }) {
        let failedAttempts = 0
        let list = []
        interface IBody {
            "filter": {
                "shop_id": number,
                "category_id"?: number
            },
            "pagination": {
                "dir": string,
                "page": number,
                "page_size": number
            }
        }
        let shopIdKey = `MAGNIT_SHOP_ID_${type}`;
        let body: IBody = {
            "filter": {
                "shop_id": Number(process.env[shopIdKey]),
            },
            "pagination": {
                "dir": "DESC",
                "page": 0,
                "page_size": 1000
            }
        }
        while (true) {
            try {
                let url = `https://b2b-api.magnit.ru/api/seller/v1/products/sku/list`
                let response = await axios.post(url, body, { headers: await this.getHeaders(type) })
                let data: ProductListApiDto = response.data
                if (!data.result.length) {
                    return list
                }
                list = list.concat(data.result)
                body.pagination.page++
            } catch (err) {
                this.logger.error(`MagnitAPI getProductList: Error: ${err.message}`)
                console.log(err.response.data)
                failedAttempts++
                if (failedAttempts >= 10) {
                    throw err.response
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...')
                    await this.sleep(1000 * 60)
                }
                await this.sleep(1000 * failedAttempts ** 2)
            }
        }
    }

    async createParcels({ orderId, items, type }:
        {
            orderId: string,
            items: {
                "sku_id": number,
                "quantity": number,
                "identifiers"?: [
                    {
                        "cis"?: "string",
                        "uin"?: "string",
                        "rnpt"?: "string",
                        "gtd"?: "string"
                    }
                ]
            }[],
            type: string
        }
    ) {
        let failedAttempts = 0
        let body = {
            order_id: orderId,
            items
        }
        while (true) {
            try {
                let url = `https://b2b-api-gateway.uat.ya.magnit.ru/api/seller/v1/parcels/create`
                let response = await axios.post(url, body, { headers: await this.getHeaders(type) })
                let data: ParcelCreateApiDto = response.data
                console.log(data)

                return data
            } catch (err) {
                this.logger.error(`MagnitAPI createParcels: Error: ${err.message}`)
                console.log(err.response.data)
                failedAttempts++
                if (failedAttempts >= 10) {
                    throw err.response
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...')
                    await this.sleep(1000 * 60)
                }
                await this.sleep(1000 * failedAttempts ** 2)
            }
        }
    }

    async getCategories({ type }: { type: string }) {
        let failedAttempts = 0

        while (true) {
            try {
                let url = `https://b2b-api.magnit.ru/api/seller/v1/categories`
                let response = await axios.get(url, { headers: await this.getHeaders(type) })
                let data: CategoryListDto[] = response.data
                return data
            } catch (err) {
                this.logger.error(`MagnitAPI getCategories: Error: ${err.message}`)
                console.log(err.response)
                failedAttempts++
                if (failedAttempts >= 10) {
                    throw err.response
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...')
                    await this.sleep(1000 * 60)
                }
                await this.sleep(1000 * failedAttempts ** 2)
            }
        }
    }

    async confirmShipment({ deliveryDate, type }: { deliveryDate: string, type: string }) {
        let failedAttempts = 0
        let body = {
            delivery_date: deliveryDate
        }
        while (true) {
            try {
                let url = `https://b2b-api-gateway.uat.ya.magnit.ru/api/seller/v1/shipments/confirm`
                console.log(body)
                let response = await axios.post(url, body, { headers: await this.getHeaders(type) })
                let data: ConfirmShipmentDto = response.data
                return data
            } catch (err) {
                this.logger.error(`MagnitAPI confirmShipment: Error: ${err.message}`)
                console.log(err.response.data)
                failedAttempts++
                if (failedAttempts >= 10) {
                    throw err.response
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...')
                    await this.sleep(1000 * 60)
                }
                await this.sleep(1000 * failedAttempts ** 2)
            }
        }
    }

    async completeShipments({ orderId, type }: { orderId: string, type: string }) {
        let failedAttempts = 0
        let body = {
            order_id: orderId
        }
        while (true) {
            try {
                let url = `https://b2b-api-gateway.uat.ya.magnit.ru/api/seller/v1/orders/complete`
                let response = await axios.post(url, body, { headers: await this.getHeaders(type) })
                let data: ConfirmShipmentDto = response.data
                return data
            } catch (err) {
                this.logger.error(`MagnitAPI completeShipments: Error: ${err.message}`)
                console.log(err.response.data)
                failedAttempts++
                if (failedAttempts >= 10) {
                    throw err.response
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...')
                    await this.sleep(1000 * 60)
                }
                await this.sleep(1000 * failedAttempts ** 2)
            }
        }
    }

    async getParcelsList({ parcelIds, type }: { parcelIds: string[], type: string }) {
        let failedAttempts = 0;
        let allParcels = [];
        let nextPageToken = null

        while (true) {
            let body = {
                "page_size": 1000,
                "page_token": nextPageToken,
                "dir": "ASC",
                "created_at": {
                    "to": new Date().toISOString()
                },
                "cutoff_time": {
                    "from": "2023-09-01T00:00:00Z"
                }
            };

            if (parcelIds && parcelIds.length > 0) {
                body['parcel_id'] = parcelIds;
            }

            try {
                let url = `https://b2b-api-gateway.uat.ya.magnit.ru/api/seller/v1/parcels/list`;
                let response = await axios.post(url, body, { headers: await this.getHeaders(type) });
                let data: ParcelListDto = response.data;

                allParcels = allParcels.concat(data.parcels);

                if (!data.next_page_token) {
                    break
                }

                nextPageToken = data.next_page_token;
            } catch (err) {
                this.logger.error(`MagnitAPI getParcelsList: Error: ${err.message}`);
                console.log(err.response?.data);
                failedAttempts++;

                if (failedAttempts >= 10) {
                    throw err.response;
                }

                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...');
                    await this.sleep(1000 * 60);
                }

                await this.sleep(1000 * failedAttempts ** 2);
            }
        }

        return allParcels
    }

    async addParcels({ parcelIds, type }: { parcelIds: string[], type: string }) {
        let failedAttempts = 0
        let body = {
            parcel_id: parcelIds
        }
        while (true) {
            try {
                console.log(body)
                let url = `https://b2b-api-gateway.uat.ya.magnit.ru/api/seller/v1/shipments/add-parcels`
                let response = await axios.post(url, body, { headers: await this.getHeaders(type) })
                let data: ConfirmShipmentDto = response.data
                return data
            } catch (err) {
                this.logger.error(`MagnitAPI addParcels: Error: ${err.message}`)
                console.log(err.response.data)
                failedAttempts++
                if (failedAttempts >= 10) {
                    throw err.response
                }
                if (err.code === 'EPIPE') {
                    this.logger.error('Broken pipe error. Retrying...')
                    await this.sleep(1000 * 60)
                }
                await this.sleep(1000 * failedAttempts ** 2)
            }
        }
    }


    // async getPDF({ shipment_id = "28", type, document_type = "act_of_acceptance" }: 
    // { shipment_id?: string, type: string, document_type?: "act_of_acceptance" | "act_of_mismatch" | "delivery_note" }) {
    //     this.setHeaders(type)
    //     let failedAttempts = 0
    //     let orders = []
    //     this.headers.Accept = 'application/json'
    //     interface IBody {
    //         "shipment_id": string,
    //         "document_type": string,
    //     }
    //     let body: IBody = {
    //         shipment_id,
    //         document_type
    //     }
    //     while (true) {
    //         try {
    //             let url = `https://b2b-api-gateway.uat.ya.magnit.ru/api/seller/v1/shipments/get-documents`
    //             let response = await axios.post(url, body, { headers: await this.getHeaders(type) })
    //             let data = response.data
    //             return data

    //         } catch (err) {
    //             this.logger.error(`MagnitAPI getPDF: Error: ${err.message}`)

    //             failedAttempts++
    //             if (failedAttempts >= 10) {
    //                 throw err.response
    //             }
    //             if (err.code === 'EPIPE') {
    //                 this.logger.error('Broken pipe error. Retrying...')
    //                 await this.sleep(1000 * 60)
    //             }
    //             await this.sleep(1000 * failedAttempts ** 2)
    //         }
    //     }
    // }
}