# Ads Config Editor 使用文档（流程版）

本文档说明你刚才实现的 **Ads 配置静态编辑页** 的完整使用流程：从打开网页、配置字段、导出 JSON，到手动上传 Firebase，再到后续改样式与发布。

## 1. 访问与入口

- **在线地址（GitHub Pages）**：`https://lipeng920417.github.io/ad-config-editor/`
- **仓库地址**：`https://github.com/lipeng920417/ad-config-editor`

> 首次发布或更新后，Pages 可能有缓存。若你看不到最新内容，请强刷：Mac `Cmd+Shift+R`。

## 2. 页面能做什么

- **编辑全局配置**（开关、阈值、时间间隔、启动时长）
- **编辑广告位列表**：增删改、上下移动、按 `ad_position_type` 排序
- **输出 JSON**：实时生成并显示在 “JSON 输出” 文本框
- **校验**：检查必填、类型、广告位 type 是否重复
- **下载 JSON**：下载文件名固定为 `default_ad_config.json`

> 页面已按需求精简：**不支持导入 JSON**。

## 3. 全局字段说明（口径）

页面全局字段与含义：

- **`ad_global_enabled`**：全局是否允许展示广告（true/false）
- **`ad_daily_show_limit`**：激励广告每天上限
- **`ad_same_feature_interval_seconds`**：激励广告时间间隔（秒）
- **`ad_timed_interstitial_interval_seconds`**：120 秒触发一次视频插屏（秒）
- **`startup_duration_seconds`**：启动时长（默认 8 秒）
- **`ad_user_segment_filter`**：留空为 null；如需配置，输入 JSON（示例 `["vip","new"]`）

## 4. 广告位列表（`ad_positions_config`）

每一条广告位配置包含：

- **`name`**：展示名称（必填）
- **`ad_enable`**：该广告位开关（true/false）
- **`ad_position_type`**：广告位类型（必填，且全表不允许重复）
- **`ad_position_id`**：AdMob/聚合平台的广告位 ID（必填）

常见 type 示例（与当前本地默认配置一致）：

- `start_splash`（开屏）
- `first_interstitial`（首次插屏）
- `enter_function_interstitial`（进入功能插屏）
- `timed_120s_interstitial`（120 秒插屏）
- `reward`（激励）

## 5. 导出 JSON（生成文件）

步骤：

1. 在页面中完成字段与广告位列表配置
2. 点击 **校验**（建议先点一次，确保无错误）
3. 点击 **下载 JSON**
4. 浏览器会下载 `default_ad_config.json`

## 6. 手动上传到 Firebase（你的操作）

该工具**不直接写 Firebase**（避免权限与密钥泄露），你手动上传即可。

你可以选任意一种方式：

- **Firebase Remote Config**：把 JSON 整体作为一个字符串参数上传（例如 key=`ad_config_json`），App 侧拉取后再解析为对象
- **Firebase Storage**：直接上传文件 `default_ad_config.json`，App 侧下载后解析

> 具体你们项目选择哪一种，以你们现有 Firebase 接入方式为准。

## 7. 本地默认配置文件（Android 工程）

Android 工程内本地默认配置文件路径：

- `app/src/main/assets/vivago_ads/default_ad_config.json`

已新增字段：

- `startup_duration_seconds: 8`

## 8. 后续修改样式 / 迭代页面（推荐方式）

建议你后续 **单独 clone Pages 仓库** 来改页面，不要在 Android 工程里改：

1. `git clone https://github.com/lipeng920417/ad-config-editor.git`
2. 修改：
   - `index.html`（结构/文案）
   - `style.css`（样式）
   - `app.js`（逻辑/校验）
3. `git commit && git push`
4. 等待 GitHub Pages 自动更新（通常几分钟内）

## 9. 一次完整“从配置到上线”的建议流程

1. 打开在线页面
2. 配置全局字段（尤其是 `startup_duration_seconds`）
3. 配置/调整 `ad_positions_config`
4. 点 **校验**，修正错误
5. 点 **下载 JSON**
6. 手动上传到 Firebase（Remote Config 或 Storage）
7. App 启动/刷新拉取配置后生效

