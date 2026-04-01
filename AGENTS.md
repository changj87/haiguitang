# 海龟汤 AI 游戏 - 项目开发规范

## 项目概述
这是一个海龟汤（情境猜谜）AI 游戏网站。
玩家通过向 AI 提问（只能回答是/否/无关）来猜测故事真相。

## 技术栈（严格遵守，不得替换）
- 框架：Next.js 14（App Router）
- 语言：TypeScript
- 样式：Tailwind CSS
- 数据库：Supabase（PostgreSQL + Realtime + Auth + Storage）
- AI：DeepSeek API（通过 Next.js API Route 代理调用）
- 部署：Vercel

## 禁止使用
- 不得使用 Redux（用 React useState/useContext 代替）
- 不得使用 CSS Modules 或 styled-components（只用 Tailwind）
- 不得在前端直接调用 AI API（必须通过 /api 路由代理）
- 不得使用 any 类型（TypeScript 严格模式）

## 目录结构
```
haiguitang/
├── app/
│   ├── page.tsx              # 首页/题库大厅
│   ├── game/[id]/page.tsx    # 游戏页面
│   ├── result/page.tsx       # 结算页面
│   ├── room/[code]/page.tsx  # 多人房间
│   ├── profile/page.tsx      # 个人中心
│   └── api/
│       ├── chat/route.ts     # AI 对话接口
│       ├── judge/route.ts    # 答案判断接口
│       └── room/route.ts     # 房间管理接口
├── components/
│   ├── GameCard.tsx
│   ├── ChatBox.tsx
│   ├── MessageBubble.tsx
│   └── ResultCard.tsx
├── lib/
│   ├── supabase.ts
│   └── prompts.ts
├── types/
│   └── index.ts
└── AGENTS.md
```

## 数据库表结构

### stories（题库）
```sql
create table stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  difficulty int2 default 1,        -- 1简单 2中等 3困难
  category text default '经典',
  surface text not null,            -- 汤面（展示给玩家）
  bottom text not null,             -- 汤底（只有AI知道）
  key_points jsonb default '[]',    -- 关键答案点数组
  play_count int4 default 0,
  created_at timestamptz default now()
);
```

### game_sessions（游戏记录）
```sql
create table game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  story_id uuid references stories(id),
  messages jsonb default '[]',      -- 对话历史
  status text default 'playing',    -- playing/completed/gave_up
  question_count int4 default 0,
  time_spent int4 default 0,        -- 秒
  stars int2,                       -- 1-3星
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### rooms（多人房间）
```sql
create table rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  host_id uuid references auth.users,
  story_id uuid references stories(id),
  status text default 'waiting',    -- waiting/playing/finished
  created_at timestamptz default now()
);
```

## UI 设计规范
- 主色：深海蓝 #0F172A，亮色：青蓝 #38BDF8
- 风格：暗黑神秘感，带轻微毛玻璃效果
- 移动端优先，最大宽度 max-w-md 居中
- 圆角统一用 rounded-2xl
- 动画用 transition-all duration-200

## AI Prompt 规范

### 系统 Prompt（在 lib/prompts.ts 中定义）
```
你是一个海龟汤游戏主持人。
当前谜题的真相（汤底）是：{bottom}
关键答案点：{key_points}

规则：
1. 玩家只能提问，你只能回答"是"、"否"、"无关"
2. 不能直接透露汤底内容
3. 如果玩家的问题非常接近真相，可以回答"非常接近！"
4. 如果玩家说出了完整真相，回答"恭喜你猜对了！"
5. 保持神秘感，语气简洁
```

### 答案判断 Prompt
```
汤底真相：{bottom}
关键答案点：{key_points}
玩家回答：{player_answer}

请判断玩家是否猜出了真相（需要覆盖80%以上的关键点）。
返回JSON：{"correct": true/false, "coverage": 0-100, "missing": ["缺少的关键点"]}
```

## 编码规范
- 每个组件文件不超过 150 行，超过则拆分
- API Route 必须有 try/catch 错误处理
- 环境变量统一在 .env.local 中，命名用 NEXT_PUBLIC_ 前缀（仅客户端需要的）
- 数据库操作统一封装在 lib/ 目录下
- 所有用户输入必须做长度限制（问题最长 100 字）

## 测试题目数据
```json
[
  {
    "title": "电梯谋杀案",
    "difficulty": 2,
    "category": "经典",
    "surface": "一个男人每天坐电梯到7楼，然后走楼梯到10楼。但下雨天他会直接坐到10楼。为什么？",
    "bottom": "这个男人是个矮子，晴天他只能按到7楼的按钮，下雨天他用雨伞可以按到10楼的按钮。",
    "key_points": ["矮子/身高不够", "雨伞帮助够到按钮", "无法自己按到10楼"]
  },
  {
    "title": "音乐停止",
    "difficulty": 3,
    "category": "悬疑",
    "surface": "音乐一停，她就死了。",
    "bottom": "她是走钢丝的杂技演员，表演时配有背景音乐。音乐突然停止，她以为表演结束了，摘下眼罩，结果从高空坠落身亡。",
    "key_points": ["走钢丝演员", "蒙着眼睛表演", "以为音乐停止代表表演结束", "摘下眼罩后坠落"]
  },
  {
    "title": "最后一班车",
    "difficulty": 1,
    "category": "日常",
    "surface": "小明坐上了最后一班公交车，却没有到达目的地。为什么？",
    "bottom": "小明坐反了方向，最后一班车是反方向的，他坐到了终点站，但那不是他的目的地。",
    "key_points": ["坐反了方向", "到达的是反方向终点站"]
  }
]
```
