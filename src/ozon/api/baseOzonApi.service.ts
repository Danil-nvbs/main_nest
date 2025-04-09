import { AxiosRequestConfig } from 'axios';

export class BaseOzonApiService {
    public headers: AxiosRequestConfig['headers'];

    setHeaders(type: string) {
        this.headers = {
            'Content-Type': 'application/json',
            'Client-Id': process.env[`OZON_CLIENT_ID_${type.toUpperCase()}`],
            'Api-Key': process.env[`OZON_API_KEY_${type.toUpperCase()}`],
        };
    }

    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
 