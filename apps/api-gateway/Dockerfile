
# =============================
# Giai đoạn 1: Build dependencies
# =============================
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy các file cấu hình cấp root workspace
COPY package.json pnpm-lock.yaml ./ 
COPY nx.json tsconfig.base.json ./

# Copy code apps/libs để phục vụ việc build
COPY apps/ apps/
COPY libs/ libs/
COPY proto/ proto/
COPY types/ types/

# Cài đặt tất cả dependencies (bao gồm devDependencies) để build được
RUN pnpm install --frozen-lockfile

# =============================
# Giai đoạn 2: Build ứng dụng
# =============================
FROM deps AS builder

# Build riêng app api-gateway
RUN npx nx build api-gateway

# =============================
# Giai đoạn 3: Runtime - chạy app nhẹ
# =============================
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm globally (nếu cần, có thể bỏ)
RUN npm install -g pnpm

# Chỉ copy production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy code đã build từ giai đoạn builder
COPY --from=builder /app/dist/apps/api-gateway/ ./

# Expose cổng API Gateway
EXPOSE 4000

# Start app
CMD ["node", "main.js"]
