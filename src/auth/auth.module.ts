import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GsUserGuard } from './gs-email.guard';
import { UsersModule } from 'src/users/users.module';
import { RequestService } from 'src/request/request.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GsUserGuard, RequestService],
  imports: [UsersModule],
  exports: [AuthService, GsUserGuard]
})
export class AuthModule {}
