import { AxiosRequestConfig } from 'axios';

export class BaseKomusApiService {
    public headers: AxiosRequestConfig['headers'];

    setHeaders({ marketplace }: { marketplace: string }) {
        this.headers = {
            'Content-Type': 'application/json',
            'token': marketplace == 'WB'
                ? process.env.KOMUS_WB_API_KEY
                : marketplace == 'OZON'
                    ? process.env.KOMUS_OZON_API_KEY
                    : null
        };
    }

    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
