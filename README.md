# Ads Config Editor（静态网页）

用浏览器编辑 `default_ad_config.json`，生成并下载 JSON，然后你手动上传到 Firebase。

## 本地打开

- 直接双击 `tools/ad-config-editor/index.html` 即可使用（纯静态，无后端）。

## 发布到 GitHub Pages

参考 GitHub 官方文档：[GitHub Pages 快速入门](https://docs.github.com/zh/pages/quickstart)。

最简单做法（仓库站点）：

1. 新建一个 GitHub 仓库（例如 `vivago-ad-config-editor`）
2. 把本目录 `tools/ad-config-editor/` 下的文件放到仓库根目录（或放 `docs/` 也可以）
3. 打开仓库 **Settings → Pages**
4. Source 选择 “Deploy from a branch”
5. Branch 选 `main` + `/root`（或你放在 `docs/` 就选 `/docs`）
6. 保存后等待部署完成，得到一个 Pages URL，任何人浏览器可访问

## 你需要手动做的 Firebase 上传

本工具只负责生成 JSON，不直接写 Firebase（避免泄露权限/密钥）。

- 如果你用 **Firebase Remote Config**：可以把 JSON 整体作为一个字符串参数上传（例如 key=`ad_config_json`）。
- 如果你用 **Firebase Storage**：直接上传下载出来的 `default_ad_config.json` 文件。

