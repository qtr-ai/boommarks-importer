import { 
  Controller, 
  Post, 
  Get, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { StorageService } from './storage.service';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService,
    private readonly storageService: StorageService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
      console.log(`Intercepted file upload request`);
      console.log(`File details:`, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype
      });

      const ext = file.originalname.toLowerCase().split('.').pop() || '';
      if (ext !== 'html' && ext !== 'htm') {
        console.log(`Invalid file type: ${ext}`);
        return cb(new Error('Only HTML files are allowed'), false);
      }
      
      console.log(`File type validated successfully`);
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.debug('Upload endpoint hit');
    
    if (!file) {
      this.logger.error('No file received in request');
      throw new BadRequestException('No file uploaded');
    }

    this.logger.debug(`Received file in controller:`, {
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      bufferSize: file.buffer?.length || 0
    });

    try {
      const result = await this.uploadService.uploadFile(file);
      this.logger.debug('File processed successfully:', result);
      
      return {
        message: 'File uploaded successfully',
        data: result
      };
    } catch (error) {
      this.logger.error('Error during file upload:', error);
      throw error;
    }
  }

  @Get()
  async getAllFiles() {
    this.logger.debug('Get all files endpoint hit');
    const files = await this.storageService.getAllFiles();
    this.logger.debug(`Retrieved ${files.length} files`);
    return files;
  }

  @Get('status')
  async getStatus() {
    this.logger.debug('Storage status endpoint hit');
    const status = await this.storageService.getStorageStatus();
    this.logger.debug('Storage status:', status);
    return status;
  }
}