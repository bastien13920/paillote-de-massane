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
  initCookieBanner();
  initZonePicker();
  initCountdown();
  initCalendarTracking();
  initNewsletterForm();
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
    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallax) || 0.15;
      // Décalage basé sur la position de la section à l'écran (pas le scroll
      // global de la page), pour que l'effet reste borné et ne décolle jamais
      // l'image de son cadre, même sur les sections tout en bas d'une longue page.
      const container = layer.parentElement || layer;
      const rect = container.getBoundingClientRect();
      const raw = rect.top * speed;
      // Plafonné à ±50px : garantit que le décalage ne dépasse jamais la marge
      // de sécurité prévue en CSS (inset négatif), quelle que soit la hauteur d'écran.
      const offset = Math.max(-50, Math.min(50, raw));
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

/* --- Formulaire de contact : validation front + envoi réel via Formspree --- */
function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const successBox = document.querySelector(".form-success");
  const errorBox = document.querySelector(".form-error-banner");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
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

    errorBox?.classList.remove("is-visible");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours...";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Formspree error");

      successBox?.classList.add("is-visible");
      form.reset();

      setTimeout(() => {
        successBox?.classList.remove("is-visible");
      }, 6000);
    } catch (err) {
      errorBox?.classList.add("is-visible");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer la demande";
      }
    }
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

/* --- Bandeau cookies (RGPD) : n'affiche rien tant qu'un choix n'a pas été fait -- */
function initCookieBanner() {
  const banner = document.querySelector(".cookie-banner");
  if (!banner) return;

  const consent = localStorage.getItem("cookieConsent");
  if (!consent) {
    window.setTimeout(() => banner.classList.add("is-visible"), 800);
  }

  const accept = banner.querySelector("[data-cookie-accept]");
  const decline = banner.querySelector("[data-cookie-decline]");

  accept?.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    banner.classList.remove("is-visible");
  });

  decline?.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined");
    banner.classList.remove("is-visible");
  });
}

/* --- Clé Web3Forms partagée (formulaire de contact, newsletter, suivi calendrier) */
const WEB3FORMS_ACCESS_KEY = "7446bb2b-20fe-4f5f-bd4b-61362725dc94";

/* --- Compte à rebours vers l'inauguration (5 mars 2027, 17h00) ------------- */
function initCountdown() {
  const el = document.querySelector("[data-countdown]");
  if (!el) return;

  const target = new Date("2027-03-05T17:00:00");
  const daysEl = el.querySelector("[data-cd-days]");
  const hoursEl = el.querySelector("[data-cd-hours]");
  const minutesEl = el.querySelector("[data-cd-minutes]");
  const secondsEl = el.querySelector("[data-cd-seconds]");

  function update() {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
      daysEl.textContent = "0";
      hoursEl.textContent = "0";
      minutesEl.textContent = "0";
      secondsEl.textContent = "0";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = days;
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  update();
  window.setInterval(update, 1000);
}

/* --- Suivi des clics "Ajouter à mon calendrier" (compteur par email) ------- */
function initCalendarTracking() {
  const buttons = document.querySelectorAll("[data-calendar-track]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.calendarTrack || "inconnu";
      // Envoi silencieux, sans bloquer l'ouverture du lien/téléchargement du calendrier.
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "Ajout calendrier - Inauguration La Paillote de Massane",
          from_name: "Suivi calendrier (site)",
          message: "Un visiteur a cliqué sur « Ajouter à mon calendrier » (" + type + ") pour l'inauguration du 5 mars 2027.",
        }),
      }).catch(() => {});
    });
  });
}

/* --- Formulaire "Prévenez-moi à l'ouverture" -------------------------------- */
function initNewsletterForm() {
  const form = document.querySelector("#newsletter-form");
  if (!form) return;

  const successBox = form.parentElement.querySelector(".newsletter-success");
  const emailInput = form.querySelector('input[type="email"]');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi...";
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "Inscription ouverture - La Paillote de Massane",
          from_name: "Inscription newsletter (site)",
          email: email,
          message: "Nouvelle inscription pour être prévenu(e) de l'ouverture du 5 mars 2027 : " + email,
        }),
      });
      if (!response.ok) throw new Error("Web3Forms error");
      successBox?.classList.add("is-visible");
      form.reset();
    } catch (err) {
      emailInput.focus();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Me prévenir";
      }
    }
  });
}

/* --- Sélecteur d'emplacement (page Contact) : bascule visuelle des cartes -- */
function initZonePicker() {
  const options = document.querySelectorAll(".zone-option");
  if (!options.length) return;

  options.forEach((option) => {
    const input = option.querySelector('input[type="radio"]');
    input?.addEventListener("change", () => {
      options.forEach((o) => o.classList.remove("is-checked"));
      option.classList.add("is-checked");
    });
  });
}
