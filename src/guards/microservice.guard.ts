import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { RequestService } from "src/request/request.service";

@Injectable()
export class MicroServiceGuard implements CanActivate {
    constructor(private requestService: RequestService) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        if (this.requestService.getServiceToken() !== process.env.MICRO_SERVICE_TOKEN) throw new UnauthorizedException('Микросервис не авторизован');
        return true;
    }
}