// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { visit } from "unist-util-visit";
import mermaid from 'astro-mermaid';
// import starlightLinksValidator from 'starlight-links-validator'

/**
 * @typedef {Array<{label: string, to: string}>} Items
 */
/**
 * @typedef {{children: Items}} Children
 */

/** @typedef {{ sections: Array<{label: string, frameworks: Array<Children>} & Children> }} Sections */

const startUrl =
  "https://raw.githubusercontent.com/TanStack/router/refs/heads/main/docs/start/config.json";
/** @type {Sections} */
const startConfig = await fetch(startUrl).then((res) => res.json());

const routerUrl =
  "https://raw.githubusercontent.com/TanStack/router/refs/heads/main/docs/router/config.json";
/** @type {Sections} */
const routerConfig = await fetch(routerUrl).then((res) => res.json());

const prefixes = [
  "latest/docs/framework/react/",
  "latest/docs/framework/solid/",
  "framework/react/",
  "framework/solid/",
];

/**
 * Replaces all occurrences of a prefix with another prefix in the provided string.
 * @param {string} str - The input string to process.
 * @returns {string} The transformed string with prefixes replaced.
 */
const stripPrefix = (str) =>
  prefixes.reduce((acc, prefix) => acc.replaceAll(prefix, ""), str);

// https://astro.build/config
export default defineConfig({
  site: "https://valerii15298.github.io",
  devToolbar: { enabled: false },
  build: {
    format: "preserve",
  },
  markdown: {
    rehypePlugins: [
      function rehypeFixRelativeLinks() {
        return (tree) => {
          visit(tree, "element", (node) => {
            if (node.tagName === "a" && node.properties?.href) {
              const href = node.properties.href;
              if (typeof href === "string") {
                node.properties.href = href.toLowerCase();
              }
            }
          });
        };
      },
    ],
  },
  // trailingSlash: "always",
  base: "/tanstack-astro",
  integrations: [
    mermaid(),
    starlight({
      title: "TanStack Start Docs",
      customCss: ["/src/styles.css"],
      head: [
        {
          tag: "script",
          content: `
            (() => {
              const threshold = 10;
              const mql = window.matchMedia('(max-width: 50em)');
              const root = document.documentElement;
              const attr = 'data-bottom-bar-hidden';

              let lastY = 0;
              let latestY = 0;
              let ticking = false;

              const update = () => {
                ticking = false;
                if (!mql.matches) { root.removeAttribute(attr); return; }
                const y = latestY;
                if (y - lastY > threshold) root.setAttribute(attr, '');
                else if (lastY - y > threshold) root.removeAttribute(attr);
                lastY = y;
              };

              window.addEventListener('scroll', () => {
                latestY = window.scrollY;
                if (!ticking) { ticking = true; requestAnimationFrame(update); }
              }, { passive: true });
            })();
          `,
        },
      ],
      // plugins: [starlightLinksValidator({errorOnRelativeLinks: false})],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/valerii15298/tanstack-astro",
        },
      ],
      sidebar: [
        {
          collapsed: true,
          label: "Start",
          items: startConfig.sections.map((section) => ({
            collapsed: true,
            label: section.label,
            items: section.frameworks[0].children.map((c) => ({
              link: `start/${stripPrefix(c.to)}`,
              label: c.label,
            })),
          })),
        },
        {
          collapsed: true,
          label: "Router",
          items: routerConfig.sections.map((section) => ({
            collapsed: true,
            label: section.label,
            items: [
              ...section.children,
              ...(section.frameworks?.[0]?.children || []),
            ].map((c) => ({
              link: `router/${stripPrefix(c.to)}`,
              label: c.label,
            })),
          })),
        },
      ],
    }),
  ],
});
