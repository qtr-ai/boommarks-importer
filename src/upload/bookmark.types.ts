// types/bookmark.types.ts
export interface Bookmark {
    title: string;
    url?: string;
    addDate?: string;
    icon?: string;
    children?: Bookmark[];
    lastModified?: string;
    folderName?: string;
    isFolder: boolean;
  }