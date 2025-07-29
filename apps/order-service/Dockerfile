# =============================
# Giai đoạn 1: Build dependencies
# =============================
FROM node:20-alpine AS deps

WORKDIR /app

# Cài pnpm toàn cục
RUN npm install -g pnpm

# Copy các file cấu hình cấp root workspace
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy toàn bộ source code
COPY apps/ apps/
COPY libs/ libs/
COPY proto/ proto/
COPY types/ types/

# Cài đặt tất cả dependencies (bao gồm dev) để phục vụ build
RUN pnpm install --frozen-lockfile

# =============================
# Giai đoạn 2: Build ứng dụng order-service
# =============================
FROM deps AS builder

# Build riêng app order-service
RUN npx nx build order-service

# =============================
# Giai đoạn 3: Runtime - chạy app nhẹ
# =============================
FROM node:20-alpine AS runner

WORKDIR /app

# Cài pnpm để install production deps
RUN npm install -g pnpm

# Copy file để cài production dependencies
COPY package.json pnpm-lock.yaml ./

# Chỉ cài production deps để giảm size
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy code đã build từ giai đoạn builder
COPY --from=builder /app/dist/apps/order-service/ ./

# Expose port gRPC / HTTP nếu có
EXPOSE 50053
EXPOSE 9093

# Chạy app
CMD ["node", "main.js"]
