import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { StorageModule } from './upload/storage.module';

@Module({
  imports: [UploadModule,StorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
