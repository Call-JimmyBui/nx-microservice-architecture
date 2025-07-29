FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./
COPY apps/ apps/
COPY libs/ libs/
COPY proto/ proto/
COPY types/ types/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
RUN npx nx build payment-service

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=builder /app/dist/apps/payment-service/ ./
EXPOSE 50054
EXPOSE 9094
CMD ["node", "main.js"]
