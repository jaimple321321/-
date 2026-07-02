# 留言板 MVP

这是一个基于 React + Vite + Tailwind CSS + Supabase 的动态留言板 MVP。

用户可以输入留言，提交后保存到 Supabase 的 `messages` 表，并在页面上显示。刷新页面后，留言仍然存在。

## 技术栈

- React
- Vite
- Tailwind CSS
- Supabase
- Netlify

## Supabase 建表 SQL

在 Supabase 项目的 SQL Editor 中执行以下 SQL：

```sql
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  content text not null check (
    char_length(btrim(content)) >= 1
    and char_length(btrim(content)) <= 300
  ),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "public can read messages"
on public.messages
for select
to anon
using (true);

create policy "public can insert messages"
on public.messages
for insert
to anon
with check (
  char_length(btrim(content)) >= 1
  and char_length(btrim(content)) <= 300
);

grant usage on schema public to anon;
grant select, insert on public.messages to anon;
```

## 环境变量

本地开发时，在项目根目录创建 `.env.local`：

```env
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon public key
```

说明：

- 不要把真实 `.env` 或 `.env.local` 提交到 GitHub
- `.gitignore` 已经忽略 `.env` 和 `.env.local`
- `.env.example` 只用于展示需要哪些变量，不放真实值

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

预览生产构建：

```bash
npm run preview
```

## Netlify 部署设置

在 Netlify 创建站点后，使用以下设置：

- Build command: `npm run build`
- Publish directory: `dist`

在 Netlify 的环境变量设置中添加：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

部署前请确认 Supabase 中已经执行建表 SQL，并且 `messages` 表的 RLS policy 已创建。

## MVP 功能范围

本项目只实现留言板核心功能：

- 页面显示“留言板”
- 输入留言
- 提交留言到 Supabase
- 从 Supabase 读取留言
- 留言按 `created_at` 倒序显示
- 空留言不能提交
- 留言最大长度为 300 字
- 提交中显示“提交中...”
- 读取失败显示“留言加载失败”
- 提交失败显示“留言提交失败”
- 没有留言时显示“还没有留言。”

不实现：

- 登录
- 用户名
- 头像
- 点赞
- 回复
- 编辑
- 删除
- 管理员审核
- 分页
- 实时同步
