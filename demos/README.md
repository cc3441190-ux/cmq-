# 作品 Demo（同一域名 `chenmengqiu-portfolio.xyz`）

无需再买域名。路径示例：

| 项目 | 路径 | 国内静态部署 |
|------|------|----------------|
| UniPass 营销 | `/demos/unipass/marketing/` | 暂靠 Vercel 反代（见下） |
| 本地出行 Agent | `/demos/meituan-agent/?demo=1` | 已支持静态包（mock 可玩） |
| joblens 落地页 | `/demos/joblens/` | 已支持静态复制 |

完整国内流程见项目根目录 **[国内域名部署指南.md](../国内域名部署指南.md)**。

## 一键构建

双击 **`构建作品Demo.bat`**，或：

```powershell
cd "d:\Users\86133\Desktop\cmq个人网站"
powershell -File .\scripts\build-demos.ps1
```

- **joblens**：从 `Desktop\joblens\website` 复制  
- **美团 Agent**：`npm run build`（`VITE_PLANNER_MODE=mock`，国内可交互）  
- **UniPass**：若 Next 静态导出失败，继续用 `vercel.json` 反代到 `unipass-nu.vercel.app`；要纯国内需去掉或改造 `app/api/*` 后静态导出

## 构建后

1. `推送GitHub.bat` → Vercel 会优先托管 `demos/` 里的真实文件  
2. 备案后整站上传 OSS，DNS 改到阿里云 CDN
