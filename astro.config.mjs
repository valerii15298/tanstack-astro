// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
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
  build: {
    format: "preserve"
  },
  // trailingSlash: "always",
	base: "/tanstack-astro",
  integrations: [
    starlight({
      title: "TanStack Start Docs",
      customCss: ["/src/styles.css"],
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
