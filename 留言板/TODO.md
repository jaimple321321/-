# 留言板 MVP TODO List

## 当前确认结果

- 当前目录：`D:\神秘代码文件夹\留言板`
- 当前已有文件：`PRD.md`
- 当前尚未发现：React/Vite 项目文件、`src` 目录、Supabase 客户端代码、README、`.gitignore`
- 数据库表结构：PRD 已给出明确结构，目标表为 `public.messages`
- API 接口状态：当前代码不存在，因此还没有可用的读取/提交接口；后续通过 `@supabase/supabase-js` 调用 Supabase 的 `select` 和 `insert`
- 功能状态：当前还未实现任何页面功能

## 目标数据库表结构

表名：`public.messages`

字段：

- `id uuid primary key default gen_random_uuid()`
- `content text not null`
- `created_at timestamptz not null default now()`

约束：

- `content` 去掉首尾空格后长度必须大于等于 1
- `content` 去掉首尾空格后长度必须小于等于 300

权限：

- 开启 RLS
- 匿名用户可以读取留言
- 匿名用户可以插入留言
- 匿名用户不能更新、删除留言

README 中需要写入的 SQL：

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

## 可逐步发送给 Codex 的指令

### 1. 初始化项目骨架

指令：

```text
请在留言板文件夹中初始化 React + Vite 项目，只创建最小可运行结构，不实现业务功能。
```

要做：

- 创建或补齐 `package.json`
- 安装 React、Vite、基础脚本
- 创建 `index.html`
- 创建 `src/main.jsx`
- 创建最简单的 `src/App.jsx`

验证：

- 运行 `npm install`
- 运行 `npm run dev`
- 页面能打开并显示一个简单标题

回滚点：

- 如果失败，只回滚本步骤新增的项目骨架文件

### 2. 接入 Tailwind CSS

指令：

```text
请为留言板项目接入 Tailwind CSS，只完成样式基础配置，不改业务逻辑。
```

要做：

- 安装 Tailwind 相关依赖
- 创建或修改 Tailwind 配置
- 创建或修改 `src/index.css`
- 在 `src/main.jsx` 引入 `src/index.css`

验证：

- 运行 `npm run dev`
- 页面样式能应用 Tailwind class

回滚点：

- 如果样式配置有问题，只回滚 Tailwind 相关文件和依赖变更

### 3. 创建 Supabase 客户端

指令：

```text
请创建 Supabase 客户端文件，只读取环境变量，不写死任何 key。
```

要做：

- 安装 `@supabase/supabase-js`
- 创建 `src/supabaseClient.js`
- 使用 `import.meta.env.VITE_SUPABASE_URL`
- 使用 `import.meta.env.VITE_SUPABASE_ANON_KEY`
- 导出 `supabase`

验证：

- 运行 `npm run build`
- 确认代码中没有硬编码 Supabase URL 或 key

回滚点：

- 如果环境变量读取方式不对，只回滚 `src/supabaseClient.js`

### 4. 增加环境变量示例和忽略规则

指令：

```text
请添加环境变量示例和 git 忽略规则，确保真实 .env 不会进 Git。
```

要做：

- 创建或修改 `.gitignore`
- 确保 `.gitignore` 包含 `.env` 和 `.env.local`
- 可选：创建 `.env.example`
- 在 `.env.example` 写入变量名，不写真实值

验证：

- 运行 `git status --short`
- 确认真实 `.env` 不会显示为待提交文件

回滚点：

- 如果忽略规则错误，只回滚 `.gitignore` 和 `.env.example`

### 5. 编写 README

指令：

```text
请根据 PRD 编写 README，包含建表 SQL、环境变量、本地运行和 Netlify 部署设置。
```

要做：

- 创建或修改 `README.md`
- 写清 Supabase 建表 SQL
- 写清 `VITE_SUPABASE_URL`
- 写清 `VITE_SUPABASE_ANON_KEY`
- 写清 `npm install`
- 写清 `npm run dev`
- 写清 `npm run build`
- 写清 Netlify 环境变量配置

验证：

- README 中不包含真实 Supabase key
- SQL 与 PRD 一致

回滚点：

- 如果文档内容不准确，只回滚 `README.md`

### 6. 实现页面静态结构

指令：

```text
请实现留言板页面的静态结构，还不要连接 Supabase。
```

要做：

- 页面标题显示“留言板”
- 添加 textarea
- 添加“提交留言”按钮
- 添加留言列表区域
- 添加空状态文案“还没有留言。”

验证：

- 运行 `npm run dev`
- 页面元素全部可见
- 没有 Supabase 请求

回滚点：

- 如果布局不满意，只回滚 `src/App.jsx` 和必要的 CSS

### 7. 实现读取留言 API 调用

指令：

```text
请接入 Supabase 读取 messages 表，并按 created_at 倒序显示留言。
```

要做：

- 页面加载时调用 Supabase
- 从 `messages` 表读取 `id, content, created_at`
- 使用 `created_at` 倒序排序
- 保存到页面状态
- 读取失败时显示“留言加载失败”
- 没有数据时显示“还没有留言。”

验证：

- Supabase 已建表时，刷新页面能读取留言
- 表为空时显示空状态
- 网络或配置错误时显示加载失败

回滚点：

- 如果读取逻辑错误，只回滚本步骤对 `src/App.jsx` 的读取部分

### 8. 实现提交留言 API 调用

指令：

```text
请实现提交留言到 Supabase，提交成功后清空输入框并重新读取留言列表。
```

要做：

- 点击“提交留言”后插入 `messages`
- 只插入 `content`
- 插入成功后清空 textarea
- 插入成功后重新读取列表
- 提交失败时显示“留言提交失败”

验证：

- 输入正常留言可以提交
- Supabase 表中出现新记录
- 页面立即显示新留言
- 刷新后留言仍存在

回滚点：

- 如果提交逻辑错误，只回滚本步骤对提交函数的修改

### 9. 增加输入校验

指令：

```text
请增加留言输入校验：空留言不能提交，最多 300 字。
```

要做：

- 提交前对 `content.trim()` 做校验
- 空字符串不能提交
- 超过 300 字不能提交
- textarea 设置最大长度为 300
- 按钮在无效输入时禁用

验证：

- 空留言无法提交
- 全是空格无法提交
- 300 字以内可以提交
- 300 字以上无法提交

回滚点：

- 如果校验影响正常提交，只回滚本步骤校验相关代码

### 10. 增加提交中状态

指令：

```text
请增加提交中状态，提交期间禁用按钮并显示“提交中...”。
```

要做：

- 添加 `isSubmitting` 状态
- 提交开始时禁用按钮
- 按钮文案变为“提交中...”
- 提交结束后恢复按钮

验证：

- 快速重复点击不会重复提交
- 提交完成后按钮恢复“提交留言”

回滚点：

- 如果按钮状态异常，只回滚本步骤提交状态代码

### 11. 完成基础样式

指令：

```text
请用 Tailwind 为留言板做简洁样式，不增加 PRD 之外的功能。
```

要做：

- 页面居中或限制最大宽度
- textarea、按钮、列表有清晰边距
- 错误信息可见
- 留言内容可读
- 不添加登录、头像、点赞、回复、编辑、删除、分页或实时同步

验证：

- 桌面宽度下页面清晰
- 手机宽度下不溢出
- 所有文案可读

回滚点：

- 如果视觉效果不满意，只回滚样式相关 class

### 12. 最终构建验证

指令：

```text
请运行最终验收，确认 npm run dev、npm run build、数据库、API 和所有功能是否通过。
```

要做：

- 运行 `npm run dev`
- 运行 `npm run build`
- 检查 `.gitignore`
- 检查代码中没有真实 key
- 检查读取 API
- 检查提交 API
- 检查刷新后数据仍存在

验证：

- 本地开发服务可启动
- 构建成功
- 可以提交留言
- 提交后显示新留言
- 刷新后留言仍存在
- 空留言无法提交
- 超过 300 字无法提交
- Git 中没有 `.env` 或 `.env.local`

回滚点：

- 如果最终验收失败，根据失败项只回滚最近一个相关步骤

## API 可用性确认清单

### 读取留言

- 调用方式：`supabase.from('messages').select('id, content, created_at').order('created_at', { ascending: false })`
- 需要数据库：`public.messages`
- 需要权限：`anon` 可以 `select`
- 成功表现：页面显示留言列表
- 失败表现：页面显示“留言加载失败”
- 当前状态：未实现，暂不可用

### 提交留言

- 调用方式：`supabase.from('messages').insert({ content })`
- 需要数据库：`public.messages`
- 需要权限：`anon` 可以 `insert`
- 成功表现：输入框清空，列表重新读取并显示新留言
- 失败表现：页面显示“留言提交失败”
- 当前状态：未实现，暂不可用

## 功能确认清单

- 页面标题为“留言板”：未实现
- textarea 输入框：未实现
- “提交留言”按钮：未实现
- 留言列表区域：未实现
- 页面加载时读取 Supabase：未实现
- 按 `created_at` 倒序显示：未实现
- 提交后插入 Supabase：未实现
- 插入成功后清空输入框：未实现
- 插入成功后重新读取列表：未实现
- 空留言不能提交：未实现
- 留言最大长度 300 字：未实现
- 提交中按钮禁用并显示“提交中...”：未实现
- 读取失败显示“留言加载失败”：未实现
- 提交失败显示“留言提交失败”：未实现
- 没有留言时显示“还没有留言。”：未实现
- `.env` 和 `.env.local` 不进入 Git：未实现

## 推荐执行规则

- 每次只发送一个步骤指令
- 每完成一个步骤后运行对应验证
- 验证通过后再进入下一步
- 出错时只回滚最近一步
- 不要提前实现 PRD 明确排除的功能
