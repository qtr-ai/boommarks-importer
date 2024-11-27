// storage.service.ts
import { Injectable, Logger, Global } from '@nestjs/common';
import { StoredFile } from './types';
import { v4 as uuidv4 } from 'uuid';

@Global()  // Make this service global
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly memoryStorage = new Map<string, StoredFile>();

  addFile(file: Express.Multer.File): StoredFile {
    this.logger.debug(`Starting to add file: ${file.originalname}`);
    this.logger.debug(`Current storage size before adding: ${this.memoryStorage.size}`);

    const id = uuidv4();
    const storedFile: StoredFile = {
      id,
      filename: file.originalname,
      content: file.buffer.toString('utf-8'),
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date()
    };

    this.memoryStorage.set(id, storedFile);
    
    this.logger.debug(`File stored with ID: ${id}`);
    this.logger.debug(`New storage size: ${this.memoryStorage.size}`);

    return storedFile;
  }

  getAllFiles(): StoredFile[] {
    this.logger.debug(`Getting all files. Current storage size: ${this.memoryStorage.size}`);
    return Array.from(this.memoryStorage.values());
  }

  getFileById(id: string): StoredFile | undefined {
    return this.memoryStorage.get(id);
  }

  deleteFile(id: string): boolean {
    return this.memoryStorage.delete(id);
  }

  getStorageStatus(): any {
    return {
      totalFiles: this.memoryStorage.size,
      files: Array.from(this.memoryStorage.values()).map(f => ({
        id: f.id,
        filename: f.filename,
        size: f.size,
        uploadedAt: f.uploadedAt
      }))
    };
  }
}
