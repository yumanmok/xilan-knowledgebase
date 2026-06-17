import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const pages = [
  ["xilan-art-store-overview.html", "晞蓝艺术商店总览", "overview"],
  ["shengqi-painting-society.html", "生气画会", "shengqi"],
  ["xilan-see-her-beyond.html", "她与她之外", "events"],
  ["xilan-brand-identity.html", "晞蓝品牌身份", "brand"],
  ["xilan-selection-and-products.html", "晞蓝选品与产品线", "selection"],
  ["xilan-visual-and-content-language.html", "晞蓝视觉与内容语言", "visual"],
  ["xilan-see-her-after.html", "看见她之后", "after"],
  ["xilan-stardust-bracelet.html", "星尘落款", "stardust"],
];

const pageByFile = new Map(pages.map(([file, title, key]) => [file, { title, key }]));

function extractContent(html) {
  const mainMatch = html.match(/<main class="content">([\s\S]*?)<\/main>/);
  if (mainMatch) {
    return mainMatch[1].trim();
  }

  const start = html.indexOf('<div class="content">');
  const footer = html.indexOf('<div class="footer">');

  if (start === -1 || footer === -1) {
    throw new Error("Cannot find content block");
  }

  const raw = html.slice(start + '<div class="content">'.length, footer);
  return raw
    .replace(/\n\s*<\/div>\s*<\/div>\s*$/u, "")
    .trim();
}

function normalizeLinks(content) {
  return content
    .replace(/<a href="\.\.\/sources\/([^"]+)\.md">([^<]+)<\/a>/g, '<span class="source-ref">$2</span> <code>sources/$1.md</code>')
    .replace(/<a href="\.\.\/raw\/([^"]+)">([^<]+)<\/a>/g, '<span class="source-ref">$2</span> <code>raw/$1</code>')
    .replace(/href="\.\.\/wiki\/([^"#]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"')
    .replace(/href="([^"\/.#]+)\.md(#[^"]*)?"/g, (match, file, hash = "") => {
      const htmlFile = `${file}.html`;
      return pageByFile.has(htmlFile) ? `href="${htmlFile}${hash}"` : match;
    });
}

function navLink(file, label, activeKey) {
  const key = pageByFile.get(file)?.key;
  const active = key === activeKey ? ' class="active"' : "";
  return `<a href="${file}"${active}>${label}</a>`;
}

function sidebar(activeKey) {
  return `<aside class="sidebar" aria-label="主导航">
      <p class="sidebar__title">晞蓝</p>
      <nav class="sidebar__section" aria-label="晞蓝">
        <h2>晞蓝档案</h2>
        ${navLink("xilan-art-store-overview.html", "总览", activeKey)}
        ${navLink("xilan-brand-identity.html", "品牌身份", activeKey)}
        ${navLink("xilan-selection-and-products.html", "选品与产品线", activeKey)}
        ${navLink("xilan-visual-and-content-language.html", "视觉与内容语言", activeKey)}
      </nav>
      <nav class="sidebar__section" aria-label="生气画会与活动">
        <h2>生气画会</h2>
        ${navLink("shengqi-painting-society.html", "生气画会", activeKey)}
        ${navLink("xilan-see-her-beyond.html", "她与她之外", activeKey)}
        ${navLink("xilan-see-her-after.html", "看见她之后", activeKey)}
        ${navLink("xilan-stardust-bracelet.html", "星尘落款", activeKey)}
      </nav>
    </aside>`;
}

function layout({ title, activeKey, content }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 晞蓝</title>
  <link rel="stylesheet" href="assets/site.css">
</head>
<body>
  <header class="site-header">
    <div class="site-header__inner">
      <a href="index.html" class="brand" aria-label="晞蓝首页">
        <span class="brand__mark">晞蓝</span>
        <span>晞蓝</span>
      </a>
      <nav class="top-nav" aria-label="顶部导航">
        ${navLink("xilan-art-store-overview.html", "总览", activeKey)}
        ${navLink("shengqi-painting-society.html", "生气画会", activeKey)}
        ${navLink("xilan-see-her-beyond.html", "活动", activeKey)}
        ${navLink("xilan-brand-identity.html", "品牌", activeKey)}
      </nav>
    </div>
  </header>
  <div class="shell">
    ${sidebar(activeKey)}
    <main class="content">
${content}
    </main>
    <aside class="toc" aria-label="右侧目录">
      <p class="toc__title">目录</p>
      <ol data-toc-list></ol>
    </aside>
  </div>
  <footer class="site-footer">晞蓝 · 知识库 © 2026 · 由生气画会维护</footer>
  <script src="assets/site.js"></script>
</body>
</html>
`;
}

function homePage() {
  return layout({
    title: "晞蓝知识库",
    activeKey: "home",
    content: `<section class="hero">
  <div class="hero__meta">晞蓝档案馆 · 生气画会维护</div>
  <h1 class="hero__title">晞蓝<span>知识库</span></h1>
  <p class="hero__copy">一个面向生气画会与晞蓝艺术商店的档案型知识库：把地方生活、活动影像、品牌语言、选品与长期方法放在同一张可继续生长的地图里。</p>
  <div class="hero__links">
    <a class="button button--primary" href="xilan-art-store-overview.html">进入晞蓝总览</a>
    <a class="button" href="shengqi-painting-society.html">阅读生气画会</a>
    <a class="button" href="xilan-visual-and-content-language.html">查看视觉语言</a>
  </div>
</section>

<section>
  <div class="section-eyebrow">Primary Map</div>
  <h2>从这里开始</h2>
  <p>首页偏向展览式入口，正文页保持安静、清晰、可维护的阅读体验。</p>
  <div class="knowledge-map">
    ${card("Project", "晞蓝艺术商店", "生活美学空间、活动现场与面向公众的艺术商店总览。", "xilan-art-store-overview.html")}
    ${card("Origin", "生气画会", "阳江在地艺术小组，也是晞蓝的内容母体与关系源头。", "shengqi-painting-society.html")}
    ${card("Brand", "品牌身份", "黎明蓝、长效设计、力所能及的收藏，以及晞蓝如何说话。", "xilan-brand-identity.html")}
    ${card("Visual", "视觉与内容语言", "柔和光、纪录片感、现场余温，以及适合晞蓝的动效节奏。", "xilan-visual-and-content-language.html")}
    ${card("Objects", "选品与产品线", "从艺术品、器物到珠串，记录可以被长期使用的生活审美。", "xilan-selection-and-products.html")}
    ${card("Events", "她与她之外", "母亲节特别放映、家庭影像日与阳江本地活动记录。", "xilan-see-her-beyond.html")}
    ${card("Video", "看见她之后", "母亲节放映延伸竖屏短视频项目，叙事与视觉方向。", "xilan-see-her-after.html")}
    ${card("Product", "星尘落款", "把“看见她”落到可以佩戴的礼物上。", "xilan-stardust-bracelet.html")}
  </div>
</section>`,
  });
}

function card(tag, title, copy, href) {
  return `<article class="map-card">
      <a href="${href}">
        <span class="map-card__tag">${tag}</span>
        <h2>${title}</h2>
        <p>${copy}</p>
      </a>
    </article>`;
}

for (const [file, title, activeKey] of pages) {
  const html = readFileSync(file, "utf8");
  const content = normalizeLinks(extractContent(html));
  writeFileSync(file, layout({ title, activeKey, content }));
}

writeFileSync("index.html", homePage());

console.log(`Rebuilt ${pages.length + 1} static pages in ${basename(process.cwd())}`);
