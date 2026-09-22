import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { collectBrandIcons, extractBrandPalette, filenameFromHref, primaryFavicon } from "./brand";

const stylesheet = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "../styles.css"),
  "utf8",
);

describe("extractBrandPalette", () => {
  it("reads brand colors and the body font from the site stylesheet", () => {
    const palette = extractBrandPalette(stylesheet);

    expect(palette.fontFamily).toContain("Inter");
    expect(palette.fontWeight).toBe("500");

    const accent = palette.colors.find((color) => color.property === "--brand-accent");
    expect(accent?.light).toBe("#00d9a3");
    expect(accent?.dark).toBe("#00d9a3");

    const cobalt = palette.colors.find((color) => color.property === "--brand-cobalt");
    expect(cobalt?.light).toBe("#0072ce");
    expect(cobalt?.dark).toBe("#4da6f5");

    const background = palette.colors.find((color) => color.property === "--background");
    expect(background?.light).toBe("#f6f7f8");
    expect(background?.dark).toBe("#0d1520");

    expect(palette.colors.some((color) => color.property.startsWith("--color-"))).toBe(false);
    expect(palette.colors[0]?.property.startsWith("--brand-")).toBe(true);
  });

  it("ignores theme aliases, keyframes, and unrelated rules", () => {
    const palette = extractBrandPalette(`
      @theme inline { --color-brand-cyan: var(--brand-cyan); }
      @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
      .card { --brand-accent: #111111; }
      :root { --brand-accent: #00d9a3; --background: #ffffff; }
      .dark { --brand-accent: #00d9a3; --background: #000000; }
      @layer base {
        body { font-family: Inter, sans-serif; font-weight: 500; }
      }
    `);

    expect(palette.colors.map((color) => color.property)).toEqual([
      "--brand-accent",
      "--background",
    ]);
    expect(palette.fontFamily).toBe("Inter, sans-serif");
  });
});

describe("brand icons", () => {
  it("keeps the document icons and manifest icons without duplicates", () => {
    const icons = collectBrandIcons(
      [
        { href: "/favicon.ico", rel: "shortcut icon" },
        { href: "/favicon.ico", rel: "icon" },
        { href: "/favicon-96x96.png", rel: "icon" },
        { href: "/apple-touch-icon.png", rel: "apple-touch-icon" },
      ],
      {
        href: "/site.webmanifest",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
    );

    expect(icons.map((icon) => icon.href)).toEqual([
      "/favicon.ico",
      "/favicon-96x96.png",
      "/apple-touch-icon.png",
      "/web-app-manifest-192x192.png",
    ]);
    expect(icons.map((icon) => icon.label)).toEqual([
      "Favicon",
      "Icon 96x96",
      "Apple touch icon",
      "App icon 192x192",
    ]);
    expect(primaryFavicon(icons)).toBe("/favicon.ico");
    expect(filenameFromHref(primaryFavicon(icons), "favicon.ico")).toBe("favicon.ico");
  });
});
