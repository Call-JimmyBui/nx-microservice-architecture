# apps/product-service/Dockerfile

# =============================
# Giai đoạn 1: Build dependencies
# Mục tiêu: Cài đặt tất cả các gói phụ thuộc cần thiết cho toàn bộ monorepo.
# =============================
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy các file cấu hình cấp root workspace
# Đảm bảo bạn chạy 'docker build' từ thư mục gốc của monorepo (E:\microservice)
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy toàn bộ code apps/libs/proto/types để pnpm có thể giải quyết dependencies đúng cách
# và để giai đoạn builder có đủ code để build.
COPY apps/ apps/
COPY libs/ libs/
COPY proto/ proto/
COPY types/ types/

# Cài đặt tất cả dependencies (bao gồm devDependencies) để build được
# pnpm sẽ tạo một node_modules với các symlink cho toàn bộ monorepo.
RUN pnpm install --frozen-lockfile

# =============================
# Giai đoạn 2: Build ứng dụng (Product Service)
# Mục tiêu: Biên dịch code của Product Service thành JavaScript sẵn sàng chạy.
# =============================
FROM deps AS builder

# Workdir vẫn là /app từ giai đoạn deps

# Build riêng app product-service
# Kết quả build sẽ nằm trong /app/dist/apps/product-service/
RUN npx nx build product-service

# =============================
# Giai đoạn 3: Runtime - chạy app nhẹ
# Mục tiêu: Tạo Docker image cuối cùng, nhỏ gọn, chỉ chứa ứng dụng đã build và các dependencies runtime.
# =============================
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm globally (cần thiết để chạy pnpm install --prod)
RUN npm install -g pnpm

# Copy package.json và pnpm-lock.yaml từ gốc workspace
# Điều này cần thiết để pnpm có thể cài đặt lại các dependencies production.
COPY package.json pnpm-lock.yaml ./

# Chỉ cài đặt production dependencies
# Lệnh này sẽ tạo ra node_modules chỉ với các dependencies cần thiết cho runtime.
# Điều này giúp giảm kích thước image và giải quyết vấn đề tslib.
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy code đã build từ giai đoạn builder
# /app/dist/apps/product-service/ từ giai đoạn 'builder' sẽ được copy vào /app/ trong giai đoạn 'runner'.
COPY --from=builder /app/dist/apps/product-service/ ./

# Expose cổng Product Service (cổng gRPC)
EXPOSE 50051

# Start app
CMD ["node", "main.js"]