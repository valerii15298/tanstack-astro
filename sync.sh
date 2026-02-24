set -e

pnpx degit --force TanStack/router/docs/router ./src/content/docs/router

pnpx degit --force TanStack/router/docs/start/framework/react ./src/content/docs/start

node add-title.ts
