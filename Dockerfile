# syntax=docker/dockerfile:1
#
# Functional-test image for the Guided-Reader app. Builds the production client
# bundle (Vite SSR manifest), then runs the Fastify SSR server via tsx against
# the in-compose backend. Used by docker-compose.e2e.yml.

FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Production SSR imports the built server bundle, so build both client + server.
RUN npm run build

FROM node:20
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 3000
# tsx is required at runtime because server.js imports .ts modules directly.
CMD ["npx", "tsx", "--loader", "./css-loader.mjs", "server.js"]
