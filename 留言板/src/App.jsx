import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const trimmedContent = content.trim();
  const isContentValid =
    trimmedContent.length >= 1 && trimmedContent.length <= 300;

  const loadMessages = useCallback(async () => {
    if (!supabase) {
      setLoadError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(false);

    const { data, error } = await supabase
      .from('messages')
      .select('id, content, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setMessages([]);
      setLoadError(true);
    } else {
      setMessages(data ?? []);
    }

    setIsLoading(false);
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

    if (!supabase) {
      setSubmitError(true);
      setIsLoading(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('messages').insert({
        content: trimmedContent,
      });

      if (error) {
        setSubmitError(true);
        return;
      }

      setContent('');
      await loadMessages();
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

        <form
          className="rounded-lg border border-zinc-950/10 bg-white/85 p-4 shadow-[0_18px_50px_rgba(39,39,42,0.08)] sm:p-5"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-700">
              留言内容
            </span>
            <textarea
              className="min-h-36 w-full resize-y rounded-md border border-zinc-300 bg-[#fffdf9] px-4 py-3 text-base leading-7 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
              maxLength="300"
              onChange={(event) => setContent(event.target.value)}
              placeholder="写下你的留言..."
              value={content}
            />
          </label>

          {submitError && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              留言提交失败
            </p>
          )}

          <button
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 sm:w-auto"
            disabled={!isContentValid || isSubmitting}
            type="submit"
          >
            {isSubmitting ? '提交中...' : '提交留言'}
          </button>
        </form>

        <section
          className="mt-8 rounded-lg border border-zinc-950/10 bg-white/70 p-4 sm:p-5"
          aria-labelledby="message-list-title"
        >
          <h2
            id="message-list-title"
            className="mb-4 text-lg font-semibold text-zinc-900"
          >
            留言列表
          </h2>

          {isLoading && (
            <div className="rounded-md border border-zinc-200 bg-[#fffdf9] px-5 py-8 text-center text-zinc-500">
              留言加载中...
            </div>
          )}

          {!isLoading && loadError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-5 py-8 text-center font-medium text-red-700">
              留言加载失败
            </div>
          )}

          {!isLoading && !loadError && messages.length === 0 && (
            <div className="rounded-md border border-dashed border-zinc-300 bg-[#fffdf9] px-5 py-8 text-center text-zinc-500">
              还没有留言。
            </div>
          )}

          {!isLoading && !loadError && messages.length > 0 && (
            <ul className="space-y-3">
              {messages.map((message) => (
                <li
                  className="rounded-md border border-zinc-200 bg-[#fffdf9] p-4 shadow-sm"
                  key={message.id}
                >
                  <p className="whitespace-pre-wrap break-words leading-7 text-zinc-900">
                    {message.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
