import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { createRoot } from "react-dom/client";
import { categoryOptions, orderedProjects, projectBySlug, projects, type Project, type ProjectCategory, type ProjectVideo } from "./data/projects";
import "./styles.css";

const basePath = import.meta.env.BASE_URL;
const asset = (file: string) => `${basePath}images/${file}`;
const path = (route = "") => `${basePath}${route.replace(/^\//, "")}`;
const media = (file: string) => file.startsWith("videos/") ? path(file) : asset(file);

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

type PillNavItem = {
  label: string;
  labelEn?: string;
  href: string;
};

type PillNavProps = {
  logo?: React.ReactNode;
  logoAlt?: string;
  logoHref?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  theme?: "color" | "dark" | "light";
  initialLoadAnimation?: boolean;
};

function PillNav({
  logo,
  logoAlt = "首页",
  logoHref = path(),
  items,
  activeHref,
  className = "",
  ease = "power2.easeOut",
  baseColor = "#061a12",
  pillColor = "#e4c45b",
  hoveredPillTextColor = "#061a12",
  pillTextColor = "#f2f4ec",
  theme = "color",
  initialLoadAnimation = false,
}: PillNavProps) {
  const style = {
    "--pill-base": baseColor,
    "--pill-fill": pillColor,
    "--pill-hover-text": hoveredPillTextColor,
    "--pill-text": pillTextColor,
    "--pill-ease": ease === "linear" ? "linear" : "cubic-bezier(.22, 1, .36, 1)",
  } as CSSProperties;

  return (
    <nav
      className={`pill-nav pill-nav--${theme}${initialLoadAnimation ? " pill-nav--enter" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      aria-label="主导航"
    >
      <a className="pill-nav__brand" href={logoHref} aria-label={logoAlt}>
        {logo ?? (
          <>
            <span>林键明 <b>JIMMY</b></span>
            <small>导演摄影师 / Director & Cinematographer</small>
          </>
        )}
      </a>
      <div className="pill-nav__items">
        {items.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <a
              className={`pill-nav__pill${isActive ? " is-active" : ""}${item.label === "联系我" ? " pill-nav__pill--contact" : ""}`}
              href={item.href}
              key={item.href}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.label}</span>
              {item.labelEn && <small lang="en">{item.labelEn}</small>}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function Header() {
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const nextFloating = window.scrollY > Math.max(window.innerHeight * .82, 520);
        setFloating((current) => current === nextFloating ? current : nextFloating);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const currentPath = getCurrentPath();
  const activeHref = currentPath === "/"
    ? path()
    : currentPath.startsWith("/work")
      ? path("work/")
      : currentPath.startsWith("/about")
        ? path("about/")
        : currentPath.startsWith("/contact")
          ? path("contact/")
          : undefined;

  return (
    <header className={`site-header${floating ? " site-header--floating" : ""}`}>
      <PillNav
        logoAlt="林键明 JIMMY 首页"
        items={[
          { label: "首页", labelEn: "Home", href: path() },
          { label: "作品", labelEn: "Work", href: path("work/") },
          { label: "经历", labelEn: "About", href: path("about/") },
          { label: "联系我", labelEn: "Contact", href: path("contact/") },
        ]}
        activeHref={activeHref}
        className="site-pill-nav"
        ease="power2.easeOut"
        baseColor="#061a12"
        pillColor="#e4c45b"
        hoveredPillTextColor="#061a12"
        pillTextColor="#f2f4ec"
        theme="color"
        initialLoadAnimation={false}
      />
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
  const currentPath = getCurrentPath();
  // The Work intro already has a video layer; avoid stacking a second full-screen canvas there.
  const hasPageBackdrop = currentPath !== "/" && currentPath !== "/work";

  return (
    <>
      <a className="skip-link" href="#content">跳至正文</a>
      {hasPageBackdrop && <PageBackdrop />}
      <Header />
      <main id="content">{children}</main>
      <Footer />
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

type SplitTextProps = {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  id?: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words";
  from?: { opacity?: number; y?: number };
  to?: { opacity?: number; y?: number };
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
};

function SplitText({
  text,
  as = "span",
  id,
  className = "",
  delay = 90,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign,
  onLetterAnimationComplete,
  showCallback = true,
}: SplitTextProps) {
  const textRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const parts = splitType === "words" ? text.split(/(\s+)/) : Array.from(text);
  const easing = ease === "linear" ? "linear" : "cubic-bezier(.22, 1, .36, 1)";

  useEffect(() => {
    const node = textRef.current;
    if (!node) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold, rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (!visible || !onLetterAnimationComplete || !showCallback) return undefined;
    const timeout = window.setTimeout(
      onLetterAnimationComplete,
      Math.max(0, (parts.length - 1) * delay + duration * 1000),
    );
    return () => window.clearTimeout(timeout);
  }, [delay, duration, onLetterAnimationComplete, parts.length, showCallback, visible]);

  const style = {
    "--split-text-align": textAlign,
    "--split-duration": `${duration}s`,
    "--split-delay": `${delay}ms`,
    "--split-from-opacity": from.opacity ?? 0,
    "--split-to-opacity": to.opacity ?? 1,
    "--split-y": `${from.y ?? 40}px`,
    "--split-ease": easing,
  } as CSSProperties;
  const Tag = as;

  return (
    <Tag
      ref={(node) => { textRef.current = node; }}
      id={id}
      className={`split-text${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      aria-label={text}
    >
      {parts.map((part, index) => {
        if (part === "\n") return <br key={`line-${index}`} />;
        const content = part.trim() === "" ? part.replace(/ /g, "\u00a0") : part;
        return (
          <span
            className={`split-text__char${part.trim() === "" ? " split-text__space" : ""}`}
            key={`${part}-${index}`}
            style={{ "--split-index": index } as CSSProperties}
            aria-hidden="true"
          >
            {content}
          </span>
        );
      })}
    </Tag>
  );
}

type ColorBendsProps = {
  rotation?: number;
  speed?: number;
  colors?: string[];
  transparent?: boolean;
  autoRotate?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
};

const colorBendsPalette = ["#7cff67", "#d58400", "#b51a00"];

function colorWithAlpha(color: string, alpha: number) {
  const value = color.replace("#", "");
  const hex = value.length === 3
    ? value.split("").map((part) => `${part}${part}`).join("")
    : value;
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function ColorBends({
  rotation = 75,
  speed = 0.15,
  colors = ["#7cff67", "#d58400", "#b51a00"],
  transparent = true,
  autoRotate = 1,
  scale = 2,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 0.7,
  parallax = 0.6,
  noise = 0.15,
}: ColorBendsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let frame = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let isIntersecting = true;
    let documentVisible = document.visibilityState === "visible";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 720px)");
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: 0.5, y: 0.5 };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, compactViewport.matches ? 1 : 1.25);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const updatePointer = (event: PointerEvent) => {
      pointer.x = event.clientX / Math.max(window.innerWidth, 1);
      pointer.y = event.clientY / Math.max(window.innerHeight, 1);
    };

    const schedule = () => {
      if (!reducedMotion.matches && isIntersecting && documentVisible && !frame) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const draw = (time: number) => {
      frame = 0;
      if (!isIntersecting || !documentVisible) return;
      const delta = Math.min(time - lastTime, 40);
      lastTime = time;
      elapsed += delta * 0.001 * speed;
      context.clearRect(0, 0, width, height);
      if (!transparent) {
        context.fillStyle = "#061a12";
        context.fillRect(0, 0, width, height);
      }

      const pointerX = (pointer.x - 0.5) * mouseInfluence * width * 0.16;
      const pointerY = (pointer.y - 0.5) * mouseInfluence * height * 0.16;
      const bendScale = Math.max(0.58, 0.72 + (scale - 1) * 0.16);
      const centerX = width / 2 + pointerX * parallax;
      const centerY = height / 2 + pointerY * parallax;

      context.save();
      context.translate(centerX, centerY);
      context.rotate((rotation * Math.PI) / 180 + elapsed * autoRotate * 0.1);
      context.scale(bendScale, bendScale);
      context.globalCompositeOperation = "screen";
      context.lineCap = "round";

      colors.forEach((color, index) => {
        const offset = index - (colors.length - 1) / 2;
        const phase = elapsed * (0.75 + index * 0.16) + index * 1.9;
        const ribbonWidth = Math.max(34, height * (0.13 + noise * 0.08));
        const startY = offset * height * 0.3;
        const drawRibbon = (phaseOffset: number, alpha: number, blur: number) => {
          context.save();
          context.filter = `blur(${blur}px)`;
          context.strokeStyle = colorWithAlpha(color, alpha);
          context.lineWidth = ribbonWidth;
          context.beginPath();
          for (let step = 0; step <= 28; step += 1) {
            const progress = step / 28;
            const x = -width * 1.35 + progress * width * 2.7;
            const wave = Math.sin(progress * Math.PI * 2 * frequency + phase + phaseOffset) * height * 0.16 * warpStrength;
            const curl = Math.cos(progress * Math.PI * 4 + phase * 0.8 + phaseOffset) * height * 0.055 * warpStrength;
            const y = startY + wave + curl;
            if (step === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.stroke();
          context.restore();
        };

        drawRibbon(0, 0.48, 18 + noise * 18);
        drawRibbon(0.8, 0.2, 7 + noise * 10);
      });

      if (noise > 0) {
        context.globalCompositeOperation = "source-over";
        context.fillStyle = colorWithAlpha("#f2f4ec", Math.min(0.08, noise * 0.24));
        const particleCount = compactViewport.matches ? 34 : 70;
        for (let index = 0; index < particleCount; index += 1) {
          const x = ((index * 73.17 + elapsed * 8) % (width * 2)) - width;
          const y = ((index * 41.93 + elapsed * 3) % (height * 2)) - height;
          context.fillRect(x, y, 0.7, 0.7);
        }
      }
      context.restore();
      schedule();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) schedule();
      else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { threshold: 0 });
    visibilityObserver.observe(canvas);
    const onDocumentVisibility = () => {
      documentVisible = document.visibilityState === "visible";
      if (documentVisible) schedule();
      else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    document.addEventListener("visibilitychange", onDocumentVisibility);
    if (finePointer) window.addEventListener("pointermove", updatePointer, { passive: true });
    draw(performance.now());

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onDocumentVisibility);
      if (finePointer) window.removeEventListener("pointermove", updatePointer);
    };
  }, [autoRotate, colors, frequency, mouseInfluence, noise, parallax, rotation, scale, speed, transparent, warpStrength]);

  return <canvas ref={canvasRef} className="color-bends" aria-hidden="true" />;
}

function PageBackdrop() {
  return (
    <div className="page-backdrop" aria-hidden="true">
      <ColorBends
        rotation={75}
        speed={0.15}
        colors={colorBendsPalette}
        transparent
        autoRotate={1}
        scale={2}
        frequency={1}
        warpStrength={1}
        mouseInfluence={0.7}
        parallax={0.6}
        noise={0.15}
      />
      <span className="page-backdrop__shade" />
    </div>
  );
}

function WorkCard({ project, index }: { project: Project; index: number }) {
  const [previewing, setPreviewing] = useState(false);
  const previewVideo = project.videos?.find((video) => video.src.startsWith("videos/"));
  const previewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;

    if (!previewing) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    video.currentTime = 0;
    void video.play().catch(() => undefined);
    const stopPreview = window.setTimeout(() => setPreviewing(false), 4500);
    return () => window.clearTimeout(stopPreview);
  }, [previewing]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <a
      className={`work-card work-card--${(index % 3) + 1}`}
      href={path(`work/${project.slug}/`)}
      key={project.slug}
      aria-label={`查看 ${project.title} 图集与影片`}
      onPointerEnter={() => setPreviewing(true)}
      onPointerLeave={() => setPreviewing(false)}
      onFocus={() => setPreviewing(true)}
      onBlur={() => setPreviewing(false)}
      onPointerMove={handlePointerMove}
    >
      <img
        className="work-card__image"
        src={asset(project.images[0])}
        alt={`${project.title} 项目静帧`}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
      />
      {previewVideo ? (
      <video
          className="work-card__preview"
          ref={previewRef}
          muted
          playsInline
          preload={previewing ? "metadata" : "none"}
          poster={asset(project.images[0])}
          aria-hidden="true"
        >
          <source src={path(previewVideo.src)} type="video/mp4" />
        </video>
      ) : null}
      <span className="work-card__veil" aria-hidden="true" />
      <span className="work-card__spotlight" aria-hidden="true" />
      <span className="work-card__copy">
        <strong>{project.title}</strong>
        <small lang="en">{project.titleEn}</small>
        <em>{categoryOptions.find((option) => option.id === project.category)?.label} · {project.year} · {project.role}</em>
      </span>
      <span className="work-card__action">查看作品 <i>{previewVideo ? "悬停预览 4 秒" : "查看静帧"}</i></span>
    </a>
  );
}

function WorkGrid({ items = projects }: { items?: Project[] }) {
  return (
    <div className="work-grid">
      {items.map((project, index) => <WorkCard key={project.slug} project={project} index={index} />)}
    </div>
  );
}

const capabilityCards = [
  { index: "01", title: "制片统筹", titleEn: "Production Management", text: "负责项目立项与 Brief 对接，统筹预算、质量与制作节奏；组建摄制团队，推进场地与模特协调，衔接后期剪辑、TC 审核与最终交片。" },
  { index: "02", title: "导演执行", titleEn: "Directing & Execution", text: "从前期分镜到现场调度，保持节奏、质量与团队协作。" },
  { index: "03", title: "影视摄影", titleEn: "Cinematic Lighting", text: "用人物、场景、光线、和镜头运动建立有情绪的视觉秩序。" },
  { index: "04", title: "产品叙事", titleEn: "Product Storytelling", text: "把复杂功能转译成清晰、张扬、具有记忆点的画面。" },
];

const profileBehindScenes = [
  { src: "on-set.jpg", alt: "美术空间内的摄制团队" },
  { src: "hero-on-set.jpg", alt: "街头移动拍摄现场" },
];

const heroReelVideos: ProjectVideo[] = Array.from(
  new Map(
    projects
      .flatMap((project) => project.videos ?? [])
      .filter((video) => video.src.startsWith("videos/"))
      .map((video) => [video.src, video]),
  ).values(),
);

function ProfileGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % profileBehindScenes.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="home-profile__visual" role="img" aria-label="林键明拍摄现场花絮">
      {profileBehindScenes.map((image, index) => (
        <img
          className={index === activeIndex ? "is-active" : ""}
          src={asset(image.src)}
          alt={image.alt}
          key={image.src}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
      <span>Profile / 02</span>
      <small aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(profileBehindScenes.length).padStart(2, "0")}</small>
    </div>
  );
}

function AboutBehindScenesGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % profileBehindScenes.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="about-hero__gallery" role="img" aria-label="林键明拍摄现场花絮轮播">
      {profileBehindScenes.map((image, index) => (
        <img
          className={index === activeIndex ? "is-active" : ""}
          src={asset(image.src)}
          alt={image.alt}
          key={image.src}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
      <span>On set / 02</span>
      <small aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(profileBehindScenes.length).padStart(2, "0")}</small>
    </div>
  );
}

function HeroReel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [readyToLoad, setReadyToLoad] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeVideo = heroReelVideos[activeIndex % heroReelVideos.length];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactViewport = window.matchMedia("(max-width: 720px)").matches;
  const saveData = "connection" in navigator
    && Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

  useEffect(() => {
    const timer = window.setTimeout(() => setReadyToLoad(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeVideo || !readyToLoad) return;

    let timer: number | undefined;
    const startPreview = () => {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
      timer = window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % heroReelVideos.length);
      }, 10000);
    };

    if (video.readyState >= 1) startPreview();
    else video.addEventListener("loadedmetadata", startPreview, { once: true });

    return () => {
      if (timer) window.clearTimeout(timer);
      video.pause();
      video.removeEventListener("loadedmetadata", startPreview);
    };
  }, [activeIndex, activeVideo, readyToLoad]);

  if (!activeVideo) return null;

  if (reducedMotion || compactViewport || saveData) {
    return <img className="hero__video hero__video--poster" src={media(activeVideo.poster)} alt="" aria-hidden="true" />;
  }

  return (
    <video
      className="hero__video"
      key={activeVideo.src}
      ref={videoRef}
      muted
      playsInline
      preload={readyToLoad ? "metadata" : "none"}
      poster={media(activeVideo.poster)}
      aria-hidden="true"
      onEnded={() => setActiveIndex((current) => (current + 1) % heroReelVideos.length)}
    >
      <source src={path(activeVideo.src)} type="video/mp4" />
    </video>
  );
}

function Home() {
  useMetadata(
    "林键明 JIMMY｜导演摄影师作品集",
    "林键明 JIMMY，深圳导演摄影师。以光影、构图与镜头节奏完成广告、产品与人物影像。",
  );

  return (
    <Layout>
      <section className="hero">
        <HeroReel />
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__content">
          <Eyebrow>导演摄影师 / Director & Cinematographer · 深圳 Shenzhen</Eyebrow>
          <SplitText as="h1" text="林键明" delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
          <p className="hero__name" lang="en">JIMMY</p>
          <p className="hero__role">导演摄影师 <span>Director & Cinematographer</span></p>
          <p className="hero__statement">擅长以光影、构图与镜头节奏，把产品功能转化为有情绪的视觉叙事。</p>
          <p className="hero__production">TVC 项目全流程制片能力，能够统筹预算、人员、资源与制作进度，在合理成本内保障拍摄执行与成片品质，并按节点高效推进项目落地。</p>
          <div className="hero__actions">
            <a className="hero__button" href={path("contact/")}>联系我 <span>Contact</span></a>
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

      <section className="section home-profile" id="profile" aria-labelledby="profile-title">
        <div className="home-profile__bends" aria-hidden="true">
          <ColorBends
            rotation={75}
            speed={0.15}
            colors={colorBendsPalette}
            transparent
            autoRotate={1}
            scale={2}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0.7}
            parallax={0.6}
            noise={0.15}
          />
          <span className="home-profile__bends-shade" />
        </div>
        <ProfileGallery />
        <div className="home-profile__body">
          <Eyebrow>个人经历 / Profile</Eyebrow>
          <SplitText as="h2" id="profile-title" text={"让每一个镜头\n都有明确的呼吸。"} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
          <p>林键明 JIMMY，现居广东深圳，拥有 8 年广告 TVC 影像创作与制作经验。长期专注于产品影像、品牌短片与人物内容，从前期策划、分镜到现场摄影，建立完整而高效的视觉工作流程。</p>
          <div className="home-profile__facts">
            <div><strong>8+</strong><span>年影像经验<br /><i>Years in image-making</i></span></div>
            <div><strong>深圳</strong><span>常驻城市<br /><i>Based in Shenzhen</i></span></div>
          </div>
          <div className="profile-contact">
            <a href="mailto:987622735@qq.com">987622735@qq.com <span>Email ↗</span></a>
            <a href="tel:+8615918606378">+86 159 1860 6378 <span>Phone ↗</span></a>
          </div>
          <a className="text-link" href={path("about/")}>查看完整经历 <span aria-hidden="true">↘</span></a>
        </div>
      </section>

      <section className="section section--work home-selected" id="selected-projects" aria-labelledby="selected-work">
        <div className="section-heading">
          <Eyebrow>精选作品 / Selected Work</Eyebrow>
          <SplitText as="h2" id="selected-work" text={"画面服务产品，\n影像传播品牌。"} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
        </div>
        <WorkGrid items={orderedProjects.slice(0, 6)} />
        <a className="text-link section-link" href={path("work/")}>
          查看全部 {projects.length} 组作品 <span aria-hidden="true">↘</span>
        </a>
      </section>

      <section className="section home-capabilities" aria-labelledby="capabilities-title">
        <div className="section-heading">
          <Eyebrow>个人评价 / Capabilities</Eyebrow>
          <SplitText as="h2" id="capabilities-title" text={"我如何把想法\n变成画面。"} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
        </div>
        <div className="capability-grid">
          {capabilityCards.map((card) => (
            <article className="capability-card" key={card.index}>
              <span className="capability-card__index">{card.index}</span>
              <SplitText as="h3" text={card.title} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
              <small lang="en">{card.titleEn}</small>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-contact" id="contact" aria-labelledby="home-contact-title">
        <div className="home-contact__inner">
          <Eyebrow>保持联系 / Contact</Eyebrow>
          <SplitText as="h2" id="home-contact-title" text={"从下一帧开始，\n保持联系。"} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
          <div className="home-contact__bottom">
            <div>
              <a href="mailto:987622735@qq.com">987622735@qq.com</a>
              <a href="tel:+8615918606378">+86 159 1860 6378</a>
            </div>
            <a className="hero__button hero__button--dark" href={path("contact/")}>进入联系页 <span>Contact</span></a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Work() {
  const [activeCategory, setActiveCategory] = useState<"all" | ProjectCategory>("all");
  const visibleProjects = activeCategory === "all"
    ? orderedProjects
    : orderedProjects.filter((project) => project.category === activeCategory);

  useMetadata(
    "作品｜林键明 JIMMY",
    "林键明 JIMMY 的广告 TVC、产品影像、品牌短片与人物采访作品。",
  );
  return (
    <Layout>
      <section className="page-intro page-intro--video">
        <div className="page-intro__backdrop" aria-hidden="true">
          <HeroReel />
          <span className="page-intro__shade" />
        </div>
        <Eyebrow>01 — 作品 / Work</Eyebrow>
        <SplitText as="h1" text={"从静帧开始，\n进入完整画面。"} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
        <p>按创作方向浏览作品。每个项目先以静帧呈现，进入详情页即可观看对应影片。</p>
      </section>
      <section className="section section--work section--work-page">
        <div className="category-filter" role="tablist" aria-label="作品分类">
          {categoryOptions.map((category) => (
            <button
              className={activeCategory === category.id ? "is-active" : ""}
              key={category.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              <span>{category.label}</span>
              <small lang="en">{category.labelEn}</small>
            </button>
          ))}
        </div>
        <p className="category-filter__count">{visibleProjects.length} 组作品 / {visibleProjects.length} projects</p>
        <WorkGrid items={visibleProjects} />
      </section>
    </Layout>
  );
}

function ProjectVideo({ project, video }: { project: Project; video?: ProjectVideo }) {
  const [playing, setPlaying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const source = video?.src ?? project.videoUrl;
  const poster = video?.poster ? media(video.poster) : asset(project.images[0]);
  const title = video?.title ?? `${project.title} 影片`;
  const titleEn = video?.titleEn ?? "Film";
  const videoShapeClass = ["nongfu", "oppo", "midea"].includes(project.slug) ? " project-video--vertical" : "";
  const canPreview = source?.startsWith("videos/") ?? false;

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !previewing || playing) return undefined;

    preview.currentTime = 0;
    void preview.play().catch(() => undefined);
    const stopPreview = window.setTimeout(() => setPreviewing(false), 4500);
    return () => window.clearTimeout(stopPreview);
  }, [playing, previewing]);

  useEffect(() => {
    if (!previewing && previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
  }, [previewing]);

  if (!source) {
    return (
      <section className="project-video project-video--pending" aria-label="影片播放状态">
        <p className="project-video__kicker">影片 / Film</p>
        <strong>当前项目先展示静帧</strong>
        <p>该项目暂未匹配到视频文件，先通过静帧了解画面方向。</p>
      </section>
    );
  }

  if (source.startsWith("https://www.amazon.com/live/")) {
    return (
      <a
        className="project-video project-video--poster project-video--external"
        href={source}
        target="_blank"
        rel="noreferrer"
        aria-label={`在 Amazon Live 播放 ${title}`}
      >
      <img
        src={poster}
        alt={`${project.title} 视频封面`}
        loading="lazy"
        decoding="async"
      />
        <span>在 Amazon Live 播放 <i>Open video ↗</i></span>
      </a>
    );
  }

  if (playing) {
    if (source.startsWith("videos/")) {
      return (
        <div className={`project-video project-video--local${videoShapeClass}`}>
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
      className={`project-video project-video--poster${videoShapeClass}${previewing ? " is-previewing" : ""}`}
      type="button"
      onClick={() => { setPreviewing(false); setPlaying(true); }}
      onPointerEnter={() => { if (canPreview) setPreviewing(true); }}
      onPointerLeave={() => setPreviewing(false)}
      onFocus={() => { if (canPreview) setPreviewing(true); }}
      onBlur={() => setPreviewing(false)}
      aria-label={`播放 ${title}`}
    >
      <img
        className="project-video__poster-image"
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
      />
      {previewing && canPreview ? (
        <video className="project-video__preview" ref={previewRef} muted playsInline preload="metadata" aria-hidden="true">
          <source src={path(source)} type="video/mp4" />
        </video>
      ) : null}
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
          <SplitText as="h1" text={project.title} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
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

        <section className="project-films project-films--compact" aria-label={`${project.title} 影片`}>
          <div className="project-films__heading">
            <Eyebrow>影片 / Films</Eyebrow>
            <p>先看封面，悬停预览 4 秒，点击画面播放完整视频。</p>
          </div>
          <div className="project-films__grid">
            {project.videos?.length
              ? project.videos.map((video) => <ProjectVideo key={video.src} project={project} video={video} />)
              : <ProjectVideo project={project} />}
          </div>
        </section>

        <div className="project__meta" aria-label="作品信息">
          <div><span>分类 <i>Category</i></span><strong>{categoryOptions.find((option) => option.id === project.category)?.label}</strong></div>
          <div><span>职务 <i>Role</i></span><strong>{project.role}</strong></div>
          <div><span>年份 <i>Year</i></span><strong>{project.year}</strong></div>
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
          <AboutBehindScenesGallery />
          <figcaption>拍摄现场 / On set</figcaption>
        </figure>
        <div>
          <Eyebrow>02 — 关于 / About</Eyebrow>
          <SplitText as="h1" text={"用画面，\n承载感受。"} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
          <p className="about-hero__intro">林键明 JIMMY，现居广东深圳，拥有 8 年广告 TVC 影像创作与制作经验。长期专注于以光影、构图和镜头语言服务品牌叙事与产品表达，项目覆盖健身器械、小家电、专业摄影器材配件、OPPO、农夫山泉、美的，以及 3C 数码与母婴电商产品等领域。</p>
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
                <SplitText as="h2" text={item.title} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
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
        <SplitText as="h1" text={"保持联系，\n从画面开始。"} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
        <div className="contact__links">
          <a href="mailto:987622735@qq.com"><span>邮箱 <i>Email</i></span>987622735@qq.com</a>
          <a href="tel:+8615918606378"><span>电话 <i>Phone</i></span>+86 159 1860 6378</a>
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
        <SplitText as="h1" text={"这个画面\n暂未收录。"} delay={90} duration={1.25} ease="power3.out" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" />
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
