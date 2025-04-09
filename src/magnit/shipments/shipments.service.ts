import { Logger } from "@nestjs/common";
import { MagnitApiService } from "../api/api.service";

export class ShipmentsService {
    private readonly logger = new Logger(ShipmentsService.name)
    constructor( 
        private readonly apiService: MagnitApiService,
    ) { }

}