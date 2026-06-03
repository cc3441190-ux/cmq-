# 作品 Demo（同一域名 `chenmengqiu-portfolio.xyz`）

无需再买域名。路径示例：

| 项目 | 路径 | 国内静态部署 | 访客网络提示 |
|------|------|----------------|--------------|
| UniPass 营销 | `/demos/unipass/marketing/` | 已静态导出到 `demos/unipass/` | 营销页 ✅；App 预览常需 VPN |
| 本地出行 Agent | `/demos/meituan-agent/?demo=1` | 已支持静态包（mock 可玩） | 通常无需 VPN |
| joblens 落地页 | `/demos/joblens/` | 已支持静态复制 | 落地页通常无需 VPN |

**给 HR 的说明文案**见 [访客访问说明.md](../访客访问说明.md)。

完整国内流程见 [国内域名部署指南.md](../国内域名部署指南.md)。

## 一键构建

双击 **`构建作品Demo.bat`**（含 UniPass 静态导出），或：

```powershell
cd "d:\Users\86133\Desktop\cmq个人网站"
powershell -File .\scripts\build-demos.ps1
powershell -File .\scripts\build-unipass-export.ps1
```

- **joblens**：从 `Desktop\joblens\website` 复制  
- **美团 Agent**：`npm run build`（`VITE_PLANNER_MODE=mock`，国内可交互）  
- **UniPass**：`build-unipass-export.ps1` 导出营销站到 `demos/unipass/`（构建时临时移走 `app/api`）

## 构建后

1. `推送GitHub.bat` → Vercel 托管 `demos/` 静态文件  
2. 备案后整站上传 OSS，DNS 改到阿里云 CDN（可逐步减少「需 VPN」说明）
