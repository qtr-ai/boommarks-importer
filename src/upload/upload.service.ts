import { Injectable } from '@nestjs/common';
import { StoredFile } from './types';

@Injectable()
export class UploadService {
  private files: StoredFile[] = [];

  storeFile(file: Express.Multer.File): StoredFile {
    const newFile: StoredFile = {
      filename: file.originalname,
      content: file.buffer.toString('utf-8'),
      uploadedAt: new Date()
    };

    this.files.push(newFile);
    return newFile;
  }

  getAllFiles(): StoredFile[] {
    return this.files;
  }

  getFileByName(filename: string): StoredFile | undefined {
    return this.files.find(file => file.filename === filename);
  }

  clearFiles(): void {
    this.files = [];
  }
}