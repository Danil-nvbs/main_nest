import { Module } from '@nestjs/common';
import { GsheetsController } from './gsheets.controller';
import { GsheetsService } from './gsheets.service';
import { GdriveService } from 'src/gdrive/gdrive.service';

@Module({
  controllers: [GsheetsController],
  providers: [GsheetsService, GdriveService],
  exports: [GsheetsService, GdriveService]
})
export class GsheetsModule { }
