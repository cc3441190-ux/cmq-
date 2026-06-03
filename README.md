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

1. 把本文件夹推到 GitHub（双击 `推送GitHub.bat`）
2. 在 [vercel.com](https://vercel.com) 导入仓库，框架选 **Other**，输出目录留空
3. 绑定自定义域名（如 `www.chenmengqiu-portfolio.xyz`），DNS 在阿里云解析

## Vibe Coding 项目（同域名，无需再买域名）

作品集内链与 iframe 已改为本站路径；`vercel.json` 会反代到原 Vercel 项目。  
若将各项目 `build` 输出放入 `demos/项目名/`，则优先使用本地静态文件（更适合备案后迁 OSS）。

| 项目 | 本站路径 |
|------|----------|
| UniPass | `/demos/unipass/marketing` |
| 本地出行 Agent | `/demos/meituan-agent/?demo=1` |
| joblens | `/demos/joblens/` |

详见 [demos/README.md](demos/README.md)、[国内域名部署指南.md](国内域名部署指南.md)。

## 访客 / HR 访问说明（VPN 话术）

主站与国内静态 Demo 一般可直接访问；**UniPass 页内 App 实时预览**等仍走海外托管，国内可能需 **VPN** 或点页内「海外完整版」。

- 完整说明与邮件模板：[访客访问说明.md](访客访问说明.md)
- 站点「项目经历」区也有访客提示条

## 简历 PDF

源文件：`产品实习简历.pdf` → 站点内路径：`assets/resume.pdf`  
首页与联系区均提供「下载简历 PDF」入口。
