import { useCallback, useEffect, useState } from 'react';
import { createMessage, fetchMessages } from './api/messages';
import MessageForm from './components/MessageForm';
import MessageList from './components/MessageList';
import { MAX_MESSAGE_LENGTH } from './constants';

export default function App() {
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const trimmedContent = content.trim();
  const isContentValid =
    trimmedContent.length >= 1 && trimmedContent.length <= MAX_MESSAGE_LENGTH;

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const nextMessages = await fetchMessages();
      setMessages(nextMessages);
    } catch {
      setMessages([]);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(false);

    if (!isContentValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createMessage(trimmedContent);
      setContent('');
      await loadMessages();
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-4 py-8 text-zinc-950 sm:px-6 sm:py-12">
      <section className="mx-auto w-full max-w-2xl">
        <header className="mb-7 border-b border-zinc-950/10 pb-5">
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            留言板
          </h1>
        </header>

        <MessageForm
          content={content}
          isContentValid={isContentValid}
          isSubmitting={isSubmitting}
          onContentChange={setContent}
          onSubmit={handleSubmit}
          submitError={submitError}
        />

        <MessageList
          isLoading={isLoading}
          loadError={loadError}
          messages={messages}
        />
      </section>
    </main>
  );
}
