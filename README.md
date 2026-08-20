# evangong.tech

Evan Gong's personal website and portfolio: a React experience for sharing AI agents, robotics, hardware projects, software tools, photography, awards, and technical field notes.

Live at [evangong.tech](https://evangong.tech).

## Built with

- React 19 and Vite
- React Router for client-side routes
- Three.js, React Three Fiber, OGL, and postprocessing for interactive 3D/WebGL work
- GSAP, Motion, Lenis, and Matter.js for animation and interaction
- Vitest, React Testing Library, and Oxlint for verification

## Pages

- `/` — home and featured work
- `/about` — background, interests, and tools
- `/projects` — selected software, AI, robotics, and hardware projects
- `/gallery` — photography by location
- `/blog` — technical field notes
- `/awards` — awards, milestones, and project records

Gallery categories and blog posts have their own routes beneath `/gallery/:category` and `/blog/:slug`.

## Getting started

Requires Node.js 22 or newer.

```bash
npm ci --legacy-peer-deps
npm run dev
```

Vite prints the local development URL in the terminal.

## Commands

```bash
npm run dev          # start the Vite development server
npm run build        # production build, SSR bundle, and static prerendering
npm run preview      # preview the production build locally
npm run lint         # run Oxlint
npm run test:run     # run the Vitest suite once
npm run seo:check    # verify prerendered SEO output after building
```

The build generates static HTML for public routes, plus `sitemap.xml`, `robots.txt`, and `llms.txt`. Run `npm run build` before `npm run seo:check`.

## Project structure

```text
src/
  App.jsx              routing, shared layout, navigation, and transitions
  components/          page and interaction components with colocated CSS/tests
  content/             blog content
  data/                photography catalog data
  seo/                 route metadata and structured data
  main.jsx             client entry point
  ssr.jsx              server-rendering entry point for prerendering
public/                browser-served images, icons, models, certificates, and CNAME
Photography/           working photography collection used by the site
scripts/               prerendering, SEO checks, and image-protection utilities
docs/                  design, page implementation, and technical notes
.github/workflows/     GitHub Pages deployment
```

Components that use WebGL are isolated behind error boundaries where needed so a failed visual effect does not take down the rest of a page. Heavy non-home routes are lazy-loaded in `src/App.jsx`.

## Deployment

Pushes to `main` run [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). The workflow installs dependencies, builds and prerenders the site, runs the SEO check, and publishes `dist/` to GitHub Pages. The custom domain is defined in [`public/CNAME`](public/CNAME).

## Asset notes

Public photography and other display assets live under `public/`. The optional image-protection utility can validate or generate protected derivatives:

```bash
npm run images:protect -- --check
npm run images:protect -- --apply
```

Use `--apply` only when the original-image backup location is understood; the script keeps originals outside the repository.

## License

The site and its assets are personal work by Evan Gong. Unless a file or linked project states otherwise, do not reuse the source code, photography, 3D assets, certificates, or other media without permission.
