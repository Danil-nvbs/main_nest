import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export abstract class BaseWildberriesApiService {
    constructor(
        protected readonly gsheetsService: GsheetsService,
        protected readonly httpService: HttpService,
    ) { }

    public headers: AxiosRequestConfig['headers'] = {
        'Content-Type': 'application/json'
    };

    private cookies: { [key: string]: string } = {};
    private Authorizev3: { [key: string]: string } = {};


    public getToken(type: string) {
        return String(type).toLowerCase() == 'pk' ? process.env.WB_PK_TOKEN : type == 'ip' ? process.env.WB_IP_TOKEN : '';
    }

    public async getHeaders(type: string) {
        await this.ensureCookies(type);
        return {
            Authorization: this.getToken(type),
            'Content-Type': 'application/json',
            'Cookie': this.cookies[type],
            'Authorizev3': this["Authorizev3"][type]
        };
    }

    private async ensureCookies(type: string) {
        if (!this.cookies[type]) {
            this.cookies[type] = (await this.getCookies(type)).cookies;
            this["Authorizev3"][type] = (await this.getCookies(type)).Authorizev3;
        }
    }

    public async getCookies(type: string) {
        let neededUser = type == 'PK' ? 'ООО ПК' : type == 'IP' ? 'ИП Елисеев' : '';
        let returnString = '';
        let data = await this.gsheetsService.getValues({ range: "'cookies'!A1:Z", spreadsheetId: process.env.COOKIES_SSID });
        let headers = data[0];
        let needRow;
        let token
        for (let row of data) {
            if (row[0] == neededUser) needRow = row;
        }
        for (let i = 1; i < needRow.length; i++) {
            if (headers[i] == 'Authorizev3') token = needRow[i]
            returnString += headers[i] + '=' + needRow[i] + ';';
        }
        return { cookies: returnString, "Authorizev3": token };
    }

    public async refreshCookies(type: string) {
        await axios.post(`http://${process.env.MAIN_SERVER_ADDRESS}:${process.env.MAIN_SERVER_PORT}/WBCookie`, {
            "action": "revokeCookies",
            type,
            "ssId": process.env.COOKIES_SSID
        })
        this.cookies[type] = (await this.getCookies(type)).cookies;
        this["Authorizev3"][type] = (await this.getCookies(type)).Authorizev3;

    }

    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
