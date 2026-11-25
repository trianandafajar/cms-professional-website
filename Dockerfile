FROM node:22-alpine

# Pin pnpm globally (not via corepack): engines allow only 9-11, corepack resolves "latest" (12),
# and a corepack pin made as root is not visible to the non-root runtime user.
# fontconfig + ttf-liberation (Arial-compatible): sharp/librsvg segfaults rendering SVG text without fonts.
RUN apk add --no-cache libc6-compat fontconfig ttf-liberation && npm install -g pnpm@11.1.3
WORKDIR /app

# Layer cache: dependencies only reinstall when the manifests change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* are inlined into the client bundle at build time, so they must be build args.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_NOTIFICATION_WS_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# tsx (devDependency) runs scripts/server.ts, which starts both Next.js and the WS server.
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3030 \
    NOTIFICATION_WS_PORT=3031 \
    NOTIFICATION_WS_SERVER_URL=http://127.0.0.1:3031

# /app/media is the Payload local upload dir; mount a volume here.
RUN mkdir -p media && chown -R node:node .next media
USER node

EXPOSE 3030 3031
# Apply Payload migrations (production does not auto-push the schema), then start Next + WS.
CMD ["sh", "-c", "pnpm payload migrate && pnpm start"]
