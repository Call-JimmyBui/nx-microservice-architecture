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
RUN npx nx build cart-service

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=builder /app/dist/apps/cart-service/ ./
EXPOSE 50056
EXPOSE 9096
CMD ["node", "main.js"]
