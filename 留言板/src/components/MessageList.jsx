export default function MessageList({ isLoading, loadError, messages }) {
  return (
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
  );
}
