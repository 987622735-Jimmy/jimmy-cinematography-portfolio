# 林键明 JIMMY｜导演摄影师作品集

一个面向导演、制片人与品牌团队的静态作品集。网站不含数据库、登录系统或大体积源视频，可免费部署至 GitHub Pages。

## 更新作品

所有作品资料都集中在 `src/data/projects.ts`：修改标题、项目说明、署名、年份和图片数组即可。项目静帧统一存放在 `public/images/collection`。

如有已公开的 Vimeo、YouTube 或 Bilibili 视频，在对应项目增加 `videoUrl`：

```ts
videoUrl: "https://player.vimeo.com/video/视频编号"
```

作品详情页会先展示静帧；点击“播放影片”后才加载外部播放器。请勿把原始 MP4 放入仓库。

## 本地预览

```bash
pnpm install
pnpm dev
```

## GitHub Pages 发布与转发

部署工作流已在 `.github/workflows/deploy.yml` 配置完成。

1. 将整个项目推送至你自己的 GitHub 仓库，默认分支使用 `main`。
2. 在仓库 **Settings → Pages** 中将 Source 设为 **GitHub Actions**。
3. 推送后等待 Actions 中的 “Deploy portfolio to GitHub Pages” 成功。
4. 公开地址为 `https://你的 GitHub 用户名.github.io/仓库名/`；复制这个地址即可在微信、邮件或浏览器中直接打开和转发。

工作流会自动生成 GitHub Pages 子路径和每个项目页的分享标题、描述、封面图片；不要手动修改构建后的 `dist` 文件夹。

## 验证

```bash
pnpm run lint
pnpm run build
```
