
# syntax=docker/dockerfile:1
 
##############################
# deps: install dependencies
##############################
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
 
##############################
# build: compile the Vite app
##############################
FROM deps AS build
WORKDIR /app
# .env is copied in so Vite can inline VITE_* vars at build time
# (Vite env vars are baked in at build, not read at runtime).
COPY . .
RUN npm run build
# Output lands in /app/dist
 
##############################
# export: minimal image just holding the built static files
##############################
FROM alpine:3.20 AS export
WORKDIR /out
COPY --from=build /app/dist ./dist
CMD ["true"]
 
