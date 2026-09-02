import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

const repository = process.env.PAGES_REPOSITORY?.split("/")[1];
const owner = process.env.PAGES_OWNER;
const base = repository ? `/${repository}/` : "/";
const siteUrl = process.env.VITE_SITE_URL?.replace(/\/$/, "")
  ?? (repository && owner ? `https://${owner}.github.io/${repository}` : "");

type PageMetadata = { title: string; description: string; image: string };

const pageMetadata: Record<string, PageMetadata> = {
  "/": { title: "林键明 JIMMY｜导演摄影师作品集", description: "林键明 JIMMY，深圳导演摄影师。专注广告 TVC、产品影像与品牌短片。", image: "/og.png" },
  "/showcase/": { title: "林键明 JIMMY｜作品展示", description: "林键明 JIMMY 的个人与作品展示，专注广告 TVC、产品影像与品牌短片。", image: "/og.png" },
  "/work/": { title: "作品｜林键明 JIMMY", description: "林键明 JIMMY 的广告 TVC、产品影像、品牌短片与人物采访作品。", image: "/og.png" },
  "/about/": { title: "关于｜林键明 JIMMY", description: "林键明 JIMMY，深圳导演摄影师，拥有 8 年广告 TVC 影像创作与制作经验。", image: "/og.png" },
  "/contact/": { title: "联系｜林键明 JIMMY", description: "联系林键明 JIMMY，洽谈广告 TVC、产品影像与品牌短片合作。", image: "/og.png" },
  "/work/appliances/": { title: "小家电与吸尘器｜林键明 JIMMY", description: "小家电与吸尘器的产品广告静帧图集。", image: "/images/collection/image3.jpg" },
  "/work/fitness/": { title: "麦瑞克 · 健身器材｜林键明 JIMMY", description: "麦瑞克健身器材 TVC 与产品广告静帧图集。", image: "/images/collection/image11.jpg" },
  "/work/asus-loctek/": { title: "华硕与乐歌｜林键明 JIMMY", description: "华硕与乐歌 TVC 静帧图集。", image: "/images/collection/image18.jpg" },
  "/work/asus/": { title: "华硕 · 静帧系列｜林键明 JIMMY", description: "华硕品牌影像静帧图集。", image: "/images/collection/image21.jpg" },
  "/work/mamazing/": { title: "MAMAZING · 母婴用品｜林键明 JIMMY", description: "MAMAZING 母婴产品广告静帧图集。", image: "/images/collection/image26.jpg" },
  "/work/esr/": { title: "ESR · 平板键盘｜林键明 JIMMY", description: "ESR 平板键盘产品广告静帧图集。", image: "/images/collection/image30.jpg" },
  "/work/magsafe-stand/": { title: "磁吸充电支架｜林键明 JIMMY", description: "ESR 磁吸充电支架产品广告静帧图集。", image: "/images/collection/image33.jpg" },
  "/work/ipad-film/": { title: "平板磁吸膜｜林键明 JIMMY", description: "ESR 平板磁吸膜产品广告静帧图集。", image: "/images/collection/image35.jpg" },
  "/work/smallrig/": { title: "摄影灯光产品｜林键明 JIMMY", description: "SmallRig 摄影灯光产品影像静帧图集。", image: "/images/collection/image38.jpg" },
  "/work/mobile-rig/": { title: "iPhone 17 摄影套件｜林键明 JIMMY", description: "SmallRig iPhone 17 摄影套件静帧图集。", image: "/images/collection/image46.jpg" },
  "/work/nongfu/": { title: "农夫山泉 · 海外短片｜林键明 JIMMY", description: "农夫山泉海外短片静帧图集。", image: "/images/collection/image54.jpg" },
  "/work/oppo/": { title: "OPPO · 海外短片｜林键明 JIMMY", description: "OPPO 海外短片静帧图集。", image: "/images/collection/image62.jpg" },
  "/work/midea/": { title: "美的 · 清洁电器｜林键明 JIMMY", description: "美的清洁电器品牌短片静帧图集。", image: "/images/collection/image75.jpg" },
  "/work/interview/": { title: "人物采访｜林键明 JIMMY", description: "人物采访影像静帧图集。", image: "/images/collection/image83.jpg" },
};

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: "share-metadata-url",
      transformIndexHtml(html, context) {
        const filename = context.filename?.replace(__dirname, "").replaceAll("\\", "/") ?? "/";
        const route = filename.replace(/index\.html$/, "") || "/";
        const metadata = pageMetadata[route] ?? pageMetadata["/"];
        const imageUrl = siteUrl ? `${siteUrl}${metadata.image}` : `${base.replace(/\/$/, "")}${metadata.image}`;
        const canonicalUrl = siteUrl ? `${siteUrl}${route}` : "";
        const shareTags = [
          '<meta property="og:type" content="website" />',
          '<meta property="og:locale" content="zh_CN" />',
          '<meta property="og:site_name" content="林键明 JIMMY｜导演摄影师" />',
          `<meta property="og:title" content="${metadata.title}" />`,
          `<meta property="og:description" content="${metadata.description}" />`,
          `<meta property="og:image" content="${imageUrl}" />`,
          '<meta name="twitter:card" content="summary_large_image" />',
          `<meta name="twitter:title" content="${metadata.title}" />`,
          `<meta name="twitter:description" content="${metadata.description}" />`,
          `<meta name="twitter:image" content="${imageUrl}" />`,
          canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}" />` : "",
        ].join("\n    ");
        return html
          .replace('<html lang="en">', '<html lang="zh-CN">')
          .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${metadata.description}" />`)
          .replace(/<title>[^<]*<\/title>/, `<title>${metadata.title}</title>`)
          .replace("</head>", `    ${shareTags}\n  </head>`);
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        showcase: resolve(__dirname, "showcase/index.html"),
        work: resolve(__dirname, "work/index.html"),
        about: resolve(__dirname, "about/index.html"),
        contact: resolve(__dirname, "contact/index.html"),
        appliances: resolve(__dirname, "work/appliances/index.html"),
        fitness: resolve(__dirname, "work/fitness/index.html"),
        asus: resolve(__dirname, "work/asus/index.html"),
        mamazing: resolve(__dirname, "work/mamazing/index.html"),
        esr: resolve(__dirname, "work/esr/index.html"),
        smallrig: resolve(__dirname, "work/smallrig/index.html"),
        mobileRig: resolve(__dirname, "work/mobile-rig/index.html"),
        oppo: resolve(__dirname, "work/oppo/index.html"),
        nongfu: resolve(__dirname, "work/nongfu/index.html"),
        midea: resolve(__dirname, "work/midea/index.html"),
        asusLoctek: resolve(__dirname, "work/asus-loctek/index.html"),
        magsafeStand: resolve(__dirname, "work/magsafe-stand/index.html"),
        ipadFilm: resolve(__dirname, "work/ipad-film/index.html"),
        interview: resolve(__dirname, "work/interview/index.html"),
        notFound: resolve(__dirname, "404.html"),
      },
    },
  },
});
