import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { StoredFile } from './types';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      const ext = file.originalname.toLowerCase().split('.').pop();
      if (ext !== 'html' && ext !== 'htm') {
        return cb(new Error('Only HTML files are allowed'), false);
      }
      cb(null, true);
    }
  }))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(html|htm)' })
        ]
      })
    ) file: Express.Multer.File
  ): Promise<{ message: string; file: StoredFile }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const storedFile = this.uploadService.storeFile(file);

    return {
      message: 'File uploaded successfully',
      file: storedFile
    };
  }

  @Get()
  async getAllFiles(): Promise<StoredFile[]> {
    return this.uploadService.getAllFiles();
  }

  @Get(':filename')
  async getFileByName(@Param('filename') filename: string): Promise<StoredFile | undefined> {
    const file = this.uploadService.getFileByName(filename);
    if (!file) {
      throw new BadRequestException('File not found');
    }
    return file;
  }
}