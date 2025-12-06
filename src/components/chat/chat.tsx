'use client';

import { Sparkles } from 'lucide-react';
import SectionCard from '../section-card';
import { useRef, useState } from 'react';
import { queryVectorStore } from '@/actions/data';
import { MessageContent } from '@langchain/core/messages';
import ReactMarkdown from 'react-markdown';

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
      ) : answer ? (
        <div className="mb-4 prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-primary">
                  {children}
                </strong>
              ),
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
              ),
            }}
          >
            {typeof answer === 'string' ? answer : answer.toString()}
          </ReactMarkdown>
        </div>
      ) : null}
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
