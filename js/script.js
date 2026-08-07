/* ==========================================================================
   LA PAILLOTE DE MASSANE — Script principal
   Gère : navigation mobile, header au scroll, révélations au scroll,
   parallax léger du hero, galerie + lightbox, onglets "La Carte",
   validation du formulaire de contact, bouton retour en haut.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileNav();
  initScrollReveal();
  initParallax();
  initGallery();
  initMenuTabs();
  initContactForm();
  initBackToTop();
  setActiveNavLink();
  initYear();
});

/* --- Header qui se fige au scroll ---------------------------------------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* --- Menu mobile ----------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

/* --- Marque le lien de navigation actif selon la page courante ------------ */
function setActiveNavLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-menu a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      link.classList.add("is-active");
    }
  });
}

/* --- Révélation des éléments au scroll (IntersectionObserver) ------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  targets.forEach((el, i) => {
    el.style.setProperty("--i", i % 8);
    observer.observe(el);
  });
}

/* --- Parallax léger sur les images de hero --------------------------------- */
function initParallax() {
  const layers = document.querySelectorAll("[data-parallax]");
  if (!layers.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;
    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallax) || 0.15;
      const offset = scrollY * speed;
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  update();
}

/* --- Galerie : filtres + lightbox ------------------------------------------ */
function initGallery() {
  const filterButtons = document.querySelectorAll(".gallery-filter button");
  const items = document.querySelectorAll(".gallery-item");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;

      items.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.style.display = match ? "" : "none";
      });
    });
  });

  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;

  const lightboxMedia = lightbox.querySelector("[data-lightbox-media]");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");
  const closeBtn = lightbox.querySelector(".lightbox__close");

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const media = item.querySelector("img, svg");
      const caption = item.dataset.caption || "";
      if (media && lightboxMedia) {
        lightboxMedia.innerHTML = media.outerHTML;
      }
      if (lightboxCaption) lightboxCaption.textContent = caption;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  closeBtn?.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

/* --- Onglets "La Carte" (Petit-déj / Plats / Bar) -------------------------- */
function initMenuTabs() {
  const tabs = document.querySelectorAll(".menu-tab");
  const panels = document.querySelectorAll(".menu-panel");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === target);
      });
    });
  });
}

/* --- Formulaire de contact : validation front + message de succès --------- */
function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const successBox = document.querySelector(".form-success");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    form.querySelectorAll("[required]").forEach((field) => {
      const group = field.closest(".form-group");
      const value = field.value.trim();
      let fieldValid = value.length > 0;

      if (field.type === "email" && value) {
        fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }

      group?.classList.toggle("has-error", !fieldValid);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) return;

    // Pas de backend fourni : simulation d'envoi + message de confirmation.
    // Pour un envoi réel, relier ce formulaire à un service comme Formspree,
    // Netlify Forms ou une fonction serverless (voir README.md).
    successBox?.classList.add("is-visible");
    form.reset();

    setTimeout(() => {
      successBox?.classList.remove("is-visible");
    }, 6000);
  });
}

/* --- Bouton retour en haut --------------------------------------------------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("is-visible", window.scrollY > 500);
    },
    { passive: true }
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* --- Année courante dans le footer -------------------------------------------- */
function initYear() {
  const yearEl = document.querySelector("#current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
