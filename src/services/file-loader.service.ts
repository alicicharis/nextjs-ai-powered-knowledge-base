import { Document } from '@langchain/core/documents';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import csv from 'csv-parser';
import { Readable } from 'stream';

export interface FileLoaderOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  metadata?: Record<string, any>;
}

export class FileLoaderService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Load and process a file from S3 using appropriate LangChain document loaders
   */
  async loadFileFromS3(
    key: string,
    options: FileLoaderOptions = {}
  ): Promise<Document[]> {
    const { chunkSize = 1000, chunkOverlap = 200, metadata = {} } = options;

    // Get file content from S3
    const fileContent = await this.getFileContentFromS3(key);

    // Determine file type and process accordingly
    const fileExtension = this.getFileExtension(key);
    let documents: Document[];

    switch (fileExtension.toLowerCase()) {
      case '.csv':
        documents = await this.loadCSV(fileContent, key);
        break;
      case '.json':
        documents = await this.loadJSON(fileContent, key);
        break;
      case '.txt':
      case '.md':
      default:
        documents = await this.loadText(fileContent, key);
        break;
    }

    // Add custom metadata
    documents = documents.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        ...metadata,
        source: key,
        fileType: fileExtension,
        processedAt: new Date().toISOString(),
      },
    }));

    // Split documents into chunks if needed
    if (documents.length > 0 && documents[0].pageContent.length > chunkSize) {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
      });

      const splitDocs = await splitter.splitDocuments(documents);
      return splitDocs;
    }

    return documents;
  }

  /**
   * Load CSV content using csv-parser
   */
  private async loadCSV(content: string, source: string): Promise<Document[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from([content]);

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          // Convert CSV rows to documents
          const documents = results.map((row, index) => {
            // Create a readable representation of the row
            const rowText = Object.entries(row)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');

            return new Document({
              pageContent: rowText,
              metadata: {
                row: index + 1,
                source,
                type: 'csv_row',
              },
            });
          });

          resolve(documents);
        })
        .on('error', reject);
    });
  }

  /**
   * Load JSON content using LangChain JSONLoader
   */
  private async loadJSON(content: string, source: string): Promise<Document[]> {
    try {
      // Create a temporary file-like object for the JSON loader
      const blob = new Blob([content], { type: 'application/json' });
      const file = new File([blob], source, { type: 'application/json' });

      // Use JSONLoader to parse the JSON
      const loader = new JSONLoader(file);
      return await loader.load();
    } catch (error) {
      // If JSON parsing fails, treat as plain text
      console.warn(
        `Failed to parse JSON file ${source}, treating as text:`,
        error
      );
      return this.loadText(content, source);
    }
  }

  /**
   * Load text content using LangChain TextLoader
   */
  private async loadText(content: string, source: string): Promise<Document[]> {
    // Create a temporary file-like object for the text loader
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], source, { type: 'text/plain' });

    // Use TextLoader to process the text
    const loader = new TextLoader(file);
    return await loader.load();
  }

  /**
   * Get file content from S3
   */
  private async getFileContentFromS3(key: string): Promise<string> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const { Body } = await this.s3Client.send(getObjectCommand);
    const content = await Body?.transformToString();

    if (!content) {
      throw new Error(`Failed to retrieve content for file: ${key}`);
    }

    return content;
  }

  /**
   * Extract file extension from key
   */
  private getFileExtension(key: string): string {
    const lastDotIndex = key.lastIndexOf('.');
    return lastDotIndex !== -1 ? key.substring(lastDotIndex) : '';
  }

  /**
   * Load multiple files from S3
   */
  async loadMultipleFilesFromS3(
    keys: string[],
    options: FileLoaderOptions = {}
  ): Promise<Document[]> {
    const allDocuments: Document[] = [];

    for (const key of keys) {
      try {
        const documents = await this.loadFileFromS3(key, options);
        allDocuments.push(...documents);
      } catch (error) {
        console.error(`Failed to load file ${key}:`, error);
        // Continue with other files even if one fails
      }
    }

    return allDocuments;
  }

  /**
   * Get file metadata without loading content
   */
  async getFileMetadata(key: string): Promise<{
    size: number;
    lastModified: Date;
    contentType: string;
    extension: string;
  }> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const { ContentLength, LastModified, ContentType } =
      await this.s3Client.send(getObjectCommand);

    return {
      size: ContentLength || 0,
      lastModified: LastModified || new Date(),
      contentType: ContentType || 'application/octet-stream',
      extension: this.getFileExtension(key),
    };
  }
}

// Export singleton instance
export const fileLoaderService = new FileLoaderService();
