import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
    ) {}

    async validateGsToken(gsUserToken: string) {
        return await this.usersService.getUserByGsToken(gsUserToken) !== null;
    }
}
