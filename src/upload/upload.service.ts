import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { BookmarkParserService } from './bookmark-parser.service';
import { Bookmark } from './bookmark.types';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly bookmarkParser: BookmarkParserService
  ) {}

  async uploadFile(file: Express.Multer.File) {
    try {
      this.logger.debug(`Processing file: ${file.originalname}`);
      
      // Store the original file
      const storedFile = this.storageService.addFile(file);
      
      // Parse the bookmarks
      const htmlContent = file.buffer.toString('utf-8');
      
      // Validate the content
      if (!htmlContent.includes('DOCTYPE NETSCAPE-Bookmark-file-1')) {
        throw new BadRequestException('Invalid bookmark file format. Please upload a Chrome/Netscape bookmark export file.');
      }

      const bookmarks = this.bookmarkParser.parseBookmarks(htmlContent);

      const summary = this.summarizeBookmarks(bookmarks);
      
      return {
        file: {
          id: storedFile.id,
          filename: storedFile.filename,
          uploadedAt: storedFile.uploadedAt
        },
        summary,
        bookmarks
      };
    } catch (error) {
      this.logger.error(`Error processing bookmarks: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  private summarizeBookmarks(bookmarks: Bookmark[]) {
    return {
      totalBookmarks: this.countBookmarks(bookmarks),
      totalFolders: this.countFolders(bookmarks),
      topLevelItems: bookmarks.length,
      folders: this.extractFolderStructure(bookmarks)
    };
  }

  private countBookmarks(bookmarks: Bookmark[]): number {
    return bookmarks.reduce((count, bookmark) => {
      if (!bookmark.isFolder) {
        count++;
      }
      if (bookmark.children) {
        count += this.countBookmarks(bookmark.children);
      }
      return count;
    }, 0);
  }

  private countFolders(bookmarks: Bookmark[]): number {
    return bookmarks.reduce((count, bookmark) => {
      if (bookmark.isFolder) {
        count++;
        if (bookmark.children) {
          count += this.countFolders(bookmark.children);
        }
      }
      return count;
    }, 0);
  }

  private extractFolderStructure(bookmarks: Bookmark[]) {
    return bookmarks
      .filter(b => b.isFolder)
      .map(folder => ({
        name: folder.title,
        bookmarkCount: folder.children ? this.countBookmarks(folder.children) : 0,
        subfolders: folder.children ? 
          folder.children.filter(c => c.isFolder).length : 0
      }));
  }
}