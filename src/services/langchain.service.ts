import { Document } from '@langchain/core/documents';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
});

const pinecone = new PineconeClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

export const langChainService = {
  addDocumentsToVectorStore: async (docs: Document[]) => {
    const response = await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      namespace: process.env.PINECONE_INDEX_NAME!,
    });

    return response;
  },

  queryVectorStore: async (query: string, k: number = 2) => {
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: process.env.PINECONE_INDEX_NAME!,
    });

    const retriever = vectorStore.asRetriever(k);

    const prompt = PromptTemplate.fromTemplate(`
        You are a helpful AI that answers questions based on the provided context.

        Context:
        {context}

        Question: {question}
        Answer:`);

    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const chain = RunnableSequence.from([
      {
        context: async (input: { question: string }) => {
          const docs = await retriever.invoke(input.question);
          return docs.map((doc) => doc.pageContent).join('\n');
        },
        question: (input: { question: string }) => input.question,
      },
      prompt,
      model,
    ]);

    const question = query;

    const answer = await chain.invoke({ question });

    return answer.content;
  },
};
