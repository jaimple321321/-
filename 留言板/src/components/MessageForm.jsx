import { MAX_MESSAGE_LENGTH } from '../constants';

export default function MessageForm({
  content,
  isContentValid,
  isSubmitting,
  onContentChange,
  onSubmit,
  submitError,
}) {
  return (
    <form
      className="rounded-lg border border-zinc-950/10 bg-white/85 p-4 shadow-[0_18px_50px_rgba(39,39,42,0.08)] sm:p-5"
      onSubmit={onSubmit}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">
          留言内容
        </span>
        <textarea
          className="min-h-36 w-full resize-y rounded-md border border-zinc-300 bg-[#fffdf9] px-4 py-3 text-base leading-7 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => onContentChange(event.target.value)}
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
  );
}
