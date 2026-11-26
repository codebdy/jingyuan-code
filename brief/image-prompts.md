# 原稿素材记录

## 2026-11-24 首页动图清晰度优化

- 高清母版来自此前已生成并保留的 `../output/cable-animation-pvc-smooth/frames-4k/unique_000.png` 至 `unique_099.png`。本次只进行缩小采样、旋转、透明留白裁切与动图编码，没有重新生成或改变产品结构。
- 网页使用 `hero-cable-retina.webp` 和无损静帧 `hero-cable-retina-poster.webp`；位置元数据为 `src/data/hero-cable.json`，生成脚本为 `scripts/prepare-hero-cable.py`。
- 原上传的 `hero-cable-20261124.gif` 保留，用于来源和清晰度对照。

## 2026-11-24 首页 GIF 替换

- 按用户最新上传文件替换首屏电缆动画，使用 `hero-cable-20261124.gif`（1280×720、199 帧、透明背景），直接保留原文件。
- 沿用首屏原有位置、尺寸和竖向旋转方式，不改变其他布局。下方原稿素材表记录的是历史来源。

本次没有生成图片，全部素材来自用户的 Figma 文件。没有使用外部图库替代。

| 用途 | Figma 图层 | 本地素材 |
| --- | --- | --- |
| 首屏透明电缆 GIF | 33:102 | hero-cable.gif |
| 首屏下方视频画面帧 | 33:97 | hero-cables.png |
| 三款产品 | 102:4、107:64、107:105 | 6f2c7.png、865b8.png、2dcd5.png |
| 四个应用插图共用原图 | 75:17 等 | 4b6a9.png，按原稿分别裁切 |
| 生产流程线框 | 127:451 | db1ff.png |
| 电缆盘照片 | 157:100 | b9ea2.png |
| 公司介绍背景 | 170:309 | d54f4.png |
| 公司介绍视频画面帧 | 166:267 | about-cables.png |
| 新闻三图 | 177:86、186:302、186:314 | 5caab.png、e48f5.png、82fea.png |
| 页脚电缆蒙版 | 202:486、202:501 | 46f2d.png，使用图层原始变换矩阵 |

SVG 箭头、搜索、询盘、勾选、回顶与分隔线也来自原稿，未重绘。临时下载 URL 不写入网页源码。

## 2026-11-24 完整内页素材

- 11 张内页使用 Figma `get_design_context` 返回的原始图片和 SVG，保存在 `public/figma/`；没有使用整页截图作为网页，也没有生成或替换产品图片。
- 图层代码提取记录与素材清单在 `brief/figma-source/`，逐页布局数据在 `src/data/design/`。316 个本地素材文件已核对可加载；图片尺寸记录见 `image-metadata.json`。
- 手机端使用同一批原图及原稿裁切/翻转关系，仅重排内容。首页仍使用原稿竖向透明电缆 GIF，没有换成此前另行制作的横向电缆动画。
- 对照截图仅用于浏览器验证，存放于本机临时检查目录，不导入网站页面。

## 2026-11-24 MI 与 KVV 产品详情复用素材

- 沿用 `273:1187` 详情画板的布局，为另两个现有型号替换主图与结构图位置中的产品图片：MI 使用 `public/figma/67f07b40c282-865b8.png`，KVV 使用 `public/figma/d69670b32ed4-2dcd5.png`。
- 图片按原有框等比包含，KVV 沿用原稿上下翻转；保留原稿通用制造、材料、应用、证书等插图。没有生成产品图片，也没有推测新的结构细节。

## 2026-11-24 质量页面电缆图片视频入口

- `310:1227` 原始播放按钮素材为 `public/figma/aa3a25d41f41-de92b.svg`。为分别动画圆形背景与播放三角，复用原 SVG 的圆形及三角路径转为内联 SVG；保留原尺寸、颜色和桌面位置，没有重新生成图片或改变电缆图。

## 2026-11-25 统一证书示例

- 沿用用户截图对应的 Figma 证书示例：about 画板 `356:412` 完整卡片及 `public/figma/2364feea03eb-a8c6c.png`。质量及资质画板使用的同款原图仍保留。没有生成或更改证书正文。
- 分类缺少正式资料时，用上述原稿示例完成图片、日期、标题和说明的版式预览；不再使用此前的中性 SVG 文档占位图。示例内容需后续按实际资料替换。

## 2026-11-25 四项优势灯泡完整显示

- 沿用 about `356:35/356:36` 的原 SVG `public/figma/95cb0c77d4ec-f53f1.svg`。原导入分组仅保留纵向 -50% 而丢失横向位移，导致图标右侧被裁切；现恢复横纵 -50% 居中并修正手机内层最大宽度，不重绘图标。

## 2026-11-26 首页视频与首帧封面

- 来源为用户提供的 /Users/biliqun/Downloads/0_Braided_Cable_1920x1080.mp4。原文件无转码复制到 public/videos/home-braided-cable.mp4，未生成或改写视频画面。
- home-braided-cable-poster.webp 通过浏览器解码原片并提取首帧，尺寸 1920×1080；替换首页 33:97 的静态占位。原 hero-cables.png 保留为历史素材。

## 2026-11-26 导航 Logo 去底与反白

- 原图：用户提供 codex-clipboard-2e4081ae-4177-40fd-99c2-775fe4b6b290.png，原样保存在 public/branding/jingyuan-logo-source.png。
- 尝试内置 imagegen，提示为“原图精确去底，所有灰色 Logo 转为纯白，保留轮廓及注册标记，透明背景，无杂点、不重设计”。两次生成结果出现杂点，未用于网站。
- 最终素材 public/branding/jingyuan-logo-white.svg 直接内嵌原 PNG，通过 SVG 颜色/透明度矩阵将灰色笔画转为纯白、白底及内部空白转为透明，保留原始像素轮廓；viewBox 24 30 196 200 裁去多余白边。非 AI 重绘，未修改原图。

## 2026-11-26 品牌更名的 Logo 引用

- Logo 图案及透明处理保持原样，素材文件改名为 public/branding/xinjingyuan-logo-white.svg 和 xinjingyuan-logo-source.png，SVG 标题及网页替代文字改为 Xinjingyuan Cable。未生成或修改图案。

## 2026-11-26 新闻详情复用原图

- 新增新闻详情使用现有首页的 5caab.png、e48f5.png、82fea.png 作为对应文章主图，通过 Asset 组件引用原素材；没有生成图片或使用外部图库。标题、摘要、日期与类型均沿用已提供内容。
