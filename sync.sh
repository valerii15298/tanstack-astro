set -e

pnpx giget --force gh:TanStack/router/docs/router ./src/content/docs/router

pnpx giget --force gh:TanStack/router/docs/start/framework/react ./src/content/docs/start

node add-title.ts
