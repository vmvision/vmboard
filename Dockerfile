FROM node:20.9-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ git python3-pip pkg-config libsecret-1-dev && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Deploy only the dokploy app
ENV NODE_ENV=production
RUN pnpm build

FROM base AS vmboard
WORKDIR /app

# Set production
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y curl unzip apache2-utils iproute2 && rm -rf /var/lib/apt/lists/*

# Copy only the necessary files
COPY --from=build /app/.next ./.next
COPY --from=build /app/dist ./dist
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/components.json ./components.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD [ "pnpm", "start" ]