import { Injectable, Logger } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { Bookmark } from './bookmark.types';

@Injectable()
export class BookmarkParserService {
  private readonly logger = new Logger(BookmarkParserService.name);

  parseBookmarks(htmlContent: string): Bookmark[] {
    try {
      this.logger.debug('Starting to parse bookmarks');
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // Chrome exports bookmarks with a root DL inside the body
      const rootDL = document.querySelector('body > dl');
      if (!rootDL) {
        this.logger.debug('DOM content:', document.documentElement.innerHTML);
        throw new Error('No bookmark structure found');
      }

      return this.parseBookmarkLevel(rootDL);
    } catch (error) {
      this.logger.error(`Error parsing bookmarks: ${error.message}`);
      throw error;
    }
  }

  private parseBookmarkLevel(element: Element): Bookmark[] {
    const bookmarks: Bookmark[] = [];

    // Get all DT elements (direct children only)
    const dtElements = element.querySelectorAll(':scope > dt');
    
    for (const dt of Array.from(dtElements)) {
      const bookmark = this.parseBookmarkItem(dt);
      if (bookmark) {
        bookmarks.push(bookmark);
      }
    }

    return bookmarks;
  }

  private parseBookmarkItem(dt: Element): Bookmark | null {
    try {
      // Check if it's a folder
      const h3 = dt.querySelector(':scope > h3');
      if (h3) {
        // Get the DL that contains the folder's bookmarks
        const dl = dt.querySelector(':scope > dl');
        const children = dl ? this.parseBookmarkLevel(dl) : [];

        return {
          title: h3.textContent?.trim() || 'Untitled Folder',
          addDate: h3.getAttribute('add_date') || undefined,
          lastModified: h3.getAttribute('last_modified') || undefined,
          isFolder: true,
          children
        };
      }

      // Check if it's a bookmark
      const a = dt.querySelector(':scope > a');
      if (a) {
        return {
          title: a.textContent?.trim() || 'Untitled Bookmark',
          url: a.getAttribute('href') || undefined,
          addDate: a.getAttribute('add_date') || undefined,
          icon: a.getAttribute('icon') || undefined,
          isFolder: false
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Error parsing bookmark item: ${error.message}`);
      return null;
    }
  }
}