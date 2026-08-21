import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { projectBySlug, projects, type Project, type ProjectVideo } from "./data/projects";
import "./styles.css";

const basePath = import.meta.env.BASE_URL;
const asset = (file: string) => `${basePath}images/${file}`;
const path = (route = "") => `${basePath}${route.replace(/^\//, "")}`;

function getCurrentPath() {
  const current = window.location.pathname;
  if (current.startsWith(basePath)) {
    return `/${current.slice(basePath.length).replace(/^\/+|\/+$/g, "")}`;
  }
  return current.replace(/\/+$/, "") || "/";
}

function useMetadata(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [description, title]);
}

function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href={path()} aria-label="林键明 JIMMY 首页">
        <span>林键明 <b>JIMMY</b></span>
        <small>导演摄影师 / Director & Cinematographer</small>
      </a>
      <nav aria-label="主导航">
        <a href={path("work/")}>作品 <i>Work</i></a>
        <a href={path("about/")}>关于 <i>About</i></a>
        <a href={path("contact/")}>联系 <i>Contact</i></a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} 林键明 JIMMY</span>
      <a href="mailto:987622735@qq.com">987622735@qq.com</a>
      <span>中国 · 深圳 / Shenzhen, China</span>
    </footer>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#content">跳至正文</a>
      <Header />
      <main id="content">{children}</main>
      <Footer />
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

function WorkGrid({ selected = false }: { selected?: boolean }) {
  const items = selected ? projects.slice(0, 6) : projects;
  return (
    <div className="work-grid">
      {items.map((project, index) => (
        <a
          className={`work-card work-card--${(index % 3) + 1}`}
          href={path(`work/${project.slug}/`)}
          key={project.slug}
          aria-label={`查看 ${project.title} 图集与影片`}
        >
          <img
            src={asset(project.images[0])}
            alt={`${project.title} 项目静帧`}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
          <span className="work-card__veil" aria-hidden="true" />
          <span className="work-card__copy">
            <strong>{project.title}</strong>
            <small lang="en">{project.titleEn}</small>
            <em>{project.year} · {project.type} · {project.role}</em>
          </span>
          <span className="work-card__action">查看图集 <i>{project.videos?.length ? `${project.videos.length} 部影片` : "View stills"}</i></span>
        </a>
      ))}
    </div>
  );
}

function Home() {
  useMetadata(
    "林键明 JIMMY｜导演摄影师作品集",
    "林键明 JIMMY，深圳导演摄影师。专注广告 TVC、产品影像与品牌短片。",
  );

  return (
    <Layout>
      <section className="hero">
        <img
          className="hero__image"
          src={asset("hero-on-set.jpg")}
          alt="林键明在商业拍摄现场工作"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
        />
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__content">
          <Eyebrow>中国 · 深圳 / Shenzhen, China · 可承接商业影像项目</Eyebrow>
          <h1>林键明</h1>
          <p className="hero__name" lang="en">JIMMY</p>
          <p className="hero__role">导演摄影师 <span>Director & Cinematographer</span></p>
          <div className="hero__actions">
            <a className="text-link text-link--light" href={path("work/")}>
              浏览精选作品 <span aria-hidden="true">↘</span>
            </a>
            <a className="text-link text-link--light" href={path("about/")}>
              查看个人经历 <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
        <p className="hero__index" aria-hidden="true">01 — {String(projects.length).padStart(2, "0")}</p>
      </section>

      <section className="section section--work" aria-labelledby="selected-work">
        <div className="section-heading">
          <Eyebrow>精选作品 / Selected Work</Eyebrow>
          <h2 id="selected-work">让产品进入<br />真实的情绪。</h2>
        </div>
        <WorkGrid selected />
        <a className="text-link section-link" href={path("work/")}>
          查看全部 {projects.length} 组作品 <span aria-hidden="true">↘</span>
        </a>
      </section>

      <section className="statement" aria-label="创作理念">
        <p>以光影、构图与镜头语言，服务故事、品牌与产品。</p>
        <span lang="en">Light, texture, motion.</span>
      </section>
    </Layout>
  );
}

function Work() {
  useMetadata(
    "作品｜林键明 JIMMY",
    "林键明 JIMMY 的广告 TVC、产品影像、品牌短片与人物采访作品。",
  );
  return (
    <Layout>
      <section className="page-intro">
        <Eyebrow>01 — 作品 / Work</Eyebrow>
        <h1>从静帧开始，<br />进入完整画面。</h1>
        <p>收录广告 TVC、产品影像、品牌短片与人物采访。点击任一静帧进入图集；匹配到视频的项目可直接播放本地网页影片。</p>
      </section>
      <section className="section section--work section--work-page">
        <WorkGrid />
      </section>
    </Layout>
  );
}

function ProjectVideo({ project, video }: { project: Project; video?: ProjectVideo }) {
  const [playing, setPlaying] = useState(false);
  const source = video?.src ?? project.videoUrl;
  const poster = video?.poster ? asset(video.poster) : asset(project.images[0]);
  const title = video?.title ?? `${project.title} 影片`;
  const titleEn = video?.titleEn ?? "Film";

  if (!source) {
    return (
      <section className="project-video project-video--pending" aria-label="影片播放状态">
        <p className="project-video__kicker">影片 / Film</p>
        <strong>当前项目先展示静帧</strong>
        <p>该项目暂未匹配到视频文件，先通过静帧了解画面方向。</p>
      </section>
    );
  }

  if (playing) {
    if (source.startsWith("videos/")) {
      return (
        <div className="project-video project-video--local">
          <video controls autoPlay playsInline preload="metadata" poster={poster}>
            <source src={path(source)} type="video/mp4" />
            当前浏览器不支持 HTML5 视频播放。
          </video>
          <p className="project-video__caption">{title} <span lang="en">{titleEn}</span></p>
        </div>
      );
    }
    return (
      <div className="project-video">
        <iframe
          src={source}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      className="project-video project-video--poster"
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`播放 ${title}`}
    >
      <img src={poster} alt="" />
      <span>播放影片 <i>{titleEn}</i></span>
    </button>
  );
}

function ProjectPage({ project }: { project: Project }) {
  useMetadata(
    `${project.title}｜林键明 JIMMY`,
    `${project.title}：${project.description}`,
  );
  return (
    <Layout>
      <article className="project">
        <div className="project__heading">
          <a className="back-link" href={path("work/")}><span aria-hidden="true">←</span> 返回作品列表</a>
          <Eyebrow>{project.year} · {project.type}</Eyebrow>
          <h1>{project.title}</h1>
          <p className="project__title-en" lang="en">{project.titleEn}</p>
          <p>{project.description}</p>
        </div>

        <figure className="project__lead-image">
          <img
            src={asset(project.images[0])}
            alt={`${project.title} 主视觉静帧`}
            fetchPriority="high"
            decoding="async"
            sizes="100vw"
          />
        </figure>

        <section className="project-films" aria-label={`${project.title} 影片`}>
          <div className="project-films__heading">
            <Eyebrow>影片 / Films</Eyebrow>
            <p>先看静帧，再点击画面播放完整视频。</p>
          </div>
          <div className="project-films__grid">
            {project.videos?.length
              ? project.videos.map((video) => <ProjectVideo key={video.src} project={project} video={video} />)
              : <ProjectVideo project={project} />}
          </div>
        </section>

        <div className="project__information">
          <div>
            <Eyebrow>项目信息 / Credits</Eyebrow>
            <p className="project__role">{project.role}</p>
            <p className="project__client">客户：{project.client}</p>
          </div>
          <dl>
            <div><dt>导演 <span>Director</span></dt><dd>{project.director}</dd></div>
            <div><dt>摄影 <span>Cinematographer</span></dt><dd>{project.cinematographer}</dd></div>
            <div><dt>制作公司 <span>Production</span></dt><dd>{project.production}</dd></div>
            <div><dt>客户 <span>Client</span></dt><dd>{project.client}</dd></div>
            <div><dt>摄影机 <span>Camera</span></dt><dd>{project.camera}</dd></div>
            <div><dt>镜头 <span>Lenses</span></dt><dd>{project.lenses}</dd></div>
            <div><dt>年份 <span>Year</span></dt><dd>{project.year}</dd></div>
          </dl>
        </div>

        <section className="project__stills" aria-label={`${project.title} 项目静帧`}>
          {project.images.slice(1).map((image, index) => (
            <figure key={image} className={`project__still project__still--${index + 1}`}>
              <img
                src={asset(image)}
                alt={`${project.title} 项目静帧 ${index + 2}`}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 720px) 100vw, 66vw"
              />
            </figure>
          ))}
        </section>

        <div className="project__next">
          <a className="text-link" href={path("work/")}>浏览更多作品 <span aria-hidden="true">↘</span></a>
        </div>
      </article>
    </Layout>
  );
}

const experience = [
  {
    time: "2026.05 — 2026.07",
    title: "编导",
    company: "浙江麦瑞克科技有限公司",
    items: ["统筹视频项目规划、排期与跨部门协作。", "完成产品 TVC brief 对接、创意策划、分镜与 rundown 撰写，并跟进美术场景布置。", "负责 TVC 现场执行拍摄，并对接后期剪辑与交付。", "管理外部供应商，保障制作节奏与执行质量。"],
  },
  {
    time: "2026.02 — 2026.05",
    title: "编导",
    company: "深圳市小思科技有限公司",
    items: ["统筹视频项目整合规划。", "完成产品 TVC 策划、脚本方案、分镜与 rundown 撰写，跟进美术与场景。", "执行 TVC 现场拍摄，推进后期剪辑。", "负责供应商与外包团队的制作对接。"],
  },
  {
    time: "2023.09 — 2026.02",
    title: "摄影师",
    company: "深圳市乐其创新股份有限公司（SmallRig）",
    items: ["对接产品 TVC 需求，协助策划与分镜 rundown 制作。", "跟进美术场景布置，完成现场摄影执行与后期协同。", "与产品经理共同提炼和强化视频卖点。", "负责影棚器材管理与日常制作支持。"],
  },
  {
    time: "2020.12 — 2023.04",
    title: "摄影组负责人",
    company: "东方丝路（深圳）科技有限公司（ESR）",
    items: ["参与策划方案会议并提出影像优化建议。", "协助演员甄选、场景勘查与拍摄日程安排。", "组建 TVC 摄制团队，负责现场掌机与摄影执行。", "分配日常拍摄任务，与需求方沟通并管理影棚。"],
  },
  {
    time: "2020.06 — 2020.12",
    title: "摄影课程与跟组拍摄",
    company: "新片场摄影课程 · 电影组 / 广告组",
    items: ["完成系统摄影课程学习，并参与电影组、广告组现场跟组拍摄。"],
  },
  {
    time: "2019.06 — 2020.07",
    title: "摄影师",
    company: "深圳市源兴发科技有限公司",
    items: ["根据视频需求与产品卖点完成前期策划。", "完成道具准备、分镜撰写、现场布光、布景与摄制。", "跟进后期剪辑、调色与成片交付。"],
  },
];

function About() {
  useMetadata(
    "关于｜林键明 JIMMY",
    "林键明 JIMMY，深圳导演摄影师，拥有 8 年广告 TVC 影像创作与制作经验。",
  );
  return (
    <Layout>
      <section className="about-hero">
        <figure>
          <img src={asset("on-set.jpg")} alt="林键明所在的商业拍摄现场" fetchPriority="high" decoding="async" sizes="(max-width: 900px) 100vw, 45vw" />
          <figcaption>拍摄现场 / On set</figcaption>
        </figure>
        <div>
          <Eyebrow>02 — 关于 / About</Eyebrow>
          <h1>用画面，<br />承载感受。</h1>
          <p className="about-hero__intro">林键明 JIMMY，现居广东深圳，拥有 8 年广告 TVC 影像创作与制作经验。长期专注于以光影、构图和镜头语言服务品牌叙事与产品表达，项目覆盖专业摄影器材配件、OPPO、农夫山泉、美的，以及 3C 数码与母婴电商产品等领域。</p>
          <p className="about-hero__intro about-hero__intro--secondary">熟悉 ARRI Alexa、RED 等数字电影摄影机与灯光设计；重视团队协作和现场效率，在技术与美学之间寻找恰当平衡。</p>
        </div>
      </section>

      <section className="about-section about-section--experience">
        <Eyebrow>工作经历 / Experience</Eyebrow>
        <div className="timeline">
          {experience.map((item) => (
            <article key={`${item.time}-${item.company}`}>
              <p>{item.time}</p>
              <div>
                <h2>{item.title}</h2>
                <p>{item.company}</p>
                <ul>{item.items.map((detail) => <li key={detail}>{detail}</li>)}</ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-columns">
        <div>
          <Eyebrow>核心能力 / Skills</Eyebrow>
          <ul><li>广告 TVC 摄影与现场执行</li><li>光影设计、构图与镜头语言</li><li>创意策划、脚本与分镜 rundown</li><li>产品卖点提炼与视觉叙事</li><li>制作统筹、供应商与影棚管理</li></ul>
        </div>
        <div>
          <Eyebrow>设备经验 / Equipment</Eyebrow>
          <p>熟悉 ARRI Alexa、RED 等数字电影摄影机，以及商业拍摄的灯光设计与现场协同。</p>
          <Eyebrow>所在地 / Location</Eyebrow>
          <p>广东 · 深圳<br />Shenzhen, Guangdong, China</p>
          <Eyebrow>教育背景 / Education</Eyebrow>
          <p>本科</p>
        </div>
      </section>

      <section className="resume-section">
        <p>下载完整中文简历，了解详细经历与项目背景。</p>
        <a className="text-link" href={`${basePath}assets/JIMMY-resume.pdf`} download>下载简历 PDF <span aria-hidden="true">↓</span></a>
      </section>
    </Layout>
  );
}

function Contact() {
  useMetadata(
    "联系｜林键明 JIMMY",
    "联系林键明 JIMMY，获取作品与职业资料。",
  );
  return (
    <Layout>
      <section className="contact">
        <Eyebrow>03 — 联系 / Contact</Eyebrow>
        <h1>保持联系，<br />从画面开始。</h1>
        <div className="contact__links">
          <a href="mailto:987622735@qq.com"><span>邮箱 <i>Email</i></span>987622735@qq.com</a>
          <a href="tel:+8615918606378"><span>电话 <i>Phone</i></span>+86 159 1860 6378</a>
          <p><span>微信 <i>WeChat</i></span>请通过邮箱或电话联系</p>
          <p><span>Instagram</span>公开账号待补充</p>
          <p><span>Vimeo</span>公开账号待补充</p>
          <p><span>小红书 <i>Xiaohongshu</i></span>公开账号待补充</p>
        </div>
        <p className="contact__note">常驻广东深圳，可通过邮箱获取完整简历与作品资料。<br /><span lang="en">Based in Shenzhen, China.</span></p>
      </section>
    </Layout>
  );
}

function NotFound() {
  useMetadata("页面未找到｜林键明 JIMMY", "林键明 JIMMY 导演摄影师作品集。");
  return (
    <Layout>
      <section className="not-found">
        <Eyebrow>404</Eyebrow>
        <h1>这个画面<br />暂未收录。</h1>
        <a className="text-link" href={path()}>返回首页 <span aria-hidden="true">↗</span></a>
      </section>
    </Layout>
  );
}

function App() {
  const currentPath = getCurrentPath();
  const projectMatch = currentPath.match(/^\/work\/([^/]+)/);
  if (projectMatch) {
    const project = projectBySlug(projectMatch[1]);
    return project ? <ProjectPage project={project} /> : <NotFound />;
  }
  if (currentPath === "/work") return <Work />;
  if (currentPath === "/about") return <About />;
  if (currentPath === "/contact") return <Contact />;
  if (currentPath === "/") return <Home />;
  return <NotFound />;
}

createRoot(document.getElementById("root")!).render(<App />);
