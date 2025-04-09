import { AxiosRequestConfig } from "axios";

export class BaseMagnitApiService {
    public headers: AxiosRequestConfig['headers']

    getHeaders(type: string) {
        return {
            'Content-Type': 'application/json',
            'x-api-key': process.env.MAGNIT_API_KEY_PK
        }
    }

    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}