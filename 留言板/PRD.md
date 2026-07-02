请根据以下 PRD 实现一个动态留言板 MVP。

技术栈：
React + Vite
Tailwind CSS
Supabase
Netlify

目标：
用户可以在网页输入留言，点击提交后，留言保存到 Supabase 的 messages 表，并显示在当前网页留言列表中。刷新页面后，留言仍然存在。

只实现这个核心功能，不要实现登录、用户名、头像、点赞、回复、编辑、删除、管理员审核、分页或实时同步。

数据库表：
messages

字段：
id uuid primary key default gen_random_uuid()
content text not null
created_at timestamptz default now()

前端要求：
1. 页面标题为“留言板”
2. 有一个 textarea 输入框
3. 有一个“提交留言”按钮
4. 有一个留言列表区域
5. 页面加载时自动从 Supabase 读取 messages 表
6. 留言按照 created_at 倒序显示
7. 用户提交留言后，插入 Supabase
8. 插入成功后清空输入框
9. 插入成功后重新读取留言列表
10. 空留言不能提交
11. 留言最大长度为 300 字
12. 提交过程中按钮禁用，并显示“提交中...”
13. 读取失败时显示“留言加载失败”
14. 提交失败时显示“留言提交失败”
15. 没有留言时显示“还没有留言。”

环境变量：
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

请创建或修改以下文件：
src/App.jsx
src/main.jsx
src/supabaseClient.js
src/index.css
.gitignore
README.md

要求：
1. 使用 @supabase/supabase-js 连接 Supabase
2. 不要把 Supabase key 直接写死在代码中
3. 从 import.meta.env 读取环境变量
4. .gitignore 必须包含 .env 和 .env.local
5. 代码结构保持简单，适合初学者阅读
6. README 中写清楚 Supabase 建表 SQL、环境变量配置、本地运行方式和 Netlify 部署设置

Supabase SQL 请写进 README：

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

验收标准：
1. npm run dev 能本地启动
2. npm run build 能成功构建
3. 输入留言后可以提交
4. 提交后页面显示新留言
5. 刷新页面后留言仍然存在
6. 空留言无法提交
7. 300 字以上留言无法提交
8. GitHub 中不能出现 .env 文件