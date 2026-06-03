(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /** Foxfolio 风格：悬停时字母阶梯上滚，下方橘色字顶替 */
  function initRollingLinks(root) {
    const scope = root || document;
    scope.querySelectorAll(".rolling-link[data-text]").forEach((link) => {
      if (link.dataset.rollingInit === "true") return;
      const text = link.getAttribute("data-text") || link.textContent.trim();
      if (!text) return;
      link.dataset.rollingInit = "true";
      link.setAttribute("aria-label", text);
      link.innerHTML = "";

      [...text].forEach((char, index) => {
        const span = document.createElement("span");
        span.className = "letter";
        span.setAttribute("data-letter", char);
        span.textContent = char === " " ? "\u00a0" : char;
        if (char === " ") span.style.width = "0.3em";
        span.style.transitionDelay = `${index * 0.025}s`;
        link.appendChild(span);
      });
    });
  }

  initRollingLinks();

  /**
   * 首页鼠标拖尾：Foxfolio 式密集叠放（约 2/3 重叠、轻透明、队尾渐隐）
   * 图片池：自动收集站内所有 assets/ 项目图，与作品集保持一致
   */
  function collectTrailImages() {
    const seen = new Set();
    const list = [];
    const skip = new Set(["assets/hero-nebula.png"]);

    function add(src) {
      const clean = (src || "").split("?")[0];
      if (
        !clean ||
        !clean.startsWith("assets/") ||
        skip.has(clean) ||
        clean.includes("/source/") ||
        seen.has(clean)
      ) {
        return;
      }
      seen.add(clean);
      list.push(clean);
    }

    document.querySelectorAll('img[src^="assets/"]').forEach((img) => {
      add(img.getAttribute("src"));
    });

    document.querySelectorAll("[data-work-slideshow]").forEach((root) => {
      const count = Number(root.dataset.slideCount) || 0;
      const base = root.dataset.slideBase || "";
      for (let i = 1; i <= count; i += 1) {
        add(`${base}${String(i).padStart(2, "0")}.png`);
      }
    });

    for (let i = 1; i <= 4; i += 1) {
      add(`assets/portfolio/unipass/${i}.png`);
    }

    if (list.length) return list;

    return [
      "assets/portfolio/mango-tab/01.png",
      "assets/portfolio/mango-tab/02.png",
      "assets/portfolio/mango-tab/03.png",
      "assets/portfolio/mango-tab/04.png",
      "assets/portfolio/mango-tab/05.png",
      "assets/works/unipass/slides/01.png",
      "assets/hardware/aura/hero-01.png",
      "assets/hardware/bond/hero-home.png",
      "assets/hardware/safety/hero-home.png",
    ];
  }

  function initMouseTrail(hero, layer) {
    const images = collectTrailImages();

    images.forEach((src) => {
      const preload = new Image();
      preload.decoding = "async";
      preload.src = src;
    });

    const items = [];
    let imgSerial = 0;
    let lastSpawn = { x: 0, y: 0 };
    let spawnReady = false;
    let leaving = false;

    /** 约 2/3 重叠：步长 ≈ 图片宽度的 30% */
    const STEP_RATIO = 0.3;
    const MAX_ITEMS = 16;
    const MAX_SPAWN_PER_FRAME = 6;
    const LIFE_MS = 720;
    const FADE_MS = 280;
    const LEAVE_LIFE_MS = 380;
    const BASE_OPACITY = 0.88;
    let trailW = 180;
    let trailH = 225;
    let stride = 54;

    function measureTrail() {
      const probe = document.createElement("div");
      probe.className = "trail-image-wrap";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      layer.appendChild(probe);
      trailW = probe.offsetWidth;
      trailH = probe.offsetHeight;
      probe.remove();
      stride = Math.max(36, trailW * STEP_RATIO);
    }

    measureTrail();
    window.addEventListener("resize", measureTrail, { passive: true });

    function strideForDirection(dx, dy) {
      const dist = Math.hypot(dx, dy) || 1;
      const cos = Math.abs(dx / dist);
      const sin = Math.abs(dy / dist);
      return Math.max(36, (trailW * cos + trailH * sin) * STEP_RATIO);
    }

    function stamp(x, y) {
      while (items.length >= MAX_ITEMS && items[0]) {
        items[0].el.remove();
        items.shift();
      }

      const wrap = document.createElement("div");
      wrap.className = "trail-image-wrap";

      const img = document.createElement("img");
      img.src = images[imgSerial % images.length];
      img.alt = "";
      img.className = "trail-image";
      img.decoding = "async";
      wrap.appendChild(img);

      layer.appendChild(wrap);
      imgSerial += 1;

      const jitterX = (Math.random() - 0.5) * 14;
      const jitterY = (Math.random() - 0.5) * 22;
      const rot = (Math.random() - 0.5) * 4.5;

      const item = {
        el: wrap,
        x: x + jitterX,
        y: y + jitterY,
        rot,
        opacity: 1,
        z: imgSerial,
        born: performance.now(),
      };

      items.push(item);

      wrap.style.zIndex = String(item.z);
      wrap.style.opacity = String(BASE_OPACITY);
      wrap.style.transform =
        `translate3d(${item.x}px, ${item.y}px, 0) translate(-50%, -50%) rotate(${item.rot}deg)`;
    }

    function stampAlong(px, py) {
      let sx = lastSpawn.x;
      let sy = lastSpawn.y;
      let dx = px - sx;
      let dy = py - sy;
      let dist = Math.hypot(dx, dy);
      const step = strideForDirection(dx, dy);

      if (dist < step * 0.25) return;

      const ux = dx / dist;
      const uy = dy / dist;
      let n = 0;

      while (dist >= step && n < MAX_SPAWN_PER_FRAME) {
        sx += ux * step;
        sy += uy * step;
        stamp(sx, sy);
        dist -= step;
        n += 1;
      }

      lastSpawn = { x: sx, y: sy };
    }

    function applyLifetime() {
      const now = performance.now();
      const life = leaving ? LEAVE_LIFE_MS : LIFE_MS;
      let write = 0;

      for (let read = 0; read < items.length; read += 1) {
        const item = items[read];
        const age = now - item.born;

        if (age >= life) {
          item.el.remove();
          continue;
        }

        let alpha = 1;
        const fadeStart = life - FADE_MS;
        if (age > fadeStart) {
          const t = 1 - (age - fadeStart) / FADE_MS;
          alpha = t * t;
        }

        item.opacity = alpha;
        item.el.style.opacity = String(alpha * BASE_OPACITY);
        items[write] = item;
        write += 1;
      }
      items.length = write;
    }

    function tick() {
      applyLifetime();
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    hero.addEventListener(
      "mousemove",
      (e) => {
        const rect = hero.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        leaving = false;

        if (!spawnReady) {
          lastSpawn = { x: px, y: py };
          spawnReady = true;
          stamp(px, py);
          return;
        }

        stampAlong(px, py);
      },
      { passive: true }
    );

    hero.addEventListener("mouseleave", () => {
      spawnReady = false;
      leaving = true;
    });
  }

  const hero = document.getElementById("hero");
  const trailLayer = document.getElementById("mouse-trail-layer");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateTime() {
    const el = document.getElementById("current-time");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString("zh-CN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  updateTime();
  setInterval(updateTime, 60000);

  /** 展映集卡片：默认第 1 张，悬停时依次轮播第 2、3… 张 */
  function initPortfolioHoverCycle() {
    document.querySelectorAll("[data-portfolio-cycle]").forEach((card) => {
      const imgs = [...card.querySelectorAll(".portfolio-cycle-img")];
      const intervalMs = Number(card.dataset.cycleMs) || 1400;
      let timer = null;
      let slidePtr = 0;
      let hoverSlides = [];

      function markImageState(img) {
        const ok = img.complete && img.naturalWidth > 0;
        img.classList.toggle("is-missing", !ok);
        return ok;
      }

      imgs.forEach((img) => {
        if (img.complete) markImageState(img);
        img.addEventListener("load", () => markImageState(img));
        img.addEventListener("error", () => {
          img.classList.add("is-missing");
          const order = Number(img.dataset.cycleOrder);
          if (order === 0) {
            const fallback = card.classList.contains("portfolio-card--mobile")
              ? ""
              : "assets/mango-browser-ui.png";
            if (fallback) {
              img.src = fallback;
              img.classList.remove("is-missing");
            }
          }
        });
      });

      function buildHoverSlides() {
        return imgs
          .map((img, i) => ({ img, i }))
          .filter(({ img, i }) => i > 0 && !img.classList.contains("is-missing"));
      }

      function show(index) {
        imgs.forEach((img, i) => {
          img.classList.toggle("is-active", i === index);
        });
      }

      function stopCycle() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        slidePtr = 0;
        show(0);
      }

      function startCycle() {
        hoverSlides = buildHoverSlides();
        if (!hoverSlides.length) return;

        slidePtr = 0;
        show(hoverSlides[0].i);

        timer = setInterval(() => {
          slidePtr = (slidePtr + 1) % hoverSlides.length;
          show(hoverSlides[slidePtr].i);
        }, intervalMs);
      }

      card.addEventListener("mouseenter", startCycle);
      card.addEventListener("mouseleave", stopCycle);
      show(0);
    });
  }

  initPortfolioHoverCycle();

  /** 悬停自动滚动：iframe 网页 / 多页图片（展映集 2–4、实习项目 01） */
  function initEmbedScroll() {
    const IFRAME_W = 1280;
    const DEFAULT_IFRAME_H = 5800;
    const SCROLL_SPEED = 1.0;

    document.querySelectorAll("[data-embed-scroll]").forEach((root) => {
      const viewport = root.classList.contains("portfolio-embed-viewport")
        ? root
        : root.querySelector(".portfolio-embed-viewport");
      const scroller = viewport && viewport.querySelector(".portfolio-embed__scroller");
      if (!viewport || !scroller) return;

      const iframe = scroller.querySelector("iframe");
      const pages = [...scroller.querySelectorAll(".embed-page")];
      const isPages = pages.length > 0 && !iframe;
      if (!iframe && !isPages) return;

      let scrollY = 0;
      let rafId = 0;
      let hovering = false;
      let maxScroll = 0;

      function layout() {
        const vw = viewport.clientWidth;
        const vh = viewport.clientHeight;

        if (isPages) {
          pages.forEach((page) => {
            page.style.width = `${vw}px`;
            page.style.height = `${vh}px`;
          });
          scroller.style.width = `${vw}px`;
          scroller.style.height = `${pages.length * vh}px`;
          maxScroll = Math.max(0, (pages.length - 1) * vh);
        } else {
          const iframeH =
            Number(root.dataset.embedHeight) || DEFAULT_IFRAME_H;
          const scale = vw / IFRAME_W;
          const scaledH = iframeH * scale;
          maxScroll = Math.max(0, scaledH - vh);
          iframe.style.width = `${IFRAME_W}px`;
          iframe.style.height = `${iframeH}px`;
          iframe.style.transform = `scale(${scale})`;
          scroller.style.width = `${vw}px`;
          scroller.style.height = `${scaledH}px`;
        }

        scrollY = Math.min(scrollY, maxScroll);
        scroller.style.transform = `translate3d(0, ${-scrollY}px, 0)`;
      }

      function tick() {
        if (!hovering) return;

        if (maxScroll > 0) {
          scrollY += SCROLL_SPEED;
          if (scrollY >= maxScroll) {
            scrollY = 0;
          }
          scroller.style.transform = `translate3d(0, ${-scrollY}px, 0)`;
        }

        rafId = requestAnimationFrame(tick);
      }

      root.addEventListener("mouseenter", () => {
        hovering = true;
        layout();
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
      });

      root.addEventListener("mouseleave", () => {
        hovering = false;
        cancelAnimationFrame(rafId);
        scrollY = 0;
        scroller.style.transform = "translate3d(0, 0, 0)";
      });

      window.addEventListener("resize", layout, { passive: true });
      if (iframe) {
        iframe.addEventListener("load", layout);
      } else {
        pages.forEach((page) => {
          const img = page.querySelector("img");
          if (img) img.addEventListener("load", layout);
        });
      }
      layout();
    });
  }

  initEmbedScroll();

  /** 作品 iframe：超时或错误时显示同域 / 海外备用链接 */
  function initDemoEmbedFallback() {
    const TIMEOUT_MS = 14000;

    document.querySelectorAll("iframe[data-demo-embed]").forEach((iframe) => {
      const wrap = iframe.closest(
        ".portfolio-embed-viewport, .work-agent-phone__screen, .work-joblens-browser__body"
      );
      if (!wrap) return;

      wrap.classList.add("demo-embed-wrap");
      if (wrap.querySelector(".demo-embed-fallback")) return;

      const localHref = iframe.getAttribute("src") || "/demos/";
      const external = iframe.getAttribute("data-demo-external") || "";

      const fallback = document.createElement("div");
      fallback.className = "demo-embed-fallback";
      fallback.hidden = true;
      fallback.setAttribute("role", "status");

      const title = document.createElement("p");
      title.className = "demo-embed-fallback__title";
      title.textContent = "预览加载较慢或暂不可用";

      const hint = document.createElement("p");
      hint.className = "demo-embed-fallback__hint";
      hint.textContent =
        "可点击下方在本站打开；若仍无法访问，可试海外完整版（需良好国际网络）。";

      const actions = document.createElement("div");
      actions.className = "demo-embed-fallback__actions";

      const localLink = document.createElement("a");
      localLink.className = "demo-embed-fallback__btn";
      localLink.href = localHref;
      localLink.textContent = "本站打开 Demo";
      localLink.target = "_blank";
      localLink.rel = "noopener noreferrer";
      actions.appendChild(localLink);

      if (external) {
        const extLink = document.createElement("a");
        extLink.className = "demo-embed-fallback__btn demo-embed-fallback__btn--muted";
        extLink.href = external;
        extLink.textContent = "海外完整版 ↗";
        extLink.target = "_blank";
        extLink.rel = "noopener noreferrer";
        actions.appendChild(extLink);
      }

      fallback.append(title, hint, actions);
      wrap.appendChild(fallback);

      let shown = false;
      function showFallback() {
        if (shown) return;
        shown = true;
        iframe.style.visibility = "hidden";
        iframe.style.pointerEvents = "none";
        fallback.hidden = false;
      }

      const timer = window.setTimeout(showFallback, TIMEOUT_MS);
      iframe.addEventListener("error", () => {
        window.clearTimeout(timer);
        showFallback();
      });
      iframe.addEventListener("load", () => {
        window.clearTimeout(timer);
      });
    });
  }

  initDemoEmbedFallback();

  /** 项目经历满屏区：PDF 导出页逐张淡入轮播 */
  function initWorkSlideshow() {
    document.querySelectorAll("[data-work-slideshow]").forEach((root) => {
      const stage = root.querySelector(".work-slideshow__stage");
      const counter = root.querySelector(".work-slideshow__counter");
      if (!stage) return;

      const count = Number(root.dataset.slideCount) || 0;
      const base = root.dataset.slideBase || "";
      const intervalMs = Number(root.dataset.slideMs) || 1100;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const pad = (n) => String(n).padStart(2, "0");

      for (let i = 1; i <= count; i += 1) {
        const img = document.createElement("img");
        img.src = `${base}${pad(i)}.png`;
        img.alt = `UniPass 演示稿第 ${i} 页`;
        img.className = "work-slideshow__img";
        img.decoding = "async";
        img.loading = i <= 2 ? "eager" : "lazy";
        if (i === 1) img.classList.add("is-active");
        stage.appendChild(img);
      }

      const imgs = [...stage.querySelectorAll(".work-slideshow__img")];
      if (!imgs.length || reduceMotion) {
        if (counter && imgs.length) {
          counter.textContent = `01 / ${pad(imgs.length)}`;
        }
        return;
      }

      let index = 0;
      let timer = null;
      let paused = false;
      let inView = false;
      const hintEl = root.querySelector(".work-feature__hint");

      function updateCounter() {
        if (counter) {
          counter.textContent = `${pad(index + 1)} / ${pad(imgs.length)}`;
        }
      }

      function updateHint() {
        if (!hintEl) return;
        hintEl.textContent = paused
          ? "已暂停 · 点击继续轮播"
          : "演示稿自动轮播 · 点击暂停";
      }

      function show(next) {
        imgs[index].classList.remove("is-active");
        index = next;
        imgs[index].classList.add("is-active");
        updateCounter();
      }

      function start() {
        stop();
        if (!inView || paused) return;
        timer = setInterval(() => {
          show((index + 1) % imgs.length);
        }, intervalMs);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      function togglePause() {
        paused = !paused;
        root.classList.toggle("is-paused", paused);
        root.setAttribute("aria-pressed", paused ? "true" : "false");
        updateHint();
        if (paused) {
          stop();
        } else {
          start();
        }
      }

      root.classList.add("is-interactive");
      root.setAttribute("role", "button");
      root.setAttribute("tabindex", "0");
      root.setAttribute("aria-pressed", "false");
      root.setAttribute(
        "aria-label",
        "UniPass 演示稿轮播，点击暂停或继续"
      );
      root.addEventListener("click", togglePause);
      root.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          togglePause();
        }
      });

      updateCounter();
      updateHint();

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              inView = true;
              start();
            } else {
              inView = false;
              stop();
              show(0);
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(root);
    });
  }

  initWorkSlideshow();

  if (hero && trailLayer && finePointer && !reduceMotion) {
    initMouseTrail(hero, trailLayer);
  }

  const portfolioSlider = document.getElementById("portfolio-slider");
  if (portfolioSlider) {
    let dragging = false;
    let startX = 0;
    let scrollLeft = 0;

    portfolioSlider.addEventListener("mousedown", (e) => {
      dragging = true;
      portfolioSlider.classList.add("is-dragging");
      startX = e.pageX - portfolioSlider.offsetLeft;
      scrollLeft = portfolioSlider.scrollLeft;
    });
    portfolioSlider.addEventListener("mouseleave", () => {
      dragging = false;
      portfolioSlider.classList.remove("is-dragging");
    });
    portfolioSlider.addEventListener("mouseup", () => {
      dragging = false;
      portfolioSlider.classList.remove("is-dragging");
    });
    portfolioSlider.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      e.preventDefault();
      const x = e.pageX - portfolioSlider.offsetLeft;
      portfolioSlider.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  }

  /** 核心能力：仅当用户滚到该屏时才播放入场动画 */
  function initCapabilitiesReveal() {
    const section = document.getElementById("capabilities");
    const list = document.querySelector("[data-cap-stagger]");
    if (!section || !list) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      list.classList.add("is-inview");
      return;
    }

    function resetList() {
      list.classList.add("is-reset");
      list.classList.remove("is-inview");
      requestAnimationFrame(() => {
        list.classList.remove("is-reset");
      });
    }

    function shouldPlay(entry) {
      if (!entry.isIntersecting) return false;
      const rect = entry.boundingClientRect;
      const vh = window.innerHeight;
      const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      if (visible <= 0) return false;
      const ratio = visible / Math.max(rect.height, 1);
      return ratio >= 0.22 && rect.top < vh * 0.82;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (shouldPlay(entry)) {
            if (!list.classList.contains("is-inview")) {
              list.classList.remove("is-reset");
              void list.offsetWidth;
              list.classList.add("is-inview");
            }
          } else if (
            !entry.isIntersecting ||
            entry.boundingClientRect.bottom < 0 ||
            entry.boundingClientRect.top > window.innerHeight
          ) {
            if (list.classList.contains("is-inview")) resetList();
          }
        });
      },
      {
        root: null,
        threshold: [0, 0.1, 0.22, 0.35, 0.5],
        rootMargin: "-8% 0px -12% 0px",
      }
    );

    observer.observe(section);
  }

  initCapabilitiesReveal();

  /** Aura 专题：首屏视差 / 核心洞察阶梯入场 / 打样卡片微倾斜 */
  function initAuraHardwareEffects() {
    const hero = document.querySelector("[data-aura-parallax]");
    const heroBgs = hero ? [...hero.querySelectorAll(".hardware-aura-hero__bg")] : [];
    const insight = document.querySelector("[data-aura-reveal]");
    const tiltCards = [...document.querySelectorAll("[data-aura-tilt]")];
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (hero && heroBgs.length && !prefersReduced) {
      function updateParallax() {
        const rect = hero.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const progress = Math.max(-1, Math.min(1, (vh - rect.top) / (vh + rect.height)));
        const y = -progress * 90;
        heroBgs.forEach((img) => {
          img.style.transform = `translate3d(0, ${y}px, 0)`;
        });
      }
      updateParallax();
      window.addEventListener("scroll", updateParallax, { passive: true });
      window.addEventListener("resize", updateParallax, { passive: true });

      if (heroBgs.length > 1) {
        let active = 0;
        setInterval(() => {
          heroBgs[active].classList.remove("is-active");
          active = (active + 1) % heroBgs.length;
          heroBgs[active].classList.add("is-active");
        }, 3800);
      }
    }

    if (insight) {
      if (prefersReduced) {
        insight.classList.add("is-inview");
      } else {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                insight.classList.add("is-inview");
              }
            });
          },
          { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
        );
        observer.observe(insight);
      }
    }

    document.querySelectorAll("[data-aura-carousel]").forEach((carousel) => {
      const slides = [...carousel.querySelectorAll("img")];
      const dots = [...carousel.querySelectorAll(".aura-media-carousel__dots span")];
      if (slides.length < 2 || prefersReduced) return;

      let active = 0;
      const intervalMs = 4200;
      const advance = () => {
        slides[active].classList.remove("is-active");
        dots[active]?.classList.remove("is-active");
        active = (active + 1) % slides.length;
        slides[active].classList.add("is-active");
        dots[active]?.classList.add("is-active");
      };
      let timer = setInterval(advance, intervalMs);
      carousel.addEventListener("mouseenter", () => clearInterval(timer));
      carousel.addEventListener("mouseleave", () => {
        timer = setInterval(advance, intervalMs);
      });
    });

    const lightbox = document.getElementById("aura-arch-lightbox");
    const lbTitle = document.getElementById("aura-lightbox-title");
    const lbImg = document.getElementById("aura-lightbox-img");
    const lbCounter = lightbox?.querySelector(".aura-lightbox__counter");
    const lbPrev = lightbox?.querySelector(".aura-lightbox__nav--prev");
    const lbNext = lightbox?.querySelector(".aura-lightbox__nav--next");
    const lbClose = lightbox?.querySelector(".aura-lightbox__close");
    const lbBackdrop = lightbox?.querySelector(".aura-lightbox__backdrop");

    if (lightbox && lbImg && lbTitle) {
      let slides = [];
      let index = 0;
      let sourceCard = null;
      let returnFocusEl = null;

      function applyVersionToSrc(src) {
        if (!src || src.indexOf("?v=") !== -1) return src;
        const v = window.SITE_VERSION;
        return v ? `${src}?v=${v}` : src;
      }

      function renderSlide() {
        const slide = slides[index];
        if (!slide) return;
        lbImg.src = applyVersionToSrc(slide.getAttribute("src") || "");
        lbImg.alt = slide.getAttribute("alt") || "";
        lbCounter.textContent = `${index + 1} / ${slides.length}`;
        if (lbPrev) lbPrev.disabled = slides.length <= 1;
        if (lbNext) lbNext.disabled = slides.length <= 1;

        const cardCarousel = sourceCard?.querySelector("[data-aura-carousel]");
        if (cardCarousel) {
          const cardSlides = [...cardCarousel.querySelectorAll("img")];
          const cardDots = [...cardCarousel.querySelectorAll(".aura-media-carousel__dots span")];
          cardSlides.forEach((img, i) => img.classList.toggle("is-active", i === index));
          cardDots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
        }
      }

      function openLightbox(card) {
        const carousel = card.querySelector("[data-aura-carousel]");
        if (!carousel) return;
        slides = [...carousel.querySelectorAll("img")];
        if (!slides.length) return;

        const activeIndex = slides.findIndex((img) => img.classList.contains("is-active"));
        index = activeIndex >= 0 ? activeIndex : 0;
        sourceCard = card;
        returnFocusEl = card;

        lbTitle.textContent = card.querySelector("h4")?.textContent?.trim() || "";
        renderSlide();
        lightbox.hidden = false;
        lightbox.setAttribute("aria-hidden", "false");
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
        lbClose?.focus();
      }

      function closeLightbox() {
        lightbox.classList.remove("is-open");
        lightbox.hidden = true;
        lightbox.setAttribute("aria-hidden", "true");
        const hwModalOpen = document.getElementById("hw-detail-modal")?.classList.contains("is-open");
        document.body.style.overflow = hwModalOpen ? "hidden" : "";
        if (returnFocusEl && typeof returnFocusEl.focus === "function") {
          returnFocusEl.focus();
        }
        sourceCard = null;
      }

      function step(delta) {
        if (slides.length <= 1) return;
        index = (index + delta + slides.length) % slides.length;
        renderSlide();
      }

      document.querySelectorAll("[data-aura-expand]").forEach((card) => {
        card.addEventListener("click", () => openLightbox(card));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(card);
          }
        });
      });

      lbPrev?.addEventListener("click", (e) => {
        e.stopPropagation();
        step(-1);
      });
      lbNext?.addEventListener("click", (e) => {
        e.stopPropagation();
        step(1);
      });
      lbClose?.addEventListener("click", closeLightbox);
      lbBackdrop?.addEventListener("click", closeLightbox);

      lightbox.addEventListener("keydown", (e) => {
        if (lightbox.hidden) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }

    if (!tiltCards.length || prefersReduced) return;
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = py * -6;
        const ry = px * 8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  initAuraHardwareEffects();

  function initHwImageZoom() {
    const lightbox = document.getElementById("hw-zoom-lightbox");
    const lbImg = document.getElementById("hw-lightbox-img");
    const lbCaption = document.getElementById("hw-lightbox-caption");
    const lbClose = lightbox?.querySelector(".hw-lightbox__close");
    const lbBackdrop = lightbox?.querySelector(".hw-lightbox__backdrop");
    const triggers = [...document.querySelectorAll("[data-hw-zoom]")];

    if (!lightbox || !lbImg || !triggers.length) return;

    let returnFocus = null;

    function applyVersionToSrc(src) {
      if (!src || src.indexOf("?v=") !== -1) return src;
      const v = window.SITE_VERSION;
      return v ? `${src}?v=${v}` : src;
    }

    function openZoom(trigger) {
      const img = trigger.querySelector("img");
      if (!img) return;

      const section = trigger.closest(".hw-row");
      const title =
        section?.querySelector(".hw-row__heading, .hw-row__title")?.textContent?.trim() ||
        img.getAttribute("alt") ||
        "";

      lbImg.src = applyVersionToSrc(img.getAttribute("src") || "");
      lbImg.alt = img.getAttribute("alt") || "";
      if (lbCaption) lbCaption.textContent = title;

      returnFocus = trigger;
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lbClose?.focus();
    }

    function closeZoom() {
      lightbox.classList.remove("is-open");
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      const hwModalOpen = document.getElementById("hw-detail-modal")?.classList.contains("is-open");
      document.body.style.overflow = hwModalOpen ? "hidden" : "";
      lbImg.removeAttribute("src");
      if (returnFocus && typeof returnFocus.focus === "function") {
        returnFocus.focus();
      }
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openZoom(trigger));
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openZoom(trigger);
        }
      });
    });

    lbClose?.addEventListener("click", closeZoom);
    lbBackdrop?.addEventListener("click", closeZoom);
    lightbox.addEventListener("keydown", (e) => {
      if (!lightbox.hidden && e.key === "Escape") closeZoom();
    });
  }

  function initHwProjectHeroReveal() {
    const heroes = [...document.querySelectorAll(".hw-row--hero[data-hw-reveal]")];
    if (!heroes.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      heroes.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
    );

    heroes.forEach((el) => observer.observe(el));
  }

  function initSafetySeatEffects() {
    const counterSection = document.querySelector("[data-safety-counter]");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!counterSection) return;

    let counted = false;
    const counters = [...counterSection.querySelectorAll("[data-count-to]")];

    function runCounters() {
      if (counted) return;
      counted = true;
      counters.forEach((el) => {
        const to = Number(el.dataset.countTo) || 0;
        const suffix = el.dataset.countSuffix || "";
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = to * eased;
          el.textContent = `${val.toFixed(suffix === "%" ? 1 : 0)}${suffix}`;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    if (prefersReduced) {
      counters.forEach((el) => {
        el.textContent = `${el.dataset.countTo}${el.dataset.countSuffix || ""}`;
      });
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) runCounters();
          });
        },
        { threshold: 0.35 }
      );
      observer.observe(counterSection);
    }
  }

  initHwProjectHeroReveal();
  initHwImageZoom();
  initSafetySeatEffects();

  /** 硬件课题：概览卡 → 全屏 Modal 详情 */
  function initHwDetailModal() {
    const modal = document.getElementById("hw-detail-modal");
    const modalBody = document.getElementById("hw-detail-modal-body");
    const modalTitle = document.getElementById("hw-detail-modal-title");
    const store = document.querySelector(".hw-detail-store");
    const backdrop = modal?.querySelector(".hw-detail-modal__backdrop");
    const closeBtn = modal?.querySelector(".hw-detail-modal__close");
    const triggers = [...document.querySelectorAll("[data-hw-modal]")];
    const panelIds = ["hardware-aura", "hardware-bond", "hardware-safety"];

    if (!modal || !modalBody || !store || !triggers.length) return;

    const panelTitles = {
      "hardware-aura": "Aura · AI 车载智能情感机器人",
      "hardware-bond": "BOND PLAY · 产康疗愈 IoT",
      "hardware-safety": "Safety Seat · 便捷式安全座椅",
    };

    let activePanel = null;
    let returnFocus = null;

    function runSafetyCounters(panel) {
      const section = panel.querySelector("[data-safety-counter]");
      if (!section || section.dataset.counted === "true") return;
      section.dataset.counted = "true";

      section.querySelectorAll("[data-count-to]").forEach((el) => {
        const to = Number(el.dataset.countTo) || 0;
        const suffix = el.dataset.countSuffix || "";
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = `${(to * eased).toFixed(suffix === "%" ? 1 : 0)}${suffix}`;
          if (t < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    }

    function activatePanel(panel) {
      panel.querySelectorAll("[data-hw-reveal], [data-aura-reveal]").forEach((el) => {
        el.classList.add("is-inview");
      });

      if (panel.id === "hardware-safety") {
        runSafetyCounters(panel);
      }
    }

    function openModal(panelId, focusEl) {
      const panel = document.getElementById(panelId);
      if (!panel || !panelTitles[panelId]) return;

      if (activePanel && activePanel !== panel) {
        store.appendChild(activePanel);
      }

      returnFocus = focusEl || null;
      if (modalTitle) modalTitle.textContent = panelTitles[panelId];
      modalBody.appendChild(panel);
      activePanel = panel;
      activatePanel(panel);

      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn?.focus();

      if (window.location.hash !== `#${panelId}`) {
        history.replaceState(null, "", `#${panelId}`);
      }
    }

    function closeModal() {
      if (!activePanel) return;

      store.appendChild(activePanel);
      activePanel = null;

      modal.classList.remove("is-open");
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      if (window.location.hash && panelIds.includes(window.location.hash.slice(1))) {
        history.replaceState(null, "", "#hardware-projects");
      }

      if (returnFocus && typeof returnFocus.focus === "function") {
        returnFocus.focus();
      }
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.dataset.hwModal, btn));
    });

    backdrop?.addEventListener("click", closeModal);
    closeBtn?.addEventListener("click", closeModal);

    modal.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closeModal();
    });

    function handleHash() {
      const hash = window.location.hash.slice(1);
      if (panelIds.includes(hash)) {
        openModal(hash);
        return;
      }
      if (activePanel && (hash === "hardware-projects" || !hash)) {
        closeModal();
      }
    }

    window.addEventListener("hashchange", handleHash);

    if (panelIds.includes(window.location.hash.slice(1))) {
      requestAnimationFrame(() => openModal(window.location.hash.slice(1)));
    }
  }

  initHwDetailModal();

  document.querySelectorAll(".faq-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector(".faq-icon");
      const isOpen = content.classList.contains("open");

      document.querySelectorAll(".faq-content").forEach((c) => c.classList.remove("open"));
      document.querySelectorAll(".faq-icon").forEach((i) => i.classList.remove("open"));

      if (!isOpen) {
        content.classList.add("open");
        icon.classList.add("open");
      }
    });
  });

  const menuBtn = document.getElementById("foxfolio-menu-btn");
  const mobileNav = document.getElementById("foxfolio-mobile-nav");

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll('a[href="#contact"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.getElementById("contact");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      mobileNav?.classList.remove("is-open");
      menuBtn?.setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("scroll-down-btn")?.addEventListener("click", (e) => {
    const target = document.getElementById("works");
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });

  document.getElementById("back-to-top")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const toast = document.getElementById("toast");
  let toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("opacity-0");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("opacity-0"), 2200);
  }

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    const originalText = btn.textContent.trim();
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy");
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast(`已复制：${text}`);
        btn.classList.add("is-copied");
        btn.textContent = "✓ 已复制";
        setTimeout(() => {
          btn.classList.remove("is-copied");
          btn.textContent = originalText;
        }, 2000);
      } catch {
        showToast(`请手动复制：${text}`);
      }
    });
  });

  /** 展映集：右侧滚动引导箭头 */
  (function initPortfolioScrollArrow() {
    const wrap = document.querySelector(".portfolio-slider-wrap");
    const slider = document.getElementById("portfolio-slider");
    const arrow = document.getElementById("portfolio-scroll-arrow");
    if (!wrap || !slider || !arrow) return;

    const SCROLL_STEP = 480;

    function updateArrow() {
      const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4;
      arrow.classList.toggle("is-hidden", atEnd);
      wrap.classList.toggle("is-at-end", atEnd);
    }

    arrow.addEventListener("click", () => {
      slider.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
    });

    slider.addEventListener("scroll", updateArrow, { passive: true });
    updateArrow();
  })();
})();
