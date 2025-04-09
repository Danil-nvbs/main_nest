import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RegularTasksService {
    private taskManagerUrl = `http://${process.env.EXPRESS_SERVER_ADDRESS}:${process.env.EXPRESS_SERVER_PORT}/RegularTasks`;
    
    async registerTask (codename: string, result: { success: boolean; message: string; }) {
        return (await axios.post(this.taskManagerUrl, {
          action: "execReg",
          codename,
          result,
        })).data;
    }
}