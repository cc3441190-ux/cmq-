# 陈孟秋 · 个人求职网站

面向 HR / 业务负责人的一页式作品集，展示实习经历与 Vibe Coding 项目 Demo。

单页 Tailwind 版，核心交互包括：Hero 星云 + 滚动视差炸开图片、作品区 sticky 配图切换、技能区悬停换图、FAQ 手风琴、页脚巨型标题。视觉参考 [Foxfolio](https://foxfolio.framer.website/)。

请将 `产品实习简历.pdf` 放入 `assets/resume.pdf`，证件照放入 `assets/avatar.png`。

## 本地预览

在项目目录执行：

```bash
npx --yes serve . -l 8766
```

浏览器打开：**http://127.0.0.1:8766/**

> `127.0.0.1` 是本机地址，只有你的电脑在运行上述命令时才能访问；关掉终端或没启动服务就会「打不开」。要给 HR 看，需要部署到 Vercel / Netlify / GitHub Pages。

## 部署到 Vercel（推荐）

1. 把本文件夹推到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入仓库，框架选 **Other**，输出目录留空（静态根目录即 `index.html`）
3. 获得形如 `https://xxx.vercel.app` 的公开链接，可写进简历

## Vibe Coding 项目链接

| 项目 | 链接 |
|------|------|
| UniPass | https://unipass-nu.vercel.app/marketing#demo |
| 本地生活 Agent | https://meituan-agent-ak8w9zumh-cc3441190-uxs-projects.vercel.app/ |
| joblens | https://joblens-pi.vercel.app/ |

## 简历 PDF

源文件：`产品实习简历.pdf` → 站点内路径：`assets/resume.pdf`  
首页与联系区均提供「下载简历 PDF」入口。
