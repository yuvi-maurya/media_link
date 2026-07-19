"use strict";

/*
 * Link-in-bio interactions:
 * 1. Apply and persist the selected color theme.
 * 2. Insert the current year and mirror the profile name in the footer.
 * 3. Add JavaScript-controlled delays for the entrance animation.
 */

const body = document.body;
const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const currentYear = document.querySelector("#current-year");
const profileName = document.querySelector("#profile-name");
const footerName = document.querySelector("#footer-name");
const socialLinks = document.querySelectorAll(".social-link");

const THEME_STORAGE_KEY = "link-in-bio-theme";
const prefersLightTheme = window.matchMedia("(prefers-color-scheme: light)");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Safely read a saved preference. Some private browsing modes can block storage.
 */
function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Safely persist the visitor's explicit theme choice.
 */
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still works for this visit if storage is unavailable.
  }
}

/**
 * Apply the palette and keep the toggle's accessible state in sync.
 */
function applyTheme(theme) {
  const isLight = theme === "light";
  const nextThemeLabel = isLight ? "dark" : "light";

  body.classList.toggle("light-theme", isLight);
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.title = `Switch to ${nextThemeLabel} mode`;
  document.documentElement.style.colorScheme = isLight ? "light" : "dark";

  if (themeColorMeta) {
    themeColorMeta.content = isLight ? "#edf4ff" : "#08111f";
  }
}

/**
 * Use a saved choice when available, otherwise respect the operating system.
 */
const savedTheme = getSavedTheme();
const initialTheme = savedTheme || (prefersLightTheme.matches ? "light" : "dark");
applyTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = body.classList.contains("light-theme") ? "dark" : "light";

  applyTheme(nextTheme);
  saveTheme(nextTheme);
});

/*
 * Follow system theme changes only until the visitor makes an explicit choice.
 */
prefersLightTheme.addEventListener("change", (event) => {
  if (!getSavedTheme()) {
    applyTheme(event.matches ? "light" : "dark");
  }
});

/* Insert the current year and reuse the editable heading name in the footer. */
currentYear.textContent = new Date().getFullYear();
footerName.textContent = profileName.textContent.trim();
document.title = `${profileName.textContent.trim()} | Social Links`;

/**
 * Set each delay from JavaScript, then trigger the CSS entrance sequence.
 * Content is visible by default, so a script failure never hides the links.
 */
function startEntranceAnimation() {
  socialLinks.forEach((link, index) => {
    const delay = 180 + index * 55;
    link.style.setProperty("--stagger-delay", `${delay}ms`);
  });

  if (prefersReducedMotion.matches) {
    body.classList.add("is-loaded");
    return;
  }

  body.classList.add("motion-ready");

  /*
   * Remove the motion classes after the last link arrives. This releases the
   * animation's final transform so hover and keyboard-focus transforms work.
   */
  socialLinks[socialLinks.length - 1]?.addEventListener(
    "animationend",
    () => {
      body.classList.remove("motion-ready", "is-loaded");
    },
    { once: true }
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      body.classList.add("is-loaded");
    });
  });
}

startEntranceAnimation();
