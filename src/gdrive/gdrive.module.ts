import { Module } from '@nestjs/common';
import { GdriveController } from './gdrive.controller';
import { GdriveService } from './gdrive.service';

@Module({
  controllers: [GdriveController],
  providers: [GdriveService],
  exports: [GdriveService]
})
export class GdriveModule {}
