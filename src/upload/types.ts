export interface StoredFile {
    id: string;          // Unique identifier
    filename: string;    // Original filename
    content: string;     // File content as string
    mimeType: string;    // File mime type
    size: number;        // File size in bytes
    uploadedAt: Date;    // Upload timestamp
  }
  