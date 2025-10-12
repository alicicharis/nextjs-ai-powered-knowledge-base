'use server';

import { getSession } from '@/lib/auth';
import { fileLoaderService } from '@/services/file-loader.service';
import { langChainService } from '@/services/langchain.service';

export const processData = async (
  key: string,
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
    metadata?: Record<string, any>;
  }
) => {
  const session = await getSession();

  if (!session) {
    return { error: 'User not authenticated' };
  }

  try {
    // Use the new file loader service to process the file
    const documents = await fileLoaderService.loadFileFromS3(key, {
      chunkSize: options?.chunkSize || 1000,
      chunkOverlap: options?.chunkOverlap || 200,
      metadata: {
        userId: session.user.id,
        ...options?.metadata,
      },
    });

    try {
      // Add documents directly to vector store (LangChain handles embeddings automatically)
      const uploadResponse = await langChainService.addDocumentsToVectorStore(
        documents
      );

      console.log(
        `Added ${uploadResponse} documents to vector store from file: ${key}`
      );

      return {
        success: true,
        uploadResponse,
        fileType: documents[0]?.metadata?.fileType || 'unknown',
        totalChunks: documents.length,
      };
    } catch (err) {
      console.log('Error adding documents to vector store: ', err);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return {
      error: `Failed to process file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
};

export const queryVectorStore = async (question: string) => {
  return await langChainService.queryVectorStore(question);
};
