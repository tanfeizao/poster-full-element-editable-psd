---
name: poster-full-element-editable-psd
description: Rebuild a flattened JPG, PNG, marketplace graphic, Chinese poster, size chart, infographic, product-detail image, social ad, banner, flyer, menu, card layout, or reference artwork in the locally installed Adobe Photoshop as a genuinely layered and independently editable PSD. Use when the user asks to 拆海报、拆图层、全元素可编辑、文字可修改、重新制作 PSD、把 JPG/PNG 转成可编辑 Photoshop 文件、去掉原图文字后重排、输出 PSD 和 PNG，或要求通过 Photoshop 验证图层。 Every visible text item must become live type; geometry and effects must be independent layers; complex artwork must be isolated Smart Objects rather than a visible flattened base.
---

# niaoshu海报拆解skill

作者：**niaoshu（谭老师）**。本 Skill 由 niaoshu 为设计团队的海报分层重建工作制作与维护。

项目主页：https://github.com/tanfeizao/poster-full-element-editable-psd

显示名称：`niaoshu海报拆解skill`；兼容调用标识：`poster-full-element-editable-psd`。保留英文标识用于 Agent 识别，不代表作者或产品名称。

## 海报全元素拆分可编辑

把扁平海报当作视觉参考，从空白 Photoshop 文档重建。不要在原图上叠加“可编辑文字”冒充分层文件。

## 强制结果标准

- 所有可见文字均为 Photoshop 实时文字层。
- 背景、色块、圆形、线条、卡片、边框、阴影和装饰分别命名、分别可选。
- 照片、人物、商品、Logo、二维码、吉祥物及复杂插画使用独立智能对象或透明隔离层。
- 最终默认画面不得显示完整扁平原图。
- 修改文字后不得露出旧的栅格文字。
- 同时交付分层 PSD 和由该 PSD 导出的 PNG 预览。
- 必须在 Photoshop 中重新打开 PSD 并完成可编辑性验证，不能只靠文件存在或第三方解析器判断。

先完整阅读 [references/reconstruction-standard.md](references/reconstruction-standard.md)。执行 Photoshop 前阅读 [references/photoshop-execution.md](references/photoshop-execution.md)。含中文、CMYK、色键抠图或复杂素材时再阅读 [references/chinese-jsx-and-assets.md](references/chinese-jsx-and-assets.md)。交付前按 [references/qa-checklist.md](references/qa-checklist.md) 验收。

## 工作流

### 1. 检查原图

以原始分辨率打开全部输入，记录：

- 画布尺寸、比例、色彩模式和 ICC 配置；
- 所有文字、标点、数字、单位、换行与免责声明；
- 元素边界、中心点、间距、对齐线、颜色、透明度和阴影；
- 照片、Logo、图标、二维码、吉祥物、纹理及重复组件；
- 可原样隔离的素材和只能近似重建的元素。

OCR 只作草稿。逐项对照原图，尤其核对中文、价格、尺码和数字。

### 2. 建立元素清单

使用一行一个元素的清单：

`id | 类别 | 内容 | bounds | 样式 | Photoshop 表示 | 分组 | 置信度`

类别使用 `TYPE / GEOMETRY / IMAGE / BRAND / DECORATION / EFFECT`。先确定重复组件的网格和中心点，再开始绘制。

### 3. 选择重建方式

- 表格、尺码图、信息图、UI 式海报：从空白文档完全重建。
- 照片主导海报：隔离干净照片或重建背景，再添加实时文字。
- 复杂位图：透明化后放入智能对象；不要强行伪造为矢量。
- 简单图形：优先形状图层；时间不成比例时可用独立像素层，但必须可单独移动、隐藏、调色。
- 重复元素：保持独立图层和连续编号；如需分别编辑内容，不要共享同一个智能对象实例。

### 4. 规划图层树

默认使用：

```text
99_NOTES                         hidden
04_LIVE_TEXT
03_IMAGES_AND_ICONS_SMART_OBJECTS
02_SHAPES_AND_GEOMETRY
01_EFFECTS
00_BACKGROUND
```

语义化命名，例如 `TYPE_HEADLINE`、`TYPE_CARD_03_LABEL`、`SHAPE_CARD_03_CIRCLE`、`ICON_CARD_03_SMART_OBJECT`。禁止使用 `Layer 1` 这类无意义名称。

### 5. 在 Photoshop 中制作

必须使用可用的电脑控制能力操作本机 Photoshop。密集重复布局优先：

1. 复制 [scripts/photoshop_rebuild_helpers.jsx](scripts/photoshop_rebuild_helpers.jsx) 到任务目录；
2. 在副本底部追加本次任务的尺寸、元素坐标、文字和输出路径；
3. 通过 Photoshop 的 `文件 > 脚本 > 浏览…` 执行；
4. 使用 ASCII 临时路径运行 JSX；最终文件可复制到用户指定的中文目录；
5. 失败时使用捕获错误并写日志的包装脚本，不要盲目重复点击。

最终 PSD 必须由 Photoshop 保存，启用图层和最大兼容性。

### 6. 处理中文与复杂素材

- JSX 内可见中文文案必须写为 `\uXXXX` 转义，避免 ExtendScript 编码导致乱码或方框字。
- 使用支持中文的已安装字体；原字体未知时优先匹配字面宽度、粗细和字高，并记录替代字体。
- CMYK JPEG 不要直接把 Photoshop 取样器返回的颜色对象用于 RGB 新文档；先取得显示转换后的 RGB 数值再填充。
- Logo、吉祥物和二维码周围出现矩形底色时，先制作透明 PNG，再作为嵌入智能对象导入。
- 需要按纯色背景抠图时可使用 [scripts/extract_asset_with_colorkey.sh](scripts/extract_asset_with_colorkey.sh)，随后检查边缘和误删颜色。

### 7. 验证

重新打开保存后的 PSD，然后：

1. 选中标题、正文和重复标签，确认 Photoshop 显示文字属性；
2. 临时把文字改短和改长，确认没有旧文字出现，再恢复；
3. 移动一层文字、一层图形和一个智能对象，再恢复；
4. 开关所有顶层分组，确认背景没有盖住内容，完整原图没有参与输出；
5. 导出 PNG，以原始尺寸检查乱码、缺字、重影、矩形底、裁切和对齐；
6. 可复制 [scripts/photoshop_editability_qa.jsx](scripts/photoshop_editability_qa.jsx) 并设置 PSD、日志路径，获得机械检查记录。

只有 PNG 视觉通过且 Photoshop 内部检查通过，才能交付。

## 交付说明

交付用户指定文件夹中的：

- `名称_全元素可编辑.psd`
- `名称_全元素可编辑.png`
- 可选的 `PSD可编辑性验证.txt`

简要说明字体替代、近似重绘，以及哪些复杂元素内部仍为栅格智能对象。不要把“独立可替换智能对象”描述成“内部每个像素都已矢量化”。

## 失败判定

出现以下任一情况即失败，必须修复：

- PSD 只有一张扁平背景或把原图保持为可见底图；
- 文字层可编辑，但下方仍有旧文字；
- 中文乱码、方框字或错别字；
- 背景组位于顶层并覆盖其他元素；
- Logo、二维码或吉祥物带明显矩形底；
- PNG 与 Photoshop 画面不一致；
- 没有在 Photoshop 中重新打开并测试。


## v2.0.0 回归修复入口（2026-10-09）

本版来自 30 种风格的真实 Photoshop 测试。它改进生成、恢复与验收流程，**不代表 30 种风格都能自动达到全元素精确还原**。

1. 先读 [30 风格回归与执行规则](references/benchmark-v2.md)，逐项登记文字、组件与效果；清单不完整时只可产出测试稿。
2. 新任务优先复制 `scripts/photoshop_rebuild_v2.jsx` 与 `scripts/photoshop_qa_v2.jsx` 到任务目录。用 `EditablePosterV2.scope(function(){...})` 包裹实际操作，结束或异常均恢复 Photoshop 偏好。
3. 使用 `EditablePosterV2.text(doc, options, group)`，其中 `options` 包含 `name/text/box:[x,y,w,h]/font/color`，可含 `minSize/maxSize/rotation/align`。`color` 使用 `EditablePosterV2.rgb`。字体需实际存在，文字按真实边界收缩复测；不拉伸字形冒充字体匹配。特别小的可读性另做视觉验收。
4. 存储选区会激活 Alpha 通道。用 `withSavedSelection(doc, function(channel){...})` 保存/恢复通道，复制像素前确认 RGB 通道；移动图层后按唯一语义名称重新查找。
5. 将完整可信清单交给 `PosterQAV2.run(psdPath, manifest, outputPrefix)`。缺失必需图层必须失败；未指定的可选测试记 `SKIPPED`，不记 `PASS`。文字全部隐藏、长短替换图必须实际目检。
6. 清单的 `requiredLayers` 必须覆盖元素，`inventoryComplete` 只有人工核对后才为 `true`。机械通过仍需视觉、覆盖率、来源替换三项验收；不得把整张去字海报转一个智能对象就称“全元素拆分”。
7. 调用 `scripts/preflight.py` 检查源文件、清单、输出盘和空间，并取得包含源图/清理素材/清单/脚本哈希的恢复键；键变更必须重跑。不要根据旧 DONE 文件存在就跳过。

旧的 `photoshop_rebuild_helpers.jsx` 保留兼容 API；新的 QA 入口已改为读取元素清单，必须同时复制 v2 两个辅助脚本。详见 [CHANGELOG](CHANGELOG.md)。
