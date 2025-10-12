'use client';

import { Sparkles } from 'lucide-react';
import SectionCard from '../section-card';
import { useRef, useState } from 'react';
import { queryVectorStore } from '@/actions/data';
import { MessageContent } from '@langchain/core/messages';

const Chat = () => {
  const questionRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<MessageContent>('');

  const askQuestionHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const question = questionRef.current?.value;

    if (!question) return;

    const response = await queryVectorStore(question);
    setAnswer(response);
    setLoading(false);
  };

  return (
    <SectionCard>
      {loading ? (
        <div className="flex items-center justify-start gap-1 py-8">
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      ) : (
        <p className="mb-4">{answer.toString()}</p>
      )}
      <form onSubmit={askQuestionHandler} className="flex flex-col gap-4">
        <textarea
          className="textarea textarea-primary w-full"
          placeholder="Ask a question"
          ref={questionRef}
        />
        <button className="btn btn-primary" disabled={loading}>
          <Sparkles className="w-4 h-4" />
          Ask
        </button>
      </form>
    </SectionCard>
  );
};

export default Chat;
