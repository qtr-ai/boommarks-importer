// upload.module.ts
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BookmarkParserService } from './bookmark-parser.service';
import { StorageService } from './storage.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService,StorageService, BookmarkParserService]
})
export class UploadModule {}