# 中文 JSX、颜色与透明素材

## 中文文案

ExtendScript 可能把 UTF-8 中文源代码解释成其他编码，导致乱码或方框字。任务 JSX 中的可见中文统一写成 Unicode 转义：

```jsx
// 游戏顺利
var title = '\u6e38\u620f\u987a\u5229';
```

文案较多时，先生成转义字符串，再人工对照原文。不要只看脚本文件；必须检查 Photoshop 导出的 PNG。

字体使用 Photoshop 可识别的 PostScript 名称，例如 `HiraginoSansGB-W6`。选中实时文字层后确认字符面板显示支持中文的字体和正确字号。

## CMYK JPEG 颜色

CMYK 原图打开后，Photoshop 颜色取样器返回的颜色对象直接用于 RGB 新文档可能产生明显偏色。

优先取得“显示转换后的 RGB 数值”，再显式创建 `SolidColor`。可使用 ffmpeg 抽取单像素进行辅助测量：

```bash
ffmpeg -v error -i input.jpg \
  -vf 'crop=1:1:X:Y,format=rgb24' -frames:v 1 -f rawvideo - | xxd -p
```

所得六位十六进制即 RGB。最后仍要以 Photoshop/PNG 视觉为准。

## 透明素材

裁出的 Logo、吉祥物或二维码若带着矩形背景，会破坏“独立元素”的编辑体验。对近似纯色背景：

1. 测量背景 RGB；
2. 使用 Photoshop 色彩范围、蒙版，或 `extract_asset_with_colorkey.sh` 去除背景；
3. 检查 Alpha 角落像素与边缘光晕；
4. 保存透明 PNG；
5. 在 Photoshop 中导入并转换为嵌入智能对象。

色键可能误删素材内部相近颜色。人物、商品或半透明蕾丝等复杂边缘优先使用 Photoshop 蒙版，不要依赖自动色键。

二维码只允许去除外围背景，必须保持二维码矩阵和白色安全区原样，不得重绘或模糊。

## 重复图标

- 只需统一更新的品牌图标可以共享智能对象内容。
- 用户可能逐个修改时，每个实例应重新嵌入或创建独立智能对象。
- 白底图标放在白色圆卡上时可使用正片叠底，但移动到其他背景会暴露白底；正式交付优先透明化。

