import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { RequestService } from "src/request/request.service";

@Injectable()
export class GsUserGuard implements CanActivate {
    constructor(private requestService: RequestService) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        if (!this.requestService.getAuthor())  throw new UnauthorizedException('Пользователь не авторизован');
        return true;
    }
}