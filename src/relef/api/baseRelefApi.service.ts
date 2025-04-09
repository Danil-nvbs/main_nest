import { AxiosRequestConfig } from 'axios';

export class BaseRelefApiService {
    public headers: AxiosRequestConfig['headers'];

    setHeaders() {
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': process.env.RELEF_API_KEY,
        };
    }

    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
 