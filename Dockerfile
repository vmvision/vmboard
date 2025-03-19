FROM node:20.9-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Deploy only the dokploy app
ENV NODE_ENV=production
RUN pnpm build

FROM base AS vmboard
WORKDIR /app

# Set production
ENV NODE_ENV=production

# Copy only the necessary files
COPY --from=build /app/.next ./.next
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/env.js ./src/env.js
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/components.json ./components.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD [ "pnpm", "start" ]